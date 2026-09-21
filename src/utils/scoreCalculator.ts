import type { Audit, MasterFramework, RescueLevel, FrameworkCategory } from '../types';

export interface CategoryScoreResult {
  category: FrameworkCategory;
  earned: number;
  totalPossible: number;
  ratioFormatted: string; // e.g. "7 / 10"
  percentage: number;
  status: 'WORKING' | 'NEEDS ATTENTION' | 'PRIORITY';
  statusColor: 'green' | 'amber' | 'rose';
  scoredChecksCount: number;
  totalChecksCount: number;
}

export interface OverallScoreResult {
  totalScore: number; // 0 to 60
  maxScore: number; // 60
  scoreFormatted: string; // e.g. "42 / 60"
  rescueLevel: RescueLevel;
  rescueLevelColor: 'green' | 'amber' | 'orange' | 'rose';
  rescueDescription: string;
  categoryResults: CategoryScoreResult[];
  completedChecksCount: number;
  totalChecksCount: number;
  isComplete: boolean;
}

export function getRescueLevel(totalScore: number): {
  level: RescueLevel;
  color: 'green' | 'amber' | 'orange' | 'rose';
  description: string;
} {
  if (totalScore >= 51) {
    return {
      level: 'Healthy',
      color: 'green',
      description: 'Website is fundamentally working; targeted optimization recommended.'
    };
  } else if (totalScore >= 41) {
    return {
      level: 'Medium Rescue',
      color: 'amber',
      description: 'The foundation exists, but meaningful conversion leaks are likely costing opportunities.'
    };
  } else if (totalScore >= 26) {
    return {
      level: 'High Rescue',
      color: 'orange',
      description: 'Major clarity, trust, UX, or conversion problems need attention.'
    };
  } else {
    return {
      level: 'Critical Rescue',
      color: 'rose',
      description: 'The website likely requires substantial restructuring or rebuilding.'
    };
  }
}

export function getCategoryStatus(earned: number, max: number): {
  status: 'WORKING' | 'NEEDS ATTENTION' | 'PRIORITY';
  color: 'green' | 'amber' | 'rose';
} {
  const ratio = max > 0 ? earned / max : 0;
  if (ratio >= 0.85) {
    return { status: 'WORKING', color: 'green' };
  } else if (ratio >= 0.6) {
    return { status: 'NEEDS ATTENTION', color: 'amber' };
  } else {
    return { status: 'PRIORITY', color: 'rose' };
  }
}

export function calculateAuditScores(
  scores: Audit['scores'],
  framework: MasterFramework
): OverallScoreResult {
  let totalScore = 0;
  let completedChecksCount = 0;
  const activeChecks = framework.checks.filter(c => c.isActive);
  const totalChecksCount = activeChecks.length;

  const categoryResults: CategoryScoreResult[] = framework.categories.map((cat) => {
    const catChecks = activeChecks.filter(c => c.categoryId === cat.id);
    let catEarned = 0;
    let catScored = 0;
    const catTotalPossible = catChecks.length * 2;

    for (const chk of catChecks) {
      const scoreItem = scores[chk.id];
      if (scoreItem !== undefined && scoreItem.score !== undefined && scoreItem.score !== null) {
        catEarned += scoreItem.score;
        catScored += 1;
        totalScore += scoreItem.score;
        completedChecksCount += 1;
      }
    }

    const { status, color } = getCategoryStatus(catEarned, catTotalPossible);
    const percentage = catTotalPossible > 0 ? Math.round((catEarned / catTotalPossible) * 100) : 0;

    return {
      category: cat,
      earned: catEarned,
      totalPossible: catTotalPossible,
      ratioFormatted: `${catEarned} / ${catTotalPossible}`,
      percentage,
      status,
      statusColor: color,
      scoredChecksCount: catScored,
      totalChecksCount: catChecks.length
    };
  });

  const maxPossibleScore = totalChecksCount * 2;
  const rescueInfo = getRescueLevel(totalScore);

  return {
    totalScore,
    maxScore: maxPossibleScore,
    scoreFormatted: `${totalScore} / ${maxPossibleScore}`,
    rescueLevel: rescueInfo.level,
    rescueLevelColor: rescueInfo.color,
    rescueDescription: rescueInfo.description,
    categoryResults,
    completedChecksCount,
    totalChecksCount,
    isComplete: completedChecksCount === totalChecksCount && totalChecksCount > 0
  };
}
