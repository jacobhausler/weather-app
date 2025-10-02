# Multi-stage Dockerfile for HAUS Weather Station
# Builds frontend (Vite) and backend (Node.js), serves via nginx

# ============================================
# Stage 1: Build Frontend (React + Vite)
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY tsconfig.json tsconfig.node.json ./
COPY vite.config.ts tailwind.config.js components.json postcss.config.js ./
COPY index.html ./

# Install frontend dependencies
RUN npm ci --only=production=false

# Copy frontend source code and public assets
COPY src ./src
COPY public ./public

# Build frontend for production
RUN npm run build

# ============================================
# Stage 2: Build Backend (Node.js + TypeScript)
# ============================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install backend dependencies
RUN npm ci --only=production=false

# Copy backend source code
COPY server/src ./src

# Build backend TypeScript to JavaScript
RUN npm run build

# Install production dependencies only (clean install)
RUN npm ci --only=production && npm cache clean --force

# ============================================
# Stage 3: Production Runtime with nginx
# ============================================
FROM nginx:1.25-alpine AS production

# Install Node.js runtime for backend server
RUN apk add --no-cache nodejs npm

# Create app directory
WORKDIR /app

# Copy backend built files and dependencies from backend-builder
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/

# Copy frontend built files to nginx html directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY <<'EOF' /usr/local/bin/docker-entrypoint.sh
#!/bin/sh
set -e

echo "Starting HAUS Weather Station..."

# Start backend server in background
cd /app/backend
NODE_ENV=production node dist/index.js &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"

# Start nginx in foreground
echo "Starting nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

echo "nginx started with PID: $NGINX_PID"

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
EOF

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 80 for nginx
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/api/health || exit 1

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]