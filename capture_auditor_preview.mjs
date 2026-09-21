import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5173;
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
  console.log(`Auditor test server running at http://localhost:${PORT}`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Dashboard View
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/rougu/Documents/antigravity/zealous-volta/screenshot_dashboard.png' });
  console.log('✓ Captured Dashboard view');

  // 2. Click "Audits" tab in sidebar to view Audit Registry with Teaser buttons
  const auditTab = await page.$('button[data-tab="audits"], .sidebar a[href*="audit"], nav button:nth-child(4)');
  if (auditTab) {
    await auditTab.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'C:/Users/rougu/Documents/antigravity/zealous-volta/screenshot_audit_list.png' });
    console.log('✓ Captured Audit List view');
  }

  // 3. Open First Audit Evaluator
  const scoreBtn = await page.$('button[title="Edit Evaluation"], .btn-secondary');
  if (scoreBtn) {
    await scoreBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'C:/Users/rougu/Documents/antigravity/zealous-volta/screenshot_wizard.png' });
    console.log('✓ Captured Wizard view');

    // 4. Click "Prospect Teaser" button in header
    const teaserBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const t = buttons.find(b => b.textContent.includes('Prospect Teaser'));
      if (t) { t.click(); return true; }
      return false;
    });
    if (teaserBtn) {
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: 'C:/Users/rougu/Documents/antigravity/zealous-volta/screenshot_prospect_teaser.png' });
      console.log('✓ Captured Prospect Teaser view');
    }
  }

  await browser.close();
  server.close();
  console.log('Auditor screenshots captured.');
});
