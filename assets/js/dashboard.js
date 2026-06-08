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

/* ── Sidebar expand/collapse ── */
function initSidebarAccordion() {
  document.querySelectorAll('[data-sub]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const subId  = trigger.dataset.sub;
      const sub    = document.getElementById(subId);
      if (!sub) return;

      const isOpen = sub.classList.contains('sidebar__sub-menu--open');

      if (isOpen) {
        sub.classList.remove('sidebar__sub-menu--open');
        trigger.classList.remove('sidebar__nav-item--open', 'sidebar__sub-item--open');
      } else {
        sub.classList.add('sidebar__sub-menu--open');
        trigger.classList.add('sidebar__nav-item--open', 'sidebar__sub-item--open');
      }
    });
  });
}

/* ── Progress bars via data-progress attribute ── */
function initProgressBars() {
  document.querySelectorAll('[data-progress]').forEach((el) => {
    setProgress(el, parseFloat(el.dataset.progress));
  });
}

/* ── Planner tab switching ── */
function initPlannerTabs() {
  const tabs = document.querySelectorAll('.planner-tab');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => { t.classList.remove('planner-tab--active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('planner-tab--active');
      tab.setAttribute('aria-selected', 'true');
    });
  });
}

/* ════════════════════════════════════════
   TEST YOUR KNOWLEDGE — suggestions + form
   ════════════════════════════════════════ */

var TYK_TOPICS = [
  /* Biology */
  { cat: 'Biology', label: 'Cell Biology' },
  { cat: 'Biology', label: 'Cell Membrane & Transport' },
  { cat: 'Biology', label: 'Cell Division & Mitosis' },
  { cat: 'Biology', label: 'Meiosis & Gametogenesis' },
  { cat: 'Biology', label: 'DNA Replication' },
  { cat: 'Biology', label: 'DNA Repair Mechanisms' },
  { cat: 'Biology', label: 'Transcription & RNA Processing' },
  { cat: 'Biology', label: 'Translation & Protein Synthesis' },
  { cat: 'Biology', label: 'Gene Regulation' },
  { cat: 'Biology', label: 'Mutations & Genetic Disorders' },
  { cat: 'Biology', label: 'Mendelian Genetics' },
  { cat: 'Biology', label: 'Molecular Genetics' },
  { cat: 'Biology', label: 'Evolution & Natural Selection' },
  { cat: 'Biology', label: 'Ecology & Population Dynamics' },
  { cat: 'Biology', label: 'Nervous System' },
  { cat: 'Biology', label: 'Action Potential & Synaptic Transmission' },
  { cat: 'Biology', label: 'Cardiovascular System' },
  { cat: 'Biology', label: 'Respiratory System' },
  { cat: 'Biology', label: 'Digestive System' },
  { cat: 'Biology', label: 'Endocrine System' },
  { cat: 'Biology', label: 'Immune System' },
  { cat: 'Biology', label: 'Reproductive System' },
  { cat: 'Biology', label: 'Musculoskeletal System' },
  { cat: 'Biology', label: 'Renal System & Kidney Function' },
  { cat: 'Biology', label: 'Skin & Integumentary System' },
  { cat: 'Biology', label: 'Sensory Systems' },
  { cat: 'Biology', label: 'Embryology & Development' },
  { cat: 'Biology', label: 'Microbiology & Viruses' },

  /* Biochemistry */
  { cat: 'Biochemistry', label: 'Amino Acids & Peptides' },
  { cat: 'Biochemistry', label: 'Protein Structure & Folding' },
  { cat: 'Biochemistry', label: 'Enzyme Kinetics' },
  { cat: 'Biochemistry', label: 'Enzyme Inhibition' },
  { cat: 'Biochemistry', label: 'Glycolysis' },
  { cat: 'Biochemistry', label: 'Krebs Cycle (TCA Cycle)' },
  { cat: 'Biochemistry', label: 'Oxidative Phosphorylation' },
  { cat: 'Biochemistry', label: 'Gluconeogenesis' },
  { cat: 'Biochemistry', label: 'Glycogen Metabolism' },
  { cat: 'Biochemistry', label: 'Fatty Acid Oxidation (Beta-oxidation)' },
  { cat: 'Biochemistry', label: 'Fatty Acid Synthesis' },
  { cat: 'Biochemistry', label: 'Lipid Metabolism' },
  { cat: 'Biochemistry', label: 'Amino Acid Metabolism' },
  { cat: 'Biochemistry', label: 'Nucleotide Metabolism' },
  { cat: 'Biochemistry', label: 'Carbohydrate Structure' },
  { cat: 'Biochemistry', label: 'Nucleic Acids' },
  { cat: 'Biochemistry', label: 'Signal Transduction' },
  { cat: 'Biochemistry', label: 'Vitamins & Cofactors' },
  { cat: 'Biochemistry', label: 'Metabolism Regulation' },
  { cat: 'Biochemistry', label: 'Cellular Respiration' },

  /* General Chemistry */
  { cat: 'General Chemistry', label: 'Atomic Structure' },
  { cat: 'General Chemistry', label: 'Periodic Table & Trends' },
  { cat: 'General Chemistry', label: 'Chemical Bonding' },
  { cat: 'General Chemistry', label: 'Molecular Geometry & VSEPR' },
  { cat: 'General Chemistry', label: 'Thermodynamics & Thermochemistry' },
  { cat: 'General Chemistry', label: 'Chemical Kinetics' },
  { cat: 'General Chemistry', label: 'Chemical Equilibrium' },
  { cat: 'General Chemistry', label: 'Acids and Bases' },
  { cat: 'General Chemistry', label: 'Buffers & pH' },
  { cat: 'General Chemistry', label: 'Electrochemistry' },
  { cat: 'General Chemistry', label: 'Gases & Gas Laws' },
  { cat: 'General Chemistry', label: 'Solutions & Colligative Properties' },
  { cat: 'General Chemistry', label: 'Nuclear Chemistry & Radioactivity' },
  { cat: 'General Chemistry', label: 'Oxidation–Reduction Reactions' },
  { cat: 'General Chemistry', label: 'Stoichiometry' },

  /* Organic Chemistry */
  { cat: 'Organic Chemistry', label: 'Functional Groups' },
  { cat: 'Organic Chemistry', label: 'Stereochemistry' },
  { cat: 'Organic Chemistry', label: 'SN1 & SN2 Reactions' },
  { cat: 'Organic Chemistry', label: 'E1 & E2 Elimination' },
  { cat: 'Organic Chemistry', label: 'Addition Reactions' },
  { cat: 'Organic Chemistry', label: 'Carbonyl Chemistry' },
  { cat: 'Organic Chemistry', label: 'Carboxylic Acids & Derivatives' },
  { cat: 'Organic Chemistry', label: 'Amines & Amides' },
  { cat: 'Organic Chemistry', label: 'Aromatic Compounds' },
  { cat: 'Organic Chemistry', label: 'Carbohydrate Chemistry' },
  { cat: 'Organic Chemistry', label: 'Lipid Chemistry' },
  { cat: 'Organic Chemistry', label: 'Spectroscopy & NMR' },

  /* Physics */
  { cat: 'Physics', label: 'Kinematics & Motion' },
  { cat: 'Physics', label: "Newton's Laws of Motion" },
  { cat: 'Physics', label: 'Work, Energy & Power' },
  { cat: 'Physics', label: 'Momentum & Collisions' },
  { cat: 'Physics', label: 'Waves & Sound' },
  { cat: 'Physics', label: 'Optics & Light' },
  { cat: 'Physics', label: 'Electrostatics & Coulomb\'s Law' },
  { cat: 'Physics', label: 'Electric Circuits' },
  { cat: 'Physics', label: 'Magnetism' },
  { cat: 'Physics', label: 'Fluid Mechanics' },
  { cat: 'Physics', label: 'Thermodynamics (Physics)' },
  { cat: 'Physics', label: 'Nuclear Physics' },

  /* Psychology & Sociology */
  { cat: 'Psychology', label: 'Learning & Conditioning' },
  { cat: 'Psychology', label: 'Memory & Forgetting' },
  { cat: 'Psychology', label: 'Motivation & Emotion' },
  { cat: 'Psychology', label: 'Developmental Psychology' },
  { cat: 'Psychology', label: 'Personality Theories' },
  { cat: 'Psychology', label: 'Psychological Disorders' },
  { cat: 'Psychology', label: 'Social Psychology' },
  { cat: 'Psychology', label: 'Perception & Sensation' },
  { cat: 'Psychology', label: 'Consciousness & Sleep' },
  { cat: 'Psychology', label: 'Language & Cognition' },
  { cat: 'Psychology', label: 'Drug Addiction & Neurotransmitters' },
  { cat: 'Psychology', label: 'Stress & Coping' },
  { cat: 'Psychology', label: 'Demographics & Social Stratification' },
  { cat: 'Psychology', label: 'Culture & Identity' },
  { cat: 'Psychology', label: 'Research Methods & Statistics' },

  /* CARS */
  { cat: 'CARS', label: 'Critical Analysis & Reasoning' },
  { cat: 'CARS', label: 'Argumentation & Evidence' },
  { cat: 'CARS', label: 'Author Tone & Purpose' },
  { cat: 'CARS', label: 'Inference Questions' },
];

function initTykForm() {
  var form    = document.getElementById('tyk-form');
  var input   = document.getElementById('tyk-topic');
  var listEl  = document.getElementById('tyk-suggestions');
  if (!form || !input || !listEl) return;

  var focusIdx = -1;   /* keyboard-highlighted suggestion index */

  /* ── Suggest ── */
  function showSuggestions(query) {
    listEl.innerHTML = '';
    focusIdx = -1;

    if (!query) {
      closeSuggestions();
      return;
    }

    var q = query.toLowerCase();
    var matched = TYK_TOPICS.filter(function (t) {
      return t.label.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 10);  /* cap at 10 items */

    if (!matched.length) { closeSuggestions(); return; }

    /* Group by category */
    var groups = {};
    matched.forEach(function (t) {
      if (!groups[t.cat]) groups[t.cat] = [];
      groups[t.cat].push(t);
    });

    Object.keys(groups).forEach(function (cat) {
      if (Object.keys(groups).length > 1) {
        var hdr = document.createElement('li');
        hdr.className = 'tyk-suggestion-group';
        hdr.textContent = cat;
        listEl.appendChild(hdr);
      }
      groups[cat].forEach(function (t) {
        var li = document.createElement('li');
        li.className = 'tyk-suggestion';
        li.setAttribute('role', 'option');
        /* bold-highlight the matching substring */
        var hl = t.label.replace(
          new RegExp('(' + escapeRe(query) + ')', 'gi'),
          '<mark>$1</mark>'
        );
        li.innerHTML = '<i class="fa-light fa-magnifying-glass"></i>' + hl;
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();   /* don't blur input */
          pickSuggestion(t.label);
        });
        listEl.appendChild(li);
      });
    });

    listEl.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
  }

  function closeSuggestions() {
    listEl.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
    focusIdx = -1;
  }

  function pickSuggestion(label) {
    input.value = label;
    closeSuggestions();
    input.focus();
  }

  function getItems() {
    return listEl.querySelectorAll('.tyk-suggestion');
  }

  function setFocus(idx) {
    var items = getItems();
    items.forEach(function (el) { el.classList.remove('focused'); });
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('focused');
      items[idx].scrollIntoView({ block: 'nearest' });
    }
    focusIdx = idx;
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ── Events ── */
  input.addEventListener('input', function () {
    showSuggestions(input.value.trim());
  });

  input.addEventListener('focus', function () {
    if (input.value.trim()) showSuggestions(input.value.trim());
  });

  input.addEventListener('blur', function () {
    /* slight delay so mousedown on item fires first */
    setTimeout(closeSuggestions, 160);
  });

  input.addEventListener('keydown', function (e) {
    var items = getItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocus(Math.min(focusIdx + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus(Math.max(focusIdx - 1, 0));
    } else if (e.key === 'Enter' && focusIdx >= 0 && items[focusIdx]) {
      e.preventDefault();
      pickSuggestion(items[focusIdx].textContent.replace(/^\s+/, ''));
    } else if (e.key === 'Escape') {
      closeSuggestions();
    }
  });

  /* ── Submit ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    closeSuggestions();
    var topic  = input.value.trim();
    var qcount = document.getElementById('tyk-qcount').value;
    if (!topic) { input.focus(); return; }
    window.location.href = 'mcat-test.html?topic=' + encodeURIComponent(topic) + '&q=' + qcount;
  });
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Dashboard home */
  initSidebarAccordion();
  initProgressBars();
  initPlannerTabs();
  initTykForm();

  /* Overall performance page (simulator, bell curve) */
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
