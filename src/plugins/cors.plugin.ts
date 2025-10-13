import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../config/environment';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: env.FRONTEND_URL || true, // Use FRONTEND_URL if set, otherwise allow all origins
    credentials: true,
  });
};

export default corsPlugin;