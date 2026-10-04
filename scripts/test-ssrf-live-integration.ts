import { fetchSafeHtml, validateUrlSecurity, crawlTargetWebsite, isPrivateOrReservedIp } from '../api/crawler.js';

interface RecordedRequest {
  url: string;
  options?: any;
  timestamp: number;
}

class MockTransportHarness {
  dispatchedRequests: RecordedRequest[] = [];

  // Injected DNS resolver that simulates resolution for test hostnames
  dnsResolver = async (hostname: string): Promise<Array<{ address: string; family: number }>> => {
    const cleanHost = hostname.toLowerCase();
    if (cleanHost === 'public-firm.com') return [{ address: '93.184.216.34', family: 4 }];
    if (cleanHost === 'metadata-redirect.com') return [{ address: '93.184.216.35', family: 4 }];
    if (cleanHost === 'loop-a.com') return [{ address: '93.184.216.36', family: 4 }];
    if (cleanHost === 'loop-b.com') return [{ address: '93.184.216.37', family: 4 }];
    if (cleanHost.startsWith('chain-')) return [{ address: '93.184.216.38', family: 4 }];
    if (cleanHost === 'oversized.com') return [{ address: '93.184.216.39', family: 4 }];
    if (cleanHost === 'firm-with-subpages.com') return [{ address: '93.184.216.40', family: 4 }];
    if (cleanHost === 'private-subpage.firm.com') return [{ address: '192.168.1.1', family: 4 }];
    if (cleanHost === 'mapped-ipv6.firm.com') return [{ address: '::ffff:127.0.0.1', family: 6 }];
    if (cleanHost === 'rebinding-attack.com') return [{ address: '127.0.0.1', family: 4 }];

    // If it's an IP literal, parse family
    if (cleanHost === '127.0.0.1') return [{ address: '127.0.0.1', family: 4 }];
    if (cleanHost === '169.254.169.254') return [{ address: '169.254.169.254', family: 4 }];
    if (cleanHost === '192.168.1.1') return [{ address: '192.168.1.1', family: 4 }];

    return [{ address: '93.184.216.99', family: 4 }];
  };

  // Mock outbound transport that captures every request actually dispatched
  fetchTransport = async (url: string, options?: any): Promise<Response> => {
    this.dispatchedRequests.push({ url, options, timestamp: Date.now() });

    // CRITICAL SECURITY ASSERTION: If private destination reaches transport, throw fatal error
    const urlObj = new URL(url);
    if (isPrivateOrReservedIp(urlObj.hostname)) {
      throw new Error(`CRITICAL SECURITY FAILURE: Outbound transport dispatched request to private IP: ${url}`);
    }

    if (url === 'https://public-firm.com/') {
      return new Response(null, {
        status: 302,
        headers: { Location: 'http://127.0.0.1:8080/internal' }
      });
    }

    if (url === 'https://metadata-redirect.com/') {
      return new Response(null, {
        status: 302,
        headers: { Location: 'http://169.254.169.254/latest/meta-data/' }
      });
    }

    if (url === 'https://loop-a.com/') {
      return new Response(null, {
        status: 302,
        headers: { Location: 'https://loop-b.com/' }
      });
    }

    if (url === 'https://loop-b.com/') {
      return new Response(null, {
        status: 302,
        headers: { Location: 'https://loop-a.com/' }
      });
    }

    if (url.startsWith('https://chain-')) {
      const step = parseInt(url.split('-')[1] || '1', 10);
      return new Response(null, {
        status: 302,
        headers: { Location: `https://chain-${step + 1}.com/` }
      });
    }

    if (url === 'https://oversized.com/') {
      // Stream 3MB of data (exceeding 2MB limit)
      const chunkSize = 64 * 1024; // 64KB chunks
      const totalChunks = 48; // 48 * 64KB = 3.072MB
      let chunksSent = 0;

      const stream = new ReadableStream({
        pull(controller) {
          if (chunksSent < totalChunks) {
            const chunk = new Uint8Array(chunkSize);
            chunk.fill(65); // 'A'
            controller.enqueue(chunk);
            chunksSent++;
          } else {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (url === 'https://firm-with-subpages.com/') {
      const html = `<!DOCTYPE html>
        <html>
          <head><title>Firm With Subpages</title></head>
          <body>
            <h1>Main Commercial Firm</h1>
            <a href="/services">Our Services</a>
            <a href="http://192.168.1.1/admin">Internal Router Admin</a>
            <a href="http://[::ffff:127.0.0.1]/secret">IPv4-Mapped Secret</a>
            <a href="/contact">Contact Us</a>
          </body>
        </html>`;
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (url === 'https://firm-with-subpages.com/services') {
      return new Response('<html><body><h1>Commercial Cleaning Services</h1></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (url === 'https://firm-with-subpages.com/contact') {
      return new Response('<html><body><h1>Contact Our Team</h1></body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('<html><body>Default response</body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  };
}

async function runSsrfIntegrationTests() {
  console.log('🛡️  STARTING SSRF & NETWORK SECURITY INTEGRATION TEST SUITE\n');
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

  const harness = new MockTransportHarness();
  const hooks = {
    dnsResolver: harness.dnsResolver,
    fetchTransport: harness.fetchTransport
  };

  // -------------------------------------------------------------
  // Test 1: Public URL redirecting to 127.0.0.1 is blocked BEFORE dispatched
  // -------------------------------------------------------------
  try {
    harness.dispatchedRequests = [];
    let caughtError: any = null;
    try {
      await fetchSafeHtml('https://public-firm.com/', 'TestBot/1.0', 5000, 3, hooks);
    } catch (err) {
      caughtError = err;
    }

    const blockedBeforeDispatch = !harness.dispatchedRequests.some(r => r.url.includes('127.0.0.1'));
    const initialRequestDispatched = harness.dispatchedRequests.some(r => r.url === 'https://public-firm.com/');

    assert(
      caughtError !== null && caughtError.errorType === 'SSRF_BLOCKED',
      'Public URL redirecting to 127.0.0.1 raises SSRF_BLOCKED error'
    );
    assert(
      initialRequestDispatched && blockedBeforeDispatch,
      'Initial public request was dispatched, but redirected 127.0.0.1 request was NEVER sent to transport'
    );
  } catch (e: any) {
    assert(false, 'Test 1 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 2: Public URL redirecting to AWS/cloud metadata (169.254.169.254) is blocked
  // -------------------------------------------------------------
  try {
    harness.dispatchedRequests = [];
    let caughtError: any = null;
    try {
      await fetchSafeHtml('https://metadata-redirect.com/', 'TestBot/1.0', 5000, 3, hooks);
    } catch (err) {
      caughtError = err;
    }

    const metadataNeverDispatched = !harness.dispatchedRequests.some(r => r.url.includes('169.254.169.254'));
    assert(
      caughtError !== null && caughtError.errorType === 'SSRF_BLOCKED',
      'Public URL redirecting to 169.254.169.254 raises SSRF_BLOCKED error'
    );
    assert(
      metadataNeverDispatched,
      'Cloud metadata request (169.254.169.254) was NEVER dispatched to outbound transport'
    );
  } catch (e: any) {
    assert(false, 'Test 2 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 3: Discovered subpages pointing to private IPs are blocked & never fetched
  // -------------------------------------------------------------
  try {
    harness.dispatchedRequests = [];
    const evidence = await crawlTargetWebsite('https://firm-with-subpages.com/', hooks);

    const privateSubpageDispatched = harness.dispatchedRequests.some(
      r => r.url.includes('192.168.1.1') || r.url.includes('::ffff:127.0.0.1')
    );
    const servicesSubpageDispatched = harness.dispatchedRequests.some(
      r => r.url === 'https://firm-with-subpages.com/services'
    );

    assert(
      !privateSubpageDispatched,
      'Discovered subpages pointing to private destinations (192.168.1.1, ::ffff:127.0.0.1) were NEVER dispatched'
    );
    assert(
      servicesSubpageDispatched,
      'Legitimate public subpages (/services) were successfully crawled'
    );
    assert(
      evidence.pages.every(p => !p.url.includes('192.168.1.1')),
      'Evidence map contains zero private subpage entries'
    );
  } catch (e: any) {
    assert(false, 'Test 3 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 4: IPv4-mapped IPv6 private addresses blocked directly
  // -------------------------------------------------------------
  try {
    const check = await validateUrlSecurity('http://[::ffff:127.0.0.1]/admin', harness.dnsResolver);
    assert(
      !check.valid && check.errorType === 'SSRF_BLOCKED',
      'Direct IPv4-mapped IPv6 loopback (::ffff:127.0.0.1) blocked during URL security validation'
    );
  } catch (e: any) {
    assert(false, 'Test 4 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 5: Redirect loop (A -> B -> A) is detected and halted cleanly
  // -------------------------------------------------------------
  try {
    let caughtError: any = null;
    try {
      await fetchSafeHtml('https://loop-a.com/', 'TestBot/1.0', 5000, 3, hooks);
    } catch (err) {
      caughtError = err;
    }

    assert(
      caughtError !== null && caughtError.errorType === 'TOO_MANY_REDIRECTS',
      'Redirect loop terminates with TOO_MANY_REDIRECTS without hanging'
    );
  } catch (e: any) {
    assert(false, 'Test 5 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 6: Redirect limit (>3 hops) is strictly enforced
  // -------------------------------------------------------------
  try {
    let caughtError: any = null;
    try {
      await fetchSafeHtml('https://chain-1.com/', 'TestBot/1.0', 5000, 3, hooks);
    } catch (err) {
      caughtError = err;
    }

    assert(
      caughtError !== null && caughtError.errorType === 'TOO_MANY_REDIRECTS',
      'Redirect chaining exceeding max hops (3) is rejected with TOO_MANY_REDIRECTS'
    );
  } catch (e: any) {
    assert(false, 'Test 6 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 7: Oversized streaming response (>2MB) is terminated at limit
  // -------------------------------------------------------------
  try {
    let caughtError: any = null;
    try {
      await fetchSafeHtml('https://oversized.com/', 'TestBot/1.0', 5000, 3, hooks);
    } catch (err) {
      caughtError = err;
    }

    assert(
      caughtError !== null && caughtError.errorType === 'RESPONSE_TOO_LARGE' && caughtError.statusCode === 413,
      'Streaming payload exceeding 2MB limit terminates immediately with HTTP 413 RESPONSE_TOO_LARGE'
    );
  } catch (e: any) {
    assert(false, 'Test 7 threw unexpected exception', e.message);
  }

  // -------------------------------------------------------------
  // Test 8: DNS Rebinding defense (Re-validation before connection)
  // -------------------------------------------------------------
  try {
    // When a hostname rebinds to 127.0.0.1, validateUrlSecurity rejects it
    const rebindCheck = await validateUrlSecurity('http://rebinding-attack.com/', harness.dnsResolver);
    assert(
      !rebindCheck.valid && rebindCheck.errorType === 'SSRF_BLOCKED',
      'DNS Rebinding to 127.0.0.1 is caught by pre-connection resolution check'
    );
  } catch (e: any) {
    assert(false, 'Test 8 threw unexpected exception', e.message);
  }

  console.log(`\n========================================`);
  console.log(`SSRF INTEGRATION SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runSsrfIntegrationTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
