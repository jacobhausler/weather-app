/**
 * Health Check Routes
 * Provides endpoints for monitoring server health and status
 */

import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/health
   * Basic health check endpoint
   * Returns 200 OK if server is running
   */
  fastify.get('/health', async (_request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'weather-app-server',
      version: '1.0.0',
    });
  });

  /**
   * GET /api/health/detailed
   * Detailed health check with cache statistics
   */
  fastify.get('/health/detailed', async (_request, reply) => {
    const memoryUsage = process.memoryUsage();

    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'weather-app-server',
      version: '1.0.0',
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
        },
      },
    });
  });
};

export default healthRoutes;