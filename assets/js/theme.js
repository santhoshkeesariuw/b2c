/**
 * UWorld B2C — Theme Utilities
 * The ONLY place that touches element.style.
 * All other JS files call these functions instead of setting styles directly.
 */

'use strict';

/**
 * Parse a hex color string to an [r, g, b] array.
 * @param {string} hex  e.g. "#0B6FBE"
 * @returns {[number, number, number]}
 */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Generate a CSS rgba() string from a hex color and alpha.
 * @param {string} hex
 * @param {number} alpha  0–1
 * @returns {string}
 */
function tint(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Apply dynamic theme tokens (--c, --cr, --icon-bg) to an element.
 * This is the single sanctioned way to inject per-element color theming.
 *
 * @param {HTMLElement} el
 * @param {string}  color      Brand hex color, e.g. "#0B6FBE"
 * @param {boolean} [available=true]  Coming-soon elements get neutral tones
 */
function setTheme(el, color, available = true) {
  if (available && color) {
    const [r, g, b] = hexToRgb(color);
    el.style.setProperty('--c',       color);
    el.style.setProperty('--cr',      `${r},${g},${b}`);
    el.style.setProperty('--icon-bg', `rgba(${r},${g},${b},0.1)`);
  } else {
    el.style.setProperty('--c',       'var(--color-text-disabled)');
    el.style.setProperty('--cr',      '176,183,195');
    el.style.setProperty('--icon-bg', 'var(--color-border-subtle)');
  }
}

/**
 * Apply the glow background to a cat-hero glow element.
 * @param {HTMLElement} glowEl
 * @param {string} color  Brand hex color
 */
function setGlow(glowEl, color) {
  glowEl.style.setProperty('--glow-color', tint(color, 0.2));
}

/**
 * Set stagger animation timing on an element.
 * CSS reads: animation-delay: calc(var(--stagger-index, 0) * var(--stagger-step, 40ms))
 *
 * @param {HTMLElement} el
 * @param {number} index
 * @param {number} [stepMs=40]
 */
function setStagger(el, index, stepMs = 40) {
  el.style.setProperty('--stagger-index', index);
  el.style.setProperty('--stagger-step',  `${stepMs}ms`);
}

/**
 * Set a CSS progress value (0–100) on an element.
 * CSS reads: width: var(--progress, 0%)
 *
 * @param {HTMLElement} el
 * @param {number} pct  0–100
 */
function setProgress(el, pct) {
  el.style.setProperty('--progress', `${Math.min(100, Math.max(0, pct))}%`);
}

/**
 * Apply themes to all [data-color] elements inside a container,
 * and set stagger delays.
 *
 * @param {HTMLElement} container
 * @param {number} [stepMs=40]
 */
function applyThemes(container, stepMs = 40) {
  container.querySelectorAll('[data-color]').forEach((el, idx) => {
    const color     = el.dataset.color;
    const available = el.dataset.available !== 'false';
    setTheme(el, color, available);
    setStagger(el, idx, stepMs);
  });
}

/* ── Avatar dropdown (shared across all pages) ── */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.topbar__avatar-wrap').forEach(function (wrap) {
    var btn = wrap.querySelector('.topbar__avatar');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = wrap.classList.contains('open');
      document.querySelectorAll('.topbar__avatar-wrap.open').forEach(function (w) { w.classList.remove('open'); });
      if (!isOpen) wrap.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.topbar__avatar-wrap.open').forEach(function (w) { w.classList.remove('open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.topbar__avatar-wrap.open').forEach(function (w) { w.classList.remove('open'); });
    }
  });
});
