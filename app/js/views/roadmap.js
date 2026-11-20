// The roadmap view: the order to earn the trophies in, in five stages built
// from the official descriptions — story first, strangers before the credits,
// then the open-world sweep, the money and mayhem, and the 100% finish.

import { GRADE_LABELS, isMasked } from '../filters.js';

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Play the story — Chapters 1 to 4',
    note: 'Chapters, the opening mission and the named missions, in order. Start the meditation spots now: one in Chapter 1 is reported to disappear when the chapter ends.',
  },
  {
    stage: 2,
    title: 'Strangers before the credits',
    note: 'The five character finales and the stranger strands. Their windows are reported to be tied to story progress, so finish them while the chapters are still open.',
  },
  {
    stage: 3,
    title: 'Open-world sweep',
    note: 'Collectibles and activities: cards, WAiNK spots, vehicles, areas, garages, races, stunts and the shooting range. Travel wide and tick off a whole area at a time.',
  },
  {
    stage: 4,
    title: 'Money and mayhem',
    note: 'Robberies, laundering and spending, plus the combat and world-moment trophies. Everything here is repeatable — a failed attempt only costs you the try.',
  },
  {
    stage: 5,
    title: 'The finish — final mission and 100%',
    note: 'Play the final mission, then mop up whatever the 100% counter still wants. The platinum pops the moment the last of the other 54 is earned.',
  },
];

export function renderRoadmapView(container, state) {
  container.replaceChildren();

  const intro = document.createElement('div');
  intro.className = 'callout';
  const introTitle = document.createElement('h2');
  introTitle.textContent = 'Roadmap to the platinum';
  const introText = document.createElement('p');
  introText.textContent = 'Five stages, in order, built from the official trophy descriptions. The only timing that matters is in stages 1 and 2: meditate from Chapter 1, and finish the stranger strands before the story ends. Everything else can be mopped up after the credits.';
  intro.append(introTitle, introText);
  container.append(intro);

  for (const stage of ROADMAP_STAGES) {
    const section = document.createElement('section');
    section.className = 'stage';
    const heading = document.createElement('h2');
    const number = document.createElement('span');
    number.className = 'stage-num';
    number.textContent = `Stage ${stage.stage}`;
    heading.append(number, document.createTextNode(stage.title));
    const note = document.createElement('p');
    note.className = 'stage-note';
    note.textContent = stage.note;
    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    const trophies = state.trophies.filter((t) => t.roadmap_stage === stage.stage);
    for (const trophy of trophies) {
      const masked = isMasked(trophy, state.earned, state.spoilerOn);
      const item = document.createElement('li');
      if (state.earned.has(trophy.id)) item.classList.add('earned');
      const name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = `${state.earned.has(trophy.id) ? '✓ ' : ''}${masked ? 'Hidden trophy' : trophy.name}`;
      const desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = masked ? 'Hidden until earned.' : `${GRADE_LABELS[trophy.grade]} — ${trophy.description}`;
      item.append(name, desc);
      list.append(item);
    }
    section.append(heading, note, list);
    container.append(section);
  }
}
