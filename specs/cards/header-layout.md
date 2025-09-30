# Header Layout Component Specification

## Purpose and Overview

The main header/navigation bar for the Weather Station application. Contains the application title, manual refresh button, and ZIP code input. Provides consistent branding and core navigation controls across all application states. Fixed at the top of the page for persistent access to key functions.

## Props/API Interface

```typescript
interface HeaderLayoutProps {
  title?: string;           // Default: "HAUS Weather Station"
  onRefresh: () => void;    // Callback for manual refresh
  isRefreshing?: boolean;   // Loading state for refresh
  className?: string;
}
```

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

### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│  [Refresh]         HAUS Weather Station         [75454] [Go]│
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌────────────────────────────────────────┐
│  [🔄]    HAUS Weather Station          │
│                              [ZIP] [Go] │
└────────────────────────────────────────┘
```
OR (stacked alternative):
```
┌────────────────────────────────────────┐
│  [🔄] HAUS Weather Station             │
├────────────────────────────────────────┤
│  [Enter ZIP Code: _____] [Go]          │
└────────────────────────────────────────┘
```

### Styling Guidelines
- **Height**: Fixed height (e.g., 64px desktop, 56px mobile)
- **Background**: Themed background (light/dark mode support)
- **Border**: Bottom border for visual separation
- **Shadow**: Subtle shadow for depth (optional)
- **Position**: Sticky or fixed at top of viewport
- **Z-index**: High value to stay above content when scrolling
- **Typography**:
  - Title: Bold, larger font (e.g., 1.5rem desktop, 1.25rem mobile)
  - Consistent with app's type scale

### Visual States
- **Normal**: Default appearance
- **Refreshing**: Refresh icon animates (spinning)
- **Collapsed** (scroll): Optional - reduce height on scroll (mobile)

## Component Integration

The header contains or integrates with:
1. **Refresh Button** (see refresh-button.md)
2. **Title** (static text element)
3. **ZIP Code Input** (see zip-input.md)

These are composed within the header layout but maintain their individual specifications.

## Data Requirements

### Props Data
- Title text (configurable via props, default provided)
- Refresh callback function
- Refresh loading state

### No API Calls
- Header itself makes no API calls
- Coordinates actions via callbacks
- Child components handle their own data needs

## User Interactions

### Title
- **Non-interactive** by default
- Optional: Click to return to home/default view (future enhancement)
- Acts as branding element

### Layout Interactions
- Header remains accessible while scrolling
- Child components (refresh button, ZIP input) handle their own interactions
- Maintains visibility of critical controls

## Responsive Behavior

### Desktop (≥1024px)
- Full horizontal layout
- Title centered with ample spacing
- Controls positioned at left and right edges
- Comfortable padding and spacing

### Tablet (768px - 1023px)
- Similar to desktop but adjusted spacing
- May reduce title font size slightly
- Maintain three-column layout

### Mobile (<768px)
**Option 1 - Single Row**:
- Refresh button (left)
- Title (center, may truncate if needed)
- ZIP input (right, compact form)

**Option 2 - Two Rows**:
- Row 1: Refresh button + Title
- Row 2: ZIP input (full width)

**Recommended**: Option 1 for simplicity, with title truncation if needed

### Very Small Screens (<375px)
- Consider abbreviating title (e.g., "HAUS Weather")
- Ensure all controls remain accessible
- May stack to two rows if necessary

## Accessibility Considerations

### Semantic HTML
```html
<header role="banner">
  <nav aria-label="Primary navigation">
    <button aria-label="Refresh weather data">
      <!-- Refresh button -->
    </button>

    <h1>HAUS Weather Station</h1>

    <div role="search" aria-label="ZIP code search">
      <!-- ZIP input component -->
    </div>
  </nav>
</header>
```

### ARIA Attributes
- `role="banner"` on header element
- Title as `<h1>` for proper document structure
- Child components have appropriate ARIA labels

### Keyboard Navigation
- Tab order: Refresh button → ZIP input → Submit button
- Skip link for keyboard users to jump to main content (optional)
- Focus indicators visible on all interactive elements

### Screen Reader Support
- Header announced as "banner" landmark
- Title read as main heading
- Controls announced clearly with their purpose
- Refresh state announced when loading

### Visual Considerations
- High contrast between text and background
- Works in both light and dark modes
- Focus indicators meet WCAG standards
- Sufficient touch target sizes (44x44px minimum)

## Loading States

### Normal State
- All controls enabled and interactive
- Static appearance

### Refreshing State
- Refresh button shows spinning animation
- Refresh button may be disabled during refresh
- Other controls remain functional
- No blocking modal or overlay

### Error State
- Header remains functional
- Error handling delegated to error banner component
- Header itself doesn't show error states

## Example Usage

```tsx
import { HeaderLayout } from '@/components/layout/HeaderLayout';
import { useWeatherData } from '@/hooks/useWeatherData';

function App() {
  const { refresh, isRefreshing } = useWeatherData();

  return (
    <div className="app">
      <HeaderLayout
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />
      {/* Main content */}
    </div>
  );
}
```

### Alternative with Composition
```tsx
import { Header } from '@/components/layout/Header';
import { RefreshButton } from '@/components/RefreshButton';
import { ZipInput } from '@/components/ZipInput';

function App() {
  return (
    <Header>
      <Header.Left>
        <RefreshButton />
      </Header.Left>

      <Header.Center>
        <h1>HAUS Weather Station</h1>
      </Header.Center>

      <Header.Right>
        <ZipInput />
      </Header.Right>
    </Header>
  );
}
```

## Edge Cases

1. **Very Long Title**:
   - Truncate with ellipsis on small screens
   - Ensure critical controls remain visible

2. **Simultaneous Interactions**:
   - User clicks refresh while entering ZIP
   - Both should function independently

3. **Scrolling Behavior**:
   - Header stays fixed/sticky
   - Content scrolls beneath header
   - Z-index prevents content overlapping header

4. **Theme Changes**:
   - Smooth transition between light/dark modes
   - All elements update consistently

5. **Print Styles**:
   - Header should appear in printed output
   - Consider simplified version for print

6. **Orientation Change** (mobile):
   - Adjust layout smoothly on portrait/landscape switch
   - Maintain functionality in both orientations

## Composition vs. Monolithic

### Recommended Approach: Composition
Break header into smaller components:
- `Header` (container)
- `RefreshButton` (separate component)
- `ZipInput` (separate component)

**Advantages**:
- Better separation of concerns
- Easier testing
- More reusable components
- Clearer responsibilities

### Container Responsibilities
The header layout component:
- Provides structural layout
- Positions child components
- Handles responsive behavior
- Manages spacing and alignment
- Does NOT handle business logic of children

## Styling Approach

### CSS Structure
```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 1rem;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  flex-grow: 1;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 120px; /* Ensure space for button */
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 200px; /* Ensure space for ZIP input */
}

@media (max-width: 768px) {
  .header {
    height: 56px;
    padding: 0 0.5rem;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .header-right {
    min-width: 150px;
  }
}
```

## Performance Considerations

- Avoid re-renders of header when unrelated state changes
- Use React.memo for header component
- Memoize callback functions passed to children
- Optimize animations (use CSS transforms for smooth performance)
- Lazy load child components if beneficial

## Testing Requirements

- Render header with all child components
- Verify layout at all responsive breakpoints
- Test refresh callback invocation
- Test with different title lengths
- Verify sticky/fixed positioning behavior
- Test keyboard navigation through header elements
- Test with screen reader
- Verify tab order
- Test in both light and dark modes
- Verify z-index stacking context
- Test with child components in various states
- Verify proper spacing and alignment
- Test on actual mobile devices (touch targets)
- Test orientation changes on mobile
- Verify print styles