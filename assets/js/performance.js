/**
 * UWorld B2C — Overall Performance Page
 * QBank › Performance › Overall
 * Score Simulator drawer + bell curve + sidebar accordion
 */

'use strict';

(function () {

  /* ═══════════════════════════════════
     CONSTANTS
     ═══════════════════════════════════ */
  var BASE  = 2;    // current user percentile
  var CAP   = 96;   // max simulated percentile
  var WEEKS = 26;   // weeks until exam

  var uWorldCount  = 3;
  var aamcExamCount = 2;
  var aamcQsCount  = 3;
  var drawerOpen   = false;
  var hasSavedPlan = false;
  var lastProjPct  = 67;

  /* Current (baseline) study plan — reflects what is already in the study planner */
  var CURRENT_PLAN = {
    bio:     { q: 61,  f: 30, v: 5  },
    biochem: { q: 42,  f: 20, v: 4  },
    genchem: { q: 41,  f: 20, v: 7  },
    orgchem: { q: 30,  f: 15, v: 3  },
    phys:    { q: 20,  f: 10, v: 2  },
    behsci:  { q: 48,  f: 25, v: 4  },
    cars:    { q: 36,  f: 0,  v: 3  },
    uworld:  1,
    aamc:    0,
    aamcQs:  1
  };

  var SUBJ_LABELS = {
    bio:     'Biology',
    biochem: 'Biochemistry',
    genchem: 'General Chemistry',
    orgchem: 'Organic Chemistry',
    phys:    'Physics',
    behsci:  'Behavioral Sciences',
    cars:    'Critical Analysis &amp; Reasoning'
  };

  var BAND_COLORS = {
    0: { bg: '#FBEAF0', fg: '#993556', cls: 'dc-cur',        name: 'Low' },
    1: { bg: '#FAEEDA', fg: '#854F0B', cls: 'dc-proj-amber', name: 'Borderline' },
    2: { bg: '#E1F5EE', fg: '#0F6E56', cls: 'dc-proj-teal',  name: 'High' },
    3: { bg: '#EAF3DE', fg: '#3B6D11', cls: 'dc-proj-green', name: 'Very High' }
  };

  function bandFor(p) {
    if (p < 15) return 0;
    if (p < 40) return 1;
    if (p < 70) return 2;
    return 3;
  }

  function ordSuffix(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  /* ═══════════════════════════════════
     BELL CURVE
     ═══════════════════════════════════ */
  function makeBellPath() {
    var pathEl = document.getElementById('bell-path');
    if (!pathEl) return;
    var W = 600, H = 200, baseY = 195, peakY = 35, sigma = 90, mean = W / 2;
    var d = '';
    for (var x = 0; x <= W; x += 4) {
      var z = (x - mean) / sigma;
      var y = baseY - (baseY - peakY) * Math.exp(-0.5 * z * z);
      d += (x === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    pathEl.setAttribute('d', d.trim());
  }

  function bellCurveY(pct) {
    var sigma = 90, mean = 50, peakY = 35, baseY = 195;
    var z = (pct - mean) / (sigma / 6);
    return baseY - (baseY - peakY) * Math.exp(-0.5 * z * z);
  }

  function positionBellMarkers(projPct, showProj) {
    var wrap = document.querySelector('.bell-wrap');
    if (!wrap) return;
    var w = wrap.offsetWidth;
    var h = wrap.offsetHeight || (w * 220 / 600);
    var scaleY = h / 220;

    var userPct = BASE;

    var userEl = document.getElementById('bell-user');
    if (userEl) {
      userEl.style.left      = ((userPct / 100) * w) + 'px';
      userEl.style.top       = (bellCurveY(userPct) * scaleY - 26) + 'px';
      userEl.style.transform = 'translateX(-50%)';
    }

    var medEl = document.getElementById('bell-median');
    if (medEl) {
      medEl.style.left      = (0.5 * w) + 'px';
      medEl.style.top       = (bellCurveY(50) * scaleY - 26) + 'px';
      medEl.style.transform = 'translateX(-50%)';
    }

    var projEl = document.getElementById('bell-proj');
    if (projEl) {
      projEl.style.left      = ((projPct / 100) * w) + 'px';
      projEl.style.top       = (bellCurveY(projPct) * scaleY - 26) + 'px';
      projEl.style.transform = 'translateX(-50%)';
      if (showProj && projPct > 5) {
        projEl.classList.add('visible');
      } else {
        projEl.classList.remove('visible');
      }
    }
  }

  /* ═══════════════════════════════════
     RECALCULATE SIMULATION
     ═══════════════════════════════════ */
  function recalc() {
    var pct = BASE, hrs = 0;
    var bySubj = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };

    document.querySelectorAll('.sim-drawer input[type="range"]').forEach(function (s) {
      var v    = parseFloat(s.value);
      var subj = s.dataset.subj;
      var kind = s.dataset.kind;
      pct += v * parseFloat(s.dataset.pct);
      hrs += v * parseFloat(s.dataset.hr);
      if (bySubj[subj] !== undefined) bySubj[subj] += v * parseFloat(s.dataset.hr);
      var valEl = document.querySelector('.v-' + subj + '-' + kind);
      if (valEl) valEl.textContent = s.value;
    });

    pct += uWorldCount * 4 + aamcExamCount * 3 + aamcQsCount * 1;
    hrs += uWorldCount * 7 + aamcExamCount * 6 + aamcQsCount * 2;
    pct = Math.min(CAP, Math.round(pct));
    hrs = Math.round(hrs);
    var perWeek = (hrs / WEEKS).toFixed(1);

    /* per-subject hour totals */
    Object.keys(bySubj).forEach(function (k) {
      var el = document.querySelector('.hrs-' + k);
      if (el) el.textContent = Math.round(bySubj[k]);
    });

    /* drawer totals */
    setText('total-hrs', hrs);
    setText('per-week', perWeek);

    var idx = bandFor(pct);
    var c   = BAND_COLORS[idx];

    /* projection numbers */
    setText('proj-num', pct);
    setText('proj-suffix', ordSuffix(pct));
    setText('proj-band-name', c.name);
    setText('foot-band', pct);   /* shows number in footer */

    /* track / connect */
    var mark = document.getElementById('proj-mark');
    var conn = document.getElementById('sim-connect');
    if (mark) { mark.style.left = pct + '%'; mark.style.background = c.fg; }
    if (conn) { conn.style.width = Math.max(0, pct - 2) + '%'; conn.style.background = c.fg; }

    /* drawer band cells */
    document.querySelectorAll('#dband .dc').forEach(function (el, i) {
      el.classList.remove('dc-cur', 'dc-proj-amber', 'dc-proj-teal', 'dc-proj-green');
      if (i === 0) el.classList.add('dc-cur');
      if (i === idx && i !== 0) el.classList.add(c.cls);
    });

    /* footer pill */
    var pill = document.getElementById('foot-pill');
    if (pill) { pill.style.background = c.bg; pill.style.color = c.fg; }

    /* projected big number color */
    var bigEl = document.querySelector('.pb-projected .pk-big');
    if (bigEl) bigEl.style.color = c.fg;

    /* dashboard: banner */
    setText('banner-band', c.name);
    setText('banner-pct', pct);

    /* dashboard: Points Scored projected tint */
    document.querySelectorAll('.ps-band .ps-cell').forEach(function (el, i) {
      el.classList.remove('proj-tint');
      if (i === idx && i !== 0) el.classList.add('proj-tint');
    });

    /* dashboard: saved-plan pill values */
    setText('plan-band', c.name);
    setText('plan-hrs', hrs);
    setText('plan-week', perWeek);

    /* bell curve */
    positionBellMarkers(pct, drawerOpen || hasSavedPlan);
    lastProjPct = pct;
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ═══════════════════════════════════
     DRAWER OPEN / CLOSE / SAVE
     ═══════════════════════════════════ */
  function openDrawer() {
    drawerOpen = true;
    document.getElementById('sim-drawer').classList.add('open');
    document.getElementById('sim-overlay').classList.add('open');
    if (!hasSavedPlan) document.getElementById('proj-banner').classList.add('show');
    recalc();
  }

  function closeDrawer() {
    drawerOpen = false;
    document.getElementById('sim-drawer').classList.remove('open');
    document.getElementById('sim-overlay').classList.remove('open');
    document.getElementById('proj-banner').classList.remove('show');
    if (!hasSavedPlan) {
      document.querySelectorAll('.ps-band .ps-cell').forEach(function (el) {
        el.classList.remove('proj-tint');
      });
      var projEl = document.getElementById('bell-proj');
      if (projEl) projEl.classList.remove('visible');
    }
  }

  /* Read new plan values from the simulator sliders */
  function getNewPlan() {
    var qPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    var fPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    var vPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    document.querySelectorAll('.sim-drawer input[type="range"]').forEach(function (s) {
      var subj = s.dataset.subj;
      var kind = s.dataset.kind;
      var val  = parseFloat(s.value);
      if (qPlan[subj] === undefined) return;
      if (kind === 'q')      qPlan[subj] = val;
      else if (kind === 'f') fPlan[subj] = val;
      else                   vPlan[subj] = val;
    });
    return { q: qPlan, f: fPlan, v: vPlan, uworld: uWorldCount, aamc: aamcExamCount, aamcQs: aamcQsCount };
  }

  function deltaClass(diff) {
    if (diff > 0) return 'up';
    if (diff < 0) return 'down';
    return 'same';
  }
  function deltaText(diff) {
    if (diff === 0) return '—';
    return (diff > 0 ? '+' : '') + diff;
  }

  function openPlanComparison() {
    /* close the drawer first */
    drawerOpen = false;
    document.getElementById('sim-drawer').classList.remove('open');
    document.getElementById('sim-overlay').classList.remove('open');
    document.getElementById('proj-banner').classList.remove('show');

    var newPlan = getNewPlan();
    var subjects = Object.keys(CURRENT_PLAN).filter(function (k) {
      return k !== 'uworld' && k !== 'aamc' && k !== 'aamcQs';
    });

    /* Total hours: q×0.025 + f×0.016 + v per subject, plus common items */
    var curTotalHrs = 0, newTotalHrs = 0;
    subjects.forEach(function (k) {
      curTotalHrs += Math.round(CURRENT_PLAN[k].q * 0.025) + Math.round(CURRENT_PLAN[k].f * 0.016) + CURRENT_PLAN[k].v;
      newTotalHrs += Math.round(newPlan.q[k] * 0.025) + Math.round(newPlan.f[k] * 0.016) + newPlan.v[k];
    });
    curTotalHrs += CURRENT_PLAN.uworld * 7 + CURRENT_PLAN.aamc * 6 + CURRENT_PLAN.aamcQs * 2;
    newTotalHrs += newPlan.uworld * 7 + newPlan.aamc * 6 + newPlan.aamcQs * 2;

    /* Helper to build a content-type row with explicit label */
    function ctRow(icon, label, curVal, newVal, diffVal, curUnit, newUnit) {
      newUnit = newUnit || curUnit;
      return '<span class="pcm-ct-row">' +
          '<span class="pcm-ct-icon"><i class="fa-light ' + icon + '"></i></span>' +
          '<span class="pcm-ct-label">' + label + '</span>' +
          '<span class="pcm-cur-val">' + curVal + ' ' + curUnit + '</span>' +
        '</span>' +
        '||' +
        '<span class="pcm-ct-row">' +
          '<span class="pcm-ct-icon"><i class="fa-light ' + icon + '"></i></span>' +
          '<span class="pcm-ct-label">' + label + '</span>' +
          '<span class="pcm-new-val">' + newVal + ' ' + newUnit +
            (diffVal !== 0 ? '<span class="pcm-delta ' + deltaClass(diffVal) + '">' + deltaText(diffVal) + '</span>' : '') +
          '</span>' +
        '</span>';
    }

    /* Build subject rows — 3 content types each */
    var rows = subjects.map(function (k) {
      var curQ = CURRENT_PLAN[k].q,  newQ = Math.round(newPlan.q[k]);
      var curF = CURRENT_PLAN[k].f,  newF = Math.round(newPlan.f[k]);
      var curV = CURRENT_PLAN[k].v,  newV = Math.round(newPlan.v[k]);
      var qParts = ctRow('fa-file-lines', 'Practice Questions',     curQ, newQ, newQ - curQ, 'questions').split('||');
      var fParts = ctRow('fa-bolt',       'Review Flashcards',      curF, newF, newF - curF, 'flashcards').split('||');
      var vParts = ctRow('fa-book-open',  'Review UBooks &amp; Videos', curV, newV, newV - curV, 'hrs').split('||');
      return '<tr>' +
        '<td class="pcmt-label">' + SUBJ_LABELS[k] + '</td>' +
        '<td class="pcmt-current">' + qParts[0] + fParts[0] + vParts[0] + '</td>' +
        '<td class="pcmt-new">'     + qParts[1] + fParts[1] + vParts[1] + '</td>' +
      '</tr>';
    });

    /* Common activities rows */
    function commonRow(label, sublabel, icon, curN, curHrEach, newN, newHrEach) {
      var diff = newN - curN;
      return '<tr>' +
        '<td class="pcmt-label">' + label + '<span class="pcm-common-sub">' + sublabel + '</span></td>' +
        '<td class="pcmt-current">' +
          '<span class="pcm-ct-row">' +
            '<span class="pcm-ct-icon"><i class="fa-light ' + icon + '"></i></span>' +
            '<span class="pcm-cur-val">' + curN + (curN === 1 ? ' exam' : ' exams') + ' · ' + (curN * curHrEach) + ' hrs</span>' +
          '</span>' +
        '</td>' +
        '<td class="pcmt-new">' +
          '<span class="pcm-ct-row">' +
            '<span class="pcm-ct-icon"><i class="fa-light ' + icon + '"></i></span>' +
            '<span class="pcm-new-val">' + newN + (newN === 1 ? ' exam' : ' exams') + ' · ' + (newN * newHrEach) + ' hrs' +
              (diff !== 0 ? '<span class="pcm-delta ' + deltaClass(diff) + '">' + deltaText(diff) + '</span>' : '') +
            '</span>' +
          '</span>' +
        '</td>' +
      '</tr>';
    }

    rows.push(commonRow('UWorld Practice Exam', 'Full-length · 7 hrs each', 'fa-graduation-cap',
      CURRENT_PLAN.uworld, 7, newPlan.uworld, 7));
    rows.push(commonRow('AAMC Practice Exam', 'Full-length · 6 hrs each', 'fa-school',
      CURRENT_PLAN.aamc, 6, newPlan.aamc, 6));
    rows.push(commonRow('AAMC Question Sets', 'Section-specific · 2 hrs each', 'fa-list-check',
      CURRENT_PLAN.aamcQs, 2, newPlan.aamcQs, 2));

    document.getElementById('pcm-tbody').innerHTML = rows.join('');

    var curWeek = (curTotalHrs / WEEKS).toFixed(1);
    var newWeek = (newTotalHrs / WEEKS).toFixed(1);
    var totalDiff = newTotalHrs - curTotalHrs;

    document.getElementById('pcm-cur-total').innerHTML =
      '<span class="pcm-cur-val">' + curTotalHrs + ' hrs</span>';
    document.getElementById('pcm-new-total').innerHTML =
      '<span class="pcm-new-val">' + newTotalHrs + ' hrs' +
        '<span class="pcm-delta ' + deltaClass(totalDiff) + '">' + deltaText(totalDiff) + ' hrs</span>' +
      '</span>';
    document.getElementById('pcm-cur-week').textContent = curWeek + ' hrs/week';
    document.getElementById('pcm-new-week').textContent = newWeek + ' hrs/week';

    document.getElementById('plan-cmp-overlay').classList.add('open');
  }

  function closePlanComparison() {
    document.getElementById('plan-cmp-overlay').classList.remove('open');
  }

  function applyPlan() {
    closePlanComparison();
    /* commit the plan */
    hasSavedPlan = true;
    document.getElementById('ps-plan-foot').classList.add('show');
    var improveBtn = document.getElementById('improve-btn');
    if (improveBtn) improveBtn.style.display = 'none';
    recalc();
    /* success toast */
    var toast = document.getElementById('pcm-toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }
  }

  function editPlan() {
    drawerOpen = true;
    document.getElementById('sim-drawer').classList.add('open');
    document.getElementById('sim-overlay').classList.add('open');
    recalc();
  }

  function discardPlan() {
    if (!confirm('Discard your saved study plan? The projection will be removed from your dashboard.')) return;
    hasSavedPlan = false;
    document.getElementById('ps-plan-foot').classList.remove('show');
    var improveBtn = document.getElementById('improve-btn');
    if (improveBtn) improveBtn.style.display = '';
    document.querySelectorAll('.ps-band .ps-cell').forEach(function (el) {
      el.classList.remove('proj-tint');
    });
    var projEl = document.getElementById('bell-proj');
    if (projEl) projEl.classList.remove('visible');
  }

  /* ═══════════════════════════════════
     SIDEBAR ACCORDION
     ═══════════════════════════════════ */
  function initSidebarAccordion() {
    document.querySelectorAll('[data-sub]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var subId = trigger.dataset.sub;
        var sub   = document.getElementById(subId);
        if (!sub) return;
        var isOpen = sub.classList.contains('sidebar__sub-menu--open');
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

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initSidebarAccordion();
    makeBellPath();

    /* bind slider inputs */
    document.querySelectorAll('.sim-drawer input[type="range"]').forEach(function (s) {
      s.addEventListener('input', recalc);
    });

    /* button wiring */
    var improveBtn = document.getElementById('improve-btn');
    if (improveBtn) improveBtn.addEventListener('click', openDrawer);

    var overlay = document.getElementById('sim-overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    var closeBtn = document.getElementById('drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    var saveBtn = document.getElementById('save-plan-btn');
    if (saveBtn) saveBtn.addEventListener('click', openPlanComparison);

    var pcmClose  = document.getElementById('pcm-close');
    var pcmCancel = document.getElementById('pcm-cancel');
    var pcmApply  = document.getElementById('pcm-apply');
    if (pcmClose)  pcmClose.addEventListener('click',  closePlanComparison);
    if (pcmCancel) pcmCancel.addEventListener('click', closePlanComparison);
    if (pcmApply)  pcmApply.addEventListener('click',  applyPlan);

    document.getElementById('plan-cmp-overlay').addEventListener('click', function (e) {
      if (e.target === this) closePlanComparison();
    });

    var editBtn = document.getElementById('edit-plan-btn');
    if (editBtn) editBtn.addEventListener('click', editPlan);

    var discardBtn = document.getElementById('discard-plan-btn');
    if (discardBtn) discardBtn.addEventListener('click', discardPlan);

    function wireStep(downId, upId, numId, getter, setter, min, max) {
      var up = document.getElementById(upId);
      var dn = document.getElementById(downId);
      if (up) up.addEventListener('click', function () { setter(Math.min(max, getter() + 1)); setText(numId, getter()); recalc(); });
      if (dn) dn.addEventListener('click', function () { setter(Math.max(min, getter() - 1)); setText(numId, getter()); recalc(); });
    }
    wireStep('uworld-step-down',  'uworld-step-up',  'uworld-num',  function () { return uWorldCount;   }, function (v) { uWorldCount   = v; }, 0, 8);
    wireStep('aamc-step-down',    'aamc-step-up',    'aamc-num',    function () { return aamcExamCount; }, function (v) { aamcExamCount = v; }, 0, 5);
    wireStep('aamcqs-step-down',  'aamcqs-step-up',  'aamcqs-num',  function () { return aamcQsCount;   }, function (v) { aamcQsCount   = v; }, 0, 10);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (document.getElementById('plan-cmp-overlay').classList.contains('open')) {
          closePlanComparison();
        } else if (drawerOpen) {
          closeDrawer();
        }
      }
    });

    window.addEventListener('resize', function () {
      positionBellMarkers(lastProjPct, hasSavedPlan || drawerOpen);
    });

    /* initial state */
    recalc();
    positionBellMarkers(BASE, false);
    setTimeout(function () { positionBellMarkers(BASE, false); }, 120);
  });

})();
