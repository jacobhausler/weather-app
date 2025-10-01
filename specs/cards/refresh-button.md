# Refresh Button Component Specification

## Purpose and Overview

Manual refresh control that allows users to immediately fetch the latest weather data. Located in the top-left of the header, to the left of the application title. Provides visual feedback during refresh operations through animation and loading states. Also displays error state when auto-refresh is paused due to consecutive failures.

## Props/API Interface

```typescript
// No props - component is self-contained and integrates directly with useWeatherData hook
// All state and behavior is managed internally
```

## Layout and Visual Design

### Button Variant

**Icon Only** (single variant):
```
┌────┐
│ 🔄 │  Normal state
└────┘

┌────┐
│ ⚠️ │  Auto-refresh paused state
└────┘
```

### Icon Design
- Uses lucide-react icons:
  - `RefreshCw`: Circular arrows indicating refresh/reload (normal state)
  - `AlertCircle`: Warning circle indicating auto-refresh paused (error state)
- Icon size: 20px (h-5 w-5 in Tailwind)
- Icons are inline SVG components from lucide-react

### Styling Guidelines
- **Size**: Fixed icon size (40x40px button with 20px icon)
- **Variant**: `ghost` button from shadcn/ui
- **States**:
  - **Normal**: Default ghost button appearance with RefreshCw icon
  - **Hover**: Ghost button hover effect (subtle background change)
  - **Disabled**:
    - When no ZIP code is set
    - During active refresh (isLoading)
    - Icon opacity reduced to 50%
  - **Refreshing**: RefreshCw icon with spin animation
  - **Auto-refresh paused**:
    - AlertCircle icon replaces RefreshCw
    - Yellow text color (yellow-600/yellow-400 in dark mode)

- **Colors**:
  - Normal: Inherits from ghost button variant
  - Auto-refresh paused: `text-yellow-600 dark:text-yellow-400`
  - Disabled: `opacity-50` on icon
  - Works in light and dark modes via theme system

- **Shape**:
  - Square button with rounded corners (from shadcn/ui Button component)
  - Icon centered within button
  - Relative positioning for potential overlays

### Animation

**Spinning Animation** (during refresh):
- Uses Tailwind's built-in `animate-spin` utility class
- Applied to RefreshCw icon when `isLoading` is true
- Smooth 360-degree rotation
- Continuous while loading
- Stops automatically when loading completes

**No Success Animation**:
- Component does not implement success animation
- Icon returns to static state after refresh completes

## Data Requirements

### Zustand Store Integration
Component integrates directly with `useWeatherData` hook, which provides:
- **currentZipCode**: Current active ZIP code (string | null)
- **isLoading**: Boolean indicating refresh in progress
- **refreshWeather**: Async function to manually refresh weather data
- **isAutoRefreshPaused**: Boolean indicating if auto-refresh is paused due to consecutive failures

### Refresh Behavior
- Manual refresh uses `apiService.refreshWeather()` endpoint
- Clears server-side cache and fetches fresh data
- Resets failure tracking on successful manual refresh
- Resumes auto-refresh if it was paused

### Auto-Refresh Pause Feature
- Background auto-refresh pauses after 3 consecutive failures
- Button displays AlertCircle icon in yellow when paused
- Manual refresh can resume auto-refresh functionality
- Provides visual feedback that automatic updates have stopped

## User Interactions

### Click/Tap
- **Disabled when**:
  - No ZIP code is set (`!currentZipCode`)
  - Already refreshing (`isLoading`)
- **Action**: Calls `refreshWeather()` async function
- **Feedback**:
  - RefreshCw icon starts spinning immediately via `animate-spin`
  - Button disabled during refresh (prevents duplicate requests)
- **Completion**:
  - Spinning stops when `isLoading` becomes false
  - Button re-enabled
  - If auto-refresh was paused, it resumes

### Hover (Desktop)
- Ghost button hover effect (subtle background change)
- Browser tooltip shows context-appropriate message:
  - Normal state: "Refresh weather data"
  - Auto-refresh paused: "Auto-refresh paused due to errors. Click to retry."

### Focus (Keyboard)
- Standard button focus ring from shadcn/ui
- Activate with Enter or Space key
- Accessible via Tab navigation
- Respects disabled state

### No Long Press
- Component does not implement long press functionality

### No Explicit Cooldown
- Cooldown is implicit: button disabled while `isLoading`
- Prevents spam clicking through disabled state
- No additional cooldown timer needed

## Responsive Behavior

### All Screen Sizes
- Fixed icon-only button (40x40px)
- No responsive variations in size or layout
- Single variant for all breakpoints
- Touch-friendly target size (40x40px meets minimum touch target requirements)
- Icon remains 20px at all screen sizes

## Accessibility Considerations

### Semantic HTML
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleRefresh}
  disabled={disabled}
  title="Refresh weather data"
  aria-label="Refresh weather data"
>
  <RefreshCw className="h-5 w-5" />
</Button>
```

### ARIA Attributes
- `aria-label`: Context-appropriate description
  - Normal: "Refresh weather data"
  - Paused: "Auto-refresh paused - Click to retry"
- `disabled` attribute: Native HTML disabled state (not aria-disabled)
- Icons are inline SVG (lucide-react) with no additional aria attributes needed

### Screen Reader Support
- Button provides clear aria-label based on state
- Native disabled state prevents interaction when appropriate
- Browser tooltip (`title` attribute) provides additional context
- State changes communicated through aria-label updates

### Keyboard Navigation
- Native button element, fully keyboard accessible
- Focusable via Tab key
- Activate with Enter or Space
- Focus visible indicator from shadcn/ui Button component
- Respects disabled state (cannot activate when disabled)

### Visual Indicators
- Multiple indicators for state:
  - Spinning animation during refresh
  - Different icon (AlertCircle) when auto-refresh paused
  - Yellow color when auto-refresh paused
  - Opacity reduction when disabled
- Does not rely solely on animation

### Reduced Motion
- Tailwind's `animate-spin` respects `prefers-reduced-motion`
- Animation automatically disabled for users who prefer reduced motion
- Icon remains visible without animation in reduced motion mode

## Loading States

### Normal State
```
┌────┐
│ 🔄 │  RefreshCw icon (static)
└────┘
```
- Static RefreshCw icon
- Button enabled (if ZIP code exists)
- Hover effects active

### Disabled State (No ZIP Code)
```
┌────┐
│ 🔄 │  RefreshCw icon (50% opacity)
└────┘
```
- RefreshCw icon with reduced opacity
- Button disabled
- No hover effects
- Cannot be clicked

### Refreshing State
```
┌────┐
│ ⟳  │  RefreshCw icon (spinning)
└────┘
```
- RefreshCw icon with `animate-spin` class
- Button disabled during refresh
- Tooltip: "Refresh weather data"

### Auto-Refresh Paused State
```
┌────┐
│ ⚠️ │  AlertCircle icon (yellow)
└────┘
```
- AlertCircle icon replaces RefreshCw
- Yellow text color (`text-yellow-600 dark:text-yellow-400`)
- Button enabled for manual retry
- Tooltip: "Auto-refresh paused due to errors. Click to retry."

### No Success/Error State
- Component does not implement brief success or error states
- Returns directly to normal or paused state after operation
- Errors handled by global error banner component

## Example Usage

### In Header Component
```tsx
import { RefreshButton } from '@/components/RefreshButton'

function Header() {
  return (
    <header className="flex items-center justify-between">
      <RefreshButton />
      <h1>HAUS Weather Station</h1>
      {/* Other header elements */}
    </header>
  )
}
```

### Component Implementation
```tsx
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeatherData } from '@/hooks/useWeatherData'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const { currentZipCode, isLoading, refreshWeather, isAutoRefreshPaused } = useWeatherData()

  const handleRefresh = async () => {
    if (!currentZipCode || isLoading) {
      return
    }
    await refreshWeather()
  }

  const disabled = !currentZipCode || isLoading

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRefresh}
      disabled={disabled}
      className={cn(
        'relative',
        isAutoRefreshPaused && !disabled && 'text-yellow-600 dark:text-yellow-400'
      )}
      title={
        isAutoRefreshPaused
          ? 'Auto-refresh paused due to errors. Click to retry.'
          : 'Refresh weather data'
      }
      aria-label={
        isAutoRefreshPaused
          ? 'Auto-refresh paused - Click to retry'
          : 'Refresh weather data'
      }
    >
      {isAutoRefreshPaused && !disabled ? (
        <AlertCircle className="h-5 w-5" />
      ) : (
        <RefreshCw
          className={cn(
            'h-5 w-5',
            isLoading && 'animate-spin',
            disabled && 'opacity-50'
          )}
        />
      )}
    </Button>
  )
}
```

## Edge Cases

1. **Multiple Rapid Clicks**:
   - Button disabled while `isLoading` is true
   - Early return in handler if already loading
   - Prevents multiple simultaneous refreshes
   - No additional cooldown mechanism needed

2. **Refresh During Initial Load**:
   - Button disabled when `isLoading` is true
   - Includes both initial load and refresh operations
   - User cannot trigger refresh during initial data fetch

3. **No ZIP Code Set**:
   - Button disabled when `currentZipCode` is null
   - Early return in handler if no ZIP code
   - Prevents meaningless refresh attempts

4. **Background Auto-Refresh Integration**:
   - Manual refresh calls `refreshWeather()` which resets failure tracking
   - Successful manual refresh resumes auto-refresh if paused
   - Manual refresh uses cache-clearing endpoint
   - Background refresh continues on its own timer

5. **Consecutive Refresh Failures**:
   - After 3 consecutive background refresh failures, auto-refresh pauses
   - Button displays AlertCircle icon in yellow
   - Manual refresh can resume auto-refresh functionality
   - Visual feedback indicates system is in degraded state

6. **Refresh Failure Handling**:
   - Errors displayed in global error banner (not in button)
   - Button returns to normal/paused state after failure
   - Button re-enabled immediately for retry
   - User not trapped in error state

7. **Refresh During Theme Toggle**:
   - Loading state persists through theme changes
   - Animation continues smoothly
   - No state reset on theme change

## Integration Points

### Zustand Store (useWeatherData Hook)
The component integrates with the global weather data store through the `useWeatherData` hook:

**Consumed State**:
- `currentZipCode`: Current active ZIP code
- `isLoading`: Loading state for both initial fetch and refresh
- `isAutoRefreshPaused`: Auto-refresh pause state

**Consumed Actions**:
- `refreshWeather()`: Async function that:
  - Clears server-side cache
  - Fetches fresh data
  - Resets failure tracking
  - Resumes auto-refresh if paused

### No Parent Props
- Component is self-contained
- No props passed from parent
- All state and behavior managed through Zustand store
- Can be dropped into any component without configuration

### Background Refresh Coordination
- Background refresh runs on 60-second timer in `useWeatherData`
- Manual refresh calls different endpoint (`/api/weather/:zip/refresh`) that clears cache
- Background refresh uses regular endpoint (`/api/weather/:zip`) that serves cached data
- Successful manual refresh resets failure tracking and resumes auto-refresh
- Manual and background refreshes share same `isLoading` state

## Performance Considerations

- **Component Re-renders**: Component re-renders when Zustand store state changes
  - `currentZipCode` changes
  - `isLoading` changes
  - `isAutoRefreshPaused` changes
- **No Memoization**: Component is lightweight, memoization not currently implemented
- **Animation Performance**: Uses Tailwind's `animate-spin` (CSS-based, GPU-accelerated)
- **Icon Performance**: lucide-react icons are lightweight inline SVG components
- **Click Handler**: No explicit debouncing; disabled state prevents double-clicks
- **Async Handler**: Uses async/await pattern without additional wrappers

## Testing Requirements

### Component Rendering
- Render in normal state (with ZIP code)
- Render in disabled state (no ZIP code)
- Render in loading/refreshing state
- Render in auto-refresh paused state
- Test correct icon displayed for each state (RefreshCw vs AlertCircle)
- Test correct styling applied (opacity, color, animation)

### User Interactions
- Test click triggers `refreshWeather()` call
- Test button disabled when no ZIP code
- Test button disabled when already loading
- Test keyboard activation (Enter, Space)
- Test focus indicators visible
- Test hover tooltip displays correct message

### State Management
- Test integration with `useWeatherData` hook
- Test `isAutoRefreshPaused` shows AlertCircle icon
- Test `isLoading` shows spinning animation
- Test disabled state when `currentZipCode` is null

### Accessibility
- Verify ARIA attributes (aria-label)
- Test with screen reader
- Verify title attribute for tooltips
- Test native disabled attribute behavior
- Verify keyboard navigation works

### Visual States
- Test spinning animation during refresh
- Test animation respects `prefers-reduced-motion`
- Test yellow color in auto-refresh paused state
- Test opacity reduction in disabled state
- Test in both light and dark themes

### Edge Cases
- Test rapid clicking prevented by disabled state
- Test refresh during initial load
- Test state transitions (normal → loading → normal)
- Test state transitions (normal → paused → normal)
- Test component behavior without ZIP code