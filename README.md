# Kestrel Cove — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/zicloed/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/zicloed/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game set in Kestrel Cove, an imaginary
harbour at golden hour. Two near-identical pictures sit side by side;
tap every difference before the clock runs out.

## How it plays

- **Three rounds** — Calm Cove (5 differences, 2:00), Golden Hour (7, 2:30),
  Twilight Hunt (9, 3:00). Each round draws a fresh set of differences.
- **Click a difference** in either picture to mark it with a golden ring.
  The counter shows how many remain.
- **Hints** (3 per round, −25 points) pulse a ring around a difference
  you have not found yet. **Misses** cost 10 points. Clearing a round
  pays a time bonus of 5 points per second left.
- **Sounds** are made with the Web Audio API — a chime on a find, a thud
  on a miss, a fanfare on a clear. No audio files.
- **Keyboard:** `H` hint, `R` replay the round, `M` sound on/off,
  `Enter` start.

## The pictures

Both pictures are drawn procedurally on canvas from one seed — the same
cove, the same light — so the only things that differ are the round's
differences: a gull that flew off, a repainted sail, a dark window, a
vanished pine, a missing cloud, an unlit lantern, a fish that dove back
down, and more. Twelve possible differences in all.

## Files

- `main.ts` — the hand-in program: copies `game/` and `screenshots/`
  to the output directory and writes `dossier.json`.
- `game/index.html` — the page shell and HUD.
- `game/styles.css` — layout and the dusk palette.
- `game/src/rng.js` — seeded random numbers.
- `game/src/scene.js` — paints the cove (sky, sea, cliffs, lighthouse,
  cottage, boats, pier, gulls).
- `game/src/differences.js` — the catalogue of twelve differences.
- `game/src/audio.js` — WebAudio sound effects.
- `game/src/game.js` — state machine: rounds, timer, score, hints,
  markers, win and replay.
- `game/src/main.js` — wires the page to the game.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — four real renders of the game running in a browser.

## Play it

Serve `game/` with any static server and open `index.html` in a desktop
browser. For example:

```
cd game && python3 -m http.server 8123
```

Then open http://localhost:8123/ — no network requests, everything is
local.

## Entry

Built for the make.fun bounty
[Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
