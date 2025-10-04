import { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth';
import { customerRoutes } from './customers';
import { productRoutes } from './products';
import { preSalesRoutes } from './presales';

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

  fastify.log.info('All routes registered successfully');
};