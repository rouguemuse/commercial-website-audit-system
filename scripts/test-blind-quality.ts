import { INITIAL_MASTER_FRAMEWORK, INITIAL_DIAGNOSES } from '../src/data/seedData';
import { runPreAuditAnalysis, detectWebsitePatterns, generateConsolidatedFindings } from '../src/services/analysisEngine';
import type { Audit, AuditAsset } from '../src/types';

// ==========================================
// TEST CASE A: STRONG HIGH-CONVERTING WEBSITE
// ==========================================
// Clear outcome headline, prominent 4.9★ social proof, 3-field instant quote, clickable tel: links, dedicated service pages
const strongAudit: Audit = {
  id: 'audit_test_strong',
  businessName: 'Apex Roof Repair',
  websiteUrl: 'https://www.apexroofrepair-example.com',
  industry: 'Roofing & Exterior Repairs',
  cityServiceArea: 'Austin, TX',
  primaryCustomerType: 'Homeowners needing storm leak repair',
  desiredAction: 'Book Free Inspection',
  auditorNotes: 'Strong, clear site. Headline says "24/7 Emergency Storm Roof Leak Repairs in Austin". Instant 3-field booking form with 4.9★ Google badge and tap-to-call header.',
  status: 'Draft',
  frameworkVersion: '1.0',
  frameworkSnapshot: INITIAL_MASTER_FRAMEWORK,
  scores: {},
  findings: [],
  conversionPath: { currentSteps: [], recommendedSteps: [], notes: '' },
  reportConfig: {
    executiveSummary: '',
    selectedFindingIds: [],
    selectedSourceAssetIds: [],
    selectedFixedDirectionAssetIds: [],
    selectedPinIds: [],
    showConversionBlueprint: true,
    showFixNext: true,
    showCategoryBreakdown: true,
    recommendedOffer: { offerName: 'Conversion Checkup', price: '$150', turnaround: '24h', description: '', ctaText: '' }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const strongAssets: AuditAsset[] = [
  {
    id: 'asset_strong_1',
    auditId: 'audit_test_strong',
    type: 'source_of_truth',
    title: 'Homepage Viewport',
    caption: 'Hero with 4.9★ review and tap to call',
    notes: 'Clear service statement and fast booking form.',
    blob: new Blob([], { type: 'image/svg+xml' }),
    mimeType: 'image/svg+xml',
    filename: 'strong.svg',
    createdAt: new Date().toISOString(),
    pins: [
      { id: 'p_str_1', number: 1, x: 20, y: 20, title: 'Clear Outcome Headline', description: '24/7 Emergency Storm Roof Leak Repairs in Austin with Same-Day Dispatch.' },
      { id: 'p_str_2', number: 2, x: 50, y: 80, title: 'Verified Social Proof', description: '★ 4.9/5 Rating with 210+ verified Austin customer reviews.' }
    ]
  }
];

// ==========================================
// TEST CASE B: MEDIUM / AMBIGUOUS POLISHED SITE
// ==========================================
// "Solutions Built Around You", generic stock photos, 3 competing buttons, pricing hidden, 8-field form
const mediumAudit: Audit = {
  id: 'audit_test_medium',
  businessName: 'NexGen Digital Solutions',
  websiteUrl: 'https://www.nexgendigital-example.com',
  industry: 'B2B Consulting & Custom Software',
  cityServiceArea: 'Denver, CO',
  primaryCustomerType: 'Mid-market business operators',
  desiredAction: 'Book Strategy Session',
  auditorNotes: 'Superficially modern aesthetic with dark mode and gradients, but the hero reads "Solutions Built Around You — Empowering Tomorrow Today". Three equal buttons ("Learn More", "Contact Us", "Discover Innovation"). No pricing guidance. 8-field intake form.',
  status: 'Draft',
  frameworkVersion: '1.0',
  frameworkSnapshot: INITIAL_MASTER_FRAMEWORK,
  scores: {},
  findings: [],
  conversionPath: { currentSteps: [], recommendedSteps: [], notes: '' },
  reportConfig: {
    executiveSummary: '',
    selectedFindingIds: [],
    selectedSourceAssetIds: [],
    selectedFixedDirectionAssetIds: [],
    selectedPinIds: [],
    showConversionBlueprint: true,
    showFixNext: true,
    showCategoryBreakdown: true,
    recommendedOffer: { offerName: '48-Hour Rescue', price: '$350', turnaround: '48h', description: '', ctaText: '' }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mediumAssets: AuditAsset[] = [
  {
    id: 'asset_med_1',
    auditId: 'audit_test_medium',
    type: 'source_of_truth',
    title: 'Homepage Desktop',
    caption: 'Vague hero and competing buttons',
    notes: 'Requires visitor guesswork.',
    blob: new Blob([], { type: 'image/svg+xml' }),
    mimeType: 'image/svg+xml',
    filename: 'med.svg',
    createdAt: new Date().toISOString(),
    pins: [
      { id: 'p_med_1', number: 1, x: 20, y: 25, title: 'Vague Headline Slogan', description: 'Headline is "Solutions Built Around You" - requires interpretation.' },
      { id: 'p_med_2', number: 2, x: 30, y: 45, title: 'Competing Action Buttons', description: 'Three equal buttons: Learn More, Contact Us, Discover Innovation.' },
      { id: 'p_med_3', number: 3, x: 80, y: 35, title: 'Generic Stock Photography', description: 'Abstract stock photo of handshake in office.' },
      { id: 'p_med_4', number: 4, x: 75, y: 70, title: 'High Friction Form', description: '8 required form fields before booking.' }
    ]
  }
];

// ==========================================
// TEST CASE C: POOR / BROKEN WEBSITE
// ==========================================
// Missing location, zero reviews, broken mobile overlap, no clear CTA, wall of text
const poorAudit: Audit = {
  id: 'audit_test_poor',
  businessName: 'Smith & Sons Contracting',
  websiteUrl: 'https://www.smithcontracting-example.com',
  industry: 'General Remodeling',
  cityServiceArea: 'Chicago, IL',
  primaryCustomerType: 'Homeowners',
  desiredAction: 'Call for estimate',
  auditorNotes: 'Old unmaintained look. No location stated above fold. Unclickable plain text phone. Zero reviews. Broken overlapping mobile text. 10-field contact form asking for budget and timeline before contact.',
  status: 'Draft',
  frameworkVersion: '1.0',
  frameworkSnapshot: INITIAL_MASTER_FRAMEWORK,
  scores: {},
  findings: [],
  conversionPath: { currentSteps: [], recommendedSteps: [], notes: '' },
  reportConfig: {
    executiveSummary: '',
    selectedFindingIds: [],
    selectedSourceAssetIds: [],
    selectedFixedDirectionAssetIds: [],
    selectedPinIds: [],
    showConversionBlueprint: true,
    showFixNext: true,
    showCategoryBreakdown: true,
    recommendedOffer: { offerName: 'High Rescue', price: '$750', turnaround: '7d', description: '', ctaText: '' }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const poorAssets: AuditAsset[] = [
  {
    id: 'asset_poor_1',
    auditId: 'audit_test_poor',
    type: 'source_of_truth',
    title: 'Homepage Desktop & Mobile',
    caption: 'Failing checks across clarity, trust, and mobile UX',
    notes: 'Major conversion leak across all categories.',
    blob: new Blob([], { type: 'image/svg+xml' }),
    mimeType: 'image/svg+xml',
    filename: 'poor.svg',
    createdAt: new Date().toISOString(),
    pins: [
      { id: 'p_p_1', number: 1, x: 15, y: 20, title: 'Vague Headline', description: 'Welcome to Our Website - No service or outcome stated.' },
      { id: 'p_p_2', number: 2, x: 30, y: 10, title: 'Missing Service Area', description: 'Zero mention of Chicago or service territory.' },
      { id: 'p_p_3', number: 3, x: 50, y: 40, title: 'Competing Buttons', description: 'Buttons labeled Submit, Click Here, Info.' },
      { id: 'p_p_4', number: 4, x: 50, y: 60, title: 'Missing Proof', description: 'Zero testimonials, ratings, or client badges.' },
      { id: 'p_p_5', number: 5, x: 80, y: 20, title: 'Mobile Spacing Overlap', description: 'Text cuts off and phone number is plain unclickable text.' },
      { id: 'p_p_6', number: 6, x: 70, y: 80, title: 'Long Friction Form', description: 'Demands 10 fields before allowing contact.' }
    ]
  }
];

// Run Blind Quality Test
console.log('====================================================');
console.log('🧪 RUNNING BLIND QUALITY TEST (3 DISTINCT PROFILES)');
console.log('====================================================\n');

// 1. Test Strong Site
const resA = runPreAuditAnalysis(strongAudit, INITIAL_MASTER_FRAMEWORK, INITIAL_DIAGNOSES, strongAssets);
let scoreA = 0;
Object.values(resA.updatedScores).forEach(s => { scoreA += s.score; });
console.log(`[SITE A: STRONG (Apex Roof Repair)]`);
console.log(`Score: ${scoreA} / 60 (${scoreA >= 48 ? 'Low Rescue / Healthy' : scoreA >= 36 ? 'Medium Rescue' : 'High Rescue'})`);
console.log(`Pattern Detected: ${resA.primaryPatternInsight.patternName}`);
console.log(`Consolidated Findings Count: ${resA.consolidatedFindings.length}`);
console.log('----------------------------------------------------\n');

// 2. Test Medium Site
const resB = runPreAuditAnalysis(mediumAudit, INITIAL_MASTER_FRAMEWORK, INITIAL_DIAGNOSES, mediumAssets);
let scoreB = 0;
Object.values(resB.updatedScores).forEach(s => { scoreB += s.score; });
console.log(`[SITE B: MEDIUM AMBIGUOUS (NexGen Digital Solutions)]`);
console.log(`Score: ${scoreB} / 60 (${scoreB >= 48 ? 'Low Rescue' : scoreB >= 36 ? 'Medium Rescue' : 'High Rescue'})`);
console.log(`Pattern Detected: ${resB.primaryPatternInsight.patternName}`);
console.log(`Consolidated Findings:`);
resB.consolidatedFindings.forEach((f, i) => {
  console.log(`  ${i + 1}. [${f.tier.toUpperCase()}] ${f.finding}`);
});
console.log('----------------------------------------------------\n');

// 3. Test Poor Site
const resC = runPreAuditAnalysis(poorAudit, INITIAL_MASTER_FRAMEWORK, INITIAL_DIAGNOSES, poorAssets);
let scoreC = 0;
Object.values(resC.updatedScores).forEach(s => { scoreC += s.score; });
console.log(`[SITE C: POOR / BROKEN (Smith & Sons Contracting)]`);
console.log(`Score: ${scoreC} / 60 (${scoreC >= 48 ? 'Low Rescue' : scoreC >= 36 ? 'Medium Rescue' : 'High Rescue'})`);
console.log(`Pattern Detected: ${resC.primaryPatternInsight.patternName}`);
console.log(`Consolidated Findings:`);
resC.consolidatedFindings.forEach((f, i) => {
  console.log(`  ${i + 1}. [${f.tier.toUpperCase()}] ${f.finding}`);
});
console.log('====================================================');
console.log(`SCORE SPREAD COMPARISON:`);
console.log(`Site A (Strong):   ${scoreA}/60`);
console.log(`Site B (Medium):   ${scoreB}/60`);
console.log(`Site C (Poor):     ${scoreC}/60`);
console.log(`Delta (A vs C):    ${scoreA - scoreC} points`);
console.log('====================================================');
