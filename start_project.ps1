Write-Host "Starting TMUA Prep Platform..."

# Start Backend
Write-Host "Starting Backend Server..."
Start-Process cmd -ArgumentList "/k title TMUA Backend && cd server && npm run dev"

# Start Frontend
Write-Host "Starting Frontend Client..."
Start-Process cmd -ArgumentList "/k title TMUA Frontend && cd client && npm run dev"

Write-Host "Both services are starting..."
Write-Host "Backend will be at http://localhost:5000"
Write-Host "Frontend will be at http://localhost:5173 (or similar)"
