import express from 'express';
import apiRouter from '../src/routes/api.ts';
import { initDatabase, getDbDiagnostics } from '../src/db/mysql.ts';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

let dbInitPromise: Promise<void> | null = null;

async function ensureDb() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase();
  }
  await dbInitPromise;
  // If the connection didn't actually succeed, don't cache that failure for
  // this instance's whole lifetime — retry on the next request instead.
  if (!getDbDiagnostics().isMySqlAvailable) {
    dbInitPromise = null;
  }
}

export default async function handler(req: any, res: any) {
  await ensureDb();
  app(req, res);
}
