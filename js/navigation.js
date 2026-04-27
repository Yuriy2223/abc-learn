const historyScreen = document.getElementById('historyScreen');

export const showScreen = (next) => {
  const current = document.querySelector('.screen.active');
  if (!current || current === next) return;

  const fromHistory = current === historyScreen;
  const toHistory = next === historyScreen;

  current.classList.remove('active');
  if (!fromHistory) current.classList.add('out-up');

  const delay = fromHistory ? 50 : 380;

  setTimeout(() => {
    if (!fromHistory) current.classList.remove('out-up');
    next.classList.add('active');
    if (toHistory) next.scrollTop = 0;
  }, delay);
};
