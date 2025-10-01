# Animation System Documentation

## Overview

The weather app includes a comprehensive animation system designed to create smooth, performant, and delightful user interactions. The system is built with accessibility in mind and respects user motion preferences.

## Files

- `/workspaces/weather-app/src/styles/animations.css` - Complete animation system with keyframes and utility classes
- `/workspaces/weather-app/tailwind.config.js` - Tailwind configuration with animation utilities
- `/workspaces/weather-app/src/App.tsx` - Implementation examples with staggered card animations

## Animation Categories

### 1. Entrance Animations

Smooth animations for when elements appear on screen:

```tsx
// Fade in with subtle scale
<div className="animate-fade-in-scale">Content</div>

// Fade in from bottom
<div className="animate-fade-in-up">Content</div>

// Fade in from top
<div className="animate-fade-in-down">Content</div>

// Fade in from left
<div className="animate-fade-in-left">Content</div>

// Fade in from right
<div className="animate-fade-in-right">Content</div>

// Dramatic slide from bottom
<div className="animate-slide-in-up">Content</div>
```

### 2. Loading & Shimmer Animations

For loading states and skeleton screens:

```tsx
// Shimmer effect for loading
<div className="animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent">
  Loading...
</div>

// Pulse animation
<div className="animate-pulse">Loading...</div>

// Pulse with glow effect
<div className="animate-pulse-glow">Important content</div>

// Skeleton wave (for skeleton screens)
<div className="animate-skeleton-wave bg-white/10">
  <div className="h-20 w-full" />
</div>

// Spinning loader
<div className="animate-spin">↻</div>

// Gentle bounce
<div className="animate-bounce">↓</div>
```

### 3. Weather-Specific Animations

Animations that match weather conditions:

```tsx
// Floating clouds
<div className="animate-float-cloud">☁️</div>

// Sun pulsing/glowing
<div className="animate-sun-pulse">☀️</div>

// Rain drops falling
<div className="animate-rain-drop">💧</div>

// Snow falling
<div className="animate-snow-fall">❄️</div>

// Wind sway effect
<div className="animate-wind-sway">🍃</div>

// Lightning flash
<div className="animate-lightning">⚡</div>

// Temperature rising (with color change)
<div className="animate-temp-rise">🌡️ 75°</div>

// Temperature falling (with color change)
<div className="animate-temp-fall">🌡️ 45°</div>
```

### 4. Data Update Animations

For when data refreshes or changes:

```tsx
// Highlight flash on update
<div className="animate-highlight-flash">Updated value</div>

// Number count-up effect
<div className="animate-count-up">72°</div>

// Card flip for data refresh
<div className="animate-card-flip">Refreshed content</div>

// Ripple effect
<button className="animate-ripple">Refresh</button>
```

### 5. Micro-interactions

Subtle animations for user interactions:

```tsx
// Wiggle for attention
<div className="animate-wiggle">Look at me!</div>

// Shake for errors
<div className="animate-shake">Error occurred</div>

// Expand from center
<div className="animate-expand-center">Modal content</div>

// Progress bar fill
<div className="animate-progress-fill bg-blue-500 h-2" />

// Notification slide
<div className="animate-notification-slide">New alert!</div>

// Badge pop
<div className="animate-badge-pop">New</div>
```

### 6. Staggered Animations

For animating multiple elements in sequence:

```tsx
// Stagger children animations
<div className="stagger-children">
  <div>Item 1</div>  {/* Animates first */}
  <div>Item 2</div>  {/* Animates after 75ms */}
  <div>Item 3</div>  {/* Animates after 150ms */}
  {/* ... up to 10 items with automatic delays */}
</div>
```

## Animation Timing & Delays

### Animation Durations

```tsx
// Fast animations (200ms)
<div className="animate-fade-in-up animate-fast">Fast</div>

// Normal animations (400ms) - default
<div className="animate-fade-in-up animate-normal">Normal</div>

// Slow animations (600ms)
<div className="animate-fade-in-up animate-slow">Slow</div>

// Slower animations (800ms)
<div className="animate-fade-in-up animate-slower">Slower</div>

// Slowest animations (1200ms)
<div className="animate-fade-in-up animate-slowest">Slowest</div>
```

### Animation Delays

```tsx
// Add delays to stagger animations
<div className="animate-fade-in-up animation-delay-100">Delayed 100ms</div>
<div className="animate-fade-in-up animation-delay-200">Delayed 200ms</div>
<div className="animate-fade-in-up animation-delay-300">Delayed 300ms</div>
<div className="animate-fade-in-up animation-delay-500">Delayed 500ms</div>
```

Available delays: 75, 100, 150, 200, 300, 500, 700, 1000 (in milliseconds)

## Hover Effects

Utility classes for interactive hover states:

```tsx
// Lift effect on hover
<div className="hover-lift">
  Card that lifts on hover
</div>

// Scale effect on hover
<button className="hover-scale">
  Button that scales
</button>

// Glow effect on hover
<div className="hover-glow">
  Element that glows
</div>
```

## Transition Utilities

For smooth transitions between states:

```tsx
// Smooth transitions (300ms)
<div className="transition-smooth">Content</div>

// Fast transitions (150ms)
<div className="transition-fast">Content</div>

// Slow transitions (500ms)
<div className="transition-slow">Content</div>
```

### Custom Timing Functions

```tsx
// Bounce-in effect
<div className="transition-all ease-bounce-in">Content</div>

// Smooth easing
<div className="transition-all ease-smooth">Content</div>

// Spring easing
<div className="transition-all ease-spring">Content</div>
```

## Performance Optimization

### GPU Acceleration

For smoother animations, add GPU acceleration:

```tsx
<div className="gpu-accelerate animate-fade-in-up">
  Hardware-accelerated animation
</div>
```

### Best Practices

1. **Use `will-change` sparingly** - Only on elements that will definitely animate
2. **Prefer `transform` and `opacity`** - These properties are GPU-accelerated
3. **Remove animations after completion** - Clean up with `forwards` fill mode
4. **Test on slower devices** - Ensure animations remain smooth

## Accessibility

The animation system respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are disabled or reduced to 0.01ms */
}
```

Users who have enabled "Reduce Motion" in their OS settings will see minimal or no animations.

## Alert Severity Animations

Special animations for weather alerts:

```tsx
// Extreme alerts - rapid pulse with glow
<div className="alert-extreme">Extreme Weather Alert</div>

// Severe alerts - slower pulse
<div className="alert-severe">Severe Weather Alert</div>
```

## Implementation Examples

### Staggered Card Entrance

```tsx
function WeatherCards({ cards }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div className="space-y-6">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: `${index * 150}ms` }}
        >
          {card.content}
        </div>
      ))}
    </div>
  )
}
```

### Loading Skeleton with Shimmer

```tsx
function LoadingSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="h-7 w-48 shimmer bg-white/10 rounded-lg" />
      <div className="h-4 w-32 shimmer bg-white/10 rounded-lg" />
      <div className="h-32 w-full shimmer bg-white/10 rounded-xl" />
    </div>
  )
}
```

### Data Update Animation

```tsx
function Temperature({ value, prevValue }) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (prevValue && value !== prevValue) {
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 800)
    }
  }, [value, prevValue])

  const animationClass = value > prevValue
    ? 'animate-temp-rise'
    : 'animate-temp-fall'

  return (
    <div className={showAnimation ? animationClass : ''}>
      {value}°
    </div>
  )
}
```

### Weather Icon Animation

```tsx
function WeatherIcon({ condition, icon }) {
  const getAnimationClass = () => {
    if (condition.includes('cloud')) return 'animate-float-cloud'
    if (condition.includes('sun') || condition.includes('clear')) return 'animate-sun-pulse'
    if (condition.includes('rain')) return 'animate-rain-drop'
    if (condition.includes('snow')) return 'animate-snow-fall'
    if (condition.includes('wind')) return 'animate-wind-sway'
    return ''
  }

  return (
    <img
      src={icon}
      alt={condition}
      className={`w-16 h-16 ${getAnimationClass()}`}
    />
  )
}
```

## Dark Mode Considerations

The animation system automatically adjusts for dark mode:

- Shimmer effects have reduced opacity in dark mode
- Glow effects are brighter in dark mode
- Shadow effects are more pronounced in dark mode

No additional configuration needed - it's all handled automatically!

## Troubleshooting

### Animations Not Working

1. Check that animations.css is imported in index.css
2. Verify Tailwind config includes the animation utilities
3. Ensure you're using the correct class names (check for typos)
4. Check browser console for CSS errors

### Performance Issues

1. Reduce number of simultaneous animations
2. Use `will-change` sparingly
3. Prefer `transform` and `opacity` over other properties
4. Check if GPU acceleration is enabled
5. Test on target devices

### Animations Too Fast/Slow

Use duration modifiers:

```tsx
// Make faster
<div className="animate-fade-in-up animate-fast">Fast</div>

// Make slower
<div className="animate-fade-in-up animate-slower">Slower</div>
```

## Browser Support

All animations are supported in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

Fallbacks are provided for older browsers (animations simply won't play).
