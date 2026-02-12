@echo off
setlocal enabledelayedexpansion

REM Check if drive letter is provided
if "%1"=="" (
    echo Usage: start-pocketcloud-windows.bat [DRIVE_LETTER]
    echo Example: start-pocketcloud-windows.bat E:
    echo.
    echo Available drives:
    wmic logicaldisk get size,freespace,caption
    pause
    exit /b 1
)

set USB_DRIVE=%1
if not "%USB_DRIVE:~-1%"==":" set USB_DRIVE=%USB_DRIVE%:

REM Check if USB drive exists
if not exist "%USB_DRIVE%\" (
    echo ERROR: Drive %USB_DRIVE% not found
    echo Please check that your USB drive is connected and note the correct drive letter
    echo.
    echo Available drives:
    wmic logicaldisk get size,freespace,caption
    pause
    exit /b 1
)

REM Create PocketCloud directory on USB drive
set STORAGE_PATH=%USB_DRIVE%\PocketCloud
if not exist "%STORAGE_PATH%" mkdir "%STORAGE_PATH%"
if not exist "%STORAGE_PATH%\uploads" mkdir "%STORAGE_PATH%\uploads"
if not exist "%STORAGE_PATH%\backups" mkdir "%STORAGE_PATH%\backups"

echo Starting PocketCloud...
echo Storage location: %STORAGE_PATH%
echo Web interface will be available at: http://localhost:3000
echo.

REM Set environment variables
set STORAGE_PATH=%STORAGE_PATH%
set NODE_ENV=production
set PORT=3000

REM Start the server
cd backend
node server-windows.js

pause