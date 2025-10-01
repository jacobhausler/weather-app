# Error Banner Component Specification

## Purpose and Overview

Global error notification banner that displays API failures, network errors, and other critical issues. Appears fixed at the top of the page with details about the error and an option for dismissal. Provides user-friendly error messages and preserves technical details for debugging.

## Props/API Interface

**No Props** - Component uses Zustand store directly.

```typescript
// Component has no props - accesses store directly
export function ErrorBanner() {
  const { error, clearError } = useWeatherStore()
  // ...
}

// Store interface (weatherStore.ts)
interface WeatherState {
  error: string | null           // Error message (string only)
  clearError: () => void         // Clear error from store
  setError: (error: string | null) => void  // Set error in store
  // ... other weather state fields
}

// Internal component interface for parsed errors
interface ErrorInfo {
  message: string                // Error message text
  details?: unknown              // Optional technical details (any type)
}
```

## Layout and Visual Design

### Banner Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠  Weather Service Error                        [✕ Dismiss]│
│                                                              │
│    Unable to connect to the weather service. Please check   │
│    your internet connection.                                │
│                                                              │
│    [Show details ▼]                                         │
└─────────────────────────────────────────────────────────────┘
```

### With Expanded Details
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠  Weather Service Error                        [✕ Dismiss]│
│                                                              │
│    Unable to connect to the weather service. Please check   │
│    your internet connection.                                │
│                                                              │
│    [Hide details ▲]                                         │
│                                                              │
│    ┌────────────────────────────────────────────────────┐  │
│    │ {                                                  │  │
│    │   "message": "Network error",                      │  │
│    │   "statusCode": 503,                               │  │
│    │   "endpoint": "/api/weather/12345"                 │  │
│    │ }                                                   │  │
│    └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Error Type Styling

**Default Error** (generic):
- Icon: AlertCircle (lucide-react)
- Variant: destructive (shadcn/ui Alert)
- Background: Red tint (destructive variant)
- Title: "Weather Service Error"

**Rate Limit Warning** (429):
- Icon: AlertCircle (lucide-react)
- Border: Yellow (border-yellow-500)
- Background: Yellow tint (bg-yellow-50 light, bg-yellow-950 dark)
- Text: Yellow (text-yellow-900 light, text-yellow-200 dark)
- Detected by: Message contains "429"

### Positioning

**Fixed Top** (only option):
- Fixed position at top of viewport (top-16)
- Below header (z-50)
- Overlays content
- Horizontal padding (px-4) with top padding (pt-4)

## Data Requirements

### Error Messages by Type

Error messages are transformed from technical messages to user-friendly messages by the `getUserFriendlyMessage()` function:

**Network Error**:
- Detection: Message contains "Network error"
- User message: "Unable to connect to the weather service. Please check your internet connection."

**Not Found (404)**:
- Detection: Message contains "404"
- User message: "Weather data not found for this location. Please verify the ZIP code."

**Rate Limit (429)**:
- Detection: Message contains "429"
- User message: "Too many requests. Please wait a moment and try again."
- Special styling: Warning (yellow) instead of error (red)

**Server Errors (500/502/503)**:
- Detection: Message contains "500", "502", or "503"
- User message: "Weather service is temporarily unavailable. Please try again later."

**Generic Errors**:
- Default: Display original error message if no pattern matches

### Error Context
The component can parse error objects with:
- `message` (string, required): Error message text
- `details` (unknown, optional): Technical details displayed in expandable section

## User Interactions

### Dismiss Button
- **Click**: Calls `clearError()` to remove error from store
- **Icon**: X (lucide-react)
- **Position**: Top-right corner of banner
- **Keyboard**: Accessible via Tab navigation
- **Auto-dismiss**: Automatic after 10 seconds

### Details Toggle (conditional)
- **Visibility**: Only shown if error has `details` property
- **Click**: Toggle `isExpanded` state to show/hide details
- **Icons**: ChevronDown (▼) when collapsed, ChevronUp (▲) when expanded
- **Labels**: "Show details" / "Hide details"
- **State**: Local component state (not persisted)

### No Retry Button
- Component does not include retry functionality
- Users must manually retry operations (e.g., re-submit ZIP code)

## Responsive Behavior

### All Screen Sizes
- Fixed positioning at top (below header)
- Full-width with horizontal padding (px-4)
- Dismiss button positioned absolutely in top-right
- Details toggle button inline below message
- Details section scrollable with overflow-auto
- Responsive padding and spacing via Tailwind classes
- Banner adapts to content width automatically

## Accessibility Considerations

### Semantic HTML
Uses shadcn/ui Alert component which provides:
```tsx
<Alert variant="destructive" className="...">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle className="flex items-center justify-between pr-8">
    <span>Weather Service Error</span>
    <Button
      variant="ghost"
      size="icon"
      onClick={clearError}
      aria-label="Dismiss error"
    >
      <X className="h-4 w-4" />
    </Button>
  </AlertTitle>
  <AlertDescription className="mt-2">
    <p>{getUserFriendlyMessage(errorInfo.message)}</p>
    {hasDetails && (
      <Button onClick={toggleDetails} className="...">
        {/* Show/Hide details */}
      </Button>
    )}
    {isExpanded && hasDetails && (
      <pre className="...">{JSON.stringify(errorInfo.details, null, 2)}</pre>
    )}
  </AlertDescription>
</Alert>
```

### ARIA Attributes
- shadcn/ui Alert component provides appropriate `role` attributes
- `aria-label="Dismiss error"` on dismiss button
- Buttons use semantic `<button>` elements
- Icon components from lucide-react are decorative

### Keyboard Navigation
- **Tab**: Navigate to dismiss button and details toggle
- **Enter/Space**: Activate buttons
- Full keyboard accessibility via native button elements

### Screen Reader Support
- Alert component announces when error appears
- Clear button labels for screen readers
- Error message read by AlertTitle and AlertDescription
- Technical details in `<pre>` tag for proper formatting

### Visual Considerations
- High contrast destructive variant for errors
- Custom yellow styling for warnings (429 rate limit)
- AlertCircle icon supplements text
- Focus indicators on interactive elements via shadcn/ui Button component

## Loading States

**No loading states** - Component has simple show/hide behavior:

### When Error Exists
- Banner visible with error message
- Dismiss button enabled
- Details toggle enabled (if details present)

### When Error Cleared
- Banner disappears (returns `null`)
- Component unmounts completely
- No animations or transitions

### Auto-Dismiss Behavior
- Timer starts when error appears
- After 10 seconds, `clearError()` called automatically
- Timer cleared if component unmounts or error changes

## Example Usage

### In App Component
```tsx
import { ErrorBanner } from '@/components/ErrorBanner'

function App() {
  return (
    <div className="app">
      <Header />

      {/* ErrorBanner accesses store directly - no props needed */}
      <ErrorBanner />

      <main>{/* Content */}</main>
    </div>
  )
}
```

### Setting Errors from API Calls
```tsx
import { useWeatherStore } from '@/stores/weatherStore'

function WeatherComponent() {
  const { setError, setLoading } = useWeatherStore()

  async function fetchWeather(zipCode: string) {
    try {
      setLoading(true)
      const response = await fetch(`/api/weather/${zipCode}`)

      if (!response.ok) {
        // Set simple string error
        setError(`HTTP ${response.status}: ${response.statusText}`)
        return
      }

      const data = await response.json()
      // Process data...

    } catch (error) {
      // Set error with details
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
}
```

### Setting Errors with Details Object
```tsx
// Component can parse objects if stored as JSON string or object
const errorWithDetails = {
  message: 'Failed to fetch weather data',
  details: {
    statusCode: 503,
    endpoint: '/api/weather/12345',
    timestamp: new Date().toISOString()
  }
}

// Store expects string, but component can parse objects
setError(JSON.stringify(errorWithDetails))
// OR if store type updated to accept objects:
setError(errorWithDetails)
```

## Edge Cases

1. **Multiple Simultaneous Errors**:
   - Only most recent error shown (store holds single error)
   - New error replaces previous error
   - Auto-dismiss timer resets for new errors

2. **Rapid Error-Success-Error**:
   - Component remounts/unmounts with each error change
   - Auto-dismiss timer resets on each error
   - Details collapse when new error appears

3. **Long Error Messages**:
   - Message text flows naturally (no truncation)
   - Details section has `overflow-auto` for scrolling
   - No max-height constraint on banner

4. **Error While Banner Displayed**:
   - New error replaces existing error immediately
   - Details collapse state resets
   - Auto-dismiss timer restarts

5. **String vs Object Errors**:
   - Component tries to parse error as object
   - Falls back to string message if parsing fails
   - Details only shown if object has `details` property

## Auto-Hide Behavior

**All Errors** (no distinction between critical/non-critical):
- Auto-hide after 10 seconds (hardcoded)
- User can dismiss earlier via button
- No countdown indicator shown
- No configuration options

**Note**: Rate limiting errors (429) get warning styling but same auto-hide behavior.

## Performance Considerations

- Conditional render: Returns `null` when no error
- Component unmounts completely when error cleared
- No memoization (simple component)
- No animations or transitions
- useEffect cleanup prevents memory leaks from timers
- Details JSON formatting done inline (no lazy loading)

## Testing Requirements

### Core Functionality
- Render with no error (should return `null`)
- Render with string error message
- Render with object error (with details)
- Test dismiss functionality (calls `clearError()`)
- Test auto-hide after 10 seconds
- Test auto-hide timer cleanup on unmount

### Error Message Transformation
- Test network error detection and message
- Test 404 error detection and message
- Test 429 error detection and warning styling
- Test 500/502/503 error detection and message
- Test generic error (no pattern match)

### Details Toggle
- Details toggle only shown when error has details
- Toggle expands/collapses details section
- Details show JSON.stringify output
- Expanded state resets when new error appears

### Accessibility
- Dismiss button has `aria-label="Dismiss error"`
- Tab navigation to buttons works
- Alert component announces errors

### Styling
- Default errors use destructive variant (red)
- 429 errors use yellow warning styling
- Fixed positioning at top-16
- Responsive padding (px-4, pt-4)

### Edge Cases
- Test error change while banner displayed
- Test error with undefined/null details
- Test very long error messages
- Test rapid error changes
- Test string error parsing (try/catch fallback)

## Implementation Details

### Component Structure
- **File**: `/workspaces/weather-app/src/components/ErrorBanner.tsx`
- **Lines**: 120 lines (within 300 line guideline)
- **Dependencies**:
  - `lucide-react`: AlertCircle, X, ChevronDown, ChevronUp icons
  - `@/components/ui/alert`: Alert, AlertDescription, AlertTitle (shadcn/ui)
  - `@/components/ui/button`: Button (shadcn/ui)
  - `@/stores/weatherStore`: useWeatherStore hook

### State Management
- **Store**: Uses `useWeatherStore` from Zustand
- **Store Fields**:
  - `error: string | null` - Current error message
  - `clearError: () => void` - Function to clear error
- **Local State**:
  - `isExpanded: boolean` - Controls details visibility
  - `errorInfo: ErrorInfo | null` - Parsed error object

### Key Functions
- `getUserFriendlyMessage(message: string): string` - Transforms technical errors to user-friendly messages
- Error parsing logic in useEffect that handles both string and object errors

### Styling Approach
- Fixed positioning: `fixed left-0 right-0 top-16 z-50`
- Conditional warning styling for 429 errors
- shadcn/ui components provide base styling
- Tailwind CSS for custom styling and spacing

### Component Lifecycle
1. Mount: Check for error in store
2. Error appears: Parse error, start 10-second timer
3. Error changes: Clear previous timer, start new timer
4. User dismisses: Call `clearError()`, timer cleanup
5. Auto-dismiss: Timer fires, calls `clearError()`
6. Unmount: Cleanup timer if still running