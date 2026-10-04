# Commercial Website Audit System

> **A turnkey, white-label website audit platform built for digital agencies, consultants, and developers.**  
> Enter a website URL, scan up to 5 pages, view evidence-backed findings, apply your agency's branding, and export polished client-facing PDF reports.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev/)

---

## ✨ Key Features

- **Multi-Page Web Crawler**: Fast, concurrent page crawling (up to 5 pages) extracting titles, meta descriptions, headings (H1/H2), images, performance signals, and structured DOM data.
- **Evidence-Backed Findings**: Every recommendation is backed by observed evidence, exact element selectors, and schematics.
- **6-Field Recommendation Standard**:
  1. Title / Problem Summary
  2. Location / Target URL & Element
  3. Business Impact
  4. Actionable Fix / Recommendation
  5. Priority Level (`Critical`, `High Impact`, `Improvement`)
  6. Estimated Effort / Complexity (`Low`, `Medium`, `High`)
- **Executive Summary for Business Owners**: Clean high-level scorecard with overall health score, key metrics, and prioritized action items.
- **White-Label Agency Branding**: Customize agency name, logo, brand colors, contact email, phone number, and report footer.
- **Multi-Format Exports**:
  - 📄 **Branded PDF Report**: Client-ready executive report with print-optimized styling.
  - 📊 **CSV Export**: Clean spreadsheet export with standardized headers.
  - 💾 **JSON Export**: Raw structured data for CRM or custom automation pipelines.
- **Instant Demo Mode**: Pre-loaded with a realistic sample audit so buyers and clients can test the complete workflow immediately.
- **Local-First Privacy**: Audits and agency profiles are stored locally in the browser via **IndexedDB** (`WebsiteAuditSystemDB`). Complete backup and restore functionality built in.
- **Hardened Security Architecture**:
  - Full SSRF protection blocking private IPs, link-local, loopback, cloud metadata (AWS/GCP/Azure), and DNS rebinding attacks.
  - Stateless HMAC-SHA256 signed `HttpOnly`, `SameSite=Strict` cookie sessions.
  - Origin & CSRF validation for state-changing endpoints.
  - Sliding-window rate limiting on authentication routes.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher

### 1. Clone & Install
```bash
git clone https://github.com/rouguemuse/commercial-website-audit-system.git
cd commercial-website-audit-system
npm install
```

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```

| Variable | Description | Default / Required |
| :--- | :--- | :--- |
| `AUDIT_SECRET` | Secret key protecting crawler & analysis APIs in production | Optional in dev, Recommended in production |
| `GEMINI_API_KEY` | Google Gemini API key for AI-assisted audit summaries | Optional (offline heuristics used if omitted) |
| `AUDIT_MODEL` | AI model identifier | `gemini-1.5-flash` |
| `PORT` | Local Express server port | `3000` |

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Build & Production

### Production Build
```bash
npm run build
```
This builds:
1. Client bundle into `dist/` (via Vite)
2. Serverless API handlers into `dist-api/` (via TypeScript)

### Start Production Server
```bash
npm start
```
Starts the standalone Express production server at [http://localhost:3000](http://localhost:3000).

---

## 🚢 Deployment Options

### Option 1: Vercel (Recommended)
This repository includes a ready-to-deploy [`vercel.json`](vercel.json) configuration:
1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set your environment variables (`AUDIT_SECRET`, `GEMINI_API_KEY` if desired).
4. Click **Deploy**. Vercel will automatically configure serverless functions under `/api/*` and serve static assets under `dist/`.

### Option 2: Docker
Build and run the self-contained container:
```bash
docker build -t commercial-website-audit .
docker run -p 3000:3000 -e AUDIT_SECRET="your-secure-secret" commercial-website-audit
```

### Option 3: Traditional VPS / Node.js
```bash
npm run build
NODE_ENV=production AUDIT_SECRET="your-secret" node server.mjs
```

---

## 🧪 Testing & Verification

Run the security and integration test suites:
```bash
# SSRF & Outbound Network Security Test Suite
npx tsx scripts/test-ssrf-live-integration.ts

# Stateless Cookie Authentication & CSRF Test Suite
PORT=3005 npx tsx scripts/test-auth-integration.ts
```

---

## 📁 Project Architecture

```
commercial-website-audit-system/
├── api/                        # Serverless API endpoints
│   ├── auth.ts                 # Stateless cookie auth, CSRF validation, rate limiting
│   ├── crawler.ts              # Multi-page web crawler with hardened SSRF filter
│   └── analyze.ts              # Diagnostic analysis & DOM heuristic engine
├── src/                        # Client-side React 18 application
│   ├── components/             # UI components (Header, AuditWizard, ReportView, etc.)
│   ├── db/                     # Dexie / IndexedDB local database layer
│   ├── services/               # API clients & PDF generation services
│   ├── styles/                 # Tailwind / CSS styles
│   └── types/                  # TypeScript interface definitions
├── scripts/                    # Test suites & verification scripts
├── Dockerfile                  # Production container definition
├── server.mjs                  # Standalone Express production server
├── vercel.json                 # Vercel deployment configuration
└── SECURITY.md                 # Security architecture documentation
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
