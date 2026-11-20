// Loads the trophy list and handles the deterministic demo seed used for screenshots.
// The app fetches only its own data file (data/trophies.json, a file under app/);
// it makes no request anywhere else.

export async function loadTrophyList() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const document = await response.json();
  return document.trophies;
}

// The 13 trophies the demo seed marks earned: a spread of early story,
// activity and collectible trophies, so screenshots show part-way progress.
export const DEMO_EARNED_IDS = [2, 3, 8, 16, 20, 21, 33, 35, 42, 44, 46, 51, 55];

export function demoSeedIsRequested() {
  return new URLSearchParams(location.search).get('demo') === '1';
}

export function spoilerParamIsRequested() {
  return new URLSearchParams(location.search).get('spoiler') === '1';
}
