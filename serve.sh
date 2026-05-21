#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME="0.0.0.0"
while true; do
  echo "$(date): Starting production server..."
  node .next/standalone/server.js 2>&1
  EXIT_CODE=$?
  echo "$(date): Server exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done
