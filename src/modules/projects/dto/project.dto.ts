import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'A complete redesign of the company website', description: 'Project description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#3B82F6', description: 'Project color (hex code)' })
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Color must be a valid hex code' })
  color?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ example: false, description: 'Archive status' })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}

export class AddProjectMemberDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID to add' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ enum: ProjectRole, default: ProjectRole.MEMBER, description: 'Member role' })
  @IsOptional()
  role?: ProjectRole;
}

export class UpdateProjectMemberDto {
  @ApiProperty({ enum: ProjectRole, description: 'New role for member' })
  @IsNotEmpty()
  role: ProjectRole;
}

export class ProjectMemberResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ enum: ProjectRole })
  role: ProjectRole;

  @ApiProperty()
  joinedAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  color?: string;

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [ProjectMemberResponseDto] })
  members?: ProjectMemberResponseDto[];

  @ApiPropertyOptional()
  _count?: {
    tasks: number;
    members: number;
  };
}
