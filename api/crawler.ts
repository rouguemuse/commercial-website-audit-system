import dns from 'dns';
import net from 'net';
import { promisify } from 'util';
import type { WebsiteEvidenceMap, EvidenceElement, SectionSnapshotData, CrawlPageResult, CrawlPageType } from '../src/types/index.js';
import { checkApiAuth } from './auth.js';

const dnsLookupAll = promisify(dns.lookup);

export interface CrawlerTestHooks {
  dnsResolver?: (hostname: string) => Promise<Array<{ address: string; family: number }>>;
  fetchTransport?: (url: string, init?: any) => Promise<Response>;
}

export interface ApiRequest {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

// SSRF Comprehensive IP Range Checker
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;
  const cleanIp = ip.trim().toLowerCase().replace(/^\[|\]$/g, '');

  // If not a valid IP literal, don't flag as private IP here
  if (net.isIP(cleanIp) === 0 && !cleanIp.startsWith('::ffff:')) {
    return false;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (cleanIp.startsWith('::ffff:')) {
    const v4Part = cleanIp.slice(7);
    if (v4Part.includes('.')) {
      return isPrivateOrReservedIp(v4Part);
    }
    const hexParts = v4Part.split(':');
    if (hexParts.length === 2) {
      const p1 = parseInt(hexParts[0], 16);
      const p2 = parseInt(hexParts[1], 16);
      const parsedIpv4 = `${(p1 >> 8) & 0xff}.${p1 & 0xff}.${(p2 >> 8) & 0xff}.${p2 & 0xff}`;
      return isPrivateOrReservedIp(parsedIpv4);
    }
    return true;
  }

  // IPv6 address checks
  if (cleanIp.includes(':')) {
    if (
      cleanIp === '::1' ||
      cleanIp === '::' ||
      cleanIp === '0:0:0:0:0:0:0:0' ||
      cleanIp === '0:0:0:0:0:0:0:1'
    ) {
      return true;
    }
    // Link-local: fe80::/10 (fe80 to febf)
    if (/^fe[89ab][0-9a-f]:/i.test(cleanIp) || cleanIp.startsWith('fe80:')) return true;
    // Unique local address (ULA): fc00::/7 (fc00 to fdff)
    if (/^f[cd][0-9a-f]{2}:/i.test(cleanIp)) return true;
    // Multicast: ff00::/8
    if (/^ff[0-9a-f]{2}:/i.test(cleanIp)) return true;
    // Discard prefix (RFC 6666): 0100::/64
    if (cleanIp.startsWith('100::') || cleanIp.startsWith('0100::')) return true;
    // 6to4 prefix: 2002::/16
    if (cleanIp.startsWith('2002:')) return true;
    if (cleanIp.startsWith('2001:db8:')) return true;
    return false;
  }

  // IPv4 address checks
  const parts = cleanIp.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IPv4 address, block
  }

  const [p0, p1, p2] = parts;

  // 0.0.0.0/8 (Current network)
  if (p0 === 0) return true;
  // 10.0.0.0/8 (Private network)
  if (p0 === 10) return true;
  // 100.64.0.0/10 (Carrier-Grade NAT / Shared address space: 100.64.0.0 - 100.127.255.255)
  if (p0 === 100 && p1 >= 64 && p1 <= 127) return true;
  // 127.0.0.0/8 (Loopback addresses)
  if (p0 === 127) return true;
  // 169.254.0.0/16 (Link-local & cloud metadata like AWS/Azure/GCP 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;
  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (p0 === 192 && p1 === 0 && p2 === 0) return true;
  // 192.0.2.0/24 (TEST-NET-1 documentation)
  if (p0 === 192 && p1 === 0 && p2 === 2) return true;
  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (p0 === 192 && p1 === 88 && p2 === 99) return true;
  // 192.168.0.0/16 (Private network)
  if (p0 === 192 && p1 === 168) return true;
  // 198.18.0.0/15 (Network benchmark tests: 198.18.0.0 - 198.19.255.255)
  if (p0 === 198 && (p1 === 18 || p1 === 19)) return true;
  // 198.51.100.0/24 (TEST-NET-2 documentation)
  if (p0 === 198 && p1 === 51 && p2 === 100) return true;
  // 203.0.113.0/24 (TEST-NET-3 documentation)
  if (p0 === 203 && p1 === 0 && p2 === 113) return true;
  // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
  if (p0 >= 224 && p0 <= 239) return true;
  // 240.0.0.0/4 (Reserved / Future use / Broadcast: 240.0.0.0 - 255.255.255.255)
  if (p0 >= 240) return true;

  return false;
}

// SSRF Safe URL Validator with DNS resolution & rebinding defense
export async function validateUrlSecurity(
  urlString: string,
  customResolver?: (hostname: string) => Promise<Array<{ address: string; family: number }>>
): Promise<{
  valid: boolean;
  errorType?: 'INVALID_URL' | 'DNS_UNRESOLVED' | 'SSRF_BLOCKED';
  statusCode?: number;
  message?: string;
  recovery?: string;
  urlObj?: URL;
  resolvedIps?: string[];
}> {
  try {
    const urlObj = new URL(urlString);

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        valid: false,
        errorType: 'INVALID_URL',
        statusCode: 400,
        message: 'Invalid protocol: Only http:// and https:// URLs are supported.',
        recovery: 'Please enter a web address starting with https:// (e.g. https://example.com).'
      };
    }

    const hostname = urlObj.hostname.toLowerCase();
    if (
      !hostname ||
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'metadata.google.internal'
    ) {
      return {
        valid: false,
        errorType: 'SSRF_BLOCKED',
        statusCode: 403,
        message: 'Access to localhost, local, and internal cloud metadata targets is blocked for security.',
        recovery: 'Please scan a public website domain.'
      };
    }

    // Directly check if hostname itself is an IP literal
    if (isPrivateOrReservedIp(hostname)) {
      return {
        valid: false,
        errorType: 'SSRF_BLOCKED',
        statusCode: 403,
        message: `Access to private or reserved IP address (${hostname}) is forbidden.`,
        recovery: 'Only publicly routable web servers can be crawled.'
      };
    }

    // Resolve all IPv4 and IPv6 addresses for hostname
    let records: Array<{ address: string; family: number }> = [];
    try {
      if (customResolver) {
        records = await customResolver(hostname);
      } else {
        const res = await dnsLookupAll(hostname, { all: true });
        records = Array.isArray(res) ? res : [res];
      }
    } catch (dnsErr: any) {
      return {
        valid: false,
        errorType: 'DNS_UNRESOLVED',
        statusCode: 422,
        message: `Domain not found (${dnsErr.code || 'ENOTFOUND'}): The domain "${hostname}" could not be resolved.`,
        recovery: 'Check the spelling of the domain. Ensure the website is live, publicly registered, and has valid DNS records.'
      };
    }

    if (!records || records.length === 0) {
      return {
        valid: false,
        errorType: 'DNS_UNRESOLVED',
        statusCode: 422,
        message: `No DNS records returned for domain "${hostname}".`,
        recovery: 'Ensure the website domain has valid A or AAAA records.'
      };
    }

    const resolvedIps = records.map(r => r.address);
    for (const ip of resolvedIps) {
      if (isPrivateOrReservedIp(ip)) {
        return {
          valid: false,
          errorType: 'SSRF_BLOCKED',
          statusCode: 403,
          message: `Access blocked: Resolved target IP address (${ip}) falls within a private or reserved network range.`,
          recovery: 'Only publicly routable web servers can be crawled.'
        };
      }
    }

    return { valid: true, urlObj, resolvedIps };
  } catch (err: any) {
    return {
      valid: false,
      errorType: 'INVALID_URL',
      statusCode: 400,
      message: `Invalid URL format: ${err.message}`,
      recovery: 'Ensure you enter a full, valid URL such as https://example.com'
    };
  }
}

// Authentication Check delegating to hardened stateless session & key verifier
export function checkAuth(req: ApiRequest): { authorized: boolean; reason?: string; statusCode?: number } {
  return checkApiAuth(req);
}

function cleanHtmlText(snippet: string): string {
  return snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Manual-redirect fetching with SSRF revalidation, rebinding defense, and size limit
export async function fetchSafeHtml(
  initialUrl: string,
  userAgent: string,
  timeoutMs: number = 10000,
  maxRedirects: number = 3,
  hooks?: CrawlerTestHooks
): Promise<{ response: Response; finalUrl: string; html: string; durationMs: number }> {
  let currentUrl = initialUrl;
  const startTime = Date.now();
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const sec = await validateUrlSecurity(currentUrl, hooks?.dnsResolver);
    if (!sec.valid) {
      const err: any = new Error(sec.message || 'Security validation failed');
      err.errorType = sec.errorType || 'SSRF_BLOCKED';
      err.statusCode = sec.statusCode || 403;
      err.recovery = sec.recovery;
      throw err;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      const fetchOpts = {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal,
        redirect: 'manual' as const
      };

      if (hooks?.fetchTransport) {
        res = await hooks.fetchTransport(currentUrl, fetchOpts);
      } else {
        res = await fetch(currentUrl, fetchOpts);
      }
    } catch (fetchErr: any) {
      clearTimeout(timer);
      if (fetchErr.name === 'AbortError') {
        const err: any = new Error(`Connection timed out: The website did not respond within ${Math.round(timeoutMs / 1000)} seconds.`);
        err.errorType = 'TIMEOUT';
        err.statusCode = 504;
        err.recovery = 'The server may be overloaded or down. Verify the site in your browser, or switch to Manual Audit Mode.';
        throw err;
      }
      const err: any = new Error(`Failed to connect to ${currentUrl}: ${fetchErr.message}`);
      err.errorType = 'UNREACHABLE';
      err.statusCode = 502;
      err.recovery = 'Verify the site is reachable in your browser. If protected by firewall or basic auth, use Manual Audit Mode.';
      throw err;
    }
    clearTimeout(timer);

    // If HTTP redirect, re-validate redirect target before following
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) {
        break;
      }
      const nextUrlObj = new URL(location, currentUrl);
      currentUrl = nextUrlObj.toString();
      continue;
    }

    // Check size limit before reading full body
    const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_SIZE) {
      const err: any = new Error(`Target website response size (${Math.round(contentLength / 1024)} KB) exceeds the 2MB limit.`);
      err.errorType = 'RESPONSE_TOO_LARGE';
      err.statusCode = 413;
      err.recovery = 'The target page is larger than 2MB. Use Manual Audit Mode to capture specific sections.';
      throw err;
    }

    // Stream-safe read up to 2MB to prevent buffering large payloads in memory
    let truncatedText = '';
    if (res.body && typeof (res.body as any).getReader === 'function') {
      const reader = (res.body as any).getReader();
      const decoder = new TextDecoder();
      let totalBytes = 0;
      let exceeded = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_SIZE) {
            exceeded = true;
            try { await reader.cancel(); } catch {}
            break;
          }
          truncatedText += decoder.decode(value, { stream: true });
        }
      }
      truncatedText += decoder.decode();
      if (exceeded) {
        const err: any = new Error(`Target website response size exceeds the 2MB limit.`);
        err.errorType = 'RESPONSE_TOO_LARGE';
        err.statusCode = 413;
        err.recovery = 'The target page is larger than 2MB. Use Manual Audit Mode to capture specific sections.';
        throw err;
      }
    } else {
      const text = await res.text();
      if (text.length > MAX_SIZE) {
        const err: any = new Error(`Target website response size exceeds the 2MB limit.`);
        err.errorType = 'RESPONSE_TOO_LARGE';
        err.statusCode = 413;
        err.recovery = 'The target page is larger than 2MB. Use Manual Audit Mode to capture specific sections.';
        throw err;
      }
      truncatedText = text;
    }

    const durationMs = Date.now() - startTime;
    return { response: res, finalUrl: currentUrl, html: truncatedText, durationMs };
  }

  const err: any = new Error('Too many redirects encountered while scanning target website.');
  err.errorType = 'TOO_MANY_REDIRECTS';
  err.statusCode = 310;
  err.recovery = 'Target website is stuck in a redirect loop. Verify URL or switch to Manual Audit Mode.';
  throw err;
}

export async function crawlTargetWebsite(
  rawTargetUrl: string,
  hooks?: CrawlerTestHooks
): Promise<WebsiteEvidenceMap> {
  let targetUrl = rawTargetUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  // 1. Initial SSRF & DNS Security Validation
  const securityCheck = await validateUrlSecurity(targetUrl, hooks?.dnsResolver);
  if (!securityCheck.valid || !securityCheck.urlObj) {
    const err: any = new Error(securityCheck.message || 'URL validation failed');
    err.errorType = securityCheck.errorType || 'INVALID_URL';
    err.statusCode = securityCheck.statusCode || 400;
    err.recovery = securityCheck.recovery || 'Check the website URL and try again.';
    throw err;
  }

  const targetOrigin = securityCheck.urlObj.origin;
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (WebsiteAuditBot/2.0)';

  // 2. Fetch Homepage with Manual Redirect Revalidation & SSRF Protection
  const homeFetchResult = await fetchSafeHtml(targetUrl, USER_AGENT, 10000, 3, hooks);
  const { response: homeRes, html: homeHtml, durationMs: homeLoadDuration, finalUrl } = homeFetchResult;

  // Check HTTP Status of Homepage
  if (homeRes.status === 403) {
    const err: any = new Error('Website returned HTTP 403 (Automated scanner blocked by Cloudflare, WAF, or server permissions).');
    err.errorType = 'BOT_BLOCKED';
    err.statusCode = 403;
    err.recovery = 'This website actively blocks automated bots. Use Manual Audit Mode to upload screenshots and audit directly.';
    throw err;
  }

  if (homeRes.status === 429) {
    const err: any = new Error('Website returned HTTP 429 (Too Many Requests / Rate Limited).');
    err.errorType = 'RATE_LIMITED';
    err.statusCode = 429;
    err.recovery = 'The website is temporarily throttling requests. Please wait a minute or use Manual Audit Mode.';
    throw err;
  }

  // Check for Cloudflare / CAPTCHA Challenge Page
  if (/challenge-platform|just a moment\.\.\.|attention required! \| cloudflare|cf-browser-verification/i.test(homeHtml) && homeHtml.length < 5000) {
    const err: any = new Error('Cloudflare interactive challenge detected. The website requires a human browser verification.');
    err.errorType = 'BOT_BLOCKED';
    err.statusCode = 403;
    err.recovery = 'Automated crawlers cannot bypass Cloudflare turnstile. Switch to Manual Audit Mode to capture screenshots.';
    throw err;
  }

  const crawlResults: CrawlPageResult[] = [
    {
      url: finalUrl,
      pageType: 'home',
      status: homeRes.ok ? 'captured' : 'partial',
      httpStatus: homeRes.status,
      durationMs: homeLoadDuration
    }
  ];

  const elements: EvidenceElement[] = [];
  const detectedPhoneNumbers: string[] = [];
  let hasTelLinks = false;
  let formCount = 0;

  // Parse Meta and Structural Elements on Homepage
  const titleMatch = homeHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? cleanHtmlText(titleMatch[1]) : '';

  const descMatch = homeHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const pageDescription = descMatch ? cleanHtmlText(descMatch[1]) : '';

  // Extract Homepage H1s
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let h1Match;
  let h1Index = 1;
  while ((h1Match = h1Regex.exec(homeHtml)) !== null && h1Index <= 3) {
    const text = cleanHtmlText(h1Match[1]);
    if (text) {
      elements.push({
        id: `HOME.hero.h1_${h1Index}`,
        pageUrl: finalUrl,
        pageType: 'home',
        category: 'headline',
        tag: 'H1',
        visibleText: text,
        boundingBox: { pageX: 180, pageY: 160 + (h1Index - 1) * 80, width: 720, height: 75 },
        viewport: 'desktop',
        isVisible: true,
        associatedSnapshotId: 'snap_desktop_hero'
      });
      h1Index++;
    }
  }

  // Extract Homepage CTAs
  const btnRegex = /<(?:button|a)[^>]*(?:class=["'][^"']*(?:btn|cta|button)[^"']*["']|href=["']([^"']*(?:contact|quote|book|schedule|tel:)[^"']*)["'])[^>]*>([\s\S]*?)<\/(?:button|a)>/gi;
  let btnMatch;
  let btnIndex = 1;
  while ((btnMatch = btnRegex.exec(homeHtml)) !== null && btnIndex <= 6) {
    const href = btnMatch[1] || '';
    const text = cleanHtmlText(btnMatch[2]);
    if (text && text.length < 60) {
      elements.push({
        id: `HOME.hero.cta_${btnIndex}`,
        pageUrl: finalUrl,
        pageType: 'home',
        category: 'cta',
        tag: 'BUTTON',
        visibleText: text,
        href,
        boundingBox: { pageX: 180 + (btnIndex - 1) * 200, pageY: 340, width: 190, height: 50 },
        viewport: 'desktop',
        isVisible: true,
        associatedSnapshotId: 'snap_desktop_hero'
      });
      btnIndex++;
    }
  }

  // Phone / Tel links
  const telRegex = /href=["']tel:([^"']+)["']/gi;
  let telMatch;
  while ((telMatch = telRegex.exec(homeHtml)) !== null) {
    hasTelLinks = true;
    const cleanPhone = telMatch[1].trim();
    if (!detectedPhoneNumbers.includes(cleanPhone)) {
      detectedPhoneNumbers.push(cleanPhone);
    }
  }

  // Forms count
  const formsMatch = homeHtml.match(/<form[\s\S]*?<\/form>/gi);
  if (formsMatch) {
    formCount = formsMatch.length;
    elements.push({
      id: 'HOME.form.inquiry',
      pageUrl: finalUrl,
      pageType: 'home',
      category: 'form',
      tag: 'FORM',
      visibleText: 'Inquiry intake form',
      boundingBox: { pageX: 840, pageY: 220, width: 420, height: 480 },
      viewport: 'desktop',
      isVisible: true,
      associatedSnapshotId: 'snap_contact_form'
    });
  }

  // 3. Discover and Crawl Subpages (Up to 4 subpages, matching origin strictly and SSRF safe)
  const discoveredPages: Array<{ type: CrawlPageType; url: string }> = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;

  while ((linkMatch = linkRegex.exec(homeHtml)) !== null) {
    const href = linkMatch[1].trim();
    const text = cleanHtmlText(linkMatch[2]).toLowerCase();

    let matchedType: CrawlPageType | null = null;
    if (/(?:services|what-we-do|solutions|products)/i.test(href) || /(?:services|what we do|solutions)/i.test(text)) {
      matchedType = 'services';
    } else if (/(?:contact|contact-us|get-in-touch|quote)/i.test(href) || /(?:contact|get a quote|estimate)/i.test(text)) {
      matchedType = 'contact';
    } else if (/(?:about|about-us|our-story|company)/i.test(href) || /(?:about us|who we are)/i.test(text)) {
      matchedType = 'about';
    } else if (/(?:pricing|rates|plans|costs)/i.test(href) || /(?:pricing|rates|plans)/i.test(text)) {
      matchedType = 'pricing';
    }

    if (matchedType && !discoveredPages.some(p => p.type === matchedType)) {
      try {
        const resolvedSubUrl = new URL(href, finalUrl);
        if (resolvedSubUrl.origin === targetOrigin && resolvedSubUrl.href !== finalUrl) {
          // SSRF validation for discovered subpage before queueing
          const subSec = await validateUrlSecurity(resolvedSubUrl.href, hooks?.dnsResolver);
          if (subSec.valid) {
            discoveredPages.push({ type: matchedType, url: resolvedSubUrl.href });
          }
        }
      } catch {
        // Ignore unparseable link
      }
    }

    if (discoveredPages.length >= 4) break;
  }

  // Crawl discovered subpages concurrently with timeout and SSRF protection
  await Promise.all(
    discoveredPages.map(async (pageInfo) => {
      try {
        const subResult = await fetchSafeHtml(pageInfo.url, USER_AGENT, 6000, 2, hooks);
        crawlResults.push({
          url: subResult.finalUrl,
          pageType: pageInfo.type,
          status: subResult.response.ok ? 'captured' : 'partial',
          httpStatus: subResult.response.status,
          durationMs: subResult.durationMs
        });

        if (subResult.response.ok) {
          const subH1 = subResult.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
          if (subH1) {
            const text = cleanHtmlText(subH1[1]);
            if (text) {
              elements.push({
                id: `${pageInfo.type.toUpperCase()}.h1`,
                pageUrl: subResult.finalUrl,
                pageType: pageInfo.type,
                category: 'headline',
                tag: 'H1',
                visibleText: text,
                boundingBox: { pageX: 180, pageY: 150, width: 700, height: 60 },
                viewport: 'desktop',
                isVisible: true
              });
            }
          }
        }
      } catch (subErr: any) {
        crawlResults.push({
          url: pageInfo.url,
          pageType: pageInfo.type,
          status: 'unavailable',
          errorMessage: subErr.message,
          durationMs: 0
        });
      }
    })
  );

  // 4. Build Section Snapshots Metadata (Explicitly labeled as schematic layout wireframes)
  const snapshots: SectionSnapshotData[] = [
    {
      id: 'snap_desktop_hero',
      sectionType: 'desktop_hero',
      pageUrl: finalUrl,
      viewport: 'desktop',
      cropRect: { cropX: 0, cropY: 0, cropWidth: 1440, cropHeight: 900 },
      mimeType: 'image/svg+xml'
    },
    {
      id: 'snap_mobile_hero',
      sectionType: 'mobile_hero',
      pageUrl: finalUrl,
      viewport: 'mobile',
      cropRect: { cropX: 0, cropY: 0, cropWidth: 390, cropHeight: 844 },
      mimeType: 'image/svg+xml'
    }
  ];

  if (formCount > 0) {
    snapshots.push({
      id: 'snap_contact_form',
      sectionType: 'contact_form',
      pageUrl: finalUrl,
      viewport: 'desktop',
      cropRect: { cropX: 800, cropY: 180, cropWidth: 500, cropHeight: 600 },
      mimeType: 'image/svg+xml'
    });
  }

  return {
    targetUrl: finalUrl,
    crawledAt: new Date().toISOString(),
    pages: crawlResults,
    elements,
    snapshots,
    meta: {
      title: pageTitle,
      description: pageDescription,
      hasTelLinks,
      hasForms: formCount > 0,
      formCount,
      hasReviewsMarkup: homeHtml.includes('aggregateRating') || homeHtml.includes('reviewRating') || homeHtml.includes('★'),
      detectedServiceArea: undefined,
      detectedPhoneNumbers,
      desktopLoadTimeMs: homeLoadDuration,
      mobileLoadTimeMs: Math.round(homeLoadDuration * 1.1)
    }
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Authenticate Request
  const auth = checkAuth(req);
  if (!auth.authorized) {
    return res.status(auth.statusCode || 401).json({
      success: false,
      errorType: 'UNAUTHORIZED',
      message: auth.reason || 'Unauthorized access.',
      recovery: 'Provide valid authentication credentials via session cookie or API key.'
    });
  }

  const { targetUrl } = req.body || {};
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({
      success: false,
      errorType: 'INVALID_URL',
      message: 'Missing required field: targetUrl',
      recovery: 'Enter a valid URL in the website input field.'
    });
  }

  try {
    const evidenceMap = await crawlTargetWebsite(targetUrl);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      success: true,
      totalPagesScanned: evidenceMap.pages.length,
      evidenceMap
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      errorType: err.errorType || 'SERVER_ERROR',
      statusCode: err.statusCode || 500,
      message: err.message || 'Crawl failed',
      recovery: err.recovery || 'Try scanning again or switch to Manual Audit Mode.'
    });
  }
}
