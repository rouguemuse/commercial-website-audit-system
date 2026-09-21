import React from 'react';
import type { Audit } from '../../types';
import { Globe, Building, MapPin, UserCheck, Target, FileText, Mic, Sparkles } from 'lucide-react';

interface Step1Props {
  audit: Audit;
  onChange: (updated: Partial<Audit>) => void;
  onGoToManualMode?: () => void;
}

const DESIRED_ACTIONS = [
  'Request quote',
  'Call',
  'Text',
  'Book appointment',
  'Purchase',
  'Visit location',
  'Submit inquiry',
  'Other'
];

export const Step1BusinessInfo: React.FC<Step1Props> = ({ audit, onChange, onGoToManualMode }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="section-title">Step 1: Business & Website Information</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Capture the core operational context of the business before beginning the 30-check evaluation.
          </p>
        </div>
        {onGoToManualMode && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onGoToManualMode}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Switch to Manual Audit Mode (Screenshots) →
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={14} color="var(--accent-primary)" /> Business Name *
            </label>
            <input
              type="text"
              className="input"
              value={audit.businessName}
              onChange={(e) => onChange({ businessName: e.target.value })}
              placeholder="e.g. Apex Roofing & Remodeling"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="var(--accent-primary)" /> Website URL *
            </label>
            <input
              type="url"
              className="input"
              value={audit.websiteUrl}
              onChange={(e) => onChange({ websiteUrl: e.target.value })}
              placeholder="https://www.apexroofingexample.com"
              required
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Industry / Niche</label>
            <input
              type="text"
              className="input"
              value={audit.industry}
              onChange={(e) => onChange({ industry: e.target.value })}
              placeholder="e.g. Residential Roofing"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="var(--accent-primary)" /> City / Service Area
            </label>
            <input
              type="text"
              className="input"
              value={audit.cityServiceArea}
              onChange={(e) => onChange({ cityServiceArea: e.target.value })}
              placeholder="e.g. Austin & Round Rock, TX"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} color="var(--accent-primary)" /> Primary Desired Action
            </label>
            <select
              className="select"
              value={audit.desiredAction}
              onChange={(e) => onChange({ desiredAction: e.target.value })}
            >
              {DESIRED_ACTIONS.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} color="var(--accent-primary)" /> Primary Target Customer
          </label>
          <input
            type="text"
            className="input"
            value={audit.primaryCustomerType}
            onChange={(e) => onChange({ primaryCustomerType: e.target.value })}
            placeholder="e.g. Homeowners with hail damage, insurance claimants, property managers"
          />
        </div>

        {/* Brand Voice Evidence & Authentic Owner Phrasing */}
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={16} color="#7e22ce" />
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#581c87' }}>
              Brand Voice Evidence & Owner Phrasing (Anti-Generic Copywriting)
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#6b21a8', lineHeight: 1.4 }}>
            Record actual phrases or how the business owner naturally speaks to customers. The system uses this to prevent generic AI fluff and create authentic Fixed Direction copy.
          </p>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ color: '#581c87', fontSize: '0.78rem' }}>
                Actual Owner Quote / Real Phrasing
              </label>
              <textarea
                className="textarea"
                rows={2}
                value={audit.brandVoiceSample || ''}
                onChange={(e) => onChange({ brandVoiceSample: e.target.value })}
                placeholder='e.g. "Call Wayne. If we’ve got a dumpster available, we’ll get you taken care of."'
                style={{ background: '#ffffff', borderColor: '#d8b4fe', fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#581c87', fontSize: '0.78rem' }}>
                Voice Tone & Personality Notes
              </label>
              <textarea
                className="textarea"
                rows={2}
                value={audit.ownerVoiceNotes || ''}
                onChange={(e) => onChange({ ownerVoiceNotes: e.target.value })}
                placeholder='e.g. "Plainspoken Texas contractor tone, direct, no marketing jargon."'
                style={{ background: '#ffffff', borderColor: '#d8b4fe', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} color="var(--accent-primary)" /> Initial Auditor Notes & Observations
          </label>
          <textarea
            className="textarea"
            rows={3}
            value={audit.auditorNotes}
            onChange={(e) => onChange({ auditorNotes: e.target.value })}
            placeholder="Internal background notes, business owner pain points, initial impressions..."
          />
        </div>
      </div>
    </div>
  );
};
