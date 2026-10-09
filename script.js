const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const startButton = document.getElementById('startButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialSpeed = 120;
const speedStep = 6;

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem('snake-best-score')) || 0;
let isPaused = false;
let isGameOver = false;
let tickInterval = initialSpeed;
let lastTime = 0;

bestScoreElement.textContent = String(bestScore);

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  tickInterval = initialSpeed;
  isPaused = false;
  isGameOver = false;
  scoreElement.textContent = '0';
  placeFood();
}

function placeFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  food = newFood;
}

function updateScore() {
  scoreElement.textContent = String(score);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('snake-best-score', String(bestScore));
    bestScoreElement.textContent = String(bestScore);
  }
}

function setDirection(x, y) {
  if (isGameOver) {
    return;
  }

  if (x === -direction.x && y === -direction.y) {
    return;
  }

  nextDirection = { x, y };
}

function updateGame() {
  if (isPaused || isGameOver) {
    return;
  }

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  const wallCollision =
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount;

  const selfCollision = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (wallCollision || selfCollision) {
    isGameOver = true;
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    tickInterval = Math.max(60, initialSpeed - score * speedStep);
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }
}

function drawGrid() {
  ctx.fillStyle = '#0a1722';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(118, 159, 184, 0.18)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawFood() {
  const radius = gridSize / 2.1;
  ctx.beginPath();
  ctx.fillStyle = '#ff6b6b';
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * gridSize + 1;
    const y = segment.y * gridSize + 1;
    const size = gridSize - 2;

    ctx.fillStyle = index === 0 ? '#b8ffb5' : '#7ef29a';
    ctx.fillRect(x, y, size, size);
  });
}

function drawOverlay() {
  if (!isGameOver && !isPaused) {
    return;
  }

  ctx.fillStyle = 'rgba(7, 19, 31, 0.62)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#edf7ff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px Arial';

  if (isGameOver) {
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '18px Arial';
    ctx.fillText('Press Enter or Restart', canvas.width / 2, canvas.height / 2 + 28);
  } else {
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
  }
}

function render() {
  drawGrid();
  drawFood();
  drawSnake();
  drawOverlay();
}

function gameLoop(timestamp) {
  if (!isPaused && !isGameOver && timestamp - lastTime >= tickInterval) {
    lastTime = timestamp;
    updateGame();
  }

  render();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (isGameOver) {
    return;
  }

  isPaused = !isPaused;
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === ' ') {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.key === 'Enter' && isGameOver) {
    resetGame();
    return;
  }

  const map = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };

  if (map[key]) {
    event.preventDefault();
    const [x, y] = map[key];
    setDirection(x, y);
  }
});

startButton.addEventListener('click', () => {
  resetGame();
});

resetGame();
requestAnimationFrame(gameLoop);
