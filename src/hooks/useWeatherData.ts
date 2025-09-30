import { useEffect, useRef, useCallback, useState } from 'react'
import { useWeatherStore } from '../stores/weatherStore'
import { apiService } from '../services/api'
import { WeatherData } from '../types/weather'

const REFRESH_INTERVAL = 60000 // 1 minute in milliseconds
const MAX_CONSECUTIVE_FAILURES = 3
const INITIAL_BACKOFF_DELAY = 2000 // 2 seconds
const MAX_BACKOFF_DELAY = 32000 // 32 seconds

export function useWeatherData() {
  const {
    currentZipCode,
    weatherData,
    isLoading,
    error,
    setZipCode,
    setWeatherData,
    setLoading,
    setError,
    addRecentZipCode
  } = useWeatherStore()

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)
  const consecutiveFailuresRef = useRef(0)
  const backoffDelayRef = useRef(INITIAL_BACKOFF_DELAY)
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState(false)

  // Fetch weather data for a ZIP code
  const fetchWeather = useCallback(async (zipCode: string) => {
    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      setError('Invalid ZIP code. Please enter a 5-digit ZIP code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data: WeatherData = await apiService.getWeatherByZip(zipCode)
      setWeatherData(data)
      setZipCode(zipCode)
      addRecentZipCode(zipCode)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setWeatherData, setZipCode, addRecentZipCode])

  // Reset failure tracking on successful request
  const resetFailureTracking = useCallback(() => {
    consecutiveFailuresRef.current = 0
    backoffDelayRef.current = INITIAL_BACKOFF_DELAY
    if (isAutoRefreshPaused) {
      setIsAutoRefreshPaused(false)
    }
  }, [isAutoRefreshPaused])

  // Handle background refresh failure with exponential backoff
  const handleBackgroundFailure = useCallback(() => {
    consecutiveFailuresRef.current += 1

    if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
      // Pause auto-refresh after max consecutive failures
      setIsAutoRefreshPaused(true)
      console.warn(
        `Background refresh paused after ${MAX_CONSECUTIVE_FAILURES} consecutive failures. ` +
        'Use manual refresh to retry.'
      )
    } else {
      // Apply exponential backoff
      backoffDelayRef.current = Math.min(
        backoffDelayRef.current * 2,
        MAX_BACKOFF_DELAY
      )
      console.warn(
        `Background refresh failed (${consecutiveFailuresRef.current}/${MAX_CONSECUTIVE_FAILURES}). ` +
        `Next retry in ${backoffDelayRef.current / 1000}s`
      )
    }
  }, [])

  // Background refresh - non-interrupting with throttling
  const backgroundRefresh = useCallback(async () => {
    if (!currentZipCode || isRefreshingRef.current || isAutoRefreshPaused) {
      return
    }

    isRefreshingRef.current = true

    try {
      const data: WeatherData = await apiService.getWeatherByZip(currentZipCode)
      // Only update data, don't trigger loading state or clear errors for background refresh
      setWeatherData(data)
      resetFailureTracking()
    } catch (err) {
      // Handle failure with exponential backoff
      handleBackgroundFailure()
    } finally {
      isRefreshingRef.current = false
    }
  }, [currentZipCode, setWeatherData, isAutoRefreshPaused, resetFailureTracking, handleBackgroundFailure])

  // Manual refresh - resets failure tracking on success
  const refreshWeather = useCallback(async () => {
    if (!currentZipCode) return

    setLoading(true)
    setError(null)

    try {
      const data: WeatherData = await apiService.refreshWeather(currentZipCode)
      setWeatherData(data)
      resetFailureTracking() // Resume auto-refresh after successful manual refresh
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh weather data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentZipCode, setLoading, setError, setWeatherData, resetFailureTracking])

  // Set up background refresh with Page Visibility API and exponential backoff
  useEffect(() => {
    if (!currentZipCode || isAutoRefreshPaused) {
      // Clear timer if no ZIP code is set or auto-refresh is paused
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      return
    }

    // Use backoff delay if there have been failures, otherwise use normal interval
    const refreshDelay = consecutiveFailuresRef.current > 0
      ? backoffDelayRef.current
      : REFRESH_INTERVAL

    // Start refresh interval
    refreshTimerRef.current = setInterval(() => {
      // Only refresh if page is visible and not paused
      if (!document.hidden && !isAutoRefreshPaused) {
        backgroundRefresh()
      }
    }, refreshDelay)

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && currentZipCode && !isAutoRefreshPaused) {
        // Page became visible - refresh immediately
        backgroundRefresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentZipCode, backgroundRefresh, isAutoRefreshPaused])

  return {
    weatherData,
    isLoading,
    error,
    currentZipCode,
    fetchWeather,
    refreshWeather,
    isAutoRefreshPaused
  }
}