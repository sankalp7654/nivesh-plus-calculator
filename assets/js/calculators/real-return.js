/* Real Return calculator — CAGR after inflation (and tax) */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt;

  const TAX = {
    none: ['No tax (PPF, SSY, EEE products)', 0, 0],
    eq: ['Equity mutual fund / shares (12.5% LTCG over ₹1.25 L)', 12.5, 125000],
    slab30: ['Taxed at 30% slab (FD, debt fund, NSC)', 30, 0],
    slab20: ['Taxed at 20% slab', 20, 0],
    slab5: ['Taxed at 5% slab', 5, 0]
  };
  const years = s => (+s.years || 0) + (+s.months || 0) / 12;
  function calc(s) {
    const n = years(s), P = +s.pv || 0, V = +s.fv || 0, inf = +s.inf || 0, t = TAX[s.tax];
    const gain = V - P, tax = Math.max(0, gain - t[2]) * t[1] / 100, net = V - tax;
    const cagr = NP.fin.cagr(P, V, n), post = NP.fin.cagr(P, net, n);
    const real = NP.fin.real(post, inf), realPre = NP.fin.real(cagr, inf);
    const absolute = P ? (gain / P) * 100 : 0;
    const realValue = NP.fin.pv(net, inf, n);
    return { n, P, V, gain, tax, net, cagr, post, real, realPre, absolute, realValue, realGain: realValue - P };
  }

  NP.wizard({
    id: 'real-return', version: 1,
    heading: 'Real Return Calculator',
    intro: 'You know what you invested, what you got back and how long it took. Find your true yearly return after inflation and tax.',
    state: { pv: 100000, fv: 200000, years: 8, months: 0, inf: 6, tax: 'none' },
    steps: [
      {
        title: 'What did you invest and receive?', nav: 'Amounts',
        sub: 'Use this for any past or proposed investment: an LIC maturity, FD, plot, gold or mutual fund.',
        render: s => F.grid(
          F.money({ k: 'pv', label: 'Amount invested (present value)', value: s.pv }),
          F.money({ k: 'fv', label: 'Amount received / maturity value', value: s.fv })
        ) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('Gain', fmt.short(r.gain)) + F.kpi('Absolute return', fmt.pct(r.absolute), (r.V / Math.max(1, r.P)).toFixed(2) + '× your money', true) + '</div>'); },
        validate: s => (!(+s.pv > 0) ? 'Please enter the amount invested.' : !(+s.fv > 0) ? 'Please enter the amount received.' : '')
      },
      {
        title: 'How long was the money invested?', nav: 'Time period',
        render: s => F.grid(
          F.number({ k: 'years', label: 'Years', value: s.years, min: 0, max: 50, range: true, suffix: 'years', minLabel: '0', maxLabel: '50' }),
          F.number({ k: 'months', label: 'Additional months', value: s.months, min: 0, max: 11, suffix: 'months' })
        ) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('Period', fmt.yrs(r.n)) + F.kpi('Yearly return (CAGR)', isNaN(r.cagr) ? '—' : fmt.pctFixed(r.cagr, 2), 'Compounded annual growth', true) + '</div>'); },
        validate: s => (!(years(s) > 0) ? 'Please enter the time period.' : '')
      },
      {
        title: 'Inflation and tax', nav: 'Inflation & tax',
        sub: 'Inflation and tax both eat into returns. Your real return is what is left.',
        render: s => F.grid(
          F.number({ k: 'inf', label: 'Average inflation during this period', value: s.inf, min: 0, max: 15, step: 0.5, range: true, suffix: '% p.a.', minLabel: '0%', maxLabel: '15%' }),
          F.select({ k: 'tax', label: 'Tax on the gain', value: s.tax, options: Object.keys(TAX).map(k => [k, TAX[k][0]]) })
        ) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('Return (CAGR)', fmt.pctFixed(r.cagr, 2)) + F.kpi('After tax', fmt.pctFixed(r.post, 2)) + F.kpi('Real return', (r.real >= 0 ? '+' : '') + fmt.pctFixed(r.real, 2), 'After inflation & tax', true) + '</div>'); }
      }
    ],
    compute: calc,
    summary(s, r) {
      const verdict = r.real >= 3 ? { cls: 'good', icon: 'check-circle', label: 'Wealth creating' } : r.real >= 0 ? { cls: 'warn', icon: 'alert', label: 'Barely beats inflation' } : { cls: 'bad', icon: 'x-circle', label: 'Losing buying power' };
      const cmp = NP.INVEST.map(x => { const rr = s.inv[x.key]; return [x.name + '<span class="td-sub">' + x.product + ' · ' + fmt.pct(rr) + '</span>', fmt.inr(NP.fin.fv(r.P, rr, r.n)), (NP.fin.real(rr, s.inf) >= 0 ? '+' : '') + fmt.pctFixed(NP.fin.real(rr, s.inf), 1)]; });
      return {
        title: 'Your real return',
        headline: { label: 'Real return per year (after inflation' + (r.tax ? ' & tax' : '') + ')', value: (r.real >= 0 ? '+' : '') + fmt.pctFixed(r.real, 2), note: 'Your money grew at ' + fmt.pctFixed(r.cagr, 2) + ' a year, but prices rose ' + fmt.pct(s.inf) + ' a year. Your ' + fmt.short(r.V) + ' is worth <b>' + fmt.short(r.realValue) + '</b> in today’s money.', icon: 'percent' },
        tiles: [
          ['Yearly return (CAGR)', fmt.pctFixed(r.cagr, 2), fmt.yrs(r.n)],
          ['Absolute return', fmt.pct(r.absolute), fmt.short(r.gain) + ' gain'],
          ['Tax on gain', fmt.inr(r.tax), 'Post-tax CAGR ' + fmt.pctFixed(r.post, 2)],
          ['Verdict', NP.status(verdict), 'Real gain ' + fmt.short(r.realGain)]
        ],
        sections: [
          { title: 'Calculation', icon: 'calculator', html: NP.h.kv([['Invested', fmt.inr(r.P)], ['Received', fmt.inr(r.V)], ['Period', fmt.yrs(r.n)], ['Gain', fmt.inr(r.gain)], ['Tax', fmt.inr(r.tax) + ' (' + TAX[s.tax][0].split(' (')[0] + ')'], ['Net received', fmt.inr(r.net)], ['Inflation', fmt.pct(s.inf) + ' p.a.'], ['Real value today', fmt.inr(r.realValue)]]) },
          { title: 'Where your return went', icon: 'bar-chart', html: NP.charts.hbars({ items: [
            { label: 'Return (CAGR)', value: Math.max(0, r.cagr), color: 'var(--series-1)' },
            { label: 'Lost to tax', value: Math.max(0, r.cagr - r.post), color: '#5598e7' },
            { label: 'Lost to inflation', value: Math.max(0, Math.min(r.post, r.post - r.real)), color: 'var(--series-2)' },
            { label: 'Real return', value: Math.max(0, r.real), color: '#0ca30c' }
          ], fmt: v => fmt.pctFixed(v, 2), tipLabel: '% per year' }) },
          { title: 'Same amount, same period, in other options', icon: 'scale', html: NP.h.table(['Option', 'Would have grown to', 'Real return'], cmp) }
        ],
        takeaways: [
          'Real return = (1 + return) ÷ (1 + inflation) − 1. It is the only return that tells you whether you are getting richer.',
          r.real < 0 ? 'This investment lost buying power. For long-term goals, move to options that beat inflation such as equity or hybrid mutual funds.' : r.real < 3 ? 'This investment is safe but slow. Keep it for stability, and use equity funds for long-term growth.' : 'This investment beat inflation comfortably. Keep it, and review the risk level every year.',
          'Prefer tax-efficient products: PPF, SSY and ELSS cut the tax drag on returns.',
          'Before signing an insurance-cum-investment plan, ask for the maturity value and use this calculator to check its real return.'
        ]
      };
    }
  });
})();
