import React, { useState, useEffect } from 'react';
import type {
  SellerProfile,
  ServiceOffering,
  ServiceCategory,
  SellerRole,
  ProofPoint,
  OutreachTonePreset
} from '../../types/sellerProfile';
import {
  SERVICE_CATEGORIES,
  SUGGESTED_CAPABILITY_TAGS
} from '../../types/sellerProfile';
import { sellerProfileRepository } from '../../services/repositories/sellerProfileRepository';
import {
  Building2,
  Briefcase,
  Ban,
  Target,
  Award,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Tag as TagIcon
} from 'lucide-react';

export const SellerProfileView: React.FC = () => {
  const [profile, setProfile] = useState<SellerProfile>(sellerProfileRepository.createDefault());
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'business' | 'services' | 'exclusions' | 'clients' | 'proof' | 'outreach'>('services');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Service Offering Modal / Form state
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Exclusion tag input state
  const [newExclusionInput, setNewExclusionInput] = useState('');

  // Proof Point Modal / Form state
  const [editingProofPoint, setEditingProofPoint] = useState<ProofPoint | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // Industry chip input state
  const [newIndustryInput, setNewIndustryInput] = useState('');
  const [newClientTypeInput, setNewClientTypeInput] = useState('');
  const [newPhraseToAvoidInput, setNewPhraseToAvoidInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const existing = await sellerProfileRepository.getActive();
      if (existing) {
        setProfile(existing);
      } else {
        const fresh = sellerProfileRepository.createDefault();
        setProfile(fresh);
      }
    } catch (err) {
      console.error('Failed to load seller profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // 1. Validation
    const errors: string[] = [];
    if (!profile.businessName.trim() && !profile.sellerName.trim()) {
      errors.push('Please provide your Business Name or Personal/Freelancer Name.');
    }
    if (profile.servicesOffered.length === 0) {
      errors.push('Please add at least one Service Offering so the system knows your capabilities.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    try {
      await sellerProfileRepository.save(profile);
      setSaveSuccess(true);
      setIsDirty(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setValidationErrors(['Database error: failed to save profile.']);
    }
  };

  // Service Offering Handlers
  const handleOpenNewService = () => {
    const newService: ServiceOffering = {
      id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      category: 'UX / Product',
      description: '',
      typicalPriceMin: undefined,
      typicalPriceMax: undefined,
      currency: 'USD',
      deliverableSummary: '',
      capabilityTags: [],
      order: profile.servicesOffered.length + 1
    };
    setEditingService(newService);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (serviceToSave: ServiceOffering) => {
    if (!serviceToSave.name.trim()) return;

    if (serviceToSave.typicalPriceMin !== undefined && serviceToSave.typicalPriceMax !== undefined) {
      if (serviceToSave.typicalPriceMax < serviceToSave.typicalPriceMin) {
        alert('Maximum price cannot be less than Minimum price.');
        return;
      }
    }

    const exists = profile.servicesOffered.some(s => s.id === serviceToSave.id);
    let updatedServices: ServiceOffering[];
    if (exists) {
      updatedServices = profile.servicesOffered.map(s => s.id === serviceToSave.id ? serviceToSave : s);
    } else {
      updatedServices = [...profile.servicesOffered, serviceToSave];
    }

    setProfile({ ...profile, servicesOffered: updatedServices });
    setIsDirty(true);
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    const updated = profile.servicesOffered.filter(s => s.id !== id);
    setProfile({ ...profile, servicesOffered: updated });
    setIsDirty(true);
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= profile.servicesOffered.length) return;

    const list = [...profile.servicesOffered];
    const [moved] = list.splice(index, 1);
    list.splice(newIndex, 0, moved);
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));

    setProfile({ ...profile, servicesOffered: reordered });
    setIsDirty(true);
  };

  // Exclusions Handlers
  const handleAddExclusion = (exclusion: string) => {
    const clean = exclusion.trim();
    if (!clean || profile.servicesNotOffered.includes(clean)) return;
    setProfile({ ...profile, servicesNotOffered: [...profile.servicesNotOffered, clean] });
    setIsDirty(true);
    setNewExclusionInput('');
  };

  const handleRemoveExclusion = (exclusion: string) => {
    setProfile({
      ...profile,
      servicesNotOffered: profile.servicesNotOffered.filter(e => e !== exclusion)
    });
    setIsDirty(true);
  };

  // Proof Points Handlers
  const handleOpenNewProof = () => {
    const newProof: ProofPoint = {
      id: `proof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: '',
      description: '',
      url: '',
      tags: [],
      order: profile.proofPoints.length + 1
    };
    setEditingProofPoint(newProof);
    setIsProofModalOpen(true);
  };

  const handleSaveProofPoint = (proof: ProofPoint) => {
    if (!proof.title.trim()) return;
    const exists = profile.proofPoints.some(p => p.id === proof.id);
    let updated: ProofPoint[];
    if (exists) {
      updated = profile.proofPoints.map(p => p.id === proof.id ? proof : p);
    } else {
      updated = [...profile.proofPoints, proof];
    }
    setProfile({ ...profile, proofPoints: updated });
    setIsDirty(true);
    setIsProofModalOpen(false);
    setEditingProofPoint(null);
  };

  const handleDeleteProofPoint = (id: string) => {
    setProfile({
      ...profile,
      proofPoints: profile.proofPoints.filter(p => p.id !== id)
    });
    setIsDirty(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading Capability Profile...</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Retrieving your business configuration from IndexedDB...</div>
      </div>
    );
  }

  const sections = [
    { id: 'business' as const, label: 'Your Business', icon: Building2, count: null },
    { id: 'services' as const, label: 'What You Sell', icon: Briefcase, count: profile.servicesOffered.length },
    { id: 'exclusions' as const, label: "What You Don't Sell", icon: Ban, count: profile.servicesNotOffered.length },
    { id: 'clients' as const, label: 'Best-Fit Clients', icon: Target, count: profile.idealClientProfile.preferredIndustries.length },
    { id: 'proof' as const, label: 'Proof & Differentiators', icon: Award, count: profile.proofPoints.length },
    { id: 'outreach' as const, label: 'Outreach Style', icon: MessageSquare, count: null }
  ];

  return (
    <div className="view-container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
              Opportunity Engine Core
            </span>
            {isDirty && (
              <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                Unsaved Changes
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            Seller Profile & Capability Store
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '720px', lineHeight: 1.45 }}>
            Define what you legitimately sell, what you explicitly avoid, and what results you can prove. 
            The system uses this profile to match business observations against your real capabilities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)', fontSize: '0.85rem', fontWeight: 700 }}>
              <CheckCircle2 size={16} /> Profile Saved
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveProfile}
            style={{ padding: '8px 18px', gap: '8px' }}
          >
            <Save size={15} /> Save Capability Profile
          </button>
        </div>
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', color: '#991b1b' }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> Please resolve the following before saving:
          </div>
          <ul style={{ margin: '6px 0 0 20px', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="card" style={{ padding: '6px', marginBottom: '24px', background: 'var(--bg-surface)' }}>
        <div className="tabs-header" style={{ border: 'none', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {sections.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 14px', fontSize: '0.86rem' }}
              >
                <Icon size={16} />
                <span>{s.label}</span>
                {s.count !== null && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {s.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: YOUR BUSINESS & POSITIONING
         ========================================================================= */}
      {activeSection === 'business' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Business Identity & Positioning</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Basic details about your consultancy, freelancing practice, or agency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Business / Agency / Practice Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Apex Digital Advisory, Sarah Jenkins Studio"
                value={profile.businessName}
                onChange={(e) => { setProfile({ ...profile, businessName: e.target.value }); setIsDirty(true); }}
              />
            </div>

            <div className="form-group">
              <label>Your Name (Owner / Primary Consultant) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Sarah Jenkins"
                value={profile.sellerName}
                onChange={(e) => { setProfile({ ...profile, sellerName: e.target.value }); setIsDirty(true); }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Website URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://yourwebsite.com"
                value={profile.websiteUrl || ''}
                onChange={(e) => { setProfile({ ...profile, websiteUrl: e.target.value }); setIsDirty(true); }}
              />
            </div>

            <div className="form-group">
              <label>Primary Role Model</label>
              <select
                className="form-control"
                value={profile.primaryRole}
                onChange={(e) => { setProfile({ ...profile, primaryRole: e.target.value as SellerRole }); setIsDirty(true); }}
              >
                <option value="freelancer">Freelancer / Independent Specialist</option>
                <option value="consultant">Consultant / Strategic Advisor</option>
                <option value="agency">Agency / Studio</option>
                <option value="developer">Developer / Technical Builder</option>
                <option value="designer">Designer / UX Specialist</option>
                <option value="builder">Product / Systems Builder</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Custom Positioning Title / Descriptor (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Senior Conversion Designer & B2B Funnel Strategist"
              value={profile.customRoleTitle || ''}
              onChange={(e) => { setProfile({ ...profile, customRoleTitle: e.target.value }); setIsDirty(true); }}
            />
          </div>

          <div className="form-group">
            <label>One-Sentence Value Proposition / Tagline (Optional)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. I help high-ticket trade contractors and home service businesses fix leaky websites and double booked inquiries."
              value={profile.tagline || ''}
              onChange={(e) => { setProfile({ ...profile, tagline: e.target.value }); setIsDirty(true); }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: WHAT YOU SELL (SERVICE OFFERINGS)
         ========================================================================= */}
      {activeSection === 'services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Service Offerings & Capabilities</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                The specific packages, projects, and retainers you legitimately provide to clients.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenNewService}
              style={{ gap: '6px' }}
            >
              <Plus size={15} /> Add Service Offering
            </button>
          </div>

          {/* Empty State */}
          {profile.servicesOffered.length === 0 ? (
            <div className="card" style={{ padding: '36px 24px', textAlign: 'center', background: 'var(--bg-subtle)' }}>
              <Briefcase size={36} style={{ margin: '0 auto 10px', color: 'var(--accent-primary)', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>No Service Offerings Added Yet</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '6px auto 16px', lineHeight: 1.45 }}>
                Tell the system what you actually sell so future website observations and business leaks can be matched against your real capabilities.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenNewService}
                style={{ margin: '0 auto' }}
              >
                <Plus size={15} /> Add Your First Service Offering
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.servicesOffered.map((srv, idx) => (
                <div
                  key={srv.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px 20px',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-accent" style={{ fontSize: '0.74rem' }}>
                        {srv.category}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {srv.name}
                      </h4>
                      {(srv.typicalPriceMin !== undefined || srv.typicalPriceMax !== undefined) && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-text)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                          {srv.typicalPriceMin ? `$${srv.typicalPriceMin.toLocaleString()}` : '$0'}
                          {srv.typicalPriceMax ? ` – $${srv.typicalPriceMax.toLocaleString()}` : '+'} {srv.currency}
                        </span>
                      )}
                    </div>

                    {srv.description && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                        {srv.description}
                      </p>
                    )}

                    {srv.deliverableSummary && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Deliverables:</strong> {srv.deliverableSummary}
                      </div>
                    )}

                    {/* Capability Tags */}
                    {srv.capabilityTags && srv.capabilityTags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {srv.capabilityTags.map(tag => (
                          <span
                            key={tag}
                            className="badge badge-neutral"
                            style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <TagIcon size={11} /> {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Reordering */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={idx === 0}
                        onClick={() => handleMoveService(idx, 'up')}
                        style={{ padding: '2px 6px' }}
                        title="Move Up"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={idx === profile.servicesOffered.length - 1}
                        onClick={() => handleMoveService(idx, 'down')}
                        style={{ padding: '2px 6px' }}
                        title="Move Down"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setEditingService(srv); setIsServiceModalOpen(true); }}
                      style={{ padding: '6px 10px', gap: '4px' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDeleteService(srv.id)}
                      style={{ padding: '6px 8px', color: 'var(--danger-text)' }}
                      title="Delete Service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 3: WHAT YOU DON'T SELL (EXPLICIT EXCLUSIONS)
         ========================================================================= */}
      {activeSection === 'exclusions' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Explicit Exclusions ("What I Do NOT Offer")</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
              Add services you explicitly do not provide (e.g. Paid Ads, Custom Mobile App Development, Cold Outbound Telemarketing). 
              The Opportunity Engine will actively avoid recommending pitches for problems requiring these skills.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. PPC / Facebook Ads, Complex Database Architecture, Video Production..."
              value={newExclusionInput}
              onChange={(e) => setNewExclusionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddExclusion(newExclusionInput);
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleAddExclusion(newExclusionInput)}
              style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}
            >
              <Plus size={15} /> Add Exclusion
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Common Quick-Add Exclusions:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'Paid Ads / PPC Management',
                'Custom iOS/Android Apps',
                'Organic Social Media Posting',
                'Cold Email Infrastructure',
                'Custom Backend APIs',
                '24/7 IT Support',
                'Print & Packaging Design',
                'Video & Motion Animation'
              ].filter(s => !profile.servicesNotOffered.includes(s)).map(preset => (
                <button
                  key={preset}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '14px' }}
                  onClick={() => handleAddExclusion(preset)}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Current Exclusions List */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Active Exclusions ({profile.servicesNotOffered.length}):
            </div>
            {profile.servicesNotOffered.length === 0 ? (
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No exclusions configured. All un-offered services will simply be treated as unlisted.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.servicesNotOffered.map(ex => (
                  <span
                    key={ex}
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)',
                      padding: '5px 10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Ban size={13} /> {ex}
                    <button
                      type="button"
                      onClick={() => handleRemoveExclusion(ex)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#991b1b', display: 'flex', alignItems: 'center' }}
                      title="Remove"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: BEST-FIT CLIENTS (IDEAL CLIENT PROFILE)
         ========================================================================= */}
      {activeSection === 'clients' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Ideal Client Profile & Deal Boundaries</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Help the Qualification Engine determine whether a prospect is commercial grade and worth pitching.
            </p>
          </div>

          {/* Preferred Industries */}
          <div className="form-group">
            <label>Preferred Industries & Verticals</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Roofing Contractors, B2B SaaS, Dental Practices, High-Ticket Trades..."
                value={newIndustryInput}
                onChange={(e) => setNewIndustryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newIndustryInput.trim() && !profile.idealClientProfile.preferredIndustries.includes(newIndustryInput.trim())) {
                      setProfile({
                        ...profile,
                        idealClientProfile: {
                          ...profile.idealClientProfile,
                          preferredIndustries: [...profile.idealClientProfile.preferredIndustries, newIndustryInput.trim()]
                        }
                      });
                      setNewIndustryInput('');
                      setIsDirty(true);
                    }
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (newIndustryInput.trim() && !profile.idealClientProfile.preferredIndustries.includes(newIndustryInput.trim())) {
                    setProfile({
                      ...profile,
                      idealClientProfile: {
                        ...profile.idealClientProfile,
                        preferredIndustries: [...profile.idealClientProfile.preferredIndustries, newIndustryInput.trim()]
                      }
                    });
                    setNewIndustryInput('');
                    setIsDirty(true);
                  }
                }}
              >
                Add Industry
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.idealClientProfile.preferredIndustries.map(ind => (
                <span key={ind} className="badge badge-accent" style={{ fontSize: '0.78rem', padding: '4px 9px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {ind}
                  <X
                    size={13}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setProfile({
                        ...profile,
                        idealClientProfile: {
                          ...profile.idealClientProfile,
                          preferredIndustries: profile.idealClientProfile.preferredIndustries.filter(i => i !== ind)
                        }
                      });
                      setIsDirty(true);
                    }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Budget & Engagement Thresholds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Minimum Worthwhile Project Budget (USD)</label>
              <input
                type="number"
                min="0"
                step="100"
                className="form-control"
                placeholder="e.g. 1500"
                value={profile.idealClientProfile.minProjectBudget ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                  setProfile({
                    ...profile,
                    idealClientProfile: { ...profile.idealClientProfile, minProjectBudget: val }
                  });
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="form-group">
              <label>Ideal Project Scope / Size</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. $2,500 – $7,500 standalone rescue or $2,000/mo retainer"
                value={profile.idealClientProfile.idealProjectSize || ''}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    idealClientProfile: { ...profile.idealClientProfile, idealProjectSize: e.target.value }
                  });
                  setIsDirty(true);
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Geographic Territory / Service Area Preferences</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. United States (English speaking), Texas / Sunbelt Metroplexes, Nationwide B2B"
              value={profile.idealClientProfile.geographicPreferences || ''}
              onChange={(e) => {
                setProfile({
                  ...profile,
                  idealClientProfile: { ...profile.idealClientProfile, geographicPreferences: e.target.value }
                });
                setIsDirty(true);
              }}
            />
          </div>

          <div className="form-group">
            <label>Engagement / Qualification Notes</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Prefer established companies doing $500k+ with existing traffic/leads over brand-new pre-revenue startups."
              value={profile.idealClientProfile.engagementNotes || ''}
              onChange={(e) => {
                setProfile({
                  ...profile,
                  idealClientProfile: { ...profile.idealClientProfile, engagementNotes: e.target.value }
                });
                setIsDirty(true);
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: PROOF & DIFFERENTIATORS
         ========================================================================= */}
      {activeSection === 'proof' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Proof Points & Differentiators</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Case studies, quantifiable metrics, and specific expertise the system can legitimately weave into outreach.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenNewProof}
              style={{ gap: '6px' }}
            >
              <Plus size={15} /> Add Proof Point
            </button>
          </div>

          {profile.proofPoints.length === 0 ? (
            <div className="card" style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--bg-subtle)' }}>
              <Award size={34} style={{ margin: '0 auto 8px', color: 'var(--accent-primary)', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>No Proof Points Added Yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '4px auto 14px', lineHeight: 1.45 }}>
                Add your real case studies and outcomes. Future outreach will only cite evidence you've actually supplied here.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleOpenNewProof}
                style={{ margin: '0 auto' }}
              >
                <Plus size={14} /> Add First Case Study or Metric
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {profile.proofPoints.map(pp => (
                <div key={pp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', background: 'var(--bg-surface)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pp.title}</h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                      {pp.description}
                    </p>
                    {pp.url && (
                      <a
                        href={pp.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.78rem', color: 'var(--accent-text)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}
                      >
                        <ExternalLink size={12} /> View Case Study Link
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setEditingProofPoint(pp); setIsProofModalOpen(true); }}
                      style={{ padding: '4px 8px' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDeleteProofPoint(pp.id)}
                      style={{ padding: '4px 8px', color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 6: OUTREACH STYLE & TONE
         ========================================================================= */}
      {activeSection === 'outreach' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Outreach & Conversation Style</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              How future outreach emails, LinkedIn messages, and conversation scripts should sound.
            </p>
          </div>

          <div className="form-group">
            <label>Tone & Voice Preset</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '4px' }}>
              {[
                { id: 'direct_consultative', title: 'Direct & Consultative', desc: 'Insight-led, trade-professional, avoids fluff or generic praise.' },
                { id: 'peer_specialist', title: 'Peer Specialist', desc: 'Technical & experienced, speaks as an equal industry peer.' },
                { id: 'plainspoken_operator', title: 'Plainspoken Operator', desc: 'Down-to-earth, simple language, focuses entirely on practical business friction.' },
                { id: 'warm_strategic', title: 'Warm & Strategic', desc: 'Encouraging, high-empathy, focuses on growth opportunities.' },
                { id: 'custom', title: 'Custom Instructions', desc: 'Provide your own exact voice and stylistic rules.' }
              ].map(t => {
                const isSelected = profile.outreachPreferences.tonePreset === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setProfile({
                        ...profile,
                        outreachPreferences: { ...profile.outreachPreferences, tonePreset: t.id as OutreachTonePreset }
                      });
                      setIsDirty(true);
                    }}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                      {t.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {profile.outreachPreferences.tonePreset === 'custom' && (
            <div className="form-group">
              <label>Custom Tone Instructions</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. Write in concise 3-sentence paragraphs, use active voice, and mention Texas local market realities."
                value={profile.outreachPreferences.customToneGuidance || ''}
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    outreachPreferences: { ...profile.outreachPreferences, customToneGuidance: e.target.value }
                  });
                  setIsDirty(true);
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label>Preferred Call to Action (CTA) Style</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Low-pressure 10-minute diagnostic walkthrough or 1-page visual teardown"
              value={profile.outreachPreferences.preferredCtaStyle || ''}
              onChange={(e) => {
                setProfile({
                  ...profile,
                  outreachPreferences: { ...profile.outreachPreferences, preferredCtaStyle: e.target.value }
                });
                setIsDirty(true);
              }}
            />
          </div>

          <div className="form-group">
            <label>Phrases / AI Clichés to Explicitly Avoid</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 'Hope this email finds you well', 'Synergy', 'Game-changer'..."
                value={newPhraseToAvoidInput}
                onChange={(e) => setNewPhraseToAvoidInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newPhraseToAvoidInput.trim() && !profile.outreachPreferences.phrasesToAvoid.includes(newPhraseToAvoidInput.trim())) {
                      setProfile({
                        ...profile,
                        outreachPreferences: {
                          ...profile.outreachPreferences,
                          phrasesToAvoid: [...profile.outreachPreferences.phrasesToAvoid, newPhraseToAvoidInput.trim()]
                        }
                      });
                      setNewPhraseToAvoidInput('');
                      setIsDirty(true);
                    }
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (newPhraseToAvoidInput.trim() && !profile.outreachPreferences.phrasesToAvoid.includes(newPhraseToAvoidInput.trim())) {
                    setProfile({
                      ...profile,
                      outreachPreferences: {
                        ...profile.outreachPreferences,
                        phrasesToAvoid: [...profile.outreachPreferences.phrasesToAvoid, newPhraseToAvoidInput.trim()]
                      }
                    });
                    setNewPhraseToAvoidInput('');
                    setIsDirty(true);
                  }
                }}
              >
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.outreachPreferences.phrasesToAvoid.map(phr => (
                <span key={phr} className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  "{phr}"
                  <X
                    size={13}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setProfile({
                        ...profile,
                        outreachPreferences: {
                          ...profile.outreachPreferences,
                          phrasesToAvoid: profile.outreachPreferences.phrasesToAvoid.filter(p => p !== phr)
                        }
                      });
                      setIsDirty(true);
                    }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SERVICE OFFERING MODAL
         ========================================================================= */}
      {isServiceModalOpen && editingService && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
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
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {profile.servicesOffered.some(s => s.id === editingService.id) ? 'Edit Service Offering' : 'New Service Offering'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setIsServiceModalOpen(false); setEditingService(null); }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Service / Package Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 48-Hour Homepage Conversion Rescue, Full Website Rebuild"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label>Primary Category</label>
                  <select
                    className="form-control"
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}
                  >
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Typical Min Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-control"
                    placeholder="e.g. 1500"
                    value={editingService.typicalPriceMin ?? ''}
                    onChange={(e) => setEditingService({ ...editingService, typicalPriceMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>

                <div className="form-group">
                  <label>Typical Max Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-control"
                    placeholder="e.g. 4500"
                    value={editingService.typicalPriceMax ?? ''}
                    onChange={(e) => setEditingService({ ...editingService, typicalPriceMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description & Scope of the Service</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Complete redesign of above-the-fold hero messaging, lead form streamlining, and trust proof integration."
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Deliverables Summary</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Wireframes, Figma mockups, production HTML/CSS, live deployment"
                  value={editingService.deliverableSummary}
                  onChange={(e) => setEditingService({ ...editingService, deliverableSummary: e.target.value })}
                />
              </div>

              {/* Capability Tags Selector */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Capability Tags (Used for Automated Matching)</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to toggle</span>
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                  {SUGGESTED_CAPABILITY_TAGS.map(tag => {
                    const isSelected = editingService.capabilityTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? editingService.capabilityTags.filter(t => t !== tag.id)
                            : [...editingService.capabilityTags, tag.id];
                          setEditingService({ ...editingService, capabilityTags: updated });
                        }}
                        style={{
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag.label}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Tag */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add custom capability tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const normalized = customTagInput.trim().toLowerCase().replace(/\s+/g, '_');
                        if (normalized && !editingService.capabilityTags.includes(normalized)) {
                          setEditingService({ ...editingService, capabilityTags: [...editingService.capabilityTags, normalized] });
                          setCustomTagInput('');
                        }
                      }
                    }}
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const normalized = customTagInput.trim().toLowerCase().replace(/\s+/g, '_');
                      if (normalized && !editingService.capabilityTags.includes(normalized)) {
                        setEditingService({ ...editingService, capabilityTags: [...editingService.capabilityTags, normalized] });
                        setCustomTagInput('');
                      }
                    }}
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setIsServiceModalOpen(false); setEditingService(null); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSaveService(editingService)}
              >
                Save Offering
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PROOF POINT MODAL
         ========================================================================= */}
      {isProofModalOpen && editingProofPoint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--bg-surface)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {profile.proofPoints.some(p => p.id === editingProofPoint.id) ? 'Edit Proof Point' : 'Add Proof Point'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setIsProofModalOpen(false); setEditingProofPoint(null); }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Title / Headline Metric *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +142% Inbound Calls for Austin Commercial Roofing Client"
                  value={editingProofPoint.title}
                  onChange={(e) => setEditingProofPoint({ ...editingProofPoint, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Brief Narrative Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Replaced a 9-field generic contact form with an instant 3-step quote estimator and placed direct click-to-call buttons in the mobile header."
                  value={editingProofPoint.description}
                  onChange={(e) => setEditingProofPoint({ ...editingProofPoint, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Case Study / Portfolio URL (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://yourportfolio.com/case-study-roofing"
                  value={editingProofPoint.url || ''}
                  onChange={(e) => setEditingProofPoint({ ...editingProofPoint, url: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setIsProofModalOpen(false); setEditingProofPoint(null); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSaveProofPoint(editingProofPoint)}
              >
                Save Proof Point
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
