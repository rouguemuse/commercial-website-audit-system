import React from 'react';
import type { FrameworkCheck, AuditScoreItem, EvidenceElement, AuditAsset, SectionSnapshotData } from '../../types';
import { getIssueTagColor } from '../../data/issueTags';
import { X, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, ArrowLeft, ExternalLink, ShieldCheck, Eye } from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  check: FrameworkCheck | null;
  scoreItem: AuditScoreItem | null;
  evidenceElements: EvidenceElement[];
  snapshots: SectionSnapshotData[];
  assets: AuditAsset[];
  onValidateScore: (checkId: string, score: number, status: 'validated' | 'modified') => void;
  onNextCheck?: () => void;
  onPrevCheck?: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  check,
  scoreItem,
  evidenceElements,
  snapshots,
  assets,
  onValidateScore,
  onNextCheck,
  onPrevCheck
}) => {
  if (!isOpen || !check || !scoreItem) return null;

  // Resolve matching evidence elements
  const matchedElements = evidenceElements.filter(el =>
    scoreItem.evidenceRefs?.includes(el.id) || el.id === scoreItem.evidenceSource
  );

  const primaryElement = matchedElements[0];

  // Resolve snapshot data and crop calculation
  const snapshotData = snapshots.find(s => s.id === primaryElement?.associatedSnapshotId) || snapshots[0];
  const sourceAsset = assets.find(a => a.type === 'source_of_truth');

  // Compute exact snapshot-relative coordinates
  let pinRelX = 50;
  let pinRelY = 50;
  let hasExactGeometry = false;

  if (primaryElement && snapshotData?.cropRect) {
    const { pageX, pageY, width, height } = primaryElement.boundingBox;
    const { cropX, cropY, cropWidth, cropHeight } = snapshotData.cropRect;

    if (cropWidth > 0 && cropHeight > 0) {
      pinRelX = Math.max(5, Math.min(95, (((pageX + width / 2) - cropX) / cropWidth) * 100));
      pinRelY = Math.max(5, Math.min(95, (((pageY + height / 2) - cropY) / cropHeight) * 100));
      hasExactGeometry = true;
    }
  }

  const getScoreBadge = (val: number | null | undefined) => {
    if (val === 2) return { label: '2 — Working Well', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
    if (val === 1) return { label: '1 — Weak / Needs Improvement', bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
    if (val === 0) return { label: '0 — Missing / Broken', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
    return { label: 'Insufficient Evidence / Needs Review', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  };

  const currentScoreBadge = getScoreBadge(scoreItem.score);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-main)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Check #{check.number} Evidence Inspection
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {check.title}
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '6px 10px' }}
          >
            <X size={16} /> Close
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px', flex: 1 }}>
          
          {/* Assessment Overview Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span
                className="badge"
                style={{
                  background: currentScoreBadge.bg,
                  color: currentScoreBadge.text,
                  border: `1px solid ${currentScoreBadge.border}`,
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                {currentScoreBadge.label}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  Confidence: {scoreItem.confidence}
                </span>
                <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>
                  {scoreItem.validationStatus === 'validated' ? '✓ Validated' : '🤖 AI Proposed'}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Evaluator Question:</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '2px', fontStyle: 'italic' }}>
                "{check.evaluatorQuestion}"
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Objective Rationale:</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.45 }}>
                {scoreItem.rationale}
              </p>
            </div>

            {/* 6-Field Commercial Standards: Business Impact, Effort, & Action */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Priority Tier
                </label>
                <select
                  className="select"
                  value={scoreItem.suggestedPriority || (scoreItem.score === 0 ? 'Critical' : scoreItem.score === 1 ? 'High Impact' : 'Improvement')}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    scoreItem.suggestedPriority = val;
                    onValidateScore(check.id, scoreItem.score ?? 1, 'modified');
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                >
                  <option value="Critical">🔴 Critical (Broken / Missing)</option>
                  <option value="High Impact">🟠 High Impact (Major Leaks)</option>
                  <option value="Improvement">🟡 Improvement (Polish / Polish)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Estimated Effort
                </label>
                <select
                  className="select"
                  value={scoreItem.effort || 'Medium'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    scoreItem.effort = val;
                    onValidateScore(check.id, scoreItem.score ?? 1, 'modified');
                  }}
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                >
                  <option value="Low">🟢 Low (1–2 Hours)</option>
                  <option value="Medium">🟡 Medium (Half-Day)</option>
                  <option value="High">🔴 High (Multi-Day)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Business & Conversion Impact
                </label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={scoreItem.businessImpact || ''}
                  onChange={(e) => {
                    scoreItem.businessImpact = e.target.value;
                    onValidateScore(check.id, scoreItem.score ?? 1, 'modified');
                  }}
                  placeholder="e.g. Visitors cannot tell what services you offer without scrolling, leading to bounce before inquiring."
                  style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Recommended Action
                </label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={scoreItem.recommendedAction || scoreItem.evidence || ''}
                  onChange={(e) => {
                    scoreItem.recommendedAction = e.target.value;
                    onValidateScore(check.id, scoreItem.score ?? 1, 'modified');
                  }}
                  placeholder="e.g. Rewrite hero H1 headline to state primary service + location within 5 seconds."
                  style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                />
              </div>
            </div>

            {/* Issue Tags */}
            {scoreItem.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {scoreItem.tags.map(t => {
                  const style = getIssueTagColor('Voice');
                  return (
                    <span
                      key={t}
                      className="badge"
                      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}`, fontSize: '0.75rem' }}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Visual Section Snapshot with Element Pin */}
          {(() => {
            const isSchematic = sourceAsset?.mimeType === 'image/svg+xml' || sourceAsset?.title.toLowerCase().includes('schematic');
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} color="var(--accent-primary)" />
                    {isSchematic ? 'Schematic Viewport Layout (Wireframe Model)' : 'Observed Section Screenshot & Element Pin'}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isSchematic ? 'DOM Wireframe Representation' : (hasExactGeometry ? `Exact Geometry: [x: ${pinRelX.toFixed(1)}%, y: ${pinRelY.toFixed(1)}%]` : 'Viewport Evidence')}
                  </span>
                </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/10',
                backgroundColor: '#1e293b',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sourceAsset?.blob ? (
                <img
                  src={URL.createObjectURL(sourceAsset.blob)}
                  alt="Section Evidence Snapshot"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  <ShieldCheck size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.85rem' }}>{snapshotData?.sectionType.replace('_', ' ').toUpperCase() || 'SECTION SNAPSHOT'}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Evidence mapped from {primaryElement?.id || 'live crawl'}</div>
                </div>
              )}

              {/* Exact Pin Callout Marker */}
              <div
                style={{
                  position: 'absolute',
                  left: `${pinRelX}%`,
                  top: `${pinRelY}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  zIndex: 20
                }}
              >
                #{check.number}
              </div>
            </div>

            {isSchematic && (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                Note: Schematic layout generated from HTML analysis. Upload actual screenshots in Step 2 to display verified visual captures.
              </div>
            )}
          </div>
            );
          })()}

          {/* Raw DOM Evidence Text */}
          {primaryElement && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Extracted Element ({primaryElement.tag} • <code style={{ fontSize: '0.75rem' }}>{primaryElement.id}</code>):
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.4
                }}
              >
                {primaryElement.visibleText}
              </div>
            </div>
          )}
        </div>

        {/* Validation Action Bar */}
        <div
          style={{
            padding: '18px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onPrevCheck}
              disabled={!onPrevCheck}
            >
              <ArrowLeft size={14} /> Prev
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onNextCheck}
              disabled={!onNextCheck}
            >
              Next <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Quick Score Overrides */}
            <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-strong)' }}>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  background: scoreItem.score === 0 ? '#ef4444' : 'var(--bg-surface)',
                  color: scoreItem.score === 0 ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => onValidateScore(check.id, 0, 'modified')}
              >
                0
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  background: scoreItem.score === 1 ? '#f59e0b' : 'var(--bg-surface)',
                  color: scoreItem.score === 1 ? '#ffffff' : 'var(--text-secondary)',
                  borderLeft: '1px solid var(--border-strong)',
                  borderRight: '1px solid var(--border-strong)',
                  borderTop: 'none',
                  borderBottom: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => onValidateScore(check.id, 1, 'modified')}
              >
                1
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  background: scoreItem.score === 2 ? '#10b981' : 'var(--bg-surface)',
                  color: scoreItem.score === 2 ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => onValidateScore(check.id, 2, 'modified')}
              >
                2
              </button>
            </div>

            {/* Accept Proposed Score */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                const targetScore = scoreItem.score ?? scoreItem.proposedScore ?? 2;
                onValidateScore(check.id, targetScore, 'validated');
                if (onNextCheck) onNextCheck();
              }}
              style={{ gap: '6px' }}
            >
              <CheckCircle2 size={14} /> Accept & Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
