import './styles/index.css';
import { CELL } from './components/buttons/cell-button/cell.js';
import { EMOTION_CELL } from './components/buttons/emotion-button/emotion.js';
import { startTimer, stopTimer } from './components/timer.js';

const rows = 16;
const columns = 16;
const minesCount = 40;

let board = [];
let minesLocation = new Set();
let cellsOpened = 0;
let remainingMines = 40;
let gameOver = false;
let boardElem;
let minesCounterElem;
let emotionButton;
let timerElem;

const { cellButton, opened, flagged, question, mine, wrongMine, lastMine } = CELL;
const { smile, smilePressed, wow, win, lose } = EMOTION_CELL;

// Функция, которая создает игровое поле и настраивает игру
function startGame() {
  boardElem = document.getElementById('board');
  minesCounterElem = document.getElementById('mines-counter');
  emotionButton = document.getElementById('emotion-button');
  timerElem = document.getElementById('timer');

  minesCounterElem.textContent = remainingMines;
  emotionButton.classList.add(smile);
  timerElem.textContent = '000';

  emotionButton.addEventListener('click', function () {
    emotionButton.classList.add(smilePressed);
    restartGame();
    setTimeout(function () {
      emotionButton.classList.remove(smilePressed);
    }, 100);
  });

  setRandomMines();

  for (let row = 0; row < rows; row++) {
    const rowArr = [];
    for (let column = 0; column < columns; column++) {
      const cell = document.createElement('button');
      cell.classList.add(cellButton);
      cell.id = `${row}-${column}`;
      cell.addEventListener('contextmenu', handleRightClick);
      cell.addEventListener('mousedown', handleMouseDown);
      cell.addEventListener('mouseup', handleMouseUp);
      boardElem.append(cell);
      rowArr.push(cell);
    }
    board.push(rowArr);
  }
};

function restartGame() {
  stopTimer();
  board = [];
  minesLocation.clear();
  cellsOpened = 0;
  remainingMines = minesCount;
  gameOver = false;
  minesCounterElem.textContent = remainingMines;
  emotionButton.classList.remove(lose);
  emotionButton.classList.remove(win);
  emotionButton.classList.add(smile);
  timerElem.textContent = '000';

  boardElem.innerHTML = '';

  for (let row = 0; row < rows; row++) {
    const rowArr = [];
    for (let column = 0; column < columns; column++) {
      const cell = document.createElement('button');
      cell.classList.add(cellButton);
      cell.id = `${row}-${column}`;
      cell.addEventListener('contextmenu', handleRightClick);
      cell.addEventListener('mousedown', handleMouseDown);
      cell.addEventListener('mouseup', handleMouseUp);
      boardElem.append(cell);
      rowArr.push(cell);
    }
    board.push(rowArr);
  }

  setRandomMines();
}

// Функция, которая обрабатывает событие клика правой кнопкой мыши
const handleRightClick = (event) => {
  event.preventDefault();
  let cell = event.target;
  const isCellOpened = cell.classList.contains(opened);
  const isFlagged = cell.classList.contains(flagged);
  const isQuestion = cell.classList.contains(question);

  if (isCellOpened) return;

  if (isQuestion) {
    cell.classList.remove(question);
  } else if (isFlagged) {
    cell.classList.remove(flagged);
    remainingMines += 1;
    cell.classList.add(question);
  } else {
    cell.classList.add(flagged);
    remainingMines -= 1;
  }

  minesCounterElem.textContent = remainingMines;
}

// Функция, которая обрабатывает событие нажатия кнопки мыши
const handleMouseDown = (event) => {
  if (event.button === 0) {
    emotionButton.classList.add(wow);
  }
};

// Функция, которая обрабатывает событие отпускания кнопки мыши
const handleMouseUp = (event) => {
  if (event.button === 0) {
    emotionButton.classList.remove(wow);
    handleLeftClick(event);
  }
};

// Функция, которая расставляет мины на поле
function setRandomMines() {
  let minesLeft = minesCount;
  while (minesLeft > 0) {
    let row = Math.floor(Math.random() * rows);
    let column = Math.floor(Math.random() * columns);
    const cellId = `${row}-${column}`;

    if (!minesLocation.has(cellId)) {
      minesLocation.add(cellId);
      minesLeft -= 1;
    }
  }
};

// Функция, которая открывает все ячейки с минами и останавливает таймер
function showAllMines() {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const cell = board[row][column];
      const isFlagged = cell.classList.contains(flagged);
      const hasMine = minesLocation.has(cell.id);

      if (!isFlagged && hasMine) {
        cell.classList.add(mine);
      } else if (isFlagged && !hasMine) {
        cell.classList.remove(flagged);
        cell.classList.add(wrongMine);
      }
    }
  }
  stopTimer();
}

// Функция, которая проверяет ячейку на наличие мины и открывает все ячейки, которые не содержат мины
function checkMine(row, column) {
  if (row < 0 || row >= rows || column < 0 || column >= columns) {
    return;
  };

  const cell = board[row][column];
  if (cell.classList.contains(opened) || cell.classList.contains(flagged)) {
    return;
  }

  cell.classList.add(opened);
  cellsOpened += 1;

  let minesFound = 0;
  const startRow = Math.max(row - 1, 0);
  const endRow = Math.min(row + 1, rows - 1);
  const startColumn = Math.max(column - 1, 0);
  const endColumn = Math.min(column + 1, columns - 1);

  for (let i = startRow; i <= endRow; i++) {
    for (let j = startColumn; j <= endColumn; j++) {
      if (i == row && j == column) {
        continue;
      }
      minesFound += checkCell(i, j);
    }
  }

  if (minesFound > 0) {
    cell.classList.remove(opened);
    cell.classList.add(`x${minesFound}`);
  } else {
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startColumn; j <= endColumn; j++) {
        if (i == row && j == column) {
          continue;
        }
        checkMine(i, j);
      }
    }
  }
};

// Функция, которая проверяет, содержит ли ячейка мину
function checkCell(row, column) {
  if (row < 0 || row >= rows || column < 0 || column >= columns) {
    return 0;
  } else {
    return minesLocation.has(`${row}-${column}`) ? 1 : 0;
  }
};

// Функция, которая проверяет, правильно ли помечены все ячейки с минами
function checkFlags() {
  let flaggedMines = 0;
  for (let cellId of minesLocation) {
    let cell = document.getElementById(cellId);
    if (cell.classList.contains(flagged)) {
      flaggedMines++;
    }
  }
  return flaggedMines === minesCount;
}

// Функция, которая отвечает за обработку клика на игровом поле (ячейке)
const handleLeftClick = (event) => {
  let cell = event.target;
  let openFields = cell.id.split('-');
  let row = parseInt(openFields[0]);
  let column = parseInt(openFields[1]);

  if (gameOver
    || cell.classList.contains(flagged)
    || cell.classList.contains(opened)
    || cell.classList.contains(question)) {
    return;
  }

  if (cell.textContent === '?') {
    cell.textContent = '';
  }

  if (cellsOpened === 0) {
    startTimer();
  }

  if (cellsOpened === 0 && minesLocation.has(cell.id)) {
    setRandomMines();
    while (minesLocation.has(cell.id)) {
      setRandomMines();
    }
  }

  if (minesLocation.has(cell.id)) {
    cell.classList.add(lastMine);
    showAllMines();
    stopTimer();
    gameOver = true;
    emotionButton.classList.add(lose);
    return;
  }

  checkMine(row, column);

  if (cellsOpened === rows * columns - minesCount) {
    if (checkFlags()) {
      stopTimer();
      gameOver = true;
      emotionButton.classList.add(win);
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  startGame();
});
