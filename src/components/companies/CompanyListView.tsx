import React, { useState, useEffect } from 'react';
import type { Company, CompanyWithStats, CompanyRelationshipType, MasterFramework } from '../../types';
import { companyRepository } from '../../services/repositories/companyRepository';
import { CompanyModal } from './CompanyModal';
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  User,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Archive,
  Edit2,
  Trash2,
  Calendar,
  FolderOpen
} from 'lucide-react';

interface CompanyListViewProps {
  framework: MasterFramework | null;
  onSelectCompany: (companyId: string) => void;
  onStartCompanyAnalysis: (company: Company) => void;
}

export const CompanyListView: React.FC<CompanyListViewProps> = ({
  framework,
  onSelectCompany,
  onStartCompanyAnalysis
}) => {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'prospect' | 'existing_client' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [createRelationshipDefault, setCreateRelationshipDefault] = useState<CompanyRelationshipType>('prospect');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const list = await companyRepository.getAllWithStats(true);
      setCompanies(list);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (companyToSave: Company) => {
    await companyRepository.save(companyToSave);
    await loadCompanies();
    setIsCreateModalOpen(false);
    setEditingCompany(null);
  };

  const handleArchiveToggle = async (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    if (company.isArchived) {
      await companyRepository.unarchive(company.id);
    } else {
      await companyRepository.archive(company.id);
    }
    await loadCompanies();
  };

  const handleDelete = async (companyId: string, companyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${companyName}" from your account directory? (Note: Historical audit records will be preserved).`)) {
      await companyRepository.delete(companyId);
      await loadCompanies();
    }
  };

  // Filter logic
  const activeCompanies = companies.filter(c => !c.isArchived);
  const archivedCompanies = companies.filter(c => c.isArchived);
  const prospectCount = activeCompanies.filter(c => c.relationshipType === 'prospect').length;
  const clientCount = activeCompanies.filter(c => c.relationshipType === 'existing_client').length;

  const filteredList = companies.filter(comp => {
    if (activeTab === 'archived') {
      if (!comp.isArchived) return false;
    } else {
      if (comp.isArchived) return false;
      if (activeTab === 'prospect' && comp.relationshipType !== 'prospect') return false;
      if (activeTab === 'existing_client' && comp.relationshipType !== 'existing_client') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = comp.name.toLowerCase().includes(q);
      const matchUrl = comp.websiteUrl?.toLowerCase().includes(q);
      const matchInd = comp.industry?.toLowerCase().includes(q);
      const matchLoc = comp.location?.toLowerCase().includes(q);
      const matchContact = comp.primaryContact?.name?.toLowerCase().includes(q);
      return matchName || matchUrl || matchInd || matchLoc || matchContact;
    }

    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading Companies Directory...</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Retrieving accounts and diagnostic history...</div>
      </div>
    );
  }

  return (
    <div className="view-container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
            Account & Relationship Layer
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            Companies Directory
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '680px', lineHeight: 1.45 }}>
            Manage prospective businesses you are evaluating and active clients you want to identify expansion opportunities for.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setCreateRelationshipDefault('prospect');
              setEditingCompany(null);
              setIsCreateModalOpen(true);
            }}
            style={{ gap: '6px' }}
          >
            <Plus size={15} /> Add Company
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="tabs-header" style={{ border: 'none', display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Active ({activeCompanies.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'prospect' ? 'active' : ''}`}
            onClick={() => setActiveTab('prospect')}
          >
            🎯 Prospects ({prospectCount})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'existing_client' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing_client')}
          >
            🤝 Existing Clients ({clientCount})
          </button>
          {archivedCompanies.length > 0 && (
            <button
              type="button"
              className={`tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              Archived ({archivedCompanies.length})
            </button>
          )}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search companies, URLs, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 ? (
        <div className="card" style={{ padding: '44px 24px', textAlign: 'center', background: 'var(--bg-subtle)' }}>
          <Building2 size={40} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {searchQuery ? 'No Matching Companies Found' : 'Start with a company'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '8px auto 20px', lineHeight: 1.45 }}>
            {searchQuery
              ? `No companies match "${searchQuery}". Try a different search term or clear the filter.`
              : "Add a prospect you're considering pitching or an existing client you want to evaluate for additional opportunities."}
          </p>

          {!searchQuery && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setCreateRelationshipDefault('prospect');
                  setEditingCompany(null);
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus size={15} /> Add Prospect
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCreateRelationshipDefault('existing_client');
                  setEditingCompany(null);
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus size={15} /> Add Existing Client
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredList.map((comp) => {
            const isClient = comp.relationshipType === 'existing_client';

            return (
              <div
                key={comp.id}
                className="card"
                onClick={() => onSelectCompany(comp.id)}
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: 'var(--bg-surface)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              >
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: isClient ? 'var(--success-bg)' : 'var(--accent-subtle)',
                        color: isClient ? 'var(--success-text)' : 'var(--accent-text)',
                        border: `1px solid ${isClient ? 'var(--success-border)' : 'var(--accent-border)'}`
                      }}
                    >
                      {isClient ? '🤝 Existing Client' : '🎯 Prospect'}
                    </span>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {comp.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {comp.websiteUrl && (
                      <span style={{ fontSize: '0.84rem', color: 'var(--accent-text)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <Globe size={13} /> {comp.websiteUrl.replace(/^https?:\/\//, '')}
                      </span>
                    )}

                    {comp.industry && (
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {comp.industry}
                      </span>
                    )}

                    {comp.location && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} /> {comp.location}
                      </span>
                    )}

                    {comp.primaryContact?.name && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <User size={12} /> {comp.primaryContact.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Diagnostic Stats & Quick Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Analyses / Audits
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {comp.analysesCount > 0 ? (
                        <span>
                          {comp.analysesCount} {comp.analysesCount === 1 ? 'Analysis' : 'Analyses'}
                          {comp.latestAuditScoreFormatted && (
                            <span style={{ color: 'var(--accent-text)', marginLeft: '6px' }}>
                              ({comp.latestAuditScoreFormatted})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>None yet</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectCompany(comp.id)}
                      style={{ gap: '4px' }}
                    >
                      View Account <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onStartCompanyAnalysis(comp)}
                      title="Run 30-check website diagnostic"
                      style={{ gap: '4px' }}
                    >
                      <Sparkles size={13} /> Analyze
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); setEditingCompany(comp); setIsCreateModalOpen(true); }}
                      title="Edit Company Details"
                      style={{ padding: '6px 8px' }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleArchiveToggle(comp, e)}
                      title={comp.isArchived ? 'Unarchive' : 'Archive'}
                      style={{ padding: '6px 8px', color: comp.isArchived ? 'var(--accent-text)' : 'var(--text-muted)' }}
                    >
                      <Archive size={13} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleDelete(comp.id, comp.name, e)}
                      title="Delete Company"
                      style={{ padding: '6px 8px', color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Company Modal */}
      {isCreateModalOpen && (
        <CompanyModal
          isOpen={true}
          onClose={() => { setIsCreateModalOpen(false); setEditingCompany(null); }}
          onSave={handleSaveCompany}
          initialCompany={editingCompany}
          defaultRelationship={createRelationshipDefault}
        />
      )}

    </div>
  );
};
