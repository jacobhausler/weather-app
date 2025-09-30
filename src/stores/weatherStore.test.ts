import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useWeatherStore } from './weatherStore'
import { WeatherData } from '../types/weather'

describe('weatherStore', () => {
  // Clear store state and localStorage before each test
  beforeEach(() => {
    localStorage.clear()
    // Reset the store to initial state
    useWeatherStore.setState({
      currentZipCode: null,
      weatherData: null,
      isLoading: false,
      error: null,
      recentZipCodes: []
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useWeatherStore.getState()

      expect(state.currentZipCode).toBeNull()
      expect(state.weatherData).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.recentZipCodes).toEqual([])
    })

    it('should have all required action methods', () => {
      const state = useWeatherStore.getState()

      expect(typeof state.setZipCode).toBe('function')
      expect(typeof state.setWeatherData).toBe('function')
      expect(typeof state.setLoading).toBe('function')
      expect(typeof state.setError).toBe('function')
      expect(typeof state.addRecentZipCode).toBe('function')
      expect(typeof state.clearError).toBe('function')
    })
  })

  describe('setZipCode', () => {
    it('should update currentZipCode', () => {
      const { setZipCode } = useWeatherStore.getState()

      setZipCode('75454')

      const state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75454')
    })

    it('should allow changing ZIP code', () => {
      const { setZipCode } = useWeatherStore.getState()

      setZipCode('75454')
      expect(useWeatherStore.getState().currentZipCode).toBe('75454')

      setZipCode('75070')
      expect(useWeatherStore.getState().currentZipCode).toBe('75070')
    })

    it('should not affect other state properties', () => {
      const { setZipCode, setLoading, setError } = useWeatherStore.getState()

      setLoading(true)
      setError('Test error')
      setZipCode('75454')

      const state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(true)
      expect(state.error).toBe('Test error')
    })
  })

  describe('setWeatherData', () => {
    it('should update weatherData and clear error', () => {
      const { setWeatherData, setError } = useWeatherStore.getState()

      // Set an error first
      setError('Previous error')
      expect(useWeatherStore.getState().error).toBe('Previous error')

      const mockWeatherData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [{
          number: 1,
          name: 'Today',
          startTime: '2025-09-30T12:00:00-05:00',
          endTime: '2025-09-30T18:00:00-05:00',
          isDaytime: true,
          temperature: 85,
          temperatureUnit: 'F',
          windSpeed: '10 mph',
          windDirection: 'S',
          icon: 'https://api.weather.gov/icons/land/day/few',
          shortForecast: 'Sunny',
          detailedForecast: 'Sunny skies with temperatures near 85.'
        }],
        hourlyForecast: [{
          number: 1,
          startTime: '2025-09-30T12:00:00-05:00',
          endTime: '2025-09-30T13:00:00-05:00',
          isDaytime: true,
          temperature: 85,
          temperatureUnit: 'F',
          dewpoint: { value: 65, unitCode: 'wmoUnit:degC' },
          relativeHumidity: { value: 60 },
          windSpeed: '10 mph',
          windDirection: 'S',
          icon: 'https://api.weather.gov/icons/land/day/few',
          shortForecast: 'Sunny'
        }],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }

      setWeatherData(mockWeatherData)

      const state = useWeatherStore.getState()
      expect(state.weatherData).toEqual(mockWeatherData)
      expect(state.error).toBeNull()
    })

    it('should allow setting weatherData to null', () => {
      const { setWeatherData } = useWeatherStore.getState()

      const mockData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }

      setWeatherData(mockData)
      expect(useWeatherStore.getState().weatherData).toEqual(mockData)

      setWeatherData(null)
      expect(useWeatherStore.getState().weatherData).toBeNull()
    })

    it('should not affect other state properties except error', () => {
      const { setWeatherData, setZipCode, setLoading } = useWeatherStore.getState()

      setZipCode('75454')
      setLoading(true)

      const mockData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }

      setWeatherData(mockData)

      const state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(true)
      expect(state.weatherData).toEqual(mockData)
    })
  })

  describe('setLoading', () => {
    it('should update isLoading to true', () => {
      const { setLoading } = useWeatherStore.getState()

      setLoading(true)

      expect(useWeatherStore.getState().isLoading).toBe(true)
    })

    it('should update isLoading to false', () => {
      const { setLoading } = useWeatherStore.getState()

      setLoading(true)
      expect(useWeatherStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useWeatherStore.getState().isLoading).toBe(false)
    })

    it('should not affect other state properties', () => {
      const { setLoading, setZipCode, setError } = useWeatherStore.getState()

      setZipCode('75454')
      setError('Test error')
      setLoading(true)

      const state = useWeatherStore.getState()
      expect(state.isLoading).toBe(true)
      expect(state.currentZipCode).toBe('75454')
      expect(state.error).toBe('Test error')
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      const { setError } = useWeatherStore.getState()

      setError('Network error')

      expect(useWeatherStore.getState().error).toBe('Network error')
    })

    it('should allow setting error to null', () => {
      const { setError } = useWeatherStore.getState()

      setError('Error message')
      expect(useWeatherStore.getState().error).toBe('Error message')

      setError(null)
      expect(useWeatherStore.getState().error).toBeNull()
    })

    it('should allow overwriting existing error', () => {
      const { setError } = useWeatherStore.getState()

      setError('First error')
      expect(useWeatherStore.getState().error).toBe('First error')

      setError('Second error')
      expect(useWeatherStore.getState().error).toBe('Second error')
    })

    it('should not affect other state properties', () => {
      const { setError, setZipCode, setLoading } = useWeatherStore.getState()

      setZipCode('75454')
      setLoading(true)
      setError('Test error')

      const state = useWeatherStore.getState()
      expect(state.error).toBe('Test error')
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(true)
    })
  })

  describe('clearError', () => {
    it('should clear error', () => {
      const { setError, clearError } = useWeatherStore.getState()

      setError('Test error')
      expect(useWeatherStore.getState().error).toBe('Test error')

      clearError()
      expect(useWeatherStore.getState().error).toBeNull()
    })

    it('should work when no error is set', () => {
      const { clearError } = useWeatherStore.getState()

      expect(useWeatherStore.getState().error).toBeNull()

      clearError()
      expect(useWeatherStore.getState().error).toBeNull()
    })

    it('should not affect other state properties', () => {
      const { clearError, setZipCode, setLoading, setError } = useWeatherStore.getState()

      setZipCode('75454')
      setLoading(true)
      setError('Test error')

      clearError()

      const state = useWeatherStore.getState()
      expect(state.error).toBeNull()
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(true)
    })
  })

  describe('addRecentZipCode', () => {
    it('should add new ZIP code to recent list', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')

      expect(useWeatherStore.getState().recentZipCodes).toEqual(['75454'])
    })

    it('should add multiple ZIP codes in order', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75070')
      addRecentZipCode('75035')

      expect(useWeatherStore.getState().recentZipCodes).toEqual([
        '75035',
        '75070',
        '75454'
      ])
    })

    it('should limit recent ZIP codes to maximum of 5', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75070')
      addRecentZipCode('75035')
      addRecentZipCode('75001')
      addRecentZipCode('75002')
      addRecentZipCode('75003')

      const recentZips = useWeatherStore.getState().recentZipCodes
      expect(recentZips).toHaveLength(5)
      expect(recentZips).toEqual([
        '75003',
        '75002',
        '75001',
        '75035',
        '75070'
      ])
    })

    it('should move duplicate ZIP code to front', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75070')
      addRecentZipCode('75035')

      expect(useWeatherStore.getState().recentZipCodes).toEqual([
        '75035',
        '75070',
        '75454'
      ])

      // Add duplicate
      addRecentZipCode('75070')

      expect(useWeatherStore.getState().recentZipCodes).toEqual([
        '75070',
        '75035',
        '75454'
      ])
    })

    it('should remove duplicate from old position when moving to front', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75070')
      addRecentZipCode('75035')
      addRecentZipCode('75001')
      addRecentZipCode('75002')

      expect(useWeatherStore.getState().recentZipCodes).toEqual([
        '75002',
        '75001',
        '75035',
        '75070',
        '75454'
      ])

      // Re-add first ZIP (75454)
      addRecentZipCode('75454')

      const recentZips = useWeatherStore.getState().recentZipCodes
      expect(recentZips).toHaveLength(5)
      expect(recentZips).toEqual([
        '75454',
        '75002',
        '75001',
        '75035',
        '75070'
      ])
    })

    it('should maintain max 5 limit when re-adding duplicate', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      // Fill with 5 ZIPs
      addRecentZipCode('75454')
      addRecentZipCode('75070')
      addRecentZipCode('75035')
      addRecentZipCode('75001')
      addRecentZipCode('75002')

      // Re-add middle ZIP
      addRecentZipCode('75035')

      const recentZips = useWeatherStore.getState().recentZipCodes
      expect(recentZips).toHaveLength(5)
      expect(recentZips).toEqual([
        '75035',
        '75002',
        '75001',
        '75070',
        '75454'
      ])
    })

    it('should not affect other state properties', () => {
      const { addRecentZipCode, setZipCode, setLoading } = useWeatherStore.getState()

      setZipCode('75454')
      setLoading(true)
      addRecentZipCode('75454')

      const state = useWeatherStore.getState()
      expect(state.recentZipCodes).toEqual(['75454'])
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(true)
    })
  })

  describe('localStorage persistence', () => {
    it('should persist currentZipCode to localStorage', () => {
      const { setZipCode } = useWeatherStore.getState()

      setZipCode('75454')

      // Check localStorage directly
      const stored = localStorage.getItem('weather-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.currentZipCode).toBe('75454')
    })

    it('should persist recentZipCodes to localStorage', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75070')

      const stored = localStorage.getItem('weather-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.recentZipCodes).toEqual(['75070', '75454'])
    })

    it('should NOT persist weatherData to localStorage', () => {
      const { setWeatherData } = useWeatherStore.getState()

      const mockData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }

      setWeatherData(mockData)

      const stored = localStorage.getItem('weather-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.weatherData).toBeUndefined()
    })

    it('should NOT persist isLoading to localStorage', () => {
      const { setLoading } = useWeatherStore.getState()

      setLoading(true)

      const stored = localStorage.getItem('weather-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.isLoading).toBeUndefined()
    })

    it('should NOT persist error to localStorage', () => {
      const { setError } = useWeatherStore.getState()

      setError('Test error')

      const stored = localStorage.getItem('weather-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.error).toBeUndefined()
    })

    it('should restore state from localStorage on initialization', () => {
      // First, populate the store and verify it persists
      const { setZipCode, addRecentZipCode } = useWeatherStore.getState()

      setZipCode('75454')
      addRecentZipCode('75454')
      addRecentZipCode('75070')
      addRecentZipCode('75035')

      // Verify localStorage was populated
      const stored = localStorage.getItem('weather-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.currentZipCode).toBe('75454')
      expect(parsed.state.recentZipCodes).toEqual(['75035', '75070', '75454'])

      // Verify the store has the data
      const state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75454')
      expect(state.recentZipCodes).toEqual(['75035', '75070', '75454'])

      // These should still be default values (not persisted)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.weatherData).toBeNull()
    })

    it('should update localStorage when recentZipCodes changes', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')

      let stored = localStorage.getItem('weather-storage')
      let parsed = JSON.parse(stored!)
      expect(parsed.state.recentZipCodes).toEqual(['75454'])

      addRecentZipCode('75070')

      stored = localStorage.getItem('weather-storage')
      parsed = JSON.parse(stored!)
      expect(parsed.state.recentZipCodes).toEqual(['75070', '75454'])
    })
  })

  describe('partialize logic', () => {
    it('should only persist specified fields', () => {
      const { setZipCode, addRecentZipCode, setWeatherData, setLoading, setError } =
        useWeatherStore.getState()

      // Set all fields
      setZipCode('75454')
      addRecentZipCode('75454')
      setLoading(true)
      setError('Test error')

      const mockData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }
      setWeatherData(mockData)

      const stored = localStorage.getItem('weather-storage')
      const parsed = JSON.parse(stored!)

      // Should be persisted
      expect(parsed.state.currentZipCode).toBe('75454')
      expect(parsed.state.recentZipCodes).toEqual(['75454'])

      // Should NOT be persisted
      expect(parsed.state.isLoading).toBeUndefined()
      expect(parsed.state.error).toBeUndefined()
      expect(parsed.state.weatherData).toBeUndefined()
    })

    it('should have exactly two keys in persisted state', () => {
      const { setZipCode, addRecentZipCode } = useWeatherStore.getState()

      setZipCode('75454')
      addRecentZipCode('75454')

      const stored = localStorage.getItem('weather-storage')
      const parsed = JSON.parse(stored!)

      const stateKeys = Object.keys(parsed.state)
      expect(stateKeys).toHaveLength(2)
      expect(stateKeys).toContain('currentZipCode')
      expect(stateKeys).toContain('recentZipCodes')
    })
  })

  describe('store subscriptions', () => {
    it('should notify subscribers when state changes', () => {
      let notificationCount = 0
      let latestState = useWeatherStore.getState()

      const unsubscribe = useWeatherStore.subscribe((state) => {
        notificationCount++
        latestState = state
      })

      const { setZipCode } = useWeatherStore.getState()
      setZipCode('75454')

      expect(notificationCount).toBeGreaterThan(0)
      expect(latestState.currentZipCode).toBe('75454')

      unsubscribe()
    })

    it('should allow multiple subscribers', () => {
      let subscriber1Count = 0
      let subscriber2Count = 0

      const unsubscribe1 = useWeatherStore.subscribe(() => {
        subscriber1Count++
      })

      const unsubscribe2 = useWeatherStore.subscribe(() => {
        subscriber2Count++
      })

      const { setZipCode } = useWeatherStore.getState()
      setZipCode('75454')

      expect(subscriber1Count).toBeGreaterThan(0)
      expect(subscriber2Count).toBeGreaterThan(0)

      unsubscribe1()
      unsubscribe2()
    })

    it('should stop notifying after unsubscribe', () => {
      let notificationCount = 0

      const unsubscribe = useWeatherStore.subscribe(() => {
        notificationCount++
      })

      const { setZipCode } = useWeatherStore.getState()
      setZipCode('75454')

      const countAfterFirstUpdate = notificationCount

      unsubscribe()

      setZipCode('75070')

      // Count should not increase after unsubscribe
      expect(notificationCount).toBe(countAfterFirstUpdate)
    })
  })

  describe('state update interactions', () => {
    it('should handle typical weather fetch workflow', () => {
      const { setZipCode, setLoading, setWeatherData, addRecentZipCode } =
        useWeatherStore.getState()

      // Step 1: Set ZIP and start loading
      setZipCode('75454')
      setLoading(true)

      let state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(true)
      expect(state.weatherData).toBeNull()

      // Step 2: Data arrives
      const mockData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }

      setWeatherData(mockData)
      setLoading(false)
      addRecentZipCode('75454')

      state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75454')
      expect(state.isLoading).toBe(false)
      expect(state.weatherData).toEqual(mockData)
      expect(state.error).toBeNull()
      expect(state.recentZipCodes).toEqual(['75454'])
    })

    it('should handle error workflow', () => {
      const { setZipCode, setLoading, setError } = useWeatherStore.getState()

      // Start loading
      setZipCode('99999')
      setLoading(true)

      let state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('99999')
      expect(state.isLoading).toBe(true)

      // Error occurs
      setError('Invalid ZIP code')
      setLoading(false)

      state = useWeatherStore.getState()
      expect(state.error).toBe('Invalid ZIP code')
      expect(state.isLoading).toBe(false)
      expect(state.weatherData).toBeNull()

      // Clear error and retry
      const { clearError } = useWeatherStore.getState()
      clearError()
      setLoading(true)

      state = useWeatherStore.getState()
      expect(state.error).toBeNull()
      expect(state.isLoading).toBe(true)
    })

    it('should handle switching between ZIP codes', () => {
      const { setZipCode, setWeatherData, addRecentZipCode } = useWeatherStore.getState()

      // First ZIP
      setZipCode('75454')
      const mockData1: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }
      setWeatherData(mockData1)
      addRecentZipCode('75454')

      // Second ZIP
      setZipCode('75070')
      const mockData2: WeatherData = {
        ...mockData1,
        zipCode: '75070',
        coordinates: { latitude: 33.1, longitude: -96.8 }
      }
      setWeatherData(mockData2)
      addRecentZipCode('75070')

      const state = useWeatherStore.getState()
      expect(state.currentZipCode).toBe('75070')
      expect(state.weatherData?.zipCode).toBe('75070')
      expect(state.recentZipCodes).toEqual(['75070', '75454'])
    })

    it('should maintain independence between weatherData and error', () => {
      const { setWeatherData, setError } = useWeatherStore.getState()

      const mockData: WeatherData = {
        zipCode: '75454',
        coordinates: { latitude: 33.2, longitude: -96.6 },
        gridPoint: {
          gridId: 'FWD',
          gridX: 78,
          gridY: 106,
          forecast: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast',
          forecastHourly: 'https://api.weather.gov/gridpoints/FWD/78,106/forecast/hourly',
          observationStations: 'https://api.weather.gov/gridpoints/FWD/78,106/stations'
        },
        forecast: [],
        hourlyForecast: [],
        alerts: [],
        sunTimes: {
          sunrise: '2025-09-30T07:15:00-05:00',
          sunset: '2025-09-30T19:00:00-05:00',
          solarNoon: '2025-09-30T13:07:00-05:00',
          civilDawn: '2025-09-30T06:50:00-05:00',
          civilDusk: '2025-09-30T19:25:00-05:00'
        },
        lastUpdated: '2025-09-30T12:00:00Z'
      }

      // Set data and error
      setWeatherData(mockData)
      setError('Warning message')

      let state = useWeatherStore.getState()
      expect(state.weatherData).toEqual(mockData)
      expect(state.error).toBe('Warning message')

      // Update data - should clear error
      setWeatherData(mockData)

      state = useWeatherStore.getState()
      expect(state.weatherData).toEqual(mockData)
      expect(state.error).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle rapid successive updates', () => {
      const { setZipCode } = useWeatherStore.getState()

      setZipCode('75454')
      setZipCode('75070')
      setZipCode('75035')
      setZipCode('75001')

      expect(useWeatherStore.getState().currentZipCode).toBe('75001')
    })

    it('should handle adding same ZIP code multiple times consecutively', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75454')
      addRecentZipCode('75454')

      expect(useWeatherStore.getState().recentZipCodes).toEqual(['75454'])
    })

    it('should handle empty string ZIP code', () => {
      const { setZipCode } = useWeatherStore.getState()

      setZipCode('')

      expect(useWeatherStore.getState().currentZipCode).toBe('')
    })

    it('should handle empty string in recentZipCodes', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('')
      addRecentZipCode('75454')

      expect(useWeatherStore.getState().recentZipCodes).toEqual(['75454', ''])
    })

    it('should handle clearing and re-adding ZIP codes', () => {
      const { addRecentZipCode } = useWeatherStore.getState()

      addRecentZipCode('75454')
      addRecentZipCode('75070')

      expect(useWeatherStore.getState().recentZipCodes).toEqual(['75070', '75454'])

      // Reset store
      useWeatherStore.setState({ recentZipCodes: [] })

      expect(useWeatherStore.getState().recentZipCodes).toEqual([])

      addRecentZipCode('75035')

      expect(useWeatherStore.getState().recentZipCodes).toEqual(['75035'])
    })
  })
})
