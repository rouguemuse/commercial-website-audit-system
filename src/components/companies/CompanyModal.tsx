import React, { useState, useEffect } from 'react';
import type { Company, CompanyRelationshipType, CompanyPrimaryContact } from '../../types/company';
import { companyRepository } from '../../services/repositories/companyRepository';
import { X, Building2, User, Globe, MapPin, Briefcase, Calendar, FileText, CheckCircle2, Sparkles } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
  initialCompany?: Company | null;
  defaultRelationship?: CompanyRelationshipType;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCompany,
  defaultRelationship = 'prospect'
}) => {
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [relationshipType, setRelationshipType] = useState<CompanyRelationshipType>(defaultRelationship);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [clientSince, setClientSince] = useState('');
  const [engagementNotes, setEngagementNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCompany) {
      setName(initialCompany.name || '');
      setWebsiteUrl(initialCompany.websiteUrl || '');
      setRelationshipType(initialCompany.relationshipType || 'prospect');
      setIndustry(initialCompany.industry || '');
      setLocation(initialCompany.location || '');
      setContactName(initialCompany.primaryContact?.name || '');
      setContactTitle(initialCompany.primaryContact?.title || '');
      setContactEmail(initialCompany.primaryContact?.email || '');
      setContactPhone(initialCompany.primaryContact?.phone || '');
      setContactLinkedin(initialCompany.primaryContact?.linkedinUrl || '');
      setClientSince(initialCompany.clientSince || '');
      setEngagementNotes(initialCompany.engagementNotes || '');
      setNotes(initialCompany.notes || '');
    } else {
      setName('');
      setWebsiteUrl('');
      setRelationshipType(defaultRelationship);
      setIndustry('');
      setLocation('');
      setContactName('');
      setContactTitle('');
      setContactEmail('');
      setContactPhone('');
      setContactLinkedin('');
      setClientSince(defaultRelationship === 'existing_client' ? new Date().toISOString().split('T')[0] : '');
      setEngagementNotes('');
      setNotes('');
    }
    setValidationError(null);
  }, [initialCompany, defaultRelationship, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please provide a Company Name.');
      return;
    }
    if (!websiteUrl.trim()) {
      setValidationError('Please provide a target Website URL.');
      return;
    }

    let cleanUrl = websiteUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const primaryContact: CompanyPrimaryContact = {
      name: contactName.trim() || undefined,
      title: contactTitle.trim() || undefined,
      email: contactEmail.trim() || undefined,
      phone: contactPhone.trim() || undefined,
      linkedinUrl: contactLinkedin.trim() || undefined
    };

    const companyToSave: Company = initialCompany
      ? {
          ...initialCompany,
          name: name.trim(),
          websiteUrl: cleanUrl,
          relationshipType,
          industry: industry.trim(),
          location: location.trim() || undefined,
          primaryContact,
          clientSince: relationshipType === 'existing_client' ? (clientSince || new Date().toISOString().split('T')[0]) : undefined,
          engagementNotes: engagementNotes.trim() || undefined,
          notes: notes.trim() || undefined,
          updatedAt: new Date().toISOString()
        }
      : companyRepository.create({
          name: name.trim(),
          websiteUrl: cleanUrl,
          relationshipType,
          industry: industry.trim(),
          location: location.trim() || undefined,
          primaryContact,
          clientSince: relationshipType === 'existing_client' ? (clientSince || new Date().toISOString().split('T')[0]) : undefined,
          engagementNotes: engagementNotes.trim() || undefined,
          notes: notes.trim() || undefined
        });

    onSave(companyToSave);
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
          maxWidth: '680px',
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
              Company & Account Layer
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
              {initialCompany ? `Edit ${initialCompany.name}` : relationshipType === 'existing_client' ? 'Add Existing Client Account' : 'Add New Prospect'}
            </h3>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {validationError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '0.85rem', fontWeight: 600 }}>
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Relationship Type Segmented Toggle */}
          <div className="form-group">
            <label>Relationship Classification</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setRelationshipType('prospect')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${relationshipType === 'prospect' ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                  background: relationshipType === 'prospect' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                  color: relationshipType === 'prospect' ? 'var(--accent-text)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🎯 Prospect (Opportunity & Outreach)
              </button>

              <button
                type="button"
                onClick={() => setRelationshipType('existing_client')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${relationshipType === 'existing_client' ? 'var(--success-border)' : 'var(--border-strong)'}`,
                  background: relationshipType === 'existing_client' ? 'var(--success-bg)' : 'var(--bg-subtle)',
                  color: relationshipType === 'existing_client' ? 'var(--success-text)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🤝 Existing Client (Account Expansion)
              </button>
            </div>
          </div>

          {/* Company Core Identity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label>Company / Account Name *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Apex Roofing & Solar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Target Website URL *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="https://apexroofingexample.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label>Industry / Vertical</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Residential Roofing, Dental, B2B SaaS"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Location / Primary Service Area</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Austin Metroplex, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Existing Client Context */}
          {relationshipType === 'existing_client' && (
            <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🤝 Client Relationship Context
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem' }}>Client Since (Date)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={clientSince}
                    onChange={(e) => setClientSince(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.78rem' }}>Current Contract / Retainer Scope</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. $2,000/mo SEO & Maintenance Retainer"
                    value={engagementNotes}
                    onChange={(e) => setEngagementNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Primary Contact Details */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Primary Contact Person (Optional)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Contact Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Wayne Davis"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Role / Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Managing Partner / Owner"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="wayne@apexroofing.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="(512) 555-0199"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>LinkedIn URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://linkedin.com/in/waynedavis"
                  value={contactLinkedin}
                  onChange={(e) => setContactLinkedin(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* General Notes */}
          <div className="form-group">
            <label>General Background & Strategic Notes</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. High local referral volume, but aggressive local competitor just revamped their website."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
              <CheckCircle2 size={15} /> {initialCompany ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
