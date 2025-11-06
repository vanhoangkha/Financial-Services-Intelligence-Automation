# VPBank K-MULT Production Deployment Guide

## Tối Ưu Hóa Production

### 1. Infrastructure Setup

```bash
# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name vpbank-kmult-prod \
  --template-body file://infrastructure-prod.yml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region ap-southeast-1

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name vpbank-kmult-prod \
  --region ap-southeast-1
```

### 2. ECR Repositories

```bash
# Create ECR repositories
aws ecr create-repository \
  --repository-name vpbank-kmult-backend \
  --region ap-southeast-1

aws ecr create-repository \
  --repository-name vpbank-kmult-frontend \
  --region ap-southeast-1

# Enable image scanning
aws ecr put-image-scanning-configuration \
  --repository-name vpbank-kmult-backend \
  --image-scanning-configuration scanOnPush=true \
  --region ap-southeast-1

aws ecr put-image-scanning-configuration \
  --repository-name vpbank-kmult-frontend \
  --image-scanning-configuration scanOnPush=true \
  --region ap-southeast-1
```

### 3. Build & Deploy

```bash
# Set environment variables
export AWS_REGION=ap-southeast-1
export AWS_ACCOUNT_ID=590183822512

# Run production deployment
./deploy-production.sh
```

### 4. ECS Service Setup

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition-prod.json \
  --region ap-southeast-1

# Create ECS service
aws ecs create-service \
  --cluster vpbank-kmult-cluster \
  --service-name vpbank-kmult-service \
  --task-definition vpbank-kmult-prod \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8080" \
  --region ap-southeast-1
```

## Tối Ưu Hóa Đã Thực Hiện

### Backend Optimizations

1. **Multi-stage Docker Build**
   - Giảm image size từ ~1.5GB xuống ~500MB
   - Tách build dependencies và runtime dependencies
   - Sử dụng Python slim base image

2. **Gunicorn với Uvicorn Workers**
   - 4 workers cho high concurrency
   - Graceful shutdown (30s timeout)
   - Request timeout 120s

3. **Security Hardening**
   - Non-root user (appuser:1000)
   - Minimal runtime dependencies
   - Health checks với retry logic

4. **Resource Limits**
   - CPU: 1.5 vCPU (1536 CPU units)
   - Memory: 3GB
   - File descriptors: 65536

### Frontend Optimizations

1. **Production Build**
   - Code splitting và tree shaking
   - Minification và compression
   - Cache busting với hashed filenames

2. **Nginx Optimizations**
   - Gzip compression (level 6)
   - Static asset caching (1 year)
   - Security headers
   - Worker connections: 2048

3. **Performance**
   - Sendfile enabled
   - TCP optimizations (nopush, nodelay)
   - Keepalive connections

### Infrastructure Optimizations

1. **High Availability**
   - Multi-AZ deployment (2 AZs)
   - Auto-scaling enabled
   - Health checks on all levels

2. **Network Architecture**
   - Public subnets for ALB
   - Private subnets for ECS tasks
   - NAT Gateway for outbound traffic

3. **Monitoring & Logging**
   - CloudWatch Logs (7 days retention)
   - Container insights enabled
   - Health check endpoints

4. **Cost Optimization**
   - Fargate Spot (50% weight)
   - Right-sized resources
   - Log retention policies

## Performance Metrics

### Expected Performance

- **Response Time**: < 2s (p95)
- **Throughput**: 1,000+ req/min
- **Availability**: 99.9%
- **Container Startup**: < 60s

### Resource Usage

- **Backend**: 1.5 vCPU, 3GB RAM
- **Frontend**: 0.5 vCPU, 1GB RAM
- **Total Cost**: ~$150-200/month

## Monitoring

### Health Checks

```bash
# Backend health
curl http://your-alb-dns/mutil_agent/public/api/v1/health-check/health

# Frontend health
curl http://your-alb-dns/health
```

### CloudWatch Metrics

```bash
# View service metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=vpbank-kmult-service \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average \
  --region ap-southeast-1
```

### Logs

```bash
# Backend logs
aws logs tail /ecs/vpbank-kmult-backend --follow --region ap-southeast-1

# Frontend logs
aws logs tail /ecs/vpbank-kmult-frontend --follow --region ap-southeast-1
```

## Rollback Strategy

```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --task-definition vpbank-kmult-prod:PREVIOUS_REVISION \
  --force-new-deployment \
  --region ap-southeast-1
```

## Security Checklist

- [x] Non-root containers
- [x] Image scanning enabled
- [x] Security groups configured
- [x] Private subnets for tasks
- [x] IAM roles with least privilege
- [x] Secrets in AWS Secrets Manager
- [x] HTTPS/TLS enabled (ALB)
- [x] Security headers configured

## Maintenance

### Update Application

```bash
# Build and push new images
./deploy-production.sh

# ECS will automatically deploy new version
```

### Scale Service

```bash
# Scale up
aws ecs update-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --desired-count 4 \
  --region ap-southeast-1

# Scale down
aws ecs update-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --desired-count 1 \
  --region ap-southeast-1
```

## Troubleshooting

### Container Won't Start

```bash
# Check task logs
aws ecs describe-tasks \
  --cluster vpbank-kmult-cluster \
  --tasks TASK_ID \
  --region ap-southeast-1

# Check CloudWatch logs
aws logs tail /ecs/vpbank-kmult-backend --follow
```

### High CPU/Memory

```bash
# Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=vpbank-kmult-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average Maximum \
  --region ap-southeast-1
```

## Support

For issues or questions:
- Check CloudWatch Logs
- Review ECS service events
- Contact DevOps team
