# API Usage Examples

## Authentication

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "developer"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Projects

### Create a project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Project",
    "key": "MP",
    "description": "Project description",
    "status": "active",
    "ownerId": "user-uuid"
  }'
```

### Get all projects
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get project by ID
```bash
curl -X GET http://localhost:3000/api/projects/:id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update project
```bash
curl -X PATCH http://localhost:3000/api/projects/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed"
  }'
```

## Tasks

### Create a task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Implement login feature",
    "description": "Create login page with email and password",
    "type": "task",
    "status": "todo",
    "priority": "high",
    "projectId": "project-uuid",
    "reporterId": "user-uuid",
    "assigneeId": "user-uuid",
    "estimatedHours": 8,
    "dueDate": "2024-12-31"
  }'
```

### Get all tasks
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get tasks by project
```bash
curl -X GET "http://localhost:3000/api/tasks?projectId=PROJECT_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get tasks by assignee
```bash
curl -X GET "http://localhost:3000/api/tasks?assigneeId=USER_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update task status
```bash
curl -X PATCH http://localhost:3000/api/tasks/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress"
  }'
```

## Users

### Get all users
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get user by ID
```bash
curl -X GET http://localhost:3000/api/users/:id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Enumerations

### User Roles
- `admin`
- `project_manager`
- `developer`
- `tester`

### Project Status
- `planning`
- `active`
- `on_hold`
- `completed`
- `archived`

### Task Type
- `task`
- `bug`
- `story`
- `epic`

### Task Status
- `todo`
- `in_progress`
- `in_review`
- `done`

### Task Priority
- `low`
- `medium`
- `high`
- `critical`
