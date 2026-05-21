#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME="0.0.0.0"
export DATABASE_URL="file:/home/z/my-project/db/custom.db"
exec node .next/standalone/server.js >> /home/z/my-project/cron-server.log 2>&1
