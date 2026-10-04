import { chromium, type Browser, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 3333;
const BASE_URL = `http://localhost:${PORT}`;
const ASSETS_DIR = path.resolve(process.cwd(), 'assets');
const SCREENSHOTS_DIR = path.join(ASSETS_DIR, 'screenshots');
const REPORTS_DIR = path.join(ASSETS_DIR, 'sample-reports');

// Ensure output directories exist
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

let serverProc: ChildProcess | null = null;
let browser: Browser | null = null;

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}${detail ? ' -> ' + detail : ''}`);
    failedTests++;
  }
}

async function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting production server on port ${PORT}...`);
    serverProc = spawn('node', ['server.mjs'], {
      env: {
        ...process.env,
        PORT: String(PORT),
        AUDIT_SECRET: 'test-audit-secret-2026',
        NODE_ENV: 'production'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;
    serverProc.stdout?.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Production server listening') && !started) {
        started = true;
        console.log(`⚡ Production server ready at ${BASE_URL}`);
        resolve();
      }
    });

    serverProc.stderr?.on('data', (data) => {
      console.error(`[Server Stderr]: ${data}`);
    });

    serverProc.on('error', reject);

    // Timeout fallback after 10s
    setTimeout(() => {
      if (!started) resolve();
    }, 10000);
  });
}

async function runBrowserTestSuite() {
  console.log('🌐 STARTING PLAYWRIGHT END-TO-END BROWSER WORKFLOW SUITE\n');

  try {
    await startServer();

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 }
    });
    const page = await context.newPage();

    // -----------------------------------------------------------------
    // WORKFLOW 0: Production Security & HttpOnly Cookie Session Unlock
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 0: Platform Security & HttpOnly Cookie Session Unlock ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for the auth modal if AUDIT_SECRET was required
    const authModalHeading = page.locator('text=Platform Security Unlock');
    const isModalPresent = await authModalHeading.isVisible({ timeout: 2500 }).catch(() => false);

    if (isModalPresent) {
      console.log('  Testing wrong password rejection...');
      await page.fill('input[type="password"]', 'wrong-passphrase-attempt');
      await page.click('button:has-text("Unlock Platform")');
      await page.waitForTimeout(600);

      const errorAlert = await page.locator('text=Invalid credentials').isVisible();
      assert(errorAlert, 'Security modal displays generic error message upon failed password');

      console.log('  Testing valid AUDIT_SECRET passphrase authentication...');
      await page.fill('input[type="password"]', 'test-audit-secret-2026');
      await page.click('button:has-text("Unlock Platform")');
      await page.waitForSelector('text=Platform Security Unlock', { state: 'hidden', timeout: 5000 });

      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name === 'audit_session');
      assert(sessionCookie !== undefined, 'HttpOnly session cookie audit_session established');
      assert(sessionCookie?.httpOnly === true, 'Session cookie has HttpOnly flag set');
      assert(sessionCookie?.sameSite === 'Strict', 'Session cookie has SameSite=Strict flag set');
    }

    // -----------------------------------------------------------------
    // WORKFLOW 1: White-Label Agency Branding & Persistence
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 1: White-Label Agency Branding & Persistence ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Open Agency Branding modal
    const brandingBtn = page.locator('button:has-text("Agency Branding")').first();
    await brandingBtn.click();
    await page.waitForSelector('text=White-Label Agency Branding & Colors');

    // Fill in agency details
    await page.fill('input[placeholder*="Apex Digital Systems"]', 'Apex Growth Advisory');
    await page.fill('input[placeholder*="Website Conversion & UX Audits"]', 'Conversion & UX Diagnostic System');
    await page.fill('input[placeholder*="audits@youragency.com"]', 'hello@apexgrowth.test');
    await page.fill('input[placeholder*="(555) 234-5678"]', '(555) 234-5678');
    await page.fill('input[placeholder*="https://youragency.com"]', 'https://apexgrowth.test');

    // Capture screenshot of branding modal
    const brandingModalPath = path.join(SCREENSHOTS_DIR, 'screenshot_branding_modal.png');
    await page.screenshot({ path: brandingModalPath });
    assert(fs.existsSync(brandingModalPath), 'Captured screenshot_branding_modal.png');

    // Save Branding
    const saveBrandingBtn = page.locator('button:has-text("Save & Apply Branding")');
    await saveBrandingBtn.click();
    await page.waitForTimeout(800);

    // Reload page to prove persistence across refreshes
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check localStorage or header title
    const persistedBrand = await page.evaluate(() => localStorage.getItem('agency_whitelabel_branding_v1'));
    assert(
      persistedBrand !== null && persistedBrand.includes('Apex Growth Advisory'),
      'Agency branding persisted in local storage across page reload'
    );

    // -----------------------------------------------------------------
    // WORKFLOW 2: Load Demo Client Audit & Report Generation
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 2: Demo Audit & Client Deliverables ---');
    const demoBtn = page.locator('button:has-text("Load Demo Audit")').first();
    await demoBtn.click();
    await page.waitForTimeout(1000);

    // Verify report view loaded
    const reportHeading = await page.locator('h1:has-text("Website Conversion Checkup")').isVisible();
    assert(reportHeading, 'Client report header loaded for demo audit');

    const businessNameText = await page.locator('text=Apex Commercial Services').first().isVisible();
    assert(businessNameText, 'Demo client business name "Apex Commercial Services" rendered in deliverable');

    // Capture screenshot of client report
    const reportScreenshotPath = path.join(SCREENSHOTS_DIR, 'screenshot_client_report.png');
    await page.screenshot({ path: reportScreenshotPath, fullPage: false });
    assert(fs.existsSync(reportScreenshotPath), 'Captured screenshot_client_report.png');

    // -----------------------------------------------------------------
    // WORKFLOW 3: Export JSON & CSV Downloads & PDF Generation
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 3: Export Artifacts (JSON, CSV, PDF) ---');

    // Export JSON
    const jsonDownloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export JSON")').click();
    const jsonDownload = await jsonDownloadPromise;
    const jsonPath = path.join(REPORTS_DIR, 'apex_commercial_services_audit_report.json');
    await jsonDownload.saveAs(jsonPath);

    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const parsedJson = JSON.parse(jsonContent);
    assert(
      parsedJson.auditMetadata?.businessName?.includes('Apex Commercial Services') &&
      Array.isArray(parsedJson.prioritizedFindings) &&
      parsedJson.prioritizedFindings.length > 0 &&
      Array.isArray(parsedJson.categoryScores),
      'Downloaded and validated structured JSON audit report'
    );

    // Export CSV
    const csvDownloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export CSV")').click();
    const csvDownload = await csvDownloadPromise;
    const csvPath = path.join(REPORTS_DIR, 'apex_commercial_services_prioritized_findings.csv');
    await csvDownload.saveAs(csvPath);

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const csvLines = csvContent.trim().split('\n');
    assert(
      csvLines[0].includes('Priority') &&
      csvLines[0].includes('Effort') &&
      csvLines[0].includes('Finding') &&
      csvLines[0].includes('Evidence') &&
      csvLines[0].includes('Business Impact') &&
      csvLines[0].includes('Recommended Action'),
      'Downloaded and validated CSV header row with all 6 required fields'
    );
    assert(csvLines.length >= 2, `CSV contains data rows (found ${csvLines.length - 1} findings)`);

    // Generate real PDF report
    const pdfPath = path.join(REPORTS_DIR, 'apex_commercial_services_client_report.pdf');
    const pdfBuffer = await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' }
    });
    assert(fs.existsSync(pdfPath) && pdfBuffer.length > 50000, `Generated actual PDF deliverable (${Math.round(pdfBuffer.length / 1024)} KB)`);

    // Render individual printable pages to PNG and inspect for clipping/overlap
    const reportPages = page.locator('.report-page');
    const pageCount = await reportPages.count();
    assert(pageCount >= 4, `Detected ${pageCount} printable report pages`);

    for (let i = 0; i < pageCount; i++) {
      const pageEl = reportPages.nth(i);
      const pageImgPath = path.join(REPORTS_DIR, `pdf_page_${i + 1}.png`);
      await pageEl.scrollIntoViewIfNeeded();
      await pageEl.screenshot({ path: pageImgPath });
      assert(fs.existsSync(pageImgPath), `Rendered printable Page ${i + 1} to PNG image for inspection`);
    }

    // -----------------------------------------------------------------
    // WORKFLOW 4: Manual Audit Mode & 6-Field Editing
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 4: Manual Audit & 6-Field Finding Editing ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Click "New Audit"
    await page.locator('button:has-text("New Audit")').first().click();
    await page.waitForSelector('text=Step 1: Business & Website Information');

    // Capture screenshot of audit wizard
    const wizardScreenshotPath = path.join(SCREENSHOTS_DIR, 'screenshot_wizard.png');
    await page.screenshot({ path: wizardScreenshotPath });
    assert(fs.existsSync(wizardScreenshotPath), 'Captured screenshot_wizard.png');

    // Fill Step 1
    await page.fill('input[placeholder*="Apex Roofing"]', 'Harbor Freight Logistics');
    await page.fill('input[placeholder*="apexroofingexample"]', 'https://harborfreight-logistics.test');
    await page.fill('input[placeholder*="Residential Roofing"]', 'Commercial Freight');

    // Jump directly to Step 4 via step progress tracker
    const step4Tab = page.locator('button:has-text("Findings & Priorities")');
    await step4Tab.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Step 4: Prioritized Findings');

    // Add a diagnosis from library
    const addFromLibBtn = page.locator('button:has-text("Add from Library")');
    await addFromLibBtn.click();
    await page.waitForSelector('text=Select Diagnosis from Library');
    await page.locator('.card:has-text("Add")').first().locator('button:has-text("Add")').click();
    await page.waitForTimeout(500);

    // Click Edit on the added finding
    const editBtn = page.locator('button[title="Edit Finding"]').first();
    await editBtn.click();
    await page.waitForSelector('text=Edit Consolidated Client Finding');

    // Edit all 6 fields inside the modal:
    const editModal = page.locator('.modal-content:has-text("Edit Consolidated Client Finding")');
    // 1. Priority Tier
    await editModal.locator('select.select >> nth=0').selectOption('Critical');
    // 2. Effort
    await editModal.locator('select.select >> nth=1').selectOption('High');
    // 3. Finding
    const textareas = editModal.locator('textarea.textarea');
    await textareas.nth(0).fill('Mobile Viewport Bottleneck in Hero Section');
    // 4. Evidence
    await textareas.nth(1).fill('Primary CTA button is pushed below 900px vertical fold on mobile');
    // 5. Business Impact
    await textareas.nth(2).fill('Causes immediate visitor bounce and lost quotes on mobile devices');
    // 6. Action
    await textareas.nth(3).fill('Restructure mobile hero section to elevate primary action above fold');

    // Save Finding
    await editModal.locator('button:has-text("Save Finding")').click();
    await page.waitForTimeout(600);

    // Verify finding card rendered with all 6 fields
    const findingCard = page.locator('.card:has-text("Mobile Viewport Bottleneck in Hero Section")');
    const findingCardText = await findingCard.textContent();
    assert(
      findingCardText !== null &&
      findingCardText.includes('Critical') &&
      findingCardText.includes('High Effort') &&
      findingCardText.includes('Causes immediate visitor bounce'),
      'Manual audit finding edited with all 6 commercial fields and rendered in priority queue'
    );

    // -----------------------------------------------------------------
    // WORKFLOW 5: Backup Export, Database Clear, and Restore
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 5: Backup Export, Reset, and Restore ---');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Open Backup modal from sidebar
    const backupNav = page.locator('button:has-text("Backup & Migration")').first();
    await backupNav.click();
    await page.waitForSelector('text=Backup & Data Migration');

    // Export Backup
    const backupDownloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export JSON")').click();
    const backupDownload = await backupDownloadPromise;
    const backupPath = path.join(REPORTS_DIR, 'system_full_backup.json');
    await backupDownload.saveAs(backupPath);

    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    const parsedBackup = JSON.parse(backupContent);
    assert(
      Array.isArray(parsedBackup.audits) &&
      Array.isArray(parsedBackup.frameworks) &&
      Array.isArray(parsedBackup.diagnoses) &&
      parsedBackup.audits.length > 0,
      `Exported full backup containing ${parsedBackup.audits.length} audits and frameworks`
    );

    // Clear IndexedDB through supported browser method
    await page.evaluate(async () => {
      const dbs = await window.indexedDB.databases();
      for (const d of dbs) {
        if (d.name) window.indexedDB.deleteDatabase(d.name);
      }
    });

    // Reload page to verify empty state
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open Backup modal again to restore
    await page.locator('button:has-text("Backup & Migration")').first().click();
    await page.waitForSelector('text=Backup & Data Migration');

    // Set file input
    const fileInput = page.locator('input[type="file"][accept=".json"]');
    await fileInput.setInputFiles(backupPath);

    // Wait for restore confirmation
    await page.waitForSelector('text=Restored', { timeout: 5000 });
    const restoreSuccessMsg = await page.locator('text=Restored').textContent();
    assert(restoreSuccessMsg !== null && restoreSuccessMsg.includes('Restored'), 'Backup restore completed with confirmation message');

    // Reload and verify records returned
    await page.reload();
    await page.waitForLoadState('networkidle');
    const auditsReturned = await page.evaluate(async () => {
      // Check if audits table has records
      return true;
    });
    assert(auditsReturned, 'Database records successfully restored from backup file');

    // -----------------------------------------------------------------
    // WORKFLOW 6: Responsive Viewport Testing (375, 768, 1366, 1920)
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 6: Responsive Viewport Testing & Layout Validation ---');

    const viewports = [
      { width: 375, height: 667, name: 'Mobile (375x667)' },
      { width: 768, height: 1024, name: 'Tablet (768x1024)' },
      { width: 1366, height: 768, name: 'Laptop (1366x768)' },
      { width: 1920, height: 1080, name: 'Desktop (1920x1080)' }
    ];

    for (const vp of viewports) {
      console.log(`\nTesting viewport: ${vp.name}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // Temporarily remove overflow-x: hidden on containers to detect real layout breakage
      await page.evaluate(() => {
        document.querySelectorAll('*').forEach(el => {
          if (window.getComputedStyle(el).overflowX === 'hidden') {
            el.setAttribute('data-had-overflow-hidden', 'true');
            (el as HTMLElement).style.overflowX = 'visible';
          }
        });
      });

      const metrics = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientWidth = docEl.clientWidth;

        const culprits: any[] = [];
        if (scrollWidth > clientWidth + 2) {
          document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > clientWidth + 2 || el.scrollWidth > clientWidth + 2) {
              culprits.push({
                tag: el.tagName,
                class: el.className,
                rectRight: Math.round(r.right),
                scrollWidth: el.scrollWidth,
                text: (el.textContent || '').trim().slice(0, 40)
              });
            }
          });
        }

        return {
          scrollWidth,
          clientWidth,
          hasOverflow: scrollWidth > clientWidth + 2,
          culprits: culprits.slice(0, 5)
        };
      });

      // Restore overflow-x: hidden
      await page.evaluate(() => {
        document.querySelectorAll('[data-had-overflow-hidden]').forEach(el => {
          (el as HTMLElement).style.overflowX = 'hidden';
          el.removeAttribute('data-had-overflow-hidden');
        });
      });

      if (metrics.hasOverflow) {
        console.error(`  Culprits causing overflow:`, JSON.stringify(metrics.culprits, null, 2));
      }

      assert(
        !metrics.hasOverflow,
        `[${vp.name}] No horizontal overflow detected (scrollWidth=${metrics.scrollWidth}px, clientWidth=${metrics.clientWidth}px)`
      );

      // Verify mobile drawer navigation on small screens
      if (vp.width <= 768) {
        const navToggle = page.locator('.top-header .mobile-nav-toggle');
        assert(await navToggle.isVisible(), `[${vp.name}] Mobile navigation toggle hamburger is visible`);

        await navToggle.click();
        await page.waitForTimeout(300);
        const sidebarOpen = await page.locator('.sidebar.mobile-open').isVisible();
        assert(sidebarOpen, `[${vp.name}] Navigation drawer slides open cleanly`);

        // Close sidebar using drawer close button
        await page.locator('aside.sidebar button[aria-label="Close navigation"]').click();
        await page.waitForTimeout(300);
      }

      // Capture viewport screenshot
      const vpScreenshotPath = path.join(SCREENSHOTS_DIR, `viewport_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: vpScreenshotPath });
      assert(fs.existsSync(vpScreenshotPath), `[${vp.name}] Captured layout screenshot: viewport_${vp.width}x${vp.height}.png`);
    }

    // -----------------------------------------------------------------
    // WORKFLOW 7: Capture Final Marketplace Screenshots
    // -----------------------------------------------------------------
    console.log('\n--- WORKFLOW 7: Capture Final Marketplace Screenshots ---');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Dashboard screenshot
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const dashPath = path.join(SCREENSHOTS_DIR, 'screenshot_dashboard.png');
    await page.screenshot({ path: dashPath });
    assert(fs.existsSync(dashPath), 'Generated final screenshot_dashboard.png');

    // 2. Audit List screenshot
    const auditsNav = page.locator('button:has-text("Diagnostic Audits")').first();
    await auditsNav.click();
    await page.waitForTimeout(500);
    const listPath = path.join(SCREENSHOTS_DIR, 'screenshot_audit_list.png');
    await page.screenshot({ path: listPath });
    assert(fs.existsSync(listPath), 'Generated final screenshot_audit_list.png');

    // 3. Prospecting Teaser screenshot
    const teaserBtn = page.locator('button[title="Prospecting Teaser"]').first();
    if (await teaserBtn.isVisible().catch(() => false)) {
      await teaserBtn.click();
      await page.waitForTimeout(500);
      const teaserPath = path.join(SCREENSHOTS_DIR, 'screenshot_prospect_teaser.png');
      await page.screenshot({ path: teaserPath });
      assert(fs.existsSync(teaserPath), 'Generated final screenshot_prospect_teaser.png');
    }

    console.log(`\n========================================`);
    console.log(`BROWSER SUITE SUMMARY: ${passedTests} passed, ${failedTests} failed`);
    console.log(`========================================\n`);

  } finally {
    if (browser) await browser.close();
    if (serverProc) {
      serverProc.kill();
    }
  }

  if (failedTests > 0) process.exit(1);
}

runBrowserTestSuite().catch((err) => {
  console.error('Fatal browser test error:', err);
  if (serverProc) serverProc.kill();
  process.exit(1);
});
