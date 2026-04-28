# Restart script for Emberleaf Tea Co. (Windows PowerShell)

# 1. Stop existing processes
Write-Host "Stopping existing servers..." -ForegroundColor Cyan

$ports = @(8080, 5173)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($process) {
        foreach ($p in $process) {
            $pidToKill = $p.OwningProcess
            Write-Host "Killing process on port $port (PID: $pidToKill)..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    }
}

# 2. Start Backend
Write-Host "Starting Backend (Spring Boot)..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
# Using cmd /c to ensure mvn.cmd is found and executed correctly
Start-Process cmd -ArgumentList "/c D:\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run" -NoNewWindow

# 3. Start Frontend
Write-Host "Starting Frontend (Vite)..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
# Using cmd /c for npm.cmd
Start-Process cmd -ArgumentList "/c npm.cmd run dev" -NoNewWindow

Write-Host "Servers are restarting in the background." -ForegroundColor Green
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5173"
