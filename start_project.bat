@echo off
echo Starting TMUA Prep Platform...

:: Start Backend
echo Starting Backend Server...
start "TMUA Backend" cmd /k "cd server && npm run dev"

:: Start Frontend
echo Starting Frontend Client...
start "TMUA Frontend" cmd /k "cd client && npm run dev"

echo.
echo Both services are starting...
echo Backend will be at http://localhost:5000
echo Frontend will be at http://localhost:5173 (or similar)
echo.
pause
