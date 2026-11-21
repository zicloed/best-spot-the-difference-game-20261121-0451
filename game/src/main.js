// Bootstrap for Kestrel Cove.
// Grabs every named element from the page and hands them to the game.

import { createGame } from './game.js';

const els = {
  panelLeft: document.getElementById('panel-left'),
  panelRight: document.getElementById('panel-right'),
  hudRound: document.getElementById('hud-round'),
  hudTimer: document.getElementById('hud-timer'),
  hudScore: document.getElementById('hud-score'),
  hudFound: document.getElementById('hud-found'),
  hudMessage: document.getElementById('hud-message'),
  btnHint: document.getElementById('btn-hint'),
  btnSound: document.getElementById('btn-sound'),
  btnReplay: document.getElementById('btn-replay'),
  btnStart: document.getElementById('btn-start'),
  btnNext: document.getElementById('btn-next'),
  btnRetry: document.getElementById('btn-retry'),
  btnAgain: document.getElementById('btn-again'),
  overlayTitle: document.getElementById('overlay-title'),
  overlayClear: document.getElementById('overlay-clear'),
  overlayOver: document.getElementById('overlay-over'),
  overlayWin: document.getElementById('overlay-win'),
  clearTitle: document.getElementById('clear-title'),
  clearText: document.getElementById('clear-text'),
  overText: document.getElementById('over-text'),
  winText: document.getElementById('win-text'),
};

createGame(els);
