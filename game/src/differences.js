// The catalogue of differences for Kestrel Cove.
// Each entry is one thing that can differ between the two panels: where
// to tap (hot), what it is called when found (name), and a line the game
// shows on a find (blurb). The scene painter reads the id and draws the
// changed variant; the base picture always draws the base variant.
// Hotspots are in panel pixels (560 x 420).

import { pickMany } from './rng.js';

export const PANEL_W = 560;
export const PANEL_H = 420;

export const DIFFS = [
  {
    id: 'gull',
    name: 'The missing gull',
    blurb: 'One gull flew off to the other cove.',
    hot: { x: 262, y: 82, r: 20 },
  },
  {
    id: 'sail',
    name: 'The repainted sail',
    blurb: 'Someone repainted the sail white overnight.',
    hot: { x: 232, y: 312, r: 24 },
  },
  {
    id: 'window',
    name: 'The dark window',
    blurb: 'The cottage window went dark.',
    hot: { x: 76, y: 266, r: 15 },
  },
  {
    id: 'smoke',
    name: 'The missing smoke',
    blurb: 'The chimney stopped smoking.',
    hot: { x: 108, y: 224, r: 18 },
  },
  {
    id: 'pine',
    name: 'The missing pine',
    blurb: 'A pine vanished from the cliff.',
    hot: { x: 132, y: 288, r: 22 },
  },
  {
    id: 'cloud',
    name: 'The missing cloud',
    blurb: 'A cloud drifted away.',
    hot: { x: 300, y: 46, r: 32 },
  },
  {
    id: 'lantern',
    name: 'The unlit lantern',
    blurb: 'The pier lantern went out.',
    hot: { x: 106, y: 344, r: 15 },
  },
  {
    id: 'fish',
    name: 'The missing fish',
    blurb: 'The jumping fish dove back down.',
    hot: { x: 202, y: 378, r: 17 },
  },
  {
    id: 'flag',
    name: 'The missing flag',
    blurb: 'The lighthouse flag is gone.',
    hot: { x: 493, y: 138, r: 15 },
  },
  {
    id: 'buoy',
    name: 'The yellow buoy',
    blurb: 'The buoy changed colour.',
    hot: { x: 272, y: 368, r: 15 },
  },
  {
    id: 'rock',
    name: 'The missing rock',
    blurb: 'A rock slipped under the water.',
    hot: { x: 420, y: 386, r: 17 },
  },
  {
    id: 'boat',
    name: 'The missing boat',
    blurb: 'The little boat sailed away.',
    hot: { x: 332, y: 358, r: 22 },
  },
];

// Choose `count` differences for a round from the catalogue, seeded so a
// replay shuffles a fresh set. The easiest ones are weighted first for
// round 1 by passing a shorter pool.
export function chooseDiffs(rng, count, pool = DIFFS) {
  return pickMany(rng, pool, count);
}

// True when a click at (x, y) lands on this difference's hotspot.
export function hitTest(diff, x, y) {
  const dx = x - diff.hot.x;
  const dy = y - diff.hot.y;
  return dx * dx + dy * dy <= diff.hot.r * diff.hot.r;
}
