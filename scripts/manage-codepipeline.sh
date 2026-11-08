#!/bin/bash

# VPBank K-MULT CodePipeline Management Script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
    echo -e "${BLUE}VPBank K-MULT CodePipeline Management${NC}"
    echo "=================================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup-token     Setup GitHub token in Secrets Manager"
    echo "  deploy-ecs      Deploy ECS cluster and service"
    echo "  deploy-pipeline Deploy CodePipeline with GitHub source"
    echo "  start-pipeline  Start pipeline execution"
    echo "  status          Check pipeline status"
    echo "  logs            View pipeline execution logs"
    echo "  cleanup         Clean up all resources"
    echo "  help            Show this help message"
    echo ""
    echo -e "${GREEN}Full Setup Workflow:${NC}"
    echo "  $0 setup-token      # Setup GitHub token"
    echo "  $0 deploy-ecs       # Deploy ECS infrastructure"
    echo "  $0 deploy-pipeline  # Deploy CodePipeline"
    echo ""
    echo -e "${BLUE}Monitoring:${NC}"
    echo "  $0 status           # Check pipeline status"
    echo "  $0 logs             # View execution logs"
    echo ""
}

setup_token() {
    echo -e "${BLUE}Setting up GitHub token...${NC}"
    $SCRIPT_DIR/setup-github-token-secret.sh
}

deploy_ecs() {
    echo -e "${BLUE}Deploying ECS infrastructure...${NC}"
    
    STACK_NAME="vpbank-kmult-ecs"
    TEMPLATE_FILE="/home/ubuntu/multi-agent-hackathon/infrastructure/ecs-cluster.yml"
    
    echo -e "${BLUE}Deploying ECS stack: $STACK_NAME${NC}"
    
    # Check if stack exists
    STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region us-east-1 --query 'Stacks[0].StackName' --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$STACK_EXISTS" = "NOT_FOUND" ]; then
        echo -e "${BLUE}Creating ECS stack...${NC}"
        aws cloudformation create-stack \
            --stack-name $STACK_NAME \
            --template-body file://$TEMPLATE_FILE \
            --capabilities CAPABILITY_IAM \
            --region us-east-1
        
        echo -e "${BLUE}Waiting for ECS stack creation...${NC}"
        aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region us-east-1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}ECS stack created successfully${NC}"
        else
            echo -e "${RED}ECS stack creation failed${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}ECS stack already exists${NC}"
    fi
    
    # Get outputs
    SERVICE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region us-east-1 --query 'Stacks[0].Outputs[?OutputKey==`ServiceUrl`].OutputValue' --output text)
    echo -e "${BLUE}Service URL: $SERVICE_URL${NC}"
}

deploy_pipeline() {
    echo -e "${BLUE}Deploying CodePipeline...${NC}"
    $SCRIPT_DIR/deploy-codepipeline.sh
}

start_pipeline() {
    echo -e "${BLUE}▶️  Starting pipeline execution...${NC}"
    
    PIPELINE_NAME="VPBankKMult-GitHub-Pipeline"
    
    # Check if pipeline exists
    if aws codepipeline get-pipeline --name $PIPELINE_NAME --region us-east-1 >/dev/null 2>&1; then
        EXECUTION_ID=$(aws codepipeline start-pipeline-execution --name $PIPELINE_NAME --region us-east-1 --query 'pipelineExecutionId' --output text)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Pipeline execution started: $EXECUTION_ID${NC}"
            echo -e "${BLUE}Monitor at: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/$PIPELINE_NAME/view${NC}"
        else
            echo -e "${RED}Failed to start pipeline execution${NC}"
        fi
    else
        echo -e "${RED}Pipeline not found: $PIPELINE_NAME${NC}"
        echo -e "${YELLOW}Run: $0 deploy-pipeline${NC}"
    fi
}

check_status() {
    echo -e "${BLUE}Checking CodePipeline Status${NC}"
    echo "=================================="
    
    PIPELINE_NAME="VPBankKMult-GitHub-Pipeline"
    
    # Check if pipeline exists
    if aws codepipeline get-pipeline --name $PIPELINE_NAME --region us-east-1 >/dev/null 2>&1; then
        echo -e "${GREEN}Pipeline exists: $PIPELINE_NAME${NC}"
        
        # Get pipeline state
        echo -e "${BLUE}Pipeline State:${NC}"
        aws codepipeline get-pipeline-state --name $PIPELINE_NAME --region us-east-1 --query 'stageStates[*].[stageName,latestExecution.status]' --output table
        
        # Get recent executions
        echo -e "${BLUE}Recent Executions:${NC}"
        aws codepipeline list-pipeline-executions --pipeline-name $PIPELINE_NAME --region us-east-1 --query 'pipelineExecutionSummaries[0:5].[pipelineExecutionId,status,startTime]' --output table
        
    else
        echo -e "${RED}Pipeline not found: $PIPELINE_NAME${NC}"
    fi
    
    # Check ECS service
    echo ""
    echo -e "${BLUE}ECS Service Status:${NC}"
    if aws ecs describe-services --cluster vpbank-kmult-cluster --services vpbank-kmult-backend --region us-east-1 >/dev/null 2>&1; then
        aws ecs describe-services --cluster vpbank-kmult-cluster --services vpbank-kmult-backend --region us-east-1 --query 'services[0].[serviceName,status,runningCount,desiredCount]' --output table
    else
        echo -e "${YELLOW}ECS service not found${NC}"
    fi
}

view_logs() {
    echo -e "${BLUE}Viewing Pipeline Logs${NC}"
    echo "========================="
    
    PIPELINE_NAME="VPBankKMult-GitHub-Pipeline"
    
    # Get latest execution
    EXECUTION_ID=$(aws codepipeline list-pipeline-executions --pipeline-name $PIPELINE_NAME --region us-east-1 --query 'pipelineExecutionSummaries[0].pipelineExecutionId' --output text 2>/dev/null)
    
    if [ "$EXECUTION_ID" != "None" ] && [ -n "$EXECUTION_ID" ]; then
        echo -e "${BLUE}Latest Execution: $EXECUTION_ID${NC}"
        
        # Get execution details
        aws codepipeline get-pipeline-execution --pipeline-name $PIPELINE_NAME --pipeline-execution-id $EXECUTION_ID --region us-east-1 --query 'pipelineExecution.[status,statusSummary]' --output table
        
        # Get action execution details
        echo -e "${BLUE}Action Details:${NC}"
        aws codepipeline list-action-executions --pipeline-name $PIPELINE_NAME --filter pipelineExecutionId=$EXECUTION_ID --region us-east-1 --query 'actionExecutionDetails[*].[stageName,actionName,status,lastUpdatedBy]' --output table
        
    else
        echo -e "${YELLOW}No pipeline executions found${NC}"
    fi
}

cleanup() {
    echo -e "${YELLOW}This will delete all CodePipeline resources. Are you sure? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Cleaning up CodePipeline resources...${NC}"
        
        # Delete CloudFormation stacks
        echo -e "${BLUE}Deleting CodePipeline stack...${NC}"
        aws cloudformation delete-stack --stack-name vpbank-kmult-codepipeline --region us-east-1 2>/dev/null || true
        
        echo -e "${BLUE}Deleting ECS stack...${NC}"
        aws cloudformation delete-stack --stack-name vpbank-kmult-ecs --region us-east-1 2>/dev/null || true
        
        # Delete GitHub token secret
        echo -e "${BLUE}Deleting GitHub token secret...${NC}"
        aws secretsmanager delete-secret --secret-id github-token --force-delete-without-recovery --region us-east-1 2>/dev/null || true
        
        echo -e "${GREEN}Cleanup initiated${NC}"
        echo -e "${YELLOW}Resources will be deleted in the background${NC}"
    else
        echo -e "${BLUE}ℹ️  Cleanup cancelled${NC}"
    fi
}

# Main script logic
case "${1:-help}" in
    setup-token)
        setup_token
        ;;
    deploy-ecs)
        deploy_ecs
        ;;
    deploy-pipeline)
        deploy_pipeline
        ;;
    start-pipeline)
        start_pipeline
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
