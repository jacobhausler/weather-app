# UNRAID Deployment Guide

Quick guide to deploy HAUS Weather Station on UNRAID.

## Container Registry

**Image**: `ghcr.io/jacobhausler/weather-app:latest`

## UNRAID Setup

### 1. Add Container

In UNRAID web UI: **Docker** → **Add Container**

### 2. Basic Settings

| Setting | Value |
|---------|-------|
| Name | `haus-weather-station` |
| Repository | `ghcr.io/jacobhausler/weather-app:latest` |
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
| `CACHE_POINTS_DURATION` | `1440` | Points cache duration (minutes) |
| `CACHE_FORECAST_DURATION` | `60` | Forecast cache duration (minutes) |
| `CACHE_OBSERVATIONS_DURATION` | `10` | Observations cache duration (minutes) |
| `CACHE_METADATA_DURATION` | `10080` | Metadata cache duration (minutes) |
| `SERVER_REFRESH_INTERVAL` | `5` | Server refresh interval (minutes) |

### 5. Resource Limits (Recommended)

| Setting | Value |
|---------|-------|
| CPU | `1.0` cores max |
| Memory | `512M` max |

### 6. Health Check (Optional)

- **Test Command**: `wget --no-verbose --tries=1 --spider http://localhost/api/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Retries**: 3

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
