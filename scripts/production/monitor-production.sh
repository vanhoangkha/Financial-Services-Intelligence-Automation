#!/bin/bash

AWS_REGION="${AWS_REGION:-ap-southeast-1}"
CLUSTER_NAME="vpbank-kmult-cluster"
SERVICE_NAME="vpbank-kmult-service"

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       VPBank K-MULT Production Monitoring Dashboard       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Service Status
echo "📊 Service Status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' \
  --output table

echo ""

# Task Health
echo "🏥 Task Health:"
TASK_ARNS=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'taskArns' \
  --output text)

if [ -n "$TASK_ARNS" ]; then
  aws ecs describe-tasks \
    --cluster $CLUSTER_NAME \
    --tasks $TASK_ARNS \
    --region $AWS_REGION \
    --query 'tasks[*].{TaskId:taskArn,Status:lastStatus,Health:healthStatus,CPU:cpu,Memory:memory}' \
    --output table
else
  echo "No running tasks"
fi

echo ""

# CPU Utilization (last hour)
echo "💻 CPU Utilization (Last Hour):"
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average Maximum \
  --region $AWS_REGION \
  --query 'Datapoints[-1].{Average:Average,Maximum:Maximum}' \
  --output table

echo ""

# Memory Utilization
echo "🧠 Memory Utilization (Last Hour):"
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average Maximum \
  --region $AWS_REGION \
  --query 'Datapoints[-1].{Average:Average,Maximum:Maximum}' \
  --output table

echo ""

# Recent Events
echo "📝 Recent Service Events:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].events[:5].{Time:createdAt,Message:message}' \
  --output table

echo ""

# ALB Health
echo "🔗 Load Balancer Target Health:"
TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
  --region $AWS_REGION \
  --query "TargetGroups[?contains(TargetGroupName, 'backend')].TargetGroupArn" \
  --output text | head -1)

if [ -n "$TARGET_GROUP_ARN" ]; then
  aws elbv2 describe-target-health \
    --target-group-arn $TARGET_GROUP_ARN \
    --region $AWS_REGION \
    --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State}' \
    --output table
else
  echo "Target group not found"
fi

echo ""
echo "🔄 Auto-refresh in 30 seconds... (Ctrl+C to exit)"
sleep 30
exec $0
