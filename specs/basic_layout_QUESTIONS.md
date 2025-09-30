# Basic Layout Implementation Questions

## General Layout & Structure

1. **Responsive Design**: What breakpoints should be supported? Should this be mobile-first, desktop-only, or fully responsive?

MOBILE FIRST

2. **Title Customization**: Should "HAUS Weather Station" be configurable, or is this a fixed title?

THIS IS A FIXED TITLE

3. **ZIP Code Input**:
   - Should there be validation and error handling for invalid ZIP codes?
   - Should there be a submit button, or should it auto-fetch on valid input?
   - Should previous ZIP codes be saved/suggested?

BASIC 5-NUMBER VALIDATION, SUBMIT BUTTON, CACHE PREVIOUSLY SUBMITTED ZIPS

## Alert Card

4. **Alert Visibility**: The spec says "VISIBLE ONLY IF THERE IS A COUNTY-LEVEL ACTIVE ALERT" - should this:
   - Collapse/hide completely when no alerts?
   - Show a placeholder message like "No active alerts"?
   - Animate in/out when alerts change?

HIDE COMPLETELY WHEN NO ALERTS
PAGE RE-FETCHES DATA EVERY 5 MINUTES

5. **Alert Information Display**: Which alert properties should be shown? (e.g., severity, urgency, event type, headline, description, instructions, effective/expires times)

TYPE, HEADLINE, SEVERITY/URGENCY, DESCRIPTION, EFFECTIVE TIME RANGE

6. **Multiple Alerts**: How should multiple simultaneous alerts be displayed?
   - Stack them vertically?
   - Show in a carousel/tabs?
   - Show only the highest severity?

STACK VERTICALLY

7. **Alert Severity Styling**: Should different severity levels (Extreme, Severe, Moderate, Minor) have different visual treatments (colors, icons)?

YES

## 7-Day Forecast Card

8. **Forecast Detail Level**: Should this show:
   - Just high/low temps and icons?
   - Include precipitation probability?
   - Include wind information?
   - Show day and night forecasts separately or combined?

   YES TO ALL QUESTIONS, DESIGN COMBINED DAY/NIGHT FORECAST CARD FOR EACH DAY

9. **Layout Orientation**: Should the 7 days be:
   - Displayed horizontally in a row?
   - Stacked vertically?
   - Responsive (horizontal on desktop, vertical on mobile)?

   HORIZONTALLY IN A ROW

9b. **forecast day click action**
   - opens a modal displaying all of the available forecast information for that day
   - expanded day/night view with additional available information


## Current Conditions + Daily Forecast Card

10. **Information Priority**: What specific data points are highest priority? The spec says "as information dense as possible while maintaining clean layout". 

THIS SHOULD INCLUDE:
    - Current temperature, feels like, humidity, dewpoint
    - Wind speed, direction, gusts
    - Visibility
    - Cloud cover
    - UV index
    - Sunrise/sunset times

11. **Daily Forecast Integration**: How should the current conditions integrate with today's forecast?
    - Show current + today's high/low in same card?
    - Include tonight's forecast?
    - Show detailed forecast text?

    INCLUDE ALL 3 THINGS

12. **Layout Structure**: Should information be organized in:
    - Grid layout?
    - Split left/right (current | forecast)?
    - Hierarchical with primary metrics prominent?

    GRID, HIERARCHICAL NESTED CARDS

## Hourly Forecast Card

13. **Time Range**: How many hours should be displayed?
    - Next 12 hours?
    - Next 24 hours?
    - Next 48 hours?
    - Configurable?

    CONFIGURABLE - SPLIT BUTTON BOX INTO DATA TYPE AND PERIOD SELECTORS

14. **Chart Type**: What type of visualization?
    - Line chart for temperature?
    - Bar chart for precipitation?
    - Combined chart with multiple parameters?
    - Should it support zoom/pan?

    ALL BAR CHARTS

15. **Available Buttons**: What specific hourly forecast parameters should have toggle buttons?
    - Temperature?
    - Precipitation probability?
    - Wind speed?
    - Humidity?
    - Cloud cover?
    - Other parameters from the gridpoint data?

    TEMP, PRECIP, WIND, HUMIDITY

16. **Button Behavior**: Should buttons:
    - Toggle individual layers on/off?
    - Switch between mutually exclusive views?
    - Allow multiple simultaneous parameters?

SWITCH BETWEEN MUTUALLY EXCLUSIVE VIEWS (CHARTS)

## Data & API Integration

17. **Data Refresh**:
    - Should data auto-refresh? If so, at what interval?
    - Should there be a manual refresh button?
    - Should refresh times be displayed to users?

    FETCH ON LOAD FROM SERVER
    SERVER HANDLES FETCHING FROM NWS
    REFRESH 1 MINUTE WHILE ON-PAGE
    BACKGROUND REFRESH (DONT INTERRUPT USER)
    MANUAL REFRESH ICON TOP LEFT OF THE TITLE

18. **Error Handling**: How should API errors be communicated?
    - Toast notifications?
    - Inline error messages in each card?
    - Global error banner?

    GLOBAL ERROR BANNER WITH DETAILS

19. **Loading States**: How should loading states be displayed while fetching data?
    - Skeleton screens?
    - Spinners?
    - Progress indicators?

    SKELETON + SPINNERS

20. **Caching Strategy**: Should the app cache data locally? If so, what's the cache duration strategy per the NWS API best practices?

server maintains complete current data cache (refreshed every 5 minutes server-side) for a list of zipcodes kept in a config file. initial list of zipcodes: 75454, 75070, 75035. cached zips have cached data served immediately prior to kicking off data refresh for fast service.

## Technical Preferences

21. **Framework/Library**: Are there preferences for:
    - React, Vue, Svelte, vanilla JS?
    - UI component library (Material-UI, Tailwind, Bootstrap, custom)?
    - Charting library for hourly forecast (Chart.js, D3, Recharts, etc.)?

REACT, https://ui.shadcn.com/ FOR COMPONENTS AND CHARTS

22. **State Management**: How should application state be managed?
    - Context API?
    - Redux/Zustand?
    - URL parameters for ZIP code?

    ZUSTAND

23. **Styling Approach**:
    - CSS-in-JS?
    - CSS Modules?
    - Utility-first (Tailwind)?
    - Traditional CSS/SCSS?

    STYLE-IN-COMPONENTS

## Accessibility & UX

24. **Accessibility Requirements**: Should this meet specific WCAG standards (AA, AAA)?

WILL COVER IN LATER SPRINTS; DEFER

25. **Color Scheme**:
    - Light mode only?
    - Dark mode support?
    - System preference detection?

    BOTH MODES, SYS PREFERENCE DETECT, BUTTON TO CHANGE AT THE BOTTOM, CACHE PREFERENCE

26. **Weather Icons**: Should we use:
    - NWS provided icons?
    - Custom icon set?
    - Third-party icon library?

    NWS PROVIDED ICONS

27. **Units**:
    - Imperial only (F, mph, inches)?
    - Support for metric toggle?
    - User preference storage?

    TOGGLEABLE AT THE BOTTOM, CACHE PREFERENCES