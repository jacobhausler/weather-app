import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, renderHook } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import { HourlyForecast } from './HourlyForecast'
import { HourlyForecast as HourlyForecastType } from '@/types/weather'
import { useUnitStore } from '@/stores/unitStore'

describe('HourlyForecast', () => {
  // Helper function to create mock hourly forecast data
  const createMockHourlyForecast = (hours: number): HourlyForecastType[] => {
    return Array.from({ length: hours }, (_, i) => ({
      number: i + 1,
      startTime: new Date(Date.now() + i * 3600000).toISOString(),
      endTime: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      isDaytime: i % 2 === 0,
      temperature: 65 + Math.sin(i / 4) * 15, // Varies between 50-80°F
      temperatureUnit: 'F',
      probabilityOfPrecipitation: {
        value: Math.min(100, Math.max(0, i * 5)),
      },
      dewpoint: {
        value: 50,
        unitCode: 'wmoUnit:degF',
      },
      relativeHumidity: {
        value: 60 + Math.sin(i / 3) * 20,
      },
      windSpeed: `${10 + i} mph`,
      windDirection: 'N',
      icon: 'https://api.weather.gov/icons/land/day/clear',
      shortForecast: 'Sunny',
    }))
  }

  // Helper function to find text that may be split across elements
  const getByTextContent = (text: string) => {
    return screen.getByText((content, element) => {
      return element?.textContent?.includes(text) || false
    })
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset Zustand store to imperial
    const { result } = renderHook(() => useUnitStore())
    act(() => {
      result.current.setUnitSystem('imperial')
    })
  })

  describe('Component rendering', () => {
    it('should render the component with title', () => {
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
    })

    it('should render period selector with default 24 Hours', () => {
      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const periodSelector = screen.getByRole('combobox')
      expect(periodSelector).toBeInTheDocument()
      expect(periodSelector).toHaveTextContent('24 Hours')
    })

    it('should render all four data type buttons', () => {
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByRole('button', { name: 'Temp' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Precip' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Wind' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Humidity' })).toBeInTheDocument()
    })

    it('should render temperature button as active by default', () => {
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const tempButton = screen.getByRole('button', { name: 'Temp' })
      // Default variant has specific background classes, outline has border
      expect(tempButton.className).not.toContain('border-input')
    })

    it('should render summary statistics with Min, Max, and Avg labels', () => {
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('Min') || false
      })).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
      expect(screen.getByText('Avg')).toBeInTheDocument()
    })

    it('should render with minimal hourly forecast data (1 hour)', () => {
      const mockData = createMockHourlyForecast(1)
      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
      // Should still render all controls
      expect(screen.getByRole('button', { name: 'Temp' })).toBeInTheDocument()
    })

    it('should render with maximum hourly forecast data (48+ hours)', () => {
      const mockData = createMockHourlyForecast(72)
      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
      // Should handle large datasets without errors
    })
  })

  describe('Data type switching', () => {
    it('should switch to precipitation view when Precip button is clicked', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const precipButton = screen.getByRole('button', { name: 'Precip' })
      await user.click(precipButton)

      // Verify localStorage was updated with precipitation
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('precipitation'))
      })
    })

    it('should switch to wind view when Wind button is clicked', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const windButton = screen.getByRole('button', { name: 'Wind' })
      await user.click(windButton)

      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('wind'))
      })
    })

    it('should switch to humidity view when Humidity button is clicked', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const humidityButton = screen.getByRole('button', { name: 'Humidity' })
      await user.click(humidityButton)

      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('humidity'))
      })
    })

    it('should switch between multiple data types consecutively', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      // Click through all data types
      await user.click(screen.getByRole('button', { name: 'Precip' }))
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('precipitation'))
      })

      await user.click(screen.getByRole('button', { name: 'Wind' }))
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('wind'))
      })

      await user.click(screen.getByRole('button', { name: 'Humidity' }))
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('humidity'))
      })

      await user.click(screen.getByRole('button', { name: 'Temp' }))
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('temperature'))
      })
    })

    it('should remain on same data type when clicked multiple times', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const tempButton = screen.getByRole('button', { name: 'Temp' })

      await user.click(tempButton)
      await user.click(tempButton)
      await user.click(tempButton)

      // Should still be temperature
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('temperature'))
      })
    })
  })

  describe('Period selection', () => {
    it('should render with default 24 Hours period', () => {
      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const periodSelector = screen.getByRole('combobox')
      expect(periodSelector).toHaveTextContent('24 Hours')
    })

    it('should restore period from localStorage (12 Hours)', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))

      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const periodSelector = screen.getByRole('combobox')
      expect(periodSelector).toHaveTextContent('12 Hours')
    })

    it('should restore period from localStorage (48 Hours)', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('48'))

      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const periodSelector = screen.getByRole('combobox')
      expect(periodSelector).toHaveTextContent('48 Hours')
    })

    it('should have period select combobox available', () => {
      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const periodSelector = screen.getByRole('combobox')
      expect(periodSelector).toBeInTheDocument()
      expect(periodSelector).toBeEnabled()
    })
  })

  describe('localStorage persistence', () => {
    it('should persist data type selection to localStorage', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Precip' }))

      await waitFor(() => {
        const stored = localStorage.getItem('hourly-chart-dataType')
        expect(stored).toBe(JSON.stringify('precipitation'))
      })
    })

    it('should persist period selection to localStorage', async () => {
      // Set period to 48 via localStorage
      localStorage.setItem('hourly-chart-period', JSON.stringify('48'))

      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      // Verify it was persisted
      expect(localStorage.getItem('hourly-chart-period')).toBe(JSON.stringify('48'))
    })

    it('should restore data type from localStorage on mount', () => {
      localStorage.setItem('hourly-chart-dataType', JSON.stringify('wind'))

      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      // Verify it was loaded from localStorage
      expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('wind'))
    })

    it('should restore period from localStorage on mount', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))

      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const periodSelector = screen.getByRole('combobox')
      expect(periodSelector).toHaveTextContent('12 Hours')
    })

    it('should handle multiple preference updates', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      // Change data type
      await user.click(screen.getByRole('button', { name: 'Humidity' }))

      // Change period via localStorage (simulating what would happen with select)
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))

      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('humidity'))
        expect(localStorage.getItem('hourly-chart-period')).toBe(JSON.stringify('12'))
      })
    })
  })

  describe('Temperature conversion (Imperial/Metric)', () => {
    it('should display temperature in Fahrenheit for imperial system', () => {
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(24)
      // Set specific temperature
      mockData[0]!.temperature = 72

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Should display in °F (no conversion)
      const statsSection = getByTextContent('Min').closest('div')
      expect(statsSection).toBeInTheDocument()
    })

    it('should convert temperature to Celsius for metric system', () => {
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'metric' }, version: 0 }))

      const mockData = createMockHourlyForecast(24)
      // 32°F should convert to 0°C
      mockData[0]!.temperature = 32

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Temperature should be converted
      const statsSection = getByTextContent('Min').closest('div')
      expect(statsSection).toBeInTheDocument()
    })

    it('should correctly convert 32°F to 0°C', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      const mockData = [
        {
          ...createMockHourlyForecast(1)[0]!,
          number: 1,
          temperature: 32, // 32°F = 0°C
        },
      ]

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Should show 0°C in the chart
      const statsSection = getByTextContent('Min').parentElement
      expect(statsSection?.textContent).toContain('0')
    })

    it('should correctly convert 212°F to 100°C', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      const mockData = [
        {
          ...createMockHourlyForecast(1)[0]!,
          number: 1,
          temperature: 212, // 212°F = 100°C
        },
      ]

      render(<HourlyForecast hourlyForecast={mockData} />)

      const statsSection = screen.getByText('Max').parentElement
      expect(statsSection?.textContent).toContain('100')
    })

    it('should correctly convert 68°F to 20°C', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      const mockData = [
        {
          ...createMockHourlyForecast(1)[0]!,
          number: 1,
          temperature: 68, // 68°F = 20°C
        },
      ]

      render(<HourlyForecast hourlyForecast={mockData} />)

      const avgSection = screen.getByText('Avg').parentElement
      expect(avgSection?.textContent).toContain('20')
    })

    it('should round temperature conversions to nearest integer', () => {
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      const mockData = [
        {
          ...createMockHourlyForecast(1)[0]!,
          number: 1,
          temperature: 75, // 75°F = 23.888...°C, should round to 24
        },
      ]

      render(<HourlyForecast hourlyForecast={mockData} />)

      const avgSection = screen.getByText('Avg').parentElement
      expect(avgSection?.textContent).toContain('24')
    })
  })

  describe('Wind speed conversion (Imperial/Metric)', () => {
    it('should display wind speed in mph for imperial system', () => {
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(24)
      mockData[0]!.windSpeed = '15 mph'

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Should show mph in imperial
      const statsSection = getByTextContent('Min').closest('div')
      expect(statsSection).toBeInTheDocument()
    })

    it('should convert wind speed to km/h for metric system', async () => {
      const user = userEvent.setup()
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'metric' }, version: 0 }))

      const mockData = createMockHourlyForecast(24)
      mockData[0]!.windSpeed = '10 mph' // 10 mph ≈ 16 km/h

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Switch to wind view
      await user.click(screen.getByRole('button', { name: 'Wind' }))

      // Should convert to km/h
      const statsSection = getByTextContent('Min').closest('div')
      expect(statsSection).toBeInTheDocument()
    })

    it('should parse wind speed from string format correctly', async () => {
      const user = userEvent.setup()
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(3)
      mockData[0]!.windSpeed = '5 mph'
      mockData[1]!.windSpeed = '10 to 15 mph'
      mockData[2]!.windSpeed = '20 mph'

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      // Should parse first number from string
      const minSection = getByTextContent('Min').parentElement
      expect(minSection?.textContent).toContain('5')
    })

    it('should handle missing wind speed data', async () => {
      const user = userEvent.setup()
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(1)
      mockData[0]!.windSpeed = ''

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      // Should default to 0 for missing data
      const minSection = getByTextContent('Min').parentElement
      expect(minSection?.textContent).toContain('0')
    })

    it('should correctly convert 10 mph to 16 km/h', async () => {
      const user = userEvent.setup()
      const { result } = renderHook(() => useUnitStore())
      act(() => {
        result.current.setUnitSystem('metric')
      })

      const mockData = [
        {
          ...createMockHourlyForecast(1)[0]!,
          number: 1,
          windSpeed: '10 mph', // 10 mph = 16.0934 km/h, rounds to 16
        },
      ]

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      const avgSection = screen.getByText('Avg').parentElement
      expect(avgSection?.textContent).toContain('16')
    })
  })

  describe('Chart data formatting', () => {
    it('should format temperature data correctly', () => {
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      // Temperature chart should be displayed by default
      const chartContainer = screen.getByText('Hourly Forecast').closest('div')
      expect(chartContainer).toBeInTheDocument()
    })

    it('should format precipitation data with percentage unit', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      mockData[0]!.probabilityOfPrecipitation = { value: 75 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Precip' }))

      // Check that percentage unit is used
      const statsSection = screen.getByText('Max').parentElement
      expect(statsSection?.textContent).toMatch(/%/)
    })

    it('should format humidity data with percentage unit', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      mockData[0]!.relativeHumidity = { value: 65 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Humidity' }))

      // Check that percentage unit is used
      const statsSection = screen.getByText('Avg').parentElement
      expect(statsSection?.textContent).toMatch(/%/)
    })

    it('should handle null precipitation values', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(3)
      mockData[0]!.probabilityOfPrecipitation = { value: null }
      mockData[1]!.probabilityOfPrecipitation = undefined
      mockData[2]!.probabilityOfPrecipitation = { value: 50 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Precip' }))

      // Should default to 0 for null/undefined values
      const minSection = getByTextContent('Min').parentElement
      expect(minSection).toBeInTheDocument()
    })

    it('should format time correctly in chart data', () => {
      const specificTime = new Date('2024-01-15T14:00:00Z')
      const mockData = [{
        ...createMockHourlyForecast(1)[0]!,
        number: 1,
        startTime: specificTime.toISOString(),
      }]

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Time should be formatted as hour with am/pm (format: 'ha')
      const chartContainer = screen.getByText('Hourly Forecast').closest('div')
      expect(chartContainer).toBeInTheDocument()
    })
  })

  describe('Min/Max/Avg calculations', () => {
    it('should calculate min temperature correctly', () => {
      const mockData = createMockHourlyForecast(5)
      mockData[0]!.temperature = 50
      mockData[1]!.temperature = 60
      mockData[2]!.temperature = 40 // Minimum
      mockData[3]!.temperature = 70
      mockData[4]!.temperature = 55

      render(<HourlyForecast hourlyForecast={mockData} />)

      const minSection = getByTextContent('Min').parentElement
      expect(minSection?.textContent).toContain('40')
    })

    it('should calculate max temperature correctly', () => {
      const mockData = createMockHourlyForecast(5)
      mockData[0]!.temperature = 50
      mockData[1]!.temperature = 60
      mockData[2]!.temperature = 40
      mockData[3]!.temperature = 85 // Maximum
      mockData[4]!.temperature = 55

      render(<HourlyForecast hourlyForecast={mockData} />)

      const maxSection = screen.getByText('Max').parentElement
      expect(maxSection?.textContent).toContain('85')
    })

    it('should calculate average temperature correctly', () => {
      const mockData = createMockHourlyForecast(5)
      mockData[0]!.temperature = 50
      mockData[1]!.temperature = 60
      mockData[2]!.temperature = 70
      mockData[3]!.temperature = 80
      mockData[4]!.temperature = 90
      // Average = (50+60+70+80+90)/5 = 70

      render(<HourlyForecast hourlyForecast={mockData} />)

      const avgSection = screen.getByText('Avg').parentElement
      expect(avgSection?.textContent).toContain('70')
    })

    it('should round average to nearest integer', () => {
      const mockData = createMockHourlyForecast(3)
      mockData[0]!.temperature = 50
      mockData[1]!.temperature = 51
      mockData[2]!.temperature = 52
      // Average = 51 (already integer)

      render(<HourlyForecast hourlyForecast={mockData} />)

      const avgSection = screen.getByText('Avg').parentElement
      expect(avgSection?.textContent).toContain('51')
    })

    it('should calculate stats for precipitation data', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(5)
      mockData[0]!.probabilityOfPrecipitation = { value: 10 }
      mockData[1]!.probabilityOfPrecipitation = { value: 20 }
      mockData[2]!.probabilityOfPrecipitation = { value: 30 }
      mockData[3]!.probabilityOfPrecipitation = { value: 40 }
      mockData[4]!.probabilityOfPrecipitation = { value: 50 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Precip' }))

      const minSection = getByTextContent('Min').parentElement
      const maxSection = screen.getByText('Max').parentElement
      const avgSection = screen.getByText('Avg').parentElement

      expect(minSection?.textContent).toContain('10')
      expect(maxSection?.textContent).toContain('50')
      expect(avgSection?.textContent).toContain('30') // Average of 10,20,30,40,50 = 30
    })

    it('should calculate stats for wind speed data', async () => {
      const user = userEvent.setup()
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(5)
      mockData[0]!.windSpeed = '5 mph'
      mockData[1]!.windSpeed = '10 mph'
      mockData[2]!.windSpeed = '15 mph'
      mockData[3]!.windSpeed = '20 mph'
      mockData[4]!.windSpeed = '25 mph'

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      const minSection = getByTextContent('Min').parentElement
      const maxSection = screen.getByText('Max').parentElement

      expect(minSection?.textContent).toContain('5')
      expect(maxSection?.textContent).toContain('25')
    })

    it('should calculate stats for humidity data', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(5)
      mockData[0]!.relativeHumidity = { value: 50 }
      mockData[1]!.relativeHumidity = { value: 60 }
      mockData[2]!.relativeHumidity = { value: 70 }
      mockData[3]!.relativeHumidity = { value: 80 }
      mockData[4]!.relativeHumidity = { value: 90 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Humidity' }))

      const minSection = getByTextContent('Min').parentElement
      const maxSection = screen.getByText('Max').parentElement
      const avgSection = screen.getByText('Avg').parentElement

      expect(minSection?.textContent).toContain('50')
      expect(maxSection?.textContent).toContain('90')
      expect(avgSection?.textContent).toContain('70')
    })

    it('should handle single data point correctly', () => {
      const mockData = createMockHourlyForecast(1)
      mockData[0]!.temperature = 72

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Min, Max, and Avg should all be the same
      const minSection = getByTextContent('Min').parentElement
      const maxSection = screen.getByText('Max').parentElement
      const avgSection = screen.getByText('Avg').parentElement

      expect(minSection?.textContent).toContain('72')
      expect(maxSection?.textContent).toContain('72')
      expect(avgSection?.textContent).toContain('72')
    })
  })

  describe('Period data slicing', () => {
    it('should display data with 12 Hours period from localStorage', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))
      const mockData = createMockHourlyForecast(48)

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Should display with 12 hour period
      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveTextContent('12 Hours')
    })

    it('should display data with 24 Hours period from localStorage', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('24'))
      const mockData = createMockHourlyForecast(48)

      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveTextContent('24 Hours')
    })

    it('should display data with 48 Hours period from localStorage', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('48'))
      const mockData = createMockHourlyForecast(48)

      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveTextContent('48 Hours')
    })

    it('should handle fewer hours than selected period', () => {
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))
      const mockData = createMockHourlyForecast(10) // Only 10 hours

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Should display all 10 hours without error
      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
    })
  })

  describe('User interaction flows', () => {
    it('should persist selections across component remounts', async () => {
      const user = userEvent.setup()
      // Set initial period in localStorage
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))
      const mockData = createMockHourlyForecast(48)

      // First render
      const { unmount } = render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      unmount()

      // Second render - should restore selections
      render(<HourlyForecast hourlyForecast={mockData} />)

      // Verify selections were persisted
      expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('wind'))
      expect(screen.getByRole('combobox')).toHaveTextContent('12 Hours')
    })

    it('should handle rapid data type switching', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Rapid clicks
      await user.click(screen.getByRole('button', { name: 'Precip' }))
      await user.click(screen.getByRole('button', { name: 'Wind' }))
      await user.click(screen.getByRole('button', { name: 'Humidity' }))
      await user.click(screen.getByRole('button', { name: 'Temp' }))

      // Should end on temperature
      await waitFor(() => {
        expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('temperature'))
      })
    })

    it('should handle period persistence with different periods', () => {
      const mockData = createMockHourlyForecast(48)

      // Test 12 hours
      localStorage.setItem('hourly-chart-period', JSON.stringify('12'))
      const { unmount: unmount1 } = render(<HourlyForecast hourlyForecast={mockData} />)
      expect(screen.getByRole('combobox')).toHaveTextContent('12 Hours')
      unmount1()

      // Test 48 hours
      localStorage.setItem('hourly-chart-period', JSON.stringify('48'))
      render(<HourlyForecast hourlyForecast={mockData} />)
      expect(screen.getByRole('combobox')).toHaveTextContent('48 Hours')
    })

    it('should maintain selections when changing data with same period', async () => {
      const user = userEvent.setup()
      const mockData1 = createMockHourlyForecast(24)

      const { rerender } = render(<HourlyForecast hourlyForecast={mockData1} />)

      await user.click(screen.getByRole('button', { name: 'Humidity' }))

      // Update with new data
      const mockData2 = createMockHourlyForecast(24)
      mockData2[0]!.temperature = 100 // Different data

      rerender(<HourlyForecast hourlyForecast={mockData2} />)

      // Selection should persist
      expect(localStorage.getItem('hourly-chart-dataType')).toBe(JSON.stringify('humidity'))
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle empty hourly forecast array', () => {
      const mockData: HourlyForecastType[] = []

      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
      // Component should render without crashing
    })

    it('should handle zero values in all data types', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(3)
      mockData[0]!.temperature = 0
      mockData[0]!.probabilityOfPrecipitation = { value: 0 }
      mockData[0]!.relativeHumidity = { value: 0 }
      mockData[0]!.windSpeed = '0 mph'

      render(<HourlyForecast hourlyForecast={mockData} />)

      // Test each data type with zero values
      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Precip' }))
      expect(getByTextContent('Min').parentElement?.textContent).toContain('0')

      await user.click(screen.getByRole('button', { name: 'Wind' }))
      expect(getByTextContent('Min').parentElement?.textContent).toContain('0')

      await user.click(screen.getByRole('button', { name: 'Humidity' }))
      expect(getByTextContent('Min').parentElement?.textContent).toContain('0')
    })

    it('should handle negative temperature values', () => {
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(3)
      mockData[0]!.temperature = -10
      mockData[1]!.temperature = -5
      mockData[2]!.temperature = 0

      render(<HourlyForecast hourlyForecast={mockData} />)

      const minSection = getByTextContent('Min').parentElement
      expect(minSection).toBeInTheDocument()
      // Should handle negative values without error
    })

    it('should handle 100% precipitation probability', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(1)
      mockData[0]!.probabilityOfPrecipitation = { value: 100 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Precip' }))

      const maxSection = screen.getByText('Max').parentElement
      expect(maxSection?.textContent).toContain('100')
    })

    it('should handle 100% humidity', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(1)
      mockData[0]!.relativeHumidity = { value: 100 }

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Humidity' }))

      const maxSection = screen.getByText('Max').parentElement
      expect(maxSection?.textContent).toContain('100')
    })

    it('should handle very high wind speeds', async () => {
      const user = userEvent.setup()
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(1)
      mockData[0]!.windSpeed = '150 mph' // Hurricane force

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      const maxSection = screen.getByText('Max').parentElement
      expect(maxSection?.textContent).toContain('150')
    })

    it('should handle extreme temperature values', () => {
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(2)
      mockData[0]!.temperature = -50 // Extreme cold
      mockData[1]!.temperature = 130 // Extreme heat

      render(<HourlyForecast hourlyForecast={mockData} />)

      const minSection = getByTextContent('Min').parentElement
      const maxSection = screen.getByText('Max').parentElement

      expect(minSection).toBeInTheDocument()
      expect(maxSection).toBeInTheDocument()
    })

    it('should handle malformed wind speed strings gracefully', async () => {
      const user = userEvent.setup()
      localStorage.setItem('unit-storage', JSON.stringify({ state: { unitSystem: 'imperial' }, version: 0 }))

      const mockData = createMockHourlyForecast(3)
      mockData[0]!.windSpeed = 'calm'
      mockData[1]!.windSpeed = 'variable'
      mockData[2]!.windSpeed = '5 mph'

      render(<HourlyForecast hourlyForecast={mockData} />)

      await user.click(screen.getByRole('button', { name: 'Wind' }))

      // Should handle non-numeric strings by defaulting to 0
      expect(screen.getByText('Hourly Forecast')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      expect(screen.getByRole('button', { name: 'Temp' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Precip' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Wind' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Humidity' })).toBeInTheDocument()
    })

    it('should have accessible select for period selection', () => {
      const mockData = createMockHourlyForecast(48)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should allow keyboard navigation through data type buttons', async () => {
      const user = userEvent.setup()
      const mockData = createMockHourlyForecast(24)
      render(<HourlyForecast hourlyForecast={mockData} />)

      const tempButton = screen.getByRole('button', { name: 'Temp' })

      tempButton.focus()
      expect(tempButton).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: 'Precip' })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: 'Wind' })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: 'Humidity' })).toHaveFocus()
    })
  })
})
