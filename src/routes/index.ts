import { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth';
import { customerRoutes } from './customers';
import { productRoutes } from './products';
import { preSalesRoutes } from './presales';
import { priceRoutes } from './price';
import { monitoringRoutes } from './monitoring';
import { paymentMethodsRoutes } from './payment-methods';
import { auditLogsRoutes } from './audit-logs';
import { userRoutes } from './users';

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

  // Register payment methods routes
  await fastify.register(paymentMethodsRoutes, { prefix: '/api/payment-methods' });

  // Register audit logs routes
  await fastify.register(auditLogsRoutes, { prefix: '/api/audit-logs' });

  // Register user management routes
  await fastify.register(userRoutes, { prefix: '/api/users' });

  fastify.log.info('All routes registered successfully');
};
