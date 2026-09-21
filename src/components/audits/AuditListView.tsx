import React, { useState } from 'react';
import type { Audit, MasterFramework } from '../../types';
import { calculateAuditScores } from '../../utils/scoreCalculator';
import { ScoreBadge } from '../common/ScoreBadge';
import {
  FolderOpen,
  PlusCircle,
  Search,
  Copy,
  Trash2,
  Eye,
  SlidersHorizontal,
  ArrowRight,
  Archive,
  RefreshCw,
  Send
} from 'lucide-react';

interface AuditListViewProps {
  audits: Audit[];
  framework: MasterFramework;
  onStartAudit: () => void;
  onOpenAudit: (auditId: string) => void;
  onOpenComposer: (auditId: string) => void;
  onOpenReport: (auditId: string) => void;
  onOpenTeaser?: (auditId: string) => void;
  onDuplicateAudit: (auditId: string) => Promise<void>;
  onDeleteAudit: (auditId: string) => Promise<void>;
  onUpdateStatus: (auditId: string, status: Audit['status']) => Promise<void>;
}

export const AuditListView: React.FC<AuditListViewProps> = ({
  audits,
  framework,
  onStartAudit,
  onOpenAudit,
  onOpenComposer,
  onOpenReport,
  onOpenTeaser,
  onDuplicateAudit,
  onDeleteAudit,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rescueFilter, setRescueFilter] = useState<string>('all');

  const filtered = audits.filter((audit) => {
    const scoreRes = calculateAuditScores(audit.scores, audit.frameworkSnapshot || framework);
    const matchesSearch =
      (audit.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (audit.websiteUrl || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (audit.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (audit.cityServiceArea || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    const matchesRescue = rescueFilter === 'all' || scoreRes.rescueLevel === rescueFilter;

    return matchesSearch && matchesStatus && matchesRescue;
  });

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <FolderOpen size={14} /> Audit Registry
          </div>
          <h1 className="page-title">Website Audits & Reports</h1>
          <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '6px' }}>
            Manage all customer evaluations, draft audits, client reports, and historical records.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={onStartAudit}>
          <PlusCircle size={15} /> New Audit
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by business, URL, industry, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            className="select"
            value={rescueFilter}
            onChange={(e) => setRescueFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Rescue Levels</option>
            <option value="Healthy">Healthy (51–60)</option>
            <option value="Medium Rescue">Medium Rescue (41–50)</option>
            <option value="High Rescue">High Rescue (26–40)</option>
            <option value="Critical Rescue">Critical Rescue (0–25)</option>
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Showing {filtered.length} of {audits.length}
        </span>
      </div>

      {/* Table List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audits match your filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Business</th>
                  <th style={{ padding: '14px 18px' }}>Website URL</th>
                  <th style={{ padding: '14px 18px' }}>Score</th>
                  <th style={{ padding: '14px 18px' }}>Rescue Level</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px' }}>Framework</th>
                  <th style={{ padding: '14px 18px' }}>Updated</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((audit) => {
                  const scoreRes = calculateAuditScores(audit.scores, audit.frameworkSnapshot || framework);

                  return (
                    <tr key={audit.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ cursor: 'pointer' }} onClick={() => onOpenAudit(audit.id)}>
                            {audit.businessName}
                          </span>
                          {audit.isDemo && <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>Demo</span>}
                        </div>
                        {audit.industry && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {audit.industry}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                          {audit.websiteUrl.replace(/^https?:\/\//, '')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px', fontWeight: 800 }}>
                        {scoreRes.scoreFormatted}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <ScoreBadge
                          score={scoreRes.totalScore}
                          maxScore={scoreRes.maxScore}
                          rescueLevel={scoreRes.rescueLevel}
                          size="sm"
                          showScore={false}
                        />
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <select
                          className="select"
                          value={audit.status}
                          onChange={(e) => onUpdateStatus(audit.id, e.target.value as any)}
                          style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                        >
                          <option value="Draft">Draft</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Ready">Ready</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        v{audit.frameworkVersion}
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(audit.updatedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenAudit(audit.id)}
                            title="Edit Evaluation"
                          >
                            Score
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenComposer(audit.id)}
                            title="Report Composer"
                          >
                            <SlidersHorizontal size={13} />
                          </button>
                          {onOpenTeaser && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenTeaser(audit.id)}
                              title="Prospecting Teaser"
                              style={{ borderColor: '#0f5b5c', color: '#0f5b5c', padding: '6px 9px' }}
                            >
                              <Send size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenReport(audit.id)}
                            title="View / Print Client Report"
                          >
                            <Eye size={13} /> Report
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onDuplicateAudit(audit.id)}
                            title="Duplicate Audit"
                            style={{ padding: '6px 8px' }}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (confirm(`Delete audit for "${audit.businessName}"?`)) {
                                onDeleteAudit(audit.id);
                              }
                            }}
                            title="Delete Audit"
                            style={{ padding: '6px 8px' }}
                          >
                            <Trash2 size={13} />
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
