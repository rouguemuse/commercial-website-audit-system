import React, { useState } from 'react';
import type { Opportunity, OpportunityImpact } from '../../types/opportunity';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OpportunityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  onSave: (updated: Opportunity) => void;
}

export const OpportunityEditModal: React.FC<OpportunityEditModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSave
}) => {
  const [title, setTitle] = useState(opportunity.title);
  const [observation, setObservation] = useState(opportunity.observation);
  const [businessImplication, setBusinessImplication] = useState(opportunity.businessImplication);
  const [proposedOpportunity, setProposedOpportunity] = useState(opportunity.proposedOpportunity);
  const [recommendedAction, setRecommendedAction] = useState(opportunity.recommendedAction);
  const [estimatedImpact, setEstimatedImpact] = useState<OpportunityImpact>(opportunity.estimatedImpact || 'medium');
  const [notes, setNotes] = useState(opportunity.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...opportunity,
      title: title.trim(),
      observation: observation.trim(),
      businessImplication: businessImplication.trim(),
      proposedOpportunity: proposedOpportunity.trim(),
      recommendedAction: recommendedAction.trim(),
      estimatedImpact,
      notes: notes.trim() || undefined,
      userEdited: true,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          background: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-text)' }}>
              Opportunity Refinement
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
              Edit Opportunity
            </h3>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Source Evidence Protected Banner */}
        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Underlying audit evidence ({opportunity.evidenceRefs.length} refs, {opportunity.contributingCheckIds.length} checks) remains permanently linked and preserved.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label>Opportunity Title *</label>
            <input
              type="text"
              required
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Factual Observation</label>
            <textarea
              className="form-control"
              rows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Business Implication (Commercial / Operational Impact)</label>
            <textarea
              className="form-control"
              rows={3}
              value={businessImplication}
              onChange={(e) => setBusinessImplication(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Proposed Opportunity</label>
            <textarea
              className="form-control"
              rows={2}
              value={proposedOpportunity}
              onChange={(e) => setProposedOpportunity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Recommended Next Action</label>
            <textarea
              className="form-control"
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Estimated Impact</label>
              <select
                className="form-control"
                value={estimatedImpact}
                onChange={(e) => setEstimatedImpact(e.target.value as OpportunityImpact)}
              >
                <option value="high">High Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="low">Low Impact</option>
              </select>
            </div>

            <div className="form-group">
              <label>Consultant Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="Internal rationale..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
              <CheckCircle2 size={15} /> Save Refinements
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
