import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

function isPrivateOrReservedIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true;
  if (ip.startsWith('127.')) return true;
  if (ip.startsWith('100.64.') || ip.startsWith('100.127.')) return true;
  
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const second = parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
  }

  if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return true;
  }

  return false;
}

async function validateUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { allowed: false, reason: 'Disallowed protocol' };
    }
    if (u.hostname === 'localhost' || u.hostname.includes('127.0.0.1') || u.hostname.includes('169.254.169.254')) {
      return { allowed: false, reason: 'Loopback / Metadata target rejected' };
    }
    const res = await dnsLookup(u.hostname);
    if (isPrivateOrReservedIp(res.address)) {
      return { allowed: false, reason: `Private IP (${res.address}) blocked` };
    }
    return { allowed: true, ip: res.address };
  } catch (err: any) {
    return { allowed: false, reason: err.message };
  }
}

async function runTests() {
  console.log('🔒 RUNNING SSRF SECURITY VALIDATION SUITE');
  
  const testCases = [
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.1/admin',
    'http://192.168.1.1/router',
    'http://172.20.0.1/internal',
    'file:///etc/passwd',
    'ftp://example.com',
    'https://example.com'
  ];

  for (const tc of testCases) {
    const result = await validateUrl(tc);
    console.log(`${tc} -> ${result.allowed ? '✅ ALLOWED' : '🛡️ BLOCKED'} (${result.reason || result.ip})`);
  }
}

runTests();
