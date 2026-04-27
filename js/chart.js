/**
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{correct: number, wrong: number, date: string, time: string}>} history
 */
export const drawChart = (canvas, history) => {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const pL = 36,
    pR = 12,
    pT = 20,
    pB = 50;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = history.length;
  const gW = cW / n;
  const bW = Math.min(gW * 0.32, 28);
  const gap = bW * 0.35;

  ctx.font = '11px Nunito, sans-serif';

  for (const v of [0, 5, 10]) {
    const y = pT + cH - (v / 10) * cH;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pL, y);
    ctx.lineTo(W - pR, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(136,136,170,0.8)';
    ctx.textAlign = 'right';
    ctx.fillText(v, pL - 6, y + 4);
  }

  history.forEach((s, i) => {
    const cx = pL + i * gW + gW / 2;
    const hC = (s.correct / 10) * cH;
    const hW = (s.wrong / 10) * cH;

    const gC = ctx.createLinearGradient(0, pT + cH - hC, 0, pT + cH);
    gC.addColorStop(0, '#4ade80');
    gC.addColorStop(1, '#4ade8040');
    ctx.fillStyle = gC;
    ctx.beginPath();
    ctx.roundRect(
      cx - gap - bW,
      pT + cH - hC,
      bW,
      Math.max(hC, 2),
      [5, 5, 0, 0]
    );
    ctx.fill();

    const gWr = ctx.createLinearGradient(0, pT + cH - hW, 0, pT + cH);
    gWr.addColorStop(0, '#f87171');
    gWr.addColorStop(1, '#f8717140');
    ctx.fillStyle = gWr;
    ctx.beginPath();
    ctx.roundRect(cx + gap, pT + cH - hW, bW, Math.max(hW, 2), [5, 5, 0, 0]);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = 'rgba(136,136,170,0.8)';
    ctx.font = '10px Nunito, sans-serif';
    ctx.textAlign = 'right';
    ctx.translate(cx, pT + cH + 10);
    ctx.rotate(-0.55);
    ctx.fillText(`${s.date} ${s.time}`, 0, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(124,106,247,0.7)';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.setLineDash([5, 4]);

  history.forEach((s, i) => {
    const cx = pL + i * gW + gW / 2;
    const y = pT + cH - (s.correct / 10) * cH;
    i === 0 ? ctx.moveTo(cx, y) : ctx.lineTo(cx, y);
  });

  ctx.stroke();
  ctx.setLineDash([]);

  history.forEach((s, i) => {
    const cx = pL + i * gW + gW / 2;
    const y = pT + cH - (s.correct / 10) * cH;

    ctx.beginPath();
    ctx.arc(cx, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#7c6af7';
    ctx.shadowColor = '#7c6af780';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
};
