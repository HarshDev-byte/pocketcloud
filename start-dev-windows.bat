@echo off
echo Starting PocketCloud in Development Mode...
echo This will use local storage instead of USB drive
echo.

REM Set development environment
set NODE_ENV=development
set POCKETCLOUD_DEV_MODE=true
set PORT=3000

echo Web interface will be available at: http://localhost:3000
echo Storage location: ./backend/dev-storage
echo.

REM Start the server
cd backend
node server-windows.js

pause