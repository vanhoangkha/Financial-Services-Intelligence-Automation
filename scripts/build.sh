#!/bin/bash

# VPBank K-MULT Agent Studio - Build Script
# Multi-Agent Hackathon 2025 - Group 181

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${PURPLE}$1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    VPBank K-MULT Agent Studio - Build System            ║
║    Enterprise Multi-Agent Banking Platform                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

BUILD_TYPE=${1:-"development"}
PUSH_TO_REGISTRY=${2:-"false"}

print_header "Build Configuration"
print_status "Build Type: $BUILD_TYPE"
print_status "Push to Registry: $PUSH_TO_REGISTRY"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

print_header "Building VPBank K-MULT Components..."

# Build Backend
print_header "Building Backend Multi-Agent Service..."
if [ -f "backend/Dockerfile" ]; then
    docker build -t vpbank-kmult-backend:latest \
                 -t vpbank-kmult-backend:$BUILD_TYPE \
                 -f backend/Dockerfile \
                 backend/
    print_status "Backend image built successfully"
else
    print_error "Backend Dockerfile not found"
    exit 1
fi

# Build Frontend
print_header "Building Frontend React Application..."
if [ -f "frontend/Dockerfile" ]; then
    docker build -t vpbank-kmult-frontend:latest \
                 -t vpbank-kmult-frontend:$BUILD_TYPE \
                 -f frontend/Dockerfile \
                 frontend/
    print_status "Frontend image built successfully"
else
    print_error "Frontend Dockerfile not found"
    exit 1
fi

# Build Multi-Agent Service (if separate Dockerfile exists)
if [ -f "backend/app/mutil_agent/Dockerfile" ]; then
    print_header "Building Multi-Agent Service..."
    docker build -t vpbank-kmult-mutil-agent:latest \
                 -t vpbank-kmult-mutil-agent:$BUILD_TYPE \
                 -f backend/app/mutil_agent/Dockerfile \
                 backend/app/mutil_agent/
    print_status "Multi-Agent service image built successfully"
fi

print_header "Build Summary"
echo "================================"

# List built images
print_status "Built Docker Images:"
docker images | grep vpbank-kmult | while read line; do
    echo "  $line"
done

# Image sizes
print_header "Image Sizes:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep vpbank-kmult

# Push to registry if requested
if [ "$PUSH_TO_REGISTRY" = "true" ]; then
    print_header "Pushing Images to Registry..."
    
    # Check if registry is configured
    if [ -z "$DOCKER_REGISTRY" ]; then
        print_warning "DOCKER_REGISTRY environment variable not set"
        print_status "Skipping registry push"
    else
        # Tag and push images
        for image in vpbank-kmult-backend vpbank-kmult-frontend vpbank-kmult-mutil-agent; do
            if docker images | grep -q $image; then
                docker tag $image:latest $DOCKER_REGISTRY/$image:latest
                docker tag $image:$BUILD_TYPE $DOCKER_REGISTRY/$image:$BUILD_TYPE
                
                docker push $DOCKER_REGISTRY/$image:latest
                docker push $DOCKER_REGISTRY/$image:$BUILD_TYPE
                
                print_status "Pushed $image to registry"
            fi
        done
    fi
fi

print_success ""
print_success "Build completed successfully!"
print_success ""
print_success "Next Steps:"
print_success "1. Run './run.sh' to start the application"
print_success "2. Run './test.sh' to execute tests"
print_success "3. Run './deploy.sh' to deploy to AWS"
print_success ""
print_success "Built Components:"
print_success "   Backend Multi-Agent Service (FastAPI + 7 Agents)"
print_success "   Frontend React Application (Banking UI)"
print_success "   Multi-Agent Platform (ECS Fargate Ready)"
print_success ""
print_success "Banking Features Ready:"
print_success "   • Document Intelligence (OCR + Vietnamese NLP)"
print_success "   • Letter of Credit Processing (UCP 600)"
print_success "   • Credit Risk Analysis (Basel III)"
print_success "   • Compliance Validation (SBV + AML/CFT)"
print_success "   • Real-time Decision Making (Claude 3.7 Sonnet)"
