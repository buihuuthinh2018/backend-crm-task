import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddProjectMemberDto, UpdateProjectMemberDto } from './dto/project.dto';
import { ProjectRole, ActivityAction } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ==================== PROJECT CRUD ====================

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        color: createProjectDto.color || '#3B82F6',
        members: {
          create: {
            userId,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    // Log activity
    await this.logActivity(ActivityAction.PROJECT_CREATED, userId, project.id, null, {
      projectName: project.name,
    });

    return project;
  }

  async findAll(userId: string, includeArchived = false) {
    const whereClause: any = {
      members: {
        some: { userId },
      },
    };

    if (!includeArchived) {
      whereClause.isArchived = false;
    }

    return this.prisma.project.findMany({
      where: whereClause,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        tasks: {
          where: { parentId: null }, // Only top-level tasks
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, email: true, name: true, avatar: true },
                },
              },
            },
            _count: { select: { subtasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or you do not have access');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    await this.checkOwnerPermission(id, userId);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        color: updateProjectDto.color,
        isArchived: updateProjectDto.isArchived,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    await this.logActivity(ActivityAction.PROJECT_UPDATED, userId, id, null, {
      changes: updateProjectDto,
    });

    return project;
  }

  async remove(id: string, userId: string) {
    await this.checkOwnerPermission(id, userId);

    // Soft delete by archiving
    await this.prisma.project.update({
      where: { id },
      data: { isArchived: true },
    });

    await this.logActivity(ActivityAction.PROJECT_DELETED, userId, id, null, {});

    return { message: 'Project archived successfully' };
  }

  // ==================== MEMBER MANAGEMENT ====================

  async addMember(projectId: string, addMemberDto: AddProjectMemberDto, userId: string) {
    await this.checkOwnerPermission(projectId, userId);

    // Check if user exists
    const userToAdd = await this.prisma.user.findUnique({
      where: { id: addMemberDto.userId },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: addMemberDto.userId,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        userId: addMemberDto.userId,
        projectId,
        role: addMemberDto.role || ProjectRole.MEMBER,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });

    await this.logActivity(ActivityAction.MEMBER_ADDED, userId, projectId, null, {
      memberId: addMemberDto.userId,
      memberName: userToAdd.name,
      role: member.role,
    });

    return member;
  }

  async updateMemberRole(projectId: string, memberId: string, updateDto: UpdateProjectMemberDto, userId: string) {
    await this.checkOwnerPermission(projectId, userId);

    // Cannot change own role
    if (memberId === userId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const updatedMember = await this.prisma.projectMember.update({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
      data: { role: updateDto.role },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });

    await this.logActivity(ActivityAction.MEMBER_ROLE_CHANGED, userId, projectId, null, {
      memberId,
      oldRole: member.role,
      newRole: updateDto.role,
    });

    return updatedMember;
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.checkOwnerPermission(projectId, userId);

    // Cannot remove yourself
    if (memberId === userId) {
      throw new ForbiddenException('Cannot remove yourself from project');
    }

    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Remove member from all tasks in this project
    await this.prisma.taskMember.deleteMany({
      where: {
        userId: memberId,
        task: { projectId },
      },
    });

    // Remove from project
    await this.prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: memberId,
          projectId,
        },
      },
    });

    await this.logActivity(ActivityAction.MEMBER_REMOVED, userId, projectId, null, {
      memberId,
      memberName: member.user.name,
    });

    return { message: 'Member removed successfully' };
  }

  async getMembers(projectId: string, userId: string) {
    await this.checkMemberAccess(projectId, userId);

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // ==================== PERMISSION HELPERS ====================

  async checkOwnerPermission(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Project not found or you do not have access');
    }

    if (member.role !== ProjectRole.OWNER) {
      throw new ForbiddenException('Only project owner can perform this action');
    }

    return member;
  }

  async checkMemberAccess(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Project not found or you do not have access');
    }

    return member;
  }

  async isOwner(projectId: string, userId: string): Promise<boolean> {
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

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return !!member;
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
      case ActivityAction.PROJECT_CREATED:
        return `Created project "${metadata.projectName}"`;
      case ActivityAction.PROJECT_UPDATED:
        return `Updated project`;
      case ActivityAction.PROJECT_DELETED:
        return `Archived project`;
      case ActivityAction.MEMBER_ADDED:
        return `Added ${metadata.memberName} to project`;
      case ActivityAction.MEMBER_REMOVED:
        return `Removed ${metadata.memberName} from project`;
      case ActivityAction.MEMBER_ROLE_CHANGED:
        return `Changed ${metadata.memberName}'s role from ${metadata.oldRole} to ${metadata.newRole}`;
      default:
        return action;
    }
  }
}
