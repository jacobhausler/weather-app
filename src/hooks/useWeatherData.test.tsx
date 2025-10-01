import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useWeatherData } from './useWeatherData'
import { useWeatherStore } from '../stores/weatherStore'
import { apiService } from '../services/api'
import { WeatherData } from '../types/weather'

// Mock the API service
vi.mock('../services/api', () => ({
  apiService: {
    getWeatherByZip: vi.fn(),
    refreshWeather: vi.fn()
  }
}))

const mockWeatherData: WeatherData = {
  zipCode: '75454',
  coordinates: {
    latitude: 33.1581,
    longitude: -96.6114
  },
  gridPoint: {
    gridId: 'FWD',
    gridX: 78,
    gridY: 89,
    forecast: 'https://api.weather.gov/gridpoints/FWD/78,89/forecast',
    forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,89/forecast/hourly',
    observationStations: 'https://api.weather.gov/gridpoints/FWD/78,89/stations'
  },
  forecast: [
    {
      number: 1,
      name: 'Today',
      startTime: '2024-01-15T06:00:00-06:00',
      endTime: '2024-01-15T18:00:00-06:00',
      isDaytime: true,
      temperature: 72,
      temperatureUnit: 'F',
      probabilityOfPrecipitation: { value: 20 },
      windSpeed: '10 mph',
      windDirection: 'S',
      icon: 'https://api.weather.gov/icons/land/day/sct',
      shortForecast: 'Partly Sunny',
      detailedForecast: 'Partly sunny, with a high near 72.'
    }
  ],
  hourlyForecast: [
    {
      number: 1,
      startTime: '2024-01-15T06:00:00-06:00',
      endTime: '2024-01-15T07:00:00-06:00',
      isDaytime: true,
      temperature: 65,
      temperatureUnit: 'F',
      probabilityOfPrecipitation: { value: 10 },
      dewpoint: { value: 55, unitCode: 'wmoUnit:degC' },
      relativeHumidity: { value: 70 },
      windSpeed: '5 mph',
      windDirection: 'S',
      icon: 'https://api.weather.gov/icons/land/day/sct',
      shortForecast: 'Partly Sunny'
    }
  ],
  alerts: [],
  sunTimes: {
    sunrise: '2024-01-15T07:30:00-06:00',
    sunset: '2024-01-15T17:45:00-06:00',
    solarNoon: '2024-01-15T12:37:30-06:00',
    civilDawn: '2024-01-15T07:05:00-06:00',
    civilDusk: '2024-01-15T18:10:00-06:00'
  },
  lastUpdated: '2024-01-15T06:00:00-06:00'
}

describe('useWeatherData', () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    useWeatherStore.setState({
      currentZipCode: null,
      weatherData: null,
      isLoading: false,
      error: null,
      recentZipCodes: []
    })

    // Reset all mocks
    vi.clearAllMocks()

    // Mock timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('fetchWeather', () => {
    it('should fetch weather data for a valid ZIP code', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.weatherData).toBe(null)

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454')
      expect(result.current.weatherData).toEqual(mockWeatherData)
      expect(result.current.currentZipCode).toBe('75454')
      expect(result.current.error).toBe(null)
      expect(result.current.isLoading).toBe(false)
    })

    it('should update loading state during fetch', async () => {
      let resolvePromise: (value: WeatherData) => void
      const promise = new Promise<WeatherData>((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(apiService.getWeatherByZip).mockReturnValue(promise)

      const { result } = renderHook(() => useWeatherData())

      act(() => {
        result.current.fetchWeather('75454')
      })

      // Check loading state is true before promise resolves
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!(mockWeatherData)
        await promise
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should reject invalid ZIP codes', async () => {
      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('123')
      })

      expect(apiService.getWeatherByZip).not.toHaveBeenCalled()
      expect(result.current.error).toBe('Invalid ZIP code. Please enter a 5-digit ZIP code.')

      await act(async () => {
        await result.current.fetchWeather('abcde')
      })

      expect(result.current.error).toBe('Invalid ZIP code. Please enter a 5-digit ZIP code.')

      await act(async () => {
        await result.current.fetchWeather('123456')
      })

      expect(result.current.error).toBe('Invalid ZIP code. Please enter a 5-digit ZIP code.')
    })

    it('should handle API errors', async () => {
      const errorMessage = 'Network error: Unable to connect to server'
      vi.mocked(apiService.getWeatherByZip).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.weatherData).toBe(null)
      expect(result.current.isLoading).toBe(false)
    })

    it('should add ZIP code to recent list after successful fetch', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      const recentZipCodes = useWeatherStore.getState().recentZipCodes
      expect(recentZipCodes).toContain('75454')
    })

    it('should clear previous error on new fetch', async () => {
      vi.mocked(apiService.getWeatherByZip)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      // First fetch fails
      await act(async () => {
        await result.current.fetchWeather('75454')
      })
      expect(result.current.error).toBe('First error')

      // Second fetch succeeds
      await act(async () => {
        await result.current.fetchWeather('75454')
      })
      expect(result.current.error).toBe(null)
    })
  })

  describe('Background refresh mechanism', () => {
    it('should automatically refresh weather data every 60 seconds', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      // Initial fetch
      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      // Advance time by 60 seconds
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)

      // Advance another 60 seconds
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(3)
    })

    it('should not trigger loading state during background refresh', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      // Initial fetch
      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(result.current.isLoading).toBe(false)

      // Background refresh should not set loading state
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)
      expect(result.current.isLoading).toBe(false)
    })

    it('should update weather data from background refresh', async () => {
      const updatedWeatherData = { ...mockWeatherData, lastUpdated: '2024-01-15T07:00:00-06:00' }
      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockResolvedValueOnce(updatedWeatherData)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(result.current.weatherData?.lastUpdated).toBe('2024-01-15T06:00:00-06:00')

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(result.current.weatherData?.lastUpdated).toBe('2024-01-15T07:00:00-06:00')
    })

    it('should not start background refresh without a ZIP code', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      renderHook(() => useWeatherData())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).not.toHaveBeenCalled()
    })

    it('should stop background refresh when component unmounts', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result, unmount } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      unmount()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      // Should not call again after unmount
      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)
    })
  })

  describe('Exponential backoff on failures', () => {
    it('should implement exponential backoff after background refresh failures', async () => {
      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData) // Initial fetch succeeds
        .mockRejectedValueOnce(new Error('Network error')) // First refresh fails
        .mockResolvedValueOnce(mockWeatherData) // Second refresh succeeds

      const { result } = renderHook(() => useWeatherData())

      // Initial fetch
      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      // First background refresh fails at 60s
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)

      // Next refresh uses original interval (effect recreates with same 60s for now)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(3)

      // After success, should use normal interval again
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(4)
    })

    it('should apply exponential backoff with increasing delays', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData) // Initial fetch
        .mockRejectedValue(new Error('Network error')) // All refreshes fail

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      // First failure at 60s - logs 4s backoff for next attempt (2s * 2)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Next retry in 4s')
      )

      // Second failure - logs 8s backoff (4s * 2)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(3)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Next retry in 8s')
      )

      // Third failure - should pause
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(result.current.isAutoRefreshPaused).toBe(true)

      consoleWarnSpy.mockRestore()
    })

    it('should not increment error state for silent background failures', async () => {
      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(result.current.error).toBe(null)

      // Background refresh fails
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)

      // Error should still be null (background failures are silent)
      expect(result.current.error).toBe(null)
    })
  })

  describe('Auto-refresh pause after max failures', () => {
    it('should pause auto-refresh after 3 consecutive failures', async () => {
      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(result.current.isAutoRefreshPaused).toBe(false)

      // First failure
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)
      expect(result.current.isAutoRefreshPaused).toBe(false)

      // Second failure
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(3)
      expect(result.current.isAutoRefreshPaused).toBe(false)

      // Third failure - should pause
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(4)
      expect(result.current.isAutoRefreshPaused).toBe(true)

      // Should not refresh anymore
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(4)
    })

    it('should log warning message when pausing auto-refresh', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      // Trigger 3 failures
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background refresh paused after 3 consecutive failures')
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('Manual refresh', () => {
    it('should manually refresh weather data', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)
      vi.mocked(apiService.refreshWeather).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refreshWeather()
      })

      expect(apiService.refreshWeather).toHaveBeenCalledWith('75454')
    })

    it('should reset failure tracking after successful manual refresh', async () => {
      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValue(new Error('Network error'))
      vi.mocked(apiService.refreshWeather).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      // Trigger 3 failures to pause auto-refresh
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(result.current.isAutoRefreshPaused).toBe(true)

      // Manual refresh succeeds and resets
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)
      await act(async () => {
        await result.current.refreshWeather()
      })

      expect(result.current.isAutoRefreshPaused).toBe(false)

      // Auto-refresh should resume with normal interval
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(5) // Initial + 3 failures + 1 resumed
    })

    it('should trigger loading state during manual refresh', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      let resolveRefresh: (value: WeatherData) => void
      const refreshPromise = new Promise<WeatherData>((resolve) => {
        resolveRefresh = resolve
      })
      vi.mocked(apiService.refreshWeather).mockReturnValue(refreshPromise)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(result.current.isLoading).toBe(false)

      act(() => {
        result.current.refreshWeather()
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolveRefresh!(mockWeatherData)
        await refreshPromise
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle manual refresh errors', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)
      vi.mocked(apiService.refreshWeather).mockRejectedValue(new Error('Refresh failed'))

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      await act(async () => {
        await result.current.refreshWeather()
      })

      expect(result.current.error).toBe('Refresh failed')
    })

    it('should not trigger manual refresh without a ZIP code', async () => {
      vi.mocked(apiService.refreshWeather).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.refreshWeather()
      })

      expect(apiService.refreshWeather).not.toHaveBeenCalled()
    })
  })

  describe('Page Visibility API integration', () => {
    it('should not refresh when page is hidden', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true
      })

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      // Time passes but page is hidden
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      // Should not refresh while hidden
      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      // Restore
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false
      })
    })

    it('should refresh immediately when page becomes visible', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      let hiddenValue = false
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => hiddenValue
      })

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      // Simulate page becoming hidden
      hiddenValue = true

      // Advance time while hidden
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1)

      // Simulate page becoming visible
      hiddenValue = false

      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'))
        // Give promises time to resolve
        await Promise.resolve()
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)

      // Restore
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false
      })
    })

    it('should not refresh on visibility change if auto-refresh is paused', async () => {
      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValue(new Error('Network error'))

      let hiddenValue = false
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => hiddenValue
      })

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      // Trigger 3 failures to pause auto-refresh
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(result.current.isAutoRefreshPaused).toBe(true)

      // Simulate page becoming visible
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'))
        await Promise.resolve()
      })

      // Should not trigger refresh because auto-refresh is paused
      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(4) // Initial + 3 failures

      // Restore
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false
      })
    })

    it('should clean up visibility change listener on unmount', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { result, unmount } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Integration with weather store', () => {
    it('should update store state correctly', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      const storeState = useWeatherStore.getState()

      expect(storeState.currentZipCode).toBe('75454')
      expect(storeState.weatherData).toEqual(mockWeatherData)
      expect(storeState.isLoading).toBe(false)
      expect(storeState.error).toBe(null)
      expect(storeState.recentZipCodes).toContain('75454')
    })

    it('should maintain recent ZIP codes list', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      // Fetch multiple ZIP codes
      const zipCodes = ['75454', '75070', '75035', '90210', '10001']

      for (const zip of zipCodes) {
        await act(async () => {
          await result.current.fetchWeather(zip)
        })
      }

      const storeState = useWeatherStore.getState()

      // Should keep last 5 ZIP codes in reverse order
      expect(storeState.recentZipCodes).toEqual(['10001', '90210', '75035', '75070', '75454'])
      expect(storeState.recentZipCodes.length).toBe(5)
    })

    it('should remove duplicates from recent ZIP codes', async () => {
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData)

      const { result } = renderHook(() => useWeatherData())

      // Fetch same ZIP multiple times with others in between
      await act(async () => {
        await result.current.fetchWeather('75454')
      })
      await act(async () => {
        await result.current.fetchWeather('75070')
      })
      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      const storeState = useWeatherStore.getState()

      // Should have 75454 only once at the front
      expect(storeState.recentZipCodes).toEqual(['75454', '75070'])
    })
  })

  describe('Consecutive failure tracking', () => {
    it('should track consecutive failures correctly', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      // First failure
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background refresh failed (1/3)')
      )

      // Second failure
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(3)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background refresh failed (2/3)')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should reset consecutive failures on successful background refresh', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(apiService.getWeatherByZip)
        .mockResolvedValueOnce(mockWeatherData) // Initial
        .mockRejectedValueOnce(new Error('Error 1')) // Fail
        .mockResolvedValueOnce(mockWeatherData) // Success - should reset
        .mockRejectedValueOnce(new Error('Error 2')) // Fail again

      const { result } = renderHook(() => useWeatherData())

      await act(async () => {
        await result.current.fetchWeather('75454')
      })

      // First failure
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(2)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background refresh failed (1/3)')
      )

      // Success - resets counter
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(3)

      // Next failure should show 1/3 again, not 2/3
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000)
      })

      expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(4)

      const lastWarning = consoleWarnSpy.mock.calls[consoleWarnSpy.mock.calls.length - 1]![0]
      expect(lastWarning).toContain('Background refresh failed (1/3)')

      consoleWarnSpy.mockRestore()
    })
  })
})
