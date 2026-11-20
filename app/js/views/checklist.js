// The checklist view: toolbar (search, kind and grade filters, spoiler
// toggle, export and import) plus the trophy list beside the guide pane.

import { GRADE_LABELS, KIND_LABELS, isMasked, visibleTrophies } from '../filters.js';
import { exportProgressFile, importProgressFile } from '../store.js';
import { renderTrophyDetail } from './detail.js';

function medalDot(grade) {
  const dot = document.createElement('span');
  dot.className = `medal ${grade}`;
  dot.setAttribute('aria-label', grade);
  return dot;
}

function pill(text, extraClass = '') {
  const span = document.createElement('span');
  span.className = `pill ${extraClass}`.trim();
  span.textContent = text;
  return span;
}

function buildToolbar(state, onFilterChange) {
  const bar = document.createElement('div');
  bar.className = 'toolbar';

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search trophies…';
  search.setAttribute('aria-label', 'Search trophies');
  search.value = state.filters.search;
  search.addEventListener('input', () => {
    state.filters.search = search.value;
    onFilterChange();
  });
  bar.append(search);

  const kindLabel = document.createElement('label');
  kindLabel.textContent = 'Kind ';
  const kind = document.createElement('select');
  kind.setAttribute('aria-label', 'Filter by kind');
  for (const value of ['all', 'story', 'missable', 'collectibles', 'activities']) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value === 'all' ? 'All kinds' : KIND_LABELS[value];
    if (state.filters.kind === value) option.selected = true;
    kind.append(option);
  }
  kind.addEventListener('change', () => {
    state.filters.kind = kind.value;
    onFilterChange();
  });
  kindLabel.append(kind);
  bar.append(kindLabel);

  const gradeLabel = document.createElement('label');
  gradeLabel.textContent = 'Grade ';
  const grade = document.createElement('select');
  grade.setAttribute('aria-label', 'Filter by grade');
  for (const value of ['all', 'platinum', 'gold', 'silver', 'bronze']) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value === 'all' ? 'All grades' : GRADE_LABELS[value];
    if (state.filters.grade === value) option.selected = true;
    grade.append(option);
  }
  grade.addEventListener('change', () => {
    state.filters.grade = grade.value;
    onFilterChange();
  });
  gradeLabel.append(grade);
  bar.append(gradeLabel);

  const hideLabel = document.createElement('label');
  const hideEarned = document.createElement('input');
  hideEarned.type = 'checkbox';
  hideEarned.checked = state.filters.hideEarned;
  hideEarned.addEventListener('change', () => {
    state.filters.hideEarned = hideEarned.checked;
    onFilterChange();
  });
  hideLabel.append(hideEarned, document.createTextNode(' Hide earned'));
  bar.append(hideLabel);

  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'btn ghost';
  exportButton.textContent = 'Export progress';
  exportButton.addEventListener('click', () => exportProgressFile(state.earned, state.spoilerOn));
  bar.append(exportButton);

  const importLabel = document.createElement('label');
  importLabel.className = 'btn ghost';
  importLabel.textContent = 'Import progress';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json';
  importInput.hidden = true;
  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      const validIds = new Set(state.trophies.map((t) => t.id));
      const result = await importProgressFile(file, validIds);
      state.earned = result.earned;
      if (typeof result.spoiler === 'boolean') state.onSpoilerChange(result.spoiler);
      state.onProgressChange();
    } catch (error) {
      alert(`Could not import that file: ${error.message}`);
    }
    importInput.value = '';
  });
  importLabel.append(importInput);
  bar.append(importLabel);

  const spoilerLabel = document.createElement('label');
  spoilerLabel.className = 'spoiler-toggle';
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = state.spoilerOn;
  spoilerBox.addEventListener('change', () => state.onSpoilerChange(spoilerBox.checked));
  spoilerLabel.append(spoilerBox, document.createTextNode(' Hide story spoilers'));
  bar.append(spoilerLabel);

  return bar;
}

export function renderChecklistView(container, state) {
  container.replaceChildren();

  const grid = document.createElement('div');
  grid.className = 'checklist-grid';
  const listColumn = document.createElement('div');
  const detail = document.createElement('aside');
  detail.className = 'detail';
  grid.append(listColumn, detail);
  container.append(grid);

  const list = document.createElement('ul');
  list.className = 'trophy-list';

  function renderList() {
    list.replaceChildren();
    const shown = visibleTrophies(state.trophies, state.filters, state.earned);
    if (shown.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'No trophies match these filters.';
      list.append(empty);
      return;
    }
    for (const trophy of shown) {
      const masked = isMasked(trophy, state.earned, state.spoilerOn);
      const row = document.createElement('li');
      row.className = 'trophy-row';
      if (state.earned.has(trophy.id)) row.classList.add('earned');
      if (state.selectedId === trophy.id) row.classList.add('selected');

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = state.earned.has(trophy.id);
      box.setAttribute('aria-label', `Mark ${masked ? 'hidden trophy' : trophy.name} as earned`);
      box.addEventListener('click', (event) => event.stopPropagation());
      box.addEventListener('change', () => state.onToggleEarned(trophy.id));
      row.append(box, medalDot(trophy.grade));

      const body = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = masked ? 'Hidden trophy' : trophy.name;
      const desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = masked ? 'Hidden until earned.' : trophy.description;
      const meta = document.createElement('div');
      meta.className = 'trophy-meta';
      meta.append(pill(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
      meta.append(pill(KIND_LABELS[trophy.kind]));
      if (trophy.hidden) meta.append(pill('Hidden on PSN', 'hidden'));
      if (trophy.missable) meta.append(pill('Missable', 'missable'));
      if (trophy.psn_target !== null && trophy.psn_target !== undefined) {
        meta.append(pill(`PSN target: ${trophy.psn_target.toLocaleString('en-US')}`));
      }
      body.append(name, desc, meta);
      row.append(body);

      row.addEventListener('click', () => state.onSelectTrophy(trophy.id));
      list.append(row);
    }
  }

  function renderDetail() {
    const selected = state.trophies.find((t) => t.id === state.selectedId)
      ?? visibleTrophies(state.trophies, state.filters, state.earned)[0];
    if (!selected) {
      detail.replaceChildren();
      const empty = document.createElement('p');
      empty.textContent = 'Select a trophy to read its guide and sources.';
      detail.append(empty);
      return;
    }
    renderTrophyDetail(detail, selected, state);
  }

  function refresh() {
    renderList();
    renderDetail();
  }

  listColumn.append(buildToolbar(state, refresh), list);
  refresh();
  return { refresh };
}
