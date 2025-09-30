/**
 * Background Jobs Service
 * Handles scheduled tasks for weather data caching and refresh
 */
import { ScheduledTask } from 'node-cron';
/**
 * Initialize background jobs
 * - Starts the 5-minute refresh cycle for cached ZIP codes
 * - Performs initial refresh on startup
 */
export declare function initBackgroundJobs(): ScheduledTask;
/**
 * Stop background jobs
 */
export declare function stopBackgroundJobs(task: ScheduledTask): void;
/**
 * Get configured ZIP codes (for monitoring/debugging)
 */
export declare function getConfiguredZipCodes(): string[];
/**
 * Get background jobs status information
 */
export declare function getBackgroundJobsStatus(): {
    enabled: boolean;
    cachedZipCodes: string[];
    refreshInterval: string;
    schedule: string;
};
//# sourceMappingURL=backgroundJobs.d.ts.map