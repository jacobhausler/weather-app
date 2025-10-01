# Loading States Component Specification

## Purpose and Overview

Defines the loading state behaviors, skeleton screens, and loading indicators used throughout the weather application. Provides consistent visual feedback during data fetching operations while maintaining layout stability and avoiding content layout shift (CLS). Used across all weather cards and components.

This specification documents the actual implementation in `/workspaces/weather-app/src/components/LoadingSkeletons.tsx`.

## Quick Reference

**File**: `/workspaces/weather-app/src/components/LoadingSkeletons.tsx`

**Exports**:
- `AlertCardSkeleton`
- `SevenDayForecastSkeleton`
- `CurrentConditionsSkeleton`
- `HourlyForecastSkeleton`

**Base Component**: shadcn/ui `Skeleton` from `@/components/ui/skeleton`

**Key Characteristics**:
- Four skeleton components matching the four main weather cards
- Uses shadcn/ui Skeleton with Tailwind's `animate-pulse`
- Exact layout matching to prevent content layout shift (CLS)
- Automatic light/dark mode support
- Accessibility built-in (reduced motion support)

## Implementation Overview

The application uses **shadcn/ui Skeleton component** as the base building block for all loading states. The LoadingSkeletons.tsx file exports four card-specific skeleton components that exactly match the layout and structure of their corresponding actual content cards.

### Architecture Pattern

Each skeleton component:
1. Uses shadcn/ui Card components (Card, CardHeader, CardContent)
2. Builds identical layout structure as actual card
3. Replaces content with Skeleton placeholders
4. Maintains exact spacing, gaps, and padding
5. Exports as standalone component for easy integration

### Card Skeleton Components

Four exported skeleton components correspond to the four main weather cards:

1. **AlertCardSkeleton** - Weather alert card loading state
2. **SevenDayForecastSkeleton** - 7-day forecast card loading state
3. **CurrentConditionsSkeleton** - Current conditions card loading state
4. **HourlyForecastSkeleton** - Hourly forecast chart loading state

## Loading State Strategy

### Primary Approach: Skeleton Screens
Pre-rendered placeholder content that mimics the structure and layout of actual content. Prevents layout shift and provides visual feedback about content structure.

### Progressive Loading
Each card loads independently - show skeleton for cards still loading while displaying loaded cards immediately.

### Background Refresh
Non-interrupting refresh uses small indicators, not full skeleton replacement (handled by parent components, not LoadingSkeletons.tsx).

## Skeleton Component Implementation

### Component Architecture

All skeleton components follow the same structure:
1. Import shadcn/ui base components (Card, CardContent, CardHeader)
2. Import shadcn/ui Skeleton component
3. Build layout matching actual card using Skeleton for placeholders
4. Export named skeleton component

### AlertCardSkeleton

**Implementation Details:**
```tsx
export function AlertCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-red-600 dark:border-l-red-400">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Skeleton className="mt-1 h-6 w-6 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}
```

**Layout Features:**
- Border-left colored accent (red for alert severity)
- Icon placeholder (6x6)
- Title placeholder (75% width)
- Three badge placeholders for severity/urgency
- Time range placeholders (2x 48w)
- Description text (3 lines, varying widths)
- Effective time placeholder

### SevenDayForecastSkeleton

**Implementation Details:**
```tsx
export function SevenDayForecastSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex min-w-[140px] flex-col items-center gap-2 rounded-lg border p-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-5 w-10" />
                </div>
                <div className="w-full space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Layout Features:**
- Title placeholder (40w)
- Horizontal scrollable row (7 day cards)
- Each day card (140px min-width):
  - Day name (20w)
  - Circular weather icon (16x16, rounded-full)
  - Weather description (24w)
  - Temp high/low (12w + 10w)
  - Precipitation and wind info (2 lines, full width)

### CurrentConditionsSkeleton

**Implementation Details:**
```tsx
export function CurrentConditionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Weather */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-14 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-4" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Forecast */}
        <div className="mt-6 rounded-lg bg-muted p-4 space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Tonight's Forecast */}
        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Layout Features:**
- Title placeholder (48w)
- Two-column grid (collapses on mobile)
- Left column: Current weather section
  - Weather icon (20x20)
  - Large temperature (14h x 32w)
  - Feels like temp (28w)
  - Description (40w)
  - High/Low temps (2x 20w)
- Right column: Weather details grid (2 columns)
  - 6 stat cards with icon + label + value
- Detailed forecast section (bg-muted)
  - Section title (24w)
  - 3 lines of text (varying widths)
- Tonight's forecast section (bordered)
  - Icon (12x12)
  - Title (24w)
  - Description (48w)

### HourlyForecastSkeleton

**Implementation Details:**
```tsx
export function HourlyForecastSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-[120px]" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-end justify-around gap-2 px-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton className="w-full" style={{ height: `${Math.random() * 150 + 100}px` }} />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 flex justify-around rounded-lg bg-muted p-3">
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-5 w-16 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Layout Features:**
- Title placeholder (40w)
- Controls section (flex, wraps on mobile)
  - Period selector dropdown (120w)
  - Four data type buttons (16w, 16w, 16w, 20w)
- Chart area (300px height)
  - 12 bar chart columns with random heights (100-250px)
  - Hour labels below each bar (8w)
- Summary stats section (bg-muted)
  - Three stat groups (centered)
  - Each: label (12w) + value (16w)

## shadcn/ui Skeleton Component

### Base Component Implementation

The shadcn/ui Skeleton component (`/workspaces/weather-app/src/components/ui/skeleton.tsx`) is a simple, efficient component:

```tsx
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}
```

**Default Classes:**
- `animate-pulse` - Tailwind's built-in pulse animation
- `rounded-md` - Medium rounded corners (overridable)
- `bg-muted` - Themed background color (light/dark mode)

### Usage

The Skeleton component accepts standard HTML div attributes and merges custom classes:

```tsx
<Skeleton className="h-4 w-20" />
```

**Key Features:**
- **Animation**: `animate-pulse` (Tailwind built-in)
- **Sizing**: Use Tailwind sizing classes (h-*, w-*, etc.)
- **Styling**: All Tailwind utilities supported via className
- **Theming**: `bg-muted` automatically adapts to light/dark mode
- **Shapes**: Override `rounded-md` with any rounded-* class

### Styling Examples

All sizing and styling is done via Tailwind className prop:

```tsx
// Text line (default rounding)
<Skeleton className="h-4 w-32" />

// Circular icon (override rounding)
<Skeleton className="h-16 w-16 rounded-full" />

// Full width block
<Skeleton className="h-24 w-full" />

// Custom rounded corners (override default)
<Skeleton className="h-12 w-48 rounded-lg" />

// Square (no rounding)
<Skeleton className="h-10 w-10 rounded-none" />
```

### Animation Details

**Tailwind's `animate-pulse`:**
- Keyframes: `0%, 100% { opacity: 1 }` / `50% { opacity: .5 }`
- Duration: 2 seconds
- Timing: cubic-bezier ease-in-out
- Infinite loop
- GPU-accelerated (opacity-only animation)
- Automatically respects `prefers-reduced-motion`

### Theming

**`bg-muted` Background:**
- Light mode: Light gray (from CSS variables)
- Dark mode: Dark gray (from CSS variables)
- Defined in global theme configuration
- Consistent with shadcn/ui design system
- No manual theme switching needed

## Layout Stability and CLS Prevention

### Design Principles

All skeleton components are designed to:
- **Match exact dimensions** of loaded content
- **Preserve spacing** using same gaps and padding
- **Maintain structure** with identical layout containers
- **Prevent layout shift** by reserving space before content loads

### Implementation Strategy

Each skeleton mirrors the actual card component:
1. Same Card/CardHeader/CardContent structure
2. Same grid/flex layouts
3. Same gap and padding values
4. Skeleton placeholders sized to match content

**Example: CurrentConditionsSkeleton uses same grid**
```tsx
// Both actual and skeleton use: grid gap-6 md:grid-cols-2
<div className="grid gap-6 md:grid-cols-2">
  {/* Skeleton content */}
</div>
```

## Usage Patterns

### Card Component Integration

Each card component conditionally renders either skeleton or actual content:

```tsx
function WeatherDashboard({ zipCode }: Props) {
  const { data, isLoading } = useWeatherData(zipCode);

  return (
    <>
      {/* Alert Card */}
      {isLoading ? (
        <AlertCardSkeleton />
      ) : data.alerts ? (
        <AlertCard alerts={data.alerts} />
      ) : null}

      {/* 7-Day Forecast */}
      {isLoading ? (
        <SevenDayForecastSkeleton />
      ) : (
        <SevenDayForecastCard forecast={data.forecast} />
      )}

      {/* Current Conditions */}
      {isLoading ? (
        <CurrentConditionsSkeleton />
      ) : (
        <CurrentConditionsCard conditions={data.current} />
      )}

      {/* Hourly Forecast */}
      {isLoading ? (
        <HourlyForecastSkeleton />
      ) : (
        <HourlyForecastCard hourly={data.hourly} />
      )}
    </>
  );
}
```

### Progressive Loading

Each card loads independently. The application shows skeleton for loading cards while displaying loaded cards immediately:

```tsx
// Cards load in parallel, show skeletons until each completes
if (!currentConditions) return <CurrentConditionsSkeleton />
if (!forecast) return <SevenDayForecastSkeleton />
if (!hourly) return <HourlyForecastSkeleton />
```

### Background Refresh

Background refresh does NOT use skeletons. Parent components handle refresh indicators separately to avoid interrupting visible content.

## Accessibility

### shadcn/ui Skeleton Accessibility

The shadcn/ui Skeleton component includes built-in accessibility features:
- Proper semantic HTML
- Respects `prefers-reduced-motion` media query
- No additional ARIA needed for basic skeleton usage

### Reduced Motion Support

The skeleton pulse animation automatically respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    opacity: 0.5;
  }
}
```

This is handled automatically by the shadcn/ui Skeleton component.

### Screen Reader Behavior

Skeleton screens are visual-only loading indicators. Screen readers:
- Skip over skeleton elements (treated as decorative)
- Announce content when it loads
- No special ARIA attributes needed

Parent components should manage loading state announcements if needed.

## Performance Considerations

### Optimization Strategy

The LoadingSkeletons.tsx implementation is optimized for performance:

1. **Pure CSS animations** - No JavaScript animation overhead
2. **Static components** - Skeleton components are simple, no state or effects
3. **Efficient rendering** - Uses Array.from() for repeated elements (7-day, hourly bars)
4. **No memoization needed** - Components are simple enough that React handles efficiently

### Animation Performance

shadcn/ui Skeleton uses:
- CSS animations (GPU-accelerated)
- `transform` and `opacity` properties only
- No layout thrashing
- Automatic pausing when tab inactive

## File Location

**Implementation**: `/workspaces/weather-app/src/components/LoadingSkeletons.tsx`

**Exports**:
- `AlertCardSkeleton`
- `SevenDayForecastSkeleton`
- `CurrentConditionsSkeleton`
- `HourlyForecastSkeleton`

**Dependencies**:
- `@/components/ui/card` (Card, CardContent, CardHeader)
- `@/components/ui/skeleton` (Skeleton)

## Testing Requirements

### Visual Testing
- Render each skeleton component in isolation
- Verify skeleton dimensions approximately match loaded content
- Test in light mode and dark mode
- Verify color contrast meets accessibility standards
- Test responsive layouts (mobile, tablet, desktop)

### Behavior Testing
- Verify no layout shift when transitioning from skeleton to content
- Test reduced motion preference (animation disabled)
- Verify skeleton appears immediately (no delay)
- Test loading to content transition is smooth

### Integration Testing
- Test progressive loading (cards load independently)
- Verify correct skeleton shown for each card type
- Test error state handling (skeleton → error message)
- Test refresh behavior (no skeleton during background refresh)