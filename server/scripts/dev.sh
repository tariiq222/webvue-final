#!/bin/bash

# 🚀 Development Setup Script
# سكريبت إعداد التطوير
#
# Complete development environment setup for WebCore server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the server directory."
    exit 1
fi

print_status "🚀 Setting up WebCore Development Environment..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

print_success "Node.js version check passed: $NODE_VERSION"

# Install dependencies
print_status "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_success ".env file created. Please update it with your configuration."
else
    print_success ".env file already exists."
fi

# Create necessary directories
print_status "📁 Creating necessary directories..."
mkdir -p storage/uploads
mkdir -p storage/plugins
mkdir -p logs

print_success "Directories created successfully."

# Check PostgreSQL connection
print_status "🗄️ Checking database connection..."
if command -v psql &> /dev/null; then
    # Try to connect to PostgreSQL
    if psql -h localhost -U webcore -d webcore_dev -c "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful."
    else
        print_warning "Could not connect to database. Please ensure PostgreSQL is running and configured."
        print_status "Creating database if it doesn't exist..."
        createdb -h localhost -U webcore webcore_dev 2>/dev/null || true
        createdb -h localhost -U webcore webcore_test 2>/dev/null || true
    fi
else
    print_warning "PostgreSQL client not found. Please install PostgreSQL."
fi

# Generate Prisma client
print_status "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "🗄️ Running database migrations..."
npx prisma migrate dev --name init || print_warning "Migration failed. Database might not be available."

# Seed database
print_status "🌱 Seeding database..."
npm run db:seed || print_warning "Seeding failed. Database might not be available."

# Run type checking
print_status "🔍 Running type checking..."
npm run type-check

# Run linting
print_status "🧹 Running code linting..."
npm run lint

print_success "🎉 Development environment setup complete!"
print_status "📋 Next steps:"
echo "  1. Update .env file with your configuration"
echo "  2. Ensure PostgreSQL is running"
echo "  3. Run 'npm run dev' to start the development server"
echo "  4. Visit http://localhost:3000/health to check server status"
echo "  5. Visit http://localhost:3000/api-docs for API documentation"

print_status "🔧 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm test             - Run tests"
echo "  npm run lint         - Run linting"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:migrate   - Run database migrations"
echo "  npm run db:seed      - Seed database with initial data"
