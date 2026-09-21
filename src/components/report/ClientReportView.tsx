import React from 'react';
import type { Audit, AuditAsset, MasterFramework } from '../../types';
import { calculateAuditScores } from '../../utils/scoreCalculator';
import { AnnotationOverlay } from '../common/AnnotationOverlay';
import { ScoreBadge } from '../common/ScoreBadge';
import { brandingConfig } from '../../config/brandingConfig';
import {
  Printer,
  ArrowLeft,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';

interface ClientReportViewProps {
  audit: Audit;
  assets: AuditAsset[];
  onBackToAudit: (auditId: string) => void;
  onOpenComposer: (auditId: string) => void;
}

export const ClientReportView: React.FC<ClientReportViewProps> = ({
  audit,
  assets,
  onBackToAudit,
  onOpenComposer
}) => {
  const framework = audit.frameworkSnapshot;
  const scoreResult = calculateAuditScores(audit.scores, framework);
  const reportConfig = audit.reportConfig;

  const selectedFindings = audit.findings.filter(f =>
    reportConfig.selectedFindingIds.length === 0 || reportConfig.selectedFindingIds.includes(f.id)
  );

  const fixFirstFindings = selectedFindings.filter(f => f.tier === 'fix_first');
  const fixNextFindings = selectedFindings.filter(f => f.tier === 'fix_next');

  const selectedSourceAssets = assets.filter(
    a => a.type === 'source_of_truth' && (reportConfig.selectedSourceAssetIds.length === 0 || reportConfig.selectedSourceAssetIds.includes(a.id))
  );

  const selectedFixedAssets = assets.filter(
    a => a.type === 'fixed_direction' && (reportConfig.selectedFixedDirectionAssetIds.length === 0 || reportConfig.selectedFixedDirectionAssetIds.includes(a.id))
  );

  const handlePrint = () => {
    window.print();
  };

  const footerText = brandingConfig.footerMetadataTemplate
    .replace('{version}', `v${audit.frameworkVersion}`)
    .replace('{date}', new Date(audit.updatedAt).toLocaleDateString());

  return (
    <div style={{ background: '#e2e8f0', minHeight: '100vh', padding: '32px 16px' }}>
      {/* Top Action Bar (Hidden in print mode) */}
      <div
        className="no-print"
        style={{
          maxWidth: '850px',
          margin: '0 auto 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onBackToAudit(audit.id)}>
            <ArrowLeft size={14} /> Audit Validation Queue
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOpenComposer(audit.id)}>
            <SlidersHorizontal size={14} /> Report Composer
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Formatted for US Letter Print / PDF
          </span>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={15} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Main Consulting Deliverable Document */}
      <div className="report-document">
        
        {/* ========================================================= */}
        {/* PAGE 1 — COVER PAGE                                       */}
        {/* ========================================================= */}
        <div className="report-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '24px', marginBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                  {brandingConfig.companyName}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                  Website Rescue & Conversion Optimization
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  Deliverable
                </span>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  {new Date(audit.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Standardized 30-Point Diagnostic Checkup
              </div>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a' }}>
                Website Conversion Checkup
              </h1>
              <div style={{ fontSize: '1.35rem', fontWeight: 600, color: '#334155', marginTop: '10px' }}>
                Prepared for: <strong style={{ color: '#0f172a' }}>{audit.businessName}</strong>
              </div>
              <div style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: '#64748b', marginTop: '4px' }}>
                {audit.websiteUrl}
              </div>
            </div>

            {/* Score & Rescue Status Card */}
            <div style={{ marginTop: '36px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overall Website Rescue Score
                </div>
                <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '4px' }}>
                  {scoreResult.scoreFormatted}
                </div>
              </div>

              <div style={{ textAlign: 'right', maxWidth: '320px' }}>
                <ScoreBadge
                  score={scoreResult.totalScore}
                  maxScore={scoreResult.maxScore}
                  rescueLevel={scoreResult.rescueLevel}
                  size="lg"
                  showScore={false}
                />
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px', lineHeight: 1.4 }}>
                  {scoreResult.rescueDescription}
                </div>
              </div>
            </div>

            {/* Primary Pattern Insight Banner */}
            <div style={{ marginTop: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Primary Diagnostic Pattern: Core Offer Ambiguity
              </div>
              <p style={{ fontSize: '0.9rem', color: '#166534', marginTop: '4px', lineHeight: 1.45 }}>
                The site's biggest issue is not that information is missing. Much of it is present, but visitors repeatedly have to interpret what it means, which creates friction and leaks inquiries across the customer journey.
              </p>
            </div>

            {/* Executive Summary */}
            {reportConfig.executiveSummary && (
              <div style={{ marginTop: '24px', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '18px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Executive Summary
                </div>
                <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.55 }}>
                  {reportConfig.executiveSummary}
                </p>
              </div>
            )}
          </div>

          <div className="report-page-footer">
            <span>{footerText}</span>
            <span>Page 1 of 7</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PAGE 2 — EXECUTIVE SCORECARD                              */}
        {/* ========================================================= */}
        {reportConfig.showCategoryBreakdown && (
          <div className="report-page">
            <div className="report-page-header">
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {audit.businessName} • Conversion Checkup
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  Executive Heuristic Scorecard
                </h2>
              </div>
              <ScoreBadge score={scoreResult.totalScore} rescueLevel={scoreResult.rescueLevel} size="md" />
            </div>

            <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '28px' }}>
              Your website was evaluated across 30 master checks categorized into 6 core conversion drivers. Each check is scored 0–2 points based on expert evaluation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {scoreResult.categoryResults.map((catRes) => (
                <div
                  key={catRes.category.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                        Category {catRes.category.number}: {catRes.category.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {catRes.category.description}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        {catRes.ratioFormatted}
                      </span>
                      <span className={`badge ${catRes.statusColor === 'green' ? 'badge-green' : catRes.statusColor === 'amber' ? 'badge-amber' : 'badge-rose'}`}>
                        {catRes.status}
                      </span>
                    </div>
                  </div>

                  {/* Clean Horizontal Score Bar */}
                  <div className="score-bar-container">
                    <div className="score-bar-track">
                      <div
                        className={`score-bar-fill ${catRes.statusColor}`}
                        style={{ width: `${catRes.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="report-page-footer">
              <span>{footerText}</span>
              <span>Page 2 of 7</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 3 — WHAT I FOUND (CONSOLIDATED FINDINGS)             */}
        {/* ========================================================= */}
        <div className="report-page">
          <div className="report-page-header">
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {audit.businessName} • Diagnostic Findings
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                What I Found: Priority Observations
              </h2>
            </div>
            <span className="badge badge-rose">Fix First</span>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '24px' }}>
            The following high-level consolidated findings represent the greatest conversion leaks on your website. Resolving these items will produce the fastest improvement in inquiries.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {fixFirstFindings.map((f, idx) => (
              <div
                key={f.id}
                className="report-finding-item"
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--danger-solid)', color: '#fff', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {f.finding}
                  </h3>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: '#0f172a' }}>Why it matters: </strong>
                  {f.whyItMatters}
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--accent-text)', background: 'var(--accent-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Recommended Fix: </strong>
                  {f.recommendedFix}
                </div>

                {f.exampleImprovement && (
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', paddingLeft: '4px' }}>
                    <strong>Example: </strong>{f.exampleImprovement}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="report-page-footer">
            <span>{footerText}</span>
            <span>Page 3 of 7</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PAGE 4 — SOURCE OF TRUTH (ANNOTATED EVIDENCE)             */}
        {/* ========================================================= */}
        {selectedSourceAssets.length > 0 && (
          <div className="report-page">
            <div className="report-page-header">
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {audit.businessName} • Visual Evidence
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  Source of Truth: Current Website Callouts
                </h2>
              </div>
              <span className="badge badge-neutral">As-Is Evaluation</span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '18px' }}>
              The annotated screenshot below captures your live website as visitors currently experience it, with numbered markers corresponding to specific friction points.
            </p>

            {selectedSourceAssets.map((asset) => (
              <div key={asset.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnnotationOverlay asset={asset} editable={false} />
              </div>
            ))}

            <div className="report-page-footer">
              <span>{footerText}</span>
              <span>Page 4 of 7</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 5 — FIXED DIRECTION (REDESIGNED MOCKUP)              */}
        {/* ========================================================= */}
        {selectedFixedAssets.length > 0 && (
          <div className="report-page">
            <div className="report-page-header">
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Visual Demonstration
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  Fixed Direction: Recommended Redesign
                </h2>
              </div>
              <span className="badge badge-accent">Proposed Solution</span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '18px' }}>
              This mockup demonstrates how restyling the above-the-fold layout with outcome-driven headlines, visible social proof, and a low-friction quote mechanism resolves the identified issues.
            </p>

            {selectedFixedAssets.map((asset) => (
              <div key={asset.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnnotationOverlay asset={asset} editable={false} />
              </div>
            ))}

            <div className="report-page-footer">
              <span>{footerText}</span>
              <span>Page 5 of 7</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 6 — CONVERSION BLUEPRINT & JOURNEY                   */}
        {/* ========================================================= */}
        {reportConfig.showConversionBlueprint && (
          <div className="report-page">
            <div className="report-page-header">
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {audit.businessName} • Customer Journey
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  Conversion Blueprint: Before vs. After
                </h2>
              </div>
              <span className="badge badge-accent">Path Optimization</span>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '24px' }}>
              Comparing how visitors currently drop off versus the frictionless, high-converting journey created by the recommended structure.
            </p>

            <div className="grid-2" style={{ marginBottom: '32px' }}>
              {/* CURRENT */}
              <div style={{ background: '#fffafa', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--danger-text)' }}>
                  Current Frictional Path
                </div>
                {audit.conversionPath.currentSteps.map((step, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '8px' }}>
                    <strong style={{ color: 'var(--danger-solid)' }}>{idx + 1}.</strong> {step}
                  </div>
                ))}
              </div>

              {/* RECOMMENDED */}
              <div style={{ background: '#f6fdf9', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--success-text)' }}>
                  Recommended Streamlined Flow
                </div>
                {audit.conversionPath.recommendedSteps.map((step, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '8px' }}>
                    <strong style={{ color: 'var(--success-solid)' }}>{idx + 1}.</strong> {step}
                  </div>
                ))}
              </div>
            </div>

            {/* FIX NEXT MATRIX */}
            {reportConfig.showFixNext && fixNextFindings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Fix Next (Secondary Improvements)
                  </h3>
                  <span className="badge badge-amber">{fixNextFindings.length} Items</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fixNextFindings.map((f, idx) => (
                    <div key={f.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        {idx + 1}. {f.finding}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                        {f.recommendedFix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="report-page-footer">
              <span>{footerText}</span>
              <span>Page 6 of 7</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 7 — RECOMMENDED NEXT STEP (OFFER)                    */}
        {/* ========================================================= */}
        <div className="report-page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="report-page-header">
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Implementation & Next Actions
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                  Recommended Solution & Next Step
                </h2>
              </div>
              <span className="badge badge-accent">Action Plan</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '32px', lineHeight: 1.6 }}>
              Based on the diagnostic findings and conversion score of <strong>{scoreResult.scoreFormatted}</strong>, here is our targeted recommendation to execute these improvements:
            </p>

            {/* Selected Single Offer Card */}
            <div style={{ background: '#ffffff', border: '2px solid #0f172a', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="badge badge-accent" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                    Recommended Implementation
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                    {reportConfig.recommendedOffer.offerName}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                    {reportConfig.recommendedOffer.price}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <Clock size={12} /> {reportConfig.recommendedOffer.turnaround}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.5 }}>
                {reportConfig.recommendedOffer.description}
              </p>

              {reportConfig.recommendedOffer.customScope && (
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    What Is Included in Your Scope:
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                    {reportConfig.recommendedOffer.customScope}
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Questions or ready to schedule? Contact <strong>{brandingConfig.supportEmail}</strong>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                  {reportConfig.recommendedOffer.ctaText} →
                </div>
              </div>
            </div>
          </div>

          <div className="report-page-footer">
            <span>{footerText}</span>
            <span>Page 7 of 7</span>
          </div>
        </div>

      </div>
    </div>
  );
};
