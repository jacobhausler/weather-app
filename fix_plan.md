# Implementation Plan: Radar Tile + Layout Rearrangement

## Overview

Two changes:
1. **New RadarMap component** — Displays a RainViewer radar overlay on a Leaflet map, centered on the user's weather location
2. **Layout rearrangement** — Two-column layout on desktop: left column stacks CurrentConditions, HourlyForecast, and RadarMap; right column shows 7-Day Forecast vertically

---

## Part 1: RainViewer Radar Tile Component

### 1A. Install Leaflet dependency

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### 1B. Create `src/components/RadarMap.tsx`

**Data flow:**
- Receive `coordinates: { latitude: number; longitude: number }` as a prop (from `weatherData.coordinates`)
- On mount, fetch `https://api.rainviewer.com/public/weather-maps.json` to get available radar frames
- Display a Leaflet map centered on coordinates with:
  - OpenStreetMap base tile layer (dark-themed variant for dark mode)
  - RainViewer radar overlay tile layer using the most recent frame
- Include simple playback controls (play/pause, step forward/back) to animate through the ~12 past radar frames (2 hours of 10-min intervals)
- Tile URL format: `{host}{path}/256/{z}/{x}/{y}/2/1_1.png`
  - `2` = Universal Blue color scheme
  - `1_1` = smooth=1, snow=1
  - Max native zoom: 7, max zoom: 12

**Component structure:**
```
<GlassCard>
  <CardHeader><CardTitle>Radar</CardTitle></CardHeader>
  <CardContent>
    <MapContainer> with TileLayer (base) + TileLayer (radar overlay)
    <div> playback controls: |◀ ▶/⏸ ▶| + timestamp display </div>
  </CardContent>
</GlassCard>
```

**Key implementation details:**
- Use `react-leaflet` `MapContainer`, `TileLayer` components
- Map height: fixed at ~300px within the card
- Default zoom: 7 (shows regional radar well)
- Animation: `setInterval` cycling through `apiData.radar.past` frames at 500ms
- Cache tile layers for smooth animation (swap opacity between 0 and 0.7)
- Add Leaflet CSS import in the component or in `index.css`
- Keep component under 300 lines per project guidelines
- No API key required (RainViewer public API is free)

### 1C. Add Leaflet CSS

Add to `src/index.css`:
```css
@import 'leaflet/dist/leaflet.css';
```

### 1D. Update `src/App.tsx`

- Add lazy import for RadarMap
- Pass `weatherData.coordinates` to RadarMap component
- Render in the new layout (see Part 2)

---

## Part 2: Layout Rearrangement

### Current layout (App.tsx lines 82-120):
```
[Alert Card - full width]
[CurrentConditions | HourlyForecast]  ← md:grid-cols-2
[SevenDayForecast - full width]
```

### New layout:
```
[Alert Card - full width]
[Left Column (2/3)          | Right Column (1/3)        ]
[  CurrentConditions        | SevenDayForecast (vertical)]
[  HourlyForecast           |                            ]
[  RadarMap                 |                            ]
```

**Implementation in App.tsx:**

Replace the current grid + SevenDayForecast sections with:

```tsx
{/* Two-column layout: left stacked tiles, right 7-day forecast */}
<div className="flex flex-col lg:flex-row gap-6">
  {/* Left column - stacked tiles */}
  <div className="flex flex-col gap-6 lg:w-2/3">
    <Suspense fallback={<Skeleton />}>
      <CurrentConditions ... />
    </Suspense>
    <Suspense fallback={<Skeleton />}>
      <HourlyForecast ... />
    </Suspense>
    <Suspense fallback={<Skeleton />}>
      <RadarMap coordinates={weatherData.coordinates} />
    </Suspense>
  </div>

  {/* Right column - 7-day forecast */}
  <div className="lg:w-1/3">
    <Suspense fallback={<Skeleton />}>
      <SevenDayForecast forecast={weatherData.forecast} />
    </Suspense>
  </div>
</div>
```

- Use `lg:` breakpoint (1024px+) for the two-column layout
- Mobile: everything stacks vertically as before
- The `lg:w-2/3` / `lg:w-1/3` split gives the left column more space for charts and radar

### 2B. Modify SevenDayForecast for vertical display

The SevenDayForecast currently uses `flex-col md:flex-row` for its day cards. In the new right-column layout, it should always display vertically since the column is narrow.

**Change in SevenDayForecast.tsx:**
- The existing mobile layout (vertical cards with icon-left, text-right) already works well for the narrow right column
- Remove the `md:flex-row` breakpoint so cards always stack vertically
- Alternatively, use a new breakpoint like `xl:flex-row` or just keep vertical — since the right column is 1/3 width, horizontal layout won't fit
- Remove the horizontal scroll indicator logic (not needed when vertical)
- Consider making the component aware it's in a narrow context, or simply always use the vertical card layout

**Specific changes:**
- Line 161: Change `flex flex-col md:flex-row` → `flex flex-col` (always vertical in new layout)
- Line 172: Remove `md:min-w-[140px]` and `md:w-auto md:flex-col` responsive classes that assume horizontal layout
- The scroll indicator can be removed since vertical layout doesn't overflow horizontally

### 2C. Update loading skeletons

Update the loading skeleton layout in App.tsx to match the new two-column structure.

---

## File Change Summary

| File | Action |
|------|--------|
| `package.json` | Add `leaflet`, `react-leaflet`, `@types/leaflet` |
| `src/index.css` | Add Leaflet CSS import |
| `src/components/RadarMap.tsx` | **New file** — Radar map component |
| `src/App.tsx` | Rearrange layout, add RadarMap lazy import |
| `src/components/SevenDayForecast.tsx` | Make layout always vertical |

---

## Considerations

- **No backend changes needed** — RainViewer API is called directly from the client (free, no auth)
- **Bundle size** — Leaflet adds ~40KB gzipped; consider adding to manual chunk splitting in vite config
- **Rate limiting** — RainViewer has per-minute rate limits on tiles; animation caching mitigates this
- **Dark mode** — Use a dark base map tile provider (e.g., CartoDB Dark Matter) when dark mode is active
- **Mobile** — On mobile, all tiles stack vertically as before; radar map is touch-friendly via Leaflet
