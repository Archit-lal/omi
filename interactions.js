/* omi mockup — shared click interactions (macOS screens).
   Delegated + label/class based so one file drives every screen.
   No backend: each control produces a visible state change; no dead clicks. */
(function () {
  var CHECK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>';
  function label(el){ return (el.textContent || '').trim().toLowerCase(); }
  function flash(el, txt){ if(!el.dataset.o) el.dataset.o = el.textContent; el.textContent = txt; }

  document.addEventListener('click', function (e) {
    var t = e.target;

    // --- toggle switches (auto-reply, settings, notes) ---
    var sw = t.closest('.switch');
    if (sw) {
      sw.classList.toggle('on');
      var ar = sw.closest('.autoreply');
      if (ar && ar.childNodes.length) {
        var on = sw.classList.contains('on');
        // update the leading "Auto-reply " text node
        for (var i=0;i<ar.childNodes.length;i++){ if(ar.childNodes[i].nodeType===3 && ar.childNodes[i].nodeValue.trim()){ ar.childNodes[i].nodeValue = on ? 'Auto-reply on ' : 'Auto-reply off '; break; } }
      }
      return;
    }

    // --- task checkbox / row ---
    var box = t.closest('.box');
    var trow = t.closest('.t-row');
    if (box || trow) {
      var b = box || (trow && trow.querySelector('.box'));
      if (b) {
        var done = b.classList.toggle('done');
        b.innerHTML = done ? CHECK : '';
        var title = (b.closest('.t-row') || document).querySelector('.t-title');
        if (title) title.classList.toggle('done', done);
        return;
      }
    }

    // --- tab strips ---
    var tab = t.closest('.th-tab');
    if (tab && tab.parentElement) {
      tab.parentElement.querySelectorAll('.th-tab').forEach(function (x) { x.classList.remove('on'); });
      tab.classList.add('on');
      return;
    }

    var btn = t.closest('.btn, button');
    if (!btn) {
      // row selection (message threads, lists)
      var rs = t.closest('.th-row, .list-row');
      if (rs && rs.parentElement) {
        rs.parentElement.querySelectorAll('.th-row, .list-row').forEach(function (x) { x.classList.remove('active'); });
        rs.classList.add('active');
      }
      return;
    }

    var lb = label(btn);

    // --- draft composer: Send / Edit / Discard ---
    if (/send it/.test(lb)) {
      var draft = document.querySelector('.draft-compose');
      var tbody = document.querySelector('.t-body');
      if (draft && tbody) {
        var txt = (draft.querySelector('.txt') || {}).textContent || '';
        var line = document.createElement('div'); line.className = 'b-line out';
        line.innerHTML = '<div style="display:flex;flex-direction:column;align-items:flex-end;max-width:74%"><div class="bubble out">' + txt + '</div><div class="b-meta"><span class="badge sent"><span class="d"></span>Sent by omi · now</span></div></div>';
        tbody.appendChild(line); tbody.scrollTop = tbody.scrollHeight;
        var comp = draft.closest('.composer'); if (comp) comp.innerHTML = '<div class="caption" style="text-align:center;padding:6px">Sent. I\'ll keep drafting as replies come in.</div>';
        var ab = document.querySelector('.th-row.active .badge'); if (ab) { ab.className = 'badge sent'; ab.innerHTML = '<span class="d"></span>Sent by omi'; }
        return;
      }
    }
    if (lb === 'edit') {
      var dt = document.querySelector('.draft-compose .txt');
      if (dt && !dt.querySelector('textarea')) {
        var cur = dt.textContent;
        dt.innerHTML = '<textarea style="width:100%;min-height:66px;border:1px solid var(--hair);border-radius:8px;padding:8px;font:inherit;background:var(--surface);color:var(--ink)">' + cur + '</textarea>';
        dt.querySelector('textarea').focus();
      }
      return;
    }
    if (lb === 'discard') {
      var comp2 = document.querySelector('.composer');
      if (comp2) comp2.innerHTML = '<div class="caption" style="text-align:center;padding:6px">Draft discarded — I\'ll leave this one to you.</div>';
      return;
    }

    // --- calendar hold ---
    if (/confirm the hold/.test(lb)) {
      var hb = btn.closest('.hold-banner');
      if (hb) hb.innerHTML = '<div class="hl"><span class="live-dot"></span><span class="h3">Hold confirmed · today 4:00 PM</span></div><div class="small" style="margin-top:6px;color:var(--muted)">It\'s on your calendar. I\'ll remind you at 3:50.</div>';
      return;
    }
    if (lb === 'drop it') {
      var hb2 = btn.closest('.hold-banner');
      if (hb2) hb2.outerHTML = '<div class="caption" style="text-align:center">Dropped — nothing on your calendar.</div>';
      return;
    }

    // --- needs-you decision options ---
    if (btn.closest('.needs-callout') || /^(dispute it|leave it|not now|your call)/.test(lb)) {
      var call = btn.closest('.needs-callout') || btn.parentElement;
      if (call) { flash(btn, 'Done ✓'); btn.classList.add('sent'); }
      return;
    }

    // --- permissions ---
    if (/^grant/.test(lb) || lb === 'turn on' || lb === 'fix' || lb === 'allow') {
      flash(btn, 'On ✓'); btn.classList.add('sent'); btn.style.pointerEvents = 'none';
      return;
    }

    // --- integrations connect / disconnect ---
    if (lb === 'connect') { flash(btn, 'Connected ✓'); btn.style.color = 'var(--live)'; btn.dataset.conn = '1'; return; }
    if (btn.dataset.conn) { btn.textContent = 'Connect'; btn.style.color = ''; btn.dataset.conn = ''; return; }

    // --- copy / share ---
    if (/^copy/.test(lb) || lb === 'copy link') { flash(btn, 'Copied ✓'); setTimeout(function(){ if(btn.dataset.o){ btn.textContent = btn.dataset.o; btn.dataset.o=''; } }, 1600); return; }
    if (lb === 'share' || /share my brain/.test(lb)) { flash(btn, 'Copied to share ✓'); return; }

    // --- home snooze ---
    if (/snooze/.test(lb)) { flash(btn, 'Snoozed ✓'); return; }

    // --- plan upgrade ---
    if (/upgrade/.test(lb)) { flash(btn, "You're on Operator ✓"); return; }

    // --- live: process now / mute ---
    if (/process now/.test(lb)) { flash(btn, 'Processing…'); setTimeout(function(){ if (window.go) go('conversations'); }, 700); return; }

    // --- delete everything (inline confirm, never a dialog) ---
    if (/delete everything/.test(lb) && !btn.dataset.armed) {
      btn.dataset.armed = '1'; flash(btn, 'Tap again to confirm'); btn.style.color = 'var(--danger)';
      setTimeout(function(){ if(btn.dataset.armed){ btn.dataset.armed=''; if(btn.dataset.o){btn.textContent=btn.dataset.o;btn.dataset.o='';} btn.style.color=''; } }, 3000);
      return;
    }
    if (/tap again to confirm/.test(lb)) { btn.textContent = 'Deleted.'; btn.style.pointerEvents = 'none'; return; }

    // --- generic press feedback so nothing feels dead ---
    try { btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.97)' }, { transform: 'scale(1)' }], { duration: 130 }); } catch (_) {}
  });

  // --- Ask omi: send a message (Enter or a send button next to an input) ---
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var inp = e.target;
    if (inp.tagName !== 'INPUT' && inp.tagName !== 'TEXTAREA') return;
    var thread = document.querySelector('.bubbles, .ask-thread, .t-body');
    if (!thread || !inp.value.trim()) return;
    var q = inp.value.trim(); inp.value = '';
    var u = document.createElement('div'); u.className = 'b-line out';
    u.innerHTML = '<div class="bubble out">' + q + '</div>';
    thread.appendChild(u);
    var a = document.createElement('div'); a.className = 'b-line';
    a.innerHTML = '<div class="bubble in muted-ink">Looking through what I\'ve seen and heard…</div>';
    thread.appendChild(a); thread.scrollTop = thread.scrollHeight;
    setTimeout(function () { a.querySelector('.bubble').textContent = "Here's what I found — pulling from your recent conversations and messages."; thread.scrollTop = thread.scrollHeight; }, 800);
  });
})();
