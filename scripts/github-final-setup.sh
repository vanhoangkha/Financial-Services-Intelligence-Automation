#!/bin/bash

# Final GitHub CodeBuild setup
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Final GitHub CodeBuild Setup${NC}"
echo "================================="

PROJECT_NAME="VPBankKMult-GitHub-Final"
GITHUB_REPO="https://github.com/ngcuyen/multi-agent-hackathon.git"

echo -e "${BLUE}Configuration:${NC}"
echo "• Project: $PROJECT_NAME"
echo "• Repository: $GITHUB_REPO (PUBLIC)"
echo "• Buildspec: Uses existing buildspec.yml from repo"
echo ""

# Create project with proper JSON
cat > /tmp/final-github-project.json << 'EOF'
{
    "name": "VPBankKMult-GitHub-Final",
    "description": "VPBank K-MULT final GitHub integration",
    "source": {
        "type": "GITHUB",
        "location": "https://github.com/ngcuyen/multi-agent-hackathon.git",
        "gitCloneDepth": 1,
        "buildspec": "buildspec.yml",
        "reportBuildStatus": false,
        "insecureSsl": false
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
                "value": "us-east-1",
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
            }
        ]
    },
    "serviceRole": "arn:aws:iam::536697254280:role/VPBankKMult-CodeBuild-Role",
    "timeoutInMinutes": 30
}
EOF

# Create project
echo -e "${BLUE}Creating final GitHub project...${NC}"
aws codebuild create-project --cli-input-json file:///tmp/final-github-project.json --region us-east-1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Project created successfully${NC}"
    
    # Start build
    echo -e "${BLUE}Starting build...${NC}"
    BUILD_ID=$(aws codebuild start-build --project-name $PROJECT_NAME --region us-east-1 --query 'build.id' --output text)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Build started: $BUILD_ID${NC}"
        
        BUILD_URL="https://console.aws.amazon.com/codesuite/codebuild/projects/$PROJECT_NAME/build/$BUILD_ID"
        echo -e "${BLUE}Build URL: $BUILD_URL${NC}"
        
        # Monitor build
        echo -e "${BLUE}Monitoring build...${NC}"
        for i in {1..15}; do
            BUILD_STATUS=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].buildStatus' --output text --region us-east-1)
            CURRENT_PHASE=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].currentPhase' --output text --region us-east-1)
            
            echo -e "${BLUE}[$i/15] Status: $BUILD_STATUS | Phase: $CURRENT_PHASE${NC}"
            
            case $BUILD_STATUS in
                "IN_PROGRESS")
                    echo -e "${BLUE}Build in progress...${NC}"
                    ;;
                "SUCCEEDED")
                    echo -e "${GREEN}BUILD SUCCESSFUL!${NC}"
                    
                    # Show success details
                    echo -e "${BLUE}Build Summary:${NC}"
                    aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].[startTime,endTime,buildStatus]' --output table --region us-east-1
                    
                    # Check ECR
                    echo -e "${BLUE}Latest ECR Images:${NC}"
                    aws ecr describe-images --repository-name vpbank-kmult-backend --query 'imageDetails[0:3].[imageTags[0],imagePushedAt]' --output table --region us-east-1
                    
                    break
                    ;;
                "FAILED")
                    echo -e "${RED}Build failed${NC}"
                    
                    # Get failure details
                    aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].phases[?phaseStatus==`FAILED`].[phaseType,contexts[0].message]' --output table --region us-east-1
                    
                    break
                    ;;
                *)
                    echo -e "${YELLOW}Status: $BUILD_STATUS${NC}"
                    ;;
            esac
            
            sleep 30
        done
        
    else
        echo -e "${RED}Failed to start build${NC}"
    fi
    
else
    echo -e "${RED}Failed to create project${NC}"
fi

# Cleanup
rm -f /tmp/final-github-project.json

echo ""
echo -e "${GREEN}Final GitHub Setup Complete!${NC}"
echo ""
echo "Summary:"
echo "• Project: $PROJECT_NAME"
echo "• Repository: $GITHUB_REPO (PUBLIC)"
echo "• Buildspec: Uses buildspec.yml from repository"
echo "• No GitHub token required!"
echo ""
echo "Links:"
echo "• CodeBuild: https://console.aws.amazon.com/codesuite/codebuild/projects/$PROJECT_NAME"
echo "• ECR: https://console.aws.amazon.com/ecr/repositories/private/536697254280/vpbank-kmult-backend"
echo "• GitHub: https://github.com/ngcuyen/multi-agent-hackathon"
echo ""
echo -e "${BLUE}Now you can push code to GitHub and it will build automatically!${NC}"
