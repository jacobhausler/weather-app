# useTheme Hook Specification

## Overview

The `useTheme` hook provides comprehensive theme management for the HAUS Weather application, including system theme detection, manual theme selection, and automatic synchronization with OS-level appearance preferences.

**Location**: `src/hooks/useTheme.ts`

## Dependencies

- **Zustand Store**: `useThemeStore` from `src/stores/themeStore.ts`
- **React Hooks**: `useEffect`

## Type Definitions

```typescript
type Theme = 'light' | 'dark' | 'system'
```

## Core Functionality

### 1. System Theme Detection

The hook detects the user's OS-level theme preference using the `prefers-color-scheme` media query.

**Implementation**:
- Uses `window.matchMedia('(prefers-color-scheme: dark)')` to query system preference
- Returns `'dark'` if system prefers dark mode, `'light'` otherwise
- Includes fallback to `'light'` when `window.matchMedia` is unavailable (SSR safety)

**Function**: `getResolvedTheme(theme: Theme): 'light' | 'dark'`
- Resolves `'system'` to actual theme based on OS preference
- Returns `'light'` or `'dark'` directly if not set to `'system'`

### 2. Theme Resolution Logic

**Workflow**:
1. Check current theme setting from Zustand store
2. If theme is `'system'`, query OS preference via media query
3. If theme is `'light'` or `'dark'`, use that value directly
4. Apply resolved theme to document root element

**DOM Application**:
- Removes both `'light'` and `'dark'` classes from `document.documentElement`
- Adds the resolved theme class to root element
- Sets `root.style.colorScheme` to enable native browser element theming

### 3. Dynamic System Theme Monitoring

When theme is set to `'system'`, the hook actively listens for OS-level theme changes.

**Implementation**:
- Creates event listener on `prefers-color-scheme` media query
- Updates DOM immediately when system theme changes (no re-render required)
- Includes legacy browser support with `addListener`/`removeListener` fallback
- Properly cleans up listeners when component unmounts or theme changes away from `'system'`

**Event Handler**: `handleChange(e: MediaQueryListEvent)`
- Triggered when OS theme preference changes
- Directly updates `document.documentElement` classes
- Updates `colorScheme` style property

### 4. Theme Toggle Functionality

**Cycle Pattern**: `light → dark → system → light → ...`

```typescript
toggleTheme(): void
```

The toggle function cycles through three states:
- **From `'light'`**: Sets to `'dark'`
- **From `'dark'`**: Sets to `'system'`
- **From `'system'`**: Sets to `'light'`

This allows users to:
1. Manually choose light mode
2. Manually choose dark mode
3. Defer to system preference (auto-adjust)

## Return Interface

```typescript
{
  theme: Theme                    // Current theme setting ('light' | 'dark' | 'system')
  resolvedTheme: 'light' | 'dark' // Actual applied theme (resolves 'system')
  setTheme: (theme: Theme) => void // Directly set theme
  toggleTheme: () => void          // Cycle through theme options
}
```

## State Persistence

Theme preference is persisted to localStorage via Zustand's persist middleware:
- **Storage Key**: `'theme-storage'`
- **Default Value**: `'system'`
- **Location**: `src/stores/themeStore.ts`

## Effects

### Effect 1: Theme Application
**Trigger**: When `theme` changes
**Actions**:
1. Remove existing theme classes from root element
2. Resolve theme to `'light'` or `'dark'`
3. Add resolved theme class to root
4. Update `colorScheme` style property

### Effect 2: System Theme Listener
**Trigger**: When `theme` changes
**Conditional**: Only active when `theme === 'system'`
**Actions**:
1. Create media query listener for `prefers-color-scheme`
2. Register change handler
3. Clean up listener on unmount or when theme changes

## Usage Examples

### Basic Usage

```typescript
import { useTheme } from '@/hooks/useTheme'

function MyComponent() {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  return (
    <div>
      <p>Current setting: {theme}</p>
      <p>Applied theme: {resolvedTheme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

### Direct Theme Selection

```typescript
import { useTheme } from '@/hooks/useTheme'

function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
      <p>Current: {theme}</p>
    </div>
  )
}
```

### Icon Display Based on Theme

```typescript
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

function ThemeIcon() {
  const { resolvedTheme } = useTheme()

  return resolvedTheme === 'dark' ? <Moon /> : <Sun />
}
```

### Conditional Styling

```typescript
import { useTheme } from '@/hooks/useTheme'

function StyledComponent() {
  const { resolvedTheme } = useTheme()

  return (
    <div className={resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      Content
    </div>
  )
}
```

## Real-World Implementation

### ThemeToggle Component

The `ThemeToggle` component (`src/components/ThemeToggle.tsx`) demonstrates production usage, though it currently uses `useThemeStore` directly rather than `useTheme` hook. The component could be simplified by using the hook:

**Current Implementation** (uses store directly):
- Manually implements theme resolution logic
- Manually sets up system theme listeners
- Toggles only between `'light'` and `'dark'` (no system option)

**Potential Refactor** (using useTheme hook):
```typescript
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button onClick={toggleTheme}>
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
```

## Browser Compatibility

- **Modern Browsers**: Uses `addEventListener`/`removeEventListener` for media query
- **Legacy Browsers**: Falls back to `addListener`/`removeListener`
- **SSR Safety**: Checks for `window` existence before accessing `matchMedia`
- **Default Fallback**: Returns `'light'` if media query API unavailable

## CSS Integration

The hook applies theme via CSS classes on `document.documentElement`:
- **Class Names**: `'light'` or `'dark'`
- **CSS Variable Scope**: Root-level theme-specific variables
- **Color Scheme Property**: `colorScheme` style property for native elements

Example CSS structure:
```css
:root.light {
  --background: white;
  --foreground: black;
}

:root.dark {
  --background: black;
  --foreground: white;
}
```

## Testing Considerations

- **System Theme Simulation**: Mock `window.matchMedia` return values
- **Theme Persistence**: Mock localStorage or use Zustand's persist testing utilities
- **Effect Cleanup**: Verify listeners are removed on unmount
- **Toggle Cycle**: Test full `light → dark → system → light` cycle

## Performance Notes

- **Direct DOM Manipulation**: Theme changes update DOM directly without React re-render overhead
- **Conditional Listener**: System theme listener only active when needed
- **Cleanup**: Proper effect cleanup prevents memory leaks
- **No Flash**: Initial theme applied before first paint via store default

## Future Enhancements

- **Custom Theme Support**: Extend beyond light/dark to support custom color schemes
- **Transition Animations**: Add smooth transitions between theme changes
- **Per-Component Overrides**: Allow individual components to override global theme
- **Time-Based Auto-Switch**: Automatically switch themes based on time of day
