import { OpportunityDetectionService } from '../src/services/opportunityDetectionService';
import { SellerFitEngine } from '../src/services/sellerFitEngine';
import { QualificationEngine } from '../src/services/qualificationEngine';
import type {
  Opportunity,
  SellerProfile,
  Company,
  CompanyAnalysis
} from '../src/types';

function runTests() {
  console.log('=== Stage 3B: Seller Fit & Qualification Engine Test Suite ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      process.exitCode = 1;
    }
  }

  // --- TEST 0: Sanitizer Numeric Claim Bug Patch ---
  console.log('--- Test 0: Numeric Claim Sanitizer Patch ---');
  const sanitizedMetric = OpportunityDetectionService.sanitizeBusinessImplication(
    'This broken hero reduces conversions by 40% and costs the business revenue by $10,000.',
    'fallback'
  );
  assert(
    !sanitizedMetric.includes('by 40%') && !sanitizedMetric.includes('by $10,000') && !sanitizedMetric.includes('reduces conversions'),
    'Sanitizer strips trailing numeric and percentage multipliers attached to causal phrases'
  );

  // --- Fixture Base Setup ---
  const baseCompany: Company = {
    id: 'comp_test_1',
    name: 'Apex Plumbing Co',
    websiteUrl: 'https://apexplumbing.example',
    relationshipType: 'prospect',
    industry: 'Home Services',
    location: 'Austin, TX',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const baseCompanyAnalysis: CompanyAnalysis = {
    id: 'ana_test_1',
    companyId: 'comp_test_1',
    sellerProfileId: 'seller_test_1',
    auditId: 'audit_test_1',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const heroOpportunity: Opportunity = {
    id: 'opp_hero_1',
    companyAnalysisId: 'ana_test_1',
    companyId: 'comp_test_1',
    auditId: 'audit_test_1',
    title: 'Above-the-Fold Messaging & Offer Clarity',
    observation: 'Headline is generic and value proposition is not clearly stated above the fold.',
    evidenceRefs: ['HOME.hero.h1', 'HOME.hero.cta_primary'],
    evidenceAssetIds: ['snap_hero_1'],
    evidenceText: ['[Check #1]: Generic welcome text found.'],
    businessImplication: 'First-time visitors may experience hesitation before understanding service scope.',
    proposedOpportunity: 'Revamp hero banner with clear value proposition and primary action.',
    recommendedAction: 'Rewrite hero messaging.',
    capabilityTags: ['messaging', 'conversion', 'UX'],
    estimatedImpact: 'high',
    implicationBasis: 'inferred_risk',
    confidenceScore: 88,
    status: 'detected',
    contributingCheckIds: ['chk_1', 'chk_2'],
    primaryCheckId: 'chk_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // --- FIXTURE A: Direct Match ---
  console.log('\n--- Fixture A: Direct Match (Conversion Copywriter) ---');
  const copywriterProfile: SellerProfile = {
    id: 'seller_copywriter',
    sellerName: 'Sarah Copywriter',
    businessName: 'Clarity Copy Studio',
    primaryRole: 'consultant',
    servicesOffered: [
      {
        id: 'srv_1',
        name: 'Homepage Hero & Messaging Revamp',
        category: 'Copy / Messaging',
        description: 'Complete overhaul of above-the-fold messaging, value props, and conversion hooks.',
        currency: 'USD',
        typicalPriceMin: 2500,
        deliverableSummary: 'High-converting hero copywriting and wireframe.',
        capabilityTags: ['messaging', 'conversion', 'UX', 'copywriting'],
        order: 1
      }
    ],
    servicesNotOffered: ['PPC', 'Media Buying'],
    idealClientProfile: {
      preferredIndustries: ['Home Services', 'B2B Services'],
      preferredClientTypes: ['SMBs', 'Contractors'],
      minProjectBudget: 2000
    },
    proofPoints: [
      {
        id: 'proof_1',
        title: 'Increased lead form submissions for contractor',
        description: 'Rewrote hero section for plumbing company leading to higher engagement.',
        tags: ['messaging', 'conversion'],
        order: 1
      }
    ],
    outreachPreferences: {
      tonePreset: 'direct_consultative',
      preferredChannels: ['Email'],
      phrasesToAvoid: []
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const fitA = SellerFitEngine.evaluateOpportunityFit(heroOpportunity, copywriterProfile, baseCompanyAnalysis.id);
  const qualA = QualificationEngine.qualifyOpportunity(heroOpportunity, fitA, copywriterProfile, baseCompany, baseCompanyAnalysis.id);

  assert(fitA.classification === 'strong_fit', 'Fixture A SellerFit is strong_fit');
  assert(fitA.fitScore >= 70, `Fixture A fit score >= 70 (got ${fitA.fitScore})`);
  assert(fitA.matchedOfferNames.length > 0, 'Fixture A matched at least one service offering');
  assert(qualA.verdict === 'PURSUE', `Fixture A qualification verdict is PURSUE (got ${qualA.verdict})`);
  assert(qualA.overallScore >= 70, `Fixture A overall score >= 70 (got ${qualA.overallScore})`);

  // --- FIXTURE B: Adjacent Match (Web Designer without dedicated copy service) ---
  console.log('\n--- Fixture B: Adjacent Match (Web Designer) ---');
  const designerProfile: SellerProfile = {
    id: 'seller_designer',
    sellerName: 'David Designer',
    businessName: 'PixelCraft',
    primaryRole: 'designer',
    servicesOffered: [
      {
        id: 'srv_2',
        name: 'UI / UX Website Redesign',
        category: 'Design',
        description: 'Visual layout and user experience redesign.',
        currency: 'USD',
        deliverableSummary: 'Figma prototypes and UI components.',
        capabilityTags: ['UX', 'mobile'],
        order: 1
      }
    ],
    servicesNotOffered: [],
    idealClientProfile: {
      preferredIndustries: [],
      preferredClientTypes: []
    },
    proofPoints: [],
    outreachPreferences: {
      tonePreset: 'direct_consultative',
      preferredChannels: ['Email'],
      phrasesToAvoid: []
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const fitB = SellerFitEngine.evaluateOpportunityFit(heroOpportunity, designerProfile, baseCompanyAnalysis.id);
  const qualB = QualificationEngine.qualifyOpportunity(heroOpportunity, fitB, designerProfile, baseCompany, baseCompanyAnalysis.id);

  assert(fitB.classification === 'possible_fit', `Fixture B SellerFit is possible_fit (got ${fitB.classification})`);
  assert(qualB.verdict === 'WORTH_EXPLORING', `Fixture B qualification verdict is WORTH_EXPLORING (got ${qualB.verdict})`);

  // --- FIXTURE C: Explicit Exclusion ---
  console.log('\n--- Fixture C: Explicit Exclusion ---');
  const ppcOpportunity: Opportunity = {
    ...heroOpportunity,
    id: 'opp_ppc_1',
    title: 'Google Ads Paid Search & PPC Landing Funnel',
    observation: 'Paid search campaign lands on broken unoptimized form.',
    capabilityTags: ['ppc', 'lead_capture'] as any
  };

  const fitC = SellerFitEngine.evaluateOpportunityFit(ppcOpportunity, copywriterProfile, baseCompanyAnalysis.id);
  const qualC = QualificationEngine.qualifyOpportunity(ppcOpportunity, fitC, copywriterProfile, baseCompany, baseCompanyAnalysis.id);

  assert(fitC.classification === 'explicitly_excluded', `Fixture C SellerFit is explicitly_excluded (got ${fitC.classification})`);
  assert(fitC.fitScore === 0, `Fixture C fit score is 0 (got ${fitC.fitScore})`);
  assert(qualC.verdict === 'SKIP', `Fixture C qualification verdict is SKIP (got ${qualC.verdict})`);
  assert(qualC.hardGateTriggered === 'explicit_exclusion', 'Fixture C triggered explicit_exclusion hard gate');

  // --- FIXTURE D: No Capability (Outside Capability) ---
  console.log('\n--- Fixture D: Outside Capability (Backend Python Engineer) ---');
  const backendProfile: SellerProfile = {
    id: 'seller_backend',
    sellerName: 'Bob Backend',
    businessName: 'PyData Services',
    primaryRole: 'developer',
    servicesOffered: [
      {
        id: 'srv_3',
        name: 'PostgreSQL Database Optimization & Python Microservices',
        category: 'Development',
        description: 'Server side architecture.',
        currency: 'USD',
        deliverableSummary: 'Database index tuning and API endpoints.',
        capabilityTags: ['development', 'backend', 'database'],
        order: 1
      }
    ],
    servicesNotOffered: [],
    idealClientProfile: {
      preferredIndustries: [],
      preferredClientTypes: []
    },
    proofPoints: [],
    outreachPreferences: {
      tonePreset: 'direct_consultative',
      preferredChannels: ['Email'],
      phrasesToAvoid: []
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const fitD = SellerFitEngine.evaluateOpportunityFit(heroOpportunity, backendProfile, baseCompanyAnalysis.id);
  const qualD = QualificationEngine.qualifyOpportunity(heroOpportunity, fitD, backendProfile, baseCompany, baseCompanyAnalysis.id);

  assert(fitD.classification === 'outside_capability', `Fixture D SellerFit is outside_capability (got ${fitD.classification})`);
  assert(qualD.verdict === 'REFER_OUT', `Fixture D qualification verdict is REFER_OUT (got ${qualD.verdict})`);
  assert(qualD.hardGateTriggered === 'outside_capability', 'Fixture D triggered outside_capability hard gate');

  // --- FIXTURE E: Bad Client / Budget Fit ---
  console.log('\n--- Fixture E: Bad Client / Budget Alignment ---');
  const enterpriseProfile: SellerProfile = {
    ...copywriterProfile,
    id: 'seller_enterprise',
    idealClientProfile: {
      preferredIndustries: ['Enterprise FinTech'],
      preferredClientTypes: ['Fortune 500'],
      minProjectBudget: 25000
    }
  };

  const lowBudgetCompany: Company = {
    ...baseCompany,
    customFields: { budget: '$500' }
  };

  const fitE = SellerFitEngine.evaluateOpportunityFit(heroOpportunity, enterpriseProfile, baseCompanyAnalysis.id);
  const qualE = QualificationEngine.qualifyOpportunity(heroOpportunity, fitE, enterpriseProfile, lowBudgetCompany, baseCompanyAnalysis.id);

  assert(qualE.factorScores.budgetAlignmentScore <= 35, `Fixture E budget alignment score is penalized (got ${qualE.factorScores.budgetAlignmentScore})`);
  assert(qualE.verdict === 'LOW_PRIORITY' || qualE.verdict === 'SKIP' || qualE.verdict === 'WORTH_EXPLORING', `Fixture E verdict reflects misalignment (got ${qualE.verdict})`);

  // --- FIXTURE F: Existing Client Expansion ---
  console.log('\n--- Fixture F: Existing Client Expansion ---');
  const clientCompany: Company = {
    ...baseCompany,
    relationshipType: 'existing_client'
  };

  const qualF = QualificationEngine.qualifyOpportunity(heroOpportunity, fitA, copywriterProfile, clientCompany, baseCompanyAnalysis.id);

  assert(qualF.factorScores.relationshipScore >= 90, `Fixture F relationship score has client bonus (got ${qualF.factorScores.relationshipScore})`);
  assert(qualF.verdict === 'PURSUE', 'Fixture F verdict is PURSUE');
  assert(qualF.rationale.toLowerCase().includes('client'), 'Fixture F rationale reflects existing client status');

  // --- FIXTURE G: Unknown Budget Handling ---
  console.log('\n--- Fixture G: Unknown Budget Handling ---');
  const unknownBudgetCompany: Company = {
    ...baseCompany,
    customFields: {}
  };

  const qualG = QualificationEngine.qualifyOpportunity(heroOpportunity, fitA, copywriterProfile, unknownBudgetCompany, baseCompanyAnalysis.id);

  assert(qualG.factorScores.budgetAlignmentScore === 50, `Fixture G neutral budget score is 50 (got ${qualG.factorScores.budgetAlignmentScore})`);
  assert(!isNaN(qualG.overallScore), 'Fixture G overall score is valid number');

  // --- FIXTURE H: Needs Review Opportunity Cap ---
  console.log('\n--- Fixture H: Needs Review Opportunity Cap ---');
  const needsReviewOpp: Opportunity = {
    ...heroOpportunity,
    id: 'opp_needs_review',
    status: 'needs_review',
    confidenceScore: 72
  };

  const qualH = QualificationEngine.qualifyOpportunity(needsReviewOpp, fitA, copywriterProfile, baseCompany, baseCompanyAnalysis.id);

  assert(qualH.verdict === 'WORTH_EXPLORING', `Fixture H verdict is capped at WORTH_EXPLORING (got ${qualH.verdict})`);
  assert(qualH.verdict !== 'PURSUE', 'Fixture H verdict is never PURSUE when opportunity is unverified');
  assert(qualH.hardGateTriggered === 'needs_review_opportunity', 'Fixture H triggered needs_review hard gate');

  // --- CRITICAL TEST: DO NOT FORCE A SELL ---
  console.log('\n--- Critical Test: Do Not Force A Sell ---');
  const seoSpecialistProfile: SellerProfile = {
    id: 'seller_seo_only',
    sellerName: 'Sam SEO',
    businessName: 'Organic Rank LLC',
    primaryRole: 'consultant',
    servicesOffered: [
      {
        id: 'srv_seo',
        name: 'Technical SEO & Keyword Mapping',
        category: 'SEO / Discovery',
        description: 'SEO crawls and structured data.',
        currency: 'USD',
        deliverableSummary: 'Sitemap and schema tags.',
        capabilityTags: ['SEO', 'local_discovery'],
        order: 1
      }
    ],
    servicesNotOffered: ['Copywriting', 'Design', 'Development'],
    idealClientProfile: {
      preferredIndustries: [],
      preferredClientTypes: []
    },
    proofPoints: [],
    outreachPreferences: {
      tonePreset: 'direct_consultative',
      preferredChannels: ['Email'],
      phrasesToAvoid: []
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Opportunity is purely copywriting and conversion design
  const { qualificationScores: criticalQuals, summary: criticalSummary } = QualificationEngine.qualifyAllAndSummarize(
    [heroOpportunity],
    SellerFitEngine.evaluateAllOpportunities([heroOpportunity], seoSpecialistProfile, baseCompanyAnalysis.id),
    seoSpecialistProfile,
    baseCompany,
    baseCompanyAnalysis.id
  );

  assert(criticalQuals[0].verdict !== 'PURSUE', 'Critical Test: System does NOT force PURSUE on mismatched skills');
  assert(criticalQuals[0].verdict === 'REFER_OUT' || criticalQuals[0].verdict === 'SKIP', `Critical Test: Verdict is REFER_OUT or SKIP (got ${criticalQuals[0].verdict})`);
  assert(criticalSummary.overallPriority !== 'PURSUE', `Critical Test: Summary priority is not PURSUE (got ${criticalSummary.overallPriority})`);

  console.log(`\n======================================================`);
  console.log(`Test Results: ${passed} / ${total} tests passed.`);
  console.log(`======================================================\n`);
}

runTests();
