# HAUS Weather Station - Deployment Guide

This guide covers deploying the HAUS Weather Station using Docker and docker-compose.

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- npm 9+ (for local development)
- PostCSS (installed automatically via npm dependencies)

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

#### Backend Environment Variables

```yaml
environment:
  # Backend Server
  - NODE_ENV=production
  - PORT=3001
  - HOST=0.0.0.0

  # NWS API
  - NWS_API_BASE_URL=https://api.weather.gov
  - NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)

  # Optional: OpenWeatherMap API (for UV Index data)
  - OPENWEATHER_API_KEY=your_api_key_here  # Optional, UV data unavailable without it

  # Cache Configuration
  - CACHED_ZIP_CODES=75454,75070,75035
  - CACHE_POINTS_DURATION=1440      # minutes
  - CACHE_FORECAST_DURATION=60
  - CACHE_OBSERVATIONS_DURATION=10
  - CACHE_METADATA_DURATION=10080

  # Server Settings
  - SERVER_REFRESH_INTERVAL=5        # minutes

  # CORS Configuration
  - CORS_ORIGIN=http://localhost,http://192.168.1.100
  # Default: Allows localhost and common local network IPs
  # Production: Set to your domain(s), comma-separated
```

**Important Notes:**
- `NWS_USER_AGENT` is **required** by the NWS API. Use a valid contact email.
- `OPENWEATHER_API_KEY` is **optional**. Without it, UV Index data will not be available.
- `CORS_ORIGIN` defaults to allowing localhost. In production, restrict to your domain(s).

#### Frontend Environment Variables (Build-time)

Frontend environment variables are set at **build time** (not runtime) and must be prefixed with `VITE_`:

```bash
# Set during docker build (if needed)
VITE_API_BASE_URL=/api  # Default, proxied by nginx
```

**Note**: The frontend is built as static files and cannot access runtime environment variables. All configuration happens during the Docker build stage.

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
  -e OPENWEATHER_API_KEY="your_api_key_here" \
  --name haus-weather-station \
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
docker tag haus-weather-station ghcr.io/yourusername/weather-app:latest

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# Push image
docker push ghcr.io/yourusername/weather-app:latest
```

### Pull and Run on Server

```bash
# On production server
docker pull ghcr.io/yourusername/weather-app:latest

docker run -d \
  --name haus-weather-station \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  -e OPENWEATHER_API_KEY="your_api_key_here" \
  ghcr.io/yourusername/weather-app:latest
```

### docker-compose in Production

Update `docker-compose.yml` to use registry image:

```yaml
services:
  weather-app:
    image: ghcr.io/yourusername/weather-app:latest
    container_name: haus-weather-station
    # Remove 'build' section
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)
      - OPENWEATHER_API_KEY=your_api_key_here  # Optional
      # ... rest of config
```

Then deploy:

```bash
docker-compose pull
docker-compose up -d
```

## Health Checks

The application provides two health check endpoints for monitoring:

### Health Check Endpoints

**1. nginx Health Check** (`/health`)
- **URL**: `http://localhost/health`
- **Purpose**: Verifies nginx is running and responding
- **Response**: Plain text "healthy"
- **Use case**: Quick check that the container web server is up

**2. Backend API Health Check** (`/api/health`)
- **URL**: `http://localhost/api/health`
- **Purpose**: Verifies backend Node.js server is running and responding
- **Response**: JSON with status and timestamp
- **Use case**: Verify API is functional, used by Docker health checks

### Container Health

The Docker container uses `/api/health` for automated health monitoring:

```bash
# Check container health status
docker ps

# View detailed health check logs
docker inspect --format='{{json .State.Health}}' haus-weather-station | jq
```

### Manual Health Check

```bash
# nginx health (quick check)
curl http://localhost/health

# Backend API health (full check)
curl http://localhost/api/health
```

**Health Check Configuration:**
- URL: `http://localhost/api/health`
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3
- Start period: 10 seconds

If the backend fails to respond, the container will be marked as unhealthy (but will continue running).

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

This project includes a comprehensive CI/CD pipeline defined in `.github/workflows/deploy.yml`.

### Pipeline Overview

The workflow runs on every push to `main` and on pull requests:

**Stage 1: Frontend Build & Test**
- Type checking with TypeScript
- Linting with ESLint
- Running test suite (Vitest)
- Building production bundle
- Uploading build artifacts

**Stage 2: Backend Build & Test**
- Type checking with TypeScript
- Linting with ESLint
- Running test suite (Vitest)
- Compiling TypeScript to JavaScript
- Uploading build artifacts

**Stage 3: Docker Build & Push** (main branch only)
- Building multi-stage Docker image
- Tagging with commit SHA and `latest`
- Pushing to GitHub Container Registry (GHCR)
- Using GitHub Actions cache for faster builds

### Image Tagging Strategy

The pipeline creates two tags for each build:

1. **Commit SHA Tag**: `ghcr.io/username/weather-app:abc123def456...` (full 40-char SHA)
   - Allows pinning to specific versions
   - Immutable reference to exact code state

2. **Latest Tag**: `ghcr.io/username/weather-app:latest`
   - Always points to the most recent main branch build
   - Convenient for development and auto-updating deployments

**Example tags:**
```bash
# SHA tag (specific version)
ghcr.io/yourusername/weather-app:903e2897abc123def456...

# Latest tag (rolling)
ghcr.io/yourusername/weather-app:latest
```

### Running the Workflow

The workflow runs automatically, but you can also trigger it manually:

```bash
# Push to main branch
git push origin main

# Or create a pull request
gh pr create --title "Update feature" --body "Description"
```

### Workflow Configuration

Located at `.github/workflows/deploy.yml`:

```yaml
name: Build, Test, and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  frontend:
    name: Frontend Build & Test
    # ... type-check, lint, test, build

  backend:
    name: Backend Build & Test
    # ... type-check, lint, test, build

  docker:
    name: Build & Push Docker Image
    needs: [frontend, backend]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # ... build and push to GHCR
```

### Using the Published Image

After the workflow completes, pull and run the image:

```bash
# Pull latest version
docker pull ghcr.io/yourusername/weather-app:latest

# Or pull specific version by SHA
docker pull ghcr.io/yourusername/weather-app:903e2897abc123...

# Run the container
docker run -d \
  --name haus-weather-station \
  -p 80:80 \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  ghcr.io/yourusername/weather-app:latest
```

## Reverse Proxy & SSL/TLS

For production deployments, you'll typically want to:
1. Run the container behind a reverse proxy (Traefik, nginx-proxy, Caddy)
2. Add SSL/TLS certificates for HTTPS
3. Optionally change the port mapping

### Option 1: Traefik (Recommended for Docker)

**docker-compose.yml** with Traefik labels:

```yaml
services:
  weather-app:
    image: ghcr.io/yourusername/weather-app:latest
    container_name: haus-weather-station
    restart: unless-stopped
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.weather.rule=Host(`weather.yourdomain.com`)"
      - "traefik.http.routers.weather.entrypoints=websecure"
      - "traefik.http.routers.weather.tls.certresolver=letsencrypt"
      - "traefik.http.services.weather.loadbalancer.server.port=80"
    environment:
      - NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)
      - CORS_ORIGIN=https://weather.yourdomain.com

networks:
  traefik:
    external: true
```

### Option 2: nginx-proxy with Let's Encrypt

```yaml
services:
  weather-app:
    image: ghcr.io/yourusername/weather-app:latest
    container_name: haus-weather-station
    restart: unless-stopped
    networks:
      - proxy
    environment:
      - VIRTUAL_HOST=weather.yourdomain.com
      - LETSENCRYPT_HOST=weather.yourdomain.com
      - LETSENCRYPT_EMAIL=your-email@example.com
      - NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)
      - CORS_ORIGIN=https://weather.yourdomain.com

networks:
  proxy:
    external: true
```

### Option 3: Caddy (Simplest, automatic HTTPS)

**Caddyfile:**

```caddy
weather.yourdomain.com {
    reverse_proxy haus-weather-station:80
}
```

## nginx Customization

The default `nginx.conf` is baked into the Docker image. To customize:

### Option 1: Volume Mount (Runtime Override)

Create a custom `nginx.conf` and mount it:

```yaml
services:
  weather-app:
    # ... other config
    volumes:
      - ./custom-nginx.conf:/etc/nginx/nginx.conf:ro
```

### Option 2: Rebuild with Custom Config

1. Copy `nginx.conf` from the repo
2. Make your modifications
3. Rebuild the image:

```bash
docker build -t weather-app-custom .
```

### Common Customizations

**Enable HTTP/2:**
```nginx
listen 443 ssl http2;
```

**Adjust worker processes:**
```nginx
worker_processes 2;  # Default: auto
```

**Custom security headers:**
```nginx
add_header Strict-Transport-Security "max-age=31536000" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

**Adjust timeouts:**
```nginx
proxy_connect_timeout 120s;
proxy_read_timeout 120s;
```

## Security Considerations

1. **User Agent**: Update `NWS_USER_AGENT` with valid contact information
2. **CORS**: Restrict `CORS_ORIGIN` to known domains in production
3. **API Keys**: Never commit `OPENWEATHER_API_KEY` to version control. Use environment variables or secrets management.
4. **Reverse Proxy**: Always use SSL/TLS in production (Traefik, nginx-proxy, or Caddy)
5. **Updates**: Regularly update base images for security patches
6. **Secrets**: Never commit `.env` files with sensitive data
7. **Container Isolation**: Run with user namespaces and resource limits in production
8. **Network Security**: Use Docker networks to isolate containers

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
