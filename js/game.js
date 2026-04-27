import { speak } from './speech.js';
import { saveSession } from './history.js';
import { showScreen } from './navigation.js';

const TOTAL = 10;

const LETTER_MAP = {
  ay: 'a',
  bee: 'b',
  see: 'c',
  cee: 'c',
  dee: 'd',
  ee: 'e',
  ef: 'f',
  eff: 'f',
  gee: 'g',
  aitch: 'h',
  haitch: 'h',
  eye: 'i',
  jay: 'j',
  kay: 'k',
  el: 'l',
  ell: 'l',
  em: 'm',
  en: 'n',
  oh: 'o',
  pee: 'p',
  cue: 'q',
  queue: 'q',
  ar: 'r',
  arr: 'r',
  es: 's',
  ess: 's',
  tea: 't',
  tee: 't',
  you: 'u',
  vee: 'v',
  'double you': 'w',
  'double-you': 'w',
  'double u': 'w',
  'double-u': 'w',
  dubya: 'w',
  ex: 'x',
  why: 'y',
  zed: 'z',
  zee: 'z',
};

let session = [];
let idx = 0;
let correct = 0;
let wrong = 0;
let locked = false;

const letterDisplay = document.getElementById('letterDisplay');
const progressLabel = document.getElementById('progressLabel');
const progressFill = document.getElementById('progressFill');
const statusEl = document.getElementById('statusText');
const listenBtn = document.getElementById('btnListen');

export const isLocked = () => locked;

export const setStatus = (text, type = 'info') => {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
};

export const setLocked = (state) => {
  locked = state;
  listenBtn.disabled = state;

  const sp = document.getElementById('btnSpeak');
  if (sp) sp.disabled = state;
};

const generateSession = () => {
  const abc = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  for (let i = abc.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [abc[i], abc[j]] = [abc[j], abc[i]];
  }
  return abc.slice(0, TOTAL);
};

const showLetter = () => {
  letterDisplay.style.animation = 'none';
  void letterDisplay.offsetWidth;
  letterDisplay.style.animation = '';

  letterDisplay.textContent = session[idx];
  progressLabel.textContent = `Буква ${idx + 1} з ${TOTAL}`;
  progressFill.style.width = `${(idx / TOTAL) * 100}%`;

  setStatus('Натисни Listen або Speak');
  setLocked(false);
};

const TTS_MAP = {
  A: 'ay',
  B: 'bee',
  C: 'see',
  D: 'dee',
  E: 'ee',
  F: 'ef',
  G: 'gee',
  H: 'aitch',
  I: 'eye',
  J: 'jay',
  K: 'kay',
  L: 'el',
  M: 'em',
  N: 'en',
  O: 'oh',
  P: 'the letter P',
  Q: 'cue',
  R: 'ar',
  S: 'es',
  T: 'tee',
  U: 'you',
  V: 'vee',
  W: 'double you',
  X: 'ex',
  Y: 'why',
  Z: 'zed',
};

const nextLetter = () => {
  idx++;
  idx >= TOTAL ? showResult() : showLetter();
};

export const checkAnswer = (raw) => {
  const input = raw
    .toLowerCase()
    .trim()
    .replace(/[.?!,]+$/, '');

  const resolved = LETTER_MAP[input] ?? (input.length === 1 ? input : '');

  if (resolved === session[idx].toLowerCase()) {
    correct++;
    setStatus('Молодець! ✅', 'success');
    setLocked(true);
    setTimeout(nextLetter, 2500);
  } else {
    wrong++;
    setStatus('Не засмучуйся! ❌', 'error');
    setLocked(true);

    const letter = session[idx];
    speak(TTS_MAP[letter] ?? letter, () => nextLetter());
  }
};

export const handleListen = () => {
  if (locked) return;
  setLocked(true);
  speak(TTS_MAP[session[idx]] ?? session[idx], () => setLocked(false));
};

const showResult = () => {
  saveSession(correct, wrong);
  progressFill.style.width = '100%';

  document.getElementById('resCorrect').textContent = correct;
  document.getElementById('resWrong').textContent = wrong;

  const resultScreen = document.getElementById('resultScreen');

  if (correct >= 8) {
    document.getElementById('resultEmoji').textContent = '🌟';
    document.getElementById('resultGrade').textContent = 'Відмінно!';
    document.getElementById('resultSub').textContent =
      `Правильно ${correct} з ${TOTAL} — ти молодець!`;
  } else if (correct >= 5) {
    document.getElementById('resultEmoji').textContent = '😊';
    document.getElementById('resultGrade').textContent = 'Непогано!';
    document.getElementById('resultSub').textContent =
      `Правильно ${correct} з ${TOTAL} — продовжуй тренуватись!`;
  } else {
    document.getElementById('resultEmoji').textContent = '💪';
    document.getElementById('resultGrade').textContent = 'Не здавайся!';
    document.getElementById('resultSub').textContent =
      `Правильно ${correct} з ${TOTAL} — ще трохи практики!`;
  }

  showScreen(resultScreen);
};

export const startGame = () => {
  session = generateSession();
  idx = correct = wrong = 0;

  showLetter();
  showScreen(document.getElementById('gameScreen'));
};
