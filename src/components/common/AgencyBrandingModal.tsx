import React, { useState, useEffect, useRef } from 'react';
import {
  AgencyBranding,
  getAgencyBranding,
  saveAgencyBranding,
  resetToDemoBranding,
  DEFAULT_AGENCY_BRANDING
} from '../../config/brandingConfig';
import { Modal } from './Modal';
import { Palette, Building2, Globe, Mail, Phone, Upload, Trash2, RotateCcw, Check, Sparkles } from 'lucide-react';

interface AgencyBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandingUpdated?: (branding: AgencyBranding) => void;
}

export const AgencyBrandingModal: React.FC<AgencyBrandingModalProps> = ({
  isOpen,
  onClose,
  onBrandingUpdated
}) => {
  const [branding, setBranding] = useState<AgencyBranding>(getAgencyBranding);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBranding(getAgencyBranding());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 1MB for localStorage safety
    if (file.size > 1024 * 1024) {
      alert('Logo file size must be under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBranding(prev => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    setBranding(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSave = () => {
    saveAgencyBranding(branding);
    setSavedSuccess(true);
    if (onBrandingUpdated) {
      onBrandingUpdated(branding);
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    if (confirm('Reset agency settings to default demo branding?')) {
      const reset = resetToDemoBranding();
      setBranding(reset);
      if (onBrandingUpdated) {
        onBrandingUpdated(reset);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="White-Label Agency Branding & Colors"
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Customize the agency name, logo, contact details, and color palette. These settings apply globally across the audit workspace and format all exported client PDF reports.
        </p>

        {/* Agency Identity Form */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={13} color="var(--accent-primary)" /> Agency Name *
            </label>
            <input
              type="text"
              className="input"
              value={branding.agencyName}
              onChange={(e) => setBranding({ ...branding, agencyName: e.target.value })}
              placeholder="e.g. Apex Digital Systems"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tagline / Subtitle</label>
            <input
              type="text"
              className="input"
              value={branding.tagline}
              onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
              placeholder="e.g. Website Conversion & UX Audits"
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} color="var(--accent-primary)" /> Contact Email
            </label>
            <input
              type="email"
              className="input"
              value={branding.email}
              onChange={(e) => setBranding({ ...branding, email: e.target.value })}
              placeholder="audits@youragency.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} color="var(--accent-primary)" /> Phone Number
            </label>
            <input
              type="text"
              className="input"
              value={branding.phone}
              onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
              placeholder="(555) 234-5678"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={13} color="var(--accent-primary)" /> Website URL
            </label>
            <input
              type="url"
              className="input"
              value={branding.website}
              onChange={(e) => setBranding({ ...branding, website: e.target.value })}
              placeholder="https://youragency.com"
            />
          </div>
        </div>

        {/* Color Palette Customizer */}
        <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Palette size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Brand Colors (Client Deliverable)</span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Primary Brand Color (Headers & Dark Text)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  style={{ width: '40px', height: '36px', padding: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                />
                <input
                  type="text"
                  className="input"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  placeholder="#0f172a"
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Accent / Highlight Color (Buttons, Badges)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                  style={{ width: '40px', height: '36px', padding: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                />
                <input
                  type="text"
                  className="input"
                  value={branding.accentColor}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                  placeholder="#2563eb"
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Agency Logo Upload */}
        <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Agency Logo</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={13} /> Upload Image (PNG/SVG)
              </button>
              {branding.logoUrl && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleRemoveLogo}
                  title="Remove custom logo"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>

          {branding.logoUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <img src={branding.logoUrl} alt="Agency Logo" style={{ maxHeight: '44px', maxWidth: '180px', objectFit: 'contain' }} />
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>Custom logo active on report covers and headers.</div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No custom logo uploaded. System will use high-contrast styled text for agency header.
            </div>
          )}
        </div>

        {/* Live Preview Card */}
        <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: `2px solid ${branding.accentColor}` }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
            Live Deliverable Header Preview
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" style={{ maxHeight: '36px', maxWidth: '160px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: branding.primaryColor }}>
                  {branding.agencyName || 'Your Agency Name'}
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                {branding.tagline || 'Website Conversion Audit'} • {branding.email || 'contact@agency.com'}
              </div>
            </div>
            <span
              style={{
                background: branding.accentColor,
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '4px'
              }}
            >
              Deliverable
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={13} /> Reset to Demo Branding
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {savedSuccess ? <Check size={14} /> : <Sparkles size={14} />}
              <span>{savedSuccess ? 'Branding Saved!' : 'Save & Apply Branding'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
