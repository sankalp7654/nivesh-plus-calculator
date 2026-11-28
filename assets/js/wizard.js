/* ==========================================================
   Nivesh Plus — multi-step wizard engine
   Every calculator is a config object passed to NP.wizard().
   ========================================================== */
(function () {
  'use strict';
  const NP = window.NP, fmt = NP.fmt, esc = NP.esc, icon = NP.icon;

  /* ---------------- Field builders (return HTML) ---------------- */
  const F = (NP.F = {
    money(o) {
      return '<div class="field' + (o.full ? ' full' : '') + '" data-field="' + o.k + '">' +
        '<label for="f-' + o.k + '">' + esc(o.label) + '</label>' +
        '<div class="input-wrap"><span class="pre">₹</span><input id="f-' + o.k + '" data-k="' + o.k + '" data-type="money" inputmode="numeric" autocomplete="off" value="' + (o.value ? fmt.num(o.value) : (o.value === 0 ? '0' : '')) + '" placeholder="' + esc(o.placeholder || '0') + '">' +
        (o.suffix ? '<span class="suf">' + esc(o.suffix) + '</span>' : '') + '</div>' +
        '<div class="words" data-words="' + o.k + '">' + fmt.words(o.value) + '</div>' +
        (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + '</div>';
    },
    number(o) {
      return '<div class="field' + (o.full ? ' full' : '') + '" data-field="' + o.k + '">' +
        '<label for="f-' + o.k + '">' + esc(o.label) + '</label>' +
        '<div class="input-wrap">' + (o.prefix ? '<span class="pre">' + esc(o.prefix) + '</span>' : '') +
        '<input id="f-' + o.k + '" data-k="' + o.k + '" data-type="num" type="number" inputmode="decimal" step="' + (o.step || 1) + '" min="' + (o.min != null ? o.min : '') + '" max="' + (o.max != null ? o.max : '') + '" value="' + (o.value != null ? o.value : '') + '">' +
        (o.suffix ? '<span class="suf">' + esc(o.suffix) + '</span>' : '') + '</div>' +
        (o.range ? '<input type="range" aria-label="' + esc(o.label) + '" data-k="' + o.k + '" data-type="num" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + o.value + '">' +
          '<div class="range-scale"><span>' + esc(o.minLabel || o.min) + '</span><span>' + esc(o.maxLabel || o.max) + '</span></div>' : '') +
        (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + '</div>';
    },
    select(o) {
      return '<div class="field' + (o.full ? ' full' : '') + '" data-field="' + o.k + '">' +
        '<label for="f-' + o.k + '">' + esc(o.label) + '</label>' +
        '<div class="input-wrap"><select id="f-' + o.k + '" data-k="' + o.k + '" data-type="' + (o.numeric ? 'num' : 'str') + '"' + (o.rerender ? ' data-rerender="1"' : '') + '>' +
        o.options.map(op => '<option value="' + esc(op[0]) + '"' + (String(op[0]) === String(o.value) ? ' selected' : '') + '>' + esc(op[1]) + '</option>').join('') +
        '</select></div>' + (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + '</div>';
    },
    choices(o) {
      return '<div class="field full"' + (o.k ? ' data-field="' + o.k + '"' : '') + '>' + (o.label ? '<div class="field-label">' + esc(o.label) + '</div>' : '') +
        '<div class="choices' + (o.wide ? ' cols-2' : '') + '" role="radiogroup" aria-label="' + esc(o.label || '') + '">' +
        o.options.map(op => '<button type="button" class="choice" role="radio" data-choice="' + o.k + '" data-v="' + esc(op.v) + '" aria-checked="' + (String(op.v) === String(o.value)) + '">' +
          (op.icon ? '<span class="cic">' + icon(op.icon) + '</span>' : '') +
          '<span><span class="ct">' + esc(op.t) + '</span>' + (op.d ? '<span class="cd" style="display:block">' + esc(op.d) + '</span>' : '') + '</span>' +
          '<span class="tick">' + icon('check') + '</span></button>').join('') +
        '</div>' + (o.hint ? '<div class="hint" style="margin-top:6px">' + o.hint + '</div>' : '') + '</div>';
    },
    segmented(o) {
      return '<div class="field' + (o.full ? ' full' : '') + '"><div class="field-label">' + esc(o.label) + '</div><div><div class="segmented" role="radiogroup">' +
        o.options.map(op => '<button type="button" role="radio" data-choice="' + o.k + '" data-v="' + esc(op[0]) + '" aria-checked="' + (String(op[0]) === String(o.value)) + '">' + esc(op[1]) + '</button>').join('') +
        '</div></div>' + (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + '</div>';
    },
    /* Editable cost list. items: [{k,label,hint}] read/write state[o.k][item.k] */
    items(o, s) {
      const obj = s[o.k] || {};
      const tot = o.items.reduce((t, it) => t + (NP.parseNum(obj[it.k]) || 0), 0);
      return '<div class="items">' + o.items.map(it =>
        '<div class="item-row"><div><div class="il">' + esc(it.label) + '</div>' + (it.hint ? '<div class="ih">' + esc(it.hint) + '</div>' : '') + '</div>' +
        '<div class="input-wrap"><span class="pre">₹</span><input aria-label="' + esc(it.label) + '" data-item="' + o.k + '" data-ik="' + it.k + '" inputmode="numeric" value="' + fmt.num(obj[it.k] || 0) + '"></div></div>').join('') +
        '<div class="item-row total"><div><div class="il">' + esc(o.totalLabel || 'Total') + '</div>' + (o.totalHint ? '<div class="ih">' + esc(o.totalHint) + '</div>' : '') + '</div>' +
        '<div><div class="tv" data-items-total="' + o.k + '">' + fmt.inr(tot) + '</div><div class="ts" data-items-words="' + o.k + '">' + fmt.words(tot) + '</div></div></div></div>';
    },
    text(o) {
      return '<div class="field' + (o.full ? ' full' : '') + '" data-field="' + o.k + '">' +
        '<label for="f-' + o.k + '">' + esc(o.label) + '</label>' +
        '<div class="input-wrap"><input id="f-' + o.k + '" data-k="' + o.k + '" data-type="str" maxlength="' + (o.max || 40) + '" value="' + esc(o.value || '') + '" placeholder="' + esc(o.placeholder || '') + '"></div>' +
        (o.hint ? '<div class="hint">' + o.hint + '</div>' : '') + '</div>';
    },
    grid: (...f) => '<div class="fields">' + f.join('') + '</div>',
    live: inner => '<div class="live" data-live>' + inner + '</div>',
    kpi: (l, v, s, accent) => '<div class="kpi' + (accent ? ' accent' : '') + '"><div class="kl">' + esc(l) + '</div><div class="kv">' + v + '</div>' + (s ? '<div class="ks">' + s + '</div>' : '') + '</div>',
    space: (px) => '<div style="height:' + (px || 18) + 'px"></div>'
  });
  NP.itemsTotal = (obj) => Object.values(obj || {}).reduce((t, v) => t + (NP.parseNum(v) || 0), 0);

  /* ---------------- Shared step: compare 3 investment options ---------------- */
  /* opts: { target(s,r)->amount needed at rate r (lets existing savings grow), years(s), inflation(s), title, sub, after(s),
     calc(s,r,years,inf)->{lump,sip,yearly,real} optional override when the amount to invest is not a simple corpus target } */
  NP.investStep = function (opts) {
    return {
      title: opts.title || 'Choose how you will invest',
      nav: opts.nav || 'Investment plan',
      sub: opts.sub || 'Pick an expected return for each option from the drop-down. All three are shown side by side so you can compare.',
      render(s) {
        return (opts.before ? opts.before(s) : '') + '<div class="invest" data-invest>' + investCards(s, opts) + '</div>' +
          F.space(14) + '<div data-invest-note>' + investNote(s, opts) + '</div>';
      },
      live(s, el) {
        const box = el.querySelector('[data-invest]');
        NP.INVEST.forEach(x => {
          const card = box.querySelector('[data-inv="' + x.key + '"]');
          if (card) card.querySelector('[data-inv-out]').innerHTML = investOut(s, opts, x);
        });
        el.querySelector('[data-invest-note]').innerHTML = investNote(s, opts);
      }
    };
  };
  function investOut(s, opts, x) {
    const yrs = opts.years(s), inf = opts.inflation(s), r = s.inv[x.key];
    const c = opts.calc ? opts.calc(s, r, yrs, inf) : NP.investCalc(opts.target(s, r), yrs, r, inf), st = NP.suitability(x.key, yrs);
    return '<div><div class="bl">Invest today (one time)</div><div class="big">' + fmt.short(c.lump) + '</div><div class="muted" style="font-size:.78rem">' + fmt.inr(c.lump) + '</div></div>' +
      '<div class="row2"><span>Or monthly SIP</span><b>' + fmt.inr(c.sip) + '</b></div>' +
      '<div class="row2"><span>Or yearly</span><b>' + fmt.inr(c.yearly) + '</b></div>' +
      '<div class="row2 real"><span>Real return after ' + fmt.pct(inf) + ' inflation</span><b style="color:' + (c.real < 0 ? 'var(--bad-ink)' : c.real < 1.5 ? 'var(--warn-ink)' : 'var(--good-ink)') + '">' + (c.real >= 0 ? '+' : '') + fmt.pctFixed(c.real, 1) + '</b></div>' +
      '<div>' + NP.status(st) + '</div>';
  }
  function investCards(s, opts) {
    return NP.INVEST.map(x => {
      const sel = s.inv[x.key + 'Sel'] || x.def, custom = sel === 'custom';
      return '<div class="inv-card' + (custom ? ' is-custom' : '') + '" data-inv="' + x.key + '">' +
        '<div class="ih"><span class="cic">' + icon(x.icon) + '</span><div><div class="it">' + esc(x.name) + '</div><div class="is">' + esc(x.product) + '</div></div></div>' +
        '<div class="input-wrap"><select aria-label="' + esc(x.name) + ' expected return" data-inv-sel="' + x.key + '">' +
        x.rates.map(r => '<option value="' + r[0] + '"' + (r[0] === sel ? ' selected' : '') + '>' + esc(r[1]) + '</option>').join('') +
        '<option value="custom"' + (custom ? ' selected' : '') + '>Custom rate…</option></select></div>' +
        '<div class="input-wrap custom-rate"><input type="number" step="0.1" min="0" max="30" aria-label="Custom rate" data-inv-custom="' + x.key + '" value="' + s.inv[x.key] + '"><span class="suf">% p.a.</span></div>' +
        '<div data-inv-out style="display:flex;flex-direction:column;gap:10px">' + investOut(s, opts, x) + '</div></div>';
    }).join('');
  }
  function investNote(s, opts) {
    const inf = opts.inflation(s), lic = s.inv.lic, lr = NP.fin.real(lic, inf);
    let html = 'Returns are illustrative. “Real return” is what your money actually grows by after inflation; a positive real return means your purchasing power increases.';
    if (lr < 0) html = '<b>At ' + fmt.pct(lic) + ', insurance savings earn less than ' + fmt.pct(inf) + ' inflation.</b> Use them for life cover, and pair them with Post Office schemes or mutual funds for growth.';
    return NP.h.note(html, lr < 0 ? 'warn' : '');
  }
  /* Common summary pieces for investment comparison */
  NP.investSummary = function (s, target, years, inflation, opts) {
    opts = opts || {};
    const rows = NP.INVEST.map(x => {
      const r = s.inv[x.key], c = opts.calc ? opts.calc(r) : NP.investCalc(typeof target === 'function' ? target(r) : target, years, r, inflation);
      return { x, r, c };
    });
    const table = NP.h.table(['Option', 'Return', 'Real return', 'One-time today', 'Monthly SIP', 'Yearly'],
      rows.map(o => [
        '<b>' + esc(o.x.name) + '</b><span class="td-sub">' + esc(o.x.product) + '</span>',
        fmt.pct(o.r), (o.c.real >= 0 ? '+' : '') + fmt.pctFixed(o.c.real, 1),
        fmt.inr(o.c.lump), fmt.inr(o.c.sip), fmt.inr(o.c.yearly)
      ]));
    const bars = NP.charts.hbars({
      items: rows.map((o, i) => ({ label: o.x.name, sub: fmt.pct(o.r) + ' p.a.', value: o.c.lump, color: ['#1b4785', '#5598e7', '#e0a21b'][i] })),
      tipLabel: 'One-time investment today'
    });
    return { rows, table, bars };
  };

  NP.live = (el, html) => { const b = el.querySelector('[data-live]'); if (b) b.innerHTML = html; };

  /* Suggested allocation + practical tips for any goal */
  NP.goalAdvice = function (s, targetAt, years, inflation, goalName) {
    const w = years >= 10 ? { mf: 60, po: 30, lic: 10 } : years >= 7 ? { mf: 50, po: 40, lic: 10 } : years >= 5 ? { mf: 35, po: 55, lic: 10 } : years >= 3 ? { mf: 15, po: 85, lic: 0 } : { mf: 0, po: 100, lic: 0 };
    let sipMix = 0, lumpMix = 0;
    const rows = NP.INVEST.filter(x => w[x.key] > 0).map(x => {
      const r = s.inv[x.key], tgt = targetAt(r) * w[x.key] / 100;
      const sip = NP.fin.sipFor(tgt, r, years), lump = NP.fin.pv(tgt, r, years);
      sipMix += sip; lumpMix += lump;
      return [esc(x.name) + '<span class="td-sub">' + esc(x.product) + '</span>', w[x.key] + '%', fmt.pct(r), fmt.inr(lump), fmt.inr(sip)];
    });
    const mixHtml = NP.h.table(['Option', 'Share', 'Return', 'One-time today', 'Monthly SIP'], rows, { foot: ['<b>Suggested mix</b>', '100%', '', fmt.inr(lumpMix), fmt.inr(sipMix)] });
    const mfR = s.inv.mf, poR = s.inv.po;
    const bestR = years >= 5 ? mfR : poR;
    const flat = NP.fin.sipFor(targetAt(bestR), bestR, years), step = targetAt(bestR) / NP.fin.sipFV(1, bestR, years, 10);
    const t = [];
    if (years >= 5) t.push('Spread the money across options: about <b>' + w.mf + '% in equity mutual funds</b> for growth and <b>' + w.po + '% in Post Office schemes</b> for safety. The suggested mix needs a monthly SIP of <b>' + fmt.inr(sipMix) + '</b>.');
    else t.push('With only ' + fmt.yrs(years) + ' to go, keep this money safe: Post Office RD, Time Deposit or short-term debt funds. The suggested plan needs <b>' + fmt.inr(sipMix) + '</b> a month.');
    if (years >= 3) t.push('Start with a <b>step-up SIP</b>: begin at <b>' + fmt.inr(step) + '/month</b> and raise it 10% every year, instead of a flat ' + fmt.inr(flat) + '/month.');
    if (years >= 6) t.push('About 2–3 years before the goal, gradually move the money from equity to Post Office or debt funds so a market fall does not hurt' + (goalName ? ' ' + esc(goalName) : '') + '.');
    t.push('Protect the plan with a <b>term insurance</b> cover, so the goal is still funded if something happens to the earning member.');
    return { mixHtml, takeaways: t, sipMix, lumpMix, weights: w };
  };

  /* ---------------- Wizard ---------------- */
  NP.wizard = function (cfg) {
    const meta = NP.CALCS.find(c => c.id === cfg.id) || {};
    const storeKey = 'np:' + cfg.id;
    const defaults = JSON.parse(JSON.stringify(cfg.state));
    let s = JSON.parse(JSON.stringify(cfg.state));
    try { const saved = JSON.parse(localStorage.getItem(storeKey) || 'null'); if (saved && saved._v === cfg.version) s = Object.assign(s, saved); } catch (e) { /* storage unavailable */ }
    s._v = cfg.version;
    if (!s.inv) s.inv = NP.investDefaults();

    const steps = cfg.steps.concat([{ title: 'Your summary', nav: 'Summary', isSummary: true }]);
    let cur = 0, maxSeen = 0;
    const save = () => { try { localStorage.setItem(storeKey, JSON.stringify(s)); } catch (e) { /* ignore */ } };

    /* Page skeleton */
    const mount = document.getElementById('np-calc');
    mount.innerHTML =
      '<section class="calc-hero"><div class="container">' +
      '<div class="crumbs"><a href="' + NP.root + 'index.html">Home</a>' + icon('chevron-right') + '<a href="' + NP.root + 'index.html#calculators">Calculators</a>' + icon('chevron-right') + '<span>' + esc(meta.title) + '</span></div>' +
      '<h1><span class="hicon">' + icon(meta.icon) + '</span>' + esc(cfg.heading || meta.title + ' Calculator') + '</h1>' +
      '<p>' + esc(cfg.intro || meta.desc) + '</p></div></section>' +
      '<div class="container"><div class="wizard">' +
      '<aside class="wiz-rail"><div class="rail-title">' + steps.length + ' simple steps</div><ol class="wiz-steps"></ol>' +
      '<div class="rail-help"><strong>Need help with your plan?</strong>Talk to ' + esc(NP.config.advisor.name) + ' for a free consultation.<br><a href="' + NP.telHref() + '">' + esc(NP.config.contact.phone) + '</a>' +
      (NP.config.contact.whatsapp ? '<br><a href="' + esc(NP.waHref('Namaste Sanjay ji, I am using the ' + meta.title + ' calculator on Nivesh Plus and need help with my plan.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' Chat on WhatsApp</a>' : '') +
      '</div></aside>' +
      '<section class="wiz-card" aria-live="polite"><div class="wiz-progress"><div></div></div><div class="wiz-mobile-steps"></div><div class="wiz-body"></div>' +
      '<div class="wiz-error" role="alert"></div>' +
      '<div class="wiz-foot"><button class="btn btn-link" data-act="back">' + icon('arrow-left') + 'Back</button><span class="spacer"></span>' +
      '<button class="btn btn-ghost btn-sm" data-act="reset" title="Reset to defaults">' + icon('refresh') + 'Reset</button>' +
      '<button class="btn btn-primary" data-act="next">Continue' + icon('arrow-right') + '</button></div></section></div></div>';

    const railEl = mount.querySelector('.wiz-steps'), body = mount.querySelector('.wiz-body'), errEl = mount.querySelector('.wiz-error');
    const prog = mount.querySelector('.wiz-progress > div'), mob = mount.querySelector('.wiz-mobile-steps');
    const back = mount.querySelector('[data-act=back]'), next = mount.querySelector('[data-act=next]'), foot = mount.querySelector('.wiz-foot');

    function rail() {
      railEl.innerHTML = steps.map((st, i) =>
        '<li class="' + (i < cur ? 'done' : '') + (i === cur ? ' current' : '') + '"><button type="button" data-go="' + i + '"' + (i > maxSeen ? ' disabled' : '') + '>' +
        '<span class="dot">' + (i < cur ? icon('check') : i + 1) + '</span><span>' + esc(st.nav || st.title) + '</span></button></li>').join('');
      prog.style.width = ((cur + 1) / steps.length) * 100 + '%';
      mob.innerHTML = '<span>Step ' + (cur + 1) + ' of ' + steps.length + '</span><span>' + esc(steps[cur].nav || steps[cur].title) + '</span>';
    }

    function showError(msg) {
      errEl.innerHTML = msg ? icon('alert') + '<span>' + esc(msg) + '</span>' : '';
      errEl.classList.toggle('show', !!msg);
    }

    function render(focus, quiet) {
      const st = steps[cur];
      const anim = quiet ? '' : ' class="step-anim"';
      showError('');
      if (st.isSummary) {
        body.innerHTML = '<div' + anim + '>' + summaryHTML(false) + actionsHTML() + '</div>';
        foot.style.display = 'none';
      } else {
        const sub = typeof st.sub === 'function' ? st.sub(s) : st.sub;
        body.innerHTML = '<div' + anim + '><div class="wiz-stepno">Step ' + (cur + 1) + ' of ' + steps.length + '</div>' +
          '<h2>' + esc(typeof st.title === 'function' ? st.title(s) : st.title) + '</h2>' + (sub ? '<p class="wiz-sub">' + sub + '</p>' : '') +
          st.render(s) + '</div>';
        foot.style.display = '';
        back.style.visibility = cur === 0 ? 'hidden' : 'visible';
        next.innerHTML = (cur === steps.length - 2 ? 'See my summary' : 'Continue') + icon('arrow-right');
        if (st.live) st.live(s, body);
      }
      rail();
      NP.charts.bind(body);
      bindRanges();
      if (focus) {
        const top = mount.querySelector('.wizard').getBoundingClientRect().top + window.scrollY - 84;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
      }
    }

    function bindRanges() {
      body.querySelectorAll('input[type=range]').forEach(r => {
        const p = ((r.value - r.min) / (r.max - r.min)) * 100;
        r.style.setProperty('--p', p + '%');
      });
    }

    function go(i) {
      if (i > cur) {
        for (let k = cur; k < i; k++) {
          const v = steps[k].validate && steps[k].validate(s);
          if (v) { cur = k; render(); showError(v); return; }
        }
      }
      cur = Math.max(0, Math.min(steps.length - 1, i));
      maxSeen = Math.max(maxSeen, cur);
      render(true);
      save();
    }

    function refreshLive() {
      const st = steps[cur];
      if (st.live) st.live(s, body);
      NP.charts.bind(body);
      save();
    }

    /* Generic input binding */
    body.addEventListener('input', e => {
      const t = e.target;
      if (t.dataset.k) {
        const k = t.dataset.k;
        let v;
        if (t.dataset.type === 'money') {
          const n = NP.parseNum(t.value);
          v = n;
          const pos = t.value.length - t.selectionStart;
          t.value = t.value.trim() === '' ? '' : fmt.num(n);
          try { const np = Math.max(0, t.value.length - pos); t.setSelectionRange(np, np); } catch (er) { /* ignore */ }
          const w = body.querySelector('[data-words="' + k + '"]'); if (w) w.textContent = fmt.words(n);
        } else if (t.dataset.type === 'num') {
          v = t.value === '' ? '' : parseFloat(t.value);
          body.querySelectorAll('[data-k="' + k + '"]').forEach(o => { if (o !== t) o.value = t.value; });
        } else v = t.value;
        s[k] = v;
        bindRanges();
        const st = steps[cur];
        if (t.dataset.rerender) { if (st.onChange) st.onChange(s, k); save(); render(false, true); const f = body.querySelector('#' + CSS.escape(t.id)); if (f) f.focus(); return; }
        if (st.onChange) st.onChange(s, k, body);
        showError('');
        refreshLive();
      } else if (t.dataset.item) {
        const n = NP.parseNum(t.value);
        t.value = fmt.num(n);
        s[t.dataset.item] = s[t.dataset.item] || {};
        s[t.dataset.item][t.dataset.ik] = n;
        const tot = NP.itemsTotal(s[t.dataset.item]);
        const a = body.querySelector('[data-items-total="' + t.dataset.item + '"]'); if (a) a.textContent = fmt.inr(tot);
        const b = body.querySelector('[data-items-words="' + t.dataset.item + '"]'); if (b) b.textContent = fmt.words(tot);
        refreshLive();
      } else if (t.dataset.invCustom) {
        s.inv[t.dataset.invCustom] = parseFloat(t.value) || 0;
        refreshLive();
      } else if (t.id === 'np-client') {
        s._client = t.value; save();
      }
    });
    body.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.invSel) {
        const k = t.dataset.invSel, card = t.closest('.inv-card');
        s.inv[k + 'Sel'] = t.value;
        if (t.value === 'custom') { card.classList.add('is-custom'); const c = card.querySelector('[data-inv-custom]'); c.focus(); s.inv[k] = parseFloat(c.value) || 0; }
        else { card.classList.remove('is-custom'); s.inv[k] = parseFloat(t.value); card.querySelector('[data-inv-custom]').value = t.value; }
        refreshLive();
      } else if (t.tagName === 'SELECT' && t.dataset.k && !t.dataset.rerender) {
        /* handled by input */
      }
    });
    body.addEventListener('focusin', e => { if (e.target.dataset && (e.target.dataset.type === 'money' || e.target.dataset.item)) setTimeout(() => e.target.select(), 0); });
    body.addEventListener('click', e => {
      const c = e.target.closest('[data-choice]');
      if (c) {
        const k = c.dataset.choice;
        s[k] = c.dataset.v;
        const st = steps[cur];
        if (st.onChange) st.onChange(s, k);
        render(false, true);
        const again = body.querySelector('[data-choice="' + k + '"][data-v="' + CSS.escape(c.dataset.v) + '"]');
        if (again) again.focus();
        save();
        return;
      }
      const a = e.target.closest('[data-sum]');
      if (a) {
        if (a.dataset.sum === 'pdf') printReport();
        if (a.dataset.sum === 'edit') go(0);
        if (a.dataset.sum === 'restart') { reset(); }
      }
    });
    railEl.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && !b.disabled) go(+b.dataset.go); });
    next.addEventListener('click', () => go(cur + 1));
    back.addEventListener('click', () => go(cur - 1));
    mount.querySelector('[data-act=reset]').addEventListener('click', reset);
    function reset() {
      s = JSON.parse(JSON.stringify(defaults)); s._v = cfg.version; s.inv = NP.investDefaults();
      if (cfg.onReset) cfg.onReset(s);
      cur = 0; maxSeen = 0; save(); render(true);
    }

    /* ---------------- Summary ---------------- */
    function summaryHTML(forPrint) {
      const r = cfg.compute(s), sm = cfg.summary(s, r, forPrint);
      let h = '';
      if (!forPrint) h += '<div class="wiz-stepno">Step ' + steps.length + ' of ' + steps.length + '</div><h2 style="margin-bottom:16px">' + esc(sm.title || 'Your plan at a glance') + '</h2>';
      h += '<div class="sum-hero"><div><div class="sl">' + esc(sm.headline.label) + '</div><div class="sv">' + sm.headline.value + '</div><div class="sn">' + sm.headline.note + '</div></div>' +
        '<div class="sbadge">' + icon(sm.headline.icon || meta.icon) + '</div></div>';
      if (sm.tiles) h += '<div class="tiles">' + sm.tiles.map(t => '<div class="tile"><div class="kl">' + esc(t[0]) + '</div><div class="kv">' + t[1] + '</div>' + (t[2] ? '<div class="ks">' + t[2] + '</div>' : '') + '</div>').join('') + '</div>';
      (sm.sections || []).filter(Boolean).forEach(sec => {
        if (forPrint && sec.screenOnly) return;
        h += '<div class="sum-sec' + (sec.allowBreak ? ' allow-break' : '') + '"><h3>' + icon(sec.icon || 'file-text') + esc(sec.title) + '</h3>' + sec.html + '</div>';
      });
      if (sm.takeaways && sm.takeaways.length) h += '<div class="sum-sec"><h3>' + icon('sparkles') + 'Advisor’s recommendations</h3><ul class="takeaways">' + sm.takeaways.map(t => '<li>' + icon('check-circle') + '<span>' + t + '</span></li>').join('') + '</ul></div>';
      return h;
    }
    function actionsHTML() {
      return '<div class="sum-actions">' +
        '<div class="field"><label for="np-client">Prepared for (name on the PDF)</label><div class="input-wrap"><input id="np-client" placeholder="e.g. Mr. & Mrs. Sharma" value="' + esc(s._client || '') + '" maxlength="60"></div></div>' +
        '<button class="btn btn-primary btn-lg" data-sum="pdf">' + icon('download') + 'Download PDF report</button>' +
        '<button class="btn btn-ghost" data-sum="edit">' + icon('edit') + 'Edit inputs</button>' +
        '<button class="btn btn-link" data-sum="restart">' + icon('refresh') + 'Start over</button>' +
        '<div class="hint">In the print window choose <b>“Save as PDF”</b> as the destination. The report uses a fixed A4 template with ' + esc(NP.config.company) + ' branding.</div></div>' +
        '<div style="margin-top:18px">' + NP.h.note('Want a personalised plan? Call or WhatsApp <b>' + esc(NP.config.advisor.name) + '</b> at <b>' + esc(NP.config.contact.phone) + '</b> or email <b>' + esc(NP.config.contact.email) + '</b>.' +
          (NP.config.contact.whatsapp ? '<div style="margin-top:10px"><a class="btn btn-wa btn-sm" href="' + esc(NP.waHref('Namaste Sanjay ji, I have completed the ' + meta.title + ' calculator on Nivesh Plus' + ((s._client || '').trim() ? ' (name: ' + s._client.trim() + ')' : '') + '. Please help me with a personalised plan.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'Discuss this plan on WhatsApp</a></div>' : ''), '', 'phone') + '</div>';
    }

    /* ---------------- PDF (print) report ---------------- */
    function buildReport() {
      const C = NP.config, a = C.advisor, c = C.contact;
      let rep = document.getElementById('np-report');
      if (!rep) { rep = document.createElement('div'); rep.id = 'np-report'; document.body.appendChild(rep); }
      const ref = 'NP-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
      const client = (s._client || '').trim();
      rep.innerHTML = '<div class="rpt">' +
        '<div class="rpt-head">' + NP.logo() + '<div class="rb"><div class="n">Nivesh<span> Plus</span></div><div class="t">' + esc(C.tagline) + '</div></div>' +
        '<div class="ra"><div><div class="an">' + esc(a.name) + '</div><div class="ar">' + esc(a.title) + '</div><div class="ac">' + (c.whatsapp ? 'Call / WhatsApp: ' : '') + esc(c.phone) + ' · ' + esc(c.email) + '</div></div>' +
        '<img src="' + NP.photoSrc() + '" alt=""></div></div>' +
        '<div class="rpt-title"><div><h1>' + esc(meta.title) + ' Report</h1><div class="rs">' + esc(meta.desc) + '</div></div>' +
        '<div class="rm">Prepared for: <b>' + esc(client || '______________________') + '</b><br>Date: <b>' + fmt.date() + '</b><br>Ref: <b>' + ref + '</b></div></div>' +
        summaryHTML(true) +
        '<div class="rpt-sign"><div style="color:var(--ink-2);max-width:60%">' + icon('map-pin') + ' ' + esc(c.address) + '</div><div class="line">' + esc(a.name) + '<br><span style="font-size:8pt">' + esc(a.title) + ', ' + esc(C.company) + '</span></div></div>' +
        '<div class="rpt-disclaimer"><b>Disclaimer:</b> This report is an illustration based on the assumptions entered and is not a guarantee of future returns or costs. Inflation, interest rates and market returns change over time. Mutual fund investments are subject to market risks; read all scheme-related documents carefully. Insurance is the subject matter of solicitation. Post Office small savings rates are notified by the Government of India every quarter. Please review your plan with your advisor at least once a year.</div>' +
        '</div>';
      let ps = document.getElementById('np-page-style');
      if (!ps) { ps = document.createElement('style'); ps.id = 'np-page-style'; document.head.appendChild(ps); }
      const q = v => '"' + String(v || '').replace(/["\\\n]/g, ' ') + '"';
      ps.textContent = '@page { @bottom-left { content: ' + q(C.company + ' · ' + a.name + ', ' + a.title + ' · ' + c.phone + ' · ' + c.email + (c.website ? ' · ' + c.website : '')) + '; font: 7.5pt Inter, sans-serif; color: #667085; } ' +
        '@bottom-right { content: "Page " counter(page) " of " counter(pages); font: 7.5pt Inter, sans-serif; color: #667085; } }';
      return { rep, fileTitle: 'Nivesh-Plus_' + meta.title.replace(/[^A-Za-z0-9]+/g, '-') + (client ? '_' + client.replace(/[^A-Za-z0-9]+/g, '-') : '') + '_' + new Date().toISOString().slice(0, 10) };
    }
    /* Any print (button or Ctrl+P) produces the branded report. */
    let pageTitle = document.title, preparing = false;
    function beforePrint() {
      if (preparing) return;
      const b = buildReport();
      pageTitle = document.title; document.title = b.fileTitle;
      document.body.classList.add('printing');
    }
    function afterPrint() { preparing = false; document.body.classList.remove('printing'); document.title = pageTitle; }
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    function printReport() {
      beforePrint(); preparing = true;
      const img = document.querySelector('#np-report img');
      const fire = () => setTimeout(() => window.print(), 80);
      if (img && !img.complete) { img.onload = img.onerror = fire; } else fire();
    }

    NP.currentWizard = { state: () => s, go, printReport, summaryHTML };
    render();
  };
})();
