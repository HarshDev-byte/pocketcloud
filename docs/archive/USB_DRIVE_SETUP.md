# 🔌 USB Drive Setup for PocketCloud on Raspberry Pi

This guide will help you set up an external USB drive as the primary storage for your PocketCloud server on Raspberry Pi.

---

## 📋 Prerequisites

- Raspberry Pi (any model with USB ports)
- External USB drive (recommended: 500GB+ for adequate storage)
- Raspberry Pi OS installed and running
- Root/sudo access

---

## 🚀 Quick Setup

Run the automated setup script:

```bash
sudo ./setup-usb-drive.sh
```

The script will:
1. Detect your USB drive
2. Format it with ext4 filesystem
3. Create the mount point
4. Configure automatic mounting
5. Set up PocketCloud storage directories
6. Configure proper permissions

---

## 📖 Manual Setup Guide

### Step 1: Connect and Identify Your USB Drive

1. **Connect your USB drive** to the Raspberry Pi
2. **Wait 10 seconds** for the system to detect it
3. **List all drives** to identify your USB device:

```bash
sudo fdisk -l
```

Look for your USB drive (usually `/dev/sda`, `/dev/sdb`, etc.). Note the device name.

### Step 2: Unmount if Already Mounted

```bash
sudo umount /dev/sda1  # Replace sda1 with your device
```

### Step 3: Format the Drive

**⚠️ WARNING: This will erase all data on the drive!**

```bash
# Create a new partition table
sudo fdisk /dev/sda  # Replace sda with your device

# In fdisk:
# - Press 'o' to create a new empty DOS partition table
# - Press 'n' to create a new partition
# - Press 'p' for primary partition
# - Press '1' for partition number
# - Press Enter twice to use default start and end sectors
# - Press 'w' to write changes and exit

# Format with ext4 filesystem
sudo mkfs.ext4 /dev/sda1  # Replace sda1 with your partition
```

### Step 4: Create Mount Point

```bash
sudo mkdir -p /mnt/pocketcloud-storage
```

### Step 5: Mount the Drive

```bash
sudo mount /dev/sda1 /mnt/pocketcloud-storage
```

### Step 6: Configure Automatic Mounting

1. **Get the UUID of your drive:**

```bash
sudo blkid /dev/sda1
```

Copy the UUID (something like `12345678-1234-1234-1234-123456789abc`)

2. **Edit fstab for automatic mounting:**

```bash
sudo nano /etc/fstab
```

Add this line at the end (replace UUID with your actual UUID):

```
UUID=12345678-1234-1234-1234-123456789abc /mnt/pocketcloud-storage ext4 defaults,nofail 0 2
```

### Step 7: Set Up PocketCloud Directories

```bash
# Create PocketCloud storage structure
sudo mkdir -p /mnt/pocketcloud-storage/{uploads,encrypted,thumbnails,temp,backups}

# Set ownership to pi user (or your user)
sudo chown -R pi:pi /mnt/pocketcloud-storage

# Set proper permissions
sudo chmod -R 755 /mnt/pocketcloud-storage
```

### Step 8: Test the Setup

```bash
# Test mounting
sudo umount /mnt/pocketcloud-storage
sudo mount -a

# Verify it's mounted
df -h | grep pocketcloud-storage

# Test write permissions
touch /mnt/pocketcloud-storage/test-file
rm /mnt/pocketcloud-storage/test-file
```

---

## 🔧 Configuration

### Update PocketCloud Configuration

Edit your PocketCloud configuration to use the USB drive:

```bash
nano backend/src/config/storage.js
```

Update the storage paths:

```javascript
module.exports = {
  STORAGE_PATH: '/mnt/pocketcloud-storage/uploads',
  ENCRYPTED_PATH: '/mnt/pocketcloud-storage/encrypted',
  THUMBNAIL_PATH: '/mnt/pocketcloud-storage/thumbnails',
  TEMP_PATH: '/mnt/pocketcloud-storage/temp',
  BACKUP_PATH: '/mnt/pocketcloud-storage/backups'
}
```

---

## 🛠️ Troubleshooting

### Drive Not Detected

```bash
# Check if USB drive is connected
lsusb

# Check system messages
dmesg | tail -20

# List all block devices
lsblk
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R pi:pi /mnt/pocketcloud-storage

# Fix permissions
sudo chmod -R 755 /mnt/pocketcloud-storage
```

### Mount Issues

```bash
# Check fstab syntax
sudo mount -a

# Manual mount with verbose output
sudo mount -v /dev/sda1 /mnt/pocketcloud-storage

# Check filesystem
sudo fsck /dev/sda1
```

### Drive Full or Performance Issues

```bash
# Check disk usage
df -h /mnt/pocketcloud-storage

# Check disk health
sudo smartctl -a /dev/sda

# Monitor disk I/O
sudo iotop
```

---

## 📊 Monitoring

### Check Drive Health

```bash
# Install smartmontools if not installed
sudo apt install smartmontools

# Check drive health
sudo smartctl -H /dev/sda

# Detailed drive info
sudo smartctl -a /dev/sda
```

### Monitor Storage Usage

```bash
# Check available space
df -h /mnt/pocketcloud-storage

# Check directory sizes
du -sh /mnt/pocketcloud-storage/*

# Real-time monitoring
watch -n 5 'df -h /mnt/pocketcloud-storage'
```

---

## 🔄 Backup Strategy

### Create Backup Script

```bash
#!/bin/bash
# backup-pocketcloud.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/mnt/pocketcloud-storage/backups"
SOURCE_DIR="/mnt/pocketcloud-storage"

# Create backup
tar -czf "$BACKUP_DIR/pocketcloud_backup_$BACKUP_DATE.tar.gz" \
  --exclude="$BACKUP_DIR" \
  --exclude="*/temp/*" \
  "$SOURCE_DIR"

echo "Backup created: pocketcloud_backup_$BACKUP_DATE.tar.gz"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t pocketcloud_backup_*.tar.gz | tail -n +8 | xargs -r rm
```

### Schedule Automatic Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/pi/backup-pocketcloud.sh
```

---

## ⚡ Performance Optimization

### USB Drive Performance

```bash
# Check current mount options
mount | grep pocketcloud-storage

# Optimize fstab entry for better performance
UUID=your-uuid /mnt/pocketcloud-storage ext4 defaults,noatime,nofail 0 2
```

### Raspberry Pi USB Performance

```bash
# Check USB version
lsusb -t

# For USB 3.0 drives on Pi 4, ensure you're using USB 3.0 ports (blue ports)
# For better performance, use powered USB hub for multiple drives
```

---

## 🔒 Security Considerations

### Encrypt the Drive (Optional)

For additional security, you can encrypt the entire drive:

```bash
# Install cryptsetup
sudo apt install cryptsetup

# Encrypt the partition (WARNING: Destroys all data)
sudo cryptsetup luksFormat /dev/sda1

# Open encrypted partition
sudo cryptsetup luksOpen /dev/sda1 pocketcloud-encrypted

# Format the encrypted partition
sudo mkfs.ext4 /dev/mapper/pocketcloud-encrypted

# Mount encrypted partition
sudo mount /dev/mapper/pocketcloud-encrypted /mnt/pocketcloud-storage
```

### Secure Permissions

```bash
# Restrict access to storage directory
sudo chmod 750 /mnt/pocketcloud-storage
sudo chown pi:pi /mnt/pocketcloud-storage
```

---

## 📝 Drive Information

### Get Drive Details

```bash
# Drive model and serial
sudo hdparm -I /dev/sda | grep -E "(Model|Serial)"

# Partition information
sudo parted /dev/sda print

# Filesystem information
sudo tune2fs -l /dev/sda1
```

---

## 🚨 Emergency Recovery

### If Drive Won't Mount

```bash
# Check filesystem
sudo fsck -y /dev/sda1

# Force mount read-only
sudo mount -o ro /dev/sda1 /mnt/pocketcloud-storage

# Backup important data before attempting repairs
```

### If Drive is Corrupted

```bash
# Attempt filesystem repair
sudo e2fsck -f -y /dev/sda1

# If repair fails, try to recover data
sudo ddrescue /dev/sda1 /path/to/backup/image.img /path/to/logfile
```

---

## 📋 Checklist

After setup, verify:

- [ ] USB drive is detected (`lsusb`)
- [ ] Drive is properly partitioned (`sudo fdisk -l`)
- [ ] Drive is formatted with ext4 (`sudo blkid`)
- [ ] Mount point exists (`ls -la /mnt/pocketcloud-storage`)
- [ ] Drive mounts automatically (`sudo mount -a`)
- [ ] PocketCloud directories exist
- [ ] Permissions are correct (`ls -la /mnt/pocketcloud-storage`)
- [ ] Write test successful
- [ ] PocketCloud config updated
- [ ] Backup strategy in place

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review system logs: `sudo journalctl -u systemd-udevd`
3. Check dmesg for hardware issues: `dmesg | grep -i usb`
4. Verify drive health with `smartctl`

---

**Your USB drive is now ready for PocketCloud! 🎉**

The drive will automatically mount on boot and provide reliable storage for your personal cloud.