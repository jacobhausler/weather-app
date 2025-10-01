# Animation Examples for Weather App Components

This document provides specific examples of how to apply animations to the weather app's existing components.

## Table of Contents

1. [Alert Card Animations](#alert-card-animations)
2. [7-Day Forecast Animations](#7-day-forecast-animations)
3. [Current Conditions Animations](#current-conditions-animations)
4. [Hourly Forecast Animations](#hourly-forecast-animations)
5. [Header & Navigation Animations](#header--navigation-animations)
6. [Loading States](#loading-states)
7. [Data Refresh Animations](#data-refresh-animations)

## Alert Card Animations

### Entrance Animation with Severity-Based Effects

```tsx
// AlertCard.tsx
import { Alert } from '@/types'

interface AlertCardProps {
  alerts: Alert[]
}

export function AlertCard({ alerts }: AlertCardProps) {
  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => {
        // Determine animation based on severity
        const severityClass =
          alert.severity === 'Extreme' ? 'alert-extreme' :
          alert.severity === 'Severe' ? 'alert-severe' :
          ''

        return (
          <div
            key={alert.id}
            className={`
              glass-card rounded-2xl p-6
              animate-fade-in-up
              ${severityClass}
              hover-lift
              transition-all duration-300
            `}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Alert content */}
            <div className="flex items-start gap-4">
              {/* Animated icon */}
              <div className="animate-pulse-glow">
                <AlertIcon className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold animate-fade-in-left animation-delay-100">
                  {alert.headline}
                </h3>
                <p className="text-sm text-muted-foreground animate-fade-in-left animation-delay-200">
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

## 7-Day Forecast Animations

### Staggered Day Cards with Hover Effects

```tsx
// SevenDayForecast.tsx
export function SevenDayForecast({ forecast }: SevenDayForecastProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 animate-fade-in-down">
        7-Day Forecast
      </h2>

      <div className="stagger-children grid grid-cols-7 gap-4">
        {forecast.slice(0, 7).map((day, index) => (
          <button
            key={day.number}
            onClick={() => setSelectedDay(index)}
            className={`
              glass-card-subtle rounded-xl p-4
              hover-lift hover-glow
              transition-all duration-300
              ${selectedDay === index ? 'ring-2 ring-primary' : ''}
            `}
          >
            {/* Day name with fade animation */}
            <div className="text-sm font-medium mb-2 animate-fade-in-up">
              {day.name}
            </div>

            {/* Weather icon with weather-specific animation */}
            <div className={`
              w-16 h-16 mx-auto mb-2
              ${getWeatherAnimation(day.shortForecast)}
            `}>
              <img
                src={day.icon}
                alt={day.shortForecast}
                className="w-full h-full"
              />
            </div>

            {/* Temperature with count-up animation */}
            <div className="space-y-1">
              <div className="text-lg font-bold animate-count-up">
                {day.temperature}°
              </div>
              <div className="text-xs text-muted-foreground">
                {day.shortForecast}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Helper function for weather animations
function getWeatherAnimation(forecast: string): string {
  const lowerForecast = forecast.toLowerCase()

  if (lowerForecast.includes('cloud')) return 'animate-float-cloud'
  if (lowerForecast.includes('sun') || lowerForecast.includes('clear')) return 'animate-sun-pulse'
  if (lowerForecast.includes('rain')) return 'animate-rain-drop'
  if (lowerForecast.includes('snow')) return 'animate-snow-fall'
  if (lowerForecast.includes('wind')) return 'animate-wind-sway'
  if (lowerForecast.includes('storm')) return 'animate-lightning'

  return 'animate-fade-in-scale'
}
```

## Current Conditions Animations

### Animated Temperature Display with Data Updates

```tsx
// CurrentConditions.tsx
import { useState, useEffect } from 'react'

export function CurrentConditions({ observation, todayForecast }: Props) {
  const [prevTemp, setPrevTemp] = useState(observation?.temperature)
  const [showTempAnimation, setShowTempAnimation] = useState(false)

  useEffect(() => {
    if (prevTemp && observation?.temperature !== prevTemp) {
      setShowTempAnimation(true)
      setTimeout(() => setShowTempAnimation(false), 800)
    }
    setPrevTemp(observation?.temperature)
  }, [observation?.temperature])

  const tempAnimation =
    showTempAnimation
      ? observation.temperature > prevTemp
        ? 'animate-temp-rise'
        : 'animate-temp-fall'
      : ''

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Current temperature - large display */}
      <div className="text-center mb-8 animate-fade-in-scale">
        <div className={`
          text-7xl font-bold
          tabular-nums
          ${tempAnimation}
          transition-all duration-300
        `}>
          {observation.temperature}°
        </div>

        {/* Feels like with subtle animation */}
        <div className="text-lg text-muted-foreground mt-2 animate-fade-in-up animation-delay-100">
          Feels like {observation.heatIndex || observation.windChill}°
        </div>
      </div>

      {/* Metrics grid with staggered animations */}
      <div className="stagger-children grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Humidity"
          value={`${observation.relativeHumidity}%`}
          icon={<HumidityIcon />}
        />
        <MetricCard
          label="Wind"
          value={observation.windSpeed}
          icon={<WindIcon className="animate-wind-sway" />}
        />
        <MetricCard
          label="Visibility"
          value={observation.visibility}
          icon={<VisibilityIcon />}
        />
        <MetricCard
          label="Pressure"
          value={observation.barometricPressure}
          icon={<PressureIcon />}
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="glass-card-subtle rounded-xl p-4 hover-lift transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="animate-fade-in-scale">{icon}</div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground label-text">
            {label}
          </div>
          <div className="text-lg font-bold metric-value animate-count-up">
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Hourly Forecast Animations

### Chart Animations with Data Points

```tsx
// HourlyForecast.tsx
export function HourlyForecast({ hourlyForecast }: Props) {
  const [period, setPeriod] = useState<'12h' | '24h' | '48h'>('24h')
  const [dataType, setDataType] = useState<DataType>('temperature')
  const [isChanging, setIsChanging] = useState(false)

  const handleDataTypeChange = (newType: DataType) => {
    setIsChanging(true)
    setTimeout(() => {
      setDataType(newType)
      setIsChanging(false)
    }, 300)
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold animate-fade-in-down">
          Hourly Forecast
        </h2>

        {/* Period selector with animated transitions */}
        <div className="flex gap-2">
          {['12h', '24h', '48h'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`
                px-4 py-2 rounded-lg
                transition-all duration-300
                hover-scale
                ${period === p
                  ? 'glass-button bg-primary text-primary-foreground animate-expand-center'
                  : 'glass-button-subtle'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container with fade transition */}
      <div className={`
        transition-all duration-500
        ${isChanging ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <Bar
              dataKey="value"
              fill="url(#gradient)"
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="hover-scale"
                  style={{
                    animationDelay: `${index * 20}ms`,
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data type selector with badge animations */}
      <div className="flex gap-2 mt-6 flex-wrap">
        {dataTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleDataTypeChange(type.value)}
            className={`
              px-4 py-2 rounded-full
              transition-all duration-300
              ${dataType === type.value
                ? 'glass-button animate-badge-pop'
                : 'glass-button-subtle hover-scale'
              }
            `}
          >
            {type.icon}
            <span className="ml-2">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

## Header & Navigation Animations

### Smooth Header with Input Animations

```tsx
// Header.tsx
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`
      glass-panel sticky top-0 z-50
      transition-all duration-500
      ${isScrolled ? 'shadow-glass-lg' : 'shadow-glass-sm'}
    `}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title with fade animation */}
          <h1 className="text-2xl font-bold animate-fade-in-left">
            <span className="text-gradient-primary">HAUS</span>
            {' '}Weather Station
          </h1>

          {/* Search with refresh button */}
          <div className="flex items-center gap-4">
            <RefreshButton />
            <ZipInput />
          </div>
        </div>
      </div>
    </header>
  )
}

// RefreshButton.tsx
export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshWeatherData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`
        glass-button p-3 rounded-full
        hover-lift hover-glow
        transition-all duration-300
        ${isRefreshing ? 'animate-spin' : ''}
      `}
      aria-label="Refresh weather data"
    >
      <RefreshIcon className="w-5 h-5" />
    </button>
  )
}

// ZipInput.tsx
export function ZipInput() {
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(true)

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="ZIP Code"
        maxLength={5}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          glass-input px-4 py-2 rounded-lg
          transition-all duration-300
          ${isFocused ? 'ring-2 ring-primary scale-105' : ''}
          ${!isValid ? 'animate-shake ring-2 ring-destructive' : ''}
        `}
      />
    </div>
  )
}
```

## Loading States

### Beautiful Skeleton Screens

```tsx
// LoadingSkeletons.tsx
export function WeatherLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Alert card skeleton */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-full shimmer" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4 shimmer" />
            <Skeleton className="h-4 w-full shimmer" />
            <Skeleton className="h-4 w-5/6 shimmer" />
          </div>
        </div>
      </div>

      {/* 7-Day forecast skeleton */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up animation-delay-100">
        <Skeleton className="h-8 w-48 mb-6 shimmer" />
        <div className="stagger-children grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-16 mx-auto shimmer" />
              <Skeleton className="w-16 h-16 mx-auto rounded-lg shimmer" />
              <Skeleton className="h-6 w-12 mx-auto shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Current conditions skeleton */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in-up animation-delay-200">
        <div className="text-center mb-8">
          <Skeleton className="h-24 w-32 mx-auto mb-4 shimmer" />
          <Skeleton className="h-6 w-24 mx-auto shimmer" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Data Refresh Animations

### Smooth Data Updates

```tsx
// useWeatherRefresh.tsx
export function useWeatherRefresh() {
  const [data, setData] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())

  const refresh = async () => {
    setIsRefreshing(true)
    const newData = await fetchWeatherData()

    // Detect changed fields
    const changed = new Set<string>()
    if (data) {
      Object.keys(newData).forEach(key => {
        if (data[key] !== newData[key]) {
          changed.add(key)
        }
      })
    }

    setChangedFields(changed)
    setData(newData)
    setIsRefreshing(false)

    // Clear highlights after animation
    setTimeout(() => setChangedFields(new Set()), 2000)
  }

  return { data, isRefreshing, changedFields, refresh }
}

// Usage in component
function WeatherDataDisplay() {
  const { data, changedFields } = useWeatherRefresh()

  return (
    <div>
      <div className={changedFields.has('temperature') ? 'animate-highlight-flash' : ''}>
        <div className={changedFields.has('temperature') ? 'animate-count-up' : ''}>
          {data.temperature}°
        </div>
      </div>

      <div className={changedFields.has('humidity') ? 'animate-highlight-flash' : ''}>
        <div className={changedFields.has('humidity') ? 'animate-count-up' : ''}>
          {data.humidity}%
        </div>
      </div>
    </div>
  )
}
```

## Tips for Best Results

### 1. Use Staggered Delays for Lists

```tsx
// Good: Staggered appearance
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${index * 75}ms` }}
  >
    {item.content}
  </div>
))}
```

### 2. Combine Multiple Animation Classes

```tsx
// Combine entrance + hover + transition
<button className="
  animate-fade-in-scale
  hover-lift
  hover-glow
  transition-smooth
">
  Click me
</button>
```

### 3. Respect Reduced Motion

```tsx
// Automatically handled by CSS, but can also check in JS
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

// Conditionally apply animations
<div className={!prefersReducedMotion ? 'animate-fade-in-up' : ''}>
  Content
</div>
```

### 4. Use GPU Acceleration for Heavy Animations

```tsx
<div className="gpu-accelerate animate-float-cloud">
  Large animated element
</div>
```

### 5. Clean Up Animations After Completion

```tsx
const [showAnimation, setShowAnimation] = useState(true)

useEffect(() => {
  if (showAnimation) {
    const timer = setTimeout(() => setShowAnimation(false), 1000)
    return () => clearTimeout(timer)
  }
}, [showAnimation])
```

## Performance Checklist

- [ ] Use `transform` and `opacity` for animations (GPU-accelerated)
- [ ] Apply `will-change` only to animating elements
- [ ] Remove `will-change` after animations complete
- [ ] Limit simultaneous animations to 10-15 elements
- [ ] Test on mobile/slower devices
- [ ] Verify smooth 60fps performance
- [ ] Implement proper loading states
- [ ] Respect user motion preferences
