import { drawChart } from './chart.js';

const STORAGE_KEY = 'abc_learn_history';
const MAX_SESSIONS = 10;
const TOTAL = 10;

/** @returns {Array} */
export const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? [];
  } catch {
    return [];
  }
};

/**
 * @param {number} correct
 * @param {number} wrong
 */
export const saveSession = (correct, wrong) => {
  const history = loadHistory();
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  history.push({
    date: `${pad(now.getDate())}.${pad(now.getMonth() + 1)}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    correct,
    wrong,
  });

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(-MAX_SESSIONS))
    );
  } catch {
    /* storage quota exceeded */
  }
};

export const updateHomeStats = () => {
  const history = loadHistory();
  const homeStatsRow = document.getElementById('homeStatsRow');

  if (!history.length) {
    homeStatsRow.style.display = 'none';
    return;
  }

  const totalCorrect = history.reduce((s, h) => s + h.correct, 0);
  const avg = Math.round((totalCorrect / history.length) * 10) / 10;
  const best = Math.max(...history.map((h) => h.correct));

  homeStatsRow.style.display = 'flex';
  homeStatsRow.innerHTML = `
    <div class="home-stat">
      <div class="home-stat-val">${history.length}</div>
      <div class="home-stat-lbl">Сесій</div>
    </div>
    <div class="home-stat">
      <div class="home-stat-val" style="color:var(--success)">${avg}</div>
      <div class="home-stat-lbl">Середнє</div>
    </div>
    <div class="home-stat">
      <div class="home-stat-val" style="color:var(--accent)">${best}</div>
      <div class="home-stat-lbl">Рекорд</div>
    </div>`;
};

/**
 * Builds and injects the full history screen content.
 * @param {Function} onStartGame - callback to trigger a new game
 */
export const buildHistoryScreen = (onStartGame) => {
  const history = loadHistory();
  const histContent = document.getElementById('histContent');
  histContent.innerHTML = '';

  if (!history.length) {
    histContent.innerHTML = `
      <div class="hist-empty">
        <span class="hist-empty-icon">📭</span>
        <div class="hist-empty-title">Поки що порожньо</div>
        <div class="hist-empty-sub">Зіграй першу гру —<br>і тут з'явиться твій прогрес!</div>
      </div>
      <div class="hist-footer">
        <button class="btn-primary" id="histEmptyStart">Почати тест</button>
      </div>`;

    document
      .getElementById('histEmptyStart')
      .addEventListener('click', onStartGame);
    return;
  }

  const totalCorrect = history.reduce((s, h) => s + h.correct, 0);
  const avg = Math.round((totalCorrect / history.length) * 10) / 10;
  const best = Math.max(...history.map((h) => h.correct));
  const accuracy = Math.round((totalCorrect / (history.length * TOTAL)) * 100);

  const summaryEl = document.createElement('div');
  summaryEl.className = 'hist-summary-row';
  summaryEl.innerHTML = `
    <div class="hist-summary-box">
      <div class="hist-summary-val">${history.length}</div>
      <div class="hist-summary-lbl">Сесій</div>
    </div>
    <div class="hist-summary-box">
      <div class="hist-summary-val" style="color:var(--success)">${avg}</div>
      <div class="hist-summary-lbl">Середнє</div>
    </div>
    <div class="hist-summary-box">
      <div class="hist-summary-val" style="color:var(--accent)">${best}</div>
      <div class="hist-summary-lbl">Рекорд</div>
    </div>
    <div class="hist-summary-box">
      <div class="hist-summary-val" style="color:var(--warn)">${accuracy}%</div>
      <div class="hist-summary-lbl">Точність</div>
    </div>`;
  histContent.appendChild(summaryEl);

  const chartSection = document.createElement('div');
  chartSection.className = 'hist-chart-section';
  chartSection.innerHTML =
    '<div class="hist-section-title">Графік прогресу</div>';

  const canvas = document.createElement('canvas');
  canvas.width = 580;
  canvas.height = 220;
  canvas.style.cssText = 'width:100%;height:auto;display:block;';
  chartSection.appendChild(canvas);

  chartSection.insertAdjacentHTML(
    'beforeend',
    `
    <div class="chart-legend">
      <div class="legend-item"><div class="legend-dot c"></div>Правильно</div>
      <div class="legend-item"><div class="legend-dot w"></div>Неправильно</div>
      <div class="legend-item" style="color:var(--accent)">⸺ Тренд</div>
    </div>`
  );

  histContent.appendChild(chartSection);

  requestAnimationFrame(() => drawChart(canvas, history));

  const sessionsSection = document.createElement('div');
  sessionsSection.className = 'hist-sessions-section';
  sessionsSection.innerHTML = `
    <div class="hist-section-title">Деталі сесій</div>
    <div class="hist-sessions-grid" id="sessionsGrid"></div>`;
  histContent.appendChild(sessionsSection);

  const grid = sessionsSection.querySelector('#sessionsGrid');

  [...history].reverse().forEach((s, reversedIdx) => {
    const num = history.length - reversedIdx;
    const medal = s.correct >= 8 ? '🌟' : s.correct >= 5 ? '😊' : '💪';

    const row = document.createElement('div');
    row.className = 'session-row';
    row.style.animationDelay = `${reversedIdx * 0.05}s`;
    row.innerHTML = `
      <div class="session-index">#${num}</div>
      <div class="session-date">
        <div class="session-date-main">${s.date}</div>
        <div class="session-date-time">${s.time}</div>
      </div>
      <div class="session-bars">
        <div class="session-bar-wrap">
          <div class="session-bar-fill c" style="width:${(s.correct / TOTAL) * 100}%"></div>
        </div>
      </div>
      <div class="session-score">
        <div class="session-score-item c">✓${s.correct}</div>
        <div class="session-score-item w">✗${s.wrong}</div>
      </div>
      <div class="session-medal">${medal}</div>`;
    grid.appendChild(row);
  });

  const footer = document.createElement('div');
  footer.className = 'hist-footer';
  footer.innerHTML = `<button class="btn-primary" id="histStartBtn">🚀 Почати новий тест</button>`;
  histContent.appendChild(footer);

  footer.querySelector('#histStartBtn').addEventListener('click', onStartGame);
};
