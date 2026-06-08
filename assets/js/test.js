/**
 * UWorld B2C — Test Interface
 * Handles question navigation, timer, answer selection, submit & explanation.
 */

'use strict';

(function () {

  /* ═══════════════════════════════════
     URL PARAMS
     ═══════════════════════════════════ */
  var params = new URLSearchParams(window.location.search);
  var TOPIC  = params.get('topic') || 'General Biology';
  var QCOUNT = Math.min(20, Math.max(1, parseInt(params.get('q'), 10) || 10));

  /* ═══════════════════════════════════
     QUESTION BANK (sample passage + Qs)
     Bank is larger than QCOUNT; we slice.
     ═══════════════════════════════════ */
  var BANK = [
    {
      passage: true,
      passageLabel: 'Passage 1 (Questions 1–5)',
      passageTitle: 'The Strategic Mind',
      passageBody: [
        'The name "Sun Tzu" is readily recognized by scholars and non-scholars alike; as the author of <em>The Art of War</em>, he is identifiable even to those who have never studied Chinese history or military strategy. Much less familiar to the layman is his descendant Sun Bin, who one and a half centuries later (circa 350 BCE) extended the discussion of battlefield tactics with his own insights. Although some deem Sun Bin\'s thinking to lack the philosophical depth displayed by his predecessor, the two strategists in fact bear many similarities, and we should not be overhasty in our evaluation of Sun Bin\'s contribution.',
        'An instructive example can be found in a historical record of his advice to another commander concerning a horse race:',
        '<blockquote>Sun Bin then said to Tian Ji, "You just go ahead and make a large wager; I will see to it that you win."…Just as the contest was to begin, Sun Bin counseled Tian Ji, "Pit your third-best team against their finest, your finest against their second-best, and your second best against their third." When all three horse races were finished, though Tian Ji had lost the first race, his horses prevailed in the next two, in the end winning a thousand pieces of the king\'s gold.</blockquote>',
        'It would be easy to dismiss this episode as a demonstration merely of cunning or desire for personal gain. However, Sun Bin\'s tactic essentially aligns with Sun Tzu\'s famous maxim: "If you know the enemy and know yourself, you need not fear the result of a hundred battles." Nothing had changed about the horses, but Sun Bin arranged their deployment in a way that ensured an overall victory. Hence, the story is not out of place in a context of military tactics because it illustrates the adaptation of circumstance to one\'s advantage.',
        'Similarly, while <em>The Art of War</em> remains of interest to the modern military mind, its study is even more often applied to non-martial contexts, such as commerce, politics, or simply how to live. In one chapter, Sun Tzu gives the instruction to "throw your soldiers into positions whence there is no escape, and they will prefer death to flight." The military application is obvious, but the underlying idea extends much further: when one cannot give up, there is no choice but to strive for victory with full abandon.',
        'Sun Bin refers to the success or failure of an army when saying: "If you take a road that goes nowhere, even Heaven and earth cannot make you prosper; if you take the right road, even Heaven and earth cannot waylay you." Ultimately, Sun Bin provides a compelling picture of battlefield tactics and strategy. As with Sun Tzu\'s more famous insights, the true depth and value of Sun Bin\'s thinking lie in its broader scope and application.'
      ],
      passageNote: 'Passage Title: Arts of War: The Two Suns',
      stem: 'Which of the following statements is most supported by evidence in the passage?',
      choices: [
        { letter: 'A', text: 'Sun Bin\'s horse race advice fits within a context of military tactics.' },
        { letter: 'B', text: 'The name Sun Bin is generally unfamiliar to non-scholars.' },
        { letter: 'C', text: 'Sun Tzu\'s <em>The Art of War</em> remains of interest to the modern military mind.' },
        { letter: 'D', text: 'Sun Tzu\'s <em>The Art of War</em> is more often applied to politics than to military settings.' }
      ],
      correct: 0,
      explanation: 'Choice A is correct. The passage explicitly states that the horse race story "is not out of place in a context of military tactics because it illustrates the adaptation of circumstance to one\'s advantage," directly supporting this statement with textual evidence.'
    },
    {
      stem: 'The passage suggests that Sun Bin\'s contribution to strategic thinking has been:',
      choices: [
        { letter: 'A', text: 'Widely acknowledged as superior to that of Sun Tzu.' },
        { letter: 'B', text: 'Undervalued by those who compare him unfavorably to Sun Tzu.' },
        { letter: 'C', text: 'Primarily relevant to military rather than civilian contexts.' },
        { letter: 'D', text: 'Discredited by modern scholars of Chinese history.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The author warns against being "overhasty" in evaluating Sun Bin, implying that quick negative comparisons to Sun Tzu undervalue his real contribution. The author goes on to demonstrate the depth of Sun Bin\'s insights.'
    },
    {
      stem: 'According to the passage, the primary reason Sun Bin\'s horse race strategy succeeded was:',
      choices: [
        { letter: 'A', text: 'Tian Ji\'s horses were objectively faster than the king\'s horses.' },
        { letter: 'B', text: 'The king\'s advisors failed to anticipate the tactic.' },
        { letter: 'C', text: 'Sun Bin rearranged the matchups to maximize overall wins.' },
        { letter: 'D', text: 'The wager amount motivated Tian Ji\'s horses to perform better.' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The passage states that "Nothing had changed about the horses, but Sun Bin arranged their deployment in a way that ensured an overall victory," clearly identifying the strategic reordering as the key reason for success.'
    },
    {
      stem: 'Which of the following best describes the author\'s attitude toward Sun Bin?',
      choices: [
        { letter: 'A', text: 'Skeptical and critical' },
        { letter: 'B', text: 'Neutral and detached' },
        { letter: 'C', text: 'Approving and appreciative' },
        { letter: 'D', text: 'Enthusiastic but overstated' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The author explicitly cautions against undervaluing Sun Bin and ends by affirming that "Sun Bin provides a compelling picture of battlefield tactics," indicating a clearly positive, approving stance.'
    },
    {
      stem: 'The quotation from Sun Bin about roads ("If you take a road that goes nowhere…") most likely serves to:',
      choices: [
        { letter: 'A', text: 'Contrast Sun Bin\'s thinking with Sun Tzu\'s on the topic of fate.' },
        { letter: 'B', text: 'Illustrate that Sun Bin\'s insights apply beyond purely military contexts.' },
        { letter: 'C', text: 'Demonstrate Sun Bin\'s knowledge of geography and logistics.' },
        { letter: 'D', text: 'Provide a counterargument to Sun Tzu\'s principle of adaptation.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. Immediately after the quotation, the author notes that Sun Bin\'s words "apply far beyond a military perspective," using this quote as evidence that Sun Bin\'s insights have universal application — not just military.'
    },
    {
      stem: 'Based on the passage, Sun Tzu\'s maxim about knowing the enemy and knowing oneself is relevant to the horse race story because:',
      choices: [
        { letter: 'A', text: 'Sun Bin had scouted the exact speed of each of the king\'s horses.' },
        { letter: 'B', text: 'Knowledge of relative strengths enabled optimal strategic deployment.' },
        { letter: 'C', text: 'Sun Tzu taught Sun Bin directly in the art of racing strategy.' },
        { letter: 'D', text: 'Both Sun Tzu and Sun Bin advocated sacrificing the weakest team first.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The passage explicitly links Sun Tzu\'s maxim to the horse race outcome: understanding the relative standings of all horses allowed Sun Bin to arrange matchups that yielded the greatest overall advantage — knowledge of self and enemy applied.'
    },
    {
      stem: 'The author\'s use of the phrase "not be overhasty" (paragraph 1) implies that:',
      choices: [
        { letter: 'A', text: 'Sun Bin\'s work deserves careful consideration before being dismissed.' },
        { letter: 'B', text: 'Sun Tzu\'s work has been too hastily celebrated.' },
        { letter: 'C', text: 'Scholars need more time before comparing the two strategists.' },
        { letter: 'D', text: 'Military history is a rapidly evolving field of study.' }
      ],
      correct: 0,
      explanation: 'Choice A is correct. The phrase "we should not be overhasty in our evaluation of Sun Bin\'s contribution" directly warns readers not to rush to dismiss or undervalue Sun Bin simply because some view his work as less philosophically deep than Sun Tzu\'s.'
    },
    {
      stem: 'Which of the following, if true, would most WEAKEN the author\'s central argument?',
      choices: [
        { letter: 'A', text: 'Sun Bin wrote extensively about agricultural and commercial topics.' },
        { letter: 'B', text: 'Modern business schools use <em>The Art of War</em> in their curricula.' },
        { letter: 'C', text: 'Historical records show Sun Bin\'s horse race story was fabricated centuries later.' },
        { letter: 'D', text: 'Sun Tzu\'s texts were also originally intended for non-military audiences.' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The author\'s central argument partly rests on the horse race story as evidence of Sun Bin\'s strategic depth. If that story were a later fabrication, the key evidence supporting the claim of Sun Bin\'s alignment with Sun Tzu\'s principles would be undermined.'
    },
    {
      stem: 'The phrase "broader scope and application" (final paragraph) refers most directly to:',
      choices: [
        { letter: 'A', text: 'The geographic range of Sun Bin\'s military campaigns.' },
        { letter: 'B', text: 'The applicability of Sun Bin\'s insights to non-military life.' },
        { letter: 'C', text: 'The number of subjects Sun Bin wrote about beyond warfare.' },
        { letter: 'D', text: 'The influence of Sun Bin\'s work on later Chinese philosophers.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. Earlier in the passage the author demonstrates that Sun Bin\'s words "apply far beyond a military perspective." The final paragraph\'s reference to "broader scope and application" echoes and reinforces this same theme of universal relevance.'
    },
    {
      stem: 'Which of the following pairs of words best characterizes the relationship between Sun Tzu and Sun Bin as presented in the passage?',
      choices: [
        { letter: 'A', text: 'Rival and successor' },
        { letter: 'B', text: 'Predecessor and intellectual heir' },
        { letter: 'C', text: 'Teacher and student' },
        { letter: 'D', text: 'Famous and obscure' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The passage describes Sun Bin as a descendant who "extended the discussion" of military tactics begun by Sun Tzu, and their ideas align closely. This fits "predecessor and intellectual heir" — a lineage of thought without necessarily a direct teaching relationship.'
    },
    {
      stem: 'The passage most strongly suggests that the study of <em>The Art of War</em> today:',
      choices: [
        { letter: 'A', text: 'Is primarily conducted by active military personnel.' },
        { letter: 'B', text: 'Has declined as battlefield tactics have changed.' },
        { letter: 'C', text: 'Extends well beyond military contexts into everyday life.' },
        { letter: 'D', text: 'Is limited to scholars of East Asian history.' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The passage states the book\'s study "is even more often applied to non-martial contexts, such as commerce, politics, or simply how to live," directly asserting that its relevance extends far beyond military use.'
    },
    {
      stem: 'In the context of the passage, the horse race anecdote primarily functions as:',
      choices: [
        { letter: 'A', text: 'A counterexample that challenges the thesis about Sun Bin.' },
        { letter: 'B', text: 'An entertaining digression from the main argument.' },
        { letter: 'C', text: 'Evidence that Sun Bin\'s thinking is consistent with strategic principles.' },
        { letter: 'D', text: 'Proof that Sun Bin\'s methods were superior to Sun Tzu\'s in practice.' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The author explicitly uses the horse race story to demonstrate that Sun Bin\'s tactical thinking "aligns with Sun Tzu\'s famous maxim," thereby supporting the argument that Sun Bin\'s work is strategically consistent and worthy of serious consideration.'
    },
    {
      stem: 'The author implies that critics who "deem Sun Bin\'s thinking to lack philosophical depth" are:',
      choices: [
        { letter: 'A', text: 'Largely correct based on the evidence in the passage.' },
        { letter: 'B', text: 'Drawing conclusions too quickly without full examination.' },
        { letter: 'C', text: 'Correct in their assessment but missing the military value.' },
        { letter: 'D', text: 'Confused about the historical relationship between the two strategists.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The author\'s caution against being "overhasty" in evaluating Sun Bin implies that critics who dismiss his philosophical depth have reached conclusions too quickly — they are making a hasty judgment not warranted by closer examination.'
    },
    {
      stem: 'According to the passage, Sun Tzu\'s instruction to "throw your soldiers into positions whence there is no escape" is significant primarily because:',
      choices: [
        { letter: 'A', text: 'It shows Sun Tzu\'s ruthlessness as a military commander.' },
        { letter: 'B', text: 'It reveals the limits of Sun Tzu\'s understanding of human psychology.' },
        { letter: 'C', text: 'Its underlying principle applies to non-military situations involving commitment.' },
        { letter: 'D', text: 'It is the most frequently misunderstood passage in <em>The Art of War</em>.' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The passage says that "the underlying idea extends much further: when one cannot give up, there is no choice but to strive for victory with full abandon" — clearly asserting that the principle applies beyond the military context to situations requiring total commitment.'
    },
    {
      stem: 'Which of the following best summarizes the main idea of the passage?',
      choices: [
        { letter: 'A', text: 'Sun Bin is a superior strategist whose fame has been eclipsed unfairly by Sun Tzu.' },
        { letter: 'B', text: 'Both Sun Tzu and Sun Bin developed ideas whose strategic value extends into everyday life, and Sun Bin deserves more credit than he typically receives.' },
        { letter: 'C', text: 'Military strategy has evolved since ancient China to encompass commerce and politics.' },
        { letter: 'D', text: 'The horse race anecdote proves that Sun Bin\'s practical advice was more effective than Sun Tzu\'s philosophical musings.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The passage (1) advocates a fairer appreciation of Sun Bin, (2) draws parallels between his thinking and Sun Tzu\'s, and (3) demonstrates that both strategists\' ideas have applications beyond warfare. Option B encompasses all three of these themes without overstating any of them.'
    },
    {
      stem: 'The author\'s reference to Sun Bin\'s words about "the pattern of the heavens and the earth" suggests that Sun Bin viewed warfare as:',
      choices: [
        { letter: 'A', text: 'A purely mechanical exercise governed by predictable rules.' },
        { letter: 'B', text: 'Subject to supernatural forces beyond human control.' },
        { letter: 'C', text: 'Part of a larger natural order that governs all human endeavors.' },
        { letter: 'D', text: 'Less important than understanding celestial navigation.' }
      ],
      correct: 2,
      explanation: 'Choice C is correct. The passage states Sun Bin "conceives it [warfare] as a microcosm of a larger and more abstract natural harmony," meaning warfare is embedded within a universal natural order that applies to all human activity, not just battle.'
    },
    {
      stem: 'Which word best captures the tone of the passage as a whole?',
      choices: [
        { letter: 'A', text: 'Combative' },
        { letter: 'B', text: 'Laudatory' },
        { letter: 'C', text: 'Impartial' },
        { letter: 'D', text: 'Apologetic' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The author consistently praises Sun Bin\'s contributions, defends him against dismissal, draws favorable comparisons to Sun Tzu, and concludes by calling his work "compelling." This sustained praise makes "laudatory" the best description of the overall tone.'
    },
    {
      stem: 'The structure of the passage can best be described as:',
      choices: [
        { letter: 'A', text: 'Presenting a problem and offering a solution.' },
        { letter: 'B', text: 'Introducing a claim, supporting it with an example, and broadening its implications.' },
        { letter: 'C', text: 'Comparing two opposing views and reaching a compromise.' },
        { letter: 'D', text: 'Narrating a historical sequence of events in chronological order.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The author opens with the claim that Sun Bin is undervalued, uses the horse race story as supporting evidence, draws a parallel to Sun Tzu\'s maxim, and then broadens the discussion to the universal applicability of both strategists\' ideas — a classic introduce-support-broaden structure.'
    },
    {
      stem: 'The author states that Sun Bin\'s horse race advice "is not out of place in a context of military tactics." This assertion primarily serves to:',
      choices: [
        { letter: 'A', text: 'Rebut those who would classify the anecdote as a moral fable.' },
        { letter: 'B', text: 'Argue that horse racing was a form of military training in ancient China.' },
        { letter: 'C', text: 'Discredit the historical record in which the anecdote appears.' },
        { letter: 'D', text: 'Suggest that Sun Bin\'s advice was more tactical than that of Sun Tzu.' }
      ],
      correct: 0,
      explanation: 'Choice A is correct. The statement rebuts the easy dismissal of the episode as "merely a demonstration of cunning or desire for personal gain" — in other words, as a moral fable rather than genuine strategic thinking — by insisting its principle aligns with core military tactical thought.'
    },
    {
      stem: 'The passage implies that a key similarity between Sun Tzu and Sun Bin is that both:',
      choices: [
        { letter: 'A', text: 'Wrote their works specifically for non-military audiences.' },
        { letter: 'B', text: 'Emphasized adaptation to circumstance as a path to success.' },
        { letter: 'C', text: 'Believed fate and divine will determined the outcome of battles.' },
        { letter: 'D', text: 'Criticized the military commanders of their respective eras.' }
      ],
      correct: 1,
      explanation: 'Choice B is correct. The passage links Sun Bin\'s tactic to Sun Tzu\'s maxim about knowing the enemy and oneself, and frames both strategists\' ideas as centering on "adaptation of circumstance to one\'s advantage." This shared emphasis on adaptive thinking is the primary similarity the author draws.'
    }
  ];

  /* ═══════════════════════════════════
     BUILD QUESTION LIST (slice + pad)
     ═══════════════════════════════════ */
  var QUESTIONS = BANK.slice(0, QCOUNT);
  /* Ensure we have exactly QCOUNT items (bank has 20) */

  /* ═══════════════════════════════════
     STATE
     ═══════════════════════════════════ */
  var current     = 0;                      /* 0-based index */
  var answers     = new Array(QUESTIONS.length).fill(null); /* null = unanswered */
  var submitted   = new Array(QUESTIONS.length).fill(false);
  var timerSecs   = 0;
  var timerHandle = null;
  var navOpen     = false;

  /* ═══════════════════════════════════
     DOM HELPERS
     ═══════════════════════════════════ */
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }
  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  /* ═══════════════════════════════════
     TIMER
     ═══════════════════════════════════ */
  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function startTimer() {
    timerHandle = setInterval(function () {
      timerSecs++;
      setText('test-timer', fmtTime(timerSecs));
    }, 1000);
  }

  /* ═══════════════════════════════════
     RENDER QUESTION
     ═══════════════════════════════════ */
  function renderQuestion(idx) {
    var q       = QUESTIONS[idx];
    var isSubmitted = submitted[idx];
    var chosen  = answers[idx];

    /* Counter */
    setText('q-num', idx + 1);
    setText('q-total', QUESTIONS.length);

    /* Passage (only first question in a passage group gets the full passage,
       or we could always show the same passage — for simplicity show if q.passage exists) */
    var passagePane   = document.getElementById('passage-pane');
    var passageLabel  = document.getElementById('passage-label');
    var passageBody   = document.getElementById('passage-body');
    var passageNote   = document.getElementById('passage-note');

    /* Find which passage belongs to this question */
    var passageQ = null;
    for (var i = idx; i >= 0; i--) {
      if (QUESTIONS[i].passage) { passageQ = QUESTIONS[i]; break; }
    }

    if (passageQ) {
      passagePane.style.display = '';
      passageLabel.textContent  = passageQ.passageLabel || 'Passage';
      passageNote.textContent   = passageQ.passageNote  || '';

      /* Build passage HTML */
      var html = '';
      passageQ.passageBody.forEach(function (para) {
        if (para.startsWith('<blockquote>')) {
          html += '<div class="passage-blockquote">' + para.replace(/<\/?blockquote>/g, '') + '</div>';
        } else {
          html += '<p>' + para + '</p>';
        }
      });
      passageBody.innerHTML = html;
    } else {
      passagePane.style.display = 'none';
    }

    /* Question label */
    setText('q-label', 'Question ' + (idx + 1));

    /* Stem */
    document.getElementById('q-stem').innerHTML = q.stem;

    /* Choices */
    var choiceList = document.getElementById('q-choices');
    choiceList.innerHTML = '';
    q.choices.forEach(function (c, ci) {
      var li = document.createElement('li');
      li.className = 'q-choice';
      if (ci === chosen) {
        if (isSubmitted) {
          li.classList.add(ci === q.correct ? 'correct' : 'incorrect');
        } else {
          li.classList.add('selected');
        }
      }
      if (isSubmitted && ci === q.correct && ci !== chosen) {
        li.classList.add('correct');
      }

      li.innerHTML =
        '<span class="choice-radio"></span>' +
        '<span class="choice-letter">' + c.letter + '.</span>' +
        '<span class="choice-text">' + c.text + '</span>';

      if (!isSubmitted) {
        li.addEventListener('click', function () { selectChoice(idx, ci); });
      }

      choiceList.appendChild(li);
    });

    /* Submit button */
    var submitBtn = document.getElementById('q-submit');
    submitBtn.disabled   = (chosen === null || isSubmitted);
    submitBtn.textContent = isSubmitted ? 'Submitted' : 'Submit';

    /* Explanation */
    var explEl = document.getElementById('q-explanation');
    if (isSubmitted) {
      explEl.classList.add('show');
      var isCorrect = (chosen === q.correct);
      document.getElementById('expl-icon').className   = isCorrect ? 'fa-light fa-circle-check expl-correct' : 'fa-light fa-circle-xmark expl-incorrect';
      document.getElementById('expl-verdict').textContent = isCorrect ? 'Correct!' : 'Incorrect';
      document.getElementById('expl-verdict').className   = isCorrect ? 'expl-correct' : 'expl-incorrect';
      document.getElementById('expl-text').textContent    = q.explanation;
    } else {
      explEl.classList.remove('show');
    }

    /* Prev / Next buttons */
    document.getElementById('btn-prev').disabled = (idx === 0);
    document.getElementById('btn-next').disabled = (idx === QUESTIONS.length - 1);

    /* Nav dropdown pills */
    refreshNavPills();
  }

  /* ═══════════════════════════════════
     SELECT CHOICE
     ═══════════════════════════════════ */
  function selectChoice(qIdx, choiceIdx) {
    if (submitted[qIdx]) return;
    answers[qIdx] = choiceIdx;
    renderQuestion(qIdx);
  }

  /* ═══════════════════════════════════
     SUBMIT
     ═══════════════════════════════════ */
  function submitAnswer() {
    if (answers[current] === null || submitted[current]) return;
    submitted[current] = true;
    renderQuestion(current);
  }

  /* ═══════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════ */
  function goTo(idx) {
    if (idx < 0 || idx >= QUESTIONS.length) return;
    current = idx;
    renderQuestion(current);
    closeNav();
  }

  function refreshNavPills() {
    var pills = qsa('.qnd-pill');
    pills.forEach(function (pill, i) {
      pill.classList.toggle('current', i === current);
      pill.classList.toggle('answered', submitted[i]);
    });
  }

  /* ═══════════════════════════════════
     Q-NAV DROPDOWN
     ═══════════════════════════════════ */
  function buildNavDropdown() {
    var grid = document.getElementById('qnd-grid');
    if (!grid) return;
    for (var i = 0; i < QUESTIONS.length; i++) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.className = 'qnd-pill' + (idx === 0 ? ' current' : '');
        btn.textContent = idx + 1;
        btn.addEventListener('click', function () { goTo(idx); });
        grid.appendChild(btn);
      })(i);
    }
  }

  function openNav() {
    navOpen = true;
    document.getElementById('q-nav-dropdown').classList.add('open');
  }

  function closeNav() {
    navOpen = false;
    document.getElementById('q-nav-dropdown').classList.remove('open');
  }

  function toggleNav() {
    if (navOpen) closeNav(); else openNav();
  }

  /* ═══════════════════════════════════
     END TEST
     ═══════════════════════════════════ */
  function endTest() {
    var answered  = submitted.filter(Boolean).length;
    var total     = QUESTIONS.length;
    var correct   = 0;
    submitted.forEach(function (s, i) {
      if (s && answers[i] === QUESTIONS[i].correct) correct++;
    });

    var msg = 'Test ended.\n\nSummary:\nAnswered: ' + answered + ' / ' + total +
              '\nCorrect: ' + correct + ' / ' + answered +
              (answered ? ' (' + Math.round((correct / answered) * 100) + '%)' : '') +
              '\nTime: ' + fmtTime(timerSecs);

    clearInterval(timerHandle);
    alert(msg);
    window.location.href = 'mcat.html';
  }

  /* ═══════════════════════════════════
     INIT TOPIC DISPLAY
     ═══════════════════════════════════ */
  function initTopic() {
    var badge = document.getElementById('topic-badge');
    if (badge) badge.textContent = TOPIC;
    document.title = 'UWorld – ' + TOPIC + ' Test';
  }

  /* ═══════════════════════════════════
     BOOT
     ═══════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initTopic();
    buildNavDropdown();
    renderQuestion(0);
    startTimer();

    /* Submit */
    document.getElementById('q-submit').addEventListener('click', submitAnswer);

    /* Navigation */
    document.getElementById('btn-prev').addEventListener('click', function () { goTo(current - 1); });
    document.getElementById('btn-next').addEventListener('click', function () { goTo(current + 1); });

    /* Counter dropdown toggle */
    document.getElementById('q-counter-btn').addEventListener('click', toggleNav);

    /* Close nav on outside click */
    document.addEventListener('click', function (e) {
      if (navOpen && !e.target.closest('#q-nav-dropdown') && !e.target.closest('#q-counter-btn')) {
        closeNav();
      }
    });

    /* End / Suspend */
    document.getElementById('btn-end').addEventListener('click', function () {
      if (confirm('End this test and return to the dashboard?')) endTest();
    });
    document.getElementById('btn-suspend').addEventListener('click', function () {
      if (confirm('Suspend this test? Your progress will be saved.')) {
        clearInterval(timerHandle);
        window.location.href = 'mcat.html';
      }
    });

    /* Keyboard shortcuts */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (!e.target.matches('input,textarea,select')) goTo(current + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (!e.target.matches('input,textarea,select')) goTo(current - 1);
      }
      if (e.key === 'Escape') closeNav();
      /* Number keys 1-4 to select answer */
      var num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4 && !submitted[current]) {
        var ci = num - 1;
        if (ci < QUESTIONS[current].choices.length) selectChoice(current, ci);
      }
      /* Enter to submit */
      if (e.key === 'Enter' && answers[current] !== null && !submitted[current]) {
        submitAnswer();
      }
    });
  });

})();
