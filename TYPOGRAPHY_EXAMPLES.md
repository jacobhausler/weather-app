# Typography System - Visual Examples

This document provides copy-paste examples of the typography system in action.

## 1. Temperature Displays

### Large Current Temperature
```tsx
<div className="text-6xl font-black tabular-nums bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
  72°F
</div>
```

### With Feels Like
```tsx
<div className="space-y-1.5">
  <div className="text-6xl font-black tabular-nums text-gradient-primary">
    72°F
  </div>
  <div className="text-sm font-medium text-muted-foreground/80">
    Feels like <span className="font-semibold text-foreground/70">75°F</span>
  </div>
</div>
```

### High/Low with Color Gradients
```tsx
<div className="flex gap-3">
  {/* High */}
  <div className="flex-1 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 px-4 py-3">
    <div className="label-text">High</div>
    <div className="text-2xl font-bold tabular-nums text-gradient-warm">
      82°F
    </div>
  </div>

  {/* Low */}
  <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 px-4 py-3">
    <div className="label-text">Low</div>
    <div className="text-2xl font-bold tabular-nums text-gradient-cool">
      65°F
    </div>
  </div>
</div>
```

### Temperature with Icon
```tsx
<div className="flex items-center gap-5">
  <img src={iconUrl} alt="" className="h-24 w-24" />
  <div className="temp-display">72°F</div>
</div>
```

## 2. Headers and Titles

### Main App Header
```tsx
<h1 className="header-text text-shadow-soft">
  HAUS Weather Station
</h1>
```

### Card Title with Gradient
```tsx
<h2 className="card-title-gradient">
  Current Conditions
</h2>
```

### Section Header
```tsx
<h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
  Hourly Forecast
</h3>
```

### Animated Hero Text
```tsx
<h1 className="text-hero text-glow">
  Welcome to Weather
</h1>
```

## 3. Weather Descriptions

### Short Forecast
```tsx
<div className="weather-description">
  Partly cloudy with a chance of rain
</div>
```

### Detailed Forecast
```tsx
<div className="rounded-xl bg-muted/40 p-4">
  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 mb-2">
    Forecast
  </h3>
  <p className="text-body-elegant text-muted-foreground/90">
    Partly cloudy throughout the day with scattered showers expected in the evening.
    High of 78°F with winds from the northwest at 10-15 mph.
  </p>
</div>
```

## 4. Time Displays

### Simple Time
```tsx
<time className="time-display">7:30 AM</time>
```

### Sunrise/Sunset
```tsx
<div className="flex gap-4">
  <div>
    <div className="label-text">Sunrise</div>
    <time className="time-display text-orange-600">6:45 AM</time>
  </div>
  <div>
    <div className="label-text">Sunset</div>
    <time className="time-display text-indigo-600">7:32 PM</time>
  </div>
</div>
```

## 5. Metric Displays

### Label with Value
```tsx
<div className="space-y-1">
  <div className="label-text">Humidity</div>
  <div className="metric-value">65%</div>
</div>
```

### Metric Card
```tsx
<div className="rounded-xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-3.5">
  <div className="flex items-center gap-2.5">
    <Droplets className="h-4 w-4 text-blue-600" />
    <div className="flex-1">
      <div className="label-text">Humidity</div>
      <div className="metric-value">65%</div>
    </div>
  </div>
</div>
```

### Multiple Metrics Grid
```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="rounded-xl bg-amber-500/10 p-3">
    <div className="label-text">Dewpoint</div>
    <div className="metric-value">58°F</div>
  </div>

  <div className="rounded-xl bg-blue-500/10 p-3">
    <div className="label-text">Humidity</div>
    <div className="metric-value">65%</div>
  </div>

  <div className="rounded-xl bg-emerald-500/10 p-3">
    <div className="label-text">Wind</div>
    <div className="metric-value">NW 12 mph</div>
  </div>

  <div className="rounded-xl bg-purple-500/10 p-3">
    <div className="label-text">Visibility</div>
    <div className="metric-value">10.0 mi</div>
  </div>
</div>
```

## 6. Day Forecast Cards

### Single Day Card
```tsx
<button className="group rounded-2xl border bg-gradient-to-br from-card/80 to-card/60 p-5 transition-all hover:scale-[1.02]">
  <div className="space-y-3">
    {/* Day Name */}
    <div className="text-sm font-bold uppercase tracking-wider">
      Today
    </div>

    {/* Weather Icon */}
    <img
      src={iconUrl}
      alt=""
      className="h-20 w-20 mx-auto transition-transform group-hover:scale-110"
    />

    {/* Description */}
    <div className="text-xs text-muted-foreground/80">
      Partly Cloudy
    </div>

    {/* Temperature */}
    <div className="flex items-baseline justify-center gap-2.5">
      <span className="text-2xl font-black tabular-nums text-gradient-warm">
        82°F
      </span>
      <span className="text-base font-semibold tabular-nums text-gradient-cool">
        65°F
      </span>
    </div>
  </div>
</button>
```

## 7. Chart Labels and Stats

### Chart Value Display
```tsx
<div className="text-xl font-bold gradient-accent-text">
  {value}
  <span className="text-sm ml-1">{unit}</span>
</div>
```

### Summary Stats Row
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="rounded-xl bg-muted/40 p-4 text-center">
    <div className="label-text mb-2">Minimum</div>
    <div className="text-xl font-bold gradient-accent-text">
      58<span className="text-sm ml-1">°F</span>
    </div>
  </div>

  <div className="rounded-xl bg-muted/40 p-4 text-center">
    <div className="label-text mb-2">Average</div>
    <div className="text-xl font-bold gradient-accent-text">
      72<span className="text-sm ml-1">°F</span>
    </div>
  </div>

  <div className="rounded-xl bg-muted/40 p-4 text-center">
    <div className="label-text mb-2">Maximum</div>
    <div className="text-xl font-bold gradient-accent-text">
      86<span className="text-sm ml-1">°F</span>
    </div>
  </div>
</div>
```

## 8. Animated Text Effects

### Gradient with Animation
```tsx
<h1 className="text-gradient text-5xl font-black">
  Weather Forecast
</h1>
```

### Pulsing Glow
```tsx
<span className="text-2xl font-bold text-glow text-primary">
  Alert: Severe Weather
</span>
```

### Subtle Glow on Hover
```tsx
<button className="text-lg font-semibold hover:text-glow-primary transition-all">
  View Details
</button>
```

## 9. Buttons and Interactive Elements

### Primary Button with Typography
```tsx
<button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide transition-all hover:scale-105">
  Refresh Weather
</button>
```

### Text Button
```tsx
<button className="text-sm font-medium text-primary hover:text-glow-primary transition-all">
  Learn More →
</button>
```

## 10. Badges and Tags

### Status Badge
```tsx
<span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5">
  <Droplets className="h-3.5 w-3.5 text-blue-600" />
  <span className="text-xs font-semibold text-blue-700">
    75%
  </span>
</span>
```

### Alert Badge
```tsx
<div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2">
  <span className="text-sm font-bold uppercase tracking-wider text-destructive">
    Severe
  </span>
</div>
```

## 11. Lists and Data Tables

### Weather Detail List
```tsx
<div className="space-y-2">
  <div className="flex justify-between items-center">
    <span className="text-caption-refined">Temperature</span>
    <span className="metric-value">72°F</span>
  </div>

  <div className="flex justify-between items-center">
    <span className="text-caption-refined">Feels Like</span>
    <span className="metric-value">75°F</span>
  </div>

  <div className="flex justify-between items-center">
    <span className="text-caption-refined">Humidity</span>
    <span className="metric-value">65%</span>
  </div>
</div>
```

## 12. Loading States

### Skeleton Text
```tsx
<div className="space-y-3">
  <div className="h-8 bg-muted/40 rounded animate-pulse w-3/4" />
  <div className="h-6 bg-muted/30 rounded animate-pulse w-1/2" />
  <div className="h-4 bg-muted/20 rounded animate-pulse w-full" />
</div>
```

## 13. Error Messages

### Error Text
```tsx
<div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
  <div className="text-sm font-bold text-destructive mb-1">
    Error Loading Data
  </div>
  <p className="text-body-elegant text-destructive/80">
    Unable to fetch weather information. Please try again later.
  </p>
</div>
```

## 14. Empty States

### No Data Message
```tsx
<div className="text-center py-12 space-y-3">
  <div className="text-display text-muted-foreground/40">
    No Data Available
  </div>
  <p className="text-body-elegant text-muted-foreground/60 max-w-md mx-auto">
    Enter a ZIP code above to view weather information for your location.
  </p>
</div>
```

## 15. Tooltips and Popovers

### Tooltip Content
```tsx
<div className="glass-card-strong rounded-xl p-4 shadow-glass-lg">
  <div className="space-y-2">
    <p className="text-sm font-semibold text-foreground/90">
      12:00 PM
    </p>
    <div className="text-2xl font-bold gradient-accent-text">
      75°F
    </div>
    <p className="text-xs text-muted-foreground">
      Temperature
    </p>
  </div>
</div>
```

## Complete Component Example

### Weather Card with All Typography Elements
```tsx
<div className="rounded-2xl border-[0.5px] border-border/50 bg-gradient-to-br from-card/95 to-card/90 p-6 shadow-2xl backdrop-blur-xl">
  {/* Header */}
  <h2 className="card-title-gradient mb-6">
    Current Conditions
  </h2>

  {/* Main Temperature Display */}
  <div className="flex items-center gap-5 mb-6">
    <img src={iconUrl} alt="" className="h-24 w-24" />
    <div className="space-y-1.5">
      <div className="temp-display">72°F</div>
      <div className="text-sm font-medium text-muted-foreground/80">
        Feels like <span className="font-semibold">75°F</span>
      </div>
    </div>
  </div>

  {/* Description */}
  <div className="weather-description mb-6">
    Partly cloudy with a chance of rain
  </div>

  {/* High/Low */}
  <div className="flex gap-3 mb-6">
    <div className="flex-1 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 px-4 py-3">
      <div className="label-text">High</div>
      <div className="text-2xl font-bold tabular-nums text-gradient-warm">
        82°F
      </div>
    </div>
    <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 px-4 py-3">
      <div className="label-text">Low</div>
      <div className="text-2xl font-bold tabular-nums text-gradient-cool">
        65°F
      </div>
    </div>
  </div>

  {/* Metrics Grid */}
  <div className="grid grid-cols-2 gap-3">
    <div className="rounded-xl bg-amber-500/10 p-3">
      <div className="label-text">Dewpoint</div>
      <div className="metric-value">58°F</div>
    </div>
    <div className="rounded-xl bg-blue-500/10 p-3">
      <div className="label-text">Humidity</div>
      <div className="metric-value">65%</div>
    </div>
    <div className="rounded-xl bg-emerald-500/10 p-3">
      <div className="label-text">Wind</div>
      <div className="metric-value">NW 12 mph</div>
    </div>
    <div className="rounded-xl bg-purple-500/10 p-3">
      <div className="label-text">Visibility</div>
      <div className="metric-value">10.0 mi</div>
    </div>
  </div>
</div>
```

---

## Tips for Best Results

1. **Always use `tabular-nums`** with numeric data for perfect alignment
2. **Pair gradient text** with good contrast backgrounds
3. **Use glow effects sparingly** - they're powerful but can be overwhelming
4. **Test in both light and dark modes** - some gradients look better in one than the other
5. **Combine text shadows** with gradients for extra depth
6. **Use semantic HTML** - classes enhance but don't replace good markup
7. **Keep labels uppercase** with `.label-text` for visual hierarchy
8. **Use monospace** (`.time-display`) for all time displays

---

**Quick Copy-Paste Templates Ready to Use!**
