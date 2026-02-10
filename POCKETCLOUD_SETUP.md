# 🚀 PocketCloud Project Setup for Raspberry Pi

This guide will help you set up and run the complete PocketCloud project on your Raspberry Pi, including drive verification, dependency installation, configuration, and service startup.

---

## 📋 Prerequisites

- Raspberry Pi (3B+ or 4 recommended)
- USB drive set up with `setup-usb-drive.sh` (see USB_DRIVE_SETUP.md)
- Raspberry Pi OS (Bullseye or newer)
- Internet connection for initial setup
- At least 2GB RAM (4GB+ recommended for Pi 4)

---

## 🚀 Quick Setup

Run the automated setup script:

```bash
sudo ./setup-pocketcloud.sh
```

The script will:
1. ✅ Verify USB drive is properly mounted
2. ✅ Install all system dependencies (Node.js, FFmpeg, etc.)
3. ✅ Install project dependencies (npm packages)
4. ✅ Configure storage paths and environment
5. ✅ Set up database and run migrations
6. ✅ Configure systemd services for auto-start
7. ✅ Start PocketCloud services
8. ✅ Verify everything is working

---

## 📖 Manual Setup Guide

### Step 1: Verify USB Drive Setup

First, ensure your USB drive is properly set up:

```bash
# Check if drive is mounted
./monitor-usb-drive.sh

# Should show drive mounted at /mnt/pocketcloud-storage
# with directories: uploads, encrypted, thumbnails, temp, backups
```

If the drive is not set up, run:
```bash
sudo ./setup-usb-drive.sh
```

### Step 2: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install System Dependencies

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg for media processing
sudo apt install -y ffmpeg

# Install additional tools
sudo apt install -y git sqlite3 build-essential python3-dev

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 4: Clone and Setup Project

```bash
# If you haven't already, clone your project
# git clone <your-repo-url> pocketcloud
cd pocketcloud

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 5: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Update the following in `.env`:
```bash
# Storage paths (USB drive)
STORAGE_PATH=/mnt/pocketcloud-storage/uploads
ENCRYPTED_PATH=/mnt/pocketcloud-storage/encrypted
THUMBNAIL_PATH=/mnt/pocketcloud-storage/thumbnails
TEMP_PATH=/mnt/pocketcloud-storage/temp
BACKUP_PATH=/mnt/pocketcloud-storage/backups

# Database path (USB drive for persistence)
DATABASE_PATH=/mnt/pocketcloud-storage/pocketcloud.db

# Server configuration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Security
SESSION_SECRET=your-super-secret-session-key-change-this
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Pi-specific optimizations
MAX_CONCURRENT_UPLOADS=2
THUMBNAIL_QUALITY=80
VIDEO_TRANSCODE_PRESET=ultrafast
```

### Step 6: Configure Storage Paths

```bash
# Copy the generated storage config
cp storage-config.js backend/src/config/storage.js

# Or create manually
cat > backend/src/config/storage.js << 'EOF'
module.exports = {
  STORAGE_PATH: '/mnt/pocketcloud-storage/uploads',
  ENCRYPTED_PATH: '/mnt/pocketcloud-storage/encrypted',
  THUMBNAIL_PATH: '/mnt/pocketcloud-storage/thumbnails',
  TEMP_PATH: '/mnt/pocketcloud-storage/temp',
  BACKUP_PATH: '/mnt/pocketcloud-storage/backups',
  
  // Pi-optimized settings
  MAX_FILE_SIZE: '500MB',
  THUMBNAIL_SIZES: {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 800, height: 600 }
  },
  
  // Performance settings for Pi
  CONCURRENT_OPERATIONS: 2,
  MEMORY_LIMIT: '512MB',
  TEMP_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
};
EOF
```

### Step 7: Initialize Database

```bash
cd backend

# Create database directory on USB drive
mkdir -p /mnt/pocketcloud-storage/database

# Initialize database
node -e "
const { initDatabase } = require('./src/config/database');
initDatabase().then(() => {
  console.log('Database initialized successfully');
  process.exit(0);
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
"
```

### Step 8: Build Frontend

```bash
cd frontend
npm run build

# Copy built files to backend public directory
cp -r dist/* ../backend/public/
cd ..
```

### Step 9: Set Up System Services

Create systemd service for auto-start:

```bash
sudo tee /etc/systemd/system/pocketcloud.service > /dev/null << 'EOF'
[Unit]
Description=PocketCloud Personal Cloud Storage
After=network.target
Wants=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pocketcloud/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

# Resource limits for Pi
LimitNOFILE=65536
MemoryLimit=1G

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pocketcloud

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pocketcloud
sudo systemctl start pocketcloud
```

### Step 10: Configure Nginx (Optional)

For better performance and HTTPS:

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/pocketcloud > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Increase upload size
    client_max_body_size 500M;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Serve static files directly
    location /static/ {
        alias /home/pi/pocketcloud/backend/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/pocketcloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔧 Configuration

### Performance Optimization for Raspberry Pi

Edit `backend/src/config/config.js`:

```javascript
module.exports = {
  // Server settings
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  
  // Pi-specific optimizations
  MAX_CONCURRENT_UPLOADS: 2,
  MAX_CONCURRENT_DOWNLOADS: 3,
  THUMBNAIL_WORKERS: 1,
  VIDEO_TRANSCODE_WORKERS: 1,
  
  // Memory management
  MEMORY_LIMIT: '512MB',
  TEMP_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  
  // Database settings
  DB_POOL_SIZE: 5,
  DB_TIMEOUT: 30000,
  
  // Security
  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  
  // File upload limits
  MAX_FILE_SIZE: '500MB',
  ALLOWED_EXTENSIONS: [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.mp4', '.avi', '.mkv', '.mov', '.webm',
    '.mp3', '.wav', '.flac', '.aac', '.ogg',
    '.pdf', '.doc', '.docx', '.txt', '.zip'
  ]
};
```

### Memory and CPU Optimization

Create `backend/ecosystem.config.js` for PM2:

```javascript
module.exports = {
  apps: [{
    name: 'pocketcloud',
    script: 'server.js',
    cwd: '/home/pi/pocketcloud/backend',
    instances: 1,
    exec_mode: 'fork',
    
    // Pi-specific settings
    max_memory_restart: '800MB',
    node_args: '--max-old-space-size=512',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logging
    log_file: '/var/log/pocketcloud/combined.log',
    out_file: '/var/log/pocketcloud/out.log',
    error_file: '/var/log/pocketcloud/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'temp'],
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

---

## 🛠️ Management Commands

### Service Management

```bash
# Check service status
sudo systemctl status pocketcloud

# View logs
sudo journalctl -u pocketcloud -f

# Restart service
sudo systemctl restart pocketcloud

# Stop service
sudo systemctl stop pocketcloud
```

### Using PM2 (Alternative)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs pocketcloud

# Restart
pm2 restart pocketcloud

# Save PM2 configuration
pm2 save
pm2 startup
```

### Database Management

```bash
# Backup database
sqlite3 /mnt/pocketcloud-storage/pocketcloud.db ".backup /mnt/pocketcloud-storage/backups/db_backup_$(date +%Y%m%d_%H%M%S).db"

# Check database integrity
sqlite3 /mnt/pocketcloud-storage/pocketcloud.db "PRAGMA integrity_check;"

# Vacuum database (optimize)
sqlite3 /mnt/pocketcloud-storage/pocketcloud.db "VACUUM;"
```

---

## 📊 Monitoring

### System Resources

```bash
# Monitor CPU and memory
htop

# Monitor disk I/O
sudo iotop

# Monitor network
sudo nethogs

# Check temperature
vcgencmd measure_temp
```

### PocketCloud Monitoring

```bash
# Check drive status
./monitor-usb-drive.sh

# Check service logs
sudo journalctl -u pocketcloud --since "1 hour ago"

# Monitor file uploads
tail -f /var/log/pocketcloud/out.log

# Check database size
ls -lh /mnt/pocketcloud-storage/pocketcloud.db
```

---

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status pocketcloud

# Check logs
sudo journalctl -u pocketcloud -n 50

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Test manual start
cd /home/pi/pocketcloud/backend
node server.js
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Restart service to clear memory
sudo systemctl restart pocketcloud

# Reduce concurrent operations in config
```

### Slow Performance

```bash
# Check CPU temperature
vcgencmd measure_temp

# Check disk I/O
sudo iotop

# Monitor USB drive performance
sudo hdparm -tT /dev/sda

# Check for swap usage
swapon --show
```

### Database Issues

```bash
# Check database file
ls -la /mnt/pocketcloud-storage/pocketcloud.db

# Test database connection
sqlite3 /mnt/pocketcloud-storage/pocketcloud.db ".tables"

# Repair database if corrupted
sqlite3 /mnt/pocketcloud-storage/pocketcloud.db ".recover" | sqlite3 recovered.db
```

---

## 🌐 Access Your PocketCloud

Once setup is complete:

- **Local access**: `http://raspberry-pi-ip:3000`
- **With Nginx**: `http://raspberry-pi-ip`
- **Find Pi IP**: `hostname -I`

### First Time Setup

1. Open PocketCloud in your browser
2. Create your admin account
3. Configure encryption settings
4. Start uploading files!

---

## 🔄 Updates

### Update PocketCloud

```bash
cd /home/pi/pocketcloud

# Pull latest changes
git pull origin main

# Update dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Copy built files
cp -r frontend/dist/* backend/public/

# Restart service
sudo systemctl restart pocketcloud
```

### Update System

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js if needed
sudo npm install -g n
sudo n stable

# Restart services
sudo systemctl restart pocketcloud
```

---

## 📋 Maintenance Checklist

### Daily
- [ ] Check service status: `sudo systemctl status pocketcloud`
- [ ] Monitor drive space: `df -h /mnt/pocketcloud-storage`

### Weekly
- [ ] Check drive health: `./monitor-usb-drive.sh`
- [ ] Review logs: `sudo journalctl -u pocketcloud --since "1 week ago"`
- [ ] Clean temp files: `rm -rf /mnt/pocketcloud-storage/temp/*`

### Monthly
- [ ] Backup database
- [ ] Check for system updates: `sudo apt update && sudo apt list --upgradable`
- [ ] Monitor Pi temperature: `vcgencmd measure_temp`
- [ ] Vacuum database: `sqlite3 /mnt/pocketcloud-storage/pocketcloud.db "VACUUM;"`

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs: `sudo journalctl -u pocketcloud -f`
3. Check drive status: `./monitor-usb-drive.sh`
4. Monitor system resources: `htop`
5. Check Pi temperature: `vcgencmd measure_temp`

---

**Your PocketCloud is now ready to serve your files! 🎉**

Access it at `http://your-pi-ip:3000` and start building your personal cloud.