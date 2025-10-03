# UNRAID Deployment Guide

Quick guide to deploy HAUS Weather Station on UNRAID.

## Container Registry

**Image**: `ghcr.io/<YOUR_GITHUB_USERNAME>/weather-app:latest`

**Available Tags**:
- `latest` - Most recent build from main branch
- `<commit-sha>` - Specific commit version (e.g., `903e289`) for version pinning

**Recommendation**: Use SHA-based tags for production deployments to ensure consistency and rollback capability.

## UNRAID Setup

### 1. Add Container

In UNRAID web UI: **Docker** → **Add Container**

### 2. Basic Settings

| Setting | Value |
|---------|-------|
| Name | `haus-weather-station` |
| Repository | `ghcr.io/<YOUR_GITHUB_USERNAME>/weather-app:latest` |
| Network Type | `bridge` |

### 3. Port Mapping

| Container Port | Host Port | Type | Description |
|----------------|-----------|------|-------------|
| `80` | `8080` (or your choice) | TCP | Web interface |

**Access URL**: `http://[UNRAID-IP]:[HOST-PORT]`

### 4. Volume Mapping (Required)

| Container Path | Host Path | Access Mode | Description |
|----------------|-----------|-------------|-------------|
| `/data` | `/mnt/user/appdata/haus-weather-station` | Read/Write | Persistent storage for cached ZIP codes |

**Note**: The server tracks all user-entered ZIP codes in `/data/zip-codes.json` and automatically refreshes them every 5 minutes. This volume ensures ZIP codes persist across container restarts.

### 5. Environment Variables

#### Required
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `3001` | Backend port (internal) |
| `HOST` | `0.0.0.0` | Backend host (internal) |
| `NWS_USER_AGENT` | `WeatherApp/1.0 (your-email@example.com)` | **CHANGE THIS** - NWS requires contact info |
| `CACHED_ZIP_CODES` | `75454,75070,75035` | Initial ZIP codes (comma-separated). **Note**: Server auto-tracks all entered ZIPs. |

#### Optional (Defaults Shown)
| Variable | Default | Description |
|----------|---------|-------------|
| `NWS_API_BASE_URL` | `https://api.weather.gov` | NWS API endpoint |
| `CORS_ORIGIN` | `*` | CORS allowed origins (use specific domain in production) |
| `CACHE_POINTS_DURATION` | `1440` | Points cache duration (minutes) |
| `CACHE_FORECAST_DURATION` | `60` | Forecast cache duration (minutes) |
| `CACHE_OBSERVATIONS_DURATION` | `10` | Observations cache duration (minutes) |
| `CACHE_METADATA_DURATION` | `10080` | Metadata cache duration (minutes) |
| `SERVER_REFRESH_INTERVAL` | `5` | Server refresh interval (minutes) |

### 6. Resource Limits (Recommended)

| Setting | Value |
|---------|-------|
| CPU | `1.0` cores max |
| Memory | `512M` max |

### 7. Health Check (Optional)

- **Test Command**: `wget --no-verbose --tries=1 --spider http://localhost/api/health || exit 1`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Start Period**: 10 seconds
- **Retries**: 3

**Note**: This health check command matches the Dockerfile HEALTHCHECK exactly and tests the backend API availability.

## Quick Start

1. **Add container** with settings above
2. **Configure volume** mapping: `/data` → `/mnt/user/appdata/haus-weather-station`
3. **Change** `NWS_USER_AGENT` to include your email
4. **Update** `CACHED_ZIP_CODES` with initial ZIP codes (optional)
5. **Start** container
6. **Access** at `http://[UNRAID-IP]:[HOST-PORT]`

## Notes

- **Volume mount required** for persistent ZIP code storage
- Container runs nginx (frontend) and Node.js backend (API)
- Backend auto-tracks and refreshes all user-entered ZIP codes every 5 minutes
- ZIP codes persist in `/data/zip-codes.json` across restarts
- All weather data fetched from National Weather Service API
- Works only with US ZIP codes
