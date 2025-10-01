# ZIP Code Input Component Specification

## Purpose and Overview

Input field for users to enter a 5-digit US ZIP code to retrieve weather data for their location. Includes validation, submission, and maintains a history of previously entered ZIP codes in localStorage for quick access. Located in the top-right of the header.

This component uses Zustand store pattern and integrates directly with the weather store and API service, requiring no props from parent components.

## Component Interface

```typescript
// No props - component is self-contained and uses Zustand store
export function ZipInput(): JSX.Element

// Store integration (from useWeatherStore)
interface WeatherStoreZipMethods {
  setZipCode: (zipCode: string) => void
  setWeatherData: (data: WeatherData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addRecentZipCode: (zipCode: string) => void
  recentZipCodes: string[]
  isLoading: boolean
}
```

## Layout and Visual Design

### Three-Button Layout
```
┌─────────────────────────────────────────────┐
│  [Enter ZIP code 📍]  [Submit]  [▼]         │
│  Input with MapPin    Submit    Recent      │
└─────────────────────────────────────────────┘
```

### With Dropdown Open
```
┌─────────────────────────────────────────────┐
│  [Enter ZIP code 📍]  [Submit]  [▼]         │
│                              ┌──────────┐   │
│                              │ 75454    │   │
│                              │ 75070    │   │
│                              │ 75035    │   │
│                              └──────────┘   │
└─────────────────────────────────────────────┘
```

### With Validation Error
```
┌─────────────────────────────────────────────┐
│  [Enter ZIP code 📍]  [Submit]  [▼]         │
│  ⚠️ Please enter a valid 5-digit ZIP code   │
└─────────────────────────────────────────────┘
```

### Component Elements
1. **Input Field**:
   - 5-character maximum
   - Numeric input only (`inputMode="numeric"`)
   - Pattern validation: `\d{5}`
   - Placeholder: "Enter ZIP code"
   - MapPin icon positioned on right side (inside input)
   - Clears after successful submission

2. **Submit Button**:
   - Text: "Submit"
   - Disabled when input is empty or loading
   - Type: "submit" (triggers form submission)

3. **Recent ZIP Codes Dropdown**:
   - ChevronDown icon button
   - Only visible when recentZipCodes array has items
   - Dropdown menu aligned to right
   - Click item to immediately fetch weather
   - Uses shadcn/ui DropdownMenu component

### Styling Guidelines
- **Input**:
  - Uses shadcn/ui Input component
  - Right padding (`pr-10`) to accommodate MapPin icon
  - MapPin icon: absolute positioned at right, muted foreground color
  - Disabled during loading state
  - Type: "text" with `inputMode="numeric"` for mobile keyboards

- **Submit Button**:
  - Uses shadcn/ui Button component (default variant)
  - Disabled when loading or input is empty
  - Type: "submit"

- **Recent ZIP Codes Button**:
  - Uses shadcn/ui Button component (outline variant, icon size)
  - ChevronDown icon (lucide-react)
  - Only rendered when `recentZipCodes.length > 0`
  - Disabled during loading state

- **Dropdown**:
  - Uses shadcn/ui DropdownMenu components
  - Aligned to end (right side)
  - Each item is a DropdownMenuItem with onClick handler
  - Maps through recentZipCodes array

## Data Requirements

### Input Validation
- **Length**: Exactly 5 digits
- **Characters**: Numeric only (0-9)
- **Format**: US ZIP code format validation via regex: `/^\d{5}$/`
- **Validation timing**: On submit (not real-time)
- **Error display**: Validation error shown below input after invalid submission
- **Error message**: "Please enter a valid 5-digit ZIP code"
- **Error clearing**: Clears when input becomes empty or valid

### ZIP Code History
- **Storage**: Managed by Zustand store (persisted via store middleware)
- **Access**: `recentZipCodes` from `useWeatherStore()`
- **Management**: `addRecentZipCode(zipCode)` method
- **Display**: Only show dropdown button when array has items
- **Behavior**: Each recent ZIP click triggers immediate weather fetch

### API Integration
- **Service**: Uses `apiService.getWeatherByZip(zipCode)` from `@/services/api`
- **Store updates**: Component directly updates weather store with fetched data
- **Error handling**: Catches errors and sets error message in store
- **Success behavior**:
  - Adds ZIP to recent list
  - Clears input field
  - Updates weather data in store

## User Interactions

### Typing
- Keyboard input filtering via `handleKeyDown`:
  - Only allows numeric keys (0-9)
  - Allows navigation keys: Backspace, Delete, ArrowLeft, ArrowRight, Tab
  - Prevents all other characters
- Length limiting via `handleInputChange`:
  - Maximum 5 characters
  - No characters accepted beyond limit
- Input is disabled during loading state
- Error clears automatically when input becomes empty or valid

### Submission
**Trigger submission via**:
1. Click "Submit" button
2. Press Enter key in input field (form submission)
3. Select from recent ZIP codes dropdown (immediate fetch)

**On Submit Flow**:
1. `handleSubmit` called with form event
2. Trims input value
3. Calls `fetchWeather(zipCode)`
4. `fetchWeather` validates ZIP code format
5. If invalid: Sets validation error, returns early
6. If valid:
   - Clears validation error
   - Sets loading state (via store)
   - Sets ZIP code in store
   - Calls `apiService.getWeatherByZip(zipCode)`
   - On success: Updates weather data, adds to recent list, clears input
   - On error: Sets error message in store
   - Finally: Clears loading state

### Recent ZIP Codes Dropdown
- **Visibility**: Only rendered when `recentZipCodes.length > 0`
- **Open**: Click ChevronDown button
- **Items**: Maps through `recentZipCodes` array
- **Select**: Click item triggers `handleRecentZipClick(zipCode)`
- **Behavior**: Selecting an item immediately fetches weather (same as manual submission)
- **Close**: Automatic (shadcn/ui DropdownMenu behavior)
- **Alignment**: Dropdown aligns to right edge

## Responsive Behavior

### Layout Approach
- Uses flexbox with `gap-2` spacing
- Three-button horizontal layout: Input (flex-1), Submit button, Recent dropdown button
- All elements use shadcn/ui components which have built-in responsive behavior
- Input uses `inputMode="numeric"` to trigger numeric keyboard on mobile devices

### Component Sizing
- Input: Flex-1 (takes available space), with relative positioning for icon
- Submit button: Auto-sized based on "Submit" text
- Recent dropdown button: Icon size (square button)
- All buttons maintain consistent height with input

### Touch Targets
- shadcn/ui Button components have appropriate touch-friendly sizing
- Input field has adequate height for touch interaction
- Dropdown items have proper spacing for touch selection

## Accessibility Considerations

### Semantic HTML Structure
```html
<div className="flex flex-col gap-2">
  <form onSubmit={handleSubmit} className="flex gap-2">
    <div className="relative flex-1">
      <Input
        type="text"
        inputMode="numeric"
        pattern="\d{5}"
        placeholder="Enter ZIP code"
        aria-label="ZIP code input"
        aria-invalid={!!validationError}
        aria-describedby={validationError ? 'zip-error' : undefined}
        disabled={isLoading}
      />
      <MapPin className="..." />
    </div>

    <Button type="submit" disabled={isLoading || !inputValue.trim()}>
      Submit
    </Button>

    {recentZipCodes.length > 0 && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Recent ZIP codes">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {recentZipCodes.map(zip => (
            <DropdownMenuItem key={zip} onClick={() => handleRecentZipClick(zip)}>
              {zip}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </form>

  {validationError && (
    <p id="zip-error" role="alert" aria-live="polite">
      {validationError}
    </p>
  )}
</div>
```

### ARIA Attributes
- `aria-label="ZIP code input"` on input for screen readers
- `aria-invalid={!!validationError}` indicates validation state dynamically
- `aria-describedby="zip-error"` only set when error exists
- `role="alert"` and `aria-live="polite"` on error message for announcements
- `aria-label="Recent ZIP codes"` on dropdown trigger button
- Pattern attribute `\d{5}` for HTML5 validation

### Keyboard Navigation
- **Tab**: Moves focus through form elements (input → Submit button → Recent dropdown button if visible)
- **Enter**: Submits form when input or Submit button has focus
- **Number keys**: Type digits in input (non-numeric keys prevented)
- **Backspace/Delete/Arrows**: Standard text editing
- **Dropdown**: shadcn/ui DropdownMenu handles keyboard navigation automatically

### Screen Reader Support
- Input announces: "ZIP code input, edit text"
- Invalid state announces: "ZIP code input, invalid, Please enter a valid 5-digit ZIP code"
- Disabled state announces when loading
- Error message announced via `aria-live="polite"` when it appears
- Recent dropdown button announces: "Recent ZIP codes, button"

### Validation Feedback
- Visual: Error text displayed below form in destructive color
- Programmatic: `aria-invalid` attribute set on input
- Auditory: Error announced via `aria-live` region
- Text-based error message (not color-dependent)

### Component State Management
- Input disabled during loading state
- Submit button disabled when input empty or loading
- Recent dropdown button disabled during loading
- All disabled states properly communicated to assistive technologies

## Loading States

### Normal State
- Input enabled with placeholder "Enter ZIP code"
- Submit button enabled only when input has content
- Recent dropdown button visible only when history exists
- No error message displayed

### Loading State (isLoading = true)
- Input disabled (no user interaction)
- Submit button disabled with "Submit" text
- Recent dropdown button disabled
- Controlled by `isLoading` from weather store
- Loading managed in try/finally block (always clears)

### Validation Error State
```
┌─────────────────────────────────────────────┐
│  [Enter ZIP code 📍]  [Submit]  [▼]         │
│  ⚠️ Please enter a valid 5-digit ZIP code   │
└─────────────────────────────────────────────┘
```
- Error text in destructive color below form
- Input remains enabled for correction
- `aria-invalid="true"` set on input
- Error announced via `aria-live="polite"`

### Success State
- Input clears automatically after successful fetch
- Weather data updated in store
- ZIP added to recent list
- Component returns to normal state (empty input)

## Example Usage

### Basic Implementation (Current Pattern)
```tsx
import { ZipInput } from '@/components/ZipInput'

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>HAUS Weather Station</h1>
      <ZipInput />
    </header>
  )
}
```

### Component Implementation Details
```tsx
import { useState, FormEvent, KeyboardEvent } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { useWeatherStore } from '@/stores/weatherStore'
import { apiService } from '@/services/api'

export function ZipInput() {
  const [inputValue, setInputValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const {
    setZipCode,
    setWeatherData,
    setLoading,
    setError,
    addRecentZipCode,
    recentZipCodes,
    isLoading
  } = useWeatherStore()

  const validateZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}$/
    return zipRegex.test(zip)
  }

  const fetchWeather = async (zipCode: string) => {
    if (!validateZipCode(zipCode)) {
      setValidationError('Please enter a valid 5-digit ZIP code')
      return
    }

    setValidationError(null)
    setLoading(true)
    setZipCode(zipCode)

    try {
      const data = await apiService.getWeatherByZip(zipCode)
      setWeatherData(data)
      addRecentZipCode(zipCode)
      setInputValue('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch weather data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of implementation
}
```

## Edge Cases

1. **Invalid ZIP Format**:
   - Less than 5 digits: Validation error on submit
   - Non-numeric characters: Prevented by `handleKeyDown` (blocked before entry)
   - Leading zeros: Preserved (e.g., "01234" is valid)
   - Error message: "Please enter a valid 5-digit ZIP code"

2. **API Errors**:
   - Network failures: Caught and error message set in store
   - Invalid ZIP (not found): API service throws error, caught by component
   - Error displayed via global error handling in store
   - Input does not clear on error (allows user to correct)

3. **Duplicate Submission**:
   - User submits same ZIP twice: Re-fetches data (may have updated)
   - Recent ZIP list: Store handles deduplication logic
   - Input clears after each successful submission

4. **Empty Input**:
   - Submit button disabled when `!inputValue.trim()`
   - Placeholder visible: "Enter ZIP code"
   - Form submission prevented by button disabled state

5. **Pasting Text**:
   - Paste allowed (not prevented)
   - `handleInputChange` limits to 5 characters
   - Non-numeric characters in paste will pass through (only `handleKeyDown` blocks typing)
   - Validation happens on submit

6. **Recent ZIP Codes History**:
   - Managed by Zustand store (not component responsibility)
   - Dropdown button only renders when `recentZipCodes.length > 0`
   - Store determines max history size and deduplication

7. **Store Persistence**:
   - Recent ZIP codes persisted via Zustand middleware
   - Component doesn't handle persistence directly
   - Graceful degradation handled by store layer

8. **Initial Load**:
   - Component starts with empty input
   - No auto-submission on page load
   - Store may have persisted recent ZIPs from previous session

## Performance Considerations

- **No debouncing**: Validation only runs on submit (not while typing)
- **State updates**: Local state for input value and validation error
- **Store subscriptions**: Only subscribes to necessary store slices
- **Dropdown rendering**: Simple map - no virtualization needed (history is limited)
- **Re-renders**: Component re-renders on:
  - Input value change (local state)
  - Validation error change (local state)
  - isLoading change (store)
  - recentZipCodes change (store)
- **No memoization**: Component is simple enough without it

## Testing Requirements

### Component Rendering
- Renders with empty initial state
- Renders with placeholder text "Enter ZIP code"
- MapPin icon displays inside input (right side)
- Submit button renders with "Submit" text
- Recent dropdown button only renders when history exists

### Input Validation
- Accepts numeric input (0-9)
- Blocks non-numeric characters via keyboard
- Limits input to 5 characters maximum
- Shows validation error for less than 5 digits on submit
- Shows validation error for non-numeric values on submit
- Validates using regex `/^\d{5}$/`
- Preserves leading zeros

### Form Submission
- Submits via button click
- Submits via Enter key
- Prevents submission when input is empty
- Prevents submission during loading
- Trims whitespace from input before validation
- Clears input on successful submission
- Keeps input value on error

### API Integration
- Calls `apiService.getWeatherByZip(zipCode)` with validated ZIP
- Updates store with weather data on success
- Sets error in store on failure
- Manages loading state (sets true, clears in finally)
- Adds ZIP to recent list on success

### Recent ZIP Codes
- Dropdown button visible only when recentZipCodes has items
- Maps through recentZipCodes array
- Clicking recent ZIP triggers immediate fetch
- Dropdown aligns to right
- All buttons disabled during loading

### Error Handling
- Displays validation error below form
- Error has id="zip-error" for aria-describedby
- Error has role="alert" and aria-live="polite"
- Clears error when input becomes empty
- Clears error when input becomes valid
- aria-invalid set to true when error exists

### Accessibility
- Input has aria-label="ZIP code input"
- Input has pattern="\d{5}"
- Input has inputMode="numeric"
- Recent button has aria-label="Recent ZIP codes"
- Disabled states properly set during loading
- Error properly announced to screen readers

### State Management
- Uses local state for inputValue
- Uses local state for validationError
- Subscribes to store for: isLoading, recentZipCodes
- Calls store methods: setZipCode, setWeatherData, setLoading, setError, addRecentZipCode

## Implementation Summary

### Key Technologies
- **UI Components**: shadcn/ui (Input, Button, DropdownMenu)
- **Icons**: lucide-react (MapPin, ChevronDown)
- **State**: Zustand store + local component state
- **API**: Centralized API service layer

### Architecture Pattern
- **Self-contained component**: No props required
- **Direct store integration**: Uses Zustand hooks
- **Direct API integration**: Calls apiService directly
- **Mixed state approach**: Local state for UI, store for app state

### Key Implementation Choices
1. **Three-button layout**: Input, Submit button, Recent dropdown (when history exists)
2. **MapPin icon**: Visual indicator inside input field
3. **Validation on submit**: No real-time validation during typing
4. **Input clearing**: Automatically clears after successful submission
5. **Keyboard filtering**: Prevents non-numeric input at keydown level
6. **Store-managed history**: Recent ZIPs handled by Zustand store
7. **Conditional dropdown**: Only shows when history exists
8. **Error handling**: Local validation errors + store-level API errors