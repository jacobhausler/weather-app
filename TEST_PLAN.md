# Comprehensive Test Suite Design for HAUS Weather Station

## Executive Summary

This document outlines a comprehensive testing strategy for the HAUS Weather Station application, designed to catch and prevent the critical issues identified during analysis.

## Critical Issues to Address

### Priority 1 - Application Breaking Bugs
1. **SunCalc Import Error**: Backend crashes on every weather request
2. **Data Structure Mismatch**: Frontend cannot consume backend response

### Priority 2 - UI/UX Issues
3. **ThemeToggle Stale State**: Icon doesn't update with theme changes
4. **ZipInput Validation**: Error message persists after correction
5. **Health Check Path**: Frontend calls wrong endpoint

### Priority 3 - Code Quality Issues
6. **Unused Code**: Duplicate cache and NWS client implementations
7. **Inconsistent Logging**: Console.log instead of structured logging
8. **Missing Accessibility**: Keyboard navigation and ARIA labels

## Test Architecture

### Framework Selection

#### Unit Testing
- **Framework**: Vitest (faster than Jest, better Vite integration)
- **React Testing**: @testing-library/react
- **Mocking**: vitest-fetch-mock for API calls
- **Coverage Tool**: @vitest/coverage-v8

#### Integration Testing
- **Framework**: Vitest + MSW (Mock Service Worker)
- **API Mocking**: MSW for intercepting network requests
- **Database**: In-memory cache testing

#### E2E Testing
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari, Mobile viewports
- **Visual Regression**: Playwright screenshots

#### Performance Testing
- **Bundle Analysis**: vite-bundle-visualizer
- **Lighthouse**: Automated performance audits
- **Load Testing**: k6 for backend endpoints

## Test Structure

```
/workspaces/weather-app/
├── tests/
│   ├── unit/
│   │   ├── frontend/
│   │   │   ├── components/
│   │   │   │   ├── ZipInput.test.tsx
│   │   │   │   ├── ThemeToggle.test.tsx
│   │   │   │   ├── SevenDayForecast.test.tsx
│   │   │   │   ├── CurrentConditions.test.tsx
│   │   │   │   ├── HourlyForecast.test.tsx
│   │   │   │   ├── AlertCard.test.tsx
│   │   │   │   ├── RefreshButton.test.tsx
│   │   │   │   └── ForecastModal.test.tsx
│   │   │   ├── stores/
│   │   │   │   ├── weatherStore.test.ts
│   │   │   │   ├── themeStore.test.ts
│   │   │   │   └── unitStore.test.ts
│   │   │   └── hooks/
│   │   │       └── useWeatherData.test.ts
│   │   └── backend/
│   │       ├── services/
│   │       │   ├── nwsService.test.ts
│   │       │   ├── geocodingService.test.ts
│   │       │   ├── sunService.test.ts
│   │       │   └── cacheService.test.ts
│   │       └── routes/
│   │           └── weatherRoutes.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── weather-flow.test.ts
│   │   │   ├── cache-behavior.test.ts
│   │   │   └── error-handling.test.ts
│   │   └── frontend/
│   │       ├── data-flow.test.tsx
│   │       └── user-preferences.test.tsx
│   ├── e2e/
│   │   ├── weather-lookup.spec.ts
│   │   ├── theme-switching.spec.ts
│   │   ├── unit-conversion.spec.ts
│   │   ├── refresh-cycle.spec.ts
│   │   ├── error-recovery.spec.ts
│   │   └── accessibility.spec.ts
│   ├── fixtures/
│   │   ├── nws-responses/
│   │   │   ├── points.json
│   │   │   ├── forecast.json
│   │   │   ├── hourly.json
│   │   │   ├── observations.json
│   │   │   └── alerts.json
│   │   └── test-data.ts
│   └── utils/
│       ├── test-helpers.ts
│       ├── mock-server.ts
│       └── accessibility-helpers.ts
```

## Test Implementation Plan

### Phase 1: Critical Bug Prevention Tests (Week 1)

#### 1.1 SunCalc Import Test
```typescript
// tests/unit/backend/services/sunService.test.ts
import { describe, it, expect } from 'vitest';
import { getSunTimes } from '../../../../server/src/services/sunService';

describe('SunService', () => {
  it('should calculate sun times without crashing', () => {
    const result = getSunTimes(33.2841, -96.574, new Date(), 'America/Chicago');
    expect(result).toBeDefined();
    expect(result.sunrise).toBeInstanceOf(Date);
    expect(result.sunset).toBeInstanceOf(Date);
  });
});
```

#### 1.2 Data Structure Contract Test
```typescript
// tests/integration/api/weather-flow.test.ts
import { describe, it, expect } from 'vitest';
import { weatherApi } from '../../../src/services/api';
import { WeatherData } from '../../../src/types/weather';

describe('Weather API Data Contract', () => {
  it('should return data matching frontend WeatherData interface', async () => {
    const response = await fetch('/api/weather/75454');
    const data = await response.json();

    // Critical structure tests
    expect(data.zipCode).toBeDefined();
    expect(data.coordinates.latitude).toBeDefined();
    expect(data.coordinates.longitude).toBeDefined();
    expect(Array.isArray(data.forecast)).toBe(true);
    expect(Array.isArray(data.hourlyForecast)).toBe(true);
    expect(data.lastUpdated).toBeDefined();
  });
});
```

### Phase 2: Component Tests (Week 1)

#### 2.1 Theme Toggle State Test
```typescript
// tests/unit/frontend/components/ThemeToggle.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeToggle } from '../../../../src/components/ThemeToggle';

describe('ThemeToggle', () => {
  it('should update icon when theme changes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Initial state
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

    // Click to change theme
    fireEvent.click(button);

    // Icon should update
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });
});
```

#### 2.2 ZIP Input Validation Test
```typescript
// tests/unit/frontend/components/ZipInput.test.tsx
describe('ZipInput', () => {
  it('should clear error when valid ZIP is entered', () => {
    const { getByRole, queryByText } = render(<ZipInput />);
    const input = getByRole('textbox');

    // Enter invalid ZIP
    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.submit(input.closest('form'));
    expect(queryByText(/must be 5 digits/)).toBeInTheDocument();

    // Enter valid ZIP
    fireEvent.change(input, { target: { value: '75454' } });
    expect(queryByText(/must be 5 digits/)).not.toBeInTheDocument();
  });
});
```

### Phase 3: Integration Tests (Week 2)

#### 3.1 End-to-End Data Flow Test
```typescript
// tests/integration/frontend/data-flow.test.tsx
describe('Weather Data Flow', () => {
  it('should fetch and display weather data', async () => {
    const { getByRole, findByText } = render(<App />);

    // Submit ZIP code
    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: '75454' } });
    fireEvent.submit(input.closest('form'));

    // Wait for data to load
    await findByText(/Current Conditions/);

    // Verify all cards rendered
    expect(screen.getByText(/7-Day Forecast/)).toBeInTheDocument();
    expect(screen.getByText(/Hourly Forecast/)).toBeInTheDocument();
  });
});
```

#### 3.2 Cache Behavior Test
```typescript
// tests/integration/api/cache-behavior.test.ts
describe('Cache Behavior', () => {
  it('should return cached data on second request', async () => {
    const zip = '75454';

    // First request - should hit NWS API
    const start1 = Date.now();
    const response1 = await fetch(`/api/weather/${zip}`);
    const time1 = Date.now() - start1;

    // Second request - should return from cache
    const start2 = Date.now();
    const response2 = await fetch(`/api/weather/${zip}`);
    const time2 = Date.now() - start2;

    expect(time2).toBeLessThan(time1 / 2); // Cached should be much faster
  });
});
```

### Phase 4: E2E Tests (Week 2)

#### 4.1 Complete User Journey Test
```typescript
// tests/e2e/weather-lookup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Weather Lookup Journey', () => {
  test('should complete full weather lookup flow', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Enter ZIP code
    await page.fill('input[placeholder="Enter ZIP code"]', '75454');
    await page.click('button[type="submit"]');

    // Wait for data to load
    await page.waitForSelector('text=Current Conditions');

    // Verify all sections visible
    await expect(page.locator('text=7-Day Forecast')).toBeVisible();
    await expect(page.locator('text=Hourly Forecast')).toBeVisible();

    // Test forecast modal
    await page.click('.forecast-day-card:first-child');
    await expect(page.locator('.forecast-modal')).toBeVisible();

    // Test theme toggle
    await page.click('[aria-label="Toggle theme"]');
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Test unit toggle
    await page.click('[aria-label="Toggle units"]');
    await expect(page.locator('text=°C')).toBeVisible();
  });
});
```

#### 4.2 Accessibility Test
```typescript
// tests/e2e/accessibility.spec.ts
test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Tab through interface
    await page.keyboard.press('Tab'); // Focus ZIP input
    await page.keyboard.type('75454');
    await page.keyboard.press('Enter');

    await page.waitForSelector('text=Current Conditions');

    // Navigate with keyboard
    await page.keyboard.press('Tab'); // Focus refresh button
    await page.keyboard.press('Tab'); // Focus first forecast day
    await page.keyboard.press('Enter'); // Open modal
    await page.keyboard.press('Escape'); // Close modal
  });

  test('should pass WCAG standards', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toHaveLength(0);
  });
});
```

### Phase 5: Performance Tests (Week 3)

#### 5.1 Load Test
```javascript
// tests/performance/load-test.k6.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const zips = ['75454', '75070', '75035'];
  const zip = zips[Math.floor(Math.random() * zips.length)];

  const res = http.get(`http://localhost:3001/api/weather/${zip}`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Test Configuration Files

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '*.config.*'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

## Test Scripts

### package.json additions
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:load": "k6 run tests/performance/load-test.k6.js",
    "test:a11y": "playwright test tests/e2e/accessibility.spec.ts"
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Metrics & Goals

### Coverage Targets
- **Unit Tests**: 80% line coverage
- **Integration Tests**: 100% of critical paths
- **E2E Tests**: 100% of user journeys

### Performance Targets
- **API Response Time**: p95 < 500ms
- **Frontend Load Time**: < 3s on 3G
- **Bundle Size**: < 600KB (main) + < 200KB (vendor)

### Quality Gates
- All tests must pass before merge
- No decrease in coverage allowed
- Performance budgets enforced
- Accessibility violations = build failure

## Testing Best Practices

### 1. Test Pyramid
- 70% Unit tests (fast, isolated)
- 20% Integration tests (critical flows)
- 10% E2E tests (user journeys)

### 2. Test Data Management
- Use fixtures for consistent test data
- Mock external APIs with MSW
- Reset database/cache between tests

### 3. Naming Conventions
- Descriptive test names: "should [expected behavior] when [condition]"
- Group related tests with describe blocks
- Use data-testid for E2E selectors

### 4. Maintenance
- Run tests in watch mode during development
- Fix flaky tests immediately
- Review and update tests with code changes
- Monitor test execution time

## Implementation Schedule

### Week 1 (Immediate)
- [ ] Set up Vitest and React Testing Library
- [ ] Write tests for critical bugs (SunCalc, data structure)
- [ ] Implement component unit tests
- [ ] Add pre-commit hooks for test execution

### Week 2 (Short-term)
- [ ] Set up MSW for API mocking
- [ ] Write integration tests
- [ ] Set up Playwright
- [ ] Implement E2E tests

### Week 3 (Medium-term)
- [ ] Add performance tests with k6
- [ ] Implement visual regression tests
- [ ] Add accessibility testing
- [ ] Integrate with CI/CD pipeline

### Week 4 (Polish)
- [ ] Achieve 80% coverage target
- [ ] Document test patterns
- [ ] Create test data generators
- [ ] Set up test reporting dashboard

## Monitoring & Alerts

### Test Health Dashboard
- Test execution time trends
- Coverage trends
- Flaky test detection
- Performance regression alerts

### Automated Alerts
- Slack notification on test failure
- Coverage drop warnings
- Performance budget violations
- Accessibility regression alerts

## Conclusion

This comprehensive test suite will:
1. Prevent the critical bugs that break the application
2. Ensure data contracts between frontend and backend
3. Validate all user interactions
4. Maintain performance standards
5. Ensure accessibility compliance
6. Provide confidence for refactoring and new features

The test suite is designed to be maintainable, fast, and comprehensive, catching issues before they reach production while maintaining developer productivity.