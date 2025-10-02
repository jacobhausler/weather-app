import { useState } from 'react'
import { getWeatherIconFromUrl } from '@/utils/weatherIconMapper'

interface WeatherIconProps {
  /** Original NWS icon URL */
  nwsIconUrl: string
  /** Text description for alt text */
  shortForecast?: string
  /** Icon size: sm (40px), md (64px), lg (96px) */
  size?: 'sm' | 'md' | 'lg'
  /** Use animated vs static icons (default true) */
  animated?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * WeatherIcon Component
 *
 * Displays weather icons by converting NWS icon URLs to custom animated/static weather icons.
 * Handles error states with fallback to cloudy icon.
 *
 * @example
 * ```tsx
 * <WeatherIcon
 *   nwsIconUrl="https://api.weather.gov/icons/land/day/tsra,40?size=medium"
 *   shortForecast="Thunderstorms"
 *   size="md"
 *   animated={true}
 * />
 * ```
 */
export function WeatherIcon({
  nwsIconUrl,
  shortForecast,
  size = 'md',
  animated = true,
  className = '',
}: WeatherIconProps) {
  const [hasError, setHasError] = useState(false)

  // Convert size prop to pixel dimensions
  const sizeMap = {
    sm: 40,
    md: 64,
    lg: 96,
  }
  const pixelSize = sizeMap[size]

  // Get the custom icon path from the NWS URL
  const iconPath = hasError
    ? '/weather-icons/animated/cloudy.svg'
    : getWeatherIconFromUrl(nwsIconUrl, animated)

  // Generate accessible alt text
  const altText = shortForecast || 'Weather icon'

  // Handle image load errors by falling back to cloudy icon
  const handleError = () => {
    if (!hasError) {
      console.warn(`Failed to load weather icon: ${iconPath}. Falling back to cloudy.svg`)
      setHasError(true)
    }
  }

  return (
    <img
      src={iconPath}
      alt={altText}
      aria-label={shortForecast}
      width={pixelSize}
      height={pixelSize}
      loading="lazy"
      onError={handleError}
      className={`object-contain ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
      }}
    />
  )
}
