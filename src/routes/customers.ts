import { FastifyInstance } from 'fastify';

/**
 * Customer routes
 */
export async function customerRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all customers with filtering
  fastify.get('/', async (request, reply) => {
    try {
      const mockCustomers = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 99999-9999',
          cpf: '123.456.789-00',
          address: 'Rua das Flores, 123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@example.com',
          phone: '(11) 88888-8888',
          cpf: '987.654.321-00',
          address: 'Av. Principal, 456',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return reply.status(200).send({
        success: true,
        data: mockCustomers,
        message: 'Clientes listados com sucesso',
      });
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  });

  // Get customer by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      
      const mockCustomer = {
        id,
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        address: 'Rua das Flores, 123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockCustomer,
        message: 'Cliente encontrado com sucesso',
      });
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  });

  // Create customer
  fastify.post('/', async (request, reply) => {
    try {
      const { name, email, phone, cpf, address } = request.body as any;
      
      const mockCustomer = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        cpf,
        address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(201).send({
        success: true,
        data: mockCustomer,
        message: 'Cliente criado com sucesso',
      });
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  });

  // Update customer
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { name, email, phone, address } = request.body as any;
      
      const mockCustomer = {
        id,
        name,
        email,
        phone,
        cpf: '123.456.789-00', // Keep existing CPF
        address,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockCustomer,
        message: 'Cliente atualizado com sucesso',
      });
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  });

  // Delete customer
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      return reply.status(200).send({
        success: true,
        message: `Cliente ${id} deletado com sucesso`,
      });
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  });

  fastify.log.info('Customer routes registered');
}