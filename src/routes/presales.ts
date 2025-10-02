import { FastifyInstance } from 'fastify';

/**
 * PreSales routes
 */
export async function preSalesRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all pre-sales with filtering
  fastify.get('/', async (request, reply) => {
    try {
      const mockPresales = [
        {
          id: '1',
          customerId: '1',
          status: 'draft',
          total: '150.75',
          discount: '10.00',
          notes: 'Pré-venda de exemplo 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          customerId: '2',
          status: 'approved',
          total: '275.50',
          discount: '25.00',
          notes: 'Pré-venda de exemplo 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return reply.status(200).send({
        success: true,
        data: mockPresales,
        message: 'Pré-vendas listadas com sucesso',
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

  // Get presale by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      const mockPresale = {
        id,
        customerId: '1',
        status: 'draft',
        total: '150.75',
        discount: '10.00',
        notes: 'Pré-venda de exemplo',
        items: [
          {
            id: '1',
            productId: '1',
            quantity: 2,
            unitPrice: '15.75',
            totalPrice: '31.50',
          },
          {
            id: '2',
            productId: '2',
            quantity: 1,
            unitPrice: '35.00',
            totalPrice: '35.00',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockPresale,
        message: 'Pré-venda encontrada com sucesso',
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

  // Create presale
  fastify.post('/', async (request, reply) => {
    try {
      const { customerId, discount, notes, items } = request.body as any;

      // Calculate total from items
      const total = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.unitPrice) * item.quantity);
      }, 0) - parseFloat(discount || '0');

      const mockPresale = {
        id: Date.now().toString(),
        customerId,
        status: 'draft',
        total: total.toFixed(2),
        discount: discount || '0.00',
        notes,
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(201).send({
        success: true,
        data: mockPresale,
        message: 'Pré-venda criada com sucesso',
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

  // Update presale
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { discount, notes, items } = request.body as any;

      // Calculate total from items
      const total = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.unitPrice) * item.quantity);
      }, 0) - parseFloat(discount || '0');

      const mockPresale = {
        id,
        customerId: '1',
        status: 'draft',
        total: total.toFixed(2),
        discount: discount || '0.00',
        notes,
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
        })),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockPresale,
        message: 'Pré-venda atualizada com sucesso',
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

  // Update presale status
  fastify.put('/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { status } = request.body as any;

      return reply.status(200).send({
        success: true,
        message: `Status da pré-venda ${id} atualizado para ${status}`,
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

  // Delete presale
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      return reply.status(200).send({
        success: true,
        message: `Pré-venda ${id} deletada com sucesso`,
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

  fastify.log.info('Presales routes registered');
}