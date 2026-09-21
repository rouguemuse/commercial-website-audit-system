import { db } from '../db';
import type { MasterFramework, Diagnosis, Audit, AuditAsset } from '../../types';

export const backupService = {
  async exportFullBackup(): Promise<string> {
    const frameworks = await db.frameworks.toArray();
    const diagnoses = await db.diagnoses.toArray();
    const audits = await db.audits.toArray();
    const assets = await db.assets.toArray();
    const sellerProfiles = await db.sellerProfiles.toArray();
    const companies = await db.companies.toArray();
    const companyAnalyses = await db.companyAnalyses.toArray();
    const opportunities = await db.opportunities.toArray();
    const sellerFits = await db.sellerFits.toArray();
    const qualificationScores = await db.qualificationScores.toArray();
    const actionRecommendations = await db.actionRecommendations.toArray();

    // Convert Blobs to Base64 for the backup file
    const serializedAssets = await Promise.all(
      assets.map(async (asset) => {
        return new Promise<{
          id: string;
          auditId: string;
          type: string;
          subType?: string;
          title: string;
          caption: string;
          notes: string;
          mimeType: string;
          filename: string;
          width?: number;
          height?: number;
          createdAt: string;
          pins: any[];
          base64Data: string;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: asset.id,
              auditId: asset.auditId,
              type: asset.type,
              subType: asset.subType,
              title: asset.title,
              caption: asset.caption,
              notes: asset.notes,
              mimeType: asset.mimeType,
              filename: asset.filename,
              width: asset.width,
              height: asset.height,
              createdAt: asset.createdAt,
              pins: asset.pins,
              base64Data: reader.result as string
            });
          };
          reader.readAsDataURL(asset.blob);
        });
      })
    );

    const payload = {
      version: '1.5',
      exportedAt: new Date().toISOString(),
      frameworks,
      diagnoses,
      audits,
      assets: serializedAssets,
      sellerProfiles,
      companies,
      companyAnalyses,
      opportunities,
      sellerFits,
      qualificationScores,
      actionRecommendations
    };

    return JSON.stringify(payload, null, 2);
  },

  async importFullBackup(jsonString: string): Promise<{
    frameworksCount: number;
    diagnosesCount: number;
    auditsCount: number;
    assetsCount: number;
    sellerProfilesCount: number;
    companiesCount: number;
    companyAnalysesCount: number;
    opportunitiesCount: number;
    sellerFitsCount: number;
    qualificationScoresCount: number;
    actionRecommendationsCount: number;
  }> {
    const data = JSON.parse(jsonString);
    if (!data.frameworks || !data.audits) {
      throw new Error('Invalid backup file format.');
    }

    if (data.frameworks?.length) {
      await db.frameworks.bulkPut(data.frameworks);
    }
    if (data.diagnoses?.length) {
      await db.diagnoses.bulkPut(data.diagnoses);
    }
    if (data.audits?.length) {
      await db.audits.bulkPut(data.audits);
    }

    if (data.assets?.length) {
      const restoredAssets: AuditAsset[] = await Promise.all(
        data.assets.map(async (item: any) => {
          // Convert base64 back to Blob
          const res = await fetch(item.base64Data);
          const blob = await res.blob();
          return {
            id: item.id,
            auditId: item.auditId,
            type: item.type,
            subType: item.subType,
            title: item.title,
            caption: item.caption,
            notes: item.notes,
            mimeType: item.mimeType || 'image/png',
            filename: item.filename || 'screenshot.png',
            width: item.width,
            height: item.height,
            createdAt: item.createdAt || new Date().toISOString(),
            pins: item.pins || [],
            blob
          };
        })
      );
      await db.assets.bulkPut(restoredAssets);
    }

    if (data.sellerProfiles?.length) {
      await db.sellerProfiles.bulkPut(data.sellerProfiles);
    }
    if (data.companies?.length) {
      await db.companies.bulkPut(data.companies);
    }
    if (data.companyAnalyses?.length) {
      await db.companyAnalyses.bulkPut(data.companyAnalyses);
    }
    if (data.opportunities?.length) {
      await db.opportunities.bulkPut(data.opportunities);
    }
    if (data.sellerFits?.length) {
      await db.sellerFits.bulkPut(data.sellerFits);
    }
    if (data.qualificationScores?.length) {
      await db.qualificationScores.bulkPut(data.qualificationScores);
    }
    if (data.actionRecommendations?.length) {
      await db.actionRecommendations.bulkPut(data.actionRecommendations);
    }

    return {
      frameworksCount: data.frameworks?.length || 0,
      diagnosesCount: data.diagnoses?.length || 0,
      auditsCount: data.audits?.length || 0,
      assetsCount: data.assets?.length || 0,
      sellerProfilesCount: data.sellerProfiles?.length || 0,
      companiesCount: data.companies?.length || 0,
      companyAnalysesCount: data.companyAnalyses?.length || 0,
      opportunitiesCount: data.opportunities?.length || 0,
      sellerFitsCount: data.sellerFits?.length || 0,
      qualificationScoresCount: data.qualificationScores?.length || 0,
      actionRecommendationsCount: data.actionRecommendations?.length || 0
    };
  }
};
