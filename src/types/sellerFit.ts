export type SellerFitClassification =
  | 'strong_fit'
  | 'possible_fit'
  | 'outside_capability'
  | 'explicitly_excluded'
  | 'insufficient_information';

export interface SellerFit {
  id: string;
  opportunityId: string;
  companyAnalysisId: string;
  sellerProfileId: string;
  classification: SellerFitClassification;
  fitScore: number; // 0 - 100
  matchedOfferIds: string[];
  matchedOfferNames: string[];
  matchedCapabilities: string[];
  missingCapabilities: string[];
  relevantProofIds: string[];
  relevantProofDescriptions: string[];
  rationale: string;
  exclusionTriggered?: string;
  createdAt: string;
  updatedAt: string;
}
