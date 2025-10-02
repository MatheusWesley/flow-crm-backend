import { FastifyInstance } from 'fastify';

/**
 * Product routes
 */
export async function productRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all products with filtering
  fastify.get('/', async (request, reply) => {
    try {
      const mockProducts = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Produto Exemplo 1',
          unit: 'UN',
          description: 'Descrição do produto 1',
          stock: 100,
          purchasePrice: '10.50',
          salePrice: '15.75',
          saleType: 'unit',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          code: 'PROD002',
          name: 'Produto Exemplo 2',
          unit: 'KG',
          description: 'Descrição do produto 2',
          stock: 50,
          purchasePrice: '25.00',
          salePrice: '35.00',
          saleType: 'weight',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return reply.status(200).send({
        success: true,
        data: mockProducts,
        message: 'Produtos listados com sucesso',
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

  // Get product by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      
      const mockProduct = {
        id,
        code: 'PROD001',
        name: 'Produto Exemplo',
        unit: 'UN',
        description: 'Descrição do produto',
        stock: 100,
        purchasePrice: '10.50',
        salePrice: '15.75',
        saleType: 'unit',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockProduct,
        message: 'Produto encontrado com sucesso',
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

  // Create product
  fastify.post('/', async (request, reply) => {
    try {
      const { code, name, unit, description, stock, purchasePrice, salePrice, saleType } = request.body as any;
      
      const mockProduct = {
        id: Date.now().toString(),
        code,
        name,
        unit,
        description,
        stock,
        purchasePrice,
        salePrice,
        saleType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(201).send({
        success: true,
        data: mockProduct,
        message: 'Produto criado com sucesso',
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

  // Update product
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { name, stock, salePrice } = request.body as any;
      
      const mockProduct = {
        id,
        code: 'PROD001',
        name,
        unit: 'UN',
        description: 'Descrição do produto',
        stock,
        purchasePrice: '10.50',
        salePrice,
        saleType: 'unit',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockProduct,
        message: 'Produto atualizado com sucesso',
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

  // Delete product
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;

      return reply.status(200).send({
        success: true,
        message: `Produto ${id} deletado com sucesso`,
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

  fastify.log.info('Product routes registered');
}