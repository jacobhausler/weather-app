# Unit Toggle Component Specification

## Purpose and Overview

Allows users to switch between Imperial (Fahrenheit, mph, inches) and Metric (Celsius, km/h, mm) unit systems for weather data display. Located at the bottom of the application layout alongside the theme toggle. Persists user preference to localStorage and updates all weather data displays throughout the app.

## Props/API Interface

```typescript
interface UnitToggleProps {
  className?: string;
  variant?: 'switch' | 'button' | 'segmented';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type UnitSystem = 'imperial' | 'metric';

interface UnitConfig {
  system: UnitSystem;
  temperature: '°F' | '°C';
  speed: 'mph' | 'km/h';
  distance: 'mi' | 'km';
  precipitation: 'in' | 'mm';
  pressure: 'inHg' | 'mb' | 'hPa';
}
```

## Layout and Visual Design

### Toggle Variants

**Segmented Button** (Recommended):
```
┌──────────────┐
│ [°F]│ °C   │
│  ██ │      │
└──────────────┘

or

┌──────────────┐
│ °F │[°C]  │
│    │ ██   │
└──────────────┘
```

**Switch Toggle**:
```
┌─────────────────┐
│ °F  ●─────  °C  │
│     (slide)     │
└─────────────────┘
```

**Button Toggle**:
```
┌─────────────────┐
│ [°F]   [°C]     │
│ Imperial Metric │
└─────────────────┘
```

### Icon/Label Options
- **Short**: °F | °C
- **Medium**: °F/mph | °C/km/h
- **Long**: Imperial | Metric
- **Icons**: Flag icons (US flag for Imperial, metric countries for Metric)

### Positioning
- **Location**: Bottom of page
- **Alignment**: Bottom-left or bottom-center
- **Near**: Theme toggle (coordinated bottom controls)
- **Spacing**: Adequate from edges and theme toggle

### Styling Guidelines

**Segmented Button** (Recommended):
- Two connected segments
- Active segment highlighted (filled background)
- Inactive segment outlined or muted
- Clear visual distinction
- Smooth transition animation
- Equal width segments

**Switch**:
- Similar to theme toggle
- Labeled with °F and °C
- Slide animation on toggle

**Button**:
- Two separate buttons
- Active button highlighted
- Inactive button muted

### Layout Examples

**Bottom Center** (with Theme Toggle):
```
┌─────────────────────────────────────┐
│                                     │
│      [Weather content]              │
│                                     │
│   [°F|°C]      ☀️ ●───── 🌙        │
│   Units          Theme              │
└─────────────────────────────────────┘
```

**Bottom Left and Right**:
```
┌─────────────────────────────────────┐
│                                     │
│      [Weather content]              │
│                                     │
│  [°F|°C]              ☀️ ●───── 🌙 │
└─────────────────────────────────────┘
```

## Data Requirements

### Unit Conversions

**Temperature**:
- F to C: `(F - 32) × 5/9`
- C to F: `(C × 9/5) + 32`

**Speed**:
- mph to km/h: `mph × 1.60934`
- km/h to mph: `km/h × 0.621371`

**Distance**:
- miles to km: `mi × 1.60934`
- km to miles: `km × 0.621371`

**Precipitation**:
- inches to mm: `in × 25.4`
- mm to inches: `mm × 0.0393701`

**Pressure**:
- inHg to mb/hPa: `inHg × 33.8639`
- mb/hPa to inHg: `mb × 0.02953`

### localStorage Schema
```json
{
  "unitSystem": "imperial",  // "imperial" | "metric"
  "lastUpdated": "2024-09-30T12:00:00Z"
}
```
- Key: `weather-unit-preference`
- Value: Unit system string
- Default: "imperial" (US-based app)

### NWS API Considerations
- NWS API returns data in **metric units** (SI)
- Convert on client-side or server-side
- Cache both unit systems or convert on demand
- Display format based on user preference

## User Interactions

### Toggle Action
- **Click/Tap**: Switch between Imperial and Metric
- **Immediate**: All units update throughout app
- **Animation**: Smooth transition of active segment
- **Feedback**: Visual change in numbers across all cards

### Segmented Button
- **Click segment**: Select unit system
- **Active state**: Filled background
- **Inactive state**: Outlined or muted
- **Transition**: Smooth slide or fade

### Affected Components
All weather displays update:
- Current Conditions card
- 7-Day Forecast card
- Hourly Forecast card
- Alert card (if showing temps)
- Forecast Day modal

## Responsive Behavior

### Desktop (≥1024px)
- Full-size toggle with labels
- °F/mph or Imperial label visible
- Comfortable spacing
- Hover effects

### Tablet (768px - 1023px)
- Similar to desktop
- May use shorter labels (°F/°C)
- Maintain touch-friendly size

### Mobile (<768px)
- Compact toggle (°F/°C only)
- Minimum 44x44px touch target
- May reduce padding
- Ensure easy thumb reach

## Accessibility Considerations

### Semantic HTML

**Segmented Button**:
```html
<div role="group" aria-labelledby="unit-toggle-label">
  <span id="unit-toggle-label" class="sr-only">Unit system selection</span>
  <div role="radiogroup" aria-label="Select unit system">
    <button
      role="radio"
      aria-checked="true"
      aria-label="Imperial units: Fahrenheit and miles per hour"
    >
      °F
    </button>
    <button
      role="radio"
      aria-checked="false"
      aria-label="Metric units: Celsius and kilometers per hour"
    >
      °C
    </button>
  </div>
</div>
```

**Switch**:
```html
<button
  role="switch"
  aria-checked="false"
  aria-label="Switch to metric units"
  onClick={toggleUnits}
>
  <span>°F</span>
  <span className="toggle-track">
    <span className="toggle-knob"></span>
  </span>
  <span>°C</span>
</button>
```

### ARIA Attributes
- **Radio group**: `role="radiogroup"`, individual `role="radio"`
- **Switch**: `role="switch"`, `aria-checked`
- **Labels**: Clear description of each option
- **State**: Announce current selection

### Keyboard Navigation
- **Tab**: Focus on toggle control
- **Arrow keys**: Switch between options (radio group)
- **Space/Enter**: Activate selection
- **Focus indicator**: Clearly visible

### Screen Reader Support
- Announce current unit: "Imperial units selected"
- Announce on change: "Switched to metric units"
- Provide context: "Unit system toggle, showing Fahrenheit and miles per hour"
- Explain conversion: "All temperatures will display in Celsius"

### Visual Considerations
- Clear visual distinction between active/inactive
- High contrast in both themes
- Focus indicators meet WCAG standards
- Text labels supplement visual design

## Loading States

### Initial Load
- Apply saved preference immediately
- Default to Imperial if no preference stored
- Update all displays with correct units

### Unit Switching
- **Instant conversion**: No loading state needed
- **Smooth transition**: Optional fade or slide animation
- **All components**: Update simultaneously

### Data Re-fetch (if needed)
If server-side conversion used:
```
┌──────────────┐
│ [°F]│ °C   │
│  ██ │ ⏳   │
└──────────────┘
```
- Brief loading indicator
- Toggle disabled during fetch
- Re-enable after data loaded

## Example Usage

```tsx
import { UnitToggle } from '@/components/UnitToggle';
import { useUnits } from '@/hooks/useUnits';

function Footer() {
  return (
    <footer>
      <UnitToggle variant="segmented" showLabel />
      <ThemeToggle variant="switch" showLabel />
    </footer>
  );
}
```

### With Unit Hook
```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UnitStore {
  system: UnitSystem;
  setSystem: (system: UnitSystem) => void;
  convert: {
    temperature: (value: number, to: 'F' | 'C') => number;
    speed: (value: number, to: 'mph' | 'kmh') => number;
    // ... other conversions
  };
}

export const useUnitStore = create<UnitStore>()(
  persist(
    (set) => ({
      system: 'imperial',
      setSystem: (system) => set({ system }),
      convert: {
        temperature: (value, to) => {
          // Conversion logic
        },
        // ...
      },
    }),
    { name: 'weather-unit-preference' }
  )
);
```

### Using in Components
```tsx
import { useUnitStore } from '@/store/units';

function CurrentConditions({ temp }: { temp: number }) {
  const { system, convert } = useUnitStore();

  const displayTemp = system === 'imperial'
    ? temp
    : convert.temperature(temp, 'C');

  const unit = system === 'imperial' ? '°F' : '°C';

  return <div>{displayTemp.toFixed(0)}{unit}</div>;
}
```

## Edge Cases

1. **localStorage Unavailable**:
   - Gracefully degrade
   - Use session state
   - Default to Imperial

2. **Invalid Stored Value**:
   - Validate on load
   - Fallback to Imperial if invalid
   - Reset to default

3. **Mid-Conversion Edge Cases**:
   - Very large/small numbers
   - Rounding inconsistencies
   - Precision handling

4. **Multiple Tabs**:
   - Sync preference across tabs
   - Listen for storage events
   - Update other tabs when changed

5. **Print Styles**:
   - Ensure printed content shows correct units
   - Include unit labels clearly

6. **Data Precision**:
   - Round appropriately (0-1 decimal places)
   - Avoid showing excessive decimals
   - Consistent rounding throughout app

7. **API Response Units**:
   - NWS returns metric (Celsius)
   - Handle conversion consistently
   - Cache converted values or convert on-demand

## Conversion Best Practices

### Rounding Rules
- **Temperature**: Round to nearest integer (82°F, 28°C)
- **Wind Speed**: Round to nearest integer (15 mph, 24 km/h)
- **Distance**: 1 decimal place for < 10, integer for ≥ 10
- **Precipitation**: 2 decimal places (0.25 in, 6.35 mm)
- **Pressure**: 2 decimal places

### Display Formatting
```typescript
function formatTemperature(value: number, system: UnitSystem): string {
  const unit = system === 'imperial' ? '°F' : '°C';
  return `${Math.round(value)}${unit}`;
}

function formatSpeed(value: number, system: UnitSystem): string {
  const unit = system === 'imperial' ? 'mph' : 'km/h';
  return `${Math.round(value)} ${unit}`;
}

function formatPrecipitation(value: number, system: UnitSystem): string {
  const unit = system === 'imperial' ? 'in' : 'mm';
  return `${value.toFixed(2)} ${unit}`;
}
```

## Performance Considerations

- Memoize conversion functions
- Cache converted values when possible
- Use React.memo for toggle component
- Optimize re-renders when units change
- Consider converting data layer vs. presentation layer
- Batch updates when toggling units

## Testing Requirements

- Render in Imperial mode
- Render in Metric mode
- Test toggle interaction
- Verify localStorage persistence
- Test with localStorage disabled
- Test keyboard navigation
- Test with screen reader
- Verify ARIA attributes
- Test focus indicators
- Test in all variants (segmented, switch, button)
- Test conversion accuracy:
  - Temperature (F ↔ C)
  - Speed (mph ↔ km/h)
  - Distance (mi ↔ km)
  - Precipitation (in ↔ mm)
  - Pressure (inHg ↔ mb)
- Test rounding and formatting
- Verify all components update on toggle
- Test with edge case values (very high/low)
- Test multi-tab synchronization
- Verify no layout shift during conversion
- Test in both light and dark themes
- Test responsive behavior
- Test touch targets on mobile