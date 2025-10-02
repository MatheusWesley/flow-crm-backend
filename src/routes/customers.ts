import { FastifyInstance } from 'fastify';
import { customerService } from '../services/customers.service';

/**
 * Customer routes
 */
export async function customerRoutes(fastify: FastifyInstance): Promise<void> {
  // Authentication middleware
  const authenticate = async (request: any, reply: any) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({ message: 'No token provided' });
    }
    // For now, just check if token exists - in real implementation would validate JWT
  };

  // Get all customers with filtering
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const query = request.query as any;
      const customers = await customerService.findAll(query);
      return reply.status(200).send(customers);
    } catch (error: any) {
      return reply.status(500).send({
        message: error.message || 'Internal server error',
      });
    }
  });

  // Get customer by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const customer = await customerService.findById(id);

      if (!customer) {
        return reply.status(404).send({ message: 'Customer not found' });
      }

      return reply.status(200).send(customer);
    } catch (error: any) {
      return reply.status(500).send({
        message: error.message || 'Internal server error',
      });
    }
  });

  // Create customer
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const customerData = request.body as any;
      const customer = await customerService.create(customerData);
      return reply.status(201).send(customer);
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Failed to create customer',
      });
    }
  });

  // Update customer
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const updateData = request.body as any;
      const customer = await customerService.update(id, updateData);
      return reply.status(200).send(customer);
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(400).send({
        message: error.message || 'Failed to update customer',
      });
    }
  });

  // Delete customer
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      await customerService.delete(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message === 'Customer not found') {
        return reply.status(404).send({ message: error.message });
      }
      return reply.status(500).send({
        message: error.message || 'Failed to delete customer',
      });
    }
  });

  fastify.log.info('Customer routes registered');
}