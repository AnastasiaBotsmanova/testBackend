import {PrismaClient} from '@prisma/client';
import {ApolloServer, gql} from 'apollo-server-express';

const typeDefs = gql`
  scalar Void

  type User {
    id: Int!
    name: String
    email: String!
  }

  type Library {
    branch: String!
    books: [Book]!
  }

  type Book {
    title: String!
    author: Author!
  }

  type Author {
    name: String!
  }

  type Query {
    user(id: Int!): User
    users: [User!]!
  libraries: [Library]
  }

  type Mutation {
    addUser(name: String, email: String!): User
    deleteUser(id: Int!): Void
    updateUser(id: Int!, name: String, email: String!): User
  }
`;

const libraries = [
  {
    branch: 'downtown',
  },
  {
    branch: 'riverside',
  },
];

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
    branch: 'riverside',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
    branch: 'downtown',
  },
];

interface Context {
  user: string,
  prisma: PrismaClient
}

const resolvers = {
  Query: {
    user(_parent: any, args: any, context: Context, _info: any) {
      return context.prisma.user.findUnique({where: {id: args.id}});
    },
    users(_parent: any, _args: any, context: Context, _info: any) {
      return context.prisma.user.findMany();
    },
    libraries() {
      return libraries;
    },
  },
  Mutation: {
    addUser(_parent: any, args: any, context: Context, _info: any) {
      return context.prisma.user.create({data: {
        name: args.name,
        email: args.email,
      }});
    },
    async deleteUser(_parent: any, args: any, context: Context, _info: any) {
      await context.prisma.user.delete({where: {
        id: args.id,
      }});
    },
    updateUser(_parent: any, args: any, context: Context, _info: any) {
      return context.prisma.user.update({
        where: {
          id: args.id,
        },
        data: {
          name: args.name,
          email: args.email,
        },
      });
    },
  },
  Library: {
    books(parent: any) {
      return books.filter(book => book.branch === parent.branch);
    },
  },
  Book: {
    author(parent: any) {
      return {
        name: parent.author,
      };
    },
  },
};

const createApolloServer = (prisma: PrismaClient) => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    context: ({req}) => ({
      user: req.headers.user,
      prisma,
    }),
  });
};

export default createApolloServer;