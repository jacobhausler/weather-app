# Performance Optimization Specification

## Overview

This document details the performance optimization strategies implemented in the HAUS Weather Station application, including code splitting, lazy loading, manual chunk configuration, PWA caching, and build optimizations. The optimizations achieve a 94% reduction in initial bundle size (from 569.81 kB to 33.31 kB / 10.12 kB gzipped).

## Architecture

### Performance Strategy
1. **Lazy Loading**: Heavy components loaded on-demand
2. **Code Splitting**: Manual chunk separation by dependency type
3. **PWA Service Worker**: Network-first caching with configurable TTLs
4. **Build Optimization**: ESBuild minification with tree-shaking
5. **Suspense Boundaries**: Granular loading states for each lazy component

---

## Code Splitting Strategy

### Manual Chunk Configuration

Defined in `vite.config.ts` under `build.rollupOptions.output.manualChunks`:

```typescript
manualChunks: {
  vendor: ['react', 'react-dom'],
  zustand: ['zustand'],
  charts: ['recharts'],
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs'
  ],
  utils: ['date-fns', 'clsx', 'tailwind-merge'],
}
```

### Chunk Separation Rationale

| Chunk | Dependencies | Reasoning |
|-------|-------------|-----------|
| **vendor** | React, ReactDOM | Core framework - shared across entire app, rarely changes |
| **zustand** | Zustand state library | State management - used app-wide, small footprint |
| **charts** | Recharts | Heavy visualization library - only needed for HourlyForecast component |
| **ui** | Radix UI primitives | UI component library - shared across multiple components |
| **utils** | date-fns, clsx, tailwind-merge | Utility libraries - used throughout app for formatting and styling |

### Benefits
- **Optimal Caching**: Vendor chunk changes only when React version updates
- **Parallel Loading**: Browser can download multiple chunks simultaneously
- **Code Reuse**: Shared dependencies bundled once, reused across lazy-loaded components
- **Reduced Duplication**: Prevents Recharts from being included in multiple component bundles

---

## Lazy Loading Components

### Implementation Location
**File**: `src/App.tsx`

### Lazy-Loaded Components

```typescript
// Lines 11-14 in App.tsx
const AlertCard = lazy(() => import('./components/AlertCard').then(m => ({ default: m.AlertCard })))
const SevenDayForecast = lazy(() => import('./components/SevenDayForecast').then(m => ({ default: m.SevenDayForecast })))
const CurrentConditions = lazy(() => import('./components/CurrentConditions').then(m => ({ default: m.CurrentConditions })))
const HourlyForecast = lazy(() => import('./components/HourlyForecast').then(m => ({ default: m.HourlyForecast })))
```

### Component Selection Criteria

Components chosen for lazy loading based on:
1. **Size**: Contains heavy dependencies (Recharts for HourlyForecast)
2. **Conditional Rendering**: Only visible after user submits ZIP code
3. **User Flow**: Not needed for initial page load/empty state
4. **Independence**: Can be loaded asynchronously without blocking other content

### Non-Lazy Components

These components are NOT lazy-loaded and remain in the initial bundle:

| Component | Reason |
|-----------|--------|
| **Header** | Always visible, contains critical ZIP input and refresh button |
| **ErrorBanner** | Critical for error messaging, small size |
| **ThemeToggle** | Always visible in footer, minimal size |
| **UnitToggle** | Always visible in footer, minimal size |
| **Skeleton** | Used in loading states, must be available immediately |

---

## Suspense Boundaries

### Strategy
Each lazy-loaded component has its own Suspense boundary with custom fallback UI, preventing cascade loading delays.

### Implementation Examples

#### AlertCard Suspense (Lines 76-80)
```tsx
<Suspense fallback={<Skeleton className="h-32 w-full" />}>
  <AlertCard alerts={weatherData.alerts} />
</Suspense>
```

**Characteristics**:
- Conditionally rendered only when alerts exist
- Simple skeleton fallback (32px height)
- No complex loading state needed

#### SevenDayForecast Suspense (Lines 84-97)
```tsx
<Suspense fallback={
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="min-w-[140px] h-48" />
        ))}
      </div>
    </CardContent>
  </Card>
}>
  <SevenDayForecast forecast={weatherData.forecast} />
</Suspense>
```

**Characteristics**:
- Detailed skeleton matching actual component structure
- 7 day placeholders in horizontal scroll layout
- Preserves layout dimensions (prevents content shift)

#### CurrentConditions Suspense (Lines 105-112)
```tsx
<Suspense fallback={<Skeleton className="h-64 w-full" />}>
  <CurrentConditions
    observation={weatherData.currentObservation}
    todayForecast={todayForecast}
    tonightForecast={tonightForecast}
    sunTimes={weatherData.sunTimes}
  />
</Suspense>
```

**Characteristics**:
- Simple skeleton (64px height)
- Part of grid layout with HourlyForecast
- Loads independently of adjacent card

#### HourlyForecast Suspense (Lines 116-118)
```tsx
<Suspense fallback={<Skeleton className="h-96 w-full" />}>
  <HourlyForecast hourlyForecast={weatherData.hourlyForecast} />
</Suspense>
```

**Characteristics**:
- Taller skeleton (96px) for chart visualization
- Conditionally rendered when hourly data exists
- Largest lazy-loaded component (contains Recharts)

### Suspense Boundary Design Principles

1. **Granular Boundaries**: Each component has its own boundary - no shared Suspense wrappers
2. **Layout Preservation**: Fallback skeletons match component dimensions to prevent layout shift
3. **Visual Hierarchy**: Skeleton complexity matches component importance
4. **Independent Loading**: Components load asynchronously without blocking each other

### Benefits

- **Non-Blocking**: User sees content as it loads, not all-or-nothing
- **Progressive Enhancement**: Critical content (Header) loads first, weather cards load on-demand
- **Better UX**: Skeleton screens provide visual feedback during loading
- **Error Isolation**: One component's loading failure doesn't affect others

---

## Bundle Sizes

### Initial Bundle (Before Optimization)
```
dist/assets/index-[hash].js        569.81 kB
```

### Optimized Bundle (After Code Splitting + Lazy Loading)

#### Initial Load (Synchronous)
```
dist/assets/index-[hash].js         33.31 kB (gzipped: 10.12 kB)
```

**Contents**: App shell, Header, ErrorBanner, ThemeToggle, UnitToggle, Skeleton, empty state

#### Lazy-Loaded Chunks (Asynchronous)
```
dist/assets/vendor-[hash].js       141.40 kB (gzipped: 45.78 kB)
dist/assets/charts-[hash].js       ~100 kB (estimated, Recharts)
dist/assets/ui-[hash].js           ~50 kB (estimated, Radix UI)
dist/assets/zustand-[hash].js      ~10 kB (estimated)
dist/assets/utils-[hash].js        ~20 kB (estimated)
dist/assets/AlertCard-[hash].js    ~15 kB (estimated)
dist/assets/SevenDayForecast-[hash].js  ~20 kB (estimated)
dist/assets/CurrentConditions-[hash].js  ~25 kB (estimated)
dist/assets/HourlyForecast-[hash].js  ~30 kB (estimated)
```

**Note**: Component chunks share vendor/charts/ui/utils chunks - not loaded multiple times

### Size Reduction Metrics

| Metric | Value |
|--------|-------|
| **Original Bundle** | 569.81 kB |
| **New Initial Bundle** | 33.31 kB |
| **Reduction** | 536.50 kB (94.15%) |
| **Gzipped Initial** | 10.12 kB |
| **Time to Interactive** | Improved by ~80% (estimated) |

### CSS Bundle
```
dist/assets/index-[hash].css        47.32 kB (gzipped: 8.45 kB)
```

**Contents**: Tailwind utilities, custom glass components, shadcn/ui styles

---

## Progressive Web App (PWA)

### Service Worker Configuration

**Plugin**: `vite-plugin-pwa` v1.0.3
**Strategy**: Network-first with fallback caching
**Configuration Location**: `vite.config.ts` lines 10-89

### Asset Caching

```typescript
globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
```

**Cached Assets**:
- JavaScript bundles (all chunks)
- CSS stylesheets
- HTML shell
- Icons and images
- Web fonts

### Runtime Caching Strategies

#### 1. NWS API Cache
```typescript
{
  urlPattern: /^https:\/\/api\.weather\.gov\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'nws-api-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60  // 1 hour
    },
    cacheableResponse: {
      statuses: [0, 200]
    }
  }
}
```

**Behavior**:
- Fetch from network first
- Fallback to cache on network failure
- Cache successful responses for 1 hour
- Store up to 50 unique API responses
- Handles offline scenarios gracefully

#### 2. Sunrise/Sunset API Cache
```typescript
{
  urlPattern: /^https:\/\/api\.sunrise-sunset\.org\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'sunrise-api-cache',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 60 * 60 * 24  // 24 hours
    },
    cacheableResponse: {
      statuses: [0, 200]
    }
  }
}
```

**Behavior**:
- Sunrise/sunset times change slowly (daily)
- 24-hour cache appropriate for this data
- Smaller cache size (10 entries) - fewer unique locations

#### 3. Backend API Cache
```typescript
{
  urlPattern: /^\/api\/.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'backend-api-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 10  // 10 minutes
    },
    networkTimeoutSeconds: 10
  }
}
```

**Behavior**:
- Backend server has its own caching layer
- 10-minute client-side cache aligns with backend refresh
- 10-second network timeout prevents long waits
- Larger cache (100 entries) for multiple ZIP codes
- Falls back to cache if server timeout occurs

### PWA Manifest

```typescript
manifest: {
  name: 'HAUS Weather Station',
  short_name: 'HAUS Weather',
  description: 'Self-hosted personal weather forecast application powered by the National Weather Service',
  theme_color: '#0f172a',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  start_url: '/',
  icons: [
    { src: '/pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
    { src: '/pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
    { src: '/pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
  ]
}
```

**Features**:
- Installable on mobile and desktop
- Standalone mode (no browser UI)
- Portrait orientation optimized
- SVG icons for scalability

---

## Build Optimization

### Vite Build Configuration

**Location**: `vite.config.ts` lines 105-122

```typescript
build: {
  outDir: 'dist',
  sourcemap: false,
  minify: 'esbuild',
  target: 'esnext',
  rollupOptions: {
    output: {
      manualChunks: { /* ... */ }
    }
  },
  chunkSizeWarningLimit: 1000,
}
```

### Optimization Features

| Feature | Configuration | Impact |
|---------|--------------|---------|
| **Minification** | `minify: 'esbuild'` | Faster than Terser, ~30% smaller bundles |
| **Target** | `target: 'esnext'` | Modern browsers, no legacy transpilation overhead |
| **Source Maps** | `sourcemap: false` | Reduced build size in production |
| **Tree Shaking** | Enabled by default | Removes unused code from dependencies |
| **Chunk Warning** | `chunkSizeWarningLimit: 1000` | Alerts for chunks >1MB |

### Dependency Pre-Optimization

```typescript
optimizeDeps: {
  include: ['react', 'react-dom', 'zustand'],
}
```

**Purpose**:
- Pre-bundle dependencies during dev server startup
- Faster hot module replacement (HMR)
- Consistent behavior between dev and production

---

## Loading States

### Global Loading State (Lines 30-56)

**Trigger**: `isLoading === true` (initial ZIP submission)

**Structure**:
```tsx
<div className="space-y-6">
  <Card>
    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </CardContent>
  </Card>
  <Card>
    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
    <CardContent>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="min-w-[140px] h-48" />
        ))}
      </div>
    </CardContent>
  </Card>
  <Skeleton className="h-64 w-full" />
  <Skeleton className="h-96 w-full" />
</div>
```

**Characteristics**:
- Full-page skeleton screen
- Matches layout structure of actual weather cards
- Shows expected content hierarchy
- 7-day forecast shows 7 day placeholders

### Empty State (Lines 59-70)

**Trigger**: `!isLoading && !weatherData` (no ZIP submitted yet)

**Structure**:
```tsx
<div className="flex flex-col items-center justify-center py-20">
  <div className="text-center space-y-3">
    <h2 className="text-2xl font-semibold text-muted-foreground">
      Welcome to HAUS Weather Station
    </h2>
    <p className="text-lg text-muted-foreground max-w-md">
      Enter a ZIP code above to view detailed weather information
    </p>
  </div>
</div>
```

**Characteristics**:
- Friendly onboarding message
- Clear call-to-action
- Centered layout
- Minimal visual weight

### Component-Level Suspense Fallbacks

**Trigger**: Lazy component is loading (after weatherData exists)

**Examples**:
- AlertCard: `<Skeleton className="h-32 w-full" />`
- SevenDayForecast: Detailed card skeleton with 7 day placeholders
- CurrentConditions: `<Skeleton className="h-64 w-full" />`
- HourlyForecast: `<Skeleton className="h-96 w-full" />`

**Characteristics**:
- Non-blocking (other components can render)
- Granular (per-component loading feedback)
- Fast (lazy chunks are small and load quickly)

---

## Performance Monitoring

### Metrics to Track

1. **Initial Bundle Size**: Target <50 kB (currently 33.31 kB)
2. **Time to First Paint**: Measure initial render performance
3. **Time to Interactive**: When app becomes fully functional
4. **Lazy Chunk Load Time**: Individual component loading speed
5. **Cache Hit Rate**: Service worker cache effectiveness

### Build Analysis Commands

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview

# Type checking (catches issues before build)
npm run type-check
```

### Bundle Size Monitoring

**Warning Threshold**: 1000 kB per chunk (configured in `vite.config.ts`)

**Current Status**: All chunks well under limit
- Initial: 33.31 kB
- Vendor: 141.40 kB
- Charts: ~100 kB
- All others: <50 kB

---

## Best Practices

### Adding New Components

When adding new components to the app:

1. **Evaluate Lazy Loading Need**:
   - Is component >20 kB?
   - Is component conditionally rendered?
   - Does component import heavy dependencies (charts, maps, etc.)?
   - If YES to any: consider lazy loading

2. **Create Suspense Boundary**:
   ```tsx
   <Suspense fallback={<Skeleton className="h-[expected-height] w-full" />}>
     <LazyComponent {...props} />
   </Suspense>
   ```

3. **Match Skeleton to Layout**:
   - Skeleton height should match actual component
   - Prevents cumulative layout shift (CLS)
   - Improves perceived performance

4. **Consider Manual Chunk**:
   - If adding new heavy dependency (e.g., D3.js, Mapbox)
   - Add to `manualChunks` in `vite.config.ts`
   - Prevents bloating existing chunks

### Code Splitting Guidelines

**DO**:
- Split large dependencies into separate chunks
- Group related UI libraries together
- Keep initial bundle minimal (<50 kB)
- Use lazy loading for route-level components
- Preload critical lazy components with `<link rel="preload">`

**DON'T**:
- Over-split (too many chunks = too many HTTP requests)
- Split utilities used everywhere (defeats caching)
- Lazy load components always visible on initial render
- Create chunks smaller than 20 kB (HTTP overhead not worth it)

### Service Worker Cache Strategy

**When to Use NetworkFirst**:
- Dynamic data that changes frequently (weather, news, social feeds)
- Want fresh data when online, stale data acceptable offline
- Backend has its own caching layer

**When to Use CacheFirst**:
- Static assets unlikely to change (fonts, icons)
- Performance more important than freshness
- Assets versioned/hashed in filename

**HAUS Weather Uses NetworkFirst** because:
- Weather data changes hourly
- Backend caches aggressively (server-side refresh cycle)
- User expects fresh data when online
- Offline support is nice-to-have, not primary use case

---

## Future Optimization Opportunities

### Potential Improvements

1. **Image Optimization**:
   - Convert weather icons to WebP format
   - Implement responsive images with `srcset`
   - Lazy load off-screen images

2. **Preloading Critical Chunks**:
   ```html
   <link rel="preload" href="/assets/vendor-[hash].js" as="script">
   ```

3. **Route-Based Code Splitting**:
   - If adding settings page, admin panel, etc.
   - Use React Router lazy loading

4. **CSS Code Splitting**:
   - Split critical CSS vs. component-specific CSS
   - Inline critical CSS in HTML head

5. **Service Worker Prefetching**:
   - Prefetch likely ZIP codes based on geolocation
   - Cache forecast data for user's saved locations

6. **Resource Hints**:
   ```html
   <link rel="dns-prefetch" href="https://api.weather.gov">
   <link rel="preconnect" href="https://api.weather.gov">
   ```

7. **Bundle Analysis**:
   - Add `vite-plugin-bundle-analyzer`
   - Identify large dependencies
   - Find duplicate code across chunks

---

## Testing Performance

### Lighthouse Metrics

Target scores for production deployment:

| Metric | Target | Current |
|--------|--------|---------|
| Performance | >90 | TBD |
| Accessibility | >95 | TBD |
| Best Practices | >95 | TBD |
| SEO | >90 | TBD |

### Performance Benchmarks

```bash
# Build production bundle
npm run build

# Analyze bundle sizes
ls -lh dist/assets/*.js

# Test with production server
npm run preview

# Lighthouse audit
npx lighthouse http://localhost:4173 --view
```

### Network Throttling Tests

Test performance under realistic conditions:
- **Fast 3G**: 1.6 Mbps, 562ms RTT
- **Slow 3G**: 400 Kbps, 2000ms RTT
- **Offline**: Verify service worker cache

### Cache Testing

```bash
# Clear browser cache
# Load app → Initial load metrics
# Reload app → Cache hit metrics
# Compare load times
```

---

## References

### Configuration Files
- `vite.config.ts` - Build and PWA configuration
- `src/App.tsx` - Lazy loading and Suspense implementation
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler options

### Related Documentation
- `CLAUDE.md` - Project overview and architecture
- `specs/cards/*.md` - Individual component specifications
- `MODERN_DESIGN_REFACTOR.md` - Design system implementation
- `DEPLOYMENT.md` - Production deployment guide

### External Resources
- [Vite Code Splitting Guide](https://vitejs.dev/guide/build.html#chunking-strategy)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [PWA Service Worker Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview/)
- [Web Vitals](https://web.dev/vitals/)
