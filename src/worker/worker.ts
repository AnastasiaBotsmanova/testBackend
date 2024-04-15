/* eslint-disable no-console */
import {config} from 'dotenv';
import {run} from 'graphile-worker';

// yarn ts-node-dev src/worker/worker.ts

config();

export const delayMs = (microseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, microseconds);
  });
};

async function main() {
  const runner = await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskList: {
      hello: async (payload: any, helpers) => {
        const {name} = payload;
        await delayMs(2000);
        helpers.logger.info(`Hello, ${name}`);
      },
      sum: async (payload: any, helpers) => {
        const {firstNum, secondNum} = payload;
        await delayMs(2000);
        helpers.logger.info(`Summator, ${firstNum + secondNum}`);
      },
    },
  });

  await runner.promise;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
