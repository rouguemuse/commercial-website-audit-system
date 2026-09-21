import React, { useState } from 'react';
import type { MasterFramework, Diagnosis } from '../../types';
import {
  Wrench,
  BookOpen,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Search,
  Target
} from 'lucide-react';

interface RescueKitProps {
  framework: MasterFramework;
  diagnoses: Diagnosis[];
}

const KIT_SECTIONS = [
  { id: 'sec_1', number: 1, title: 'Five-Second Website Test', icon: Clock, checks: ['chk_1', 'chk_2', 'chk_4'], summary: 'How to verify whether a brand new visitor understands what you sell in under 5 seconds.' },
  { id: 'sec_2', number: 2, title: 'Homepage Architecture Formula', icon: FileText, checks: ['chk_4', 'chk_5', 'chk_8'], summary: 'Above-the-fold structure that leads visitors smoothly from curiosity to action.' },
  { id: 'sec_3', number: 3, title: 'High-Converting Headline Formula', icon: Sparkles, checks: ['chk_2', 'chk_3', 'chk_26'], summary: 'Frameworks to write outcome-driven, local-service headlines that kill ambiguity.' },
  { id: 'sec_4', number: 4, title: 'CTA & Next-Action Formula', icon: Target, checks: ['chk_11', 'chk_12', 'chk_13'], summary: 'Selecting one high-contrast primary conversion action and eliminating competing buttons.' },
  { id: 'sec_5', number: 5, title: 'Trust Signal & Social Proof Checklist', icon: ShieldCheck, checks: ['chk_16', 'chk_17', 'chk_18', 'chk_19'], summary: 'Where to place reviews, badges, and authentic photos to eliminate purchasing fear.' },
  { id: 'sec_6', number: 6, title: 'Service Section & Packaging Formula', icon: BookOpen, checks: ['chk_6', 'chk_7', 'chk_10'], summary: 'Presenting packages and transparent starting ranges so visitors self-qualify.' },
  { id: 'sec_7', number: 7, title: 'Streamlined Contact & Quote Flow', icon: CheckCircle2, checks: ['chk_14', 'chk_15'], summary: 'Cutting inquiry friction to 3 essential fields and boosting submission rates.' },
  { id: 'sec_8', number: 8, title: 'Mobile UX & Tap-to-Call System', icon: Smartphone, checks: ['chk_21', 'chk_24'], summary: 'Optimizing for 65%+ mobile traffic with sticky action buttons and readable typography.' },
  { id: 'sec_9', number: 9, title: 'Local SEO & Multi-Page Basics', icon: Search, checks: ['chk_27', 'chk_28', 'chk_30'], summary: 'Geo-targeted copy and crawlable service pages for regional search rankings.' },
  { id: 'sec_10', number: 10, title: 'Priority Fix Planner', icon: Wrench, checks: ['chk_5', 'chk_9'], summary: 'How to triage fixes into Fix First, Fix Next, and Later improvements.' }
];

export const RescueKitView: React.FC<RescueKitProps> = ({ framework, diagnoses }) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(KIT_SECTIONS[0].id);

  const activeSection = KIT_SECTIONS.find(s => s.id === selectedSectionId) || KIT_SECTIONS[0];
  const activeChecks = framework.checks.filter(c => activeSection.checks.includes(c.id));
  const relatedDiagnoses = diagnoses.filter(d =>
    d.triggers.some(t => activeSection.checks.includes(t.checkId))
  );

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-text)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <Wrench size={14} /> Product Funnel Tier #2
          </div>
          <h1 className="page-title">Website Rescue Kit ($29)</h1>
          <p className="page-subtitle" style={{ maxWidth: '820px', marginTop: '6px' }}>
            Internal 10-section DIY toolkit derived from the master scoring system and diagnosis library.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            $29 Self-Serve Playbook
          </span>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '300px 1fr 1fr', gap: '20px' }}>
        {/* 10 Sections Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            10 Modular Playbooks
          </span>
          {KIT_SECTIONS.map((sec) => {
            const isSelected = activeSection.id === sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                className="card card-hover"
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onClick={() => setSelectedSectionId(sec.id)}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isSelected ? 'var(--accent-primary)' : 'var(--bg-subtle)', color: isSelected ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    #{sec.number} {sec.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Playbook Content Canvas */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.72rem', marginBottom: '6px' }}>
                Module #{activeSection.number}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeSection.title}
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {activeSection.summary}
              </p>
            </div>

            {/* Derived Framework Checks */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Master Checks Covered in This Module:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeChecks.map((chk) => (
                  <div key={chk.id} style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      Check #{chk.number}: {chk.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {chk.evaluatorQuestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Associated Diagnoses & Formulas */}
            {relatedDiagnoses.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Actionable Diagnosis Formulas:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {relatedDiagnoses.map((diag) => (
                    <div key={diag.id} style={{ border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '14px', background: 'var(--bg-surface)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-text)' }}>
                        {diag.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <strong>Fix: </strong>{diag.recommendedFix}
                      </div>
                      {diag.exampleImprovement && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                          <strong>Example: </strong>{diag.exampleImprovement}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
