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

### 4. Environment Variables

#### Required
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `3001` | Backend port (internal) |
| `HOST` | `0.0.0.0` | Backend host (internal) |
| `NWS_USER_AGENT` | `WeatherApp/1.0 (your-email@example.com)` | **CHANGE THIS** - NWS requires contact info |
| `CACHED_ZIP_CODES` | `75454,75070,75035` | ZIP codes to pre-cache (comma-separated) |

#### Optional (Defaults Shown)
| Variable | Default | Description |
|----------|---------|-------------|
| `NWS_API_BASE_URL` | `https://api.weather.gov` | NWS API endpoint |
| `OPENWEATHER_API_KEY` | _(none)_ | OpenWeatherMap API key for UV Index data (see note below) |
| `CORS_ORIGIN` | `*` | CORS allowed origins (use specific domain in production) |
| `CACHE_POINTS_DURATION` | `1440` | Points cache duration (minutes) |
| `CACHE_FORECAST_DURATION` | `60` | Forecast cache duration (minutes) |
| `CACHE_OBSERVATIONS_DURATION` | `10` | Observations cache duration (minutes) |
| `CACHE_METADATA_DURATION` | `10080` | Metadata cache duration (minutes) |
| `SERVER_REFRESH_INTERVAL` | `5` | Server refresh interval (minutes) |

**Note on UV Index**: Without `OPENWEATHER_API_KEY`, UV Index data will not be available. The application will still function normally, but the UV Index field will show "N/A". To enable UV Index data, sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api) and add it to the environment variables.

### 5. Resource Limits (Recommended)

| Setting | Value |
|---------|-------|
| CPU | `1.0` cores max |
| Memory | `512M` max |

### 6. Health Check (Optional)

- **Test Command**: `wget --no-verbose --tries=1 --spider http://localhost/api/health || exit 1`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Start Period**: 10 seconds
- **Retries**: 3

**Note**: This health check command matches the Dockerfile HEALTHCHECK exactly and tests the backend API availability.

## Quick Start

1. **Add container** with settings above
2. **Change** `NWS_USER_AGENT` to include your email
3. **Update** `CACHED_ZIP_CODES` with your ZIP codes
4. **Start** container
5. **Access** at `http://[UNRAID-IP]:[HOST-PORT]`

## Notes

- No volume mounts required (cache is memory-based)
- Container runs nginx (frontend) and Node.js backend (API)
- Backend auto-refreshes cached ZIP codes every 5 minutes
- All data fetched from National Weather Service API
- Works only with US ZIP codes
