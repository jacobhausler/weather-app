# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self-hosted personal weather forecast application - a single-page React application that displays weather data from the National Weather Service (NWS) API. Backend server fetches and caches data from NWS, serves to client via REST API. Deployed as Docker container with nginx.

## Architecture

### Frontend (React SPA)
- **Framework**: React with TypeScript
- **UI Components**: shadcn/ui (https://ui.shadcn.com/)
- **State Management**: Zustand
- **Styling**: Style-in-components approach
- **Charts**: shadcn/ui chart components (for hourly forecast visualizations)

### Backend (Node.js)
- Fetches data from NWS API endpoints
- Maintains 5-minute server-side refresh cycle for cached ZIP codes
- Serves cached data immediately while triggering background refresh
- Initial cached ZIP codes: 75454, 75070, 75035 (configurable)

### Deployment
- Docker container deployment to local server
- nginx for serving pages
- GitHub Actions to build and publish to private GitHub Container Registry

## Key Development Principles

**SIMPLICITY IS PARAMOUNT**:
- Components must be < 300 lines
- Complete separation of display and data concerns
- Smart tests, no mocks, no placeholders
- KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself)

## UI Layout Structure

### Main Layout
- Mobile-first responsive design
- Fixed title: "HAUS Weather Station"
- ZIP code input (top right) with 5-digit validation, submit button, caches previous submissions
- Manual refresh icon (top left of title)
- Dark/light mode toggle (bottom) with system preference detection

### Cards (visible after ZIP submission)

1. **Alert Card** (conditionally rendered)
   - Only visible when county-level active alerts exist
   - Displays: type, headline, severity/urgency, description, effective time range
   - Multiple alerts stack vertically
   - Severity-based visual styling (Extreme/Severe/Moderate/Minor)

2. **7-Day Forecast Card**
   - Horizontal row layout (7 days)
   - Each day shows: high/low temps, icons, precipitation probability, wind info
   - Combined day/night forecast per day
   - Click day to open modal with all available forecast information

3. **Current Conditions + Daily Forecast Card**
   - Grid layout with hierarchical nested cards
   - Current: temperature, feels like, humidity, dewpoint, wind speed/direction/gusts, visibility, cloud cover, UV index, sunrise/sunset
   - Includes today's high/low and tonight's forecast
   - Detailed forecast text

4. **Hourly Forecast Card**
   - Bar charts for visualizations
   - Configurable period and data type (split button box)
   - Parameters: temperature, precipitation, wind, humidity
   - Mutually exclusive view switching (one chart at a time)

## Data Handling

### NWS API Integration Flow
1. ZIP → Geocode → Coordinates
2. Coordinates → `/points/{lat},{lon}` → grid coordinates
3. Grid coordinates → parallel calls:
   - `/gridpoints/{office}/{gridX},{gridY}/forecast` (7-day)
   - `/gridpoints/{office}/{gridX},{gridY}/forecast/hourly`
   - `/stations/{stationId}/observations/latest` (current conditions)
   - `/alerts/active?point={lat},{lon}` (alerts)

### Caching Strategy (Server-side)
- Points data: 24 hours
- Forecasts: 1 hour
- Observations: 10 minutes
- Alerts: Real-time (no caching)
- Station/Zone metadata: 7 days

### Refresh Behavior
- Page loads: Fetch from server
- Client-side: Background refresh every 1 minute (non-interrupting)
- Server-side: Refresh data every 5 minutes for configured ZIP codes
- Manual refresh available via button

### Error Handling
- Global error banner with details for API failures
- Loading states: Skeleton screens + spinners
- Rate limiting: Exponential backoff for 429 errors
- Retry logic with proper User-Agent headers

## NWS API Requirements

All requests must include proper User-Agent header:
```
User-Agent: WeatherApp/1.0 (contact@example.com)
```

Base URL: `https://api.weather.gov`

## File Organization

- `src/` - Application source code
- `specs/` - Project specifications and requirements
  - `specs/cards/` - Individual card component specifications (create here if missing)
- `examples/` - API research and documentation
- `prompts/` - Development planning and work logs

## Creating New Modules

When creating a new weather card/module:
1. Check if specification exists in `specs/cards/` first (search before creating)
2. Use clear, non-conflicting naming
3. Document implementation plan in fix_plan.md
4. Keep components < 300 lines
5. Separate data fetching from display logic

## User Preferences (Client-side cached)

- Previously submitted ZIP codes
- Dark/light mode selection
- Unit system (Imperial/Metric toggle at bottom)
- Hourly forecast chart period/type selections

## Icon Assets

Use NWS-provided weather icons from their API endpoints.