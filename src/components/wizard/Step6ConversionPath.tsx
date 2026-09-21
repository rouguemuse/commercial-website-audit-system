import React, { useState } from 'react';
import type { Audit } from '../../types';
import { ArrowDown, Plus, Trash2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface Step6Props {
  conversionPath: Audit['conversionPath'];
  onChange: (updated: Audit['conversionPath']) => void;
}

export const Step6ConversionPath: React.FC<Step6Props> = ({
  conversionPath,
  onChange
}) => {
  const [currentStepText, setCurrentStepText] = useState('');
  const [recommendedStepText, setRecommendedStepText] = useState('');

  const handleAddCurrentStep = () => {
    if (!currentStepText.trim()) return;
    onChange({
      ...conversionPath,
      currentSteps: [...conversionPath.currentSteps, currentStepText.trim()]
    });
    setCurrentStepText('');
  };

  const handleAddRecommendedStep = () => {
    if (!recommendedStepText.trim()) return;
    onChange({
      ...conversionPath,
      recommendedSteps: [...conversionPath.recommendedSteps, recommendedStepText.trim()]
    });
    setRecommendedStepText('');
  };

  const handleDeleteCurrentStep = (index: number) => {
    onChange({
      ...conversionPath,
      currentSteps: conversionPath.currentSteps.filter((_, i) => i !== index)
    });
  };

  const handleDeleteRecommendedStep = (index: number) => {
    onChange({
      ...conversionPath,
      recommendedSteps: conversionPath.recommendedSteps.filter((_, i) => i !== index)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 className="section-title">Step 6: Conversion Path (Before vs. After Flow)</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Illustrate the friction in the visitor's current journey versus the streamlined path in your recommended direction.
        </p>
      </div>

      <div className="grid-2">
        {/* CURRENT BROKEN PATH */}
        <div className="card" style={{ borderColor: 'var(--danger-border)', background: '#fffafa', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={18} color="var(--danger-solid)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--danger-text)' }}>
              Current Visitor Journey (Frictional)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversionPath.currentSteps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', background: '#ffffff', border: '1px solid var(--danger-border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--danger-text)' }}>{idx + 1}. </strong>{step}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    style={{ padding: '3px 6px' }}
                    onClick={() => handleDeleteCurrentStep(idx)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {idx < conversionPath.currentSteps.length - 1 && (
                  <ArrowDown size={14} color="var(--danger-solid)" />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <input
              type="text"
              className="input"
              value={currentStepText}
              onChange={(e) => setCurrentStepText(e.target.value)}
              placeholder="e.g. Bounces to competitor..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddCurrentStep()}
            />
            <button type="button" className="btn btn-danger btn-sm" onClick={handleAddCurrentStep}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* RECOMMENDED STREAMLINED PATH */}
        <div className="card" style={{ borderColor: 'var(--success-border)', background: '#f6fdf9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--success-solid)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--success-text)' }}>
              Recommended Conversion Flow (Streamlined)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversionPath.recommendedSteps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', background: '#ffffff', border: '1px solid var(--success-border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--success-text)' }}>{idx + 1}. </strong>{step}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    style={{ padding: '3px 6px' }}
                    onClick={() => handleDeleteRecommendedStep(idx)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {idx < conversionPath.recommendedSteps.length - 1 && (
                  <ArrowDown size={14} color="var(--success-solid)" />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <input
              type="text"
              className="input"
              value={recommendedStepText}
              onChange={(e) => setRecommendedStepText(e.target.value)}
              placeholder="e.g. Submits 3-field instant quote..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddRecommendedStep()}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddRecommendedStep}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
