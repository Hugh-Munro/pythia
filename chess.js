let CN = 8, chessMode = 'start', chessPiece = 'king';
let startSq = null, targetSq = null, chessHittingTimes = null, chessHeatmapOn = false;
let chessSimRunning = false, chessSimCancel = false, chessBarHeights = [];

// ---- coordinate helpers (row/col <-> square index 0..63) ----
function chessSqIndex(row, col) { return row * CN + col; }
function chessSqToRowCol(sq) { return { row: Math.floor(sq / CN), col: sq % CN }; }

// ---- move generators ----
function kingMoves(sq) {
  const { row, col } = chessSqToRowCol(sq);
  const deltas = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const moves = [];
  for (const [dr, dc] of deltas) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < CN && c >= 0 && c < CN) moves.push(chessSqIndex(r, c));
  }
  return moves;
}
function knightMoves(sq) {
  const { row, col } = chessSqToRowCol(sq);
  const deltas = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const moves = [];
  for (const [dr, dc] of deltas) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < CN && c >= 0 && c < CN) moves.push(chessSqIndex(r, c));
  }
  return moves;
}
function getMoves(sq) { return chessPiece === 'king' ? kingMoves(sq) : knightMoves(sq); }

// ---- piece icons (same marble style as die icons, v1) ----
function kingSVG(w) {
  return `<svg width="${w}" height="${w}" viewBox="0 0 72 72" fill="none">
    <defs>
      <radialGradient id="bk_top" cx="35%" cy="25%" r="75%"><stop offset="0%" stop-color="#F4F4FC"/><stop offset="100%" stop-color="#C0C0D8"/></radialGradient>
      <radialGradient id="bk_body" cx="40%" cy="20%" r="90%"><stop offset="0%" stop-color="#E4E4F2"/><stop offset="100%" stop-color="#A8A8C4"/></radialGradient>
      <linearGradient id="bk_base" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B8B8D0"/><stop offset="100%" stop-color="#8888A8"/></linearGradient>
    </defs>
    <ellipse cx="36" cy="65" rx="20" ry="3" fill="rgba(0,0,0,0.14)"/>
    <rect x="14" y="56" width="44" height="8" rx="3" fill="url(#bk_base)"/>
    <rect x="18" y="50" width="36" height="8" rx="3" fill="url(#bk_base)"/>
    <path d="M22 50 C20 40 20 32 26 26 C22 24 20 20 22 16 C24 18 27 19 29 19 C29 15 32 11 36 9 C40 11 43 15 43 19 C45 19 48 18 50 16 C52 20 50 24 46 26 C52 32 52 40 50 50 Z" fill="url(#bk_body)"/>
    <path d="M22 50 C20 40 20 32 26 26 C22 24 20 20 22 16 C24 18 27 19 29 19 C29 15 32 11 36 9 C40 11 43 15 43 19 C45 19 48 18 50 16 C52 20 50 24 46 26 C52 32 52 40 50 50 Z" fill="url(#bk_top)" opacity="0.5"/>
    <rect x="32" y="4" width="8" height="16" rx="1.5" fill="url(#bk_base)"/>
    <rect x="27" y="8" width="18" height="6" rx="1.5" fill="url(#bk_base)"/>
    <ellipse cx="30" cy="30" rx="5" ry="8" fill="rgba(255,255,255,0.32)"/>
  </svg>`;
}
function knightSVG(w) {
  return `<svg width="${w}" height="${w}" viewBox="0 0 72 72" fill="none">
    <defs>
      <radialGradient id="bn_top" cx="35%" cy="22%" r="80%"><stop offset="0%" stop-color="#F4F4FC"/><stop offset="100%" stop-color="#C0C0D8"/></radialGradient>
      <radialGradient id="bn_body" cx="42%" cy="20%" r="95%"><stop offset="0%" stop-color="#E4E4F2"/><stop offset="100%" stop-color="#A8A8C4"/></radialGradient>
      <linearGradient id="bn_base" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B8B8D0"/><stop offset="100%" stop-color="#8888A8"/></linearGradient>
    </defs>
    <ellipse cx="36" cy="65" rx="20" ry="3" fill="rgba(0,0,0,0.14)"/>
    <rect x="14" y="56" width="44" height="8" rx="3" fill="url(#bn_base)"/>
    <rect x="18" y="50" width="36" height="8" rx="3" fill="url(#bn_base)"/>
    <path d="M46 50 C48 42 47 36 43 33 C46 30 47 25 44 20 C42 22 40 22 39 21 C41 17 40 13 36 10 C33 13 30 15 26 15 C21 15 17 18 16 23 C15 27 17 30 20 31 C18 34 18 38 21 41 L20 50 Z" fill="url(#bn_body)"/>
    <path d="M46 50 C48 42 47 36 43 33 C46 30 47 25 44 20 C42 22 40 22 39 21 C41 17 40 13 36 10 C33 13 30 15 26 15 C21 15 17 18 16 23 C15 27 17 30 20 31 C18 34 18 38 21 41 L20 50 Z" fill="url(#bn_top)" opacity="0.45"/>
    <ellipse cx="24" cy="21" rx="2.6" ry="2" fill="#3A3A55"/>
    <path d="M16 23 C15 26 16 28 18 29" stroke="#8888A8" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M39 21 C37 24 35 25 32 24" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <ellipse cx="30" cy="24" rx="5" ry="7" fill="rgba(255,255,255,0.28)"/>
  </svg>`;
}
function pieceSVG(name, w) { return name === 'king' ? kingSVG(w) : knightSVG(w); }

// ---- grid build ----
function buildChessGrid() {
  const grid = document.getElementById('chess-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${CN}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${CN}, 1fr)`;
  for (let row = 0; row < CN; row++) {
    for (let col = 0; col < CN; col++) {
      const sq = chessSqIndex(row, col);
      const div = document.createElement('div');
      div.className = 'sq' + ((row + col) % 2 === 0 ? ' light' : '');
      div.dataset.sq = sq;
      div.addEventListener('click', () => handleChessSquareClick(sq));
      grid.appendChild(div);
    }
  }
  renderChessPieces();
  if (chessHeatmapOn && chessHittingTimes) applyChessHeatmap();
}

function renderChessPieces() {
  document.querySelectorAll('#chess-grid .sq').forEach(el => {
    const sq = parseInt(el.dataset.sq);
    el.classList.remove('chess-start', 'chess-target');
    const existingPiece = el.querySelector('.chess-piece-icon');
    if (existingPiece) existingPiece.remove();
    if (sq === startSq) {
      el.classList.add('chess-start');
      const wrap = document.createElement('div');
      wrap.className = 'chess-piece-icon';
      wrap.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;';
      wrap.innerHTML = pieceSVG(chessPiece, '70%');
      el.appendChild(wrap);
    }
    if (sq === targetSq) {
      el.classList.add('chess-target');
      if (sq !== startSq) {
        const flag = document.createElement('div');
        flag.className = 'chess-piece-icon';
        flag.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;color:#C0392B;font-size:16px;';
        flag.textContent = '\u2691';
        el.appendChild(flag);
      }
    }
  });
}

// ---- click handling ----
function handleChessSquareClick(sq) {
  if (chessSimRunning) return;
  if (chessMode === 'start') {
    startSq = sq;
    chessMode = 'target';
    document.getElementById('btn-start').classList.remove('active-mode');
    document.getElementById('btn-target').classList.add('active-mode');
    setChessHint('now click a square to place the target');
  } else {
    targetSq = sq;
    setChessHint('click calculate, or click a square to move the target');
  }
  chessHittingTimes = null;
  chessHeatmapOn = false;
  clearChessResults();
  renderChessPieces();
}

function setChessHint(msg) { document.getElementById('chess-hint-text').textContent = msg; }

function clearChessResults() {
  document.getElementById('chess-res-mean').textContent = '--';
  document.getElementById('chess-res-std').textContent = '--';
  document.getElementById('chess-sim-block').style.display = 'none';
  document.getElementById('chess-heatmap-toggle').style.display = 'none';
  document.getElementById('chess-mc-section').style.display = 'none';
  clearChessHist();
}
function clearChessHist() {
  const canvas = document.getElementById('chess-hist');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ['chess-hist-min','chess-hist-mid','chess-hist-max'].forEach(id => document.getElementById(id).textContent = '');
  chessBarHeights = [];
}

// ---- heatmap ----
function applyChessHeatmap() {
  const vals = chessHittingTimes ? Object.values(chessHittingTimes).filter(v => isFinite(v) && v > 0) : [];
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 1;
  const range = maxV - minV || 1;
  document.querySelectorAll('#chess-grid .sq').forEach(el => {
    const sq = parseInt(el.dataset.sq);
    if (!chessHeatmapOn || !chessHittingTimes) { el.style.background = ''; return; }
    if (sq === targetSq) { el.style.background = ''; return; }
    const v = chessHittingTimes[sq];
    if (v === undefined || !isFinite(v)) { el.style.background = ''; return; }
    const t = (v - minV) / range;
    el.style.background = `rgb(${Math.round(100 + t * 130)},${Math.round(140 - t * 40)},${Math.round(200 - t * 110)})`;
  });
}

// ---- markov: hitting time (absorbing at target) via same gaussian elimination approach ----
function gaussianEliminationChess(A, b) {
  const n = b.length, aug = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    const piv = aug[col][col];
    if (Math.abs(piv) < 1e-12) continue;
    for (let j = col; j <= n; j++) aug[col][j] /= piv;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = aug[row][col];
      for (let j = col; j <= n; j++) aug[row][j] -= f * aug[col][j];
    }
  }
  return aug.map(row => row[n]);
}

function runChessMarkov() {
  const total = CN * CN;

  // return-time case: start === target, use stationary distribution (degree / 2*edges)
  if (startSq === targetSq) {
    const degrees = [];
    let totalDegree = 0;
    for (let sq = 0; sq < total; sq++) {
      const d = getMoves(sq).length;
      degrees.push(d);
      totalDegree += d;
    }
    const mean = totalDegree / degrees[startSq];
    // variance not closed-form here; fall back to full hitting-time system with a virtual restart for spread estimate
    return { mean, std: null, hittingTimes: null, isReturn: true };
  }

  // hitting-time case: absorbing chain at targetSq
  const states = [];
  for (let sq = 0; sq < total; sq++) if (sq !== targetSq) states.push(sq);
  const index = {};
  states.forEach((s, i) => index[s] = i);
  const n = states.length;
  const P = Array.from({ length: n }, () => new Array(n).fill(0));

  for (const sq of states) {
    const moves = getMoves(sq);
    const p = 1 / moves.length;
    for (const dest of moves) {
      if (dest !== targetSq) P[index[sq]][index[dest]] += p;
    }
  }

  const IminusP = P.map((row, i) => row.map((v, j) => (i === j ? 1 : 0) - v));
  const k = gaussianEliminationChess(IminusP.map(r => [...r]), Array(n).fill(1));
  const Pk = P.map(row => row.reduce((s, v, j) => s + v * k[j], 0));
  const m = gaussianEliminationChess(IminusP.map(r => [...r]), k.map((ki, i) => 1 + 2 * Pk[i]));
  const variance = Math.max(0, m[index[startSq]] - k[index[startSq]] ** 2);

  const ht = {};
  states.forEach((s, i) => { ht[s] = k[i]; });
  ht[targetSq] = 0;

  return { mean: k[index[startSq]], std: Math.sqrt(variance), hittingTimes: ht, isReturn: false };
}

// ---- tab switching ----
document.getElementById('tab-sl').addEventListener('click', () => {
  document.getElementById('tab-sl').classList.add('active');
  document.getElementById('tab-chess').classList.remove('active');
  document.getElementById('view-sl').classList.add('active');
  document.getElementById('view-chess').classList.remove('active');
});
document.getElementById('tab-chess').addEventListener('click', () => {
  document.getElementById('tab-chess').classList.add('active');
  document.getElementById('tab-sl').classList.remove('active');
  document.getElementById('view-chess').classList.add('active');
  document.getElementById('view-sl').classList.remove('active');
  buildChessGrid();
});

// ---- piece selector ----
document.querySelectorAll('.piece-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.piece-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chessPiece = btn.dataset.piece;
    chessHittingTimes = null;
    chessHeatmapOn = false;
    clearChessResults();
    renderChessPieces();
  });
});

// ---- place mode buttons ----
document.getElementById('btn-start').addEventListener('click', () => {
  chessMode = 'start';
  document.getElementById('btn-start').classList.add('active-mode');
  document.getElementById('btn-target').classList.remove('active-mode');
  setChessHint('click a square to place start');
});
document.getElementById('btn-target').addEventListener('click', () => {
  chessMode = 'target';
  document.getElementById('btn-target').classList.add('active-mode');
  document.getElementById('btn-start').classList.remove('active-mode');
  setChessHint('click a square to place target');
});

// ---- clear / undo (reuse header buttons contextually) ----
const chessClearHandler = () => {
  if (!document.getElementById('view-chess').classList.contains('active')) return;
  startSq = null; targetSq = null; chessHittingTimes = null; chessHeatmapOn = false;
  chessMode = 'start';
  document.getElementById('btn-start').classList.add('active-mode');
  document.getElementById('btn-target').classList.remove('active-mode');
  setChessHint('click a square to place start, then click again to place target');
  clearChessResults();
  renderChessPieces();
};
document.getElementById('clear-btn').addEventListener('click', chessClearHandler);

// ---- heatmap toggle ----
document.getElementById('chess-heatmap-toggle').addEventListener('click', () => {
  if (!chessHittingTimes) return;
  chessHeatmapOn = !chessHeatmapOn;
  const tog = document.getElementById('chess-heatmap-toggle');
  chessHeatmapOn ? tog.classList.add('on') : tog.classList.remove('on');
  applyChessHeatmap();
});

// ---- calculate ----
document.getElementById('chess-calc-btn').addEventListener('click', () => {
  if (startSq === null || targetSq === null) {
    setChessHint('place both a start and a target square first');
    return;
  }
  const result = runChessMarkov();
  document.getElementById('chess-res-mean').textContent = result.mean.toFixed(1);
  document.getElementById('chess-res-std').textContent = result.std !== null ? result.std.toFixed(1) : 'n/a';
  chessHittingTimes = result.hittingTimes;
  if (chessHittingTimes) {
    document.getElementById('chess-heatmap-toggle').style.display = 'flex';
    if (chessHeatmapOn) applyChessHeatmap();
  } else {
    document.getElementById('chess-heatmap-toggle').style.display = 'none';
  }
});

// ---- monte carlo ----
document.getElementById('chess-monte-btn').addEventListener('click', () => {
  if (startSq === null || targetSq === null) {
    setChessHint('place both a start and a target square first');
    return;
  }
  function simulate() {
    let sq = startSq, steps = 0;
    while (sq !== targetSq && steps < 500000) {
      const moves = getMoves(sq);
      sq = moves[Math.floor(Math.random() * moves.length)];
      steps++;
      if (steps > 1 && sq === targetSq && startSq === targetSq && steps < 1) continue;
    }
    return steps;
  }
  // for return-time (start===target) we must take at least one step before counting as "returned"
  function simulateReturn() {
    let sq = startSq, steps = 0;
    do {
      const moves = getMoves(sq);
      sq = moves[Math.floor(Math.random() * moves.length)];
      steps++;
    } while (sq !== targetSq && steps < 500000);
    return steps;
  }
  const doSim = startSq === targetSq ? simulateReturn : simulate;

  const N_SIMS = 10000, results = [];
  const btn = document.getElementById('chess-monte-btn');
  btn.disabled = true; btn.textContent = 'running...';
  const canvas = document.getElementById('chess-hist');
  const wrap = canvas.parentElement;
  const cssW = wrap.clientWidth;
  const cssH = wrap.clientHeight;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = cssW * window.devicePixelRatio;
  canvas.height = cssH * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  const W = cssW, H = cssH;
  const NBINS = 30;
  let targetHeights = new Array(NBINS).fill(0), barH = new Array(NBINS).fill(0);
  chessBarHeights = barH;
  let gMin = Infinity, gMax = -Infinity, animFrame = null, pMin = 0, pMax = 1;

  function computeBins() {
    if (results.length < 2) return;
    gMin = Math.min(...results); gMax = Math.max(...results);
    const sorted = [...results].sort((a,b) => a-b);
    pMin = gMin;
    pMax = sorted[Math.floor(sorted.length * 0.99)];
    if (pMax <= pMin) pMax = gMax;
    const range = pMax - pMin || 1, counts = new Array(NBINS).fill(0);
    results.forEach(v => {
      const t = (v - pMin) / range;
      const bin = Math.min(NBINS - 1, Math.max(0, Math.floor(t * NBINS)));
      counts[bin]++;
    });
    const maxC = Math.max(...counts);
    targetHeights = counts.map(c => c / maxC);
  }

  function animateBars() {
    for (let i = 0; i < NBINS; i++) barH[i] += (targetHeights[i] - barH[i]) * 0.18;
    ctx.clearRect(0, 0, W, H);
    const bw = W / NBINS;
    const mean = results.length ? results.reduce((a,b) => a+b, 0) / results.length : 0;
    const range = pMax - pMin || 1;
    barH.forEach((h, idx) => {
      if (h <= 0.001) return;
      const bH = h * H, bc = pMin + (idx + 0.5) * (range / NBINS);
      const t = Math.min(1, Math.abs(bc - mean) / (range * 0.5));
      ctx.fillStyle = `rgb(${Math.round(160+t*60)},${Math.round(80-t*60)},${Math.round(60-t*40)})`;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(idx*bw+1, H-bH, bw-2, bH, [2,2,0,0]);
      else ctx.rect(idx*bw+1, H-bH, bw-2, bH);
      ctx.fill();
    });
    document.getElementById('chess-hist-min').textContent = isFinite(gMin) ? gMin : '';
    document.getElementById('chess-hist-mid').textContent = results.length ? Math.round(results.reduce((a,b) => a+b,0) / results.length) : '';
    document.getElementById('chess-hist-max').textContent = isFinite(gMax) ? gMax : '';
    animFrame = requestAnimationFrame(animateBars);
  }
  animFrame = requestAnimationFrame(animateBars);

  let i = 0;
  function step() {
    for (let b = 0; b < 100 && i < N_SIMS; b++, i++) results.push(doSim());
    computeBins();
    if (i < N_SIMS) {
      requestAnimationFrame(step);
    } else {
      setTimeout(() => {
        cancelAnimationFrame(animFrame);
        btn.disabled = false; btn.textContent = 'monte carlo';
        const mean = results.reduce((a,b) => a+b, 0) / results.length;
        const sorted = [...results].sort((a,b) => a-b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length/2-1] + sorted[sorted.length/2]) / 2
          : sorted[Math.floor(sorted.length/2)];
        const variance = results.reduce((s,v) => s + (v-mean)**2, 0) / results.length;
        const std = Math.sqrt(variance);
        const skew = results.reduce((s,v) => s + ((v-mean)/std)**3, 0) / results.length;
        const prob = results.filter(r => r <= mean).length / results.length;
        document.getElementById('chess-mc-mean').textContent = mean.toFixed(1);
        document.getElementById('chess-mc-median').textContent = median.toFixed(1);
        document.getElementById('chess-mc-skew').textContent = skew.toFixed(2);
        document.getElementById('chess-mc-prob').textContent = (prob * 100).toFixed(1) + '%';
        document.getElementById('chess-mc-section').style.display = 'block';
      }, 600);
    }
  }
  requestAnimationFrame(step);
});

// ---- simulate run ----
document.getElementById('chess-sim-btn').addEventListener('click', () => {
  if (chessSimRunning) { chessSimCancel = true; return; }
  if (startSq === null || targetSq === null) {
    setChessHint('place both a start and a target square first');
    return;
  }
  const btn = document.getElementById('chess-sim-btn');
  const path = [startSq];
  let sq = startSq, steps = 0;
  const isReturn = startSq === targetSq;
  do {
    const moves = getMoves(sq);
    sq = moves[Math.floor(Math.random() * moves.length)];
    path.push(sq);
    steps++;
  } while ((sq !== targetSq || (isReturn && steps === 0)) && steps < 50000);

  chessSimRunning = true; chessSimCancel = false; btn.textContent = 'stop';
  document.getElementById('chess-sim-block').style.display = 'block';
  document.getElementById('chess-sim-steps').textContent = '0';
  let idx = 0;
  function stepAnim() {
    if (chessSimCancel || idx >= path.length) {
      chessSimRunning = false; chessSimCancel = false;
      document.getElementById('chess-sim-steps').textContent = path.length - 1;
      btn.textContent = 'simulate run'; btn.disabled = false;
      document.querySelectorAll('#chess-grid .chess-piece-icon').forEach(el => el.remove());
      renderChessPieces();
      return;
    }
    // move the piece visually to path[idx] without disturbing the target flag
    document.querySelectorAll('#chess-grid .sq .chess-piece-icon').forEach(el => {
      if (el.parentElement.dataset.sq != targetSq) el.remove();
    });
    const cell = document.querySelector(`#chess-grid .sq[data-sq="${path[idx]}"]`);
    if (cell) {
      const wrap = document.createElement('div');
      wrap.className = 'chess-piece-icon';
      wrap.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;';
      wrap.innerHTML = pieceSVG(chessPiece, '70%');
      cell.appendChild(wrap);
    }
    document.getElementById('chess-sim-steps').textContent = Math.max(0, idx);
    idx++; setTimeout(stepAnim, 120);
  }
  stepAnim();
});

window.addEventListener('resize', () => {});