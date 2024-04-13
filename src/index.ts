import express from 'express';
import {log} from './log';
import {json} from 'body-parser';
import {ApolloServer, gql} from 'apollo-server-express';
import {PrismaClient} from '@prisma/client';

// yarn ts-node-dev src/index.ts

const app = express();
app.use(json());
const port = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

let films = [
  {
    id: 1,
    title: 'Аватар',
    raiting: 10,
  },
  {
    id: 2,
    title: 'Атака титанов',
    raiting: 9,
  },
  {
    id: 3,
    title: 'Алиса в стране чудес',
    raiting: 8,
  },
];

app.get('/films', (_req, res) => {
  res.send(films);
});

app.get('/films/:filmId', (req, res) => {
  log.info(req.params);
  res.send(films.find(film => film.id === Number.parseInt(req.params.filmId, 10)));
});

app.post('/films', (req, res) => {
  log.info(req.body);
  const maxId = Math.max(...films.map(film => film.id));
  films.push({
    ...req.body,
    id: maxId + 1,
  });
  res.send(films);
});

app.put('/films/:filmId', (req, res) => {
  log.info(req.params);
  films = films.map(
    film => (film.id === Number.parseInt(req.params.filmId, 10) ? {
      ...req.body,
      id: film.id,
    } : film),
  );
  res.send(films);
});

app.delete('/films/:filmId', (req, res) => {
  log.info(req.params);
  films = films.filter(film => film.id !== Number.parseInt(req.params.filmId, 10));
  res.send(films);
});

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

const libraries = [
  {
    branch: 'downtown',
  },
  {
    branch: 'riverside',
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

const prisma = new PrismaClient();

async function start() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    context: ({req}) => ({
      user: req.headers.user,
      prisma,
    }),
  });

server
  .start()
  .then(() => server.applyMiddleware({app, path: '/graph'}));

  app.listen(port, () => {
    log.info(`Example app listening on port ${port}`);
  });
}

start()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });