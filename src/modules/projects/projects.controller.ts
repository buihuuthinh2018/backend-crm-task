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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  ProjectResponseDto,
  ProjectMemberResponseDto,
} from './dto/project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Projects')
@ApiBearerAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ==================== PROJECT CRUD ====================

  @Post()
  @ApiOperation({ summary: 'Create new project', description: 'Create a new project and become its owner' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project created successfully', type: ProjectResponseDto })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects', description: 'Get all projects you are a member of' })
  @ApiQuery({ name: 'includeArchived', required: false, type: Boolean, description: 'Include archived projects' })
  @ApiResponse({ status: 200, description: 'List of projects', type: [ProjectResponseDto] })
  findAll(@Request() req, @Query('includeArchived') includeArchived?: string) {
    return this.projectsService.findAll(req.user.id, includeArchived === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID', description: 'Get project details including members and tasks' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project details', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project', description: 'Update project (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Project updated', type: ProjectResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner only' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive project', description: 'Archive a project (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project archived' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner only' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  // ==================== MEMBER MANAGEMENT ====================

  @Get(':id/members')
  @ApiOperation({ summary: 'Get project members', description: 'Get all members of a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'List of members', type: [ProjectMemberResponseDto] })
  getMembers(@Param('id') id: string, @Request() req) {
    return this.projectsService.getMembers(id, req.user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add project member', description: 'Add a new member to project (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: AddProjectMemberDto })
  @ApiResponse({ status: 201, description: 'Member added', type: ProjectMemberResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner only' })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  addMember(@Param('id') id: string, @Body() addMemberDto: AddProjectMemberDto, @Request() req) {
    return this.projectsService.addMember(id, addMemberDto, req.user.id);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update member role', description: 'Change member role (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiBody({ type: UpdateProjectMemberDto })
  @ApiResponse({ status: 200, description: 'Role updated', type: ProjectMemberResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdateProjectMemberDto,
    @Request() req,
  ) {
    return this.projectsService.updateMemberRole(id, memberId, updateDto, req.user.id);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove project member', description: 'Remove a member from project (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req) {
    return this.projectsService.removeMember(id, memberId, req.user.id);
  }
}
