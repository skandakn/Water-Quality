export function getWqiCategory(score: number): {
  category: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
} {
  if (score >= 90) {
    return {
      category: 'Excellent',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badgeBorder: 'border-emerald-500/40',
      description: 'Pristine freshwater quality; optimal ecological health.',
    };
  } else if (score >= 70) {
    return {
      category: 'Good',
      color: '#06b6d4',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      badgeBorder: 'border-cyan-500/40',
      description: 'Healthy aquatic state; safe for recreation and wildlife.',
    };
  } else if (score >= 50) {
    return {
      category: 'Moderate',
      color: '#f59e0b',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badgeBorder: 'border-amber-500/40',
      description: 'Noticeable contamination; surveillance recommended.',
    };
  } else if (score >= 35) {
    return {
      category: 'Poor',
      color: '#f97316',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      badgeBorder: 'border-orange-500/40',
      description: 'Elevated pollution; aquatic biodiversity under stress.',
    };
  } else {
    return {
      category: 'Very Poor',
      color: '#ef4444',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badgeBorder: 'border-rose-500/40',
      description: 'Severe contamination or eutrophic crisis; immediate remediation required.',
    };
  }
}

export function getMonitoringStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'STABLE':
      return {
        label: 'STABLE',
        color: '#10b981',
        classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      };
    case 'MODERATE':
      return {
        label: 'MODERATE',
        color: '#f59e0b',
        classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      };
    case 'CRITICAL':
    default:
      return {
        label: 'CRITICAL',
        color: '#ef4444',
        classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      };
  }
}
