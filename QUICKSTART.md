# Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
Ensure you have:
- Node.js v16+ installed
- PostgreSQL database (Supabase account or local PostgreSQL)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/buihuuthinh2018/backend-crm-task.git
cd backend-crm-task

# Install dependencies
npm install
```

### 3. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your database password
# Update the DB_PASSWORD field with your actual Supabase password
nano .env  # or use your preferred editor
```

**Important:** Update these values in `.env`:
- `DB_PASSWORD` - Your actual PostgreSQL/Supabase password
- `JWT_SECRET` - A strong random string for JWT signing (in production)

### 4. Start the Application
```bash
# Development mode with hot reload
npm run start:dev
```

The API will be available at: `http://localhost:3000/api`

### 5. Test the API

#### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Save the `access_token` from the response!

#### Create a project:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My First Project",
    "key": "MFP",
    "description": "This is my first project",
    "ownerId": "YOUR_USER_ID"
  }'
```

## 🐳 Alternative: Using Local PostgreSQL with Docker

If you don't want to use Supabase, you can run PostgreSQL locally:

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Update .env to use local database
DB_HOST=localhost
DB_PASSWORD=postgres
```

## 📝 Next Steps

1. Check out the full [README.md](README.md) for detailed documentation
2. See [API_EXAMPLES.md](API_EXAMPLES.md) for all API endpoints
3. Explore the project structure in the `src/` directory

## 🔧 Common Commands

```bash
# Build the project
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Start in production mode
npm run start:prod
```

## ❗ Troubleshooting

### Database connection error?
- Verify your database credentials in `.env`
- Check if your IP is allowed in Supabase (for remote connections)
- Ensure PostgreSQL is running (if using local database)

### Can't start the application?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port 3000 already in use?
Change the `PORT` in `.env` to another port like `3001`.

## 📚 Documentation

- **Database Models**: See entity files in `src/modules/*/` directories
- **API Endpoints**: Check `API_EXAMPLES.md`
- **Configuration**: Review `.env.example`

## 🎉 You're Ready!

Your NestJS CRM backend is now running. Start creating projects and tasks!
