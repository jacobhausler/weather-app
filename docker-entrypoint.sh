#!/bin/sh
set -e

# Start nginx in the background
echo "Starting nginx..."
nginx

# Start the backend server
echo "Starting backend server..."
cd /app/server
exec node dist/index.js