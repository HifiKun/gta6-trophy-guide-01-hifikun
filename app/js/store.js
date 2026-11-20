// Progress store for Leonida Platinum.
// One job: remember which trophies are earned, in this browser only.
// Nothing here touches the network; export is a file download, import reads
// a file the reader picks. The demo seed (?demo=1) is a fixed preview set.
export const STORAGE_KEY = 'leonida-platinum-progress-v1';
export const SPOILER_KEY = 'leonida-platinum-spoiler-v1';

// The demo preview: 13 trophies a player earns early, so screenshots and
// first visits show the tracker part-way instead of empty.
export const DEMO_EARNED = [2, 3, 8, 16, 20, 21, 37, 44, 45, 46, 51, 53, 55];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Private mode or a full store: progress just does not persist.
  }
}

export function loadSpoiler() {
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveSpoiler(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
  } catch {
    // Ignore: the toggle still works for this visit.
  }
}

// Seed the demo set only when the reader asked for it (?demo=1) and no
// progress exists yet, so a real player's saved progress is never clobbered.
export function maybeSeedDemo(earned) {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') !== '1') return earned;
  if (earned.size > 0) return earned;
  const seeded = new Set(DEMO_EARNED);
  saveEarned(seeded);
  return seeded;
}

export function exportFile(earned) {
  const payload = {
    app: 'leonida-platinum',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-platinum-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Read an exported progress file back. Returns a Set of earned ids, or null
// when the file is not one of ours.
export async function importFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) return null;
  return new Set(ids.filter((n) => Number.isInteger(n)));
}
