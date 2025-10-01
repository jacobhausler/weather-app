# Animation System Quick Reference

A cheat sheet for quickly applying animations to weather app components.

## Most Used Animations

### Card Entrance
```tsx
<div className="animate-fade-in-up">Card content</div>
```

### Staggered Cards
```tsx
<div className="stagger-children">
  <div>Card 1</div> {/* Auto-delays: 0ms */}
  <div>Card 2</div> {/* Auto-delays: 75ms */}
  <div>Card 3</div> {/* Auto-delays: 150ms */}
</div>
```

### Loading Skeleton
```tsx
<Skeleton className="shimmer bg-white/10" />
```

### Hover Effects
```tsx
<button className="hover-lift hover-glow">Button</button>
```

### Weather Icons
```tsx
{/* Sunny */}
<img className="animate-sun-pulse" />

{/* Cloudy */}
<img className="animate-float-cloud" />

{/* Rainy */}
<img className="animate-rain-drop" />

{/* Snowy */}
<img className="animate-snow-fall" />

{/* Windy */}
<img className="animate-wind-sway" />
```

### Data Updates
```tsx
<div className="animate-highlight-flash">
  <span className="animate-count-up">{value}</span>
</div>
```

### Alert Severity
```tsx
{/* Extreme alerts */}
<div className="alert-extreme">Alert</div>

{/* Severe alerts */}
<div className="alert-severe">Alert</div>
```

## Timing Control

### Delays
```tsx
<div className="animate-fade-in-up animation-delay-100">Delayed</div>
```
Available: 75, 100, 150, 200, 300, 500, 700, 1000ms

### Durations
```tsx
<div className="animate-fade-in-up animate-fast">Fast (200ms)</div>
<div className="animate-fade-in-up animate-normal">Normal (400ms)</div>
<div className="animate-fade-in-up animate-slow">Slow (600ms)</div>
<div className="animate-fade-in-up animate-slower">Slower (800ms)</div>
<div className="animate-fade-in-up animate-slowest">Slowest (1200ms)</div>
```

## Complete Animation List

### Entrance (fade + movement)
- `animate-fade-in-scale` - Fade in with scale
- `animate-fade-in-up` - From bottom
- `animate-fade-in-down` - From top
- `animate-fade-in-left` - From left
- `animate-fade-in-right` - From right
- `animate-slide-in-up` - Dramatic from bottom

### Loading
- `animate-shimmer` - Shimmer effect
- `animate-pulse` - Pulse animation
- `animate-pulse-glow` - Pulse with glow
- `animate-skeleton-wave` - Wave animation
- `animate-spin` - Spinning
- `animate-bounce` - Bouncing

### Weather
- `animate-float-cloud` - Floating clouds
- `animate-sun-pulse` - Pulsing sun
- `animate-rain-drop` - Falling rain
- `animate-snow-fall` - Falling snow
- `animate-wind-sway` - Wind sway
- `animate-lightning` - Lightning flash
- `animate-temp-rise` - Temperature rising
- `animate-temp-fall` - Temperature falling

### Data Updates
- `animate-highlight-flash` - Flash highlight
- `animate-count-up` - Number count-up
- `animate-card-flip` - Card flip
- `animate-ripple` - Ripple effect

### Micro-interactions
- `animate-wiggle` - Wiggle
- `animate-shake` - Shake (errors)
- `animate-expand-center` - Expand from center
- `animate-progress-fill` - Progress bar
- `animate-notification-slide` - Notification
- `animate-badge-pop` - Badge pop

### Hover Effects (classes)
- `hover-lift` - Lift on hover
- `hover-scale` - Scale on hover
- `hover-glow` - Glow on hover

### Transitions (classes)
- `transition-smooth` - Smooth (300ms)
- `transition-fast` - Fast (150ms)
- `transition-slow` - Slow (500ms)

## Common Patterns

### Card with Hover
```tsx
<div className="glass-card rounded-2xl hover-lift hover-glow transition-smooth">
  Content
</div>
```

### Animated Button
```tsx
<button className="glass-button hover-scale transition-fast animate-fade-in-scale">
  Click Me
</button>
```

### Temperature Display
```tsx
<div className={`text-5xl font-bold ${isUpdating ? 'animate-temp-rise' : ''}`}>
  {temperature}°
</div>
```

### Loading Card
```tsx
<div className="glass-card animate-fade-in-up">
  <Skeleton className="h-6 w-32 shimmer" />
  <Skeleton className="h-4 w-full shimmer mt-2" />
</div>
```

### Alert Card
```tsx
<div className="glass-card alert-severe animate-slide-in-up">
  <div className="animate-pulse-glow">⚠️</div>
  <p>Severe weather warning</p>
</div>
```

### Refresh Button
```tsx
<button className={isRefreshing ? 'animate-spin' : ''}>
  🔄
</button>
```

## Performance Tips

✅ **DO:**
- Use `transform` and `opacity`
- Apply to small number of elements
- Use `gpu-accelerate` for heavy animations
- Clean up after animations complete
- Test on mobile devices

❌ **DON'T:**
- Animate `width`, `height`, `top`, `left`
- Apply to too many elements at once
- Leave `will-change` on non-animating elements
- Forget about reduced motion preferences

## Accessibility

The system automatically respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are disabled */
}
```

No additional work needed!

## Browser DevTools

### Check Performance
1. Open DevTools (F12)
2. Performance tab
3. Record while animations play
4. Look for 60fps (16.67ms per frame)

### View Animations
1. DevTools → More tools → Animations
2. See all running animations
3. Slow down to debug
4. Inspect timing and easing

## File Locations

- **Main animations:** `/workspaces/weather-app/src/styles/animations.css`
- **Tailwind config:** `/workspaces/weather-app/tailwind.config.js`
- **Import location:** `/workspaces/weather-app/src/index.css`
- **Documentation:** `/workspaces/weather-app/ANIMATIONS.md`
- **Examples:** `/workspaces/weather-app/ANIMATION_EXAMPLES.md`

## Need Help?

1. Check `ANIMATIONS.md` for detailed docs
2. Check `ANIMATION_EXAMPLES.md` for component examples
3. Inspect browser DevTools animations panel
4. Test in isolation to debug issues

---

**Pro Tip:** Start simple with `animate-fade-in-up`, then add `hover-lift` and timing adjustments. Build complexity gradually!
