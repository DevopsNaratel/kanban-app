#!/bin/bash

echo "🚀 Setting up Kanban App Frontend for API Integration"
echo "=================================================="
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit

echo "📦 Installing axios..."
npm install axios

if [ $? -eq 0 ]; then
    echo "✅ Axios installed successfully!"
else
    echo "❌ Failed to install axios. Please run manually: npm install axios"
    exit 1
fi

echo ""
echo "✅ Frontend is ready for API integration!"
echo ""
echo "Next steps:"
echo "1. Build the backend API (see BACKEND_API_SPEC.md)"
echo "2. Enable API mode in frontend/src/context/KanbanContext.tsx"
echo "   Change: const USE_API = false; → const USE_API = true;"
echo "3. Start backend: cd backend && npm start"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "📚 See frontend/API_INTEGRATION.md for detailed documentation"
