#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         VPBank K-MULT Production Readiness Check          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ $1"
        ((FAIL++))
    fi
}

# 1. Check files exist
echo "📁 Checking Production Files..."
[ -f "src/backend/Dockerfile.prod" ]; check "Backend Dockerfile.prod"
[ -f "src/frontend/Dockerfile.prod" ]; check "Frontend Dockerfile.prod"
[ -f "src/frontend/nginx.prod.conf" ]; check "Nginx production config"
[ -f "docker-compose.prod.yml" ]; check "Docker Compose production"
[ -f "ecs-task-definition-prod.json" ]; check "ECS task definition"
[ -f "infrastructure-prod.yml" ]; check "CloudFormation template"
[ -f "deploy-production.sh" ] && [ -x "deploy-production.sh" ]; check "Deploy script (executable)"
[ -f "setup-autoscaling.sh" ] && [ -x "setup-autoscaling.sh" ]; check "Autoscaling script (executable)"
[ -f "monitor-production.sh" ] && [ -x "monitor-production.sh" ]; check "Monitoring script (executable)"
[ -f "PRODUCTION_DEPLOYMENT.md" ]; check "Deployment documentation"
[ -f "OPTIMIZATION_SUMMARY.md" ]; check "Optimization summary"

echo ""
echo "🔍 Validating Configurations..."

# 2. Validate JSON
python3 -m json.tool ecs-task-definition-prod.json > /dev/null 2>&1
check "ECS task definition JSON syntax"

python3 -m json.tool docker-compose.prod.yml > /dev/null 2>&1 || \
python3 -c "import yaml; yaml.safe_load(open('docker-compose.prod.yml'))" > /dev/null 2>&1
check "Docker Compose YAML syntax"

# 3. Validate CloudFormation
aws cloudformation validate-template \
    --template-body file://infrastructure-prod.yml \
    --region ap-southeast-1 > /dev/null 2>&1
check "CloudFormation template syntax"

# 4. Check Docker build context
[ -f "src/backend/requirements.txt" ]; check "Backend requirements.txt"
[ -f "src/frontend/package.json" ]; check "Frontend package.json"
[ -d "src/backend/app" ]; check "Backend app directory"
[ -d "src/frontend/src" ]; check "Frontend src directory"

echo ""
echo "🔐 Security Checks..."

# 5. Check security configurations
grep -q "USER appuser" src/backend/Dockerfile.prod
check "Backend non-root user"

grep -q "USER appuser" src/frontend/Dockerfile.prod
check "Frontend non-root user"

grep -q "X-Frame-Options" src/frontend/nginx.prod.conf
check "Security headers in Nginx"

grep -q "gzip on" src/frontend/nginx.prod.conf
check "Gzip compression enabled"

echo ""
echo "⚙️  Resource Configuration..."

# 6. Check resource limits
grep -q '"cpu": "2048"' ecs-task-definition-prod.json
check "ECS CPU allocation (2048)"

grep -q '"memory": "4096"' ecs-task-definition-prod.json
check "ECS Memory allocation (4096)"

grep -q "healthCheck" ecs-task-definition-prod.json
check "Health checks configured"

echo ""
echo "📊 Infrastructure Components..."

# 7. Check infrastructure components
grep -q "AWS::EC2::VPC" infrastructure-prod.yml
check "VPC configuration"

grep -q "AWS::ElasticLoadBalancingV2::LoadBalancer" infrastructure-prod.yml
check "Application Load Balancer"

grep -q "AWS::ECS::Cluster" infrastructure-prod.yml
check "ECS Cluster"

grep -q "AWS::EC2::NatGateway" infrastructure-prod.yml
check "NAT Gateway"

grep -q "AvailabilityZone" infrastructure-prod.yml
check "Multi-AZ deployment"

echo ""
echo "🚀 Deployment Scripts..."

# 8. Check deployment scripts
grep -q "docker build" deploy-production.sh
check "Docker build in deploy script"

grep -q "aws ecr" deploy-production.sh
check "ECR push in deploy script"

grep -q "aws ecs update-service" deploy-production.sh
check "ECS update in deploy script"

grep -q "application-autoscaling" setup-autoscaling.sh
check "Auto-scaling configuration"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📈 Results: $PASS passed, $FAIL failed"
echo "════════════════════════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "🎉 Production Ready! All checks passed."
    echo ""
    echo "Next Steps:"
    echo "  1. Review .env.production and set secrets"
    echo "  2. Deploy infrastructure: aws cloudformation create-stack ..."
    echo "  3. Run deployment: ./deploy-production.sh"
    echo "  4. Setup auto-scaling: ./setup-autoscaling.sh"
    echo "  5. Monitor: ./monitor-production.sh"
    exit 0
else
    echo ""
    echo "⚠️  Some checks failed. Please review and fix issues."
    exit 1
fi
