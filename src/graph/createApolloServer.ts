import {PrismaClient} from '@prisma/client';
import {ApolloServer} from 'apollo-server-express';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import container from '../services/container';

const createApolloServer = (prisma: PrismaClient) => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    context: ({req}) => ({
      user: req.headers.user,
      prisma,
      container,
    }),
  });
};

export default createApolloServer;