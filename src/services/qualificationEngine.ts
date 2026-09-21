import type {
  Opportunity,
  SellerProfile,
  Company,
  SellerFit,
  QualificationScore,
  QualificationVerdict,
  QualificationFactorScores,
  QualificationHardGate,
  CompanyQualificationSummary
} from '../types';

export class QualificationEngine {
  /**
   * Qualifies a single opportunity for a specific company and seller profile.
   */
  static qualifyOpportunity(
    opportunity: Opportunity,
    sellerFit: SellerFit,
    sellerProfile: SellerProfile,
    company: Company,
    companyAnalysisId: string
  ): QualificationScore {
    const now = new Date().toISOString();
    const qualId = `qual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Calculate Factor Scores (0 - 100)

    // Factor 1: Evidence Confidence (0-100 from Opportunity)
    const evidenceConfidenceScore = Math.max(0, Math.min(100, opportunity.confidenceScore));

    // Factor 2: Seller Fit Score (0-100 from SellerFit)
    const sellerFitScore = Math.max(0, Math.min(100, sellerFit.fitScore));

    // Factor 3: Impact Score
    let impactScore = 65;
    if (opportunity.estimatedImpact === 'high') impactScore = 90;
    else if (opportunity.estimatedImpact === 'medium') impactScore = 65;
    else if (opportunity.estimatedImpact === 'low') impactScore = 40;

    // Factor 4: Ideal Client Alignment Score
    let clientAlignmentScore = 60; // neutral baseline when seller has no strict industry preference
    const companyIndustry = (company.industry || '').toLowerCase();
    const idealIndustries = sellerProfile.idealClientProfile?.preferredIndustries ||
      (sellerProfile as any).idealClientProfiles ||
      [];

    if (idealIndustries.length > 0) {
      if (companyIndustry) {
        const isDirectIndustryMatch = idealIndustries.some((profile: string) => {
          const pNorm = profile.toLowerCase();
          return companyIndustry.includes(pNorm) || pNorm.includes(companyIndustry);
        });
        clientAlignmentScore = isDirectIndustryMatch ? 95 : 25; // Significant penalty if seller explicitly targets specific industries and company doesn't match
      } else {
        clientAlignmentScore = 50; // Unknown industry
      }
    }

    // Factor 5: Budget Alignment Score (Explicit Model)
    let budgetAlignmentScore = 50; // genuinely neutral baseline for unknown budget
    let budgetStatus: import('../types').BudgetAlignmentStatus = 'unknown';

    const minBudget = sellerProfile.idealClientProfile?.minProjectBudget || (sellerProfile as any).minProjectSize;
    const customFields = company.customFields || {};
    const statedBudget = customFields.budget || customFields.budget_range || (company as any).estimatedBudget;

    let isBudgetDisqualified = false;
    if (statedBudget && minBudget) {
      const budgetNum = parseInt(String(statedBudget).replace(/\D/g, ''), 10);
      if (budgetNum) {
        if (budgetNum >= minBudget) {
          if (budgetNum >= minBudget * 1.5 || customFields.budget_verified) {
            budgetStatus = 'confirmed_fit';
            budgetAlignmentScore = 95;
          } else {
            budgetStatus = 'likely_fit';
            budgetAlignmentScore = 80;
          }
        } else {
          if (budgetNum <= minBudget * 0.6) {
            budgetStatus = 'confirmed_mismatch';
            budgetAlignmentScore = 20; // Severe penalty
            isBudgetDisqualified = true;
          } else {
            budgetStatus = 'likely_mismatch';
            budgetAlignmentScore = 35;
            isBudgetDisqualified = true;
          }
        }
      }
    }

    // Factor 6: Relationship Score
    let relationshipScore = 65; // prospect baseline
    if (company.relationshipType === 'existing_client' || (company as any).status === 'active_client') {
      relationshipScore = 95; // Existing client expansion bonus
    } else if ((company as any).status === 'past_client') {
      relationshipScore = 80;
    } else if ((company as any).status === 'churned') {
      relationshipScore = 35;
    }

    const factorScores: QualificationFactorScores = {
      evidenceConfidenceScore,
      sellerFitScore,
      impactScore,
      clientAlignmentScore,
      budgetAlignmentScore,
      budgetStatus,
      relationshipScore
    };

    // 2. Evaluate Hard Gates

    // Hard Gate 1: Explicit Exclusion
    if (sellerFit.classification === 'explicitly_excluded') {
      return {
        id: qualId,
        opportunityId: opportunity.id,
        companyAnalysisId,
        sellerFitId: sellerFit.id,
        verdict: 'SKIP',
        overallScore: 0,
        factorScores,
        hardGateTriggered: 'explicit_exclusion',
        rationale: `Hard Gate: Opportunity matches explicit seller exclusion "${sellerFit.exclusionTriggered || 'unsupported service'}".`,
        nextStepRecommendation: 'Do not pursue. If requested, decline or refer out to a specialized partner.',
        createdAt: now,
        updatedAt: now
      };
    }

    // Hard Gate 2: Outside Capability
    if (sellerFit.classification === 'outside_capability') {
      return {
        id: qualId,
        opportunityId: opportunity.id,
        companyAnalysisId,
        sellerFitId: sellerFit.id,
        verdict: 'REFER_OUT',
        overallScore: Math.min(sellerFitScore, 20),
        factorScores,
        hardGateTriggered: 'outside_capability',
        rationale: 'Identified opportunity is technically valid but falls outside seller core capabilities.',
        nextStepRecommendation: 'Refer this opportunity to a specialized agency or freelance partner.',
        createdAt: now,
        updatedAt: now
      };
    }

    // 3. Compute Weighted Overall Score
    let weightedScore =
      evidenceConfidenceScore * 0.25 +
      sellerFitScore * 0.30 +
      impactScore * 0.15 +
      clientAlignmentScore * 0.15 +
      budgetAlignmentScore * 0.10 +
      relationshipScore * 0.05;

    weightedScore = Math.round(Math.max(0, Math.min(100, weightedScore)));

    // 4. Hard Gate 3: Needs Review Opportunity (Cap at WORTH_EXPLORING)
    let hardGateTriggered: QualificationHardGate = null;
    if (opportunity.status === 'needs_review') {
      hardGateTriggered = 'needs_review_opportunity';
    }

    // 5. Determine Verdict
    let verdict: QualificationVerdict = 'SKIP';
    let rationale = '';
    let nextStepRecommendation = '';

    const isExistingClient = company.relationshipType === 'existing_client' || (company as any).status === 'active_client';

    if (hardGateTriggered === 'needs_review_opportunity') {
      verdict = weightedScore >= 45 ? 'WORTH_EXPLORING' : 'LOW_PRIORITY';
      rationale = `Opportunity requires auditor verification before client presentation. Capped at ${verdict}.`;
      nextStepRecommendation = 'Verify DOM/snapshot evidence manually before presenting to client.';
    } else if (isBudgetDisqualified || clientAlignmentScore <= 30) {
      // Disqualified by commercial mismatch (budget below minimum or mismatched target market)
      verdict = weightedScore >= 45 ? 'LOW_PRIORITY' : 'SKIP';
      rationale = isBudgetDisqualified
        ? `Budget misalignment: Stated budget (${statedBudget}) is below seller minimum requirement ($${minBudget}).`
        : `Target market mismatch: Company industry (${company.industry || 'Unknown'}) does not match seller target profile.`;
      nextStepRecommendation = 'Decline or keep as low-priority inbound inquiry. Do not spend active outbound sales resources.';
    } else if (weightedScore >= 70 && sellerFit.classification === 'strong_fit') {
      verdict = 'PURSUE';
      const clientTypeDesc = isExistingClient ? 'existing client account' : 'prospective client';
      rationale = `High alignment between observed opportunity and seller capabilities for this ${clientTypeDesc} (Overall Score: ${weightedScore}/100).`;
      nextStepRecommendation = isExistingClient
        ? 'Present as an account expansion or retention milestone.'
        : 'Highlight as a primary value proposition in audit outreach.';
    } else if (weightedScore >= 50 || sellerFit.classification === 'possible_fit') {
      verdict = 'WORTH_EXPLORING';
      rationale = `Viable opportunity with moderate capability or profile alignment (Overall Score: ${weightedScore}/100).`;
      nextStepRecommendation = 'Explore during discovery consultation to validate client priority and budget.';
    } else if (weightedScore >= 35) {
      verdict = 'LOW_PRIORITY';
      rationale = `Secondary opportunity with limited standalone commercial leverage (Overall Score: ${weightedScore}/100).`;
      nextStepRecommendation = 'Include as a secondary improvement or phase 2 consideration.';
    } else {
      verdict = 'SKIP';
      rationale = `Low overall commercial and capability score (${weightedScore}/100). Not recommended for active outreach.`;
      nextStepRecommendation = 'Do not include in primary sales conversations.';
    }

    return {
      id: qualId,
      opportunityId: opportunity.id,
      companyAnalysisId,
      sellerFitId: sellerFit.id,
      verdict,
      overallScore: weightedScore,
      factorScores,
      hardGateTriggered,
      rationale,
      nextStepRecommendation,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Qualifies all opportunities and generates a consolidated Company Qualification Summary.
   */
  static qualifyAllAndSummarize(
    opportunities: Opportunity[],
    sellerFits: SellerFit[],
    sellerProfile: SellerProfile,
    company: Company,
    companyAnalysisId: string
  ): {
    qualificationScores: QualificationScore[];
    summary: CompanyQualificationSummary;
  } {
    const qualificationScores = opportunities.map(opp => {
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

      return this.qualifyOpportunity(opp, matchingFit, sellerProfile, company, companyAnalysisId);
    });

    let pursueCount = 0;
    let exploreCount = 0;
    let lowPriorityCount = 0;
    let referOutCount = 0;
    let skipCount = 0;

    qualificationScores.forEach(q => {
      if (q.verdict === 'PURSUE') pursueCount++;
      else if (q.verdict === 'WORTH_EXPLORING') exploreCount++;
      else if (q.verdict === 'LOW_PRIORITY') lowPriorityCount++;
      else if (q.verdict === 'REFER_OUT') referOutCount++;
      else if (q.verdict === 'SKIP') skipCount++;
    });

    // Find top qualified opportunity (highest overallScore among PURSUE or WORTH_EXPLORING)
    const actionableScores = [...qualificationScores]
      .filter(q => q.verdict === 'PURSUE' || q.verdict === 'WORTH_EXPLORING')
      .sort((a, b) => b.overallScore - a.overallScore);

    const topScore = actionableScores[0];
    const topOpportunity = topScore ? opportunities.find(o => o.id === topScore.opportunityId) : undefined;

    let overallPriority: QualificationVerdict = 'SKIP';
    let summaryRationale = '';

    if (pursueCount > 0) {
      overallPriority = 'PURSUE';
      summaryRationale = `Identified ${pursueCount} high-fit opportunity for immediate pursuit. Top recommendation: "${topOpportunity?.title || 'Core Opportunity'}".`;
    } else if (exploreCount > 0) {
      overallPriority = 'WORTH_EXPLORING';
      summaryRationale = `Identified ${exploreCount} viable opportunity worth exploring during discovery. Top focus: "${topOpportunity?.title || 'Exploratory Item'}".`;
    } else if (referOutCount > 0) {
      overallPriority = 'REFER_OUT';
      summaryRationale = `No direct seller fit. Found ${referOutCount} opportunity outside current capabilities suitable for partner referral.`;
    } else if (lowPriorityCount > 0) {
      overallPriority = 'LOW_PRIORITY';
      summaryRationale = `Identified ${lowPriorityCount} low-priority opportunity with minimal commercial upside.`;
    } else {
      overallPriority = 'SKIP';
      summaryRationale = 'No qualified opportunities identified for this company analysis.';
    }

    const summary: CompanyQualificationSummary = {
      companyAnalysisId,
      overallPriority,
      topOpportunityId: topOpportunity?.id,
      topOpportunityTitle: topOpportunity?.title,
      pursueCount,
      exploreCount,
      lowPriorityCount,
      referOutCount,
      skipCount,
      summaryRationale
    };

    return {
      qualificationScores,
      summary
    };
  }
}
