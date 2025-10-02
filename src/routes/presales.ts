import { FastifyInstance } from 'fastify';
import { preSalesService } from '../services/presales.service';

/**
 * PreSales routes
 */
export async function preSalesRoutes(fastify: FastifyInstance): Promise<void> {
  // Authentication middleware
  const authenticate = async (request: any, reply: any) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({ message: 'No token provided' });
    }
    // For now, just check if token exists - in real implementation would validate JWT
  };

  // Get all pre-sales with filtering
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const query = request.query as any;
      const preSales = await preSalesService.findAll(query);
      return reply.status(200).send(preSales);
    } catch (error: any) {
      return reply.status(500).send({
        message: error.message || 'Internal server error',
      });
    }
  });

  // Get presale by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const preSale = await preSalesService.findById(id);

      if (!preSale) {
        return reply.status(404).send({ message: 'Pre-sale not found' });
      }

      return reply.status(200).send(preSale);
    } catch (error: any) {
      return reply.status(500).send({
        message: error.message || 'Internal server error',
      });
    }
  });

  // Create presale
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const preSaleData = request.body as any;
      const preSale = await preSalesService.create(preSaleData);
      return reply.status(201).send(preSale);
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Failed to create pre-sale',
      });
    }
  });

  // Update presale
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;
      const preSale = await preSalesService.update(id, updateData);
      return reply.status(200).send(preSale);
    } catch (error: any) {
      if (error.message === 'Pre-sale not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(400).send({
        message: error.message || 'Failed to update pre-sale',
      });
    }
  });

  // Update presale status
  fastify.patch('/:id/status', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { status } = request.body as any;
      const preSale = await preSalesService.updateStatus(id, status);
      return reply.status(200).send(preSale);
    } catch (error: any) {
      if (error.message === 'Pre-sale not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(400).send({
        message: error.message || 'Failed to update status',
      });
    }
  });

  // Delete presale
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      await preSalesService.delete(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message === 'Pre-sale not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(500).send({
        message: error.message || 'Failed to delete pre-sale',
      });
    }
  });

  fastify.log.info('Presales routes registered');
}