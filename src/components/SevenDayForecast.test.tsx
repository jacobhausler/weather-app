import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SevenDayForecast } from './SevenDayForecast'
import { ForecastPeriod } from '@/types/weather'
import { useUnitStore } from '@/stores/unitStore'
import userEvent from '@testing-library/user-event'

// Mock the ForecastModal component
vi.mock('./ForecastModal', () => ({
  ForecastModal: ({ period, open, onClose }: any) => {
    if (!open || !period) return null
    return (
      <div data-testid="forecast-modal">
        <div data-testid="modal-period-name">{period.name}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    )
  }
}))

const createMockForecastPeriod = (overrides: Partial<ForecastPeriod> = {}): ForecastPeriod => ({
  number: 1,
  name: 'Monday',
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
  detailedForecast: 'Partly sunny, with a high near 72.',
  ...overrides
})

describe('SevenDayForecast', () => {
  beforeEach(() => {
    // Reset unit store to imperial before each test
    useUnitStore.setState({ unitSystem: 'imperial' })
  })

  describe('Rendering with forecast data', () => {
    it('should render the 7-Day Forecast card title', () => {
      const forecast = [createMockForecastPeriod()]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('7-Day Forecast')).toBeInTheDocument()
    })

    it('should render day forecast cards', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Monday', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Monday Night', isDaytime: false, temperature: 55 })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // First period shows "Today" instead of the day name
      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('should render weather icons for each day', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          name: 'Monday',
          icon: 'https://api.weather.gov/icons/land/day/sunny',
          shortForecast: 'Sunny'
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const icon = screen.getByAltText('Sunny')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('src', 'https://api.weather.gov/icons/land/day/sunny')
    })

    it('should render short forecast text for each day', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, shortForecast: 'Partly Cloudy' })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('Partly Cloudy')).toBeInTheDocument()
    })

    it('should limit display to 7 days even with more forecast periods', () => {
      const forecast = Array.from({ length: 20 }, (_, i) =>
        createMockForecastPeriod({
          number: i + 1,
          name: `Day ${i + 1}`,
          isDaytime: i % 2 === 0
        })
      )
      render(<SevenDayForecast forecast={forecast} />)

      // Should only render 7 day buttons
      const dayButtons = screen.getAllByRole('button')
      expect(dayButtons.length).toBeLessThanOrEqual(7)
    })

    it('should render empty forecast gracefully', () => {
      render(<SevenDayForecast forecast={[]} />)

      expect(screen.getByText('7-Day Forecast')).toBeInTheDocument()
      // No day cards should be present
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Day name extraction', () => {
    it('should display "Today" for the first forecast period', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Today', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('should extract day name from "Monday Night" format', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Tuesday', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Tuesday Night', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Wednesday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // First shows Today, second shows Wednesday
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Wednesday')).toBeInTheDocument()
      expect(screen.queryByText('Tuesday Night')).not.toBeInTheDocument()
    })

    it('should extract day name from "Monday Afternoon" format', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'This Afternoon', isDaytime: true }),
        createMockForecastPeriod({ number: 3, name: 'Wednesday Afternoon', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Wednesday')).toBeInTheDocument()
    })

    it('should handle various day names correctly', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Thursday', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Thursday Night', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Friday', isDaytime: true }),
        createMockForecastPeriod({ number: 4, name: 'Friday Night', isDaytime: false }),
        createMockForecastPeriod({ number: 5, name: 'Saturday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // First is Today, then Friday and Saturday
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Friday')).toBeInTheDocument()
      expect(screen.getByText('Saturday')).toBeInTheDocument()
    })
  })

  describe('Temperature display and conversion', () => {
    it('should display high temperature in Fahrenheit for imperial system', () => {
      useUnitStore.setState({ unitSystem: 'imperial' })
      const forecast = [
        createMockForecastPeriod({ number: 1, temperature: 75, isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/75°F/)).toBeInTheDocument()
    })

    it('should display low temperature when night period exists', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, temperature: 80, isDaytime: true }),
        createMockForecastPeriod({ number: 2, temperature: 60, isDaytime: false })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/80°F/)).toBeInTheDocument()
      expect(screen.getByText(/60°F/)).toBeInTheDocument()
    })

    it('should not display low temperature when night period is missing', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, temperature: 75, isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const container = screen.getByRole('button')
      const temps = within(container).getAllByText(/°F/)
      // Only high temperature should be displayed
      expect(temps.length).toBe(1)
    })

    it('should convert temperatures to Celsius in metric system', () => {
      useUnitStore.setState({ unitSystem: 'metric' })
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          temperature: 77, // 77°F = 25°C
          isDaytime: true
        }),
        createMockForecastPeriod({
          number: 2,
          temperature: 59, // 59°F = 15°C
          isDaytime: false
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/25°C/)).toBeInTheDocument()
      expect(screen.getByText(/15°C/)).toBeInTheDocument()
    })

    it('should round temperatures correctly when converting', () => {
      useUnitStore.setState({ unitSystem: 'metric' })
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          temperature: 72, // 72°F = 22.22°C, should round to 22
          isDaytime: true
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/22°C/)).toBeInTheDocument()
    })

    it('should handle freezing temperatures correctly', () => {
      useUnitStore.setState({ unitSystem: 'metric' })
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          temperature: 32, // 32°F = 0°C
          isDaytime: true
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/0°C/)).toBeInTheDocument()
    })

    it('should handle negative temperatures correctly', () => {
      useUnitStore.setState({ unitSystem: 'imperial' })
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          temperature: -5,
          isDaytime: true
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/-5°F/)).toBeInTheDocument()
    })
  })

  describe('Precipitation display', () => {
    it('should display precipitation probability when available', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: { value: 45 }
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should display zero precipitation probability', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: { value: 0 }
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should not display precipitation when value is null', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: { value: null }
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Droplets icon should not be present
      const container = screen.getByRole('button')
      const precipText = within(container).queryByText(/%/)
      expect(precipText).not.toBeInTheDocument()
    })

    it('should not display precipitation when undefined', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: undefined
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const container = screen.getByRole('button')
      const precipText = within(container).queryByText(/%/)
      expect(precipText).not.toBeInTheDocument()
    })

    it('should display 100% precipitation probability', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: { value: 100 }
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Wind parsing and display', () => {
    it('should display wind direction and speed', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windDirection: 'NE',
          windSpeed: '15 mph'
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/NE/)).toBeInTheDocument()
      expect(screen.getByText(/15 mph/)).toBeInTheDocument()
    })

    it('should convert wind speed to km/h in metric system', () => {
      useUnitStore.setState({ unitSystem: 'metric' })
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windDirection: 'SW',
          windSpeed: '10 mph' // 10 mph = 16 km/h
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/SW/)).toBeInTheDocument()
      expect(screen.getByText(/16 km\/h/)).toBeInTheDocument()
    })

    it('should handle wind speed ranges', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windSpeed: '10 to 15 mph'
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Should extract and convert first number
      expect(screen.getByText(/10/)).toBeInTheDocument()
    })

    it('should handle various wind directions', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, windDirection: 'N', isDaytime: true }),
        createMockForecastPeriod({ number: 3, windDirection: 'NNW', isDaytime: true }),
        createMockForecastPeriod({ number: 5, windDirection: 'ESE', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/N\s/)).toBeInTheDocument()
      expect(screen.getByText(/NNW/)).toBeInTheDocument()
      expect(screen.getByText(/ESE/)).toBeInTheDocument()
    })

    it('should convert larger wind speeds correctly', () => {
      useUnitStore.setState({ unitSystem: 'metric' })
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windSpeed: '25 mph' // 25 mph = 40 km/h
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/40 km\/h/)).toBeInTheDocument()
    })

    it('should handle calm wind conditions', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windSpeed: '0 mph',
          windDirection: 'Calm'
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/Calm/)).toBeInTheDocument()
      expect(screen.getByText(/0 mph/)).toBeInTheDocument()
    })
  })

  describe('Modal trigger on day click', () => {
    it('should open modal when day card is clicked', async () => {
      const user = userEvent.setup()
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Monday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButton = screen.getByRole('button')
      await user.click(dayButton)

      expect(screen.getByTestId('forecast-modal')).toBeInTheDocument()
    })

    it('should pass correct period data to modal', async () => {
      const user = userEvent.setup()
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Today', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Tonight', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Tuesday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButtons = screen.getAllByRole('button')
      await user.click(dayButtons[1]!) // Click Tuesday

      expect(screen.getByTestId('modal-period-name')).toHaveTextContent('Tuesday')
    })

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup()
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Today', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Tonight', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Wednesday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButtons = screen.getAllByRole('button')
      await user.click(dayButtons[1]!) // Click Wednesday

      expect(screen.getByTestId('forecast-modal')).toBeInTheDocument()

      const closeButton = screen.getByTestId('modal-close')
      await user.click(closeButton)

      expect(screen.queryByTestId('forecast-modal')).not.toBeInTheDocument()
    })

    it('should allow clicking different day cards and update modal', async () => {
      const user = userEvent.setup()
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Today', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Tonight', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Thursday', isDaytime: true }),
        createMockForecastPeriod({ number: 4, name: 'Thursday Night', isDaytime: false }),
        createMockForecastPeriod({ number: 5, name: 'Friday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButtons = screen.getAllByRole('button')

      // Click first day (Today)
      await user.click(dayButtons[0]!)
      expect(screen.getByTestId('modal-period-name')).toHaveTextContent('Today')

      // Close modal
      await user.click(screen.getByTestId('modal-close'))

      // Click second day (Thursday)
      await user.click(dayButtons[1]!)
      expect(screen.getByTestId('modal-period-name')).toHaveTextContent('Thursday')
    })

    it('should only trigger modal for daytime periods', async () => {
      const user = userEvent.setup()
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Today', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Tonight', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Saturday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButtons = screen.getAllByRole('button')
      await user.click(dayButtons[1]!) // Click Saturday

      // Modal should open with the day period, not night
      expect(screen.getByTestId('modal-period-name')).toHaveTextContent('Saturday')
    })
  })

  describe('Empty and missing data handling', () => {
    it('should handle empty forecast array', () => {
      render(<SevenDayForecast forecast={[]} />)

      expect(screen.getByText('7-Day Forecast')).toBeInTheDocument()
      expect(screen.queryAllByRole('button').length).toBe(0)
    })

    it('should handle forecast with only night periods', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Monday Night', isDaytime: false })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Should not group since there's no day period
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should handle day period without night period', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Today', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Tonight', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Sunday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('Sunday')).toBeInTheDocument()
      // Sunday should only show high temp, not low
      const buttons = screen.getAllByRole('button')
      const sundayButton = buttons.find(button => within(button).queryByText('Sunday'))
      expect(sundayButton).toBeDefined()
      const temps = within(sundayButton!).getAllByText(/°F/)
      expect(temps.length).toBe(1)
    })

    it('should handle missing precipitation data gracefully', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: undefined
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Should still render the day card without precipitation
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle missing icon data', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          icon: '',
          shortForecast: 'Unknown'
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const icon = screen.getByAltText('Unknown')
      expect(icon).toHaveAttribute('src', '')
    })

    it('should handle unusual forecast period count', () => {
      // Only 3 day periods
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Day 1', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Day 1 Night', isDaytime: false }),
        createMockForecastPeriod({ number: 3, name: 'Day 2', isDaytime: true }),
        createMockForecastPeriod({ number: 4, name: 'Day 2 Night', isDaytime: false }),
        createMockForecastPeriod({ number: 5, name: 'Day 3', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButtons = screen.getAllByRole('button')
      expect(dayButtons.length).toBe(3)
    })
  })

  describe('Day/Night grouping logic', () => {
    it('should group consecutive day and night periods together', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Monday', isDaytime: true, temperature: 75 }),
        createMockForecastPeriod({ number: 2, name: 'Monday Night', isDaytime: false, temperature: 55 }),
        createMockForecastPeriod({ number: 3, name: 'Tuesday', isDaytime: true, temperature: 78 }),
        createMockForecastPeriod({ number: 4, name: 'Tuesday Night', isDaytime: false, temperature: 58 })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const dayButtons = screen.getAllByRole('button')
      expect(dayButtons.length).toBe(2) // Two grouped days

      // Check that both high and low temps are shown
      expect(screen.getByText(/75°F/)).toBeInTheDocument()
      expect(screen.getByText(/55°F/)).toBeInTheDocument()
      expect(screen.getByText(/78°F/)).toBeInTheDocument()
      expect(screen.getByText(/58°F/)).toBeInTheDocument()
    })

    it('should skip night period after grouping', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Wednesday', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Wednesday Night', isDaytime: false })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Should only render one button (day+night grouped), shows "Today"
      expect(screen.getAllByRole('button').length).toBe(1)
      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('should handle day period followed by another day period (no night)', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Thursday', isDaytime: true }),
        createMockForecastPeriod({ number: 2, name: 'Friday', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getAllByRole('button').length).toBe(2)
      // First is Today, second is Friday
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Friday')).toBeInTheDocument()
    })

    it('should only process daytime periods as primary cards', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Night Period', isDaytime: false }),
        createMockForecastPeriod({ number: 2, name: 'Saturday', isDaytime: true }),
        createMockForecastPeriod({ number: 3, name: 'Another Night', isDaytime: false })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Should only show Saturday (the daytime period), first period shows as "Today"
      expect(screen.getAllByRole('button').length).toBe(1)
      expect(screen.getByText('Today')).toBeInTheDocument()
    })
  })

  describe('Accessibility and interactions', () => {
    it('should render day cards as buttons for keyboard navigation', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('should have hover effects on day cards', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-muted')
    })

    it('should support multiple day selections', async () => {
      const user = userEvent.setup()
      const forecast = [
        createMockForecastPeriod({ number: 1, name: 'Day 1', isDaytime: true }),
        createMockForecastPeriod({ number: 3, name: 'Day 2', isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      const buttons = screen.getAllByRole('button')

      await user.click(buttons[0]!)
      expect(screen.getByTestId('forecast-modal')).toBeInTheDocument()

      await user.click(screen.getByTestId('modal-close'))
      expect(screen.queryByTestId('forecast-modal')).not.toBeInTheDocument()

      await user.click(buttons[1]!)
      expect(screen.getByTestId('forecast-modal')).toBeInTheDocument()
    })
  })

  describe('Unit system reactivity', () => {
    it('should update temperatures when unit system changes', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, temperature: 68, isDaytime: true })
      ]
      const { rerender } = render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/68°F/)).toBeInTheDocument()

      // Change to metric
      useUnitStore.setState({ unitSystem: 'metric' })
      rerender(<SevenDayForecast forecast={forecast} />)

      // 68°F = 20°C
      expect(screen.getByText(/20°C/)).toBeInTheDocument()
      expect(screen.queryByText(/68°F/)).not.toBeInTheDocument()
    })

    it('should update wind speeds when unit system changes', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windSpeed: '20 mph',
          isDaytime: true
        })
      ]
      const { rerender } = render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/20 mph/)).toBeInTheDocument()

      // Change to metric
      useUnitStore.setState({ unitSystem: 'metric' })
      rerender(<SevenDayForecast forecast={forecast} />)

      // 20 mph = 32 km/h
      expect(screen.getByText(/32 km\/h/)).toBeInTheDocument()
      expect(screen.queryByText(/20 mph/)).not.toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle very high temperatures', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, temperature: 120, isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/120°F/)).toBeInTheDocument()
    })

    it('should handle very low temperatures', () => {
      const forecast = [
        createMockForecastPeriod({ number: 1, temperature: -20, isDaytime: true })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/-20°F/)).toBeInTheDocument()
    })

    it('should handle zero precipitation probability correctly', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          probabilityOfPrecipitation: { value: 0 }
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle very long forecast names', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          name: 'This Afternoon Then Partly Cloudy',
          isDaytime: true
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      // Should extract and display the name
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle special wind directions like Variable', () => {
      const forecast = [
        createMockForecastPeriod({
          number: 1,
          windDirection: 'Variable',
          windSpeed: '5 mph'
        })
      ]
      render(<SevenDayForecast forecast={forecast} />)

      expect(screen.getByText(/Variable/)).toBeInTheDocument()
    })
  })
})
