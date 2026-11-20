// Leonida Platinum — the hand-in program for the gta6-trophy-guide-01 entry.
//
// What it does, in three steps:
//   1. Copies the guide (app/) and its screenshots (screenshots/) from this
//      repository into the output directory.
//   2. Asks the kit's library, vendor/makefun-frontend.ts, to build the
//      dossier from those copied files and writes it as dossier.json.
//   3. Writes nothing else, so two runs of this program produce the same
//      bytes: the copy is a plain recursive copy and the dossier is built
//      from the copied files alone.
//
// The output directory is /output, or $MAKEFUN_OUTPUT_DIR when that is set
// (the local way to run it is: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts).
// Node 22 runs this file as-is; only the standard library is used, plus the
// kit's own buildDossier, which reads files and never touches the network.
import { buildDossier } from './vendor/makefun-frontend.ts';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The repository root: the directory this file lives in.
const repoRoot = dirname(fileURLToPath(import.meta.url));

// Where the entry is handed in. /output in the grader, or the caller's
// directory when MAKEFUN_OUTPUT_DIR is set for a local run.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The caps the competition's gate holds the entry to: the dossier text is
// capped at 160 KiB, at most 4 screenshots of at most 256 KiB each, app/ at
// most 993 files and directories and 48 MiB, paths at most 1,000 bytes.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) return;
  cpSync(from, to, { recursive: true });
}

function main(): void {
  // Start clean: remove any previous hand-in so stale files cannot linger.
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  // The guide itself, then its screenshots.
  copyTree('app');
  copyTree('screenshots');

  // The dossier is built from the copied files, so it always describes
  // exactly what was handed in — and the same input gives the same bytes.
  const dossier = buildDossier(outputDir, dossierCaps);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

main();
