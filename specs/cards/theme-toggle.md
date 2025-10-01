# Theme Toggle Component Specification

## Purpose and Overview

Allows users to switch between light and dark color themes. Detects and respects system theme preference on initial load. Located at the bottom of the application layout. Persists user preference to localStorage via Zustand persist middleware for consistent experience across sessions.

## Props/API Interface

**Component Props:**
```typescript
// ThemeToggle accepts no props - fully self-contained
export function ThemeToggle(): JSX.Element
```

**Theme Store State:**
```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

**Store Integration:**
- Uses Zustand store (`useThemeStore`) for state management
- Persists to localStorage with key `theme-storage`
- Default theme: `'system'`
- No component props required

## Layout and Visual Design

### Actual Implementation

**Button Icon Toggle** (shadcn/ui Button component):
```
┌─────────┐
│   🌙    │  Light mode (shows Moon icon)
└─────────┘

┌─────────┐
│   ☀️    │  Dark mode (shows Sun icon)
└─────────┘
```

### Visual Design Details
- **Component**: `Button` from shadcn/ui
- **Variant**: `ghost`
- **Size**: `icon` (icon-only button)
- **Shape**: Rounded full circle (`rounded-full` class)
- **Icons**:
  - Light mode: Moon icon from lucide-react (5x5 size)
  - Dark mode: Sun icon from lucide-react (5x5 size)
- **No text labels**: Icon-only implementation

### Icon Indicators
- **Light mode**: Shows Moon icon (🌙) - clicking switches to dark
- **Dark mode**: Shows Sun icon (☀️) - clicking switches to light
- Icons from `lucide-react` package
- Icon size: `h-5 w-5` (20px)

### Positioning
- **Location**: Bottom of page (in footer layout)
- **Alignment**: As determined by parent container
- **Spacing**: Controlled by parent layout

### Styling
- Ghost button variant (minimal background)
- Circular shape with `rounded-full`
- Standard hover/focus states from Button component
- Inherits theme-aware styling from shadcn/ui

## Data Requirements

### Initial Theme Detection
1. **Default theme**: `'system'` (stored in Zustand store)
2. **Check localStorage**: Zustand persist middleware auto-loads from `theme-storage` key
3. **System preference detection**: Component evaluates `window.matchMedia('(prefers-color-scheme: dark)')` when theme is `'system'`

### Theme Application
- Applied to document root via `document.documentElement.classList`
- Classes: `'light'` or `'dark'` added to `<html>` element
- Tailwind configured with `darkMode: 'class'` strategy
- Theme updates immediately via `useEffect` when store state changes

### localStorage Schema
```json
{
  "state": {
    "theme": "dark"  // "light" | "dark" | "system"
  },
  "version": 0
}
```
- **Key**: `theme-storage` (Zustand persist middleware)
- **Value**: Zustand state object with theme property
- **Auto-managed**: Zustand handles serialization/deserialization

### System Preference Listener
```typescript
// Implemented in useEffect
if (theme === 'system') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}
```
- Only active when theme is set to `'system'`
- Updates DOM directly without triggering store update
- Properly cleaned up on component unmount

## User Interactions

### Toggle Action (Button Icon)
- **Click/Tap**: Toggles between light and dark modes
- **Toggle behavior**:
  - If current theme is dark → switches to light
  - If current theme is light → switches to dark
  - If current theme is system → determines effective theme, then toggles to opposite explicit theme
- **Immediate**: Theme changes instantly via DOM class update
- **Feedback**:
  - Icon changes (Moon ↔ Sun)
  - Visual change across entire app
  - Hover state from Button component

### System Theme Support
- **Default mode**: Component starts with `'system'` theme
- **Auto-detection**: Uses `window.matchMedia('(prefers-color-scheme: dark)')` to determine effective theme
- **Dynamic updates**: Listens for OS theme changes when in system mode
- **Toggle override**: Clicking button exits system mode and sets explicit theme
- **Visual indicator**: Shows Moon or Sun based on effective (resolved) theme

## Responsive Behavior

### All Viewports
- **Consistent design**: Icon-only button at all screen sizes
- **Touch-friendly**: Button component provides adequate touch target
- **Size**: Fixed icon size (`h-5 w-5`) with Button padding
- **No responsive variations**: Same appearance on desktop, tablet, and mobile
- **Parent-controlled**: Positioning and spacing handled by parent layout

## Accessibility Considerations

### Semantic HTML
```html
<button
  aria-label="Switch to dark mode"
  class="rounded-full"
  onClick={toggleTheme}
>
  <svg class="h-5 w-5"><!-- Moon or Sun icon --></svg>
</button>
```

### ARIA Attributes
- **aria-label**: Dynamic label indicating next state
  - Light mode: `"Switch to dark mode"`
  - Dark mode: `"Switch to light mode"`
- **Button semantics**: Native `<button>` element from shadcn/ui
- **No explicit role needed**: Button element has implicit button role

### Keyboard Navigation
- **Tab**: Focus on button
- **Space/Enter**: Activate toggle
- **Focus indicator**: Provided by Button component (meets WCAG standards)

### Screen Reader Support
- Button announces as: "Switch to [next mode] mode, button"
- Clear action indication via aria-label
- State conveyed through label (which icon is shown)

### Visual Considerations
- **Icons only**: Moon and Sun provide clear visual distinction
- **High contrast**: Icons visible in both themes
- **Focus indicators**: Inherit from Button component (WCAG compliant)
- **Hover states**: Clear visual feedback from ghost variant

## Loading States

### Initial Load
- **Zustand persist**: Automatically loads theme from localStorage
- **useEffect application**: Theme applied to DOM after component mount
- **Potential FOUC**: Brief flash possible until useEffect runs
- **Default**: System theme (respects OS preference immediately)

### Theme Switching
- **Instantaneous change**: DOM updated immediately in onClick handler
- **No loading state**: Direct class manipulation
- **No transition animations**: Immediate theme switch

### System Preference Change
- **Auto-update**: When theme is `'system'`, listener updates DOM directly
- **Silent update**: No loading indicators needed

## Flash of Unstyled Content (FOUC) Prevention

**Current Implementation:**
- Theme applied via `useEffect` after component mount
- Zustand persist hydrates store state asynchronously
- May show brief flash until theme applied

**Note:** No inline script currently implemented. Theme application happens client-side after React hydration.

## Example Usage

### In Layout Component
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

function Footer() {
  return (
    <footer>
      <ThemeToggle />
    </footer>
  );
}
```

### Using Theme Store Directly
```tsx
import { useThemeStore } from '@/stores/themeStore';

function CustomComponent() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Store Implementation
```tsx
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'theme-storage'
    }
  )
);
```

## Edge Cases

1. **localStorage Unavailable**:
   - Zustand persist middleware handles gracefully
   - Falls back to in-memory state
   - Defaults to `'system'` theme

2. **Invalid Stored Value**:
   - TypeScript typing prevents invalid values in store
   - Zustand persist validates against schema
   - Defaults to `'system'` if corruption detected

3. **System Preference Changes**:
   - **When theme is 'system'**: MediaQuery listener auto-updates DOM
   - **When theme is 'light' or 'dark'**: System changes ignored (user preference respected)
   - Listener cleanup prevents memory leaks

4. **Mid-Use Theme Change**:
   - OS theme changes detected via `mediaQuery.addEventListener('change')`
   - Only applies when current theme is `'system'`
   - Explicit user selections (light/dark) take precedence

5. **Multiple Tabs**:
   - Zustand persist automatically syncs across tabs
   - Uses localStorage events
   - All tabs update when theme changes in any tab

6. **Toggle from System Mode**:
   - **Behavior**: Determines current effective theme, then toggles to opposite
   - **Example**: System is dark → user clicks → switches to explicit light mode
   - **Persistence**: New explicit theme saved to localStorage

7. **Component Lifecycle**:
   - Two separate `useEffect` hooks:
     - First: Applies theme on mount and when theme changes
     - Second: Sets up/tears down system preference listener
   - Proper cleanup prevents memory leaks

## Theme Implementation

### Tailwind Dark Mode (Class Strategy)
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class strategy
  // ...
}
```

### DOM Application
```typescript
// Applied to document root
document.documentElement.classList.remove('light', 'dark');
document.documentElement.classList.add(effectiveTheme);
```

Result:
```html
<!-- Light mode -->
<html class="light">
  <!-- ... -->
</html>

<!-- Dark mode -->
<html class="dark">
  <!-- ... -->
</html>
```

### Component Styling
- Uses Tailwind's `dark:` variant for theme-specific styles
- Example: `className="bg-white dark:bg-gray-900"`
- shadcn/ui components automatically support dark mode via this strategy

## Performance Considerations

- **Class-based theming**: Efficient DOM class manipulation
- **No memoization needed**: Component is lightweight (simple button)
- **Direct DOM updates**: Bypasses React reconciliation for theme changes
- **Cleanup handlers**: Proper event listener cleanup prevents memory leaks
- **No debouncing**: System preference changes are infrequent, no debounce needed
- **No transitions**: Instant theme switching (no animation overhead)
- **Zustand persist**: Minimal overhead for localStorage sync

## Testing Requirements

### Functional Tests
- Render with default `'system'` theme
- Render in light mode (explicit)
- Render in dark mode (explicit)
- Test toggle interaction (light → dark → light)
- Test toggle from system mode (resolves effective theme first)
- Verify Zustand store updates on toggle
- Test system preference detection
- Test system preference change listener (when theme is 'system')
- Verify listener cleanup on unmount

### Accessibility Tests
- Test keyboard navigation (Tab to focus, Space/Enter to activate)
- Verify ARIA label changes based on current theme
- Test focus indicators
- Verify button semantics (native button role)
- Test with screen reader (announces "Switch to [mode] mode, button")

### Integration Tests
- Verify theme application to `document.documentElement`
- Test theme persistence via Zustand (localStorage key: `theme-storage`)
- Test multi-tab synchronization (Zustand persist handles this)
- Test with localStorage disabled (Zustand degrades gracefully)
- Verify theme changes propagate across app (Tailwind dark: classes work)

### Visual Tests
- Verify Moon icon shows in light mode
- Verify Sun icon shows in dark mode
- Test icon size consistency (`h-5 w-5`)
- Verify button styling (ghost variant, rounded-full)
- Test hover states
- Test color contrast in both themes

### Edge Case Tests
- Test rapid toggling
- Test component unmount during system mode (listener cleanup)
- Test theme change during re-render
- Verify no memory leaks from event listeners