import React, { useState } from 'react';
import type { MasterFramework, FrameworkCheck, FrameworkCategory } from '../../types';
import { Modal } from '../common/Modal';
import {
  SlidersHorizontal,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface FrameworkViewProps {
  framework: MasterFramework;
  onSaveCheck: (updatedCheck: FrameworkCheck) => Promise<void>;
  onReorderChecks: (orderedIds: string[]) => Promise<void>;
}

export const FrameworkView: React.FC<FrameworkViewProps> = ({
  framework,
  onSaveCheck,
  onReorderChecks
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(framework.categories[0]?.id || 'cat_clarity');
  const [editingCheck, setEditingCheck] = useState<FrameworkCheck | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeCategory = framework.categories.find(c => c.id === selectedCategoryId) || framework.categories[0];
  const categoryChecks = framework.checks.filter(c => c.categoryId === selectedCategoryId);

  const handleEditClick = (check: FrameworkCheck) => {
    setEditingCheck({ ...check });
  };

  const handleSaveModal = async () => {
    if (!editingCheck) return;
    try {
      setIsSaving(true);
      await onSaveCheck(editingCheck);
      setEditingCheck(null);
    } catch (err: any) {
      alert(`Error saving check: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveCheck = async (checkId: string, direction: 'up' | 'down') => {
    const allChecks = [...framework.checks];
    const index = allChecks.findIndex(c => c.id === checkId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = allChecks[index - 1];
      allChecks[index - 1] = allChecks[index];
      allChecks[index] = temp;
    } else if (direction === 'down' && index < allChecks.length - 1) {
      const temp = allChecks[index + 1];
      allChecks[index + 1] = allChecks[index];
      allChecks[index] = temp;
    }

    await onReorderChecks(allChecks.map(c => c.id));
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <SlidersHorizontal size={14} /> Master Scoring Framework
          </div>
          <h1 className="page-title">Scoring Framework (v{framework.version})</h1>
          <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '6px' }}>
            Exactly 30 standardized checks across 6 categories. Edits automatically propagate to new audits, the Free Checklist, and the Rescue Kit while preserving historical delivered client reports.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            Version {framework.version} • {framework.checks.length} Master Checks
          </span>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="card" style={{ padding: '8px 12px' }}>
        <div className="tabs-header" style={{ border: 'none' }}>
          {framework.categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            const checksCount = framework.checks.filter(c => c.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                className={`tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>#{cat.number} {cat.shortName}</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {checksCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Category Description */}
      {activeCategory && (
        <div style={{ background: 'var(--bg-subtle)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Category {activeCategory.number}: {activeCategory.name}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeCategory.description}
          </div>
        </div>
      )}

      {/* Checks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {categoryChecks.map((chk, idx) => (
          <div
            key={chk.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              opacity: chk.isActive ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {chk.title}
                    </h3>
                    {!chk.isActive && <span className="badge badge-neutral">Inactive</span>}
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                    {chk.evaluatorQuestion}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                    Customer-facing: "{chk.checklistQuestion}"
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMoveCheck(chk.id, 'up')}
                  disabled={idx === 0}
                  title="Move Up"
                  style={{ padding: '6px 8px' }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMoveCheck(chk.id, 'down')}
                  disabled={idx === categoryChecks.length - 1}
                  title="Move Down"
                  style={{ padding: '6px 8px' }}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleEditClick(chk)}
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
            </div>

            {/* Scoring Guidance 0 / 1 / 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span className="badge badge-rose" style={{ padding: '2px 6px', fontSize: '0.72rem' }}>0</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger-text)' }}>Missing / Broken</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{chk.scoringGuidance[0]}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span className="badge badge-amber" style={{ padding: '2px 6px', fontSize: '0.72rem' }}>1</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning-text)' }}>Weak / Needs Work</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{chk.scoringGuidance[1]}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '0.72rem' }}>2</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success-text)' }}>Working Well</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{chk.scoringGuidance[2]}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Check Edit Modal */}
      {editingCheck && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCheck(null)}
          title={`Edit Master Check #${editingCheck.number}: ${editingCheck.title}`}
          maxWidth="720px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingCheck(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveModal}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Publish New Version'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Check Title</label>
              <input
                type="text"
                className="input"
                value={editingCheck.title}
                onChange={(e) => setEditingCheck({ ...editingCheck, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Evaluator Question (Internal Auditor)</label>
              <input
                type="text"
                className="input"
                value={editingCheck.evaluatorQuestion}
                onChange={(e) => setEditingCheck({ ...editingCheck, evaluatorQuestion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer-Facing Checklist Question (Free Checklist)</label>
              <input
                type="text"
                className="input"
                value={editingCheck.checklistQuestion}
                onChange={(e) => setEditingCheck({ ...editingCheck, checklistQuestion: e.target.value })}
              />
              <span className="form-hint">Shown in the derived free DIY website health checklist.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Scoring Guidance: 0 (Missing / Broken)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingCheck.scoringGuidance[0]}
                onChange={(e) => setEditingCheck({
                  ...editingCheck,
                  scoringGuidance: { ...editingCheck.scoringGuidance, 0: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scoring Guidance: 1 (Weak / Needs Improvement)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingCheck.scoringGuidance[1]}
                onChange={(e) => setEditingCheck({
                  ...editingCheck,
                  scoringGuidance: { ...editingCheck.scoringGuidance, 1: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scoring Guidance: 2 (Working Well)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingCheck.scoringGuidance[2]}
                onChange={(e) => setEditingCheck({
                  ...editingCheck,
                  scoringGuidance: { ...editingCheck.scoringGuidance, 2: e.target.value }
                })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={editingCheck.isActive}
                  onChange={(e) => setEditingCheck({ ...editingCheck, isActive: e.target.checked })}
                />
                <span>Active in Framework</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
