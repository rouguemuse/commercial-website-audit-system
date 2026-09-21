import type {
  Audit,
  AuditScoreItem,
  MasterFramework,
  Diagnosis,
  AuditAsset,
  CompanyAnalysis,
  Opportunity,
  OpportunityDetectionResult,
  OpportunityCategoryTag,
  OpportunityStatus,
  OpportunityImpact
} from '../types';

interface GroupingPattern {
  themeKey: string;
  defaultTitle: string;
  capabilityTags: OpportunityCategoryTag[];
  estimatedImpact: OpportunityImpact;
  checkNumberRanges: number[];
  businessImplicationTemplate: string;
  proposedOpportunityTemplate: string;
  recommendedActionTemplate: string;
}

const THEME_PATTERNS: GroupingPattern[] = [
  {
    themeKey: 'above_the_fold_clarity',
    defaultTitle: 'Above-the-Fold Messaging & Offer Clarity',
    capabilityTags: ['messaging', 'conversion', 'UX', 'content'],
    estimatedImpact: 'high',
    checkNumberRanges: [1, 2, 3, 4],
    businessImplicationTemplate:
      'First-time visitors arriving from search or referrals may need additional interpretation before understanding what the business offers and whether it is relevant to their inquiry.',
    proposedOpportunityTemplate:
      'Revamp the primary hero banner with a clear outcome-oriented headline, direct service description, and distinct primary call-to-action.',
    recommendedActionTemplate:
      'Rewrite the hero value proposition and test a simplified headline structure above the fold.'
  },
  {
    themeKey: 'offer_transparency',
    defaultTitle: 'Offer Structure & Scope Transparency',
    capabilityTags: ['offer_structure', 'messaging', 'content'],
    estimatedImpact: 'medium',
    checkNumberRanges: [5, 6, 11, 12],
    businessImplicationTemplate:
      'Unclear service scope, process steps, or pricing expectations leaves prospective clients with ambiguity when comparing service providers.',
    proposedOpportunityTemplate:
      'Structure a clear "How It Works" step-by-step framework and outline transparent service packages or pricing guidance.',
    recommendedActionTemplate:
      'Add a 3-step engagement process section and clarify core deliverable deliverables on the homepage.'
  },
  {
    themeKey: 'trust_and_credibility',
    defaultTitle: 'Social Proof & Credibility Placement',
    capabilityTags: ['trust', 'conversion', 'content'],
    estimatedImpact: 'high',
    checkNumberRanges: [7, 8, 9, 10],
    businessImplicationTemplate:
      'Prospective clients without prior brand familiarity have less immediate visible proof and credibility validation when evaluating whether to initiate contact.',
    proposedOpportunityTemplate:
      'Prominently integrate verified customer reviews, local awards, licensing credentials, and recent case project imagery near conversion points.',
    recommendedActionTemplate:
      'Implement a high-trust proof strip above the fold and embed customer testimonial snippets near the primary inquiry form.'
  },
  {
    themeKey: 'conversion_flow_friction',
    defaultTitle: 'Lead Capture & Action Flow Friction',
    capabilityTags: ['lead_capture', 'conversion', 'UX'],
    estimatedImpact: 'high',
    checkNumberRanges: [13, 14, 15, 16],
    businessImplicationTemplate:
      'High-friction inquiry forms or missing direct contact paths require additional effort from visitors seeking an estimate or consultation.',
    proposedOpportunityTemplate:
      'Streamline the primary inquiry mechanism with a low-friction 3-field form and direct 1-tap contact actions.',
    recommendedActionTemplate:
      'Replace lengthy form fields with an instant estimate request tool and ensure prominent phone / quote buttons.'
  },
  {
    themeKey: 'local_discovery',
    defaultTitle: 'Local Service Area & Discovery Signals',
    capabilityTags: ['local_discovery', 'SEO', 'information_architecture'],
    estimatedImpact: 'medium',
    checkNumberRanges: [17, 18, 19, 20, 21, 22],
    businessImplicationTemplate:
      'Unclear geographic coverage or missing service-area signals leaves ambiguity about whether the company serves specific target municipalities or neighborhoods.',
    proposedOpportunityTemplate:
      'Clarify target service locations with dedicated regional callouts, address verification, and local landmark references.',
    recommendedActionTemplate:
      'Add a prominent service area badge and structured regional coverage list to the footer and contact sections.'
  },
  {
    themeKey: 'navigation_and_structure',
    defaultTitle: 'Information Architecture & Navigation Flow',
    capabilityTags: ['information_architecture', 'UX'],
    estimatedImpact: 'medium',
    checkNumberRanges: [23, 24],
    businessImplicationTemplate:
      'Complex menu hierarchy or fragmented secondary links make primary service categories and booking paths less prominent.',
    proposedOpportunityTemplate:
      'Simplify navigation hierarchy to focus attention on core service categories and primary consultation booking.',
    recommendedActionTemplate:
      'Streamline header navigation to top 4 essential items and add a dedicated sticky CTA button.'
  },
  {
    themeKey: 'mobile_optimization',
    defaultTitle: 'Mobile Experience & Tap-to-Action Accessibility',
    capabilityTags: ['mobile', 'conversion', 'UX'],
    estimatedImpact: 'high',
    checkNumberRanges: [25, 26, 27, 28],
    businessImplicationTemplate:
      'Non-clickable phone numbers or tight viewport spacing add interface friction for mobile visitors attempting to initiate direct contact.',
    proposedOpportunityTemplate:
      'Optimize the mobile viewport with sticky tap-to-call headers, touch-friendly tap targets, and streamlined vertical layouts.',
    recommendedActionTemplate:
      'Deploy a persistent mobile call bar and ensure all phone numbers use native tel: links.'
  },
  {
    themeKey: 'retention_and_automation',
    defaultTitle: 'Post-Visit Engagement & Lead Follow-up',
    capabilityTags: ['automation', 'lead_capture'],
    estimatedImpact: 'low',
    checkNumberRanges: [29, 30],
    businessImplicationTemplate:
      'Visitors conducting early-stage research have limited secondary engagement paths to learn more or save resources for future reference.',
    proposedOpportunityTemplate:
      'Introduce a low-commitment downloadable resource or instant pricing calculator to capture early-stage research leads.',
    recommendedActionTemplate:
      'Add an educational checklist or buyer guide capture mechanism for top-of-funnel visitors.'
  }
];

export class OpportunityDetectionService {
  /**
   * Sanitizes any incoming business implication text (including from Diagnosis library)
   * to ensure no unsupported causal claims (e.g. bounce rate spikes, revenue loss) bypass safety rules.
   */
  static sanitizeBusinessImplication(text: string, fallback: string): string {
    if (!text || !text.trim()) return fallback;

    let sanitized = text.trim();

    const quantifiedSuffix = '(?:\\s+by\\s+(?:\\d+(?:\\.\\d+)?%|\\$\\d[\\d,]*(?:\\.\\d+)?|\\d+(?:\\.\\d+)?x|\\d+\\s+percent))?';

    // Map of unsupported causal assertion patterns to disciplined risk/friction language
    const replacements: Array<{ pattern: RegExp; replacement: string }> = [
      { pattern: new RegExp(`increasing (?:initial )?bounce rates?${quantifiedSuffix}`, 'gi'), replacement: 'requiring additional visitor interpretation effort' },
      { pattern: new RegExp(`increases? (?:initial )?bounce rates?${quantifiedSuffix}`, 'gi'), replacement: 'requires additional visitor interpretation effort' },
      { pattern: new RegExp(`causes? (?:visitors?|prospects?|buyers?|users?) to bounce${quantifiedSuffix}`, 'gi'), replacement: 'creates uncertainty for visitors' },
      { pattern: new RegExp(`bounce within seconds${quantifiedSuffix}`, 'gi'), replacement: 'may experience hesitation' },
      { pattern: new RegExp(`resulting in lost (?:local )?leads?${quantifiedSuffix}`, 'gi'), replacement: 'adding friction for potential inquiries' },
      { pattern: new RegExp(`causes? (?:visitor )?drop-?offs?${quantifiedSuffix}`, 'gi'), replacement: 'adds friction to the conversion path' },
      { pattern: new RegExp(`causes? (?:buyers|visitors) to leave${quantifiedSuffix}`, 'gi'), replacement: 'leaves visitors with unaddressed questions' },
      { pattern: new RegExp(`reduces? (?:quote )?(?:submissions|conversions?)${quantifiedSuffix}`, 'gi'), replacement: 'requires more user effort before submitting' },
      { pattern: new RegExp(`hurts? revenue${quantifiedSuffix}`, 'gi'), replacement: 'limits commercial clarity' },
      { pattern: new RegExp(`costs? (?:the business )?revenue${quantifiedSuffix}`, 'gi'), replacement: 'leaves commercial opportunities unaddressed' },
      { pattern: new RegExp(`loses? (?:potential )?customers?${quantifiedSuffix}`, 'gi'), replacement: 'creates friction in customer discovery' },
      { pattern: new RegExp(`reduces? search rankings?${quantifiedSuffix}`, 'gi'), replacement: 'leaves discovery signals incomplete' }
    ];

    for (const { pattern, replacement } of replacements) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    sanitized = sanitized.replace(/\s{2,}/g, ' ');

    return sanitized;
  }

  /**
   * Evaluates an audit and linked company analysis to produce grounded, defensible opportunities.
   */
  static detectOpportunities(
    companyAnalysis: CompanyAnalysis,
    audit: Audit,
    framework?: MasterFramework | null,
    diagnoses: Diagnosis[] = [],
    assets: AuditAsset[] = []
  ): OpportunityDetectionResult {
    const scores = audit.scores || {};
    const findings = audit.findings || [];
    const checks = framework?.checks || audit.frameworkSnapshot?.checks || [];

    let totalEvaluated = 0;
    let failingCount = 0;
    let weakCount = 0;
    let insufficientCount = 0;

    // 1. Identify failing/weak candidate items with evidence
    interface CandidateCheckEvidence {
      checkId: string;
      checkNumber: number;
      checkTitle: string;
      scoreItem: AuditScoreItem;
      matchedDiagnosis?: Diagnosis;
      associatedFinding?: any;
    }

    const candidateEvidenceList: CandidateCheckEvidence[] = [];

    Object.entries(scores).forEach(([checkId, scoreItem]) => {
      totalEvaluated++;
      const score = scoreItem.score;

      if (score === null) {
        insufficientCount++;
        return;
      }

      if (score === 0) {
        failingCount++;
      } else if (score === 1) {
        weakCount++;
      } else {
        return; // working well (2) does not create a problem opportunity
      }

      // Check must have some concrete evidence or rationale to be considered
      const hasRefs = (scoreItem.evidenceRefs && scoreItem.evidenceRefs.length > 0);
      const hasTextEvidence = (scoreItem.evidence && scoreItem.evidence.trim().length > 0);
      const hasRationale = (scoreItem.rationale && scoreItem.rationale.trim().length > 0);
      const hasAsset = !!scoreItem.evidenceAssetId;

      // If absolutely no evidence or explanation exists, exclude from automated detection
      if (!hasRefs && !hasTextEvidence && !hasRationale && !hasAsset) {
        return;
      }

      const checkDef = checks.find(c => c.id === checkId);
      const checkNum = checkDef?.number || parseInt(checkId.replace(/\D/g, ''), 10) || 0;
      const checkTitle = checkDef?.title || `Check #${checkNum}`;

      // Match diagnosis if available
      let matchedDiag: Diagnosis | undefined;
      if (scoreItem.triggeredDiagnosisIds && scoreItem.triggeredDiagnosisIds.length > 0) {
        matchedDiag = diagnoses.find(d => d.id === scoreItem.triggeredDiagnosisIds[0]);
      }
      if (!matchedDiag) {
        matchedDiag = diagnoses.find(d =>
          d.triggers?.some(t => t.checkId === checkId && t.triggerScores?.includes(score as number))
        );
      }

      const assocFinding = findings.find(f => f.checkId === checkId || f.associatedCheckIds?.includes(checkId));

      candidateEvidenceList.push({
        checkId,
        checkNumber: checkNum,
        checkTitle,
        scoreItem,
        matchedDiagnosis: matchedDiag,
        associatedFinding: assocFinding
      });
    });

    // 2. Group candidate checks by theme for deduplication
    const groupedOpportunities: Opportunity[] = [];
    const usedCheckIds = new Set<string>();

    for (const pattern of THEME_PATTERNS) {
      const matchingCandidates = candidateEvidenceList.filter(c =>
        pattern.checkNumberRanges.includes(c.checkNumber) && !usedCheckIds.has(c.checkId)
      );

      if (matchingCandidates.length === 0) continue;

      // Check for CONFLICTING EVIDENCE in the same theme
      // (e.g. check 1 is broken, but check 2 is scored 2 / Working Well)
      const workingChecksInTheme: string[] = [];
      for (const checkNum of pattern.checkNumberRanges) {
        const matchingCheckDef = checks.find(c => c.number === checkNum);
        if (matchingCheckDef && scores[matchingCheckDef.id]?.score === 2) {
          workingChecksInTheme.push(matchingCheckDef.title);
        }
      }
      const hasConflictingPositiveEvidence = workingChecksInTheme.length > 0;

      // Mark check IDs as used in this opportunity group
      matchingCandidates.forEach(c => usedCheckIds.add(c.checkId));

      // Build consolidated opportunity fields
      const contributingCheckIds = matchingCandidates.map(c => c.checkId);
      const primaryCandidate = matchingCandidates.find(c => c.scoreItem.score === 0) || matchingCandidates[0];

      // Aggregate evidenceRefs
      const evidenceRefsSet = new Set<string>();
      matchingCandidates.forEach(c => {
        (c.scoreItem.evidenceRefs || []).forEach(ref => evidenceRefsSet.add(ref));
        if (c.scoreItem.evidenceSource) evidenceRefsSet.add(c.scoreItem.evidenceSource);
      });
      const evidenceRefs = Array.from(evidenceRefsSet);

      // Aggregate evidenceAssetIds
      const assetIdsSet = new Set<string>();
      matchingCandidates.forEach(c => {
        if (c.scoreItem.evidenceAssetId) assetIdsSet.add(c.scoreItem.evidenceAssetId);
      });
      const evidenceAssetIds = Array.from(assetIdsSet);

      // Aggregate evidenceText
      const evidenceTextList: string[] = [];
      matchingCandidates.forEach(c => {
        if (c.scoreItem.evidence && c.scoreItem.evidence.trim()) {
          evidenceTextList.push(`[${c.checkTitle}]: ${c.scoreItem.evidence.trim()}`);
        } else if (c.scoreItem.rationale && c.scoreItem.rationale.trim()) {
          evidenceTextList.push(`[${c.checkTitle} Observation]: ${c.scoreItem.rationale.trim()}`);
        }
      });

      // Construct factual observation
      const observationBullets = matchingCandidates.map(c => {
        const scoreDesc = c.scoreItem.score === 0 ? 'is missing or broken' : 'is weak or requires interpretation';
        const tagText = (c.scoreItem.tags && c.scoreItem.tags.length > 0) ? ` (${c.scoreItem.tags.join(', ')})` : '';
        return `${c.checkTitle} ${scoreDesc}${tagText}.`;
      });
      let observation = observationBullets.join(' ');

      if (hasConflictingPositiveEvidence) {
        observation += ` (Note: Corroborating section elements such as "${workingChecksInTheme[0]}" are in place, but primary execution remains fragmented).`;
      }

      // Business implication (using sanitized matched diagnosis or disciplined theme template)
      let rawImplication = pattern.businessImplicationTemplate;
      const diagWithWhy = matchingCandidates.find(c => c.matchedDiagnosis?.whyItMatters)?.matchedDiagnosis;
      if (diagWithWhy?.whyItMatters) {
        rawImplication = diagWithWhy.whyItMatters;
      }
      const businessImplication = this.sanitizeBusinessImplication(rawImplication, pattern.businessImplicationTemplate);

      // Proposed opportunity & recommended action
      let proposedOpportunity = pattern.proposedOpportunityTemplate;
      let recommendedAction = pattern.recommendedActionTemplate;

      const diagWithFix = matchingCandidates.find(c => c.matchedDiagnosis?.recommendedFix)?.matchedDiagnosis;
      if (diagWithFix?.finding) {
        proposedOpportunity = diagWithFix.finding;
      }
      if (diagWithFix?.recommendedFix) {
        recommendedAction = diagWithFix.recommendedFix;
      }

      // Title
      const title = diagWithFix?.name || pattern.defaultTitle;

      // 3. Compute Evidence-Based Confidence Score (0-100)
      // (Represents confidence that the diagnosed opportunity exists based on evidence)
      let confidence = 50;

      // Score severity base: broken (0) adds +20, weak (1) adds +10
      const hasBroken = matchingCandidates.some(c => c.scoreItem.score === 0);
      if (hasBroken) confidence += 20;
      else confidence += 10;

      // Multi-check corroboration: 2+ checks in same theme adds +15
      if (matchingCandidates.length >= 2) {
        confidence += 15;
      }

      // Direct DOM evidence refs
      if (evidenceRefs.length >= 2) {
        confidence += 15;
      } else if (evidenceRefs.length === 1) {
        confidence += 10;
      }

      // Extracted text evidence
      if (evidenceTextList.length > 0) {
        confidence += 10;
      }

      // Screenshot asset with visual pins attached
      if (evidenceAssetIds.length > 0) {
        confidence += 10;
      }

      // CONFLICTING EVIDENCE PENALTY:
      // When positive implementations exist in the same theme, evidence is mixed
      if (hasConflictingPositiveEvidence) {
        confidence -= 15;
      }

      // Check confidence penalty from evaluator
      const lowConfChecks = matchingCandidates.filter(c => c.scoreItem.confidence === 'low' || c.scoreItem.confidence === 'insufficient_evidence');
      if (lowConfChecks.length > 0) {
        confidence -= 20;
      }

      // Lack of direct evidence penalty
      if (evidenceRefs.length === 0 && evidenceAssetIds.length === 0) {
        confidence -= 25;
      }

      // Clamp between 0 and 98
      confidence = Math.max(10, Math.min(98, confidence));

      // Determine initial status based on strict confidence threshold
      // NOTE: Automated detection sets 'detected', 'needs_review', or 'rejected'.
      // 'accepted' is reserved exclusively for explicit human validation.
      let status: OpportunityStatus = 'detected';
      if (confidence < 60) {
        status = 'rejected';
      } else if (confidence < 75 || hasConflictingPositiveEvidence) {
        status = 'needs_review';
      }

      // Only add opportunities that have at least one valid piece of evidence
      if (evidenceRefs.length > 0 || evidenceAssetIds.length > 0 || evidenceTextList.length > 0) {
        const cleanId = `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();

        groupedOpportunities.push({
          id: cleanId,
          companyAnalysisId: companyAnalysis.id,
          companyId: companyAnalysis.companyId,
          auditId: audit.id,
          title,
          observation,
          evidenceRefs,
          evidenceAssetIds,
          evidenceText: evidenceTextList,
          businessImplication,
          proposedOpportunity,
          recommendedAction,
          capabilityTags: pattern.capabilityTags,
          estimatedImpact: pattern.estimatedImpact,
          implicationBasis: 'inferred_risk',
          confidenceScore: confidence,
          status,
          contributingCheckIds,
          primaryCheckId: primaryCandidate.checkId,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    // 4. Handle remaining un-grouped candidate checks individually
    const remainingCandidates = candidateEvidenceList.filter(c => !usedCheckIds.has(c.checkId));
    for (const cand of remainingCandidates) {
      const hasDirectEvidence = (cand.scoreItem.evidenceRefs && cand.scoreItem.evidenceRefs.length > 0) || !!cand.scoreItem.evidenceAssetId;
      if (!hasDirectEvidence) continue; // Conservative: Skip single checks without direct evidence

      const cleanId = `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      let confidence = cand.scoreItem.score === 0 ? 65 : 55;
      if (cand.scoreItem.evidenceRefs && cand.scoreItem.evidenceRefs.length > 0) confidence += 15;
      if (cand.scoreItem.evidenceAssetId) confidence += 10;
      confidence = Math.max(10, Math.min(95, confidence));

      const status: OpportunityStatus = confidence >= 75 ? 'detected' : (confidence >= 60 ? 'needs_review' : 'rejected');

      const fallbackImplication = this.sanitizeBusinessImplication(
        cand.matchedDiagnosis?.whyItMatters || '',
        'This observed condition may require additional effort or create hesitation during the visitor evaluation process.'
      );

      // Map narrow capability tags based on the single check
      const narrowTags: OpportunityCategoryTag[] = [];
      if (cand.scoreItem.tags && cand.scoreItem.tags.length > 0) {
        cand.scoreItem.tags.forEach(t => narrowTags.push(t.toLowerCase().replace(/\s+/g, '_')));
      } else {
        narrowTags.push('UX');
      }

      groupedOpportunities.push({
        id: cleanId,
        companyAnalysisId: companyAnalysis.id,
        companyId: companyAnalysis.companyId,
        auditId: audit.id,
        title: cand.matchedDiagnosis?.name || `${cand.checkTitle} Improvement`,
        observation: `${cand.checkTitle} was evaluated as ${cand.scoreItem.score === 0 ? 'broken/missing' : 'weak'}. ${cand.scoreItem.rationale || ''}`,
        evidenceRefs: cand.scoreItem.evidenceRefs || (cand.scoreItem.evidenceSource ? [cand.scoreItem.evidenceSource] : []),
        evidenceAssetIds: cand.scoreItem.evidenceAssetId ? [cand.scoreItem.evidenceAssetId] : [],
        evidenceText: cand.scoreItem.evidence ? [cand.scoreItem.evidence] : [],
        businessImplication: fallbackImplication,
        proposedOpportunity: cand.matchedDiagnosis?.finding || `Refine ${cand.checkTitle} implementation.`,
        recommendedAction: cand.matchedDiagnosis?.recommendedFix || `Review and optimize ${cand.checkTitle}.`,
        capabilityTags: narrowTags,
        estimatedImpact: 'medium',
        implicationBasis: 'inferred_risk',
        confidenceScore: confidence,
        status,
        contributingCheckIds: [cand.checkId],
        primaryCheckId: cand.checkId,
        createdAt: now,
        updatedAt: now
      });
    }

    // Filter out rejected / below-threshold opportunities for the defensible list
    const defensibleOpportunities = groupedOpportunities.filter(o => o.status !== 'rejected' && o.confidenceScore >= 60);

    return {
      opportunities: defensibleOpportunities,
      totalEvaluatedChecks: totalEvaluated,
      failingChecksCount: failingCount,
      weakChecksCount: weakCount,
      insufficientEvidenceCount: insufficientCount,
      deduplicatedCount: candidateEvidenceList.length - groupedOpportunities.length,
      hasDefensibleOpportunities: defensibleOpportunities.length > 0,
      generatedAt: new Date().toISOString()
    };
  }
}
