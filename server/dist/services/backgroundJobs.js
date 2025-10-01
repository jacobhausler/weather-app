/**
 * Background Jobs Service
 * Handles scheduled tasks for weather data caching and refresh
 */
import cron from 'node-cron';
import { nwsService } from './nwsService.js';
import { geocodeZip } from './geocodingService.js';
import { logger } from '../utils/logger.js';
// Configured ZIP codes to refresh (as specified in CLAUDE.md)
const CACHED_ZIP_CODES = ['75454', '75070', '75035'];
// Refresh interval: every 5 minutes
const REFRESH_CRON_SCHEDULE = '*/5 * * * *';
/**
 * Refresh weather data for a single ZIP code
 */
async function refreshZipCode(zipCode) {
    try {
        logger.info(`[Background] Starting refresh for ZIP ${zipCode}`);
        // Geocode ZIP to coordinates
        const { lat, lon } = await geocodeZip(zipCode);
        // Prefetch weather data (warms cache)
        await nwsService.prefetchWeatherData(lat, lon);
        logger.info(`[Background] Successfully refreshed ZIP ${zipCode}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[Background] Failed to refresh ZIP ${zipCode}: ${errorMessage}`);
    }
}
/**
 * Refresh all configured ZIP codes
 */
async function refreshAllZipCodes() {
    logger.info('[Background] Starting scheduled refresh for cached ZIP codes');
    const startTime = Date.now();
    try {
        // Refresh all ZIP codes in parallel
        await Promise.allSettled(CACHED_ZIP_CODES.map((zipCode) => refreshZipCode(zipCode)));
        const duration = Date.now() - startTime;
        logger.info(`[Background] Completed refresh cycle in ${duration}ms`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[Background] Error during refresh cycle: ${errorMessage}`);
    }
}
/**
 * Initialize background jobs
 * - Starts the 5-minute refresh cycle for cached ZIP codes
 * - Performs initial refresh on startup
 */
export function initBackgroundJobs() {
    logger.info('[Background] Initializing background jobs...');
    logger.info(`[Background] Configured ZIP codes: ${CACHED_ZIP_CODES.join(', ')}`);
    logger.info(`[Background] Refresh schedule: every 5 minutes`);
    // Perform initial refresh on startup (non-blocking)
    refreshAllZipCodes().catch((error) => {
        logger.error('[Background] Initial refresh failed:', error);
    });
    // Schedule periodic refresh every 5 minutes
    const task = cron.schedule(REFRESH_CRON_SCHEDULE, () => {
        refreshAllZipCodes();
    }, {
        timezone: 'America/Chicago', // Can be configured via env variable
    });
    logger.info('[Background] Background jobs initialized successfully');
    return task;
}
/**
 * Stop background jobs
 */
export function stopBackgroundJobs(task) {
    logger.info('[Background] Stopping background jobs...');
    task.stop();
    logger.info('[Background] Background jobs stopped');
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