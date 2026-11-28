/* Extra EMI vs SIP — pay x% more EMI to close the loan early, or put y% of the EMI in a SIP */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, fin = NP.fin;

  const LOANS = {
    home: { t: 'Home loan', d: 'Typical rate 8.25% – 9.5%', icon: 'home', amt: 10000000, rate: 8, yrs: 15 },
    car: { t: 'Car loan', d: 'Typical rate 8.75% – 11%', icon: 'car', amt: 800000, rate: 9.25, yrs: 5 },
    edu: { t: 'Education loan', d: 'Typical rate 8.5% – 12%', icon: 'graduation-cap', amt: 2000000, rate: 10, yrs: 10 },
    lap: { t: 'Loan against property', d: 'Typical rate 9.25% – 12%', icon: 'building', amt: 3000000, rate: 10, yrs: 15 },
    personal: { t: 'Personal loan', d: 'Typical rate 10.5% – 18%', icon: 'wallet', amt: 500000, rate: 12.5, yrs: 4 },
    business: { t: 'Business loan', d: 'Typical rate 11% – 20%', icon: 'briefcase', amt: 1000000, rate: 14, yrs: 5 }
  };
  const PCTS = [5, 10, 15, 20, 25, 50];
  const RATE_OPTS = NP.INVEST.flatMap(x => x.rates.map(r => [r[0], x.name + ' · ' + r[1]]));
  const months = s => Math.round((+s.years || 0) * 12);

  function base(s) {
    const P = +s.amount || 0, r = +s.rate || 0, n = months(s);
    return Object.assign(fin.amort(P, r, n), { P, r, n });
  }
  /* Pay pct% of the EMI extra every month */
  function prepay(b, pct) {
    const extra = b.emi * (+pct || 0) / 100;
    const a = extra > 0 ? fin.amort(b.P, b.r, b.n, { extraMonthly: extra }) : b;
    return { pct: +pct || 0, extra, pay: b.emi + extra, a, months: a.months, saved: b.totalInterest - a.totalInterest, early: b.n - a.months };
  }
  /* Invest pct% of the EMI every month for the full loan tenure */
  function sip(b, pct, R) {
    const amt = b.emi * (+pct || 0) / 100, value = fin.sipFV(amt, R, b.n / 12), invested = amt * b.n, gain = value - invested;
    return { pct: +pct || 0, amt, value, invested, gain, ofInterest: b.totalInterest ? gain / b.totalInterest * 100 : 0, valueOfInterest: b.totalInterest ? value / b.totalInterest * 100 : 0 };
  }
  /* Same monthly amount A: prepay the loan (then invest EMI + A once it closes) vs SIP A for the full tenure */
  function compare(b, A, R) {
    const p = fin.amort(b.P, b.r, b.n, { extraMonthly: A });
    const left = Math.max(0, b.n - p.months);
    const wealthPrepay = left ? fin.sipFV(b.emi + A, R, left / 12) : 0;
    const wealthSip = fin.sipFV(A, R, b.n / 12);
    return { A, p, left, wealthPrepay, wealthSip, interestPrepay: p.totalInterest, interestSip: b.totalInterest };
  }

  NP.wizard({
    id: 'extra-emi-sip', version: 1,
    heading: 'Extra EMI vs SIP Calculator',
    intro: 'Pay a little more than your EMI and see how early the loan closes. Or invest a part of the EMI in a SIP and see how much of the loan interest comes back. Then compare which is better for you.',
    state: { type: 'home', amount: 10000000, rate: 8, years: 15, extraPct: 10, sipPct: 10, sipRate: 12 },
    steps: [
      {
        title: 'Which loan do you have?', nav: 'Loan type',
        sub: 'We fill in typical values for each loan type. You can change them in the next step.',
        render: s => F.choices({ k: 'type', value: s.type, options: Object.keys(LOANS).map(k => ({ v: k, t: LOANS[k].t, d: LOANS[k].d, icon: LOANS[k].icon })) }),
        onChange: (s, k) => { if (k === 'type') { const l = LOANS[s.type]; s.amount = l.amt; s.rate = l.rate; s.years = l.yrs; } }
      },
      {
        title: 'Loan amount, rate and tenure', nav: 'Loan details',
        render: s => F.grid(
          F.money({ k: 'amount', label: 'Loan amount', value: s.amount, full: true }),
          F.number({ k: 'rate', label: 'Interest rate', value: s.rate, min: 1, max: 30, step: 0.05, range: true, suffix: '% p.a.', minLabel: '1%', maxLabel: '30%' }),
          F.number({ k: 'years', label: 'Tenure', value: s.years, min: 1, max: 30, step: 0.5, range: true, suffix: 'years', minLabel: '1 yr', maxLabel: '30 yrs' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const b = base(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Monthly EMI', fmt.inr(b.emi), '', true) + F.kpi('Total interest', fmt.short(b.totalInterest), fmt.inr(b.totalInterest)) + F.kpi('Loan ends', String(fmt.yearFromNow(b.n / 12)), fmt.months(b.n)) + '</div>');
        },
        validate: s => (!(+s.amount > 0) ? 'Please enter the loan amount.' : !(+s.rate > 0) ? 'Please enter the interest rate.' : !(months(s) >= 12) ? 'Please enter a tenure of at least 1 year.' : '')
      },
      {
        title: 'Pay more than your EMI', nav: 'Extra EMI',
        sub: 'Every extra rupee goes straight to the principal, so the loan closes earlier and you pay less interest.',
        render: s => F.grid(
          F.number({ k: 'extraPct', label: 'Extra on top of EMI', value: s.extraPct, min: 0, max: 100, step: 1, range: true, suffix: '% of EMI', minLabel: '0%', maxLabel: '100%', full: true, hint: 'Ask your bank to apply part-payments to the principal and to reduce the tenure, not the EMI.' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const b = base(s), p = prepay(b, s.extraPct);
          NP.live(el, '<div class="live-grid">' + F.kpi('New monthly payment', fmt.inr(p.pay), 'EMI ' + fmt.inr(b.emi) + ' + ' + fmt.inr(p.extra)) +
            F.kpi('Loan closes in', fmt.months(p.months), p.early ? fmt.months(p.early) + ' early (' + fmt.yearFromNow(p.months / 12) + ')' : 'No change', true) +
            F.kpi('Interest saved', fmt.short(p.saved), 'Interest now ' + fmt.short(p.a.totalInterest)) + '</div>');
        }
      },
      {
        title: 'Put part of your EMI in a SIP', nav: 'SIP',
        sub: 'Invest a share of the EMI every month for the full loan tenure, and see how much of the loan interest comes back.',
        render: s => F.grid(
          F.number({ k: 'sipPct', label: 'Monthly SIP', value: s.sipPct, min: 0, max: 100, step: 1, range: true, suffix: '% of EMI', minLabel: '0%', maxLabel: '100%' }),
          F.select({ k: 'sipRate', label: 'Expected return', value: s.sipRate, numeric: true, options: RATE_OPTS, hint: 'Equity mutual funds suit periods of 5 years or more' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const b = base(s), c = sip(b, s.sipPct, +s.sipRate);
          NP.live(el, '<div class="live-grid">' + F.kpi('SIP per month', fmt.inr(c.amt), 'For ' + fmt.months(b.n)) +
            F.kpi('Value at loan end', fmt.short(c.value), 'Invested ' + fmt.short(c.invested)) +
            F.kpi('Interest returned', fmt.pct(c.ofInterest, 0), 'Gain ' + fmt.short(c.gain) + ' of ' + fmt.short(b.totalInterest) + ' interest', true) + '</div>');
        }
      }
    ],
    compute: s => base(s),
    summary(s, b) {
      const R = +s.sipRate, Y = b.n / 12, p = prepay(b, s.extraPct), c = sip(b, s.sipPct, R);
      const A = p.extra > 0 ? p.extra : c.amt, cmp = A > 0 ? compare(b, A, R) : null;
      const pcts = PCTS.slice(); [+s.extraPct, +s.sipPct].forEach(v => { if (v > 0 && !pcts.includes(v)) pcts.push(v); }); pcts.sort((x, y) => x - y);

      const prepayTable = NP.h.table(['Extra', 'Extra / month', 'Monthly payment', 'Loan closes in', 'Closes early by', 'Interest saved'],
        pcts.map(v => { const q = prepay(b, v); return { cells: [fmt.pct(v, 0), fmt.inr(q.extra), fmt.inr(q.pay), fmt.months(q.months) + ' (' + fmt.yearFromNow(q.months / 12) + ')', fmt.months(q.early), fmt.inr(q.saved)], hl: v === +s.extraPct }; }));
      const sipTable = NP.h.table(['SIP', 'SIP / month', 'Total invested', 'Value at loan end', 'Gain', 'Interest returned'],
        pcts.map(v => { const q = sip(b, v, R); return { cells: [fmt.pct(v, 0) + ' of EMI', fmt.inr(q.amt), fmt.inr(q.invested), fmt.inr(q.value), fmt.inr(q.gain), fmt.pct(q.ofInterest, 0)], hl: v === +s.sipPct }; }));

      /* Charts */
      const N = Math.ceil(b.n / 12), lab = [], bal1 = [], bal2 = [], cumI = [], gain = [];
      let acc = 0;
      for (let k = 0; k <= N; k++) {
        lab.push(String(fmt.yearFromNow(k)));
        bal1.push(k === 0 ? b.P : (b.rows[k - 1] || { balance: 0 }).balance);
        bal2.push(k === 0 ? b.P : (p.a.rows[k - 1] || { balance: 0 }).balance);
        if (k) acc += (b.rows[k - 1] || { interest: 0 }).interest;
        cumI.push(acc);
        const kk = Math.min(k, Y);
        gain.push(Math.max(0, fin.sipFV(c.amt, R, kk) - c.amt * Math.round(kk * 12)));
      }
      const balChart = NP.charts.line({ labels: lab, series: [{ name: 'Balance: EMI only', color: 'var(--series-1)', values: bal1, area: true }, { name: 'Balance: EMI + ' + fmt.pct(p.pct, 0), color: 'var(--series-2)', values: bal2 }], aria: 'Loan balance with and without extra EMI' });
      const sipChart = NP.charts.line({ labels: lab, series: [{ name: 'Loan interest paid (cumulative)', color: 'var(--series-2)', values: cumI, area: true }, { name: 'SIP gain (value − invested)', color: 'var(--series-1)', values: gain }], aria: 'Loan interest paid versus SIP gain' });

      let cmpHtml = '', verdict = '';
      if (cmp) {
        const endY = fmt.yearFromNow(Y), diff = cmp.wealthSip - cmp.wealthPrepay, sipWins = diff > 0;
        cmpHtml = NP.h.table(['Same ' + fmt.inr(A) + ' a month…', 'Into the loan (prepay)', 'Into a SIP @ ' + fmt.pct(R)], [
          ['Monthly outgo', fmt.inr(b.emi + A), fmt.inr(b.emi + A)],
          ['Loan closes', fmt.months(cmp.p.months) + ' (' + fmt.yearFromNow(cmp.p.months / 12) + ')', fmt.months(b.n) + ' (' + endY + ')'],
          ['Interest paid to the bank', fmt.inr(cmp.interestPrepay), fmt.inr(cmp.interestSip)],
          ['What happens after the loan closes', cmp.left ? 'EMI + extra (' + fmt.inr(b.emi + A) + ') goes into a SIP for ' + fmt.months(cmp.left) : '—', '—'],
          { cells: ['<b>Investment value in ' + endY + '</b>', '<b>' + fmt.inr(cmp.wealthPrepay) + '</b>', '<b>' + fmt.inr(cmp.wealthSip) + '</b>'], hl: true }
        ]);
        verdict = sipWins
          ? 'At ' + fmt.pct(R) + ' return vs ' + fmt.pct(b.r, 2) + ' loan rate, the <b>SIP route leaves you ' + fmt.short(diff) + ' richer</b> by ' + endY + ' (before tax). Prepaying is the safer, guaranteed choice; the SIP carries market risk.'
          : 'At ' + fmt.pct(R) + ' return vs ' + fmt.pct(b.r, 2) + ' loan rate, <b>prepaying leaves you ' + fmt.short(-diff) + ' richer</b> by ' + endY + '. Prepaying the loan is the better and risk-free choice here.';
      }

      return {
        title: 'Extra EMI vs SIP: your plan',
        headline: {
          label: 'Pay ' + fmt.pct(p.pct, 0) + ' extra EMI: loan closes in',
          value: fmt.months(p.months),
          note: p.early ? '<b>' + fmt.months(p.early) + ' early</b>, in ' + fmt.yearFromNow(p.months / 12) + ', saving <b>' + fmt.short(p.saved) + '</b> interest. Or a SIP of ' + fmt.pct(c.pct, 0) + ' of the EMI (' + fmt.inr(c.amt) + '/month) grows to <b>' + fmt.short(c.value) + '</b> and returns <b>' + fmt.pct(c.ofInterest, 0) + '</b> of the loan interest.' : 'With no extra payment the loan runs its full tenure. A SIP of ' + fmt.inr(c.amt) + '/month grows to <b>' + fmt.short(c.value) + '</b> and returns <b>' + fmt.pct(c.ofInterest, 0) + '</b> of the loan interest.',
          icon: 'zap'
        },
        tiles: [
          ['Interest saved', fmt.short(p.saved), 'Paying ' + fmt.inr(p.extra) + ' extra/month'],
          ['Loan closes early by', fmt.months(p.early), 'Instead of ' + fmt.yearFromNow(Y)],
          ['SIP value at loan end', fmt.short(c.value), fmt.inr(c.amt) + '/month @ ' + fmt.pct(R)],
          ['Loan interest returned', fmt.pct(c.ofInterest, 0), 'SIP gain ' + fmt.short(c.gain)]
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([
            ['Loan type', LOANS[s.type].t], ['Loan amount', fmt.inr(b.P)], ['Interest rate', fmt.pct(b.r, 2) + ' p.a.'], ['Tenure', fmt.months(b.n)],
            ['EMI', fmt.inr(b.emi)], ['Total interest (EMI only)', fmt.inr(b.totalInterest)],
            ['Extra on top of EMI', fmt.pct(p.pct, 0) + ' (' + fmt.inr(p.extra) + '/month)'], ['SIP', fmt.pct(c.pct, 0) + ' of EMI (' + fmt.inr(c.amt) + '/month) @ ' + fmt.pct(R)]
          ]) },
          { title: 'Extra EMI: when will the loan close?', icon: 'calendar', html: prepayTable + '<div style="height:14px"></div>' + balChart },
          { title: 'SIP: how much interest comes back?', icon: 'trending-up', html: sipTable + '<div style="height:10px"></div>' +
            NP.h.note('“Interest returned” is the SIP <b>gain</b> (value minus money invested) as a share of the ' + fmt.short(b.totalInterest) + ' loan interest. 100% means the loan is effectively interest-free.') +
            '<div style="height:14px"></div>' + sipChart },
          cmp ? { title: 'Prepay or invest? Same money, two routes', icon: 'scale', html: cmpHtml + '<div style="height:10px"></div>' + NP.h.note(verdict, diffKind(cmp)) } : null
        ],
        takeaways: [
          p.pct > 0 ? 'Paying just <b>' + fmt.inr(p.extra) + ' more each month</b> closes the loan ' + fmt.months(p.early) + ' early and saves ' + fmt.short(p.saved) + '. Even ' + fmt.pct(5, 0) + ' extra saves ' + fmt.short(prepay(b, 5).saved) + '.' : 'Even 5% extra on the EMI (' + fmt.inr(b.emi * 0.05) + ') would close the loan ' + fmt.months(prepay(b, 5).early) + ' early and save ' + fmt.short(prepay(b, 5).saved) + '.',
          c.ofInterest >= 100 ? 'Your SIP of ' + fmt.inr(c.amt) + ' returns more than the full loan interest. Your loan is effectively <b>interest-free</b>.' : 'To get back 100% of the interest, use the <a href="loan-interest-recovery.html">Loan Interest Recovery calculator</a> to find the exact SIP needed.',
          'A good balance for many families: prepay a little to cut the tenure, and run a SIP for growth. Increase both by 10% whenever your salary goes up.',
          'Keep 6 months of EMIs as an emergency fund before prepaying, and keep the SIP running in market falls.',
          'Gains are taxable: equity mutual fund LTCG is taxed at 12.5% above ₹1.25 lakh a year. Prepayment savings are tax-free and guaranteed.' + (s.type === 'home' ? ' Prepaying a home loan may reduce the Sec 24b interest deduction (old regime).' : '')
        ]
      };
    }
  });
  function diffKind(c) { return c.wealthSip > c.wealthPrepay ? 'good' : ''; }
})();
