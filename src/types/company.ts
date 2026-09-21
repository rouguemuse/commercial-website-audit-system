/**
 * Company & Account Context Data Models for ContextMuse Opportunity Engine (Stage 2)
 */

export type CompanyRelationshipType = 'prospect' | 'existing_client';

export type CompanyAnalysisStatus = 'draft' | 'collecting_evidence' | 'analyzed' | 'archived';

export interface CompanyPrimaryContact {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
}

export interface Company {
  id: string; // e.g. "comp_1740000000_abcd"
  name: string;
  websiteUrl: string;
  relationshipType: CompanyRelationshipType;
  industry: string;
  location?: string;
  primaryContact?: CompanyPrimaryContact;
  clientSince?: string; // Optional date for existing clients
  engagementNotes?: string; // Current retainer / past project context
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAnalysis {
  id: string; // e.g. "ana_1740000000_efgh"
  companyId: string;
  sellerProfileId?: string;
  auditId?: string; // Optional reference to the underlying 30-check website diagnostic audit
  status: CompanyAnalysisStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWithStats extends Company {
  analysesCount: number;
  latestAnalysis?: CompanyAnalysis;
  latestAuditScoreFormatted?: string; // e.g. "46 / 60"
  latestAuditDate?: string;
}
