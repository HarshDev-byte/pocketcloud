#!/bin/bash

# PocketCloud USB Drive Setup Script for Raspberry Pi
# This script automates the setup of an external USB drive for PocketCloud storage

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MOUNT_POINT="/mnt/pocketcloud-storage"
STORAGE_DIRS=("uploads" "encrypted" "thumbnails" "temp" "backups")
USER="pi"  # Change this if you're using a different user

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║        🔌 PocketCloud USB Drive Setup for Raspberry Pi       ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

detect_usb_drives() {
    print_step "Detecting USB drives..."
    
    # Get list of USB storage devices
    USB_DRIVES=($(lsblk -d -o NAME,TRAN | grep usb | awk '{print "/dev/"$1}'))
    
    if [ ${#USB_DRIVES[@]} -eq 0 ]; then
        print_error "No USB drives detected!"
        echo "Please ensure your USB drive is connected and try again."
        exit 1
    fi
    
    echo "Found USB drives:"
    for i in "${!USB_DRIVES[@]}"; do
        DRIVE_INFO=$(lsblk -d -o NAME,SIZE,MODEL "${USB_DRIVES[$i]}" | tail -n 1)
        echo "  $((i+1)). ${USB_DRIVES[$i]} - $DRIVE_INFO"
    done
}

select_drive() {
    if [ ${#USB_DRIVES[@]} -eq 1 ]; then
        SELECTED_DRIVE="${USB_DRIVES[0]}"
        print_success "Automatically selected: $SELECTED_DRIVE"
    else
        echo
        read -p "Select drive number (1-${#USB_DRIVES[@]}): " DRIVE_NUM
        
        if [[ ! "$DRIVE_NUM" =~ ^[0-9]+$ ]] || [ "$DRIVE_NUM" -lt 1 ] || [ "$DRIVE_NUM" -gt ${#USB_DRIVES[@]} ]; then
            print_error "Invalid selection!"
            exit 1
        fi
        
        SELECTED_DRIVE="${USB_DRIVES[$((DRIVE_NUM-1))]}"
    fi
    
    # Get drive info
    DRIVE_SIZE=$(lsblk -d -o SIZE "$SELECTED_DRIVE" | tail -n 1 | tr -d ' ')
    DRIVE_MODEL=$(lsblk -d -o MODEL "$SELECTED_DRIVE" | tail -n 1)
    
    echo
    print_warning "Selected drive: $SELECTED_DRIVE ($DRIVE_SIZE, $DRIVE_MODEL)"
    print_warning "⚠️  ALL DATA ON THIS DRIVE WILL BE ERASED! ⚠️"
    echo
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "Setup cancelled."
        exit 0
    fi
}

unmount_drive() {
    print_step "Unmounting any existing partitions..."
    
    # Unmount all partitions on the selected drive
    for partition in $(lsblk -ln -o NAME "$SELECTED_DRIVE" | tail -n +2); do
        PARTITION_PATH="/dev/$partition"
        if mountpoint -q "/dev/$partition" 2>/dev/null || mount | grep -q "$PARTITION_PATH"; then
            echo "Unmounting $PARTITION_PATH..."
            umount "$PARTITION_PATH" 2>/dev/null || true
        fi
    done
    
    print_success "Drive unmounted"
}

partition_drive() {
    print_step "Creating new partition table..."
    
    # Create new partition table and partition
    parted "$SELECTED_DRIVE" --script mklabel msdos
    parted "$SELECTED_DRIVE" --script mkpart primary ext4 0% 100%
    
    # Wait for partition to be created
    sleep 2
    partprobe "$SELECTED_DRIVE"
    sleep 2
    
    PARTITION="${SELECTED_DRIVE}1"
    
    if [ ! -b "$PARTITION" ]; then
        print_error "Partition $PARTITION was not created!"
        exit 1
    fi
    
    print_success "Partition created: $PARTITION"
}

format_drive() {
    print_step "Formatting partition with ext4 filesystem..."
    
    # Format with ext4
    mkfs.ext4 -F "$PARTITION" -L "PocketCloud"
    
    print_success "Partition formatted with ext4"
}

create_mount_point() {
    print_step "Creating mount point..."
    
    mkdir -p "$MOUNT_POINT"
    print_success "Mount point created: $MOUNT_POINT"
}

mount_drive() {
    print_step "Mounting the drive..."
    
    mount "$PARTITION" "$MOUNT_POINT"
    
    if ! mountpoint -q "$MOUNT_POINT"; then
        print_error "Failed to mount the drive!"
        exit 1
    fi
    
    print_success "Drive mounted at $MOUNT_POINT"
}

setup_auto_mount() {
    print_step "Configuring automatic mounting..."
    
    # Get UUID of the partition
    UUID=$(blkid -s UUID -o value "$PARTITION")
    
    if [ -z "$UUID" ]; then
        print_error "Could not get UUID of the partition!"
        exit 1
    fi
    
    # Backup fstab
    cp /etc/fstab /etc/fstab.backup.$(date +%Y%m%d_%H%M%S)
    
    # Add entry to fstab if it doesn't exist
    FSTAB_ENTRY="UUID=$UUID $MOUNT_POINT ext4 defaults,noatime,nofail 0 2"
    
    if ! grep -q "$UUID" /etc/fstab; then
        echo "$FSTAB_ENTRY" >> /etc/fstab
        print_success "Added auto-mount entry to /etc/fstab"
    else
        print_warning "Auto-mount entry already exists in /etc/fstab"
    fi
    
    # Test fstab
    if ! mount -a; then
        print_error "Error in /etc/fstab! Restoring backup..."
        cp /etc/fstab.backup.$(date +%Y%m%d_%H%M%S) /etc/fstab
        exit 1
    fi
    
    print_success "Auto-mount configured successfully"
}

create_storage_structure() {
    print_step "Creating PocketCloud storage directories..."
    
    for dir in "${STORAGE_DIRS[@]}"; do
        mkdir -p "$MOUNT_POINT/$dir"
        echo "Created: $MOUNT_POINT/$dir"
    done
    
    print_success "Storage structure created"
}

set_permissions() {
    print_step "Setting proper permissions..."
    
    # Set ownership to the specified user
    chown -R "$USER:$USER" "$MOUNT_POINT"
    
    # Set permissions
    chmod -R 755 "$MOUNT_POINT"
    
    # Set special permissions for temp directory
    chmod 777 "$MOUNT_POINT/temp"
    
    print_success "Permissions set correctly"
}

test_setup() {
    print_step "Testing the setup..."
    
    # Test write permissions
    TEST_FILE="$MOUNT_POINT/test-$(date +%s).txt"
    
    if echo "PocketCloud USB setup test" > "$TEST_FILE"; then
        rm "$TEST_FILE"
        print_success "Write test passed"
    else
        print_error "Write test failed!"
        exit 1
    fi
    
    # Test mount persistence
    if mount -a; then
        print_success "Mount persistence test passed"
    else
        print_error "Mount persistence test failed!"
        exit 1
    fi
}

create_config_template() {
    print_step "Creating storage configuration template..."
    
    CONFIG_FILE="storage-config.js"
    
    cat > "$CONFIG_FILE" << EOF
// PocketCloud Storage Configuration
// Copy this to backend/src/config/storage.js

module.exports = {
  // Main storage paths
  STORAGE_PATH: '$MOUNT_POINT/uploads',
  ENCRYPTED_PATH: '$MOUNT_POINT/encrypted',
  THUMBNAIL_PATH: '$MOUNT_POINT/thumbnails',
  TEMP_PATH: '$MOUNT_POINT/temp',
  BACKUP_PATH: '$MOUNT_POINT/backups',
  
  // Storage settings
  MAX_FILE_SIZE: '500MB',
  ALLOWED_EXTENSIONS: [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Videos
    '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm',
    // Audio
    '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a',
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    // Archives
    '.zip', '.rar', '.7z', '.tar', '.gz'
  ],
  
  // Cleanup settings
  TEMP_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  THUMBNAIL_CACHE_SIZE: '1GB',
  
  // Backup settings
  AUTO_BACKUP: true,
  BACKUP_RETENTION_DAYS: 30
};
EOF
    
    chown "$USER:$USER" "$CONFIG_FILE"
    print_success "Configuration template created: $CONFIG_FILE"
}

print_summary() {
    echo
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                    ✅ SETUP COMPLETE! ✅                     ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "📊 Setup Summary:"
    echo "  • Drive: $SELECTED_DRIVE ($DRIVE_SIZE, $DRIVE_MODEL)"
    echo "  • Partition: $PARTITION"
    echo "  • Mount Point: $MOUNT_POINT"
    echo "  • Filesystem: ext4"
    echo "  • UUID: $(blkid -s UUID -o value "$PARTITION")"
    echo "  • Auto-mount: Enabled"
    echo
    echo "📁 Storage Directories Created:"
    for dir in "${STORAGE_DIRS[@]}"; do
        echo "  • $MOUNT_POINT/$dir"
    done
    echo
    echo "🔧 Next Steps:"
    echo "  1. Copy storage-config.js to backend/src/config/storage.js"
    echo "  2. Update your PocketCloud configuration"
    echo "  3. Restart PocketCloud service"
    echo
    echo "💾 Drive Usage:"
    df -h "$MOUNT_POINT"
    echo
    echo "🎉 Your USB drive is ready for PocketCloud!"
}

# Main execution
main() {
    print_header
    
    check_root
    detect_usb_drives
    select_drive
    unmount_drive
    partition_drive
    format_drive
    create_mount_point
    mount_drive
    setup_auto_mount
    create_storage_structure
    set_permissions
    test_setup
    create_config_template
    print_summary
}

# Run main function
main "$@"