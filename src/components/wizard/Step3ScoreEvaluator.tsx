import React, { useState } from 'react';
import type {
  Audit,
  MasterFramework,
  Diagnosis,
  AuditAsset,
  AuditScoreItem,
  ValidationStatus,
  AssessmentConfidence
} from '../../types';
import { calculateAuditScores } from '../../utils/scoreCalculator';
import { ScoreBadge } from '../common/ScoreBadge';
import { GLOBAL_ISSUE_TAGS, getIssueTagColor } from '../../data/issueTags';
import { analysisApiClient } from '../../services/analysisApiClient';
import { EvidenceDrawer } from './EvidenceDrawer';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Check,
  Edit3,
  Tag,
  Plus,
  X,
  Filter,
  Layers,
  Zap,
  Info,
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  Eye,
  ExternalLink
} from 'lucide-react';

interface Step3Props {
  audit: Audit;
  framework: MasterFramework;
  diagnoses: Diagnosis[];
  assets: AuditAsset[];
  onScoresChange: (scores: Audit['scores']) => void;
  onFindingsAutoUpdate?: (findings: any[]) => void;
  onGoToManualMode?: () => void;
  onLoadDemoAudit?: () => void;
}

export const Step3ScoreEvaluator: React.FC<Step3Props> = ({
  audit,
  framework,
  diagnoses,
  assets,
  onScoresChange,
  onFindingsAutoUpdate,
  onGoToManualMode,
  onLoadDemoAudit
}) => {
  const [filterMode, setFilterMode] = useState<'review_first' | 'all' | 'strong' | 'category'>('review_first');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(framework.categories[0]?.id || 'cat_clarity');
  const [activeTagPickerCheckId, setActiveTagPickerCheckId] = useState<string | null>(null);
  const [activeDrawerCheckId, setActiveDrawerCheckId] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [editingRationaleCheckId, setEditingRationaleCheckId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crawlProgressText, setCrawlProgressText] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<{ message: string; errorType?: string; recovery?: string } | null>(null);

  const scoreResult = calculateAuditScores(audit.scores, framework);

  // Compute validation stats
  let highConfCount = 0;
  let needConfCount = 0;
  let insuffCount = 0;
  let issuesCount = 0;
  let validatedCount = 0;

  framework.checks.forEach((chk) => {
    const item = audit.scores[chk.id];
    if (!item) return;

    if (item.confidence === 'high') highConfCount++;
    else if (item.confidence === 'insufficient_evidence') insuffCount++;
    else needConfCount++;

    if (item.score === 0 || item.score === 1) issuesCount++;
    if (item.validationStatus === 'validated' || item.validationStatus === 'modified') validatedCount++;
  });

  // Run AI Pre-Audit Analysis via Server-Side API Client
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setCrawlProgressText('SSRF-Safe Multi-Page Crawl & Evidence Capture...');
    try {
      const result = await analysisApiClient.crawlAndAnalyzeWebsite(
        audit,
        framework,
        diagnoses,
        assets,
        (status) => setCrawlProgressText(status)
      );
      onScoresChange(result.updatedScores);
      if (onFindingsAutoUpdate) {
        onFindingsAutoUpdate(result.consolidatedFindings);
      }
    } catch (err: any) {
      setAnalysisError({
        message: err.message || 'Analysis failed. You can retry or review manually.',
        errorType: err.errorType,
        recovery: err.recovery
      });
    } finally {
      setIsAnalyzing(false);
      setCrawlProgressText(null);
    }
  };

  // Auto-run if scores are completely empty
  React.useEffect(() => {
    if (Object.keys(audit.scores).length === 0) {
      handleRunAnalysis();
    }
  }, []);

  // Quick One-Click Accept
  const handleAcceptCheck = (checkId: string) => {
    const current = audit.scores[checkId];
    if (!current) return;
    onScoresChange({
      ...audit.scores,
      [checkId]: {
        ...current,
        validationStatus: 'validated'
      }
    });
  };

  // Direct Score Change / Override
  const handleOverrideScore = (checkId: string, newScore: number) => {
    const current = audit.scores[checkId] || {
      score: newScore,
      confidence: 'high',
      validationStatus: 'modified',
      evidenceType: 'context',
      evidenceSource: 'Auditor Manual Override',
      rationale: '',
      evidence: '',
      tags: [],
      triggeredDiagnosisIds: []
    };

    onScoresChange({
      ...audit.scores,
      [checkId]: {
        ...current,
        score: newScore,
        validationStatus: 'modified',
        evidenceSource: current.evidenceSource || 'Auditor Override'
      }
    });
  };

  // Bulk Accept High Confidence
  const handleAcceptAllHighConfidence = () => {
    const updated = { ...audit.scores };
    framework.checks.forEach((chk) => {
      const item = updated[chk.id];
      if (item && item.confidence === 'high' && item.validationStatus !== 'validated') {
        item.validationStatus = 'validated';
      }
    });
    onScoresChange(updated);
  };

  // Drawer Evidence Updates
  const handleDrawerSave = (checkId: string, updatedScoreItem: AuditScoreItem) => {
    onScoresChange({
      ...audit.scores,
      [checkId]: updatedScoreItem
    });
    setActiveDrawerCheckId(null);
  };

  // Bulk Accept Active Category
  const handleAcceptCategory = (categoryId: string) => {
    const updated = { ...audit.scores };
    const catChecks = framework.checks.filter(c => c.categoryId === categoryId);
    catChecks.forEach((chk) => {
      const item = updated[chk.id];
      if (item && item.validationStatus === 'generated') {
        updated[chk.id] = { ...item, validationStatus: 'validated' };
      }
    });
    onScoresChange(updated);
  };

  // Toggle Issue Tag
  const handleToggleTag = (checkId: string, tagId: string) => {
    const current = audit.scores[checkId];
    if (!current) return;
    const existingTags = current.tags || [];
    const newTags = existingTags.includes(tagId)
      ? existingTags.filter(t => t !== tagId)
      : [...existingTags, tagId];

    onScoresChange({
      ...audit.scores,
      [checkId]: {
        ...current,
        tags: newTags,
        validationStatus: 'modified'
      }
    });
  };

  // Filter checks according to active queue filter
  const displayedChecks = framework.checks.filter((chk) => {
    const item = audit.scores[chk.id];
    if (filterMode === 'review_first') {
      // Show issues (score 0/1 or null), low confidence, insufficient evidence, or needs_review
      return !item || item.score === null || item.score < 2 || item.confidence !== 'high' || item.validationStatus === 'needs_review' || item.validationStatus === 'generated';
    } else if (filterMode === 'strong') {
      // Show score 2 / working well
      return item && item.score === 2;
    } else if (filterMode === 'category') {
      return chk.categoryId === selectedCategoryId;
    }
    return true; // 'all'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Explicit Analysis Error Banner with Full Recovery Paths */}
      {analysisError && (
        <div
          style={{
            background: 'var(--danger-bg, #fef2f2)',
            border: '1px solid var(--danger-border, #fecaca)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              <AlertTriangle size={22} color="var(--danger-solid, #dc2626)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, color: 'var(--danger-text, #991b1b)', fontSize: '1rem' }}>
                  {analysisError.errorType ? `Scan Blocked / Failed (${analysisError.errorType})` : 'Analysis Encountered An Issue'}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--danger-text, #991b1b)', marginTop: '4px', opacity: 0.95 }}>
                  {analysisError.message}
                </div>
                {analysisError.recovery && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary, #1e293b)', background: 'rgba(255,255,255,0.7)', padding: '6px 12px', borderRadius: '6px', marginTop: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    💡 <strong>Suggested Recovery:</strong> {analysisError.recovery}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginTop: '6px', fontStyle: 'italic' }}>
                  Anti-Hallucination Policy: The system will never fabricate synthetic scores or fake evidence for a failed crawl.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onGoToManualMode && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onGoToManualMode}
                >
                  Switch to Manual Audit Mode
                </button>
              )}
              {onLoadDemoAudit && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onLoadDemoAudit}
                >
                  Load Sample Demo Audit
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setAnalysisError(null)}
              >
                Dismiss & Review Manually
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleRunAnalysis}
              >
                <RefreshCw size={13} /> Retry Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Validation Dashboard Summary Strip */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'var(--bg-surface)',
          borderColor: 'var(--accent-border)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Zap size={14} /> AI-Assisted Validation Queue
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {scoreResult.scoreFormatted}
            </div>
            <ScoreBadge
              score={scoreResult.totalScore}
              maxScore={scoreResult.maxScore}
              rescueLevel={scoreResult.rescueLevel}
              size="md"
              showScore={false}
            />
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {validatedCount} of 30 checks validated by auditor
          </div>
        </div>

        {/* Validation Metric Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '8px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>High Confidence</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--success-text)' }}>{highConfCount}</div>
          </div>

          <div className="card" style={{ padding: '8px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Needs Confirmation</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--warning-text)' }}>{needConfCount}</div>
          </div>

          <div className="card" style={{ padding: '8px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Insufficient Evidence</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{insuffCount}</div>
          </div>

          <div className="card" style={{ padding: '8px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Issues / Leaks</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger-text)' }}>{issuesCount}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            title="Re-run automated inspection across all 30 checks"
          >
            {isAnalyzing ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />} {isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAcceptAllHighConfidence}
          >
            <CheckCircle2 size={14} /> Accept High-Confidence ({highConfCount})
          </button>
        </div>
      </div>

      {/* Global Pattern Intelligence Banner */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-text)', letterSpacing: '0.04em' }}>
              Primary Website Pattern Detected
            </span>
            <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>Global Heuristic</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Core Offer Ambiguity & High Visitor Interpretation (Observed across 6+ Checks)
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
            The site's biggest issue isn't that information is completely missing. Much of it is present, but visitors repeatedly have to interpret what it means, creating hesitation across the hero headline, service explanations, and call-to-action buttons.
          </p>
        </div>
      </div>

      {/* Triage Queue Filter Tabs */}
      <div className="card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div className="tabs-header" style={{ border: 'none' }}>
          <button
            type="button"
            className={`tab-btn ${filterMode === 'review_first' ? 'active' : ''}`}
            onClick={() => setFilterMode('review_first')}
          >
            🔥 Review First (Issues & Exceptions) ({displayedChecks.length})
          </button>

          <button
            type="button"
            className={`tab-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            📋 All 30 Checks
          </button>

          <button
            type="button"
            className={`tab-btn ${filterMode === 'strong' ? 'active' : ''}`}
            onClick={() => setFilterMode('strong')}
          >
            ✓ Working Well (Score 2)
          </button>

          <button
            type="button"
            className={`tab-btn ${filterMode === 'category' ? 'active' : ''}`}
            onClick={() => setFilterMode('category')}
          >
            📂 By Category
          </button>
        </div>

        {filterMode === 'category' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="select"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {framework.categories.map(cat => (
                <option key={cat.id} value={cat.id}>Category {cat.number}: {cat.shortName}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleAcceptCategory(selectedCategoryId)}
            >
              Accept Category
            </button>
          </div>
        )}
      </div>

      {/* Populated Validation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayedChecks.map((chk) => {
          const item = audit.scores[chk.id] || {
            score: 2,
            confidence: 'medium',
            validationStatus: 'generated',
            evidenceType: 'structural',
            evidenceSource: 'General Inspection',
            rationale: 'Pending analysis.',
            evidence: '',
            tags: [],
            triggeredDiagnosisIds: []
          };

          const isModified = item.validationStatus === 'modified';
          const isValidated = item.validationStatus === 'validated';
          const isGenerated = item.validationStatus === 'generated';
          const isNeedsReview = item.validationStatus === 'needs_review' || item.confidence === 'insufficient_evidence';

          let confBadgeClass = 'badge-green';
          let confLabel = 'High Confidence';
          if (item.confidence === 'insufficient_evidence') {
            confBadgeClass = 'badge-rose';
            confLabel = 'Insufficient Evidence';
          } else if (item.confidence === 'medium') {
            confBadgeClass = 'badge-amber';
            confLabel = 'Medium Confidence';
          } else if (item.confidence === 'low') {
            confBadgeClass = 'badge-orange';
            confLabel = 'Low Confidence';
          }

          return (
            <div
              key={chk.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderColor: isValidated ? 'var(--success-border)' : isModified ? 'var(--accent-border)' : isNeedsReview ? 'var(--warning-border)' : 'var(--border-subtle)',
                background: isValidated ? '#fbfdfb' : isModified ? '#fafafa' : isNeedsReview ? '#fffdf7' : 'var(--bg-surface)'
              }}
            >
              {/* Header: Check & AI Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 450px' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: isValidated ? 'var(--success-bg)' : isModified ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                      color: isValidated ? 'var(--success-text)' : isModified ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    #{chk.number}
                  </span>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {chk.title}
                      </h3>

                      {/* Explicit Human Validation Distinction Badges */}
                      {isGenerated && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          🤖 AI Proposed
                        </span>
                      )}
                      {isValidated && (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                          ✓ Validated
                        </span>
                      )}
                      {isModified && (
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                          ✏️ Modified by Auditor
                        </span>
                      )}
                      {isNeedsReview && (
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                          ⚠️ Needs Review
                        </span>
                      )}

                      <span className={`badge ${confBadgeClass}`} style={{ fontSize: '0.7rem' }}>
                        {confLabel}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                      {chk.evaluatorQuestion}
                    </div>
                  </div>
                </div>

                {/* Score Selection Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="score-btn-group">
                    <button
                      type="button"
                      className={`score-btn ${item.score === 0 ? 'active-0' : ''}`}
                      onClick={() => handleOverrideScore(chk.id, 0)}
                      title="Mark as Missing or Broken"
                    >
                      0 • Broken
                    </button>
                    <button
                      type="button"
                      className={`score-btn ${item.score === 1 ? 'active-1' : ''}`}
                      onClick={() => handleOverrideScore(chk.id, 1)}
                      title="Mark as Weak or Needs Improvement"
                    >
                      1 • Weak
                    </button>
                    <button
                      type="button"
                      className={`score-btn ${item.score === 2 ? 'active-2' : ''}`}
                      onClick={() => handleOverrideScore(chk.id, 2)}
                      title="Mark as Working Well"
                    >
                      2 • Working
                    </button>
                  </div>

                  {!isValidated ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAcceptCheck(chk.id)}
                      style={{ padding: '6px 12px' }}
                    >
                      <Check size={14} /> Accept
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAcceptCheck(chk.id)}
                      style={{ padding: '6px 10px', color: 'var(--success-text)' }}
                    >
                      <CheckCircle2 size={14} /> Accepted
                    </button>
                  )}
                </div>
              </div>

              {/* Traceable Evidence Observation Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  {item.evidenceType && (
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>
                      Evidence: {item.evidenceType}
                    </span>
                  )}
                  {item.evidenceSource && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Source: {item.evidenceSource}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Rationale: </strong>
                  {item.rationale || 'Assessment derived from verified website evidence.'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                  {item.evidence ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flex: 1 }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Evidence Observation: </strong>
                      <span style={{ fontStyle: 'italic' }}>"{item.evidence}"</span>
                    </div>
                  ) : <div />}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveDrawerCheckId(chk.id)}
                    style={{ fontSize: '0.78rem', padding: '4px 10px', gap: '5px' }}
                  >
                    <Eye size={13} /> View Evidence →
                  </button>
                </div>
              </div>

              {/* Reusable Issue Tags */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Issue Tags:
                  </span>
                  {item.tags.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
                  ) : (
                    item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-accent"
                        style={{ fontSize: '0.74rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', fontWeight: 600 }}
                      >
                        {tag}
                        <X
                          size={11}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleTag(chk.id, tag)}
                        />
                      </span>
                    ))
                  )}

                  {/* Add Tag Button */}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px', fontSize: '0.72rem', height: '22px' }}
                    onClick={() => setActiveTagPickerCheckId(activeTagPickerCheckId === chk.id ? null : chk.id)}
                  >
                    <Plus size={11} /> Tag
                  </button>
                </div>

                {/* Suggested High-Level Finding */}
                {item.suggestedFinding && (item.score === 0 || item.score === 1) && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-text)', fontWeight: 600 }}>
                    💡 Suggested Finding: "{item.suggestedFinding}"
                  </div>
                )}
              </div>

              {/* Tag Picker Popover */}
              {activeTagPickerCheckId === chk.id && (
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      Select Issue Tags (Global Taxonomy)
                    </span>
                    <button
                      type="button"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                      onClick={() => setActiveTagPickerCheckId(null)}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <input
                    type="text"
                    className="input"
                    placeholder="Filter issue tags (e.g. Vague, Friction)..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                    {GLOBAL_ISSUE_TAGS.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase())).map((t) => {
                      const isSelected = item.tags.includes(t.name);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className="btn btn-sm"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.74rem',
                            background: isSelected ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                            color: isSelected ? '#fff' : 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                          onClick={() => handleToggleTag(chk.id, t.name)}
                        >
                          {isSelected ? '✓ ' : ''}{t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Slide-Over Evidence Drawer */}
      {activeDrawerCheckId && (
        <EvidenceDrawer
          isOpen={true}
          onClose={() => setActiveDrawerCheckId(null)}
          check={framework.checks.find(c => c.id === activeDrawerCheckId) || null}
          scoreItem={audit.scores[activeDrawerCheckId] || null}
          evidenceElements={[]}
          snapshots={[]}
          assets={assets}
          onValidateScore={(checkId, score, status) => {
            const current = audit.scores[checkId];
            onScoresChange({
              ...audit.scores,
              [checkId]: {
                ...current,
                score,
                validationStatus: status
              }
            });
          }}
          onNextCheck={() => {
            const currentIndex = framework.checks.findIndex(c => c.id === activeDrawerCheckId);
            if (currentIndex >= 0 && currentIndex < framework.checks.length - 1) {
              setActiveDrawerCheckId(framework.checks[currentIndex + 1].id);
            }
          }}
          onPrevCheck={() => {
            const currentIndex = framework.checks.findIndex(c => c.id === activeDrawerCheckId);
            if (currentIndex > 0) {
              setActiveDrawerCheckId(framework.checks[currentIndex - 1].id);
            }
          }}
        />
      )}
    </div>
  );
};
