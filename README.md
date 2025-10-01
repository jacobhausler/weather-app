# HAUS Weather Station

[![Build Status](https://github.com/jacobhausler/weather-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/jacobhausler/weather-app/actions/workflows/deploy.yml)
[![Tests](https://img.shields.io/badge/tests-1%2C114%20passing-success)](./TEST_SUITE_SUMMARY.md)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](./DEPLOYMENT.md)

A self-hosted personal weather forecast application that displays real-time weather data from the National Weather Service (NWS) API. Built with React, TypeScript, and Node.js, deployed as a single Docker container with nginx.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Quick Start](#installation--quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Development Principles](#development-principles)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Support & Resources](#support--resources)
- [Screenshots](#screenshots)
- [Performance & Resource Usage](#performance--resource-usage)
- [Roadmap](#roadmap)

## Overview

HAUS Weather Station is a fully-featured weather application designed for self-hosting. It provides:

- **Real-time weather data** from the National Weather Service API
- **Mobile-first responsive design** with dark/light mode support
- **Intelligent caching** to minimize API calls and improve performance
- **Background refresh** to keep data current without user interaction
- **Zero external dependencies** for deployment (single Docker container)

Perfect for home servers, personal dashboards, or anyone who wants complete control over their weather data without relying on third-party services with usage limits or privacy concerns.

## Features

### Weather Data
- **Current Conditions**: Temperature, feels like, humidity, dewpoint, wind speed/direction/gusts, visibility, cloud cover, UV index
- **7-Day Forecast**: Daily high/low temperatures, weather conditions, precipitation probability, wind information
- **Hourly Forecast**: Detailed hour-by-hour forecasts with interactive charts (temperature, precipitation, wind, humidity)
- **Active Weather Alerts**: Real-time severe weather alerts with severity-based styling
- **Sunrise/Sunset Times**: Calculated locally using coordinates

### UI Features
- **Responsive Design**: Mobile-first layout that works on all screen sizes
- **Dark/Light Mode**: System preference detection with manual override
- **Unit Conversion**: Switch between Imperial (°F, mph, mi) and Metric (°C, km/h, km) units
- **ZIP Code History**: Remember previously searched locations
- **Interactive Charts**: Configurable hourly forecast visualizations
- **Forecast Details Modal**: Click any day for detailed forecast information
- **Loading Skeletons**: Smooth loading states with skeleton screens
- **Error Handling**: User-friendly error messages with technical details

### Data Management
- **Multi-layer Caching**: Intelligent server-side caching with configurable TTLs
  - Points data: 24 hours
  - Forecasts: 1 hour
  - Observations: 10 minutes
  - Alerts: Real-time (no caching)
  - Metadata: 7 days
- **Background Refresh**: Server refreshes configured ZIP codes every 5 minutes
- **Client Auto-refresh**: Non-interrupting updates every 60 seconds
- **Manual Refresh**: Force refresh with visual feedback
- **Rate Limiting Protection**: Exponential backoff for API rate limits

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool and dev server
- **Zustand 4** - State management
- **shadcn/ui** - Component library
- **Tailwind CSS 3** - Styling
- **Recharts 2** - Charts and visualizations
- **date-fns** - Date formatting
- **Lucide React** - Icons

### Backend
- **Node.js 18** - Runtime
- **Fastify 4** - Web framework
- **TypeScript 5** - Type safety
- **Axios** - HTTP client
- **node-cache** - In-memory caching
- **node-cron** - Scheduled jobs
- **SunCalc** - Sunrise/sunset calculations

### Deployment
- **Docker** - Containerization
- **nginx 1.25** - Reverse proxy and static file serving
- **GitHub Actions** - CI/CD pipeline
- **GitHub Container Registry** - Docker image hosting

### Testing
- **Vitest 3** - Test runner
- **React Testing Library 16** - Component testing
- **Playwright 1** - E2E testing (infrastructure ready)
- **1,114 tests** - Comprehensive test coverage

## Prerequisites

### For Local Development
- **Node.js**: ≥18.0.0
- **npm**: ≥9.0.0
- **Git**: Any recent version

### For Docker Deployment
- **Docker Engine**: ≥20.10
- **Docker Compose**: ≥2.0

## Installation & Quick Start

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment (optional)**
   ```bash
   # Create server/.env file
   cp server/.env.example server/.env
   # Edit with your preferences (see Configuration section)
   ```

5. **Start development servers**

   In one terminal (backend):
   ```bash
   cd server
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   npm run dev
   ```

6. **Open application**
   - Navigate to `http://localhost:5173`
   - Backend API running on `http://localhost:3001`

### Docker Quick Start

1. **Clone and navigate to repository**
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Configure environment (optional)**
   ```bash
   # Edit docker-compose.yml to customize environment variables
   nano docker-compose.yml
   ```

3. **Build and start container**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Access application**
   - Open `http://localhost` (port 80)
   - API available at `http://localhost/api`

6. **Stop application**
   ```bash
   docker-compose down
   ```

## Configuration

### Environment Variables

#### Backend Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Backend server port | `3001` | No |
| `HOST` | Backend server host | `0.0.0.0` | No |

#### NWS API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NWS_API_BASE_URL` | NWS API base URL | `https://api.weather.gov` | No |
| `NWS_USER_AGENT` | User-Agent header for NWS API | `WeatherApp/1.0 (contact@example.com)` | **Yes** |

**Important**: The NWS API requires a valid User-Agent header with contact information. Update this with your email address.

#### Cache Configuration

| Variable | Description | Default (minutes) | Required |
|----------|-------------|-------------------|----------|
| `CACHED_ZIP_CODES` | Pre-cached ZIP codes (comma-separated) | `75454,75070,75035` | No |
| `CACHE_POINTS_DURATION` | Points data cache TTL | `1440` (24 hours) | No |
| `CACHE_FORECAST_DURATION` | Forecast data cache TTL | `60` (1 hour) | No |
| `CACHE_OBSERVATIONS_DURATION` | Observations cache TTL | `10` | No |
| `CACHE_METADATA_DURATION` | Metadata cache TTL | `10080` (7 days) | No |

#### Server Configuration

| Variable | Description | Default (minutes) | Required |
|----------|-------------|-------------------|----------|
| `SERVER_REFRESH_INTERVAL` | Background refresh interval | `5` | No |

#### Optional Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost` | No |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key for UV index | (none) | No |

### Configuration Files

- **`server/.env`** - Backend environment variables (local development only)
- **`docker-compose.yml`** - Environment variables for Docker deployment
- **`vite.config.ts`** - Frontend build and dev server configuration
- **`tailwind.config.js`** - Tailwind CSS customization
- **`nginx.conf`** - nginx reverse proxy configuration

## Development

### Development Scripts

#### Frontend Scripts
```bash
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run Playwright E2E tests
```

#### Backend Scripts
```bash
cd server
npm run dev              # Start dev server with hot reload (port 3001)
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production build
npm run type-check       # TypeScript type checking
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
```

### Development Notes

- **Port Configuration**: Frontend dev server runs on port 5173, backend on 3001
- **API Proxying**: Vite dev server automatically proxies `/api/*` requests to backend
- **Hot Module Replacement**: Both frontend and backend support hot reload
- **Type Checking**: Run type checks before committing (`npm run type-check` in both directories)
- **Separate Dependencies**: Frontend and backend have separate `package.json` files and need separate `npm install`

### Development Workflow

1. **Make changes** to source code
2. **Run type check** to catch TypeScript errors
3. **Run linter** to ensure code quality
4. **Run tests** to verify functionality
5. **Test manually** in browser
6. **Commit changes** with descriptive message

## Testing

HAUS Weather Station has a comprehensive test suite with **1,114 real, substantive tests** covering all critical functionality.

### Test Philosophy

- **No Mocks, No Placeholders**: Tests use actual implementations where possible
- **Real API Calls**: Integration tests make actual HTTP requests to NWS API and Zippopotam.us
- **Real Timing**: Cache TTL expiration and retry logic tested with actual timing
- **Substantive Tests**: Each test validates meaningful behavior, not just "component renders"

### Test Statistics

| Category | Tests | Files | Description |
|----------|-------|-------|-------------|
| **Backend Services** | 282 | 6 | geocoding, cache, NWS client, NWS service, UV service, sun service |
| **Backend API** | 40 | 1 | Weather routes and transformations |
| **Backend Regression** | 25 | 1 | Critical bug prevention tests |
| **Frontend Hooks/Stores** | 298 | 5 | Custom hooks and Zustand stores |
| **Frontend Components** | 446 | 9 | All UI components |
| **Frontend Regression** | 23 | 1 | Critical bug prevention tests |
| **Total** | **1,114** | **23** | Complete test coverage |

### Running Tests

```bash
# Frontend tests (767 tests)
npm test                    # Watch mode
npm run test:run            # Run once
npm run test:ui             # Interactive UI
npm run test:coverage       # With coverage report

# Backend tests (347 tests)
cd server
npm test                    # Watch mode
npm run test:run            # Run once
npm run test:ui             # Interactive UI
npm run test:coverage       # With coverage report

# E2E tests (infrastructure ready)
npm run test:e2e            # Run Playwright tests
npm run test:e2e:ui         # Playwright UI mode
npm run test:e2e:debug      # Debug mode
```

### Test Execution Time

- **Frontend**: ~3-5 seconds (767 tests)
- **Backend**: ~60-90 seconds (347 tests, includes real API calls)
- **Total**: ~1-2 minutes for complete test suite

For complete test documentation, see [TEST_SUITE_SUMMARY.md](./TEST_SUITE_SUMMARY.md).

## Building for Production

### Frontend Build

```bash
# Build frontend
npm run build

# Output: dist/ directory
# Optimized bundle with code splitting
# Expected size: ~700 kB (main + vendor)
```

**Build Output Structure**:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main bundle (~562 kB)
│   ├── vendor-[hash].js     # Vendor bundle (~141 kB)
│   └── index-[hash].css     # Styles
└── vite.svg
```

### Backend Build

```bash
# Build backend
cd server
npm run build

# Output: dist/ directory
# Compiled JavaScript from TypeScript
```

**Build Output Structure**:
```
server/dist/
├── index.js
├── routes/
├── services/
├── types/
└── utils/
```

### Build Verification

```bash
# Type check frontend
npm run type-check

# Type check backend
cd server && npm run type-check

# Lint frontend
npm run lint

# Lint backend
cd server && npm run lint

# Run all tests
npm run test:run && cd server && npm run test:run

# Preview frontend production build
npm run preview
```

### Bundle Analysis

Frontend bundle sizes (production):
- **Main bundle**: ~562.67 kB
- **Vendor bundle**: ~141.40 kB
- **Total initial load**: ~704 kB (gzipped: ~180 kB with nginx compression)

## Deployment

HAUS Weather Station is designed for easy deployment using Docker.

### Docker Deployment (Recommended)

1. **Pull or build image**
   ```bash
   # Option A: Pull from GitHub Container Registry
   docker pull ghcr.io/yourusername/weather-app:latest

   # Option B: Build locally
   docker-compose build
   ```

2. **Configure environment**
   Edit `docker-compose.yml` to customize environment variables (see [Configuration](#configuration))

3. **Start container**
   ```bash
   docker-compose up -d
   ```

4. **Verify health**
   ```bash
   # Check container status
   docker-compose ps

   # Check health endpoint
   curl http://localhost/api/health
   ```

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Manual Deployment

1. **Build application**
   ```bash
   # Frontend
   npm ci
   npm run build

   # Backend
   cd server
   npm ci
   npm run build
   ```

2. **Configure nginx**
   - Copy `nginx.conf` to nginx configuration directory
   - Update paths as needed
   - Serve frontend `dist/` directory
   - Proxy `/api/*` to backend

3. **Start backend server**
   ```bash
   cd server
   NODE_ENV=production node dist/index.js
   ```

4. **Configure nginx and start**
   ```bash
   nginx -t  # Test configuration
   nginx     # Start nginx
   ```

### GitHub Container Registry Deployment

The CI/CD pipeline automatically builds and pushes Docker images to GitHub Container Registry on every push to `main`.

```bash
# Pull latest image
docker pull ghcr.io/yourusername/weather-app:latest

# Or pull specific commit
docker pull ghcr.io/yourusername/weather-app:abc123def456...

# Run container
docker run -d \
  --name weather-app \
  -p 80:80 \
  -e NWS_USER_AGENT="WeatherApp/1.0 (your-email@example.com)" \
  ghcr.io/yourusername/weather-app:latest
```

### Health Checks

The application includes built-in health checks:

- **HTTP Health Endpoint**: `GET /api/health`
- **Docker Health Check**: Runs every 30 seconds
- **Startup Grace Period**: 10 seconds
- **Failure Threshold**: 3 consecutive failures

```bash
# Manual health check
curl http://localhost/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2025-09-30T12:00:00.000Z",
  "uptime": 3600
}
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Container                       │
│                                                               │
│  ┌──────────────────┐         ┌────────────────────────┐   │
│  │                  │         │                        │   │
│  │  nginx (Port 80) │◄────────┤  React SPA (Static)    │   │
│  │                  │         │  - Components          │   │
│  │  Reverse Proxy   │         │  - Zustand Stores      │   │
│  │                  │         │  - Service Layer       │   │
│  └────────┬─────────┘         └────────────────────────┘   │
│           │                                                  │
│           │ /api/* proxy                                     │
│           ▼                                                  │
│  ┌──────────────────────────┐                               │
│  │  Node.js Backend         │                               │
│  │  (Port 3001)             │                               │
│  │                          │                               │
│  │  - Fastify Server        │                               │
│  │  - Weather Routes        │                               │
│  │  - NWS API Client        │                               │
│  │  - Cache Service         │                               │
│  │  - Background Jobs       │                               │
│  └────────┬─────────────────┘                               │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │  External APIs     │
   │  - NWS API         │
   │  - Zippopotam.us   │
   │  - (OpenWeather)   │
   └────────────────────┘
```

### Data Flow

1. **User submits ZIP code** in frontend
2. **Frontend calls** `GET /api/weather/:zipcode`
3. **Backend checks cache** for existing data
4. **If cache miss**:
   - Geocode ZIP → coordinates (Zippopotam.us API)
   - Fetch point data (NWS `/points/{lat},{lon}`)
   - Fetch forecast data (NWS `/gridpoints/.../forecast`)
   - Fetch hourly data (NWS `/gridpoints/.../forecast/hourly`)
   - Fetch observations (NWS `/stations/.../observations/latest`)
   - Fetch alerts (NWS `/alerts/active`)
   - Calculate sunrise/sunset (SunCalc library)
   - Store in cache with appropriate TTLs
5. **Backend transforms** data to frontend format
6. **Backend returns** complete weather package
7. **Frontend stores** in Zustand state
8. **Components render** weather data

### Caching Strategy

**Server-side Cache** (in-memory with node-cache):
- **Points data**: 24 hours (rarely changes)
- **Forecast data**: 1 hour (updated frequently)
- **Observations**: 10 minutes (real-time data)
- **Alerts**: No caching (critical, real-time)
- **Metadata**: 7 days (static data)

**Background Refresh**:
- Server automatically refreshes configured ZIP codes every 5 minutes
- Keeps cache warm for frequently accessed locations
- Users get instant responses from cache

**Client-side Refresh**:
- Non-interrupting auto-refresh every 60 seconds
- Pauses when page not visible (Page Visibility API)
- Exponential backoff on failures (4s, 8s, 16s, 32s max)
- Auto-refresh pauses after 3 consecutive failures

### Component Architecture

**Frontend Components** (13 total):
- `Header` - Main layout and title
- `ZipInput` - ZIP code input and history
- `RefreshButton` - Manual refresh control
- `AlertCard` - Severe weather alerts (conditional)
- `SevenDayForecast` - 7-day forecast cards
- `CurrentConditions` - Current weather details
- `HourlyForecast` - Hourly charts
- `ForecastModal` - Detailed forecast modal
- `ErrorBanner` - Error messaging
- `ThemeToggle` - Dark/light mode
- `UnitToggle` - Imperial/metric switching
- `LoadingSkeletons` - Loading states
- UI components from shadcn/ui

**Zustand Stores** (3 total):
- `weatherStore` - Weather data and ZIP history
- `themeStore` - Theme preference
- `unitStore` - Unit system and conversions

## API Documentation

### Internal REST API Endpoints

The backend server exposes the following REST API endpoints:

#### Health Check Endpoints

**GET /api/health**
- **Description**: Basic health check
- **Response**: 200 OK
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-30T12:00:00.000Z"
  }
  ```

**GET /api/health/detailed**
- **Description**: Detailed health information
- **Response**: 200 OK
  ```json
  {
    "status": "ok",
    "timestamp": "2025-09-30T12:00:00.000Z",
    "uptime": 3600,
    "cache": {
      "keys": 15,
      "hits": 250,
      "misses": 30
    },
    "backgroundJobs": {
      "lastRun": "2025-09-30T11:55:00.000Z",
      "nextRun": "2025-09-30T12:00:00.000Z"
    }
  }
  ```

#### Weather Data Endpoints

**GET /api/weather/:zipcode**
- **Description**: Get complete weather package for ZIP code
- **Parameters**:
  - `zipcode` (path) - 5-digit US ZIP code
- **Response**: 200 OK
  ```json
  {
    "zipCode": "75454",
    "location": "McKinney, TX",
    "coordinates": {
      "latitude": 33.1972,
      "longitude": -96.6397
    },
    "forecast": [...],
    "hourlyForecast": [...],
    "currentObservation": {...},
    "alerts": [...],
    "lastUpdated": "2025-09-30T12:00:00.000Z"
  }
  ```
- **Errors**:
  - 400 Bad Request - Invalid ZIP code format
  - 404 Not Found - ZIP code not found
  - 500 Internal Server Error - API or server error

**POST /api/weather/:zipcode/refresh**
- **Description**: Clear cache and force refresh for ZIP code
- **Parameters**:
  - `zipcode` (path) - 5-digit US ZIP code
- **Response**: 200 OK (returns fresh weather data)

#### Cache Management Endpoints

**GET /api/weather/cache/stats**
- **Description**: Get cache statistics
- **Response**: 200 OK
  ```json
  {
    "keys": 25,
    "hits": 1250,
    "misses": 85,
    "hitRate": 0.936
  }
  ```

**POST /api/weather/cache/clear**
- **Description**: Clear all cache entries
- **Response**: 200 OK
  ```json
  {
    "message": "Cache cleared successfully",
    "clearedKeys": 25
  }
  ```

**POST /api/weather/cache/clear/:zipcode**
- **Description**: Clear cache for specific ZIP code
- **Parameters**:
  - `zipcode` (path) - 5-digit US ZIP code
- **Response**: 200 OK
  ```json
  {
    "message": "Cache cleared for ZIP code 75454",
    "clearedKeys": 5
  }
  ```

#### Background Jobs Endpoints

**GET /api/weather/background-jobs/status**
- **Description**: Get background job status
- **Response**: 200 OK
  ```json
  {
    "scheduledZipCodes": ["75454", "75070", "75035"],
    "refreshInterval": "5 minutes",
    "lastRun": "2025-09-30T11:55:00.000Z",
    "nextRun": "2025-09-30T12:00:00.000Z",
    "status": "running"
  }
  ```

### External API Documentation

For detailed documentation on the National Weather Service API endpoints used by this application, see [examples/NWS-API.md](./examples/NWS-API.md).

## Project Structure

```
weather-app/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD pipeline
├── server/                            # Backend application
│   ├── src/
│   │   ├── index.ts                   # Server entry point
│   │   ├── routes/
│   │   │   └── weatherRoutes.ts       # Weather API routes
│   │   ├── services/
│   │   │   ├── cacheService.ts        # Cache management
│   │   │   ├── geocodingService.ts    # ZIP → coordinates
│   │   │   ├── nwsClient.ts           # NWS API client
│   │   │   ├── nwsService.ts          # Weather data orchestration
│   │   │   ├── sunService.ts          # Sunrise/sunset calculations
│   │   │   └── uvService.ts           # UV index (optional)
│   │   ├── types/
│   │   │   └── weather.ts             # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── backgroundJobs.ts      # Scheduled refresh jobs
│   │   └── setupTests.ts              # Test configuration
│   ├── dist/                          # Compiled JavaScript (build output)
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── src/                               # Frontend application
│   ├── components/
│   │   ├── AlertCard.tsx              # Weather alerts
│   │   ├── CurrentConditions.tsx      # Current weather
│   │   ├── ErrorBanner.tsx            # Error display
│   │   ├── ForecastModal.tsx          # Detailed forecast modal
│   │   ├── Header.tsx                 # Main header layout
│   │   ├── HourlyForecast.tsx         # Hourly charts
│   │   ├── LoadingSkeletons.tsx       # Loading states
│   │   ├── RefreshButton.tsx          # Manual refresh
│   │   ├── SevenDayForecast.tsx       # 7-day forecast
│   │   ├── ThemeToggle.tsx            # Dark/light mode toggle
│   │   ├── UnitToggle.tsx             # Imperial/metric toggle
│   │   ├── ZipInput.tsx               # ZIP code input
│   │   └── ui/                        # shadcn/ui components
│   ├── hooks/
│   │   ├── useLocalStorage.tsx        # localStorage hook
│   │   ├── useUnitConversion.tsx      # Unit conversion hook
│   │   └── useWeatherData.tsx         # Weather data fetching hook
│   ├── stores/
│   │   ├── themeStore.ts              # Theme state
│   │   ├── unitStore.ts               # Unit system state
│   │   └── weatherStore.ts            # Weather data state
│   ├── services/
│   │   └── api.ts                     # API client
│   ├── types/
│   │   └── weather.ts                 # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts                   # Utility functions
│   ├── App.tsx                        # Main app component
│   ├── main.tsx                       # React entry point
│   ├── index.css                      # Global styles
│   └── setupTests.ts                  # Test configuration
├── dist/                              # Frontend build output
├── specs/                             # Component specifications
│   └── cards/                         # Card component specs
├── examples/                          # API documentation and examples
│   └── NWS-API.md                     # NWS API documentation
├── prompts/                           # Development planning docs
├── Dockerfile                         # Multi-stage Docker build
├── docker-compose.yml                 # Docker orchestration
├── nginx.conf                         # nginx configuration
├── package.json                       # Frontend dependencies
├── vite.config.ts                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS config
├── tsconfig.json                      # TypeScript config
├── vitest.config.ts                   # Vitest config
├── CLAUDE.md                          # AI assistant guide
├── DEPLOYMENT.md                      # Deployment guide
├── TEST_SUITE_SUMMARY.md              # Test documentation
├── fix_plan.md                        # Project status and planning
└── README.md                          # This file
```

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment.

### Pipeline Stages

1. **Frontend Build & Test**
   - Checkout code
   - Install dependencies
   - Type check (`npm run type-check`)
   - Lint (`npm run lint`)
   - Run tests (`npm run test:run`)
   - Build (`npm run build`)
   - Upload artifacts

2. **Backend Build & Test**
   - Checkout code
   - Install dependencies
   - Type check (`npm run type-check`)
   - Lint (`npm run lint`)
   - Run tests (`npm run test:run`)
   - Build (`npm run build`)
   - Upload artifacts

3. **Docker Build & Push** (main branch only)
   - Checkout code
   - Set up Docker Buildx
   - Login to GitHub Container Registry
   - Build Docker image
   - Tag with commit SHA and `latest`
   - Push to GHCR

### Trigger Conditions

- **Push to main**: Full pipeline (build, test, deploy)
- **Pull request**: Build and test only (no deployment)

### Quality Gates

All stages must pass before Docker image is built and pushed:
- ✅ Type checking (frontend and backend)
- ✅ Linting (frontend and backend)
- ✅ Tests (1,114 tests must pass)
- ✅ Builds (frontend and backend)

### Image Tagging

Images are tagged with:
- **Commit SHA**: `ghcr.io/username/weather-app:abc123def456...` (full SHA)
- **Latest**: `ghcr.io/username/weather-app:latest` (main branch only)

### Workflow File

See [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) for complete pipeline configuration.

## Development Principles

This project follows strict development principles for maintainability and quality:

### Core Principles

1. **SIMPLICITY IS PARAMOUNT**
   - Components must be under 300 lines
   - Clear, single-responsibility functions
   - No over-engineering or premature optimization

2. **SEPARATION OF CONCERNS**
   - Display components separate from data fetching
   - Business logic separate from presentation
   - State management centralized in Zustand stores

3. **KISS & DRY**
   - Keep It Simple, Stupid
   - Don't Repeat Yourself
   - Reuse components and utilities

4. **SMART TESTS**
   - No mocks or placeholders where possible
   - Test real functionality with real data
   - Integration tests over unit tests
   - Substantive tests that validate behavior

5. **MOBILE-FIRST**
   - Design for mobile screens first
   - Enhance progressively for larger screens
   - Responsive by default

6. **TYPE SAFETY**
   - TypeScript for all code
   - Strict type checking enabled
   - No `any` types

7. **CODE QUALITY**
   - ESLint for code quality
   - Prettier for formatting
   - Type checking before commits
   - All builds must pass

## Configuration Options

### Server Configuration

Configure via environment variables or `server/.env` file:

```bash
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# NWS API (REQUIRED: Update with your email)
NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)

# Cached ZIP Codes (comma-separated)
CACHED_ZIP_CODES=75454,75070,75035

# Cache TTLs (minutes)
CACHE_POINTS_DURATION=1440
CACHE_FORECAST_DURATION=60
CACHE_OBSERVATIONS_DURATION=10
CACHE_METADATA_DURATION=10080

# Background Jobs (minutes)
SERVER_REFRESH_INTERVAL=5

# Optional: UV Index
OPENWEATHER_API_KEY=your_api_key_here

# Optional: CORS
CORS_ORIGIN=http://localhost,http://192.168.1.100
```

### Client Configuration

User preferences are stored in browser localStorage:

- **Theme**: `theme-storage` (light/dark/system)
- **Unit System**: `unit-storage` (imperial/metric)
- **ZIP History**: Stored in `weather-storage`
- **Hourly Chart Config**: Period and data type selections

### nginx Configuration

Customize `nginx.conf` for:
- **Port**: Change `listen` directive
- **SSL/TLS**: Add certificate configuration
- **Compression**: Adjust gzip settings
- **Caching**: Modify cache headers
- **Rate Limiting**: Add rate limit rules

## Troubleshooting

### Common Issues

#### Issue: "Failed to fetch weather data"

**Symptoms**: Error banner appears when submitting ZIP code

**Possible Causes**:
- Invalid ZIP code format (must be 5 digits)
- Backend server not running
- NWS API temporarily unavailable
- Network connectivity issues

**Solutions**:
1. Verify ZIP code is valid 5-digit US ZIP code
2. Check backend server is running:
   ```bash
   curl http://localhost:3001/api/health
   ```
3. Check backend logs for errors:
   ```bash
   docker-compose logs -f weather-app
   ```
4. Verify NWS API is accessible:
   ```bash
   curl https://api.weather.gov
   ```

#### Issue: "User-Agent header required"

**Symptoms**: Backend logs show 403 Forbidden errors from NWS API

**Cause**: NWS API requires valid User-Agent header with contact information

**Solution**: Set `NWS_USER_AGENT` environment variable with your email:
```bash
# In docker-compose.yml or server/.env
NWS_USER_AGENT=WeatherApp/1.0 (your-email@example.com)
```

#### Issue: Dark mode not working

**Symptoms**: Theme toggle button doesn't change colors

**Possible Causes**:
- Browser localStorage disabled
- Theme state not persisting
- CSS variables not loading

**Solutions**:
1. Enable localStorage in browser settings
2. Clear browser cache and reload
3. Check browser console for errors
4. Try system theme preference:
   - macOS: System Preferences > General > Appearance
   - Windows: Settings > Personalization > Colors

#### Issue: Docker container fails health check

**Symptoms**: Container shows "unhealthy" status

**Possible Causes**:
- Backend server not starting
- Port 3001 not accessible internally
- nginx not proxying correctly

**Solutions**:
1. Check container logs:
   ```bash
   docker logs haus-weather-station
   ```
2. Check backend process:
   ```bash
   docker exec haus-weather-station ps aux | grep node
   ```
3. Test backend connectivity:
   ```bash
   docker exec haus-weather-station wget -qO- http://localhost:3001/api/health
   ```
4. Test nginx configuration:
   ```bash
   docker exec haus-weather-station nginx -t
   ```

#### Issue: Frontend build fails

**Symptoms**: `npm run build` fails with errors

**Possible Causes**:
- Type errors in TypeScript
- Missing dependencies
- ESLint errors
- PostCSS configuration missing

**Solutions**:
1. Run type check:
   ```bash
   npm run type-check
   ```
2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check ESLint:
   ```bash
   npm run lint
   ```
4. Verify PostCSS config exists:
   ```bash
   ls postcss.config.js
   ```

#### Issue: Tests failing

**Symptoms**: Test suite shows failures

**Possible Causes**:
- NWS API rate limiting (integration tests)
- Network connectivity issues
- Test environment misconfiguration

**Solutions**:
1. Run tests with increased timeout:
   ```bash
   npm run test:run -- --testTimeout=10000
   ```
2. Check for NWS API rate limits (wait a few minutes)
3. Skip integration tests temporarily:
   ```bash
   npm run test:run -- --grep -i "integration"
   ```
4. Clear test cache:
   ```bash
   npm run test:run -- --clearCache
   ```

### Getting Help

If you encounter issues not covered here:

1. **Check logs**: Always start with application logs
2. **Search issues**: Check GitHub issues for similar problems
3. **Enable debug logging**: Set `NODE_ENV=development` for verbose output
4. **Test health endpoints**: Verify `/api/health` returns 200 OK
5. **Verify configuration**: Double-check environment variables

## Contributing

Contributions are welcome! This project follows strict quality standards.

### Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Prettier with Tailwind CSS plugin
- **Linting**: ESLint with TypeScript rules
- **Components**: Maximum 300 lines per component
- **Testing**: All new features must include tests

### Pull Request Process

1. **Fork repository** and create feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following code style guidelines

3. **Write tests** for new functionality
   ```bash
   npm run test:run
   cd server && npm run test:run
   ```

4. **Run quality checks**
   ```bash
   # Type check
   npm run type-check
   cd server && npm run type-check

   # Lint
   npm run lint
   cd server && npm run lint

   # Tests
   npm run test:run
   cd server && npm run test:run

   # Build
   npm run build
   cd server && npm run build
   ```

5. **Commit changes** with descriptive message
   ```bash
   git commit -m "Add feature: detailed description"
   ```

6. **Push to fork** and create pull request
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Ensure CI passes** - All quality gates must pass

### Requirements for Merge

- ✅ All tests passing (1,114+ tests)
- ✅ Type checking passing (frontend and backend)
- ✅ Linting passing (frontend and backend)
- ✅ Builds successful (frontend and backend)
- ✅ Code review approved
- ✅ Documentation updated (if applicable)
- ✅ No decrease in code quality

## License

This project is licensed under the ISC License.

## Acknowledgments

### APIs and Data Sources

- **[National Weather Service API](https://www.weather.gov/documentation/services-web-api)** - Free, public weather data for the United States
- **[Zippopotam.us](http://www.zippopotam.us/)** - Free ZIP code geocoding API
- **[OpenWeatherMap](https://openweathermap.org/)** - Optional UV index data
- **[Sunrise-sunset.org](https://sunrise-sunset.org/)** - Alternative sunrise/sunset API

### Libraries and Frameworks

- **[React](https://react.dev/)** - UI framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[Fastify](https://fastify.dev/)** - Fast and low overhead web framework
- **[Zustand](https://github.com/pmndrs/zustand)** - Simple state management
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[SunCalc](https://github.com/mourner/suncalc)** - Sun position and phase calculations

### Development Tools

- **[Claude Code](https://claude.ai/code)** - AI-assisted development
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience
- **[Vitest](https://vitest.dev/)** - Fast unit test framework
- **[Playwright](https://playwright.dev/)** - Reliable E2E testing
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automation

## Support & Resources

### Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[TEST_SUITE_SUMMARY.md](./TEST_SUITE_SUMMARY.md)** - Test documentation
- **[CLAUDE.md](./CLAUDE.md)** - Project guide for AI assistants
- **[examples/NWS-API.md](./examples/NWS-API.md)** - NWS API documentation

### External Links

- **[NWS API Documentation](https://www.weather.gov/documentation/services-web-api)** - Official API docs
- **[NWS API Specification](https://api.weather.gov/openapi.json)** - OpenAPI spec
- **[shadcn/ui Documentation](https://ui.shadcn.com/)** - Component documentation
- **[Recharts Documentation](https://recharts.org/en-US/api)** - Chart API reference

### Community

- **Issues**: [GitHub Issues](https://github.com/yourusername/weather-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/weather-app/discussions)

## Screenshots

*Note: Screenshots to be added*

Features to capture:
- Main interface with current conditions
- 7-day forecast grid
- Hourly forecast charts (temperature, precipitation, wind, humidity)
- Weather alert card (with severity styling)
- Dark mode comparison
- Mobile responsive layout
- Forecast detail modal

## Performance & Resource Usage

### Docker Resource Limits

Default configuration (as defined in `docker-compose.yml`):

| Resource | Limit | Reservation |
|----------|-------|-------------|
| **CPU** | 1.0 core | 0.25 core |
| **Memory** | 512 MB | 128 MB |

Actual usage in production:
- **CPU**: ~5-10% average, spikes to 30% during refresh
- **Memory**: ~150-200 MB steady state
- **Network**: Minimal (mostly cached responses)

### Bundle Sizes

**Frontend** (production build):
```
dist/assets/index-[hash].js        562.67 kB │ gzip: 182.15 kB
dist/assets/vendor-[hash].js       141.40 kB │ gzip:  45.78 kB
dist/assets/index-[hash].css        47.32 kB │ gzip:   8.45 kB
Total:                             751.39 kB │ gzip: 236.38 kB
```

**Backend** (compiled):
```
server/dist/                       ~250 kB (before node_modules)
node_modules/                      ~45 MB (production dependencies)
```

### Performance Metrics

- **Initial Load**: < 1 second (cached)
- **API Response**: < 200ms (cached), < 2s (cache miss)
- **Background Refresh**: 5-minute intervals
- **Client Auto-refresh**: 60-second intervals
- **Health Check**: < 50ms

### nginx Performance

- **Gzip Compression**: Enabled (level 6)
- **Static Caching**: 1 year for assets, no-cache for HTML
- **Connection Keep-Alive**: 65 seconds
- **Worker Processes**: Auto (based on CPU cores)

## Roadmap

Future enhancements planned for the HAUS Weather Station (post-MVP):

### Phase 10: Accessibility Improvements
- [ ] Add comprehensive ARIA labels to all interactive elements
- [ ] Implement full keyboard navigation
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Ensure WCAG AA compliance (minimum)
- [ ] Add focus indicators for keyboard users
- [ ] High contrast mode support

### Phase 11: Performance Optimizations
- [ ] Implement code splitting for routes
- [ ] Lazy load chart components
- [ ] Optimize bundle size (target: <500 kB)
- [ ] Add service worker for offline support
- [ ] Create PWA manifest for mobile install
- [ ] Implement image lazy loading
- [ ] Add resource hints (preload, prefetch)

### Phase 12: Advanced Features
- [ ] **Multi-location Support**: Track multiple ZIP codes simultaneously
- [ ] **Geolocation API**: Auto-detect user location
- [ ] **Forecast Accuracy Tracking**: Compare predictions vs actual weather
- [ ] **Historical Data**: Visualize past weather patterns
- [ ] **Push Notifications**: Weather alerts via web push
- [ ] **Radar Imagery**: Integrate weather radar (external service)
- [ ] **Air Quality Index**: Add AQI data
- [ ] **Pollen Count**: Seasonal allergy information
- [ ] **Weather Widgets**: Embeddable widgets for other sites

### Phase 13: Data & Analytics
- [ ] Export weather data (CSV, JSON)
- [ ] Custom date range queries
- [ ] Weather statistics and trends
- [ ] Comparison views (year-over-year)
- [ ] Data visualization dashboard

### Phase 14: Mobile Apps
- [ ] React Native mobile app (iOS/Android)
- [ ] Native push notifications
- [ ] Background location updates
- [ ] Widget support (iOS 14+, Android)
- [ ] Apple Watch / Wear OS apps

### Phase 15: Community Features
- [ ] User accounts and profiles
- [ ] Share forecasts and screenshots
- [ ] Community weather reports
- [ ] Weather-based event planning
- [ ] Social integration

---

**Built with Claude Code** - AI-assisted development by Anthropic

---

For questions, issues, or contributions, please visit the [GitHub repository](https://github.com/yourusername/weather-app).
