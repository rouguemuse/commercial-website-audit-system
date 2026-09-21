import type {
  Audit,
  AuditAsset,
  AuditFindingItem,
  AuditTeaserConfig,
  PreliminaryAssessmentStatus,
  TeaserWorkflowStatus
} from '../types';

export function generateDefaultTeaserConfig(
  audit: Audit,
  assets: AuditAsset[]
): AuditTeaserConfig {
  const findings = audit.findings || [];
  const fixFirstFindings = findings.filter(f => f.tier === 'fix_first');
  const selectedFindings = (fixFirstFindings.length > 0 ? fixFirstFindings : findings).slice(0, 2);

  // Find source of truth asset
  const sourceAsset = assets.find(a => a.type === 'source_of_truth') || assets[0];
  const selectedPinIds = sourceAsset ? (sourceAsset.pins || []).slice(0, 3).map(p => p.id) : [];

  // Determine qualitative assessment status without revealing raw score
  let preliminaryAssessment: PreliminaryAssessmentStatus = 'Needs Attention';
  if (fixFirstFindings.length >= 2) {
    preliminaryAssessment = 'Needs Attention';
  } else if (fixFirstFindings.length === 1) {
    preliminaryAssessment = 'Clear Friction Detected';
  } else if (findings.length > 0) {
    preliminaryAssessment = 'Growth Opportunities Identified';
  } else {
    preliminaryAssessment = 'Solid Baseline';
  }

  // Derive concise primary pattern friction sentence
  let primaryPatternTitle = 'Core Offer Ambiguity & Action Friction';
  let primaryPatternFriction = 'Visitors have to work too hard to understand the offer and take action.';

  const allFindingText = selectedFindings.map(f => f.finding).join(' ').toLowerCase();
  if (allFindingText.includes('interpretation') || allFindingText.includes('headline') || allFindingText.includes('offer')) {
    primaryPatternTitle = 'Core Offer Ambiguity';
    primaryPatternFriction = 'Primary friction: Visitors have to work too hard to understand what you actually do above the fold.';
  } else if (allFindingText.includes('competing') || allFindingText.includes('action') || allFindingText.includes('form')) {
    primaryPatternTitle = 'Conversion Path Friction';
    primaryPatternFriction = 'Primary friction: Multiple equal-weight actions and inquiry friction stall motivated buyers.';
  } else if (allFindingText.includes('proof') || allFindingText.includes('reviews')) {
    primaryPatternTitle = 'Buried Credibility';
    primaryPatternFriction = 'Primary friction: Strong customer proof and credibility signals are hidden away from decision moments.';
  }

  // Generate concise Before -> Direction example
  let exampleDirection = {
    current: 'Abstract slogans or competing buttons above the fold.',
    recommendedDirection: 'Lead directly with the specific service, target customer, and concrete outcome.'
  };

  if (selectedFindings[0]?.exampleImprovement) {
    const parts = selectedFindings[0].exampleImprovement.split(/→|->/);
    if (parts.length >= 2) {
      exampleDirection = {
        current: parts[0].replace(/before:?/i, '').trim().replace(/^["']|["']$/g, ''),
        recommendedDirection: parts[1].replace(/after:?/i, '').trim().replace(/^["']|["']$/g, '')
      };
    }
  }

  return {
    status: 'generated',
    preliminaryAssessment,
    primaryPatternTitle,
    primaryPatternFriction,
    selectedFindingIds: selectedFindings.map(f => f.id),
    selectedAssetId: sourceAsset?.id,
    selectedPinIds,
    exampleDirection,
    ctaOffer: {
      name: 'Website Conversion Checkup',
      price: '$99',
      tagline: 'Get the complete 30-point diagnostic + prioritized fix schedule.',
      ctaLink: 'https://www.contextmuse.com/custom/'
    },
    generatedAt: new Date().toISOString()
  };
}

export function exportStandaloneTeaserHtml(
  audit: Audit,
  asset?: AuditAsset,
  config?: AuditTeaserConfig
): string {
  const teaser = config || audit.teaserConfig || generateDefaultTeaserConfig(audit, asset ? [asset] : []);
  const selectedFindings = (audit.findings || []).filter(f => teaser.selectedFindingIds.includes(f.id));
  const pins = asset ? (asset.pins || []).filter(p => teaser.selectedPinIds.includes(p.id)) : [];

  const businessName = audit.businessName || 'Your Business';
  const websiteUrl = audit.websiteUrl || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preliminary Website Review — ${businessName}</title>
  <style>
    :root {
      --bg: #FAFAF7;
      --card-bg: #FFFFFF;
      --text: #1C1D1B;
      --text-muted: #5C6059;
      --border: #E5E7EB;
      --primary: #0F5B5C;
      --primary-dark: #093E3F;
      --accent-warm: #C85A32;
      --font-serif: "Newsreader", Georgia, Cambria, serif;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .teaser-wrapper {
      max-width: 680px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 44px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
    }
    .meta-tag {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .headline-area {
      margin-bottom: 28px;
    }
    .target-title {
      font-family: var(--font-serif);
      font-size: 1.85rem;
      font-weight: 400;
      line-height: 1.25;
      color: var(--text);
      margin-bottom: 6px;
    }
    .target-url {
      font-size: 0.9rem;
      color: var(--text-muted);
      word-break: break-all;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F4F6F4;
      border: 1px solid #D6E0D6;
      color: var(--primary-dark);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      margin-top: 12px;
      letter-spacing: 0.02em;
    }
    .pattern-card {
      background: #F8FAFA;
      border-left: 3px solid var(--primary);
      padding: 16px 20px;
      margin-bottom: 32px;
      border-radius: 0 4px 4px 0;
    }
    .pattern-card h3 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary-dark);
      margin-bottom: 4px;
    }
    .pattern-card p {
      font-size: 0.92rem;
      color: var(--text);
    }
    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .finding-block {
      border-bottom: 1px solid #F0F2F0;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .finding-block:last-child {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 28px;
    }
    .finding-heading {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 6px;
    }
    .evidence-quote {
      font-size: 0.88rem;
      color: var(--text-muted);
      background: #F9FAFB;
      border-left: 2px solid #D1D5DB;
      padding: 6px 12px;
      margin: 8px 0;
      font-style: italic;
    }
    .consequence-text {
      font-size: 0.9rem;
      color: var(--text);
    }
    .visual-proof-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      background: #FAFAF9;
      margin-bottom: 28px;
    }
    .visual-proof-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 10px;
    }
    .pins-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .pins-list li {
      font-size: 0.85rem;
      color: var(--text-muted);
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .pin-num {
      background: var(--accent-warm);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .direction-card {
      background: #FFFFFF;
      border: 1px dashed var(--border);
      border-radius: 6px;
      padding: 18px 20px;
      margin-bottom: 32px;
    }
    .direction-row {
      font-size: 0.88rem;
      margin-bottom: 6px;
    }
    .direction-row:last-child { margin-bottom: 0; }
    .direction-label {
      font-weight: 600;
      color: var(--text-muted);
      display: inline-block;
      width: 80px;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
    .cta-box {
      background: #F4F7F6;
      border: 1px solid #DCE6E5;
      border-radius: 6px;
      padding: 24px;
      text-align: center;
      margin-top: 32px;
    }
    .cta-box h4 {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 400;
      color: var(--text);
      margin-bottom: 6px;
    }
    .cta-box p {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .cta-button {
      display: inline-block;
      background: var(--primary);
      color: #FFFFFF;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 10px 22px;
      border-radius: 4px;
      transition: background 0.15s ease;
    }
    .cta-button:hover {
      background: var(--primary-dark);
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .teaser-wrapper { border: none; box-shadow: none; padding: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="teaser-wrapper">
    <div class="brand-header">
      <div class="brand-title">Context &amp; Muse</div>
      <div class="meta-tag">Preliminary Website Review</div>
    </div>

    <div class="headline-area">
      <h1 class="target-title">${businessName}</h1>
      <div class="target-url">${websiteUrl}</div>
      <div class="status-badge">
        <span>Preliminary Assessment:</span>
        <span>${teaser.preliminaryAssessment}</span>
      </div>
    </div>

    <div class="pattern-card">
      <h3>${teaser.primaryPatternTitle}</h3>
      <p>${teaser.primaryPatternFriction}</p>
    </div>

    <div class="section-title">Key Observations (2 Areas Max)</div>

    ${selectedFindings.map((f, i) => `
    <div class="finding-block">
      <div class="finding-heading">${i + 1}. ${f.finding}</div>
      <div class="evidence-quote">Observed on page: "${f.whyItMatters.split('.')[0]}."</div>
      <div class="consequence-text">${f.whyItMatters}</div>
    </div>
    `).join('')}

    ${pins.length > 0 ? `
    <div class="visual-proof-card">
      <div class="visual-proof-title">Marked on Actual Website Screenshot (${pins.length} Locations)</div>
      <ul class="pins-list">
        ${pins.map(p => `
          <li>
            <span class="pin-num">${p.number}</span>
            <span><strong>${p.title}:</strong> ${p.description}</span>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="direction-card">
      <div class="direction-row">
        <span class="direction-label">Current:</span>
        <span>"${teaser.exampleDirection.current}"</span>
      </div>
      <div class="direction-row" style="margin-top: 6px;">
        <span class="direction-label" style="color: var(--primary);">Direction:</span>
        <span><strong>${teaser.exampleDirection.recommendedDirection}</strong></span>
      </div>
    </div>

    <div class="cta-box">
      <h4>Want the full 30-point diagnosis?</h4>
      <p>${teaser.ctaOffer.tagline}</p>
      <a href="${teaser.ctaOffer.ctaLink}" class="cta-button">
        ${teaser.ctaOffer.name} &mdash; ${teaser.ctaOffer.price} &rarr;
      </a>
    </div>
  </div>
</body>
</html>`;
}
