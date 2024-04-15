/* eslint-disable no-console */
import {config} from 'dotenv';
import {run} from 'graphile-worker';

// yarn ts-node-dev src/helloQueue/worker.ts

config();

async function main() {
  const runner = await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      hello: async (payload: any, helpers) => {
        const {name} = payload;
        helpers.logger.info(`Hello, ${name}`);
      },
    },
  });

  await runner.promise;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});