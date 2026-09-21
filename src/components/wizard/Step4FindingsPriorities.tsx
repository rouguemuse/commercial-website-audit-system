import React, { useState } from 'react';
import type { Audit, Diagnosis, AuditFindingItem, PriorityTier, MasterFramework } from '../../types';
import { Modal } from '../common/Modal';
import { generateConsolidatedFindings } from '../../services/analysisEngine';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Layers,
  CheckCircle2,
  Tag,
  Merge,
  Split
} from 'lucide-react';

interface Step4Props {
  audit: Audit;
  diagnoses: Diagnosis[];
  framework: MasterFramework;
  onFindingsChange: (findings: AuditFindingItem[]) => void;
}

export const Step4FindingsPriorities: React.FC<Step4Props> = ({
  audit,
  diagnoses,
  framework,
  onFindingsChange
}) => {
  const [editingFinding, setEditingFinding] = useState<AuditFindingItem | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Group by 6-field standard priority tiers: Critical, High Impact, Improvement
  const criticalFindings = audit.findings.filter(f => f.priority === 'Critical' || f.tier === 'Critical' || f.tier === 'fix_first').sort((a, b) => a.order - b.order);
  const highImpactFindings = audit.findings.filter(f => f.priority === 'High Impact' || f.tier === 'High Impact' || f.tier === 'fix_next').sort((a, b) => a.order - b.order);
  const improvementFindings = audit.findings.filter(f => f.priority === 'Improvement' || f.tier === 'Improvement' || f.tier === 'later').sort((a, b) => a.order - b.order);

  // Auto-generate consolidated high-level findings
  const handleAutoConsolidate = () => {
    const consolidated = generateConsolidatedFindings(audit.scores, framework, diagnoses);
    onFindingsChange(consolidated);
  };

  const handleAddDiagnosisItem = (diagnosis: Diagnosis) => {
    const defaultCheck = diagnosis.triggers[0]?.checkId || framework.checks[0].id;
    const tierMap: Record<string, 'Critical' | 'High Impact' | 'Improvement'> = {
      fix_first: 'Critical',
      fix_next: 'High Impact',
      later: 'Improvement'
    };
    const priority = tierMap[diagnosis.suggestedPriority] || 'High Impact';

    const newItem: AuditFindingItem = {
      id: `finding_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      diagnosisId: diagnosis.id,
      checkId: defaultCheck,
      tier: priority,
      priority,
      effort: 'Medium',
      order: audit.findings.length + 1,
      finding: diagnosis.finding,
      evidenceText: diagnosis.whyItMatters,
      businessImpact: diagnosis.whyItMatters,
      recommendedAction: diagnosis.recommendedFix,
      whyItMatters: diagnosis.whyItMatters,
      recommendedFix: diagnosis.recommendedFix,
      exampleImprovement: diagnosis.exampleImprovement,
      customClientNotes: '',
      tags: ['Vague', 'Friction']
    };
    onFindingsChange([...audit.findings, newItem]);
    setIsPickerOpen(false);
  };

  const handleMoveTier = (findingId: string, newTier: PriorityTier) => {
    const priorityMap: Record<string, 'Critical' | 'High Impact' | 'Improvement'> = {
      Critical: 'Critical',
      fix_first: 'Critical',
      'High Impact': 'High Impact',
      fix_next: 'High Impact',
      Improvement: 'Improvement',
      later: 'Improvement'
    };
    const priority = priorityMap[newTier] || 'High Impact';
    const updated = audit.findings.map(f => (f.id === findingId ? { ...f, tier: newTier, priority } : f));
    onFindingsChange(updated);
  };

  const handleDeleteFinding = (findingId: string) => {
    onFindingsChange(audit.findings.filter(f => f.id !== findingId));
  };

  const handleSaveEdit = () => {
    if (!editingFinding) return;
    const updated = audit.findings.map(f => (f.id === editingFinding.id ? editingFinding : f));
    onFindingsChange(updated);
    setEditingFinding(null);
  };

  const getEffortBadge = (effort?: string) => {
    if (effort === 'Low') return { label: 'Low Effort', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
    if (effort === 'High') return { label: 'High Effort', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
    return { label: 'Medium Effort', bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
  };

  const renderTierList = (
    title: string,
    tier: PriorityTier,
    items: AuditFindingItem[],
    badgeClass: string,
    hintText: string
  ) => {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{title}</h4>
              <span className={`badge ${badgeClass}`}>{items.length} items</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {hintText}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            No findings in this priority group.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item) => {
              const check = framework.checks.find(c => c.id === item.checkId);
              const effortStyle = getEffortBadge(item.effort);
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          className="badge"
                          style={{
                            background: effortStyle.bg,
                            color: effortStyle.text,
                            border: `1px solid ${effortStyle.border}`,
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          {effortStyle.label}
                        </span>

                        {check && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                            Check #{check.number}: {check.title}
                          </span>
                        )}

                        {item.tags?.map((t) => (
                          <span key={t} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                        {item.finding}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        className="select"
                        value={item.priority || (item.tier === 'fix_first' ? 'Critical' : item.tier === 'fix_next' ? 'High Impact' : 'Improvement')}
                        onChange={(e) => handleMoveTier(item.id, e.target.value as PriorityTier)}
                        style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                      >
                        <option value="Critical">🔴 Critical</option>
                        <option value="High Impact">🟠 High Impact</option>
                        <option value="Improvement">🟡 Improvement</option>
                      </select>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => setEditingFinding({ ...item })}
                        title="Edit Finding"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => handleDeleteFinding(item.id)}
                        title="Remove Finding"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {item.evidenceText && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Evidence: </strong>
                      {item.evidenceText}
                    </div>
                  )}

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Business & Conversion Impact: </strong>
                    {item.businessImpact || item.whyItMatters}
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--agency-primary, var(--accent-text))', background: 'var(--accent-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Recommended Action: </strong>
                    {item.recommendedAction || item.recommendedFix}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--agency-primary, var(--accent-text))', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <Layers size={13} /> Prioritized Finding Action Plan
          </div>
          <h3 className="section-title">Step 4: Prioritized Findings (6-Field Standard)</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Grouped into Critical, High Impact, and Improvement tiers with verified evidence, business impact, and estimated effort.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleAutoConsolidate}>
            <Sparkles size={15} /> Regenerate Recommendations
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsPickerOpen(true)}>
            <Plus size={15} /> Add from Library
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {renderTierList(
          'Critical (Immediate Leaks / Broken Mechanics)',
          'Critical',
          criticalFindings,
          'badge-rose',
          'Urgent blockers that directly prevent visitors from taking action or contacting the business.'
        )}

        {renderTierList(
          'High Impact (Major Trust & Value Clarity)',
          'High Impact',
          highImpactFindings,
          'badge-amber',
          'Key improvements that noticeably boost credibility, clear expectations, and quotation confidence.'
        )}

        {renderTierList(
          'Improvement (Polish & Supporting Assets)',
          'Improvement',
          improvementFindings,
          'badge-neutral',
          'Helpful refinements that strengthen overall brand perception and customer retention.'
        )}
      </div>

      {/* Edit Finding Modal */}
      {editingFinding && (
        <Modal
          isOpen={true}
          onClose={() => setEditingFinding(null)}
          title="Edit Consolidated Client Finding"
          maxWidth="700px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingFinding(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEdit}
              >
                Save Finding
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Priority Tier</label>
                <select
                  className="select"
                  value={editingFinding.priority || (editingFinding.tier === 'fix_first' ? 'Critical' : editingFinding.tier === 'fix_next' ? 'High Impact' : 'Improvement')}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    setEditingFinding({ ...editingFinding, tier: p, priority: p });
                  }}
                >
                  <option value="Critical">🔴 Critical (Broken / Missing)</option>
                  <option value="High Impact">🟠 High Impact (Major Leaks)</option>
                  <option value="Improvement">🟡 Improvement (Polish / Polish)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Effort</label>
                <select
                  className="select"
                  value={editingFinding.effort || 'Medium'}
                  onChange={(e) => setEditingFinding({ ...editingFinding, effort: e.target.value as any })}
                >
                  <option value="Low">🟢 Low (1–2 Hours)</option>
                  <option value="Medium">🟡 Medium (Half-Day)</option>
                  <option value="High">🔴 High (Multi-Day)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Finding (High-level client issue)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingFinding.finding}
                onChange={(e) => setEditingFinding({ ...editingFinding, finding: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Evidence (Specific elements observed)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingFinding.evidenceText || ''}
                onChange={(e) => setEditingFinding({ ...editingFinding, evidenceText: e.target.value })}
                placeholder="Observed copy, missing buttons, or viewport screenshot evidence..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business & Conversion Impact (Why it matters to the owner)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingFinding.businessImpact || editingFinding.whyItMatters}
                onChange={(e) => setEditingFinding({ ...editingFinding, businessImpact: e.target.value, whyItMatters: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recommended Action (Targeted, actionable fix)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingFinding.recommendedAction || editingFinding.recommendedFix}
                onChange={(e) => setEditingFinding({ ...editingFinding, recommendedAction: e.target.value, recommendedFix: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Diagnosis Picker Modal */}
      {isPickerOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPickerOpen(false)}
          title="Select Diagnosis from Library"
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {diagnoses.map((d) => (
              <div
                key={d.id}
                className="card card-hover"
                style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => handleAddDiagnosisItem(d)}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{d.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.category} • {d.severity}</div>
                </div>
                <button type="button" className="btn btn-primary btn-sm">
                  Add
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
