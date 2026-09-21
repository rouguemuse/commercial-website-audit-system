import React, { useState, useEffect } from 'react';
import type { Company, CompanyAnalysis, Audit, MasterFramework, Diagnosis, AuditAsset } from '../../types';
import { companyRepository } from '../../services/repositories/companyRepository';
import { companyAnalysisRepository } from '../../services/repositories/companyAnalysisRepository';
import { auditRepository } from '../../services/repositories/auditRepository';
import { diagnosisRepository } from '../../services/repositories/diagnosisRepository';
import { assetRepository } from '../../services/repositories/assetRepository';
import { CompanyModal } from './CompanyModal';
import { OpportunityReviewSection } from '../opportunities/OpportunityReviewSection';
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Edit2,
  Archive,
  RefreshCw,
  FolderOpen,
  FileText,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Target
} from 'lucide-react';

interface CompanyDetailViewProps {
  companyId: string;
  framework: MasterFramework | null;
  onBack: () => void;
  onStartCompanyAnalysis: (company: Company) => void;
  onOpenAudit: (auditId: string) => void;
  onOpenReport: (auditId: string) => void;
  onOpenTeaser?: (auditId: string) => void;
}

export const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({
  companyId,
  framework,
  onBack,
  onStartCompanyAnalysis,
  onOpenAudit,
  onOpenReport,
  onOpenTeaser
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [analyses, setAnalyses] = useState<CompanyAnalysis[]>([]);
  const [linkedAudits, setLinkedAudits] = useState<Record<string, Audit>>({});
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const allDiags = await diagnosisRepository.getAll();
      setDiagnoses(allDiags);

      const comp = await companyRepository.getById(companyId);
      if (comp) {
        setCompany(comp);
        const compAnalyses = await companyAnalysisRepository.getByCompanyId(companyId);
        setAnalyses(compAnalyses);

        if (compAnalyses.length > 0) {
          setSelectedAnalysisId(compAnalyses[0].id);
        }

        // Fetch linked audits
        const auditMap: Record<string, Audit> = {};
        for (const ana of compAnalyses) {
          if (ana.auditId) {
            const aud = await auditRepository.getById(ana.auditId);
            if (aud) {
              auditMap[ana.auditId] = aud;
            }
          }
        }
        setLinkedAudits(auditMap);
      }
    } catch (err) {
      console.error('Failed to load company detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRelationship = async () => {
    if (!company) return;
    const targetType = company.relationshipType === 'prospect' ? 'existing_client' : 'prospect';
    await companyRepository.updateRelationship(company.id, targetType);
    setCompany({ ...company, relationshipType: targetType });
  };

  const handleSaveEditedCompany = async (updated: Company) => {
    await companyRepository.save(updated);
    setCompany(updated);
    setIsEditModalOpen(false);
  };

  const handleArchiveToggle = async () => {
    if (!company) return;
    if (company.isArchived) {
      await companyRepository.unarchive(company.id);
      setCompany({ ...company, isArchived: false });
    } else {
      await companyRepository.archive(company.id);
      setCompany({ ...company, isArchived: true });
    }
  };

  if (loading || !company) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading Account Profile...</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Retrieving company data and diagnostic history...</div>
      </div>
    );
  }

  const isClient = company.relationshipType === 'existing_client';
  const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId) || analyses[0];

  return (
    <div className="view-container" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Top Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={14} /> Back to Companies Directory
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleToggleRelationship}
            style={{ gap: '6px' }}
          >
            {isClient ? 'Convert to Prospect' : 'Promote to Existing Client 🤝'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsEditModalOpen(true)}
            style={{ gap: '4px' }}
          >
            <Edit2 size={13} /> Edit Account
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleArchiveToggle}
            style={{ gap: '4px', color: company.isArchived ? 'var(--accent-text)' : 'var(--text-muted)' }}
          >
            <Archive size={13} /> {company.isArchived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      </div>

      {/* Main Company Header Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  backgroundColor: isClient ? 'var(--success-bg)' : 'var(--accent-subtle)',
                  color: isClient ? 'var(--success-text)' : 'var(--accent-text)',
                  border: `1px solid ${isClient ? 'var(--success-border)' : 'var(--accent-border)'}`
                }}
              >
                {isClient ? '🤝 Existing Client' : '🎯 Prospect'}
              </span>

              {company.isArchived && (
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  Archived
                </span>
              )}

              {company.industry && (
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  {company.industry}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
              {company.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
              {company.websiteUrl && (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', color: 'var(--accent-text)', fontWeight: 600 }}
                >
                  <Globe size={14} /> {company.websiteUrl.replace(/^https?:\/\//, '')} <ExternalLink size={12} />
                </a>
              )}

              {company.location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} /> {company.location}
                </span>
              )}

              {isClient && company.clientSince && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--success-text)' }}>
                  <Calendar size={13} /> Client since {company.clientSince}
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onStartCompanyAnalysis(company)}
              style={{ padding: '10px 20px', fontSize: '0.92rem', gap: '8px', boxShadow: 'var(--shadow-md)' }}
            >
              <Sparkles size={16} /> Analyze Company
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Launches 30-Check Diagnostic Engine
            </div>
          </div>
        </div>

        {/* Existing Client Engagement Summary or Notes */}
        {(company.engagementNotes || company.notes) && (
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {company.engagementNotes && (
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Current Retainer / Engagement Scope:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {company.engagementNotes}
                </div>
              </div>
            )}

            {company.notes && (
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Background & Account Notes:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {company.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Contact Details */}
        {company.primaryContact?.name && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Primary Contact:
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {company.primaryContact.name} {company.primaryContact.title && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({company.primaryContact.title})</span>}
            </div>
            {company.primaryContact.email && (
              <a href={`mailto:${company.primaryContact.email}`} style={{ fontSize: '0.82rem', color: 'var(--accent-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={13} /> {company.primaryContact.email}
              </a>
            )}
            {company.primaryContact.phone && (
              <a href={`tel:${company.primaryContact.phone}`} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} /> {company.primaryContact.phone}
              </a>
            )}
            {company.primaryContact.linkedinUrl && (
              <a href={company.primaryContact.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={13} /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Analysis History Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Analysis & Diagnostic History</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Historical website diagnostic evaluations and opportunity scans for {company.name}.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onStartCompanyAnalysis(company)}
            style={{ gap: '6px' }}
          >
            <Plus size={14} /> New Analysis
          </button>
        </div>

        {analyses.length === 0 ? (
          <div className="card" style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--bg-subtle)' }}>
            <Sparkles size={34} style={{ margin: '0 auto 8px', color: 'var(--accent-primary)', opacity: 0.8 }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>No Analyses Yet</h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '4px auto 16px', lineHeight: 1.45 }}>
              Analyze this company to capture live website evidence and establish a diagnostic baseline for future opportunity matching.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onStartCompanyAnalysis(company)}
              style={{ margin: '0 auto' }}
            >
              <Sparkles size={15} /> Analyze Company Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analyses.map((ana) => {
              const audit = ana.auditId ? linkedAudits[ana.auditId] : undefined;
              
              // Score calculation
              let scoreSum = 0;
              let scoredCount = 0;
              if (audit?.scores) {
                Object.values(audit.scores).forEach(s => {
                  if (typeof s.score === 'number') {
                    scoreSum += s.score;
                    scoredCount++;
                  }
                });
              }

              return (
                <div
                  key={ana.id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-accent" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        {ana.status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Created {new Date(ana.createdAt).toLocaleDateString()} at {new Date(ana.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {audit ? (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          30-Check Diagnostic Audit
                        </div>
                        {scoredCount > 0 && (
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-text)', background: 'var(--accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                            Score: {scoreSum} / 60
                          </span>
                        )}
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                          Status: {audit.status}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        Pending audit execution
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {ana.auditId ? (
                      <>
                        <button
                          type="button"
                          className={`btn btn-sm ${selectedAnalysisId === ana.id ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setSelectedAnalysisId(ana.id)}
                          style={{ gap: '4px' }}
                        >
                          <Target size={13} /> Opportunities
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenAudit(ana.auditId!)}
                          style={{ gap: '4px' }}
                        >
                          <FolderOpen size={13} /> Open Audit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenReport(ana.auditId!)}
                          style={{ gap: '4px' }}
                        >
                          <FileText size={13} /> Client Report
                        </button>
                        {onOpenTeaser && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenTeaser(ana.auditId!)}
                            style={{ gap: '4px' }}
                          >
                            <TrendingUp size={13} /> Prospect Teaser
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onStartCompanyAnalysis(company)}
                      >
                        Resume Analysis
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grounded Opportunity Review Section */}
      {selectedAnalysis && selectedAnalysis.auditId && linkedAudits[selectedAnalysis.auditId] && (
        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '2px solid var(--border-subtle)' }}>
          <OpportunityReviewSection
            company={company}
            companyAnalysis={selectedAnalysis}
            audit={linkedAudits[selectedAnalysis.auditId]}
            framework={framework}
            diagnoses={diagnoses}
            onOpenAudit={onOpenAudit}
            onOpenReport={onOpenReport}
          />
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && (
        <CompanyModal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEditedCompany}
          initialCompany={company}
        />
      )}

    </div>
  );
};
