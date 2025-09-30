/**
 * HAUS Weather Station - Backend Server
 * Main entry point for the Fastify server
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import type { ScheduledTask } from 'node-cron';
import weatherRoutes from './routes/weatherRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { initBackgroundJobs, stopBackgroundJobs } from './services/backgroundJobs.js';

// Load environment variables
config();

// Server configuration
const PORT = parseInt(process.env['PORT'] || '3001', 10);
const HOST = process.env['HOST'] || '0.0.0.0';
const NODE_ENV = process.env['NODE_ENV'] || 'development';

// Create Fastify instance with logging
const fastify = Fastify({
  logger:
    NODE_ENV === 'development'
      ? {
          level: 'debug',
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true,
            },
          },
        }
      : {
          level: 'info',
        },
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
});

// Background jobs task reference
let backgroundJobsTask: ScheduledTask | null = null;

/**
 * Register plugins and routes
 */
async function registerPlugins() {
  // CORS configuration
  await fastify.register(cors, {
    origin: process.env['CORS_ORIGIN']
      ? process.env['CORS_ORIGIN'].split(',')
      : NODE_ENV === 'development'
      ? true // Allow all origins in development
      : ['http://localhost:5173', 'http://localhost:3000'], // Default production origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register routes under /api prefix
  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(weatherRoutes, { prefix: '/api' });

  fastify.log.info('All plugins and routes registered successfully');
}

/**
 * Graceful shutdown handler
 */
async function closeGracefully(signal: string) {
  fastify.log.info(`Received signal to terminate: ${signal}`);

  try {
    // Stop background jobs first
    if (backgroundJobsTask) {
      stopBackgroundJobs(backgroundJobsTask);
      backgroundJobsTask = null;
    }

    // Then close the server
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ error }, 'Error during server shutdown');
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function start() {
  try {
    // Register all plugins and routes
    await registerPlugins();

    // Start listening
    await fastify.listen({ port: PORT, host: HOST });

    fastify.log.info(
      `Server running in ${NODE_ENV} mode on http://${HOST}:${PORT}`
    );
    fastify.log.info(`Health check available at http://${HOST}:${PORT}/api/health`);
    fastify.log.info(
      `Weather API available at http://${HOST}:${PORT}/api/weather/:zipcode`
    );

    // Initialize background jobs
    backgroundJobsTask = initBackgroundJobs();
    fastify.log.info('Background refresh jobs started (5-minute cycle)');

    // Register graceful shutdown handlers
    process.on('SIGTERM', () => closeGracefully('SIGTERM'));
    process.on('SIGINT', () => closeGracefully('SIGINT'));
  } catch (error) {
    fastify.log.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Error handlers for uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error(
    { reason, promise },
    'Unhandled Rejection at Promise'
  );
});

process.on('uncaughtException', (error) => {
  fastify.log.error({ error }, 'Uncaught Exception thrown');
  process.exit(1);
});

// Start the server
start();