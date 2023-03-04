let timer;

export function startTimer() {
  const timerElem = document.getElementById('timer');
  timerElem.textContent = '000';
  let seconds = 0;
  timer = setInterval(() => {
    seconds++;
    const secondsStr = seconds.toString().padStart(3, '0');
    timerElem.textContent = secondsStr;
  }, 1000);

  return timer;
}

export function stopTimer() {
  clearInterval(timer);
}
