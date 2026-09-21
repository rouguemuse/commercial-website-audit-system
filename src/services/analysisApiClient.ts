import type {
  Audit,
  MasterFramework,
  Diagnosis,
  AuditAsset,
  AuditScoreItem,
  AuditFindingItem,
  WebsiteEvidenceMap,
  EvidenceElement,
  SectionSnapshotData,
  AnnotationPin
} from '../types';
import { db } from './db';
import { generateConsolidatedFindings, detectWebsitePatterns } from './analysisEngine';

export class AnalysisFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisFailedError';
  }
}

export class CrawlFailedError extends Error {
  errorType: string;
  statusCode: number;
  recovery: string;
  constructor(message: string, errorType: string, statusCode: number, recovery: string) {
    super(message);
    this.name = 'CrawlFailedError';
    this.errorType = errorType;
    this.statusCode = statusCode;
    this.recovery = recovery;
  }
}

export interface CrawlAndAnalysisResult {
  updatedScores: Record<string, AuditScoreItem>;
  consolidatedFindings: AuditFindingItem[];
  evidenceMap?: WebsiteEvidenceMap;
  newAssets: AuditAsset[];
  summaryStats: {
    totalChecks: number;
    highConfidenceCount: number;
    needsConfirmationCount: number;
    insufficientEvidenceCount: number;
    potentialIssuesCount: number;
    suggestedFindingsCount: number;
    provisionalAudit: boolean;
  };
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const key =
      (typeof window !== 'undefined' && (
        localStorage.getItem('agency_audit_secret') ||
        localStorage.getItem('audit_secret') ||
        (import.meta as any).env?.VITE_AUDIT_SECRET
      )) || '';
    if (key) {
      headers['x-audit-key'] = key;
      headers['Authorization'] = `Bearer ${key}`;
    }
  } catch {
    // Ignore localStorage access issues
  }
  return headers;
}

export class AnalysisApiClient {
  translateEvidenceToPins(
    elements: EvidenceElement[],
    snapshots: SectionSnapshotData[]
  ): Record<string, AnnotationPin[]> {
    const pinsBySnapshot: Record<string, AnnotationPin[]> = {};

    snapshots.forEach(snap => {
      pinsBySnapshot[snap.id] = [];
      const snapWidth = snap.cropRect.cropWidth || 1440;
      const snapHeight = snap.cropRect.cropHeight || 900;
      const snapX = snap.cropRect.cropX || 0;
      const snapY = snap.cropRect.cropY || 0;

      const matchedElements = elements.filter(
        el => el.associatedSnapshotId === snap.id || (el.viewport === snap.viewport && el.isVisible)
      );

      let pinNum = 1;
      matchedElements.forEach(el => {
        const elX = el.boundingBox.pageX;
        const elY = el.boundingBox.pageY;

        // Bounding box within crop boundaries
        if (
          elX >= snapX &&
          elX <= snapX + snapWidth &&
          elY >= snapY &&
          elY <= snapY + snapHeight
        ) {
          const relX = ((elX - snapX) / snapWidth) * 100;
          const relY = ((elY - snapY) / snapHeight) * 100;

          pinsBySnapshot[snap.id].push({
            id: `pin_${el.id}`,
            number: pinNum,
            x: Math.max(5, Math.min(95, Math.round(relX))),
            y: Math.max(5, Math.min(95, Math.round(relY))),
            title: `${pinNum}. ${el.category.toUpperCase()}: ${el.tag}`,
            description: el.visibleText.slice(0, 120)
          });
          pinNum++;
        }
      });
    });

    return pinsBySnapshot;
  }

  async crawlAndAnalyzeWebsite(
    audit: Audit,
    framework: MasterFramework,
    diagnoses: Diagnosis[],
    assets: AuditAsset[],
    onProgress?: (status: string) => void
  ): Promise<CrawlAndAnalysisResult> {
    if (onProgress) onProgress('Scanning website and discovering priority pages...');

    // 1. Multi-Page Headless Crawl (Up to 5 pages)
    let crawlRes: Response;
    try {
      crawlRes = await fetch('/api/crawler', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetUrl: audit.websiteUrl })
      });
    } catch (networkErr: any) {
      throw new CrawlFailedError(
        `Unable to reach crawler endpoint: ${networkErr.message}`,
        'UNREACHABLE',
        503,
        'Ensure the local development server is running, or switch to Manual Audit Mode.'
      );
    }

    if (!crawlRes.ok) {
      const errData = await crawlRes.json().catch(() => ({}));
      throw new CrawlFailedError(
        errData.message || `Crawl failed with status ${crawlRes.status}`,
        errData.errorType || 'CRAWL_FAILED',
        crawlRes.status,
        errData.recovery || 'Switch to Manual Audit Mode to upload screenshots directly.'
      );
    }

    const crawlData = await crawlRes.json();
    const evidenceMap: WebsiteEvidenceMap = crawlData.evidenceMap;

    if (onProgress) onProgress('Evaluating conversion framework against extracted evidence...');

    // 2. Multimodal / Heuristics Analysis
    const analyzeRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: getAuthHeaders(),
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
      const errData = await analyzeRes.json().catch(() => ({}));
      throw new AnalysisFailedError(errData.message || errData.error || `Server analysis returned status ${analyzeRes.status}`);
    }

    const analyzeData = await analyzeRes.json();
    if (!analyzeData.success || !analyzeData.scores) {
      throw new AnalysisFailedError(analyzeData.error || 'Invalid analysis response payload');
    }

    const validatedScores = validateServerAnalysisResponse(analyzeData.scores, framework);

    // 3. Save Snapshots & Translate Pins (Truthfully labeled as schematic wireframes)
    const newAssets: AuditAsset[] = [];
    if (evidenceMap && evidenceMap.snapshots) {
      const pinsBySnapshot = this.translateEvidenceToPins(evidenceMap.elements, evidenceMap.snapshots);

      for (const snap of evidenceMap.snapshots) {
        const pins = pinsBySnapshot[snap.id] || [];
        
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
          <rect width="1440" height="900" fill="#0f172a"/>
          <rect x="40" y="40" width="1360" height="820" rx="10" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="8,8"/>
          <text x="50%" y="40%" fill="#94a3b8" font-size="26" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" font-weight="700">
            SCHEMATIC WIREFRAME PLACEHOLDER
          </text>
          <text x="50%" y="47%" fill="#38bdf8" font-size="18" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" font-weight="600">
            ${snap.sectionType.replace('_', ' ').toUpperCase()} • Structural Layout Model
          </text>
          <text x="50%" y="54%" fill="#64748b" font-size="15" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
            Target: ${evidenceMap.targetUrl} (Crawled at ${new Date(evidenceMap.crawledAt).toLocaleTimeString()})
          </text>
          <text x="50%" y="62%" fill="#e2e8f0" font-size="14" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">
            [Notice: Upload an authentic screenshot in Step 2 to replace this schematic layout with observed visual proof]
          </text>
        </svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const newAsset: AuditAsset = {
          id: `asset_${snap.id}_${Date.now()}`,
          auditId: audit.id,
          type: 'source_of_truth',
          subType: snap.sectionType === 'mobile_hero' ? 'mobile_hero' : 'desktop_hero',
          title: `Schematic Layout: ${snap.sectionType.replace('_', ' ').toUpperCase()}`,
          caption: `Schematic wireframe placeholder generated from HTML DOM structure of ${snap.pageUrl}. Upload actual screenshot in Step 2 for observed visual evidence.`,
          notes: `Structural layout model bounds: [${snap.cropRect.cropX}, ${snap.cropRect.cropY}, ${snap.cropRect.cropWidth}x${snap.cropRect.cropHeight}]`,
          blob,
          mimeType: 'image/svg+xml',
          filename: `${snap.sectionType}_schematic.svg`,
          width: snap.cropRect.cropWidth,
          height: snap.cropRect.cropHeight,
          createdAt: new Date().toISOString(),
          pins
        };

        await db.assets.put(newAsset);
        newAssets.push(newAsset);
      }
    }

    // 4. Generate 6-Field Consolidated Findings
    const consolidatedFindings = generateConsolidatedFindings(validatedScores, framework, diagnoses);

    // Compute Stats
    let highConf = 0;
    let needConf = 0;
    let insuff = 0;
    let potentialIssues = 0;

    framework.checks.forEach(chk => {
      const s = validatedScores[chk.id];
      if (!s) return;
      if (s.confidence === 'high') highConf++;
      else if (s.confidence === 'insufficient_evidence') insuff++;
      else needConf++;

      if (s.score === 0 || s.score === 1) potentialIssues++;
    });

    return {
      updatedScores: validatedScores,
      consolidatedFindings,
      evidenceMap,
      newAssets,
      summaryStats: {
        totalChecks: framework.checks.length,
        highConfidenceCount: highConf,
        needsConfirmationCount: needConf,
        insufficientEvidenceCount: insuff,
        potentialIssuesCount: potentialIssues,
        suggestedFindingsCount: consolidatedFindings.length,
        provisionalAudit: insuff > 0
      }
    };
  }
}

function validateServerAnalysisResponse(
  scores: Record<string, any>,
  framework: MasterFramework
): Record<string, AuditScoreItem> {
  const cleanScores: Record<string, AuditScoreItem> = {};

  framework.checks.forEach(chk => {
    const raw = scores[chk.id];
    if (!raw) return;

    let score = raw.score ?? raw.proposedScore ?? null;
    if (score !== 0 && score !== 1 && score !== 2 && score !== null) {
      score = null;
    }

    cleanScores[chk.id] = {
      score,
      proposedScore: score,
      confidence: raw.confidence || (score === null ? 'insufficient_evidence' : 'high'),
      validationStatus: raw.validationStatus || (score === null ? 'needs_review' : 'generated'),
      evidenceType: raw.evidenceType || 'structural',
      evidenceSource: raw.evidenceSource || 'DOM Inspection',
      evidenceRefs: raw.evidenceRefs || [],
      rationale: raw.rationale || '',
      evidence: raw.evidence || '',
      businessImpact: raw.businessImpact || '',
      effort: raw.effort || (score === 0 ? 'High' : score === 1 ? 'Medium' : 'Low'),
      recommendedAction: raw.recommendedAction || '',
      tags: raw.tags || [],
      triggeredDiagnosisIds: raw.triggeredDiagnosisIds || [],
      suggestedFinding: raw.suggestedFinding,
      suggestedPriority: raw.suggestedPriority || (score === 0 ? 'Critical' : score === 1 ? 'High Impact' : 'Improvement')
    };
  });

  return cleanScores;
}

export const analysisApiClient = new AnalysisApiClient();
