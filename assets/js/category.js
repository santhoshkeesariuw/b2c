/* ─────────────────────────────────────
   UWorld – Category Landing Page Renderer
   Call renderCategory(PAGE_CONFIG) on DOMContentLoaded
───────────────────────────────────── */

function tint(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function rgb(hex) {
  return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)].join(',');
}

const FEATURE_META = {
  qbank:          { label:'QBank',            icon:'fa-database'         },
  practiceExams:  { label:'Practice Exams',   icon:'fa-file-pen'         },
  flashcards:     { label:'Flashcards',       icon:'fa-bolt'             },
  analytics:      { label:'Analytics',        icon:'fa-chart-bar'        },
  studyPlanner:   { label:'Study Planner',    icon:'fa-calendar-days'    },
  videos:         { label:'Videos',           icon:'fa-play-circle'      },
};

function renderCategory(cfg) {
  document.title = `UWorld – ${cfg.name}`;

  /* — hero — */
  const glowColor = tint(cfg.color, 0.2);
  const liveCount = cfg.products.filter(p => p.available).length;
  const totalQ    = cfg.products.reduce((s,p) => s + (p.questionCount||0), 0);

  const statsHtml = cfg.stats
    ? cfg.stats.map(s=>`<div class="cs-item"><div class="cs-val">${s.val}</div><div class="cs-lbl">${s.lbl}</div></div>`).join('')
    : '';

  document.getElementById('cat-hero').innerHTML = `
    <div class="cat-hero-glow" style="background:radial-gradient(circle,${glowColor} 0%,transparent 68%)"></div>
    <div class="cat-hero-inner">
      <a class="back-link" href="../index.html">
        <i class="fa-solid fa-arrow-left"></i> All Products
      </a>
      <div class="cat-hero-body">
        <div class="cat-icon-wrap" style="background:${cfg.color}">
          <i class="fa-solid ${cfg.icon}"></i>
        </div>
        <div class="cat-text">
          <div class="cat-eyebrow">UWorld Exam Prep</div>
          <div class="cat-name">${cfg.name}</div>
          <div class="cat-desc">${cfg.desc}</div>
          ${statsHtml ? `<div class="cat-stats">${statsHtml}</div>` : ''}
        </div>
      </div>
    </div>`;

  /* — products grid — */
  const availCount = cfg.products.filter(p=>p.available).length;
  const total = cfg.products.length;

  const gridHtml = total === 0
    ? `<div class="empty-state">
         <div class="empty-icon"><i class="fa-solid ${cfg.icon}"></i></div>
         <div class="empty-title">Products Coming Soon</div>
         <div class="empty-sub">We're building content for ${cfg.name}. Check back soon.</div>
       </div>`
    : cfg.products.map((p,i) => productCard(p, i, cfg.color)).join('');

  document.getElementById('cat-products').innerHTML = `
    <div class="sec-hd">
      <div>
        <div class="overline">${cfg.name} Prep</div>
        <div class="sec-title">Available Products</div>
      </div>
      <span class="sec-count">${availCount > 0 ? availCount + ' live · ' : ''}${total} product${total!==1?'s':''}</span>
    </div>
    <div class="grid">${gridHtml}</div>`;
}

function productCard(p, idx, catColor) {
  const color   = p.color || catColor;
  const iconBg  = p.available ? tint(color, 0.1) : '#F3F4F6';
  const cr      = rgb(color);
  const features = p.features || {};

  const badge = p.available
    ? `<span class="status status-av"><span class="live-dot"></span> Available</span>`
    : `<span class="status status-soon">Coming Soon</span>`;

  const featsHtml = Object.entries(FEATURE_META)
    .filter(([k]) => features[k] !== undefined)
    .map(([k, m]) => `
      <span class="feat ${features[k] ? 'on' : 'off'}" style="${p.available && features[k] ? `--icon-bg:${iconBg};--c:${color};--cr:${cr}` : ''}">
        <i class="fa-solid ${m.icon}"></i>${m.label}
      </span>`).join('');

  const onFeats = Object.entries(features).filter(([,v])=>v).length;
  const offFeats = Object.entries(features).filter(([,v])=>!v).length;

  const foot = p.available && p.url
    ? `<a class="pcard-btn" style="background:${color}" href="${p.url}">
         Open QBank <i class="fa-solid fa-arrow-right"></i>
       </a>
       ${onFeats > 0 ? `<span class="feat-count">${onFeats} feature${onFeats>1?'s':''} available</span>` : ''}`
    : `<span class="pcard-soon-txt"><i class="fa-regular fa-clock"></i> In development</span>`;

  const click = p.available && p.url ? `onclick="window.location.href='${p.url}'"` : '';

  return `
    <div class="pcard ${p.available?'av':'cs'} stagger"
         style="--c:${color};--cr:${cr};--icon-bg:${iconBg};animation-delay:${idx*50}ms"
         ${click}>
      <div class="pcard-bar"></div>
      <div class="pcard-body">
        <div class="pcard-top">
          <div class="pcard-icon"><i class="fa-solid ${p.icon}"></i></div>
          ${badge}
        </div>
        <div>
          <div class="pcard-name">${p.name}</div>
          <div class="pcard-desc">${p.desc}</div>
        </div>
        ${featsHtml ? `<div class="pcard-features">${featsHtml}</div>` : ''}
        <div class="pcard-foot">${foot}</div>
      </div>
    </div>`;
}
