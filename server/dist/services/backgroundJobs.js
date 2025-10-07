/**
 * Background Jobs Service
 * Handles scheduled tasks for weather data caching and refresh
 */
import cron from 'node-cron';
import { nwsService } from './nwsService.js';
import { geocodeZip } from './geocodingService.js';
import { logger } from '../utils/logger.js';
import { getAllZipCodes } from './zipCodeStorage.js';
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
 * Refresh all tracked ZIP codes
 */
async function refreshAllZipCodes() {
    const zipCodes = getAllZipCodes();
    if (zipCodes.length === 0) {
        logger.debug('[Background] No ZIP codes to refresh');
        return;
    }
    logger.info(`[Background] Starting scheduled refresh for ${zipCodes.length} cached ZIP codes`);
    const startTime = Date.now();
    try {
        // Refresh all ZIP codes in parallel
        await Promise.allSettled(zipCodes.map((zipCode) => refreshZipCode(zipCode)));
        const duration = Date.now() - startTime;
        logger.info(`[Background] Completed refresh cycle for ${zipCodes.length} ZIP codes in ${duration}ms`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[Background] Error during refresh cycle: ${errorMessage}`);
    }
}
/**
 * Initialize background jobs
 * - Starts the 5-minute refresh cycle for all tracked ZIP codes
 * - Performs initial refresh on startup
 */
export function initBackgroundJobs() {
    const zipCodes = getAllZipCodes();
    logger.info('[Background] Initializing background jobs...');
    logger.info(`[Background] Tracked ZIP codes: ${zipCodes.length > 0 ? zipCodes.join(', ') : 'none'}`);
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
 * Get background jobs status information
 */
export function getBackgroundJobsStatus() {
    const zipCodes = getAllZipCodes();
    return {
        enabled: true,
        cachedZipCodes: zipCodes,
        totalZipCodes: zipCodes.length,
        refreshInterval: '5 minutes',
        schedule: REFRESH_CRON_SCHEDULE,
    };
}
//# sourceMappingURL=backgroundJobs.js.map