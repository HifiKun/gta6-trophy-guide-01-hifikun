// Boot and routing for Leonida Platinum. Hash routes: #checklist (optionally
// #checklist/<id> to open one trophy's guide), #roadmap, #missables.
// ?demo=1 seeds demo progress (13 of 55 earned) for screenshots; a plain open
// shows the visitor's own saved progress. ?spoiler=1 turns the spoiler
// setting on for that visit.

import { DEMO_EARNED_IDS, demoSeedIsRequested, loadTrophyList, spoilerParamIsRequested } from './data.js';
import { countEarnedByGrade, countEarnedByKind } from './filters.js';
import { readSavedProgress, readSpoilerSetting, saveProgress, saveSpoilerSetting } from './store.js';
import { renderChecklistView } from './views/checklist.js';
import { renderRoadmapView } from './views/roadmap.js';
import { renderMissablesView } from './views/missables.js';

const viewRoot = document.getElementById('view');
const earnedCount = document.getElementById('earned-count');
const countBars = document.getElementById('count-bars');

const state = {
  trophies: [],
  earned: new Set(),
  spoilerOn: false,
  selectedId: null,
  filters: { search: '', kind: 'all', grade: 'all', hideEarned: false },
  onToggleEarned,
  onSelectTrophy,
  onSpoilerChange,
  onProgressChange,
};

function renderProgressHeader() {
  earnedCount.textContent = String(state.earned.size);
  countBars.replaceChildren();
  const byGrade = countEarnedByGrade(state.trophies, state.earned);
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const counts = byGrade[grade];
    if (!counts) continue;
    const chip = document.createElement('span');
    const bold = document.createElement('b');
    bold.textContent = `${counts.earned}/${counts.total}`;
    chip.append(bold, document.createTextNode(` ${grade}`));
    countBars.append(chip);
  }
  const byKind = countEarnedByKind(state.trophies, state.earned);
  for (const kind of ['story', 'collectibles', 'activities', 'missable']) {
    const counts = byKind[kind];
    const chip = document.createElement('span');
    const bold = document.createElement('b');
    bold.textContent = `${counts.earned}/${counts.total}`;
    chip.append(bold, document.createTextNode(` ${kind}`));
    countBars.append(chip);
  }
}

function onToggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveProgress(state.earned);
  renderProgressHeader();
  renderCurrentRoute();
}

function onSelectTrophy(id) {
  state.selectedId = id;
  history.replaceState(null, '', `#checklist/${id}`);
  renderCurrentRoute();
}

function onSpoilerChange(on) {
  state.spoilerOn = on;
  saveSpoilerSetting(on);
  renderCurrentRoute();
}

function onProgressChange() {
  saveProgress(state.earned);
  renderProgressHeader();
  renderCurrentRoute();
}

function parseRoute() {
  const hash = location.hash.replace(/^#/, '') || 'checklist';
  const [page, id] = hash.split('/');
  return { page, id: id ? Number(id) : null };
}

function renderCurrentRoute() {
  const { page, id } = parseRoute();
  if (id && state.trophies.some((t) => t.id === id)) state.selectedId = id;
  for (const tab of ['checklist', 'roadmap', 'missables']) {
    const element = document.getElementById(`tab-${tab}`);
    if (page === tab) element.setAttribute('aria-current', 'page');
    else element.removeAttribute('aria-current');
  }
  if (page === 'roadmap') renderRoadmapView(viewRoot, state);
  else if (page === 'missables') renderMissablesView(viewRoot, state);
  else renderChecklistView(viewRoot, state);
}

async function bootApp() {
  state.trophies = await loadTrophyList();
  if (demoSeedIsRequested()) {
    state.earned = new Set(DEMO_EARNED_IDS);
    saveProgress(state.earned);
  } else {
    state.earned = readSavedProgress();
  }
  state.spoilerOn = spoilerParamIsRequested() ? true : readSpoilerSetting();
  if (spoilerParamIsRequested()) saveSpoilerSetting(true);
  const { id } = parseRoute();
  if (id && state.trophies.some((t) => t.id === id)) state.selectedId = id;
  else if (demoSeedIsRequested()) state.selectedId = 28;
  renderProgressHeader();
  renderCurrentRoute();
  window.addEventListener('hashchange', renderCurrentRoute);
}

bootApp().catch((error) => {
  viewRoot.replaceChildren();
  const message = document.createElement('p');
  message.className = 'empty';
  message.textContent = `The guide could not load its trophy data: ${error.message}`;
  viewRoot.append(message);
});
