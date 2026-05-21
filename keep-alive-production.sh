#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME="0.0.0.0"

while true; do
  # Check if server is already running
  if pgrep -f "next-server" > /dev/null 2>&1 && ss -tlnp | grep -q ":3000 "; then
    # Server is running, just keep alive
    wget -q -O /dev/null http://127.0.0.1:3000/api/admin/settings --timeout=5 2>/dev/null || true
    sleep 15
    continue
  fi

  # Server not running, start it
  echo "$(date): Starting production server..."
  nohup node .next/standalone/server.js > /home/z/my-project/server.log 2>&1 & disown -a
  
  # Wait for it to be ready
  for i in $(seq 1 30); do
    sleep 2
    if ss -tlnp | grep -q ":3000 "; then
      echo "$(date): Server is ready on port 3000!"
      break
    fi
  done

  sleep 5
done
