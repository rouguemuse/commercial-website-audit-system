import React, { useState } from 'react';
import type { Audit, AuditAsset } from '../../types';
import { generateDefaultTeaserConfig, exportStandaloneTeaserHtml } from '../../services/teaserGenerator';
import { AnnotationOverlay } from '../common/AnnotationOverlay';
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Lock
} from 'lucide-react';

interface ProspectingTeaserViewProps {
  audit: Audit;
  assets: AuditAsset[];
  onBackToAudit: (auditId: string) => void;
  onUpdateAudit?: (audit: Audit) => void;
}

export const ProspectingTeaserView: React.FC<ProspectingTeaserViewProps> = ({
  audit,
  assets,
  onBackToAudit,
  onUpdateAudit
}) => {
  const [teaserConfig, setTeaserConfig] = useState(
    audit.teaserConfig || generateDefaultTeaserConfig(audit, assets)
  );
  const [copied, setCopied] = useState(false);

  const selectedSourceAsset = assets.find(
    a => a.id === teaserConfig.selectedAssetId || a.type === 'source_of_truth'
  ) || assets[0];

  const visiblePins = selectedSourceAsset
    ? (selectedSourceAsset.pins || []).filter(p => teaserConfig.selectedPinIds.includes(p.id))
    : [];

  const selectedFindings = (audit.findings || []).filter(f =>
    teaserConfig.selectedFindingIds.includes(f.id)
  );

  const handleStatusChange = (newStatus: 'generated' | 'reviewed' | 'ready_to_send') => {
    const updated = {
      ...teaserConfig,
      status: newStatus,
      reviewedAt: newStatus === 'reviewed' || newStatus === 'ready_to_send' ? (teaserConfig.reviewedAt || new Date().toISOString()) : undefined,
      readyToSendAt: newStatus === 'ready_to_send' ? new Date().toISOString() : undefined
    };
    setTeaserConfig(updated);
    if (onUpdateAudit) {
      onUpdateAudit({
        ...audit,
        teaserConfig: updated
      });
    }
  };

  const handlePrint = () => {
    if (teaserConfig.status !== 'ready_to_send') return;
    window.print();
  };

  const handleDownloadHtml = () => {
    if (teaserConfig.status !== 'ready_to_send') return;
    const html = exportStandaloneTeaserHtml(audit, selectedSourceAsset, teaserConfig);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Preliminary-Review-${(audit.businessName || 'Business').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isExportAllowed = teaserConfig.status === 'ready_to_send';

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '32px 16px' }}>
      {/* Workflow Action Bar */}
      <div
        className="no-print"
        style={{
          maxWidth: '740px',
          margin: '0 auto 24px',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onBackToAudit(audit.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            Prospecting Teaser Review
          </span>
        </div>

        {/* Lifecycle Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => handleStatusChange('generated')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: teaserConfig.status === 'generated' ? '#0f5b5c' : 'transparent',
              color: teaserConfig.status === 'generated' ? '#ffffff' : '#64748b'
            }}
          >
            1. Generated
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('reviewed')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: teaserConfig.status === 'reviewed' ? '#0f5b5c' : 'transparent',
              color: teaserConfig.status === 'reviewed' ? '#ffffff' : '#64748b'
            }}
          >
            2. Reviewed
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('ready_to_send')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: teaserConfig.status === 'ready_to_send' ? '#16a34a' : 'transparent',
              color: teaserConfig.status === 'ready_to_send' ? '#ffffff' : '#64748b'
            }}
          >
            3. Ready to Send
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            disabled={!isExportAllowed}
            onClick={handleDownloadHtml}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: isExportAllowed ? '#ffffff' : '#f8fafc',
              color: isExportAllowed ? '#0f172a' : '#94a3b8',
              cursor: isExportAllowed ? 'pointer' : 'not-allowed'
            }}
            title={!isExportAllowed ? 'Mark as Ready to Send first' : 'Download HTML'}
          >
            {isExportAllowed ? <Download size={14} /> : <Lock size={14} />} Download HTML
          </button>
          <button
            type="button"
            disabled={!isExportAllowed}
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              background: isExportAllowed ? '#0f5b5c' : '#94a3b8',
              color: '#ffffff',
              cursor: isExportAllowed ? 'pointer' : 'not-allowed'
            }}
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Main Single-Page Prospecting Document */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '48px 44px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f5b5c' }}>
            Context &amp; Muse
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preliminary Website Review
          </div>
        </div>

        {/* Business Title & Qualitative Status */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.95rem', fontWeight: 400, color: '#0f172a', marginBottom: '6px' }}>
            {audit.businessName || 'Business Website'}
          </h1>
          <div style={{ fontSize: '0.9rem', color: '#64748b', wordBreak: 'break-all' }}>
            {audit.websiteUrl}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f5b5c', fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', borderRadius: '4px', marginTop: '12px' }}>
            <span>Preliminary Assessment:</span>
            <span>{teaserConfig.preliminaryAssessment}</span>
          </div>
        </div>

        {/* One Primary Diagnostic Pattern */}
        <div style={{ background: '#f8fafc', borderLeft: '3px solid #0f5b5c', padding: '16px 20px', borderRadius: '0 6px 6px 0', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f5b5c', marginBottom: '4px' }}>
            {teaserConfig.primaryPatternTitle}
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#334155', margin: 0 }}>
            {teaserConfig.primaryPatternFriction}
          </p>
        </div>

        {/* Two High-Impact Findings Max */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '16px' }}>
          Key Observations (2 Areas Max)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          {selectedFindings.map((f, i) => (
            <div key={f.id} style={{ borderBottom: i === 0 && selectedFindings.length > 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: i === 0 && selectedFindings.length > 1 ? '16px' : '0' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                {i + 1}. {f.finding}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', background: '#f8fafc', borderLeft: '2px solid #cbd5e1', padding: '6px 12px', margin: '8px 0', fontStyle: 'italic' }}>
                Observed on page: "{f.whyItMatters.split('.')[0]}."
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                {f.whyItMatters}
              </div>
            </div>
          ))}
        </div>

        {/* Annotated Source Screenshot with 2-3 pins */}
        {selectedSourceAsset && visiblePins.length > 0 && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', background: '#fafaf9', marginBottom: '32px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
              Marked on Actual Website Screenshot ({visiblePins.length} Locations)
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0 }}>
              {visiblePins.map(p => (
                <li key={p.id} style={{ fontSize: '0.86rem', color: '#475569', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ background: '#c85a32', color: '#fff', fontSize: '0.72rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.number}
                  </span>
                  <span><strong>{p.title}:</strong> {p.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* One Example Improvement Direction */}
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '18px 20px', marginBottom: '36px' }}>
          <div style={{ fontSize: '0.88rem', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#64748b', display: 'inline-block', width: '80px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Current:
            </span>
            <span style={{ color: '#475569' }}>"{teaserConfig.exampleDirection.current}"</span>
          </div>
          <div style={{ fontSize: '0.88rem' }}>
            <span style={{ fontWeight: 600, color: '#0f5b5c', display: 'inline-block', width: '80px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Direction:
            </span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{teaserConfig.exampleDirection.recommendedDirection}</span>
          </div>
        </div>

        {/* Single Clear CTA to Paid Audit */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
          <h4 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.3rem', fontWeight: 400, color: '#14532d', marginBottom: '6px' }}>
            Want the full 30-point diagnosis?
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#166534', marginBottom: '16px' }}>
            {teaserConfig.ctaOffer.tagline}
          </p>
          <a
            href={teaserConfig.ctaOffer.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#0f5b5c',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              padding: '10px 24px',
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(15,91,92,0.2)'
            }}
          >
            {teaserConfig.ctaOffer.name} &mdash; {teaserConfig.ctaOffer.price} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
