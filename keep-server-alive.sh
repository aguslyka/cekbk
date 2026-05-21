#!/bin/bash
while true; do
    if ! curl -s -o /dev/null -w "" http://localhost:3000/ 2>/dev/null; then
        echo "[$(date)] Server not responding, starting..."
        cd /home/z/my-project
        PORT=3000 HOSTNAME="0.0.0.0" DATABASE_URL="file:/home/z/my-project/db/custom.db" \
        node .next/standalone/server.js >> /home/z/my-project/server.log 2>&1 &
        sleep 5
    fi
    sleep 10
done
