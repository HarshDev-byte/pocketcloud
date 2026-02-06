# PocketCloud Troubleshooting Guide - February 2026

**🎯 Goal:** Fix common issues quickly and get PocketCloud running smoothly.

This guide covers real-world problems encountered during setup and daily use.

---

## 🚨 Critical Issues (Server Won't Start)

### Issue: "FATAL: External USB storage not available"

**Symptoms:**
```
Starting PocketCloud...
✓ Product boundaries validated
✓ Database initialized
FATAL: External USB storage not available
Reason: No USB drive mounted
```

**Root Cause:** PocketCloud requires external USB storage at `/mnt/pocketcloud` but can't find it.

**Solutions (try in order):**

#### Solution 1: Check USB Connection
```bash
# Check if USB drive is physically connected
lsblk
```

**Expected output:**
```
sda           8:0    1  128G  0 disk 
└─sda1        8:1    1  128G  0 part 
```

**If no USB drive shows:** Plug in USB drive and wait 10 seconds.

#### Solution 2: USB Drive Mounted Elsewhere
**Common scenario:** USB drive auto-mounted to `/media/` instead of `/mnt/pocketcloud`

```bash
# Check where USB is mounted
df -h | grep sda

# If mounted at /media/username/Volume:
sudo umount /media/siesgst/New\ Volume

# Or unmount all USB partitions:
sudo umount /dev/sda1
sudo umount /dev/sda2
```

#### Solution 3: Run USB Setup Script
```bash
sudo bash setup/setup-usb-storage.sh
```

**Follow prompts:**
- Enter device name (like `sda`)
- Type `yes` to confirm formatting
- Wait for completion

#### Solution 4: Manual USB Setup
**If setup script fails:**

```bash
# 1. Create mount point
sudo mkdir -p /mnt/pocketcloud

# 2. Format USB drive (DESTROYS ALL DATA!)
sudo mkfs.ext4 /dev/sda1  # Replace sda1 with your device

# 3. Mount it
sudo mount /dev/sda1 /mnt/pocketcloud

# 4. Set permissions
sudo chown $USER:$USER /mnt/pocketcloud

# 5. Add to auto-mount
echo "/dev/sda1 /mnt/pocketcloud ext4 defaults 0 2" | sudo tee -a /etc/fstab

# 6. Test
touch /mnt/pocketcloud/test-file
rm /mnt/pocketcloud/test-file
```

---

### Issue: "Mount point not writable"

**Symptoms:**
```
✓ External USB storage verified
FATAL: External USB storage not available
Reason: Mount point not writable
```

**Root Cause:** USB drive is mounted but PocketCloud can't write to it.

**Solution:**
```bash
# Fix ownership and permissions
sudo chown -R $USER:$USER /mnt/pocketcloud
sudo chmod 755 /mnt/pocketcloud

# Test write access
touch /mnt/pocketcloud/test-file
ls -la /mnt/pocketcloud/test-file
rm /mnt/pocketcloud/test-file
```

---

## 🐛 Application Errors

### Issue: "stats is not defined"

**Symptoms:**
```
stats is not defined
Server error: /views/dashboard.ejs:193
```

**Root Cause:** Using outdated template files.

**Solution:**
```bash
cd ~/Desktop/Pocketcloud
git pull origin master
npm start
```

---

### Issue: "getSystemIdentity is not a function"

**Symptoms:**
```
TypeError: getSystemIdentity is not a function
at /routes/security.js:43:7
```

**Root Cause:** Function name mismatch in security route.

**Solution:**
```bash
cd ~/Desktop/Pocketcloud
git pull origin master
npm start
```

---

## 🔌 USB Drive Issues

### Issue: "Device is busy" During Setup

**Symptoms:**
```
🔧 Formatting /dev/sda...
Error: Partition(s) on /dev/sda are being used.
```

**Root Cause:** USB drive is mounted and in use.

**Solution:**
```bash
# Check what's using the drive
sudo lsof /dev/sda1

# Force unmount all partitions
sudo umount /dev/sda1
sudo umount /dev/sda2

# Or unmount by mount point
sudo umount /media/siesgst/New\ Volume

# Close any file managers accessing the drive
# Then run setup again
sudo bash setup/setup-usb-storage.sh
```

---

### Issue: USB Drive Disconnects During Use

**Symptoms:**
```
Dashboard error: EIO: i/o error, mkdir '/mnt/pocketcloud/user_1'
Storage failure detected: USB drive disconnected
```

**What Happens Now:** PocketCloud shows a friendly "Storage Disconnected" page instead of crashing.

**Solutions:**

#### Immediate Fix:
1. **Reconnect USB drive** - Page will auto-detect and redirect
2. **Click "Check Connection"** - Manual check button
3. **Refresh page** - After reconnecting USB

#### Prevent Future Disconnections:
1. **Check USB cable** - Use high-quality cable
2. **Use powered USB hub** - For high-power drives
3. **Check power supply** - Ensure Pi has adequate power (official adapter)
4. **Secure connection** - Ensure USB ports are not loose

---

## 🌐 Network Access Issues

### Issue: "Can't access PocketCloud from my phone"

**Symptoms:** Browser shows "This site can't be reached" when accessing from phone/laptop.

**Solutions:**

#### Step 1: Check Network
```bash
# On Pi, find IP address
hostname -I
# Example output: 192.168.1.100
```

#### Step 2: Test Access
- **On Pi:** `http://localhost:3000` ✓
- **From phone:** `http://192.168.1.100:3000` ✗

#### Step 3: Check Same Network
- **Pi and phone must be on same Wi-Fi network**
- **Check Pi Wi-Fi:** Look at network icon in top-right
- **Check phone Wi-Fi:** Same network name

#### Step 4: Check Firewall
```bash
sudo ufw status

# If firewall is active but port 3000 not allowed:
sudo ufw allow 3000
```

#### Step 5: Check Service
```bash
sudo systemctl status pocketcloud

# If not running:
sudo systemctl start pocketcloud
```

---

## ⚙️ Service Issues

### Issue: "PocketCloud won't start as service"

**Symptoms:**
```bash
sudo systemctl status pocketcloud
# Shows: Unit pocketcloud.service could not be found
```

**Root Cause:** Service not installed.

**Solution:**
```bash
# Install PocketCloud as service
sudo bash setup/install.sh

# Check status
sudo systemctl status pocketcloud

# Enable auto-start
sudo systemctl enable pocketcloud
```

---

### Issue: "Port 3000 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

#### Option 1: Find and Kill Process
```bash
# Find what's using port 3000
sudo netstat -tlnp | grep 3000

# Kill the process (replace PID)
sudo kill -9 [PID]
```

#### Option 2: Use Different Port
```bash
PORT=8080 npm start
# Access at: http://localhost:8080
```

---

## 📊 Data Issues

### Issue: "Files won't upload"

**Symptoms:** Upload button doesn't work or shows errors.

**Solutions:**

#### Check Disk Space
```bash
df -h | grep pocketcloud
# Should show available space
```

#### Check File Size
- **Default limit:** 1GB per file
- **Large files:** Split or compress first

#### Check File Type
- **Allowed:** Images, PDFs, documents, archives
- **Blocked:** Executables, scripts for security

#### Check Permissions
```bash
ls -la /mnt/pocketcloud/
# Should show your username as owner
```

---

### Issue: "Can't download files"

**Symptoms:** Download button shows errors or files are corrupted.

**Solutions:**

#### Check File Integrity
```bash
# Check if encrypted files exist
ls -la /mnt/pocketcloud/user_*/

# Check database
sqlite3 data/pocketcloud.db "SELECT filename, size FROM files;"
```

#### Check Encryption
- **Ensure you're logged in with correct password**
- **Files encrypted with different password are unrecoverable**

---

## 🔄 Update Issues

### Issue: "Git pull fails"

**Symptoms:**
```bash
git pull origin master
# Shows: fatal: repository not found
```

**Solutions:**

#### Check Remote URL
```bash
git remote -v
# Should show: https://github.com/HarshDev-byte/Pocketcloud.git
```

#### Fix Remote URL
```bash
git remote set-url origin https://github.com/HarshDev-byte/Pocketcloud.git
git pull origin master
```

---

## 🔧 Hardware Issues

### Issue: "Pi won't boot"

**Symptoms:** No display, no network access to Pi.

**Solutions:**

#### Check Power
- **Red LED solid:** Power OK
- **Red LED off/flickering:** Power issue
- **Use official Pi power adapter**

#### Check SD Card
- **Try different SD card**
- **Re-flash with Raspberry Pi Imager**

#### Check Connections
- **HDMI cable secure**
- **Try different monitor/TV**
- **Check keyboard/mouse**

---

### Issue: "USB drive not detected"

**Symptoms:** `lsblk` doesn't show USB drive.

**Solutions:**

#### Try Different Hardware
1. **Different USB port** (try USB 3.0 blue ports)
2. **Different USB cable**
3. **Different USB drive**
4. **Powered USB hub** for high-power drives

#### Check System Logs
```bash
# Watch for USB events
sudo dmesg | tail -20

# Plug/unplug USB drive and check logs
```

---

## 🚑 Recovery Procedures

### Complete Reset (Nuclear Option)

**When to use:** Everything is broken, start fresh.

```bash
# 1. Stop all services
sudo systemctl stop pocketcloud
sudo pkill -f "node server.js"

# 2. Remove installation
sudo rm -rf /opt/pocketcloud
sudo userdel pocketcloud 2>/dev/null || true

# 3. Clean mount point
sudo umount /mnt/pocketcloud 2>/dev/null || true
sudo rm -rf /mnt/pocketcloud

# 4. Remove from fstab
sudo sed -i '/pocketcloud/d' /etc/fstab

# 5. Start fresh
cd ~/Desktop/Pocketcloud
bash setup.sh
```

---

### USB Drive Recovery

**When to use:** USB drive corrupted or unreadable.

```bash
# Check filesystem
sudo fsck /dev/sda1

# If corrupted beyond repair (DESTROYS ALL DATA!):
sudo mkfs.ext4 /dev/sda1

# Re-run setup
sudo bash setup/setup-usb-storage.sh
```

---

## 📋 Diagnostic Commands

### System Status Check
```bash
# Complete system overview
bash tools/system-status.sh

# Service status
sudo systemctl status pocketcloud

# Recent logs
sudo journalctl -u pocketcloud -n 50

# Real-time logs
sudo journalctl -u pocketcloud -f
```

### Storage Check
```bash
# USB devices
lsblk

# Mount points
df -h

# PocketCloud storage
ls -la /mnt/pocketcloud/

# Disk usage
du -sh /mnt/pocketcloud/*
```

### Network Check
```bash
# IP addresses
hostname -I

# Open ports
sudo netstat -tlnp | grep 3000

# Firewall status
sudo ufw status
```

### Database Check
```bash
# Check database file
ls -la data/pocketcloud.db

# Query files
sqlite3 data/pocketcloud.db "SELECT COUNT(*) FROM files;"
```

---

## 🆘 Getting Help

### Before Asking for Help

**Run these commands and include output:**

```bash
# System info
bash tools/system-status.sh

# Recent errors
sudo journalctl -u pocketcloud -n 20 --no-pager

# USB status
lsblk
df -h | grep pocketcloud

# Network status
hostname -I
sudo netstat -tlnp | grep 3000
```

### Common Command Reference

```bash
# Start PocketCloud (development)
npm start

# Start PocketCloud (service)
sudo systemctl start pocketcloud

# Stop PocketCloud
sudo systemctl stop pocketcloud

# Restart PocketCloud
sudo systemctl restart pocketcloud

# Check if running
sudo systemctl status pocketcloud

# View logs
sudo journalctl -u pocketcloud -f

# Update PocketCloud
git pull origin master

# Re-setup USB
sudo bash setup/setup-usb-storage.sh

# Complete reinstall
sudo bash setup/install.sh

# System status
bash tools/system-status.sh
```

---

## 📈 Performance Tips

### Optimize Upload/Download Speed

1. **Use USB 3.0 drive** (blue connector)
2. **Connect to USB 3.0 port** (blue port on Pi 4)
3. **Use wired Ethernet** instead of Wi-Fi when possible
4. **Close other applications** on Pi during large transfers

### Reduce USB Disconnections

1. **Use high-quality USB cable** (short, thick cables better)
2. **Use powered USB hub** for drives >32GB
3. **Ensure adequate power supply** (official Pi adapter)
4. **Avoid moving Pi** during file operations

---

*Last updated: February 7, 2026*  
*Based on real-world testing and user feedback*