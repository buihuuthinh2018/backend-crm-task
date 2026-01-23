import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, AddTaskMemberDto, UpdateTaskMemberDto } from './dto/task.dto';
import { TaskStatus, TaskPriority, TaskRole, ActivityAction, ProjectRole } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // ==================== TASK CRUD ====================

  async create(createTaskDto: CreateTaskDto, userId: string) {
    // Check project membership
    await this.checkProjectMembership(createTaskDto.projectId, userId);

    // If creating subtask, verify parent exists and belongs to same project
    if (createTaskDto.parentId) {
      const parentTask = await this.prisma.task.findUnique({
        where: { id: createTaskDto.parentId },
      });

      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }

      if (parentTask.projectId !== createTaskDto.projectId) {
        throw new BadRequestException('Parent task must belong to the same project');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || TaskStatus.NOT_STARTED,
        priority: createTaskDto.priority || TaskPriority.MEDIUM,
        startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : null,
        endDate: createTaskDto.endDate ? new Date(createTaskDto.endDate) : null,
        projectId: createTaskDto.projectId,
        parentId: createTaskDto.parentId,
        creatorId: userId,
        // Auto-assign creator as PRIMARY member
        members: {
          create: {
            userId,
            role: TaskRole.PRIMARY,
          },
        },
      },
      include: this.getTaskInclude(),
    });

    // Log activity
    await this.logActivity(
      createTaskDto.parentId ? ActivityAction.SUBTASK_CREATED : ActivityAction.TASK_CREATED,
      userId,
      createTaskDto.projectId,
      task.id,
      { taskTitle: task.title, parentId: createTaskDto.parentId },
    );

    return task;
  }

  async findByProject(projectId: string, userId: string) {
    await this.checkProjectMembership(projectId, userId);

    return this.prisma.task.findMany({
      where: {
        projectId,
        parentId: null, // Only top-level tasks
      },
      include: this.getTaskInclude(),
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findMyTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        ...this.getTaskInclude(),
        project: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { endDate: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        ...this.getTaskInclude(),
        subtasks: {
          include: this.getTaskInclude(),
          orderBy: { createdAt: 'asc' },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this project
    await this.checkProjectMembership(task.projectId, userId);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);

    // Check permission - only task creator, primary member, or project owner can update
    const canUpdate = await this.canModifyTask(id, task.projectId, userId);
    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
        priority: updateTaskDto.priority,
        startDate: updateTaskDto.startDate !== undefined
          ? (updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : null)
          : undefined,
        endDate: updateTaskDto.endDate !== undefined
          ? (updateTaskDto.endDate ? new Date(updateTaskDto.endDate) : null)
          : undefined,
      },
      include: this.getTaskInclude(),
    });

    await this.logActivity(ActivityAction.TASK_UPDATED, userId, task.projectId, id, {
      changes: updateTaskDto,
    });

    return updatedTask;
  }

  async updateStatus(id: string, status: TaskStatus, userId: string) {
    const task = await this.findOne(id, userId);

    // Any project member can update status
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: { status },
      include: this.getTaskInclude(),
    });

    await this.logActivity(ActivityAction.TASK_STATUS_CHANGED, userId, task.projectId, id, {
      oldStatus: task.status,
      newStatus: status,
    });

    return updatedTask;
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);

    // Check permission - only task creator or project owner can delete
    const isCreator = task.creatorId === userId;
    const isOwner = await this.isProjectOwner(task.projectId, userId);

    if (!isCreator && !isOwner) {
      throw new ForbiddenException('Only task creator or project owner can delete this task');
    }

    // Delete all subtasks first
    await this.prisma.task.deleteMany({
      where: { parentId: id },
    });

    // Delete task members
    await this.prisma.taskMember.deleteMany({
      where: { taskId: id },
    });

    // Delete task
    await this.prisma.task.delete({
      where: { id },
    });

    await this.logActivity(ActivityAction.TASK_DELETED, userId, task.projectId, null, {
      taskTitle: task.title,
    });

    return { message: 'Task deleted successfully' };
  }

  // ==================== TASK MEMBER MANAGEMENT ====================

  async addMember(taskId: string, addMemberDto: AddTaskMemberDto, userId: string) {
    const task = await this.findOne(taskId, userId);

    // Only task creator, primary member, or project owner can add members
    const canModify = await this.canModifyTask(taskId, task.projectId, userId);
    if (!canModify) {
      throw new ForbiddenException('You do not have permission to add members to this task');
    }

    // Check if user to add is a project member
    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: addMemberDto.userId,
          projectId: task.projectId,
        },
      },
      include: { user: true },
    });

    if (!projectMember) {
      throw new BadRequestException('User must be a project member to be assigned to a task');
    }

    // Check if already assigned
    const existingMember = await this.prisma.taskMember.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: addMemberDto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already assigned to this task');
    }

    // If adding as PRIMARY, demote existing PRIMARY to SECONDARY
    if (addMemberDto.role === TaskRole.PRIMARY) {
      await this.prisma.taskMember.updateMany({
        where: { taskId, role: TaskRole.PRIMARY },
        data: { role: TaskRole.SECONDARY },
      });
    }

    const member = await this.prisma.taskMember.create({
      data: {
        taskId,
        userId: addMemberDto.userId,
        role: addMemberDto.role || TaskRole.SECONDARY,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });

    await this.logActivity(ActivityAction.TASK_MEMBER_ADDED, userId, task.projectId, taskId, {
      memberId: addMemberDto.userId,
      memberName: projectMember.user.name,
      role: member.role,
    });

    return member;
  }

  async updateMemberRole(taskId: string, memberId: string, updateDto: UpdateTaskMemberDto, userId: string) {
    const task = await this.findOne(taskId, userId);

    const canModify = await this.canModifyTask(taskId, task.projectId, userId);
    if (!canModify) {
      throw new ForbiddenException('You do not have permission to update member roles');
    }

    const member = await this.prisma.taskMember.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Task member not found');
    }

    // If promoting to PRIMARY, demote existing PRIMARY
    if (updateDto.role === TaskRole.PRIMARY && member.role !== TaskRole.PRIMARY) {
      await this.prisma.taskMember.updateMany({
        where: { taskId, role: TaskRole.PRIMARY },
        data: { role: TaskRole.SECONDARY },
      });
    }

    const updatedMember = await this.prisma.taskMember.update({
      where: {
        taskId_userId: {
          taskId,
          userId: memberId,
        },
      },
      data: { role: updateDto.role },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });

    await this.logActivity(ActivityAction.TASK_MEMBER_ROLE_CHANGED, userId, task.projectId, taskId, {
      memberId,
      oldRole: member.role,
      newRole: updateDto.role,
    });

    return updatedMember;
  }

  async removeMember(taskId: string, memberId: string, userId: string) {
    const task = await this.findOne(taskId, userId);

    const canModify = await this.canModifyTask(taskId, task.projectId, userId);
    if (!canModify) {
      throw new ForbiddenException('You do not have permission to remove members from this task');
    }

    const member = await this.prisma.taskMember.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId: memberId,
        },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Task member not found');
    }

    await this.prisma.taskMember.delete({
      where: {
        taskId_userId: {
          taskId,
          userId: memberId,
        },
      },
    });

    await this.logActivity(ActivityAction.TASK_MEMBER_REMOVED, userId, task.projectId, taskId, {
      memberId,
      memberName: member.user.name,
    });

    return { message: 'Member removed from task' };
  }

  async getMembers(taskId: string, userId: string) {
    const task = await this.findOne(taskId, userId);

    return this.prisma.taskMember.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
      orderBy: [{ role: 'asc' }, { assignedAt: 'asc' }],
    });
  }

  // ==================== HELPER METHODS ====================

  private getTaskInclude() {
    return {
      members: {
        include: {
          user: {
            select: { id: true, email: true, name: true, avatar: true },
          },
        },
        orderBy: { role: 'asc' as const },
      },
      creator: {
        select: { id: true, email: true, name: true, avatar: true },
      },
      _count: { select: { subtasks: true } },
    };
  }

  private async checkProjectMembership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return member;
  }

  private async isProjectOwner(projectId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return member?.role === ProjectRole.OWNER;
  }

  private async canModifyTask(taskId: string, projectId: string, userId: string): Promise<boolean> {
    // Project owner can always modify
    const isOwner = await this.isProjectOwner(projectId, userId);
    if (isOwner) return true;

    // Task creator can modify
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (task?.creatorId === userId) return true;

    // Primary member can modify
    const taskMember = await this.prisma.taskMember.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
    if (taskMember?.role === TaskRole.PRIMARY) return true;

    return false;
  }

  // ==================== ACTIVITY LOGGING ====================

  private async logActivity(
    action: ActivityAction,
    userId: string,
    projectId: string,
    taskId: string | null,
    metadata: Record<string, any>,
  ) {
    await this.prisma.activityLog.create({
      data: {
        action,
        description: this.getActionDescription(action, metadata),
        metadata,
        userId,
        projectId,
        taskId,
      },
    });
  }

  private getActionDescription(action: ActivityAction, metadata: Record<string, any>): string {
    switch (action) {
      case ActivityAction.TASK_CREATED:
        return `Created task "${metadata.taskTitle}"`;
      case ActivityAction.SUBTASK_CREATED:
        return `Created subtask "${metadata.taskTitle}"`;
      case ActivityAction.TASK_UPDATED:
        return `Updated task`;
      case ActivityAction.TASK_DELETED:
        return `Deleted task "${metadata.taskTitle}"`;
      case ActivityAction.TASK_STATUS_CHANGED:
        return `Changed status from ${metadata.oldStatus} to ${metadata.newStatus}`;
      case ActivityAction.TASK_MEMBER_ADDED:
        return `Added ${metadata.memberName} to task`;
      case ActivityAction.TASK_MEMBER_REMOVED:
        return `Removed ${metadata.memberName} from task`;
      case ActivityAction.TASK_MEMBER_ROLE_CHANGED:
        return `Changed ${metadata.memberName}'s role to ${metadata.newRole}`;
      default:
        return action;
    }
  }
}
