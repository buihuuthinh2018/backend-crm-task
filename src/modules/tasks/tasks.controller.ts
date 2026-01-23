import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AddTaskMemberDto,
  UpdateTaskMemberDto,
  TaskResponseDto,
  TaskMemberResponseDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';

@ApiTags('Tasks')
@ApiBearerAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ==================== TASK CRUD ====================

  @Post()
  @ApiOperation({ summary: 'Create task', description: 'Create a new task or subtask in a project' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: TaskResponseDto })
  @ApiResponse({ status: 403, description: 'Not a project member' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get my tasks', description: 'Get all tasks assigned to current user' })
  @ApiResponse({ status: 200, description: 'List of assigned tasks', type: [TaskResponseDto] })
  findMyTasks(@Request() req) {
    return this.tasksService.findMyTasks(req.user.id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get project tasks', description: 'Get all tasks in a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'List of project tasks', type: [TaskResponseDto] })
  @ApiResponse({ status: 403, description: 'Not a project member' })
  findByProject(@Param('projectId') projectId: string, @Request() req) {
    return this.tasksService.findByProject(projectId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID', description: 'Get task details including subtasks' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task details', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task', description: 'Update task (creator, primary member, or owner only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated', type: TaskResponseDto })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status', description: 'Quick status update (any member)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: Object.values(TaskStatus) } } } })
  @ApiResponse({ status: 200, description: 'Status updated', type: TaskResponseDto })
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus, @Request() req) {
    return this.tasksService.updateStatus(id, status, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task', description: 'Delete task (creator or owner only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }

  // ==================== TASK MEMBER MANAGEMENT ====================

  @Get(':id/members')
  @ApiOperation({ summary: 'Get task members', description: 'Get all members assigned to a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'List of task members', type: [TaskMemberResponseDto] })
  getMembers(@Param('id') id: string, @Request() req) {
    return this.tasksService.getMembers(id, req.user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add task member', description: 'Assign a project member to task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: AddTaskMemberDto })
  @ApiResponse({ status: 201, description: 'Member added', type: TaskMemberResponseDto })
  @ApiResponse({ status: 400, description: 'User not a project member' })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 409, description: 'Already assigned' })
  addMember(@Param('id') id: string, @Body() addMemberDto: AddTaskMemberDto, @Request() req) {
    return this.tasksService.addMember(id, addMemberDto, req.user.id);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update member role', description: 'Change task member role' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiBody({ type: UpdateTaskMemberDto })
  @ApiResponse({ status: 200, description: 'Role updated', type: TaskMemberResponseDto })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdateTaskMemberDto,
    @Request() req,
  ) {
    return this.tasksService.updateMemberRole(id, memberId, updateDto, req.user.id);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove task member', description: 'Unassign a member from task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req) {
    return this.tasksService.removeMember(id, memberId, req.user.id);
  }
}
