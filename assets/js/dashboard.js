/**
 * UWorld B2C — Dashboard
 * MCAT QBank score simulator, bell curve, and UI interactions.
 * Depends on: theme.js (loaded first in HTML)
 */

'use strict';

/* ── Score simulator data ── */
const SIM_CATS = [
  {
    id: 'ubooks', name: 'UBooks + Videos', icon: 'fa-book-open', color: '#0B6FBE',
    items: [
      { name: 'Chem & Physics: Atomic Structure',   pts: 1.5 },
      { name: 'Chem & Physics: Thermodynamics',     pts: 1.5 },
      { name: 'Biology: Cell Biology & Genetics',   pts: 2   },
      { name: 'Biology: Organ Systems',             pts: 2   },
      { name: 'Biochemistry: Enzymes & Metabolism', pts: 2   },
      { name: 'Psychology & Sociology',             pts: 2   },
      { name: 'CARS Strategy Videos',               pts: 2   },
    ],
  },
  {
    id: 'practice', name: 'Practice Exams', icon: 'fa-file-pen', color: '#C05621',
    items: [
      { name: 'Full-Length Practice Exam 1',  pts: 4 },
      { name: 'Full-Length Practice Exam 2',  pts: 4 },
      { name: 'Full-Length Practice Exam 3',  pts: 4 },
      { name: 'Section Test: Chem / Physics', pts: 2 },
      { name: 'Section Test: CARS',           pts: 2 },
      { name: 'Section Test: Bio / Biochem',  pts: 2 },
    ],
  },
  {
    id: 'flashcards', name: 'Flashcards', icon: 'fa-layer-group', color: '#6B46C1',
    items: [
      { name: 'Biology & Biochemistry Deck', pts: 1.5 },
      { name: 'General Chemistry Deck',      pts: 1.5 },
      { name: 'Organic Chemistry Deck',      pts: 1.5 },
      { name: 'Physics Deck',                pts: 1.5 },
      { name: 'Psychology & Sociology Deck', pts: 1.5 },
      { name: 'High-Yield CARS Vocab Deck',  pts: 1   },
    ],
  },
  {
    id: 'aamc', name: 'AAMC® Materials', icon: 'fa-building-columns', color: '#2C7A7B',
    items: [
      { name: 'AAMC Sample Test',     pts: 3 },
      { name: 'AAMC Practice Exam 1', pts: 4 },
      { name: 'AAMC Practice Exam 2', pts: 4 },
      { name: 'AAMC Question Packs',  pts: 2 },
      { name: 'AAMC Section Bank',    pts: 3 },
    ],
  },
];

const BASE_SCORE = 474;

/* ── Build simulator UI ── */
function buildSimulator() {
  const container = document.getElementById('simCats');
  if (!container) return;

  SIM_CATS.forEach((cat) => {
    const totalPts = cat.items.reduce((sum, item) => sum + item.pts, 0);

    const el = document.createElement('div');
    el.className = 'sim-cat';
    el.innerHTML = `
      <div class="sim-cat__header" data-cat-id="${cat.id}">
        <div class="sim-cat__icon" data-color="${cat.color}">
          <i class="fa-solid ${cat.icon}" aria-hidden="true"></i>
        </div>
        <div class="sim-cat__info">
          <div class="sim-cat__name">${cat.name}</div>
          <div class="sim-cat__subtitle" id="csub-${cat.id}">0 / ${cat.items.length} completed</div>
        </div>
        <div class="sim-cat__right">
          <div class="sim-cat__points">+${totalPts} pts</div>
          <i class="fa-solid fa-chevron-down sim-cat__chevron" id="cchev-${cat.id}" aria-hidden="true"></i>
        </div>
      </div>
      <div class="sim-cat__bar">
        <div class="sim-cat__bar-fill" id="cbar-${cat.id}" data-color="${cat.color}"></div>
      </div>
      <div class="sim-cat__items" id="citems-${cat.id}" role="group" aria-label="${cat.name} items">
        ${cat.items.map((item, idx) => `
          <label class="sim-item" id="crow-${cat.id}-${idx}">
            <input type="checkbox" data-cat="${cat.id}" data-pts="${item.pts}">
            <span class="sim-item__name">${item.name}</span>
            <span class="sim-item__points">+${item.pts}</span>
          </label>`).join('')}
      </div>`;

    container.appendChild(el);

    /* Apply theme to icon and bar fill */
    setTheme(el.querySelector('.sim-cat__icon'), cat.color, true);
    setTheme(el.querySelector('.sim-cat__bar-fill'), cat.color, true);

    /* Header click handler */
    el.querySelector('.sim-cat__header').addEventListener('click', () => toggleCat(cat.id));
  });

  /* Checkbox change handler (event delegation) */
  container.addEventListener('change', onCheckChange);
}

function toggleCat(id) {
  document.getElementById(`citems-${id}`)?.classList.toggle('sim-cat__items--open');
  document.getElementById(`cchev-${id}`)?.classList.toggle('sim-cat__chevron--open');
}

/* ── Score band helpers ── */
function getBandKey(score) {
  if (score <= 499) return 'low';
  if (score <= 504) return 'borderline';
  if (score <= 514) return 'high';
  return 'very-high';
}

function getBandLabel(score) {
  if (score <= 499) return 'Low';
  if (score <= 504) return 'Borderline';
  if (score <= 514) return 'High';
  return 'Very High';
}

/* ── Update score UI ── */
function onCheckChange() {
  let gained = 0;
  document.querySelectorAll('.sim-item input:checked').forEach((cb) => {
    gained += parseFloat(cb.dataset.pts);
  });

  /* Toggle done state on rows */
  document.querySelectorAll('.sim-item').forEach((row) => {
    row.classList.toggle('sim-item--done', row.querySelector('input').checked);
  });

  const score    = Math.min(528, Math.round(BASE_SCORE + gained));
  const bandKey  = getBandKey(score);
  const bandLbl  = getBandLabel(score);

  /* Band label */
  const bandEl = document.getElementById('bandLabel');
  if (bandEl) {
    bandEl.textContent = `${score} – ${bandLbl}`;
    bandEl.className   = `score-band${bandKey !== 'low' ? ' score-band--' + bandKey : ''}`;
  }

  /* Simulated badge */
  document.getElementById('simBadge')?.classList.toggle('sim-badge--active', gained > 0);

  /* Score segments */
  ['low', 'borderline', 'high', 'very-high'].forEach((key) => {
    const seg = document.getElementById(`seg-${key}`);
    if (seg) {
      seg.className = `score-seg${key === bandKey ? ' score-seg--active score-seg--' + key : ''}`;
    }
  });

  /* Arrow position */
  const pcts  = [12.5, 37.5, 62.5, 87.5];
  const idx   = ['low', 'borderline', 'high', 'very-high'].indexOf(bandKey);
  const arrow = document.getElementById('arrowRow');
  if (arrow) arrow.style.paddingLeft = `calc(${pcts[idx]}% - 6px)`;

  /* Per-category progress bars and subtitles */
  SIM_CATS.forEach((cat) => {
    const done    = document.querySelectorAll(`input[data-cat="${cat.id}"]:checked`).length;
    const total   = cat.items.length;
    const barFill = document.getElementById(`cbar-${cat.id}`);
    const subEl   = document.getElementById(`csub-${cat.id}`);
    if (barFill) setProgress(barFill, (done / total) * 100);
    if (subEl)   subEl.textContent = `${done} / ${total} completed`;
  });

  /* Overall progress */
  const allInputs  = document.querySelectorAll('.sim-item input').length;
  const doneInputs = document.querySelectorAll('.sim-item input:checked').length;
  const ovBar      = document.getElementById('ovBar');
  const ovPct      = document.getElementById('ovPct');
  if (ovBar) setProgress(ovBar, (doneInputs / allInputs) * 100);
  if (ovPct) ovPct.textContent = `${doneInputs} / ${allInputs}`;
}

/* ── Modal ── */
function openSimulator() {
  document.querySelectorAll('.sim-cat__items').forEach((el) => el.classList.remove('sim-cat__items--open'));
  document.querySelectorAll('.sim-cat__chevron').forEach((el) => el.classList.remove('sim-cat__chevron--open'));
  document.getElementById('simOverlay')?.classList.add('modal-overlay--open');
}

function closeSimulator() {
  document.getElementById('simOverlay')?.classList.remove('modal-overlay--open');
}

function onOverlayClick(e) {
  if (e.target === document.getElementById('simOverlay')) closeSimulator();
}

function resetSimulator() {
  document.querySelectorAll('.sim-item input').forEach((cb) => { cb.checked = false; });
  document.querySelectorAll('.sim-item').forEach((r) => r.classList.remove('sim-item--done'));
  onCheckChange();
}

/* ── Bell curve canvas ── */
function initBellCurve() {
  const canvas = document.getElementById('bellCurve');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const parent  = canvas.parentElement;
    canvas.width  = parent.clientWidth - 20;
    canvas.height = Math.max(150, Math.round(parent.clientHeight * 0.85 || 190));
    draw();
  }

  function bellY(x, mu, sigma) {
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const mu = 0.5, sigma = 0.15;
    const pL = 44, pR = 20, pT = 24, pB = 30;
    const pw = W - pL - pR, ph = H - pT - pB;

    const pts = Array.from({ length: 201 }, (_, i) => {
      const t = i / 200;
      return { x: pL + t * pw, y: pT + ph - bellY(t, mu, sigma) * ph * 0.9 };
    });

    /* Fill */
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pT + ph);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[200].x, pT + ph);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pT, 0, pT + ph);
    grad.addColorStop(0, 'rgba(11,111,190,.18)');
    grad.addColorStop(1, 'rgba(11,111,190,.03)');
    ctx.fillStyle = grad;
    ctx.fill();

    /* Curve line */
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.strokeStyle = '#0B6FBE';
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    /* Baseline */
    ctx.beginPath();
    ctx.moveTo(pL, pT + ph);
    ctx.lineTo(pL + pw, pT + ph);
    ctx.strokeStyle = '#DDE3EA';
    ctx.lineWidth   = 1;
    ctx.stroke();

    /* 50th percentile line */
    const x50 = pL + 0.5 * pw;
    ctx.beginPath(); ctx.moveTo(x50, pT); ctx.lineTo(x50, pT + ph);
    ctx.strokeStyle = '#0B6FBE'; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#2D3748'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('50th', x50, pT - 8);

    /* User marker */
    const x2 = pL + 0.14 * pw;
    ctx.beginPath(); ctx.arc(x2, pT + ph - 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#27AE60'; ctx.fill();
    ctx.fillStyle = '#27AE60'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('2nd', x2, pT + ph + 18);
  }

  resize();
  window.addEventListener('resize', resize);
}

/* ── Wire up keyboard handler ── */
function wireButtons() {
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSimulator(); });
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  buildSimulator();
  wireButtons();
  onCheckChange();
  initBellCurve();
});

/*
 * Expose to HTML inline onclick attributes.
 * overlayClick is used by the modal overlay's onclick="overlayClick(event)"
 */
window.openSimulator  = openSimulator;
window.closeSimulator = closeSimulator;
window.resetSimulator = resetSimulator;
window.overlayClick   = onOverlayClick;
