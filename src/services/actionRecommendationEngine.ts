import type {
  Opportunity,
  SellerProfile,
  Company,
  SellerFit,
  QualificationScore,
  ActionRecommendation,
  RecommendedActionType,
  OutreachSuitability,
  CompanyActionPlan
} from '../types';

export class ActionRecommendationEngine {
  /**
   * Generates structured Action & Outreach Intelligence for a single opportunity.
   */
  static generateRecommendation(
    opportunity: Opportunity,
    sellerFit: SellerFit,
    qualificationScore: QualificationScore,
    company: Company,
    sellerProfile: SellerProfile,
    companyAnalysisId: string
  ): ActionRecommendation {
    const now = new Date().toISOString();
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const isExistingClient = company.relationshipType === 'existing_client' || (company as any).status === 'active_client';
    const hasVisualEvidence = opportunity.evidenceAssetIds && opportunity.evidenceAssetIds.length > 0;
    const hasElementRefs = opportunity.evidenceRefs && opportunity.evidenceRefs.length > 0;
    const isNeedsReview = opportunity.status === 'needs_review';

    // 1. Calculate Conversation Starter Score (0 - 100)
    // Distinct from QualificationScore: favors concrete, observable, low-friction entry points
    let starterScore = 50;

    // A. Evidence Grounding (+20 / +10)
    if (opportunity.confidenceScore >= 80) starterScore += 20;
    else if (opportunity.confidenceScore >= 65) starterScore += 10;
    else starterScore -= 15;

    // B. Concrete Visual / Screenshot Demonstration (+20)
    if (hasVisualEvidence) starterScore += 20;

    // C. Verifiable DOM element refs (+15 / +10)
    if (opportunity.evidenceRefs.length >= 2) starterScore += 15;
    else if (opportunity.evidenceRefs.length === 1) starterScore += 10;

    // D. Concrete issue archetype vs abstract overhaul (+15 / -20)
    const isConcreteFriction =
      opportunity.capabilityTags.includes('mobile') ||
      opportunity.capabilityTags.includes('lead_capture') ||
      opportunity.capabilityTags.includes('trust') ||
      opportunity.title.toLowerCase().includes('mobile') ||
      opportunity.title.toLowerCase().includes('form') ||
      opportunity.title.toLowerCase().includes('headline');

    const isAbstractOverhaul =
      opportunity.capabilityTags.includes('information_architecture') ||
      opportunity.title.toLowerCase().includes('architecture') ||
      opportunity.title.toLowerCase().includes('overhaul') ||
      opportunity.title.toLowerCase().includes('rebuild');

    if (isConcreteFriction) starterScore += 15;
    if (isAbstractOverhaul) starterScore -= 20;

    // E. Seller Fit & Matched Offer (+15 / +10)
    if (sellerFit.classification === 'strong_fit') starterScore += 15;
    else if (sellerFit.classification === 'possible_fit') starterScore += 5;
    else if (sellerFit.classification === 'outside_capability') starterScore -= 40;
    else if (sellerFit.classification === 'explicitly_excluded') starterScore -= 50;

    if (sellerFit.matchedOfferNames && sellerFit.matchedOfferNames.length > 0) {
      starterScore += 10;
    }

    // F. Needs Review / Uncertainty Penalty (-30)
    if (isNeedsReview) starterScore -= 30;

    starterScore = Math.max(0, Math.min(100, Math.round(starterScore)));

    // 2. Derive Recommended Action & Outreach Suitability
    let recommendedAction: RecommendedActionType = 'NO_ACTION';
    let outreachSuitability: OutreachSuitability = 'unsuitable';
    let starterRationale = '';

    if (sellerFit.classification === 'explicitly_excluded') {
      recommendedAction = 'NO_ACTION';
      outreachSuitability = 'unsuitable';
      starterRationale = 'Excluded from seller services. Not suitable for commercial conversation.';
    } else if (sellerFit.classification === 'outside_capability' || qualificationScore.verdict === 'REFER_OUT') {
      recommendedAction = 'REFER';
      outreachSuitability = 'unsuitable';
      starterRationale = 'Legitimate diagnostic issue, but falls outside current seller capabilities. Suitable for partner referral only.';
    } else if (qualificationScore.verdict === 'SKIP') {
      recommendedAction = 'NO_ACTION';
      outreachSuitability = 'unsuitable';
      starterRationale = 'Low commercial alignment or disqualified criteria. No sales action recommended.';
    } else if (isNeedsReview) {
      recommendedAction = 'EXPLORE';
      outreachSuitability = 'low';
      starterRationale = 'Observation requires auditor verification before referencing in client communications.';
    } else if (isExistingClient && qualificationScore.verdict === 'PURSUE') {
      recommendedAction = 'EXISTING_CLIENT_EXPANSION';
      outreachSuitability = 'high';
      starterRationale = 'High-fit expansion opportunity for active client account.';
    } else if (qualificationScore.verdict === 'PURSUE' && sellerFit.classification === 'strong_fit') {
      recommendedAction = 'OUTREACH';
      outreachSuitability = starterScore >= 70 ? 'high' : 'medium';
      starterRationale = isConcreteFriction
        ? 'High-confidence, concrete issue that the prospect can immediately observe and verify.'
        : 'Solid strategic alignment with proven seller capabilities.';
    } else if (qualificationScore.verdict === 'WORTH_EXPLORING') {
      recommendedAction = 'EXPLORE';
      outreachSuitability = 'medium';
      starterRationale = 'Viable opportunity to explore during initial discovery consultation.';
    } else {
      recommendedAction = 'MONITOR';
      outreachSuitability = 'low';
      starterRationale = 'Secondary priority. Keep on record for future project phases.';
    }

    // 3. Construct Lead Angle & Why Lead With This
    let leadAngle = '';
    let whyLeadWithThis = '';

    if (recommendedAction === 'OUTREACH' || recommendedAction === 'EXISTING_CLIENT_EXPANSION' || recommendedAction === 'EXPLORE') {
      leadAngle = opportunity.observation;
      if (hasVisualEvidence) {
        whyLeadWithThis = 'High-confidence visual evidence that is immediately verifiable by the prospect, directly paired with an active seller service.';
      } else {
        whyLeadWithThis = 'Factual, evidence-grounded observation that addresses core user experience without speculative assertions.';
      }
    } else if (recommendedAction === 'REFER') {
      leadAngle = `Identified opportunity regarding ${opportunity.title.toLowerCase()}.`;
      whyLeadWithThis = 'Defensible client opportunity that requires a partner specialist.';
    } else {
      leadAngle = '';
      whyLeadWithThis = '';
    }

    // 4. Generate Disciplined Safe Claims & Prohibited Claims
    const allowedClaims: string[] = [];
    const prohibitedClaims: string[] = [
      'Do not claim this issue is causing lost revenue or customer abandonment without analytics.',
      'Do not assert specific percentage conversion drops (e.g. "losing 40% of leads").',
      'Do not guarantee specific ranking improvements or financial returns.',
      'Do not state that visitors are leaving within seconds.'
    ];

    // Generate specific safe claims based on evidence and observation
    if (opportunity.observation) {
      allowedClaims.push(`State observed fact: "${opportunity.observation}"`);
    }
    if (opportunity.evidenceRefs.length > 0) {
      allowedClaims.push(`Reference verified element locations: ${opportunity.evidenceRefs.slice(0, 3).join(', ')}.`);
    }
    if (hasVisualEvidence) {
      allowedClaims.push('Share captured screenshot highlighting the specific section layout.');
    }
    allowedClaims.push(`Frame as visitor effort/friction: "${opportunity.businessImplication}"`);

    // 5. Matched Offer & Recommended Next Step
    const matchedOfferId = sellerFit.matchedOfferIds.length > 0 ? sellerFit.matchedOfferIds[0] : null;
    const matchedOfferName = sellerFit.matchedOfferNames.length > 0 ? sellerFit.matchedOfferNames[0] : null;

    let recommendedNextStep = '';
    if (recommendedAction === 'OUTREACH') {
      recommendedNextStep = hasVisualEvidence
        ? 'Send a concise observation with the supporting screenshot and offer a focused diagnostic review.'
        : 'Share the specific factual observation and ask if this aligns with their current conversion priorities.';
    } else if (recommendedAction === 'EXISTING_CLIENT_EXPANSION') {
      recommendedNextStep = 'Introduce during the next account review as a high-impact phase 2 milestone.';
    } else if (recommendedAction === 'REFER') {
      recommendedNextStep = 'Introduce client to a vetted partner agency or specialist who handles this capability.';
    } else if (recommendedAction === 'EXPLORE') {
      recommendedNextStep = 'Confirm client priorities and budget during preliminary discovery before scoping work.';
    } else if (recommendedAction === 'MONITOR') {
      recommendedNextStep = 'Archive as a secondary backlog item for potential future consideration.';
    } else {
      recommendedNextStep = 'No action needed.';
    }

    return {
      id: actionId,
      opportunityId: opportunity.id,
      companyAnalysisId,
      sellerProfileId: sellerProfile.id,
      recommendedAction,
      outreachSuitability,
      leadAngle,
      whyLeadWithThis,
      matchedOfferId,
      matchedOfferName,
      evidenceIds: opportunity.evidenceRefs || [],
      evidenceSummary: `${opportunity.evidenceRefs.length} element refs, ${opportunity.contributingCheckIds.length} checks, ${hasVisualEvidence ? 'screenshot captured' : 'no screenshot'}.`,
      allowedClaims,
      prohibitedClaims,
      recommendedNextStep,
      conversationStarterScore: starterScore,
      conversationStarterRationale: starterRationale,
      confidence: opportunity.confidenceScore,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Evaluates all opportunities for a company analysis and produces a consolidated Company Action Plan.
   */
  static generateCompanyActionPlan(
    opportunities: Opportunity[],
    sellerFits: SellerFit[],
    qualificationScores: QualificationScore[],
    company: Company,
    sellerProfile: SellerProfile,
    companyAnalysisId: string
  ): {
    recommendations: ActionRecommendation[];
    actionPlan: CompanyActionPlan;
  } {
    const recommendations = opportunities.map(opp => {
      const matchingFit = sellerFits.find(f => f.opportunityId === opp.id) || {
        id: `fit_unknown_${opp.id}`,
        opportunityId: opp.id,
        companyAnalysisId,
        sellerProfileId: sellerProfile.id,
        classification: 'insufficient_information' as const,
        fitScore: 20,
        matchedOfferIds: [],
        matchedOfferNames: [],
        matchedCapabilities: [],
        missingCapabilities: [...opp.capabilityTags],
        relevantProofIds: [],
        relevantProofDescriptions: [],
        rationale: 'No fit record available.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const matchingQual = qualificationScores.find(q => q.opportunityId === opp.id) || {
        id: `qual_unknown_${opp.id}`,
        opportunityId: opp.id,
        companyAnalysisId,
        sellerFitId: matchingFit.id,
        verdict: 'SKIP' as const,
        overallScore: 20,
        factorScores: {
          evidenceConfidenceScore: opp.confidenceScore,
          sellerFitScore: matchingFit.fitScore,
          impactScore: 50,
          clientAlignmentScore: 50,
          budgetAlignmentScore: 50,
          relationshipScore: 65
        },
        rationale: 'No qualification record available.',
        nextStepRecommendation: 'Evaluate opportunity first.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return this.generateRecommendation(
        opp,
        matchingFit,
        matchingQual,
        company,
        sellerProfile,
        companyAnalysisId
      );
    });

    // 1. Identify Best Qualified Opportunity (highest overall qualification score)
    const actionableQuals = [...qualificationScores]
      .filter(q => q.verdict === 'PURSUE' || q.verdict === 'WORTH_EXPLORING')
      .sort((a, b) => b.overallScore - a.overallScore);

    const topQual = actionableQuals[0];
    const topQualOpp = topQual ? opportunities.find(o => o.id === topQual.opportunityId) : undefined;

    // 2. Identify Best Conversation Starter (highest starter score among actionable recommendations)
    const actionableRecs = [...recommendations]
      .filter(r => r.recommendedAction === 'OUTREACH' || r.recommendedAction === 'EXISTING_CLIENT_EXPANSION' || r.recommendedAction === 'EXPLORE')
      .sort((a, b) => b.conversationStarterScore - a.conversationStarterScore);

    const topStarter = actionableRecs[0];
    const topStarterOpp = topStarter ? opportunities.find(o => o.id === topStarter.opportunityId) : undefined;

    // 3. Count Refer-Out and No-Action
    let referOutCount = 0;
    let noActionCount = 0;
    recommendations.forEach(r => {
      if (r.recommendedAction === 'REFER') referOutCount++;
      if (r.recommendedAction === 'NO_ACTION') noActionCount++;
    });

    // 4. Determine Recommended First Action & Divergence Rationale
    let recommendedFirstAction: RecommendedActionType = 'NO_ACTION';
    let divergenceRationale: string | undefined;
    let summaryRationale = '';

    if (topStarter) {
      recommendedFirstAction = topStarter.recommendedAction;
      const matchedOfferStr = topStarter.matchedOfferName ? ` Paired with: "${topStarter.matchedOfferName}".` : '';

      if (topQualOpp && topStarterOpp && topQualOpp.id !== topStarterOpp.id) {
        divergenceRationale = `The highest-value strategic opportunity is "${topQualOpp.title}" (Qualification: ${topQual.overallScore}/100), but "${topStarterOpp.title}" (Conversation Starter: ${topStarter.conversationStarterScore}/100) is recommended as the opening lead angle because it is more immediately observable, concrete, and verifiable without speculative claims.`;
      }

      summaryRationale = `Lead conversation with "${topStarterOpp?.title || 'Top Opportunity'}" (${topStarter.conversationStarterScore}/100 starter score).${matchedOfferStr}`;
    } else if (referOutCount > 0) {
      recommendedFirstAction = 'REFER';
      summaryRationale = `No direct seller fit. Found ${referOutCount} valid opportunity suitable for partner referral.`;
    } else {
      recommendedFirstAction = 'NO_ACTION';
      summaryRationale = 'No actionable commercial next steps identified for this company.';
    }

    const actionPlan: CompanyActionPlan = {
      companyAnalysisId,
      bestQualifiedOpportunityId: topQualOpp?.id,
      bestQualifiedOpportunityTitle: topQualOpp?.title,
      bestConversationStarterOpportunityId: topStarterOpp?.id,
      bestConversationStarterOpportunityTitle: topStarterOpp?.title,
      bestConversationStarterScore: topStarter?.conversationStarterScore,
      recommendedFirstAction,
      bestMatchedOfferName: topStarter?.matchedOfferName || undefined,
      referOutCount,
      noActionCount,
      divergenceRationale,
      summaryRationale
    };

    return {
      recommendations,
      actionPlan
    };
  }
}
