import React, { useState } from 'react';
import type { MasterFramework } from '../../types';
import { brandingConfig } from '../../config/brandingConfig';
import { CheckSquare, Printer, CheckCircle2, XCircle, HelpCircle, Sparkles } from 'lucide-react';

interface FreeChecklistViewProps {
  framework: MasterFramework;
}

export const FreeChecklistView: React.FC<FreeChecklistViewProps> = ({ framework }) => {
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'unclear'>>({});

  const handleSelectAnswer = (checkId: string, val: 'yes' | 'no' | 'unclear') => {
    setAnswers(prev => ({ ...prev, [checkId]: val }));
  };

  const handlePrint = () => {
    window.print();
  };

  const yesCount = Object.values(answers).filter(v => v === 'yes').length;
  const noCount = Object.values(answers).filter(v => v === 'no').length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <Sparkles size={14} /> Derived from Master Framework (v{framework.version})
          </div>
          <h1 className="page-title">The Business Website Health Checklist</h1>
          <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '6px' }}>
            Thirty quick checks to see whether your website is helping customers take action — or quietly making them work too hard.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={15} /> Print Checklist (PDF)
          </button>
        </div>
      </div>

      {/* Progress & Live Results Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'var(--bg-subtle)' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            {answeredCount} of 30 items checked
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Derived directly from our 30-point heuristic evaluation engine.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            ✓ {yesCount} Passing
          </span>
          <span className="badge badge-rose" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            ✗ {noCount} Leaking Opportunity
          </span>
        </div>
      </div>

      {/* 6 Category Checklist Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {framework.categories.map((cat) => {
          const checks = framework.checks.filter(c => c.categoryId === cat.id && c.isActive);
          return (
            <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Category {cat.number}: {cat.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {cat.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {checks.map((chk) => {
                  const currentAns = answers[chk.id];
                  return (
                    <div
                      key={chk.id}
                      style={{
                        padding: '12px 14px',
                        background: currentAns === 'yes' ? 'var(--success-bg)' : currentAns === 'no' ? 'var(--danger-bg)' : 'var(--bg-surface)',
                        border: '1px solid',
                        borderColor: currentAns === 'yes' ? 'var(--success-border)' : currentAns === 'no' ? 'var(--danger-border)' : 'var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                          #{chk.number}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {chk.checklistQuestion}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Evaluator check: {chk.title}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: currentAns === 'yes' ? 'var(--success-solid)' : 'var(--bg-subtle)',
                            color: currentAns === 'yes' ? '#fff' : 'var(--text-primary)',
                            padding: '4px 10px',
                            fontSize: '0.8rem'
                          }}
                          onClick={() => handleSelectAnswer(chk.id, 'yes')}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: currentAns === 'no' ? 'var(--danger-solid)' : 'var(--bg-subtle)',
                            color: currentAns === 'no' ? '#fff' : 'var(--text-primary)',
                            padding: '4px 10px',
                            fontSize: '0.8rem'
                          }}
                          onClick={() => handleSelectAnswer(chk.id, 'no')}
                        >
                          Needs Work
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
