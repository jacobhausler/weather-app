# Loading States Component Specification

## Purpose and Overview

Defines the loading state behaviors, skeleton screens, and loading indicators used throughout the weather application. Provides consistent visual feedback during data fetching operations while maintaining layout stability and avoiding content layout shift (CLS). Used across all weather cards and components.

## Types of Loading States

### 1. Skeleton Screens
Pre-rendered placeholder content that mimics the structure and layout of actual content. Prevents layout shift and provides visual feedback about content structure.

### 2. Spinner/Progress Indicators
Circular or linear loading indicators for smaller operations or buttons.

### 3. Progressive Loading
Showing available data while loading remaining data in background.

### 4. Refresh Indicators
Non-interrupting indicators for background data refresh.

## Skeleton Screen Designs

### Alert Card Skeleton
```
┌─────────────────────────────────────────────────────────────┐
│  Alerts                                                     │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                    │ │
│  │                                                        │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │                                                        │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 7-Day Forecast Skeleton
```
┌─────────────────────────────────────────────────────────────┐
│  7-Day Forecast                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│ │▓▓▓▓│        │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Current Conditions Skeleton
```
┌─────────────────────────────────────────────────────────────┐
│  Current Conditions                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Hourly Forecast Skeleton
```
┌─────────────────────────────────────────────────────────────┐
│  Hourly Forecast                                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [12h] [24h] [48h]  |  [Temp] [Precip] [Wind] [Humid] │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Skeleton Component Design

### Basic Skeleton Element
```tsx
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        `skeleton--${variant}`,
        `skeleton--${animation}`,
        className
      )}
      style={{ width, height }}
    />
  );
}
```

### Skeleton Animations

**Pulse Animation**:
```css
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.skeleton--pulse {
  animation: skeleton-pulse 2s ease-in-out infinite;
}
```

**Wave Animation** (shimmer effect):
```css
@keyframes skeleton-wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton {
  position: relative;
  overflow: hidden;
}

.skeleton--wave::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: skeleton-wave 1.5s linear infinite;
}
```

### Styling Guidelines
- **Background color**:
  - Light mode: `#e0e0e0` or similar gray
  - Dark mode: `#333333` or similar dark gray
- **Border radius**: Match content shape (text: small, cards: medium, circular: 50%)
- **Size**: Match expected content size exactly to prevent CLS
- **Spacing**: Preserve layout spacing and margins

## Spinner Indicators

### Spinner Variants

**Small Spinner** (button loading):
```tsx
<button disabled>
  <Spinner size="sm" />
  Loading...
</button>
```

**Medium Spinner** (card loading):
```tsx
<div className="card">
  <Spinner size="md" />
</div>
```

**Large Spinner** (page loading):
```tsx
<div className="page-loader">
  <Spinner size="lg" />
  <p>Loading weather data...</p>
</div>
```

### Spinner Component
```tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  label?: string; // For screen readers
}

function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <div
      className={cn('spinner', `spinner--${size}`, className)}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <svg
        className="spinner-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="spinner-path"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}
```

### Spinner Animation
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

.spinner--sm { width: 16px; height: 16px; }
.spinner--md { width: 24px; height: 24px; }
.spinner--lg { width: 48px; height: 48px; }
```

## Progressive Loading

### Strategy
Show available data immediately while loading additional data:

```tsx
function WeatherDashboard({ zipCode }: Props) {
  const {
    currentConditions,
    forecast,
    hourlyData,
    isLoadingCurrent,
    isLoadingForecast,
    isLoadingHourly
  } = useWeatherData(zipCode);

  return (
    <>
      {/* Show immediately if available */}
      {currentConditions ? (
        <CurrentConditionsCard data={currentConditions} />
      ) : (
        <CurrentConditionsSkeleton />
      )}

      {/* Show when loaded */}
      {forecast ? (
        <SevenDayForecastCard data={forecast} />
      ) : (
        <SevenDayForecastSkeleton />
      )}

      {/* Load in background */}
      {hourlyData ? (
        <HourlyForecastCard data={hourlyData} />
      ) : (
        <HourlyForecastSkeleton />
      )}
    </>
  );
}
```

## Refresh Indicators

### Background Refresh (Non-Interrupting)
Don't replace content with skeleton during refresh:

```tsx
function WeatherCard({ data, isRefreshing }: Props) {
  return (
    <div className="card">
      {isRefreshing && (
        <div className="refresh-indicator">
          <Spinner size="sm" />
        </div>
      )}
      <CardContent data={data} />
    </div>
  );
}
```

**Visual indicator**: Small spinner in corner of card

### Manual Refresh
Refresh button shows loading state:

```tsx
<RefreshButton
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
/>
```

## Loading State Transitions

### Smooth Transitions
```css
.card-content {
  transition: opacity 200ms ease-in-out;
}

.card-content--loading {
  opacity: 0.5;
}

.skeleton {
  animation: skeleton-fade-in 200ms ease-in-out;
}

@keyframes skeleton-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Prevent Layout Shift
- Skeleton dimensions match actual content
- Reserve space for images and dynamic content
- Use aspect ratios for images
- Set explicit heights where appropriate

## Accessibility Considerations

### Screen Reader Announcements
```tsx
// Loading state
<div role="status" aria-live="polite" aria-label="Loading weather data">
  <Skeleton />
</div>

// Content loaded
<div role="region" aria-label="Weather data">
  <Content />
</div>
```

### ARIA Attributes
- **Loading**: `role="status"`, `aria-live="polite"`, `aria-busy="true"`
- **Spinner**: `role="status"`, `aria-label="Loading"`
- **Progress**: Use `<progress>` element or `role="progressbar"`

### Skip Links
Provide skip link to bypass loading content:
```html
<a href="#main-content" className="sr-only sr-only-focusable">
  Skip to content
</a>
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .skeleton--pulse,
  .skeleton--wave,
  .spinner-icon {
    animation: none;
  }

  .skeleton {
    opacity: 0.5; /* Static alternative */
  }
}
```

## Loading State Priorities

### Priority Order
1. **Critical**: Current conditions, alerts (show skeleton)
2. **Important**: 7-day forecast (show skeleton)
3. **Secondary**: Hourly forecast (show skeleton or load quietly)
4. **Optional**: Historical data, trends (load in background)

### Staggered Loading
Load critical data first, then secondary:

```typescript
async function loadWeatherData(zipCode: string) {
  // Critical data first
  const [currentConditions, alerts] = await Promise.all([
    fetchCurrentConditions(zipCode),
    fetchAlerts(zipCode)
  ]);

  // Then forecast data
  const [forecast, hourlyData] = await Promise.all([
    fetchForecast(zipCode),
    fetchHourlyData(zipCode)
  ]);

  return { currentConditions, alerts, forecast, hourlyData };
}
```

## Error States During Loading

### Failed to Load
Replace skeleton with error message:

```tsx
{isLoading ? (
  <Skeleton />
) : error ? (
  <ErrorMessage error={error} onRetry={retry} />
) : (
  <Content data={data} />
)}
```

### Partial Failure
Show available data, indicate missing sections:

```tsx
<CurrentConditionsCard
  data={currentConditions}
  isMissingHumidity={!currentConditions.humidity}
/>
```

## Example Usage

### Card with Loading State
```tsx
import { Skeleton } from '@/components/ui/skeleton';

function CurrentConditionsCard({ data, isLoading }: Props) {
  if (isLoading) {
    return <CurrentConditionsSkeleton />;
  }

  return (
    <div className="card">
      <h2>Current Conditions</h2>
      {/* Content */}
    </div>
  );
}

function CurrentConditionsSkeleton() {
  return (
    <div className="card">
      <Skeleton variant="text" width="60%" height={24} />
      <div className="card-grid">
        <div>
          <Skeleton variant="circular" width={64} height={64} />
          <Skeleton variant="text" width="80%" />
        </div>
        <div>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="85%" />
        </div>
      </div>
    </div>
  );
}
```

### Button with Loading
```tsx
<button onClick={handleSubmit} disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner size="sm" />
      <span>Loading...</span>
    </>
  ) : (
    'Submit'
  )}
</button>
```

## Performance Considerations

- Use CSS animations (not JavaScript)
- Memoize skeleton components
- Avoid unnecessary re-renders during loading
- Optimize animation performance (use `transform` and `opacity`)
- Lazy load non-critical components
- Implement code splitting for large components

## Testing Requirements

- Render each skeleton component
- Verify skeleton dimensions match content
- Test skeleton animations (pulse, wave)
- Verify no layout shift when content loads
- Test reduced motion preference
- Test spinner in different sizes
- Verify ARIA attributes for loading states
- Test screen reader announcements
- Test loading → content transitions
- Test loading → error transitions
- Verify progressive loading behavior
- Test refresh indicators (non-interrupting)
- Test color contrast in both themes
- Verify skeleton colors in light/dark mode
- Test with slow network (throttling)
- Verify skeleton appears quickly (no delay)
- Test staggered loading behavior