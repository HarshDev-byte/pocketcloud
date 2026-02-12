# PocketCloud Windows Setup Guide

This guide will help you set up and run PocketCloud on Windows 10/11.

## Prerequisites

### System Requirements
- Windows 10/11 (64-bit)
- At least 4GB RAM
- External USB drive (32GB+ recommended)
- Internet connection (for initial setup only)

### Required Software
1. **Node.js 18+** (20 LTS recommended)
2. **Git for Windows**

## Step-by-Step Setup

### 1. Install Node.js

1. Go to https://nodejs.org/
2. Download **Node.js 20 LTS** (Long Term Support)
3. Run the installer with default settings
4. Verify installation:
   - Open Command Prompt
   - Run: `node -v` (should show v20.x.x)
   - Run: `npm -v` (should show version number)

### 2. Install Git

1. Go to https://git-scm.com/download/win
2. Download Git for Windows
3. Install with default settings

### 3. Download PocketCloud

1. **Open Command Prompt as Administrator**
2. Navigate to your desired location:
   ```cmd
   cd C:\
   mkdir PocketCloud
   cd PocketCloud
   ```
3. Clone the repository:
   ```cmd
   git clone https://github.com/HarshDev-byte/Pocketcloud.git .
   ```

### 4. Prepare USB Storage

1. **Connect your USB drive** to your computer
2. **Format the USB drive:**
   - Open File Explorer
   - Right-click on your USB drive
   - Select "Format"
   - Choose **NTFS** file system
   - Set label to "POCKETCLOUD"
   - Click "Start"
3. **Note the drive letter** (e.g., E:, F:, G:) - you'll need this later

### 5. Run Initial Setup

1. **In Command Prompt, run:**
   ```cmd
   windows-setup.bat
   ```
2. **Wait for dependencies to install** (this may take a few minutes)

### 6. Start PocketCloud

**Option A: With USB Drive (Recommended)**
```cmd
start-pocketcloud-windows.bat E:
```
Replace `E:` with your actual USB drive letter.

**Option B: Development Mode (Local Storage)**
```cmd
start-dev-windows.bat
```
This uses local storage instead of USB drive.

### 7. Access PocketCloud

1. **Open your web browser**
2. **Go to:** http://localhost:3000
3. **Create your account:**
   - Choose a username
   - Set a strong password (write it down!)
   - Click "Create Account"

## Daily Usage

### Starting PocketCloud
```cmd
cd C:\PocketCloud
start-pocketcloud-windows.bat E:
```
Replace `E:` with your USB drive letter.

### Stopping PocketCloud
Press `Ctrl+C` in the Command Prompt window.

### Accessing from Other Devices

1. **Find your computer's IP address:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" under your network adapter.

2. **On other devices (phone, tablet, laptop):**
   - Connect to the same Wi-Fi network
   - Open web browser
   - Go to: `http://[YOUR_IP]:3000`
   - Example: `http://192.168.1.100:3000`

## File Management

### Uploading Files
1. Open PocketCloud in your browser
2. Click "Upload Files"
3. Select files from your computer
4. Files are automatically encrypted and stored on your USB drive

### Downloading Files
1. Click on any file in your dashboard
2. Click "Download"
3. File is automatically decrypted and downloaded

### Storage Location
- **USB Mode:** Files stored on your USB drive in `\PocketCloud\uploads\`
- **Dev Mode:** Files stored in `backend\dev-storage\`

## Troubleshooting

### Common Issues

#### "Node.js is not installed"
- Install Node.js from https://nodejs.org/
- Restart Command Prompt after installation

#### "Drive not found"
- Check that USB drive is connected
- Verify the drive letter is correct
- Try a different USB port

#### "Failed to install dependencies"
- Check internet connection
- Run Command Prompt as Administrator
- Try running `npm install` manually in the backend folder

#### "Port 3000 already in use"
- Close other applications using port 3000
- Or change the port:
  ```cmd
  set PORT=8080
  start-pocketcloud-windows.bat E:
  ```

#### Can't access from phone/tablet
- Ensure all devices are on the same Wi-Fi network
- Check Windows Firewall settings
- Try disabling Windows Firewall temporarily for testing

### Windows Firewall Configuration

If you can't access PocketCloud from other devices:

1. **Open Windows Defender Firewall**
2. **Click "Allow an app or feature through Windows Defender Firewall"**
3. **Click "Change Settings"**
4. **Click "Allow another app..."**
5. **Browse to:** `C:\Program Files\nodejs\node.exe`
6. **Check both "Private" and "Public" boxes**
7. **Click "OK"**

### Performance Tips

- **Use USB 3.0 drive** for better performance
- **Connect USB drive to USB 3.0 port** (usually blue)
- **Use SSD instead of flash drive** for large files
- **Close unnecessary applications** during large file transfers

## Security Notes

### What PocketCloud Does
- ✅ Encrypts all files with AES-256-GCM
- ✅ Never stores your password
- ✅ Works completely offline after setup
- ✅ Stores everything on your USB drive

### Best Practices
- 🔒 Use a strong, unique password
- 💾 Make regular backups of your USB drive
- 🏠 Only access from trusted devices on your home network
- 🔐 Keep your computer physically secure

### What to Remember
- ⚠️ **No password recovery** - if you forget your password, your files are inaccessible
- 📱 **Local network only** - doesn't work over the internet
- 💾 **USB drive required** - files are stored on external drive, not your computer

## Backup Your Data

### Manual Backup
1. Copy the entire `PocketCloud` folder from your USB drive
2. Store the copy on another USB drive or external hard drive

### Automated Backup (Advanced)
Create a batch file to copy your data regularly:
```cmd
@echo off
set SOURCE=E:\PocketCloud
set BACKUP=F:\PocketCloud-Backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%
xcopy "%SOURCE%" "%BACKUP%" /E /I /Y
echo Backup completed to %BACKUP%
pause
```

## Updates

### Updating PocketCloud
```cmd
cd C:\PocketCloud
git pull origin master
windows-setup.bat
```

### Updating Node.js
1. Download latest version from https://nodejs.org/
2. Run installer (it will update existing installation)
3. Restart Command Prompt

## Getting Help

### Check System Status
```cmd
cd C:\PocketCloud\backend
npm run status
```

### View Logs
Check the Command Prompt window where PocketCloud is running for error messages.

### Common Commands
```cmd
REM Start PocketCloud with USB drive
start-pocketcloud-windows.bat E:

REM Start in development mode
start-dev-windows.bat

REM Check Node.js version
node -v

REM Check npm version
npm -v

REM Find your IP address
ipconfig
```

## Differences from Raspberry Pi Version

### What's Different
- Uses Windows batch files instead of shell scripts
- Storage path uses Windows drive letters (E:\, F:\, etc.)
- No systemd service (manual start/stop)
- Windows-compatible file paths

### What's the Same
- Same web interface
- Same encryption and security
- Same file upload/download functionality
- Same cross-device access

## Limitations on Windows

- **No automatic startup** - you need to start PocketCloud manually
- **No system service** - runs in Command Prompt window
- **Windows Firewall** may block network access initially
- **USB drive letters** may change if you connect other USB devices

## Advanced Configuration

### Custom Storage Location
```cmd
set STORAGE_PATH=D:\MyPocketCloudStorage
start-pocketcloud-windows.bat
```

### Custom Port
```cmd
set PORT=8080
start-pocketcloud-windows.bat E:
```

### Development Mode
```cmd
set NODE_ENV=development
set POCKETCLOUD_DEV_MODE=true
start-dev-windows.bat
```

---

## Summary

You now have PocketCloud running on Windows! Here's what you can do:

✅ **Upload and download files** through the web interface  
✅ **Access from any device** on your network  
✅ **Automatic file encryption** with military-grade security  
✅ **Completely offline operation** after initial setup  
✅ **Store everything on your USB drive** for portability  

**Enjoy your private, secure, Windows-based personal cloud!**

---

*Last updated: February 2026*
*Compatible with Windows 10/11 and Node.js 18+*