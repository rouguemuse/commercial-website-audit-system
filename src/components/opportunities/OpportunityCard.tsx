import React, { useState } from 'react';
import type { Opportunity, OpportunityStatus, SellerFit, QualificationScore, ActionRecommendation } from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Target,
  Briefcase,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Send,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  sellerFit?: SellerFit;
  qualificationScore?: QualificationScore;
  actionRecommendation?: ActionRecommendation;
  onUpdateStatus: (id: string, status: OpportunityStatus) => void;
  onEdit: (opportunity: Opportunity) => void;
  onViewAuditCheck?: (checkId: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  sellerFit,
  qualificationScore,
  actionRecommendation,
  onUpdateStatus,
  onEdit,
  onViewAuditCheck
}) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showQualDetails, setShowQualDetails] = useState(false);
  const [showClaimDetails, setShowClaimDetails] = useState(false);

  // Confidence color & badge
  let confColor = 'var(--success-text)';
  let confBg = 'var(--success-bg)';
  let confBorder = 'var(--success-border)';
  let confLabel = 'Very Strong Evidence';

  if (opportunity.confidenceScore < 60) {
    confColor = 'var(--danger-text)';
    confBg = 'rgba(239, 68, 68, 0.1)';
    confBorder = 'rgba(239, 68, 68, 0.25)';
    confLabel = 'Inconclusive Evidence';
  } else if (opportunity.confidenceScore < 75) {
    confColor = '#b45309';
    confBg = '#fef3c7';
    confBorder = '#fde68a';
    confLabel = 'Plausible (Review Recommended)';
  } else if (opportunity.confidenceScore < 90) {
    confColor = 'var(--accent-text)';
    confBg = 'var(--accent-subtle)';
    confBorder = 'var(--accent-border)';
    confLabel = 'Strong Evidence';
  }

  // Status display
  const statusStyles: Record<OpportunityStatus, { label: string; bg: string; color: string }> = {
    detected: { label: 'Detected by Engine', bg: 'var(--accent-subtle)', color: 'var(--accent-text)' },
    needs_review: { label: '⚠️ Needs Review', bg: '#fef3c7', color: '#b45309' },
    accepted: { label: '✓ Accepted by User', bg: 'var(--success-bg)', color: 'var(--success-text)' },
    rejected: { label: '✕ Rejected', bg: '#fef2f2', color: '#991b1b' },
    archived: { label: 'Archived', bg: 'var(--bg-subtle)', color: 'var(--text-muted)' }
  };

  const currentStatus = statusStyles[opportunity.status] || statusStyles.detected;

  // Qualification Verdict Styling
  const verdictStyles: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PURSUE: { label: '🎯 PURSUE', bg: 'var(--success-bg)', color: 'var(--success-text)', border: 'var(--success-border)' },
    WORTH_EXPLORING: { label: '🔍 WORTH EXPLORING', bg: 'var(--accent-subtle)', color: 'var(--accent-text)', border: 'var(--accent-border)' },
    LOW_PRIORITY: { label: '⏳ LOW PRIORITY', bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
    REFER_OUT: { label: '🤝 REFER OUT', bg: '#fdf4ff', color: '#86198f', border: '#f5d0fe' },
    SKIP: { label: '✕ SKIP', bg: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger-text)', border: 'rgba(239, 68, 68, 0.25)' }
  };

  const currentVerdict = qualificationScore ? verdictStyles[qualificationScore.verdict] : undefined;

  // Seller Fit Classification Styling
  const fitStyles: Record<string, { label: string; bg: string; color: string }> = {
    strong_fit: { label: 'Strong Seller Fit', bg: 'var(--success-bg)', color: 'var(--success-text)' },
    possible_fit: { label: 'Possible Fit', bg: 'var(--accent-subtle)', color: 'var(--accent-text)' },
    outside_capability: { label: 'Outside Capabilities', bg: '#fdf4ff', color: '#86198f' },
    explicitly_excluded: { label: 'Explicitly Excluded', bg: '#fef2f2', color: '#991b1b' },
    insufficient_information: { label: 'Profile Info Needed', bg: 'var(--bg-subtle)', color: 'var(--text-muted)' }
  };

  const currentFit = sellerFit ? fitStyles[sellerFit.classification] : undefined;

  // Action Recommendation Styling
  const actionStyles: Record<string, { label: string; bg: string; color: string; border: string }> = {
    OUTREACH: { label: '📤 Outreach Lead', bg: 'var(--success-bg)', color: 'var(--success-text)', border: 'var(--success-border)' },
    EXISTING_CLIENT_EXPANSION: { label: '🤝 Client Expansion', bg: 'var(--success-bg)', color: 'var(--success-text)', border: 'var(--success-border)' },
    EXPLORE: { label: '🔍 Explore in Discovery', bg: 'var(--accent-subtle)', color: 'var(--accent-text)', border: 'var(--accent-border)' },
    REFER: { label: '🤝 Partner Referral', bg: '#fdf4ff', color: '#86198f', border: '#f5d0fe' },
    MONITOR: { label: '⏳ Backlog / Monitor', bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
    NO_ACTION: { label: '✕ No Commercial Action', bg: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger-text)', border: 'rgba(239, 68, 68, 0.25)' }
  };

  const currentAction = actionRecommendation ? actionStyles[actionRecommendation.recommendedAction] : undefined;

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'var(--bg-surface)',
        borderLeft: `4px solid ${
          actionRecommendation?.recommendedAction === 'OUTREACH' || actionRecommendation?.recommendedAction === 'EXISTING_CLIENT_EXPANSION'
            ? 'var(--success-text)'
            : (actionRecommendation?.recommendedAction === 'REFER'
              ? '#86198f'
              : (actionRecommendation?.recommendedAction === 'NO_ACTION' ? 'var(--danger-text)' : 'var(--accent-primary)'))
        }`,
        transition: 'all 0.15s ease'
      }}
    >
      {/* Top Header: Category Tags, Status Badge, Seller Fit & Qualification Verdict */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: currentStatus.bg,
              color: currentStatus.color,
              border: `1px solid ${currentStatus.color}30`
            }}
          >
            {currentStatus.label}
          </span>

          {currentVerdict && (
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 900,
                padding: '2px 9px',
                borderRadius: '12px',
                backgroundColor: currentVerdict.bg,
                color: currentVerdict.color,
                border: `1px solid ${currentVerdict.border}`
              }}
            >
              {currentVerdict.label} ({qualificationScore?.overallScore}/100)
            </span>
          )}

          {currentAction && (
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: currentAction.bg,
                color: currentAction.color,
                border: `1px solid ${currentAction.border}`
              }}
            >
              {currentAction.label}
            </span>
          )}

          {opportunity.userEdited ? (
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-text)', background: 'var(--accent-subtle)', padding: '2px 7px', borderRadius: 'var(--radius-sm)', fontWeight: 700, border: '1px solid var(--accent-border)' }}>
              ✏️ User-refined interpretation
            </span>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>
              Inferred Interface Risk
            </span>
          )}

          {opportunity.capabilityTags.map((tag) => (
            <span key={tag} className="badge badge-neutral" style={{ fontSize: '0.68rem', textTransform: 'lowercase' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Confidence Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '12px',
            backgroundColor: confBg,
            color: confColor,
            border: `1px solid ${confBorder}`,
            fontSize: '0.75rem',
            fontWeight: 800
          }}
          title={opportunity.userEdited
            ? `Evidence Confidence: ${opportunity.confidenceScore}% (Calculated from verified audit DOM evidence, not manually edited text).`
            : `Evidence Confidence: Reflects how strongly verified DOM elements (${opportunity.evidenceRefs.length} refs) and audit checks support this diagnosed opportunity.`
          }
        >
          <span>Evidence Confidence: {opportunity.confidenceScore}%</span>
          <span style={{ fontWeight: 500, opacity: 0.85 }}>• {confLabel}</span>
        </div>
      </div>

      {/* Main Title & Impact Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {opportunity.title}
        </h3>

        {opportunity.estimatedImpact && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              background: opportunity.estimatedImpact === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-subtle)',
              color: opportunity.estimatedImpact === 'high' ? 'var(--danger-text)' : 'var(--text-secondary)'
            }}
          >
            {opportunity.estimatedImpact} Impact
          </span>
        )}
      </div>

      {/* Observation */}
      <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem', lineHeight: 1.45, color: 'var(--text-primary)' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', display: 'block', marginBottom: '2px' }}>
          Factual Observation:
        </span>
        {opportunity.observation}
      </div>

      {/* Business Implication & Recommended Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        <div style={{ border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent-text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <TrendingUp size={13} /> Commercial & Operational Implication
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {opportunity.businessImplication}
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--success-text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Sparkles size={13} /> Recommended Action / Remedy
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {opportunity.recommendedAction}
          </div>
        </div>
      </div>

      {/* Stage 3C: Action & Outreach Intelligence Box */}
      {actionRecommendation && (
        <div style={{ background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '10px', border: `1px solid ${currentAction ? currentAction.border : 'var(--border-subtle)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={14} style={{ color: 'var(--accent-text)' }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Stage 3C • Action & Outreach Intelligence
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent-text)', background: 'var(--bg-surface)', padding: '1px 7px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                Starter Suitability: {actionRecommendation.conversationStarterScore}/100
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowClaimDetails(!showClaimDetails)}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              {showClaimDetails ? 'Hide Claim Boundaries' : 'View Safe Claims & Boundaries'}
              {showClaimDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Action-Specific Callout */}
          {actionRecommendation.recommendedAction === 'REFER' ? (
            <div style={{ background: '#fdf4ff', padding: '10px 12px', borderRadius: '4px', borderLeft: '3px solid #86198f', fontSize: '0.85rem', color: '#86198f', lineHeight: 1.45 }}>
              <strong>Legitimate opportunity — not a seller fit. </strong>
              {actionRecommendation.whyLeadWithThis}
            </div>
          ) : actionRecommendation.recommendedAction === 'NO_ACTION' ? (
            <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid var(--text-muted)', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <strong>No recommended commercial action: </strong>
              {actionRecommendation.conversationStarterRationale}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actionRecommendation.leadAngle && (
                <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--accent-text)' }}>Lead Angle: </strong>
                  "{actionRecommendation.leadAngle}"
                </div>
              )}

              {actionRecommendation.whyLeadWithThis && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Why Lead With This: </strong>
                  {actionRecommendation.whyLeadWithThis}
                </div>
              )}

              {actionRecommendation.matchedOfferName && (
                <div style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
                  <Briefcase size={12} style={{ color: 'var(--accent-text)' }} />
                  <strong>Matched Package: </strong> {actionRecommendation.matchedOfferName}
                </div>
              )}
            </div>
          )}

          {/* Recommended Next Step */}
          {actionRecommendation.recommendedNextStep && (
            <div style={{ fontSize: '0.82rem', background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '4px', borderLeft: '3px solid var(--success-text)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <ArrowRight size={14} style={{ color: 'var(--success-text)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Recommended Commercial Action: </strong>
                <span style={{ color: 'var(--text-secondary)' }}>{actionRecommendation.recommendedNextStep}</span>
              </div>
            </div>
          )}

          {/* Expandable Claim Safety Drawer */}
          {showClaimDetails && (
            <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--success-border)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--success-text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <ShieldCheck size={13} /> Defensible / Safe to Say
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {actionRecommendation.allowedClaims.map((claim, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{claim}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--danger-text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <ShieldAlert size={13} /> Do Not Claim (Unsupported)
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {actionRecommendation.prohibitedClaims.map((claim, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{claim}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 3B: Seller Fit & Qualification Evaluation Block */}
      {(sellerFit || qualificationScore) && (
        <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Seller Fit & Strategic Match
              </span>
              {currentFit && (
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '1px 7px', borderRadius: '8px', background: currentFit.bg, color: currentFit.color }}>
                  {currentFit.label} ({sellerFit?.fitScore}%)
                </span>
              )}
            </div>

            {qualificationScore && (
              <button
                type="button"
                onClick={() => setShowQualDetails(!showQualDetails)}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                {showQualDetails ? 'Hide Score Breakdown' : 'View Score Breakdown'}
                {showQualDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>

          {/* Fit Rationale & Service Matching */}
          <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
            {sellerFit?.rationale}
          </div>

          {/* Matched Service or Proof Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sellerFit?.matchedOfferNames && sellerFit.matchedOfferNames.length > 0 && (
              <span style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                <Briefcase size={12} style={{ color: 'var(--accent-text)' }} /> Service: {sellerFit.matchedOfferNames[0]}
              </span>
            )}

            {sellerFit?.relevantProofDescriptions && sellerFit.relevantProofDescriptions.length > 0 && (
              <span style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                <Award size={12} style={{ color: 'var(--success-text)' }} /> Proof: {sellerFit.relevantProofDescriptions[0]}
              </span>
            )}
          </div>

          {/* Detailed Factor Scores Drawer */}
          {showQualDetails && qualificationScore && (
            <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Evidence Conf.</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{qualificationScore.factorScores.evidenceConfidenceScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Seller Fit</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{qualificationScore.factorScores.sellerFitScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Impact Score</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{qualificationScore.factorScores.impactScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Client Match</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{qualificationScore.factorScores.clientAlignmentScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Budget Match</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{qualificationScore.factorScores.budgetAlignmentScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Relationship</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>{qualificationScore.factorScores.relationshipScore}%</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Traceable Supporting Evidence Drawer Toggle */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <button
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-text)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={14} />
          {showEvidence ? 'Hide Supporting Evidence' : `View Grounded Evidence (${opportunity.evidenceRefs.length} Element Refs, ${opportunity.contributingCheckIds.length} Checks)`}
          {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showEvidence && (
          <div style={{ marginTop: '10px', background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Contributing Checks */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Contributing Diagnostic Checks:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {opportunity.contributingCheckIds.map((chkId) => (
                  <span
                    key={chkId}
                    className="badge badge-accent"
                    style={{ fontSize: '0.72rem', cursor: onViewAuditCheck ? 'pointer' : 'default' }}
                    onClick={() => onViewAuditCheck && onViewAuditCheck(chkId)}
                  >
                    {chkId}
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence References */}
            {opportunity.evidenceRefs.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  DOM / Element References:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {opportunity.evidenceRefs.map((ref, idx) => (
                    <span key={idx} style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono, monospace)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      📍 {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Evidence Text Snippets */}
            {opportunity.evidenceText.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Extracted Evidence Text & Observations:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {opportunity.evidenceText.map((txt, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                      {txt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Human Review Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${opportunity.status === 'accepted' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateStatus(opportunity.id, 'accepted')}
            style={{ gap: '4px', color: opportunity.status === 'accepted' ? '#fff' : 'var(--success-text)' }}
          >
            <CheckCircle2 size={13} /> Accept
          </button>

          <button
            type="button"
            className={`btn btn-sm ${opportunity.status === 'needs_review' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateStatus(opportunity.id, 'needs_review')}
            style={{ gap: '4px', color: opportunity.status === 'needs_review' ? '#fff' : '#b45309' }}
          >
            <AlertCircle size={13} /> Needs Review
          </button>

          <button
            type="button"
            className={`btn btn-sm ${opportunity.status === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onUpdateStatus(opportunity.id, 'rejected')}
            style={{ gap: '4px', color: opportunity.status === 'rejected' ? '#fff' : 'var(--danger-text)' }}
          >
            <XCircle size={13} /> Reject
          </button>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(opportunity)}
          style={{ gap: '4px' }}
        >
          <Edit2 size={13} /> Refine & Edit
        </button>
      </div>
    </div>
  );
};
