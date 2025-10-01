# Unit Toggle Component Specification

## Purpose and Overview

Allows users to switch between Imperial (Fahrenheit, mph, miles) and Metric (Celsius, km/h, km) unit systems for weather data display. Located at the bottom of the application layout alongside the theme toggle. Persists user preference to localStorage and updates all weather data displays throughout the app.

## Implementation

The component uses a simple switch toggle design with "Imperial" and "Metric" labels on either side. No props are accepted - the component is self-contained and manages its state through the Zustand store.

### Component Structure

```typescript
// Component has no props - fully self-contained
export function UnitToggle()
```

### Store Integration

Uses Zustand store with persistence:

```typescript
// From src/stores/unitStore.ts
export type UnitSystem = 'imperial' | 'metric'

interface UnitState {
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      unitSystem: 'imperial',
      setUnitSystem: (system) => set({ unitSystem: system })
    }),
    {
      name: 'unit-storage'  // localStorage key
    }
  )
)
```

## Layout and Visual Design

### Actual Implementation

The component uses a **Switch Toggle** design with text labels:

```
┌──────────────────────────────────────┐
│  Imperial  ○─────  Metric            │
│  (active)           (inactive)       │
└──────────────────────────────────────┘

or when toggled:

┌──────────────────────────────────────┐
│  Imperial  ─────●  Metric            │
│  (inactive)        (active)          │
└──────────────────────────────────────┘
```

### Visual Structure

- **Left Label**: "Imperial" - highlighted when active, muted when inactive
- **Center**: shadcn/ui Switch component (toggle)
- **Right Label**: "Metric" - highlighted when active, muted when inactive
- **Layout**: Horizontal flex container with 3-unit gap
- **Font**: Small (text-sm) medium weight
- **Color States**:
  - Active: `text-foreground`
  - Inactive: `text-muted-foreground`

### Positioning
- **Location**: Bottom of page
- **Alignment**: Typically bottom-left or bottom-center
- **Near**: Theme toggle (coordinated bottom controls)
- **Spacing**: Controlled by parent layout

## Data Requirements

### Conversion Helper Functions

The store exports standalone conversion utilities (located in `src/stores/unitStore.ts`):

**Temperature Conversion**:
```typescript
// Converts Celsius to target system
export const convertTemp = (celsius: number, toSystem: UnitSystem): number => {
  if (toSystem === 'imperial') {
    return (celsius * 9) / 5 + 32  // To Fahrenheit
  }
  return celsius  // Already in Celsius
}
```

**Speed Conversion**:
```typescript
// Converts meters per second to target system
export const convertSpeed = (
  metersPerSecond: number,
  toSystem: UnitSystem
): number => {
  if (toSystem === 'imperial') {
    return metersPerSecond * 2.237  // To mph
  }
  return metersPerSecond * 3.6  // To km/h
}
```

**Distance Conversion**:
```typescript
// Converts meters to target system
export const convertDistance = (meters: number, toSystem: UnitSystem): number => {
  if (toSystem === 'imperial') {
    return meters * 0.000621371  // To miles
  }
  return meters / 1000  // To kilometers
}
```

**Unit Label Helpers**:
```typescript
export const getTempUnit = (system: UnitSystem): string => {
  return system === 'imperial' ? '°F' : '°C'
}

export const getSpeedUnit = (system: UnitSystem): string => {
  return system === 'imperial' ? 'mph' : 'km/h'
}

export const getDistanceUnit = (system: UnitSystem): string => {
  return system === 'imperial' ? 'mi' : 'km'
}
```

### localStorage Schema
```json
{
  "state": {
    "unitSystem": "imperial"  // "imperial" | "metric"
  },
  "version": 0
}
```
- **Key**: `unit-storage`
- **Format**: Zustand persist middleware format
- **Default**: "imperial" (US-based app)

### NWS API Considerations
- NWS API returns data in **SI/metric units** (Celsius, meters/second, meters)
- All conversions happen **client-side** using the helper functions above
- Components consume raw API data and convert on-demand based on current unit preference
- No server-side conversion or caching of both unit systems

## User Interactions

### Toggle Action
- **Click/Tap Switch**: Switch between Imperial and Metric
- **Click Labels**: Labels are also clickable (associated with switch via htmlFor)
- **Immediate**: All units update throughout app via Zustand store subscription
- **Animation**: Smooth slide animation provided by shadcn/ui Switch component
- **Feedback**:
  - Label color changes (active vs. muted)
  - Visual change in numbers across all cards
  - Switch knob slides to new position

### Affected Components
All weather displays update automatically via Zustand store subscription:
- Current Conditions card
- 7-Day Forecast card
- Hourly Forecast card
- Any other component that uses `useUnitStore()` or conversion helpers

## Responsive Behavior

The component uses the same layout across all screen sizes:
- "Imperial" and "Metric" text labels always visible
- Switch component maintains consistent size
- Touch targets meet accessibility requirements (44x44px minimum)
- Text remains readable at all sizes with `text-sm` class
- Gap between elements (3 units) provides adequate spacing
- No breakpoint-specific behavior needed due to simple, compact design

## Accessibility Considerations

### Semantic HTML

The implementation uses shadcn/ui components which provide proper accessibility:

```tsx
<div className="flex items-center gap-3">
  <Label
    htmlFor="unit-toggle"
    className={`text-sm font-medium ${!isMetric ? 'text-foreground' : 'text-muted-foreground'}`}
  >
    Imperial
  </Label>
  <Switch
    id="unit-toggle"
    checked={isMetric}
    onCheckedChange={handleToggle}
    aria-label="Toggle between Imperial and Metric units"
  />
  <Label
    htmlFor="unit-toggle"
    className={`text-sm font-medium ${isMetric ? 'text-foreground' : 'text-muted-foreground'}`}
  >
    Metric
  </Label>
</div>
```

### ARIA Attributes
- **Switch role**: Provided by shadcn/ui Switch component
- **aria-checked**: Automatically managed by Switch component based on `checked` prop
- **aria-label**: "Toggle between Imperial and Metric units" provides clear description
- **Labels**: Both labels associated with switch via `htmlFor="unit-toggle"`

### Keyboard Navigation
- **Tab**: Focus on switch control
- **Space/Enter**: Toggle between Imperial and Metric
- **Focus indicator**: Provided by shadcn/ui Switch component with visible focus ring

### Screen Reader Support
- Switch announces: "Toggle between Imperial and Metric units"
- State announced automatically: "checked" or "not checked"
- Label association allows clicking either label to toggle
- Visual label changes (foreground vs. muted) reinforce current state

### Visual Considerations
- Clear visual distinction via color contrast (foreground vs. muted-foreground)
- High contrast maintained in both light and dark themes via theme variables
- Focus indicators meet WCAG standards (provided by shadcn/ui)
- Text labels clearly identify both options ("Imperial" and "Metric")

## Loading States

### Initial Load
- Zustand persist middleware loads saved preference from localStorage immediately
- Default to "imperial" if no preference stored
- Components subscribe to store and render with correct units on mount

### Unit Switching
- **Instant conversion**: No loading state needed (all conversions are client-side)
- **Smooth transition**: Switch animation provided by shadcn/ui component
- **All components**: Update simultaneously via Zustand store subscription
- No need to disable toggle or show loading indicators

## Example Usage

### Rendering the Toggle Component

```tsx
import { UnitToggle } from '@/components/UnitToggle'

function Footer() {
  return (
    <footer>
      <UnitToggle />  {/* No props needed */}
      <ThemeToggle />
    </footer>
  )
}
```

### Using Unit System in Components

```tsx
import { useUnitStore, convertTemp, getTempUnit } from '@/stores/unitStore'

function CurrentConditions({ tempCelsius }: { tempCelsius: number }) {
  const { unitSystem } = useUnitStore()

  // Convert temperature from Celsius to current unit system
  const displayTemp = convertTemp(tempCelsius, unitSystem)
  const unit = getTempUnit(unitSystem)

  return <div>{Math.round(displayTemp)}{unit}</div>
}
```

### Full Example with Multiple Conversions

```tsx
import {
  useUnitStore,
  convertTemp,
  convertSpeed,
  convertDistance,
  getTempUnit,
  getSpeedUnit,
  getDistanceUnit
} from '@/stores/unitStore'

interface WeatherData {
  temperature: number  // Celsius
  windSpeed: number    // meters per second
  visibility: number   // meters
}

function WeatherDisplay({ data }: { data: WeatherData }) {
  const { unitSystem } = useUnitStore()

  const temp = Math.round(convertTemp(data.temperature, unitSystem))
  const wind = Math.round(convertSpeed(data.windSpeed, unitSystem))
  const vis = convertDistance(data.visibility, unitSystem).toFixed(1)

  return (
    <div>
      <div>Temperature: {temp}{getTempUnit(unitSystem)}</div>
      <div>Wind: {wind} {getSpeedUnit(unitSystem)}</div>
      <div>Visibility: {vis} {getDistanceUnit(unitSystem)}</div>
    </div>
  )
}
```

## Edge Cases

1. **localStorage Unavailable**:
   - Zustand persist middleware handles gracefully
   - Falls back to in-memory state
   - Defaults to "imperial"

2. **Invalid Stored Value**:
   - TypeScript enforces `UnitSystem` type ('imperial' | 'metric')
   - Zustand validates on load
   - Falls back to "imperial" if corrupted

3. **Multiple Tabs**:
   - Zustand persist middleware syncs across tabs automatically
   - Uses storage events internally
   - All tabs update when preference changes in any tab

4. **Data Precision**:
   - Components control rounding based on their needs
   - Helper functions return raw numbers
   - Consumers apply `Math.round()`, `.toFixed()`, etc. as needed

5. **API Response Units**:
   - NWS returns SI/metric units (Celsius, m/s, meters)
   - Conversion helpers expect metric input
   - All conversions happen at display time (on-demand)

## Best Practices for Using Conversions

### Temperature
```tsx
const displayTemp = Math.round(convertTemp(celsiusValue, unitSystem))
const unit = getTempUnit(unitSystem)
// Result: "82°F" or "28°C"
```

### Wind Speed
```tsx
const displaySpeed = Math.round(convertSpeed(metersPerSecond, unitSystem))
const unit = getSpeedUnit(unitSystem)
// Result: "15 mph" or "24 km/h"
```

### Distance/Visibility
```tsx
const distance = convertDistance(meters, unitSystem)
const displayDist = distance < 10 ? distance.toFixed(1) : Math.round(distance)
const unit = getDistanceUnit(unitSystem)
// Result: "2.5 mi" or "10 km"
```

## Performance Considerations

- Conversion functions are simple, pure calculations (no memoization needed)
- Toggle component is already lightweight (no need for React.memo)
- Zustand provides optimal re-rendering (only subscribed components update)
- All conversions happen on-demand at render time
- No caching of converted values (calculations are fast enough)

## Testing Requirements

### Component Tests
- Render with Imperial selected (default)
- Render with Metric selected
- Test switch toggle interaction changes state
- Test clicking "Imperial" label toggles to Imperial
- Test clicking "Metric" label toggles to Metric
- Verify localStorage persistence via Zustand
- Test keyboard navigation (Tab, Space, Enter)
- Verify ARIA attributes (`aria-label`, `aria-checked`)
- Test focus indicators are visible
- Test in both light and dark themes
- Verify label color changes (foreground vs. muted)

### Conversion Function Tests
- Test `convertTemp()` accuracy:
  - 0°C = 32°F
  - 100°C = 212°F
  - -40°C = -40°F
- Test `convertSpeed()` accuracy:
  - 10 m/s = 22.37 mph
  - 10 m/s = 36 km/h
- Test `convertDistance()` accuracy:
  - 1609 meters = 1 mile
  - 1000 meters = 1 km
- Test edge case values (very high/low, zero, negative)

### Integration Tests
- Verify components update when toggle changes
- Test multi-tab synchronization (Zustand persist)
- Verify no layout shift during unit changes
- Test that all weather displays reflect current unit preference