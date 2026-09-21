import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url || '';
        if (url.startsWith('/api/crawler') || url.startsWith('/api/analyze')) {
          try {
            let body: any = {};
            if (req.method === 'POST') {
              const chunks: any[] = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const str = Buffer.concat(chunks).toString('utf-8');
              if (str) {
                try { body = JSON.parse(str); } catch {}
              }
            }

            const isCrawler = url.startsWith('/api/crawler');
            const file = isCrawler ? './api/crawler.ts' : './api/analyze.ts';
            const mod = await server.ssrLoadModule(file);

            req.body = body;
            req.query = {};
            res.status = (code: number) => { res.statusCode = code; return res; };
            res.json = (data: any) => {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
              }
              res.end(JSON.stringify(data));
              return res;
            };

            await mod.default(req, res);
          } catch (err: any) {
            console.error('[API Dev Server Error]', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
