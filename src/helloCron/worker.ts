/* eslint-disable no-console */
import {config} from 'dotenv';
import {run, parseCronItems} from 'graphile-worker';

// yarn ts-node-dev src/helloCron/worker.ts

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
      showDate: async (_payload, helpers) => {
        helpers.logger.info(new Date().toISOString());
      },
    },
    parsedCronItems: parseCronItems([{
      task: 'showDate',
      pattern: '* * * * *',
    }]),
  });

  await runner.promise;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});