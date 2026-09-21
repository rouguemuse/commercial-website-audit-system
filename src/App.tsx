import React, { useState, useEffect } from 'react';
import type { MasterFramework, Diagnosis, Audit, AuditAsset, Company } from './types';
import { frameworkRepository } from './services/repositories/frameworkRepository';
import { diagnosisRepository } from './services/repositories/diagnosisRepository';
import { auditRepository } from './services/repositories/auditRepository';
import { assetRepository } from './services/repositories/assetRepository';
import { companyAnalysisRepository } from './services/repositories/companyAnalysisRepository';
import { sellerProfileRepository } from './services/repositories/sellerProfileRepository';
import { seedDatabaseIfEmpty } from './data/seedData';

import { Sidebar, type NavTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { BackupModal } from './components/common/BackupModal';
import { AgencyBrandingModal } from './components/common/AgencyBrandingModal';
import { createFictionalDemoAudit } from './data/demoAudit';
import { brandingConfig } from './config/brandingConfig';

import { DashboardView } from './components/dashboard/DashboardView';
import { FrameworkView } from './components/framework/FrameworkView';
import { DiagnosisView } from './components/diagnosis/DiagnosisView';
import { AuditListView } from './components/audits/AuditListView';
import { AuditWizard } from './components/wizard/AuditWizard';
import { ReportComposer } from './components/composer/ReportComposer';
import { ClientReportView } from './components/report/ClientReportView';
import { ProspectingTeaserView } from './components/report/ProspectingTeaserView';
import { FreeChecklistView } from './components/checklist/FreeChecklistView';
import { RescueKitView } from './components/rescuekit/RescueKitView';
import { SalesFunnelView } from './components/funnel/SalesFunnelView';
import { SellerProfileView } from './components/profile/SellerProfileView';
import { CompanyListView } from './components/companies/CompanyListView';
import { CompanyDetailView } from './components/companies/CompanyDetailView';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'normal' | 'wizard' | 'composer' | 'report' | 'teaser'>('normal');

  const [framework, setFramework] = useState<MasterFramework | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [activeAssets, setActiveAssets] = useState<AuditAsset[]>([]);
  const [includeDemo, setIncludeDemo] = useState(true);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [, setBrandingVersion] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLoadDemoAudit = async () => {
    if (!framework) return;
    const { audit: demoAudit, assets: demoAssets } = createFictionalDemoAudit(framework);
    await auditRepository.save(demoAudit);
    await assetRepository.bulkSave(demoAssets);
    setAudits(prev => [demoAudit, ...prev.filter(a => a.id !== demoAudit.id)]);
    setActiveAuditId(demoAudit.id);
    setActiveAssets(demoAssets);
    setViewMode('report');
  };

  const loadData = async () => {
    try {
      await seedDatabaseIfEmpty();
      const latestFw = await frameworkRepository.getLatest();
      const allDiags = await diagnosisRepository.getAll();
      const allAudits = await auditRepository.getAll(includeDemo);

      if (latestFw) setFramework(latestFw);
      setDiagnoses(allDiags);
      setAudits(allAudits);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [includeDemo]);

  // Load assets when activeAuditId changes
  useEffect(() => {
    if (activeAuditId) {
      assetRepository.getByAuditId(activeAuditId).then(setActiveAssets);
    } else {
      setActiveAssets([]);
    }
  }, [activeAuditId]);

  const handleStartNewAudit = () => {
    if (!framework) return;
    const newId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newAudit: Audit = {
      id: newId,
      businessName: '',
      websiteUrl: '',
      industry: '',
      cityServiceArea: '',
      primaryCustomerType: '',
      desiredAction: 'Request quote',
      auditorNotes: '',
      status: 'Draft',
      frameworkVersion: framework.version,
      frameworkSnapshot: framework,
      scores: {},
      findings: [],
      conversionPath: {
        currentSteps: [
          'Visitor lands on homepage',
          'Scans above the fold',
          'Experiences uncertainty',
          'Leaves without inquiring'
        ],
        recommendedSteps: [
          'Visitor lands and immediately understands service & outcome',
          'Sees local proof and credibility badges',
          'Completes 3-field instant quote request',
          'Becomes booked customer'
        ],
        notes: ''
      },
      reportConfig: {
        executiveSummary: '',
        selectedFindingIds: [],
        selectedSourceAssetIds: [],
        selectedFixedDirectionAssetIds: [],
        selectedPinIds: [],
        showConversionBlueprint: true,
        showFixNext: true,
        showCategoryBreakdown: true,
        recommendedOffer: {
          offerName: '48-Hour Homepage Rescue',
          price: '$350',
          turnaround: '48 Hours',
          description: 'Done-for-you implementation of the high-converting homepage hero, streamlined quote mechanism, and social proof trust bar.',
          customScope: 'Includes hero headline rewrite, 3-field quote calculator, mobile tap-to-call header, and verified review integration.',
          ctaText: 'Schedule Your Homepage Rescue'
        }
      },
      createdAt: now,
      updatedAt: now
    };

    setAudits(prev => [newAudit, ...prev]);
    setActiveAuditId(newId);
    setViewMode('wizard');
  };

  const handleStartCompanyAnalysis = async (company: Company) => {
    if (!framework) return;
    const activeProfile = await sellerProfileRepository.getActive();
    const newAnalysis = await companyAnalysisRepository.create(company.id, activeProfile?.id);

    const newAuditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newAudit: Audit = {
      id: newAuditId,
      businessName: company.name || '',
      websiteUrl: company.websiteUrl || '',
      industry: company.industry || '',
      cityServiceArea: company.location || '',
      primaryCustomerType: '',
      desiredAction: 'Request quote',
      auditorNotes: company.notes || company.engagementNotes || '',
      status: 'Draft',
      frameworkVersion: framework.version,
      frameworkSnapshot: framework,
      scores: {},
      findings: [],
      conversionPath: {
        currentSteps: [
          'Visitor lands on homepage',
          'Scans above the fold',
          'Experiences uncertainty',
          'Leaves without inquiring'
        ],
        recommendedSteps: [
          'Visitor lands and immediately understands service & outcome',
          'Sees local proof and credibility badges',
          'Completes 3-field instant quote request',
          'Becomes booked customer'
        ],
        notes: ''
      },
      reportConfig: {
        executiveSummary: '',
        selectedFindingIds: [],
        selectedSourceAssetIds: [],
        selectedFixedDirectionAssetIds: [],
        selectedPinIds: [],
        showConversionBlueprint: true,
        showFixNext: true,
        showCategoryBreakdown: true,
        recommendedOffer: {
          offerName: '48-Hour Homepage Rescue',
          price: '$350',
          turnaround: '48 Hours',
          description: 'Done-for-you implementation of the high-converting homepage hero, streamlined quote mechanism, and social proof trust bar.',
          customScope: 'Includes hero headline rewrite, 3-field quote calculator, mobile tap-to-call header, and verified review integration.',
          ctaText: 'Schedule Your Homepage Rescue'
        }
      },
      createdAt: now,
      updatedAt: now
    };

    await auditRepository.save(newAudit);
    await companyAnalysisRepository.linkAudit(newAnalysis.id, newAuditId);

    setAudits(prev => [newAudit, ...prev]);
    setActiveAuditId(newAuditId);
    setViewMode('wizard');
  };

  const handleOpenAuditEvaluator = (auditId: string) => {
    setActiveAuditId(auditId);
    setViewMode('wizard');
  };

  const handleOpenComposer = (auditId: string) => {
    setActiveAuditId(auditId);
    setViewMode('composer');
  };

  const handleOpenReport = (auditId: string) => {
    setActiveAuditId(auditId);
    setViewMode('report');
  };

  const handleSaveAudit = async (updatedAudit: Audit, updatedAssets: AuditAsset[]) => {
    await auditRepository.save(updatedAudit);
    await assetRepository.bulkSave(updatedAssets);
    setAudits(prev => prev.map(a => (a.id === updatedAudit.id ? updatedAudit : a)));
    setActiveAssets(updatedAssets);
  };

  const handleDuplicateAudit = async (auditId: string) => {
    const duplicated = await auditRepository.duplicate(auditId);
    setAudits(prev => [duplicated, ...prev]);
    setActiveAuditId(duplicated.id);
    setViewMode('wizard');
  };

  const handleDeleteAudit = async (auditId: string) => {
    await auditRepository.delete(auditId);
    setAudits(prev => prev.filter(a => a.id !== auditId));
    if (activeAuditId === auditId) {
      setActiveAuditId(null);
      setViewMode('normal');
    }
  };

  const handleUpdateAuditStatus = async (auditId: string, status: Audit['status']) => {
    const target = audits.find(a => a.id === auditId);
    if (!target) return;
    const updated = { ...target, status };
    await auditRepository.save(updated);
    setAudits(prev => prev.map(a => (a.id === auditId ? updated : a)));
  };

  const handleSaveFrameworkCheck = async (updatedCheck: any) => {
    if (!framework) return;
    const newFw = await frameworkRepository.updateCheck(framework.id, updatedCheck);
    setFramework(newFw);
  };

  const handleReorderFrameworkChecks = async (orderedIds: string[]) => {
    if (!framework) return;
    const newFw = await frameworkRepository.reorderChecks(framework.id, orderedIds);
    setFramework(newFw);
  };

  const handleSaveDiagnosis = async (diag: Diagnosis) => {
    await diagnosisRepository.save(diag);
    setDiagnoses(prev => {
      const exists = prev.some(d => d.id === diag.id);
      return exists ? prev.map(d => (d.id === diag.id ? diag : d)) : [...prev, diag];
    });
  };

  const handleDeleteDiagnosis = async (id: string) => {
    await diagnosisRepository.delete(id);
    setDiagnoses(prev => prev.filter(d => d.id !== id));
  };

  if (loading || !framework) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{brandingConfig.appName}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Initializing database & master framework...</div>
      </div>
    );
  }

  const activeAudit = audits.find(a => a.id === activeAuditId);

  // Standalone Prospecting Teaser View
  if (viewMode === 'teaser' && activeAudit) {
    return (
      <ProspectingTeaserView
        audit={activeAudit}
        assets={activeAssets}
        onBackToAudit={() => setViewMode('wizard')}
        onUpdateAudit={async (updated) => {
          await auditRepository.save(updated);
          setAudits(prev => prev.map(a => a.id === updated.id ? updated : a));
        }}
      />
    );
  }

  // Full Screen Client Report View (Print Optimized)
  if (viewMode === 'report' && activeAudit) {
    return (
      <ClientReportView
        audit={activeAudit}
        assets={activeAssets}
        onBackToAudit={() => setViewMode('wizard')}
        onOpenComposer={() => setViewMode('composer')}
      />
    );
  }

  // Report Composer View
  if (viewMode === 'composer' && activeAudit) {
    return (
      <div className="app-container">
        <div
          className={`sidebar-overlay ${isMobileNavOpen ? 'active' : ''}`}
          onClick={() => setIsMobileNavOpen(false)}
        />
        <Sidebar
          currentTab="audits"
          onSelectTab={(tab) => {
            setViewMode('normal');
            setCurrentTab(tab);
            setIsMobileNavOpen(false);
          }}
          auditCount={audits.length}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenBranding={() => setIsBrandingOpen(true)}
          onLoadDemoAudit={handleLoadDemoAudit}
          includeDemo={includeDemo}
          onToggleIncludeDemo={setIncludeDemo}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />
        <main className="main-content">
          <Header
            onStartAudit={handleStartNewAudit}
            frameworkVersion={framework.version}
            onOpenBranding={() => setIsBrandingOpen(true)}
            onLoadDemoAudit={handleLoadDemoAudit}
            onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
          />
          <ReportComposer
            audit={activeAudit}
            assets={activeAssets}
            onSaveReportConfig={async (updated) => {
              await auditRepository.save(updated);
              setAudits(prev => prev.map(a => a.id === updated.id ? updated : a));
            }}
            onOpenReport={() => setViewMode('report')}
            onBackToAudit={() => setViewMode('wizard')}
          />
        </main>
      </div>
    );
  }

  // Multi-step Audit Wizard View
  if (viewMode === 'wizard' && activeAudit) {
    return (
      <div className="app-container">
        <div
          className={`sidebar-overlay ${isMobileNavOpen ? 'active' : ''}`}
          onClick={() => setIsMobileNavOpen(false)}
        />
        <Sidebar
          currentTab="new_audit"
          onSelectTab={(tab) => {
            setViewMode('normal');
            setCurrentTab(tab);
            setIsMobileNavOpen(false);
          }}
          auditCount={audits.length}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenBranding={() => setIsBrandingOpen(true)}
          onLoadDemoAudit={handleLoadDemoAudit}
          includeDemo={includeDemo}
          onToggleIncludeDemo={setIncludeDemo}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />
        <main className="main-content">
          <Header
            onStartAudit={handleStartNewAudit}
            frameworkVersion={framework.version}
            onOpenBranding={() => setIsBrandingOpen(true)}
            onLoadDemoAudit={handleLoadDemoAudit}
            onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
          />
          <AuditWizard
            initialAudit={activeAudit}
            framework={framework}
            diagnoses={diagnoses}
            assets={activeAssets}
            onSaveAudit={handleSaveAudit}
            onOpenComposer={() => setViewMode('composer')}
            onOpenReport={() => setViewMode('report')}
            onOpenTeaser={() => setViewMode('teaser')}
            onCancel={() => {
              setViewMode('normal');
              setCurrentTab('audits');
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div
        className={`sidebar-overlay ${isMobileNavOpen ? 'active' : ''}`}
        onClick={() => setIsMobileNavOpen(false)}
      />
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsMobileNavOpen(false);
          if (tab === 'new_audit') {
            handleStartNewAudit();
          } else {
            if (tab === 'companies') {
              // If already on companies tab and in detail view, reset to list view
              if (currentTab === 'companies') {
                setSelectedCompanyId(null);
              }
            }
            setViewMode('normal');
            setCurrentTab(tab);
          }
        }}
        auditCount={audits.length}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenBranding={() => setIsBrandingOpen(true)}
        onLoadDemoAudit={handleLoadDemoAudit}
        includeDemo={includeDemo}
        onToggleIncludeDemo={setIncludeDemo}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <main className="main-content">
        <Header
          onStartAudit={handleStartNewAudit}
          frameworkVersion={framework.version}
          onOpenBranding={() => setIsBrandingOpen(true)}
          onLoadDemoAudit={handleLoadDemoAudit}
          onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
        />

        {currentTab === 'dashboard' && (
          <DashboardView
            framework={framework}
            diagnoses={diagnoses}
            audits={audits}
            onStartAudit={handleStartNewAudit}
            onOpenFramework={() => setCurrentTab('framework')}
            onOpenDiagnosis={() => setCurrentTab('diagnosis')}
            onOpenAudit={handleOpenAuditEvaluator}
            onOpenReport={handleOpenReport}
            onLoadDemoAudit={handleLoadDemoAudit}
          />
        )}

        {currentTab === 'seller_profile' && (
          <SellerProfileView />
        )}

        {currentTab === 'companies' && (
          selectedCompanyId ? (
            <CompanyDetailView
              companyId={selectedCompanyId}
              framework={framework}
              onBack={() => setSelectedCompanyId(null)}
              onStartCompanyAnalysis={handleStartCompanyAnalysis}
              onOpenAudit={handleOpenAuditEvaluator}
              onOpenReport={handleOpenReport}
              onOpenTeaser={(id) => {
                setActiveAuditId(id);
                setViewMode('teaser');
              }}
            />
          ) : (
            <CompanyListView
              framework={framework}
              onSelectCompany={(compId) => setSelectedCompanyId(compId)}
              onStartCompanyAnalysis={handleStartCompanyAnalysis}
            />
          )
        )}

        {currentTab === 'framework' && (
          <FrameworkView
            framework={framework}
            onSaveCheck={handleSaveFrameworkCheck}
            onReorderChecks={handleReorderFrameworkChecks}
          />
        )}

        {currentTab === 'diagnosis' && (
          <DiagnosisView
            diagnoses={diagnoses}
            framework={framework}
            onSaveDiagnosis={handleSaveDiagnosis}
            onDeleteDiagnosis={handleDeleteDiagnosis}
          />
        )}

        {currentTab === 'audits' && (
          <AuditListView
            audits={audits}
            framework={framework}
            onStartAudit={handleStartNewAudit}
            onOpenAudit={handleOpenAuditEvaluator}
            onOpenComposer={handleOpenComposer}
            onOpenReport={handleOpenReport}
            onOpenTeaser={(id) => {
              setActiveAuditId(id);
              setViewMode('teaser');
            }}
            onDuplicateAudit={handleDuplicateAudit}
            onDeleteAudit={handleDeleteAudit}
            onUpdateStatus={handleUpdateAuditStatus}
          />
        )}

        {currentTab === 'checklist' && (
          <FreeChecklistView framework={framework} />
        )}

        {currentTab === 'rescue_kit' && (
          <RescueKitView framework={framework} diagnoses={diagnoses} />
        )}

        {currentTab === 'sales_page' && (
          <SalesFunnelView />
        )}
      </main>

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={loadData}
      />

      <AgencyBrandingModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        onBrandingUpdated={() => setBrandingVersion(v => v + 1)}
      />
    </div>
  );
};
