import React, { useState } from 'react';
import type { Audit, MasterFramework, Diagnosis, AuditAsset } from '../../types';
import { Step1BusinessInfo } from './Step1BusinessInfo';
import { Step2SourceOfTruth } from './Step2SourceOfTruth';
import { Step3ScoreEvaluator } from './Step3ScoreEvaluator';
import { Step4FindingsPriorities } from './Step4FindingsPriorities';
import { Step5FixedDirection } from './Step5FixedDirection';
import { Step6ConversionPath } from './Step6ConversionPath';
import { Step7RecommendedOffer } from './Step7RecommendedOffer';
import { calculateAuditScores } from '../../utils/scoreCalculator';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  FileCheck,
  Eye,
  SlidersHorizontal,
  Send
} from 'lucide-react';

interface AuditWizardProps {
  initialAudit: Audit;
  framework: MasterFramework;
  diagnoses: Diagnosis[];
  assets: AuditAsset[];
  onSaveAudit: (audit: Audit, assets: AuditAsset[]) => Promise<void>;
  onOpenComposer: (auditId: string) => void;
  onOpenReport: (auditId: string) => void;
  onOpenTeaser: (auditId: string) => void;
  onCancel: () => void;
}

const WIZARD_STEPS = [
  { step: 1, title: 'Business Info' },
  { step: 2, title: 'Source of Truth' },
  { step: 3, title: 'Score 30 Checks' },
  { step: 4, title: 'Findings & Priorities' },
  { step: 5, title: 'Fixed Direction' },
  { step: 6, title: 'Conversion Path' },
  { step: 7, title: 'Recommended Offer' }
];

export const AuditWizard: React.FC<AuditWizardProps> = ({
  initialAudit,
  framework,
  diagnoses,
  assets: initialAssets,
  onSaveAudit,
  onOpenComposer,
  onOpenReport,
  onOpenTeaser,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [audit, setAudit] = useState<Audit>(initialAudit);
  const [assets, setAssets] = useState<AuditAsset[]>(initialAssets);
  const [isSaving, setIsSaving] = useState(false);

  const scoreResult = calculateAuditScores(audit.scores, audit.frameworkSnapshot || framework);

  const handleUpdateAudit = (patch: Partial<Audit>) => {
    setAudit(prev => ({ ...prev, ...patch }));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      await onSaveAudit(audit, assets);
    } catch (err: any) {
      alert(`Failed to save draft: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishAudit = async () => {
    try {
      setIsSaving(true);
      const readyAudit: Audit = {
        ...audit,
        status: audit.status === 'Delivered' ? 'Delivered' : 'Ready',
        updatedAt: new Date().toISOString()
      };
      await onSaveAudit(readyAudit, assets);
      onOpenComposer(readyAudit.id);
    } catch (err: any) {
      alert(`Failed to finalize audit: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Wizard Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {audit.businessName || 'New Business Website Audit'}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Step {currentStep} of 7 • Current Score: <strong style={{ color: 'var(--text-primary)' }}>{scoreResult.scoreFormatted}</strong> ({scoreResult.rescueLevel})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenComposer(audit.id)}
          >
            <SlidersHorizontal size={14} /> Report Composer
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenTeaser(audit.id)}
            style={{ borderColor: '#0f5b5c', color: '#0f5b5c' }}
          >
            <Send size={14} /> Prospect Teaser
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onOpenReport(audit.id)}
          >
            <Eye size={14} /> View Report
          </button>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', overflowX: 'auto', gap: '10px' }}>
          {WIZARD_STEPS.map((s) => {
            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                className="btn btn-sm"
                style={{
                  background: isCurrent ? 'var(--accent-subtle)' : 'transparent',
                  color: isCurrent ? 'var(--accent-primary)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isCurrent ? '1px solid var(--accent-border)' : '1px solid transparent',
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: '0.84rem',
                  gap: '6px'
                }}
                onClick={() => setCurrentStep(s.step)}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--accent-primary)' : isCompleted ? 'var(--success-solid)' : 'var(--border-strong)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isCompleted ? '✓' : s.step}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Content */}
      {currentStep === 1 && (
        <Step1BusinessInfo
          audit={audit}
          onChange={handleUpdateAudit}
          onGoToManualMode={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 2 && (
        <Step2SourceOfTruth
          auditId={audit.id}
          assets={assets}
          onAssetsChange={setAssets}
        />
      )}
      {currentStep === 3 && (
        <Step3ScoreEvaluator
          audit={audit}
          framework={audit.frameworkSnapshot || framework}
          diagnoses={diagnoses}
          assets={assets}
          onScoresChange={(scores) => handleUpdateAudit({ scores })}
          onGoToManualMode={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <Step4FindingsPriorities
          audit={audit}
          diagnoses={diagnoses}
          framework={audit.frameworkSnapshot || framework}
          onFindingsChange={(findings) => handleUpdateAudit({ findings })}
        />
      )}
      {currentStep === 5 && (
        <Step5FixedDirection
          auditId={audit.id}
          assets={assets}
          onAssetsChange={setAssets}
        />
      )}
      {currentStep === 6 && (
        <Step6ConversionPath
          conversionPath={audit.conversionPath}
          onChange={(conversionPath) => handleUpdateAudit({ conversionPath })}
        />
      )}
      {currentStep === 7 && (
        <Step7RecommendedOffer
          reportConfig={audit.reportConfig}
          onChange={(reportConfig) => handleUpdateAudit({ reportConfig })}
        />
      )}

      {/* Navigation Footer Controls */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
        >
          <ArrowLeft size={15} /> Previous Step
        </button>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Step {currentStep} of 7
        </div>

        {currentStep < 7 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              await handleSaveDraft();
              setCurrentStep(prev => Math.min(7, prev + 1));
            }}
          >
            Next Step <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFinishAudit}
            disabled={isSaving}
          >
            <CheckCircle2 size={16} /> Open Report Composer →
          </button>
        )}
      </div>
    </div>
  );
};
