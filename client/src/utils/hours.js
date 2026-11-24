const round2 = (n) => Number(n.toFixed(2));

export const getEntryHours = (entry) =>
  round2((Number(entry.onSiteHours) || 0) + (Number(entry.totalTravelTime) || 0));

export const sumHours = (entries) =>
  round2(entries.reduce((sum, entry) => sum + getEntryHours(entry), 0));