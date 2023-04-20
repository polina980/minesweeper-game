const digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
let timer;

export function startTimer() {
  const timerElem = document.getElementById('timer');
  const digitElems = Array.from(timerElem.children);

  let seconds = 0;
  const updateTimer = () => {
    seconds++;
    const secondsStr = seconds.toString().padStart(3, '0');
    for (let i = 0; i < 3; i++) {
      const digit = parseInt(secondsStr[i]);
      digitElems[i].classList.remove(...digits);
      digitElems[i].classList.add(digits[digit]);
    }
  };

  timer = setInterval(updateTimer, 1000);
  return timer;
};

export function stopTimer() {
  clearInterval(timer);
};
