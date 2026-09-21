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

  const fixFirstFindings = audit.findings.filter(f => f.tier === 'fix_first').sort((a, b) => a.order - b.order);
  const fixNextFindings = audit.findings.filter(f => f.tier === 'fix_next').sort((a, b) => a.order - b.order);
  const laterFindings = audit.findings.filter(f => f.tier === 'later').sort((a, b) => a.order - b.order);

  // Auto-generate consolidated high-level findings
  const handleAutoConsolidate = () => {
    const consolidated = generateConsolidatedFindings(audit.scores, framework, diagnoses);
    onFindingsChange(consolidated);
  };

  const handleAddDiagnosisItem = (diagnosis: Diagnosis) => {
    const defaultCheck = diagnosis.triggers[0]?.checkId || framework.checks[0].id;
    const newItem: AuditFindingItem = {
      id: `finding_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      diagnosisId: diagnosis.id,
      checkId: defaultCheck,
      tier: diagnosis.suggestedPriority,
      order: audit.findings.length + 1,
      finding: diagnosis.finding,
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
    const updated = audit.findings.map(f => (f.id === findingId ? { ...f, tier: newTier } : f));
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
            No findings in this tier.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item) => {
              const check = framework.checks.find(c => c.id === item.checkId);
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {item.isConsolidated && (
                          <span className="badge badge-accent" style={{ fontSize: '0.68rem', gap: '4px' }}>
                            <Layers size={11} /> Consolidated Finding
                          </span>
                        )}
                        {check && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                            Primary: #{check.number} {check.title}
                          </span>
                        )}
                        {item.tags?.map((t) => (
                          <span key={t} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                        {item.finding}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        className="select"
                        value={item.tier}
                        onChange={(e) => handleMoveTier(item.id, e.target.value as PriorityTier)}
                        style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                      >
                        <option value="fix_first">Fix First</option>
                        <option value="fix_next">Fix Next</option>
                        <option value="later">Later</option>
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

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Why it matters: </strong>
                    {item.whyItMatters}
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--accent-text)', background: 'var(--accent-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Recommended Fix: </strong>
                    {item.recommendedFix}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <Layers size={13} /> Finding Clustering & Prioritization
          </div>
          <h3 className="section-title">Step 4: Consolidated Findings</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Thirty checks are clustered into 3–5 high-level customer findings rather than overwhelming the client report with fragmented check items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleAutoConsolidate}>
            <Sparkles size={15} /> Auto-Cluster Findings
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsPickerOpen(true)}>
            <Plus size={15} /> Add from Library
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {renderTierList(
          'Fix First (Highest Priority 3–5 Items)',
          'fix_first',
          fixFirstFindings,
          'badge-rose',
          'Immediate, high-impact fixes that eliminate the largest conversion leaks.'
        )}

        {renderTierList(
          'Fix Next (Secondary Improvements)',
          'fix_next',
          fixNextFindings,
          'badge-amber',
          'Follow-up polish, trust signals, and secondary user experience improvements.'
        )}

        {renderTierList(
          'Later / Optional Opportunities',
          'later',
          laterFindings,
          'badge-neutral',
          'Longer-term architectural additions or optional feature expansions.'
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
            <div className="form-group">
              <label className="form-label">Priority Tier</label>
              <select
                className="select"
                value={editingFinding.tier}
                onChange={(e) => setEditingFinding({ ...editingFinding, tier: e.target.value as PriorityTier })}
              >
                <option value="fix_first">Fix First (Top 3–5)</option>
                <option value="fix_next">Fix Next (Secondary)</option>
                <option value="later">Later / Optional</option>
              </select>
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
              <label className="form-label">Why It Matters (Customer interpretation)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingFinding.whyItMatters}
                onChange={(e) => setEditingFinding({ ...editingFinding, whyItMatters: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recommended Fix (Targeted solution)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingFinding.recommendedFix}
                onChange={(e) => setEditingFinding({ ...editingFinding, recommendedFix: e.target.value })}
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
