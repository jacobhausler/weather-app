/**
 * Quick test script for geocoding service
 * Run with: npx tsx src/services/__test_geocoding.ts
 */
import { geocodeZip, getGeocodeCacheStats, clearGeocodeCache } from './geocodingService.js';
async function testGeocodingService() {
    console.log('Testing ZIP Code Geocoding Service\n');
    console.log('='.repeat(50));
    // Test 1: Valid ZIP code
    console.log('\nTest 1: Valid ZIP code (75454 - Anna, TX)');
    try {
        const coords1 = await geocodeZip('75454');
        console.log('✓ Success:', coords1);
    }
    catch (error) {
        console.error('✗ Error:', error);
    }
    // Test 2: Another valid ZIP code
    console.log('\nTest 2: Valid ZIP code (75070 - McKinney, TX)');
    try {
        const coords2 = await geocodeZip('75070');
        console.log('✓ Success:', coords2);
    }
    catch (error) {
        console.error('✗ Error:', error);
    }
    // Test 3: Cache hit (repeat first ZIP)
    console.log('\nTest 3: Cache hit (75454 again)');
    try {
        const start = Date.now();
        const coords3 = await geocodeZip('75454');
        const elapsed = Date.now() - start;
        console.log('✓ Success:', coords3);
        console.log(`  Elapsed time: ${elapsed}ms (should be very fast from cache)`);
    }
    catch (error) {
        console.error('✗ Error:', error);
    }
    // Test 4: Invalid ZIP code format
    console.log('\nTest 4: Invalid ZIP code format');
    try {
        await geocodeZip('1234'); // Only 4 digits
        console.error('✗ Should have thrown error');
    }
    catch (error) {
        console.log('✓ Correctly rejected:', error.message);
    }
    // Test 5: Invalid ZIP code format (letters)
    console.log('\nTest 5: Invalid ZIP code with letters');
    try {
        await geocodeZip('ABCDE');
        console.error('✗ Should have thrown error');
    }
    catch (error) {
        console.log('✓ Correctly rejected:', error.message);
    }
    // Test 6: Valid ZIP code (75035 - Frisco, TX)
    console.log('\nTest 6: Valid ZIP code (75035 - Frisco, TX)');
    try {
        const coords6 = await geocodeZip('75035');
        console.log('✓ Success:', coords6);
    }
    catch (error) {
        console.error('✗ Error:', error);
    }
    // Test 7: ZIP with whitespace (should be trimmed)
    console.log('\nTest 7: ZIP with whitespace');
    try {
        const coords7 = await geocodeZip('  75454  ');
        console.log('✓ Success (trimmed):', coords7);
    }
    catch (error) {
        console.error('✗ Error:', error);
    }
    // Cache stats
    console.log('\n' + '='.repeat(50));
    console.log('Cache Statistics:', getGeocodeCacheStats());
    console.log('='.repeat(50));
    // Cleanup
    clearGeocodeCache();
    console.log('\nCache cleared. Final stats:', getGeocodeCacheStats());
}
// Run tests
testGeocodingService().catch(console.error);
//# sourceMappingURL=__test_geocoding.js.map