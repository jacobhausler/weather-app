/**
 * ZIP Code Persistence Service
 * Manages persistent storage of user-entered ZIP codes in JSON file
 */
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
// Storage file path (can be overridden via environment variable)
const STORAGE_DIR = process.env['ZIP_STORAGE_DIR'] || '/data';
const STORAGE_FILE = path.join(STORAGE_DIR, 'zip-codes.json');
// In-memory cache of ZIP codes
let zipCodes = new Set();
// Track initialization state
let initialized = false;
/**
 * Initialize the ZIP code storage
 * - Creates storage directory if it doesn't exist
 * - Loads existing ZIP codes from file
 * - Falls back to environment variable CACHED_ZIP_CODES if file doesn't exist
 */
export async function initZipCodeStorage() {
    if (initialized) {
        logger.debug('[ZipStorage] Already initialized');
        return;
    }
    try {
        // Ensure storage directory exists
        await fs.mkdir(STORAGE_DIR, { recursive: true });
        logger.info(`[ZipStorage] Storage directory ensured: ${STORAGE_DIR}`);
        // Try to load existing ZIP codes from file
        try {
            const fileContent = await fs.readFile(STORAGE_FILE, 'utf-8');
            const data = JSON.parse(fileContent);
            zipCodes = new Set(data.zipCodes);
            logger.info(`[ZipStorage] Loaded ${zipCodes.size} ZIP codes from storage file`, { zipCodes: Array.from(zipCodes) });
        }
        catch (error) {
            // File doesn't exist or is invalid - initialize from environment variable
            const envZipCodes = process.env['CACHED_ZIP_CODES'];
            if (envZipCodes) {
                const initialZips = envZipCodes
                    .split(',')
                    .map(zip => zip.trim())
                    .filter(zip => /^\d{5}$/.test(zip));
                zipCodes = new Set(initialZips);
                logger.info(`[ZipStorage] Initialized with ${zipCodes.size} ZIP codes from environment`, { zipCodes: Array.from(zipCodes) });
                // Save initial ZIP codes to file
                await saveZipCodes();
            }
            else {
                logger.info('[ZipStorage] No existing ZIP codes found, starting with empty set');
            }
        }
        initialized = true;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[ZipStorage] Failed to initialize: ${errorMessage}`);
        // Fall back to environment variable even if file operations fail
        const envZipCodes = process.env['CACHED_ZIP_CODES'];
        if (envZipCodes) {
            const initialZips = envZipCodes
                .split(',')
                .map(zip => zip.trim())
                .filter(zip => /^\d{5}$/.test(zip));
            zipCodes = new Set(initialZips);
            logger.warn(`[ZipStorage] Using in-memory storage with ${zipCodes.size} ZIP codes from environment`);
        }
        initialized = true;
    }
}
/**
 * Save ZIP codes to persistent storage
 */
async function saveZipCodes() {
    try {
        const data = {
            zipCodes: Array.from(zipCodes).sort(),
            lastUpdated: new Date().toISOString(),
        };
        await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
        logger.debug(`[ZipStorage] Saved ${zipCodes.size} ZIP codes to storage file`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[ZipStorage] Failed to save ZIP codes: ${errorMessage}`);
    }
}
/**
 * Add a ZIP code to the tracked set
 * Automatically persists to file
 */
export async function addZipCode(zipCode) {
    // Validate ZIP code format
    if (!/^\d{5}$/.test(zipCode)) {
        logger.warn(`[ZipStorage] Invalid ZIP code format: ${zipCode}`);
        return;
    }
    const wasNew = !zipCodes.has(zipCode);
    zipCodes.add(zipCode);
    if (wasNew) {
        logger.info(`[ZipStorage] Added new ZIP code: ${zipCode}`);
        await saveZipCodes();
    }
}
/**
 * Get all tracked ZIP codes
 */
export function getAllZipCodes() {
    return Array.from(zipCodes).sort();
}
/**
 * Get count of tracked ZIP codes
 */
export function getZipCodeCount() {
    return zipCodes.size;
}
/**
 * Check if a ZIP code is tracked
 */
export function hasZipCode(zipCode) {
    return zipCodes.has(zipCode);
}
/**
 * Remove a ZIP code from tracking
 * (Optional - may be useful for admin endpoints)
 */
export async function removeZipCode(zipCode) {
    const wasPresent = zipCodes.delete(zipCode);
    if (wasPresent) {
        logger.info(`[ZipStorage] Removed ZIP code: ${zipCode}`);
        await saveZipCodes();
    }
    return wasPresent;
}
/**
 * Get storage statistics
 */
export function getStorageStats() {
    return {
        totalZipCodes: zipCodes.size,
        zipCodes: Array.from(zipCodes).sort(),
        storageFile: STORAGE_FILE,
        initialized,
    };
}
//# sourceMappingURL=zipCodeStorage.js.map