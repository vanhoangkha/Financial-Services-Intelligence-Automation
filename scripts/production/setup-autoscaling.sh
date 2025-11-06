#!/bin/bash
set -e

AWS_REGION="${AWS_REGION:-ap-southeast-1}"
CLUSTER_NAME="vpbank-kmult-cluster"
SERVICE_NAME="vpbank-kmult-service"

echo "🔧 Setting up Auto-scaling for VPBank K-MULT"

# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/$CLUSTER_NAME/$SERVICE_NAME \
  --min-capacity 2 \
  --max-capacity 10 \
  --region $AWS_REGION

# CPU-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/$CLUSTER_NAME/$SERVICE_NAME \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }' \
  --region $AWS_REGION

# Memory-based scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/$CLUSTER_NAME/$SERVICE_NAME \
  --policy-name memory-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 80.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }' \
  --region $AWS_REGION

# Request count-based scaling
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/$CLUSTER_NAME/$SERVICE_NAME \
  --policy-name request-count-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 1000.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ALBRequestCountPerTarget",
      "ResourceLabel": "app/vpbank-kmult-alb/*/targetgroup/backend-tg/*"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }' \
  --region $AWS_REGION

echo "✅ Auto-scaling configured successfully!"
echo ""
echo "Scaling Configuration:"
echo "  Min Capacity: 2"
echo "  Max Capacity: 10"
echo "  CPU Target: 70%"
echo "  Memory Target: 80%"
echo "  Request Target: 1000 req/target"
