import {
  startGame,
  handleListen,
  checkAnswer,
  setStatus,
  setLocked,
  isLocked,
} from './game.js';
import { isSRSupported, startRecognition } from './speech.js';
import { updateHomeStats, buildHistoryScreen } from './history.js';
import { showScreen } from './navigation.js';

const homeScreen = document.getElementById('homeScreen');
const historyScreen = document.getElementById('historyScreen');

const goHome = () => {
  updateHomeStats();
  showScreen(homeScreen);
};

const openHistory = () => {
  buildHistoryScreen(() => startGame());
  showScreen(historyScreen);
};

const initHeroLetters = () => {
  const container = document.getElementById('heroLetters');
  const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

  for (let i = 0; i < 14; i++) {
    const el = document.createElement('div');
    el.className = 'hero-letter';
    el.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];

    const size = 36 + Math.random() * 64;
    const dur = 9 + Math.random() * 12;
    const rot = (Math.random() - 0.5) * 36;

    el.style.cssText = [
      `font-size: ${size}px`,
      `left: ${Math.random() * 88}%`,
      `top: ${10 + Math.random() * 110}%`,
      `--r: ${rot}deg`,
      `animation-duration: ${dur}s`,
      `animation-delay: ${-Math.random() * dur}s`,
    ].join(';');

    container.appendChild(el);
  }
};

const initSpeakButton = () => {
  const speakBtn = document.getElementById('btnSpeak');

  if (!isSRSupported()) {
    const msg = document.createElement('div');
    msg.className = 'no-support-msg';
    msg.textContent =
      'Ваш браузер не підтримує розпізнавання голосу. Використайте Chrome.';
    speakBtn.replaceWith(msg);
    return;
  }

  speakBtn.addEventListener('click', () => {
    if (isLocked()) return;

    let recognitionSession = null;

    const stopRec = () => {
      speakBtn.classList.remove('recording');
      speakBtn.textContent = '🎤 Speak';
      recognitionSession?.stop();
    };

    setLocked(true);
    speakBtn.classList.add('recording');
    speakBtn.textContent = 'Listening... 🎤';
    setStatus('Слухаю...', 'info');

    recognitionSession = startRecognition({
      onResult: (transcript) => {
        stopRec();
        checkAnswer(transcript);
      },
      onNoMatch: () => {
        stopRec();
        setStatus('Спробуй ще раз 🎤', 'warn');
        setLocked(false);
      },
      onError: (code) => {
        stopRec();
        if (code === 'not-allowed') {
          setStatus(
            'Мікрофон заблоковано. Надайте дозвіл у браузері.',
            'error'
          );
          document.getElementById('btnSpeak')?.remove();
        } else if (code === 'network') {
          setStatus('Помилка мережі. Перевірте зєднання.', 'error');
        } else {
          setStatus('Не вдалось розпізнати. Спробуй ще раз.', 'warn');
        }
        setLocked(false);
      },
    });
  });
};

const initButtons = () => {
  document
    .getElementById('btnStart')
    .addEventListener('click', () => startGame());
  document
    .getElementById('btnHistoryHome')
    .addEventListener('click', openHistory);
  document.getElementById('btnBackToHome').addEventListener('click', goHome);
  document.getElementById('btnGoHome').addEventListener('click', goHome);
  document
    .getElementById('btnPlayAgain')
    .addEventListener('click', () => startGame());
  document.getElementById('btnHistoryBack').addEventListener('click', goHome);
  document.getElementById('btnListen').addEventListener('click', handleListen);
};

initHeroLetters();
updateHomeStats();
initButtons();
initSpeakButton();
