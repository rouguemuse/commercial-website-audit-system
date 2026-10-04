import crypto from 'crypto';

export interface ApiRequest {
  method?: string;
  url?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => ApiResponse;
  setHeader: (name: string, value: string | string[]) => ApiResponse | void;
  end: () => void;
}

const SESSION_COOKIE_NAME = 'audit_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

// Rate limiting: In-memory sliding window for login attempts per IP
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}
const loginRateLimitMap = new Map<string, RateLimitEntry>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function getClientIp(req: ApiRequest): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    loginRateLimitMap.set(ip, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  entry.attempts += 1;
  return true;
}

// Origin validation for CSRF defense on state-changing requests
export function validateCsrfOrigin(req: ApiRequest): boolean {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const host = req.headers['host'];

  if (!host) return true; // Cannot validate if host header absent

  const targetHost = (typeof host === 'string' ? host : host[0]).toLowerCase();

  if (typeof origin === 'string') {
    try {
      const originUrl = new URL(origin);
      return originUrl.host.toLowerCase() === targetHost;
    } catch {
      return false;
    }
  }

  if (typeof referer === 'string') {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host.toLowerCase() === targetHost;
    } catch {
      return false;
    }
  }

  // If Sec-Fetch-Site is present, reject cross-site
  const fetchSite = req.headers['sec-fetch-site'];
  if (typeof fetchSite === 'string' && fetchSite === 'cross-site') {
    return false;
  }

  return true;
}

// Sign stateless token: v1.{expTimestamp}.{nonce}.{hmac}
export function createSessionToken(secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `v1.${exp}.${nonce}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

// Verify stateless token using timing-safe comparison
export function verifySessionToken(token: string, secret: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return false;

  const exp = parseInt(parts[1], 10);
  if (isNaN(exp) || Math.floor(Date.now() / 1000) > exp) {
    return false; // Expired
  }

  const payload = `v1.${parts[1]}.${parts[2]}`;
  const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const providedHmac = parts[3];

  if (expectedHmac.length !== providedHmac.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expectedHmac, 'utf-8'), Buffer.from(providedHmac, 'utf-8'));
}

export function parseCookies(cookieHeader: string | string[] | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const str = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  const list: Record<string, string> = {};
  str.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return list;
}

export function verifySessionCookie(req: ApiRequest, secret: string): boolean {
  const cookies = parseCookies(req.headers['cookie']);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return false;
  return verifySessionToken(token, secret);
}

// General auth check helper for API endpoints
export function checkApiAuth(req: ApiRequest): { authorized: boolean; reason?: string; statusCode?: number } {
  const secret = process.env.AUDIT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!secret) {
    if (isProduction) {
      return {
        authorized: false,
        statusCode: 503,
        reason: 'Service Unavailable: AUDIT_SECRET is not configured on this production server.'
      };
    }
    // Open in development
    return { authorized: true };
  }

  // 1. Check programmatic header: x-audit-key
  const auditKeyHeader = req.headers['x-audit-key'];
  const auditKey = typeof auditKeyHeader === 'string' ? auditKeyHeader : (Array.isArray(auditKeyHeader) ? auditKeyHeader[0] : null);
  if (auditKey && auditKey.length === secret.length) {
    if (crypto.timingSafeEqual(Buffer.from(auditKey, 'utf-8'), Buffer.from(secret, 'utf-8'))) {
      return { authorized: true };
    }
  }

  // 2. Check programmatic header: Authorization: Bearer <key>
  const authHeader = req.headers['authorization'];
  const authVal = typeof authHeader === 'string' ? authHeader : (Array.isArray(authHeader) ? authHeader[0] : null);
  if (authVal && authVal.startsWith('Bearer ')) {
    const bearerKey = authVal.slice(7).trim();
    if (bearerKey.length === secret.length) {
      if (crypto.timingSafeEqual(Buffer.from(bearerKey, 'utf-8'), Buffer.from(secret, 'utf-8'))) {
        return { authorized: true };
      }
    }
  }

  // 3. Check stateless browser session cookie
  if (verifySessionCookie(req, secret)) {
    // For cookie-authenticated requests, enforce CSRF origin validation on POST
    if (req.method === 'POST' && !validateCsrfOrigin(req)) {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'Forbidden: Cross-site request rejected.'
      };
    }
    return { authorized: true };
  }

  return {
    authorized: false,
    statusCode: 401,
    reason: 'Unauthorized: Valid session or API key required.'
  };
}

// Main handler for /api/auth routes
export default async function authHandler(req: ApiRequest, res: ApiResponse) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = process.env.AUDIT_SECRET;
  const method = (req.method || 'GET').toUpperCase();
  const url = req.url || '';

  // Handle /api/auth/status
  if (url.includes('/status') || (method === 'GET')) {
    if (!secret) {
      return res.status(200).json({
        authRequired: isProduction,
        authenticated: !isProduction,
        productionConfigured: !isProduction
      });
    }

    const isAuthed = verifySessionCookie(req, secret);
    return res.status(200).json({
      authRequired: true,
      authenticated: isAuthed,
      productionConfigured: true
    });
  }

  // Handle /api/auth/login
  if (url.includes('/login') || (method === 'POST' && !url.includes('/logout'))) {
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too many login attempts. Please try again later.'
      });
    }

    // CSRF check on login
    if (!validateCsrfOrigin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid request origin.'
      });
    }

    if (!secret) {
      if (isProduction) {
        return res.status(503).json({
          success: false,
          error: 'Service Unavailable: Server is not configured with an AUDIT_SECRET.'
        });
      }
      return res.status(200).json({ success: true, message: 'Open development mode.' });
    }

    const providedSecret = req.body?.secret || req.body?.password;
    if (typeof providedSecret !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload.'
      });
    }

    // Timing-safe secret verification
    let match = false;
    if (providedSecret.length === secret.length) {
      match = crypto.timingSafeEqual(Buffer.from(providedSecret, 'utf-8'), Buffer.from(secret, 'utf-8'));
    }

    if (!match) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }

    // Reset rate limiter on successful authentication
    loginRateLimitMap.delete(clientIp);

    // Create stateless signed session token
    const token = createSessionToken(secret);
    const isHttps = req.headers['x-forwarded-proto'] === 'https' || (req.socket as any)?.encrypted;
    const isLocalhost = (req.headers['host'] || '').includes('localhost') || (req.headers['host'] || '').includes('127.0.0.1');
    const secureFlag = (isProduction && (isHttps || !isLocalhost)) ? '; Secure' : '';
    const cookieHeader = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secureFlag}`;

    res.setHeader('Set-Cookie', cookieHeader);
    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully.'
    });
  }

  // Handle /api/auth/logout
  if (url.includes('/logout') || method === 'DELETE') {
    const isHttps = req.headers['x-forwarded-proto'] === 'https' || (req.socket as any)?.encrypted;
    const isLocalhost = (req.headers['host'] || '').includes('localhost') || (req.headers['host'] || '').includes('127.0.0.1');
    const secureFlag = (isProduction && (isHttps || !isLocalhost)) ? '; Secure' : '';
    const clearCookie = `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
    res.setHeader('Set-Cookie', clearCookie);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  return res.status(404).json({ error: 'Not found' });
}
