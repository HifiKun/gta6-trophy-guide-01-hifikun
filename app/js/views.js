// Views for Leonida Platinum: how each trophy, the roadmap and the
// missables list are drawn. The data stays dumb JSON; this file decides
// what the reader sees, including the spoiler rule.
import { saveEarned } from './store.js';

export const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABEL = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
};

export const STAGES = [
  { n: 1, title: 'Story first', blurb: 'Play the story straight through: the opening mission, all four chapters, the named story missions and the final mission. Twelve trophies, including the first gold of the set, land here just by finishing the story.' },
  { n: 2, title: 'Strangers & side missions', blurb: 'The strangers of Leonida: finish each stranger’s strand to its final mission — Andy, Kenton, Billy, Randy and Tyrone — plus Bret’s hunt. Any eight finished strands earn Strangers & Freaks.' },
  { n: 3, title: 'Activities sampler', blurb: 'Try everything once and win what can be won: the nine activity types, the shooting range golds, the drone races, the races, fishing with Cal, an arcade game, bowling and a melee drive-by. The 50 challenges tally builds here too.' },
  { n: 4, title: 'Collectibles sweep', blurb: 'The long exploration stage: meditation spots, card sets, WAiNK locations, vehicles, all 52 areas, the eight garages and the Scooter Bros registrations. Do it district by district so nothing is left behind.' },
  { n: 5, title: 'Combat & chaos', blurb: 'Wanted levels, robberies and fights: the partner trophies, Combat Focus, the airport exit, the tanks, the clean jewelry robbery, the bank vaults, the armored truck and one illegal operation for each of the nine gangs.' },
  { n: 6, title: 'Money & mop-up', blurb: 'The quiet and the strange: the Ocean Beach cocktail, the showroom smash, the partner moments, the choice tally, the second-try trophy and the easter egg — then the money trophies, the 250 stunts, 100% completion and the platinum.' },
];

export const MISSABLE_WHEN = {
  2: 'The opening mission — play it to the end the first time through.',
  3: 'Chapter 1 closes when its last mission ends; finish it in order.',
  4: 'Chapter 2 closes when its last mission ends; finish it in order.',
  5: 'Chapter 3 closes when its last mission ends; finish it in order.',
  6: 'Chapter 4 closes when its last mission ends; finish it in order.',
  7: 'The final mission — the last story beat; finish the story.',
  8: 'Story mission Breakfast Run — take it when it appears.',
  9: 'Story mission The Cartel Heist — take it when it appears.',
  10: 'Story mission Child’s Play — take it when it appears.',
  11: 'Story mission Headliners — take it when it appears.',
  12: 'Story mission VCIA Takedown — take it when it appears.',
  13: 'Story mission Operation Savage Glory — take it when it appears.',
  33: 'Needs your partner beside you at four stars — a moment that may not repeat.',
  34: 'Needs three shop robberies in a row with your partner and the wanted level held.',
  44: 'A story-moment cocktail on Ocean Beach — do it when the chance comes.',
  47: 'A partner story beat with no step given — play the story with your partner.',
  48: 'A tally of choices to 500 — choices cannot be unmade.',
  49: 'Needs a failure followed by a second-try success — it may not come twice.',
  50: 'A strange event, witnessed once — explore the odd corners of Leonida.',
};

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A story trophy whose name and description stay hidden while spoiler-safe
// is on and the trophy is not yet earned.
function isSpoilerHidden(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function trophyCard(trophy, earned, spoilerOn, onToggle) {
  const li = el('li', 'trophy' + (earned.has(trophy.id) ? ' earned' : ''));
  li.dataset.trophyId = String(trophy.id);
  const head = el('div', 'trophy-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', 'Earned: ' + trophy.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveEarned(earned);
    onToggle();
  });
  const title = el('div', 'trophy-title');
  const h3 = el('h3');
  if (isSpoilerHidden(trophy, earned, spoilerOn)) {
    h3.appendChild(el('span', 'hidden-name', 'Hidden story trophy — earn it to reveal its name'));
  } else {
    h3.textContent = trophy.name;
  }
  title.appendChild(h3);
  const desc = el('p', 'official-desc');
  desc.textContent = isSpoilerHidden(trophy, earned, spoilerOn)
    ? 'Hidden on PlayStation until earned.'
    : trophy.description;
  title.appendChild(desc);
  const tags = el('div', 'tags');
  tags.appendChild(el('span', 'tag grade-' + trophy.grade, GRADE_LABEL[trophy.grade]));
  tags.appendChild(el('span', 'tag kind', KIND_LABEL[trophy.kind]));
  if (trophy.missable) tags.appendChild(el('span', 'tag missable', 'Missable'));
  if (trophy.hidden) tags.appendChild(el('span', 'tag hidden-flag', 'Hidden on PSN'));
  title.appendChild(tags);
  if (trophy.psnCount !== null && trophy.psnCount !== undefined) {
    const count = el('p', 'psn-count', 'PSN tracks a count: ' + trophy.psnCount.toLocaleString('en-US'));
    title.appendChild(count);
  }
  head.appendChild(box);
  head.appendChild(title);
  li.appendChild(head);
  const details = document.createElement('details');
  const summary = el('summary', null, 'Guide & sources');
  details.appendChild(summary);
  const guide = el('p', null, trophy.guide);
  details.appendChild(guide);
  const sources = el('div', 'sources');
  sources.appendChild(el('strong', null, 'Sources: '));
  sources.appendChild(document.createTextNode(trophy.sources.join(' · ')));
  details.appendChild(sources);
  li.appendChild(details);
  return li;
}

export function renderChecklist(listEl, trophies, earned, spoilerOn, filters, onToggle) {
  listEl.textContent = '';
  const q = filters.query.trim().toLowerCase();
  let shown = 0;
  for (const t of trophies) {
    if (filters.kind !== 'all' && t.kind !== filters.kind) continue;
    if (filters.grade !== 'all' && t.grade !== filters.grade) continue;
    if (filters.missableOnly && !t.missable) continue;
    if (filters.unearnedOnly && earned.has(t.id)) continue;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) continue;
    listEl.appendChild(trophyCard(t, earned, spoilerOn, onToggle));
    shown += 1;
  }
  return shown;
}

export function renderRoadmap(host, trophies, earned, spoilerOn, onToggle) {
  host.textContent = '';
  for (const stage of STAGES) {
    const box = el('section', 'stage');
    const members = trophies.filter((t) => t.stage === stage.n);
    const got = members.filter((t) => earned.has(t.id)).length;
    const h3 = el('h3', null, 'Stage ' + stage.n + ' — ' + stage.title + ' ');
    h3.appendChild(el('span', 'stage-count', got + ' / ' + members.length + ' earned'));
    box.appendChild(h3);
    box.appendChild(el('p', null, stage.blurb));
    const list = el('ol', 'trophy-list');
    for (const t of members) list.appendChild(trophyCard(t, earned, spoilerOn, onToggle));
    box.appendChild(list);
    host.appendChild(box);
  }
}

export function renderMissables(listEl, trophies, earned, spoilerOn, onToggle) {
  listEl.textContent = '';
  for (const t of trophies.filter((x) => x.missable)) {
    const card = trophyCard(t, earned, spoilerOn, onToggle);
    const when = el('p', 'miss-when');
    when.appendChild(el('strong', null, 'When it can be missed: '));
    when.appendChild(document.createTextNode(MISSABLE_WHEN[t.id] || 'Play carefully — the description gives no second chance.'));
    card.appendChild(when);
    listEl.appendChild(card);
  }
}

export function renderProgress(earned, trophies) {
  const total = trophies.length;
  const got = [...earned].filter((id) => trophies.some((t) => t.id === id)).length;
  document.getElementById('earnedCount').textContent = String(got);
  const meter = document.getElementById('progressMeter');
  meter.setAttribute('aria-valuenow', String(got));
  document.getElementById('progressFill').style.width = (total ? (got / total) * 100 : 0) + '%';
  const counts = document.getElementById('gradeCounts');
  counts.textContent = '';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const gotGrade = inGrade.filter((t) => earned.has(t.id)).length;
    const li = el('li');
    li.appendChild(el('b', null, gotGrade + ' / ' + inGrade.length));
    li.appendChild(document.createTextNode(' ' + GRADE_LABEL[grade].toLowerCase()));
    counts.appendChild(li);
  }
  const kinds = {};
  for (const t of trophies) {
    kinds[t.kind] = kinds[t.kind] || [0, 0];
    kinds[t.kind][1] += 1;
    if (earned.has(t.id)) kinds[t.kind][0] += 1;
  }
  for (const kind of ['story', 'collectibles', 'activities']) {
    const [g, n] = kinds[kind] || [0, 0];
    const li = el('li');
    li.appendChild(el('b', null, g + ' / ' + n));
    li.appendChild(document.createTextNode(' ' + KIND_LABEL[kind].toLowerCase()));
    counts.appendChild(li);
  }
  document.getElementById('platinumNote').textContent = got === total
    ? 'Platinum earned: Vice Got a Price! — Leonida Legend.'
    : 'Platinum: Vice Got a Price! — earn the other 54.';
}
