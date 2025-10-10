import { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth';
import { customerRoutes } from './customers';
import { productRoutes } from './products';
import { preSalesRoutes } from './presales';
import { priceRoutes } from './price';
import { monitoringRoutes } from './monitoring';

export const registerRoutes: FastifyPluginAsync = async (fastify) => {
  // Register API routes here
  fastify.get('/api/test', async () => {
    return { message: 'API is working!' };
  });

  // Register auth routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });

  // Register customer routes
  await fastify.register(customerRoutes, { prefix: '/api/customers' });

  // Register product routes
  await fastify.register(productRoutes, { prefix: '/api/products' });

  // Register presales routes
  await fastify.register(preSalesRoutes, { prefix: '/api/presales' });

  // Register price calculation routes
  await fastify.register(priceRoutes, { prefix: '/api/price' });

  // Register monitoring routes
  await fastify.register(monitoringRoutes, { prefix: '/api/monitoring' });

  fastify.log.info('All routes registered successfully');
};