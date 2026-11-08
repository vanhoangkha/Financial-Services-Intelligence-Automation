#!/bin/bash

# VPBank K-MULT Agent Studio - Background Control Script
# Control background services and monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo -e "${BLUE}VPBank K-MULT Agent Studio - Background Control${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start services in background mode"
    echo "  stop      Stop all background services"
    echo "  restart   Restart all background services"
    echo "  status    Show detailed status dashboard"
    echo "  monitor   Start background monitoring daemon"
    echo "  logs      Show recent logs"
    echo "  health    Quick health check"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start     # Start all services in background"
    echo "  $0 status    # Show status dashboard"
    echo "  $0 monitor   # Start monitoring daemon"
}

start_services() {
    echo -e "${BLUE}Starting VPBank K-MULT Agent Studio in background...${NC}"
    cd "$PROJECT_DIR"
    ./deployment/scripts/manage.sh start
    
    echo -e "${GREEN}Services started in background mode${NC}"
    echo -e "${YELLOW}Use '$0 status' to check service health${NC}"
    echo -e "${YELLOW}Use '$0 monitor' to start monitoring daemon${NC}"
}

stop_services() {
    echo -e "${BLUE}Stopping VPBank K-MULT Agent Studio...${NC}"
    cd "$PROJECT_DIR"
    ./deployment/scripts/manage.sh stop
    
    # Stop monitoring daemon if running
    pkill -f "background_monitor.sh" 2>/dev/null
    
    echo -e "${GREEN}All services stopped${NC}"
}

restart_services() {
    echo -e "${BLUE}Restarting VPBank K-MULT Agent Studio...${NC}"
    stop_services
    sleep 3
    start_services
}

show_status() {
    cd "$PROJECT_DIR"
    ./deployment/scripts/status_dashboard.sh
}

start_monitor() {
    echo -e "${BLUE}Starting background monitoring daemon...${NC}"
    cd "$PROJECT_DIR"
    
    # Check if monitor is already running
    if pgrep -f "background_monitor.sh" > /dev/null; then
        echo -e "${YELLOW}Background monitor is already running${NC}"
        echo -e "PID: $(pgrep -f "background_monitor.sh")"
        return 0
    fi
    
    # Start monitor in background
    nohup ./deployment/scripts/background_monitor.sh > /dev/null 2>&1 &
    local monitor_pid=$!
    
    echo -e "${GREEN}Background monitor started with PID: $monitor_pid${NC}"
    echo -e "${YELLOW}Monitor will check services every 5 minutes${NC}"
    echo -e "${YELLOW}Use '$0 logs' to view monitoring logs${NC}"
}

show_logs() {
    local log_file="$PROJECT_DIR/tools/monitoring/logs/background_monitor.log"
    
    if [ -f "$log_file" ]; then
        echo -e "${BLUE}Recent monitoring logs:${NC}"
        tail -n 20 "$log_file"
    else
        echo -e "${YELLOW}No monitoring logs found${NC}"
        echo -e "Start monitoring with: $0 monitor"
    fi
}

quick_health() {
    echo -e "${BLUE}Quick Health Check${NC}"
    echo ""
    
    # Check containers
    if docker ps --filter "name=vpbank-kmult-backend" --format "{{.Names}}" | grep -q "vpbank-kmult-backend"; then
        echo -e "${GREEN}Backend Container: Running${NC}"
    else
        echo -e "${RED}Backend Container: Not Running${NC}"
    fi
    
    if docker ps --filter "name=vpbank-kmult-frontend" --format "{{.Names}}" | grep -q "vpbank-kmult-frontend"; then
        echo -e "${GREEN}Frontend Container: Running${NC}"
    else
        echo -e "${RED}Frontend Container: Not Running${NC}"
    fi
    
    # Check health endpoints
    if curl -s -f "http://localhost:8080/mutil_agent/public/api/v1/health-check/health" > /dev/null 2>&1; then
        echo -e "${GREEN}Backend API: Healthy${NC}"
    else
        echo -e "${RED}Backend API: Unhealthy${NC}"
    fi
    
    if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
        echo -e "${GREEN}Frontend Web: Healthy${NC}"
    else
        echo -e "${RED}Frontend Web: Unhealthy${NC}"
    fi
    
    # Check monitoring
    if pgrep -f "background_monitor.sh" > /dev/null; then
        echo -e "${GREEN}Background Monitor: Running (PID: $(pgrep -f "background_monitor.sh"))${NC}"
    else
        echo -e "${YELLOW}Background Monitor: Not Running${NC}"
    fi
}

# Main command handling
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    monitor)
        start_monitor
        ;;
    logs)
        show_logs
        ;;
    health)
        quick_health
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
