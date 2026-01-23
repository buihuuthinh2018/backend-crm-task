import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogResponseDto } from './dto/activity-log.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Activity Logs')
@ApiBearerAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get('my-activities')
  @ApiOperation({ summary: 'Get my activities', description: 'Get activities performed by current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of activities', type: [ActivityLogResponseDto] })
  findMyActivities(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.activityLogsService.findMyActivities(
      req.user.id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get project activities', description: 'Get all activities in a project (Owner sees all, members see their own)' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of project activities', type: [ActivityLogResponseDto] })
  @ApiResponse({ status: 403, description: 'Not a project member' })
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.activityLogsService.findByProject(
      projectId,
      req.user.id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get task activities', description: 'Get all activities related to a task' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'List of task activities', type: [ActivityLogResponseDto] })
  @ApiResponse({ status: 403, description: 'Not a project member' })
  findByTask(
    @Param('taskId') taskId: string,
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.activityLogsService.findByTask(
      taskId,
      req.user.id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }
}
