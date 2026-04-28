#!/bin/bash

# Restart script for Emberleaf Tea Co. (Bash/Git Bash)

echo "Stopping existing servers..."

# Ports: 8080 (Backend), 5173 (Frontend)
PORTS=(8080 5173)

for PORT in "${PORTS[@]}"
do
    # Use netstat -ano and findstr for Windows compatibility
    PID=$(netstat -ano | findstr ":$PORT" | findstr "LISTENING" | awk '{print $5}' | head -n 1)
    if [ ! -z "$PID" ]; then
        echo "Killing process on port $PORT (PID: $PID)..."
        taskkill -F -PID "$PID" 2>/dev/null
    fi
done

echo "Starting Backend..."
# Use full path to mvn if needed, or assume it's in PATH
cd backend && nohup cmd /c "D:\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run" > backend.log 2>&1 &
cd ..

echo "Starting Frontend..."
cd frontend && nohup cmd /c "npm.cmd run dev" > frontend.log 2>&1 &
cd ..

echo "Servers are restarting. Check logs (backend/backend.log, frontend/frontend.log) for status."
