#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME="0.0.0.0"

# Check if build exists
if [ ! -f ".next/standalone/server.js" ]; then
  echo "Building production server..."
  npx next build
  cp -r .next/static .next/standalone/.next/ 2>/dev/null
  cp -r public .next/standalone/ 2>/dev/null
fi

# Double-fork technique to re-parent to init
(cd /home/z/my-project && PORT=3000 HOSTNAME="0.0.0.0" nohup node .next/standalone/server.js </dev/null >> /home/z/my-project/server.log 2>&1 &)

# Wait for server to be ready
for i in $(seq 1 30); do
  sleep 2
  if ss -tlnp | grep -q ":3000 "; then
    echo "Server ready on port 3000!"
    break
  fi
done
