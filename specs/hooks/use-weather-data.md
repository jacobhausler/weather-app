# useWeatherData Hook Specification

## Overview

The `useWeatherData` hook is a custom React hook that manages weather data fetching, caching, and automatic refresh functionality for the HAUS Weather Station application. It provides a complete data lifecycle management solution with intelligent failure handling, exponential backoff, and user experience optimizations.

**Location**: `src/hooks/useWeatherData.ts`

## Purpose

- Provide a centralized interface for weather data operations across the application
- Manage automatic background refresh with intelligent failure handling
- Implement user-friendly refresh behavior that doesn't interrupt the UI
- Handle initial data loading from cached ZIP codes
- Integrate with Page Visibility API for battery-efficient refresh
- Provide manual refresh capability with cache clearing

## Core Responsibilities

1. **Initial Data Loading**: Auto-fetch weather data on mount if a cached ZIP code exists
2. **Manual Fetching**: Provide user-initiated weather data fetching for new ZIP codes
3. **Background Refresh**: Non-interrupting automatic refresh every 60 seconds
4. **Failure Management**: Exponential backoff and auto-pause on consecutive failures
5. **Visibility Optimization**: Pause refresh when tab is hidden, resume when visible
6. **State Management**: Interface with Zustand weather store for global state

## Configuration Constants

```typescript
const REFRESH_INTERVAL = 60000 // 1 minute in milliseconds
const MAX_CONSECUTIVE_FAILURES = 3
const INITIAL_BACKOFF_DELAY = 2000 // 2 seconds
const MAX_BACKOFF_DELAY = 32000 // 32 seconds
```

## API

### Return Values

```typescript
{
  weatherData: WeatherData | null,
  isLoading: boolean,
  error: string | null,
  currentZipCode: string | null,
  fetchWeather: (zipCode: string) => Promise<void>,
  refreshWeather: () => Promise<void>,
  isAutoRefreshPaused: boolean
}
```

#### weatherData
- **Type**: `WeatherData | null`
- **Description**: Current weather data object containing forecasts, observations, and alerts
- **Source**: Zustand weather store

#### isLoading
- **Type**: `boolean`
- **Description**: Loading state for manual fetch/refresh operations
- **Note**: Does NOT trigger during background refresh to avoid UI interruptions

#### error
- **Type**: `string | null`
- **Description**: Error message from most recent manual fetch/refresh
- **Note**: Background refresh failures do NOT set this value

#### currentZipCode
- **Type**: `string | null`
- **Description**: Currently active ZIP code
- **Source**: Zustand weather store (persisted)

#### fetchWeather
- **Type**: `(zipCode: string) => Promise<void>`
- **Description**: Fetch weather data for a new ZIP code (user-initiated)
- **Behavior**:
  - Validates ZIP code format (5 digits)
  - Sets loading state
  - Clears previous errors
  - Updates weather data on success
  - Adds ZIP to recent history
  - Resets failure tracking on success

#### refreshWeather
- **Type**: `() => Promise<void>`
- **Description**: Manually refresh current ZIP code data (clears server cache)
- **Behavior**:
  - Requires currentZipCode to be set
  - Sets loading state
  - Clears previous errors
  - Calls cache-clearing refresh endpoint
  - Resets failure tracking and resumes auto-refresh on success

#### isAutoRefreshPaused
- **Type**: `boolean`
- **Description**: Indicates if automatic refresh has been paused due to consecutive failures
- **Note**: Manual refresh can resume auto-refresh

## Auto-Refresh Behavior

### Normal Operation

1. **Interval**: Every 60 seconds (REFRESH_INTERVAL)
2. **Trigger Conditions**:
   - `currentZipCode` is set
   - Page is visible (`!document.hidden`)
   - Auto-refresh is not paused
   - No refresh is currently in progress

3. **Non-Interrupting Design**:
   - Does NOT set loading state
   - Does NOT clear existing error messages
   - Silently updates data in background
   - Only logs failures to console

### Page Visibility Integration

The hook leverages the Page Visibility API to optimize battery usage and network requests:

1. **When Tab Hidden**:
   - Interval timer continues running
   - Refresh attempts are skipped (visibility check in interval callback)
   - No network requests made while hidden

2. **When Tab Becomes Visible**:
   - Event listener (`visibilitychange`) triggers immediate refresh
   - Ensures data is fresh when user returns to tab
   - Resumes normal interval-based refresh

3. **Implementation**:
   ```typescript
   // In interval callback
   if (!document.hidden && !isAutoRefreshPaused) {
     backgroundRefresh()
   }

   // Visibility change handler
   const handleVisibilityChange = () => {
     if (!document.hidden && currentZipCode && !isAutoRefreshPaused) {
       backgroundRefresh()
     }
   }
   document.addEventListener('visibilitychange', handleVisibilityChange)
   ```

## Exponential Backoff

### Failure Tracking

The hook maintains failure state using refs to avoid unnecessary re-renders:

- `consecutiveFailuresRef`: Counter for consecutive background refresh failures
- `backoffDelayRef`: Current backoff delay duration
- `isAutoRefreshPaused`: State flag indicating auto-refresh is paused

### Backoff Algorithm

1. **On Background Refresh Failure**:
   - Increment `consecutiveFailuresRef.current`
   - If failures < `MAX_CONSECUTIVE_FAILURES` (3):
     - Double the backoff delay: `backoffDelayRef.current * 2`
     - Cap at `MAX_BACKOFF_DELAY` (32 seconds)
     - Log warning with retry timing
   - If failures >= `MAX_CONSECUTIVE_FAILURES`:
     - Pause auto-refresh (`setIsAutoRefreshPaused(true)`)
     - Log warning instructing user to use manual refresh

2. **Backoff Delay Progression**:
   - Failure 1: 2s → 4s
   - Failure 2: 4s → 8s
   - Failure 3: Paused (requires manual intervention)

3. **Interval Adjustment**:
   ```typescript
   const refreshDelay = consecutiveFailuresRef.current > 0
     ? backoffDelayRef.current
     : REFRESH_INTERVAL
   ```

### Failure Recovery

Auto-refresh resumes when:

1. **Successful Background Refresh**:
   - Resets `consecutiveFailuresRef.current` to 0
   - Resets `backoffDelayRef.current` to `INITIAL_BACKOFF_DELAY` (2s)
   - Clears `isAutoRefreshPaused` flag

2. **Successful Manual Refresh**:
   - Same reset behavior as background refresh
   - Allows user to recover from paused state
   - Triggers immediate resume of auto-refresh

## Failure Handling

### Manual Fetch/Refresh Failures

User-initiated operations (`fetchWeather`, `refreshWeather`):

1. Set loading state to true
2. Clear previous errors
3. On failure:
   - Extract error message from Error object
   - Set error state with user-friendly message
   - Display error in UI via global error banner
4. Always clear loading state in finally block
5. Do NOT affect auto-refresh state

### Background Refresh Failures

Silent background operations (`backgroundRefresh`):

1. No loading state change
2. No error state change
3. On failure:
   - Trigger exponential backoff logic
   - Log to console only
   - Increment failure counter
   - Adjust refresh interval or pause
4. User's current view remains undisturbed

### Validation Failures

ZIP code validation occurs in `fetchWeather`:

```typescript
if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
  setError('Invalid ZIP code. Please enter a 5-digit ZIP code.')
  return
}
```

## Initial Load Behavior

### Auto-Fetch on Mount

```typescript
useEffect(() => {
  if (currentZipCode && !weatherData && !isLoading && !hasInitializedRef.current) {
    hasInitializedRef.current = true
    fetchWeather(currentZipCode)
  }
}, [])
```

**Trigger Conditions** (all must be true):
- `currentZipCode` exists (from persisted storage)
- `weatherData` is null (no cached data)
- `isLoading` is false (not currently loading)
- `hasInitializedRef.current` is false (hasn't run yet)

**Purpose**: Restore user's last session by auto-loading their previous ZIP code

**Safety**: Runs only once per component mount via `hasInitializedRef`

## State Management Integration

### Zustand Store Interface

The hook interfaces with `useWeatherStore` for:

1. **Read State**:
   - `currentZipCode`: Active ZIP code
   - `weatherData`: Current weather data
   - `isLoading`: Loading flag
   - `error`: Error message
   - `recentZipCodes`: Recent ZIP history (not used in hook)

2. **Write State**:
   - `setZipCode(zipCode)`: Update current ZIP
   - `setWeatherData(data)`: Update weather data
   - `setLoading(loading)`: Set loading flag
   - `setError(error)`: Set error message
   - `addRecentZipCode(zipCode)`: Add to recent history

### Persistence

Via Zustand persist middleware:
- `currentZipCode` is persisted
- `recentZipCodes` is persisted
- `weatherData`, `isLoading`, `error` are NOT persisted

## Usage Examples

### Basic Usage in Component

```typescript
function WeatherApp() {
  const {
    weatherData,
    isLoading,
    error,
    currentZipCode,
    fetchWeather,
    refreshWeather,
    isAutoRefreshPaused
  } = useWeatherData()

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorBanner message={error} />}
      {weatherData && <WeatherDisplay data={weatherData} />}

      <ZipInput onSubmit={fetchWeather} />
      <RefreshButton onClick={refreshWeather} disabled={!currentZipCode} />

      {isAutoRefreshPaused && (
        <Warning>Auto-refresh paused. Click refresh to retry.</Warning>
      )}
    </div>
  )
}
```

### Manual Refresh

```typescript
function RefreshButton() {
  const { refreshWeather, isLoading, currentZipCode } = useWeatherData()

  return (
    <button
      onClick={refreshWeather}
      disabled={!currentZipCode || isLoading}
    >
      {isLoading ? 'Refreshing...' : 'Refresh'}
    </button>
  )
}
```

### ZIP Code Submission

```typescript
function ZipCodeInput() {
  const { fetchWeather, isLoading } = useWeatherData()
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    fetchWeather(inputValue)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter ZIP code"
        maxLength={5}
        pattern="\d{5}"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        Submit
      </button>
    </form>
  )
}
```

### Auto-Refresh Status Display

```typescript
function RefreshStatus() {
  const { isAutoRefreshPaused, refreshWeather } = useWeatherData()

  if (!isAutoRefreshPaused) return null

  return (
    <Alert variant="warning">
      <AlertIcon />
      <AlertDescription>
        Automatic refresh has been paused due to connection issues.
        <Button onClick={refreshWeather}>Try Manual Refresh</Button>
      </AlertDescription>
    </Alert>
  )
}
```

## Implementation Notes

### Refs vs State

The hook uses refs for values that should NOT trigger re-renders:

- `refreshTimerRef`: Interval timer reference
- `isRefreshingRef`: Throttling flag for background refresh
- `consecutiveFailuresRef`: Failure counter
- `backoffDelayRef`: Current backoff delay
- `hasInitializedRef`: One-time initialization flag

State is used for values that SHOULD trigger re-renders:
- `isAutoRefreshPaused`: User needs to see paused status

### Cleanup

The refresh effect properly cleans up on unmount or dependency changes:

```typescript
return () => {
  if (refreshTimerRef.current) {
    clearInterval(refreshTimerRef.current)
    refreshTimerRef.current = null
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}
```

### Throttling

`isRefreshingRef` prevents overlapping background refresh requests:

```typescript
if (!currentZipCode || isRefreshingRef.current || isAutoRefreshPaused) {
  return
}
isRefreshingRef.current = true
// ... perform refresh ...
isRefreshingRef.current = false
```

## Dependencies

### Internal Dependencies
- `useWeatherStore`: Zustand store for weather state
- `apiService`: API service for backend communication
- `WeatherData`: TypeScript type definition

### External Dependencies
- `react`: useEffect, useRef, useCallback, useState hooks
- Browser APIs: Page Visibility API (`document.hidden`, `visibilitychange`)

## Design Decisions

### Why Background Refresh Doesn't Show Loading State

**Rationale**: Background refresh is meant to be non-interrupting. Showing a loading spinner every 60 seconds would be disruptive to users viewing weather data. The data update happens silently, and any failures are handled gracefully with backoff.

### Why Exponential Backoff Pauses After 3 Failures

**Rationale**: Three consecutive failures indicate a persistent issue (server down, network outage, etc.). Continuing to hammer the server wastes resources and battery. Requiring manual intervention ensures the user is aware of the issue and can choose when to retry.

### Why Page Visibility API Integration

**Rationale**: Users often leave weather tabs open for extended periods. Refreshing data while the tab is hidden wastes battery and network resources. The immediate refresh on visibility change ensures data is fresh when users return to the tab.

### Why Initial Load Only Runs Once

**Rationale**: Using an empty dependency array with a ref guard ensures the auto-fetch only runs on initial mount. This prevents unintended refetches when the component re-renders or when dependencies change during normal operation.

## Testing Considerations

### Manual Testing Scenarios

1. **Initial Load**: Close and reopen app, verify last ZIP loads automatically
2. **Background Refresh**: Watch console for refresh logs every 60s
3. **Tab Visibility**: Switch tabs, verify refresh pauses; switch back, verify immediate refresh
4. **Network Failure**: Disconnect network, observe exponential backoff in console logs
5. **Failure Recovery**: After pause, use manual refresh to resume auto-refresh
6. **ZIP Validation**: Enter invalid ZIPs (4 digits, letters, etc.), verify error messages

### Unit Testing Focus

1. ZIP code validation logic
2. Exponential backoff calculation
3. Failure counter increments
4. Reset failure tracking on success
5. Refresh interval adjustment based on failure count

### Integration Testing Focus

1. Store updates on successful fetch
2. Error state updates on failed fetch
3. Background refresh doesn't affect loading/error state
4. Manual refresh clears cache on backend
5. Recent ZIP codes list updates

## Future Enhancement Opportunities

1. **Configurable Intervals**: Allow users to set refresh frequency
2. **Offline Detection**: Use Navigator.onLine API to pause refresh when offline
3. **Retry Strategies**: Different backoff strategies (linear, quadratic, etc.)
4. **Refresh Analytics**: Track refresh success/failure rates
5. **Progressive Enhancement**: More aggressive refresh for severe weather alerts
6. **Background Sync**: Use Service Worker Background Sync API for offline queue

## Related Documentation

- `src/stores/weatherStore.ts`: Zustand store specification
- `src/services/api.ts`: API service specification
- `src/types/weather.ts`: Weather data type definitions
- `specs/cards/`: Individual weather card specifications
- `CLAUDE.md`: Project architecture and refresh behavior overview
