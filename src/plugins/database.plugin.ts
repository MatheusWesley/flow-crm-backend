import { FastifyPluginAsync } from 'fastify';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/environment';
import * as schema from '../db/schema';
import {
  DatabaseConnectionManager,
  createDatabaseConnectionManager,
  shutdownDatabaseConnectionManager,
  ConnectionHealth
} from '../utils/database-connection-manager';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
  connectionCount?: number;
  responseTime?: number;
  poolStats?: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
}

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle>;
    dbPool: Pool;
    dbConnectionManager: DatabaseConnectionManager;
    checkDatabaseHealth(): Promise<HealthStatus>;
    executeWithRetry<T>(operation: (db: ReturnType<typeof drizzle>) => Promise<T>, operationName?: string): Promise<T>;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  try {
    // Create database connection manager with enhanced configuration
    const connectionManager = createDatabaseConnectionManager(
      {
        connectionString: env.DATABASE_URL,
        max: 20, // Maximum number of connections in the pool
        min: 2, // Minimum number of connections to maintain
        idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
        connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection could not be established
        // acquireTimeoutMillis: 10000, // Not available in pg PoolConfig type
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      },
      {
        maxRetries: 5,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
      }
    );

    // Test initial connection
    const isConnected = await connectionManager.testConnection();
    if (!isConnected) {
      throw new Error('Failed to establish initial database connection');
    }

    fastify.log.info('Database connection manager initialized successfully');

    // Get database instances
    const db = connectionManager.getDatabase();
    const pool = connectionManager.getPool();

    // Database health check function using connection manager
    const checkDatabaseHealth = async (): Promise<HealthStatus> => {
      const startTime = Date.now();

      try {
        const health = await connectionManager.checkHealth();
        const responseTime = Date.now() - startTime;
        const poolStats = connectionManager.getPoolStats();

        return {
          status: health.isHealthy ? 'healthy' : 'unhealthy',
          message: health.isHealthy
            ? 'Database connection is healthy'
            : `Database connection failed: ${health.lastError || 'Unknown error'}`,
          timestamp: new Date(),
          connectionCount: health.connectionCount,
          responseTime,
          poolStats
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;

        return {
          status: 'unhealthy',
          message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          responseTime
        };
      }
    };

    // Wrapper function for executing operations with retry logic
    const executeWithRetry = async <T>(
      operation: (db: ReturnType<typeof drizzle>) => Promise<T>,
      operationName?: string
    ): Promise<T> => {
      return connectionManager.executeWithRetry(operation, operationName);
    };

    // Register database instances with Fastify
    fastify.decorate('db', db);
    fastify.decorate('dbPool', pool);
    fastify.decorate('dbConnectionManager', connectionManager);
    fastify.decorate('checkDatabaseHealth', checkDatabaseHealth);
    fastify.decorate('executeWithRetry', executeWithRetry);

    // Register health check endpoint
    fastify.get('/health/database', async (_request, reply) => {
      const healthStatus = await checkDatabaseHealth();

      if (healthStatus.status === 'healthy') {
        return reply.code(200).send(healthStatus);
      } else {
        return reply.code(503).send(healthStatus);
      }
    });

    // Handle graceful shutdown
    fastify.addHook('onClose', async () => {
      fastify.log.info('Shutting down database connection manager...');
      try {
        await shutdownDatabaseConnectionManager();
        fastify.log.info('Database connection manager shut down gracefully');
      } catch (error) {
        fastify.log.error({ error }, 'Error during database connection manager shutdown');
      }
    });

    fastify.log.info('Database plugin registered successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to initialize database plugin');
    throw error;
  }
};

export default databasePlugin;