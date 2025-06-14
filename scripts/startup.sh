#!/bin/bash

# Start backend
cd /app/backend
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /var/log/backend.log 2>&1 &

# Start nginx
nginx -g "daemon off;"
