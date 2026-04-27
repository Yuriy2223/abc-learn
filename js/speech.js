let voices = [];

const loadVoices = () => {
  voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
};

loadVoices();
speechSynthesis.addEventListener('voiceschanged', loadVoices);

/**
 * @param {string} text
 * @param {Function} [onEnd] - callback fired when speech ends
 */
export const speak = (text, onEnd) => {
  speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;

  if (voices.length) u.voice = voices[0];
  if (onEnd) u.onend = onEnd;

  speechSynthesis.speak(u);
};

const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;

export const isSRSupported = () => SR !== null;

/**
 * Start a speech recognition session.
 * @param {Object} callbacks
 * @param {Function} callbacks.onResult  - called with transcript string
 * @param {Function} callbacks.onNoMatch - called when nothing was heard
 * @param {Function} callbacks.onError   - called with error code string
 * @returns {{ stop: Function }} - object to manually stop recognition
 */
export const startRecognition = ({ onResult, onNoMatch, onError }) => {
  const rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 3;

  let gotResult = false;

  rec.onresult = (e) => {
    gotResult = true;
    onResult(e.results[0][0].transcript);
  };

  rec.onend = () => {
    if (!gotResult) onNoMatch();
  };

  rec.onerror = (e) => {
    gotResult = true;
    onError(e.error);
  };

  rec.start();

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    },
  };
};
