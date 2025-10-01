# Header Layout Component Specification

## Purpose and Overview

The main header/navigation bar for the Weather Station application. Contains the application title, manual refresh button, and ZIP code input. Provides consistent branding and core navigation controls across all application states. Fixed at the top of the page for persistent access to key functions.

This is a **pure layout component** with no props - it composes child components (RefreshButton and ZipInput) which manage their own state and interactions.

## Component Interface

```typescript
// No props - pure layout component
export function Header(): JSX.Element
```

The Header component:
- Has no props or configuration options
- Acts solely as a layout container
- Composes RefreshButton and ZipInput components directly
- Child components handle their own data, state, and user interactions

## Layout and Visual Design

### Header Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [🔄]           HAUS Weather Station          [ZIP: 75454▼] │
└─────────────────────────────────────────────────────────────┘
```

### Element Positioning
- **Left**: Refresh button
- **Center**: Application title
- **Right**: ZIP code input component

### Desktop Layout (≥768px)
```
┌─────────────────────────────────────────────────────────────┐
│  [Refresh]         HAUS Weather Station         [75454] [Go]│
└─────────────────────────────────────────────────────────────┘
```

**Implementation**: Three-column layout using flexbox with `justify-between`:
- Left column: RefreshButton
- Center column: Title (text-3xl font-bold)
- Right column: ZipInput (min-width: 280px)

### Mobile Layout (<768px)
```
┌────────────────────────────────────────┐
│  [🔄] HAUS Weather Station             │
├────────────────────────────────────────┤
│  [Enter ZIP Code: _____] [Go]          │
└────────────────────────────────────────┘
```

**Implementation**: Two-row stacked layout:
- Row 1: RefreshButton + centered title (flex layout with gap-2)
- Row 2: ZipInput (full width)
- Vertical spacing: gap-4 between rows

### Styling Guidelines (Actual Implementation)

**Container Styling**:
- **Position**: Sticky at top (`sticky top-0`)
- **Z-index**: 40 (`z-40`) to stay above content when scrolling
- **Width**: Full width (`w-full`)
- **Border**: Bottom border (`border-b`)
- **Background**: Semi-transparent with backdrop blur
  - `bg-background/95` - 95% opacity
  - `backdrop-blur` - blur effect
  - `supports-[backdrop-filter]:bg-background/60` - 60% opacity when backdrop-filter is supported
- **Padding**: Container has `mx-auto px-4 py-4` (16px horizontal, 16px vertical)

**Typography**:
- Desktop title: `text-3xl font-bold` (1.875rem, 30px)
- Mobile title: `text-2xl font-bold` (1.5rem, 24px)
- Both use bold weight for prominence

**Responsive Behavior**:
- Breakpoint: `md` (768px) - not 1024px
- Mobile: Two-row stacked layout with `flex-col gap-4`
- Desktop: Three-column layout with `justify-between gap-4`

### Visual States
- **Normal**: Default appearance with semi-transparent background
- **Refreshing**: RefreshButton component handles its own spinning animation
- **Scrolling**: Header remains visible due to sticky positioning with backdrop blur

## Component Integration

The Header component directly composes the following child components:

1. **RefreshButton** (`./RefreshButton`)
   - Imported and rendered directly
   - Manages its own state and refresh logic
   - See refresh-button.md for specifications

2. **Title** (static text element)
   - Hard-coded as "HAUS Weather Station"
   - Not configurable via props
   - Rendered as `<h1>` element

3. **ZipInput** (`./ZipInput`)
   - Imported and rendered directly
   - Manages its own state and submission logic
   - See zip-input.md for specifications

**Key Principle**: The Header component is purely for layout. It does NOT:
- Accept callbacks from parent components
- Manage state for child components
- Pass props to child components
- Handle business logic

All child components are self-contained and manage their own interactions with global state/stores.

## Data Requirements

### No Props
- The Header component accepts no props
- All configuration is handled by child components

### No API Calls
- Header makes no API calls
- Header has no data requirements
- Child components access stores/hooks directly for their data needs

## User Interactions

### Title
- **Non-interactive** - acts solely as branding element
- No click handlers or hover states
- Provides visual identity for the application

### Layout Interactions
- Header remains accessible while scrolling (sticky positioning)
- Child components (RefreshButton, ZipInput) handle all user interactions independently
- Header provides no interaction handling itself

## Responsive Behavior

### Desktop (≥768px)
**Implementation**: Uses `hidden md:block` to show only on md+ screens

- Three-column horizontal layout using flexbox
- `flex items-center justify-between gap-4`
- Left: RefreshButton in flex container
- Center: Title with `text-3xl font-bold`
- Right: ZipInput with `min-w-[280px]` to ensure sufficient space
- Space-between distributes available space automatically

### Mobile (<768px)
**Implementation**: Uses `md:hidden` to show only on small screens

- Two-row stacked layout: `flex flex-col gap-4`
- **Row 1**: Refresh button and title
  - `flex items-center gap-2`
  - RefreshButton on left
  - Title with `flex-1 text-center text-2xl font-bold`
- **Row 2**: Full-width ZipInput
- 16px (1rem) gap between rows

### Breakpoint Strategy
- Single breakpoint at `md` (768px)
- Two completely separate layout structures (not progressive enhancement)
- Mobile-first approach with desktop as override

## Accessibility Considerations

### Semantic HTML (Actual Implementation)
```html
<header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur...">
  <div class="container mx-auto px-4 py-4">
    <!-- Mobile or Desktop layout divs -->
    <div>
      <!-- RefreshButton component -->
      <h1>HAUS Weather Station</h1>
      <!-- ZipInput component -->
    </div>
  </div>
</header>
```

**Notes**:
- Uses semantic `<header>` element
- Title properly wrapped in `<h1>` for document structure
- No explicit `role="banner"` (implicit from `<header>`)
- No `<nav>` wrapper (header is not primary navigation)
- Child components handle their own ARIA attributes

### Keyboard Navigation
- Natural tab order based on DOM structure
- Mobile: RefreshButton → ZipInput
- Desktop: RefreshButton → ZipInput
- Child components provide their own focus indicators
- No skip links implemented in current version

### Screen Reader Support
- `<header>` provides implicit "banner" landmark
- `<h1>` properly identifies main heading
- Child components (RefreshButton, ZipInput) provide their own ARIA labels and announcements
- Header itself provides no additional ARIA annotations

### Visual Considerations
- Background adapts to light/dark mode via `bg-background` token
- Semi-transparent background with backdrop blur for visual depth
- Border provides visual separation from content
- Child components handle their own touch targets and focus states

## Loading States

The Header component itself has no loading states. All state management is delegated to child components:

- **RefreshButton**: Manages its own loading/spinning animation state
- **ZipInput**: Manages its own submission/validation states
- **Header**: Remains static regardless of application state

The header provides a stable, always-visible container for its child components.

## Example Usage

```tsx
import { Header } from '@/components/Header'

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      {/* Main content */}
    </div>
  )
}
```

**Key Points**:
- No props needed
- No configuration required
- Simply import and render
- Child components self-configure via their own hooks/stores

## Edge Cases

1. **Very Long Title**:
   - Title is hard-coded as "HAUS Weather Station"
   - Mobile uses `text-2xl`, desktop uses `text-3xl`
   - On mobile row 1, title uses `flex-1 text-center` which handles overflow gracefully
   - No ellipsis needed - title is short enough

2. **Simultaneous Interactions**:
   - RefreshButton and ZipInput function independently
   - No shared state between components
   - Both can be interacted with simultaneously without conflicts

3. **Scrolling Behavior**:
   - Sticky positioning (`sticky top-0`) keeps header visible
   - `z-40` ensures header stays above content
   - Backdrop blur creates visual separation from scrolling content

4. **Theme Changes**:
   - `bg-background` token automatically adapts to theme
   - Border uses theme-aware `border` color
   - Transition handled by parent theme provider

5. **Orientation Change** (mobile):
   - Layout based on viewport width, not orientation
   - Automatically adapts on orientation change
   - No special handling needed

## Actual Implementation Approach

### Composition Pattern Used
The Header component follows a **direct composition** pattern:
- `Header` - Pure layout container (this component)
- `RefreshButton` - Imported and rendered directly
- `ZipInput` - Imported and rendered directly

**Implementation Details**:
```tsx
import { RefreshButton } from './RefreshButton'
import { ZipInput } from './ZipInput'

export function Header() {
  return (
    <header className="...">
      {/* Layout divs with child components */}
      <RefreshButton />
      <h1>HAUS Weather Station</h1>
      <ZipInput />
    </header>
  )
}
```

### Header Responsibilities
The header component ONLY:
- Provides structural layout (flexbox containers)
- Positions child components responsively
- Handles responsive breakpoints (mobile vs desktop)
- Manages spacing and alignment (gap, padding)
- Provides sticky positioning and visual styling

The header does NOT:
- Accept props from parent
- Pass props to children
- Manage state
- Handle user interactions
- Make API calls
- Coordinate between child components

## Styling Approach

### Actual Tailwind CSS Implementation

**Header Container**:
```tsx
<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
```

**Inner Container**:
```tsx
<div className="container mx-auto px-4 py-4">
```

**Mobile Layout** (visible on <768px):
```tsx
<div className="md:hidden">
  <div className="flex flex-col gap-4">
    {/* Row 1: Refresh + Title */}
    <div className="flex items-center gap-2">
      <RefreshButton />
      <h1 className="flex-1 text-center text-2xl font-bold">
        HAUS Weather Station
      </h1>
    </div>
    {/* Row 2: ZIP input */}
    <ZipInput />
  </div>
</div>
```

**Desktop Layout** (visible on ≥768px):
```tsx
<div className="hidden md:block">
  <div className="flex items-center justify-between gap-4">
    {/* Left */}
    <div className="flex items-center">
      <RefreshButton />
    </div>
    {/* Center */}
    <h1 className="text-3xl font-bold">HAUS Weather Station</h1>
    {/* Right */}
    <div className="min-w-[280px]">
      <ZipInput />
    </div>
  </div>
</div>
```

**Key Tailwind Patterns**:
- Responsive visibility: `md:hidden` / `hidden md:block`
- Flexbox layouts: `flex`, `flex-col`, `items-center`, `justify-between`
- Spacing: `gap-2`, `gap-4`, `px-4 py-4`
- Sizing: `min-w-[280px]`, `flex-1`, `w-full`
- Typography: `text-2xl`, `text-3xl`, `font-bold`, `text-center`
- Positioning: `sticky top-0 z-40`
- Effects: `backdrop-blur`, `bg-background/95`, `border-b`

## Performance Considerations

**Current Implementation**:
- Header has no props, so no prop-change re-renders
- Header has no state, so no state-change re-renders
- Re-renders only when:
  - Parent component re-renders (but Header itself is cheap to render)
  - Child components re-render (isolated to their own subtrees)
- No React.memo needed - component is trivial and has no props
- No memoization needed - no callbacks or computed values
- Backdrop blur uses CSS, not JavaScript
- Two separate DOM structures for mobile/desktop (trade-off for simplicity)

**Optimization Opportunities** (not currently implemented):
- Could memoize Header with `React.memo()` to prevent parent re-renders
- Could lazy load child components (unlikely to provide benefit)

## Testing Requirements

**Layout Testing**:
- Render header successfully
- Verify both mobile and desktop layouts render
- Verify proper responsive breakpoint switching at 768px
- Verify sticky positioning behavior
- Verify z-index keeps header above scrolling content
- Test backdrop blur effect renders correctly

**Component Integration**:
- Verify RefreshButton renders in correct position
- Verify ZipInput renders in correct position
- Verify title renders with correct text
- Verify child components are interactive

**Responsive Testing**:
- Test at <768px (mobile layout visible)
- Test at ≥768px (desktop layout visible)
- Verify only one layout visible at a time
- Verify spacing and alignment at both breakpoints
- Test on actual mobile devices

**Accessibility Testing**:
- Verify `<header>` semantic element
- Verify `<h1>` for title
- Test keyboard navigation through child components
- Verify natural tab order (RefreshButton → ZipInput)
- Test with screen reader (banner landmark announcement)

**Visual Testing**:
- Test in both light and dark modes
- Verify border and background colors adapt to theme
- Verify backdrop blur visual effect
- Test with different viewport widths