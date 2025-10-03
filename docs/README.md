# HAUS Weather Station - Documentation Index

Welcome to the HAUS Weather Station documentation. This index provides organized access to all project documentation.

## Quick Links

- **Getting Started**: [CLAUDE.md](../CLAUDE.md) - Project overview and development guide
- **API Reference**: [API.md](./API.md) - Complete backend API documentation
- **Deployment**: [DEPLOYMENT.md](../DEPLOYMENT.md) - Docker deployment and CI/CD guide
- **Testing**: [TEST_SUITE_SUMMARY.md](../TEST_SUITE_SUMMARY.md) - Test coverage and philosophy
- **Test Plan**: [TEST_PLAN.md](../TEST_PLAN.md) - Testing strategy and implementation plan

## Project Overview

HAUS Weather Station is a self-hosted personal weather forecast application built with React and Node.js. It displays weather data from the National Weather Service (NWS) API with a modern glassmorphism design aesthetic.

**Tech Stack**:
- Frontend: React + TypeScript + Vite + shadcn/ui
- Backend: Node.js + Fastify + TypeScript
- State: Zustand
- Deployment: Docker + nginx

## Architecture

### High-Level Architecture

**[CLAUDE.md](../CLAUDE.md)** - Complete architecture overview including:
- Frontend architecture (React SPA)
- Backend architecture (Node.js server)
- Deployment architecture (Docker + nginx)
- Data flow and API integration
- Caching strategy
- Background jobs

### Design System

**[MODERN_DESIGN_REFACTOR.md](../MODERN_DESIGN_REFACTOR.md)** - Glassmorphism design system:
- Design tokens and CSS variables
- GlassCard component system
- Color schemes and gradients
- Implementation phases and status
- Component refactoring guide

### Component Specifications

Component specifications are located in `specs/cards/`:

#### Core UI Components
- [Header Layout](../specs/cards/header-layout.md) - App title and layout
- [ZIP Input](../specs/cards/zip-input.md) - ZIP code input with validation
- [Refresh Button](../specs/cards/refresh-button.md) - Manual refresh control
- [Theme Toggle](../specs/cards/theme-toggle.md) - Dark/light mode switcher
- [Unit Toggle](../specs/cards/unit-toggle.md) - Imperial/metric converter
- [Error Banner](../specs/cards/error-banner.md) - Error display system
- [Loading States](../specs/cards/loading-states.md) - Skeleton screens and spinners

#### Weather Display Components
- [Alert Card](../specs/cards/alert-card.md) - Active weather alerts
- [Seven Day Forecast](../specs/cards/seven-day-forecast-card.md) - Weekly forecast
- [Current Conditions](../specs/cards/current-conditions-card.md) - Current weather data
- [Hourly Forecast](../specs/cards/hourly-forecast-card.md) - Hourly charts
- [Forecast Day Modal](../specs/cards/forecast-day-modal.md) - Detailed day view

#### Icon System
- [Icon Documentation Index](../specs/ICON_DOCUMENTATION_INDEX.md) - Complete icon system overview
- [NWS Icon Codes](../specs/NWS_ICON_CODES.md) - Weather icon reference
- [Icon Mapping Table](../specs/NWS_ICON_MAPPING_TABLE.md) - NWS to display mapping
- [Animated Icons Implementation](../specs/ANIMATED_ICONS_IMPLEMENTATION_PLAN.md) - Icon animation system

### Layout Specifications

- [Basic Layout](../specs/basic_layout.md) - Overall UI structure and responsive design
- [Basic Layout Questions](../specs/basic_layout_QUESTIONS.md) - Design decisions and rationale

## Development

### Quick Start Commands

#### Frontend
```bash
npm install                  # Install dependencies
npm run dev                  # Development server (port 5173)
npm run build                # Production build
npm run preview              # Preview production build
npm run type-check           # TypeScript checking
npm run lint                 # ESLint
npm test                     # Run tests (watch mode)
npm run test:run             # Run tests once
npm run test:coverage        # Run tests with coverage
```

#### Backend
```bash
cd server && npm install     # Install dependencies
cd server && npm run dev     # Development with hot reload (port 3001)
cd server && npm run build   # Compile TypeScript
cd server && npm start       # Run production build
cd server && npm run type-check  # TypeScript checking
npm test                     # Run tests (watch mode)
npm run test:run             # Run tests once
npm run test:coverage        # Run tests with coverage
```

#### Docker
```bash
docker-compose up -d         # Run full application
docker-compose logs -f       # View logs
docker-compose down          # Stop application
```

### Development Principles

**From [CLAUDE.md](../CLAUDE.md)**:

- Components must be < 300 lines
- Complete separation of display and data concerns
- Smart tests, no mocks, no placeholders
- KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself)

### File Organization

```
weather-app/
├── src/                     # Frontend source code
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   ├── stores/              # Zustand state stores
│   └── types/               # TypeScript type definitions
├── server/                  # Backend source code
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   └── types/           # TypeScript type definitions
├── specs/                   # Project specifications
│   └── cards/               # Component specifications
├── examples/                # API research and examples
├── prompts/                 # Development planning
└── docs/                    # Documentation (you are here)
```

## API Documentation

### Backend API Reference

**[docs/API.md](./API.md)** - Complete API documentation including:

#### Endpoints
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/weather/:zipcode` - Fetch weather data
- `POST /api/weather/:zipcode/refresh` - Force refresh
- `GET /api/weather/cache/stats` - Cache statistics
- `POST /api/weather/cache/clear` - Clear all cache
- `POST /api/weather/cache/clear/:zipcode` - Clear location cache
- `GET /api/weather/background-jobs/status` - Background job status

#### Key Topics
- Request/response formats
- Error handling strategies
- Data transformation layer
- Caching implementation (TTL values, cache keys)
- Background jobs (5-minute refresh cycle)
- NWS API integration
- Retry logic and exponential backoff

### External APIs

**[examples/NWS-API.md](../examples/NWS-API.md)** - NWS API research and examples:
- API endpoint documentation
- Response format examples
- Integration patterns
- Rate limiting considerations

### API Integration Flow

1. ZIP → Geocode → Coordinates
2. Coordinates → `/points/{lat},{lon}` → grid coordinates
3. Grid coordinates → parallel calls:
   - `/gridpoints/{office}/{gridX},{gridY}/forecast` (7-day)
   - `/gridpoints/{office}/{gridX},{gridY}/forecast/hourly`
   - `/stations/{stationId}/observations/latest` (current conditions)
   - `/alerts/active?point={lat},{lon}` (alerts)

## Testing

### Test Suite Overview

**[TEST_SUITE_SUMMARY.md](../TEST_SUITE_SUMMARY.md)** - Complete test suite documentation:

- **Total Tests**: 1,114 tests (347 backend, 767 frontend)
- **Test Philosophy**: No mocks, no placeholders - testing actual functionality
- **Coverage**: All critical functionality covered
- **CI/CD**: Tests run on every commit

#### Test Categories

**Backend Tests (347 tests)**:
- Service tests (282 tests across 6 files)
- API endpoint tests (40 tests)
- Regression tests (25 tests)

**Frontend Tests (767 tests)**:
- Component tests (446 tests across 9 files)
- Hook and store tests (298 tests across 5 files)
- Regression tests (23 tests)

### Test Strategy

**[TEST_PLAN.md](../TEST_PLAN.md)** - Testing strategy and implementation plan:
- Test framework setup (Vitest)
- Testing approach and methodology
- Unit test organization
- Integration test patterns
- Mock strategies (minimal mocking)

### Running Tests

```bash
# Frontend tests
npm test                    # Watch mode
npm run test:run            # Run once
npm run test:ui             # Interactive UI
npm run test:coverage       # With coverage report

# Backend tests
cd server && npm test       # Watch mode
cd server && npm run test:run    # Run once
cd server && npm run test:ui     # Interactive UI
cd server && npm run test:coverage   # With coverage report
```

## Deployment

### Deployment Guide

**[DEPLOYMENT.md](../DEPLOYMENT.md)** - Complete deployment documentation:

#### Quick Start
```bash
docker-compose up -d        # Build and start
docker-compose logs -f      # View logs
docker-compose down         # Stop
```

#### Topics Covered
- Multi-stage Docker build (3 stages)
- Environment variables configuration
- Port mapping and networking
- Health checks (nginx + backend)
- Production deployment strategies
- GitHub Actions CI/CD pipeline
- Image tagging strategy (SHA + latest)
- Reverse proxy setup (Traefik, nginx-proxy, Caddy)
- SSL/TLS configuration
- Resource limits and optimization
- Troubleshooting guide

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):

1. Frontend Build & Test
   - Type checking
   - Linting
   - Test suite
   - Production build

2. Backend Build & Test
   - Type checking
   - Linting
   - Test suite
   - Compilation

3. Docker Build & Push (main branch only)
   - Multi-stage build
   - Tag with commit SHA and `latest`
   - Push to GitHub Container Registry

### Health Monitoring

- **nginx health**: `http://localhost/health` (plain text)
- **Backend API health**: `http://localhost/api/health` (JSON)
- **Container health**: Docker health checks every 30 seconds

## Design System

### Glassmorphism Implementation

**[MODERN_DESIGN_REFACTOR.md](../MODERN_DESIGN_REFACTOR.md)** - Complete design system:

#### Implementation Phases

**Phase 1: Foundation** - Design tokens and base styles
- CSS variables for glass effects
- Tailwind configuration extensions
- Gradient backgrounds

**Phase 2: Core Components** - GlassCard system
- Reusable GlassCard component
- Props: blur, opacity, gradient, severity, interactive
- Severity-based styling (Extreme/Severe/Moderate/Minor)

**Phase 3: Layout & Cards** - Weather card refactoring
- All weather cards updated with glass aesthetic
- Consistent visual language
- Enhanced readability

#### Design Tokens

Glass-specific CSS variables:
- `--glass-bg-light` / `--glass-bg-dark`
- `--glass-border-light` / `--glass-border-dark`
- `--glass-blur`

#### Components

- GlassCard component (`src/components/ui/glass-card.tsx`)
- Utility classes: `glass-card`, `glass-alert-*`, `glass-gradient`
- Tailwind extensions: backdrop blur, gradients, shadows

## Performance

### Optimizations Implemented

**Code Splitting & Lazy Loading**:
- Lazy loading for heavy components (AlertCard, SevenDayForecast, CurrentConditions, HourlyForecast)
- Manual chunk splitting: vendor (React), charts (Recharts), UI components, utils
- Initial bundle: 33.31 kB (10.12 kB gzipped) - 94% reduction from 569.81 kB
- Lazy-loaded chunks load on-demand

**Progressive Web App (PWA)**:
- Installable as standalone app
- Service worker with offline support
- Network-first caching strategy:
  - NWS API: 1 hour cache
  - Sunrise/Sunset API: 24 hour cache
  - Backend API: 10 minute cache with 10s timeout

**Build Optimizations**:
- ESBuild minification
- Tree-shaking for unused code
- Preload hints for critical resources

### Caching Strategy

**Server-side Cache TTLs**:
- Points data: 24 hours (grid coordinates rarely change)
- Forecasts: 1 hour (updated hourly by NWS)
- Observations: 10 minutes (frequent updates)
- Alerts: No cache (real-time data required)
- Station metadata: 7 days (static data)

**Background Cache Warming**:
- Configured ZIP codes: 75454, 75070, 75035
- Refresh interval: Every 5 minutes
- Ensures fast response times for frequent locations

## Development Workflow

### Planning and Work Logs

Located in `prompts/`:
- [work.md](../prompts/work.md) - Development work log
- [plan.md](../prompts/plan.md) - Project planning and milestones
- [fix_plan.md](../prompts/fix_plan.md) - Bug fixes and implementation plans

### Creating New Components

1. Check if specification exists in `specs/cards/` first
2. Use clear, non-conflicting naming
3. Document implementation plan in fix_plan.md
4. Keep components < 300 lines
5. Separate data fetching from display logic
6. Write tests before or alongside implementation
7. Update this index if adding major documentation

## User Features

### User Preferences (Client-side cached)

- Previously submitted ZIP codes (max 5, newest first)
- Dark/light mode selection
- Unit system (Imperial/Metric)
- Hourly forecast chart period/type selections

### Data Refresh Behavior

- **Page loads**: Fetch from server
- **Client-side**: Background refresh every 1 minute (non-interrupting)
- **Server-side**: Background refresh every 5 minutes for cached ZIP codes
- **Manual refresh**: Available via button or `POST /api/weather/:zipcode/refresh`

### Error Handling

- Global error banner with details for API failures
- Loading states: Skeleton screens + spinners
- Rate limiting: Exponential backoff for 429 errors
- Retry logic with proper User-Agent headers
- Graceful degradation for non-critical data (UV Index, current observations)

## External Services

### National Weather Service (NWS)

- **Base URL**: `https://api.weather.gov`
- **Required Header**: `User-Agent: WeatherApp/1.0 (contact@example.com)`
- **Rate Limiting**: No official limit, exponential backoff on 429 errors
- **Documentation**: https://www.weather.gov/documentation/services-web-api

### Geocoding

- **Service**: Zippopotam.us API
- **Purpose**: ZIP code to coordinates conversion
- **Cache TTL**: 24 hours

### Sunrise/Sunset

- **Library**: SunCalc (astronomical calculations)
- **Fallback API**: sunrise-sunset.org
- **Format**: `https://api.sunrise-sunset.org/json?lat={lat}&lng={lng}&formatted=0`

### UV Index (Optional)

- **Service**: OpenWeatherMap API
- **Requirement**: API key (optional, UV data unavailable without it)
- **Cache TTL**: 1 hour

## Contributing

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint for code quality
- All builds must pass type checking
- Tests required for new features
- Components must be < 300 lines
- No mocks in tests where possible

### Pre-commit Requirements

- Type checking passes
- Linting passes
- Tests pass
- Build succeeds

### Git Workflow

1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Run tests and type checking locally
4. Push and create pull request
5. CI/CD pipeline runs automatically
6. Merge after approval and passing checks

## Additional Resources

### Type Definitions

- **Frontend**: `src/types/weather.ts` - Client-side types
- **Backend**: `server/src/types/weather.types.ts` - Server-side types

### Configuration Files

- `vite.config.ts` - Frontend build configuration
- `vitest.config.ts` - Frontend test configuration
- `server/vitest.config.ts` - Backend test configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.cjs` - PostCSS configuration
- `docker-compose.yml` - Docker deployment configuration
- `Dockerfile` - Multi-stage Docker build
- `nginx.conf` - nginx web server configuration

## Support and Troubleshooting

### Common Issues

See [DEPLOYMENT.md](../DEPLOYMENT.md#troubleshooting) for:
- Container troubleshooting
- Backend not starting
- nginx proxy issues
- Build failures
- Resource usage monitoring

### Health Checks

```bash
# Quick nginx check
curl http://localhost/health

# Backend API check
curl http://localhost/api/health

# Container health
docker ps
docker inspect --format='{{json .State.Health}}' haus-weather-station | jq
```

### Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f weather-app | grep "Backend"

# nginx only
docker-compose logs -f weather-app | grep "nginx"
```

## Version History

**Current Version**: 1.0.0

### Recent Updates

- Comprehensive test suite (1,114 tests)
- CI/CD pipeline integration
- Glassmorphism design system
- PWA support with offline capabilities
- Performance optimizations (94% bundle size reduction)
- Background cache warming
- Docker deployment

## License

This is a personal project. All rights reserved.

## Contact

For issues or questions about this documentation, please refer to the commit history or contact the project maintainer.

---

**Last Updated**: October 2, 2025

**Documentation Maintained By**: Jacob Hausler (@jacobhausler)
