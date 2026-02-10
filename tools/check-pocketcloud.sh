#!/bin/bash

# PocketCloud Status Check Script
# Quick health check for your PocketCloud installation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MOUNT_POINT="/mnt/pocketcloud-storage"
SERVICE_NAME="pocketcloud"

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║              🔍 PocketCloud Status Check 🔍                  ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_drive() {
    echo -e "${BLUE}📱 USB Drive Status:${NC}"
    if mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${GREEN}✅ Drive mounted at $MOUNT_POINT${NC}"
        
        # Show usage
        USAGE_INFO=$(df -h "$MOUNT_POINT" | tail -1)
        USED=$(echo $USAGE_INFO | awk '{print $3}')
        AVAILABLE=$(echo $USAGE_INFO | awk '{print $4}')
        PERCENT=$(echo $USAGE_INFO | awk '{print $5}')
        
        echo "  💾 Used: $USED, Available: $AVAILABLE ($PERCENT)"
        
        # Check if getting full
        PERCENT_NUM=$(echo $PERCENT | tr -d '%')
        if [ "$PERCENT_NUM" -gt 90 ]; then
            echo -e "  ${RED}⚠️  WARNING: Drive is over 90% full!${NC}"
        elif [ "$PERCENT_NUM" -gt 80 ]; then
            echo -e "  ${YELLOW}⚠️  CAUTION: Drive is over 80% full${NC}"
        fi
    else
        echo -e "  ${RED}❌ Drive NOT mounted!${NC}"
        return 1
    fi
}

check_service() {
    echo -e "\n${BLUE}🚀 PocketCloud Service:${NC}"
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "  ${GREEN}✅ Service is running${NC}"
        
        # Show uptime
        UPTIME=$(systemctl show "$SERVICE_NAME" --property=ActiveEnterTimestamp --value)
        if [ -n "$UPTIME" ]; then
            echo "  ⏱️  Started: $UPTIME"
        fi
        
        # Check memory usage
        PID=$(systemctl show "$SERVICE_NAME" --property=MainPID --value)
        if [ "$PID" != "0" ] && [ -n "$PID" ]; then
            MEMORY=$(ps -p "$PID" -o rss= 2>/dev/null | awk '{print int($1/1024)"MB"}')
            if [ -n "$MEMORY" ]; then
                echo "  🧠 Memory usage: $MEMORY"
            fi
        fi
    else
        echo -e "  ${RED}❌ Service is NOT running!${NC}"
        
        # Show last few log lines
        echo "  📝 Recent logs:"
        journalctl -u "$SERVICE_NAME" -n 3 --no-pager | sed 's/^/    /'
        return 1
    fi
}

check_nginx() {
    echo -e "\n${BLUE}🌐 Nginx Status:${NC}"
    
    if systemctl is-active --quiet nginx; then
        echo -e "  ${GREEN}✅ Nginx is running${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Nginx is not running${NC}"
    fi
}

check_ports() {
    echo -e "\n${BLUE}🔌 Network Ports:${NC}"
    
    # Check port 3000 (PocketCloud)
    if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
        echo -e "  ${GREEN}✅ Port 3000 (PocketCloud) is listening${NC}"
    else
        echo -e "  ${RED}❌ Port 3000 (PocketCloud) is NOT listening${NC}"
    fi
    
    # Check port 80 (Nginx)
    if netstat -tlnp 2>/dev/null | grep -q ":80"; then
        echo -e "  ${GREEN}✅ Port 80 (HTTP) is listening${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Port 80 (HTTP) is NOT listening${NC}"
    fi
}

check_connectivity() {
    echo -e "\n${BLUE}🌍 Connectivity Test:${NC}"
    
    # Get Pi IP
    PI_IP=$(hostname -I | awk '{print $1}')
    echo "  📍 Pi IP Address: $PI_IP"
    
    # Test local connection
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:3000 | grep -q "200\|302"; then
        echo -e "  ${GREEN}✅ Local connection (port 3000) working${NC}"
    else
        echo -e "  ${RED}❌ Local connection (port 3000) failed${NC}"
    fi
    
    # Test Nginx connection
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost | grep -q "200\|302"; then
        echo -e "  ${GREEN}✅ Nginx connection (port 80) working${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Nginx connection (port 80) failed${NC}"
    fi
}

check_database() {
    echo -e "\n${BLUE}🗄️  Database Status:${NC}"
    
    DB_PATH="$MOUNT_POINT/pocketcloud.db"
    
    if [ -f "$DB_PATH" ]; then
        echo -e "  ${GREEN}✅ Database file exists${NC}"
        
        # Check database size
        DB_SIZE=$(ls -lh "$DB_PATH" | awk '{print $5}')
        echo "  📊 Database size: $DB_SIZE"
        
        # Test database integrity
        if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
            echo -e "  ${GREEN}✅ Database integrity OK${NC}"
        else
            echo -e "  ${RED}❌ Database integrity check failed!${NC}"
        fi
    else
        echo -e "  ${YELLOW}⚠️  Database file not found (will be created on first run)${NC}"
    fi
}

check_system_resources() {
    echo -e "\n${BLUE}💻 System Resources:${NC}"
    
    # CPU temperature
    if command -v vcgencmd >/dev/null 2>&1; then
        TEMP=$(vcgencmd measure_temp | cut -d= -f2)
        echo "  🌡️  CPU Temperature: $TEMP"
        
        # Warn if too hot
        TEMP_NUM=$(echo $TEMP | cut -d"'" -f1)
        if (( $(echo "$TEMP_NUM > 70" | bc -l) )); then
            echo -e "  ${RED}⚠️  WARNING: CPU temperature is high!${NC}"
        fi
    fi
    
    # Memory usage
    MEMORY_INFO=$(free -h | grep "Mem:")
    MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
    echo "  🧠 Memory: $MEMORY_USED / $MEMORY_TOTAL used"
    
    # Load average
    LOAD=$(uptime | awk -F'load average:' '{print $2}')
    echo "  ⚡ Load average:$LOAD"
}

check_logs() {
    echo -e "\n${BLUE}📝 Recent Activity:${NC}"
    
    # Check for recent errors
    ERROR_COUNT=$(journalctl -u "$SERVICE_NAME" --since "1 hour ago" -p err --no-pager | wc -l)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "  ${RED}❌ $ERROR_COUNT error(s) in the last hour${NC}"
        echo "  📋 Recent errors:"
        journalctl -u "$SERVICE_NAME" --since "1 hour ago" -p err --no-pager -n 3 | sed 's/^/    /'
    else
        echo -e "  ${GREEN}✅ No errors in the last hour${NC}"
    fi
    
    # Show last startup
    LAST_START=$(journalctl -u "$SERVICE_NAME" --no-pager | grep "Started\|Starting" | tail -1)
    if [ -n "$LAST_START" ]; then
        echo "  🚀 Last startup: $(echo $LAST_START | awk '{print $1, $2, $3}')"
    fi
}

show_quick_actions() {
    echo -e "\n${BLUE}🔧 Quick Actions:${NC}"
    echo "  📊 Full drive check: ./monitor-usb-drive.sh"
    echo "  📋 View logs: sudo journalctl -u $SERVICE_NAME -f"
    echo "  🔄 Restart service: sudo systemctl restart $SERVICE_NAME"
    echo "  🛑 Stop service: sudo systemctl stop $SERVICE_NAME"
    echo "  ▶️  Start service: sudo systemctl start $SERVICE_NAME"
    echo "  📈 System monitor: htop"
}

# Main execution
main() {
    print_header
    
    check_drive
    check_service
    check_nginx
    check_ports
    check_connectivity
    check_database
    check_system_resources
    check_logs
    show_quick_actions
    
    echo -e "\n${GREEN}🔍 Status check complete!${NC}"
    
    # Overall health summary
    if mountpoint -q "$MOUNT_POINT" && systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "${GREEN}🎉 PocketCloud appears to be running healthy!${NC}"
    else
        echo -e "${YELLOW}⚠️  PocketCloud may have issues - check the details above${NC}"
    fi
}

# Handle command line arguments
case "${1:-}" in
    --watch)
        while true; do
            clear
            main
            echo -e "\n${BLUE}Refreshing in 30 seconds... (Ctrl+C to exit)${NC}"
            sleep 30
        done
        ;;
    --help|-h)
        echo "PocketCloud Status Check Script"
        echo ""
        echo "Usage:"
        echo "  $0           Run status check once"
        echo "  $0 --watch   Run status check continuously"
        echo "  $0 --help    Show this help"
        ;;
    *)
        main
        ;;
esac