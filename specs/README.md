# HAUS Weather Station - Specifications Index

This directory contains comprehensive technical specifications for all components, features, and systems in the HAUS Weather Station application.

## Quick Navigation

- [UI Components](#ui-components)
- [System Features](#system-features)
- [Icon System](#icon-system)
- [Layout & Design](#layout--design)

---

## UI Components

### Weather Cards

#### [Alert Card](cards/alert-card.md)
Displays active weather alerts for the user's location with severity-based styling. Conditionally rendered only when county-level alerts exist.

- **Component**: `/src/components/AlertCard.tsx`
- **Size**: ~170 lines
- **Features**: Expand/collapse, severity badges, ARIA live regions
- **Status**: Implemented

#### [Seven-Day Forecast Card](cards/seven-day-forecast-card.md)
Horizontal scrollable 7-day forecast with day/night combined forecasts. Click any day to open detailed modal.

- **Component**: `/src/components/SevenDayForecast.tsx`
- **Features**: Day/night temps, precipitation probability, wind info, modal details
- **Status**: Implemented

#### [Current Conditions Card](cards/current-conditions-card.md)
Information-dense card displaying current observations, today's forecast, and tonight's forecast in a two-column grid layout.

- **Component**: `/src/components/CurrentConditions.tsx`
- **Size**: ~320 lines
- **Features**: Real-time observations, UV index, sunrise/sunset, feels-like temp
- **Status**: Implemented

#### [Hourly Forecast Card](cards/hourly-forecast-card.md)
Interactive bar chart visualization of hourly forecast data with configurable time period (12/24/48h) and data type (temp/precip/wind/humidity).

- **Component**: `/src/components/HourlyForecast.tsx`
- **Features**: Recharts integration, localStorage preferences, summary stats
- **Status**: Implemented

### UI Controls

#### [Header Layout](cards/header-layout.md)
Application header with title, ZIP code input, and manual refresh button.

- **Features**: Fixed title, top-right ZIP input, top-left refresh icon
- **Status**: Implemented

#### [ZIP Code Input](cards/zip-input.md)
ZIP code input field with 5-digit validation and submission handling.

- **Component**: Part of header layout
- **Features**: 5-digit validation, cached submissions, submit button
- **Status**: Implemented

#### [Refresh Button](cards/refresh-button.md)
Manual refresh control to force cache clear and data refetch.

- **Location**: Top-left of title
- **Endpoint**: `POST /api/weather/:zipcode/refresh`
- **Status**: Implemented

#### [Theme Toggle](cards/theme-toggle.md)
Dark/light mode toggle with system preference detection.

- **Location**: Bottom of page
- **Features**: System preference detection, localStorage persistence
- **Status**: Implemented

#### [Unit Toggle](cards/unit-toggle.md)
Switch between Imperial (F/mph/mi) and Metric (C/km/h/km) unit systems.

- **Component**: `/src/components/UnitToggle.tsx`
- **Store**: `/src/stores/unitStore.ts`
- **Features**: Conversion helpers, localStorage persistence, global state
- **Status**: Implemented

### Supporting Components

#### [Error Banner](cards/error-banner.md)
Global error notification banner for API failures and network errors.

- **Component**: `/src/components/ErrorBanner.tsx`
- **Size**: ~120 lines
- **Features**: Auto-dismiss (10s), expandable details, user-friendly messages
- **Status**: Implemented

#### [Loading States](cards/loading-states.md)
Skeleton screen components for all weather cards using shadcn/ui Skeleton.

- **Component**: `/src/components/LoadingSkeletons.tsx`
- **Exports**: `AlertCardSkeleton`, `SevenDayForecastSkeleton`, `CurrentConditionsSkeleton`, `HourlyForecastSkeleton`
- **Features**: Layout stability, CLS prevention, reduced-motion support
- **Status**: Implemented

#### [Forecast Modal](cards/forecast-day-modal.md)
Modal dialog showing comprehensive forecast details for a selected day from the 7-day forecast.

- **Component**: `/src/components/ForecastModal.tsx`
- **Features**: Full forecast text, metadata, accessibility
- **Status**: Implemented

---

## System Features

### Layout & Design

#### [Basic Layout](basic_layout.md)
High-level application layout structure with card positioning and visual hierarchy.

- **Structure**: Title, ZIP input, alert card, 7-day forecast, current conditions, hourly forecast
- **Approach**: Mobile-first responsive design
- **Status**: Implemented

#### [Design Questions](basic_layout_QUESTIONS.md)
Design decisions and questions documented during initial layout planning phase.

- **Status**: Historical reference

### Data & State Management

#### Caching Strategy
Server-side caching documented in individual card specifications:
- **Points data**: 24 hours
- **Forecasts**: 1 hour
- **Observations**: 10 minutes
- **Alerts**: Real-time (no caching)
- **Metadata**: 7 days

#### Refresh Behavior
- **Client-side**: Background refresh every 1 minute (non-interrupting)
- **Server-side**: Background refresh every 5 minutes for cached ZIP codes
- **Manual**: Refresh button clears cache and refetches

---

## Icon System

### Implementation Plan

#### [Animated Icons Implementation Plan](ANIMATED_ICONS_IMPLEMENTATION_PLAN.md)
Comprehensive plan for replacing NWS static icons with animated SVG icons from [Makin-Things/weather-icons](https://github.com/Makin-Things/weather-icons).

- **Status**: Planning phase
- **Priority**: Medium (Enhancement)
- **Effort**: 2-3 days
- **Phases**: Infrastructure, Integration, Optimization, Testing
- **Benefits**: Better UX, offline support, faster loading, MIT licensed

### Icon Reference Documentation

#### [NWS Icon Codes](NWS_ICON_CODES.md)
Complete reference of all 37 NWS weather condition codes with descriptions and day/night variant information.

- **Total codes**: 37 unique base conditions (72 with day/night)
- **Categories**: Sky conditions, precipitation, visibility, severe weather, temperature
- **Format**: URL patterns, split icons, percentage modifiers

#### [NWS Icon Mapping Table](NWS_ICON_MAPPING_TABLE.md)
Detailed mapping between NWS icon codes and replacement animated icon files.

- **Use case**: Icon replacement projects
- **Coverage**: Priority-based mapping (core, common, mixed, severe/rare)

#### [Icon Documentation Index](ICON_DOCUMENTATION_INDEX.md)
Central index for all icon-related documentation and implementation details.

- **Contents**: Links to all icon specs, implementation guides, code examples

---

## Development Guidelines

### Component Principles

From [CLAUDE.md](../CLAUDE.md):

- **SIMPLICITY IS PARAMOUNT**
- Components must be < 300 lines
- Complete separation of display and data concerns
- Smart tests, no mocks, no placeholders
- KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself)

### File Organization

```
specs/
├── README.md                  # This file (navigation index)
├── basic_layout.md           # High-level layout specification
├── basic_layout_QUESTIONS.md # Design decision documentation
├── cards/                    # Component specifications
│   ├── alert-card.md
│   ├── current-conditions-card.md
│   ├── error-banner.md
│   ├── forecast-day-modal.md
│   ├── header-layout.md
│   ├── hourly-forecast-card.md
│   ├── loading-states.md
│   ├── refresh-button.md
│   ├── seven-day-forecast-card.md
│   ├── theme-toggle.md
│   ├── unit-toggle.md
│   └── zip-input.md
├── ANIMATED_ICONS_IMPLEMENTATION_PLAN.md
├── ICON_DOCUMENTATION_INDEX.md
├── NWS_ICON_CODES.md
└── NWS_ICON_MAPPING_TABLE.md
```

### Creating New Specifications

When creating a new weather card/module:
1. Check if specification exists in `specs/cards/` first (search before creating)
2. Use clear, non-conflicting naming
3. Document implementation plan in fix_plan.md
4. Keep components < 300 lines
5. Separate data fetching from display logic

---

## External Resources

### APIs & Services

- **NWS API**: https://api.weather.gov
- **OpenWeatherMap** (UV Index): Requires API key
- **Sunrise-Sunset.org** (Sun Times): No auth required
- **SunCalc Library**: JavaScript library for sun calculations

### Design System

- **UI Framework**: shadcn/ui (https://ui.shadcn.com/)
- **Charts**: Recharts library
- **Icons**: Lucide React
- **State**: Zustand
- **Styling**: Tailwind CSS

### Documentation

- **Project README**: [../README.md](../README.md)
- **Claude Instructions**: [../CLAUDE.md](../CLAUDE.md)
- **API Examples**: [../examples/NWS-API.md](../examples/NWS-API.md)
- **Work Logs**: [../prompts/fix_plan.md](../prompts/fix_plan.md)

---

## Specification Template

When creating new component specifications, include these sections:

1. **Purpose and Overview** - What the component does
2. **Props/API Interface** - TypeScript interfaces
3. **Layout and Visual Design** - Structure and styling
4. **Data Requirements** - API endpoints, transformations
5. **User Interactions** - Behaviors and events
6. **Responsive Behavior** - Breakpoints and adaptations
7. **Accessibility Considerations** - ARIA, keyboard, screen readers
8. **Loading States** - Skeletons and indicators
9. **Example Usage** - Code samples
10. **Edge Cases** - Special scenarios and handling
11. **Performance Considerations** - Optimizations
12. **Testing Requirements** - Test coverage needs
13. **Implementation Details** - File paths, dependencies

---

## Status Legend

- **Implemented**: Component is complete and in production
- **In Progress**: Actively being developed
- **Planned**: Specification complete, not yet started
- **Planning**: Specification in draft/review
- **Historical**: Reference documentation only

---

**Last Updated**: 2025-10-02
**Maintained By**: Claude Code
**Repository**: weather-app
