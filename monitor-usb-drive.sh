#!/bin/bash

# PocketCloud USB Drive Monitoring Script
# This script monitors the health and usage of your PocketCloud USB drive

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MOUNT_POINT="/mnt/pocketcloud-storage"

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           📊 PocketCloud USB Drive Monitor 📊                ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_mount() {
    echo -e "${BLUE}🔍 Mount Status:${NC}"
    if mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${GREEN}✅ Drive is mounted at $MOUNT_POINT${NC}"
        
        # Get device info
        DEVICE=$(df "$MOUNT_POINT" | tail -1 | awk '{print $1}')
        echo "  📱 Device: $DEVICE"
        
        # Get filesystem info
        FSTYPE=$(df -T "$MOUNT_POINT" | tail -1 | awk '{print $2}')
        echo "  💾 Filesystem: $FSTYPE"
        
        return 0
    else
        echo -e "  ${RED}❌ Drive is NOT mounted!${NC}"
        return 1
    fi
}

check_disk_usage() {
    echo -e "\n${BLUE}💽 Disk Usage:${NC}"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${RED}❌ Cannot check usage - drive not mounted${NC}"
        return 1
    fi
    
    # Get usage info
    USAGE_INFO=$(df -h "$MOUNT_POINT" | tail -1)
    TOTAL=$(echo $USAGE_INFO | awk '{print $2}')
    USED=$(echo $USAGE_INFO | awk '{print $3}')
    AVAILABLE=$(echo $USAGE_INFO | awk '{print $4}')
    PERCENT=$(echo $USAGE_INFO | awk '{print $5}' | tr -d '%')
    
    echo "  📊 Total: $TOTAL"
    echo "  📈 Used: $USED ($PERCENT%)"
    echo "  📉 Available: $AVAILABLE"
    
    # Warning thresholds
    if [ "$PERCENT" -gt 90 ]; then
        echo -e "  ${RED}⚠️  WARNING: Disk usage is above 90%!${NC}"
    elif [ "$PERCENT" -gt 80 ]; then
        echo -e "  ${YELLOW}⚠️  CAUTION: Disk usage is above 80%${NC}"
    else
        echo -e "  ${GREEN}✅ Disk usage is healthy${NC}"
    fi
}

check_directory_sizes() {
    echo -e "\n${BLUE}📁 Directory Sizes:${NC}"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${RED}❌ Cannot check directories - drive not mounted${NC}"
        return 1
    fi
    
    # Check each PocketCloud directory
    DIRS=("uploads" "encrypted" "thumbnails" "temp" "backups")
    
    for dir in "${DIRS[@]}"; do
        if [ -d "$MOUNT_POINT/$dir" ]; then
            SIZE=$(du -sh "$MOUNT_POINT/$dir" 2>/dev/null | cut -f1)
            echo "  📂 $dir: $SIZE"
        else
            echo -e "  ${YELLOW}⚠️  $dir: Directory not found${NC}"
        fi
    done
}

check_drive_health() {
    echo -e "\n${BLUE}🏥 Drive Health:${NC}"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${RED}❌ Cannot check health - drive not mounted${NC}"
        return 1
    fi
    
    # Get the device
    DEVICE=$(df "$MOUNT_POINT" | tail -1 | awk '{print $1}' | sed 's/[0-9]*$//')
    
    # Check if smartctl is available
    if command -v smartctl >/dev/null 2>&1; then
        HEALTH=$(sudo smartctl -H "$DEVICE" 2>/dev/null | grep "SMART overall-health" | awk '{print $NF}')
        
        if [ "$HEALTH" = "PASSED" ]; then
            echo -e "  ${GREEN}✅ SMART Health: PASSED${NC}"
        elif [ "$HEALTH" = "FAILED" ]; then
            echo -e "  ${RED}❌ SMART Health: FAILED - Drive may be failing!${NC}"
        else
            echo -e "  ${YELLOW}⚠️  SMART Health: Unknown (may not be supported)${NC}"
        fi
        
        # Get temperature if available
        TEMP=$(sudo smartctl -a "$DEVICE" 2>/dev/null | grep "Temperature_Celsius" | awk '{print $10}')
        if [ -n "$TEMP" ]; then
            echo "  🌡️  Temperature: ${TEMP}°C"
            
            if [ "$TEMP" -gt 60 ]; then
                echo -e "  ${RED}⚠️  WARNING: Drive temperature is high!${NC}"
            fi
        fi
    else
        echo -e "  ${YELLOW}⚠️  smartctl not installed - cannot check SMART health${NC}"
        echo "     Install with: sudo apt install smartmontools"
    fi
}

check_filesystem() {
    echo -e "\n${BLUE}🔧 Filesystem Status:${NC}"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${RED}❌ Cannot check filesystem - drive not mounted${NC}"
        return 1
    fi
    
    # Get the device
    DEVICE=$(df "$MOUNT_POINT" | tail -1 | awk '{print $1}')
    
    # Check filesystem errors (read-only check)
    if tune2fs -l "$DEVICE" >/dev/null 2>&1; then
        ERROR_COUNT=$(sudo tune2fs -l "$DEVICE" 2>/dev/null | grep "Filesystem errors" | awk '{print $3}')
        
        if [ "$ERROR_COUNT" = "0" ]; then
            echo -e "  ${GREEN}✅ No filesystem errors detected${NC}"
        else
            echo -e "  ${RED}❌ Filesystem errors detected: $ERROR_COUNT${NC}"
            echo -e "  ${YELLOW}   Consider running: sudo fsck $DEVICE${NC}"
        fi
        
        # Check last filesystem check
        LAST_CHECK=$(sudo tune2fs -l "$DEVICE" 2>/dev/null | grep "Last checked" | cut -d: -f2- | xargs)
        echo "  🕐 Last checked: $LAST_CHECK"
        
    else
        echo -e "  ${YELLOW}⚠️  Cannot read filesystem info (not ext2/3/4?)${NC}"
    fi
}

check_permissions() {
    echo -e "\n${BLUE}🔐 Permissions:${NC}"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${RED}❌ Cannot check permissions - drive not mounted${NC}"
        return 1
    fi
    
    # Check mount point permissions
    PERMS=$(ls -ld "$MOUNT_POINT" | awk '{print $1}')
    OWNER=$(ls -ld "$MOUNT_POINT" | awk '{print $3":"$4}')
    
    echo "  📂 Mount point: $PERMS $OWNER"
    
    # Check if writable
    if [ -w "$MOUNT_POINT" ]; then
        echo -e "  ${GREEN}✅ Mount point is writable${NC}"
    else
        echo -e "  ${RED}❌ Mount point is not writable!${NC}"
    fi
    
    # Test write access
    TEST_FILE="$MOUNT_POINT/.write_test_$$"
    if echo "test" > "$TEST_FILE" 2>/dev/null; then
        rm "$TEST_FILE"
        echo -e "  ${GREEN}✅ Write test successful${NC}"
    else
        echo -e "  ${RED}❌ Write test failed!${NC}"
    fi
}

show_recent_activity() {
    echo -e "\n${BLUE}📈 Recent Activity:${NC}"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        echo -e "  ${RED}❌ Cannot check activity - drive not mounted${NC}"
        return 1
    fi
    
    # Show recently modified files (last 24 hours)
    echo "  📝 Files modified in last 24 hours:"
    RECENT_FILES=$(find "$MOUNT_POINT" -type f -mtime -1 2>/dev/null | head -10)
    
    if [ -n "$RECENT_FILES" ]; then
        echo "$RECENT_FILES" | while read -r file; do
            REL_PATH=${file#$MOUNT_POINT/}
            MTIME=$(stat -c %y "$file" | cut -d. -f1)
            echo "    • $REL_PATH ($MTIME)"
        done
    else
        echo "    (No recent activity)"
    fi
}

show_recommendations() {
    echo -e "\n${BLUE}💡 Recommendations:${NC}"
    
    # Check if backup is recent
    if [ -d "$MOUNT_POINT/backups" ]; then
        LATEST_BACKUP=$(find "$MOUNT_POINT/backups" -name "*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 86400 ))
            
            if [ "$BACKUP_AGE" -gt 7 ]; then
                echo -e "  ${YELLOW}⚠️  Latest backup is $BACKUP_AGE days old - consider creating a new backup${NC}"
            else
                echo -e "  ${GREEN}✅ Recent backup found ($BACKUP_AGE days old)${NC}"
            fi
        else
            echo -e "  ${YELLOW}⚠️  No backups found - consider setting up automated backups${NC}"
        fi
    fi
    
    # Check temp directory size
    if [ -d "$MOUNT_POINT/temp" ]; then
        TEMP_SIZE=$(du -sm "$MOUNT_POINT/temp" 2>/dev/null | cut -f1)
        if [ "$TEMP_SIZE" -gt 100 ]; then
            echo -e "  ${YELLOW}⚠️  Temp directory is large (${TEMP_SIZE}MB) - consider cleanup${NC}"
        fi
    fi
    
    # General recommendations
    echo "  🔧 Regular maintenance tasks:"
    echo "    • Run filesystem check monthly: sudo fsck /dev/sdX1"
    echo "    • Monitor drive temperature in summer months"
    echo "    • Keep backups of important data"
    echo "    • Clean temp directory regularly"
}

# Main execution
main() {
    print_header
    
    check_mount
    check_disk_usage
    check_directory_sizes
    check_drive_health
    check_filesystem
    check_permissions
    show_recent_activity
    show_recommendations
    
    echo -e "\n${GREEN}📊 Monitoring complete!${NC}"
    echo "Run this script regularly to keep track of your drive's health."
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
        echo "PocketCloud USB Drive Monitor"
        echo ""
        echo "Usage:"
        echo "  $0           Run monitoring once"
        echo "  $0 --watch   Run monitoring continuously (refresh every 30s)"
        echo "  $0 --help    Show this help"
        ;;
    *)
        main
        ;;
esac