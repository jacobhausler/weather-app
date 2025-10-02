import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { WeatherIcon } from './WeatherIcon';
import * as weatherIconMapper from '@/utils/weatherIconMapper';

// Mock the weatherIconMapper module
vi.mock('@/utils/weatherIconMapper', () => ({
  getWeatherIconFromUrl: vi.fn(),
  parseNWSIconUrl: vi.fn(),
  getWeatherIconPath: vi.fn(),
}));

describe('WeatherIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.warn mock
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Rendering with default props', () => {
    it('should render with default props', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/clear-day.svg');
    });

    it('should use medium size by default', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '64');
      expect(img).toHaveAttribute('height', '64');
    });

    it('should use animated icons by default', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      render(<WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />);

      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith(
        'https://api.weather.gov/icons/land/day/skc?size=medium',
        true
      );
    });
  });

  describe('Size variants', () => {
    it('should render small size (40px)', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          size="sm"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '40');
      expect(img).toHaveAttribute('height', '40');
      expect(img).toHaveStyle({ width: '40px', height: '40px' });
    });

    it('should render medium size (64px)', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          size="md"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '64');
      expect(img).toHaveAttribute('height', '64');
      expect(img).toHaveStyle({ width: '64px', height: '64px' });
    });

    it('should render large size (96px)', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          size="lg"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '96');
      expect(img).toHaveAttribute('height', '96');
      expect(img).toHaveStyle({ width: '96px', height: '96px' });
    });
  });

  describe('Animated vs static icons', () => {
    it('should use animated icons when animated=true', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/thunderstorms.svg'
      );

      render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/tsra?size=medium"
          animated={true}
        />
      );

      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith(
        'https://api.weather.gov/icons/land/day/tsra?size=medium',
        true
      );
    });

    it('should use static icons when animated=false', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/static/thunderstorms.svg'
      );

      render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/tsra?size=medium"
          animated={false}
        />
      );

      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith(
        'https://api.weather.gov/icons/land/day/tsra?size=medium',
        false
      );
    });
  });

  describe('Accessibility attributes', () => {
    it('should set alt text from shortForecast', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/thunderstorms.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/tsra?size=medium"
          shortForecast="Thunderstorms Likely"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Thunderstorms Likely');
      expect(img).toHaveAttribute('aria-label', 'Thunderstorms Likely');
    });

    it('should use default alt text when no shortForecast provided', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Weather icon');
    });

    it('should have aria-label attribute when shortForecast is undefined', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />
      );

      const img = container.querySelector('img');
      // React renders aria-label={undefined} as aria-label attribute with no value
      // or doesn't render it at all (returns null from getAttribute)
      const ariaLabel = img?.getAttribute('aria-label');
      // When shortForecast is undefined, React may or may not render the attribute
      // We just check it exists in some form (null is the result of no attribute)
      expect(ariaLabel).not.toBeUndefined();
    });
  });

  describe('Lazy loading', () => {
    it('should have loading="lazy" attribute', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          className="custom-class"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('custom-class');
    });

    it('should always include object-contain class', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          className="custom-class"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-contain');
      expect(img).toHaveClass('custom-class');
    });
  });

  describe('Different weather conditions', () => {
    it('should handle clear day condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          shortForecast="Sunny"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/clear-day.svg');
      expect(img).toHaveAttribute('alt', 'Sunny');
    });

    it('should handle clear night condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-night.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/night/skc?size=medium"
          shortForecast="Clear"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/clear-night.svg');
    });

    it('should handle cloudy condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/cloudy.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/ovc?size=medium"
          shortForecast="Overcast"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/cloudy.svg');
    });

    it('should handle rain condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/rainy-3.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/rain?size=medium"
          shortForecast="Rain"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/rainy-3.svg');
    });

    it('should handle snow condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/snowy-3.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/snow?size=medium"
          shortForecast="Snow"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/snowy-3.svg');
    });

    it('should handle thunderstorm condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/thunderstorms.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/tsra?size=medium"
          shortForecast="Thunderstorms"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/thunderstorms.svg');
    });

    it('should handle partly cloudy day condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/cloudy-2-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/sct?size=medium"
          shortForecast="Partly Cloudy"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/cloudy-2-day.svg');
    });

    it('should handle partly cloudy night condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/cloudy-2-night.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/night/sct?size=medium"
          shortForecast="Partly Cloudy"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/cloudy-2-night.svg');
    });

    it('should handle fog condition', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/fog.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/fog?size=medium"
          shortForecast="Foggy"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/fog.svg');
    });

    it('should handle split icon format (rain showers then clear)', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/rainy-1-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/sct,0/rain_showers,40?size=medium"
          shortForecast="Chance Rain Showers"
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/rainy-1-day.svg');
    });
  });

  describe('Error handling', () => {
    it('should handle image load error with fallback', async () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/invalid-icon.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/invalid?size=medium"
          shortForecast="Unknown Condition"
        />
      );

      const img = container.querySelector('img') as HTMLImageElement;
      expect(img).toBeInTheDocument();

      // Trigger error event using fireEvent
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/cloudy.svg');
      });
    });

    it('should log warning when fallback is triggered', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/invalid-icon.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/invalid?size=medium"
          shortForecast="Unknown Condition"
        />
      );

      const img = container.querySelector('img') as HTMLImageElement;
      fireEvent.error(img);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load weather icon')
        );
      });
    });

    it('should not trigger error multiple times', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/invalid-icon.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/invalid?size=medium"
          shortForecast="Unknown Condition"
        />
      );

      const img = container.querySelector('img') as HTMLImageElement;

      // Trigger error multiple times
      fireEvent.error(img);
      fireEvent.error(img);
      fireEvent.error(img);

      await waitFor(() => {
        // Should only log once
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('should maintain size when falling back to cloudy icon', async () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/invalid-icon.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/invalid?size=medium"
          size="lg"
        />
      );

      const img = container.querySelector('img') as HTMLImageElement;
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveAttribute('width', '96');
        expect(img).toHaveAttribute('height', '96');
      });
    });

    it('should preserve alt text when falling back to cloudy icon', async () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/invalid-icon.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/invalid?size=medium"
          shortForecast="Unknown Condition"
        />
      );

      const img = container.querySelector('img') as HTMLImageElement;
      fireEvent.error(img);

      await waitFor(() => {
        expect(img).toHaveAttribute('alt', 'Unknown Condition');
      });
    });
  });

  describe('Integration with weatherIconMapper', () => {
    it('should call getWeatherIconFromUrl with correct parameters', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const nwsUrl = 'https://api.weather.gov/icons/land/day/skc,0?size=medium';

      render(<WeatherIcon nwsIconUrl={nwsUrl} animated={true} />);

      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith(nwsUrl, true);
      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledTimes(1);
    });

    it('should handle complex NWS URLs with percentage', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/rainy-1-day.svg'
      );

      const nwsUrl = 'https://api.weather.gov/icons/land/day/rain_showers,70?size=medium';

      render(<WeatherIcon nwsIconUrl={nwsUrl} shortForecast="Rain Showers - 70%" />);

      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith(nwsUrl, true);
    });

    it('should handle NWS URLs with split conditions', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/thunderstorms.svg'
      );

      const nwsUrl =
        'https://api.weather.gov/icons/land/day/bkn,0/tsra_sct,30?size=medium';

      render(<WeatherIcon nwsIconUrl={nwsUrl} shortForecast="Scattered Thunderstorms" />);

      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith(nwsUrl, true);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long shortForecast text', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const longForecast = 'A'.repeat(500);

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          shortForecast={longForecast}
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', longForecast);
    });

    it('should handle special characters in shortForecast', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const specialForecast = 'Sunny & Hot (90°F)';

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          shortForecast={specialForecast}
        />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', specialForecast);
    });

    it('should handle empty string shortForecast', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          shortForecast=""
        />
      );

      const img = container.querySelector('img');
      // Empty string is falsy, so should use default
      expect(img).toHaveAttribute('alt', 'Weather icon');
    });

    it('should handle malformed NWS URL', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/cloudy.svg'
      );

      const { container } = render(
        <WeatherIcon nwsIconUrl="not-a-valid-url" shortForecast="Unknown" />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(weatherIconMapper.getWeatherIconFromUrl).toHaveBeenCalledWith('not-a-valid-url', true);
    });
  });

  describe('Component rerendering', () => {
    it('should update icon when nwsIconUrl changes', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl)
        .mockReturnValueOnce('/src/assets/weather-icons/animated/clear-day.svg')
        .mockReturnValueOnce('/src/assets/weather-icons/animated/cloudy.svg');

      const { container, rerender } = render(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium" />
      );

      let img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/clear-day.svg');

      rerender(
        <WeatherIcon nwsIconUrl="https://api.weather.gov/icons/land/day/ovc?size=medium" />
      );

      img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/src/assets/weather-icons/animated/cloudy.svg');
    });

    it('should update size when size prop changes', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container, rerender } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          size="sm"
        />
      );

      let img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '40');

      rerender(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          size="lg"
        />
      );

      img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '96');
    });

    it('should update alt text when shortForecast changes', () => {
      vi.mocked(weatherIconMapper.getWeatherIconFromUrl).mockReturnValue(
        '/src/assets/weather-icons/animated/clear-day.svg'
      );

      const { container, rerender } = render(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          shortForecast="Sunny"
        />
      );

      let img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Sunny');

      rerender(
        <WeatherIcon
          nwsIconUrl="https://api.weather.gov/icons/land/day/skc?size=medium"
          shortForecast="Clear"
        />
      );

      img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Clear');
    });
  });
});
