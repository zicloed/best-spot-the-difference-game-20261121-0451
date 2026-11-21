// Sounds for Kestrel Cove, made with the Web Audio API.
// No audio files: every sound is a few oscillators and a little envelope.

let audioCtx = null;
let muted = false;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.16) {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFind() {
  tone(660, 0, 0.22, 'sine', 0.18);
  tone(990, 0.09, 0.3, 'sine', 0.16);
}

// A soft low thud for a miss.
export function playMiss() {
  tone(160, 0, 0.16, 'triangle', 0.12);
}

// A gentle blip when a hint is used.
export function playHint() {
  tone(520, 0, 0.12, 'sine', 0.1);
  tone(780, 0.07, 0.14, 'sine', 0.08);
}

// A little rising arpeggio when a round is cleared.
export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.32, 'sine', 0.16));
}

// A short click for buttons.
export function playClick() {
  tone(440, 0, 0.07, 'square', 0.05);
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
}
