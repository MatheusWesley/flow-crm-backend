import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/environment';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  const allowedOrigins = [
    'http://localhost:5173', // Development
    'https://flow-crm-pearl.vercel.app', // Production
    env.FRONTEND_URL // Environment variable
  ].filter(Boolean); // Remove undefined values

  await fastify.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow all origins
      if (env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      // Reject origin
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });
};

export default corsPlugin;