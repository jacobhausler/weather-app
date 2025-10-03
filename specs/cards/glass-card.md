# GlassCard Component Specification

## Overview

The `GlassCard` component is a reusable UI wrapper that implements the glassmorphism design pattern with customizable blur intensity, gradient overlays, severity-based coloring, and interactive states. It serves as the foundational component for all weather cards in the HAUS Weather Station application.

**Location**: `src/components/ui/glass-card.tsx`

## Purpose

- Provides a consistent glassmorphic aesthetic across all weather UI components
- Offers configurable visual properties for different use cases (alerts, forecasts, current conditions)
- Supports both light and dark themes with automatic theming
- Enables interactive hover states for clickable cards
- Implements accessibility-friendly focus states

## Component Architecture

The GlassCard is a React forward ref component that wraps children with glassmorphic styling. It re-exports shadcn/ui Card sub-components (`CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`) for convenient composition.

## Props Interface

```typescript
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  gradient?: boolean
  severity?: 'extreme' | 'severe' | 'moderate' | 'minor'
  interactive?: boolean
}
```

### Prop Details

#### `blur` (optional)
- **Type**: `'sm' | 'md' | 'lg' | 'xl' | '2xl'`
- **Default**: `'lg'`
- **Purpose**: Controls backdrop blur intensity
- **Mapping**:
  - `sm`: `backdrop-blur-sm` (4px)
  - `md`: `backdrop-blur-md` (12px)
  - `lg`: `backdrop-blur-lg` (16px)
  - `xl`: `backdrop-blur-xl` (24px)
  - `2xl`: `backdrop-blur-2xl` (40px)

#### `gradient` (optional)
- **Type**: `boolean`
- **Default**: `false`
- **Purpose**: Enables gradient overlay from top-left to bottom-right
- **Effect**: Applies `glass-gradient` utility class with directional opacity fade
- **Light Mode**: `from-white/20 to-white/10`
- **Dark Mode**: `from-black/35 to-black/25`

#### `severity` (optional)
- **Type**: `'extreme' | 'severe' | 'moderate' | 'minor'`
- **Default**: `undefined`
- **Purpose**: Applies color-coded glass tint for alert severity levels
- **Mapping**:
  - `extreme`: Red tint (`glass-alert-extreme`)
  - `severe`: Orange tint (`glass-alert-severe`)
  - `moderate`: Yellow tint (`glass-alert-moderate`)
  - `minor`: Blue tint (`glass-alert-minor`)
- **Note**: When `severity` is set, it takes precedence over `gradient` styling

#### `interactive` (optional)
- **Type**: `boolean`
- **Default**: `false`
- **Purpose**: Enables hover effects (increased blur and shadow)
- **Effects**:
  - Applies `glass-card-hover` class
  - Adds `cursor-pointer`
  - Hover state: Enhanced backdrop blur (2xl) and shadow
  - Hover state: Increased opacity (`bg-white/25` light, `bg-black/35` dark)

## Variants & Styling

### Base Glass Card (Default)
```tsx
<GlassCard>
  {/* content */}
</GlassCard>
```
- Uses `glass-card` utility class
- Light mode: `bg-white/20` with `border-white/30`
- Dark mode: `bg-black/30` with `border-white/15`
- Default blur: 16px (lg)
- Rounded corners: `rounded-xl`

### Gradient Glass Card
```tsx
<GlassCard gradient>
  {/* content */}
</GlassCard>
```
- Uses `glass-gradient` and `glass-base` utility classes
- Directional gradient overlay (135deg, top-left to bottom-right)
- Light mode: `from-white/20 to-white/10`
- Dark mode: `from-black/35 to-black/25`

### Alert Severity Glass Cards
```tsx
<GlassCard severity="extreme">
  {/* alert content */}
</GlassCard>
```

#### Extreme (Red)
- Background: `bg-red-500/20` (light), `bg-red-900/30` (dark)
- Border: `border-red-300/30`
- Shadow: Red-tinted glow `rgba(239,68,68,0.2)`

#### Severe (Orange)
- Background: `bg-orange-500/20` (light), `bg-orange-900/30` (dark)
- Border: `border-orange-300/30`
- Shadow: Orange-tinted glow `rgba(249,115,22,0.2)`

#### Moderate (Yellow)
- Background: `bg-yellow-500/20` (light), `bg-yellow-900/30` (dark)
- Border: `border-yellow-300/30`
- Shadow: Yellow-tinted glow `rgba(234,179,8,0.2)`

#### Minor (Blue)
- Background: `bg-blue-500/20` (light), `bg-blue-900/30` (dark)
- Border: `border-blue-300/30`
- Shadow: Blue-tinted glow `rgba(59,130,246,0.2)`

### Interactive Glass Card
```tsx
<GlassCard interactive>
  {/* clickable content */}
</GlassCard>
```
- Adds `cursor-pointer`
- Hover effects:
  - Blur: Increases to `backdrop-blur-2xl`
  - Shadow: Upgrades to `shadow-2xl`
  - Opacity: `bg-white/25` (light), `bg-black/35` (dark)
- Smooth transition: `duration-300`

## CSS Design Tokens

### CSS Variables (defined in `index.css`)
```css
--glass-bg-light: rgba(255, 255, 255, 0.2);
--glass-bg-dark: rgba(0, 0, 0, 0.3);
--glass-border-light: rgba(255, 255, 255, 0.3);
--glass-border-dark: rgba(255, 255, 255, 0.15);
--glass-blur: 12px; /* 16px in dark mode */
--glass-blur-intense: 20px; /* 24px in dark mode */
```

### Tailwind Extensions (defined in `tailwind.config.js`)

#### Custom Backdrop Blur Values
- `backdrop-blur-xs`: 2px
- `backdrop-blur-4xl`: 80px

#### Custom Background Images
- `bg-gradient-glass-light`: Glass gradient for light mode
- `bg-gradient-glass-dark`: Glass gradient for dark mode
- `bg-gradient-sky`: Sky gradient (cyan to purple)
- `bg-gradient-midnight`: Midnight gradient (dark blue to indigo)

#### Custom Box Shadows
- `shadow-glass`: `0 8px 32px 0 rgba(0, 0, 0, 0.1)`
- `shadow-glass-lg`: `0 8px 32px 0 rgba(0, 0, 0, 0.15)`
- `shadow-glass-dark`: `0 8px 32px 0 rgba(0, 0, 0, 0.3)`

## Utility Classes (defined in `index.css` @layer utilities)

### Base Glass Classes
- `.glass-base`: Base backdrop filter with blur and transition
- `.glass-light`: Light mode glass styling
- `.glass-dark`: Dark mode glass styling
- `.glass-card`: Combined light/dark responsive glass card

### State Classes
- `.glass-card-hover`: Hover state enhancements (blur, shadow, opacity)

### Variant Classes
- `.glass-gradient`: Gradient overlay glass
- `.glass-alert-extreme`: Extreme severity alert glass
- `.glass-alert-severe`: Severe severity alert glass
- `.glass-alert-moderate`: Moderate severity alert glass
- `.glass-alert-minor`: Minor severity alert glass

## Usage Examples

### Basic Weather Card
```tsx
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/glass-card'

function WeatherCard() {
  return (
    <GlassCard blur="lg">
      <CardHeader>
        <CardTitle>Weather Data</CardTitle>
      </CardHeader>
      <CardContent>
        {/* weather information */}
      </CardContent>
    </GlassCard>
  )
}
```

### Interactive Forecast Card with Gradient
```tsx
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/glass-card'

function SevenDayForecast() {
  return (
    <GlassCard blur="lg" gradient interactive>
      <CardHeader>
        <CardTitle className="text-white dark:text-gray-100">7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {/* forecast data */}
      </CardContent>
    </GlassCard>
  )
}
```

### Current Conditions Card (Enhanced Glass)
```tsx
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/glass-card'

function CurrentConditions() {
  return (
    <GlassCard blur="xl" gradient interactive className="shadow-glass-lg">
      <CardHeader>
        <CardTitle className="text-white dark:text-gray-100">Current Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* current conditions */}
      </CardContent>
    </GlassCard>
  )
}
```

### Alert Card with Severity
```tsx
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/ui/glass-card'

interface AlertCardProps {
  alert: {
    severity: 'extreme' | 'severe' | 'moderate' | 'minor'
    headline: string
    description: string
  }
}

function AlertCard({ alert }: AlertCardProps) {
  return (
    <GlassCard severity={alert.severity} blur="xl" className="my-4">
      <CardHeader>
        <CardTitle>{alert.headline}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{alert.description}</p>
      </CardContent>
    </GlassCard>
  )
}
```

### Custom Styling with className
```tsx
<GlassCard
  blur="2xl"
  gradient
  interactive
  className="shadow-glass-dark hover:scale-105 transition-transform"
>
  {/* content */}
</GlassCard>
```

## Real-World Implementation Examples

### AlertCard Component
```tsx
<GlassCard
  severity={getSeverityGlass(alert.severity)}
  blur="xl"
  className="my-4"
>
  {/* Alert content */}
</GlassCard>
```

### CurrentConditions Component
```tsx
<GlassCard blur="xl" gradient interactive className="shadow-glass-lg">
  <CardHeader>
    <CardTitle className="text-white dark:text-gray-100">Current Conditions</CardTitle>
  </CardHeader>
  {/* Current conditions content */}
</GlassCard>
```

### HourlyForecast Component
```tsx
<GlassCard blur="lg" interactive className="shadow-glass">
  <CardHeader>
    {/* Hourly forecast controls */}
  </CardHeader>
  {/* Chart content */}
</GlassCard>
```

### SevenDayForecast Component
```tsx
<GlassCard blur="lg" gradient interactive>
  <CardHeader>
    <CardTitle className="text-white dark:text-gray-100">7-Day Forecast</CardTitle>
  </CardHeader>
  {/* 7-day forecast grid */}
</GlassCard>
```

## Styling Priority

The component applies classes in this priority order:
1. **Severity** (if provided): Overrides gradient and base styling
2. **Gradient** (if no severity): Overrides base glass styling
3. **Base glass-card**: Default fallback
4. **Blur level**: Always applied based on `blur` prop
5. **Interactive**: Applied conditionally if `interactive={true}`
6. **Custom className**: Always applied last (highest specificity)

## Accessibility

- Inherits all standard HTML div attributes via `React.HTMLAttributes<HTMLDivElement>`
- Supports ref forwarding for programmatic focus management
- Interactive cards automatically receive `cursor-pointer` for visual feedback
- Focus states handled by global CSS: `*:focus-visible` applies ring styles
- Compatible with keyboard navigation and screen readers

## Best Practices

1. **Choose appropriate blur levels**:
   - `sm/md`: Subtle glass for nested elements
   - `lg`: Default for most weather cards
   - `xl/2xl`: High-impact hero sections or important alerts

2. **Use severity prop only for alerts**:
   - Reserve severity variants for AlertCard component
   - Use gradient or base styling for other cards

3. **Apply interactive to clickable cards**:
   - Only use when card triggers navigation or modal
   - Provides visual feedback for user interaction

4. **Combine with custom shadows**:
   - `shadow-glass`: Standard glass shadow
   - `shadow-glass-lg`: Enhanced prominence
   - `shadow-glass-dark`: High contrast in light mode

5. **Text contrast considerations**:
   - Use `text-white dark:text-gray-100` for titles on gradient cards
   - Ensure sufficient contrast for readability on glass backgrounds

## Dependencies

- React (forward ref support)
- shadcn/ui Card components (`CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`)
- `@/lib/utils` (cn utility for className merging)
- Tailwind CSS with custom configuration
- `tailwindcss-animate` plugin

## Related Documentation

- Main design system: `MODERN_DESIGN_REFACTOR.md`
- Tailwind configuration: `tailwind.config.js`
- Global styles: `src/index.css`
- Component usage: See `AlertCard.tsx`, `CurrentConditions.tsx`, `HourlyForecast.tsx`, `SevenDayForecast.tsx`
