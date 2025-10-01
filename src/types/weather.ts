// Type definitions for weather data from NWS API

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface GridPoint {
  gridId: string
  gridX: number
  gridY: number
  forecast: string
  forecastHourly: string
  observationStations: string
}

export interface ForecastPeriod {
  number: number
  name: string
  startTime: string
  endTime: string
  isDaytime: boolean
  temperature: number
  temperatureUnit: string
  temperatureTrend?: string
  probabilityOfPrecipitation?: {
    value: number | null
  }
  windSpeed: string
  windDirection: string
  icon: string
  shortForecast: string
  detailedForecast: string
}

export interface HourlyForecast {
  number: number
  startTime: string
  endTime: string
  isDaytime: boolean
  temperature: number
  temperatureUnit: string
  probabilityOfPrecipitation?: {
    value: number | null
  }
  dewpoint: {
    value: number
    unitCode: string
  }
  relativeHumidity: {
    value: number
  }
  windSpeed: string
  windDirection: string
  icon: string
  shortForecast: string
}

export interface Observation {
  timestamp: string
  temperature: {
    value: number | null
    unitCode: string
  }
  dewpoint: {
    value: number | null
    unitCode: string
  }
  windDirection: {
    value: number | null
  }
  windSpeed: {
    value: number | null
    unitCode: string
  }
  windGust: {
    value: number | null
    unitCode: string
  }
  barometricPressure: {
    value: number | null
    unitCode: string
  }
  visibility: {
    value: number | null
    unitCode: string
  }
  relativeHumidity: {
    value: number | null
  }
  heatIndex: {
    value: number | null
    unitCode: string
  }
  windChill: {
    value: number | null
    unitCode: string
  }
  cloudLayers?: Array<{
    base: {
      value: number | null
      unitCode: string
    }
    amount: string
  }>
}

export interface Alert {
  id: string
  areaDesc: string
  event: string
  headline: string
  description: string
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown'
  onset: string
  expires: string
  status: string
  messageType: string
  category: string
}

export interface SunTimes {
  sunrise: string // ISO 8601 timestamp
  sunset: string // ISO 8601 timestamp
  solarNoon: string // ISO 8601 timestamp
  civilDawn: string // ISO 8601 timestamp
  civilDusk: string // ISO 8601 timestamp
}

export interface WeatherData {
  zipCode: string
  coordinates: Coordinates
  gridPoint: GridPoint
  forecast: ForecastPeriod[]
  hourlyForecast: HourlyForecast[]
  currentObservation?: Observation
  alerts: Alert[]
  sunTimes: SunTimes
  lastUpdated: string
}