#!/bin/bash

# 🧪 Test Runner Script
# سكريبت تشغيل الاختبارات
#
# Comprehensive test runner for the WebCore server

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

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Set test environment
export NODE_ENV=test
export JWT_SECRET="test-jwt-secret-for-testing-only"
export REFRESH_TOKEN_SECRET="test-refresh-secret-for-testing-only"
export DATABASE_URL="postgresql://webcore:password@localhost:5432/webcore_test"

print_status "Starting WebCore Server Tests..."
print_status "Environment: $NODE_ENV"
print_status "Database: $DATABASE_URL"

# Run different types of tests based on argument
case "${1:-all}" in
    "unit")
        print_status "Running unit tests..."
        npm run test -- --testPathPattern="tests/utils"
        ;;
    "integration")
        print_status "Running integration tests..."
        npm run test -- --testPathPattern="tests/auth|tests/health"
        ;;
    "auth")
        print_status "Running authentication tests..."
        npm run test -- --testPathPattern="tests/auth"
        ;;
    "health")
        print_status "Running health check tests..."
        npm run test -- --testPathPattern="tests/health"
        ;;
    "coverage")
        print_status "Running tests with coverage..."
        npm run test:coverage
        ;;
    "watch")
        print_status "Running tests in watch mode..."
        npm run test:watch
        ;;
    "all"|*)
        print_status "Running all tests..."
        npm test
        ;;
esac

if [ $? -eq 0 ]; then
    print_success "All tests passed! ✅"
else
    print_error "Some tests failed! ❌"
    exit 1
fi
