import express from 'express';
import apiRouter from '../src/routes/api.ts';
import { initDatabase } from '../src/db/mysql.ts';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

let dbInit: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  if (!dbInit) {
    dbInit = initDatabase();
  }
  await dbInit;
  app(req, res);
}
