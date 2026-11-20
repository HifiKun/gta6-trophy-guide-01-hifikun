// Progress and settings, kept in this browser only (localStorage).
// Export writes a JSON file; import reads one back and validates every id
// against the trophy list before applying it.

const PROGRESS_KEY = 'leonida-platinum-progress-v1';
const SPOILER_KEY = 'leonida-platinum-spoiler-v1';

export function readSavedProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earnedIds) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earnedIds].sort((a, b) => a - b)));
}

export function readSpoilerSetting() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoilerSetting(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}

export function exportProgressFile(earnedIds, spoilerOn) {
  const payload = {
    app: 'leonida-platinum',
    version: 1,
    exportedAt: new Date().toISOString(),
    spoiler: spoilerOn,
    earned: [...earnedIds].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file, validIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(earned)) throw new Error('That file holds no earned list.');
  const kept = earned.filter((id) => validIds.has(id));
  return { earned: new Set(kept), spoiler: parsed.spoiler === true };
}
