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
  var drawerOpen    = false;
  var hasSavedPlan  = false;
  var hasSimulation = false;
  var lastProjPct   = 67;
  var pcmStep       = 1;

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

    document.querySelectorAll('.sim-drawer input[type="range"].sim-range').forEach(function (s) {
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

    /* keep master range thumb in sync with projected pct */
    var masterRange = document.getElementById('master-range');
    if (masterRange) masterRange.value = pct;

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
    positionBellMarkers(pct, drawerOpen || hasSavedPlan || hasSimulation);
    lastProjPct = pct;
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ═══════════════════════════════════
     DRAWER OPEN / CLOSE / SAVE
     ═══════════════════════════════════ */
  /* Scale all subject sliders proportionally so the projected pct hits targetPct */
  function scaleSlidersToTarget(targetPct) {
    var commonContrib = uWorldCount * 4 + aamcExamCount * 3 + aamcQsCount * 1;
    var need = Math.max(0, targetPct - BASE - commonContrib);

    /* Total capacity = sum(max * data-pct) across all subject sliders */
    var totalCap = 0;
    document.querySelectorAll('.sim-drawer input[type="range"].sim-range').forEach(function (s) {
      totalCap += parseFloat(s.max) * parseFloat(s.dataset.pct);
    });

    var scale = totalCap > 0 ? Math.min(1, Math.max(0, need / totalCap)) : 0;

    document.querySelectorAll('.sim-drawer input[type="range"].sim-range').forEach(function (s) {
      s.value = Math.round(parseFloat(s.max) * scale);
    });

    recalc();
  }

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
    if (!hasSavedPlan && !hasSimulation) {
      document.getElementById('proj-banner').classList.remove('show');
      document.querySelectorAll('.ps-band .ps-cell').forEach(function (el) {
        el.classList.remove('proj-tint');
      });
      var projEl = document.getElementById('bell-proj');
      if (projEl) projEl.classList.remove('visible');
    }
  }

  function simulateOnly() {
    hasSimulation = true;
    drawerOpen = false;
    document.getElementById('sim-drawer').classList.remove('open');
    document.getElementById('sim-overlay').classList.remove('open');
    document.getElementById('proj-banner').classList.add('show');
    positionBellMarkers(lastProjPct, true);
  }

  /* Read new plan values from the simulator sliders */
  function getNewPlan() {
    var qPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    var fPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    var vPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    document.querySelectorAll('.sim-drawer input[type="range"].sim-range').forEach(function (s) {
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

  /* Switch between modal steps */
  function showPcmStep(n) {
    pcmStep = n;
    var s1 = document.getElementById('pcm-step-1');
    var s2 = document.getElementById('pcm-step-2');
    if (s1) { if (n === 1) s1.removeAttribute('hidden'); else s1.setAttribute('hidden', ''); }
    if (s2) { if (n === 2) s2.removeAttribute('hidden'); else s2.setAttribute('hidden', ''); }

    document.querySelectorAll('.pcm-step-item').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.dataset.step) === n);
    });

    var backBtn  = document.getElementById('pcm-back');
    var nextBtn  = document.getElementById('pcm-next');
    var applyBtn = document.getElementById('pcm-apply');
    if (backBtn)  backBtn.style.display  = n === 2 ? '' : 'none';
    if (nextBtn)  nextBtn.style.display  = n === 1 ? '' : 'none';
    if (applyBtn) applyBtn.style.display = n === 2 ? '' : 'none';

    var sub = document.getElementById('pcm-subtitle-text');
    if (sub) sub.textContent = n === 1
      ? 'Review changes before applying to your study planner'
      : 'Activity breakdown and weekly schedule';
  }

  function openPlanComparison() {
    /* close the drawer first */
    drawerOpen = false;
    document.getElementById('sim-drawer').classList.remove('open');
    document.getElementById('sim-overlay').classList.remove('open');
    document.getElementById('proj-banner').classList.remove('show');

    var newPlan  = getNewPlan();
    var subjects = Object.keys(CURRENT_PLAN).filter(function (k) {
      return k !== 'uworld' && k !== 'aamc' && k !== 'aamcQs';
    });

    /* ── Total hours ── */
    var curTotalHrs = 0, newTotalHrs = 0;
    subjects.forEach(function (k) {
      curTotalHrs += Math.round(CURRENT_PLAN[k].q * 0.025) + Math.round(CURRENT_PLAN[k].f * 0.016) + CURRENT_PLAN[k].v;
      newTotalHrs += Math.round(newPlan.q[k] * 0.025)      + Math.round(newPlan.f[k] * 0.016)      + newPlan.v[k];
    });
    curTotalHrs += CURRENT_PLAN.uworld * 7 + CURRENT_PLAN.aamc * 6 + CURRENT_PLAN.aamcQs * 2;
    newTotalHrs += newPlan.uworld * 7 + newPlan.aamc * 6 + newPlan.aamcQs * 2;

    var curWeekHrs  = parseFloat((curTotalHrs / WEEKS).toFixed(1));
    var newWeekHrs  = parseFloat((newTotalHrs / WEEKS).toFixed(1));
    var totalDiff   = newTotalHrs - curTotalHrs;
    var weekDiff    = parseFloat((newWeekHrs - curWeekHrs).toFixed(1));

    /* Weekday / weekend split: 60 % over 5 days, 40 % over 2 days */
    var curWkday = (curWeekHrs * 0.6 / 5).toFixed(1);
    var newWkday = (newWeekHrs * 0.6 / 5).toFixed(1);
    var curWkend = (curWeekHrs * 0.4 / 2).toFixed(1);
    var newWkend = (newWeekHrs * 0.4 / 2).toFixed(1);

    /* ── Step 1: Overview cards ── */
    var curBand = BAND_COLORS[bandFor(BASE)];
    var newBand = BAND_COLORS[bandFor(lastProjPct)];

    var curBandEl = document.getElementById('pov-cur-band');
    if (curBandEl) { curBandEl.textContent = curBand.name; curBandEl.style.color = curBand.fg; }
    var newBandEl = document.getElementById('pov-new-band');
    if (newBandEl) { newBandEl.textContent = newBand.name; newBandEl.style.color = newBand.fg; }

    setText('pov-cur-hrs',       curTotalHrs + ' hrs');
    setText('pov-new-hrs',       newTotalHrs + ' hrs');
    setText('pov-cur-week-card', curWeekHrs  + ' hrs / week');
    setText('pov-new-week-card', newWeekHrs  + ' hrs / week');

    var deltaEl = document.getElementById('pov-hrs-delta');
    if (deltaEl) {
      deltaEl.textContent = (totalDiff >= 0 ? '+' : '') + totalDiff + ' hrs';
      deltaEl.className   = 'pov-hrs-delta' + (totalDiff < 0 ? ' down' : '');
    }

    /* ── Step 1: Weekday rows (Mon–Sun with % distribution) ── */
    var DAYS        = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    var DAY_WEIGHTS = [0.12,     0.12,      0.12,        0.12,       0.12,     0.20,       0.20];
    var WEEKEND_IDX = [5, 6];

    var dayRowsHtml = DAYS.map(function (day, i) {
      var curD = (curWeekHrs * DAY_WEIGHTS[i]).toFixed(1);
      var newD = (newWeekHrs * DAY_WEIGHTS[i]).toFixed(1);
      var diff = parseFloat((newD - curD).toFixed(1));
      var isWknd = WEEKEND_IDX.indexOf(i) !== -1;
      return '<div class="pov-day-row">' +
        '<span class="pov-day-name' + (isWknd ? ' weekend' : '') + '">' + day + '</span>' +
        '<span class="pov-day-val">' + curD + ' hrs</span>' +
        '<span class="pov-day-val pov-new-val">' + newD + ' hrs</span>' +
        '<span class="pcm-delta ' + deltaClass(diff) + '">' + (diff >= 0 ? '+' : '') + diff + '</span>' +
      '</div>';
    }).join('');

    document.getElementById('pov-days-rows').innerHTML = dayRowsHtml;
    setText('pov-cur-total-week', curWeekHrs + ' hrs/wk');
    var newWkEl = document.getElementById('pov-new-total-week');
    if (newWkEl) newWkEl.innerHTML = newWeekHrs + ' hrs/wk';
    var wkDeltaEl = document.getElementById('pov-week-delta');
    if (wkDeltaEl) {
      wkDeltaEl.textContent = (weekDiff >= 0 ? '+' : '') + weekDiff;
      wkDeltaEl.className   = 'pcm-delta ' + deltaClass(weekDiff);
    }

    /* ── Step 2: Collapsible subject rows ── */
    function pcsCtRow(icon, label, curVal, newVal, diff, unit) {
      return '<div class="pcs-ct-row">' +
        '<span class="pcs-ct-icon"><i class="fa-light ' + icon + '"></i></span>' +
        '<span class="pcs-ct-name">' + label + '</span>' +
        '<span class="pcs-ct-val">' + curVal + ' ' + unit + '</span>' +
        '<span class="pcs-ct-val pcs-new-val">' + newVal + ' ' + unit + '</span>' +
        '<span class="pcm-delta ' + deltaClass(diff) + '">' + deltaText(diff) + '</span>' +
      '</div>';
    }

    var subjHtml = subjects.map(function (k) {
      var curH = Math.round(CURRENT_PLAN[k].q * 0.025 + CURRENT_PLAN[k].f * 0.016 + CURRENT_PLAN[k].v);
      var newH = Math.round(newPlan.q[k] * 0.025 + newPlan.f[k] * 0.016 + newPlan.v[k]);
      var diff = newH - curH;
      var curQ = CURRENT_PLAN[k].q, newQ = Math.round(newPlan.q[k]);
      var curF = CURRENT_PLAN[k].f, newF = Math.round(newPlan.f[k]);
      var curV = CURRENT_PLAN[k].v, newV = Math.round(newPlan.v[k]);
      return '<div class="pcs-subj-row" data-subj="' + k + '">' +
          '<span class="pcs-chevron"><i class="fa-light fa-chevron-right"></i></span>' +
          '<span class="pcs-name">' + SUBJ_LABELS[k] + '</span>' +
          '<span class="pcs-val">' + curH + ' hrs</span>' +
          '<span class="pcs-val pcs-new-val">' + newH + ' hrs</span>' +
          '<span class="pcm-delta ' + deltaClass(diff) + '">' + deltaText(diff) + '</span>' +
        '</div>' +
        '<div class="pcs-detail" id="pcs-detail-' + k + '">' +
          pcsCtRow('fa-file-lines', 'Practice Questions',    curQ, newQ, newQ - curQ, 'questions') +
          pcsCtRow('fa-bolt',       'Review Flashcards',     curF, newF, newF - curF, 'flashcards') +
          pcsCtRow('fa-book-open',  'Review UBooks & Videos',curV, newV, newV - curV, 'hrs') +
        '</div>';
    }).join('');
    document.getElementById('pcs-subjects').innerHTML = subjHtml;

    /* common activities in step 2 */
    function commonRow2(icon, label, sub, curN, newN, hrEach) {
      var diff = newN - curN;
      var u = function(n) { return n === 1 ? 'exam' : 'exams'; };
      return '<div class="pcs-common-row">' +
        '<span class="pcs-common-icon"><i class="fa-light ' + icon + '"></i></span>' +
        '<span class="pcs-common-name">' + label + '<span class="pcs-common-sub">' + sub + '</span></span>' +
        '<span class="pcs-common-val">' + curN + ' ' + u(curN) + ' · ' + (curN * hrEach) + ' hrs</span>' +
        '<span class="pcs-common-val pcs-new-val">' + newN + ' ' + u(newN) + ' · ' + (newN * hrEach) + ' hrs</span>' +
        '<span class="pcm-delta ' + deltaClass(diff) + '">' + deltaText(diff) + '</span>' +
      '</div>';
    }
    document.getElementById('pcs-common-rows').innerHTML =
      commonRow2('fa-graduation-cap', 'UWorld Practice Exam', 'Full-length · 7 hrs each',      CURRENT_PLAN.uworld, newPlan.uworld, 7) +
      commonRow2('fa-school',         'AAMC Practice Exam',   'Full-length · 6 hrs each',      CURRENT_PLAN.aamc,   newPlan.aamc,   6) +
      commonRow2('fa-list-check',     'AAMC Question Sets',   'Section-specific · 2 hrs each', CURRENT_PLAN.aamcQs, newPlan.aamcQs, 2);

    showPcmStep(1);
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
    hasSavedPlan  = false;
    hasSimulation = false;
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
    document.querySelectorAll('.sim-drawer input[type="range"].sim-range').forEach(function (s) {
      s.addEventListener('input', recalc);
    });

    /* button wiring */
    var improveBtn = document.getElementById('improve-btn');
    if (improveBtn) improveBtn.addEventListener('click', openDrawer);

    var overlay = document.getElementById('sim-overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    var closeBtn = document.getElementById('drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    var masterRangeEl = document.getElementById('master-range');
    if (masterRangeEl) masterRangeEl.addEventListener('input', function () {
      scaleSlidersToTarget(parseInt(this.value, 10));
    });

    var simBtn = document.getElementById('simulate-btn');
    if (simBtn) simBtn.addEventListener('click', simulateOnly);

    var saveBtn = document.getElementById('save-plan-btn');
    if (saveBtn) saveBtn.addEventListener('click', openPlanComparison);

    /* inject current progress indicators below each subject slider */
    document.querySelectorAll('.sim-drawer input[type="range"]').forEach(function (s) {
      var subj = s.dataset.subj;
      var kind = s.dataset.kind;
      if (!subj || !kind || !CURRENT_PLAN[subj]) return;
      var curVal = kind === 'q' ? CURRENT_PLAN[subj].q
                 : kind === 'f' ? CURRENT_PLAN[subj].f
                 :                CURRENT_PLAN[subj].v;
      var maxVal = parseInt(s.max, 10);
      var fillPct = maxVal > 0 ? Math.min(100, Math.round((curVal / maxVal) * 100)) : 0;
      var unit = kind === 'q' ? 'questions' : kind === 'f' ? 'flashcards' : 'hrs';
      var el = document.createElement('div');
      el.className = 'sim-progress';
      el.innerHTML =
        '<span class="sp-label">Completed</span>' +
        '<span class="sp-val">' + curVal + ' ' + unit + '</span>' +
        '<div class="sp-bar"><div class="sp-fill" style="width:' + fillPct + '%"></div></div>';
      s.parentNode.insertBefore(el, s.nextSibling);
    });

    var pcmClose  = document.getElementById('pcm-close');
    var pcmCancel = document.getElementById('pcm-cancel');
    var pcmNext   = document.getElementById('pcm-next');
    var pcmBack   = document.getElementById('pcm-back');
    var pcmApply  = document.getElementById('pcm-apply');
    if (pcmClose)  pcmClose.addEventListener('click',  closePlanComparison);
    if (pcmCancel) pcmCancel.addEventListener('click', closePlanComparison);
    if (pcmNext)   pcmNext.addEventListener('click',   function () { showPcmStep(2); });
    if (pcmBack)   pcmBack.addEventListener('click',   function () { showPcmStep(1); });
    if (pcmApply)  pcmApply.addEventListener('click',  applyPlan);

    /* expand/collapse subject rows in step 2 */
    document.getElementById('pcs-subjects').addEventListener('click', function (e) {
      var row = e.target.closest('.pcs-subj-row');
      if (!row) return;
      var detail = document.getElementById('pcs-detail-' + row.dataset.subj);
      if (!detail) return;
      var open = row.classList.toggle('expanded');
      detail.classList.toggle('open', open);
    });

    /* initial footer state */
    showPcmStep(1);

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
