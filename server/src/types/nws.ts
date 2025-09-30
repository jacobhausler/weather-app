// Type definitions for NWS API responses

export interface NWSPointsResponse {
  properties: {
    gridId: string
    gridX: number
    gridY: number
    forecast: string
    forecastHourly: string
    forecastGridData: string
    observationStations: string
    relativeLocation: {
      properties: {
        city: string
        state: string
      }
    }
    timeZone: string
    radarStation: string
  }
}

export interface NWSForecastResponse {
  properties: {
    updated: string
    units: string
    forecastGenerator: string
    generatedAt: string
    updateTime: string
    validTimes: string
    elevation: {
      value: number
      unitCode: string
    }
    periods: Array<{
      number: number
      name: string
      startTime: string
      endTime: string
      isDaytime: boolean
      temperature: number
      temperatureUnit: string
      temperatureTrend?: string
      probabilityOfPrecipitation?: {
        unitCode: string
        value: number | null
      }
      dewpoint?: {
        unitCode: string
        value: number
      }
      relativeHumidity?: {
        unitCode: string
        value: number
      }
      windSpeed: string
      windDirection: string
      icon: string
      shortForecast: string
      detailedForecast: string
    }>
  }
}

export interface NWSObservationResponse {
  properties: {
    timestamp: string
    textDescription: string
    icon: string
    presentWeather: Array<any>
    temperature: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    dewpoint: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    windDirection: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    windSpeed: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    windGust: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    barometricPressure: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    seaLevelPressure: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    visibility: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    maxTemperatureLast24Hours: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    minTemperatureLast24Hours: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    precipitationLastHour: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    precipitationLast3Hours: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    precipitationLast6Hours: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    relativeHumidity: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    windChill: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    heatIndex: {
      value: number | null
      unitCode: string
      qualityControl: string
    }
    cloudLayers?: Array<{
      base: {
        value: number | null
        unitCode: string
      }
      amount: string
    }>
  }
}

export interface NWSAlertsResponse {
  features: Array<{
    id: string
    properties: {
      id: string
      areaDesc: string
      geocode: {
        SAME: string[]
        UGC: string[]
      }
      affectedZones: string[]
      references: Array<any>
      sent: string
      effective: string
      onset: string
      expires: string
      ends: string
      status: string
      messageType: string
      category: string
      severity: string
      certainty: string
      urgency: string
      event: string
      sender: string
      senderName: string
      headline: string
      description: string
      instruction: string
      response: string
      parameters: Record<string, any>
    }
  }>
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}