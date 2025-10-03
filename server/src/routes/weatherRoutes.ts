/**
 * Weather API Routes
 * Main routes for fetching weather data by ZIP code
 */

import { FastifyPluginAsync } from 'fastify';
import { nwsService } from '../services/nwsService.js';
import { geocodeZip } from '../services/geocodingService.js';
import { getSunTimes } from '../services/sunService.js';
import { getBackgroundJobsStatus } from '../services/backgroundJobs.js';
import { addZipCode } from '../services/zipCodeStorage.js';
import type { WeatherPackage } from '../types/weather.types.js';

// Route parameter schema
interface ZipCodeParams {
  zipcode: string;
}

/**
 * Transform backend WeatherPackage to frontend WeatherData format
 * Converts nested API response structures to flattened arrays expected by frontend
 */
function transformWeatherPackage(pkg: WeatherPackage) {
  return {
    zipCode: pkg.location.zipCode,
    coordinates: {
      latitude: pkg.location.coordinates.lat,
      longitude: pkg.location.coordinates.lon,
    },
    gridPoint: {
      gridId: pkg.location.gridInfo.gridId,
      gridX: pkg.location.gridInfo.gridX,
      gridY: pkg.location.gridInfo.gridY,
      forecast: pkg.forecast.properties.periods[0]?.shortForecast || '',
      forecastHourly: pkg.hourlyForecast.properties.periods[0]?.shortForecast || '',
      observationStations: pkg.currentConditions?.properties.station || '',
    },
    // Extract forecast periods array directly
    forecast: pkg.forecast.properties.periods.map(period => ({
      number: period.number,
      name: period.name,
      startTime: period.startTime,
      endTime: period.endTime,
      isDaytime: period.isDaytime,
      temperature: period.temperature,
      temperatureUnit: period.temperatureUnit,
      temperatureTrend: period.temperatureTrend,
      probabilityOfPrecipitation: {
        value: period.probabilityOfPrecipitation?.value ?? null,
      },
      windSpeed: period.windSpeed,
      windDirection: period.windDirection,
      icon: period.icon,
      shortForecast: period.shortForecast,
      detailedForecast: period.detailedForecast,
    })),
    // Extract hourly forecast periods array directly
    hourlyForecast: pkg.hourlyForecast.properties.periods.map(period => ({
      number: period.number,
      startTime: period.startTime,
      endTime: period.endTime,
      isDaytime: period.isDaytime,
      temperature: period.temperature,
      temperatureUnit: period.temperatureUnit,
      probabilityOfPrecipitation: {
        value: period.probabilityOfPrecipitation?.value ?? null,
      },
      dewpoint: {
        value: period.dewpoint?.value ?? 0,
        unitCode: period.dewpoint?.unitCode || 'wmoUnit:degC',
      },
      relativeHumidity: {
        value: period.relativeHumidity?.value ?? 0,
      },
      windSpeed: period.windSpeed,
      windDirection: period.windDirection,
      icon: period.icon,
      shortForecast: period.shortForecast,
    })),
    // Transform current conditions to current observation
    currentObservation: pkg.currentConditions ? {
      timestamp: pkg.currentConditions.properties.timestamp,
      temperature: {
        value: pkg.currentConditions.properties.temperature?.value ?? null,
        unitCode: pkg.currentConditions.properties.temperature?.unitCode || 'wmoUnit:degC',
      },
      dewpoint: {
        value: pkg.currentConditions.properties.dewpoint?.value ?? null,
        unitCode: pkg.currentConditions.properties.dewpoint?.unitCode || 'wmoUnit:degC',
      },
      windDirection: {
        value: pkg.currentConditions.properties.windDirection?.value ?? null,
      },
      windSpeed: {
        value: pkg.currentConditions.properties.windSpeed?.value ?? null,
        unitCode: pkg.currentConditions.properties.windSpeed?.unitCode || 'wmoUnit:km_h-1',
      },
      windGust: {
        value: pkg.currentConditions.properties.windGust?.value ?? null,
        unitCode: pkg.currentConditions.properties.windGust?.unitCode || 'wmoUnit:km_h-1',
      },
      barometricPressure: {
        value: pkg.currentConditions.properties.barometricPressure?.value ?? null,
        unitCode: pkg.currentConditions.properties.barometricPressure?.unitCode || 'wmoUnit:Pa',
      },
      visibility: {
        value: pkg.currentConditions.properties.visibility?.value ?? null,
        unitCode: pkg.currentConditions.properties.visibility?.unitCode || 'wmoUnit:m',
      },
      relativeHumidity: {
        value: pkg.currentConditions.properties.relativeHumidity?.value ?? null,
      },
      heatIndex: {
        value: pkg.currentConditions.properties.heatIndex?.value ?? null,
        unitCode: pkg.currentConditions.properties.heatIndex?.unitCode || 'wmoUnit:degC',
      },
      windChill: {
        value: pkg.currentConditions.properties.windChill?.value ?? null,
        unitCode: pkg.currentConditions.properties.windChill?.unitCode || 'wmoUnit:degC',
      },
      cloudLayers: pkg.currentConditions.properties.cloudLayers?.map(layer => ({
        base: {
          value: layer.base?.value ?? null,
          unitCode: layer.base?.unitCode || 'wmoUnit:m',
        },
        amount: layer.amount,
      })),
    } : undefined,
    // Extract alerts array directly from features
    alerts: pkg.alerts.features.map(feature => ({
      id: feature.properties.id,
      areaDesc: feature.properties.areaDesc,
      event: feature.properties.event,
      headline: feature.properties.headline || '',
      description: feature.properties.description,
      severity: feature.properties.severity as 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown',
      urgency: feature.properties.urgency as 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown',
      onset: feature.properties.onset,
      expires: feature.properties.expires,
      status: feature.properties.status,
      messageType: feature.properties.messageType,
      category: feature.properties.category,
    })),
    sunTimes: pkg.sunTimes,
    lastUpdated: pkg.metadata.fetchedAt,
  };
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
            additionalProperties: true,
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

        // Track this ZIP code for background refresh
        await addZipCode(zipcode);

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

        // Step 5: Calculate sunrise/sunset times
        const sunTimes = getSunTimes(lat, lon, new Date(), timeZone);

        // Step 6: Build complete weather package
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
          sunTimes,
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

        // Transform to frontend-expected format
        const transformedData = transformWeatherPackage(weatherPackage);
        return reply.code(200).send(transformedData);
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

  /**
   * POST /api/weather/:zipcode/refresh
   * Clear cache and fetch fresh weather data for a specific ZIP code
   *
   * This endpoint:
   * 1. Validates the ZIP code format
   * 2. Clears all cached data for the location
   * 3. Fetches fresh data from NWS API
   * 4. Returns the updated weather package
   *
   * Used by the manual refresh button in the UI to force a data update.
   */
  fastify.post<{ Params: ZipCodeParams }>(
    '/weather/:zipcode/refresh',
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
            description: 'Fresh weather data package',
            additionalProperties: true,
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

        fastify.log.info({ zipcode }, 'Refreshing weather data for ZIP code');

        // Step 2: Geocode ZIP code to get coordinates
        let coordinates;
        try {
          coordinates = await geocodeZip(zipcode);
          fastify.log.debug(
            { zipcode, coordinates },
            'Successfully geocoded ZIP code for refresh'
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

          throw error;
        }

        const { lat, lon } = coordinates;

        // Track this ZIP code for background refresh
        await addZipCode(zipcode);

        // Step 3: Clear cache for this location
        nwsService.clearLocationCache(lat, lon);
        fastify.log.debug(
          { zipcode, lat, lon },
          'Cache cleared for location'
        );

        // Step 4: Get fresh point data
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
            'Retrieved fresh NWS grid coordinates'
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

        // Step 5: Fetch all weather data in parallel
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

        // Check if critical data failed
        if (forecastResult.status === 'rejected') {
          fastify.log.error(
            { error: forecastResult.reason, zipcode },
            'Failed to fetch forecast data during refresh'
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
            'Failed to fetch hourly forecast data during refresh'
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
            'Failed to fetch current conditions during refresh'
          );
        }

        if (alertsResult.status === 'rejected') {
          fastify.log.warn(
            { error: alertsResult.reason, zipcode },
            'Failed to fetch alerts during refresh'
          );
        }

        // Step 6: Calculate sunrise/sunset times
        const sunTimes = getSunTimes(lat, lon, new Date(), timeZone);

        // Step 7: Build fresh weather package
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
          sunTimes,
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
          'Successfully refreshed weather package'
        );

        // Transform to frontend-expected format
        const transformedData = transformWeatherPackage(weatherPackage);
        return reply.code(200).send(transformedData);
      } catch (error) {
        // Catch-all error handler
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        fastify.log.error(
          { error, zipcode, errorMessage },
          'Unexpected error refreshing weather data'
        );

        return reply.code(500).send({
          error: 'Internal Server Error',
          message:
            'An unexpected error occurred while refreshing weather data. Please try again later.',
          statusCode: 500,
        });
      }
    }
  );

  /**
   * GET /api/weather/background-jobs/status
   * Get status of background refresh jobs
   */
  fastify.get('/weather/background-jobs/status', async (_request, reply) => {
    const status = getBackgroundJobsStatus();
    const cacheStats = nwsService.getCacheStats();

    return reply.code(200).send({
      backgroundJobs: status,
      cache: cacheStats,
      timestamp: new Date().toISOString(),
    });
  });
};

export default weatherRoutes;