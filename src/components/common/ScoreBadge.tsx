import React from 'react';
import type { RescueLevel } from '../../types';

interface ScoreBadgeProps {
  score?: number;
  maxScore?: number;
  rescueLevel?: RescueLevel;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score = 0,
  maxScore = 60,
  rescueLevel = 'Critical Rescue',
  size = 'md',
  showScore = true
}) => {
  let badgeClass = 'badge-rose';
  if (rescueLevel === 'Healthy') badgeClass = 'badge-green';
  else if (rescueLevel === 'Medium Rescue') badgeClass = 'badge-amber';
  else if (rescueLevel === 'High Rescue') badgeClass = 'badge-orange';

  const fontSizes = {
    sm: '0.72rem',
    md: '0.82rem',
    lg: '0.95rem'
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {showScore && (
        <span style={{ fontWeight: 800, fontSize: fontSizes[size], color: 'var(--text-primary)' }}>
          {score}/{maxScore}
        </span>
      )}
      <span className={`badge ${badgeClass}`} style={{ fontSize: fontSizes[size] }}>
        {rescueLevel}
      </span>
    </div>
  );
};
