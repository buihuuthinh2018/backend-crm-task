# Backend CRM Task Management System

A NestJS-based backend application for a CRM task management system similar to Jira, with PostgreSQL database integration.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 👥 **User Management** - Complete user CRUD operations with roles (Admin, Project Manager, Developer, Tester)
- 📁 **Project Management** - Create and manage projects with status tracking
- ✅ **Task Management** - Full task lifecycle management with priorities, types, and statuses
- 🗄️ **PostgreSQL Database** - Robust data persistence with TypeORM
- 🔒 **Security** - Password hashing with bcrypt, input validation with class-validator
- 📝 **API Documentation** - RESTful API endpoints with proper validation

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT, Passport
- **Validation**: class-validator, class-transformer
- **Testing**: Jest

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (Supabase or local)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/buihuuthinh2018/backend-crm-task.git
cd backend-crm-task
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your database credentials:
```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=db.jtzkywtcjfyzwgttsvel.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-actual-password
DB_DATABASE=postgres
DB_SYNCHRONIZE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development
```

## Running the Application

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create a new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?projectId=:id` - Get tasks by project
- `GET /api/tasks?assigneeId=:id` - Get tasks by assignee
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Database Models

### User
- id (UUID)
- email (unique)
- password (hashed)
- firstName, lastName
- role (admin, project_manager, developer, tester)
- isActive

### Project
- id (UUID)
- name
- key
- description
- status (planning, active, on_hold, completed, archived)
- startDate, endDate
- owner (User)

### Task
- id (UUID)
- title
- description
- type (task, bug, story, epic)
- status (todo, in_progress, in_review, done)
- priority (low, medium, high, critical)
- project (Project)
- assignee (User, nullable)
- reporter (User)
- estimatedHours
- dueDate

## Development

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Testing
```bash
npm run test
npm run test:watch
npm run test:cov
```

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── dto/              # Data transfer objects
│   ├── guards/           # Auth guards (JWT, Local)
│   ├── strategies/       # Passport strategies
│   └── auth.module.ts
├── config/               # Configuration files
│   └── database.config.ts
├── modules/              # Feature modules
│   ├── users/           # User management
│   ├── projects/        # Project management
│   └── tasks/           # Task management
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Security Notes

- Change the `JWT_SECRET` in production to a strong, random value
- Use strong passwords for database access
- Set `DB_SYNCHRONIZE=false` in production and use migrations
- Enable SSL for database connections in production
- Keep dependencies up to date

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please open an issue on GitHub.