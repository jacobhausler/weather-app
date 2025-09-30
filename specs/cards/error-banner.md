# Error Banner Component Specification

## Purpose and Overview

Global error notification banner that displays API failures, network errors, and other critical issues. Appears at the top of the page (below header or as overlay) with details about the error and options for retry or dismissal. Provides user-friendly error messages and preserves technical details for debugging.

## Props/API Interface

```typescript
interface ErrorBannerProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss: () => void;
  position?: 'top' | 'fixed-top' | 'inline';
  dismissible?: boolean;
  autoHideDuration?: number; // milliseconds, 0 = no auto-hide
  className?: string;
}

interface AppError {
  id: string;                  // Unique error ID
  type: ErrorType;
  message: string;             // User-friendly message
  details?: string;            // Technical details
  timestamp: Date;
  retryable: boolean;
  statusCode?: number;         // HTTP status code if applicable
  endpoint?: string;           // Failed API endpoint
  context?: Record<string, unknown>; // Additional context
}

type ErrorType =
  | 'network'                  // Network connectivity issue
  | 'api_error'                // API returned error
  | 'validation'               // Input validation error
  | 'not_found'                // Resource not found (404)
  | 'rate_limit'               // Rate limiting (429)
  | 'timeout'                  // Request timeout
  | 'unknown';                 // Unknown/unexpected error
```

## Layout and Visual Design

### Banner Structure
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Error: Unable to fetch weather data                     │
│                                                              │
│     The weather service is currently unavailable. Please    │
│     try again in a few moments.                             │
│                                                              │
│     [Retry]  [Details ▼]                       [Dismiss ✕] │
└─────────────────────────────────────────────────────────────┘
```

### With Expanded Details
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Error: Unable to fetch weather data                     │
│                                                              │
│     The weather service is currently unavailable. Please    │
│     try again in a few moments.                             │
│                                                              │
│     [Retry]  [Details ▲]                       [Dismiss ✕] │
│                                                              │
│     ┌────────────────────────────────────────────────────┐ │
│     │ Technical Details:                                 │ │
│     │ • Endpoint: /gridpoints/OKX/35,37/forecast        │ │
│     │ • Status Code: 503 Service Unavailable            │ │
│     │ • Timestamp: 2024-09-30 12:45:32                  │ │
│     │ • Error ID: err_abc123xyz                         │ │
│     └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Error Type Styling

**Network Error**:
- Icon: ⚠️ or 📡
- Color: Orange/amber
- Background: Light orange tint
- Emphasis: Connection-related messaging

**API Error**:
- Icon: ⚠️
- Color: Red
- Background: Light red tint
- Emphasis: Service issue

**Rate Limit**:
- Icon: ⏱️
- Color: Yellow
- Background: Light yellow tint
- Message: "Too many requests. Please wait."

**Timeout**:
- Icon: ⏱️
- Color: Orange
- Background: Light orange tint
- Message: Request took too long

**Not Found** (404):
- Icon: 🔍 or ❓
- Color: Blue/gray
- Background: Light blue/gray tint
- Message: Resource/location not found

**Validation**:
- Icon: ℹ️
- Color: Blue
- Background: Light blue tint
- Message: Input issue

### Positioning Options

**Top** (default):
- Below header
- Pushes content down
- Part of page flow

**Fixed Top**:
- Fixed position at top of viewport
- Overlays content
- Z-index above content

**Inline**:
- Within specific component
- For localized errors
- Doesn't affect global layout

## Data Requirements

### Error Messages by Type

**Network Error**:
- User message: "Unable to connect to weather service. Please check your internet connection."
- Retryable: Yes

**API Error (Generic)**:
- User message: "Unable to fetch weather data. Please try again."
- Retryable: Yes

**API Error (503)**:
- User message: "The weather service is currently unavailable. Please try again in a few moments."
- Retryable: Yes, with backoff

**Rate Limit (429)**:
- User message: "Too many requests. Please wait 30 seconds before trying again."
- Retryable: Yes, after delay

**Timeout**:
- User message: "Request timed out. Please try again."
- Retryable: Yes

**Not Found (404)**:
- User message: "Unable to find weather data for this location. Please check the ZIP code."
- Retryable: No (user needs to change input)

**Invalid ZIP**:
- User message: "Invalid ZIP code. Please enter a valid 5-digit US ZIP code."
- Retryable: No

### Error Context
Store additional context for debugging:
- Request parameters
- User actions leading to error
- Timestamp
- Browser/device info (optional)

## User Interactions

### Retry Button
- **Click**: Attempt same operation again
- **State**: Show loading during retry
- **Success**: Dismiss banner on successful retry
- **Failure**: Update banner with new error (if different) or increment retry count

### Dismiss Button
- **Click**: Close and hide banner
- **Keyboard**: Escape key (if banner focused)
- **Auto-dismiss**: Optional timeout for non-critical errors

### Details Toggle
- **Click**: Expand/collapse technical details
- **Icon**: Arrow indicator (▼/▲)
- **State**: Expanded details show technical information
- **Audience**: For developers or advanced users

### Copy Error Details
- **Button**: "Copy to Clipboard" in details section
- **Action**: Copy formatted error details for support tickets
- **Feedback**: Brief "Copied!" message

## Responsive Behavior

### Desktop (≥1024px)
- Full-width banner
- Horizontal layout for buttons
- Expanded details show in collapsed section
- Comfortable padding

### Tablet (768px - 1023px)
- Full-width banner
- Buttons may wrap if many options
- Maintain readability

### Mobile (<768px)
- Full-width banner
- Stack buttons vertically if needed
- Reduce padding for compact display
- Ensure touch-friendly button sizes
- Details section scrollable if long

## Accessibility Considerations

### Semantic HTML
```html
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  className="error-banner"
>
  <div className="error-content">
    <span className="error-icon" aria-hidden="true">⚠️</span>
    <div>
      <h3 id="error-title">Error: Unable to fetch weather data</h3>
      <p id="error-message">
        The weather service is currently unavailable. Please try again.
      </p>
    </div>
  </div>

  <div className="error-actions">
    <button onClick={onRetry} aria-label="Retry fetching weather data">
      Retry
    </button>
    <button
      onClick={toggleDetails}
      aria-expanded={showDetails}
      aria-controls="error-details"
    >
      Details
    </button>
    <button onClick={onDismiss} aria-label="Dismiss error message">
      <X /> Dismiss
    </button>
  </div>

  {showDetails && (
    <div id="error-details" className="error-details">
      <!-- Technical details -->
    </div>
  )}
</div>
```

### ARIA Attributes
- `role="alert"` for critical errors
- `aria-live="polite"` for non-critical errors
- `aria-live="assertive"` for critical errors
- `aria-atomic="true"` to read entire message
- `aria-label` on action buttons
- `aria-expanded` on details toggle

### Keyboard Navigation
- **Tab**: Navigate through buttons
- **Enter/Space**: Activate buttons
- **Escape**: Dismiss banner (if dismissible)
- Focus trap within banner (optional for critical errors)

### Screen Reader Support
- Announce error immediately when appears
- Read full error message
- Announce retry button availability
- Announce when error is dismissed or resolved

### Visual Considerations
- High contrast for error text
- Icons supplement text (not sole indicator)
- Color-blind friendly color scheme
- Focus indicators on all interactive elements

## Loading States

### Normal Display
- Error content visible
- Buttons enabled
- No loading indicators

### During Retry
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Error: Unable to fetch weather data                     │
│                                                              │
│     Retrying...  [⏳]                                       │
└─────────────────────────────────────────────────────────────┘
```
- Retry button shows spinner
- Other buttons disabled
- Message may update: "Retrying..."

### After Successful Retry
- Banner fades out and disappears
- Smooth exit animation
- Success message (optional, brief)

### After Failed Retry
- Update error message (if different)
- Or show "Retry failed" with attempt count
- Re-enable retry button

## Example Usage

```tsx
import { ErrorBanner } from '@/components/ErrorBanner';
import { useErrorStore } from '@/store/errors';

function App() {
  const { error, clearError, retryLastAction } = useErrorStore();

  return (
    <div className="app">
      <Header />

      {error && (
        <ErrorBanner
          error={error}
          onRetry={error.retryable ? retryLastAction : undefined}
          onDismiss={clearError}
          dismissible={true}
        />
      )}

      <main>{/* Content */}</main>
    </div>
  );
}
```

### With Error Store
```tsx
import { create } from 'zustand';

interface ErrorStore {
  error: AppError | null;
  lastAction: (() => Promise<void>) | null;
  setError: (error: AppError) => void;
  clearError: () => void;
  retryLastAction: () => Promise<void>;
}

export const useErrorStore = create<ErrorStore>((set, get) => ({
  error: null,
  lastAction: null,

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  retryLastAction: async () => {
    const { lastAction, clearError, setError } = get();
    if (!lastAction) return;

    try {
      await lastAction();
      clearError();
    } catch (error) {
      setError(parseError(error));
    }
  },
}));
```

### Error Creation Helper
```typescript
function createError(
  type: ErrorType,
  message: string,
  options?: Partial<AppError>
): AppError {
  return {
    id: generateErrorId(),
    type,
    message,
    timestamp: new Date(),
    retryable: type !== 'validation' && type !== 'not_found',
    ...options,
  };
}

// Usage
try {
  await fetchWeatherData(zipCode);
} catch (error) {
  const appError = createError(
    'api_error',
    'Unable to fetch weather data',
    {
      statusCode: error.response?.status,
      endpoint: error.config?.url,
      details: error.message,
    }
  );
  setError(appError);
}
```

## Edge Cases

1. **Multiple Simultaneous Errors**:
   - Show only most recent/critical error
   - Or queue errors and show one at a time
   - Log all errors for debugging

2. **Rapid Error-Success-Error**:
   - Debounce error display
   - Avoid rapid appearance/disappearance
   - Smooth transitions

3. **Error During Retry**:
   - Update banner with new error
   - Increment retry attempt counter
   - Implement exponential backoff

4. **Long Error Messages**:
   - Truncate with "Read more" (optional)
   - Ensure details section scrollable
   - Maintain banner height limits

5. **Banner Overflow**:
   - Set max-height with scroll
   - Ensure dismiss button always visible
   - Don't cover critical UI elements

6. **Error While Banner Displayed**:
   - Replace existing error
   - Or stack errors (queue)
   - Transition smoothly

7. **Permanent Errors**:
   - Some errors require action (not just retry)
   - Make non-dismissible for critical issues
   - Provide clear guidance

## Auto-Hide Behavior

### Non-Critical Errors
- Auto-hide after 10 seconds (configurable)
- User can dismiss earlier
- Countdown indicator (optional)

### Critical Errors
- No auto-hide
- Require explicit dismissal
- Or require successful retry

### Rate Limiting
- Show countdown: "Try again in 30 seconds"
- Auto-enable retry after countdown
- Update message in real-time

## Performance Considerations

- Render only when error present (conditional)
- Use React Portal for fixed positioning
- Memoize error banner component
- Optimize animations (CSS transforms)
- Lazy load details section
- Debounce rapid error changes

## Testing Requirements

- Render with different error types
- Test retry functionality
- Test dismiss functionality
- Test details toggle
- Test auto-hide behavior
- Test keyboard navigation (Tab, Escape)
- Test with screen reader
- Verify ARIA attributes
- Test focus management
- Test during retry (loading state)
- Test after successful retry (disappears)
- Test after failed retry (updates)
- Test responsive layouts
- Verify color contrast
- Test with very long error messages
- Test multiple rapid errors
- Test error during retry
- Test non-dismissible errors
- Test rate limit countdown
- Test copy error details functionality
- Verify z-index and positioning
- Test animation smoothness