import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { schema } from './schemas.js';
import { FastifyRequest } from 'fastify';

function createContext(req: FastifyRequest, fastify) {
  const prisma = fastify.prisma;
  return {
    prisma,
    fastify,
  };
}

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
      const context = createContext(req, fastify);
      console.log('QUUUUUUEEERRRURYUYU', req);
      const { query, variables } = req.body;
      return await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: context,
      });
    },
  });
};

export default plugin;
