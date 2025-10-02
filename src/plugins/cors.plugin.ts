import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: true, // Allow all origins in development
    credentials: true,
  });
};

export default corsPlugin;