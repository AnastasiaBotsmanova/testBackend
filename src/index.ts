import {log} from './log';
import {json} from 'body-parser';
import {PrismaClient} from '@prisma/client';
import createApolloServer from './graph/createApolloServer';
import express from 'express';
import {filmsRouter} from './rest/films';

// yarn ts-node-dev src/index.ts
// cross-env TOKEN=777 yarn ts-node-dev src/index.ts

const app = express();
app.use(json());
const port = 3000;

app.use('/films', filmsRouter);

app.get('/', (_req, res) => {
  res.send({message: 'Hello test!'});
});

const prisma = new PrismaClient();

async function start() {
  const server = createApolloServer(prisma);

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