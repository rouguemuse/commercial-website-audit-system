import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Production server strictly imports compiled JavaScript from dist-api
import crawlerHandler from './dist-api/api/crawler.js';
import analyzeHandler from './dist-api/api/analyze.js';
import authHandler from './dist-api/api/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 2MB limit
app.use(express.json({ limit: '2mb' }));

// Helper to adapt Express req/res to Vercel/Node generic interface
function adaptResponse(res) {
  return {
    status: (code) => {
      res.status(code);
      return adaptResponse(res);
    },
    json: (data) => {
      res.json(data);
      return adaptResponse(res);
    },
    setHeader: (name, val) => {
      res.setHeader(name, val);
      return adaptResponse(res);
    },
    end: () => res.end()
  };
}

// Authentication Endpoints
app.all('/api/auth/:action', async (req, res) => {
  try {
    await authHandler(req, adaptResponse(res));
  } catch (err) {
    console.error('Auth API error:', err);
    res.status(500).json({ success: false, error: err.message || 'Auth server error' });
  }
});

app.all('/api/auth', async (req, res) => {
  try {
    await authHandler(req, adaptResponse(res));
  } catch (err) {
    console.error('Auth API error:', err);
    res.status(500).json({ success: false, error: err.message || 'Auth server error' });
  }
});

// Crawler API Endpoint
app.all('/api/crawler', async (req, res) => {
  try {
    await crawlerHandler(req, adaptResponse(res));
  } catch (err) {
    console.error('Crawler API error:', err);
    res.status(500).json({ success: false, error: err.message || 'Crawler server error' });
  }
});

// Diagnostic Analysis API Endpoint
app.all('/api/analyze', async (req, res) => {
  try {
    await analyzeHandler(req, adaptResponse(res));
  } catch (err) {
    console.error('Analyze API error:', err);
    res.status(500).json({ success: false, error: err.message || 'Analyze server error' });
  }
});

// Serve compiled static assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA catch-all middleware
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`[Website Audit System] Production server listening on http://localhost:${PORT}`);
});

export { app, server };
