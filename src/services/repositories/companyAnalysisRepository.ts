import { db } from '../db';
import type { CompanyAnalysis, CompanyAnalysisStatus } from '../../types/company';

export const companyAnalysisRepository = {
  /**
   * Retrieves all analyses for a specific company, sorted chronologically descending.
   */
  async getByCompanyId(companyId: string): Promise<CompanyAnalysis[]> {
    const list = await db.companyAnalyses.where('companyId').equals(companyId).toArray();
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Retrieves analysis by ID.
   */
  async getById(id: string): Promise<CompanyAnalysis | undefined> {
    return db.companyAnalyses.get(id);
  },

  /**
   * Finds company analysis by associated auditId.
   */
  async getByAuditId(auditId: string): Promise<CompanyAnalysis | undefined> {
    const list = await db.companyAnalyses.where('auditId').equals(auditId).toArray();
    return list[0];
  },

  /**
   * Saves or updates a company analysis record.
   */
  async save(analysis: CompanyAnalysis): Promise<void> {
    analysis.updatedAt = new Date().toISOString();
    await db.companyAnalyses.put(analysis);
  },

  /**
   * Updates analysis status.
   */
  async updateStatus(id: string, status: CompanyAnalysisStatus): Promise<void> {
    const item = await db.companyAnalyses.get(id);
    if (!item) return;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    await db.companyAnalyses.put(item);
  },

  /**
   * Associates an existing or newly created Audit ID with a CompanyAnalysis.
   */
  async linkAudit(analysisId: string, auditId: string): Promise<void> {
    const item = await db.companyAnalyses.get(analysisId);
    if (!item) return;
    item.auditId = auditId;
    item.status = 'analyzed';
    item.updatedAt = new Date().toISOString();
    await db.companyAnalyses.put(item);
  },

  /**
   * Deletes a company analysis record.
   */
  async delete(id: string): Promise<void> {
    await db.companyAnalyses.delete(id);
  },

  /**
   * Factory function to create a new CompanyAnalysis record.
   */
  create(companyId: string, sellerProfileId?: string, auditId?: string, status: CompanyAnalysisStatus = 'draft'): CompanyAnalysis {
    const now = new Date().toISOString();
    return {
      id: `ana_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      companyId,
      sellerProfileId,
      auditId,
      status,
      createdAt: now,
      updatedAt: now
    };
  }
};
