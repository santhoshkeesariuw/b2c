/**
 * UWorld B2C — Category Page Renderer
 * Call renderCategory(PAGE_CONFIG) once per page.
 * Depends on: theme.js (loaded first in HTML)
 * Zero inline styles — all theming done via data-color + applyThemes().
 */

'use strict';

const FEATURE_META = {
  qbank:         { label: 'QBank',          icon: 'fa-database'      },
  practiceExams: { label: 'Practice Exams', icon: 'fa-file-pen'      },
  flashcards:    { label: 'Flashcards',     icon: 'fa-bolt'          },
  analytics:     { label: 'Analytics',      icon: 'fa-chart-bar'     },
  studyPlanner:  { label: 'Study Planner',  icon: 'fa-calendar-days' },
  videos:        { label: 'Videos',         icon: 'fa-play-circle'   },
};

/* ── Hero ── */
function renderHero(cfg) {
  const heroEl = document.getElementById('cat-hero');
  if (!heroEl) return;

  const statsHTML = (cfg.stats || [])
    .map((s) => `
      <div class="cat-stat">
        <div class="cat-stat__value">${s.val}</div>
        <div class="cat-stat__label">${s.lbl}</div>
      </div>`)
    .join('');

  heroEl.innerHTML = `
    <div class="cat-hero__glow" aria-hidden="true"></div>
    <div class="cat-hero__inner">
      <a class="back-link" href="../index.html">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> All Products
      </a>
      <div class="cat-hero__body">
        <div class="cat-hero__icon" data-color="${cfg.color}" data-available="true">
          <i class="fa-solid ${cfg.icon}" aria-hidden="true"></i>
        </div>
        <div class="cat-hero__text">
          <div class="cat-hero__eyebrow">UWorld Exam Prep</div>
          <div class="cat-hero__name">${cfg.name}</div>
          <div class="cat-hero__desc">${cfg.desc}</div>
          ${statsHTML ? `<div class="cat-stats">${statsHTML}</div>` : ''}
        </div>
      </div>
    </div>`;

  /* Apply category color to icon and glow */
  setTheme(heroEl.querySelector('.cat-hero__icon'), cfg.color, true);
  setGlow(heroEl.querySelector('.cat-hero__glow'), cfg.color);
}

/* ── Product card template ── */
function productCardHTML(p) {
  const available  = !!p.available;
  const stateClass = available ? 'pcard--available' : 'pcard--coming-soon';
  const features   = p.features || {};

  const badge = available
    ? `<span class="badge badge--available"><span class="live-dot" aria-hidden="true"></span> Available</span>`
    : `<span class="badge badge--coming-soon">Coming Soon</span>`;

  const featsHTML = Object.entries(FEATURE_META)
    .filter(([k]) => features[k] !== undefined)
    .map(([k, m]) => `
      <span class="feat ${features[k] ? 'feat--on' : 'feat--off'}">
        <i class="fa-solid ${m.icon}" aria-hidden="true"></i>${m.label}
      </span>`)
    .join('');

  const onCount  = Object.values(features).filter(Boolean).length;
  const dataHref = available && p.url ? p.url : '';

  const footHTML = available && p.url
    ? `<a class="btn btn--brand btn--md" href="${p.url}">
         Open QBank <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
       </a>
       ${onCount > 0 ? `<span class="pcard__feat-count">${onCount} feature${onCount > 1 ? 's' : ''} available</span>` : ''}`
    : `<span class="btn btn--muted">
         <i class="fa-regular fa-clock" aria-hidden="true"></i> In development
       </span>`;

  return `
    <div class="pcard ${stateClass} stagger"
         data-color="${p.color || ''}"
         data-available="${available}"
         data-href="${dataHref}"
         role="${available ? 'button' : 'article'}"
         tabindex="${available ? '0' : '-1'}"
         aria-label="${p.name}">
      <div class="pcard__bar" aria-hidden="true"></div>
      <div class="pcard__body">
        <div class="pcard__top">
          <div class="pcard__icon"><i class="fa-solid ${p.icon}" aria-hidden="true"></i></div>
          ${badge}
        </div>
        <div>
          <div class="pcard__name">${p.name}</div>
          <div class="pcard__desc">${p.desc}</div>
        </div>
        ${featsHTML ? `<div class="pcard__features">${featsHTML}</div>` : ''}
        <div class="pcard__footer">${footHTML}</div>
      </div>
    </div>`;
}

/* ── Products grid ── */
function renderProducts(cfg) {
  const gridEl = document.getElementById('cat-products');
  if (!gridEl) return;

  const products   = cfg.products || [];
  const available  = products.filter((p) => p.available).length;

  const gridContent = products.length === 0
    ? `<div class="empty-state">
         <div class="empty-state__icon"><i class="fa-solid ${cfg.icon}" aria-hidden="true"></i></div>
         <div class="empty-state__title">Products Coming Soon</div>
         <div class="empty-state__subtitle">We're building content for ${cfg.name}. Check back soon.</div>
       </div>`
    : products.map(productCardHTML).join('');

  gridEl.innerHTML = `
    <div class="section-header">
      <div>
        <div class="overline">${cfg.name} Prep</div>
        <div class="section-title">Available Products</div>
      </div>
      <span class="section-count">
        ${available > 0 ? available + ' live · ' : ''}${products.length} product${products.length !== 1 ? 's' : ''}
      </span>
    </div>
    <div class="grid grid--3">${gridContent}</div>`;

  /* Apply themes and stagger to all cards */
  applyThemes(gridEl, 50);

  /* Event delegation for card navigation */
  gridEl.addEventListener('click', onProductCardClick);
  gridEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') onProductCardClick(e);
  });
}

function onProductCardClick(e) {
  const card = e.target.closest('[data-href]');
  if (card && card.dataset.href) {
    window.location.href = card.dataset.href;
  }
}

/* ── Public API ── */
function renderCategory(cfg) {
  document.title = `UWorld – ${cfg.name}`;
  renderHero(cfg);
  renderProducts(cfg);
}
