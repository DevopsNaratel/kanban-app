#!/bin/bash

echo "🚀 Setting up Kanban Backend"
echo "============================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql"
    echo "   macOS: brew install postgresql"
    echo "   Fedora: sudo dnf install postgresql-server"
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and update your database credentials"
    echo ""
fi

# Ask if user wants to setup database
read -p "Do you want to setup the database now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📊 Setting up database..."
    
    # Source .env to get database name
    source .env
    
    # Create database
    echo "Creating database: $DB_NAME"
    createdb -U $DB_USER $DB_NAME 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Database created"
    else
        echo "⚠️  Database might already exist (this is okay)"
    fi
    
    # Run schema
    echo "Running database schema..."
    psql -U $DB_USER -d $DB_NAME -f database/schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema created"
    else
        echo "❌ Failed to create database schema"
        echo "   Please run manually: psql -U $DB_USER -d $DB_NAME -f database/schema.sql"
    fi
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials (if not done)"
echo "2. Start the server: npm run dev"
echo "3. Test the API: curl http://localhost:3000/health"
echo ""
echo "📚 See backend/README.md for full documentation"
