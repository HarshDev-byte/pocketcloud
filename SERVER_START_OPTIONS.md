# 🚀 PocketCloud Server Start Options

## Quick Server Start Commands

### **Ultra Simple (3 seconds)**
```bash
./start-server.sh
```
- Just starts the server
- No checks, no setup
- Assumes everything is ready

### **Smart Start (with checks)**
```bash
./run-server.sh
```
- Checks if Node.js is installed
- Installs dependencies if missing
- Shows access URLs
- Displays logs in real-time

### **Full Setup + Start**
```bash
./start-pocketcloud.sh
```
- Complete setup if first time
- Installs all dependencies
- Configures everything
- Starts server

## NPM Commands

```bash
npm run quick      # Ultra simple start
npm run server     # Smart start with checks
npm start          # Full setup + start
```

## What Each Does

| Command | Setup | Checks | Dependencies | Logs | Best For |
|---------|-------|--------|--------------|------|----------|
| `./start-server.sh` | ❌ | ❌ | ❌ | ✅ | Quick restart |
| `./run-server.sh` | ❌ | ✅ | ✅ | ✅ | Daily use |
| `./start-pocketcloud.sh` | ✅ | ✅ | ✅ | ✅ | First time |

## Usage Examples

### **Just want to start the server quickly:**
```bash
./start-server.sh
```

### **Want to make sure everything is working:**
```bash
./run-server.sh
```

### **First time or complete setup:**
```bash
./start-pocketcloud.sh
```

## Access Your Server

Once any script runs successfully:
- **Local**: http://localhost:3000
- **Network**: http://[YOUR_IP]:3000

## Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

---

**Choose the command that fits your needs! 🎯**