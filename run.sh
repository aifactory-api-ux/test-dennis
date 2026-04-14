#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists, create from example if not
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status ".env created from .env.example"
    else
        print_error ".env.example not found. Cannot create .env"
        exit 1
    fi
else
    print_status ".env already exists, skipping creation"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_status "Docker is available"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Build all services
print_status "Building all services..."
docker-compose build --no-cache

# Start all services
print_status "Starting all services..."
docker-compose up -d

# Function to wait for a service to be healthy
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy"; then
            print_status "$service is healthy"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$service failed to become healthy"
    return 1
}

# Wait for all services to be healthy
print_status "Waiting for all services to be ready..."
services=("postgres" "redis" "auth-service" "opportunity-service" "interaction-service" "gateway" "frontend")

for service in "${services[@]}"; do
    if ! wait_for_service "$service"; then
        print_error "Service $service failed to start"
        docker-compose logs --tail=50 $service
        exit 1
    fi
done

print_status "All services are healthy!"

# Print access information
FRONTEND_PORT=${FRONTEND_PORT:-3000}
AUTH_PORT=${AUTH_SERVICE_PORT:-8001}
OPPORTUNITY_PORT=${OPPORTUNITY_SERVICE_PORT:-8002}
INTERACTION_PORT=${INTERACTION_SERVICE_PORT:-8003}

echo ""
echo "=========================================="
echo -e "${GREEN}🚀 test Dennis is running!${NC}"
echo "=========================================="
echo ""
echo -e "Frontend:    ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "Auth API:    http://localhost:${AUTH_PORT}"
echo -e "Opportunity: http://localhost:${OPPORTUNITY_PORT}"
echo -e "Interaction: http://localhost:${INTERACTION_PORT}"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      ./run.sh stop"
echo ""
