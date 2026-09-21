import React, { useState } from 'react';
import type { Audit, AuditAsset, ReportConfiguration } from '../../types';
import { calculateAuditScores } from '../../utils/scoreCalculator';
import {
  SlidersHorizontal,
  Eye,
  ArrowLeft,
  Save,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { scanCopyForSyntheticPatterns, sanitizeAndHumanizeDeliverableCopy } from '../../services/voiceScanService';

interface ReportComposerProps {
  audit: Audit;
  assets: AuditAsset[];
  onSaveReportConfig: (audit: Audit) => Promise<void>;
  onOpenReport: (auditId: string) => void;
  onBackToAudit: (auditId: string) => void;
}

export const ReportComposer: React.FC<ReportComposerProps> = ({
  audit,
  assets,
  onSaveReportConfig,
  onOpenReport,
  onBackToAudit
}) => {
  const [reportConfig, setReportConfig] = useState<ReportConfiguration>(audit.reportConfig);
  const [isSaving, setIsSaving] = useState(false);

  const voiceCheck = scanCopyForSyntheticPatterns(reportConfig.executiveSummary, {
    businessName: audit.businessName,
    brandVoiceSample: audit.brandVoiceSample
  });

  const handleHumanizeSummary = () => {
    const humanized = sanitizeAndHumanizeDeliverableCopy(reportConfig.executiveSummary, audit.brandVoiceSample);
    setReportConfig({ ...reportConfig, executiveSummary: humanized });
  };

  const scoreResult = calculateAuditScores(audit.scores, audit.frameworkSnapshot);
  const sourceAssets = assets.filter(a => a.type === 'source_of_truth');
  const fixedAssets = assets.filter(a => a.type === 'fixed_direction');

  const handleToggleFinding = (findingId: string) => {
    const isSelected = reportConfig.selectedFindingIds.includes(findingId);
    let updated;
    if (isSelected) {
      updated = reportConfig.selectedFindingIds.filter(id => id !== findingId);
    } else {
      updated = [...reportConfig.selectedFindingIds, findingId];
    }
    setReportConfig({ ...reportConfig, selectedFindingIds: updated });
  };

  const handleToggleSourceAsset = (assetId: string) => {
    const isSelected = reportConfig.selectedSourceAssetIds.includes(assetId);
    let updated;
    if (isSelected) {
      updated = reportConfig.selectedSourceAssetIds.filter(id => id !== assetId);
    } else {
      updated = [...reportConfig.selectedSourceAssetIds, assetId];
    }
    setReportConfig({ ...reportConfig, selectedSourceAssetIds: updated });
  };

  const handleToggleFixedAsset = (assetId: string) => {
    const isSelected = reportConfig.selectedFixedDirectionAssetIds.includes(assetId);
    let updated;
    if (isSelected) {
      updated = reportConfig.selectedFixedDirectionAssetIds.filter(id => id !== assetId);
    } else {
      updated = [...reportConfig.selectedFixedDirectionAssetIds, assetId];
    }
    setReportConfig({ ...reportConfig, selectedFixedDirectionAssetIds: updated });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedAudit: Audit = {
        ...audit,
        reportConfig,
        updatedAt: new Date().toISOString()
      };
      await onSaveReportConfig(updatedAudit);
      alert('Report Configuration saved successfully!');
    } catch (err: any) {
      alert(`Failed to save report configuration: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onBackToAudit(audit.id)}>
            <ArrowLeft size={14} /> Back to Evaluator
          </button>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <SlidersHorizontal size={13} /> Report Composer & Curation
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
              {audit.businessName} — Client Report Setup
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={async () => {
              await handleSave();
              onOpenReport(audit.id);
            }}
          >
            <Eye size={14} /> Preview Client Report →
          </button>
        </div>
      </div>

      {/* 1. Executive Summary Narrative with Anti-Formulaic Humanizer */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-primary)" />
            <h3 className="section-title" style={{ fontSize: '1.1rem' }}>1. Client Executive Summary</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {voiceCheck.hasSyntheticPatterns ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: '#7e22ce', borderColor: '#d8b4fe', background: '#faf5ff', gap: '6px' }}
                onClick={handleHumanizeSummary}
                title="Rewrite synthetic AI patterns into plainspoken human language"
              >
                <Sparkles size={13} /> Naturalize & Humanize Copy
              </button>
            ) : (
              <span className="badge badge-green" style={{ fontSize: '0.72rem', gap: '4px' }}>
                <Check size={12} /> Natural Voice Verified
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          This personalized narrative appears on Page 1 and Page 2 of the client's deliverable. Ensure it sounds like a real consultant talking to a business owner.
        </p>

        <textarea
          className="textarea"
          rows={4}
          value={reportConfig.executiveSummary}
          onChange={(e) => setReportConfig({ ...reportConfig, executiveSummary: e.target.value })}
          placeholder="Craft a polished executive summary for this business owner..."
        />

        {voiceCheck.hasSyntheticPatterns && (
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
              Detected Formulaic Patterns:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {voiceCheck.detectedTags.map(tag => (
                <span key={tag} className="badge" style={{ background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', fontSize: '0.72rem' }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#581c87', marginTop: '2px' }}>
              {voiceCheck.findings[0]?.explanation}
            </div>
          </div>
        )}
      </div>

      {/* 2. Selected Findings & Priorities */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="section-title" style={{ fontSize: '1.1rem' }}>2. Report Findings Curation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Check which prioritized findings should be included in the client report.
            </p>
          </div>
          <span className="badge badge-accent">
            {reportConfig.selectedFindingIds.length} of {audit.findings.length} Selected
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {audit.findings.map((f) => {
            const isChecked = reportConfig.selectedFindingIds.includes(f.id);
            return (
              <label
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  background: isChecked ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  border: '1px solid',
                  borderColor: isChecked ? 'var(--accent-border)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleFinding(f.id)}
                  style={{ marginTop: '3px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${f.tier === 'fix_first' ? 'badge-rose' : f.tier === 'fix_next' ? 'badge-amber' : 'badge-neutral'}`} style={{ fontSize: '0.68rem' }}>
                      {f.tier === 'fix_first' ? 'Fix First' : f.tier === 'fix_next' ? 'Fix Next' : 'Later'}
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{f.finding}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <strong>Recommended Fix: </strong>{f.recommendedFix}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Visual Evidence & Mockup Selection */}
      <div className="grid-2">
        {/* Source of Truth Selection */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 className="section-title" style={{ fontSize: '1.05rem' }}>3. Primary Source of Truth Screenshots</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Choose which screenshot evidence to display on the client report page.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sourceAssets.map((asset) => {
              const isChecked = reportConfig.selectedSourceAssetIds.includes(asset.id);
              return (
                <label
                  key={asset.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSourceAsset(asset.id)}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{asset.title}</span>
                  <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                    {asset.pins.length} Callouts
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Fixed Direction Selection */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 className="section-title" style={{ fontSize: '1.05rem' }}>4. Primary Fixed Direction Mockup</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Choose which proposed redesign mockup to showcase.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fixedAssets.map((asset) => {
              const isChecked = reportConfig.selectedFixedDirectionAssetIds.includes(asset.id);
              return (
                <label
                  key={asset.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleFixedAsset(asset.id)}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{asset.title}</span>
                  <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                    {asset.pins.length} Callouts
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Section Visibility Toggles */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 className="section-title" style={{ fontSize: '1.05rem' }}>5. Optional Report Page Visibility</h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={reportConfig.showCategoryBreakdown}
              onChange={(e) => setReportConfig({ ...reportConfig, showCategoryBreakdown: e.target.checked })}
            />
            <span>Show Executive Scorecard (6 Category breakdown)</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={reportConfig.showConversionBlueprint}
              onChange={(e) => setReportConfig({ ...reportConfig, showConversionBlueprint: e.target.checked })}
            />
            <span>Show Conversion Journey Flowchart</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={reportConfig.showFixNext}
              onChange={(e) => setReportConfig({ ...reportConfig, showFixNext: e.target.checked })}
            />
            <span>Include Fix Next (Secondary Improvements)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
