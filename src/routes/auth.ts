import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service';

/**
 * Authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Login route
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as any;

      const authResponse = await authService.login({ email, password });

      return reply.status(200).send({
        user: authResponse.user,
        token: authResponse.token,
      });
    } catch (error: any) {
      return reply.status(401).send({
        message: error.message || 'Invalid credentials',
      });
    }
  });

  // Register route
  fastify.post('/register', async (request, reply) => {
    try {
      const { name, email, password, role } = request.body as any;

      const user = await authService.register({ name, email, password, role });

      return reply.status(201).send({
        user,
      });
    } catch (error: any) {
      return reply.status(400).send({
        message: error.message || 'Registration failed',
      });
    }
  });

  // Get profile route
  fastify.get('/profile', {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return reply.status(401).send({ message: 'No token provided' });
        }

        const user = await authService.validateToken(token);
        (request as any).user = user;
      } catch (error) {
        return reply.status(401).send({ message: 'Invalid token' });
      }
    }
  }, async (request, reply) => {
    return reply.status(200).send((request as any).user);
  });

  // Logout route
  fastify.post('/logout', async (request, reply) => {
    return reply.status(200).send({
      message: 'Logout successful',
    });
  });

  fastify.log.info('Auth routes registered');
}