#!/bin/bash
# Quick reference commands for Docker deployment
# HAUS Weather Station

# ====================
# LOCAL DEVELOPMENT
# ====================

# Build and start (development mode with docker-compose)
docker-compose up -d

# View logs (follow)
docker-compose logs -f

# View only backend logs
docker-compose logs -f weather-app | grep -i "backend"

# Restart container
docker-compose restart

# Stop and remove container
docker-compose down

# ====================
# BUILD COMMANDS
# ====================

# Build with docker-compose
docker-compose build

# Build with no cache (clean build)
docker-compose build --no-cache

# Build image directly
docker build -t haus-weather-station .

# Build with BuildKit (faster)
DOCKER_BUILDKIT=1 docker build -t haus-weather-station .

# ====================
# PRODUCTION BUILD
# ====================

# Build and tag for production
docker build -t haus-weather-station:latest .
docker tag haus-weather-station:latest ghcr.io/your-username/haus-weather-station:latest

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push to registry
docker push ghcr.io/your-username/haus-weather-station:latest

# ====================
# RUNNING CONTAINERS
# ====================

# Run container manually
docker run -d \
  --name haus-weather \
  -p 80:80 \
  -e NODE_ENV=production \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  --restart unless-stopped \
  haus-weather-station:latest

# Run from registry
docker run -d \
  --name haus-weather \
  -p 80:80 \
  -e NODE_ENV=production \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  --restart unless-stopped \
  ghcr.io/your-username/haus-weather-station:latest

# ====================
# DEBUGGING
# ====================

# Access container shell
docker exec -it haus-weather-station sh

# Check container health
docker ps
docker inspect --format='{{json .State.Health}}' haus-weather-station | jq

# Test health endpoints
curl http://localhost/health
curl http://localhost/api/health

# View real-time logs
docker logs -f haus-weather-station

# Check resource usage
docker stats haus-weather-station

# ====================
# MAINTENANCE
# ====================

# Update and restart
git pull
docker-compose up -d --build

# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Remove old images
docker image prune -f

# Full cleanup (WARNING: removes all unused Docker resources)
docker system prune -af

# ====================
# VERIFICATION
# ====================

# Verify nginx config
docker exec haus-weather-station nginx -t

# Check backend connectivity
docker exec haus-weather-station wget -qO- http://localhost:3001/api/health

# List running processes in container
docker exec haus-weather-station ps aux

# Check Node.js version
docker exec haus-weather-station node --version

# Check nginx version
docker exec haus-weather-station nginx -v

# ====================
# NOTES
# ====================
# - Default port: 80 (HTTP)
# - Backend runs on: 3001 (internal)
# - Health check: /api/health
# - nginx serves frontend and proxies /api/* to backend
# - See DEPLOYMENT.md for full documentation