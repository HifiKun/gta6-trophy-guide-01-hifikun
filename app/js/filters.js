// Filtering and counting for the checklist: by kind, by grade, by text,
// and the spoiler rule that hides story trophies until they are earned.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}

// A story trophy is masked while the spoiler setting is on and it is not earned.
export function isMasked(trophy, earnedIds, spoilerOn) {
  return spoilerOn && isStoryTrophy(trophy) && !earnedIds.has(trophy.id);
}

export function visibleTrophies(trophies, filters, earnedIds) {
  const query = filters.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind === 'missable' && !trophy.missable) return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (filters.hideEarned && earnedIds.has(trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function countEarnedByGrade(trophies, earnedIds) {
  const counts = {};
  for (const trophy of trophies) {
    counts[trophy.grade] ??= { earned: 0, total: 0 };
    counts[trophy.grade].total += 1;
    if (earnedIds.has(trophy.id)) counts[trophy.grade].earned += 1;
  }
  return counts;
}

export function countEarnedByKind(trophies, earnedIds) {
  const counts = {};
  for (const trophy of trophies) {
    counts[trophy.kind] ??= { earned: 0, total: 0 };
    counts[trophy.kind].total += 1;
    if (earnedIds.has(trophy.id)) counts[trophy.kind].earned += 1;
  }
  counts.missable = {
    earned: trophies.filter((t) => t.missable && earnedIds.has(t.id)).length,
    total: trophies.filter((t) => t.missable).length,
  };
  return counts;
}
