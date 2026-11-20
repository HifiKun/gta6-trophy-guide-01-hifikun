// Leonida Platinum — boot.
// Loads the trophy data, draws the three views, and keeps the checklist,
// the roadmap and the missables list in step with one shared progress set.
// Hash routing: #checklist, #roadmap, #missables. ?demo=1 seeds a 13/55
// preview when no progress is saved yet.
import {
  loadEarned, saveEarned, loadSpoiler, saveSpoiler,
  maybeSeedDemo, exportFile, importFile,
} from './store.js';
import {
  renderChecklist, renderRoadmap, renderMissables, renderProgress,
} from './views.js';

const ROUTES = ['checklist', 'roadmap', 'missables'];

const state = {
  trophies: [],
  earned: loadEarned(),
  spoiler: loadSpoiler(),
  filters: { query: '', kind: 'all', grade: 'all', missableOnly: false, unearnedOnly: false },
};

function drawAll() {
  renderProgress(state.earned, state.trophies);
  const shown = renderChecklist(
    document.getElementById('trophyList'),
    state.trophies, state.earned, state.spoiler, state.filters, drawAll,
  );
  renderRoadmap(
    document.getElementById('roadmapStages'),
    state.trophies, state.earned, state.spoiler, drawAll,
  );
  renderMissables(
    document.getElementById('missableList'),
    state.trophies, state.earned, state.spoiler, drawAll,
  );
  const note = document.getElementById('emptyNote');
  note.hidden = shown !== 0;
  const earnedTotal = state.earned.size;
  document.getElementById('showingLine').textContent =
    'Showing ' + shown + ' of ' + state.trophies.length + ' trophies · ' + earnedTotal + ' earned';
}

function route() {
  const want = location.hash.replace('#', '') || 'checklist';
  const view = ROUTES.includes(want) ? want : 'checklist';
  for (const r of ROUTES) {
    document.getElementById('view-' + r).hidden = r !== view;
  }
  for (const link of document.querySelectorAll('.tabs a')) {
    if (link.dataset.route === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  state.trophies = data.trophies;
  state.earned = maybeSeedDemo(state.earned);

  document.getElementById('searchBox').addEventListener('input', (e) => {
    state.filters.query = e.target.value;
    drawAll();
  });
  document.getElementById('kindFilter').addEventListener('change', (e) => {
    state.filters.kind = e.target.value;
    drawAll();
  });
  document.getElementById('gradeFilter').addEventListener('change', (e) => {
    state.filters.grade = e.target.value;
    drawAll();
  });
  document.getElementById('missableOnly').addEventListener('change', (e) => {
    state.filters.missableOnly = e.target.checked;
    drawAll();
  });
  document.getElementById('unearnedOnly').addEventListener('change', (e) => {
    state.filters.unearnedOnly = e.target.checked;
    drawAll();
  });

  const spoilerBox = document.getElementById('spoilerToggle');
  spoilerBox.checked = state.spoiler;
  spoilerBox.addEventListener('change', () => {
    state.spoiler = spoilerBox.checked;
    saveSpoiler(state.spoiler);
    drawAll();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    exportFile(state.earned);
  });
  const importInput = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      const imported = await importFile(file);
      if (imported === null) {
        alert('That file is not a Leonida Platinum progress export.');
      } else {
        state.earned = imported;
        saveEarned(state.earned);
        drawAll();
      }
    } catch {
      alert('Could not read that file — it does not look like a progress export.');
    }
    importInput.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      state.earned = new Set();
      saveEarned(state.earned);
      drawAll();
    }
  });

  window.addEventListener('hashchange', route);

  // Deep links for screenshots and sharing: ?open=<id> opens one trophy's
  // guide and scrolls it into view; ?spoiler=1 turns spoiler-safe on for
  // this visit (and saves the setting, as the toggle does).
  const params = new URLSearchParams(location.search);
  if (params.get('spoiler') === '1' && !state.spoiler) {
    state.spoiler = true;
    spoilerBox.checked = true;
    saveSpoiler(true);
  }
  // A preset search (?q=...) deep-links to one trophy: it fills the search
  // box and filters the checklist, so a shared link opens on that trophy.
  const preset = params.get('q');
  if (preset) {
    state.filters.query = preset;
    document.getElementById('searchBox').value = preset;
  }
  route();
  drawAll();
  const openId = Number(params.get('open'));
  if (openId) {
    const card = document.querySelector('[data-trophy-id="' + openId + '"]');
    const details = card && card.querySelector('details');
    if (details) details.open = true;
    // No scrolling here: headless screenshots of a scrolled page can
    // capture unpainted regions, so the opened guide stays where it is.
  }
}

boot();
