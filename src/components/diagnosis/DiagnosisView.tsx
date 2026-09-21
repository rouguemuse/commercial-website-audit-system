import React, { useState } from 'react';
import type { Diagnosis, MasterFramework, SeverityLevel, PriorityTier } from '../../types';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Filter,
  Tag,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface DiagnosisViewProps {
  diagnoses: Diagnosis[];
  framework: MasterFramework;
  onSaveDiagnosis: (diagnosis: Diagnosis) => Promise<void>;
  onDeleteDiagnosis: (id: string) => Promise<void>;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({
  diagnoses,
  framework,
  onSaveDiagnosis,
  onDeleteDiagnosis
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = diagnoses.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.finding.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.recommendedFix.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesSev = selectedSeverity === 'all' || d.severity === selectedSeverity;

    return matchesSearch && matchesCat && matchesSev;
  });

  const handleCreateNew = () => {
    const newDiag: Diagnosis = {
      id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: 'New Diagnosis Pattern',
      category: framework.categories[0]?.name || 'First Impression & Clarity',
      triggers: [{ checkId: framework.checks[0]?.id || 'chk_1', triggerScores: [0, 1] }],
      severity: 'High',
      finding: 'Describe the specific observation of what is broken or missing.',
      whyItMatters: 'Explain why this causes visitor bounce or friction.',
      recommendedFix: 'State the concrete solution and layout change.',
      exampleImprovement: 'Provide an actionable before-vs-after copy or layout example.',
      suggestedPriority: 'fix_first',
      recommendedOffer: '48-Hour Homepage Rescue',
      internalNotes: '',
      isActive: true
    };
    setEditingDiagnosis(newDiag);
  };

  const handleSaveModal = async () => {
    if (!editingDiagnosis) return;
    try {
      setIsSaving(true);
      await onSaveDiagnosis(editingDiagnosis);
      setEditingDiagnosis(null);
    } catch (err: any) {
      alert(`Error saving diagnosis: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCheckTrigger = (checkId: string) => {
    if (!editingDiagnosis) return;
    const existing = editingDiagnosis.triggers.find(t => t.checkId === checkId);
    let updatedTriggers;
    if (existing) {
      updatedTriggers = editingDiagnosis.triggers.filter(t => t.checkId !== checkId);
      if (updatedTriggers.length === 0) {
        updatedTriggers = [{ checkId, triggerScores: [0, 1] }];
      }
    } else {
      updatedTriggers = [...editingDiagnosis.triggers, { checkId, triggerScores: [0, 1] }];
    }
    setEditingDiagnosis({ ...editingDiagnosis, triggers: updatedTriggers });
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <BookOpen size={14} /> Modular Knowledge Engine
          </div>
          <h1 className="page-title">Diagnosis Library</h1>
          <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '6px' }}>
            Pre-authored diagnosis snippets mapping audit triggers to clear customer explanations: <strong>FINDING → WHY IT MATTERS → RECOMMENDATION → NEXT OFFER</strong>.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleCreateNew}>
          <PlusCircle size={15} /> Add Diagnosis
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search diagnoses, findings, or fixes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Categories</option>
            {framework.categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            className="select"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Showing {filtered.length} of {diagnoses.length}
        </span>
      </div>

      {/* Diagnosis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '18px' }}>
        {filtered.map((diag) => {
          let sevBadge = 'badge-rose';
          if (diag.severity === 'High') sevBadge = 'badge-orange';
          else if (diag.severity === 'Medium') sevBadge = 'badge-amber';
          else if (diag.severity === 'Low') sevBadge = 'badge-neutral';

          const matchedChecks = framework.checks.filter(c => diag.triggers.some(t => t.checkId === c.id));

          return (
            <div key={diag.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {diag.category}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {diag.name}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge ${sevBadge}`}>{diag.severity}</span>
                    <span className="badge badge-accent" style={{ textTransform: 'none' }}>
                      {diag.suggestedPriority === 'fix_first' ? 'Fix First' : diag.suggestedPriority === 'fix_next' ? 'Fix Next' : 'Later'}
                    </span>
                  </div>
                </div>

                {/* Finding */}
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Finding: </strong>
                  {diag.finding}
                </div>

                {/* Why it matters */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Why it matters: </strong>
                  {diag.whyItMatters}
                </div>

                {/* Recommended Fix */}
                <div style={{ fontSize: '0.86rem', color: 'var(--accent-text)', background: 'var(--accent-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Fix: </strong>
                  {diag.recommendedFix}
                </div>

                {/* Example */}
                {diag.exampleImprovement && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    <strong>Example: </strong>{diag.exampleImprovement}
                  </div>
                )}

                {/* Related Check Pills (Many-to-many) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {matchedChecks.map(c => (
                    <span key={c.id} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      Check #{c.number}: {c.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Next Offer: <span style={{ color: 'var(--text-primary)' }}>{diag.recommendedOffer}</span>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingDiagnosis({ ...diag })}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm(`Delete diagnosis "${diag.name}"?`)) {
                        onDeleteDiagnosis(diag.id);
                      }
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Diagnosis Modal */}
      {editingDiagnosis && (
        <Modal
          isOpen={true}
          onClose={() => setEditingDiagnosis(null)}
          title={editingDiagnosis.id.startsWith('diag_') && diagnoses.some(d => d.id === editingDiagnosis.id) ? `Edit Diagnosis: ${editingDiagnosis.name}` : 'New Diagnosis Snippet'}
          maxWidth="760px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingDiagnosis(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveModal}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Diagnosis'}
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Diagnosis Name</label>
                <input
                  type="text"
                  className="input"
                  value={editingDiagnosis.name}
                  onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="select"
                  value={editingDiagnosis.category}
                  onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, category: e.target.value })}
                >
                  {framework.categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select
                  className="select"
                  value={editingDiagnosis.severity}
                  onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, severity: e.target.value as SeverityLevel })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Suggested Priority</label>
                <select
                  className="select"
                  value={editingDiagnosis.suggestedPriority}
                  onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, suggestedPriority: e.target.value as PriorityTier })}
                >
                  <option value="fix_first">Fix First (Top 3–5)</option>
                  <option value="fix_next">Fix Next (Secondary)</option>
                  <option value="later">Later / Optional</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recommended Service</label>
                <input
                  type="text"
                  className="input"
                  value={editingDiagnosis.recommendedOffer}
                  onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, recommendedOffer: e.target.value })}
                />
              </div>
            </div>

            {/* Many-to-Many Checks Trigger Selector */}
            <div className="form-group">
              <label className="form-label">Triggered by Framework Checks (Multi-select)</label>
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {framework.checks.map((chk) => {
                  const isChecked = editingDiagnosis.triggers.some(t => t.checkId === chk.id);
                  return (
                    <label key={chk.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckTrigger(chk.id)}
                      />
                      <span>#{chk.number}: {chk.title} ({chk.evaluatorQuestion})</span>
                    </label>
                  );
                })}
              </div>
              <span className="form-hint">This diagnosis is automatically suggested whenever any checked item scores 0 or 1.</span>
            </div>

            <div className="form-group">
              <label className="form-label">1. Finding (What is wrong?)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingDiagnosis.finding}
                onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, finding: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">2. Why It Matters (Why does it cost customers?)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingDiagnosis.whyItMatters}
                onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, whyItMatters: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">3. Recommended Fix (What to do instead)</label>
              <textarea
                className="textarea"
                rows={2}
                value={editingDiagnosis.recommendedFix}
                onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, recommendedFix: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">4. Example Improvement (Concrete before/after)</label>
              <input
                type="text"
                className="input"
                value={editingDiagnosis.exampleImprovement}
                onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, exampleImprovement: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
