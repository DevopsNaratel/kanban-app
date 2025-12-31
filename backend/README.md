# Kanban Backend API

Express.js REST API with PostgreSQL for the Kanban To-Do Application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment**:
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

3. **Setup database**:
```bash
# Create database
createdb kanban_db

# Or using psql
psql -U postgres -c "CREATE DATABASE kanban_db;"

# Run schema
psql -U postgres -d kanban_db -f database/schema.sql
```

4. **Start server**:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controllers/
│   ├── boardsController.js  # Board business logic
│   ├── columnsController.js # Column business logic
│   └── tasksController.js   # Task business logic
├── routes/
│   ├── boards.js            # Board routes
│   ├── columns.js           # Column routes
│   └── tasks.js             # Task routes
├── database/
│   └── schema.sql           # Database schema
├── utils/
│   └── helpers.js           # Utility functions
├── .env                     # Environment variables
├── .env.example             # Environment template
├── index.js                 # Server entry point
└── package.json             # Dependencies
```

## 🗄️ Database Schema

### Tables

**boards**
- `id` (VARCHAR) - Primary key
- `title` (VARCHAR) - Board title
- `description` (TEXT) - Board description
- `color` (VARCHAR) - Board color hex code
- `last_updated` (BIGINT) - Timestamp in milliseconds
- `is_starred` (BOOLEAN) - Star status
- `last_viewed` (BIGINT) - Last view timestamp
- `created_at` (TIMESTAMP) - Creation timestamp

**columns**
- `id` (VARCHAR) - Primary key
- `board_id` (VARCHAR) - Foreign key to boards
- `title` (VARCHAR) - Column title
- `order` (INTEGER) - Display order
- `created_at` (TIMESTAMP) - Creation timestamp

**tasks**
- `id` (VARCHAR) - Primary key
- `column_id` (VARCHAR) - Foreign key to columns
- `title` (VARCHAR) - Task title
- `description` (TEXT) - Task description
- `priority` (VARCHAR) - low, medium, or high
- `due_date` (VARCHAR) - ISO date string
- `created_at` (TIMESTAMP) - Creation timestamp

### Relationships
- Boards → Columns (one-to-many, cascade delete)
- Columns → Tasks (one-to-many, cascade delete)

## 📡 API Endpoints

### Boards

#### Get All Boards
```http
GET /api/boards
Response: 200 OK
[
  {
    "id": "abc123",
    "title": "My Board",
    "description": "Board description",
    "color": "#3b82f6",
    "last_updated": 1704067200000,
    "is_starred": false,
    "last_viewed": null
  }
]
```

#### Get Board by ID
```http
GET /api/boards/:id
Response: 200 OK / 404 Not Found
```

#### Create Board
```http
POST /api/boards
Body: {
  "title": "New Board",
  "description": "Description",
  "color": "#3b82f6"
}
Response: 201 Created
Note: Automatically creates 3 default columns
```

#### Update Board
```http
PATCH /api/boards/:id
Body: {
  "title": "Updated Title"
}
Response: 200 OK / 404 Not Found
```

#### Delete Board
```http
DELETE /api/boards/:id
Response: 204 No Content / 404 Not Found
Note: Cascade deletes all columns and tasks
```

#### Toggle Star
```http
PATCH /api/boards/:id/star
Response: 200 OK
```

#### Mark as Viewed
```http
PATCH /api/boards/:id/view
Response: 200 OK
```

#### Get Board Columns
```http
GET /api/boards/:boardId/columns
Response: 200 OK
```

#### Get Board Tasks
```http
GET /api/boards/:boardId/tasks
Response: 200 OK
```

#### Reorder Columns
```http
PATCH /api/boards/:boardId/columns/reorder
Body: {
  "columnOrders": [
    { "id": "col1", "order": 0 },
    { "id": "col2", "order": 1 }
  ]
}
Response: 200 OK
```

### Columns

#### Get Column by ID
```http
GET /api/columns/:id
Response: 200 OK / 404 Not Found
```

#### Create Column
```http
POST /api/columns
Body: {
  "boardId": "board123",
  "title": "New Column",
  "order": 3
}
Response: 201 Created
```

#### Update Column
```http
PATCH /api/columns/:id
Body: {
  "title": "Updated Title"
}
Response: 200 OK / 404 Not Found
```

#### Delete Column
```http
DELETE /api/columns/:id
Response: 204 No Content / 404 Not Found
Note: Cascade deletes all tasks in column
```

#### Get Column Tasks
```http
GET /api/columns/:columnId/tasks
Response: 200 OK
```

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Response: 200 OK
```

#### Get Task by ID
```http
GET /api/tasks/:id
Response: 200 OK / 404 Not Found
```

#### Create Task
```http
POST /api/tasks
Body: {
  "columnId": "col123",
  "title": "New Task",
  "description": "Task description",
  "priority": "high",
  "dueDate": "2025-01-15"
}
Response: 201 Created
```

#### Update Task
```http
PATCH /api/tasks/:id
Body: {
  "title": "Updated Task",
  "priority": "medium"
}
Response: 200 OK / 404 Not Found
```

#### Delete Task
```http
DELETE /api/tasks/:id
Response: 204 No Content / 404 Not Found
```

#### Move Task
```http
PATCH /api/tasks/:id/move
Body: {
  "columnId": "newCol123"
}
Response: 200 OK
```

## 🔧 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kanban_db
DB_USER=postgres
DB_PASSWORD=your_password

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
```

## 🧪 Testing

### Using curl

```bash
# Get all boards
curl http://localhost:3000/api/boards

# Create board
curl -X POST http://localhost:3000/api/boards \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Board","description":"Testing","color":"#3b82f6"}'

# Update board
curl -X PATCH http://localhost:3000/api/boards/abc123 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Board"}'

# Delete board
curl -X DELETE http://localhost:3000/api/boards/abc123
```

### Using Postman/Insomnia

Import the following collection or test manually:
- Base URL: `http://localhost:3000/api`
- Test all endpoints listed above

## 🔒 Security Features

- CORS enabled for frontend origin
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- Error handling middleware
- Request logging

## 🚨 Error Handling

All errors return JSON:
```json
{
  "error": "Error message here"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 📊 Database Management

### Backup Database
```bash
pg_dump -U postgres kanban_db > backup.sql
```

### Restore Database
```bash
psql -U postgres kanban_db < backup.sql
```

### Reset Database
```bash
psql -U postgres -d kanban_db -f database/schema.sql
```

## 🔄 Development Workflow

1. Make changes to code
2. Server auto-reloads (with nodemon)
3. Test endpoints with Postman/curl
4. Check logs in terminal
5. Commit changes

## 📝 Logging

The server logs:
- All incoming requests (method + path)
- Database queries (with duration)
- Errors (with stack traces)

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups

### Deploy to Heroku
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git push heroku main
```

## 🐛 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Ensure database exists: `psql -l`

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### CORS Errors
- Check FRONTEND_URL in `.env`
- Verify CORS configuration in `index.js`

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT
