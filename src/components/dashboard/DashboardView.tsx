import React from 'react';
import type { Audit, MasterFramework, Diagnosis } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';
import { calculateAuditScores } from '../../utils/scoreCalculator';
import { VALUE_LADDER_OFFERS } from '../../data/seedData';
import {
  PlayCircle,
  SlidersHorizontal,
  BookOpen,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  framework: MasterFramework;
  diagnoses: Diagnosis[];
  audits: Audit[];
  onStartAudit: () => void;
  onOpenFramework: () => void;
  onOpenDiagnosis: () => void;
  onOpenAudit: (auditId: string) => void;
  onOpenReport: (auditId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  framework,
  diagnoses,
  audits,
  onStartAudit,
  onOpenFramework,
  onOpenDiagnosis,
  onOpenAudit,
  onOpenReport
}) => {
  const activeChecksCount = framework.checks.filter(c => c.isActive).length;
  const activeDiagnosesCount = diagnoses.filter(d => d.isActive).length;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner / Headline */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          <Sparkles size={14} /> Master Website Rescue System
        </div>
        <h1 className="page-title">One framework. Every product.</h1>
        <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '8px' }}>
          Thirty checks across six categories become your audit, your checklist, your rescue kit and your sales funnel — all from the same scoring system.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-4">
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Checks in Framework
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {activeChecksCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            6 core evaluation categories
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Diagnosis Snippets
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {activeDiagnosesCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Many-to-many triggers mapped
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Audits Created
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {audits.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Saved client evaluations
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Products in Funnel
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            7
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Derived from single framework
          </div>
        </div>
      </div>

      {/* 3 Primary Action Cards */}
      <div className="grid-3">
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <PlayCircle size={22} />
            </div>
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Run a new audit</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Score a website against all 30 checks and generate the client report.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onStartAudit}>
            <PlusCircle size={15} /> Start audit
          </button>
        </div>

        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <SlidersHorizontal size={22} />
            </div>
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Manage the framework</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Edit the master checks every product is derived from.
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onOpenFramework}>
            <SlidersHorizontal size={15} /> Open framework
          </button>
        </div>

        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <BookOpen size={22} />
            </div>
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Diagnosis library</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              Manage the finding → why → recommendation → service mappings used by audits.
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onOpenDiagnosis}>
            <BookOpen size={15} /> Open library
          </button>
        </div>
      </div>

      {/* Internal Value Ladder */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 className="section-title">ContextMuse Product Value Ladder</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              All offers are derived from the 30-check diagnosis and presented contextually to clients.
            </p>
          </div>
          <span className="badge badge-accent">7 Tier Architecture</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {VALUE_LADDER_OFFERS.map((offer, idx) => (
            <div key={offer.id} className="ladder-item">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{idx + 1}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{offer.name}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {offer.tagline}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-neutral" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {offer.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 className="section-title">Recent Audits</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Saved client conversion evaluations and active reports
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onStartAudit}>
            <PlusCircle size={14} /> New Audit
          </button>
        </div>

        {audits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No audits created yet. Click "Start audit" to evaluate your first website.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 14px' }}>Business</th>
                  <th style={{ padding: '12px 14px' }}>URL</th>
                  <th style={{ padding: '12px 14px' }}>Score</th>
                  <th style={{ padding: '12px 14px' }}>Rescue Level</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => {
                  const scoreRes = calculateAuditScores(audit.scores, audit.frameworkSnapshot || framework);
                  let statusBadge = 'badge-neutral';
                  if (audit.status === 'Ready') statusBadge = 'badge-green';
                  else if (audit.status === 'Delivered') statusBadge = 'badge-accent';
                  else if (audit.status === 'In Progress') statusBadge = 'badge-amber';

                  return (
                    <tr key={audit.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{audit.businessName}</span>
                          {audit.isDemo && <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Demo</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                          {audit.websiteUrl.replace(/^https?:\/\//, '')}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 800 }}>
                        {scoreRes.scoreFormatted}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <ScoreBadge
                          score={scoreRes.totalScore}
                          maxScore={scoreRes.maxScore}
                          rescueLevel={scoreRes.rescueLevel}
                          size="sm"
                          showScore={false}
                        />
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${statusBadge}`}>{audit.status}</span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(audit.updatedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenAudit(audit.id)}
                          >
                            Open Audit
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenReport(audit.id)}
                          >
                            Report <ArrowRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
