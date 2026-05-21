#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME="0.0.0.0"

while true; do
  # Check if server is running
  if ! pgrep -f "next-server" > /dev/null 2>&1 || ! ss -tlnp | grep -q ":3000 "; then
    echo "$(date): Server not running, starting with double-fork..."
    (cd /home/z/my-project && PORT=3000 HOSTNAME="0.0.0.0" nohup node .next/standalone/server.js </dev/null >> /home/z/my-project/server.log 2>&1 &)
    # Wait for server to be ready
    for i in $(seq 1 10); do
      sleep 1
      if curl -s -o /dev/null http://127.0.0.1:3000/ --connect-timeout 1 2>/dev/null; then
        echo "$(date): Server ready!"
        break
      fi
    done
  fi
  sleep 10
done
