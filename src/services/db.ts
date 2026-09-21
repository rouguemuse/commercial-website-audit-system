import Dexie, { type Table } from 'dexie';
import type {
  MasterFramework,
  Diagnosis,
  Audit,
  AuditAsset,
  SellerProfile,
  Company,
  CompanyAnalysis,
  Opportunity,
  SellerFit,
  QualificationScore,
  ActionRecommendation
} from '../types';

export class AuditDatabase extends Dexie {
  frameworks!: Table<MasterFramework, string>;
  diagnoses!: Table<Diagnosis, string>;
  audits!: Table<Audit, string>;
  assets!: Table<AuditAsset, string>;
  sellerProfiles!: Table<SellerProfile, string>;
  companies!: Table<Company, string>;
  companyAnalyses!: Table<CompanyAnalysis, string>;
  opportunities!: Table<Opportunity, string>;
  sellerFits!: Table<SellerFit, string>;
  qualificationScores!: Table<QualificationScore, string>;
  actionRecommendations!: Table<ActionRecommendation, string>;

  constructor() {
    super('WebsiteAuditSystemDB');
    this.version(1).stores({
      frameworks: 'id, version, updatedAt',
      diagnoses: 'id, name, category, severity, suggestedPriority, isActive',
      audits: 'id, parentAuditId, isDemo, businessName, status, frameworkVersion, createdAt, updatedAt',
      assets: 'id, auditId, type, subType, createdAt'
    });

    this.version(2).stores({
      sellerProfiles: 'id, businessName, primaryRole, updatedAt, isActive'
    });

    this.version(3).stores({
      companies: 'id, relationshipType, name, websiteUrl, isArchived, updatedAt, createdAt',
      companyAnalyses: 'id, companyId, sellerProfileId, auditId, status, createdAt, updatedAt'
    });

    this.version(4).stores({
      opportunities: 'id, companyAnalysisId, companyId, auditId, status, confidenceScore, createdAt, updatedAt'
    });

    this.version(5).stores({
      sellerFits: 'id, opportunityId, companyAnalysisId, sellerProfileId, classification, fitScore, createdAt, updatedAt',
      qualificationScores: 'id, opportunityId, companyAnalysisId, sellerFitId, verdict, overallScore, createdAt, updatedAt'
    });

    this.version(6).stores({
      actionRecommendations: 'id, opportunityId, companyAnalysisId, sellerProfileId, recommendedAction, conversationStarterScore, createdAt, updatedAt'
    });
  }
}

export const db = new AuditDatabase();

