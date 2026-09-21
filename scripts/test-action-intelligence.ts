import { OpportunityDetectionService } from '../src/services/opportunityDetectionService';
import { SellerFitEngine } from '../src/services/sellerFitEngine';
import { QualificationEngine } from '../src/services/qualificationEngine';
import { ActionRecommendationEngine } from '../src/services/actionRecommendationEngine';
import type {
  Opportunity,
  SellerProfile,
  Company,
  CompanyAnalysis
} from '../src/types';

function runTests() {
  console.log('=== Stage 3B.1 + 3C: Action & Outreach Intelligence Test Suite ===\n');
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

  // --- Base Entities ---
  const companyProspect: Company = {
    id: 'comp_prospect_1',
    name: 'Precision Roofing & Solar',
    websiteUrl: 'https://precisionroofing.example',
    relationshipType: 'prospect',
    industry: 'Roofing Contractors',
    location: 'Denver, CO',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const analysisProspect: CompanyAnalysis = {
    id: 'ana_1',
    companyId: 'comp_prospect_1',
    sellerProfileId: 'seller_conversion_expert',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sellerProfile: SellerProfile = {
    id: 'seller_conversion_expert',
    sellerName: 'Marcus Miller',
    businessName: 'Apex Conversion Lab',
    primaryRole: 'consultant',
    servicesOffered: [
      {
        id: 'srv_mobile_cro',
        name: 'Mobile Conversion & Tap-to-Action Sprint',
        category: 'Design',
        description: 'Streamline mobile viewports with sticky tap-to-call bars and fast quote buttons.',
        currency: 'USD',
        deliverableSummary: 'Mobile CTA redesign and tap target optimization.',
        capabilityTags: ['mobile', 'conversion', 'responsive_design', 'mobile_ux'],
        order: 1
      },
      {
        id: 'srv_hero_revamp',
        name: 'Homepage Hero & Messaging Overhaul',
        category: 'Copy / Messaging',
        description: 'Rewrite above-the-fold value proposition and conversion hooks.',
        currency: 'USD',
        deliverableSummary: 'Headline wireframes and high-converting copy.',
        capabilityTags: ['messaging', 'conversion', 'conversion_copywriting', 'positioning_strategy'],
        order: 2
      }
    ],
    servicesNotOffered: ['PPC Management', 'Custom PHP CRM Development'],
    idealClientProfile: {
      preferredIndustries: ['Roofing Contractors', 'Trade Contractors'],
      preferredClientTypes: ['Residential & Commercial Services'],
      minProjectBudget: 2500
    },
    proofPoints: [
      {
        id: 'proof_mobile',
        title: 'Mobile lead rate lift for roofing contractor',
        description: 'Added persistent mobile call bar resulting in verified mobile inquiry increase.',
        tags: ['mobile', 'conversion'],
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

  // Opportunity 1: Concrete Mobile CTA issue with visual evidence
  const mobileOpportunity: Opportunity = {
    id: 'opp_mobile_cta',
    companyAnalysisId: 'ana_1',
    companyId: 'comp_prospect_1',
    title: 'Mobile Experience & Tap-to-Action Accessibility',
    observation: 'On mobile viewports, the primary estimate phone number is non-clickable text and the quote button is below the 2nd screenfold.',
    evidenceRefs: ['HOME.mobile.header_phone', 'HOME.mobile.cta_quote'],
    evidenceAssetIds: ['snap_mobile_hero_1'],
    evidenceText: ['[Mobile Audit]: Phone number is rendered as plain text span instead of tel: link.'],
    businessImplication: 'Mobile visitors seeking an immediate consultation must manually memorize or copy phone digits.',
    proposedOpportunity: 'Implement sticky tap-to-call mobile header with 1-tap quote trigger.',
    recommendedAction: 'Deploy persistent mobile contact bar and convert all phone instances to native tel: links.',
    capabilityTags: ['mobile', 'conversion', 'UX'],
    estimatedImpact: 'high',
    implicationBasis: 'inferred_risk',
    confidenceScore: 92,
    status: 'detected',
    contributingCheckIds: ['chk_25', 'chk_26'],
    primaryCheckId: 'chk_25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Opportunity 2: High-impact Information Architecture Overhaul (Complex / Abstract)
  const iaOpportunity: Opportunity = {
    id: 'opp_ia_overhaul',
    companyAnalysisId: 'ana_1',
    companyId: 'comp_prospect_1',
    title: 'Information Architecture & Navigation Flow Overhaul',
    observation: 'Navigation contains 14 top-level menu items with nested dropdowns obscuring primary services.',
    evidenceRefs: ['HOME.header.nav_menu'],
    evidenceAssetIds: [],
    evidenceText: ['[Navigation Audit]: 14 top-level menu items found in desktop header.'],
    businessImplication: 'Prospective buyers face decision paralysis when searching for specialized service categories.',
    proposedOpportunity: 'Consolidate 14 menu links into 4 core service buckets and consultation flow.',
    recommendedAction: 'Restructure header information architecture and service taxonomy.',
    capabilityTags: ['information_architecture', 'UX'],
    estimatedImpact: 'high',
    implicationBasis: 'inferred_risk',
    confidenceScore: 86,
    status: 'detected',
    contributingCheckIds: ['chk_23', 'chk_24'],
    primaryCheckId: 'chk_23',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // --- TEST A: Strong verified opportunity + strong seller fit -> OUTREACH ---
  console.log('--- Test A: Strong Verified Opportunity + Strong Seller Fit ---');
  const fitMobile = SellerFitEngine.evaluateOpportunityFit(mobileOpportunity, sellerProfile, analysisProspect.id);
  const qualMobile = QualificationEngine.qualifyOpportunity(mobileOpportunity, fitMobile, sellerProfile, companyProspect, analysisProspect.id);
  const recMobile = ActionRecommendationEngine.generateRecommendation(mobileOpportunity, fitMobile, qualMobile, companyProspect, sellerProfile, analysisProspect.id);

  assert(fitMobile.classification === 'strong_fit', 'Test A: SellerFit is strong_fit');
  assert(qualMobile.verdict === 'PURSUE', 'Test A: Qualification verdict is PURSUE');
  assert(recMobile.recommendedAction === 'OUTREACH', `Test A: Recommended action is OUTREACH (got ${recMobile.recommendedAction})`);
  assert(recMobile.outreachSuitability === 'high', 'Test A: Outreach suitability is high');
  assert(recMobile.matchedOfferName === 'Mobile Conversion & Tap-to-Action Sprint', 'Test A: Matched with packaged offer');

  // --- TEST B: Highest Qualification Score != Best Conversation Starter ---
  console.log('\n--- Test B: Qualification Ranking vs Conversation Starter Ranking ---');
  // IA Overhaul has high qualification, but mobile CTA is concrete, demonstrable, with screenshot asset
  const fitIA = SellerFitEngine.evaluateOpportunityFit(iaOpportunity, sellerProfile, analysisProspect.id);
  const qualIA = QualificationEngine.qualifyOpportunity(iaOpportunity, fitIA, sellerProfile, companyProspect, analysisProspect.id);
  const recIA = ActionRecommendationEngine.generateRecommendation(iaOpportunity, fitIA, qualIA, companyProspect, sellerProfile, analysisProspect.id);

  assert(recMobile.conversationStarterScore > recIA.conversationStarterScore, `Test B: Mobile CTA starter score (${recMobile.conversationStarterScore}) > IA Overhaul starter score (${recIA.conversationStarterScore})`);
  assert(recMobile.conversationStarterScore >= 80, `Test B: Mobile CTA receives high starter score (got ${recMobile.conversationStarterScore})`);

  // --- TEST C: Outside Seller Capability -> REFER ---
  console.log('\n--- Test C: Outside Seller Capability ---');
  const backendProfile: SellerProfile = {
    ...sellerProfile,
    id: 'seller_backend_only',
    servicesOffered: [
      {
        id: 'srv_db',
        name: 'Database Migration',
        category: 'Development',
        description: 'SQL database tuning.',
        currency: 'USD',
        deliverableSummary: 'SQL scripts',
        capabilityTags: ['database', 'development'],
        order: 1
      }
    ]
  };
  const fitBackend = SellerFitEngine.evaluateOpportunityFit(mobileOpportunity, backendProfile, analysisProspect.id);
  const qualBackend = QualificationEngine.qualifyOpportunity(mobileOpportunity, fitBackend, backendProfile, companyProspect, analysisProspect.id);
  const recBackend = ActionRecommendationEngine.generateRecommendation(mobileOpportunity, fitBackend, qualBackend, companyProspect, backendProfile, analysisProspect.id);

  assert(recBackend.recommendedAction === 'REFER', `Test C: Recommended action is REFER (got ${recBackend.recommendedAction})`);
  assert(recBackend.outreachSuitability === 'unsuitable', 'Test C: Outreach suitability is unsuitable');
  assert(recBackend.recommendedNextStep.toLowerCase().includes('partner') || recBackend.recommendedNextStep.toLowerCase().includes('refer'), 'Test C: Next step recommends partner referral');

  // --- TEST D: Explicit Exclusion -> NO_ACTION / REFER (Never OUTREACH) ---
  console.log('\n--- Test D: Explicit Exclusion ---');
  const ppcOpportunity: Opportunity = {
    ...mobileOpportunity,
    id: 'opp_ppc_custom',
    title: 'PPC Management & Ad Campaign Scaling',
    capabilityTags: ['ppc', 'conversion'] as any
  };
  const fitPPC = SellerFitEngine.evaluateOpportunityFit(ppcOpportunity, sellerProfile, analysisProspect.id);
  const qualPPC = QualificationEngine.qualifyOpportunity(ppcOpportunity, fitPPC, sellerProfile, companyProspect, analysisProspect.id);
  const recPPC = ActionRecommendationEngine.generateRecommendation(ppcOpportunity, fitPPC, qualPPC, companyProspect, sellerProfile, analysisProspect.id);

  assert(recPPC.recommendedAction === 'NO_ACTION' || recPPC.recommendedAction === 'REFER', `Test D: Excluded service produces NO_ACTION/REFER (got ${recPPC.recommendedAction})`);
  assert(recPPC.recommendedAction !== 'OUTREACH', 'Test D: Excluded service NEVER produces OUTREACH');

  // --- TEST E: Needs-Review Evidence -> Cannot Produce Confident Outreach ---
  console.log('\n--- Test E: Needs-Review Evidence ---');
  const needsReviewMobile: Opportunity = {
    ...mobileOpportunity,
    id: 'opp_needs_review_mob',
    status: 'needs_review',
    confidenceScore: 68
  };
  const qualReview = QualificationEngine.qualifyOpportunity(needsReviewMobile, fitMobile, sellerProfile, companyProspect, analysisProspect.id);
  const recReview = ActionRecommendationEngine.generateRecommendation(needsReviewMobile, fitMobile, qualReview, companyProspect, sellerProfile, analysisProspect.id);

  assert(recReview.recommendedAction !== 'OUTREACH', `Test E: Needs-review opportunity does not produce OUTREACH (got ${recReview.recommendedAction})`);
  assert(recReview.outreachSuitability === 'low', 'Test E: Outreach suitability is low');
  assert(recReview.conversationStarterRationale.toLowerCase().includes('verification'), 'Test E: Rationale requires auditor verification');

  // --- TEST F: No Matched Existing Offer -> Does Not Invent One ---
  console.log('\n--- Test F: No Matched Existing Offer ---');
  const generalSkillProfile: SellerProfile = {
    ...sellerProfile,
    id: 'seller_general_skills',
    servicesOffered: [] // No packaged offers
  };
  // Provide raw capability only
  (generalSkillProfile as any).capabilities = ['responsive_design', 'mobile_ux', 'frontend_development'];

  const fitGeneral = SellerFitEngine.evaluateOpportunityFit(mobileOpportunity, generalSkillProfile, analysisProspect.id);
  const qualGeneral = QualificationEngine.qualifyOpportunity(mobileOpportunity, fitGeneral, generalSkillProfile, companyProspect, analysisProspect.id);
  const recGeneral = ActionRecommendationEngine.generateRecommendation(mobileOpportunity, fitGeneral, qualGeneral, companyProspect, generalSkillProfile, analysisProspect.id);

  assert(recGeneral.matchedOfferId === null, 'Test F: matchedOfferId is null');
  assert(recGeneral.matchedOfferName === null, 'Test F: matchedOfferName is null');

  // --- TEST G: Unsupported Numeric / Revenue Claim -> Prohibited ---
  console.log('\n--- Test G: Claim-Safety Boundaries ---');
  assert(recMobile.prohibitedClaims.some(c => c.toLowerCase().includes('revenue')), 'Test G: Revenue claim is prohibited');
  assert(recMobile.prohibitedClaims.some(c => c.toLowerCase().includes('abandonment') || c.toLowerCase().includes('percentage') || c.toLowerCase().includes('conversion')), 'Test G: Percentage/abandonment claim is prohibited');
  assert(recMobile.allowedClaims.length > 0, 'Test G: Specific factual safe claims generated');

  // --- TEST H: Existing Client + Legitimate Expansion Opportunity -> EXISTING_CLIENT_EXPANSION ---
  console.log('\n--- Test H: Existing Client Expansion ---');
  const existingClientComp: Company = {
    ...companyProspect,
    relationshipType: 'existing_client'
  };
  const qualClient = QualificationEngine.qualifyOpportunity(mobileOpportunity, fitMobile, sellerProfile, existingClientComp, analysisProspect.id);
  const recClient = ActionRecommendationEngine.generateRecommendation(mobileOpportunity, fitMobile, qualClient, existingClientComp, sellerProfile, analysisProspect.id);

  assert(recClient.recommendedAction === 'EXISTING_CLIENT_EXPANSION', `Test H: Recommended action is EXISTING_CLIENT_EXPANSION (got ${recClient.recommendedAction})`);
  assert(recClient.recommendedNextStep.toLowerCase().includes('account review') || recClient.recommendedNextStep.toLowerCase().includes('client'), 'Test H: Recommended next step is consultative account milestone');

  // --- TEST I: Strong Opportunity but Poor Commercial Budget Alignment -> Does Not Force OUTREACH ---
  console.log('\n--- Test I: Strong Opportunity with Low Budget ---');
  const lowBudgetCompany: Company = {
    ...companyProspect,
    customFields: { budget: '$400' } // Seller min is $2,500
  };
  const qualLowBudget = QualificationEngine.qualifyOpportunity(mobileOpportunity, fitMobile, sellerProfile, lowBudgetCompany, analysisProspect.id);
  const recLowBudget = ActionRecommendationEngine.generateRecommendation(mobileOpportunity, fitMobile, qualLowBudget, lowBudgetCompany, sellerProfile, analysisProspect.id);

  assert(qualLowBudget.verdict === 'LOW_PRIORITY' || qualLowBudget.verdict === 'SKIP', `Test I: Budget mismatch prevents PURSUE (got ${qualLowBudget.verdict})`);
  assert(recLowBudget.recommendedAction === 'NO_ACTION' || recLowBudget.recommendedAction === 'MONITOR', `Test I: Budget mismatch does not produce OUTREACH (got ${recLowBudget.recommendedAction})`);

  // --- TEST J: Broad Semantic Keyword Overlap Without Required Capability -> Not Strong Fit ---
  console.log('\n--- Test J: Broad Semantic Keyword Overlap Prevention ---');
  const broadKeywordOnlyProfile: SellerProfile = {
    id: 'seller_broad_keywords',
    sellerName: 'Gene Generic',
    businessName: 'Generic Agency',
    primaryRole: 'agency',
    servicesOffered: [
      {
        id: 'srv_general_marketing',
        name: 'General Marketing Strategy',
        category: 'Marketing',
        description: 'General UX and conversion consulting.',
        currency: 'USD',
        deliverableSummary: 'Slide deck',
        capabilityTags: ['UX', 'conversion', 'marketing'], // Broad tags only, no responsive_design / frontend_implementation
        order: 1
      }
    ],
    servicesNotOffered: [],
    idealClientProfile: { preferredIndustries: [], preferredClientTypes: [] },
    proofPoints: [],
    outreachPreferences: { tonePreset: 'direct_consultative', preferredChannels: ['Email'], phrasesToAvoid: [] },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const fitBroad = SellerFitEngine.evaluateOpportunityFit(mobileOpportunity, broadKeywordOnlyProfile, analysisProspect.id);

  assert(fitBroad.classification === 'possible_fit', `Test J: Broad keyword profile is capped at possible_fit (got ${fitBroad.classification})`);
  assert(fitBroad.classification !== 'strong_fit', 'Test J: Broad keyword profile is NOT strong_fit without required capability');
  assert(fitBroad.fitScore <= 50, `Test J: Fit score is capped (got ${fitBroad.fitScore})`);

  // --- TEST K: Unknown Budget Model Neutrality ---
  console.log('\n--- Test K: Unknown Budget Model ---');
  const unknownBudgetComp: Company = {
    ...companyProspect,
    customFields: {}
  };
  const qualUnknown = QualificationEngine.qualifyOpportunity(mobileOpportunity, fitMobile, sellerProfile, unknownBudgetComp, analysisProspect.id);

  assert(qualUnknown.factorScores.budgetAlignmentScore === 50, `Test K: Unknown budget receives exactly 50/100 neutral score (got ${qualUnknown.factorScores.budgetAlignmentScore})`);
  assert(qualUnknown.factorScores.budgetStatus === 'unknown', `Test K: budgetStatus is explicitly 'unknown' (got ${qualUnknown.factorScores.budgetStatus})`);

  // --- TEST L: Company-Level Action Plan Aggregation & Divergence ---
  console.log('\n--- Test L: Company Action Plan Aggregation ---');
  const { recommendations, actionPlan } = ActionRecommendationEngine.generateCompanyActionPlan(
    [mobileOpportunity, iaOpportunity],
    [fitMobile, fitIA],
    [qualMobile, qualIA],
    companyProspect,
    sellerProfile,
    analysisProspect.id
  );

  assert(recommendations.length === 2, 'Test L: Generated 2 action recommendations');
  assert(actionPlan.bestConversationStarterOpportunityId === mobileOpportunity.id, 'Test L: Mobile CTA chosen as best conversation starter');
  assert(actionPlan.recommendedFirstAction === 'OUTREACH', `Test L: Recommended first action is OUTREACH (got ${actionPlan.recommendedFirstAction})`);
  assert(actionPlan.bestMatchedOfferName === 'Mobile Conversion & Tap-to-Action Sprint', 'Test L: Best matched offer captured');

  console.log(`\n======================================================`);
  console.log(`Test Results: ${passed} / ${total} tests passed.`);
  console.log(`======================================================\n`);
}

runTests();
