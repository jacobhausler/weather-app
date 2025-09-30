/**
 * Weather API Routes
 * Main routes for fetching weather data by ZIP code
 */

import { FastifyPluginAsync } from 'fastify';
import { nwsService } from '../services/nwsService.js';
import { geocodeZip } from '../services/geocodingService.js';
import type { WeatherPackage } from '../types/weather.types.js';

// Route parameter schema
interface ZipCodeParams {
  zipcode: string;
}

const weatherRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/weather/:zipcode
   * Fetch complete weather package for a ZIP code
   *
   * Flow:
   * 1. Validate ZIP code (5 digits)
   * 2. Geocode ZIP to coordinates (cached)
   * 3. Fetch point data from NWS (cached)
   * 4. Fetch forecast, hourly, observations, alerts in parallel
   * 5. Return complete weather package
   *
   * Caching:
   * - Serves cached data immediately if available
   * - Background refresh triggered for stale data
   * - Different TTLs for different data types (see nwsService)
   */
  fastify.get<{ Params: ZipCodeParams }>(
    '/weather/:zipcode',
    {
      schema: {
        params: {
          type: 'object',
          required: ['zipcode'],
          properties: {
            zipcode: {
              type: 'string',
              pattern: '^\\d{5}$',
              description: '5-digit US ZIP code',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            description: 'Complete weather data package',
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { zipcode } = request.params;

      try {
        // Step 1: Validate ZIP code format
        if (!/^\d{5}$/.test(zipcode)) {
          return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid ZIP code format. Must be 5 digits.',
            statusCode: 400,
          });
        }

        fastify.log.info({ zipcode }, 'Fetching weather data for ZIP code');

        // Step 2: Geocode ZIP code to coordinates
        let coordinates;
        try {
          coordinates = await geocodeZip(zipcode);
          fastify.log.debug(
            { zipcode, coordinates },
            'Successfully geocoded ZIP code'
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Geocoding failed';

          if (errorMessage.includes('No geocoding results found')) {
            return reply.code(404).send({
              error: 'Not Found',
              message: `ZIP code ${zipcode} not found. Please verify the ZIP code is valid.`,
              statusCode: 404,
            });
          }

          if (errorMessage.includes('Invalid ZIP code format')) {
            return reply.code(400).send({
              error: 'Bad Request',
              message: errorMessage,
              statusCode: 400,
            });
          }

          throw error; // Re-throw other errors to be caught by outer try-catch
        }

        const { lat, lon } = coordinates;

        // Step 3: Get point data (grid coordinates)
        let pointData;
        try {
          pointData = await nwsService.getPointData(lat, lon);
          fastify.log.debug(
            {
              zipcode,
              gridId: pointData.properties.gridId,
              gridX: pointData.properties.gridX,
              gridY: pointData.properties.gridY,
            },
            'Retrieved NWS grid coordinates'
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to get point data';

          if (errorMessage.includes('not found')) {
            return reply.code(404).send({
              error: 'Not Found',
              message:
                'Weather data not available for this location. The location may be outside the United States.',
              statusCode: 404,
            });
          }

          throw error;
        }

        const { gridId, gridX, gridY, forecastOffice, timeZone } =
          pointData.properties;

        // Step 4: Fetch all weather data in parallel
        // Use Promise.allSettled to handle partial failures gracefully
        const [
          forecastResult,
          hourlyForecastResult,
          currentConditionsResult,
          alertsResult,
        ] = await Promise.allSettled([
          nwsService.getForecast(gridId, gridX, gridY),
          nwsService.getHourlyForecast(gridId, gridX, gridY),
          nwsService.getCurrentConditions(gridId, gridX, gridY),
          nwsService.getActiveAlerts(lat, lon),
        ]);

        // Check if critical data (forecast) failed
        if (forecastResult.status === 'rejected') {
          fastify.log.error(
            { error: forecastResult.reason, zipcode },
            'Failed to fetch forecast data'
          );
          return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to fetch forecast data. Please try again later.',
            statusCode: 500,
          });
        }

        if (hourlyForecastResult.status === 'rejected') {
          fastify.log.error(
            { error: hourlyForecastResult.reason, zipcode },
            'Failed to fetch hourly forecast data'
          );
          return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to fetch hourly forecast data. Please try again later.',
            statusCode: 500,
          });
        }

        // Log warnings for non-critical failures
        if (currentConditionsResult.status === 'rejected') {
          fastify.log.warn(
            { error: currentConditionsResult.reason, zipcode },
            'Failed to fetch current conditions'
          );
        }

        if (alertsResult.status === 'rejected') {
          fastify.log.warn(
            { error: alertsResult.reason, zipcode },
            'Failed to fetch alerts'
          );
        }

        // Step 5: Build complete weather package
        const now = new Date();
        const cacheExpiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

        const weatherPackage: WeatherPackage = {
          location: {
            zipCode: zipcode,
            coordinates: { lat, lon },
            displayName: `ZIP ${zipcode}`,
            gridInfo: {
              gridId,
              gridX,
              gridY,
              forecastOffice,
            },
            timeZone,
          },
          forecast: forecastResult.value,
          hourlyForecast: hourlyForecastResult.value,
          currentConditions:
            currentConditionsResult.status === 'fulfilled'
              ? currentConditionsResult.value
              : null,
          alerts:
            alertsResult.status === 'fulfilled'
              ? alertsResult.value
              : {
                  '@context': undefined,
                  type: 'FeatureCollection',
                  features: [],
                  title: 'Active Alerts',
                  updated: now.toISOString(),
                },
          metadata: {
            fetchedAt: now.toISOString(),
            cacheExpiry: cacheExpiry.toISOString(),
          },
        };

        fastify.log.info(
          {
            zipcode,
            forecastPeriods: weatherPackage.forecast.properties.periods.length,
            hourlyPeriods: weatherPackage.hourlyForecast.properties.periods.length,
            hasCurrentConditions: weatherPackage.currentConditions !== null,
            alertCount: weatherPackage.alerts.features.length,
          },
          'Successfully fetched complete weather package'
        );

        return reply.code(200).send(weatherPackage);
      } catch (error) {
        // Catch-all error handler
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        fastify.log.error(
          { error, zipcode, errorMessage },
          'Unexpected error fetching weather data'
        );

        return reply.code(500).send({
          error: 'Internal Server Error',
          message:
            'An unexpected error occurred while fetching weather data. Please try again later.',
          statusCode: 500,
        });
      }
    }
  );

  /**
   * GET /api/weather/cache/stats
   * Get cache statistics for monitoring
   */
  fastify.get('/weather/cache/stats', async (_request, reply) => {
    const stats = nwsService.getCacheStats();
    return reply.code(200).send({
      cache: stats,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /api/weather/cache/clear
   * Clear all weather cache (admin endpoint)
   */
  fastify.post('/weather/cache/clear', async (_request, reply) => {
    nwsService.clearCache();
    fastify.log.info('Weather cache cleared');
    return reply.code(200).send({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /api/weather/cache/clear/:zipcode
   * Clear cache for a specific location
   */
  fastify.post<{ Params: ZipCodeParams }>(
    '/weather/cache/clear/:zipcode',
    async (request, reply) => {
      const { zipcode } = request.params;

      try {
        const coordinates = await geocodeZip(zipcode);
        nwsService.clearLocationCache(coordinates.lat, coordinates.lon);
        fastify.log.info({ zipcode }, 'Location cache cleared');

        return reply.code(200).send({
          message: `Cache cleared for ZIP code ${zipcode}`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Invalid ZIP code',
          statusCode: 400,
        });
      }
    }
  );
};

export default weatherRoutes;