# 🐳 Docker Deployment Guide

Complete guide for running the Kanban application with Docker.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB free disk space

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy the environment template
cp .env.docker .env

# Edit the .env file with your secure values
nano .env
```

**Important**: Change these values in production:
- `DB_PASSWORD` - Use a strong password
- `JWT_SECRET` - Use a random 32+ character string

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 4. Create First User

```bash
# Register via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password",
    "name": "Admin User"
  }'
```

## 📦 Services

### PostgreSQL Database
- **Container**: `kanban-postgres`
- **Port**: 5432
- **Volume**: `postgres_data` (persistent storage)
- **Auto-initialization**: Runs `schema.sql` on first start

### Backend API
- **Container**: `kanban-backend`
- **Port**: 3000
- **Technology**: Node.js + Express
- **Health Check**: `/health` endpoint

### Frontend
- **Container**: `kanban-frontend`
- **Port**: 80
- **Technology**: React + Nginx
- **Features**: SPA routing, API proxy, gzip compression

## 🔧 Docker Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with build
docker-compose up -d --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands
```bash
# Access backend container
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U postgres -d kanban_db

# Run database queries
docker-compose exec postgres psql -U postgres -d kanban_db -c "SELECT * FROM users;"
```

## 🗄️ Database Management

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres kanban_db > backup_$(date +%Y%m%d).sql

# Or using docker
docker exec kanban-postgres pg_dump -U postgres kanban_db > backup.sql
```

### Restore Database
```bash
# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql -U postgres kanban_db
```

### Reset Database
```bash
# Drop and recreate
docker-compose exec postgres psql -U postgres -c "DROP DATABASE kanban_db;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE kanban_db;"
docker-compose exec postgres psql -U postgres -d kanban_db -f /docker-entrypoint-initdb.d/schema.sql
```

### Access Database Shell
```bash
docker-compose exec postgres psql -U postgres -d kanban_db
```

## 🔍 Monitoring & Debugging

### Check Container Health
```bash
# View health status
docker-compose ps

# Inspect specific container
docker inspect kanban-backend
```

### View Resource Usage
```bash
# Real-time stats
docker stats

# Specific containers
docker stats kanban-backend kanban-frontend kanban-postgres
```

### Debug Issues
```bash
# Check container logs
docker-compose logs backend

# Access container shell
docker-compose exec backend sh

# Check environment variables
docker-compose exec backend env

# Test backend health
docker-compose exec backend wget -qO- http://localhost:3000/health
```

## 🏗️ Development vs Production

### Development Mode
```bash
# Use docker-compose.dev.yml for development
docker-compose -f docker-compose.dev.yml up -d
```

### Production Mode
```bash
# Use default docker-compose.yml
docker-compose up -d

# With custom env file
docker-compose --env-file .env.production up -d
```

## 🔒 Security Best Practices

### 1. Change Default Passwords
```bash
# Generate strong password
openssl rand -base64 32

# Update .env file
DB_PASSWORD=<generated-password>
```

### 2. Secure JWT Secret
```bash
# Generate JWT secret
openssl rand -base64 64

# Update .env file
JWT_SECRET=<generated-secret>
```

### 3. Use HTTPS in Production
- Set up reverse proxy (Nginx/Traefik)
- Use Let's Encrypt for SSL certificates
- Update CORS settings

### 4. Limit Exposed Ports
```yaml
# In docker-compose.yml, remove port mappings for internal services
# Only expose frontend (80/443)
```

## 📊 Performance Optimization

### 1. Resource Limits
```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. Optimize Images
```bash
# Build with no cache
docker-compose build --no-cache

# Remove unused images
docker image prune -a
```

### 3. Database Tuning
```yaml
# Add to postgres service
command:
  - "postgres"
  - "-c"
  - "max_connections=100"
  - "-c"
  - "shared_buffers=256MB"
```

## 🚀 Deployment

### Deploy to Production Server

1. **Copy files to server**:
```bash
rsync -avz --exclude node_modules --exclude .git . user@server:/opt/kanban-app/
```

2. **SSH into server**:
```bash
ssh user@server
cd /opt/kanban-app
```

3. **Setup environment**:
```bash
cp .env.docker .env
nano .env  # Update with production values
```

4. **Start services**:
```bash
docker-compose up -d
```

5. **Setup reverse proxy** (Nginx example):
```nginx
server {
    listen 80;
    server_name kanban.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Deploy with CI/CD

Example GitHub Actions workflow:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /opt/kanban-app && git pull && docker-compose up -d --build'
```

## 🧹 Cleanup

### Remove Everything
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker rmi kanban-app-backend kanban-app-frontend

# Remove all unused Docker resources
docker system prune -a --volumes
```

## 📝 Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=kanban_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost
```

### Docker Compose (.env)
```env
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

## 🆘 Troubleshooting

### Issue: Container won't start
```bash
# Check logs
docker-compose logs backend

# Check if port is in use
sudo lsof -i :3000

# Rebuild container
docker-compose up -d --build backend
```

### Issue: Database connection failed
```bash
# Check if postgres is healthy
docker-compose ps

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec backend nc -zv postgres 5432
```

### Issue: Frontend can't reach backend
```bash
# Check network
docker network inspect kanban-app_kanban-network

# Test from frontend container
docker-compose exec frontend wget -qO- http://backend:3000/health
```

### Issue: Permission denied
```bash
# Fix volume permissions
docker-compose exec postgres chown -R postgres:postgres /var/lib/postgresql/data
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

## 🎉 Success!

Your Kanban application should now be running:
- Frontend: http://localhost
- Backend: http://localhost:3000
- Database: localhost:5432

Happy coding! 🚀
