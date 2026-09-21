import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5174;
const ROOT_DIR = 'C:/Users/rougu/Documents/antigravity/zealous-volta/dist';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT_DIR, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexHtml = path.join(ROOT_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexHtml).pipe(res);
  }
});

server.listen(PORT, async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Go to Audits tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const auditBtn = btns.find(b => b.textContent.includes('Audits'));
    if (auditBtn) auditBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Click the Teaser button (title="Prospecting Teaser")
  await page.evaluate(() => {
    const teaserBtn = document.querySelector('button[title="Prospecting Teaser"]');
    if (teaserBtn) teaserBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: 'C:/Users/rougu/Documents/antigravity/zealous-volta/screenshot_prospect_teaser.png', fullPage: true });
  console.log('✓ Captured full-page Prospect Teaser view');

  await browser.close();
  server.close();
});
