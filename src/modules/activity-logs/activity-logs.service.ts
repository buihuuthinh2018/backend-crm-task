import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string, userId: string, limit = 50, offset = 0) {
    // Only project owner can view all activity logs
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

    // Members can only see their own activities
    const whereClause: any = { projectId };
    if (member.role !== ProjectRole.OWNER) {
      whereClause.userId = userId;
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, email: true, name: true, avatar: true },
          },
          task: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityLog.count({ where: whereClause }),
    ]);

    return {
      data: logs,
      total,
      limit,
      offset,
    };
  }

  async findByTask(taskId: string, userId: string, limit = 50, offset = 0) {
    // Get task to check project membership
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new ForbiddenException('Task not found');
    }

    // Check project membership
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: task.projectId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { taskId },
        include: {
          user: {
            select: { id: true, email: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityLog.count({ where: { taskId } }),
    ]);

    return {
      data: logs,
      total,
      limit,
      offset,
    };
  }

  async findMyActivities(userId: string, limit = 50, offset = 0) {
    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { userId },
        include: {
          project: {
            select: { id: true, name: true, color: true },
          },
          task: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityLog.count({ where: { userId } }),
    ]);

    return {
      data: logs,
      total,
      limit,
      offset,
    };
  }
}
