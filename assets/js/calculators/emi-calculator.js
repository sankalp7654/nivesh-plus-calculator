/* EMI Calculator with prepayment */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt;

  const LOANS = {
    home: { t: 'Home loan', d: '8.25% – 9.5%', icon: 'home', amt: 5000000, rate: 8.5, yrs: 20 },
    car: { t: 'Car loan', d: '8.75% – 11%', icon: 'car', amt: 800000, rate: 9.25, yrs: 5 },
    personal: { t: 'Personal loan', d: '10.5% – 18%', icon: 'wallet', amt: 500000, rate: 12.5, yrs: 4 },
    edu: { t: 'Education loan', d: '8.5% – 12%', icon: 'graduation-cap', amt: 2000000, rate: 10, yrs: 10 },
    lap: { t: 'Loan against property', d: '9.25% – 12%', icon: 'building', amt: 3000000, rate: 10, yrs: 15 },
    bike: { t: 'Two-wheeler loan', d: '10% – 16%', icon: 'bike', amt: 150000, rate: 12, yrs: 3 },
    gold: { t: 'Gold loan', d: '9% – 15%', icon: 'coins', amt: 300000, rate: 10.5, yrs: 1 },
    business: { t: 'Business loan', d: '11% – 20%', icon: 'briefcase', amt: 1000000, rate: 14, yrs: 5 }
  };
  const months = s => Math.round((+s.years || 0) * 12);
  function calc(s, noPre) {
    const P = +s.amount || 0, r = +s.rate || 0, n = months(s);
    const base = NP.fin.amort(P, r, n);
    const pre = noPre ? base : NP.fin.amort(P, r, n, { yearlyAmt: s.preMode === 'yearly' ? +s.preAmt || 0 : 0, onceAmt: s.preMode === 'once' ? +s.preAmt || 0 : 0, onceMonth: (+s.preYear || 1) * 12, extraMonthly: s.preMode === 'monthly' ? +s.preAmt || 0 : 0 });
    return { P, r, n, base, pre, savedInterest: base.totalInterest - pre.totalInterest, savedMonths: base.months - pre.months };
  }

  NP.wizard({
    id: 'emi-calculator', version: 1,
    heading: 'EMI Calculator',
    intro: 'Calculate the EMI for any loan, see how much interest you will pay and how much you can save by prepaying.',
    state: { type: 'home', amount: 5000000, rate: 8.5, years: 20, fee: 0.5, preMode: 'none', preAmt: 100000, preYear: 3 },
    steps: [
      {
        title: 'Which loan are you taking?', nav: 'Loan type',
        sub: 'We fill in typical rates for each loan type. You can change them in the next step.',
        render: s => F.choices({ k: 'type', value: s.type, options: Object.keys(LOANS).map(k => ({ v: k, t: LOANS[k].t, d: 'Typical rate ' + LOANS[k].d, icon: LOANS[k].icon })) }),
        onChange: (s, k) => { if (k === 'type') { const l = LOANS[s.type]; s.amount = l.amt; s.rate = l.rate; s.years = l.yrs; } }
      },
      {
        title: 'Loan amount, rate and tenure', nav: 'Loan details',
        render: s => F.grid(
          F.money({ k: 'amount', label: 'Loan amount', value: s.amount, full: true }),
          F.number({ k: 'rate', label: 'Interest rate', value: s.rate, min: 1, max: 30, step: 0.05, range: true, suffix: '% p.a.', minLabel: '1%', maxLabel: '30%' }),
          F.number({ k: 'years', label: 'Tenure', value: s.years, min: 0.5, max: 30, step: 0.5, range: true, suffix: 'years', minLabel: '6 months', maxLabel: '30 yrs' }),
          F.number({ k: 'fee', label: 'Processing fee', value: s.fee, min: 0, max: 5, step: 0.05, suffix: '% of loan' })
        ) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s, true); NP.live(el, '<div class="live-grid">' + F.kpi('Monthly EMI', fmt.inr(r.base.emi), '', true) + F.kpi('Total interest', fmt.short(r.base.totalInterest)) + F.kpi('Total payment', fmt.short(r.base.totalPaid)) + '</div><div style="margin-top:14px">' + NP.charts.split({ parts: [{ label: 'Principal', value: r.P, color: 'var(--series-1)' }, { label: 'Interest', value: r.base.totalInterest, color: 'var(--series-2)' }] }) + '</div>'); },
        validate: s => (!(+s.amount > 0) ? 'Please enter the loan amount.' : !(+s.rate > 0) ? 'Please enter the interest rate.' : !(months(s) > 0) ? 'Please enter the tenure.' : '')
      },
      {
        title: 'Will you prepay the loan?', nav: 'Prepayment',
        sub: 'Even small prepayments cut years off a loan and save lakhs in interest.',
        render: s => F.choices({ k: 'preMode', value: s.preMode, options: [
          { v: 'none', t: 'No prepayment', d: 'Pay only the EMI', icon: 'calendar' },
          { v: 'yearly', t: 'Every year', d: 'e.g. part of your annual bonus', icon: 'refresh' },
          { v: 'monthly', t: 'Extra every month', d: 'Pay a little more than the EMI', icon: 'layers' },
          { v: 'once', t: 'One-time', d: 'A lump sum in a chosen year', icon: 'wallet' }
        ] }) + (s.preMode === 'none' ? '' : F.space(16) + F.grid(
          F.money({ k: 'preAmt', label: s.preMode === 'monthly' ? 'Extra amount each month' : 'Prepayment amount', value: s.preAmt }),
          s.preMode === 'once' ? F.number({ k: 'preYear', label: 'Prepay at the end of year', value: s.preYear, min: 1, max: Math.max(1, Math.floor(+s.years || 1)), suffix: 'year' }) : ''
        ) + F.space(16) + F.live('')),
        live(s, el) { if (s.preMode === 'none') return; const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('Interest saved', fmt.short(r.savedInterest), '', true) + F.kpi('Loan closes', fmt.months(r.savedMonths) + ' early', 'In ' + fmt.months(r.pre.months)) + F.kpi('New total interest', fmt.short(r.pre.totalInterest)) + '</div>'); }
      }
    ],
    compute: s => calc(s),
    summary(s, r) {
      const l = LOANS[s.type], use = s.preMode === 'none' ? r.base : r.pre, fee = r.P * (+s.fee || 0) / 100;
      const lab = [], b1 = [], b2 = [];
      const N = Math.ceil(r.n / 12);
      for (let k = 0; k <= N; k++) { lab.push(String(fmt.yearFromNow(k))); b1.push(k === 0 ? r.P : (r.base.rows[k - 1] || { balance: 0 }).balance); b2.push(k === 0 ? r.P : (r.pre.rows[k - 1] || { balance: 0 }).balance); }
      const series = [{ name: 'Balance: EMI only', color: 'var(--series-1)', values: b1, area: true }];
      if (s.preMode !== 'none') series.push({ name: 'Balance: with prepayment', color: 'var(--series-2)', values: b2 });
      return {
        title: 'Your ' + l.t.toLowerCase() + ' summary',
        headline: { label: 'Monthly EMI', value: fmt.inr(r.base.emi), note: 'for ' + fmt.short(r.P) + ' at ' + fmt.pct(r.r, 2) + ' over ' + fmt.yrs(+s.years) + '. Total interest: <b>' + fmt.short(use.totalInterest) + '</b>' + (s.preMode !== 'none' ? ' with prepayment (saving ' + fmt.short(r.savedInterest) + ')' : '') + '.', icon: l.icon },
        tiles: [
          ['Total interest', fmt.short(use.totalInterest), fmt.pct(use.totalInterest / r.P * 100, 0) + ' of the loan'],
          ['Total payment', fmt.short(r.P + use.totalInterest), 'Principal + interest'],
          ['Processing fee', fmt.inr(fee), fmt.pct(s.fee, 2) + ' (one-time)'],
          s.preMode !== 'none' ? ['Saved by prepaying', fmt.short(r.savedInterest), fmt.months(r.savedMonths) + ' shorter'] : ['Loan closes', String(fmt.yearFromNow(r.n / 12)), fmt.months(r.n)]
        ],
        sections: [
          { title: 'Loan details', icon: 'sliders', html: NP.h.kv([['Loan type', l.t], ['Amount', fmt.inr(r.P)], ['Interest rate', fmt.pct(r.r, 2) + ' p.a.'], ['Tenure', fmt.months(r.n)], ['EMI', fmt.inr(r.base.emi)], ['Prepayment', s.preMode === 'none' ? 'None' : fmt.inr(s.preAmt) + (s.preMode === 'yearly' ? ' every year' : s.preMode === 'monthly' ? ' extra every month' : ' once, in year ' + s.preYear)]]) },
          { title: 'Principal vs interest', icon: 'bar-chart', html: NP.charts.split({ parts: [{ label: 'Principal', value: r.P, color: 'var(--series-1)' }, { label: 'Interest', value: use.totalInterest, color: 'var(--series-2)' }] }) },
          { title: 'Outstanding balance over time', icon: 'trending-up', html: NP.charts.line({ labels: lab, series, aria: 'Loan balance over time' }) },
          s.preMode !== 'none' ? { title: 'Impact of prepayment', icon: 'zap', html: NP.h.table(['', 'EMI only', 'With prepayment', 'You save'], [
            ['Total interest', fmt.inr(r.base.totalInterest), fmt.inr(r.pre.totalInterest), fmt.inr(r.savedInterest)],
            ['Loan tenure', fmt.months(r.base.months), fmt.months(r.pre.months), fmt.months(r.savedMonths)],
            ['Total prepaid', '—', fmt.inr(r.pre.prepaid), '']]) } : null,
          { title: 'Yearly repayment schedule', icon: 'calendar', allowBreak: true, html: NP.h.table(['Year', 'Principal paid', 'Interest paid', s.preMode !== 'none' ? 'Prepaid' : 'Total paid', 'Balance'],
            use.rows.map(x => [String(fmt.yearFromNow(x.year - 1)), fmt.inr(x.principal - x.prepay), fmt.inr(x.interest), s.preMode !== 'none' ? fmt.inr(x.prepay) : fmt.inr(x.principal + x.interest), fmt.inr(x.balance)])) }
        ],
        takeaways: [
          s.preMode === 'none' ? 'Prepaying just <b>one extra EMI a year</b> (' + fmt.inr(r.base.emi) + ') would save about ' + fmt.short(r.base.totalInterest - NP.fin.amort(r.P, r.r, r.n, { yearlyAmt: r.base.emi }).totalInterest) + ' in interest.' : 'Your prepayment plan saves ' + fmt.short(r.savedInterest) + '. Ask the bank to reduce the <b>tenure</b>, not the EMI, for maximum savings.',
          'Keep the EMI below <b>40% of your take-home income</b> across all loans. Use the Loan Planner to check affordability.',
          s.type === 'home' ? 'Claim tax benefits: up to ₹2 lakh on interest (Sec 24b) and ₹1.5 lakh on principal (Sec 80C) under the old tax regime.' : s.type === 'edu' ? 'Interest on an education loan is fully deductible under Sec 80E for up to 8 years.' : 'Compare offers from 3–4 lenders. A 1% lower rate saves ' + fmt.short(r.base.totalInterest - NP.fin.amort(r.P, Math.max(0.1, r.r - 1), r.n).totalInterest) + ' on this loan.',
          'Protect the loan with a <b>term insurance</b> cover at least equal to the outstanding amount, so your family is not burdened.'
        ]
      };
    }
  });
})();
