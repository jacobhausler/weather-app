# Basic Layout Specification

## Layout Overview

The weather app follows a mobile-first responsive design with the following hierarchy:

### Header (Fixed/Sticky)
- **Title**: "HAUS Weather Station" (left/center)
- **Refresh Button**: Manual refresh icon (top left of title)
- **ZIP Input**: 5-digit input with submit button (top right)

### Card Layout Order (Top to Bottom)

1. **Alert Card** (conditionally rendered)
   - Only visible when county-level active alerts exist
   - Displays all available information for any active alerts for the county that the inputted ZIP code is a part of
   - Multiple alerts stack vertically
   - Severity-based visual styling

2. **Current Conditions + Daily Forecast Card**
   - Responsive grid layout (side-by-side on md+ screens, stacked on mobile)
   - Left section: Current weather icon, temperature, feels like, high/low
   - Right section: Weather details grid (dewpoint, humidity, wind, visibility, cloud cover, sunrise/sunset)
   - Information-dense layout while maintaining clean visual hierarchy
   - Forecast text appears first before weather details
   - Tonight's forecast at bottom

3. **Hourly Forecast Card**
   - Responsive grid layout (side-by-side on md+ screens, stacked on mobile)
   - Chart card using hourly forecast data
   - Buttons at bottom to switch between different available hourly forecasts (temperature, precipitation, wind, humidity)
   - Configurable period and data type (split button box)

4. **7-Day Forecast Card** (positioned at bottom)
   - Centered with max-width for better visual hierarchy
   - Horizontal scrollable row layout (7 days)
   - Each day shows: high/low temps, icons, precipitation probability, wind info
   - Click day to open modal with detailed forecast
   - See 7-day forecast card example in nws-api.md

### Footer (Fixed)
- **Theme Toggle**: Dark/light mode switch
- **Unit Toggle**: Imperial/Metric conversion toggle

## Responsive Behavior

- **Mobile (<768px)**: All cards stack vertically, full width
- **Desktop (≥768px)**: Current Conditions and Hourly Forecast display side-by-side in 2-column grid
- **7-Day Forecast**: Always centered with max-width constraint on desktop