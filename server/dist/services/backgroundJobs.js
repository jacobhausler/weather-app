/**
 * Background Jobs Service
 * Handles scheduled tasks for weather data caching and refresh
 */
import cron from 'node-cron';
import { nwsService } from './nwsService.js';
import { geocodeZip } from './geocodingService.js';
// Configured ZIP codes to refresh (as specified in CLAUDE.md)
const CACHED_ZIP_CODES = ['75454', '75070', '75035'];
// Refresh interval: every 5 minutes
const REFRESH_CRON_SCHEDULE = '*/5 * * * *';
/**
 * Refresh weather data for a single ZIP code
 */
async function refreshZipCode(zipCode) {
    try {
        console.log(`[Background] Starting refresh for ZIP ${zipCode}`);
        // Geocode ZIP to coordinates
        const { lat, lon } = await geocodeZip(zipCode);
        // Prefetch weather data (warms cache)
        await nwsService.prefetchWeatherData(lat, lon);
        console.log(`[Background] Successfully refreshed ZIP ${zipCode}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Background] Failed to refresh ZIP ${zipCode}: ${errorMessage}`);
    }
}
/**
 * Refresh all configured ZIP codes
 */
async function refreshAllZipCodes() {
    console.log('[Background] Starting scheduled refresh for cached ZIP codes');
    const startTime = Date.now();
    try {
        // Refresh all ZIP codes in parallel
        await Promise.allSettled(CACHED_ZIP_CODES.map((zipCode) => refreshZipCode(zipCode)));
        const duration = Date.now() - startTime;
        console.log(`[Background] Completed refresh cycle in ${duration}ms`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Background] Error during refresh cycle: ${errorMessage}`);
    }
}
/**
 * Initialize background jobs
 * - Starts the 5-minute refresh cycle for cached ZIP codes
 * - Performs initial refresh on startup
 */
export function initBackgroundJobs() {
    console.log('[Background] Initializing background jobs...');
    console.log(`[Background] Configured ZIP codes: ${CACHED_ZIP_CODES.join(', ')}`);
    console.log(`[Background] Refresh schedule: every 5 minutes`);
    // Perform initial refresh on startup (non-blocking)
    refreshAllZipCodes().catch((error) => {
        console.error('[Background] Initial refresh failed:', error);
    });
    // Schedule periodic refresh every 5 minutes
    const task = cron.schedule(REFRESH_CRON_SCHEDULE, () => {
        refreshAllZipCodes();
    }, {
        timezone: 'America/Chicago', // Can be configured via env variable
    });
    console.log('[Background] Background jobs initialized successfully');
    return task;
}
/**
 * Stop background jobs
 */
export function stopBackgroundJobs(task) {
    console.log('[Background] Stopping background jobs...');
    task.stop();
    console.log('[Background] Background jobs stopped');
}
/**
 * Get configured ZIP codes (for monitoring/debugging)
 */
export function getConfiguredZipCodes() {
    return [...CACHED_ZIP_CODES];
}
/**
 * Get background jobs status information
 */
export function getBackgroundJobsStatus() {
    return {
        enabled: true,
        cachedZipCodes: [...CACHED_ZIP_CODES],
        refreshInterval: '5 minutes',
        schedule: REFRESH_CRON_SCHEDULE,
    };
}
//# sourceMappingURL=backgroundJobs.js.map