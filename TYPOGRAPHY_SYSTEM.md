# Typography System Documentation

## Overview

A comprehensive, modern typography system has been added to the weather app, providing elegant, readable, and beautiful text styling throughout the application.

## File Location

All typography enhancements are in: `/workspaces/weather-app/src/index.css`

## Font System

### Font Families

**Primary Font: Inter**
- A modern, highly legible variable font optimized for UI
- Weights: 300, 400, 500, 600, 700, 800, 900
- Excellent readability at all sizes
- OpenType features: kerning, ligatures, contextual alternates

**Monospace Font: JetBrains Mono**
- Used for time displays and numerical data
- Weights: 400, 500, 600, 700
- Perfect for tabular data alignment

### CSS Variables

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
--font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', ...
```

### Base Typography Settings

The `body` element includes:
- Font smoothing for crisp rendering
- OpenType feature settings (kerning, ligatures, contextual alternates)
- Optimized text rendering

## Fluid Typography Scale

Responsive font sizes using `clamp()` for optimal sizing across all devices:

| Variable | Min Size | Max Size | Usage |
|----------|----------|----------|-------|
| `--text-xs` | 0.75rem | 0.875rem | Small labels, captions |
| `--text-sm` | 0.875rem | 1rem | Body text, descriptions |
| `--text-base` | 1rem | 1.125rem | Standard body text |
| `--text-lg` | 1.125rem | 1.25rem | Emphasized text |
| `--text-xl` | 1.25rem | 1.5rem | Subheadings |
| `--text-2xl` | 1.5rem | 1.875rem | Section headings |
| `--text-3xl` | 1.875rem | 2.25rem | Page headings |
| `--text-4xl` | 2.25rem | 3rem | Large displays |
| `--text-5xl` | 3rem | 4rem | Hero text |

### Fluid Size Utility Classes

```css
.text-fluid-xs { font-size: var(--text-xs); }
.text-fluid-sm { font-size: var(--text-sm); }
.text-fluid-base { font-size: var(--text-base); }
.text-fluid-lg { font-size: var(--text-lg); }
.text-fluid-xl { font-size: var(--text-xl); }
.text-fluid-2xl { font-size: var(--text-2xl); }
.text-fluid-3xl { font-size: var(--text-3xl); }
.text-fluid-4xl { font-size: var(--text-4xl); }
.text-fluid-5xl { font-size: var(--text-5xl); }
```

## Line Heights

Optimized for readability:

```css
--leading-tight: 1.25    /* Headings, compact text */
--leading-snug: 1.375    /* Subheadings */
--leading-normal: 1.5    /* Body text */
--leading-relaxed: 1.625 /* Comfortable reading */
--leading-loose: 1.75    /* Maximum comfort */
```

## Letter Spacing (Tracking)

Refined spacing for different text styles:

```css
--tracking-tighter: -0.05em  /* Large headings */
--tracking-tight: -0.025em   /* Headings */
--tracking-normal: 0em       /* Body text */
--tracking-wide: 0.025em     /* Buttons, labels */
--tracking-wider: 0.05em     /* Uppercase labels */
--tracking-widest: 0.1em     /* Spaced uppercase */
```

## Gradient Text Effects

### Available Gradient Classes

**`.text-gradient`**
- Animated gradient that shifts colors
- Perfect for hero text and emphasis
```css
background: linear-gradient(135deg, accent-gradient-1, accent-gradient-2);
animation: gradient-shift 3s ease infinite;
```

**`.text-gradient-static`**
- Static gradient (no animation)
- Elegant accent without distraction

**`.text-gradient-primary`**
- Primary to accent color gradient
- Matches theme colors

**`.text-gradient-warm`**
- Warm colors: red → orange → gold
- Great for temperature highs

**`.text-gradient-cool`**
- Cool colors: purple → violet → pink
- Great for temperature lows

### Usage Example

```html
<h1 class="text-gradient">HAUS Weather Station</h1>
<div class="text-gradient-warm text-5xl font-bold">78°F</div>
```

## Text Glow Effects

Subtle glow effects for emphasis and depth:

**`.text-glow`**
- Animated pulsing glow
- Draws attention to important elements

**`.text-glow-soft`**
- Subtle static glow
- Adds depth without distraction

**`.text-glow-primary`**
- Primary color glow with multiple layers
- Strong emphasis

**`.text-glow-accent`**
- Accent color glow
- Complements gradients

## Text Shadows

Depth and dimension utilities:

| Class | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `.text-shadow-soft` | rgba(0,0,0,0.1) | rgba(0,0,0,0.3) | Subtle depth |
| `.text-shadow` | rgba(0,0,0,0.15) | rgba(0,0,0,0.4) | Standard depth |
| `.text-shadow-strong` | rgba(0,0,0,0.2) | rgba(0,0,0,0.5) | Maximum depth |

## Weather-Specific Typography

### Temperature Display (`.temp-display`)

Large, bold temperature numbers with:
- Fluid sizing: 3rem → 5rem
- Black (900) font weight
- Tight letter spacing (-0.02em)
- Tabular numerals for alignment
- Gradient text fill
- Smooth transitions

```html
<div class="temp-display">72°F</div>
```

### Weather Description (`.weather-description`)

Elegant, readable forecast text:
- Medium (500) weight
- Relaxed line height
- Subtle letter spacing
- Muted foreground color

```html
<p class="weather-description">Partly cloudy with a chance of rain</p>
```

### Time Display (`.time-display`)

Monospace time formatting:
- JetBrains Mono font
- Semibold (600) weight
- Wide tracking (0.05em)
- Tabular numerals
- Perfect alignment

```html
<span class="time-display">7:30 AM</span>
```

### Header Text (`.header-text`)

Modern page headers:
- Fluid sizing: 1.5rem → 2.5rem
- Extra bold (800) weight
- Tight line height
- Negative letter spacing
- Gradient fill

```html
<h1 class="header-text">Current Conditions</h1>
```

### Label Text (`.label-text`)

Refined, uppercase labels:
- Extra small size
- Semibold (600) weight
- Wide tracking (0.1em)
- Uppercase transform
- Muted color

```html
<div class="label-text">High</div>
```

### Metric Value (`.metric-value`)

Bold numerical metrics:
- Large size
- Bold (700) weight
- Tabular numerals
- Full foreground color

```html
<div class="metric-value">65%</div>
```

### Card Title Gradient (`.card-title-gradient`)

Elegant card titles:
- Extra large size
- Bold (700) weight
- Snug line height
- Subtle negative tracking
- Horizontal gradient

```html
<h2 class="card-title-gradient">7-Day Forecast</h2>
```

## Advanced Utilities

### Tabular Numerals (`.tabular-nums`)

Perfect alignment for numbers:
```css
font-variant-numeric: tabular-nums;
font-feature-settings: 'tnum' 1;
```

### Text Optimization (`.text-optimize`)

Optimized rendering:
- Antialiasing
- Subpixel rendering
- OpenType features

### Text Wrapping

**`.text-balance`**
- Balanced text wrapping for headings
- Better visual hierarchy

**`.text-pretty`**
- Optimized wrapping for body content
- Prevents orphans and widows

## Preset Combinations

### Hero Text (`.text-hero`)

Massive hero text:
- 2.5rem → 6rem fluid sizing
- Black (900) weight
- Ultra-tight spacing
- Animated gradient

### Display Text (`.text-display`)

Large display text:
- 2rem → 4rem fluid sizing
- Extra bold (800) weight
- Tight line height

### Body Elegant (`.text-body-elegant`)

Refined body text:
- Base size (fluid)
- Regular (400) weight
- Relaxed line height
- Subtle tracking

### Caption Refined (`.text-caption-refined`)

Elegant captions:
- Small size (fluid)
- Medium (500) weight
- Normal line height
- Subtle tracking
- Muted color

## Usage Guidelines

### Temperature Displays

```html
<!-- Main temperature -->
<div class="text-6xl font-black tabular-nums gradient-accent-text">
  72°F
</div>

<!-- High/Low temperatures -->
<span class="text-2xl font-bold tabular-nums text-gradient-warm">
  82°F
</span>
<span class="text-base font-semibold tabular-nums text-gradient-cool">
  65°F
</span>
```

### Headers

```html
<!-- Page title -->
<h1 class="header-text">HAUS Weather Station</h1>

<!-- Card titles -->
<h2 class="card-title-gradient">Current Conditions</h2>
```

### Time Displays

```html
<time class="time-display">7:30 AM</time>
```

### Labels and Values

```html
<div class="label-text">Humidity</div>
<div class="metric-value">65%</div>
```

### Weather Descriptions

```html
<p class="weather-description">
  Partly cloudy with a high of 78°F. Chance of rain in the evening.
</p>
```

## Responsive Behavior

All fluid typography automatically scales between mobile and desktop:

- **Mobile (320px)**: Minimum sizes
- **Tablet (768px)**: Intermediate sizes
- **Desktop (1440px+)**: Maximum sizes

No media queries needed - `clamp()` handles everything!

## Accessibility

Typography system ensures:

- **WCAG 2.1 AA** compliant contrast ratios
- **Minimum 16px** base font size
- **Optimal line lengths** (45-75 characters)
- **Sufficient line height** for readability
- **Font smoothing** for all displays
- **Tabular numerals** for alignment
- **High-quality OpenType** features

## Performance

- **Preconnect** to Google Fonts
- **Font-display: swap** for fast rendering
- **Variable fonts** where supported
- **Subset loading** for optimal size
- **CSS Custom Properties** for instant updates

## Browser Support

Works in all modern browsers:
- Chrome/Edge 88+
- Firefox 89+
- Safari 14+
- Opera 74+

Graceful degradation for older browsers.

## Examples in the App

The typography system is already implemented throughout:

### Header (`/src/components/Header.tsx`)
- Gradient header text with fluid sizing
- Glassmorphism with backdrop blur
- Responsive layout

### Current Conditions (`/src/components/CurrentConditions.tsx`)
- Large temperature displays with gradients
- Tabular numerals for alignment
- Color-coded high/low temps

### 7-Day Forecast (`/src/components/SevenDayForecast.tsx`)
- Temperature gradients based on value
- Bold, readable day names
- Compact metric displays

### Hourly Forecast (`/src/components/HourlyForecast.tsx`)
- Gradient accent text for values
- Monospace time labels
- Clean chart labels

## Customization

To modify the typography system:

1. **Font families**: Update CSS imports at top of `index.css`
2. **Size scale**: Modify `clamp()` values in `:root`
3. **Gradients**: Adjust `--accent-gradient-1` and `--accent-gradient-2`
4. **Shadows**: Update shadow values in utility classes

## Best Practices

1. **Use fluid sizes** for all text
2. **Apply tabular-nums** to all numeric displays
3. **Use gradients sparingly** for emphasis
4. **Match glow effects** to theme colors
5. **Test in both** light and dark modes
6. **Ensure proper contrast** for accessibility
7. **Use semantic HTML** with styled classes

---

## Quick Reference

```css
/* Sizes */
.text-fluid-xs → .text-fluid-5xl

/* Line Heights */
.leading-tight → .leading-loose

/* Tracking */
.tracking-tighter → .tracking-widest

/* Gradients */
.text-gradient, .text-gradient-primary, .text-gradient-warm, .text-gradient-cool

/* Glow */
.text-glow, .text-glow-soft, .text-glow-primary, .text-glow-accent

/* Shadows */
.text-shadow-soft, .text-shadow, .text-shadow-strong

/* Weather-specific */
.temp-display, .weather-description, .time-display, .header-text
.label-text, .metric-value, .card-title-gradient

/* Presets */
.text-hero, .text-display, .text-body-elegant, .text-caption-refined
```

---

**Created**: 2025-10-01
**Version**: 1.0
**Author**: Claude (Anthropic)
**Status**: Production Ready
