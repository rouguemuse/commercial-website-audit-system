import { db } from '../db';
import type { Opportunity, OpportunityStatus } from '../../types/opportunity';

export const opportunityRepository = {
  /**
   * Retrieves all opportunities.
   */
  async getAll(): Promise<Opportunity[]> {
    return db.opportunities.toArray();
  },

  /**
   * Retrieves all opportunities for a specific company analysis execution.
   */
  async getByCompanyAnalysisId(companyAnalysisId: string): Promise<Opportunity[]> {
    return db.opportunities
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .toArray();
  },

  /**
   * Retrieves all opportunities for a specific company.
   */
  async getByCompanyId(companyId: string): Promise<Opportunity[]> {
    return db.opportunities
      .where('companyId')
      .equals(companyId)
      .toArray();
  },

  /**
   * Retrieves all opportunities linked to a specific audit.
   */
  async getByAuditId(auditId: string): Promise<Opportunity[]> {
    return db.opportunities
      .where('auditId')
      .equals(auditId)
      .toArray();
  },

  /**
   * Retrieves a single opportunity by ID.
   */
  async getById(id: string): Promise<Opportunity | undefined> {
    return db.opportunities.get(id);
  },

  /**
   * Saves or updates an opportunity.
   */
  async save(opportunity: Opportunity): Promise<void> {
    opportunity.updatedAt = new Date().toISOString();
    await db.opportunities.put(opportunity);
  },

  /**
   * Bulk saves opportunities.
   */
  async bulkSave(opportunities: Opportunity[]): Promise<void> {
    const now = new Date().toISOString();
    const prepared = opportunities.map(o => ({
      ...o,
      updatedAt: now
    }));
    await db.opportunities.bulkPut(prepared);
  },

  /**
   * Updates the status of an opportunity (e.g. accepted, rejected, needs_review).
   */
  async updateStatus(id: string, status: OpportunityStatus): Promise<void> {
    const target = await db.opportunities.get(id);
    if (!target) return;
    target.status = status;
    target.updatedAt = new Date().toISOString();
    await db.opportunities.put(target);
  },

  /**
   * Deletes an opportunity by ID.
   */
  async delete(id: string): Promise<void> {
    await db.opportunities.delete(id);
  },

  /**
   * Deletes all opportunities associated with a company analysis.
   */
  async deleteByCompanyAnalysisId(companyAnalysisId: string): Promise<void> {
    await db.opportunities
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .delete();
  }
};
