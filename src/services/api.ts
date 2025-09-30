// API service for communicating with the backend
import { WeatherData } from '../types/weather'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface ApiError {
  message: string
  status?: number
  details?: unknown
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorData
        } as ApiError
      }

      return await response.json()
    } catch (error) {
      if ((error as ApiError).status) {
        throw error
      }
      throw {
        message: 'Network error: Unable to connect to server',
        details: error
      } as ApiError
    }
  }

  async getWeatherByZip(zipCode: string): Promise<WeatherData> {
    return this.fetchWithError(`${this.baseUrl}/api/weather/${zipCode}`)
  }

  async refreshWeather(zipCode: string): Promise<WeatherData> {
    return this.fetchWithError(`${this.baseUrl}/api/weather/${zipCode}/refresh`, {
      method: 'POST'
    })
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchWithError(`${this.baseUrl}/health`)
  }
}

export const apiService = new ApiService(API_BASE_URL)