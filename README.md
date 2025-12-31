# Kanban To-Do Application

A modern, feature-rich full-stack Kanban board application with React frontend and Express.js backend.

## 🎯 Project Status

### ✅ Frontend - COMPLETE

The frontend is fully functional with API integration support:

- ✅ API service layer with all CRUD operations
- ✅ Axios HTTP client configured
- ✅ Loading and error state management
- ✅ Dual-mode architecture (local state + API mode)
- ✅ TypeScript types for all data models
- ✅ Vite proxy for development
- ✅ Environment configuration

### ✅ Backend - COMPLETE

The backend is fully implemented and ready to use:

- ✅ Express.js REST API
- ✅ PostgreSQL database with schema
- ✅ All CRUD endpoints for boards, columns, tasks
- ✅ CORS configuration
- ✅ Error handling and validation
- ✅ Database migrations and sample data
- ✅ Comprehensive documentation


## 🚀 Quick Start

### Option 1: Docker (Easiest - Recommended for Production)

```bash
# One-command setup
./docker-start.sh

# Or manually
cp .env.docker .env
docker-compose up -d
```

**Access:**
- Frontend: http://localhost
- Backend: http://localhost:3000
- Database: Automatically configured

See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed Docker documentation.

### Option 2: Full Stack Setup (Development)

**1. Setup Backend:**
```bash
# Automated setup
./setup-backend.sh

# Or manual setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
createdb kanban_db
psql -U postgres -d kanban_db -f database/schema.sql
npm run dev
```

**2. Setup Frontend:**
```bash
cd frontend
npm install
npm install axios

# Enable API mode
# Edit src/context/KanbanContext.tsx
# Change: const USE_API = true;

npm run dev
```

**3. Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

### Option 3: Frontend Only (Local State Mode)

```bash
cd frontend
npm install
npm run dev
```

The app will run with local state - no backend needed!


## 📚 Documentation

- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete Docker deployment guide
- **[backend/README.md](./backend/README.md)** - Backend documentation and API reference
- **[frontend/API_INTEGRATION.md](./frontend/API_INTEGRATION.md)** - Frontend integration guide

## 🏗️ Project Structure

```
kanban-app/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts          # Axios configuration
│   │   ├── services/
│   │   │   └── api.ts          # API service layer
│   │   ├── hooks/
│   │   │   └── useApi.ts       # Custom API hooks
│   │   ├── context/
│   │   │   └── KanbanContext.tsx  # State management
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   └── types/              # TypeScript types
│   ├── .env                    # Environment variables
│   └── vite.config.ts          # Vite + proxy config
│
└── backend/                     # Express + PostgreSQL (to be implemented)
    ├── routes/                 # API routes
    ├── controllers/            # Business logic
    ├── models/                 # Database models
    └── config/                 # Configuration
```

## 🔧 Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **@dnd-kit** - Drag and drop
- **Radix UI** - Accessible components

### Backend (Planned)
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## 📋 Features

### Implemented (Frontend)
- ✅ Multiple boards with color coding
- ✅ Drag-and-drop tasks between columns
- ✅ Task priorities (low, medium, high)
- ✅ Due dates with calendar picker
- ✅ Board starring and filtering
- ✅ Dashboard with task overview
- ✅ Calendar view of all tasks
- ✅ Responsive design
- ✅ Dark mode support
- ✅ API integration ready

### To Implement (Backend)
- ⏳ REST API endpoints
- ⏳ PostgreSQL database
- ⏳ Data persistence
- ⏳ Authentication (optional)
- ⏳ Real-time updates (optional)

## 🔌 API Integration

### Current Mode: Local State
```typescript
const USE_API = false;  // In KanbanContext.tsx
```

All data is stored in memory. Perfect for development and testing.

### Switching to API Mode
```typescript
const USE_API = true;  // In KanbanContext.tsx
```

All operations will use the backend API. Requires backend to be running.

## 🎨 Design Features

- Modern, premium UI design
- Smooth animations and transitions
- Glassmorphism effects
- Vibrant color palette
- Responsive layout
- Accessible components

## 📝 API Endpoints (Backend Specification)

### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create board
- `PATCH /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `PATCH /api/boards/:id/star` - Toggle star
- `PATCH /api/boards/:id/view` - Mark as viewed

### Columns
- `GET /api/boards/:boardId/columns` - Get columns
- `POST /api/columns` - Create column
- `PATCH /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `PATCH /api/boards/:boardId/columns/reorder` - Reorder

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/boards/:boardId/tasks` - Get board tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/move` - Move task
- `DELETE /api/tasks/:id` - Delete task

See [BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md) for complete details.

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

## 🧪 Testing the Integration

1. Build the backend following `BACKEND_API_SPEC.md`
2. Start the backend server
3. Enable API mode in frontend
4. Test all CRUD operations:
   - Create/update/delete boards
   - Create/update/delete columns
   - Create/update/delete tasks
   - Drag and drop tasks
   - Star boards
   - Filter by date

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (for backend)

### Setup
```bash
# Clone repository
git clone <repository-url>
cd kanban-app

# Install frontend dependencies
cd frontend
npm install

# Install axios for API integration
npm install axios

# Start frontend
npm run dev
```

## 🤝 For Backend Developers

Everything you need to build the backend is documented in:

1. **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)** - Complete API specification
   - All endpoints with request/response formats
   - Database schema
   - Express.js setup example
   - Testing checklist

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
   - Visual diagrams
   - Data flow
   - Integration points

The frontend is **ready to connect** - just build the API to match the spec!

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please read the documentation before submitting PRs.

---

**Note**: The frontend is fully functional in local state mode. Backend integration is optional but recommended for production use.
