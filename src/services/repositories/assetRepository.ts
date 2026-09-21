import { db } from '../db';
import type { AuditAsset, AnnotationPin } from '../../types';

// In-memory cache of object URLs for instant rendering and revocation
const urlCache = new Map<string, string>();

export const assetRepository = {
  async getByAuditId(auditId: string): Promise<AuditAsset[]> {
    return db.assets.where('auditId').equals(auditId).toArray();
  },

  async getById(id: string): Promise<AuditAsset | undefined> {
    return db.assets.get(id);
  },

  async save(asset: AuditAsset): Promise<void> {
    await db.assets.put(asset);
    // Invalidate cached URL if exists
    if (urlCache.has(asset.id)) {
      URL.revokeObjectURL(urlCache.get(asset.id)!);
      urlCache.delete(asset.id);
    }
  },

  async bulkSave(assets: AuditAsset[]): Promise<void> {
    await db.assets.bulkPut(assets);
  },

  async delete(id: string): Promise<void> {
    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id)!);
      urlCache.delete(id);
    }
    await db.assets.delete(id);
  },

  async deleteByAuditId(auditId: string): Promise<void> {
    const assets = await db.assets.where('auditId').equals(auditId).toArray();
    for (const a of assets) {
      if (urlCache.has(a.id)) {
        URL.revokeObjectURL(urlCache.get(a.id)!);
        urlCache.delete(a.id);
      }
    }
    await db.assets.where('auditId').equals(auditId).delete();
  },

  async updatePins(assetId: string, pins: AnnotationPin[]): Promise<AuditAsset> {
    const asset = await db.assets.get(assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found`);
    const updated: AuditAsset = { ...asset, pins };
    await db.assets.put(updated);
    return updated;
  },

  // Helper to obtain a renderable object URL from the stored Blob
  getObjectUrl(asset: AuditAsset): string {
    if (urlCache.has(asset.id)) {
      return urlCache.get(asset.id)!;
    }
    const url = URL.createObjectURL(asset.blob);
    urlCache.set(asset.id, url);
    return url;
  },

  // Convert File to AuditAsset with Blob
  async createAssetFromFile(
    file: File,
    auditId: string,
    type: 'source_of_truth' | 'fixed_direction' | 'logo',
    subType: 'desktop_hero' | 'mobile_hero' | 'navigation' | 'service_page' | 'quote_flow' | 'other' = 'desktop_hero',
    title: string = file.name
  ): Promise<AuditAsset> {
    const id = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Read dimensions if possible
    let width: number | undefined;
    let height: number | undefined;
    try {
      const img = new Image();
      const tempUrl = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = () => {
          width = img.naturalWidth;
          height = img.naturalHeight;
          URL.revokeObjectURL(tempUrl);
          resolve(true);
        };
        img.onerror = () => {
          URL.revokeObjectURL(tempUrl);
          resolve(false);
        };
        img.src = tempUrl;
      });
    } catch (e) {
      // ignore dimension lookup errors
    }

    const newAsset: AuditAsset = {
      id,
      auditId,
      type,
      subType,
      title,
      caption: '',
      notes: '',
      blob: file, // File is a Blob subclass
      mimeType: file.type || 'image/png',
      filename: file.name,
      width,
      height,
      createdAt: new Date().toISOString(),
      pins: []
    };

    await db.assets.put(newAsset);
    return newAsset;
  }
};
