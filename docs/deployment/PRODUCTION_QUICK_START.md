# 🚀 VPBank K-MULT Production Quick Start

## ✅ Pre-flight Check
```bash
./check-production.sh
```

## 📋 Deployment Commands

### 1. Deploy Infrastructure (One-time)
```bash
aws cloudformation create-stack \
  --stack-name vpbank-kmult-prod \
  --template-body file://infrastructure-prod.yml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region ap-southeast-1

# Wait for completion (~10 minutes)
aws cloudformation wait stack-create-complete \
  --stack-name vpbank-kmult-prod \
  --region ap-southeast-1
```

### 2. Create ECR Repositories (One-time)
```bash
aws ecr create-repository --repository-name vpbank-kmult-backend --region ap-southeast-1
aws ecr create-repository --repository-name vpbank-kmult-frontend --region ap-southeast-1
```

### 3. Deploy Application
```bash
export AWS_REGION=ap-southeast-1
export AWS_ACCOUNT_ID=590183822512

./deploy-production.sh
```

### 4. Setup Auto-scaling (One-time)
```bash
./setup-autoscaling.sh
```

### 5. Monitor
```bash
./monitor-production.sh
```

## 🔧 Common Operations

### Update Application
```bash
./deploy-production.sh
```

### Scale Service
```bash
# Scale to 5 tasks
aws ecs update-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --desired-count 5 \
  --region ap-southeast-1
```

### View Logs
```bash
# Backend logs
aws logs tail /ecs/vpbank-kmult-backend --follow --region ap-southeast-1

# Frontend logs
aws logs tail /ecs/vpbank-kmult-frontend --follow --region ap-southeast-1
```

### Rollback
```bash
aws ecs update-service \
  --cluster vpbank-kmult-cluster \
  --service vpbank-kmult-service \
  --task-definition vpbank-kmult-prod:PREVIOUS_REVISION \
  --force-new-deployment \
  --region ap-southeast-1
```

## 📊 Health Checks

### Service Status
```bash
aws ecs describe-services \
  --cluster vpbank-kmult-cluster \
  --services vpbank-kmult-service \
  --region ap-southeast-1
```

### Application Health
```bash
# Get ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --region ap-southeast-1 \
  --query 'LoadBalancers[?contains(LoadBalancerName, `vpbank`)].DNSName' \
  --output text)

# Test backend
curl http://$ALB_DNS/mutil_agent/public/api/v1/health-check/health

# Test frontend
curl http://$ALB_DNS/health
```

## 💰 Cost Estimate

| Component | Monthly Cost |
|-----------|--------------|
| Fargate (2-4 tasks) | $120-150 |
| ALB | $20-25 |
| NAT Gateway | $35-45 |
| CloudWatch | $10-15 |
| Data Transfer | $10-20 |
| **Total** | **$195-255** |

## 🎯 Performance Targets

- Response Time: < 1.5s (p95)
- Throughput: 1500+ req/min
- Availability: 99.95%
- Auto-scale: 2-10 tasks

## 📞 Support

- Full Guide: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
- Optimization: [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)
- Check Status: `./check-production.sh`
- Monitor: `./monitor-production.sh`
