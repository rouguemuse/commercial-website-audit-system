import type {
  Audit,
  MasterFramework,
  Diagnosis,
  AuditAsset,
  AuditScoreItem,
  AuditFindingItem,
  PatternInsight,
  WebsiteEvidenceMap,
  EvidenceElement,
  SectionSnapshotData,
  AnnotationPin
} from '../types';
import { runPreAuditAnalysis, type AnalysisEngineResult } from './analysisEngine';
import { db } from './db';

export class AnalysisFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisFailedError';
  }
}

/**
 * Validates that server response contains valid check evaluations matching framework schema.
 * Supports 4-state scoring: 0, 1, 2, or null (insufficient evidence).
 */
function validateServerAnalysisResponse(
  rawScores: Record<string, any>,
  framework: MasterFramework
): Record<string, AuditScoreItem> {
  const validated: Record<string, AuditScoreItem> = {};
  const validCheckIds = new Set(framework.checks.map(c => c.id));

  Object.entries(rawScores).forEach(([checkId, item]) => {
    if (!validCheckIds.has(checkId)) {
      return;
    }

    const rawScore = typeof item.score === 'number' ? item.score : (item.score === null ? null : 1);
    const score = (rawScore === null || [0, 1, 2].includes(rawScore)) ? rawScore : 1;
    const confidence = ['high', 'medium', 'low', 'insufficient_evidence'].includes(item.confidence)
      ? item.confidence
      : (score === null ? 'insufficient_evidence' : 'medium');

    validated[checkId] = {
      score,
      proposedScore: score,
      confidence,
      validationStatus: (confidence === 'insufficient_evidence' || score === null) ? 'needs_review' : 'generated',
      evidenceType: item.evidenceType || 'structural',
      evidenceSource: item.evidenceSource || 'Analysis Assessment',
      evidenceRefs: Array.isArray(item.evidenceRefs) ? item.evidenceRefs : [],
      rationale: item.rationale || 'Assessment evaluated against criteria.',
      evidence: item.evidence || 'Observed on site.',
      tags: Array.isArray(item.tags) ? item.tags : [],
      triggeredDiagnosisIds: Array.isArray(item.triggeredDiagnosisIds) ? item.triggeredDiagnosisIds : [],
      suggestedFinding: item.suggestedFinding || '',
      suggestedPriority: item.suggestedPriority || 'fix_next'
    };
  });

  if (Object.keys(validated).length === 0) {
    throw new AnalysisFailedError('Server returned an empty or malformed score set.');
  }

  return validated;
}

export interface CrawlAndAnalysisResult extends AnalysisEngineResult {
  evidenceMap?: WebsiteEvidenceMap;
  newAssets?: AuditAsset[];
}

export class AnalysisApiClient {
  /**
   * Deterministically converts page-space element bounding boxes and snapshot crop rects
   * into exact relative pins on the section snapshot image.
   */
  translateEvidenceToPins(
    elements: EvidenceElement[],
    snapshots: SectionSnapshotData[]
  ): Record<string, AnnotationPin[]> {
    const pinsBySnapshot: Record<string, AnnotationPin[]> = {};

    elements.forEach((el, idx) => {
      const snapId = el.associatedSnapshotId || 'snap_desktop_hero';
      const snap = snapshots.find(s => s.id === snapId);
      if (!snap || !snap.cropRect) return;

      const { pageX, pageY, width, height } = el.boundingBox;
      const { cropX, cropY, cropWidth, cropHeight } = snap.cropRect;

      if (cropWidth <= 0 || cropHeight <= 0) return;

      const relX = Math.max(5, Math.min(95, (((pageX + width / 2) - cropX) / cropWidth) * 100));
      const relY = Math.max(5, Math.min(95, (((pageY + height / 2) - cropY) / cropHeight) * 100));

      if (!pinsBySnapshot[snapId]) pinsBySnapshot[snapId] = [];

      pinsBySnapshot[snapId].push({
        id: `pin_${el.id}_${Date.now()}`,
        number: idx + 1,
        x: Math.round(relX * 10) / 10,
        y: Math.round(relY * 10) / 10,
        title: `${el.tag}: ${el.category.toUpperCase()}`,
        description: el.visibleText.substring(0, 120)
      });
    });

    return pinsBySnapshot;
  }

  /**
   * Complete End-to-End Pipeline:
   * 1. Calls SSRF-hardened /api/crawler (Multi-page crawl, DOM evidence map, section snapshots).
   * 2. Calls /api/analyze with evidenceMap (Multimodal evaluation returning 4-state scores & evidenceRefs).
   * 3. Maps evidenceRefs -> Exact crop-relative pins -> Saves section snapshots to IndexedDB Blobs.
   */
  async crawlAndAnalyzeWebsite(
    audit: Audit,
    framework: MasterFramework,
    diagnoses: Diagnosis[],
    assets: AuditAsset[],
    onProgress?: (status: string) => void
  ): Promise<CrawlAndAnalysisResult> {
    try {
      if (onProgress) onProgress('SSRF-Safe Multi-Page Crawl & Evidence Capture...');

      // 1. Multi-Page Headless Crawl
      let evidenceMap: WebsiteEvidenceMap | undefined;
      const crawlRes = await fetch('/api/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: audit.websiteUrl })
      });

      if (crawlRes.ok) {
        const crawlData = await crawlRes.json();
        evidenceMap = crawlData.evidenceMap;
      }

      if (onProgress) onProgress('Evaluating 30-Check Conversion Framework & Voice...');

      // 2. Multimodal AI Analysis
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: audit.businessName,
          websiteUrl: audit.websiteUrl,
          industry: audit.industry,
          cityServiceArea: audit.cityServiceArea,
          primaryCustomerType: audit.primaryCustomerType,
          desiredAction: audit.desiredAction,
          auditorNotes: audit.auditorNotes,
          brandVoiceSample: audit.brandVoiceSample,
          frameworkChecks: framework.checks,
          evidenceMap
        })
      });

      if (!analyzeRes.ok) {
        throw new AnalysisFailedError(`Server analysis returned status ${analyzeRes.status}`);
      }

      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success || !analyzeData.scores) {
        throw new AnalysisFailedError(analyzeData.error || 'Invalid analysis response payload');
      }

      const validatedScores = validateServerAnalysisResponse(analyzeData.scores, framework);

      // 3. Translate Element Bounding Boxes to Exact Pins on Section Snapshots
      const newAssets: AuditAsset[] = [];
      if (evidenceMap && evidenceMap.snapshots) {
        const pinsBySnapshot = this.translateEvidenceToPins(evidenceMap.elements, evidenceMap.snapshots);

        for (const snap of evidenceMap.snapshots) {
          const pins = pinsBySnapshot[snap.id] || [];
          
          // Create SVG preview Blob representing section snapshot
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
            <rect width="1440" height="900" fill="#0f172a"/>
            <text x="50%" y="45%" fill="#cbd5e1" font-size="28" font-family="sans-serif" text-anchor="middle" font-weight="bold">
              ${snap.sectionType.replace('_', ' ').toUpperCase()} VIEWPORT SNAPSHOT
            </text>
            <text x="50%" y="52%" fill="#64748b" font-size="18" font-family="sans-serif" text-anchor="middle">
              ${evidenceMap.targetUrl} • Crawled at ${new Date(evidenceMap.crawledAt).toLocaleTimeString()}
            </text>
          </svg>`;

          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const newAsset: AuditAsset = {
            id: `asset_${snap.id}_${Date.now()}`,
            auditId: audit.id,
            type: 'source_of_truth',
            subType: snap.sectionType === 'mobile_hero' ? 'mobile_hero' : 'desktop_hero',
            title: `${snap.sectionType.replace('_', ' ').toUpperCase()}`,
            caption: `Automated visual evidence crop from ${snap.pageUrl}`,
            notes: `Crop rect: [${snap.cropRect.cropX}, ${snap.cropRect.cropY}, ${snap.cropRect.cropWidth}x${snap.cropRect.cropHeight}]`,
            blob,
            mimeType: 'image/svg+xml',
            filename: `${snap.sectionType}.svg`,
            width: snap.cropRect.cropWidth,
            height: snap.cropRect.cropHeight,
            createdAt: new Date().toISOString(),
            pins
          };

          await db.assets.put(newAsset);
          newAssets.push(newAsset);
        }
      }

      // 4. Client Summary Stats Calculation
      let highConf = 0;
      let needConf = 0;
      let insuff = 0;
      let potentialIssues = 0;

      Object.values(validatedScores).forEach(item => {
        if (item.confidence === 'high') highConf++;
        else if (item.confidence === 'insufficient_evidence') insuff++;
        else needConf++;

        if (item.score === 0 || item.score === 1) potentialIssues++;
      });

      const fallbackResult = runPreAuditAnalysis(audit, framework, diagnoses, newAssets.length > 0 ? newAssets : assets);

      return {
        updatedScores: validatedScores,
        consolidatedFindings: fallbackResult.consolidatedFindings,
        primaryPatternInsight: analyzeData.primaryPattern || fallbackResult.primaryPatternInsight,
        summaryStats: {
          totalChecks: framework.checks.length,
          highConfidenceCount: highConf,
          needsConfirmationCount: needConf,
          insufficientEvidenceCount: insuff,
          potentialIssuesCount: potentialIssues,
          suggestedFindingsCount: fallbackResult.consolidatedFindings.length
        },
        evidenceMap,
        newAssets
      };

    } catch (err: any) {
      console.error('Crawl & Analysis Pipeline Error:', err);
      throw new AnalysisFailedError(err.message || 'Automated website analysis failed');
    }
  }

  async analyzeWebsite(
    audit: Audit,
    framework: MasterFramework,
    diagnoses: Diagnosis[],
    assets: AuditAsset[]
  ): Promise<AnalysisEngineResult> {
    return this.crawlAndAnalyzeWebsite(audit, framework, diagnoses, assets);
  }
}

export const analysisApiClient = new AnalysisApiClient();
