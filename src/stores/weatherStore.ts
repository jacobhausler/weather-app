import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WeatherData } from '../types/weather'

interface WeatherState {
  currentZipCode: string | null
  weatherData: WeatherData | null
  isLoading: boolean
  error: string | null
  recentZipCodes: string[]
  setZipCode: (zipCode: string) => void
  setWeatherData: (data: WeatherData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addRecentZipCode: (zipCode: string) => void
  clearError: () => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      currentZipCode: null,
      weatherData: null,
      isLoading: false,
      error: null,
      recentZipCodes: [],

      setZipCode: (zipCode) => set({ currentZipCode: zipCode }),

      setWeatherData: (data) => set({ weatherData: data, error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      addRecentZipCode: (zipCode) =>
        set((state) => {
          const filtered = state.recentZipCodes.filter((z) => z !== zipCode)
          return {
            recentZipCodes: [zipCode, ...filtered].slice(0, 5) // Keep last 5
          }
        })
    }),
    {
      name: 'weather-storage',
      // Only persist recent ZIP codes and current ZIP code
      partialize: (state) => ({
        recentZipCodes: state.recentZipCodes,
        currentZipCode: state.currentZipCode
      })
    }
  )
)