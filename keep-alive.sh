#!/bin/bash
cd /home/z/my-project
while true; do
  # Start the server
  npx next dev -p 3000 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    sleep 2
    if ss -tlnp | grep -q ":3000 "; then
      echo "Server is ready on port 3000"
      break
    fi
  done
  
  # Wait for the server to die
  wait $SERVER_PID 2>/dev/null
  echo "Server died, restarting in 3 seconds..."
  sleep 3
done
