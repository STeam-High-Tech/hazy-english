#!/bin/bash

# Start backend
echo "Starting backend server..."
cd /app/backend

# Chạy backend và hiển thị log ra stdout/stderr để có thể xem bằng docker logs
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Lưu PID của uvicorn để có thể kiểm tra trạng thái sau này
UVICORN_PID=$!

echo "Backend server started with PID: $UVICORN_PID"

# Start nginx trong foreground để xem log
echo "Starting Nginx..."
nginx -g "daemon off;"

# Giữ container chạy
tail -f /dev/null