#!/bin/bash
set -e

# Configuration
AWS_REGION="${AWS_REGION:-ap-southeast-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-590183822512}"
ECR_BACKEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/vpbank-kmult-backend"
ECR_FRONTEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/vpbank-kmult-frontend"
CLUSTER_NAME="vpbank-kmult-cluster"
SERVICE_NAME="vpbank-kmult-service"

echo "🚀 VPBank K-MULT Production Deployment"
echo "========================================"

# 1. Build images
echo "📦 Building production images..."
docker build -f src/backend/Dockerfile.prod -t vpbank-kmult-backend:latest src/backend
docker build -f src/frontend/Dockerfile.prod -t vpbank-kmult-frontend:latest src/frontend

# 2. Tag images
echo "🏷️  Tagging images..."
docker tag vpbank-kmult-backend:latest $ECR_BACKEND:latest
docker tag vpbank-kmult-backend:latest $ECR_BACKEND:$(date +%Y%m%d-%H%M%S)
docker tag vpbank-kmult-frontend:latest $ECR_FRONTEND:latest
docker tag vpbank-kmult-frontend:latest $ECR_FRONTEND:$(date +%Y%m%d-%H%M%S)

# 3. Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 4. Push images
echo "⬆️  Pushing images to ECR..."
docker push $ECR_BACKEND:latest
docker push $ECR_BACKEND:$(date +%Y%m%d-%H%M%S)
docker push $ECR_FRONTEND:latest
docker push $ECR_FRONTEND:$(date +%Y%m%d-%H%M%S)

# 5. Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $AWS_REGION

# 6. Wait for deployment
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}' \
    --output table
