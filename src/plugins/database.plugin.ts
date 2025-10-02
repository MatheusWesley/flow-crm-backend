import { FastifyPluginAsync } from 'fastify';

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  // Database plugin placeholder
  // This will be implemented when database connection is set up
  fastify.log.info('Database plugin registered');
};

export default databasePlugin;