import React, { useState, useEffect } from 'react';
import type {
  Company,
  CompanyAnalysis,
  Audit,
  MasterFramework,
  Diagnosis,
  AuditAsset,
  SellerProfile,
  SellerFit,
  QualificationScore,
  CompanyQualificationSummary,
  ActionRecommendation,
  CompanyActionPlan
} from '../../types';
import type { Opportunity, OpportunityStatus } from '../../types/opportunity';
import { opportunityRepository } from '../../services/repositories/opportunityRepository';
import { sellerProfileRepository } from '../../services/repositories/sellerProfileRepository';
import { sellerFitRepository } from '../../services/repositories/sellerFitRepository';
import { qualificationRepository } from '../../services/repositories/qualificationRepository';
import { actionRecommendationRepository } from '../../services/repositories/actionRecommendationRepository';
import { OpportunityDetectionService } from '../../services/opportunityDetectionService';
import { SellerFitEngine } from '../../services/sellerFitEngine';
import { QualificationEngine } from '../../services/qualificationEngine';
import { ActionRecommendationEngine } from '../../services/actionRecommendationEngine';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityEditModal } from './OpportunityEditModal';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  Filter,
  Plus,
  Target,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Share2,
  Send,
  Zap
} from 'lucide-react';

interface OpportunityReviewSectionProps {
  company: Company;
  companyAnalysis: CompanyAnalysis;
  audit: Audit;
  framework?: MasterFramework | null;
  diagnoses?: Diagnosis[];
  assets?: AuditAsset[];
  onOpenAudit?: (auditId: string) => void;
  onOpenReport?: (auditId: string) => void;
}

export const OpportunityReviewSection: React.FC<OpportunityReviewSectionProps> = ({
  company,
  companyAnalysis,
  audit,
  framework,
  diagnoses = [],
  assets = [],
  onOpenAudit,
  onOpenReport
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [sellerFits, setSellerFits] = useState<Record<string, SellerFit>>({});
  const [qualificationScores, setQualificationScores] = useState<Record<string, QualificationScore>>({});
  const [actionRecommendations, setActionRecommendations] = useState<Record<string, ActionRecommendation>>({});
  const [summary, setSummary] = useState<CompanyQualificationSummary | null>(null);
  const [actionPlan, setActionPlan] = useState<CompanyActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'outreach' | 'pursue' | 'explore' | 'refer_out' | 'high_impact' | 'needs_review' | 'rejected'>('all');
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    loadAllData();
  }, [companyAnalysis.id]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Load active seller profile
      const profile = await sellerProfileRepository.getActive();
      setSellerProfile(profile || null);

      // 2. Load opportunities
      let oppList = await opportunityRepository.getByCompanyAnalysisId(companyAnalysis.id);

      // Auto-run detection if no opportunities saved yet and audit has scores
      if (oppList.length === 0 && audit.scores && Object.keys(audit.scores).length > 0) {
        const detectionResult = OpportunityDetectionService.detectOpportunities(
          companyAnalysis,
          audit,
          framework,
          diagnoses,
          assets
        );
        if (detectionResult.opportunities.length > 0) {
          await opportunityRepository.bulkSave(detectionResult.opportunities);
          oppList = detectionResult.opportunities;
        }
      }

      setOpportunities(oppList);

      // 3. Evaluate Seller Fit, Qualification, and Action Recommendations if profile exists
      if (profile && oppList.length > 0) {
        const fits = SellerFitEngine.evaluateAllOpportunities(oppList, profile, companyAnalysis.id);
        const { qualificationScores: qScores, summary: qSummary } = QualificationEngine.qualifyAllAndSummarize(
          oppList,
          fits,
          profile,
          company,
          companyAnalysis.id
        );

        const { recommendations: recs, actionPlan: plan } = ActionRecommendationEngine.generateCompanyActionPlan(
          oppList,
          fits,
          qScores,
          company,
          profile,
          companyAnalysis.id
        );

        await sellerFitRepository.bulkSave(fits);
        await qualificationRepository.bulkSave(qScores);
        await actionRecommendationRepository.bulkSave(recs);

        const fitMap: Record<string, SellerFit> = {};
        fits.forEach(f => { fitMap[f.opportunityId] = f; });
        setSellerFits(fitMap);

        const qMap: Record<string, QualificationScore> = {};
        qScores.forEach(q => { qMap[q.opportunityId] = q; });
        setQualificationScores(qMap);

        const recMap: Record<string, ActionRecommendation> = {};
        recs.forEach(r => { recMap[r.opportunityId] = r; });
        setActionRecommendations(recMap);

        setSummary(qSummary);
        setActionPlan(plan);
      }
    } catch (err) {
      console.error('Failed to load opportunities, qualifications, and action plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReevaluate = async () => {
    setIsEvaluating(true);
    try {
      const detectionResult = OpportunityDetectionService.detectOpportunities(
        companyAnalysis,
        audit,
        framework,
        diagnoses,
        assets
      );

      if (detectionResult.opportunities.length > 0) {
        await opportunityRepository.bulkSave(detectionResult.opportunities);
      }
      setOpportunities(detectionResult.opportunities);

      if (sellerProfile && detectionResult.opportunities.length > 0) {
        const fits = SellerFitEngine.evaluateAllOpportunities(detectionResult.opportunities, sellerProfile, companyAnalysis.id);
        const { qualificationScores: qScores, summary: qSummary } = QualificationEngine.qualifyAllAndSummarize(
          detectionResult.opportunities,
          fits,
          sellerProfile,
          company,
          companyAnalysis.id
        );

        const { recommendations: recs, actionPlan: plan } = ActionRecommendationEngine.generateCompanyActionPlan(
          detectionResult.opportunities,
          fits,
          qScores,
          company,
          sellerProfile,
          companyAnalysis.id
        );

        await sellerFitRepository.bulkSave(fits);
        await qualificationRepository.bulkSave(qScores);
        await actionRecommendationRepository.bulkSave(recs);

        const fitMap: Record<string, SellerFit> = {};
        fits.forEach(f => { fitMap[f.opportunityId] = f; });
        setSellerFits(fitMap);

        const qMap: Record<string, QualificationScore> = {};
        qScores.forEach(q => { qMap[q.opportunityId] = q; });
        setQualificationScores(qMap);

        const recMap: Record<string, ActionRecommendation> = {};
        recs.forEach(r => { recMap[r.opportunityId] = r; });
        setActionRecommendations(recMap);

        setSummary(qSummary);
        setActionPlan(plan);
      }
    } catch (err) {
      console.error('Error re-evaluating opportunities and action plan:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: OpportunityStatus) => {
    await opportunityRepository.updateStatus(id, status);
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  };

  const handleSaveEdited = async (updated: Opportunity) => {
    await opportunityRepository.save(updated);
    setOpportunities(prev => prev.map(o => o.id === updated.id ? updated : o));
    setEditingOpportunity(null);

    // Re-evaluate fit, qualification, and recommendation for edited opportunity
    if (sellerProfile) {
      const updatedFit = SellerFitEngine.evaluateOpportunityFit(updated, sellerProfile, companyAnalysis.id);
      const updatedQual = QualificationEngine.qualifyOpportunity(updated, updatedFit, sellerProfile, company, companyAnalysis.id);
      const updatedAction = ActionRecommendationEngine.generateRecommendation(
        updated,
        updatedFit,
        updatedQual,
        company,
        sellerProfile,
        companyAnalysis.id
      );

      await sellerFitRepository.save(updatedFit);
      await qualificationRepository.save(updatedQual);
      await actionRecommendationRepository.save(updatedAction);

      setSellerFits(prev => ({ ...prev, [updated.id]: updatedFit }));
      setQualificationScores(prev => ({ ...prev, [updated.id]: updatedQual }));
      setActionRecommendations(prev => ({ ...prev, [updated.id]: updatedAction }));
    }
  };

  // Counts for tabs
  const outreachCount = opportunities.filter(o => {
    const act = actionRecommendations[o.id]?.recommendedAction;
    return (act === 'OUTREACH' || act === 'EXISTING_CLIENT_EXPANSION') && o.status !== 'rejected';
  }).length;
  const pursueCount = opportunities.filter(o => qualificationScores[o.id]?.verdict === 'PURSUE' && o.status !== 'rejected').length;
  const exploreCount = opportunities.filter(o => qualificationScores[o.id]?.verdict === 'WORTH_EXPLORING' && o.status !== 'rejected').length;
  const referOutCount = opportunities.filter(o => qualificationScores[o.id]?.verdict === 'REFER_OUT' && o.status !== 'rejected').length;
  const needsReviewCount = opportunities.filter(o => o.status === 'needs_review').length;
  const rejectedCount = opportunities.filter(o => o.status === 'rejected').length;
  const highImpactCount = opportunities.filter(o => o.estimatedImpact === 'high' && o.status !== 'rejected').length;

  const filteredOpportunities = opportunities.filter(o => {
    const qual = qualificationScores[o.id];
    const act = actionRecommendations[o.id];
    if (activeTab === 'outreach') return (act?.recommendedAction === 'OUTREACH' || act?.recommendedAction === 'EXISTING_CLIENT_EXPANSION') && o.status !== 'rejected';
    if (activeTab === 'pursue') return qual?.verdict === 'PURSUE' && o.status !== 'rejected';
    if (activeTab === 'explore') return qual?.verdict === 'WORTH_EXPLORING' && o.status !== 'rejected';
    if (activeTab === 'refer_out') return qual?.verdict === 'REFER_OUT' && o.status !== 'rejected';
    if (activeTab === 'needs_review') return o.status === 'needs_review';
    if (activeTab === 'high_impact') return o.estimatedImpact === 'high' && o.status !== 'rejected';
    if (activeTab === 'rejected') return o.status === 'rejected';
    return o.status !== 'rejected' && o.status !== 'archived';
  });

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Evaluating evidence, seller capability fit, and action intelligence...
      </div>
    );
  }

  // Action Plan Styling
  const firstActionColors: Record<string, { bg: string; color: string; border: string }> = {
    OUTREACH: { bg: 'var(--success-bg)', color: 'var(--success-text)', border: 'var(--success-border)' },
    EXISTING_CLIENT_EXPANSION: { bg: 'var(--success-bg)', color: 'var(--success-text)', border: 'var(--success-border)' },
    EXPLORE: { bg: 'var(--accent-subtle)', color: 'var(--accent-text)', border: 'var(--accent-border)' },
    REFER: { bg: '#fdf4ff', color: '#86198f', border: '#f5d0fe' },
    MONITOR: { bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
    NO_ACTION: { bg: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger-text)', border: 'rgba(239, 68, 68, 0.25)' }
  };

  const currentActionColor = actionPlan ? firstActionColors[actionPlan.recommendedFirstAction] || firstActionColors.NO_ACTION : firstActionColors.NO_ACTION;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-text)', letterSpacing: '0.04em' }}>
              Stage 3C • Action & Outreach Intelligence
            </span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Opportunities & Action Intelligence
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '640px', lineHeight: 1.45 }}>
            Evidence-grounded commercial opportunities, capability matching, and defensible outreach recommendations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleReevaluate}
          disabled={isEvaluating}
          style={{ gap: '6px' }}
        >
          <RefreshCw size={14} className={isEvaluating ? 'animate-spin' : ''} />
          {isEvaluating ? 'Evaluating Match...' : 'Re-evaluate Match & Action Plan'}
        </button>
      </div>

      {/* Stage 3C: Company Action Plan & Qualification Summary Banner */}
      {actionPlan && opportunities.length > 0 && (
        <div
          className="card"
          style={{
            padding: '20px 24px',
            background: currentActionColor.bg,
            border: `1px solid ${currentActionColor.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', color: currentActionColor.color, padding: '3px 10px', borderRadius: '12px', background: 'var(--bg-surface)', border: `1px solid ${currentActionColor.border}` }}>
                Recommended First Action: {actionPlan.recommendedFirstAction.replace(/_/g, ' ')}
              </span>

              {actionPlan.bestConversationStarterOpportunityTitle && (
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🎯 Best Conversation Starter: <em>"{actionPlan.bestConversationStarterOpportunityTitle}"</em>
                  {actionPlan.bestConversationStarterScore && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-text)', marginLeft: '6px', fontWeight: 800 }}>
                      ({actionPlan.bestConversationStarterScore}/100 starter score)
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Counts breakdown */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', fontWeight: 700 }}>
              {summary && (
                <>
                  <span style={{ color: 'var(--success-text)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    {summary.pursueCount} Pursue
                  </span>
                  <span style={{ color: 'var(--accent-text)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    {summary.exploreCount} Explore
                  </span>
                </>
              )}
              <span style={{ color: '#86198f', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                {actionPlan.referOutCount} Refer Out
              </span>
              <span style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                {actionPlan.noActionCount} No Action
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {actionPlan.summaryRationale}
          </div>

          {/* Divergence Rationale Callout (When Best Qualified != Best Conversation Starter) */}
          {actionPlan.divergenceRationale && (
            <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--accent-text)', marginBottom: '2px' }}>
                <Zap size={14} /> Strategic Positioning Rationale:
              </div>
              {actionPlan.divergenceRationale}
            </div>
          )}

          {/* Honest No-Fit / Refer-Out Guidance */}
          {actionPlan.recommendedFirstAction === 'REFER' && (
            <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #86198f', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#86198f' }}>Strategic Guidance: </strong>
              The website has diagnostic issues, but none align directly with your seller profile capabilities. Do not force an unsuited service. Refer these to a qualified partner or decline.
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      {opportunities.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Active ({opportunities.filter(o => o.status !== 'rejected').length})
          </button>

          {outreachCount > 0 && (
            <button
              type="button"
              className={`tab-btn ${activeTab === 'outreach' ? 'active' : ''}`}
              onClick={() => setActiveTab('outreach')}
              style={{ fontWeight: 800, color: 'var(--success-text)' }}
            >
              📤 Ready for Outreach ({outreachCount})
            </button>
          )}

          {pursueCount > 0 && (
            <button
              type="button"
              className={`tab-btn ${activeTab === 'pursue' ? 'active' : ''}`}
              onClick={() => setActiveTab('pursue')}
            >
              🎯 Pursue ({pursueCount})
            </button>
          )}

          {exploreCount > 0 && (
            <button
              type="button"
              className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              🔍 Worth Exploring ({exploreCount})
            </button>
          )}

          {referOutCount > 0 && (
            <button
              type="button"
              className={`tab-btn ${activeTab === 'refer_out' ? 'active' : ''}`}
              onClick={() => setActiveTab('refer_out')}
            >
              🤝 Refer Out ({referOutCount})
            </button>
          )}

          <button
            type="button"
            className={`tab-btn ${activeTab === 'high_impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('high_impact')}
          >
            🔥 High Impact ({highImpactCount})
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'needs_review' ? 'active' : ''}`}
            onClick={() => setActiveTab('needs_review')}
          >
            ⚠️ Needs Review ({needsReviewCount})
          </button>

          {rejectedCount > 0 && (
            <button
              type="button"
              className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              ✕ Rejected ({rejectedCount})
            </button>
          )}
        </div>
      )}

      {/* Opportunity List OR No-Opportunity State */}
      {filteredOpportunities.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            background: 'var(--bg-subtle)',
            border: '1px dashed var(--border-strong)'
          }}
        >
          <ShieldCheck size={38} style={{ margin: '0 auto 10px', color: 'var(--success-text)', opacity: 0.85 }} />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No defensible opportunities in this view
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '8px auto 18px', lineHeight: 1.5 }}>
            {activeTab === 'all'
              ? 'The available evidence does not support a defensible opportunity yet. Review the audit or re-scan.'
              : `No opportunities matched the "${activeTab.replace('_', ' ')}" filter.`}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {onOpenAudit && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenAudit(audit.id)}
                style={{ gap: '6px' }}
              >
                <FolderOpen size={14} /> Review Audit Details
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleReevaluate}
              style={{ gap: '6px' }}
            >
              <Sparkles size={14} /> Re-scan Opportunities
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              sellerFit={sellerFits[opp.id]}
              qualificationScore={qualificationScores[opp.id]}
              actionRecommendation={actionRecommendations[opp.id]}
              onUpdateStatus={handleUpdateStatus}
              onEdit={(target) => setEditingOpportunity(target)}
              onViewAuditCheck={onOpenAudit ? () => onOpenAudit(audit.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Refine & Edit Modal */}
      {editingOpportunity && (
        <OpportunityEditModal
          isOpen={true}
          onClose={() => setEditingOpportunity(null)}
          opportunity={editingOpportunity}
          onSave={handleSaveEdited}
        />
      )}

    </div>
  );
};
