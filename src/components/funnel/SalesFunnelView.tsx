import React from 'react';
import { VALUE_LADDER_OFFERS } from '../../data/seedData';
import { TrendingUp, Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const SalesFunnelView: React.FC = () => {
  const publicOffers = VALUE_LADDER_OFFERS.filter(o => o.isPublicFunnel);
  const backendOffers = VALUE_LADDER_OFFERS.filter(o => !o.isPublicFunnel);

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          <TrendingUp size={14} /> Public Website Rescue Funnel Architecture
        </div>
        <h1 className="page-title">Client-Facing Sales Ladder</h1>
        <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '6px' }}>
          Internal preview of the customer-facing conversion funnel. The public front-end presents low-friction offers that match the customer's exact level of readiness.
        </p>
      </div>

      {/* 4 Public Funnel Tiers */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Public-Facing Conversion Ladder (4 Steps)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {publicOffers.map((offer, idx) => (
            <div
              key={offer.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderColor: offer.targetPrice === 350 ? 'var(--accent-border)' : 'var(--border-subtle)',
                background: offer.targetPrice === 350 ? '#faf5ff' : 'var(--bg-surface)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>Step #{idx + 1}</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {offer.price}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px' }}>
                  {offer.name}
                </h3>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-text)', marginTop: '2px' }}>
                  "{offer.tagline}"
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.4 }}>
                  {offer.deliverable}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong>Ideal for: </strong>{offer.idealFor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual Backend Offers */}
      <div className="card" style={{ background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <ShieldCheck size={18} color="var(--accent-primary)" />
          <h3 className="section-title" style={{ fontSize: '1.05rem' }}>
            Contextual Backend Rebuild Offers
          </h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          To prevent customer analysis paralysis, high-ticket builds are NOT shown in the initial public menu. They are offered contextually after an audit reveals critical structural deficits (0–25 score).
        </p>

        <div className="grid-2">
          {backendOffers.map((offer) => (
            <div key={offer.id} className="card" style={{ background: '#ffffff', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{offer.name}</div>
                <span className="badge badge-neutral" style={{ fontWeight: 800 }}>{offer.price}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {offer.tagline}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {offer.deliverable}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
