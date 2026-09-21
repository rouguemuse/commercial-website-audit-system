import type {
  Opportunity,
  SellerProfile,
  SellerFit,
  SellerFitClassification,
  OpportunityCategoryTag
} from '../types';

// Semantic alias dictionary mapping opportunity capability tags to common seller capability variations
const CAPABILITY_ALIASES: Record<string, string[]> = {
  conversion: [
    'conversion',
    'conversion_rate_optimization',
    'cro',
    'funnel_optimization',
    'landing_page_optimization',
    'lead_generation',
    'conversion_design',
    'conversion_architecture',
    'e_commerce_cro'
  ],
  messaging: [
    'messaging',
    'copywriting',
    'content_strategy',
    'value_proposition',
    'headline_writing',
    'headline_optimization',
    'brand_messaging',
    'copy_messaging',
    'content'
  ],
  UX: [
    'ux',
    'ui',
    'ui_ux_design',
    'web_design',
    'user_experience',
    'ux_audit',
    'interface_design',
    'interaction_design',
    'frontend_design',
    'design'
  ],
  mobile: [
    'mobile',
    'mobile_optimization',
    'responsive_design',
    'mobile_ux',
    'mobile_web'
  ],
  lead_capture: [
    'lead_capture',
    'lead_capture_funnels',
    'form_optimization',
    'lead_generation',
    'inquiry_flow',
    'contact_form'
  ],
  offer_structure: [
    'offer_structure',
    'offer_design',
    'pricing_strategy',
    'packaging',
    'service_structuring'
  ],
  trust: [
    'trust',
    'social_proof',
    'testimonial_design',
    'credibility',
    'trust_signals',
    'reputation'
  ],
  local_discovery: [
    'local_discovery',
    'local_seo',
    'google_business_profile',
    'local_search',
    'seo'
  ],
  SEO: [
    'seo',
    'technical_seo',
    'local_seo',
    'onpage_seo',
    'search_optimization'
  ],
  information_architecture: [
    'information_architecture',
    'site_architecture',
    'navigation_design',
    'menu_structure'
  ],
  automation: [
    'automation',
    'workflow_automation',
    'email_automation',
    'crm_integration',
    'zapier',
    'hubspot'
  ],
  content: [
    'content',
    'copywriting',
    'content_strategy',
    'blogging',
    'editorial'
  ]
};

// Required Capability Groupings for Stage 3B.1 Precision Hardening
interface RequiredCapabilityGroup {
  name: string;
  matchesOpportunity: (opp: Opportunity) => boolean;
  requiredSkills: string[];
  broadTags: string[];
}

const REQUIRED_CAPABILITY_GROUPS: RequiredCapabilityGroup[] = [
  {
    name: 'mobile_cta_implementation',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('mobile') ||
      opp.title.toLowerCase().includes('mobile') ||
      (opp.contributingCheckIds || []).some(c => ['chk_25', 'chk_26', 'chk_27', 'chk_28'].includes(c)),
    requiredSkills: [
      'responsive_design',
      'mobile_ux',
      'mobile_web',
      'frontend_implementation',
      'mobile_optimization'
    ],
    broadTags: ['ux', 'ui', 'design', 'conversion', 'marketing', 'development']
  },
  {
    name: 'value_proposition_messaging',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('messaging') ||
      opp.title.toLowerCase().includes('messaging') ||
      opp.title.toLowerCase().includes('value proposition') ||
      opp.title.toLowerCase().includes('hero') ||
      (opp.contributingCheckIds || []).some(c => ['chk_1', 'chk_2', 'chk_3', 'chk_4'].includes(c)),
    requiredSkills: [
      'conversion_copywriting',
      'copywriting',
      'positioning_strategy',
      'brand_messaging',
      'value_proposition',
      'headline_optimization'
    ],
    broadTags: ['ux', 'ui', 'design', 'conversion', 'marketing', 'content']
  },
  {
    name: 'lead_capture_conversion_flow',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('lead_capture') ||
      opp.title.toLowerCase().includes('lead capture') ||
      opp.title.toLowerCase().includes('form') ||
      (opp.contributingCheckIds || []).some(c => ['chk_13', 'chk_14', 'chk_15', 'chk_16'].includes(c)),
    requiredSkills: [
      'lead_capture_funnels',
      'form_optimization',
      'conversion_rate_optimization',
      'conversion_architecture',
      'cro',
      'frontend_implementation'
    ],
    broadTags: ['ux', 'ui', 'design', 'conversion', 'marketing', 'development']
  },
  {
    name: 'local_discovery',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('local_discovery') ||
      opp.title.toLowerCase().includes('local') ||
      (opp.contributingCheckIds || []).some(c => ['chk_17', 'chk_18', 'chk_19', 'chk_20', 'chk_21', 'chk_22'].includes(c)),
    requiredSkills: [
      'local_seo',
      'local_discovery_strategy',
      'google_business_profile'
    ],
    broadTags: ['seo', 'marketing']
  },
  {
    name: 'technical_seo',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('SEO') ||
      opp.title.toLowerCase().includes('seo') ||
      opp.title.toLowerCase().includes('search ranking'),
    requiredSkills: [
      'technical_seo',
      'search_optimization',
      'onpage_seo'
    ],
    broadTags: ['marketing', 'seo']
  },
  {
    name: 'workflow_automation',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('automation') ||
      opp.title.toLowerCase().includes('automation') ||
      opp.title.toLowerCase().includes('crm') ||
      (opp.contributingCheckIds || []).some(c => ['chk_29', 'chk_30'].includes(c)),
    requiredSkills: [
      'workflow_automation',
      'email_automation',
      'integration_engineering',
      'crm_integration',
      'zapier'
    ],
    broadTags: ['marketing', 'automation']
  },
  {
    name: 'information_architecture',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('information_architecture') ||
      opp.title.toLowerCase().includes('navigation') ||
      opp.title.toLowerCase().includes('architecture') ||
      (opp.contributingCheckIds || []).some(c => ['chk_23', 'chk_24'].includes(c)),
    requiredSkills: [
      'information_architecture',
      'navigation_design',
      'site_architecture'
    ],
    broadTags: ['ux', 'ui', 'design']
  },
  {
    name: 'offer_structuring',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('offer_structure') ||
      opp.title.toLowerCase().includes('offer') ||
      opp.title.toLowerCase().includes('scope') ||
      (opp.contributingCheckIds || []).some(c => ['chk_5', 'chk_6', 'chk_11', 'chk_12'].includes(c)),
    requiredSkills: [
      'pricing_strategy',
      'offer_design',
      'packaging',
      'service_structuring'
    ],
    broadTags: ['marketing', 'conversion', 'ux']
  },
  {
    name: 'social_proof_trust',
    matchesOpportunity: (opp) =>
      opp.capabilityTags.includes('trust') ||
      opp.title.toLowerCase().includes('proof') ||
      opp.title.toLowerCase().includes('trust') ||
      (opp.contributingCheckIds || []).some(c => ['chk_7', 'chk_8', 'chk_9', 'chk_10'].includes(c)),
    requiredSkills: [
      'social_proof',
      'testimonial_design',
      'trust_signals',
      'reputation_management'
    ],
    broadTags: ['ux', 'ui', 'design', 'marketing']
  }
];

function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/[\s_-]+/g, '_');
}

export class SellerFitEngine {
  /**
   * Evaluates an individual opportunity against a seller profile.
   */
  static evaluateOpportunityFit(
    opportunity: Opportunity,
    sellerProfile: SellerProfile,
    companyAnalysisId: string
  ): SellerFit {
    const now = new Date().toISOString();
    const fitId = `fit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Support both canonical SellerProfile fields and test fixtures
    const rawOffers = sellerProfile.servicesOffered || (sellerProfile as any).offers || [];
    const exclusions = sellerProfile.servicesNotOffered || (sellerProfile as any).exclusions || [];
    const rawProofPoints = sellerProfile.proofPoints || [];

    // Extract seller capabilities from offers, direct array, and tag sets
    const explicitCapabilities = (sellerProfile as any).capabilities || [];
    const offerCapabilities = rawOffers.flatMap((o: any) => o.capabilityTags || []);
    const allCapabilities: string[] = Array.from(new Set([...explicitCapabilities, ...offerCapabilities]));

    // 1. Check for Insufficient Seller Information
    if (allCapabilities.length === 0 && rawOffers.length === 0) {
      return {
        id: fitId,
        opportunityId: opportunity.id,
        companyAnalysisId,
        sellerProfileId: sellerProfile.id,
        classification: 'insufficient_information',
        fitScore: 20,
        matchedOfferIds: [],
        matchedOfferNames: [],
        matchedCapabilities: [],
        missingCapabilities: [...opportunity.capabilityTags],
        relevantProofIds: [],
        relevantProofDescriptions: [],
        rationale: 'Seller profile does not have capabilities or active services specified to evaluate fit.',
        createdAt: now,
        updatedAt: now
      };
    }

    // 2. HARD GATE: Explicit Exclusions Check
    const oppSearchCorpus = [
      opportunity.title,
      opportunity.observation,
      opportunity.proposedOpportunity,
      opportunity.recommendedAction,
      ...opportunity.capabilityTags
    ].join(' ').toLowerCase();

    for (const exclusion of exclusions) {
      const cleanExclusion = exclusion.toLowerCase().trim();
      if (!cleanExclusion) continue;

      const normExclusion = normalizeString(cleanExclusion);
      const regex = new RegExp(`\\b${cleanExclusion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const tagMatch = opportunity.capabilityTags.some(t => {
        const normT = normalizeString(t);
        return normT.includes(normExclusion) || normExclusion.includes(normT);
      });

      if (regex.test(oppSearchCorpus) || tagMatch) {
        return {
          id: fitId,
          opportunityId: opportunity.id,
          companyAnalysisId,
          sellerProfileId: sellerProfile.id,
          classification: 'explicitly_excluded',
          fitScore: 0,
          matchedOfferIds: [],
          matchedOfferNames: [],
          matchedCapabilities: [],
          missingCapabilities: [...opportunity.capabilityTags],
          relevantProofIds: [],
          relevantProofDescriptions: [],
          rationale: `Matches explicit seller exclusion: "${exclusion}". Seller does not offer or accept this work.`,
          exclusionTriggered: exclusion,
          createdAt: now,
          updatedAt: now
        };
      }
    }

    // 3. Stage 3B.1: Check Required Capabilities Precision Gate
    const matchingReqGroups = REQUIRED_CAPABILITY_GROUPS.filter(g => g.matchesOpportunity(opportunity));
    let hasSpecificRequiredSkill = false;
    let requiredSkillShortfall: string[] = [];

    const normalizedSellerSkills = new Set<string>([
      ...allCapabilities.map(c => normalizeString(c)),
      ...rawOffers.flatMap((o: any) => (o.capabilityTags || []).map((t: string) => normalizeString(t)))
    ]);

    if (matchingReqGroups.length > 0) {
      const allRequiredSkills = matchingReqGroups.flatMap(g => g.requiredSkills);
      hasSpecificRequiredSkill = allRequiredSkills.some(rs => {
        const normRS = normalizeString(rs);
        return Array.from(normalizedSellerSkills).some(s => s === normRS || s.includes(normRS));
      });

      if (!hasSpecificRequiredSkill) {
        requiredSkillShortfall = matchingReqGroups.flatMap(g => g.requiredSkills.slice(0, 2));
      }
    } else {
      hasSpecificRequiredSkill = true; // No specialized group constraint
    }

    // 4. Match Capabilities via Semantic Aliasing
    const normalizedSellerCapabilities = allCapabilities.map(c => normalizeString(c));
    const matchedCapabilities: string[] = [];
    const missingCapabilities: string[] = [];

    for (const oppTag of opportunity.capabilityTags) {
      const normalizedTag = normalizeString(oppTag);
      const aliases = CAPABILITY_ALIASES[oppTag] || CAPABILITY_ALIASES[normalizedTag] || [normalizedTag];

      const isMatched = normalizedSellerCapabilities.some(sc =>
        aliases.some(alias => sc === alias || sc.includes(alias))
      );

      if (isMatched) {
        matchedCapabilities.push(oppTag);
      } else {
        missingCapabilities.push(oppTag);
      }
    }

    // 5. Match Services / Offers (Strict: Requires specific capability or domain alignment)
    const matchedOffers = rawOffers.filter((offer: any) => {
      const offerTags = (offer.capabilityTags || []).map((t: string) => normalizeString(t));
      const offerCorpus = `${offer.name} ${offer.deliverableSummary || offer.deliverables?.join(' ') || ''} ${offer.description || ''}`.toLowerCase();

      // If opportunity has required skills, the offer must carry at least one required skill or specific domain title
      if (matchingReqGroups.length > 0) {
        const allReqSkills = matchingReqGroups.flatMap(g => g.requiredSkills.map(s => normalizeString(s)));
        const tagHit = offerTags.some((ot: string) => allReqSkills.some(rs => ot === rs || ot.includes(rs)));
        const titleHit = matchingReqGroups.some(g => {
          const keyword = g.name.split('_')[0];
          return offer.name.toLowerCase().includes(keyword) && keyword.length > 3;
        });
        return tagHit || titleHit;
      }

      // Fallback matching
      const tagHit = opportunity.capabilityTags.some(t => {
        const aliases = CAPABILITY_ALIASES[t] || [t.toLowerCase()];
        return aliases.some(a => a.length > 3 && offerCorpus.includes(a.replace(/_/g, ' ')));
      });
      return tagHit;
    });

    const matchedOfferIds = matchedOffers.map((o: any) => o.id);
    const matchedOfferNames = matchedOffers.map((o: any) => o.name);

    // 6. Match Proof Points
    const matchedProofs = rawProofPoints.filter((proof: any) => {
      const proofCorpus = `${proof.title || ''} ${proof.description || ''} ${proof.metric || ''} ${proof.context || ''} ${(proof.tags || []).join(' ')}`.toLowerCase();
      return opportunity.capabilityTags.some(t => {
        const aliases = CAPABILITY_ALIASES[t] || [t.toLowerCase()];
        return aliases.some(a => a.length > 3 && proofCorpus.includes(a.replace(/_/g, ' ')));
      });
    });

    const relevantProofIds = matchedProofs.map((p: any) => p.id);
    const relevantProofDescriptions = matchedProofs.map((p: any) => p.title || p.description || p.metric || 'Verified past result');

    // 7. Calculate Fit Score (0-100)
    let score = 0;

    // Capability Match component (max 50 pts)
    if (opportunity.capabilityTags.length > 0) {
      const matchRatio = matchedCapabilities.length / opportunity.capabilityTags.length;
      score += Math.round(matchRatio * 50);
    } else {
      score += 25;
    }

    // Offer/Service Match component (max 30 pts)
    if (matchedOffers.length > 0) {
      score += 30;
    } else if (hasSpecificRequiredSkill && matchedCapabilities.length > 0) {
      score += 15; // Seller has verified skill even if not distinct packaged offer
    }

    // Proof Points component (max 20 pts)
    if (matchedProofs.length >= 2) {
      score += 20;
    } else if (matchedProofs.length === 1) {
      score += 10;
    }

    // Stage 3B.1: If seller only has broad keyword overlap without specific required capability:
    // Cap score at 45 to prevent false-positive strong_fit
    if (!hasSpecificRequiredSkill) {
      score = Math.min(score, 45);
    }

    score = Math.max(0, Math.min(100, score));

    // 8. Determine Classification
    let classification: SellerFitClassification;
    let rationale = '';

    if (matchedCapabilities.length === 0 && matchedOffers.length === 0) {
      classification = 'outside_capability';
      score = Math.min(score, 15);
      rationale = `Outside current capability: Seller does not list skills matching ${missingCapabilities.join(', ') || 'required areas'}.`;
    } else if (!hasSpecificRequiredSkill) {
      // Broad keyword overlap without specific required skill -> strictly capped at possible_fit
      classification = 'possible_fit';
      const shortfallStr = requiredSkillShortfall.length > 0 ? ` (Lacks specialized skill: ${requiredSkillShortfall.join(', ')})` : '';
      rationale = `Partial fit: Broad keyword overlap across ${matchedCapabilities.join(', ')}, but lacks specific required execution skill${shortfallStr}.`;
    } else if (score >= 65 && (matchedOffers.length > 0 || matchedCapabilities.length === opportunity.capabilityTags.length)) {
      classification = 'strong_fit';
      const offerStr = matchedOfferNames.length > 0 ? ` Matched with service: "${matchedOfferNames[0]}".` : '';
      const proofStr = relevantProofDescriptions.length > 0 ? ` Supported by proof: "${relevantProofDescriptions[0]}".` : '';
      rationale = `Direct capability match across ${matchedCapabilities.join(', ')}.${offerStr}${proofStr}`;
    } else if (score >= 35 || matchedCapabilities.length > 0) {
      classification = 'possible_fit';
      const missingStr = missingCapabilities.length > 0 ? ` (Missing: ${missingCapabilities.join(', ')})` : '';
      rationale = `Partial capability match across ${matchedCapabilities.join(', ')}.${missingStr}`;
    } else {
      classification = 'outside_capability';
      rationale = `Limited capability alignment (${matchedCapabilities.join(', ') || 'none'}).`;
    }

    return {
      id: fitId,
      opportunityId: opportunity.id,
      companyAnalysisId,
      sellerProfileId: sellerProfile.id,
      classification,
      fitScore: score,
      matchedOfferIds,
      matchedOfferNames,
      matchedCapabilities,
      missingCapabilities,
      relevantProofIds,
      relevantProofDescriptions,
      rationale,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Batch evaluates all opportunities for a company analysis against the seller profile.
   */
  static evaluateAllOpportunities(
    opportunities: Opportunity[],
    sellerProfile: SellerProfile,
    companyAnalysisId: string
  ): SellerFit[] {
    return opportunities.map(opp =>
      this.evaluateOpportunityFit(opp, sellerProfile, companyAnalysisId)
    );
  }
}
