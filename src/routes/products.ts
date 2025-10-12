import { FastifyInstance } from 'fastify';
import { productController } from '../controllers/products.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

/**
 * Product routes using controller pattern for consistent API responses
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {

  // Get all products with filtering
  fastify.get('/', { preHandler: authenticateUser }, async (request, reply) => {
    return productController.getProducts(request, reply);
  });

  // Get product by ID
  fastify.get('/:id', { preHandler: authenticateUser }, async (request, reply) => {
    return productController.getProductById(request, reply);
  });

  // Create product - now with standardized response format including generated code
  fastify.post('/', { preHandler: authenticateUser }, async (request, reply) => {
    return productController.createProduct(request, reply);
  });

  // Update product
  fastify.put('/:id', { preHandler: authenticateUser }, async (request, reply) => {
    return productController.updateProduct(request, reply);
  });

  // Delete product
  fastify.delete('/:id', { preHandler: authenticateUser }, async (request, reply) => {
    return productController.deleteProduct(request, reply);
  });

  fastify.log.info('Product routes registered with standardized response format');
}