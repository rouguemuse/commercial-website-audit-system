export type QualificationVerdict =
  | 'PURSUE'
  | 'WORTH_EXPLORING'
  | 'LOW_PRIORITY'
  | 'REFER_OUT'
  | 'SKIP';

export type QualificationHardGate =
  | 'explicit_exclusion'
  | 'outside_capability'
  | 'needs_review_opportunity'
  | 'disqualified_client'
  | null;

export type BudgetAlignmentStatus =
  | 'confirmed_fit'
  | 'likely_fit'
  | 'unknown'
  | 'likely_mismatch'
  | 'confirmed_mismatch';

export interface QualificationFactorScores {
  evidenceConfidenceScore: number; // 0 - 100
  sellerFitScore: number; // 0 - 100
  impactScore: number; // 0 - 100
  clientAlignmentScore: number; // 0 - 100
  budgetAlignmentScore: number; // 0 - 100
  budgetStatus?: BudgetAlignmentStatus;
  relationshipScore: number; // 0 - 100
}

export interface QualificationScore {
  id: string;
  opportunityId: string;
  companyAnalysisId: string;
  sellerFitId: string;
  verdict: QualificationVerdict;
  overallScore: number; // 0 - 100
  factorScores: QualificationFactorScores;
  hardGateTriggered?: QualificationHardGate;
  rationale: string;
  nextStepRecommendation: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyQualificationSummary {
  companyAnalysisId: string;
  overallPriority: QualificationVerdict;
  topOpportunityId?: string;
  topOpportunityTitle?: string;
  pursueCount: number;
  exploreCount: number;
  lowPriorityCount: number;
  referOutCount: number;
  skipCount: number;
  summaryRationale: string;
}
