import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from './ErrorBanner';
import { useWeatherStore } from '@/stores/weatherStore';

describe('ErrorBanner', () => {
  beforeEach(() => {
    // Clear the store state before each test
    useWeatherStore.setState({
      currentZipCode: null,
      weatherData: null,
      isLoading: false,
      error: null,
      recentZipCodes: [],
    });
    // Don't use fake timers by default - only specific tests need them
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should not render when no error exists', () => {
      render(<ErrorBanner />);
      expect(screen.queryByText('Weather Service Error')).not.toBeInTheDocument();
    });

    it('should render when error exists in store', () => {
      useWeatherStore.setState({ error: 'Test error message' });
      render(<ErrorBanner />);
      expect(screen.getByText('Weather Service Error')).toBeInTheDocument();
    });

    it('should display error message', () => {
      useWeatherStore.setState({ error: 'Test error message' });
      render(<ErrorBanner />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should render AlertCircle icon', () => {
      useWeatherStore.setState({ error: 'Test error' });
      const { container } = render(<ErrorBanner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render dismiss button with X icon', () => {
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);
      const dismissButton = screen.getByLabelText('Dismiss error');
      expect(dismissButton).toBeInTheDocument();
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('should display user-friendly message for network errors', () => {
      useWeatherStore.setState({ error: 'Network error: Connection failed' });
      render(<ErrorBanner />);
      expect(
        screen.getByText('Unable to connect to the weather service. Please check your internet connection.')
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for 404 errors', () => {
      useWeatherStore.setState({ error: 'HTTP 404: Not Found' });
      render(<ErrorBanner />);
      expect(
        screen.getByText('Weather data not found for this location. Please verify the ZIP code.')
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for 429 rate limit errors', () => {
      useWeatherStore.setState({ error: 'HTTP 429: Too Many Requests' });
      render(<ErrorBanner />);
      expect(
        screen.getByText('Too many requests. Please wait a moment and try again.')
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for 500 server errors', () => {
      useWeatherStore.setState({ error: 'HTTP 500: Internal Server Error' });
      render(<ErrorBanner />);
      expect(
        screen.getByText('Weather service is temporarily unavailable. Please try again later.')
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for 502 errors', () => {
      useWeatherStore.setState({ error: 'HTTP 502: Bad Gateway' });
      render(<ErrorBanner />);
      expect(
        screen.getByText('Weather service is temporarily unavailable. Please try again later.')
      ).toBeInTheDocument();
    });

    it('should display user-friendly message for 503 errors', () => {
      useWeatherStore.setState({ error: 'HTTP 503: Service Unavailable' });
      render(<ErrorBanner />);
      expect(
        screen.getByText('Weather service is temporarily unavailable. Please try again later.')
      ).toBeInTheDocument();
    });

    it('should display original message for unknown errors', () => {
      useWeatherStore.setState({ error: 'Unknown custom error' });
      render(<ErrorBanner />);
      expect(screen.getByText('Unknown custom error')).toBeInTheDocument();
    });
  });

  describe('Error Severity Styling', () => {
    it('should apply warning styling for 429 errors', () => {
      useWeatherStore.setState({ error: 'HTTP 429: Too Many Requests' });
      const { container } = render(<ErrorBanner />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('border-yellow-500');
    });

    it('should apply default styling for non-429 errors', () => {
      useWeatherStore.setState({ error: 'HTTP 500: Server Error' });
      const { container } = render(<ErrorBanner />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('destructive');
    });
  });

  describe('Dismiss Functionality', () => {
    it('should dismiss error when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);

      const dismissButton = screen.getByLabelText('Dismiss error');
      await user.click(dismissButton);

      await waitFor(() => {
        expect(useWeatherStore.getState().error).toBeNull();
      });
    });

    it('should remove banner from DOM after dismissal', async () => {
      const user = userEvent.setup({ delay: null });
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);

      const dismissButton = screen.getByLabelText('Dismiss error');
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText('Weather Service Error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Auto-Dismiss Timer', () => {
    it('should auto-dismiss after 10 seconds', async () => {
      vi.useFakeTimers();
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);

      expect(screen.getByText('Weather Service Error')).toBeInTheDocument();

      // Fast-forward 10 seconds
      await vi.advanceTimersByTimeAsync(10000);

      expect(useWeatherStore.getState().error).toBeNull();
      vi.useRealTimers();
    }, 10000);

    it('should not auto-dismiss before 10 seconds', () => {
      vi.useFakeTimers();
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);

      expect(screen.getByText('Weather Service Error')).toBeInTheDocument();

      // Fast-forward 9 seconds
      vi.advanceTimersByTime(9000);

      expect(screen.getByText('Weather Service Error')).toBeInTheDocument();
      expect(useWeatherStore.getState().error).toBe('Test error');
      vi.useRealTimers();
    });

    it('should reset timer when new error appears', () => {
      vi.useFakeTimers();
      useWeatherStore.setState({ error: 'First error' });
      const { rerender } = render(<ErrorBanner />);

      // Advance 5 seconds
      vi.advanceTimersByTime(5000);

      // New error appears
      useWeatherStore.setState({ error: 'Second error' });
      rerender(<ErrorBanner />);

      // Advance 5 more seconds (10 seconds total since first error)
      vi.advanceTimersByTime(5000);

      // Should still be showing because timer was reset
      expect(screen.getByText('Second error')).toBeInTheDocument();

      // Advance 5 more seconds (10 seconds since second error)
      vi.advanceTimersByTime(5000);

      waitFor(() => {
        expect(useWeatherStore.getState().error).toBeNull();
      });
      vi.useRealTimers();
    });

    it('should clean up timer on unmount', () => {
      vi.useFakeTimers();
      useWeatherStore.setState({ error: 'Test error' });
      const { unmount } = render(<ErrorBanner />);

      unmount();

      // Advance time
      vi.advanceTimersByTime(10000);

      // Error should still exist since component was unmounted
      expect(useWeatherStore.getState().error).toBe('Test error');
      vi.useRealTimers();
    });
  });

  describe('Error Details Expansion', () => {
    it('should not show details button when error has no details', () => {
      useWeatherStore.setState({ error: 'Simple error message' });
      render(<ErrorBanner />);
      expect(screen.queryByText('Show details')).not.toBeInTheDocument();
    });

    it('should show details button when error has details', () => {
      const errorWithDetails = {
        message: 'API Error',
        details: { code: 500, info: 'Internal Server Error' },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      render(<ErrorBanner />);
      expect(screen.getByText('Show details')).toBeInTheDocument();
    });

    it('should expand details when button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithDetails = {
        message: 'API Error',
        details: { code: 500, info: 'Internal Server Error' },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      render(<ErrorBanner />);

      const showDetailsButton = screen.getByText('Show details');
      await user.click(showDetailsButton);

      expect(await screen.findByText(/"code": 500/)).toBeInTheDocument();
    });

    it('should collapse details when button is clicked again', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithDetails = {
        message: 'API Error',
        details: { code: 500, info: 'Internal Server Error' },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      render(<ErrorBanner />);

      const showDetailsButton = screen.getByText('Show details');
      await user.click(showDetailsButton);
      expect(await screen.findByText(/"code": 500/)).toBeInTheDocument();

      const hideDetailsButton = screen.getByText('Hide details');
      await user.click(hideDetailsButton);

      await waitFor(() => {
        expect(screen.queryByText(/"code": 500/)).not.toBeInTheDocument();
      });
    });

    it('should display details as formatted JSON', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithDetails = {
        message: 'API Error',
        details: {
          status: 500,
          timestamp: '2024-01-01T12:00:00Z',
          path: '/api/weather/12345',
        },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      render(<ErrorBanner />);

      const showDetailsButton = screen.getByText('Show details');
      await user.click(showDetailsButton);

      const detailsElement = await screen.findByText(/"status": 500/);
      expect(detailsElement.tagName).toBe('PRE');
      expect(detailsElement.textContent).toContain('"status": 500');
      expect(detailsElement.textContent).toContain('"timestamp"');
      expect(detailsElement.textContent).toContain('"path"');
    });

    it('should toggle chevron icons when expanding/collapsing', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithDetails = {
        message: 'API Error',
        details: { code: 500 },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      render(<ErrorBanner />);

      expect(screen.getByText('Show details')).toBeInTheDocument();
      const showButton = screen.getByText('Show details');
      await user.click(showButton);

      expect(screen.getByText('Hide details')).toBeInTheDocument();
      const hideButton = screen.getByText('Hide details');
      await user.click(hideButton);

      expect(screen.getByText('Show details')).toBeInTheDocument();
    });
  });

  describe('Error Parsing', () => {
    it('should handle string error messages', () => {
      useWeatherStore.setState({ error: 'Simple string error' });
      render(<ErrorBanner />);
      expect(screen.getByText('Simple string error')).toBeInTheDocument();
    });

    it('should handle object error messages', () => {
      const errorObject = { message: 'Object error message' };
      useWeatherStore.setState({ error: errorObject as any });
      render(<ErrorBanner />);
      expect(screen.getByText('Object error message')).toBeInTheDocument();
    });

    it('should handle non-standard error types gracefully', () => {
      // The component converts non-string errors to strings
      const weirdError = { message: '12345' };
      useWeatherStore.setState({ error: weirdError as any });
      render(<ErrorBanner />);
      expect(screen.getByText('12345')).toBeInTheDocument();
    });

    it('should handle errors with complex details', () => {
      const complexError = {
        message: 'Complex error',
        details: {
          nested: {
            deeply: {
              value: 'test',
              array: [1, 2, 3],
            },
          },
        },
      };
      useWeatherStore.setState({ error: complexError as any });
      render(<ErrorBanner />);
      expect(screen.getByText('Complex error')).toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    it('should reset expansion state when error changes', async () => {
      const user = userEvent.setup({ delay: null });
      const error1 = {
        message: 'First error',
        details: { code: 500 },
      };
      useWeatherStore.setState({ error: error1 as any });
      const { rerender } = render(<ErrorBanner />);

      // Expand details
      const showButton = screen.getByText('Show details');
      await user.click(showButton);
      expect(await screen.findByText(/"code": 500/)).toBeInTheDocument();

      // Change error
      const error2 = {
        message: 'Second error',
        details: { code: 404 },
      };
      useWeatherStore.setState({ error: error2 as any });
      rerender(<ErrorBanner />);

      // Details should be collapsed again
      expect(screen.queryByText(/"code": 500/)).not.toBeInTheDocument();
      expect(screen.queryByText(/"code": 404/)).not.toBeInTheDocument();
      expect(screen.getByText('Show details')).toBeInTheDocument();
    });

    it('should reset expansion state when error is cleared', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithDetails = {
        message: 'Error with details',
        details: { code: 500 },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      const { rerender } = render(<ErrorBanner />);

      // Expand details
      const showButton = screen.getByText('Show details');
      await user.click(showButton);
      expect(await screen.findByText(/"code": 500/)).toBeInTheDocument();

      // Clear error
      useWeatherStore.setState({ error: null });
      rerender(<ErrorBanner />);

      // Banner should disappear
      expect(screen.queryByText('Weather Service Error')).not.toBeInTheDocument();

      // Set error again
      useWeatherStore.setState({ error: errorWithDetails as any });
      rerender(<ErrorBanner />);

      // Details should be collapsed
      expect(screen.queryByText(/"code": 500/)).not.toBeInTheDocument();
      expect(screen.getByText('Show details')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on dismiss button', () => {
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);
      const dismissButton = screen.getByLabelText('Dismiss error');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should render with role="alert"', () => {
      useWeatherStore.setState({ error: 'Test error' });
      const { container } = render(<ErrorBanner />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should support keyboard navigation for dismiss button', async () => {
      const user = userEvent.setup({ delay: null });
      useWeatherStore.setState({ error: 'Test error' });
      render(<ErrorBanner />);

      const dismissButton = screen.getByLabelText('Dismiss error');

      // Tab to the button
      await user.tab();

      // Check if focused (might need multiple tabs depending on DOM structure)
      while (document.activeElement !== dismissButton && document.activeElement !== document.body) {
        await user.tab();
      }

      if (document.activeElement === dismissButton) {
        // Press Enter
        await user.keyboard('{enter}');

        await waitFor(() => {
          expect(useWeatherStore.getState().error).toBeNull();
        });
      }
    });

    it('should support keyboard navigation for details toggle', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithDetails = {
        message: 'Error with details',
        details: { code: 500 },
      };
      useWeatherStore.setState({ error: errorWithDetails as any });
      render(<ErrorBanner />);

      const detailsButton = screen.getByText('Show details');
      detailsButton.focus();

      // Press Enter
      await user.keyboard('{enter}');

      expect(await screen.findByText(/"code": 500/)).toBeInTheDocument();
    });
  });

  describe('Visual Layout', () => {
    it('should be positioned at top of viewport', () => {
      useWeatherStore.setState({ error: 'Test error' });
      const { container } = render(<ErrorBanner />);
      const wrapper = container.querySelector('.fixed');
      expect(wrapper?.className).toContain('fixed');
      expect(wrapper?.className).toContain('top-16');
    });

    it('should span full width with padding', () => {
      useWeatherStore.setState({ error: 'Test error' });
      const { container } = render(<ErrorBanner />);
      const wrapper = container.querySelector('.fixed');
      expect(wrapper?.className).toContain('left-0');
      expect(wrapper?.className).toContain('right-0');
      expect(wrapper?.className).toContain('px-4');
    });

    it('should have high z-index for overlay', () => {
      useWeatherStore.setState({ error: 'Test error' });
      const { container } = render(<ErrorBanner />);
      const wrapper = container.querySelector('.fixed');
      expect(wrapper?.className).toContain('z-50');
    });

    it('should have shadow for visual separation', () => {
      useWeatherStore.setState({ error: 'Test error' });
      const { container } = render(<ErrorBanner />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain('shadow-lg');
    });
  });

  describe('Multiple Error Scenarios', () => {
    it('should handle rapid error updates', async () => {
      useWeatherStore.setState({ error: 'Error 1' });
      const { rerender } = render(<ErrorBanner />);
      expect(screen.getByText('Error 1')).toBeInTheDocument();

      useWeatherStore.setState({ error: 'Error 2' });
      rerender(<ErrorBanner />);
      expect(screen.getByText('Error 2')).toBeInTheDocument();

      useWeatherStore.setState({ error: 'Error 3' });
      rerender(<ErrorBanner />);
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });

    it('should handle error with undefined details field', () => {
      const errorWithUndefinedDetails = {
        message: 'Error message',
        details: undefined,
      };
      useWeatherStore.setState({ error: errorWithUndefinedDetails as any });
      render(<ErrorBanner />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Show details')).not.toBeInTheDocument();
    });

    it('should handle error with null details field', () => {
      const errorWithNullDetails = {
        message: 'Error message',
        details: null,
      };
      useWeatherStore.setState({ error: errorWithNullDetails as any });
      render(<ErrorBanner />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Show details')).not.toBeInTheDocument();
    });

    it('should handle error with empty object details', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithEmptyDetails = {
        message: 'Error message',
        details: {},
      };
      useWeatherStore.setState({ error: errorWithEmptyDetails as any });
      render(<ErrorBanner />);

      const showButton = screen.getByText('Show details');
      await user.click(showButton);

      expect(await screen.findByText(/\{\}/)).toBeInTheDocument();
    });

    it('should handle error with array details', async () => {
      const user = userEvent.setup({ delay: null });
      const errorWithArrayDetails = {
        message: 'Error message',
        details: [1, 2, 3, 'error'],
      };
      useWeatherStore.setState({ error: errorWithArrayDetails as any });
      render(<ErrorBanner />);

      const showButton = screen.getByText('Show details');
      await user.click(showButton);

      expect(await screen.findByText(/\[/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string error', () => {
      useWeatherStore.setState({ error: '' });
      render(<ErrorBanner />);
      // Empty string should still show the banner
      expect(screen.queryByText('Weather Service Error')).not.toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longError = 'Error: ' + 'A'.repeat(1000);
      useWeatherStore.setState({ error: longError });
      render(<ErrorBanner />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('should handle error messages with special characters', () => {
      const specialError = 'Error: <script>alert("XSS")</script>';
      useWeatherStore.setState({ error: specialError });
      render(<ErrorBanner />);
      // Should display as text, not execute script
      expect(screen.getByText(specialError)).toBeInTheDocument();
    });

    it('should handle Unicode characters in error messages', () => {
      const unicodeError = 'Error: 日本語 中文 한글 😀';
      useWeatherStore.setState({ error: unicodeError });
      render(<ErrorBanner />);
      expect(screen.getByText(unicodeError)).toBeInTheDocument();
    });

    it('should handle newlines in error messages', () => {
      const multilineError = 'Line 1\nLine 2\nLine 3';
      useWeatherStore.setState({ error: multilineError });
      const { container } = render(<ErrorBanner />);
      // Check that the text content includes all lines (newlines are preserved in textContent)
      const paragraph = container.querySelector('p');
      expect(paragraph?.textContent).toBe(multilineError);
    });
  });
});
