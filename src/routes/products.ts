import { FastifyInstance } from 'fastify';
import { productController } from '../controllers/products.controller';

/**
 * Product routes using controller pattern for consistent API responses
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // Authentication middleware
  const authenticate = async (request: any, reply: any) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided'
        },
        timestamp: new Date().toISOString()
      });
    }
    // For now, just check if token exists - in real implementation would validate JWT
  };

  // Get all products with filtering
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    return productController.getProducts(request, reply);
  });

  // Get product by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    return productController.getProductById(request, reply);
  });

  // Create product - now with standardized response format including generated code
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    return productController.createProduct(request, reply);
  });

  // Update product
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    return productController.updateProduct(request, reply);
  });

  // Delete product
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    return productController.deleteProduct(request, reply);
  });

  fastify.log.info('Product routes registered with standardized response format');
}