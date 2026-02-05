(() => {
  "use strict";

  // DOM Elements
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const resetBtn = document.getElementById("resetBtn");
  const currentPlayerText = document.getElementById("currentPlayerText");
  const pvaBtn = document.getElementById("pvaBtn");
  const pvpBtn = document.getElementById("pvpBtn");

  // Game State
  let board = Array(9).fill(null);
  let current = "X";
  let gameOver = false;
  let gameMode = "AI"; // Default trend: VS AI

  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]            // diags
  ];

  function updateStatus(text) {
    statusEl.textContent = text;
  }

  function render() {
    [...boardEl.querySelectorAll(".cell")].forEach((btn, i) => {
      const val = board[i];
      btn.textContent = val || "";
      // Modern styling classes
      btn.className = `cell ${val ? val.toLowerCase() : ""}`;
      btn.disabled = !!val || gameOver;
      
      // Accessibility update
      const state = val ? val : "empty";
      btn.setAttribute("aria-label", `Cell ${i + 1}, ${state}`);
    });

    currentPlayerText.textContent = current;
    currentPlayerText.className = `${current.toLowerCase()}-turn`;
  }

  function checkWinner(b) {
    for (const [a, b_idx, c] of LINES) {
      if (b[a] && b[a] === b[b_idx] && b[a] === b[c]) return b[a];
    }
    if (b.every(cell => cell !== null)) return "draw";
    return null;
  }

  // --- MINIMAX AI (SEO Trend: Unbeatable Mode) ---
  function minimax(newBoard, player) {
    const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
    const result = checkWinner(newBoard);

    if (result === "X") return { score: -10 };
    if (result === "O") return { score: 10 };
    if (result === "draw") return { score: 0 };

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === "O") {
        move.score = minimax(newBoard, "X").score;
      } else {
        move.score = minimax(newBoard, "O").score;
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMove;
    if (player === "O") {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }

  function handleMove(index) {
    if (gameOver || board[index]) return;

    board[index] = current;
    render();

    const result = checkWinner(board);
    if (result) {
      handleGameOver(result);
      return;
    }

    // Switch turns
    current = current === "X" ? "O" : "X";
    
    if (gameMode === "AI" && current === "O") {
      updateStatus("AI is thinking...");
      setTimeout(() => {
        const bestMove = minimax(board, "O");
        if (bestMove) handleMove(bestMove.index);
      }, 500); // 2026 UX: Small delay makes AI feel "real"
    } else {
      updateStatus(`Your move: ${current}`);
    }
  }

  function handleGameOver(result) {
    gameOver = true;
    if (result === "draw") {
      updateStatus("It's a draw! 🤝");
      launchConfetti("draw");
    } else {
      updateStatus(`${result} Wins! 🎉`);
      launchConfetti(result);
    }
    render();
  }

  function reset() {
    board = Array(9).fill(null);
    current = "X";
    gameOver = false;
    updateStatus("Your move: X");
    render();
  }

  // --- MODE TOGGLES ---
  pvaBtn.addEventListener("click", () => {
    gameMode = "AI";
    pvaBtn.classList.add("active");
    pvpBtn.classList.remove("active");
    reset();
  });

  pvpBtn.addEventListener("click", () => {
    gameMode = "PVP";
    pvpBtn.classList.add("active");
    pvaBtn.classList.remove("active");
    reset();
  });

  // --- EVENT LISTENERS ---
  boardEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cell");
    if (btn && !btn.disabled && !gameOver) {
      handleMove(Number(btn.dataset.index));
    }
  });

  resetBtn.addEventListener("click", reset);

  // --- CONFETTI EFFECT (Inside Scope) ---
  function launchConfetti(result) {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Fix: Sync canvas internal resolution with its CSS display size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    X: ["#F87171", "#ef4444", "#dc2626"], // Coral Red palette from icon
    O: ["#34D399", "#10b981", "#059669"], // Mint Green palette from icon
    draw: ["#EAB308", "#facc15", "#fef08a"] // Gold palette from icon
  };

  const colors = palettes[result] || ["#EAB308", "#F87171", "#34D399"];
  const pieces = [];
  
  for (let i = 0; i < 100; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20, // Start just above the view
      w: Math.random() * 8 + 4,
      h: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 3 + Math.random() * 4,
      tilt: Math.random() * 20 - 10
    });
  }

  let frame = 0;
  function loop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    pieces.forEach(p => {
      p.y += p.speed;
      p.tilt += 0.1;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < 200) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  loop();
}

  // Initialize UI
  render();

})(); // End of IIFE