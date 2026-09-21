import { db } from '../db';
import type { Audit, MasterFramework } from '../../types';
import { assetRepository } from './assetRepository';

export const auditRepository = {
  async getAll(includeDemo = true): Promise<Audit[]> {
    let list = await db.audits.toArray();
    if (!includeDemo) {
      list = list.filter(a => !a.isDemo);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getById(id: string): Promise<Audit | undefined> {
    return db.audits.get(id);
  },

  async save(audit: Audit): Promise<void> {
    audit.updatedAt = new Date().toISOString();
    await db.audits.put(audit);
  },

  async delete(id: string): Promise<void> {
    // Also delete associated assets
    await assetRepository.deleteByAuditId(id);
    await db.audits.delete(id);
  },

  async duplicate(id: string): Promise<Audit> {
    const original = await db.audits.get(id);
    if (!original) throw new Error(`Audit ${id} not found to duplicate`);

    const newId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const duplicated: Audit = {
      ...original,
      id: newId,
      parentAuditId: original.id,
      isDemo: false, // duplicates are user-managed
      businessName: `${original.businessName} (Copy)`,
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
      // Deep clone findings, scores, and report config
      scores: JSON.parse(JSON.stringify(original.scores)),
      findings: JSON.parse(JSON.stringify(original.findings)),
      conversionPath: JSON.parse(JSON.stringify(original.conversionPath)),
      reportConfig: JSON.parse(JSON.stringify(original.reportConfig)),
      frameworkSnapshot: JSON.parse(JSON.stringify(original.frameworkSnapshot))
    };

    await db.audits.put(duplicated);

    // Duplicate assets for new audit
    const originalAssets = await assetRepository.getByAuditId(original.id);
    for (const asset of originalAssets) {
      const newAssetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await assetRepository.save({
        ...asset,
        id: newAssetId,
        auditId: newId,
        pins: JSON.parse(JSON.stringify(asset.pins)),
        createdAt: now
      });
    }

    return duplicated;
  },

  async upgradeAuditFramework(auditId: string, latestFramework: MasterFramework): Promise<Audit> {
    const audit = await db.audits.get(auditId);
    if (!audit) throw new Error(`Audit ${auditId} not found`);

    if (audit.status === 'Delivered') {
      throw new Error('Cannot upgrade a Delivered audit. Delivered audits are historically immutable.');
    }

    // Preserve existing scores where checkId exists in new framework
    const updatedAudit: Audit = {
      ...audit,
      frameworkVersion: latestFramework.version,
      frameworkSnapshot: latestFramework,
      updatedAt: new Date().toISOString()
    };

    await db.audits.put(updatedAudit);
    return updatedAudit;
  }
};
