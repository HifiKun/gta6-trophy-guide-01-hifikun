// The guide pane: one trophy's official description, grade, kind, missable
// note, our own-words guide and the sources that guide cites, beside it.

import { GRADE_LABELS, KIND_LABELS, isMasked } from '../filters.js';

function pill(text, extraClass = '') {
  const span = document.createElement('span');
  span.className = `pill ${extraClass}`.trim();
  span.textContent = text;
  return span;
}

function sectionHeading(text) {
  const heading = document.createElement('h3');
  heading.textContent = text;
  return heading;
}

export function renderTrophyDetail(container, trophy, state) {
  container.replaceChildren();
  const masked = isMasked(trophy, state.earned, state.spoilerOn);

  const name = document.createElement('h2');
  name.textContent = masked ? 'Hidden trophy' : trophy.name;
  container.append(name);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(pill(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
  meta.append(pill(KIND_LABELS[trophy.kind]));
  if (trophy.hidden) meta.append(pill('Hidden on PSN', 'hidden'));
  if (trophy.missable) meta.append(pill('Missable', 'missable'));
  container.append(meta);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = masked
    ? 'Hidden until earned — turn the spoiler setting off, or earn this story trophy, to reveal its name and description.'
    : `Official description: “${trophy.description}”`;
  container.append(official);

  if (trophy.psn_target !== null && trophy.psn_target !== undefined) {
    const target = document.createElement('p');
    target.textContent = `PSN progress target: ${trophy.psn_target.toLocaleString('en-US')}.`;
    container.append(target);
  }

  if (trophy.missable && trophy.missable_note) {
    container.append(sectionHeading('When it can be missed'));
    const note = document.createElement('p');
    note.textContent = masked
      ? 'This trophy has a story window. Finish its strand before the story ends.'
      : trophy.missable_note;
    container.append(note);
  }

  if (!masked) {
    container.append(sectionHeading('Sources'));
    const sources = document.createElement('ul');
    sources.className = 'sources';
    for (const source of trophy.sources) {
      const item = document.createElement('li');
      item.textContent = source;
      sources.append(item);
    }
    container.append(sources);

    container.append(sectionHeading('Guide — our own words'));
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    container.append(guide);
  }

  const earned = state.earned.has(trophy.id);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn earn-btn';
  toggle.textContent = earned ? '✓ Earned — mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => state.onToggleEarned(trophy.id));
  container.append(toggle);
}
