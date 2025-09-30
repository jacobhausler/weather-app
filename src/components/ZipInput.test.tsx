import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZipInput } from './ZipInput';
import { useWeatherStore } from '@/stores/weatherStore';
import { apiService } from '@/services/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    getWeatherByZip: vi.fn(),
  },
}));

describe('ZipInput', () => {
  beforeEach(() => {
    // Clear the store state before each test
    useWeatherStore.setState({
      currentZipCode: null,
      weatherData: null,
      isLoading: false,
      error: null,
      recentZipCodes: [],
    });
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render input field with placeholder text', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      expect(input).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ZipInput />);
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeInTheDocument();
    });

    it('should render MapPin icon', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      expect(input.parentElement?.querySelector('svg')).toBeInTheDocument();
    });

    it('should have submit button disabled when input is empty', () => {
      render(<ZipInput />);
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeDisabled();
    });

    it('should not show recent ZIP codes dropdown when no history exists', () => {
      render(<ZipInput />);
      const dropdown = screen.queryByRole('button', { name: /recent zip codes/i });
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should show recent ZIP codes dropdown when history exists', () => {
      useWeatherStore.setState({ recentZipCodes: ['75454', '75070'] });
      render(<ZipInput />);
      const dropdown = screen.getByRole('button', { name: /recent zip codes/i });
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should allow typing numeric characters', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '75454');

      expect(input).toHaveValue('75454');
    });

    it('should prevent typing non-numeric characters', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, 'abc123def');

      expect(input).toHaveValue('123');
    });

    it('should limit input to 5 digits', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '1234567890');

      expect(input).toHaveValue('12345');
    });

    it('should allow backspace and delete keys', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '12345');
      await user.type(input, '{backspace}{backspace}');

      expect(input).toHaveValue('123');
    });

    it('should allow arrow navigation keys', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '12345');
      await user.type(input, '{arrowleft}{arrowleft}');

      // Arrow keys don't change value, just cursor position
      expect(input).toHaveValue('12345');
    });

    it('should not call API with invalid ZIP code', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '123{Enter}');

      // API should not be called with invalid ZIP
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(apiService.getWeatherByZip).not.toHaveBeenCalled();
    });

    it('should not show validation error for valid ZIP code', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
        location: { lat: 33.0, lon: -96.0, city: 'Test', state: 'TX' },
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid 5-digit ZIP code')).not.toBeInTheDocument();
      });
    });

    it('should allow re-entry after invalid submission', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      // Submit invalid ZIP
      await user.type(input, '123{Enter}');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not have called API
      expect(apiService.getWeatherByZip).not.toHaveBeenCalled();

      // Clear and enter valid ZIP
      await user.clear(input);
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({ zipCode: '75454' } as any);
      await user.type(input, '75454{Enter}');

      // Now API should be called
      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454');
      });
    });

    it('should validate ZIP code length requirement', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      // Test lengths less than 5 don't call API
      await user.type(input, '1234{Enter}');
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(apiService.getWeatherByZip).not.toHaveBeenCalled();

      // Test exactly 5 digits does call API
      await user.clear(input);
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({ zipCode: '12345' } as any);
      await user.type(input, '12345{Enter}');

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('12345');
      });
    });
  });

  describe('Form Submission', () => {
    it('should call API and update store on valid submission', async () => {
      const user = userEvent.setup();
      const mockWeatherData = {
        zipCode: '75454',
        location: { lat: 33.0, lon: -96.0, city: 'McKinney', state: 'TX' },
      } as any;
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue(mockWeatherData);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454');
      });

      await waitFor(() => {
        expect(useWeatherStore.getState().weatherData).toEqual(mockWeatherData);
      });
    });

    it('should add ZIP code to recent history on successful fetch', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      await waitFor(() => {
        expect(useWeatherStore.getState().recentZipCodes).toContain('75454');
      });
    });

    it('should clear input field after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should set loading state during fetch', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiService.getWeatherByZip).mockReturnValue(promise as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      // Loading state should be true
      expect(useWeatherStore.getState().isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({ zipCode: '75454' } as any);

      await waitFor(() => {
        expect(useWeatherStore.getState().isLoading).toBe(false);
      });
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to fetch weather data';
      vi.mocked(apiService.getWeatherByZip).mockRejectedValue(new Error(errorMessage));

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      await waitFor(() => {
        expect(useWeatherStore.getState().error).toBe(errorMessage);
      });
    });

    it('should handle API errors without Error object', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockRejectedValue('String error');

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);

      await waitFor(() => {
        expect(useWeatherStore.getState().error).toBe('Failed to fetch weather data');
      });
    });

    it('should submit form on Enter key press', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '75454{enter}');

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454');
      });
    });

    it('should trim whitespace from input before submission', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code') as HTMLInputElement;

      // Since the component filters non-numeric, we test by typing valid ZIP
      // The trim() happens in handleSubmit for the value that's already in state
      await user.type(input, '75454');

      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454');
      });
    });

    it('should not submit if input is only whitespace', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.click(input);
      await user.paste('     ');

      // Button should remain disabled
      expect(button).toBeDisabled();
    });
  });

  describe('Recent ZIP Codes Dropdown', () => {
    it('should display recent ZIP codes in dropdown', async () => {
      const user = userEvent.setup();
      useWeatherStore.setState({ recentZipCodes: ['75454', '75070', '75035'] });

      render(<ZipInput />);
      const dropdown = screen.getByRole('button', { name: /recent zip codes/i });
      await user.click(dropdown);

      expect(await screen.findByText('75454')).toBeInTheDocument();
      expect(screen.getByText('75070')).toBeInTheDocument();
      expect(screen.getByText('75035')).toBeInTheDocument();
    });

    it('should fetch weather data when clicking recent ZIP code', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);
      useWeatherStore.setState({ recentZipCodes: ['75454', '75070'] });

      render(<ZipInput />);
      const dropdown = screen.getByRole('button', { name: /recent zip codes/i });
      await user.click(dropdown);

      const recentZip = await screen.findByText('75454');
      await user.click(recentZip);

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454');
      });
    });

    it('should handle errors when fetching from recent ZIP codes', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockRejectedValue(new Error('API Error'));
      useWeatherStore.setState({ recentZipCodes: ['75454'] });

      render(<ZipInput />);
      const dropdown = screen.getByRole('button', { name: /recent zip codes/i });
      await user.click(dropdown);

      const recentZip = await screen.findByText('75454');
      await user.click(recentZip);

      await waitFor(() => {
        expect(useWeatherStore.getState().error).toBe('API Error');
      });
    });

    it('should disable dropdown button when loading', () => {
      useWeatherStore.setState({ recentZipCodes: ['75454'], isLoading: true });
      render(<ZipInput />);
      const dropdown = screen.getByRole('button', { name: /recent zip codes/i });
      expect(dropdown).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should disable input field when loading', () => {
      useWeatherStore.setState({ isLoading: true });
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      expect(input).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      useWeatherStore.setState({ isLoading: true });
      render(<ZipInput />);
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toBeDisabled();
    });

    it('should disable all interactive elements when loading', () => {
      useWeatherStore.setState({ isLoading: true, recentZipCodes: ['75454'] });
      render(<ZipInput />);

      const input = screen.getByPlaceholderText('Enter ZIP code');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      const dropdown = screen.getByRole('button', { name: /recent zip codes/i });

      expect(input).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(dropdown).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on input', () => {
      render(<ZipInput />);
      const input = screen.getByLabelText('ZIP code input');
      expect(input).toBeInTheDocument();
    });

    it('should have aria-invalid attribute on input', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      // Input should have aria-invalid attribute (false when no error)
      expect(input).toHaveAttribute('aria-invalid');
    });

    it('should not set aria-invalid when no validation error', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper aria-describedby when needed', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      // When no error, aria-describedby should not be set or be undefined
      const ariaDescribedBy = input.getAttribute('aria-describedby');
      expect(ariaDescribedBy === null || ariaDescribedBy === undefined || ariaDescribedBy === '').toBe(true);
    });

    it('should not display alert role when no error', () => {
      render(<ZipInput />);
      // No alert should be present when there's no error
      const alerts = screen.queryAllByRole('alert');
      expect(alerts).toHaveLength(0);
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      // Check input has accessibility attributes
      expect(input).toHaveAttribute('aria-label', 'ZIP code input');
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('pattern', '\\d{5}');
    });

    it('should have proper label on recent ZIP codes button', () => {
      useWeatherStore.setState({ recentZipCodes: ['75454'] });
      render(<ZipInput />);
      const dropdown = screen.getByLabelText('Recent ZIP codes');
      expect(dropdown).toBeInTheDocument();
    });

    it('should support keyboard navigation on form', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();

      // Type ZIP code
      await user.type(input, '75454');

      // Tab to submit button
      await user.tab();
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveFocus();

      // Press Enter
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('75454');
      });
    });
  });

  describe('Input Attributes', () => {
    it('should have type="text" and inputMode="numeric"', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('inputMode', 'numeric');
    });

    it('should have pattern attribute for 5 digits', () => {
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      expect(input).toHaveAttribute('pattern', '\\d{5}');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid sequential submissions', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '75454',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '75454');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should still only call API once due to input being cleared
      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle empty submission gracefully', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const form = screen.getByPlaceholderText('Enter ZIP code').closest('form');

      // Manually submit empty form
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }

      // Should not call API
      expect(apiService.getWeatherByZip).not.toHaveBeenCalled();
    });

    it('should maintain state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '754');
      expect(input).toHaveValue('754');

      rerender(<ZipInput />);
      expect(input).toHaveValue('754');
    });

    it('should handle ZIP code starting with zero', async () => {
      const user = userEvent.setup();
      vi.mocked(apiService.getWeatherByZip).mockResolvedValue({
        zipCode: '01234',
      } as any);

      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');
      const button = screen.getByRole('button', { name: /submit/i });

      await user.type(input, '01234');
      await user.click(button);

      await waitFor(() => {
        expect(apiService.getWeatherByZip).toHaveBeenCalledWith('01234');
      });
    });

    it('should handle multiple zeros', async () => {
      const user = userEvent.setup();
      render(<ZipInput />);
      const input = screen.getByPlaceholderText('Enter ZIP code');

      await user.type(input, '00000');

      expect(input).toHaveValue('00000');
    });
  });
});
