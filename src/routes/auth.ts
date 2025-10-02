import { FastifyInstance } from 'fastify';

/**
 * Authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Login route
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as any;
      
      // Mock authentication for now
      if (email === 'admin@flowcrm.com' && password === 'admin123') {
        const mockUser = {
          id: '1',
          email: 'admin@flowcrm.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        return reply.status(200).send({
          success: true,
          data: {
            user: mockUser,
            token: mockToken,
          },
          message: 'Login realizado com sucesso',
        });
      }

      return reply.status(401).send({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
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

  // Register route
  fastify.post('/register', async (request, reply) => {
    try {
      const { name, email, password, role } = request.body as any;
      
      // Mock user creation
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
        role: role || 'employee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(201).send({
        success: true,
        data: mockUser,
        message: 'Usuário criado com sucesso',
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

  // Get profile route
  fastify.get('/me', async (request, reply) => {
    try {
      // Mock user profile
      const mockUser = {
        id: '1',
        email: 'admin@flowcrm.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return reply.status(200).send({
        success: true,
        data: mockUser,
        message: 'Perfil obtido com sucesso',
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

  // Logout route
  fastify.post('/logout', async (request, reply) => {
    return reply.status(200).send({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  });

  fastify.log.info('Auth routes registered');
}