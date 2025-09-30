# Refresh Button Component Specification

## Purpose and Overview

Manual refresh control that allows users to immediately fetch the latest weather data. Located in the top-left of the header, to the left of the application title. Provides visual feedback during refresh operations through animation and loading states.

## Props/API Interface

```typescript
interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  isRefreshing?: boolean;
  lastRefreshTime?: Date | string;
  className?: string;
  variant?: 'icon' | 'text' | 'icon-text';
  size?: 'sm' | 'md' | 'lg';
}
```

## Layout and Visual Design

### Button Variants

**Icon Only** (Default - for header):
```
┌────┐
│ 🔄 │
└────┘
```

**Text Only**:
```
┌──────────┐
│ Refresh  │
└──────────┘
```

**Icon + Text**:
```
┌──────────────┐
│ 🔄 Refresh   │
└──────────────┘
```

### Icon Design
- Circular arrow(s) indicating refresh/reload
- Clear, recognizable symbol
- Sized appropriately for context
- Consistent with app's icon system

### Styling Guidelines
- **Size**:
  - Small: 32x32px (icon: 16px)
  - Medium: 40x40px (icon: 20px) - Default
  - Large: 48x48px (icon: 24px)

- **States**:
  - **Normal**: Default button appearance
  - **Hover**: Slight background change, cursor pointer
  - **Active**: Pressed state indication
  - **Disabled**: Muted appearance when refreshing
  - **Refreshing**: Animated spinning icon

- **Colors**:
  - Use theme colors (primary or secondary)
  - Ensure contrast with header background
  - Works in light and dark modes

- **Shape**:
  - Square or circular button
  - Rounded corners consistent with design system
  - Icon centered within button

### Animation

**Spinning Animation** (during refresh):
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-icon--spinning {
  animation: spin 1s linear infinite;
}
```

- Smooth 360-degree rotation
- Continuous while `isRefreshing` is true
- Stops when refresh completes

**Success Animation** (optional):
```css
@keyframes success-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

- Brief pulse or checkmark after successful refresh
- ~300ms duration

## Data Requirements

### Props Data
- **onRefresh**: Callback function to trigger data refresh
- **isRefreshing**: Boolean indicating refresh in progress
- **lastRefreshTime**: Timestamp of last successful refresh (optional)

### No Direct API Calls
- Button itself doesn't fetch data
- Delegates to parent via callback
- Parent handles actual data fetching and state management

### Last Refresh Display (Optional)
If `lastRefreshTime` provided, show tooltip:
- "Last updated: 2 minutes ago"
- "Last updated: 12:45 PM"
- Relative time format preferred

## User Interactions

### Click/Tap
- **Action**: Trigger refresh
- **Feedback**:
  - Icon starts spinning immediately
  - Button disabled during refresh
  - Haptic feedback on mobile (if supported)
- **Completion**:
  - Stop spinning animation
  - Re-enable button
  - Optional success indicator

### Hover (Desktop)
- Tooltip appears: "Refresh" or "Refresh weather data"
- If last refresh time available: Show in tooltip
- Slight visual change (background, scale)

### Focus (Keyboard)
- Clear focus ring indicator
- Activate with Enter or Space key
- Accessible via Tab navigation

### Long Press (Optional - Mobile)
- Hold for 1-2 seconds
- Show last refresh time or additional options
- Visual feedback during long press

### Cooldown (Optional)
- Prevent spam clicking
- Minimum 1-2 second cooldown between refreshes
- Visual indicator if attempted too soon

## Responsive Behavior

### Desktop (≥1024px)
- Medium size button (40x40px)
- Icon only variant
- Hover effects active
- Tooltip on hover

### Tablet (768px - 1023px)
- Medium size button
- Icon only
- Hover/touch effects

### Mobile (<768px)
- Medium size button (44x44px minimum for touch)
- Icon only to save space
- Touch-friendly target size
- No hover effects
- Tooltip on long press or disabled

## Accessibility Considerations

### Semantic HTML
```html
<button
  type="button"
  aria-label="Refresh weather data"
  aria-disabled={isRefreshing}
  onClick={handleRefresh}
>
  <span aria-hidden="true">
    <!-- Icon -->
  </span>
  <span className="sr-only">Refresh</span>
</button>
```

### ARIA Attributes
- `aria-label`: Clear description of action
- `aria-disabled`: Indicate disabled state during refresh
- `aria-live="polite"` for status announcements (optional)
- Icon has `aria-hidden="true"` with text alternative

### Screen Reader Support
- Button labeled "Refresh weather data"
- State announced: "Refreshing" when loading
- Success: "Weather data updated"
- Error: "Refresh failed. Try again."
- Last refresh time announced if available

### Keyboard Navigation
- Focusable via Tab key
- Activate with Enter or Space
- Focus visible indicator
- Disabled during refresh (cannot activate multiple times)

### Visual Indicators
- Don't rely solely on animation for refresh state
- Provide additional visual cue (text or color change)
- Ensure animation respects `prefers-reduced-motion`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .refresh-icon--spinning {
    animation: none;
    opacity: 0.7; /* Alternative loading indicator */
  }
}
```

## Loading States

### Normal State
```
┌────┐
│ 🔄 │
└────┘
```
- Static refresh icon
- Button enabled
- Hover effects active

### Refreshing State
```
┌────┐
│ ⟳  │ (spinning)
└────┘
```
- Animated spinning icon
- Button disabled
- Cursor changes to not-allowed or wait
- Tooltip: "Refreshing..."

### Success State (Brief)
```
┌────┐
│ ✓  │
└────┘
```
- Checkmark appears briefly
- Then returns to normal icon
- ~500ms duration

### Error State (Brief)
```
┌────┐
│ ⚠️ │
└────┘
```
- Warning icon appears briefly
- Then returns to normal icon
- Error handled by error banner component
- Button re-enabled for retry

## Example Usage

```tsx
import { RefreshButton } from '@/components/RefreshButton';
import { useWeatherData } from '@/hooks/useWeatherData';

function Header() {
  const { refresh, isRefreshing, lastRefreshTime } = useWeatherData();

  return (
    <header>
      <RefreshButton
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
        variant="icon"
        size="md"
      />
      <h1>HAUS Weather Station</h1>
    </header>
  );
}
```

### With Async Handler
```tsx
function Header() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchWeatherData();
      // Success feedback
    } catch (error) {
      // Error handling
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <RefreshButton
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}
```

## Edge Cases

1. **Multiple Rapid Clicks**:
   - Prevent multiple simultaneous refreshes
   - Disable button when refreshing
   - Optional: Implement cooldown period

2. **Refresh During Initial Load**:
   - If data still loading initially, disable refresh
   - Or queue refresh to execute after initial load

3. **Network Offline**:
   - Detect offline state
   - Disable button or show different icon
   - Tooltip: "No internet connection"

4. **Background Auto-Refresh**:
   - Manual refresh overrides auto-refresh timer
   - Reset auto-refresh timer after manual refresh
   - Visual indicator of auto-refresh vs. manual

5. **Refresh Failure**:
   - Show brief error state
   - Re-enable button immediately
   - Allow retry without delay
   - Don't trap user in error state

6. **Very Slow Refresh**:
   - Maintain spinning animation
   - Consider timeout (e.g., 30 seconds)
   - Show timeout message if exceeded

7. **Refresh During Theme Toggle**:
   - Continue refresh operation smoothly
   - Animation persists through theme change

## Integration Points

### Parent Component Responsibilities
- Implement actual refresh logic
- Manage `isRefreshing` state
- Handle errors from refresh
- Update `lastRefreshTime`
- Trigger data re-fetch

### State Management
- Refresh state may be global (Zustand store)
- Or local to parent component
- Button is controlled component

### Coordination with Auto-Refresh
- Manual refresh should:
  - Reset auto-refresh timer
  - Override any pending auto-refresh
  - Use same refresh mechanism as auto-refresh

## Performance Considerations

- Use React.memo to prevent unnecessary re-renders
- Memoize callback function
- Optimize animation performance (CSS transforms)
- Debounce click handler (prevent double-clicks)
- Lightweight icon (inline SVG preferred)

## Testing Requirements

- Render in normal state
- Render in refreshing state
- Test click interaction triggers callback
- Test button disabled when refreshing
- Test spinning animation starts/stops correctly
- Test keyboard activation (Enter, Space)
- Test with screen reader
- Verify ARIA attributes
- Test hover states and tooltip
- Test reduced motion preference
- Test rapid clicking (should only trigger once)
- Test in different sizes (sm, md, lg)
- Test in different variants (icon, text, icon-text)
- Test error state handling
- Test success animation
- Verify focus indicators
- Test in both light and dark themes
- Test touch target size on mobile
- Test with last refresh time display