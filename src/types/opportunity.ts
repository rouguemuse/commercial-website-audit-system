export type OpportunityStatus = 'detected' | 'needs_review' | 'accepted' | 'rejected' | 'archived';

export type OpportunityImpact = 'low' | 'medium' | 'high';

export type OpportunityCategoryTag =
  | 'messaging'
  | 'conversion'
  | 'UX'
  | 'trust'
  | 'local_discovery'
  | 'SEO'
  | 'lead_capture'
  | 'mobile'
  | 'information_architecture'
  | 'automation'
  | 'content'
  | 'offer_structure'
  | string;

export interface Opportunity {
  id: string;
  companyAnalysisId: string;
  companyId: string;
  auditId: string;
  title: string;
  observation: string;
  evidenceRefs: string[];
  evidenceAssetIds: string[];
  evidenceText: string[];
  businessImplication: string;
  proposedOpportunity: string;
  recommendedAction: string;
  capabilityTags: OpportunityCategoryTag[];
  estimatedImpact?: OpportunityImpact;
  implicationBasis: 'inferred_risk' | 'verified_outcome';
  confidenceScore: number; // 0 to 100
  status: OpportunityStatus;
  contributingCheckIds: string[];
  primaryCheckId?: string;
  userEdited?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityDetectionResult {
  opportunities: Opportunity[];
  totalEvaluatedChecks: number;
  failingChecksCount: number;
  weakChecksCount: number;
  insufficientEvidenceCount: number;
  deduplicatedCount: number;
  hasDefensibleOpportunities: boolean;
  generatedAt: string;
}
