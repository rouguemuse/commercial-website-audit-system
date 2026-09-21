export type RecommendedActionType =
  | 'OUTREACH'
  | 'EXPLORE'
  | 'EXISTING_CLIENT_EXPANSION'
  | 'REFER'
  | 'MONITOR'
  | 'NO_ACTION';

export type OutreachSuitability = 'high' | 'medium' | 'low' | 'unsuitable';

export interface ActionRecommendation {
  id: string;
  opportunityId: string;
  companyAnalysisId: string;
  sellerProfileId: string;
  recommendedAction: RecommendedActionType;
  outreachSuitability: OutreachSuitability;
  leadAngle: string;
  whyLeadWithThis: string;
  matchedOfferId?: string | null;
  matchedOfferName?: string | null;
  evidenceIds: string[];
  evidenceSummary: string;
  allowedClaims: string[];
  prohibitedClaims: string[];
  recommendedNextStep: string;
  conversationStarterScore: number; // 0 - 100
  conversationStarterRationale: string;
  confidence: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface CompanyActionPlan {
  companyAnalysisId: string;
  bestQualifiedOpportunityId?: string;
  bestQualifiedOpportunityTitle?: string;
  bestConversationStarterOpportunityId?: string;
  bestConversationStarterOpportunityTitle?: string;
  bestConversationStarterScore?: number;
  recommendedFirstAction: RecommendedActionType;
  bestMatchedOfferName?: string;
  referOutCount: number;
  noActionCount: number;
  divergenceRationale?: string;
  summaryRationale: string;
}
