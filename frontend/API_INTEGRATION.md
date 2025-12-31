# Frontend API Integration Guide

## Overview

The frontend has been prepared for backend API integration with a dual-mode architecture that supports both:
- **Local State Mode** (default): Uses in-memory state for development
- **API Mode**: Connects to backend REST API

## Architecture

### 📁 File Structure

```
frontend/src/
├── config/
│   └── api.ts              # Axios configuration & interceptors
├── services/
│   └── api.ts              # API service layer (boards, columns, tasks)
├── hooks/
│   └── useApi.ts           # Custom hooks for API calls
└── context/
    └── KanbanContext.tsx   # State management with API support
```

### 🔧 Configuration Files

- **`.env`** - Environment variables (not committed)
- **`.env.example`** - Template for environment setup
- **`vite.config.ts`** - Proxy configuration for development

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

## Switching Between Modes

### Local State Mode (Current Default)
```typescript
// In src/context/KanbanContext.tsx
const USE_API = false;
```

### API Mode (When Backend is Ready)
```typescript
// In src/context/KanbanContext.tsx
const USE_API = true;
```

## API Endpoints

The frontend expects the following REST API endpoints:

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get single board
- `POST /api/boards` - Create board
- `PATCH /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `PATCH /api/boards/:id/star` - Toggle star
- `PATCH /api/boards/:id/view` - Mark as viewed

### Columns
- `GET /api/boards/:boardId/columns` - Get columns for board
- `GET /api/columns/:id` - Get single column
- `POST /api/columns` - Create column
- `PATCH /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `PATCH /api/boards/:boardId/columns/reorder` - Reorder columns

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/boards/:boardId/tasks` - Get tasks for board
- `GET /api/columns/:columnId/tasks` - Get tasks for column
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/move` - Move task to different column
- `DELETE /api/tasks/:id` - Delete task

## Request/Response Formats

### Board
```typescript
{
  id: string;
  title: string;
  description: string;
  color: string;
  lastUpdated: number;
  isStarred?: boolean;
  lastViewed?: number;
}
```

### Column
```typescript
{
  id: string;
  boardId: string;
  title: string;
  order: number;
}
```

### Task
```typescript
{
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}
```

## Features

### ✅ Implemented

1. **Axios HTTP Client**
   - Configured with base URL and timeout
   - Request/response interceptors
   - Authentication token support
   - Error handling

2. **API Service Layer**
   - Clean separation of concerns
   - Type-safe API calls
   - Organized by resource (boards, columns, tasks)

3. **Loading & Error States**
   - Global loading state in KanbanContext
   - Error state management
   - Custom hooks for API operations

4. **Development Proxy**
   - Vite proxy configured for `/api` routes
   - Avoids CORS issues during development

5. **Dual-Mode Support**
   - Easy toggle between local and API mode
   - No code changes needed in components
   - Backward compatible

### 🔄 Async Operations

All CRUD operations are now async:

```typescript
// Before (sync)
addBoard(board);

// After (async)
await addBoard(board);
```

Components using these operations should handle promises:

```typescript
const handleCreateBoard = async () => {
  try {
    await addBoard(newBoard);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

## Development Workflow

### 1. Current State (Local Mode)
```bash
npm run dev
# App runs with local state, no backend needed
```

### 2. When Backend is Ready

**Step 1:** Start backend server
```bash
cd ../backend
npm start  # Should run on http://localhost:3000
```

**Step 2:** Update frontend configuration
```typescript
// src/context/KanbanContext.tsx
const USE_API = true;  // Enable API mode
```

**Step 3:** Start frontend
```bash
npm run dev
# App now connects to backend API
```

## Authentication

The API client is configured to support JWT authentication:

```typescript
// Token is automatically added to requests
localStorage.setItem('auth_token', 'your-jwt-token');

// Token is removed on logout
localStorage.removeItem('auth_token');
```

## Error Handling

### API Errors
```typescript
try {
  await api.boards.create(newBoard);
} catch (error) {
  if (error.response) {
    // Server error (4xx, 5xx)
    console.error('Server error:', error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network error');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

### Global Error State
```typescript
const { error, loading } = useKanban();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```

## Testing API Integration

### Using Local Backend
1. Ensure backend is running on `http://localhost:3000`
2. Set `USE_API = true`
3. Test all CRUD operations

### Using Mock API
You can use tools like:
- **json-server** - Quick REST API
- **MSW** (Mock Service Worker) - API mocking
- **Postman Mock Server** - Cloud-based mocking

## Next Steps for Backend Developer

1. **Create Express Server**
   - Set up routes matching the API endpoints above
   - Implement CORS middleware
   - Add body-parser for JSON

2. **Database Setup**
   - Create PostgreSQL schema
   - Set up migrations
   - Implement models

3. **API Implementation**
   - Implement all endpoints listed above
   - Add validation
   - Add error handling

4. **Testing**
   - Test each endpoint with Postman/Insomnia
   - Verify request/response formats match TypeScript types
   - Test CORS configuration

## Troubleshooting

### CORS Errors
- Ensure backend has CORS enabled
- Check Vite proxy configuration
- Verify API URL in `.env`

### Type Errors
- Ensure response data matches TypeScript interfaces
- Check API service type definitions
- Validate request payloads

### Network Errors
- Verify backend is running
- Check API URL configuration
- Test endpoints with curl/Postman

## Additional Resources

- [Axios Documentation](https://axios-http.com/)
- [Vite Proxy Guide](https://vitejs.dev/config/server-options.html#server-proxy)
- [React Context API](https://react.dev/reference/react/useContext)
