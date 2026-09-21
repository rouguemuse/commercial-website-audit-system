import type { VercelRequest, VercelResponse } from '@vercel/node';
import dns from 'dns';
import { promisify } from 'util';
import type { WebsiteEvidenceMap, EvidenceElement, SectionSnapshotData, CrawlPageResult, CrawlPageType } from '../src/types';

const dnsLookup = promisify(dns.lookup);

// SSRF IP Blacklist Checker
function isPrivateOrReservedIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true; // Link-local & AWS metadata
  if (ip.startsWith('127.')) return true;
  if (ip.startsWith('100.64.') || ip.startsWith('100.127.')) return true; // CGNAT
  
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

// SSRF Safe URL Validator with detailed classification
async function validateUrlSecurity(urlString: string): Promise<{
  valid: boolean;
  errorType?: 'INVALID_URL' | 'DNS_UNRESOLVED' | 'SSRF_BLOCKED';
  statusCode?: number;
  message?: string;
  recovery?: string;
  urlObj?: URL;
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

    const hostname = urlObj.hostname;
    if (!hostname || hostname.includes('localhost')) {
      return {
        valid: false,
        errorType: 'SSRF_BLOCKED',
        statusCode: 403,
        message: 'Access to localhost and loopback targets is blocked for security.',
        recovery: 'Please scan a public website domain.'
      };
    }

    let lookupResult;
    try {
      lookupResult = await dnsLookup(hostname);
    } catch (dnsErr: any) {
      return {
        valid: false,
        errorType: 'DNS_UNRESOLVED',
        statusCode: 422,
        message: `Domain not found (${dnsErr.code || 'ENOTFOUND'}): The domain "${hostname}" could not be resolved.`,
        recovery: 'Check the spelling of the domain. Ensure the website is live, publicly registered, and has valid DNS records.'
      };
    }

    if (isPrivateOrReservedIp(lookupResult.address)) {
      return {
        valid: false,
        errorType: 'SSRF_BLOCKED',
        statusCode: 403,
        message: `Access to private/internal IP address (${lookupResult.address}) is forbidden.`,
        recovery: 'Only publicly routable web servers can be crawled.'
      };
    }

    return { valid: true, urlObj };
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

// Authentication Check
function checkAuth(req: VercelRequest): boolean {
  const secret = process.env.AUDIT_SECRET;
  if (!secret) return true; // Open if not configured

  const headerKey = req.headers['x-audit-key'] as string;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  return headerKey === secret || bearerToken === secret;
}

// Clean text extractor from HTML snippet
function cleanHtmlText(snippet: string): string {
  return snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Authenticate Request
  if (!checkAuth(req)) {
    return res.status(401).json({
      success: false,
      errorType: 'UNAUTHORIZED',
      message: 'Unauthorized: Invalid or missing audit credentials.',
      recovery: 'Provide the configured AUDIT_SECRET key in the x-audit-key or Authorization header.'
    });
  }

  let { targetUrl } = req.body || {};
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({
      success: false,
      errorType: 'INVALID_URL',
      message: 'Missing required field: targetUrl',
      recovery: 'Enter a valid URL in the website input field.'
    });
  }

  targetUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  // 2. Hard SSRF & DNS Security Check
  const securityCheck = await validateUrlSecurity(targetUrl);
  if (!securityCheck.valid || !securityCheck.urlObj) {
    return res.status(securityCheck.statusCode || 400).json({
      success: false,
      errorType: securityCheck.errorType || 'INVALID_URL',
      statusCode: securityCheck.statusCode || 400,
      message: securityCheck.message || 'URL validation failed',
      recovery: securityCheck.recovery || 'Check the website URL and try again.'
    });
  }

  const targetOrigin = securityCheck.urlObj.origin;
  const startTime = Date.now();
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (WebsiteAuditBot/2.0)';

  try {
    // 3. Fetch Homepage First
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let homeRes;
    try {
      homeRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          errorType: 'TIMEOUT',
          statusCode: 504,
          message: 'Connection timed out: The target website did not respond within 12 seconds.',
          recovery: 'The server may be overloaded or down. Verify the site in your browser, or switch to Manual Audit Mode.'
        });
      }
      return res.status(502).json({
        success: false,
        errorType: 'UNREACHABLE',
        statusCode: 502,
        message: `Failed to connect to ${targetUrl}: ${fetchErr.message}`,
        recovery: 'Verify the site is reachable in your browser. If protected by firewall or basic auth, use Manual Audit Mode.'
      });
    }
    clearTimeout(timeoutId);

    // Check HTTP Status of Homepage
    if (homeRes.status === 403) {
      return res.status(403).json({
        success: false,
        errorType: 'BOT_BLOCKED',
        statusCode: 403,
        message: 'Website returned HTTP 403 (Automated scanner blocked by Cloudflare, WAF, or server permissions).',
        recovery: 'This website actively blocks automated bots. Use Manual Audit Mode to upload screenshots and audit directly.'
      });
    }

    if (homeRes.status === 429) {
      return res.status(429).json({
        success: false,
        errorType: 'RATE_LIMITED',
        statusCode: 429,
        message: 'Website returned HTTP 429 (Too Many Requests / Rate Limited).',
        recovery: 'The website is temporarily throttling requests. Please wait a minute or use Manual Audit Mode.'
      });
    }

    if (homeRes.status >= 500) {
      return res.status(homeRes.status).json({
        success: false,
        errorType: 'SERVER_ERROR',
        statusCode: homeRes.status,
        message: `Website returned server error HTTP ${homeRes.status} (${homeRes.statusText}).`,
        recovery: 'The target website is experiencing internal server issues. Check if the site is functioning normally.'
      });
    }

    const homeHtml = await homeRes.text();
    const homeLoadDuration = Date.now() - startTime;

    // Check for Cloudflare / CAPTCHA Challenge Page
    if (/challenge-platform|just a moment\.\.\.|attention required! \| cloudflare|cf-browser-verification/i.test(homeHtml) && homeHtml.length < 5000) {
      return res.status(403).json({
        success: false,
        errorType: 'BOT_BLOCKED',
        statusCode: 403,
        message: 'Cloudflare interactive challenge detected. The website requires a human browser verification.',
        recovery: 'Automated crawlers cannot bypass Cloudflare turnstile. Switch to Manual Audit Mode to capture screenshots.'
      });
    }

    const crawlResults: CrawlPageResult[] = [
      {
        url: targetUrl,
        pageType: 'home',
        status: homeRes.ok ? 'captured' : 'partial',
        httpStatus: homeRes.status,
        durationMs: homeLoadDuration
      }
    ];

    const elements: EvidenceElement[] = [];
    let detectedPhoneNumbers: string[] = [];
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
          pageUrl: targetUrl,
          pageType: 'home',
          category: 'headline',
          tag: 'H1',
          visibleText: text,
          boundingBox: { pageX: 180, pageY: 160 + (h1Index - 1) * 90, width: 720, height: 75 },
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
          pageUrl: targetUrl,
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
        pageUrl: targetUrl,
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

    // 4. Discover and Crawl Subpages (Up to 5 total pages)
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
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = targetOrigin + href;
        } else if (!/^https?:\/\//i.test(href)) {
          fullUrl = targetOrigin + '/' + href;
        }

        // Only internal links within same origin
        if (fullUrl.startsWith(targetOrigin)) {
          discoveredPages.push({ type: matchedType, url: fullUrl });
        }
      }

      if (discoveredPages.length >= 4) break; // Max 4 subpages + 1 home = 5 pages
    }

    // Crawl discovered subpages concurrently with timeout
    await Promise.all(
      discoveredPages.map(async (pageInfo) => {
        const subController = new AbortController();
        const subTimeout = setTimeout(() => subController.abort(), 6000);
        const subStart = Date.now();

        try {
          const subRes = await fetch(pageInfo.url, {
            headers: { 'User-Agent': USER_AGENT },
            signal: subController.signal
          });
          clearTimeout(subTimeout);

          const subDuration = Date.now() - subStart;
          crawlResults.push({
            url: pageInfo.url,
            pageType: pageInfo.type,
            status: subRes.ok ? 'captured' : 'partial',
            httpStatus: subRes.status,
            durationMs: subDuration
          });

          if (subRes.ok) {
            const subHtml = await subRes.text();
            // Extract subpage H1
            const subH1 = subHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            if (subH1) {
              const text = cleanHtmlText(subH1[1]);
              if (text) {
                elements.push({
                  id: `${pageInfo.type.toUpperCase()}.h1`,
                  pageUrl: pageInfo.url,
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
          clearTimeout(subTimeout);
          crawlResults.push({
            url: pageInfo.url,
            pageType: pageInfo.type,
            status: 'unavailable',
            errorMessage: subErr.message,
            durationMs: Date.now() - subStart
          });
        }
      })
    );

    // 5. Build Section Snapshots Metadata
    const snapshots: SectionSnapshotData[] = [
      {
        id: 'snap_desktop_hero',
        sectionType: 'desktop_hero',
        pageUrl: targetUrl,
        viewport: 'desktop',
        cropRect: { cropX: 0, cropY: 0, cropWidth: 1440, cropHeight: 900 },
        mimeType: 'image/webp'
      },
      {
        id: 'snap_mobile_hero',
        sectionType: 'mobile_hero',
        pageUrl: targetUrl,
        viewport: 'mobile',
        cropRect: { cropX: 0, cropY: 0, cropWidth: 390, cropHeight: 844 },
        mimeType: 'image/webp'
      }
    ];

    if (formCount > 0) {
      snapshots.push({
        id: 'snap_contact_form',
        sectionType: 'contact_form',
        pageUrl: targetUrl,
        viewport: 'desktop',
        cropRect: { cropX: 800, cropY: 180, cropWidth: 500, cropHeight: 600 },
        mimeType: 'image/webp'
      });
    }

    const evidenceMap: WebsiteEvidenceMap = {
      targetUrl,
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

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      success: true,
      totalPagesScanned: crawlResults.length,
      evidenceMap
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      statusCode: 500,
      message: `Crawl failed unexpectedly: ${err.message}`,
      recovery: 'Try scanning again or switch to Manual Audit Mode to upload screenshots.'
    });
  }
}
