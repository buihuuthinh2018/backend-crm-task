import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
} from 'class-validator';
import { TaskType, TaskStatus, TaskPriority } from '../task.entity';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsUUID()
  reporterId: string;

  @IsInt()
  @IsOptional()
  estimatedHours?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @IsOptional()
  estimatedHours?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
