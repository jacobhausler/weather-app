# Theme Toggle Component Specification

## Purpose and Overview

Allows users to switch between light and dark color themes. Detects and respects system theme preference on initial load. Located at the bottom of the application layout. Persists user preference to localStorage for consistent experience across sessions.

## Props/API Interface

```typescript
interface ThemeToggleProps {
  className?: string;
  variant?: 'switch' | 'button' | 'select';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';  // Resolved theme
}
```

## Layout and Visual Design

### Toggle Variants

**Switch Toggle** (Recommended):
```
┌────────────────────┐
│  ☀️  ●─────  🌙   │
│      (slide)       │
└────────────────────┘

Light mode:  ●───── 🌙
Dark mode:   ☀️ ─────●
```

**Button Toggle**:
```
┌──────────────┐
│  [☀️] [🌙]  │
│  Light Dark  │
└──────────────┘
```

**Select Dropdown**:
```
┌────────────────┐
│ Theme: [Dark ▼]│
│  ├─ Light      │
│  ├─ Dark       │
│  └─ System     │
└────────────────┘
```

### Icon Indicators
- **Light mode**: Sun icon (☀️)
- **Dark mode**: Moon/crescent icon (🌙)
- **System**: Monitor/computer icon (🖥️) or auto icon

### Positioning
- **Location**: Bottom of page
- **Fixed position**: Stays visible when scrolling (optional)
- **Alignment**: Centered or bottom-right
- **Spacing**: Adequate padding from edges and other controls

### Styling Guidelines

**Switch Variant**:
- Track: Rounded rectangle (~40px wide, ~20px tall)
- Knob: Circle that slides left/right
- Colors:
  - Light mode track: Light gray/blue
  - Dark mode track: Dark gray/blue
  - Knob: White with shadow
- Transition: Smooth 200-300ms animation
- Icons: Positioned at track ends

**Button Variant**:
- Two adjacent buttons
- Active button highlighted
- Inactive button muted
- Clear visual distinction
- Icon + text or icon only

**Select Variant**:
- Standard dropdown/select element
- Options: Light, Dark, System
- Shows current selection
- Themed to match current mode

### Layout Examples

**Bottom Center**:
```
┌────────────────────────────────┐
│                                │
│     [Weather content]          │
│                                │
│      ☀️ ●───── 🌙            │
│        Theme                   │
└────────────────────────────────┘
```

**Bottom Right** (with Unit Toggle):
```
┌────────────────────────────────┐
│                                │
│     [Weather content]          │
│                                │
│  [°F/°C]        ☀️ ●───── 🌙 │
└────────────────────────────────┘
```

## Data Requirements

### Initial Theme Detection
1. **Check localStorage**: User's saved preference
2. **Check system preference**: `window.matchMedia('(prefers-color-scheme: dark)')`
3. **Default**: Light mode if no preference found

### Theme Application
- Apply theme to document root: `<html class="light">` or `<html class="dark">`
- Or use CSS variables on `:root`
- Update immediately when toggled
- Persist to localStorage

### localStorage Schema
```json
{
  "theme": "dark",  // "light" | "dark" | "system"
  "lastUpdated": "2024-09-30T12:00:00Z"
}
```
- Key: `weather-theme-preference`
- Value: Theme string
- Timestamp for debugging (optional)

### System Preference Listener
```javascript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  if (theme === 'system') {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});
```

## User Interactions

### Toggle Action (Switch)
- **Click/Tap**: Toggle between light and dark
- **Animation**: Smooth slide of knob
- **Immediate**: Theme changes instantly
- **Feedback**: Visual change across entire app

### Button Selection
- **Click**: Select light or dark mode
- **Active state**: Clearly indicated
- **Hover**: Visual feedback on hover

### Dropdown Selection
- **Open**: Click to show options
- **Select**: Choose light, dark, or system
- **Close**: Auto-close on selection

### System Theme Option
If "System" mode supported:
- Auto-detect system preference
- Update when system preference changes
- Visual indicator that "System" is selected

## Responsive Behavior

### Desktop (≥1024px)
- Full-size toggle with labels
- Switch variant with icons and text
- Hover effects active
- Comfortable spacing

### Tablet (768px - 1023px)
- Similar to desktop
- May reduce label text size
- Maintain touch-friendly size

### Mobile (<768px)
- Compact toggle (icon only optional)
- Minimum 44x44px touch target
- May reduce text labels or hide
- Ensure easy thumb reach at bottom

## Accessibility Considerations

### Semantic HTML

**Switch Variant**:
```html
<div role="group" aria-labelledby="theme-toggle-label">
  <span id="theme-toggle-label" class="sr-only">Theme selection</span>
  <button
    role="switch"
    aria-checked="false"
    aria-label="Switch to dark mode"
    onClick={toggleTheme}
  >
    <span aria-hidden="true">☀️</span>
    <span className="sr-only">Light mode</span>
    <span className="toggle-track">
      <span className="toggle-knob"></span>
    </span>
    <span aria-hidden="true">🌙</span>
    <span className="sr-only">Dark mode</span>
  </button>
</div>
```

**Button Variant**:
```html
<fieldset>
  <legend>Theme</legend>
  <div role="radiogroup" aria-label="Select theme">
    <button
      role="radio"
      aria-checked="true"
      aria-label="Light theme"
    >
      ☀️ Light
    </button>
    <button
      role="radio"
      aria-checked="false"
      aria-label="Dark theme"
    >
      🌙 Dark
    </button>
  </div>
</fieldset>
```

### ARIA Attributes
- **Switch**: `role="switch"`, `aria-checked`
- **Radio**: `role="radio"`, `aria-checked` for button group
- **Select**: Native `<select>` element has built-in accessibility
- **Label**: Clear label for screen readers
- Icons: `aria-hidden="true"` with text alternatives

### Keyboard Navigation
- **Tab**: Focus on toggle control
- **Space/Enter**: Activate toggle
- **Arrow keys**: Navigate between options (button variant)
- Focus indicator clearly visible

### Screen Reader Support
- Announce current theme: "Light mode selected"
- Announce on change: "Switched to dark mode"
- Provide context: "Theme toggle, light mode, switch"
- Button/switch clearly labeled

### Visual Considerations
- High contrast in both themes
- Focus indicators meet WCAG standards
- Don't rely solely on color
- Icons supplement text labels

## Loading States

### Initial Load
- Apply saved theme immediately (before render)
- Avoid flash of wrong theme (FOUC)
- Use inline script or SSR to set initial theme

### Theme Switching
- Instantaneous change
- No loading state needed
- Smooth transition animation (optional)

### System Preference Change
- Detect and apply automatically if "System" selected
- Silent update (no explicit loading state)

## Flash of Unstyled Content (FOUC) Prevention

**Critical inline script** (in `<head>`):
```html
<script>
  (function() {
    const theme = localStorage.getItem('weather-theme-preference') || 'light';
    document.documentElement.classList.add(theme);
  })();
</script>
```

This ensures theme applied before page renders.

## Example Usage

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

function Footer() {
  return (
    <footer>
      <ThemeToggle variant="switch" showLabel />
    </footer>
  );
}
```

### With Theme Hook
```tsx
import { useTheme } from '@/hooks/useTheme';

function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('weather-theme-preference');
    if (saved) {
      setTheme(saved as Theme);
      applyTheme(saved as Theme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('weather-theme-preference', newTheme);
  };

  return { theme, toggleTheme };
}
```

## Edge Cases

1. **localStorage Unavailable**:
   - Gracefully degrade
   - Use session state
   - Default to light mode

2. **Invalid Stored Value**:
   - Validate on load
   - Fallback to default if invalid
   - Reset to light mode

3. **System Preference Changes**:
   - Listen for changes if "System" selected
   - Update automatically
   - Don't override explicit user selection

4. **Mid-Use Theme Change**:
   - User changes OS theme while app open
   - Update if "System" mode selected
   - Ignore if explicit theme selected

5. **Multiple Tabs**:
   - Sync theme across tabs
   - Listen for storage events
   - Update other tabs when theme changes

6. **Print Styles**:
   - Consider light mode for printing
   - Override dark mode for print media query

7. **Accessibility Settings**:
   - Respect `prefers-color-scheme`
   - Respect `prefers-reduced-transparency`
   - Respect `prefers-contrast`

## Theme Implementation

### CSS Variables Approach
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  --border-color: #e5e5e5;
  /* ... more variables */
}

:root.dark {
  --bg-primary: #0a0a0a;
  --text-primary: #ffffff;
  --border-color: #333333;
  /* ... more variables */
}
```

### Tailwind Dark Mode
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class strategy
  // ...
}
```

```html
<html class="dark">
  <!-- Dark mode styles applied -->
</html>
```

## Performance Considerations

- Apply theme before render to prevent FOUC
- Use CSS classes/variables (not inline styles)
- Memoize toggle component
- Debounce system preference listener
- Optimize theme transition animations

## Testing Requirements

- Render in light mode
- Render in dark mode
- Test toggle interaction
- Verify localStorage persistence
- Test with localStorage disabled
- Test system preference detection
- Test system preference change listener
- Test keyboard navigation
- Test with screen reader
- Verify ARIA attributes
- Test focus indicators
- Test in all variants (switch, button, select)
- Test with and without labels
- Test different sizes
- Verify no FOUC on initial load
- Test theme application across all components
- Test with invalid stored values
- Test multi-tab synchronization
- Verify print styles
- Test color contrast in both themes
- Test reduced motion preferences