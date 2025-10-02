import { FastifyInstance } from 'fastify';
import { productService } from '../services/products.service';

/**
 * Product routes
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // Authentication middleware
  const authenticate = async (request: any, reply: any) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({ message: 'No token provided' });
    }
    // For now, just check if token exists - in real implementation would validate JWT
  };

  // Get all products with filtering
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const query = request.query as any;
      const products = await productService.findAll(query);
      return reply.status(200).send(products);
    } catch (error: any) {
      return reply.status(500).send({
        message: error.message || 'Internal server error',
      });
    }
  });

  // Get product by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const product = await productService.findById(id);

      if (!product) {
        return reply.status(404).send({ message: 'Product not found' });
      }

      return reply.status(200).send(product);
    } catch (error: any) {
      return reply.status(500).send({
        message: error.message || 'Internal server error',
      });
    }
  });

  // Create product
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const productData = request.body as any;
      const product = await productService.create(productData);
      return reply.status(201).send(product);
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Failed to create product',
      });
    }
  });

  // Update product
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;
      const product = await productService.update(id, updateData);
      return reply.status(200).send(product);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(400).send({
        message: error.message || 'Failed to update product',
      });
    }
  });

  // Update product stock
  fastify.patch('/:id/stock', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { stock } = request.body as any;
      const product = await productService.updateStock(id, stock);
      return reply.status(200).send(product);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(400).send({
        message: error.message || 'Failed to update stock',
      });
    }
  });

  // Delete product
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      await productService.delete(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(500).send({
        message: error.message || 'Failed to delete product',
      });
    }
  });

  fastify.log.info('Product routes registered');
}