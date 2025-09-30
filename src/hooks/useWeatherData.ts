import { useEffect, useRef, useCallback } from 'react'
import { useWeatherStore } from '../stores/weatherStore'
import { apiService } from '../services/api'
import { WeatherData } from '../types/weather'

const REFRESH_INTERVAL = 60000 // 1 minute in milliseconds

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
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch weather data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setWeatherData, setZipCode, addRecentZipCode])

  // Background refresh - non-interrupting
  const backgroundRefresh = useCallback(async () => {
    if (!currentZipCode || isRefreshingRef.current) {
      return
    }

    isRefreshingRef.current = true

    try {
      const data: WeatherData = await apiService.getWeatherByZip(currentZipCode)
      // Only update data, don't trigger loading state or clear errors for background refresh
      setWeatherData(data)
    } catch (err) {
      // Silent fail for background refresh - don't interrupt user experience
      console.warn('Background refresh failed:', err)
    } finally {
      isRefreshingRef.current = false
    }
  }, [currentZipCode, setWeatherData])

  // Manual refresh
  const refreshWeather = useCallback(async () => {
    if (!currentZipCode) return

    setLoading(true)
    setError(null)

    try {
      const data: WeatherData = await apiService.refreshWeather(currentZipCode)
      setWeatherData(data)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh weather data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentZipCode, setLoading, setError, setWeatherData])

  // Set up background refresh with Page Visibility API
  useEffect(() => {
    if (!currentZipCode) {
      // Clear timer if no ZIP code is set
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      return
    }

    // Start refresh interval
    refreshTimerRef.current = setInterval(() => {
      // Only refresh if page is visible
      if (!document.hidden) {
        backgroundRefresh()
      }
    }, REFRESH_INTERVAL)

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && currentZipCode) {
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
  }, [currentZipCode, backgroundRefresh])

  return {
    weatherData,
    isLoading,
    error,
    currentZipCode,
    fetchWeather,
    refreshWeather
  }
}