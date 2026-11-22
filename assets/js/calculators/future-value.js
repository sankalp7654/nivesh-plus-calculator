/* Future Value calculator — lump sum, SIP or both, with inflation */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt;

  function calc(s, rate) {
    const r = rate != null ? rate : +s.rate || 0, n = +s.years || 0, inf = +s.inf || 0;
    const L = s.mode !== 'sip' ? +s.lump || 0 : 0, M = s.mode !== 'lump' ? +s.sip || 0 : 0, step = +s.step || 0;
    const fv = NP.fin.fv(L, r, n) + NP.fin.sipFV(M, r, n, step);
    const invested = L + NP.fin.sipInvested(M, n, step);
    const real = NP.fin.pv(fv, inf, n);
    return { r, n, L, M, fv, invested, gain: fv - invested, real, realRate: NP.fin.real(r, inf) };
  }

  NP.wizard({
    id: 'future-value', version: 1,
    heading: 'Future Value Calculator',
    intro: 'See what your one-time investment or monthly SIP grows into, and what that amount is really worth after inflation.',
    state: { mode: 'both', lump: 500000, sip: 10000, step: 0, years: 15, rate: 12, rateSel: '12', inf: 6 },
    steps: [
      {
        title: 'How will you invest?', nav: 'Investment type',
        render: s => F.choices({ k: 'mode', value: s.mode, options: [
          { v: 'lump', t: 'One-time (lump sum)', d: 'Invest a fixed amount once', icon: 'wallet' },
          { v: 'sip', t: 'Monthly SIP', d: 'Invest a fixed amount every month', icon: 'calendar' },
          { v: 'both', t: 'Both', d: 'A lump sum now plus a monthly SIP', icon: 'layers' }
        ] }) + F.space(18) + F.grid(
          s.mode !== 'sip' ? F.money({ k: 'lump', label: 'One-time investment', value: s.lump }) : '',
          s.mode !== 'lump' ? F.money({ k: 'sip', label: 'Monthly SIP', value: s.sip }) : '',
          s.mode !== 'lump' ? F.number({ k: 'step', label: 'Increase SIP every year by (optional)', value: s.step, min: 0, max: 25, suffix: '% / year', hint: 'Step-up SIP: raise your SIP as your salary grows' }) : ''
        ),
        validate: s => ((s.mode !== 'sip' && !(+s.lump > 0)) && (s.mode !== 'lump' && !(+s.sip > 0)) ? 'Please enter an amount to invest.' : (s.mode === 'lump' && !(+s.lump > 0)) ? 'Please enter the one-time amount.' : (s.mode === 'sip' && !(+s.sip > 0)) ? 'Please enter the monthly SIP.' : '')
      },
      {
        title: 'For how long, and at what return?', nav: 'Time & return',
        render: s => F.grid(
          F.number({ k: 'years', label: 'Investment period', value: s.years, min: 1, max: 40, range: true, suffix: 'years', minLabel: '1 yr', maxLabel: '40 yrs' }),
          F.select({ k: 'rateSel', label: 'Expected return', value: s.rateSel, rerender: true, options: [].concat(...NP.INVEST.map(x => x.rates.map(r => [r[0], x.name + ': ' + r[1]]))).concat([['custom', 'Custom rate…']]) }),
          s.rateSel === 'custom' ? F.number({ k: 'rate', label: 'Custom return', value: s.rate, min: 0, max: 30, step: 0.1, suffix: '% p.a.' }) : ''
        ) + F.space(16) + F.live(''),
        onChange: (s, k) => { if (k === 'rateSel' && s.rateSel !== 'custom') s.rate = parseFloat(s.rateSel); },
        live(s, el) { const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('You invest', fmt.short(r.invested)) + F.kpi('Returns earned', fmt.short(r.gain)) + F.kpi('Future value', fmt.short(r.fv), fmt.inr(r.fv), true) + '</div>'); },
        validate: s => (!(+s.years >= 1) ? 'Please enter the investment period.' : '')
      },
      {
        title: 'What is it worth after inflation?', nav: 'Inflation',
        sub: 'Prices rise every year, so the same amount of money buys less in the future. This shows the real value of your future amount.',
        render: s => F.grid(F.number({ k: 'inf', label: 'Expected inflation', value: s.inf, min: 0, max: 15, step: 0.5, range: true, suffix: '% p.a.', minLabel: '0%', maxLabel: '15%' })) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('Future value', fmt.short(r.fv), 'In ' + fmt.yearFromNow(r.n)) + F.kpi('Worth in today’s money', fmt.short(r.real), 'Buying power', true) + F.kpi('Real return', (r.realRate >= 0 ? '+' : '') + fmt.pctFixed(r.realRate, 2), 'After ' + fmt.pct(s.inf) + ' inflation') + '</div>'); }
      }
    ],
    compute: s => calc(s),
    summary(s, r) {
      const lab = [], inv = [], val = [];
      for (let k = 0; k <= r.n; k++) {
        lab.push(String(fmt.yearFromNow(k)));
        const c = calc(Object.assign({}, s, { years: k }));
        inv.push(c.invested); val.push(c.fv);
      }
      const cmp = NP.INVEST.map(x => ({ x, r: s.inv[x.key], c: calc(s, s.inv[x.key]) }));
      const rows = []; for (let k = 1; k <= r.n; k++) if (k % Math.max(1, Math.ceil(r.n / 10)) === 0 || k === r.n) { const c = calc(Object.assign({}, s, { years: k })); rows.push([String(k), String(fmt.yearFromNow(k)), fmt.inr(c.invested), fmt.inr(c.gain), fmt.inr(c.fv), fmt.inr(c.real)]); }
      return {
        title: 'Your investment growth',
        headline: { label: 'Future value in ' + fmt.yearFromNow(r.n), value: fmt.inr(r.fv), note: 'You invest ' + fmt.short(r.invested) + ' and earn ' + fmt.short(r.gain) + ' at ' + fmt.pct(r.r) + ' a year. In today’s money that is worth <b>' + fmt.short(r.real) + '</b>.', icon: 'trending-up' },
        tiles: [
          ['Total invested', fmt.short(r.invested), r.L && r.M ? fmt.short(r.L) + ' + ' + fmt.inr(r.M) + '/mo' : r.M ? fmt.inr(r.M) + '/month' : 'One-time'],
          ['Returns earned', fmt.short(r.gain), (r.fv / Math.max(1, r.invested)).toFixed(1) + '× your money'],
          ['Value in today’s money', fmt.short(r.real), 'At ' + fmt.pct(s.inf) + ' inflation'],
          ['Real return', (r.realRate >= 0 ? '+' : '') + fmt.pctFixed(r.realRate, 2), 'Per year, above inflation']
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([['One-time investment', fmt.inr(r.L)], ['Monthly SIP', fmt.inr(r.M) + (+s.step ? ' (+' + s.step + '% yearly)' : '')], ['Period', fmt.yrs(r.n)], ['Expected return', fmt.pct(r.r) + ' p.a.'], ['Inflation', fmt.pct(s.inf) + ' p.a.']]) },
          { title: 'Growth over time', icon: 'trending-up', html: NP.charts.line({ labels: lab, series: [{ name: 'Value', color: 'var(--series-1)', values: val, area: true }, { name: 'Amount invested', color: 'var(--series-2)', values: inv }], aria: 'Value vs amount invested' }) },
          { title: 'Year by year', icon: 'calendar', allowBreak: true, html: NP.h.table(['Year', 'Calendar', 'Invested', 'Returns', 'Value', 'In today’s money'], rows) },
          { title: 'Same investment in LIC, Post Office and mutual funds', icon: 'scale', html: NP.h.table(['Option', 'Return', 'Real return', 'Future value', 'In today’s money'], cmp.map(o => ['<b>' + o.x.name + '</b><span class="td-sub">' + o.x.product + '</span>', fmt.pct(o.r), (o.c.realRate >= 0 ? '+' : '') + fmt.pctFixed(o.c.realRate, 1), fmt.inr(o.c.fv), fmt.inr(o.c.real)])) }
        ],
        takeaways: [
          'Time is your biggest advantage: in the last ' + Math.min(5, r.n) + ' years alone, your money grows by ' + fmt.short(val[r.n] - val[Math.max(0, r.n - Math.min(5, r.n))]) + '. Stay invested.',
          r.realRate < 2 ? 'At ' + fmt.pct(r.r) + ' your money barely beats inflation. Consider adding equity funds for long-term goals.' : 'Your money grows ' + fmt.pctFixed(r.realRate, 1) + ' a year faster than prices. That is real wealth creation.',
          !r.M ? 'Add a monthly SIP alongside the lump sum. Even ' + fmt.inr(5000) + '/month would add ' + fmt.short(NP.fin.sipFV(5000, r.r, r.n)) + ' by ' + fmt.yearFromNow(r.n) + '.' : +s.step ? 'Your ' + s.step + '% yearly step-up adds significantly to the final amount. Keep raising the SIP with every increment.' : 'Add a <b>10% yearly step-up</b> to the SIP and the final value would be ' + fmt.short(calc(Object.assign({}, s, { step: 10 })).fv) + '.',
          'Review your portfolio once a year and rebalance between equity and debt as the goal comes closer.'
        ]
      };
    }
  });
})();
