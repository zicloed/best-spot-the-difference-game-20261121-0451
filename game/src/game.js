// Kestrel Cove: the game itself.
// State machine, input, scoring, timer, hints and markers. The two panels
// are drawn by scene.js; this file decides what the player sees and hears.

import { drawScene } from './scene.js';
import { chooseDiffs, hitTest, PANEL_W, PANEL_H } from './differences.js';
import { mulberry32 } from './rng.js';
import * as sfx from './audio.js';

const ROUNDS = [
  { name: 'Calm Cove', diffs: 5, seconds: 120 },
  { name: 'Golden Hour', diffs: 7, seconds: 150 },
  { name: 'Twilight Hunt', diffs: 9, seconds: 180 },
];
const HINTS_PER_ROUND = 3;
const HINT_COST = 25;
const FIND_POINTS = 100;
const MISS_POINTS = 10;

export function createGame(els) {
  const left = els.panelLeft.getContext('2d');
  const right = els.panelRight.getContext('2d');

  const state = {
    screen: 'title', // title | playing | clear | over | win
    roundIndex: 0,
    seed: 20261121,
    diffs: [],
    found: new Set(),
    score: 0,
    hintsLeft: HINTS_PER_ROUND,
    hintDiff: null,
    hintUntil: 0,
    timeLeft: 0,
    lastTick: 0,
    message: '',
    misses: 0,
  };

  // A debug hook so the screenshot driver can see the live state.
  window.KESTREL = { state, ROUNDS };

  function round() {
    return ROUNDS[state.roundIndex];
  }

  function startRound(index) {
    state.roundIndex = index;
    const rng = mulberry32(state.seed + index * 7919);
    state.diffs = chooseDiffs(rng, round().diffs);
    state.found = new Set();
    state.hintsLeft = HINTS_PER_ROUND;
    state.hintDiff = null;
    state.timeLeft = round().seconds;
    state.lastTick = performance.now();
    state.screen = 'playing';
    state.message = `Find ${round().diffs} differences — tap either picture.`;
    showOnly(null);
    renderHud();
  }

  function startGame() {
    state.score = 0;
    state.misses = 0;
    state.seed = (Math.random() * 1e9) | 0;
    startRound(0);
  }

  function replayRound() {
    state.seed = (Math.random() * 1e9) | 0;
    startRound(state.roundIndex);
  }

  function showOnly(id) {
    for (const overlay of [els.overlayTitle, els.overlayClear, els.overlayOver, els.overlayWin]) {
      overlay.classList.toggle('hidden', overlay.id !== id);
    }
  }

  function renderHud() {
    const total = state.diffs.length;
    const found = state.found.size;
    const remain = total - found;
    els.hudRound.textContent = `Round ${state.roundIndex + 1} · ${round().name}`;
    els.hudScore.textContent = `Score ${state.score}`;
    els.hudFound.textContent = `Found ${found} of ${total} — ${remain} to go`;
    const m = Math.floor(Math.max(0, state.timeLeft) / 60);
    const s = Math.floor(Math.max(0, state.timeLeft) % 60);
    els.hudTimer.textContent = `${m}:${String(s).padStart(2, '0')}`;
    els.hudTimer.classList.toggle('low', state.timeLeft <= 20 && state.screen === 'playing');
    els.hudMessage.textContent = state.message;
    els.btnHint.textContent = `Hint (${state.hintsLeft})`;
    els.btnHint.disabled = state.hintsLeft <= 0 || state.screen !== 'playing';
  }

  function panelPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
      y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
    };
  }

  function onPanelClick(event) {
    if (state.screen !== 'playing') return;
    const { x, y } = panelPoint(event.currentTarget, event);
    const target = state.diffs.find((d) => !state.found.has(d.id) && hitTest(d, x, y));
    if (target) {
      state.found.add(target.id);
      state.score += FIND_POINTS;
      sfx.playFind();
      state.message = `Found it — ${target.name}! ${target.blurb}`;
      if (state.found.size === state.diffs.length) {
        roundCleared();
      }
    } else {
      state.score = Math.max(0, state.score - MISS_POINTS);
      state.misses += 1;
      sfx.playMiss();
      state.message = 'Not quite — look closer, the differences are small.';
    }
    renderHud();
  }

  function roundCleared() {
    const bonus = Math.floor(state.timeLeft) * 5;
    state.score += bonus;
    sfx.playWin();
    state.screen = 'clear';
    els.clearTitle.textContent = `${round().name} cleared!`;
    els.clearText.textContent =
      `All ${state.diffs.length} differences found with ${Math.ceil(state.timeLeft)}s to spare — time bonus +${bonus}. Score ${state.score}.`;
    els.btnNext.textContent = state.roundIndex + 1 < ROUNDS.length ? 'Next round' : 'See results';
    showOnly('overlay-clear');
    renderHud();
  }

  function gameOver() {
    state.screen = 'over';
    sfx.playMiss();
    els.overText.textContent =
      `Time ran out with ${state.diffs.length - state.found.size} differences still hidden in ${round().name}. Score ${state.score}.`;
    showOnly('overlay-over');
    renderHud();
  }

  function gameWon() {
    state.screen = 'win';
    els.winText.textContent =
      `You found every difference in all three rounds of Kestrel Cove. Final score ${state.score} — ${state.misses} miss${state.misses === 1 ? '' : 'es'} along the way.`;
    showOnly('overlay-win');
    renderHud();
  }

  function useHint() {
    if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
    const remaining = state.diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return;
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_COST);
    state.hintDiff = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintUntil = performance.now() + 2600;
    sfx.playHint();
    state.message = 'Hint: look where the ring is pulsing. (−25 points)';
    renderHud();
  }

  function drawMarkers(ctx, now) {
    // Golden rings on every difference already found.
    for (const diff of state.diffs) {
      if (!state.found.has(diff.id)) continue;
      ctx.strokeStyle = '#ffd23e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(diff.hot.x, diff.hot.y, diff.hot.r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(20, 24, 40, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(diff.hot.x, diff.hot.y, diff.hot.r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd23e';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', diff.hot.x, diff.hot.y);
    }
    // A pulsing ring while a hint is live.
    if (state.hintDiff && now < state.hintUntil) {
      const pulse = 1 + 0.18 * Math.sin(now / 130);
      const d = state.hintDiff;
      ctx.strokeStyle = 'rgba(255, 210, 62, 0.95)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(d.hot.x, d.hot.y, (d.hot.r + 6) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function frame(now) {
    const t = now / 1000;
    if (state.screen === 'playing') {
      const dt = (now - state.lastTick) / 1000;
      state.lastTick = now;
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        renderHud();
        gameOver();
      } else if (Math.floor(state.timeLeft) !== Math.floor(state.timeLeft + dt)) {
        renderHud();
      }
    }
    const active = new Set(state.diffs.map((d) => d.id));
    drawScene(left, PANEL_W, PANEL_H, state.seed, new Set(), t);
    drawScene(right, PANEL_W, PANEL_H, state.seed, active, t);
    drawMarkers(left, now);
    drawMarkers(right, now);
    requestAnimationFrame(frame);
  }

  // ---- wiring ----
  els.panelLeft.addEventListener('click', onPanelClick);
  els.panelRight.addEventListener('click', onPanelClick);
  els.btnHint.addEventListener('click', () => {
    sfx.playClick();
    useHint();
  });
  els.btnSound.addEventListener('click', () => {
    const muted = !sfx.isMuted();
    sfx.setMuted(muted);
    els.btnSound.textContent = muted ? 'Sound off' : 'Sound on';
    if (!muted) sfx.playClick();
  });
  els.btnReplay.addEventListener('click', () => {
    sfx.playClick();
    if (state.screen === 'playing') replayRound();
    else startGame();
  });
  els.btnStart.addEventListener('click', () => {
    sfx.playClick();
    startGame();
  });
  els.btnNext.addEventListener('click', () => {
    sfx.playClick();
    if (state.roundIndex + 1 < ROUNDS.length) startRound(state.roundIndex + 1);
    else gameWon();
  });
  els.btnRetry.addEventListener('click', () => {
    sfx.playClick();
    replayRound();
  });
  els.btnAgain.addEventListener('click', () => {
    sfx.playClick();
    startGame();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') useHint();
    if (event.key === 'r' || event.key === 'R') {
      if (state.screen === 'playing') replayRound();
    }
    if (event.key === 'm' || event.key === 'M') els.btnSound.click();
    if (event.key === 'Enter' && state.screen === 'title') startGame();
  });

  // Title screen: show the first round's pictures behind the overlay.
  state.diffs = chooseDiffs(mulberry32(state.seed), ROUNDS[0].diffs);
  state.timeLeft = ROUNDS[0].seconds;
  renderHud();
  requestAnimationFrame(frame);
}
