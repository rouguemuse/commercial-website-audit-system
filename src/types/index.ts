export type RescueLevel = 'Healthy' | 'Medium Rescue' | 'High Rescue' | 'Critical Rescue';

export type AuditStatus = 'Draft' | 'In Progress' | 'Ready' | 'Delivered' | 'Archived';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type PriorityTier = 'fix_first' | 'fix_next' | 'later';

export type ScoreState = 'working_well' | 'weak' | 'broken' | 'insufficient_evidence';

export type AssessmentConfidence = 'high' | 'medium' | 'low' | 'insufficient_evidence';

export type ValidationStatus = 'generated' | 'validated' | 'modified' | 'needs_review';

export interface IssueTag {
  id: string;
  name: string;
  category: 'Clarity' | 'Hierarchy' | 'Consistency' | 'Missing Elements' | 'Conversion' | 'Trust' | 'UX' | 'Voice';
  description?: string;
  color?: string;
}

export interface FrameworkCategory {
  id: string;
  number: number; // 1 to 6
  name: string;
  shortName: string;
  description: string;
}

export interface FrameworkCheck {
  id: string; // e.g. "chk_1"
  categoryId: string;
  number: number; // 1 to 30
  title: string;
  evaluatorQuestion: string;
  checklistQuestion: string; // Customer-facing version for free checklist
  scoringGuidance: {
    0: string; // Missing / Broken
    1: string; // Weak / Needs Improvement
    2: string; // Working Well
  };
  isActive: boolean;
}

export interface MasterFramework {
  id: string;
  version: string; // e.g. "1.0"
  updatedAt: string;
  categories: FrameworkCategory[];
  checks: FrameworkCheck[];
}

export interface DiagnosisTrigger {
  checkId: string;
  triggerScores: number[]; // usually [0, 1] or [0] or [1]
}

export interface Diagnosis {
  id: string;
  name: string;
  category: string;
  triggers: DiagnosisTrigger[];
  severity: SeverityLevel;
  finding: string;
  whyItMatters: string;
  recommendedFix: string;
  exampleImprovement: string;
  suggestedPriority: PriorityTier;
  recommendedOffer: string;
  internalNotes: string;
  isActive: boolean;
}

export interface AnnotationPin {
  id: string;
  number: number;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  title: string;
  description: string;
}

export interface AuditAsset {
  id: string;
  auditId: string;
  type: 'source_of_truth' | 'fixed_direction' | 'logo';
  subType?: 'desktop_hero' | 'mobile_hero' | 'navigation' | 'service_page' | 'quote_flow' | 'other';
  title: string;
  caption: string;
  notes: string;
  blob: Blob; // Stored in IndexedDB Asset store
  mimeType: string;
  filename: string;
  width?: number;
  height?: number;
  createdAt: string;
  pins: AnnotationPin[];
}

export type EvidenceType = 'visual' | 'text' | 'structural' | 'context' | 'insufficient';

export type CrawlPageType = 'home' | 'services' | 'contact' | 'about' | 'pricing' | 'locations' | 'other';

export type CrawlPageStatus = 'captured' | 'partial' | 'timed_out' | 'blocked' | 'unavailable';

export interface SectionCropRect {
  cropX: number; // Pixels from page left
  cropY: number; // Pixels from page top
  cropWidth: number; // Width of snapshot in px
  cropHeight: number; // Height of snapshot in px
}

export interface SectionSnapshotData {
  id: string; // e.g. "snap_desktop_hero"
  sectionType: 'desktop_hero' | 'desktop_midpage' | 'desktop_footer' | 'mobile_hero' | 'mobile_nav' | 'contact_form';
  pageUrl: string;
  viewport: 'desktop' | 'mobile';
  cropRect: SectionCropRect;
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png';
  base64Data?: string; // Transferred during API response, converted to Blob on client
  byteSize?: number;
}

export interface EvidenceElement {
  id: string; // e.g. "HOME.hero.h1", "CONTACT.form"
  pageUrl: string;
  pageType: CrawlPageType;
  category: 'headline' | 'subheadline' | 'cta' | 'phone' | 'navigation' | 'review' | 'credential' | 'service' | 'location' | 'form' | 'pricing' | 'faq' | 'footer' | 'other';
  tag: string; // e.g. "H1", "BUTTON", "FORM", "A"
  visibleText: string;
  href?: string;
  // Page-space bounding box
  boundingBox: {
    pageX: number;
    pageY: number;
    width: number;
    height: number;
  };
  viewport: 'desktop' | 'mobile';
  isVisible: boolean;
  associatedSnapshotId?: string;
}

export interface EvidenceReference {
  elementId: string;
  snapshotId?: string;
  pageUrl: string;
  viewport: 'desktop' | 'mobile';
  evidenceType: EvidenceType;
  quoteOrSummary?: string;
}

export interface CrawlPageResult {
  url: string;
  pageType: CrawlPageType;
  status: CrawlPageStatus;
  httpStatus?: number;
  errorMessage?: string;
  durationMs: number;
}

export interface WebsiteEvidenceMap {
  targetUrl: string;
  crawledAt: string;
  pages: CrawlPageResult[];
  elements: EvidenceElement[];
  snapshots: SectionSnapshotData[];
  meta: {
    title?: string;
    description?: string;
    hasTelLinks: boolean;
    hasForms: boolean;
    formCount: number;
    hasReviewsMarkup: boolean;
    detectedServiceArea?: string;
    detectedPhoneNumbers: string[];
    desktopLoadTimeMs: number;
    mobileLoadTimeMs: number;
  };
}

export interface AuditScoreItem {
  score: number | null; // 0 (broken), 1 (weak), 2 (affirmatively working), null (insufficient evidence)
  proposedScore?: number | null; // Initial AI proposed score (or null if insufficient evidence)
  confidence: AssessmentConfidence;
  validationStatus: ValidationStatus;
  evidenceType?: EvidenceType;
  evidenceSource?: string; // e.g. "HOME.hero.h1", "CONTACT.form", "Screenshot Callout #1"
  evidenceRefs?: string[]; // Array of element IDs e.g. ["HOME.hero.h1", "HOME.hero.cta_primary"]
  rationale: string;
  evidence: string;
  tags: string[]; // Issue tag names e.g. ["Vague", "Generic", "Formulaic phrasing"]
  evidenceAssetId?: string;
  triggeredDiagnosisIds: string[];
  suggestedFinding?: string;
  suggestedPriority?: PriorityTier;
}

export interface AuditFindingItem {
  id: string;
  diagnosisId: string;
  checkId: string; // Primary check or reference
  associatedCheckIds?: string[]; // Multiple checks if consolidated
  tags?: string[];
  isConsolidated?: boolean;
  tier: PriorityTier;
  order: number;
  finding: string;
  whyItMatters: string;
  recommendedFix: string;
  exampleImprovement: string;
  customClientNotes: string;
  pinnedAssetId?: string;
}

export interface PatternInsight {
  patternName: string; // e.g. "Clarity & Ambiguity"
  frequency: number; // e.g. 7 checks affected
  summary: string;
  affectedCheckNumbers: number[];
  recommendation: string;
}

export interface ReportConfiguration {
  executiveSummary: string;
  primaryPatternInsight?: string;
  selectedFindingIds: string[];
  selectedSourceAssetIds: string[];
  selectedFixedDirectionAssetIds: string[];
  selectedPinIds: string[];
  showConversionBlueprint: boolean;
  showFixNext: boolean;
  showCategoryBreakdown: boolean;
  recommendedOffer: {
    offerName: string;
    price: string;
    turnaround: string;
    description: string;
    customScope: string;
    ctaText: string;
  };
}

export type TeaserWorkflowStatus = 'generated' | 'reviewed' | 'ready_to_send';

export type PreliminaryAssessmentStatus =
  | 'Needs Attention'
  | 'Clear Friction Detected'
  | 'Growth Opportunities Identified'
  | 'Solid Baseline';

export interface AuditTeaserConfig {
  status: TeaserWorkflowStatus;
  preliminaryAssessment: PreliminaryAssessmentStatus;
  primaryPatternTitle: string;
  primaryPatternFriction: string;
  selectedFindingIds: string[]; // max 2
  selectedAssetId?: string; // 1 screenshot with max 2-3 pins
  selectedPinIds: string[]; // max 3 pins
  exampleDirection: {
    current: string;
    recommendedDirection: string;
  };
  ctaOffer: {
    name: string;
    price: string;
    tagline: string;
    ctaLink: string;
  };
  auditorReviewNotes?: string;
  generatedAt: string;
  reviewedAt?: string;
  readyToSendAt?: string;
}

export interface Audit {
  id: string;
  parentAuditId?: string;
  isDemo?: boolean;
  // Business Context
  businessName: string;
  websiteUrl: string;
  industry?: string;
  cityServiceArea?: string;
  primaryCustomerType?: string;
  desiredAction: string; // e.g. "Call for quote", "Book inspection", "Buy online"
  auditorNotes?: string;
  brandVoiceSample?: string; // e.g. Actual owner quotes: "Call Wayne. If we've got a dumpster available, we'll get you taken care of."
  ownerVoiceNotes?: string; // e.g. "Down-to-earth, plainspoken Texas contractor tone, avoids corporate jargon"
  status: AuditStatus;
  frameworkVersion: string;
  frameworkSnapshot: MasterFramework; // Historical snapshot at audit time
  scores: Record<string, AuditScoreItem>; // checkId -> score details
  findings: AuditFindingItem[];
  conversionPath: {
    currentSteps: string[];
    recommendedSteps: string[];
    notes: string;
  };
  reportConfig: ReportConfiguration; // Embedded report config
  teaserConfig?: AuditTeaserConfig; // Embedded prospecting teaser config
  createdAt: string;
  updatedAt: string;
}

export interface ValueLadderOffer {
  id: string;
  name: string;
  price: string;
  targetPrice: number;
  badge?: string;
  tagline: string;
  deliverable: string;
  turnaround: string;
  idealFor: string;
  isPublicFunnel: boolean;
}

export * from './sellerProfile';
export * from './company';
export * from './opportunity';
export * from './sellerFit';
export * from './qualification';
export * from './actionRecommendation';

