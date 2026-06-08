/**
 * UWorld B2C — Performance Page
 * QBank › Performance › Overall
 * Handles: sidebar accordion, tab switching, cohort selector, bell-curve SVG.
 */

'use strict';

/* ═══════════════════════════════════════════════
   SIDEBAR ACCORDION
   (same logic as dashboard.js — standalone copy
    so this page has no cross-page JS dependency)
   ═══════════════════════════════════════════════ */
function initSidebarAccordion() {
  document.querySelectorAll('[data-sub]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const subId = trigger.dataset.sub;
      const sub   = document.getElementById(subId);
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

/* ═══════════════════════════════════════════════
   TAB SWITCHING
   ═══════════════════════════════════════════════ */
function initPerfTabs() {
  const tabs   = document.querySelectorAll('.perf-tab');
  const panels = document.querySelectorAll('.perf-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((t)   => { t.classList.remove('perf-tab--active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach((p) =>   p.classList.remove('perf-panel--active'));

      tab.classList.add('perf-tab--active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('perf-panel--active');

      /* Lazy-render bell curve only when Peer Comparison is first opened */
      if (target === 'comparison') {
        renderBellCurveSVG();
      }
    });
  });
}

/* ═══════════════════════════════════════════════
   COHORT SELECTOR
   ═══════════════════════════════════════════════ */
function initCohortSelector() {
  const btns       = document.querySelectorAll('.cohort-selector__btn');
  const subtitleEl = document.getElementById('perfSubtitle');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('cohort-selector__btn--active'));
      btn.classList.add('cohort-selector__btn--active');

      if (subtitleEl) {
        subtitleEl.textContent = 'MCAT QBank · ' + btn.textContent.trim() + ' cohort';
      }
    });
  });
}

/* ═══════════════════════════════════════════════
   BELL CURVE (SVG — rendered once on first open)
   ═══════════════════════════════════════════════ */
function renderBellCurveSVG() {
  const container = document.getElementById('bellCurveContainer');
  if (!container || container.dataset.rendered) return;
  container.dataset.rendered = 'true';

  const YOU_PCT  = 38;
  const PEER_PCT = 64;

  const W = 720, H = 200, MID = W / 2;
  const pts = [];

  for (let x = 0; x <= W; x += 4) {
    const t = (x - MID) / 130;
    const y = Math.exp(-t * t / 2) * 130;
    pts.push(`${x},${H - 30 - y}`);
  }

  const ptStr = pts.join(' ');
  const youX  = (YOU_PCT  / 100) * W;
  const peerX = (PEER_PCT / 100) * W;

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
         style="width:100%; height:200px; display:block;">
      <defs>
        <linearGradient id="bcGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0"   stop-color="#e0eaff" stop-opacity="0.7"/>
          <stop offset="1"   stop-color="#e0eaff" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Area fill -->
      <polygon points="0,${H-30} ${ptStr} ${W},${H-30}" fill="url(#bcGrad)"/>
      <!-- Curve line -->
      <polyline points="${ptStr}" fill="none" stroke="#94a3b8" stroke-width="1.5"/>

      <!-- Baseline -->
      <line x1="0" x2="${W}" y1="${H-30}" y2="${H-30}" stroke="#cbd5e1" stroke-width="1"/>
      <text x="10"     y="${H-10}" font-size="10" fill="#94a3b8">0th</text>
      <text x="${W-30}" y="${H-10}" font-size="10" fill="#94a3b8">100th</text>

      <!-- Peer median dashed line -->
      <line x1="${peerX}" x2="${peerX}" y1="20" y2="${H-30}"
            stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="${peerX}" y="14"
            text-anchor="middle" font-size="11" fill="#64748b"
            font-family="-apple-system, sans-serif">
        ${PEER_PCT}th (median)
      </text>

      <!-- Your marker -->
      <line x1="${youX}" x2="${youX}" y1="20" y2="${H-30}"
            stroke="#0B6FBE" stroke-width="2"/>
      <circle cx="${youX}" cy="${H-30}" r="6" fill="#0B6FBE"/>
      <text x="${youX}" y="14"
            text-anchor="middle" font-size="11" font-weight="600"
            fill="#0B6FBE" font-family="-apple-system, sans-serif">
        You · ${YOU_PCT}th
      </text>
    </svg>
  `;
}

/* ═══════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarAccordion();
  initPerfTabs();
  initCohortSelector();
});
