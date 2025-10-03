# useLocalStorage Hook Specification

## Overview

`useLocalStorage` is a type-safe React hook that provides persistent state management using the browser's localStorage API. It offers a `useState`-like interface with automatic synchronization across browser tabs and SSR compatibility.

## Purpose

The hook enables components to persist state across page reloads and browser sessions while maintaining React's declarative state management patterns. It abstracts away the complexity of localStorage interaction, error handling, and cross-tab synchronization.

## Location

- **File**: `src/hooks/useLocalStorage.ts`
- **Export**: Named export `useLocalStorage`

## Type Safety

### Generic Type Parameter

```typescript
function useLocalStorage<T>(key: string, initialValue: T)
```

The hook is fully type-safe using TypeScript generics:
- `T` - The type of value being stored
- Type inference from `initialValue` parameter
- Return type: `readonly [T, (value: T | ((val: T) => T)) => void, () => void]`

### Type Constraints

- Values must be JSON-serializable (objects, arrays, primitives)
- Functions and symbols cannot be stored
- Circular references will cause serialization errors

## API

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Unique localStorage key identifier |
| `initialValue` | `T` | Default value when no stored value exists |

### Return Value

Returns a tuple with three elements:

```typescript
const [storedValue, setValue, removeValue] = useLocalStorage(key, initialValue)
```

1. **`storedValue`** (`T`): Current value from localStorage or initial value
2. **`setValue`** (`(value: T | ((val: T) => T)) => void`): Function to update the stored value
3. **`removeValue`** (`() => void`): Function to remove the value from localStorage

### setValue Function

Supports two usage patterns (matching `useState` API):

```typescript
// Direct value
setValue(newValue)

// Functional update
setValue((currentValue) => newValue)
```

## SSR Support

### Implementation

The hook safely handles server-side rendering environments where `window` is undefined:

```typescript
const isClient = typeof window !== 'undefined'
```

### Behavior

- **Server-side**: Returns `initialValue` without attempting localStorage access
- **Client-side**: Reads from localStorage and hydrates state
- **Console warnings**: Logs warnings when localStorage operations are attempted in non-client environments

### Usage in SSR Frameworks

Compatible with:
- Next.js (Pages Router and App Router)
- Remix
- Gatsby
- Any React SSR framework

## Cross-Tab Synchronization

### Storage Event Listener

The hook automatically synchronizes state across browser tabs and windows:

```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === key && e.newValue !== null) {
      setStoredValue(JSON.parse(e.newValue))
    }
  }

  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [key, isClient])
```

### Synchronization Behavior

- **Trigger**: Changes in one tab automatically update other tabs
- **Event**: Uses native `storage` event from localStorage
- **Scope**: Only updates when the specific `key` changes
- **Null handling**: Ignores removal events (handled separately via `removeValue`)

### Limitations

- Same-tab updates do NOT trigger storage event (browser limitation)
- Only works for same-origin tabs
- Requires browser support for storage events

## Error Handling

### Strategy

Graceful degradation with console warnings:

1. **Read errors**: Return `initialValue` and warn
2. **Write errors**: State update fails silently with warning
3. **Parse errors**: Fall back to `initialValue` and warn
4. **Remove errors**: Operation fails with warning

### Error Scenarios

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| localStorage full (quota exceeded) | Console warning | State not persisted |
| JSON parse error (corrupted data) | Return `initialValue` | Data loss, uses default |
| localStorage disabled/blocked | Console warning | No persistence |
| Invalid JSON in storage event | Warning, no state update | Tab sync fails |
| SSR environment | Console warning | Uses initial value only |

### Security Considerations

- No sensitive data validation (caller responsibility)
- No encryption (localStorage is plain text)
- Subject to XSS attacks (standard web security concerns)

## Usage Examples

### Basic Usage

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage'

function UserPreferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  )
}
```

### Complex Object Storage

```typescript
interface UserSettings {
  notifications: boolean
  language: string
  fontSize: number
}

function Settings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', {
    notifications: true,
    language: 'en',
    fontSize: 16
  })

  const toggleNotifications = () => {
    setSettings(prev => ({ ...prev, notifications: !prev.notifications }))
  }

  return (
    <div>
      <input
        type="checkbox"
        checked={settings.notifications}
        onChange={toggleNotifications}
      />
    </div>
  )
}
```

### Array Storage

```typescript
function RecentSearches() {
  const [searches, setSearches, removeSearches] = useLocalStorage<string[]>(
    'recentSearches',
    []
  )

  const addSearch = (query: string) => {
    setSearches(prev => [query, ...prev].slice(0, 10)) // Keep last 10
  }

  const clearHistory = () => {
    removeSearches()
  }

  return (
    <div>
      <ul>
        {searches.map(search => <li key={search}>{search}</li>)}
      </ul>
      <button onClick={clearHistory}>Clear History</button>
    </div>
  )
}
```

### Weather App Usage

Current usage in the weather app:

```typescript
// ZIP code history
const [zipHistory, setZipHistory] = useLocalStorage<string[]>('zipHistory', [])

// Theme preference
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')

// Unit system
const [units, setUnits] = useLocalStorage<'imperial' | 'metric'>('units', 'imperial')
```

## Implementation Details

### Initialization

State is initialized lazily using a function:

```typescript
const [storedValue, setStoredValue] = useState<T>(() => {
  if (!isClient) return initialValue

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error)
    return initialValue
  }
})
```

**Benefits:**
- Runs only once on mount
- Avoids unnecessary reads on every render
- SSR-safe initialization

### Memoization

Both `setValue` and `removeValue` are memoized with `useCallback`:

```typescript
const setValue = useCallback((value: T | ((val: T) => T)) => {
  // implementation
}, [key, storedValue, isClient])

const removeValue = useCallback(() => {
  // implementation
}, [key, initialValue, isClient])
```

**Benefits:**
- Stable function references
- Prevents unnecessary re-renders in child components
- Safe to use in dependency arrays

### JSON Serialization

All values are serialized/deserialized using `JSON.stringify`/`JSON.parse`:

**Supported types:**
- Primitives (string, number, boolean, null)
- Objects
- Arrays
- Nested structures

**Unsupported types:**
- Functions
- Symbols
- undefined (converted to null)
- Circular references
- Class instances (converted to plain objects)

## Performance Considerations

### Read Performance

- **Initial read**: One synchronous localStorage read on mount
- **Subsequent renders**: No additional reads (uses React state)
- **Tab sync**: Event listener updates state only when key matches

### Write Performance

- **Synchronous operation**: localStorage writes block the main thread
- **JSON serialization**: Performance depends on object size
- **Recommendation**: Avoid storing very large objects (>100KB)

### Memory

- **Event listener**: One global storage event listener per hook instance
- **Cleanup**: Listeners properly removed on unmount
- **State duplication**: Value stored in both React state and localStorage

## Testing Considerations

### Mock localStorage

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock as any
```

### Test Scenarios

1. Initial value returned when localStorage is empty
2. Stored value returned when localStorage has data
3. setValue updates both state and localStorage
4. removeValue clears localStorage and resets to initial value
5. SSR environment returns initial value without errors
6. Storage event updates state in other tabs
7. Error handling for quota exceeded
8. Error handling for JSON parse failures

## Browser Compatibility

### localStorage Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ IE 11 (legacy support)

### Storage Event Support

- ✅ All modern browsers
- ⚠️ IE 11 (limited support, some edge cases)

### Quota Limits

- **Desktop browsers**: 5-10 MB
- **Mobile browsers**: 5 MB
- **Private/Incognito**: May be restricted or unavailable

## Migration Notes

### From useState to useLocalStorage

```typescript
// Before
const [theme, setTheme] = useState('light')

// After
const [theme, setTheme] = useLocalStorage('theme', 'light')
// Add removeTheme if needed:
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light')
```

### Key Naming Conventions

**Recommendations:**
- Use descriptive, namespaced keys: `weatherApp:theme`
- Avoid key collisions with other apps on same domain
- Use consistent casing (camelCase or kebab-case)

### Data Migration

When changing data structure:

```typescript
const [settings, setSettings] = useLocalStorage('settings', defaultSettings)

useEffect(() => {
  // Migrate old structure to new
  if (settings.oldField !== undefined) {
    setSettings({
      ...settings,
      newField: settings.oldField,
      oldField: undefined
    })
  }
}, [])
```

## Related Hooks

- **useSessionStorage**: Similar API but uses sessionStorage (data cleared on tab close)
- **usePersistedState**: Alternative with additional features (expiration, versioning)
- **zustand persist middleware**: For global state persistence

## Future Enhancements

Potential improvements:

1. **Event emitter**: Notify same-tab components of changes
2. **Versioning**: Handle schema migrations automatically
3. **Compression**: Reduce storage footprint for large objects
4. **Encryption**: Built-in encryption for sensitive data
5. **Expiration**: TTL for stored values
6. **IndexedDB fallback**: For larger data storage needs
7. **Validation**: Schema validation with Zod or similar

## Dependencies

- React (useState, useEffect, useCallback)
- No external dependencies

## Changelog

**Current Version**: 1.0.0

- Initial implementation with full TypeScript support
- SSR compatibility
- Cross-tab synchronization
- Error handling with graceful degradation
- Triple return value (value, setter, remover)
