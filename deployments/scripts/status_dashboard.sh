#!/bin/bash

# VPBank K-MULT Agent Studio - Status Dashboard
# Real-time monitoring dashboard for background services

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen and show header
clear
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  VPBank K-MULT Status Dashboard${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check service status
check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}$name: Healthy${NC}"
        return 0
    else
        echo -e "${RED}$name: Unhealthy${NC}"
        return 1
    fi
}

# Function to get container stats
get_container_stats() {
    local container=$1
    local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" "$container" 2>/dev/null | tail -n 1)
    echo "$stats"
}

# Main status check
echo -e "${CYAN}Service Health Status:${NC}"
check_service "Backend API" "http://localhost:8080/mutil_agent/public/api/v1/health-check/health"
check_service "Frontend Web" "http://localhost:3000"
check_service "Pure Strands" "http://localhost:8080/mutil_agent/api/pure-strands/process" || echo -e "${YELLOW}Pure Strands: Endpoint check skipped${NC}"

echo ""
echo -e "${CYAN}Container Status:${NC}"
docker ps --filter "name=vpbank-kmult" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${CYAN}Resource Usage:${NC}"
echo -e "Backend:  $(get_container_stats vpbank-kmult-backend)"
echo -e "Frontend: $(get_container_stats vpbank-kmult-frontend)"

echo ""
echo -e "${CYAN}Access URLs:${NC}"
echo -e "• Web Interface: ${GREEN}http://localhost:3000${NC}"
echo -e "• API Documentation: ${GREEN}http://localhost:8080/docs${NC}"
echo -e "• Health Check: ${GREEN}http://localhost:8080/mutil_agent/public/api/v1/health-check/health${NC}"
echo -e "• Pure Strands API: ${GREEN}http://localhost:8080/mutil_agent/api/pure-strands/process${NC}"

echo ""
echo -e "${CYAN}Recent Logs:${NC}"
if [ -f "/home/ubuntu/multi-agent-hackathon/tools/monitoring/logs/background_monitor.log" ]; then
    tail -n 5 "/home/ubuntu/multi-agent-hackathon/tools/monitoring/logs/background_monitor.log"
else
    echo "No monitor logs available yet"
fi

echo ""
echo -e "${CYAN}Last Updated: $(date)${NC}"
echo -e "${BLUE}================================${NC}"
