const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;

if (!SR) {
  document.getElementById('btnSpeak').textContent =
    '❌ SR не підтримується — використай Chrome';
  document.getElementById('btnSpeak').disabled = true;
}

let currentIdx = 0;

const log = {};

const $ = (id) => document.getElementById(id);
const currentLetterEl = $('currentLetter');
const btnSpeak = $('btnSpeak');
const resultBox = $('resultBox');
const logBody = $('logBody');
const progressRow = $('progressRow');

const buildDots = () => {
  progressRow.innerHTML = '';
  ALPHABET.forEach((letter, i) => {
    const dot = document.createElement('div');
    const entry = log[letter];
    dot.className =
      'prog-dot' +
      (i === currentIdx ? ' active' : '') +
      (entry ? (entry.isManual ? ' done-ok' : ' done-sr') : '');
    dot.textContent = letter;
    dot.title = entry ? `"${entry.final}"` : '';
    dot.addEventListener('click', () => {
      currentIdx = i;
      render();
    });
    progressRow.appendChild(dot);
  });
};

const renderResultBox = (letter) => {
  const entry = log[letter];

  if (!entry) {
    resultBox.innerHTML = `<div style="color:var(--muted);font-size:13px;font-weight:600;">Результат з'явиться тут після запису</div>`;
    return;
  }

  const tagHtml = entry.isManual
    ? `<span class="tag man">✎ вручну</span>`
    : `<span class="tag sr">SR</span>`;

  const chipsHtml = entry.srAll
    .map(
      (a, i) =>
        `<span class="alt-chip${a === entry.final ? ' selected' : ''}" data-val="${a}">${a}</span>`
    )
    .join('');

  resultBox.innerHTML = `
        <div class="result-row">
          <span class="result-label">Результат</span>
          <div class="result-value-wrap">
            <input
              class="result-value ${entry.isManual ? 'manual-value' : 'sr-value'}"
              id="editFinal"
              type="text"
              value="${entry.final}"
              spellcheck="false"
            />
            ${tagHtml}
          </div>
        </div>
        <div class="edit-hint">✎ Клікни щоб редагувати або вибери варіант нижче</div>
        ${
          entry.srAll.length > 0
            ? `
        <div class="result-row">
          <span class="result-label">Варіанти SR</span>
          <div class="alt-row" id="altRow">${chipsHtml}</div>
        </div>`
            : ''
        }`;

  const input = $('editFinal');
  input.addEventListener('input', () => {
    entry.final = input.value.toLowerCase().trim();
    entry.isManual = true;
    input.className = 'result-value manual-value';

    input.nextElementSibling.outerHTML = `<span class="tag man">✎ вручну</span>`;
    updateLogTable();
    buildDots();
  });

  const altRow = $('altRow');
  if (altRow) {
    altRow.addEventListener('click', (e) => {
      const chip = e.target.closest('.alt-chip');
      if (!chip) return;
      const val = chip.dataset.val;
      entry.final = val;
      entry.isManual = true;
      renderResultBox(letter);
      updateLogTable();
      buildDots();
    });
  }
};

const render = () => {
  currentLetterEl.textContent = ALPHABET[currentIdx];
  renderResultBox(ALPHABET[currentIdx]);
  buildDots();
};

const updateLogTable = () => {
  const entries = Object.entries(log).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return;

  logBody.innerHTML = entries
    .map(
      ([letter, entry]) => `
        <tr>
          <td>${letter}</td>
          <td class="${entry.isManual ? 'val-ok' : 'val-sr'}">"${entry.final}"</td>
          <td>${entry.srAll.join(', ') || '—'}</td>
        </tr>`
    )
    .join('');
};

btnSpeak.addEventListener('click', () => {
  if (!SR) return;

  const rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 5;

  btnSpeak.classList.add('recording');
  btnSpeak.textContent = 'Слухаю... 🎤';

  const stopRec = () => {
    btnSpeak.classList.remove('recording');
    btnSpeak.textContent = '🎤 Натисни і говори';
    try {
      rec.stop();
    } catch {
      /**/
    }
  };

  rec.onresult = (e) => {
    stopRec();
    const letter = ALPHABET[currentIdx];
    const srAll = [];
    for (let i = 0; i < e.results[0].length; i++) {
      srAll.push(e.results[0][i].transcript.toLowerCase().trim());
    }
    const srBest = srAll[0];

    log[letter] = { final: srBest, srBest, srAll, isManual: false };

    renderResultBox(letter);
    updateLogTable();
    buildDots();
  };

  rec.onend = stopRec;
  rec.onerror = (e) => {
    stopRec();
    resultBox.innerHTML = `<div style="color:var(--error);font-weight:700;">Помилка: ${e.error}</div>`;
  };

  rec.start();
});

$('btnNext').addEventListener('click', () => {
  if (currentIdx < ALPHABET.length - 1) {
    currentIdx++;
    render();
  }
});
$('btnPrev').addEventListener('click', () => {
  if (currentIdx > 0) {
    currentIdx--;
    render();
  }
});

$('btnCopy').addEventListener('click', () => {
  const output = {};
  for (const [letter, entry] of Object.entries(log)) {
    output[letter] = {
      final: entry.final,
      isManual: entry.isManual,
      srBest: entry.srBest,
      srAll: entry.srAll,
    };
  }
  navigator.clipboard.writeText(JSON.stringify(output, null, 2)).then(() => {
    const btn = $('btnCopy');
    btn.textContent = '✅ Скопійовано!';
    setTimeout(() => {
      btn.textContent = '📋 Скопіювати JSON';
    }, 2000);
  });
});

$('btnClear').addEventListener('click', () => {
  if (!confirm('Очистити всі дані?')) return;
  Object.keys(log).forEach((k) => delete log[k]);
  render();
  logBody.innerHTML = `<tr><td colspan="3" style="color:var(--muted);padding:16px 8px;">Поки порожньо</td></tr>`;
});

render();
