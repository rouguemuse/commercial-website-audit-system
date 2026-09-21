import { db } from '../db';
import type { Diagnosis } from '../../types';

export const diagnosisRepository = {
  async getAll(): Promise<Diagnosis[]> {
    return db.diagnoses.toArray();
  },

  async getActive(): Promise<Diagnosis[]> {
    return db.diagnoses.filter(d => d.isActive).toArray();
  },

  async getById(id: string): Promise<Diagnosis | undefined> {
    return db.diagnoses.get(id);
  },

  async save(diagnosis: Diagnosis): Promise<void> {
    await db.diagnoses.put(diagnosis);
  },

  async bulkSave(diagnoses: Diagnosis[]): Promise<void> {
    await db.diagnoses.bulkPut(diagnoses);
  },

  async delete(id: string): Promise<void> {
    await db.diagnoses.delete(id);
  },

  async findMatchingForCheck(checkId: string, score: number): Promise<Diagnosis[]> {
    const active = await db.diagnoses.filter(d => d.isActive).toArray();
    return active.filter(d => {
      return d.triggers.some(t => t.checkId === checkId && t.triggerScores.includes(score));
    });
  }
};
