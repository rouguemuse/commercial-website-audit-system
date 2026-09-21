import React from 'react';
import type { ReportConfiguration } from '../../types';
import { VALUE_LADDER_OFFERS } from '../../data/seedData';
import { Check, Sparkles, Tag, Clock, ShieldCheck } from 'lucide-react';

interface Step7Props {
  reportConfig: ReportConfiguration;
  onChange: (updated: ReportConfiguration) => void;
}

export const Step7RecommendedOffer: React.FC<Step7Props> = ({
  reportConfig,
  onChange
}) => {
  const currentOffer = reportConfig.recommendedOffer;

  const handleSelectPredefined = (offer: typeof VALUE_LADDER_OFFERS[0]) => {
    onChange({
      ...reportConfig,
      recommendedOffer: {
        offerName: offer.name,
        price: offer.price,
        turnaround: offer.turnaround,
        description: offer.tagline,
        customScope: offer.deliverable,
        ctaText: offer.targetPrice > 0 ? `Schedule Your ${offer.name}` : 'Get Started Now'
      }
    });
  };

  const handleCustomFieldChange = (field: keyof ReportConfiguration['recommendedOffer'], val: string) => {
    onChange({
      ...reportConfig,
      recommendedOffer: {
        ...reportConfig.recommendedOffer,
        [field]: val
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
          <Sparkles size={13} /> Advisory Next Step
        </div>
        <h3 className="section-title">Step 7: Recommended Agency Offer</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Select the advisory solution for this client deliverable. Recommendations assist your decision but never override auditor judgment.
        </p>
      </div>

      {/* Preset Service Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {VALUE_LADDER_OFFERS.filter(o => o.targetPrice > 0).map((offer) => {
          const isSelected = currentOffer.offerName === offer.name;
          return (
            <div
              key={offer.id}
              className="card card-hover"
              style={{
                padding: '16px',
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
              onClick={() => handleSelectPredefined(offer)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-accent" style={{ fontSize: '0.68rem' }}>{offer.badge}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{offer.price}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', marginTop: '8px' }}>
                  {offer.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {offer.tagline}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={12} /> {offer.turnaround}
              </div>
            </div>
          );
        })}
      </div>

      {/* Customizable Offer Specification for this Client */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--accent-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <ShieldCheck size={18} color="var(--accent-primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Client-Facing Offer Specification</h4>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Service Title</label>
            <input
              type="text"
              className="input"
              value={currentOffer.offerName}
              onChange={(e) => handleCustomFieldChange('offerName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price / Investment</label>
            <input
              type="text"
              className="input"
              value={currentOffer.price}
              onChange={(e) => handleCustomFieldChange('price', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Turnaround</label>
            <input
              type="text"
              className="input"
              value={currentOffer.turnaround}
              onChange={(e) => handleCustomFieldChange('turnaround', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">High-Level Outcome Description</label>
          <textarea
            className="textarea"
            rows={2}
            value={currentOffer.description}
            onChange={(e) => handleCustomFieldChange('description', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Client-Specific Deliverable Scope</label>
          <textarea
            className="textarea"
            rows={2}
            value={currentOffer.customScope}
            onChange={(e) => handleCustomFieldChange('customScope', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Primary Call-to-Action Button Text</label>
          <input
            type="text"
            className="input"
            value={currentOffer.ctaText}
            onChange={(e) => handleCustomFieldChange('ctaText', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
