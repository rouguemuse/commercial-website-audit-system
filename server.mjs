import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import crawlerHandler from './api/crawler.ts';
import analyzeHandler from './api/analyze.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// API Endpoints matching Vercel serverless routing
app.all('/api/crawler', async (req, res) => {
  try {
    await crawlerHandler(req, res);
  } catch (err) {
    console.error('Crawler API error:', err);
    res.status(500).json({ error: err.message || 'Crawler server error' });
  }
});

app.all('/api/analyze', async (req, res) => {
  try {
    await analyzeHandler(req, res);
  } catch (err) {
    console.error('Analyze API error:', err);
    res.status(500).json({ error: err.message || 'Analyze server error' });
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
