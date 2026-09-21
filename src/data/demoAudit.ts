import type { Audit, AuditAsset, MasterFramework } from '../types';

export function createFictionalDemoAudit(framework: MasterFramework): { audit: Audit; assets: AuditAsset[] } {
  const auditId = 'demo_audit_apex_commercial';
  const now = new Date().toISOString();
  const sourceAssetId = 'asset_demo_desktop_hero';
  const fixedAssetId = 'asset_demo_fixed_mockup';

  const sourcePins = [
    {
      id: 'demo_pin_1',
      number: 1,
      x: 28,
      y: 22,
      title: 'Vague Hero Slogan',
      description: 'Abstract slogan "Innovative Solutions for Modern Enterprise" obscures commercial HVAC/facility trade.'
    },
    {
      id: 'demo_pin_2',
      number: 2,
      x: 32,
      y: 38,
      title: 'Competing Action Buttons',
      description: 'Three competing CTAs ("Explore Services", "Brochure", "Contact") divide user attention.'
    },
    {
      id: 'demo_pin_3',
      number: 3,
      x: 75,
      y: 12,
      title: 'Unclickable Mobile Phone',
      description: 'Emergency dispatch phone number is plain text with no active tel: link.'
    },
    {
      id: 'demo_pin_4',
      number: 4,
      x: 65,
      y: 82,
      title: 'Social Proof Buried',
      description: 'Customer reviews and OSHA certifications are located below the fold.'
    }
  ];

  const fixedPins = [
    {
      id: 'demo_pin_f1',
      number: 1,
      x: 28,
      y: 20,
      title: 'Clear Trade Headline',
      description: 'Direct trade outcome: "Commercial Facility Maintenance & Fast Dispatch Across the Metro Area."'
    },
    {
      id: 'demo_pin_f2',
      number: 2,
      x: 30,
      y: 36,
      title: 'Single Primary CTA',
      description: 'High-contrast, prominent primary button: "Request Emergency Service / Quote".'
    },
    {
      id: 'demo_pin_f3',
      number: 3,
      x: 30,
      y: 48,
      title: 'Trust & Proof Strip',
      description: 'Prominent social proof: "★ 4.9/5 from 350+ Facilities • OSHA & NATE Certified".'
    },
    {
      id: 'demo_pin_f4',
      number: 4,
      x: 82,
      y: 10,
      title: '1-Tap Mobile Call Bar',
      description: 'Instant click-to-call button with verified tel: dispatch routing.'
    }
  ];

  // SVG-backed mockups
  const svgSource = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
    <rect width="1440" height="900" fill="#0f172a"/>
    <rect x="120" y="40" width="1200" height="820" rx="8" fill="#1e293b"/>
    <!-- Header -->
    <rect x="120" y="40" width="1200" height="80" fill="#0f172a"/>
    <text x="160" y="88" fill="#38bdf8" font-size="24" font-family="sans-serif" font-weight="bold">APEX COMMERCIAL</text>
    <text x="1080" y="88" fill="#94a3b8" font-size="16" font-family="sans-serif">(555) 234-5678 (Plain Text)</text>
    <!-- Hero Section -->
    <rect x="160" y="180" width="600" height="60" fill="#334155" rx="4"/>
    <text x="180" y="220" fill="#f8fafc" font-size="28" font-family="sans-serif" font-weight="bold">Innovative Solutions for Modern Enterprise</text>
    <text x="180" y="270" fill="#94a3b8" font-size="16" font-family="sans-serif">Leading provider of full-scale multi-service commercial excellence.</text>
    <!-- Competing CTAs -->
    <rect x="180" y="320" width="160" height="44" fill="#64748b" rx="4"/>
    <text x="210" y="348" fill="#ffffff" font-size="14" font-family="sans-serif">Explore Services</text>
    <rect x="360" y="320" width="180" height="44" fill="#475569" rx="4"/>
    <text x="385" y="348" fill="#ffffff" font-size="14" font-family="sans-serif">Download Brochure</text>
    <rect x="560" y="320" width="140" height="44" fill="#334155" rx="4"/>
    <text x="590" y="348" fill="#ffffff" font-size="14" font-family="sans-serif">Contact Us</text>
    <!-- Buried proof below fold indicator -->
    <line x1="120" y1="560" x2="1320" y2="560" stroke="#ef4444" stroke-dasharray="6,6" stroke-width="2"/>
    <text x="720" y="585" fill="#ef4444" font-size="14" font-family="sans-serif" text-anchor="middle">THE FOLD (REVIEWS & RATINGS BURIED BELOW)</text>
  </svg>`;

  const svgFixed = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
    <rect width="1440" height="900" fill="#090d16"/>
    <rect x="120" y="40" width="1200" height="820" rx="8" fill="#0f172a"/>
    <!-- Header -->
    <rect x="120" y="40" width="1200" height="80" fill="#090d16"/>
    <text x="160" y="88" fill="#38bdf8" font-size="24" font-family="sans-serif" font-weight="bold">APEX COMMERCIAL</text>
    <rect x="1020" y="60" width="220" height="40" rx="6" fill="#10b981"/>
    <text x="1055" y="86" fill="#ffffff" font-size="15" font-family="sans-serif" font-weight="bold">📞 Tap to Call (24/7)</text>
    <!-- Clear Hero -->
    <text x="180" y="210" fill="#ffffff" font-size="34" font-family="sans-serif" font-weight="800">Commercial Facility Maintenance &amp; HVAC</text>
    <text x="180" y="250" fill="#38bdf8" font-size="22" font-family="sans-serif" font-weight="bold">Guaranteed 2-Hour Regional Dispatch for Critical Systems</text>
    <text x="180" y="290" fill="#94a3b8" font-size="16" font-family="sans-serif">Direct service for property managers, corporate campuses, and multi-location operators.</text>
    <!-- Single High-Contrast CTA -->
    <rect x="180" y="330" width="280" height="52" fill="#2563eb" rx="6"/>
    <text x="210" y="363" fill="#ffffff" font-size="16" font-family="sans-serif" font-weight="bold">Request Immediate Service →</text>
    <!-- Prominent Trust Strip -->
    <rect x="180" y="420" width="700" height="50" fill="#1e293b" rx="6"/>
    <text x="200" y="452" fill="#fbbf24" font-size="16" font-family="sans-serif">★★★★★</text>
    <text x="270" y="452" fill="#cbd5e1" font-size="14" font-family="sans-serif" font-weight="bold">4.9/5 Rating from 350+ Facilities • OSHA &amp; NATE Certified Technicians</text>
  </svg>`;

  const sourceAsset: AuditAsset = {
    id: sourceAssetId,
    auditId,
    type: 'source_of_truth',
    subType: 'desktop_hero',
    title: 'Existing Homepage (Desktop Viewport)',
    caption: 'Current homepage hero with vague messaging and competing buttons',
    notes: 'Observable evidence captured from live desktop viewport.',
    blob: new Blob([svgSource], { type: 'image/svg+xml' }),
    mimeType: 'image/svg+xml',
    filename: 'apex_existing_desktop.svg',
    width: 1440,
    height: 900,
    createdAt: now,
    pins: sourcePins
  };

  const fixedAsset: AuditAsset = {
    id: fixedAssetId,
    auditId,
    type: 'fixed_direction',
    subType: 'desktop_hero',
    title: 'Recommended Conversion Wireframe (Fixed Direction)',
    caption: 'High-converting layout with clear trade headline, single primary action, and social proof trust strip',
    notes: 'Architectural direction designed to eliminate conversion bottlenecks.',
    blob: new Blob([svgFixed], { type: 'image/svg+xml' }),
    mimeType: 'image/svg+xml',
    filename: 'apex_recommended_mockup.svg',
    width: 1440,
    height: 900,
    createdAt: now,
    pins: fixedPins
  };

  // Build scores for all 30 checks
  const scores: Record<string, any> = {};
  framework.checks.forEach(chk => {
    let score = 2;
    let confidence: 'high' | 'medium' | 'low' = 'high';
    let rationale = 'Criteria satisfied.';
    let evidence = 'Observed in DOM.';
    let tags: string[] = [];

    if (chk.number === 1) {
      score = 1;
      rationale = 'The hero headline relies on generic corporate slogans ("Innovative Solutions for Modern Enterprise") requiring visitors to interpret what is sold.';
      evidence = 'H1: "Innovative Solutions for Modern Enterprise"';
      tags = ['Vague', 'Ambiguous', 'Requires interpretation'];
    } else if (chk.number === 2) {
      score = 1;
      rationale = 'Headline communicates abstract capability instead of tangible facility dispatch outcomes.';
      evidence = 'Subheadline: "Leading provider of full-scale multi-service commercial excellence."';
      tags = ['Generic', 'Formulaic phrasing'];
    } else if (chk.number === 10) {
      score = 1;
      rationale = 'No baseline hourly rates, response SLAs, or 3-step dispatch timelines are visible to prospective commercial clients.';
      evidence = 'Service page lists categories but omits turnaround times and pricing tiers.';
      tags = ['Unclear next step', 'Missing pricing'];
    } else if (chk.number === 11) {
      score = 0;
      rationale = 'Multiple competing action buttons ("Explore Services", "Download Brochure", "Contact Us") divide visitor attention with equal visual weight.';
      evidence = 'Three equal buttons above the fold in hero container.';
      tags = ['Competing CTAs', 'Decision paralysis'];
    } else if (chk.number === 16) {
      score = 1;
      rationale = 'Customer testimonials and OSHA safety certifications exist on the site but are buried 1,200px below the initial viewport.';
      evidence = 'Zero review badges or certification logos visible in the hero.';
      tags = ['Buried proof', 'Trust deficit'];
    } else if (chk.number === 24) {
      score = 0;
      rationale = 'Header dispatch phone number is plain text without active tel: link, preventing 1-tap dialing on mobile devices.';
      evidence = 'Phone number: "(555) 234-5678" rendered as unclickable <span> tag.';
      tags = ['Mobile issue', 'Missing tap-to-call'];
    }

    scores[chk.id] = {
      score,
      proposedScore: score,
      confidence,
      validationStatus: 'validated',
      evidenceType: 'structural',
      evidenceSource: 'Live Viewport Inspection',
      evidenceRefs: [],
      rationale,
      evidence,
      effort: score === 0 ? 'High' : score === 1 ? 'Medium' : 'Low',
      tags,
      triggeredDiagnosisIds: []
    };
  });

  const audit: Audit = {
    id: auditId,
    businessName: 'Apex Commercial Services [DEMO AUDIT]',
    websiteUrl: 'https://apexcommercial.example.com',
    industry: 'Commercial Facility Maintenance & HVAC',
    cityServiceArea: 'Metro Area & Regional Business Parks',
    primaryCustomerType: 'Commercial Property Managers & Building Owners',
    desiredAction: 'Request Service / Quote',
    auditorNotes: 'DEMO AUDIT: Representative baseline evaluation of a commercial facility contractor showing key conversion bottlenecks and high-leverage fixes.',
    status: 'Ready',
    frameworkVersion: framework.version,
    frameworkSnapshot: framework,
    scores,
    findings: [
      {
        id: 'demo_finding_1',
        diagnosisId: 'diag_generic_headline',
        checkId: 'chk_1',
        associatedCheckIds: ['chk_1', 'chk_2'],
        tags: ['Clarity', 'Headline', 'Offer'],
        isConsolidated: true,
        tier: 'Critical',
        priority: 'Critical',
        effort: 'Low',
        order: 1,
        finding: 'Primary call-to-action and core offer headline are unclear above the fold',
        evidenceText: 'Hero headline "Innovative Solutions Built for Modern Enterprise" uses abstract slogans without declaring the facility maintenance trade or commercial focus.',
        businessImpact: 'Visitors may leave without inquiring because they cannot determine what the company provides within the first 5 seconds.',
        recommendedAction: 'Rewrite hero to: "Commercial Facility Maintenance & HVAC with Guaranteed 2-Hour Regional Dispatch."',
        whyItMatters: 'Visitors decide in 3–5 seconds whether they are in the right place. Abstract slogans force visitors to guess what the company provides, driving high bounce rates.',
        recommendedFix: 'Upgrade to a high-converting headline stating the exact service, target audience, and tangible outcome.',
        exampleImprovement: 'Before: "Innovative Solutions Built for Modern Enterprise" → After: "Commercial Facility Maintenance & HVAC with Guaranteed 2-Hour Dispatch."',
        customClientNotes: 'High-impact quick win with low development complexity.',
        pinnedAssetId: fixedAssetId
      },
      {
        id: 'demo_finding_2',
        diagnosisId: 'diag_competing_ctas',
        checkId: 'chk_11',
        associatedCheckIds: ['chk_11', 'chk_12'],
        tags: ['Action', 'CTA', 'Friction'],
        isConsolidated: true,
        tier: 'High Impact',
        priority: 'High Impact',
        effort: 'Low',
        order: 2,
        finding: 'Three competing action buttons appear in the header and hero with equal visual weight',
        evidenceText: 'Buttons for "Explore Services", "Download Corporate Brochure", and "Contact Us" fight for attention above the fold.',
        businessImpact: 'Corporate facility managers seeking urgent dispatch experience decision friction and bounce.',
        recommendedAction: 'Consolidate competing options into one high-contrast primary "Request Immediate Service" button and move the brochure to the footer.',
        whyItMatters: 'When presented with multiple equal choices and passive links (Explore, Learn More), visitors experience analysis paralysis.',
        recommendedFix: 'Establish ONE high-contrast primary conversion action paired with a low-friction intake path.',
        exampleImprovement: 'Consolidate competing options into a single high-contrast primary "Request Immediate Service" button.',
        customClientNotes: '',
        pinnedAssetId: fixedAssetId
      },
      {
        id: 'demo_finding_3',
        diagnosisId: 'diag_missing_social_proof',
        checkId: 'chk_16',
        associatedCheckIds: ['chk_16', 'chk_17'],
        tags: ['Trust', 'Reviews', 'Social Proof'],
        isConsolidated: true,
        tier: 'High Impact',
        priority: 'High Impact',
        effort: 'Medium',
        order: 3,
        finding: 'Verified facility customer reviews and safety credentials are buried below the fold',
        evidenceText: 'Zero ratings, commercial client logos, or trade certifications (OSHA, EPA, NATE) are visible in the initial 800px viewport.',
        businessImpact: 'First-time commercial buyers cannot verify company scale or reliability, increasing perceived operational risk.',
        recommendedAction: 'Add a prominent trust bar showing "4.9★ from 350+ Facilities • OSHA & NATE Certified" directly under the primary CTA.',
        whyItMatters: 'First-time buyers worry about reliability and risk. Missing visible proof above the fold increases perceived risk.',
        recommendedFix: 'Embed a high-visibility social proof strip right below the hero headline with verified ratings and authentic photos.',
        exampleImprovement: 'Add "★ 4.9/5 from 350+ Facilities • OSHA & NATE Certified" directly below the hero CTA.',
        customClientNotes: '',
        pinnedAssetId: fixedAssetId
      },
      {
        id: 'demo_finding_4',
        diagnosisId: 'diag_mobile_friction',
        checkId: 'chk_24',
        associatedCheckIds: ['chk_21', 'chk_24'],
        tags: ['Mobile', 'Tap-to-call'],
        isConsolidated: true,
        tier: 'Critical',
        priority: 'Critical',
        effort: 'Low',
        order: 4,
        finding: 'Mobile phone numbers are rendered as unclickable plain text on smartphone viewports',
        evidenceText: 'Header phone "(555) 234-5678" cannot be tapped directly on iOS/Android; lacks active tel: hyperlink.',
        businessImpact: 'On-site managers on mobile devices looking for emergency repair must manually copy/dial, risking lost inquiries.',
        recommendedAction: 'Convert all phone instances to tap-to-call links and add a sticky mobile bottom action bar.',
        whyItMatters: 'Over 65% of local searches happen on mobile devices where users need immediate thumb-accessible contact.',
        recommendedFix: 'Add a persistent mobile bottom action bar with direct "Tap to Call" and "Instant Quote" buttons.',
        exampleImprovement: 'Ensure phone numbers are hyperlinked with active `tel:` links.',
        customClientNotes: '',
        pinnedAssetId: fixedAssetId
      },
      {
        id: 'demo_finding_5',
        diagnosisId: 'diag_unclear_pricing_process',
        checkId: 'chk_10',
        associatedCheckIds: ['chk_9', 'chk_10'],
        tags: ['Pricing', 'Process'],
        isConsolidated: true,
        tier: 'Improvement',
        priority: 'Improvement',
        effort: 'Medium',
        order: 5,
        finding: 'Transparent service rate guidance and emergency intake SLA steps are missing',
        evidenceText: 'No baseline hourly rates or structured 3-step "Dispatch Timeline" provided on service pages.',
        businessImpact: 'Inquirers uncertain about dispatch turnaround or unexpected overage costs often hesitate to call.',
        recommendedAction: 'Add a 3-step dispatch process: 1. Work Order Intake → 2. Tech En Route (<2hr) → 3. Status Tracking.',
        whyItMatters: 'Uncertainty about cost ranges or fear of hidden fees causes prospects to bounce and compare transparent competitors.',
        recommendedFix: 'Introduce transparent starting baseline rates alongside a simple 3-step "How It Works" diagram.',
        exampleImprovement: 'Display starting packages alongside 3 clear next-step icons.',
        customClientNotes: '',
        pinnedAssetId: fixedAssetId
      }
    ],
    conversionPath: {
      currentSteps: [
        'Visitor lands from commercial search',
        'Reads abstract slogan "Innovative Solutions for Modern Enterprise"',
        'Encounters 3 competing buttons with no clear starting step',
        'Attempts to tap phone on mobile, but number is unclickable text',
        'Bounces to call a competitor with immediate phone intake'
      ],
      recommendedSteps: [
        'Facility manager lands and immediately sees commercial trade & 2-hour dispatch guarantee',
        'Reviews 4.9★ rating and OSHA/NATE certifications right below hero',
        'Clicks prominent "Request Service" or taps 1-click mobile phone bar',
        'Enters 3-field facility intake form (Property type, issue, urgent/standard)',
        'Receives instant dispatch confirmation and work order number'
      ],
      notes: 'Transitioning from passive corporate brochure to high-velocity service dispatch machine.'
    },
    reportConfig: {
      executiveSummary: 'Apex Commercial Services provides superior facility and MEP capabilities, but the website underperforms by hiding essential conversion drivers. By clarifying the hero headline, consolidating competing buttons into a single primary call-to-action, showcasing verified safety credentials above the fold, and adding 1-tap mobile dialing, Apex Commercial can capture an estimated 30–45% more qualified commercial inquiries from existing web traffic.',
      selectedFindingIds: ['demo_finding_1', 'demo_finding_2', 'demo_finding_3', 'demo_finding_4', 'demo_finding_5'],
      selectedSourceAssetIds: [sourceAssetId],
      selectedFixedDirectionAssetIds: [fixedAssetId],
      selectedPinIds: ['demo_pin_1', 'demo_pin_2', 'demo_pin_3', 'demo_pin_4', 'demo_pin_f1', 'demo_pin_f2', 'demo_pin_f3', 'demo_pin_f4'],
      showConversionBlueprint: true,
      showFixNext: true,
      showCategoryBreakdown: true,
      recommendedOffer: {
        offerName: '48-Hour Conversion Rescue',
        price: '$350',
        turnaround: '48 Hours',
        description: 'Complete implementation of the high-converting hero headline, single primary intake CTA, mobile click-to-call bar, and above-the-fold social proof trust strip.',
        customScope: 'Includes trade messaging rewrite, mobile tap-to-call optimization, trust bar styling, and 3-field quote intake form.',
        ctaText: 'Schedule 48-Hour Conversion Rescue'
      }
    },
    createdAt: now,
    updatedAt: now
  };

  return { audit, assets: [sourceAsset, fixedAsset] };
}
