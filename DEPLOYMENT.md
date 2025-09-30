# HAUS Weather Station - Deployment Guide

This guide covers deploying the HAUS Weather Station using Docker and docker-compose.

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Build and Run

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost` (port 80).

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a 3-stage build process:

1. **Stage 1: Frontend Builder**
   - Base: `node:18-alpine`
   - Builds React application with Vite
   - Output: Optimized static files in `/dist`

2. **Stage 2: Backend Builder**
   - Base: `node:18-alpine`
   - Compiles TypeScript backend to JavaScript
   - Installs production-only dependencies
   - Output: Compiled Node.js application

3. **Stage 3: Production Runtime**
   - Base: `nginx:1.25-alpine`
   - Installs Node.js runtime for backend
   - Runs both nginx (frontend) and Node.js (backend)
   - Single container deployment

### Container Structure

```
/usr/share/nginx/html/     # Frontend static files (served by nginx)
/app/backend/              # Backend Node.js application
  ├── dist/                # Compiled JavaScript
  ├── node_modules/        # Production dependencies
  └── package.json
```

## Configuration

### Environment Variables

Configure via `docker-compose.yml` or pass directly:

```yaml
environment:
  # Backend Server
  - NODE_ENV=production
  - PORT=3001
  - HOST=0.0.0.0

  # NWS API
  - NWS_API_BASE_URL=https://api.weather.gov
  - NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)

  # Cache Configuration
  - CACHED_ZIP_CODES=75454,75070,75035
  - CACHE_POINTS_DURATION=1440      # minutes
  - CACHE_FORECAST_DURATION=60
  - CACHE_OBSERVATIONS_DURATION=10
  - CACHE_METADATA_DURATION=10080

  # Server Settings
  - SERVER_REFRESH_INTERVAL=5        # minutes

  # CORS (optional)
  - CORS_ORIGIN=http://localhost,http://192.168.1.100
```

### Port Mapping

Default: Port 80 (HTTP)

To change the external port:

```yaml
ports:
  - "8080:80"  # Access at http://localhost:8080
```

## Build Commands

### Local Build

```bash
# Build image locally
docker build -t haus-weather-station .

# Run manually
docker run -d \
  -p 80:80 \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  --name weather-app \
  haus-weather-station
```

### Build Arguments

Currently no build args required, but can be added:

```dockerfile
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine AS frontend-builder
```

```bash
docker build --build-arg NODE_VERSION=20 -t haus-weather-station .
```

## Production Deployment

### Push to Registry

```bash
# Tag image
docker tag haus-weather-station ghcr.io/your-username/haus-weather-station:latest

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push image
docker push ghcr.io/your-username/haus-weather-station:latest
```

### Pull and Run on Server

```bash
# On production server
docker pull ghcr.io/your-username/haus-weather-station:latest

docker run -d \
  --name haus-weather \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  ghcr.io/your-username/haus-weather-station:latest
```

### docker-compose in Production

Update `docker-compose.yml` to use registry image:

```yaml
services:
  weather-app:
    image: ghcr.io/your-username/haus-weather-station:latest
    # Remove 'build' section
    restart: unless-stopped
    # ... rest of config
```

Then deploy:

```bash
docker-compose pull
docker-compose up -d
```

## Health Checks

### Container Health

```bash
# Check container health status
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' haus-weather-station | jq
```

### Manual Health Check

```bash
# nginx health
curl http://localhost/health

# Backend API health
curl http://localhost/api/health
```

Health check runs every 30 seconds:
- URL: `http://localhost/api/health`
- Timeout: 3 seconds
- Retries: 3
- Start period: 10 seconds

## Troubleshooting

### View Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f weather-app | grep "Backend"

# nginx only
docker-compose logs -f weather-app | grep "nginx"
```

### Container Shell Access

```bash
# Access running container
docker exec -it haus-weather-station sh

# Check backend process
ps aux | grep node

# Check nginx process
ps aux | grep nginx

# Test backend connectivity
wget -qO- http://localhost:3001/api/health
```

### Common Issues

**Backend not starting:**
```bash
# Check backend logs
docker exec haus-weather-station cat /proc/$(pgrep node)/fd/1

# Verify Node.js installation
docker exec haus-weather-station node --version
```

**nginx not proxying:**
```bash
# Test nginx config
docker exec haus-weather-station nginx -t

# Check backend connectivity from container
docker exec haus-weather-station wget -qO- http://localhost:3001/api/health
```

**Build failures:**
```bash
# Clean build (no cache)
docker-compose build --no-cache

# Check for missing files
docker-compose build --progress=plain
```

## Resource Usage

Default limits (adjust in docker-compose.yml):

- **CPU**: 1.0 core limit, 0.25 core reserved
- **Memory**: 512MB limit, 128MB reserved

Monitor resource usage:

```bash
docker stats haus-weather-station
```

## Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or with no-cache
docker-compose build --no-cache
docker-compose up -d
```

### Cleanup

```bash
# Stop and remove container
docker-compose down

# Remove volumes (if using)
docker-compose down -v

# Remove images
docker rmi haus-weather-station

# Full cleanup
docker system prune -af
```

## GitHub Actions CI/CD

Example workflow for automated builds:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
```

## Security Considerations

1. **User Agent**: Update `NWS_USER_AGENT` with valid contact information
2. **CORS**: Restrict `CORS_ORIGIN` to known domains in production
3. **nginx**: Consider adding SSL/TLS termination (use nginx-proxy or traefik)
4. **Updates**: Regularly update base images for security patches
5. **Secrets**: Never commit `.env` files with sensitive data

## Performance Optimization

### Build Performance

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t haus-weather-station .

# Multi-platform builds (if needed)
docker buildx build --platform linux/amd64,linux/arm64 -t haus-weather-station .
```

### Runtime Performance

- Enable gzip compression (already configured in nginx.conf)
- Use HTTP/2 (requires SSL/TLS)
- Configure nginx worker processes based on CPU cores
- Adjust cache durations based on usage patterns

## Support

For issues or questions:
- Check container logs: `docker-compose logs -f`
- Verify health endpoints: `/health` and `/api/health`
- Review nginx config: `docker exec haus-weather-station cat /etc/nginx/nginx.conf`
