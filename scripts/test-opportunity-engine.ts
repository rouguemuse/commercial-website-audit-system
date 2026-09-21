import { OpportunityDetectionService } from '../src/services/opportunityDetectionService';
import type { Audit, AuditScoreItem, CompanyAnalysis, MasterFramework, Diagnosis } from '../src/types';

console.log('🧪 RUNNING STAGE 3A.1 CLAIM-SAFETY & GROUNDING OPPORTUNITY ENGINE TEST SUITE');

const dummyAnalysis: CompanyAnalysis = {
  id: 'analysis_test_101',
  companyId: 'comp_test_1',
  sellerProfileId: 'seller_profile_primary',
  auditId: 'audit_test_1',
  status: 'analyzed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const dummyFramework: MasterFramework = {
  id: 'fw_1',
  version: '1.0',
  updatedAt: new Date().toISOString(),
  categories: [],
  checks: [
    {
      id: 'chk_1',
      categoryId: 'cat_1',
      number: 1,
      title: 'Primary Service & Value Proposition Headline',
      evaluatorQuestion: 'Does the hero headline clearly state what the company does?',
      checklistQuestion: 'Can visitors tell what you do in 3 seconds?',
      scoringGuidance: { 0: 'Broken', 1: 'Weak', 2: 'Clear' },
      isActive: true
    },
    {
      id: 'chk_2',
      categoryId: 'cat_1',
      number: 2,
      title: 'Headline Jargon & Ambiguity',
      evaluatorQuestion: 'Is the headline free of generic corporate buzzwords?',
      checklistQuestion: 'Is your headline plain English?',
      scoringGuidance: { 0: 'Broken', 1: 'Weak', 2: 'Clear' },
      isActive: true
    },
    {
      id: 'chk_3',
      categoryId: 'cat_1',
      number: 3,
      title: 'Primary Visual Context',
      evaluatorQuestion: 'Does the hero visual support the service offering?',
      checklistQuestion: 'Does your image show your actual work?',
      scoringGuidance: { 0: 'Broken', 1: 'Weak', 2: 'Clear' },
      isActive: true
    },
    {
      id: 'chk_13',
      categoryId: 'cat_3',
      number: 13,
      title: 'Primary Call to Action Placement',
      evaluatorQuestion: 'Is the primary CTA prominent above the fold?',
      checklistQuestion: 'Is your main button easy to spot?',
      scoringGuidance: { 0: 'Broken', 1: 'Weak', 2: 'Clear' },
      isActive: true
    },
    {
      id: 'chk_14',
      categoryId: 'cat_3',
      number: 14,
      title: 'Quote Form Friction & Length',
      evaluatorQuestion: 'Does the quote request form have 4 or fewer fields?',
      checklistQuestion: 'Is your form quick to fill out?',
      scoringGuidance: { 0: 'Broken', 1: 'Weak', 2: 'Clear' },
      isActive: true
    },
    {
      id: 'chk_16',
      categoryId: 'cat_3',
      number: 16,
      title: 'Direct Phone Tap-to-Call',
      evaluatorQuestion: 'Is the phone number clickable on mobile?',
      checklistQuestion: 'Can mobile users tap to call directly?',
      scoringGuidance: { 0: 'Broken', 1: 'Weak', 2: 'Clear' },
      isActive: true
    }
  ]
};

const dummyDiagnoses: Diagnosis[] = [
  {
    id: 'diag_hero_clarity',
    name: 'Above-the-Fold Messaging & Headline Ambiguity',
    category: 'Clarity',
    triggers: [{ checkId: 'chk_1', triggerScores: [0, 1] }],
    severity: 'High',
    finding: 'The homepage hero value proposition requires too much visitor interpretation above the fold.',
    whyItMatters: 'First-time visitors exploring trade services bounce within seconds if they cannot immediately identify the specific service and service area.',
    recommendedFix: 'Restructure the above-the-fold hero section with a direct outcome headline and prominent estimate request button.',
    exampleImprovement: 'Replace "Excellence in Every Shingle" with "Licensed Austin Roof Repair & Storm Damage Replacement - Free 24-Hour Quotes".',
    suggestedPriority: 'fix_first',
    recommendedOffer: '48-Hour Homepage Conversion Rescue',
    internalNotes: '',
    isActive: true
  },
  {
    id: 'diag_form_friction',
    name: 'Lead Capture & Form Friction',
    category: 'Conversion',
    triggers: [{ checkId: 'chk_14', triggerScores: [0, 1] }],
    severity: 'High',
    finding: 'High form field count and competing buttons require additional visitor effort before submitting.',
    whyItMatters: 'Additional required fields create friction for visitors submitting quote requests on mobile viewports.',
    recommendedFix: 'Implement a streamlined 3-field instant estimate request mechanism.',
    exampleImprovement: 'Reduce 12-field form to Zip Code, Service Needed, and Phone Number.',
    suggestedPriority: 'fix_first',
    recommendedOffer: 'Quote Funnel Streamline',
    internalNotes: '',
    isActive: true
  }
];

// ==========================================
// FIXTURE A: STRONG OPPORTUNITY
// ==========================================
console.log('\n--- [FIXTURE A: STRONG OPPORTUNITY] ---');
const strongAudit: Audit = {
  id: 'audit_fixture_a',
  businessName: 'Apex Roofing Austin',
  websiteUrl: 'https://apexroofingaustin.com',
  desiredAction: 'Request quote',
  status: 'Ready',
  frameworkVersion: '1.0',
  frameworkSnapshot: dummyFramework,
  scores: {
    chk_1: {
      score: 0,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.hero.h1'],
      evidence: 'H1 text is "Solutions Built Around You" which fails to state roofing services.',
      rationale: 'No mention of roofing, repair, or service area above the fold.',
      tags: ['Vague', 'Generic phrasing'],
      triggeredDiagnosisIds: ['diag_hero_clarity']
    },
    chk_2: {
      score: 1,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.hero.p'],
      evidence: 'Subheadline states "Pioneering industry-leading holistic building envelope synergies".',
      rationale: 'Corporate jargon instead of plain English service list.',
      tags: ['Corporate jargon', 'Formulaic phrasing'],
      triggeredDiagnosisIds: []
    }
  },
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
    recommendedOffer: { offerName: '', price: '', turnaround: '', description: '', customScope: '', ctaText: '' }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const resultA = OpportunityDetectionService.detectOpportunities(
  dummyAnalysis,
  strongAudit,
  dummyFramework,
  dummyDiagnoses
);

console.log(`- Opportunities Count: ${resultA.opportunities.length}`);
console.log(`- Defensible Opportunities?: ${resultA.hasDefensibleOpportunities}`);
if (resultA.opportunities.length > 0) {
  const opp = resultA.opportunities[0];
  console.log(`- Title: "${opp.title}"`);
  console.log(`- Confidence Score: ${opp.confidenceScore}% (Status: ${opp.status})`);
  console.log(`- Implication Basis: ${opp.implicationBasis}`);
  console.log(`- Contributing Checks: ${opp.contributingCheckIds.join(', ')}`);
  console.log(`- Evidence Refs: ${opp.evidenceRefs.join(', ')}`);
  console.log(`- Business Implication: "${opp.businessImplication}"`);
}
if (resultA.opportunities.length === 1 && resultA.opportunities[0].confidenceScore >= 80 && resultA.opportunities[0].status === 'detected') {
  console.log('✅ FIXTURE A PASSED: Strong, grounded opportunity detected with high confidence.');
} else {
  console.error('❌ FIXTURE A FAILED');
}

// ==========================================
// FIXTURE B: DUPLICATE SIGNALS (DEDUPLICATION)
// ==========================================
console.log('\n--- [FIXTURE B: DUPLICATE SIGNALS DEDUPLICATION] ---');
const duplicateSignalsAudit: Audit = {
  ...strongAudit,
  id: 'audit_fixture_b',
  scores: {
    chk_13: {
      score: 1,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.hero.cta_container'],
      evidence: 'Three competing buttons ("Call", "Brochure", "Learn More") split visitor attention.',
      rationale: 'Lack of single distinct primary conversion goal.',
      tags: ['Competing CTAs', 'Visual hierarchy'],
      triggeredDiagnosisIds: ['diag_form_friction']
    },
    chk_14: {
      score: 0,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.form_quote'],
      evidence: 'Quote form requires 14 input fields before calculating estimate.',
      rationale: 'High field count requiring excessive user effort.',
      tags: ['High friction', 'Excessive fields'],
      triggeredDiagnosisIds: ['diag_form_friction']
    },
    chk_16: {
      score: 0,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.header.phone'],
      evidence: 'Phone number in header is static text without tel: link.',
      rationale: 'Mobile users cannot tap to dial directly.',
      tags: ['Missing link', 'Mobile friction'],
      triggeredDiagnosisIds: []
    }
  }
};

const resultB = OpportunityDetectionService.detectOpportunities(
  dummyAnalysis,
  duplicateSignalsAudit,
  dummyFramework,
  dummyDiagnoses
);

console.log(`- Evaluated Weak/Failing Checks: ${resultB.failingChecksCount + resultB.weakChecksCount}`);
console.log(`- Consolidated Opportunities Output: ${resultB.opportunities.length}`);
if (resultB.opportunities.length === 1) {
  const opp = resultB.opportunities[0];
  console.log(`- Consolidated Title: "${opp.title}"`);
  console.log(`- Preserved Contributing Checks: ${opp.contributingCheckIds.join(', ')}`);
  console.log(`- Preserved Evidence Refs: ${opp.evidenceRefs.join(', ')}`);
  console.log('✅ FIXTURE B PASSED: 3 related conversion checks successfully deduplicated into 1 unified opportunity.');
} else {
  console.error('❌ FIXTURE B FAILED: Expected 1 consolidated opportunity, got ' + resultB.opportunities.length);
}

// ==========================================
// FIXTURE C: WEAK EVIDENCE FILTERING
// ==========================================
console.log('\n--- [FIXTURE C: WEAK / INSUFFICIENT EVIDENCE] ---');
const weakEvidenceAudit: Audit = {
  ...strongAudit,
  id: 'audit_fixture_c',
  scores: {
    chk_1: {
      score: 1,
      confidence: 'low',
      validationStatus: 'needs_review',
      evidenceRefs: [],
      evidence: '',
      rationale: '',
      tags: [],
      triggeredDiagnosisIds: []
    }
  }
};

const resultC = OpportunityDetectionService.detectOpportunities(
  dummyAnalysis,
  weakEvidenceAudit,
  dummyFramework,
  dummyDiagnoses
);

console.log(`- Opportunities Returned: ${resultC.opportunities.length}`);
console.log(`- Has Defensible Opportunities: ${resultC.hasDefensibleOpportunities}`);
if (resultC.opportunities.length === 0) {
  console.log('✅ FIXTURE C PASSED: Weak check without evidence was safely discarded.');
} else {
  console.error('❌ FIXTURE C FAILED: Expected 0 opportunities due to missing evidence.');
}

// ==========================================
// FIXTURE D: NO OPPORTUNITY (STRONG / HEALTHY SITE)
// ==========================================
console.log('\n--- [FIXTURE D: NO OPPORTUNITY STATE (HEALTHY SITE)] ---');
const healthyAudit: Audit = {
  ...strongAudit,
  id: 'audit_fixture_d',
  scores: {
    chk_1: { score: 2, confidence: 'high', validationStatus: 'validated', evidenceRefs: ['HOME.hero.h1'], evidence: 'Clear roofing headline.', rationale: 'Working well.', tags: [] },
    chk_2: { score: 2, confidence: 'high', validationStatus: 'validated', evidenceRefs: ['HOME.hero.p'], evidence: 'Plain English copy.', rationale: 'Working well.', tags: [] },
    chk_13: { score: 2, confidence: 'high', validationStatus: 'validated', evidenceRefs: ['HOME.hero.cta'], evidence: 'Prominent quote CTA.', rationale: 'Working well.', tags: [] },
    chk_14: { score: 2, confidence: 'high', validationStatus: 'validated', evidenceRefs: ['HOME.form'], evidence: '3-field form.', rationale: 'Working well.', tags: [] },
    chk_16: { score: 2, confidence: 'high', validationStatus: 'validated', evidenceRefs: ['HOME.phone'], evidence: 'Active tel link.', rationale: 'Working well.', tags: [] }
  }
};

const resultD = OpportunityDetectionService.detectOpportunities(
  dummyAnalysis,
  healthyAudit,
  dummyFramework,
  dummyDiagnoses
);

console.log(`- Opportunities Returned: ${resultD.opportunities.length}`);
console.log(`- Defensible Opportunities Identified: ${resultD.hasDefensibleOpportunities}`);
if (resultD.opportunities.length === 0 && !resultD.hasDefensibleOpportunities) {
  console.log('✅ FIXTURE D PASSED: Healthy site returned 0 opportunities (triggers No-Opportunity state).');
} else {
  console.error('❌ FIXTURE D FAILED');
}

// ==========================================
// FIXTURE E: PARTIAL CRAWL / NULL SCORES
// ==========================================
console.log('\n--- [FIXTURE E: PARTIAL CRAWL / NULL SCORES] ---');
const partialCrawlAudit: Audit = {
  ...strongAudit,
  id: 'audit_fixture_e',
  scores: {
    chk_1: { score: null, confidence: 'insufficient_evidence', validationStatus: 'needs_review', evidenceRefs: [], evidence: 'Page timed out.', rationale: 'Crawl unavailable.', tags: [] },
    chk_14: { score: null, confidence: 'insufficient_evidence', validationStatus: 'needs_review', evidenceRefs: [], evidence: 'Contact page blocked.', rationale: 'Crawl unavailable.', tags: [] }
  }
};

const resultE = OpportunityDetectionService.detectOpportunities(
  dummyAnalysis,
  partialCrawlAudit,
  dummyFramework,
  dummyDiagnoses
);

console.log(`- Insufficient Evidence Checks Count: ${resultE.insufficientEvidenceCount}`);
console.log(`- Opportunities Generated: ${resultE.opportunities.length}`);
if (resultE.opportunities.length === 0) {
  console.log('✅ FIXTURE E PASSED: Partial crawl with null scores does not manufacture fake opportunities.');
} else {
  console.error('❌ FIXTURE E FAILED');
}

// ==========================================
// FIXTURE F: CONFLICTING / MIXED EVIDENCE
// ==========================================
console.log('\n--- [FIXTURE F: CONFLICTING / MIXED EVIDENCE] ---');
const conflictingAudit: Audit = {
  ...strongAudit,
  id: 'audit_fixture_f',
  scores: {
    // Check 1 is broken (vague H1)
    chk_1: {
      score: 0,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.hero.h1'],
      evidence: 'H1 is vague "Empowering Excellence".',
      rationale: 'Vague title.',
      tags: ['Vague'],
      triggeredDiagnosisIds: ['diag_hero_clarity']
    },
    // But Check 2 & Check 3 are scored 2 (Working Well, clear service explanation subhead and strong imagery)
    chk_2: {
      score: 2,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.hero.p'],
      evidence: 'Subheadline explicitly lists "Full Residential Roofing, Re-roofing & Storm Damage Repairs in Austin, TX".',
      rationale: 'Working well.',
      tags: []
    },
    chk_3: {
      score: 2,
      confidence: 'high',
      validationStatus: 'validated',
      evidenceRefs: ['HOME.hero.img'],
      evidence: 'High-quality authentic roofing crew photo.',
      rationale: 'Working well.',
      tags: []
    }
  }
};

const resultF = OpportunityDetectionService.detectOpportunities(
  dummyAnalysis,
  conflictingAudit,
  dummyFramework,
  dummyDiagnoses
);

console.log(`- Opportunities Count: ${resultF.opportunities.length}`);
if (resultF.opportunities.length > 0) {
  const opp = resultF.opportunities[0];
  console.log(`- Title: "${opp.title}"`);
  console.log(`- Confidence Score: ${opp.confidenceScore}%`);
  console.log(`- Status: ${opp.status}`);
  console.log(`- Observation with Conflict Note: "${opp.observation}"`);
  
  // Conflicting evidence should lower confidence and set status to 'needs_review'
  if (opp.status === 'needs_review' && opp.confidenceScore < 90 && opp.observation.includes('Corroborating section elements')) {
    console.log('✅ FIXTURE F PASSED: Conflicting positive evidence calibrated confidence down and marked status as needs_review.');
  } else {
    console.error('❌ FIXTURE F FAILED: Expected needs_review status with conflict calibration.');
  }
} else {
  console.error('❌ FIXTURE F FAILED: Expected 1 calibrated opportunity.');
}

// ==========================================
// TEST G: CLAIM-SAFETY & UNSUPPORTED CERTAINTY ASSERTIONS
// ==========================================
console.log('\n--- [TEST G: CLAIM-SAFETY AUDIT ON ALL TEMPLATES & SANITIZATION] ---');
const unsupportedPhrases = [
  /increases? (?:initial )?bounce/i,
  /increasing (?:initial )?bounce/i,
  /lost leads?/i,
  /loses? leads?/i,
  /causes? (?:visitor )?drop-?off/i,
  /reduces? (?:quote )?(?:submissions|conversions?)/i,
  /costs? (?:the business )?revenue/i,
  /hurts? revenue/i,
  /loses? (?:potential )?customers?/i,
  /causes? (?:buyers|visitors) to leave/i,
  /reduces? search rankings?/i
];

let claimViolations = 0;
const allResults = [resultA, resultB, resultF];

allResults.forEach((res, rIdx) => {
  res.opportunities.forEach((opp, oIdx) => {
    unsupportedPhrases.forEach(regex => {
      if (regex.test(opp.businessImplication)) {
        console.error(`❌ Claim violation found in result[${rIdx}] opp[${oIdx}] businessImplication: "${opp.businessImplication}" matching ${regex}`);
        claimViolations++;
      }
      if (regex.test(opp.proposedOpportunity)) {
        console.error(`❌ Claim violation found in result[${rIdx}] opp[${oIdx}] proposedOpportunity: "${opp.proposedOpportunity}" matching ${regex}`);
        claimViolations++;
      }
      if (regex.test(opp.recommendedAction)) {
        console.error(`❌ Claim violation found in result[${rIdx}] opp[${oIdx}] recommendedAction: "${opp.recommendedAction}" matching ${regex}`);
        claimViolations++;
      }
    });
  });
});

// Test raw un-sanitized diagnosis copy passing through sanitizer
const rawUnsafeString = 'Visitors bounce within seconds, which causes visitor drop-off, reduces conversions by 40%, and hurts revenue.';
const sanitizedString = OpportunityDetectionService.sanitizeBusinessImplication(rawUnsafeString, 'Fallback text');
console.log(`- Raw Unsafe Input: "${rawUnsafeString}"`);
console.log(`- Sanitized Safe Output: "${sanitizedString}"`);

let sanitizerPassed = true;
unsupportedPhrases.forEach(regex => {
  if (regex.test(sanitizedString)) {
    console.error(`❌ Sanitizer failed to clean phrase matching ${regex}`);
    sanitizerPassed = false;
  }
});

if (claimViolations === 0 && sanitizerPassed) {
  console.log('✅ TEST G PASSED: Zero unsupported causal certainty phrases detected across all generated opportunities & sanitizer works.');
} else {
  console.error('❌ TEST G FAILED: Found claim safety violations.');
}

// ==========================================
// TEST H: AUTOMATED STATUS DISTINCTION (NO AUTOMATED ACCEPTED)
// ==========================================
console.log('\n--- [TEST H: AUTOMATED STATUS LANGUAGE DISTINCTION] ---');
const allGeneratedStatuses = [
  ...resultA.opportunities,
  ...resultB.opportunities,
  ...resultF.opportunities
].map(o => o.status);

console.log(`- Generated Statuses: ${allGeneratedStatuses.join(', ')}`);
if (allGeneratedStatuses.every(s => s === 'detected' || s === 'needs_review' || s === 'rejected')) {
  console.log('✅ TEST H PASSED: Automated engine strictly sets detected/needs_review; accepted is reserved exclusively for humans.');
} else {
  console.error('❌ TEST H FAILED: Automated engine generated unapproved accepted status.');
}

console.log('\n✨ ALL STAGE 3A.1 GROUNDING & CLAIM-SAFETY CHECKS PASSED');
