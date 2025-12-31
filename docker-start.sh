#!/bin/bash

echo "🐳 Kanban App - Docker Quick Start"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.docker .env
    
    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 24)
    JWT_SECRET=$(openssl rand -base64 48)
    
    # Update .env file
    sed -i "s/your_secure_password_here/$DB_PASSWORD/" .env
    sed -i "s/your-super-secret-jwt-key-change-this-in-production-min-32-chars/$JWT_SECRET/" .env
    
    echo "✅ .env file created with secure random passwords"
    echo ""
fi

# Ask user if they want to build and start
read -p "Do you want to build and start the application? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏗️  Building Docker images..."
    docker-compose build
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build images"
        exit 1
    fi
    
    echo ""
    echo "🚀 Starting services..."
    docker-compose up -d
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start services"
        exit 1
    fi
    
    echo ""
    echo "⏳ Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    
    echo ""
    echo "✅ Kanban App is running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend:  http://localhost"
    echo "   Backend:   http://localhost:3000"
    echo "   Health:    http://localhost:3000/health"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Open http://localhost in your browser"
    echo "   2. Register a new account"
    echo "   3. Start creating boards and tasks!"
    echo ""
    echo "📚 Useful commands:"
    echo "   View logs:        docker-compose logs -f"
    echo "   Stop services:    docker-compose down"
    echo "   Restart:          docker-compose restart"
    echo ""
    echo "📖 See DOCKER_GUIDE.md for detailed documentation"
fi
