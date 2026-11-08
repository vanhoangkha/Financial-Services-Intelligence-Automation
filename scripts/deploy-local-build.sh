#!/bin/bash

# Local Docker build and push to ECR
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}VPBank K-MULT Local Build & Deploy${NC}"
echo "=================================================="

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="536697254280"
IMAGE_REPO_NAME="vpbank-kmult-backend"
IMAGE_TAG="local-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}Build Configuration:${NC}"
echo "• AWS Region: $AWS_REGION"
echo "• Account ID: $AWS_ACCOUNT_ID"
echo "• Repository: $IMAGE_REPO_NAME"
echo "• Image Tag: $IMAGE_TAG"
echo ""

# Navigate to project directory
cd /home/ubuntu/multi-agent-hackathon

# Step 1: Login to ECR
echo -e "${BLUE}Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

if [ $? -eq 0 ]; then
    echo -e "${GREEN}ECR login successful${NC}"
else
    echo -e "${RED}ECR login failed${NC}"
    exit 1
fi

# Step 2: Build Docker image
echo -e "${BLUE}Building Docker image...${NC}"
docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG -f backend/Dockerfile.prod backend/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Docker build successful${NC}"
else
    echo -e "${RED}Docker build failed${NC}"
    exit 1
fi

# Step 3: Tag image for ECR
echo -e "${BLUE}Tagging image for ECR...${NC}"
docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:latest

# Step 4: Push to ECR
echo -e "${BLUE}Pushing image to ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Image pushed successfully${NC}"
else
    echo -e "${RED}Image push failed${NC}"
    exit 1
fi

# Step 5: Get image details
echo -e "${BLUE}Image details:${NC}"
aws ecr describe-images --repository-name $IMAGE_REPO_NAME --image-ids imageTag=$IMAGE_TAG --region $AWS_REGION --query 'imageDetails[0].[imageTags[0],imagePushedAt,imageSizeInBytes]' --output table

# Step 6: Clean up local images (optional)
echo -e "${BLUE}Cleaning up local images...${NC}"
docker rmi $IMAGE_REPO_NAME:$IMAGE_TAG || true
docker rmi $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG || true

echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
echo "Summary:"
echo "• Image built and pushed to ECR"
echo "• Repository: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_REPO_NAME"
echo "• Tags: $IMAGE_TAG, latest"
echo ""
echo "Links:"
echo "• ECR Console: https://console.aws.amazon.com/ecr/repositories/private/$AWS_ACCOUNT_ID/$IMAGE_REPO_NAME"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "• Deploy to ECS or update existing service"
echo "• Run: aws ecs update-service --cluster your-cluster --service your-service --force-new-deployment"
