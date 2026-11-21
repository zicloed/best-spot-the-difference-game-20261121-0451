// Kestrel Cove — the hand-in program (Node 22, standard library only).
// It copies the game and its screenshots from beside this file into the
// output directory and writes dossier.json, the summary the judge reads,
// using the vendored make.fun library. The game itself is plain static
// files under game/; it loads nothing over the network.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree(join(here, 'game'), join(out, 'game'));
copyTree(join(here, 'screenshots'), join(out, 'screenshots'));

// The scorer's caps for this bounty: at most 4 screenshots, each at most
// 256 KiB; game/ at most 993 files and 48 MiB in all, every path at most
// 1,000 bytes; the dossier text at most 160 KiB. The dossier must be byte
// for byte what buildDossier writes, or the gate refuses the entry.
const dossierPath = join(out, 'dossier.json');
writeFileSync(dossierPath, buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
}));

// Read the dossier back and confirm it landed before reporting success,
// so an empty or missing file can never pass silently.
const dossierBytes = readFileSync(dossierPath, 'utf8').length;
if (dossierBytes === 0) throw new Error('dossier.json came out empty');
console.log(`handed in: game/ + screenshots/ + dossier.json (${dossierBytes} bytes)`);
