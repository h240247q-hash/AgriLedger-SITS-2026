import express from 'express';
import apiRouter from '../src/routes/api.ts';
import { initDatabase } from '../src/db/mysql.ts';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

// Reused across warm invocations of this serverless function so the pool
// (and its "is the real DB reachable" check) isn't re-established per request.
let dbInit: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!dbInit) {
      dbInit = initDatabase();
    }
    await dbInit;
    app(req, res);
  } catch (err: any) {
    // TEMPORARY: surface the real error for debugging without dashboard log access.
    res.status(500).json({ error: err?.message || String(err), stack: err?.stack });
  }
}
