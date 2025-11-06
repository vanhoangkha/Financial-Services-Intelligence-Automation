#!/bin/bash
set -e

# VPBank K-MULT - Quick AWS Deployment
REGION=${1:-"ap-southeast-1"}
STACK_NAME="vpbank-kmult-stack"
ECR_REPO_BACKEND="vpbank-kmult-backend"
ECR_REPO_FRONTEND="vpbank-kmult-frontend"

echo "🚀 Deploying VPBank K-MULT to AWS"
echo "Region: $REGION"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account: $ACCOUNT_ID"

# 1. Create ECR repositories
echo "📦 Creating ECR repositories..."
aws ecr create-repository --repository-name $ECR_REPO_BACKEND --region $REGION 2>/dev/null || echo "Backend repo exists"
aws ecr create-repository --repository-name $ECR_REPO_FRONTEND --region $REGION 2>/dev/null || echo "Frontend repo exists"

# 2. Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 3. Build and push backend
echo "🔨 Building and pushing backend..."
cd /home/ubuntu/multi-agent-hackathon
docker tag mutil-agent-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_BACKEND:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_BACKEND:latest

# 4. Build and push frontend
echo "🔨 Building and pushing frontend..."
docker tag mutil-agent-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest

# 5. Create ECS cluster
echo "🏗️ Creating ECS cluster..."
aws ecs create-cluster --cluster-name vpbank-kmult-cluster --region $REGION 2>/dev/null || echo "Cluster exists"

# 6. Create CloudWatch log groups
echo "📊 Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name /ecs/vpbank-kmult-backend --region $REGION 2>/dev/null || echo "Backend log group exists"
aws logs create-log-group --log-group-name /ecs/vpbank-kmult-frontend --region $REGION 2>/dev/null || echo "Frontend log group exists"

echo ""
echo "✅ Images pushed to ECR successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create ECS Task Definition"
echo "2. Create ECS Service"
echo "3. Configure Load Balancer"
echo ""
echo "ECR Backend: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_BACKEND:latest"
echo "ECR Frontend: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest"
