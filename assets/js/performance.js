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

  var examCount    = 3;
  var drawerOpen   = false;
  var hasSavedPlan = false;
  var lastProjPct  = 67;

  /* Current (baseline) study plan — reflects what is already in the study planner */
  var CURRENT_PLAN = {
    bio:     { hrs: 5,  q: 61  },
    biochem: { hrs: 4,  q: 42  },
    genchem: { hrs: 7,  q: 41  },
    orgchem: { hrs: 3,  q: 30  },
    phys:    { hrs: 2,  q: 20  },
    behsci:  { hrs: 4,  q: 48  },
    cars:    { hrs: 3,  q: 36  },
    exams:   1
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

    pct += examCount * 3;
    hrs += examCount * 7;
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
    var plan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    var qPlan = { bio: 0, biochem: 0, genchem: 0, orgchem: 0, phys: 0, behsci: 0, cars: 0 };
    document.querySelectorAll('.sim-drawer input[type="range"]').forEach(function (s) {
      var subj = s.dataset.subj;
      var kind = s.dataset.kind;
      var v = parseFloat(s.value);
      if (plan[subj] === undefined) return;
      if (kind === 'q') {
        qPlan[subj] += v;
        plan[subj]  += v * parseFloat(s.dataset.hr);
      } else {
        plan[subj] += v;
      }
    });
    return { hrs: plan, q: qPlan, exams: examCount };
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
    var subjects = Object.keys(CURRENT_PLAN).filter(function (k) { return k !== 'exams'; });

    var curTotalHrs = 0, newTotalHrs = 0;
    subjects.forEach(function (k) {
      curTotalHrs += CURRENT_PLAN[k].hrs;
      newTotalHrs += Math.round(newPlan.hrs[k]);
    });
    curTotalHrs += CURRENT_PLAN.exams * 7;
    newTotalHrs += newPlan.exams * 7;

    /* Build table rows */
    var rows = subjects.map(function (k) {
      var curHrs  = CURRENT_PLAN[k].hrs;
      var newHrs  = Math.round(newPlan.hrs[k]);
      var curQ    = CURRENT_PLAN[k].q;
      var newQ    = Math.round(newPlan.q[k]);
      var diffHrs = newHrs - curHrs;
      return '<tr>' +
        '<td class="pcmt-label">' + SUBJ_LABELS[k] + '</td>' +
        '<td class="pcmt-current">' +
          '<span class="pcm-cur-val">' + curHrs + ' hrs</span>' +
          '<span class="pcm-cur-sub">' + curQ + ' questions</span>' +
        '</td>' +
        '<td class="pcmt-new">' +
          '<span class="pcm-new-val">' + newHrs + ' hrs' +
            '<span class="pcm-delta ' + deltaClass(diffHrs) + '">' + deltaText(diffHrs) + ' hrs</span>' +
          '</span>' +
          '<span class="pcm-new-sub">' + newQ + ' questions</span>' +
        '</td>' +
      '</tr>';
    });

    /* Exams row */
    var curExamHrs = CURRENT_PLAN.exams * 7, newExamHrs = newPlan.exams * 7;
    var examDiff = newExamHrs - curExamHrs;
    rows.push('<tr>' +
      '<td class="pcmt-label">Practice Exams</td>' +
      '<td class="pcmt-current">' +
        '<span class="pcm-cur-val">' + CURRENT_PLAN.exams + ' exam · ' + curExamHrs + ' hrs</span>' +
      '</td>' +
      '<td class="pcmt-new">' +
        '<span class="pcm-new-val">' + newPlan.exams + ' exam · ' + newExamHrs + ' hrs' +
          (examDiff !== 0 ? '<span class="pcm-delta ' + deltaClass(examDiff) + '">' + deltaText(examDiff) + ' hrs</span>' : '') +
        '</span>' +
      '</td>' +
    '</tr>');

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

  function stepExam(delta) {
    examCount = Math.max(0, Math.min(8, examCount + delta));
    setText('exam-num', examCount);
    recalc();
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

    var stepUp   = document.getElementById('exam-step-up');
    var stepDown = document.getElementById('exam-step-down');
    if (stepUp)   stepUp.addEventListener('click',   function () { stepExam(1);  });
    if (stepDown) stepDown.addEventListener('click',  function () { stepExam(-1); });

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
