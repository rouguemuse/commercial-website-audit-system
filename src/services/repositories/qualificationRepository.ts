import { db } from '../db';
import type { QualificationScore, QualificationVerdict } from '../../types';

export const qualificationRepository = {
  /**
   * Retrieves all qualification scores.
   */
  async getAll(): Promise<QualificationScore[]> {
    return db.qualificationScores.toArray();
  },

  /**
   * Retrieves all qualification scores for a specific company analysis.
   */
  async getByCompanyAnalysisId(companyAnalysisId: string): Promise<QualificationScore[]> {
    return db.qualificationScores
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .toArray();
  },

  /**
   * Retrieves qualification score by opportunity ID.
   */
  async getByOpportunityId(opportunityId: string): Promise<QualificationScore | undefined> {
    return db.qualificationScores
      .where('opportunityId')
      .equals(opportunityId)
      .first();
  },

  /**
   * Retrieves a single qualification score by ID.
   */
  async getById(id: string): Promise<QualificationScore | undefined> {
    return db.qualificationScores.get(id);
  },

  /**
   * Saves or updates a qualification score.
   */
  async save(score: QualificationScore): Promise<void> {
    score.updatedAt = new Date().toISOString();
    await db.qualificationScores.put(score);
  },

  /**
   * Bulk saves qualification scores.
   */
  async bulkSave(scores: QualificationScore[]): Promise<void> {
    const now = new Date().toISOString();
    const prepared = scores.map(s => ({
      ...s,
      updatedAt: now
    }));
    await db.qualificationScores.bulkPut(prepared);
  },

  /**
   * Updates verdict or rationale.
   */
  async updateVerdict(id: string, verdict: QualificationVerdict, rationale?: string): Promise<void> {
    const target = await db.qualificationScores.get(id);
    if (!target) return;
    target.verdict = verdict;
    if (rationale) target.rationale = rationale;
    target.updatedAt = new Date().toISOString();
    await db.qualificationScores.put(target);
  },

  /**
   * Deletes a qualification score.
   */
  async delete(id: string): Promise<void> {
    await db.qualificationScores.delete(id);
  },

  /**
   * Deletes all qualification scores for a company analysis.
   */
  async deleteByCompanyAnalysisId(companyAnalysisId: string): Promise<void> {
    await db.qualificationScores
      .where('companyAnalysisId')
      .equals(companyAnalysisId)
      .delete();
  }
};
