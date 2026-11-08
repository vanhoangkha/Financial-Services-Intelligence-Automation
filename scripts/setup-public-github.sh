#!/bin/bash

# Setup GitHub integration for public repository
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Setting up Public GitHub Integration${NC}"
echo "=============================================="

# Configuration
PROJECT_NAME="VPBankKMult-Public-GitHub"
GITHUB_REPO="https://github.com/ngcuyen/multi-agent-hackathon.git"
AWS_REGION="us-east-1"

echo -e "${BLUE}Configuration:${NC}"
echo "• Project Name: $PROJECT_NAME"
echo "• GitHub Repository: $GITHUB_REPO (PUBLIC)"
echo "• Region: $AWS_REGION"
echo ""

# Step 1: Verify repository is public
echo -e "${BLUE}Verifying repository accessibility...${NC}"
REPO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/ngcuyen/multi-agent-hackathon)

if [ "$REPO_STATUS" = "200" ]; then
    echo -e "${GREEN}Repository is publicly accessible${NC}"
else
    echo -e "${RED}Repository not accessible (status: $REPO_STATUS)${NC}"
    exit 1
fi

# Step 2: Create/Update CodeBuild project for public GitHub
echo -e "${BLUE}Creating public GitHub CodeBuild project...${NC}"

cat > /tmp/public-github-project.json << EOF
{
    "name": "$PROJECT_NAME",
    "description": "VPBank K-MULT build with public GitHub (no auth required)",
    "source": {
        "type": "GITHUB",
        "location": "$GITHUB_REPO",
        "buildspec": "buildspec.yml",
        "reportBuildStatus": false,
        "insecureSsl": false,
        "gitCloneDepth": 1
    },
    "artifacts": {
        "type": "NO_ARTIFACTS"
    },
    "environment": {
        "type": "LINUX_CONTAINER",
        "image": "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
        "computeType": "BUILD_GENERAL1_MEDIUM",
        "privilegedMode": true,
        "environmentVariables": [
            {
                "name": "AWS_DEFAULT_REGION",
                "value": "$AWS_REGION",
                "type": "PLAINTEXT"
            },
            {
                "name": "AWS_ACCOUNT_ID",
                "value": "536697254280",
                "type": "PLAINTEXT"
            },
            {
                "name": "IMAGE_REPO_NAME",
                "value": "vpbank-kmult-backend",
                "type": "PLAINTEXT"
            },
            {
                "name": "GITHUB_REPO",
                "value": "$GITHUB_REPO",
                "type": "PLAINTEXT"
            }
        ]
    },
    "serviceRole": "arn:aws:iam::536697254280:role/VPBankKMult-CodeBuild-Role",
    "timeoutInMinutes": 30
}
EOF

# Check if project exists
PROJECT_EXISTS=$(aws codebuild batch-get-projects --names $PROJECT_NAME --query 'projects[0].name' --output text --region $AWS_REGION 2>/dev/null || echo "NOT_FOUND")

if [ "$PROJECT_EXISTS" != "NOT_FOUND" ] && [ "$PROJECT_EXISTS" != "None" ]; then
    echo -e "${YELLOW}Project exists, updating...${NC}"
    aws codebuild update-project --cli-input-json file:///tmp/public-github-project.json --region $AWS_REGION
else
    echo -e "${BLUE}Creating new project...${NC}"
    aws codebuild create-project --cli-input-json file:///tmp/public-github-project.json --region $AWS_REGION
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Public GitHub CodeBuild project configured successfully${NC}"
else
    echo -e "${RED}Failed to configure CodeBuild project${NC}"
    exit 1
fi

# Step 3: Test build immediately
echo -e "${BLUE}Starting test build...${NC}"
BUILD_ID=$(aws codebuild start-build --project-name $PROJECT_NAME --region $AWS_REGION --query 'build.id' --output text)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build started successfully!${NC}"
    echo -e "${BLUE}Build ID: $BUILD_ID${NC}"
    
    # Get build URL
    BUILD_URL="https://console.aws.amazon.com/codesuite/codebuild/projects/$PROJECT_NAME/build/$BUILD_ID"
    echo -e "${BLUE}Build URL: $BUILD_URL${NC}"
    
    # Monitor build
    echo -e "${BLUE}Monitoring build progress...${NC}"
    for i in {1..15}; do
        BUILD_STATUS=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].buildStatus' --output text --region $AWS_REGION)
        CURRENT_PHASE=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].currentPhase' --output text --region $AWS_REGION)
        
        echo -e "${BLUE}[$i/15] Status: $BUILD_STATUS | Phase: $CURRENT_PHASE${NC}"
        
        case $BUILD_STATUS in
            "IN_PROGRESS")
                echo -e "${BLUE}Build in progress...${NC}"
                ;;
            "SUCCEEDED")
                echo -e "${GREEN}Build completed successfully!${NC}"
                
                # Get build summary
                echo -e "${BLUE}Build Summary:${NC}"
                aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].[startTime,endTime,buildStatus]' --output table --region $AWS_REGION
                
                # Check ECR images
                echo -e "${BLUE}Checking ECR images...${NC}"
                aws ecr describe-images --repository-name vpbank-kmult-backend --query 'imageDetails[0:3].[imageTags[0],imagePushedAt]' --output table --region $AWS_REGION
                
                break
                ;;
            "FAILED")
                echo -e "${RED}Build failed!${NC}"
                
                # Get failure details
                echo -e "${BLUE}Failure Details:${NC}"
                aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].phases[?phaseStatus==`FAILED`].[phaseType,contexts[0].message]' --output table --region $AWS_REGION
                
                # Get logs link
                LOG_GROUP=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].logs.groupName' --output text --region $AWS_REGION)
                if [ "$LOG_GROUP" != "None" ]; then
                    echo -e "${BLUE}Logs: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/$(echo $LOG_GROUP | sed 's/\//%2F/g')${NC}"
                fi
                
                break
                ;;
            *)
                echo -e "${YELLOW}Build status: $BUILD_STATUS${NC}"
                ;;
        esac
        
        sleep 30
    done
    
else
    echo -e "${RED}Failed to start build${NC}"
    exit 1
fi

# Cleanup
rm -f /tmp/public-github-project.json

echo ""
echo -e "${GREEN}Public GitHub Integration Setup Complete!${NC}"
echo ""
echo "Summary:"
echo "• Project: $PROJECT_NAME"
echo "• GitHub Repo: $GITHUB_REPO (PUBLIC)"
echo "• Build ID: $BUILD_ID"
echo "• No authentication required!"
echo ""
echo "Links:"
echo "• CodeBuild Project: https://console.aws.amazon.com/codesuite/codebuild/projects/$PROJECT_NAME"
echo "• Build Details: $BUILD_URL"
echo "• GitHub Repository: https://github.com/ngcuyen/multi-agent-hackathon"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Push code changes to trigger builds"
echo "2. Monitor builds: ./scripts/manage-cicd.sh logs"
echo "3. Check status: ./scripts/manage-cicd.sh status"
