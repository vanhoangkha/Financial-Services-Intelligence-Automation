#!/bin/bash

###############################################################################
# VPBank K-MULT Agent Studio - AWS ECS Deployment Script
#
# This script deploys the application to AWS ECS (Fargate)
#
# Prerequisites:
# - AWS CLI configured with appropriate credentials
# - Docker installed and running
# - ECR repositories created
# - ECS cluster created
#
# Usage: ./deploy-to-aws.sh [environment]
# Example: ./deploy-to-aws.sh production
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-590183822512}"
ENVIRONMENT="${1:-production}"
CLUSTER_NAME="vpbank-kmult-cluster"

# Image details
BACKEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/vpbank-kmult-backend"
FRONTEND_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/vpbank-kmult-frontend"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     VPBank K-MULT Agent Studio - AWS Deployment             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Environment:${NC} $ENVIRONMENT"
echo -e "${GREEN}Region:${NC} $AWS_REGION"
echo -e "${GREEN}Account:${NC} $AWS_ACCOUNT_ID"
echo -e "${GREEN}Cluster:${NC} $CLUSTER_NAME"
echo ""

# Step 1: Verify AWS credentials
echo -e "${YELLOW}[1/7] Verifying AWS credentials...${NC}"
if ! aws sts get-caller-identity --region $AWS_REGION > /dev/null 2>&1; then
    echo -e "${RED}Error: AWS credentials not configured properly${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials verified${NC}"
echo ""

# Step 2: Login to ECR
echo -e "${YELLOW}[2/7] Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}✓ Logged in to ECR${NC}"
echo ""

# Step 3: Build Docker images
echo -e "${YELLOW}[3/7] Building Docker images...${NC}"

echo -e "${BLUE}Building backend image...${NC}"
docker build -t vpbank-kmult-backend:${IMAGE_TAG} \
    -f ./src/backend/Dockerfile.prod \
    ./src/backend

echo -e "${BLUE}Building frontend image...${NC}"
docker build -t vpbank-kmult-frontend:${IMAGE_TAG} \
    -f ./src/frontend/Dockerfile.prod \
    ./src/frontend

echo -e "${GREEN}✓ Docker images built successfully${NC}"
echo ""

# Step 4: Tag images for ECR
echo -e "${YELLOW}[4/7] Tagging images for ECR...${NC}"
docker tag vpbank-kmult-backend:${IMAGE_TAG} ${BACKEND_REPO}:${IMAGE_TAG}
docker tag vpbank-kmult-frontend:${IMAGE_TAG} ${FRONTEND_REPO}:${IMAGE_TAG}
echo -e "${GREEN}✓ Images tagged${NC}"
echo ""

# Step 5: Push images to ECR
echo -e "${YELLOW}[5/7] Pushing images to ECR...${NC}"

echo -e "${BLUE}Pushing backend image...${NC}"
docker push ${BACKEND_REPO}:${IMAGE_TAG}

echo -e "${BLUE}Pushing frontend image...${NC}"
docker push ${FRONTEND_REPO}:${IMAGE_TAG}

echo -e "${GREEN}✓ Images pushed to ECR${NC}"
echo ""

# Step 6: Update ECS services (if they exist)
echo -e "${YELLOW}[6/7] Checking ECS services...${NC}"

# Check if services exist
BACKEND_SERVICE=$(aws ecs list-services --cluster $CLUSTER_NAME --region $AWS_REGION | grep "vpbank-kmult-backend" || echo "")
FRONTEND_SERVICE=$(aws ecs list-services --cluster $CLUSTER_NAME --region $AWS_REGION | grep "vpbank-kmult-frontend" || echo "")

if [ -n "$BACKEND_SERVICE" ]; then
    echo -e "${BLUE}Updating backend service...${NC}"
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service vpbank-kmult-backend \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    echo -e "${GREEN}✓ Backend service updated${NC}"
else
    echo -e "${YELLOW}⚠ Backend service not found. You'll need to create it manually.${NC}"
fi

if [ -n "$FRONTEND_SERVICE" ]; then
    echo -e "${BLUE}Updating frontend service...${NC}"
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service vpbank-kmult-frontend \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    echo -e "${GREEN}✓ Frontend service updated${NC}"
else
    echo -e "${YELLOW}⚠ Frontend service not found. You'll need to create it manually.${NC}"
fi
echo ""

# Step 7: Display deployment information
echo -e "${YELLOW}[7/7] Deployment Summary${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✓ Docker images built and pushed successfully${NC}"
echo ""
echo -e "${BLUE}Backend Image:${NC} ${BACKEND_REPO}:${IMAGE_TAG}"
echo -e "${BLUE}Frontend Image:${NC} ${FRONTEND_REPO}:${IMAGE_TAG}"
echo ""

# Get service information if they exist
if [ -n "$BACKEND_SERVICE" ] && [ -n "$FRONTEND_SERVICE" ]; then
    echo -e "${BLUE}Checking service status...${NC}"
    echo ""

    # Wait a few seconds for deployment to start
    sleep 3

    echo -e "${GREEN}Backend Service:${NC}"
    aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services vpbank-kmult-backend \
        --region $AWS_REGION \
        --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
        --output table 2>/dev/null || echo "Service information unavailable"

    echo ""
    echo -e "${GREEN}Frontend Service:${NC}"
    aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services vpbank-kmult-frontend \
        --region $AWS_REGION \
        --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
        --output table 2>/dev/null || echo "Service information unavailable"

    echo ""
    echo -e "${BLUE}Monitor deployment:${NC}"
    echo "  aws ecs describe-services --cluster $CLUSTER_NAME --services vpbank-kmult-backend vpbank-kmult-frontend --region $AWS_REGION"

    echo ""
    echo -e "${BLUE}View logs:${NC}"
    echo "  aws logs tail /ecs/vpbank-kmult-backend --follow --region $AWS_REGION"
    echo "  aws logs tail /ecs/vpbank-kmult-frontend --follow --region $AWS_REGION"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""

# Display next steps
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Monitor the deployment status in AWS ECS Console"
echo "2. Check CloudWatch logs for any errors"
echo "3. Verify health checks are passing"
echo "4. Test the application endpoints"
echo ""

echo -e "${BLUE}AWS Console Links:${NC}"
echo "  ECS Cluster: https://console.aws.amazon.com/ecs/home?region=${AWS_REGION}#/clusters/${CLUSTER_NAME}"
echo "  ECR Repositories: https://console.aws.amazon.com/ecr/repositories?region=${AWS_REGION}"
echo "  CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION}#logsV2:log-groups"
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Deployment Script Completed! ✓                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
