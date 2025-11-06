# AWS Deployment Guide - VPBank K-MULT Agent Studio

## 🚀 Quick Deployment

### Prerequisites
- AWS CLI configured with credentials
- Docker installed and running
- Images already built locally

### Current AWS Configuration
- **Account ID**: 590183822512
- **Region**: ap-southeast-1 (Singapore)
- **User**: ndthi

---

## 📦 Step 1: Push Images to ECR

```bash
cd /home/ubuntu/multi-agent-hackathon
./deploy-to-aws.sh ap-southeast-1
```

This script will:
1. Create ECR repositories
2. Login to ECR
3. Tag and push backend image
4. Tag and push frontend image
5. Create ECS cluster
6. Create CloudWatch log groups

---

## 🏗️ Step 2: Create ECS Task Execution Role (if not exists)

```bash
# Check if role exists
aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null

# If not exists, create it
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach required policies
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

---

## 📋 Step 3: Register ECS Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region ap-southeast-1
```

---

## 🌐 Step 4: Create VPC and Security Groups

### Option A: Use Default VPC (Quick)

```bash
# Get default VPC
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region ap-southeast-1)

# Get subnets
SUBNET_1=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[0].SubnetId" --output text --region ap-southeast-1)
SUBNET_2=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[1].SubnetId" --output text --region ap-southeast-1)

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name vpbank-kmult-sg \
  --description "VPBank K-MULT Security Group" \
  --vpc-id $VPC_ID \
  --region ap-southeast-1 \
  --query 'GroupId' --output text)

# Allow inbound traffic
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0 \
  --region ap-southeast-1

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0 \
  --region ap-southeast-1

echo "VPC_ID: $VPC_ID"
echo "SUBNET_1: $SUBNET_1"
echo "SUBNET_2: $SUBNET_2"
echo "SG_ID: $SG_ID"
```

### Option B: Create New VPC (Production)

```bash
# Use CloudFormation or Terraform
# See deployments/infrastructure/ for templates
```

---

## 🚀 Step 5: Create ECS Service

```bash
aws ecs create-service \
  --cluster vpbank-kmult-cluster \
  --service-name vpbank-kmult-service \
  --task-definition vpbank-kmult-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --region ap-southeast-1
```

---

## 🔍 Step 6: Get Service Status

```bash
# Get service status
aws ecs describe-services \
  --cluster vpbank-kmult-cluster \
  --services vpbank-kmult-service \
  --region ap-southeast-1

# Get task details
aws ecs list-tasks \
  --cluster vpbank-kmult-cluster \
  --service-name vpbank-kmult-service \
  --region ap-southeast-1

# Get task public IP
TASK_ARN=$(aws ecs list-tasks --cluster vpbank-kmult-cluster --service-name vpbank-kmult-service --region ap-southeast-1 --query 'taskArns[0]' --output text)

aws ecs describe-tasks \
  --cluster vpbank-kmult-cluster \
  --tasks $TASK_ARN \
  --region ap-southeast-1 \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text | xargs -I {} aws ec2 describe-network-interfaces \
  --network-interface-ids {} \
  --region ap-southeast-1 \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text
```

---

## 🌐 Step 7: Access Application

Once deployed, access via:
- **Backend API**: `http://<PUBLIC_IP>:8080`
- **Frontend**: `http://<PUBLIC_IP>:3000`
- **API Docs**: `http://<PUBLIC_IP>:8080/docs`

---

## 🔧 Alternative: Deploy with Application Load Balancer

### Create ALB

```bash
# Create target groups
aws elbv2 create-target-group \
  --name vpbank-backend-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /mutil_agent/public/api/v1/health-check/health \
  --region ap-southeast-1

aws elbv2 create-target-group \
  --name vpbank-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --region ap-southeast-1

# Create ALB
aws elbv2 create-load-balancer \
  --name vpbank-kmult-alb \
  --subnets $SUBNET_1 $SUBNET_2 \
  --security-groups $SG_ID \
  --region ap-southeast-1

# Create listeners and rules
# (Additional configuration needed)
```

---

## 📊 Monitoring & Logs

### View CloudWatch Logs

```bash
# Backend logs
aws logs tail /ecs/vpbank-kmult-backend --follow --region ap-southeast-1

# Frontend logs
aws logs tail /ecs/vpbank-kmult-frontend --follow --region ap-southeast-1
```

### CloudWatch Metrics

```bash
# View ECS metrics in CloudWatch console
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=vpbank-kmult-service Name=ClusterName,Value=vpbank-kmult-cluster \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region ap-southeast-1
```

---

## 🔄 Update Deployment

```bash
# Rebuild and push new images
cd /home/ubuntu/multi-agent-hackathon
docker compose build
./deploy-to-aws.sh ap-southeast-1

# Force new deployment
aws ecs update-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --force-new-deployment \
  --region ap-southeast-1
```

---

## 🧹 Cleanup

```bash
# Delete ECS service
aws ecs delete-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --force \
  --region ap-southeast-1

# Delete ECS cluster
aws ecs delete-cluster \
  --cluster vpbank-kmult-cluster \
  --region ap-southeast-1

# Delete ECR repositories
aws ecr delete-repository \
  --repository-name vpbank-kmult-backend \
  --force \
  --region ap-southeast-1

aws ecr delete-repository \
  --repository-name vpbank-kmult-frontend \
  --force \
  --region ap-southeast-1

# Delete security group
aws ec2 delete-security-group \
  --group-id $SG_ID \
  --region ap-southeast-1

# Delete log groups
aws logs delete-log-group \
  --log-group-name /ecs/vpbank-kmult-backend \
  --region ap-southeast-1

aws logs delete-log-group \
  --log-group-name /ecs/vpbank-kmult-frontend \
  --region ap-southeast-1
```

---

## 💰 Cost Estimation

### Monthly Costs (ap-southeast-1)
- **ECS Fargate**: ~$30-50 (1 task, 1 vCPU, 2GB RAM)
- **ECR Storage**: ~$1-5 (image storage)
- **CloudWatch Logs**: ~$5-10 (log storage)
- **Data Transfer**: ~$10-20 (depends on usage)
- **ALB** (optional): ~$20-30

**Total**: ~$66-115/month for basic deployment

---

## 🔐 Security Best Practices

1. **Use Secrets Manager** for sensitive data
2. **Enable VPC Flow Logs**
3. **Use private subnets** for production
4. **Enable AWS WAF** on ALB
5. **Configure IAM roles** with least privilege
6. **Enable CloudTrail** for audit logs
7. **Use HTTPS** with ACM certificates

---

## 📚 Additional Resources

- [ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Fargate Pricing](https://aws.amazon.com/fargate/pricing/)
- [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
- [Project README](./README.md)
- [API Documentation](./API_ENDPOINTS.md)

---

## 🆘 Troubleshooting

### Task fails to start
```bash
# Check task stopped reason
aws ecs describe-tasks --cluster vpbank-kmult-cluster --tasks <TASK_ARN> --region ap-southeast-1
```

### Cannot pull image
```bash
# Verify ECR permissions
aws ecr get-login-password --region ap-southeast-1
```

### Health check failing
```bash
# Check logs
aws logs tail /ecs/vpbank-kmult-backend --follow --region ap-southeast-1
```

---

**Last Updated**: 2025-11-05
**Deployment Region**: ap-southeast-1
**Account**: 590183822512
