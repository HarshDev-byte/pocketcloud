@echo off
echo Setting up PocketCloud for Windows...

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo ERROR: Please run this script from the PocketCloud root directory
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Create necessary directories
echo Creating directories...
if not exist "data" mkdir data
if not exist "logs" mkdir logs
if not exist "temp" mkdir temp
if not exist "dev-storage" mkdir dev-storage

REM Set up environment variables
echo Setting up environment...
set NODE_ENV=production
set PORT=3000

echo.
echo Setup complete!
echo.
echo To start PocketCloud:
echo 1. Make sure your USB drive is connected
echo 2. Note the drive letter (e.g., E:, F:, G:)
echo 3. Run: start-pocketcloud-windows.bat [DRIVE_LETTER]
echo    Example: start-pocketcloud-windows.bat E:
echo.
pause