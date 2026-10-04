import { app, server } from '../server.mjs';
import crypto from 'crypto';

async function runAuthIntegrationTests() {
  console.log('🔑 STARTING STATELESS COOKIE AUTH & CSRF INTEGRATION TEST SUITE\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ' -> ' + detail : ''}`);
      failed++;
    }
  }

  // Configure test production secret
  const TEST_SECRET = 'agency-super-secure-production-secret-991';
  process.env.AUDIT_SECRET = TEST_SECRET;
  process.env.NODE_ENV = 'production';

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;
  const baseUrl = `http://localhost:${port}`;

  let sessionCookie = '';

  try {
    // -------------------------------------------------------------
    // Test 1: Unauthenticated request to /api/auth/status
    // -------------------------------------------------------------
    const statusRes = await fetch(`${baseUrl}/api/auth/status`);
    const statusData = await statusRes.json();
    assert(
      statusRes.ok && statusData.authRequired === true && statusData.authenticated === false,
      'Initial /api/auth/status shows authRequired: true and authenticated: false'
    );

    // -------------------------------------------------------------
    // Test 2: Unauthenticated POST to /api/crawler is rejected with 401
    // -------------------------------------------------------------
    const unauthedCrawl = await fetch(`${baseUrl}/api/crawler`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: 'https://example.com' })
    });
    assert(
      unauthedCrawl.status === 401,
      'Unauthenticated request to /api/crawler rejected with HTTP 401'
    );

    // -------------------------------------------------------------
    // Test 3: Login with invalid credentials rejected with generic 401
    // -------------------------------------------------------------
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Host': `localhost:${port}` },
      body: JSON.stringify({ secret: 'wrong-passphrase' })
    });
    const badLoginData = await badLogin.json();
    assert(
      badLogin.status === 401 && badLoginData.error === 'Invalid credentials.',
      'Login with incorrect password returns generic 401 "Invalid credentials."'
    );

    // -------------------------------------------------------------
    // Test 4: Successful login with correct secret sets HttpOnly SameSite=Strict cookie
    // -------------------------------------------------------------
    const goodLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Host': `localhost:${port}` },
      body: JSON.stringify({ secret: TEST_SECRET })
    });
    const setCookie = goodLogin.headers.get('set-cookie') || '';
    assert(
      goodLogin.ok && setCookie.includes('audit_session=') && setCookie.toLowerCase().includes('httponly') && setCookie.toLowerCase().includes('samesite=strict'),
      'Successful login sets audit_session cookie with HttpOnly and SameSite=Strict'
    );

    // Extract cookie value
    const match = setCookie.match(/audit_session=([^;]+)/);
    sessionCookie = match ? match[1] : '';
    assert(sessionCookie.length > 20, 'Extracted valid signed stateless session token');

    // -------------------------------------------------------------
    // Test 5: /api/auth/status with session cookie verifies active authentication
    // -------------------------------------------------------------
    const authedStatus = await fetch(`${baseUrl}/api/auth/status`, {
      headers: { Cookie: `audit_session=${sessionCookie}` }
    });
    const authedStatusData = await authedStatus.json();
    assert(
      authedStatus.ok && authedStatusData.authenticated === true,
      '/api/auth/status with cookie confirms authenticated: true'
    );

    // -------------------------------------------------------------
    // Test 6: Cross-site CSRF request with session cookie is rejected (403 Forbidden)
    // -------------------------------------------------------------
    const csrfCrawl = await fetch(`${baseUrl}/api/crawler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': `localhost:${port}`,
        'Origin': 'https://evil-attacker.com',
        'Cookie': `audit_session=${sessionCookie}`
      },
      body: JSON.stringify({ targetUrl: 'https://example.com' })
    });
    assert(
      csrfCrawl.status === 403,
      'Cross-site request with Origin: https://evil-attacker.com rejected with HTTP 403 CSRF defense'
    );

    // -------------------------------------------------------------
    // Test 7: Programmatic access with x-audit-key header succeeds
    // -------------------------------------------------------------
    const programmaticKeyCrawl = await fetch(`${baseUrl}/api/crawler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-audit-key': TEST_SECRET
      },
      body: JSON.stringify({ targetUrl: 'https://example.com' })
    });
    assert(
      programmaticKeyCrawl.status === 200,
      'Programmatic access with x-audit-key header succeeds with HTTP 200'
    );

    // -------------------------------------------------------------
    // Test 8: Programmatic access with Authorization: Bearer succeeds
    // -------------------------------------------------------------
    const programmaticBearerCrawl = await fetch(`${baseUrl}/api/crawler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_SECRET}`
      },
      body: JSON.stringify({ targetUrl: 'https://example.com' })
    });
    assert(
      programmaticBearerCrawl.status === 200,
      'Programmatic access with Authorization: Bearer header succeeds with HTTP 200'
    );

    // -------------------------------------------------------------
    // Test 9: Logout clears cookie and invalidates session
    // -------------------------------------------------------------
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Host': `localhost:${port}`, 'Cookie': `audit_session=${sessionCookie}` }
    });
    const logoutCookie = logoutRes.headers.get('set-cookie') || '';
    assert(
      logoutRes.ok && (logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires=Thu, 01 Jan 1970')),
      'Logout invalidates browser cookie with Max-Age=0'
    );

    // -------------------------------------------------------------
    // Test 10: Changing AUDIT_SECRET invalidates previously issued session tokens
    // -------------------------------------------------------------
    process.env.AUDIT_SECRET = 'a-different-secret-key-that-was-rotated-992';
    const rotatedStatus = await fetch(`${baseUrl}/api/auth/status`, {
      headers: { Cookie: `audit_session=${sessionCookie}` }
    });
    const rotatedStatusData = await rotatedStatus.json();
    assert(
      rotatedStatus.ok && rotatedStatusData.authenticated === false,
      'Rotating AUDIT_SECRET instantly invalidates existing session cookies'
    );

  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`AUTH INTEGRATION SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runAuthIntegrationTests().catch(err => {
  console.error('Fatal auth test error:', err);
  process.exit(1);
});
