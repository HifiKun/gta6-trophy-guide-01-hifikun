// The missables view: every trophy that can be missed or has a story window,
// with when it can be missed — and a plain note that everything else is safe
// to mop up after the story.

import { GRADE_LABELS, isMasked } from '../filters.js';

export function renderMissablesView(container, state) {
  container.replaceChildren();

  const intro = document.createElement('div');
  intro.className = 'callout warn';
  const introTitle = document.createElement('h2');
  introTitle.textContent = 'Missable trophies — read this first';
  const introText = document.createElement('p');
  introText.textContent = 'Only one trophy is reported as truly missable, and five more have story windows. Everything else in the list can be earned after the credits roll, so there is no need to rush the open world. The reports below are not confirmed in-game — the game released 19 November 2026 — but they are the best warning available, and the safe play costs nothing: meditate early, and finish the stranger strands before the story ends.';
  intro.append(introTitle, introText);
  container.append(intro);

  const missable = state.trophies.filter((t) => t.missable);
  for (const trophy of missable) {
    const masked = isMasked(trophy, state.earned, state.spoilerOn);
    const card = document.createElement('article');
    card.className = 'missable-card';
    const heading = document.createElement('h2');
    heading.textContent = `${state.earned.has(trophy.id) ? '✓ ' : ''}${masked ? 'Hidden trophy' : trophy.name}`;
    const official = document.createElement('p');
    official.className = 'official';
    official.textContent = masked
      ? 'Hidden until earned.'
      : `${GRADE_LABELS[trophy.grade]} — ${trophy.description}`;
    const note = document.createElement('p');
    note.textContent = masked
      ? 'This trophy has a story window. Finish its strand before the story ends.'
      : trophy.missable_note ?? 'Reported to have a story window.';
    const sources = document.createElement('p');
    sources.className = 'official';
    sources.textContent = masked
      ? 'Sources are shown with the guide once the trophy is earned.'
      : `Sources: ${trophy.sources.join('; ')}`;
    card.append(heading, official, note, sources);
    container.append(card);
  }

  const safe = document.createElement('div');
  safe.className = 'callout';
  const safeTitle = document.createElement('h2');
  safeTitle.textContent = 'Everything else is safe';
  const safeText = document.createElement('p');
  safeText.textContent = 'The other 48 trophies carry no missable report: chapters, races, collectibles, robberies and the 100% completion gold can all be finished after the story. If a trophy above is already missed, a new playthrough is the only fix the reports suggest — which is why this page exists before you start.';
  safe.append(safeTitle, safeText);
  container.append(safe);
}
