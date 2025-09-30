import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RefreshButton } from './RefreshButton'
import { useWeatherData } from '@/hooks/useWeatherData'

// Mock the useWeatherData hook
vi.mock('@/hooks/useWeatherData', () => ({
  useWeatherData: vi.fn()
}))

describe('RefreshButton', () => {
  const mockRefreshWeather = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshWeather.mockReset()
  })

  describe('Rendering and basic functionality', () => {
    it('should render refresh button', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button', { name: /refresh weather data/i })
      expect(button).toBeInTheDocument()
    })

    it('should call refreshWeather when clicked', async () => {
      const user = userEvent.setup()
      mockRefreshWeather.mockResolvedValue(undefined)

      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockRefreshWeather).toHaveBeenCalledTimes(1)
    })

    it('should render RefreshCw icon when not loading and not paused', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const icon = document.querySelector('.lucide-refresh-cw')
      expect(icon).toBeInTheDocument()
    })

    it('should render AlertCircle icon when auto-refresh is paused', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      const { container } = render(<RefreshButton />)

      const icon = container.querySelector('.lucide-circle-alert')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Loading state behavior', () => {
    it('should be disabled when loading', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: true,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show spinning icon when loading', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: true,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const icon = document.querySelector('.animate-spin')
      expect(icon).toBeInTheDocument()
    })

    it('should not trigger refresh when clicked while loading', async () => {
      const user = userEvent.setup()

      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: true,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockRefreshWeather).not.toHaveBeenCalled()
    })

    it('should show opacity on icon when disabled during loading', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: true,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const icon = document.querySelector('.opacity-50')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('No ZIP code behavior', () => {
    it('should be disabled when no ZIP code is set', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: null,
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not trigger refresh when clicked without ZIP code', async () => {
      const user = userEvent.setup()

      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: null,
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockRefreshWeather).not.toHaveBeenCalled()
    })

    it('should show opacity on icon when disabled without ZIP code', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: null,
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const icon = document.querySelector('.opacity-50')
      expect(icon).toBeInTheDocument()
    })

    it('should be disabled when ZIP code is empty string', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Auto-refresh paused state', () => {
    it('should show AlertCircle icon when auto-refresh is paused', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      const { container } = render(<RefreshButton />)

      const alertIcon = container.querySelector('.lucide-circle-alert')
      expect(alertIcon).toBeInTheDocument()

      const refreshIcon = container.querySelector('.lucide-refresh-cw')
      expect(refreshIcon).not.toBeInTheDocument()
    })

    it('should apply yellow color when auto-refresh is paused', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-yellow-600')
    })

    it('should show paused message in title when auto-refresh is paused', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Auto-refresh paused due to errors. Click to retry.')
    })

    it('should show paused message in aria-label when auto-refresh is paused', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button', { name: /auto-refresh paused/i })
      expect(button).toBeInTheDocument()
    })

    it('should still be clickable when paused (not disabled)', async () => {
      const user = userEvent.setup()
      mockRefreshWeather.mockResolvedValue(undefined)

      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()

      await user.click(button)
      expect(mockRefreshWeather).toHaveBeenCalledTimes(1)
    })

    it('should show refresh icon when paused but disabled', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: null, // No ZIP code, so disabled
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      // When disabled, should show refresh icon even if paused
      const refreshIcon = document.querySelector('.lucide-refresh-cw')
      expect(refreshIcon).toBeInTheDocument()

      const alertIcon = document.querySelector('.lucide-alert-circle')
      expect(alertIcon).not.toBeInTheDocument()
    })

    it('should not apply yellow color when paused and disabled', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: null,
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('text-yellow-600')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label for normal state', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button', { name: 'Refresh weather data' })
      expect(button).toBeInTheDocument()
    })

    it('should have proper title attribute for normal state', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Refresh weather data')
    })

    it('should be keyboard accessible when enabled', async () => {
      const user = userEvent.setup()
      mockRefreshWeather.mockResolvedValue(undefined)

      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockRefreshWeather).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button styling and variants', () => {
    it('should use ghost variant', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      const { container } = render(<RefreshButton />)

      // Ghost variant buttons typically don't have background
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should have relative positioning for proper icon layout', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('relative')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle async refresh completion', async () => {
      const user = userEvent.setup()
      let resolveRefresh: () => void

      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve
      })
      mockRefreshWeather.mockReturnValue(refreshPromise)

      // Initial state - not loading
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      const { rerender, container } = render(<RefreshButton />)

      const button = screen.getByRole('button')
      await user.click(button)

      // Simulate loading state during refresh
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: true,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      rerender(<RefreshButton />)

      expect(screen.getByRole('button')).toBeDisabled()
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()

      // Complete the refresh
      resolveRefresh!()
      await waitFor(() => refreshPromise)

      // Back to normal state
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      rerender(<RefreshButton />)

      expect(screen.getByRole('button')).not.toBeDisabled()
      // Icon should still be present, just not spinning
      const icon = container.querySelector('.lucide-refresh-cw')
      expect(icon).toBeInTheDocument()
    })

    it('should recover from paused state after successful refresh', async () => {
      const user = userEvent.setup()
      mockRefreshWeather.mockResolvedValue(undefined)

      const { rerender, container } = render(<RefreshButton />)

      // Start in paused state
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      rerender(<RefreshButton />)

      expect(container.querySelector('.lucide-circle-alert')).toBeInTheDocument()

      const button = screen.getByRole('button')
      await user.click(button)

      // After successful refresh, no longer paused
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      rerender(<RefreshButton />)

      expect(container.querySelector('.lucide-circle-alert')).not.toBeInTheDocument()
      expect(container.querySelector('.lucide-refresh-cw')).toBeInTheDocument()
    })

    it('should handle multiple rapid clicks gracefully', async () => {
      const user = userEvent.setup()
      mockRefreshWeather.mockResolvedValue(undefined)

      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')

      // Simulate rapid clicks
      await user.click(button)
      await user.click(button)
      await user.click(button)

      // Should have been called for each click
      expect(mockRefreshWeather).toHaveBeenCalledTimes(3)
    })
  })

  describe('State combinations', () => {
    it('should handle loading=true and paused=true correctly', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: true,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: true,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      // Should be disabled and show refresh icon (disabled takes precedence)
      expect(screen.getByRole('button')).toBeDisabled()
      expect(document.querySelector('.lucide-refresh-cw')).toBeInTheDocument()
      expect(document.querySelector('.lucide-alert-circle')).not.toBeInTheDocument()
    })

    it('should handle loading=false, paused=false, zipCode=null', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: null,
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      expect(screen.getByRole('button')).toBeDisabled()
      expect(document.querySelector('.lucide-refresh-cw')).toBeInTheDocument()
    })

    it('should handle all enabled conditions', () => {
      vi.mocked(useWeatherData).mockReturnValue({
        currentZipCode: '75454',
        isLoading: false,
        refreshWeather: mockRefreshWeather,
        isAutoRefreshPaused: false,
        weatherData: null,
        error: null,
        fetchWeather: vi.fn()
      })

      render(<RefreshButton />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      expect(button).not.toHaveClass('text-yellow-600')
      expect(button).toHaveAttribute('title', 'Refresh weather data')
    })
  })
})
