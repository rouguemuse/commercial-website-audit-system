import { isPrivateOrReservedIp, validateUrlSecurity, checkAuth } from '../api/crawler';

async function runTests() {
  console.log('🔒 RUNNING SSRF & SECURITY HARDENING VALIDATION SUITE\n');
  
  const testCases = [
    { url: 'http://localhost:3000', shouldBlock: true, desc: 'localhost hostname' },
    { url: 'http://127.0.0.1:8080', shouldBlock: true, desc: '127.0.0.1 IPv4 loopback' },
    { url: 'http://127.12.34.56', shouldBlock: true, desc: '127.0.0.0/8 loopback range' },
    { url: 'http://0.0.0.0', shouldBlock: true, desc: '0.0.0.0 current network' },
    { url: 'http://169.254.169.254/latest/meta-data/', shouldBlock: true, desc: 'AWS/cloud metadata service' },
    { url: 'http://10.0.0.1/admin', shouldBlock: true, desc: '10.0.0.0/8 private network' },
    { url: 'http://192.168.1.1/router', shouldBlock: true, desc: '192.168.0.0/16 private network' },
    { url: 'http://172.16.0.1/internal', shouldBlock: true, desc: '172.16.0.0/12 private network low' },
    { url: 'http://172.31.255.254', shouldBlock: true, desc: '172.16.0.0/12 private network high' },
    { url: 'http://100.64.0.1', shouldBlock: true, desc: '100.64.0.0/10 CGNAT low' },
    { url: 'http://100.127.255.254', shouldBlock: true, desc: '100.64.0.0/10 CGNAT high' },
    { url: 'http://[::1]', shouldBlock: true, desc: 'IPv6 loopback' },
    { url: 'http://[::ffff:127.0.0.1]', shouldBlock: true, desc: 'IPv4-mapped IPv6 loopback' },
    { url: 'http://[::ffff:10.0.0.1]', shouldBlock: true, desc: 'IPv4-mapped IPv6 private' },
    { url: 'http://[fe80::1]', shouldBlock: true, desc: 'IPv6 link-local' },
    { url: 'http://[fc00::1]', shouldBlock: true, desc: 'IPv6 unique local' },
    { url: 'http://[ff02::1]', shouldBlock: true, desc: 'IPv6 multicast' },
    { url: 'http://metadata.google.internal', shouldBlock: true, desc: 'GCP metadata hostname' },
    { url: 'file:///etc/passwd', shouldBlock: true, desc: 'file:// protocol' },
    { url: 'ftp://example.com', shouldBlock: true, desc: 'ftp:// protocol' },
    { url: 'gopher://example.com', shouldBlock: true, desc: 'gopher:// protocol' },
    { url: 'https://example.com', shouldBlock: false, desc: 'Public website (example.com)' }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const res = await validateUrlSecurity(tc.url);
    const wasBlocked = !res.valid;
    const isCorrect = wasBlocked === tc.shouldBlock;

    if (isCorrect) {
      passed++;
      console.log(`✅ PASS: ${tc.desc} (${tc.url}) -> ${wasBlocked ? 'BLOCKED' : 'ALLOWED'}`);
    } else {
      failed++;
      console.error(`❌ FAIL: ${tc.desc} (${tc.url}) -> Expected shouldBlock=${tc.shouldBlock}, got valid=${res.valid} (${res.message})`);
    }
  }

  // Test Authentication Fail-Closed
  console.log('\n🔑 TESTING AUTHENTICATION FAIL-CLOSED BEHAVIOR');
  
  // Test 1: Production mode without AUDIT_SECRET must fail closed (503)
  const origNodeEnv = process.env.NODE_ENV;
  const origSecret = process.env.AUDIT_SECRET;
  
  process.env.NODE_ENV = 'production';
  delete process.env.AUDIT_SECRET;
  const prodNoSecret = checkAuth({ headers: {} });
  if (!prodNoSecret.authorized && prodNoSecret.statusCode === 503) {
    passed++;
    console.log('✅ PASS: Production mode without AUDIT_SECRET fails closed with 503');
  } else {
    failed++;
    console.error('❌ FAIL: Production mode without AUDIT_SECRET did not fail closed', prodNoSecret);
  }

  // Test 2: Production mode with AUDIT_SECRET and invalid header must fail (401)
  process.env.AUDIT_SECRET = 'super-secret-key-123';
  const prodBadKey = checkAuth({ headers: { 'x-audit-key': 'wrong' } });
  if (!prodBadKey.authorized && prodBadKey.statusCode === 401) {
    passed++;
    console.log('✅ PASS: Invalid credentials rejected with 401');
  } else {
    failed++;
    console.error('❌ FAIL: Invalid credentials not rejected', prodBadKey);
  }

  // Test 3: Valid key accepted
  const prodGoodKey = checkAuth({ headers: { 'x-audit-key': 'super-secret-key-123' } });
  if (prodGoodKey.authorized) {
    passed++;
    console.log('✅ PASS: Valid x-audit-key authorized');
  } else {
    failed++;
    console.error('❌ FAIL: Valid x-audit-key not authorized');
  }

  // Restore env
  if (origNodeEnv) process.env.NODE_ENV = origNodeEnv; else delete process.env.NODE_ENV;
  if (origSecret) process.env.AUDIT_SECRET = origSecret; else delete process.env.AUDIT_SECRET;

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runTests();
