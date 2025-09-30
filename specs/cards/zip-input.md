# ZIP Code Input Component Specification

## Purpose and Overview

Input field for users to enter a 5-digit US ZIP code to retrieve weather data for their location. Includes validation, submission, and maintains a history of previously entered ZIP codes in localStorage for quick access. Located in the top-right of the header.

## Props/API Interface

```typescript
interface ZipInputProps {
  onSubmit: (zipCode: string) => void;
  initialValue?: string;
  isLoading?: boolean;
  className?: string;
}

interface ZipHistory {
  zipCodes: string[];      // Array of previously submitted ZIP codes
  maxHistory?: number;     // Maximum number to store (default: 10)
}
```

## Layout and Visual Design

### Desktop Layout
```
┌─────────────────────────────┐
│  [75454]  [Go] │
│  Enter ZIP    Submit        │
└─────────────────────────────┘
```

### With Dropdown History
```
┌─────────────────────────────┐
│  [75454 ▼]  [Go]            │
│  ├──────────────┐            │
│  │ 75454        │            │
│  │ 75070        │            │
│  │ 75035        │            │
│  └──────────────┘            │
└─────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────┐
│  [ZIP] [Go]      │
└──────────────────┘
```

### Component Elements
1. **Input Field**:
   - 5-character maximum
   - Numeric input only
   - Placeholder: "Enter ZIP" or current ZIP
   - Auto-focus on page load (optional)

2. **Submit Button**:
   - Text: "Go" or search icon
   - Disabled when input invalid
   - Loading spinner when fetching data

3. **History Dropdown** (optional):
   - Triggered by down arrow or clicking input
   - Shows recent ZIP codes
   - Click to populate input

### Styling Guidelines
- **Input**:
  - Width: 100-120px desktop, 80-100px mobile
  - Height: 36-40px (comfortable touch target)
  - Border: Themed border color
  - Focus: Prominent focus ring
  - Font: Monospace or tabular numbers for alignment
  - Padding: Adequate for readability

- **Submit Button**:
  - Height: Matches input height
  - Width: 50-60px or auto with padding
  - Primary action color
  - Hover/focus states
  - Disabled state: Muted appearance

- **Dropdown**:
  - Positioned below input
  - Max-height with scroll if many items
  - Shadow for depth
  - Hover state on items
  - Z-index to appear above other content

## Data Requirements

### Input Validation
- **Length**: Exactly 5 digits
- **Characters**: Numeric only (0-9)
- **Format**: US ZIP code format
- **Real-time validation**: Show error state if invalid

### ZIP Code History
- **Storage**: localStorage
- **Key**: `weather-zip-history`
- **Format**:
  ```json
  {
    "zipCodes": ["75454", "75070", "75035"],
    "lastUpdated": "2024-09-30T12:00:00Z"
  }
  ```
- **Max items**: 10 most recent (configurable)
- **Uniqueness**: No duplicates; move existing to top if re-submitted

### Geocoding
- After validation, pass ZIP to parent component
- Parent handles geocoding via NWS or other API
- Error handling for invalid ZIP codes (not in system)

## User Interactions

### Typing
- Accept only numeric input (0-9)
- Limit to 5 characters max
- Auto-format: Remove non-numeric characters
- Show validation feedback:
  - Valid: Green border or checkmark
  - Invalid: Red border or X icon
  - Neutral: Default state while typing

### Submission
**Trigger submission via**:
1. Click "Go" button
2. Press Enter key in input field
3. Select from dropdown history

**On Submit**:
- Validate input (5 digits)
- If valid:
  - Add to history (if not already present)
  - Call `onSubmit` callback with ZIP code
  - Optionally blur input
- If invalid:
  - Show error message
  - Keep focus on input
  - Shake animation or error feedback

### History Dropdown
- **Open**: Click input or down arrow, or start typing
- **Navigate**: Arrow keys to move through list
- **Select**: Click or press Enter on item
- **Close**: Click outside, press Escape, or select item
- **Empty state**: Show message "No recent ZIP codes"

### Auto-complete (Optional Enhancement)
- As user types, filter history dropdown
- Show matching ZIP codes only
- Helps with recall of previously used codes

## Responsive Behavior

### Desktop (≥1024px)
- Full-width input (100-120px)
- Button with "Go" text
- Dropdown full width below input

### Tablet (768px - 1023px)
- Slightly narrower input
- Maintain readability
- Button text or icon

### Mobile (<768px)
- Compact input (80-100px)
- Button with icon only (magnifying glass or arrow)
- Dropdown may take more width
- Touch-friendly targets (min 44x44px)
- Numeric keyboard on mobile devices

## Accessibility Considerations

### Semantic HTML
```html
<form role="search" aria-label="ZIP code search">
  <label for="zip-input" class="sr-only">Enter ZIP Code</label>
  <input
    id="zip-input"
    type="text"
    inputmode="numeric"
    pattern="[0-9]{5}"
    maxlength="5"
    placeholder="Enter ZIP"
    aria-label="ZIP code"
    aria-describedby="zip-error"
    aria-invalid="false"
    required
  />
  <button type="submit" aria-label="Search weather for ZIP code">
    Go
  </button>
  <div id="zip-error" role="alert" aria-live="polite">
    <!-- Error message -->
  </div>
</form>
```

### ARIA Attributes
- `role="search"` on form
- `aria-label` on input for screen readers
- `aria-invalid` to indicate validation state
- `aria-describedby` linking to error message
- `aria-live="polite"` on error container for dynamic announcements
- `aria-expanded` on dropdown trigger
- `aria-controls` linking input to dropdown

### Keyboard Navigation
- **Tab**: Move focus to input, then to button
- **Enter**: Submit form (from input or button)
- **Arrow Down**: Open dropdown (if closed) or move to next item
- **Arrow Up**: Move to previous dropdown item
- **Escape**: Close dropdown
- **Alphanumeric keys**: Type in input (only numbers accepted)

### Screen Reader Support
- Label announces "ZIP code input, 5 digits required"
- Invalid state announced: "Invalid ZIP code. Please enter 5 digits."
- Loading state announced: "Searching weather data for ZIP code 75454"
- Dropdown items announced clearly
- Submit button clearly labeled

### Validation Feedback
- Visual: Border color change, icon indicator
- Auditory: Screen reader announcement
- Don't rely solely on color
- Provide text error message

### Touch Considerations
- Input and button meet 44x44px minimum touch target
- Adequate spacing between input and button
- Mobile devices show numeric keyboard
- Easy to tap on small screens

## Loading States

### Normal State
- Input and button enabled
- Placeholder or current value visible

### Submitting State
```
┌─────────────────────────────┐
│  [75454]  [⏳]              │
└─────────────────────────────┘
```
- Button shows spinner/loading indicator
- Input may be disabled during load
- Button disabled to prevent multiple submissions

### Error State
```
┌─────────────────────────────┐
│  [75454]  [Go]              │
│  ⚠️ Invalid ZIP code        │
└─────────────────────────────┘
```
- Red border on input
- Error message below
- Input remains enabled for correction

### Success State
- Brief success indicator (optional)
- Input keeps value
- Ready for new submission

## Example Usage

```tsx
import { ZipInput } from '@/components/ZipInput';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useState } from 'react';

function Header() {
  const [zipCode, setZipCode] = useState('75454');
  const { fetchWeather, isLoading } = useWeatherData();

  const handleZipSubmit = async (zip: string) => {
    setZipCode(zip);
    await fetchWeather(zip);
  };

  return (
    <header>
      <h1>HAUS Weather Station</h1>
      <ZipInput
        onSubmit={handleZipSubmit}
        initialValue={zipCode}
        isLoading={isLoading}
      />
    </header>
  );
}
```

### With History Management
```tsx
import { ZipInput } from '@/components/ZipInput';
import { useZipHistory } from '@/hooks/useZipHistory';

function Header() {
  const { addZip, getHistory } = useZipHistory();

  const handleZipSubmit = async (zip: string) => {
    addZip(zip); // Add to history
    // Fetch weather data...
  };

  return (
    <ZipInput
      onSubmit={handleZipSubmit}
      history={getHistory()}
    />
  );
}
```

## Edge Cases

1. **Invalid ZIP Format**:
   - Less than 5 digits: Show error
   - Non-numeric characters: Strip or reject
   - Leading zeros: Preserve (e.g., "01234" is valid)

2. **ZIP Not Found**:
   - API returns no data for valid ZIP
   - Show error: "ZIP code not found"
   - Keep input for user to correct

3. **Duplicate Submission**:
   - User submits same ZIP twice
   - Don't add to history again
   - Re-fetch data (may have updated)

4. **Empty Input**:
   - Disable submit button
   - Show placeholder
   - Don't submit

5. **Pasting Text**:
   - Allow paste
   - Strip non-numeric characters
   - Validate after paste

6. **Very Long History**:
   - Limit to 10 items
   - Remove oldest when adding new
   - Dropdown scrollable

7. **localStorage Full/Unavailable**:
   - Gracefully degrade
   - Component functions without history
   - Show warning (optional)

8. **Initial Load**:
   - Load last-used ZIP from localStorage
   - Auto-submit on page load (optional)
   - Populate input with default

## Performance Considerations

- Debounce validation while typing (avoid excessive validation)
- Memoize history list rendering
- Use React.memo for component
- Optimize dropdown rendering (virtualize if many items)
- Avoid re-rendering on every keystroke

## Testing Requirements

- Render with and without initial value
- Test input validation (valid/invalid ZIP codes)
- Test submission via button click
- Test submission via Enter key
- Test with non-numeric input
- Test with less than 5 digits
- Test with exactly 5 digits
- Test with paste action
- Test history dropdown (open, navigate, select)
- Test keyboard navigation
- Test with screen reader
- Verify ARIA attributes
- Test loading state during submission
- Test error state display
- Test localStorage integration (save/load history)
- Test responsive layouts
- Verify touch targets on mobile
- Test numeric keyboard on mobile devices
- Test form validation and HTML5 input patterns
- Test with localStorage disabled/full