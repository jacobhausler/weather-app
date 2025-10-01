/**
 * Test setup file for backend tests
 * Configures the testing environment for Node.js with Vitest
 */
export declare const TEST_TIMEOUT = 30000;
export declare const testHelpers: {
    /**
     * Wait for a condition to be true
     */
    waitFor(condition: () => boolean, timeoutMs?: number): Promise<void>;
    /**
     * Create a mock ZIP code for testing
     */
    getMockZipCode(): string;
    /**
     * Create mock coordinates for testing
     */
    getMockCoordinates(): {
        lat: number;
        lon: number;
    };
};
//# sourceMappingURL=setupTests.d.ts.map