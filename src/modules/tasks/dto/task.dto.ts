import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsArray,
} from 'class-validator';
import { TaskStatus, TaskPriority, TaskRole } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design homepage mockup', description: 'Task title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Create wireframes and high-fidelity mockups for the homepage', description: 'Task description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Project ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Parent task ID (for subtask)' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.NOT_STARTED, description: 'Task status' })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM, description: 'Task priority' })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2025-02-01', description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-02-15', description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class AddTaskMemberDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID to add' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ enum: TaskRole, default: TaskRole.SECONDARY, description: 'Member role (PRIMARY or SECONDARY)' })
  @IsEnum(TaskRole)
  @IsOptional()
  role?: TaskRole;
}

export class BulkAddTaskMembersDto {
  @ApiProperty({ type: [AddTaskMemberDto], description: 'List of members to add' })
  @IsArray()
  members: AddTaskMemberDto[];
}

export class UpdateTaskMemberDto {
  @ApiProperty({ enum: TaskRole, description: 'New role for member' })
  @IsNotEmpty()
  @IsEnum(TaskRole)
  role: TaskRole;
}

export class TaskMemberResponseDto {
  @ApiProperty()
  taskId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: TaskRole })
  role: TaskRole;

  @ApiProperty()
  assignedAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiProperty()
  projectId: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  creatorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [TaskMemberResponseDto] })
  members?: TaskMemberResponseDto[];

  @ApiPropertyOptional()
  creator?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };

  @ApiPropertyOptional({ type: [TaskResponseDto] })
  subtasks?: TaskResponseDto[];

  @ApiPropertyOptional()
  _count?: {
    subtasks: number;
  };
}
