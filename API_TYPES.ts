/**
 * CRM Task Management API Types
 * Use these types for type safety in your Frontend project
 */

// ==================== AUTH ====================

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthGoogleRequest {
  token: string; // Google ID token from frontend
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== USER ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
}

// ==================== PROJECT ====================

export enum ProjectRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string; // Hex color like #3B82F6
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  isArchived?: boolean;
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: Date;
  user?: User;
}

export interface AddProjectMemberRequest {
  userId: string;
  role?: ProjectRole;
}

export interface UpdateProjectMemberRequest {
  role: ProjectRole;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: {
    tasks: number;
    members: number;
  };
}

// ==================== TASK ====================

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskRole {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  parentId?: string; // For subtask
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  parentId?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface TaskMember {
  taskId: string;
  userId: string;
  role: TaskRole;
  assignedAt: Date;
  user?: User;
}

export interface AddTaskMemberRequest {
  userId: string;
  role?: TaskRole;
}

export interface UpdateTaskMemberRequest {
  role: TaskRole;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  projectId: string;
  parentId?: string; // null = main task, filled = subtask
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: TaskMember[];
  creator?: User;
  subtasks?: Task[];
  _count?: {
    subtasks: number;
  };
}

// ==================== ACTIVITY LOG ====================

export enum ActivityAction {
  // Project actions
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED = 'MEMBER_ROLE_CHANGED',

  // Task actions
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_MEMBER_ADDED = 'TASK_MEMBER_ADDED',
  TASK_MEMBER_REMOVED = 'TASK_MEMBER_REMOVED',
  TASK_MEMBER_ROLE_CHANGED = 'TASK_MEMBER_ROLE_CHANGED',
  SUBTASK_CREATED = 'SUBTASK_CREATED',

  // Comment actions
  COMMENT_ADDED = 'COMMENT_ADDED',
}

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
  userId: string;
  projectId: string;
  taskId?: string;
  createdAt: Date;
  user?: User;
  task?: {
    id: string;
    title: string;
  };
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== ERROR ====================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// ==================== API RESPONSE ====================

export interface ApiResponse<T> {
  data: T;
}

// ==================== UTILITY TYPES ====================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  q: string;
}
