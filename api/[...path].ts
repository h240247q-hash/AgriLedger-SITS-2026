// TEMPORARY diagnostic version: everything is loaded lazily inside the
// handler's try/catch (including imports) so a module-load-time crash
// gets reported as JSON instead of Vercel's opaque FUNCTION_INVOCATION_FAILED.
let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const expressModule = await import('express');
      const express = expressModule.default;
      const { default: apiRouter } = await import('../src/routes/api.ts');
      const { initDatabase } = await import('../src/db/mysql.ts');

      const app = express();
      app.use(express.json());
      app.use('/api', apiRouter);

      await initDatabase();
      return app;
    })();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err: any) {
    appPromise = null;
    res.status(500).json({ error: err?.message || String(err), stack: err?.stack });
  }
}
