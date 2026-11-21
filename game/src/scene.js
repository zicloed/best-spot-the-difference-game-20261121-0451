// The cove itself: Kestrel Cove at golden hour.
// One function draws the whole picture on a canvas. The left panel calls
// it with no differences active; the right panel calls it with the round's
// differences active, and each feature draws its changed variant instead
// of its base one. Everything is placed from fixed coordinates, and only
// the stars and sparkles use the seed, so the two panels always agree
// except where a difference says otherwise.

import { mulberry32 } from './rng.js';

const SKY_TOP = [16, 24, 64];
const SKY_MID = [18, 92, 110];
const SKY_LOW = [232, 164, 92];
const CREAM = '#faeed2';
const GOLD = '#ffd68c';
const SEA_TOP = [20, 42, 66];
const SEA_BOT = [9, 24, 46];
const CLIFF = '#1a2b40';
const CLIFF_DARK = '#101c2e';
const PINE = '#0a1424';

function blend(a, b, t) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(
    a[1] + (b[1] - a[1]) * t,
  )},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function gull(ctx, x, y, s) {
  ctx.strokeStyle = '#fff4d6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x - s, y, s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + s, y, s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function pine(ctx, x, base, h) {
  const half = h / 3;
  poly(ctx, [[x, base - h], [x - half, base], [x + half, base]], PINE);
  ctx.fillStyle = PINE;
  ctx.fillRect(x - 3, base, 6, 9);
}

export function drawScene(ctx, W, H, seed, active, t) {
  const rng = mulberry32(seed);
  const has = (id) => active.has(id);

  // ---- sky ----
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, blend(SKY_TOP, SKY_TOP, 0));
  sky.addColorStop(0.55, blend(SKY_TOP, SKY_MID, 1));
  sky.addColorStop(1, blend(SKY_MID, SKY_LOW, 1));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 250);

  // stars, early ones in the upper sky
  ctx.fillStyle = '#fff4d6';
  for (let i = 0; i < 22; i++) {
    const x = 14 + rng() * (W - 28);
    const y = 10 + rng() * 110;
    const r = rng() < 0.75 ? 1 : 1.8;
    ctx.globalAlpha = 0.5 + rng() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // sun, low over the water
  ellipse(ctx, 390, 205, 46, 46, '#ffD68c');
  ellipse(ctx, 390, 205, 34, 34, '#ffe8b2');

  // clouds (the middle one can drift away)
  ctx.fillStyle = 'rgba(250, 238, 210, 0.85)';
  const cloud = (x, y, s) => {
    ellipse(ctx, x, y, 52 * s, 15 * s, 'rgba(250, 238, 210, 0.85)');
    ellipse(ctx, x - 30 * s, y + 6 * s, 32 * s, 11 * s, 'rgba(250, 238, 210, 0.8)');
    ellipse(ctx, x + 32 * s, y + 6 * s, 34 * s, 11 * s, 'rgba(250, 238, 210, 0.8)');
  };
  cloud(120, 70, 0.9);
  if (!has('cloud')) cloud(300, 46, 1.15);
  cloud(482, 92, 0.8);

  // ---- sea ----
  const sea = ctx.createLinearGradient(0, 250, 0, H);
  sea.addColorStop(0, blend(SEA_TOP, SEA_TOP, 0));
  sea.addColorStop(1, blend(SEA_TOP, SEA_BOT, 1));
  ctx.fillStyle = sea;
  ctx.fillRect(0, 250, W, H - 250);

  // sun's reflection, a shimmering streak
  ctx.fillStyle = 'rgba(255, 214, 140, 0.5)';
  for (let i = 0; i < 9; i++) {
    const y = 262 + i * 17;
    const wobble = Math.sin(t * 0.9 + i * 1.3) * 6;
    const half = 34 - i * 2.4;
    ctx.fillRect(390 - half + wobble, y, half * 2, 4);
  }
  // wave lines
  ctx.strokeStyle = 'rgba(140, 190, 220, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const y = 278 + i * 20;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 14) {
      const yy = y + Math.sin(x * 0.05 + t * 1.4 + i * 2) * 2.5;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // rocks in the water (the far one can slip under)
  ellipse(ctx, 180, 398, 26, 10, CLIFF_DARK);
  ellipse(ctx, 300, 404, 20, 8, CLIFF_DARK);
  if (!has('rock')) ellipse(ctx, 420, 388, 22, 9, CLIFF_DARK);

  // buoy, red and white — or yellow
  const buoyTop = has('buoy') ? '#ffd23e' : '#e0483e';
  ellipse(ctx, 272, 370, 9, 7, buoyTop);
  ctx.fillStyle = '#faeed2';
  ctx.fillRect(266, 362, 12, 4);
  ctx.fillStyle = buoyTop;
  ctx.fillRect(269, 356, 6, 6);

  // jumping fish (it can dive back down)
  if (!has('fish')) {
    ctx.strokeStyle = '#cfe8f2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(202, 382, 10, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = 'rgba(207, 232, 242, 0.7)';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(192 + i * 7, 392, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- cliffs ----
  poly(ctx, [[0, 250], [0, 420], [150, 420], [138, 330], [96, 296], [52, 282], [18, 268]], CLIFF);
  poly(ctx, [[560, 250], [560, 420], [430, 420], [438, 322], [470, 288], [512, 268], [544, 258]], CLIFF);

  // ---- cottage on the left cliff ----
  ctx.fillStyle = '#e8d9b0';
  ctx.fillRect(42, 252, 72, 46);
  poly(ctx, [[36, 254], [78, 226], [120, 254]], '#b0503c');
  ctx.fillStyle = '#5a3a28';
  ctx.fillRect(66, 272, 16, 26);
  // window: warm and lit, or dark
  ctx.fillStyle = has('window') ? '#2a2118' : '#ffd68c';
  ctx.fillRect(92, 262, 14, 14);
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 2;
  ctx.strokeRect(92, 262, 14, 14);
  // chimney and its smoke
  ctx.fillStyle = '#8a6a52';
  ctx.fillRect(100, 232, 12, 20);
  if (!has('smoke')) {
    ctx.fillStyle = 'rgba(250, 238, 210, 0.55)';
    const drift = Math.sin(t * 0.7) * 4;
    ellipse(ctx, 106 + drift, 222, 7, 5, 'rgba(250, 238, 210, 0.55)');
    ellipse(ctx, 110 + drift * 1.4, 212, 9, 6, 'rgba(250, 238, 210, 0.45)');
    ellipse(ctx, 116 + drift * 1.8, 201, 11, 7, 'rgba(250, 238, 210, 0.35)');
  }

  // pines on the cliffs (one can vanish)
  pine(ctx, 22, 306, 44);
  if (!has('pine')) pine(ctx, 132, 292, 52);
  pine(ctx, 452, 292, 46);
  pine(ctx, 524, 282, 38);

  // ---- lighthouse on the right cliff ----
  ctx.fillStyle = '#f4ead2';
  ctx.fillRect(478, 168, 28, 94);
  ctx.fillStyle = '#c64536';
  ctx.fillRect(478, 190, 28, 14);
  ctx.fillRect(478, 226, 28, 14);
  ctx.fillStyle = '#2a2f3a';
  ctx.fillRect(474, 158, 36, 10);
  // lamp room, glowing
  ctx.fillStyle = '#ffe8b2';
  ctx.fillRect(482, 142, 20, 16);
  ctx.strokeStyle = '#2a2f3a';
  ctx.lineWidth = 2;
  ctx.strokeRect(482, 142, 20, 16);
  // flag on top (it can be gone)
  if (!has('flag')) {
    ctx.strokeStyle = '#2a2f3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(492, 142);
    ctx.lineTo(492, 126);
    ctx.stroke();
    poly(ctx, [[492, 126], [510, 131], [492, 137]], '#c64536');
  }
  // the beam, sweeping gently
  const beamAngle = -0.5 + Math.sin(t * 0.35) * 0.22;
  ctx.save();
  ctx.translate(492, 150);
  ctx.rotate(beamAngle);
  const beam = ctx.createLinearGradient(0, 0, -190, 0);
  beam.addColorStop(0, 'rgba(255, 232, 178, 0.5)');
  beam.addColorStop(1, 'rgba(255, 232, 178, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(-190, -26);
  ctx.lineTo(-190, 26);
  ctx.lineTo(0, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ---- boats ----
  const sailboat = (x, y, s, sailColour) => {
    poly(ctx, [[x - 26 * s, y], [x + 26 * s, y], [x + 16 * s, y + 12 * s], [x - 16 * s, y + 12 * s]], '#5a3a28');
    ctx.strokeStyle = '#3a2a1c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 34 * s);
    ctx.stroke();
    poly(ctx, [[x + 2, y - 32 * s], [x + 2, y - 4 * s], [x + 24 * s, y - 4 * s]], sailColour);
  };
  sailboat(232, 330, 1, has('sail') ? '#faeed2' : '#c64536');
  if (!has('boat')) sailboat(332, 358, 0.62, '#faeed2');

  // ---- pier, bottom left ----
  ctx.fillStyle = '#6a4a30';
  ctx.fillRect(52, 352, 62, 68);
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 2;
  for (let y = 360; y < 420; y += 12) {
    ctx.beginPath();
    ctx.moveTo(52, y);
    ctx.lineTo(114, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(56, 400, 8, 20);
  ctx.fillRect(102, 400, 8, 20);
  // lantern on the pier post: lit, or out
  ctx.fillStyle = '#2a2f3a';
  ctx.fillRect(100, 332, 12, 12);
  if (!has('lantern')) {
    ctx.fillStyle = 'rgba(255, 214, 140, 0.9)';
    ctx.beginPath();
    ctx.arc(106, 338, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe8b2';
    ctx.beginPath();
    ctx.arc(106, 338, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3a3f4a';
    ctx.fillRect(103, 335, 6, 6);
  }

  // ---- gulls in the sky (one can fly off) ----
  gull(ctx, 90, 92, 9);
  gull(ctx, 150, 122, 7);
  if (!has('gull')) gull(ctx, 262, 82, 9);
  gull(ctx, 350, 142, 7);
  gull(ctx, 470, 62, 8);
}
