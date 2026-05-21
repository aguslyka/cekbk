#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME="0.0.0.0"
export DATABASE_URL="file:/home/z/my-project/db/custom.db"

while true; do
    echo "[$(date)] Starting Next.js production server..."
    node .next/standalone/server.js 2>&1
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 3 seconds..."
    sleep 3
done
