(() => {
  "use strict";

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const resetBtn = document.getElementById("resetBtn");
  const currentPlayerText = document.getElementById("currentPlayerText");

  /** Game state */
  let board = Array(9).fill(null); // indices 0..8
  let current = "X";
  let gameOver = false;

  /** All win lines */
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]           // diags
  ];

  function updateStatus(text) {
    statusEl.textContent = text;
  }

  function setAria(cellBtn, index, value) {
    const pos = index + 1;
    const state = value ? (value === "X" ? "X" : "O") : "empty";
    cellBtn.setAttribute("aria-label", `Cell ${pos}, ${state}`);
  }

  function render() {
    // reflect board -> UI
    [...boardEl.querySelectorAll(".cell")].forEach((btn, i) => {
      const val = board[i];
      btn.textContent = val ? val : "";
      btn.classList.toggle("x", val === "X");
      btn.classList.toggle("o", val === "O");
      setAria(btn, i, val);
    });

    currentPlayerText.textContent = current;
  }

  function winner() {
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function isDraw() {
    return board.every(Boolean);
  }

  function handleMove(index, btn) {
    if (gameOver || board[index]) return;

    board[index] = current;
    btn.textContent = current;
    btn.classList.add(current.toLowerCase());
    setAria(btn, index, current);

    const w = winner();
    if (w) {
      gameOver = true;
      updateStatus(`Winner: ${w}! 🎉`);
      boardEl.setAttribute("aria-label", `Game over. Winner ${w}.`);
      launchConfetti(w); // pass "X" or "O"
      setTimeout(reset, 3000);
      [...boardEl.querySelectorAll(".cell")].forEach(btn => btn.disabled = true);
      return;
    }


    if (isDraw()) {
      gameOver = true;
      updateStatus("It's a draw! 🤝");
      boardEl.setAttribute("aria-label", "Game over. It's a draw.");
      launchConfetti("draw"); // special palette
      setTimeout(reset, 3000);
      [...boardEl.querySelectorAll(".cell")].forEach(btn => btn.disabled = true);
      return;
    }

    current = current === "X" ? "O" : "X";
    currentPlayerText.textContent = current;
    updateStatus(`Your move: ${current}`);
  }

  function reset() {
    board = Array(9).fill(null);
    current = "X";
    gameOver = false;
    updateStatus("Your move: X");
    boardEl.setAttribute("aria-label", "New game started.");
    [...boardEl.querySelectorAll(".cell")].forEach(btn => btn.disabled = false);
    render();
  }

  /** Event bindings (click + keyboard) */
  boardEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cell");
    if (!btn) return;
    const index = Number(btn.dataset.index);
    handleMove(index, btn);
  });

  // Keyboard play with arrows + Enter/Space for activation
  boardEl.addEventListener("keydown", (e) => {
    const cells = [...boardEl.querySelectorAll(".cell")];
    const active = document.activeElement;
    const idx = cells.indexOf(active);
    if (idx === -1) return;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (row > 0) cells[(row - 1) * 3 + col].focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (row < 2) cells[(row + 1) * 3 + col].focus();
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (col > 0) cells[row * 3 + (col - 1)].focus();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (col < 2) cells[row * 3 + (col + 1)].focus();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleMove(idx, active);
        break;
    }
  });

  resetBtn.addEventListener("click", reset);

  // Initialize: focus first cell for keyboard discoverability
  render();
  const firstCell = boardEl.querySelector('.cell[data-index="0"]');
  if (firstCell) firstCell.focus();
})();
/** Unified confetti effect (X, O, or Draw) **/
function launchConfetti(result) {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

// Palettes: X wins (red), O wins (green), Draw (gold/neutral)
const palettes = {
  X: ["#ef4444", "#f87171", "#b91c1c"],     // reds for X
  O: ["#22c55e", "#4ade80", "#15803d"],     // greens for O
  draw: ["#facc15", "#fde68a", "#e5e7eb"]   // gold + light neutral
};

  const colors = palettes[result] || ["#a855f7", "#f43f5e", "#facc15"]; // fallback rainbow

  const pieces = [];
  for (let i = 0; i < 100; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 8,
      h: 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 3,
      tilt: Math.random() * 10 - 5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
  }

  function update() {
    pieces.forEach(p => {
      p.y += p.speed;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  let frame = 0;
  function loop() {
    frame++;
    draw();
    update();
    if (frame < 200) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  loop();
}


