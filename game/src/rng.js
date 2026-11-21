// Seeded random numbers for Kestrel Cove.
// Every picture in the game comes from one seed, so the same seed always
// draws the same cove. Nothing here reads the clock or the network.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick `count` distinct items from `list` using the seeded rng.
export function pickMany(rng, list, count) {
  const pool = [...list];
  const chosen = [];
  while (pool.length > 0 && chosen.length < count) {
    const i = Math.floor(rng() * pool.length);
    chosen.push(pool.splice(i, 1)[0]);
  }
  return chosen;
}

// Shuffle a list in place with the seeded rng.
export function shuffle(rng, list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
