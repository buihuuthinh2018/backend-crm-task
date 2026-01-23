import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityAction } from '@prisma/client';

export class ActivityLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ActivityAction })
  action: ActivityAction;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  projectId: string;

  @ApiPropertyOptional()
  taskId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };

  @ApiPropertyOptional()
  task?: {
    id: string;
    title: string;
  };
}
