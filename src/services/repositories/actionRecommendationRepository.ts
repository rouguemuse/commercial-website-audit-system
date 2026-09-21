import { db } from '../db';
import type { ActionRecommendation, RecommendedActionType } from '../../types';

export const actionRecommendationRepository = {
  /**
   * Retrieves all action recommendations.
   */
  async getAll(): Promise<ActionRecommendation[]> {
    return db.actionRecommendations.toArray();
  },

  /**
   * Retrieves all action recommendations for a company analysis.
   */
  async getByCompanyAnalysisId(companyAnalysisId: string): Promise<ActionRecommendation[]> {
    return db.actionRecommendations
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .toArray();
  },

  /**
   * Retrieves action recommendation by opportunity ID.
   */
  async getByOpportunityId(opportunityId: string): Promise<ActionRecommendation | undefined> {
    return db.actionRecommendations
      .where('opportunityId')
      .equals(opportunityId)
      .first();
  },

  /**
   * Retrieves a single action recommendation by ID.
   */
  async getById(id: string): Promise<ActionRecommendation | undefined> {
    return db.actionRecommendations.get(id);
  },

  /**
   * Saves or updates an action recommendation.
   */
  async save(rec: ActionRecommendation): Promise<void> {
    rec.updatedAt = new Date().toISOString();
    await db.actionRecommendations.put(rec);
  },

  /**
   * Bulk saves action recommendations.
   */
  async bulkSave(recs: ActionRecommendation[]): Promise<void> {
    const now = new Date().toISOString();
    const prepared = recs.map(r => ({
      ...r,
      updatedAt: now
    }));
    await db.actionRecommendations.bulkPut(prepared);
  },

  /**
   * Updates recommended action.
   */
  async updateAction(id: string, action: RecommendedActionType): Promise<void> {
    const target = await db.actionRecommendations.get(id);
    if (!target) return;
    target.recommendedAction = action;
    target.updatedAt = new Date().toISOString();
    await db.actionRecommendations.put(target);
  },

  /**
   * Deletes an action recommendation.
   */
  async delete(id: string): Promise<void> {
    await db.actionRecommendations.delete(id);
  },

  /**
   * Deletes all action recommendations for a company analysis.
   */
  async deleteByCompanyAnalysisId(companyAnalysisId: string): Promise<void> {
    await db.actionRecommendations
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .delete();
  }
};
