import { test, expect } from '@playwright/test';

test.describe('ZIP Code Submission Flow', () => {
  test('should successfully fetch and display weather data for ZIP 75454', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find the ZIP code input
    const zipInput = page.getByPlaceholder(/enter.*zip/i);
    await expect(zipInput).toBeVisible();

    // Clear any existing value and enter ZIP code
    await zipInput.clear();
    await zipInput.fill('75454');

    // Click the submit button (look for button with arrow or submit icon)
    const submitButton = page.getByRole('button', { name: /submit|go|search/i }).or(
      page.locator('button[type="submit"]')
    );

    // Set up network request monitoring BEFORE clicking
    const weatherRequest = page.waitForResponse(
      response => response.url().includes('/api/weather/75454') && response.status() === 200,
      { timeout: 30000 }
    );

    // Click the submit button
    await submitButton.click();

    // Wait for the API request to complete
    const response = await weatherRequest;
    const responseData = await response.json();

    // Log the response for debugging
    console.log('API Response:', JSON.stringify(responseData, null, 2));

    // Verify response structure
    expect(responseData).toHaveProperty('location');
    expect(responseData).toHaveProperty('coordinates');
    expect(responseData).toHaveProperty('forecast');
    expect(responseData).toHaveProperty('hourlyForecast');
    expect(responseData).toHaveProperty('currentObservation');

    // Wait for loading to finish (spinner should disappear)
    await page.waitForSelector('[role="status"]', { state: 'hidden', timeout: 10000 }).catch(() => {
      // Loading spinner might not appear if response is very fast
    });

    // Verify weather data is displayed - look for key elements
    // Check for 7-day forecast
    await expect(page.getByText(/7-day forecast/i)).toBeVisible({ timeout: 10000 });

    // Check for current conditions
    await expect(page.getByText(/current conditions/i)).toBeVisible();

    // Check for hourly forecast
    await expect(page.getByText(/hourly forecast/i)).toBeVisible();

    // Check for temperature values (should see numbers with ° symbol)
    await expect(page.locator('text=/\\d+°/')).toBeVisible();

    // Verify location is displayed
    await expect(page.getByText(/melissa|75454/i)).toBeVisible();

    // Check for no error banner
    const errorBanner = page.getByRole('alert');
    await expect(errorBanner).not.toBeVisible();
  });

  test('should handle invalid ZIP code gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const zipInput = page.getByPlaceholder(/enter.*zip/i);
    await zipInput.clear();
    await zipInput.fill('00000'); // Invalid ZIP

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show an error (either validation error or API error)
    const errorMessage = page.getByRole('alert').or(page.getByText(/error|invalid|not found/i));
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should show validation error for non-numeric ZIP', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const zipInput = page.getByPlaceholder(/enter.*zip/i);
    await zipInput.clear();
    await zipInput.fill('abcde'); // Non-numeric

    // Input should not allow non-numeric characters OR show validation error
    const inputValue = await zipInput.inputValue();
    expect(inputValue).not.toContain('abcde');
  });

  test('should enable/disable submit button based on ZIP validity', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const zipInput = page.getByPlaceholder(/enter.*zip/i);
    const submitButton = page.locator('button[type="submit"]');

    // Empty input - button should be disabled
    await zipInput.clear();
    await expect(submitButton).toBeDisabled();

    // 4 digits - button should be disabled
    await zipInput.fill('7545');
    await expect(submitButton).toBeDisabled();

    // 5 digits - button should be enabled
    await zipInput.fill('75454');
    await expect(submitButton).toBeEnabled();
  });

  test('should capture and display actual error if fetch fails', async ({ page }) => {
    // This test will help us see what error actually occurs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });

    page.on('requestfailed', request => {
      console.log('Request Failed:', request.url(), request.failure()?.errorText);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const zipInput = page.getByPlaceholder(/enter.*zip/i);
    await zipInput.clear();
    await zipInput.fill('75454');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait a bit to see if any errors occur
    await page.waitForTimeout(5000);

    // Check for error banner
    const errorBanner = page.getByRole('alert');
    if (await errorBanner.isVisible()) {
      const errorText = await errorBanner.textContent();
      console.log('Error Banner Text:', errorText);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/zip-submission-test.png', fullPage: true });
  });
});
