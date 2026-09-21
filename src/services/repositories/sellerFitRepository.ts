import { db } from '../db';
import type { SellerFit, SellerFitClassification } from '../../types';

export const sellerFitRepository = {
  /**
   * Retrieves all seller fit records.
   */
  async getAll(): Promise<SellerFit[]> {
    return db.sellerFits.toArray();
  },

  /**
   * Retrieves all seller fits for a specific company analysis.
   */
  async getByCompanyAnalysisId(companyAnalysisId: string): Promise<SellerFit[]> {
    return db.sellerFits
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .toArray();
  },

  /**
   * Retrieves seller fit by opportunity ID.
   */
  async getByOpportunityId(opportunityId: string): Promise<SellerFit | undefined> {
    return db.sellerFits
      .where('opportunityId')
      .equals(opportunityId)
      .first();
  },

  /**
   * Retrieves a single seller fit record by ID.
   */
  async getById(id: string): Promise<SellerFit | undefined> {
    return db.sellerFits.get(id);
  },

  /**
   * Saves or updates a seller fit record.
   */
  async save(sellerFit: SellerFit): Promise<void> {
    sellerFit.updatedAt = new Date().toISOString();
    await db.sellerFits.put(sellerFit);
  },

  /**
   * Bulk saves seller fit records.
   */
  async bulkSave(sellerFits: SellerFit[]): Promise<void> {
    const now = new Date().toISOString();
    const prepared = sellerFits.map(sf => ({
      ...sf,
      updatedAt: now
    }));
    await db.sellerFits.bulkPut(prepared);
  },

  /**
   * Updates classification or rationale.
   */
  async updateClassification(id: string, classification: SellerFitClassification, rationale?: string): Promise<void> {
    const target = await db.sellerFits.get(id);
    if (!target) return;
    target.classification = classification;
    if (rationale) target.rationale = rationale;
    target.updatedAt = new Date().toISOString();
    await db.sellerFits.put(target);
  },

  /**
   * Deletes a seller fit record.
   */
  async delete(id: string): Promise<void> {
    await db.sellerFits.delete(id);
  },

  /**
   * Deletes all seller fits for a company analysis.
   */
  async deleteByCompanyAnalysisId(companyAnalysisId: string): Promise<void> {
    await db.sellerFits
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .delete();
  }
};
