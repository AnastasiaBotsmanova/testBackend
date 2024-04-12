import express from 'express';
import {log} from './log';
import {json} from 'body-parser';
import {ApolloServer, gql} from 'apollo-server-express';

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
  type Book {
    title: String!
    author: Author!
  }

  type User {
    id: ID!
    name: String
  }

  type Library {
    branch: String!
    books: [Book!]
  }

  type Author {
    name: String!
  }

  type Query {
    user(id: ID!): User
    libraries: [Library]
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

const users = [
  {
    id: '1',
    name: 'Elizabeth Bennet',
  },
  {
    id: '2',
    name: 'Fitzwilliam Darcy',
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

const resolvers = {
  Query: {
    user(_parent: any, args: any, contextValue: any, _info: any) {
      log.info(contextValue);
      return users.find((user) => user.id === args.id);
    },
    libraries() {
      return libraries;
    },
  },
  Library: {
    books(parent: any) {
      return books.filter((book) => book.branch === parent.branch);
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  context: ({req}) => ({
    user: req.headers.user,
  }),
});

server
  .start()
  .then(() => server.applyMiddleware({app, path: '/graph'}));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});