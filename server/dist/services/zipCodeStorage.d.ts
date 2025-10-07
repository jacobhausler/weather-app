/**
 * ZIP Code Persistence Service
 * Manages persistent storage of user-entered ZIP codes in JSON file
 */
/**
 * Initialize the ZIP code storage
 * - Creates storage directory if it doesn't exist
 * - Loads existing ZIP codes from file
 * - Falls back to environment variable CACHED_ZIP_CODES if file doesn't exist
 */
export declare function initZipCodeStorage(): Promise<void>;
/**
 * Add a ZIP code to the tracked set
 * Automatically persists to file
 */
export declare function addZipCode(zipCode: string): Promise<void>;
/**
 * Get all tracked ZIP codes
 */
export declare function getAllZipCodes(): string[];
/**
 * Get count of tracked ZIP codes
 */
export declare function getZipCodeCount(): number;
/**
 * Check if a ZIP code is tracked
 */
export declare function hasZipCode(zipCode: string): boolean;
/**
 * Remove a ZIP code from tracking
 * (Optional - may be useful for admin endpoints)
 */
export declare function removeZipCode(zipCode: string): Promise<boolean>;
/**
 * Get storage statistics
 */
export declare function getStorageStats(): {
    totalZipCodes: number;
    zipCodes: string[];
    storageFile: string;
    initialized: boolean;
};
//# sourceMappingURL=zipCodeStorage.d.ts.map