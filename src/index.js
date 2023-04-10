import './styles/index.css';
import { CELL } from './components/buttons/cell-button/cell.js';
import { EMOTION_CELL } from './components/buttons/emotion-button/emotion.js';
import { startTimer, stopTimer } from './components/timer.js';

const BOARD_ROWS = 16;
const BOARD_COLUMNS = 16;
const MINES_COUNT = 40;

const boardElem = document.getElementById('board');
const minesCounterElem = document.getElementById('mines-counter');
const emotionButton = document.getElementById('emotion-button');
const timerElem = document.getElementById('timer');

let board = [];
let minesLocation = new Set();
let cellsOpened = 0;
let remainingMines = MINES_COUNT;
let gameOver = false;

const { cellButton, opened, flagged, question, mine, wrongMine, lastMine } = CELL;
const { smile, smilePressed, wow, win, lose } = EMOTION_CELL;

function setupGame() {
  minesCounterElem.textContent = remainingMines;
  emotionButton.classList.add(smile);
  timerElem.textContent = '000';

  emotionButton.addEventListener('click', () => {
    emotionButton.classList.add(smilePressed);
    resetBoard();
    startGame();
    setTimeout(() => emotionButton.classList.remove(smilePressed), 100);
  });
}

function startGame() {
  setupGame();
  createBoard();
  setRandomMines();
};

function createBoard() {
  for (let row = 0; row < BOARD_ROWS; row++) {
    const rowArr = [];
    for (let column = 0; column < BOARD_COLUMNS; column++) {
      const cell = createCell();
      cell.id = `${row}-${column}`;
      cell.addEventListener('contextmenu', handleRightClick);
      cell.addEventListener('mousedown', handleMouseDown);
      cell.addEventListener('mouseup', handleMouseUp);
      boardElem.append(cell);
      rowArr.push(cell);
    }
    board.push(rowArr);
  }
}

function resetBoard() {
  board = [];
  minesLocation.clear();
  cellsOpened = 0;
  remainingMines = MINES_COUNT;
  gameOver = false;
  minesCounterElem.textContent = remainingMines;
  emotionButton.classList.remove(lose);
  emotionButton.classList.remove(win);
  emotionButton.classList.add(smile);
  timerElem.textContent = '000';
  boardElem.innerHTML = '';
}

function createCell() {
  const cell = document.createElement('button');
  cell.classList.add(cellButton);
  return cell;
}

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

const handleMouseDown = (event) => {
  if (event.button === 0) {
    emotionButton.classList.add(wow);
  }
};

const handleMouseUp = (event) => {
  if (event.button === 0) {
    emotionButton.classList.remove(wow);
    handleLeftClick(event);
  }
};

function setRandomMines() {
  let minesLeft = MINES_COUNT;
  while (minesLeft > 0) {
    let row = Math.floor(Math.random() * BOARD_ROWS);
    let column = Math.floor(Math.random() * BOARD_COLUMNS);
    const cellId = `${row}-${column}`;

    if (!minesLocation.has(cellId)) {
      minesLocation.add(cellId);
      minesLeft -= 1;
    }
  }
};

function showAllMines() {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let column = 0; column < BOARD_COLUMNS; column++) {
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

function gameStatus(row, column) {
  if (row < 0 || row >= BOARD_ROWS || column < 0 || column >= BOARD_COLUMNS) {
    return;
  };

  const cell = board[row][column];
  if (cell.classList.contains(opened) || cell.classList.contains(flagged)) {
    return;
  }

  cell.classList.add(opened);
  cellsOpened += 1;

  if (minesLocation.has(cell.id)) {
    showAllMines();
    stopTimer();
    gameOver = true;
    emotionButton.classList.remove(smile);
    emotionButton.classList.add(lose);
    return;
  }

  if (cellsOpened === BOARD_ROWS * BOARD_COLUMNS - MINES_COUNT) {
    stopTimer();
    gameOver = true;
    emotionButton.classList.remove(smile);
    emotionButton.classList.add(win);
    return;
  }

  let minesFound = 0;
  const startRow = Math.max(row - 1, 0);
  const endRow = Math.min(row + 1, BOARD_ROWS - 1);
  const startColumn = Math.max(column - 1, 0);
  const endColumn = Math.min(column + 1, BOARD_COLUMNS - 1);
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startColumn; c <= endColumn; c++) {
      const cell = board[r][c];
      if (minesLocation.has(cell.id)) {
        minesFound += 1;
      }
    }
  }

  if (minesFound > 0) {
    cell.classList.add(`x${minesFound}`);
    return;
  }

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startColumn; c <= endColumn; c++) {
      if (r === row && c === column) {
        continue;
      }
      gameStatus(r, c);
    }
  }
}

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
  gameStatus(row, column);
};

startGame();
