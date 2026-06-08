/**
 * UWorld B2C — Catalog
 * Landing page product catalog: data, render, event delegation.
 * Depends on: theme.js (loaded first in HTML)
 */

'use strict';

/* ── Catalog data ── */
const CATALOG = [
  {
    id: 'medical',
    name: 'Medical',
    icon: 'fa-stethoscope',
    color: '#B45309',
    desc: 'USMLE Step 1, Step 2 CK, and Step 3 licensing exam preparation.',
    items: [],
  },
  {
    id: 'nursing',
    name: 'Nursing',
    icon: 'fa-heart-pulse',
    color: '#6B46C1',
    desc: 'NCLEX-RN and NCLEX-PN licensure exam prep for aspiring nurses.',
    items: [],
  },
  {
    id: 'pre-med',
    name: 'Pre-Med',
    icon: 'fa-flask-vial',
    color: '#0B6FBE',
    desc: 'Everything you need to earn your place in medical school.',
    items: [
      {
        id: 'mcat', name: 'MCAT', icon: 'fa-flask-vial', color: '#0B6FBE',
        desc: '3,000+ adaptive questions, full-length practice exams, score simulator, and performance analytics.',
        available: true, url: 'pre-med/mcat.html',
        stats: [{ v: '3,019', l: 'Questions' }, { v: '528', l: 'Max Score' }, { v: '4', l: 'Sections' }],
      },
    ],
  },
  {
    id: 'college-prep',
    name: 'College Prep',
    icon: 'fa-pen-nib',
    color: '#0E7C7B',
    desc: 'SAT, ACT, and AP exam prep for students aiming for top universities.',
    items: [
      { id: 'sat-act',     name: 'SAT & ACT',   icon: 'fa-pen-nib',              color: '#0E7C7B', desc: 'Digital SAT and ACT prep with adaptive modules and score prediction.' },
      { id: 'ap-ela-lote', name: 'AP ELA-LOTE',  icon: 'fa-book-open',            color: '#0E7C7B', desc: 'AP English Language & Literature and World Languages.' },
      { id: 'ap-history',  name: 'AP History',   icon: 'fa-landmark',             color: '#0E7C7B', desc: 'AP US History, World History, and Government & Politics.' },
      { id: 'ap-stats',    name: 'AP Stats',     icon: 'fa-chart-bar',            color: '#0E7C7B', desc: 'AP Statistics covering data analysis, probability, and inference.' },
      { id: 'ap-math',     name: 'AP Math',      icon: 'fa-square-root-variable', color: '#0E7C7B', desc: 'AP Calculus AB/BC and Precalculus fundamentals.' },
      { id: 'ap-science',  name: 'AP Science',   icon: 'fa-atom',                 color: '#0E7C7B', desc: 'AP Biology, Chemistry, Physics C, and Environmental Science.' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: 'fa-scale-balanced',
    color: '#9C4221',
    desc: 'Bar exam and law school admission test preparation.',
    items: [],
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'fa-chart-line',
    color: '#276749',
    desc: 'Professional finance certifications and investment management exams.',
    items: [
      { id: 'cfa-cmt', name: 'CFA / CMT', icon: 'fa-chart-line', color: '#276749', desc: 'CFA Level I–III and CMT exam prep with item-set practice and analytics.' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: 'fa-calculator',
    color: '#1E429F',
    desc: 'CPA and CMA professional licensing exam preparation.',
    items: [
      { id: 'cpa-cma',    name: 'CPA / CMA',  icon: 'fa-calculator',        color: '#1E429F', desc: 'US CPA and CMA exam prep with task-based simulations and MCQs.' },
      { id: 'cpa-canada', name: 'CPA Canada', icon: 'fa-flag',              color: '#1E429F', desc: 'CPA Canada Common Final Examination (CFE) preparation.' },
      { id: 'cpa-old',    name: 'CPA Legacy', icon: 'fa-clock-rotate-left', color: '#1E429F', desc: 'Legacy CPA exam content and archived practice materials.' },
    ],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: 'fa-pills',
    color: '#744210',
    desc: 'NAPLEX and MPJE pharmacist licensure exam preparation.',
    items: [],
  },
];

/* ── Helpers ── */
function hasLive(cat) {
  return cat.items.some((item) => item.available);
}

/* ── Card template ── */
function folderCardHTML(cat) {
  const live       = hasLive(cat);
  const count      = cat.items.length;
  const stateClass = live ? 'card--available' : 'card--coming-soon';

  const chipHTML = count > 0
    ? `<span class="card__chip"><i class="fa-solid fa-layer-group"></i>${count} product${count > 1 ? 's' : ''}</span>`
    : `<span class="card__chip"><i class="fa-solid fa-hourglass"></i>In development</span>`;

  const ctaHTML = live
    ? `<span class="card__cta">Explore <i class="fa-solid fa-arrow-right card__cta-arrow"></i></span>`
    : `<span class="card__cta">View Products</span>`;

  return `
    <div class="card ${stateClass} stagger"
         data-color="${cat.color}"
         data-available="${live}"
         data-href="${cat.id}/index.html"
         role="button"
         tabindex="0"
         aria-label="${cat.name}">
      <div class="card__icon"><i class="fa-solid ${cat.icon}" aria-hidden="true"></i></div>
      <div>
        <div class="card__name">${cat.name}</div>
        <div class="card__desc">${cat.desc}</div>
      </div>
      <div class="card__footer">
        ${ctaHTML}
        ${chipHTML}
      </div>
    </div>`;
}

/* ── Render ── */
function renderCatalog() {
  const view = document.getElementById('catalog-view');
  if (!view) return;

  view.innerHTML = `
    <div class="anim-enter">
      <div class="section-header">
        <div>
          <div class="overline">Exam Prep Catalog</div>
          <div class="section-title">All Products</div>
        </div>
        <span class="section-count">${CATALOG.length} categories</span>
      </div>
      <div class="grid grid--4">
        ${CATALOG.map(folderCardHTML).join('')}
      </div>
    </div>`;

  /* Apply themes and stagger after DOM insertion */
  applyThemes(view, 40);

  /* Event delegation — single listener for all card clicks + keyboard */
  view.addEventListener('click', onCardClick);
  view.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') onCardClick(e);
  });
}

function onCardClick(e) {
  const card = e.target.closest('[data-href]');
  if (card && card.dataset.href) {
    window.location.href = card.dataset.href;
  }
}

/* Boot */
document.addEventListener('DOMContentLoaded', renderCatalog);
