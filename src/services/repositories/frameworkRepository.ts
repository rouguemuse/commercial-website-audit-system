import { db } from '../db';
import type { MasterFramework, FrameworkCheck, FrameworkCategory } from '../../types';

export const frameworkRepository = {
  async getLatest(): Promise<MasterFramework | undefined> {
    const list = await db.frameworks.toArray();
    if (list.length === 0) return undefined;
    // sort by updatedAt descending or version
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  },

  async getById(id: string): Promise<MasterFramework | undefined> {
    return db.frameworks.get(id);
  },

  async save(framework: MasterFramework): Promise<void> {
    await db.frameworks.put(framework);
  },

  async updateCheck(frameworkId: string, updatedCheck: FrameworkCheck): Promise<MasterFramework> {
    const current = await db.frameworks.get(frameworkId);
    if (!current) throw new Error(`Framework ${frameworkId} not found`);

    const checks = current.checks.map(c => c.id === updatedCheck.id ? updatedCheck : c);
    
    // Parse version and increment minor version (e.g. 1.0 -> 1.1)
    const verParts = current.version.split('.');
    const major = parseInt(verParts[0] || '1', 10);
    const minor = parseInt(verParts[1] || '0', 10) + 1;
    const newVersion = `${major}.${minor}`;

    const newFramework: MasterFramework = {
      ...current,
      id: `fw_v${newVersion}`,
      version: newVersion,
      checks,
      updatedAt: new Date().toISOString()
    };

    await db.frameworks.put(newFramework);
    return newFramework;
  },

  async reorderChecks(frameworkId: string, orderedCheckIds: string[]): Promise<MasterFramework> {
    const current = await db.frameworks.get(frameworkId);
    if (!current) throw new Error(`Framework ${frameworkId} not found`);

    const checkMap = new Map(current.checks.map(c => [c.id, c]));
    const reordered: FrameworkCheck[] = [];
    let num = 1;
    for (const id of orderedCheckIds) {
      const chk = checkMap.get(id);
      if (chk) {
        reordered.push({ ...chk, number: num++ });
        checkMap.delete(id);
      }
    }
    // append any leftovers
    for (const chk of checkMap.values()) {
      reordered.push({ ...chk, number: num++ });
    }

    const newFramework: MasterFramework = {
      ...current,
      checks: reordered,
      updatedAt: new Date().toISOString()
    };
    await db.frameworks.put(newFramework);
    return newFramework;
  }
};
