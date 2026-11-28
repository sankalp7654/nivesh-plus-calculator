/* Loan Interest Recovery — invest alongside the loan so the returns cancel the interest */
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
  const MODES = {
    zero: { t: 'Make the interest truly zero', d: 'Investment earnings = loan interest. You also get back every rupee you invested.', icon: 'sparkles' },
    recover: { t: 'Recover the interest amount', d: 'Final investment value = loan interest. Lower monthly amount (the “EMI ka SIP” rule).', icon: 'piggy-bank' }
  };
  const months = s => Math.round((+s.years || 0) * 12);
  const yrs = s => months(s) / 12;

  function loan(s) {
    const P = +s.amount || 0, r = +s.rate || 0, n = months(s);
    const a = fin.amort(P, r, n);
    return { P, r, n, emi: a.emi, interest: a.totalInterest, rows: a.rows };
  }

  /* Amount to invest at rate R (% p.a.) over the loan tenure.
     zero:    gain (value − money put in) = interest
     recover: final value = interest                         */
  function invest(s, R, interest) {
    const n = months(s), Y = n / 12, N = Math.max(1, Math.round(Y)), inf = +s.inf || 0;
    const I = interest == null ? loan(s).interest : interest;
    const lumpF = Math.pow(1 + R / 100, Y), sipF = fin.sipFV(1, R, Y), yrF = fin.yearlyFV(1, R, N);
    const zero = s.mode === 'zero';
    const div = (a, b) => (I > 0 && b > 1e-9 ? a / b : 0);
    const lump = div(I, zero ? lumpF - 1 : lumpF), sip = div(I, zero ? sipF - n : sipF), yearly = div(I, zero ? yrF - N : yrF);
    return {
      rate: R, real: fin.real(R, inf), lump, sip, yearly,
      sipTotal: sip * n, yearlyTotal: yearly * N,
      sipValue: sip * sipF, lumpValue: lump * lumpF, yearlyValue: yearly * yrF
    };
  }

  NP.wizard({
    id: 'loan-interest-recovery', version: 1,
    heading: 'Loan Interest Recovery Calculator',
    intro: 'Taking a loan? Find out how much to invest every month (or once, today) so that your investment returns pay back all the interest you pay to the bank, making your loan effectively interest-free.',
    state: { type: 'home', amount: 10000000, rate: 8, years: 15, mode: 'zero', inf: 6 },
    steps: [
      {
        title: 'Which loan are you taking?', nav: 'Loan type',
        sub: 'We fill in typical values for each loan type. You can change them in the next step.',
        render: s => F.choices({ k: 'type', value: s.type, options: Object.keys(LOANS).map(k => ({ v: k, t: LOANS[k].t, d: LOANS[k].d, icon: LOANS[k].icon })) }),
        onChange: (s, k) => { if (k === 'type') { const l = LOANS[s.type]; s.amount = l.amt; s.rate = l.rate; s.years = l.yrs; } }
      },
      {
        title: 'Loan amount, rate and tenure', nav: 'Loan details',
        sub: 'Example: “₹1 crore home loan at 8% for 15 years.”',
        render: s => F.grid(
          F.money({ k: 'amount', label: 'Loan amount', value: s.amount, full: true }),
          F.number({ k: 'rate', label: 'Interest rate', value: s.rate, min: 1, max: 30, step: 0.05, range: true, suffix: '% p.a.', minLabel: '1%', maxLabel: '30%' }),
          F.number({ k: 'years', label: 'Tenure', value: s.years, min: 1, max: 30, step: 0.5, range: true, suffix: 'years', minLabel: '1 yr', maxLabel: '30 yrs' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const l = loan(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Monthly EMI', fmt.inr(l.emi)) + F.kpi('Total interest you will pay', fmt.short(l.interest), fmt.inr(l.interest), true) + F.kpi('Total payment', fmt.short(l.P + l.interest)) + '</div><div style="margin-top:14px">' +
            NP.charts.split({ parts: [{ label: 'Principal', value: l.P, color: 'var(--series-1)' }, { label: 'Interest', value: l.interest, color: 'var(--series-2)' }] }) + '</div>');
        },
        validate: s => (!(+s.amount > 0) ? 'Please enter the loan amount.' : !(+s.rate > 0) ? 'Please enter the interest rate.' : !(months(s) >= 12) ? 'Please enter a tenure of at least 1 year.' : '')
      },
      {
        title: 'What does “zero interest” mean to you?', nav: 'Your goal',
        sub: 'The investment runs for the same period as the loan. Choose how strictly you want to cancel the interest.',
        render: s => F.choices({ k: 'mode', value: s.mode, wide: true, options: Object.keys(MODES).map(k => ({ v: k, t: MODES[k].t, d: MODES[k].d, icon: MODES[k].icon })) }) + F.space(16) +
          F.grid(F.number({ k: 'inf', label: 'Expected inflation', value: s.inf, min: 0, max: 15, step: 0.5, suffix: '% p.a.', hint: 'Used only to show the real return of each option' })) + F.space(16) + F.live(''),
        live(s, el) {
          const l = loan(s), c = invest(s, s.inv.mf, l.interest);
          NP.live(el, '<div class="live-grid">' + F.kpi('Loan interest', fmt.short(l.interest), 'Over ' + fmt.yrs(yrs(s))) +
            F.kpi('Monthly SIP needed', fmt.inr(c.sip), 'Mutual fund @ ' + fmt.pct(s.inv.mf), true) +
            F.kpi('SIP value at loan end', fmt.short(c.sipValue), s.mode === 'zero' ? 'Interest + your money back' : 'Equal to the interest') + '</div>');
        }
      },
      NP.investStep({
        title: 'How much should you invest?', nav: 'Compare options',
        sub: s => (s.mode === 'zero' ? 'Amount whose <b>earnings</b> equal your loan interest, over the loan tenure.' : 'Amount that <b>grows into</b> your loan interest by the time the loan ends.') + ' Pick a return for each option from the drop-down.',
        before: s => { const l = loan(s); return F.live('<div class="live-grid">' + F.kpi('Loan interest to cancel', fmt.short(l.interest), '', true) + F.kpi('EMI', fmt.inr(l.emi)) + F.kpi('Time', fmt.yrs(yrs(s)), 'Till ' + fmt.yearFromNow(yrs(s))) + '</div>') + F.space(16); },
        target: s => loan(s).interest, years: yrs, inflation: s => +s.inf || 0,
        calc: (s, r) => invest(s, r)
      })
    ],
    compute: s => loan(s),
    summary(s, l) {
      const Y = yrs(s), inf = +s.inf || 0, zero = s.mode === 'zero';
      const inv = NP.investSummary(s, null, Y, inf, { calc: r => invest(s, r, l.interest) });
      const [lic, po, mf] = inv.rows.map(o => o.c);
      const mfR = s.inv.mf, poR = s.inv.po;

      /* Year-by-year: cumulative loan interest vs what the mutual fund SIP has earned (or is worth) */
      const lab = [], cumI = [], invLine = [];
      let acc = 0;
      const N = Math.ceil(l.n / 12);
      for (let k = 0; k <= N; k++) {
        if (k) acc += (l.rows[k - 1] || { interest: 0 }).interest;
        lab.push(String(fmt.yearFromNow(k)));
        cumI.push(acc);
        const kk = Math.min(k, Y), val = fin.sipFV(mf.sip, mfR, kk);
        invLine.push(zero ? Math.max(0, val - mf.sip * Math.round(kk * 12)) : val);
      }
      const chart = NP.charts.line({
        labels: lab,
        series: [
          { name: 'Loan interest paid (cumulative)', color: 'var(--series-2)', values: cumI, area: true },
          { name: zero ? 'SIP earnings (value − invested)' : 'SIP value', color: 'var(--series-1)', values: invLine }
        ],
        aria: 'Loan interest paid versus investment over time'
      });

      const sipPctEmi = l.emi ? (mf.sip / l.emi) * 100 : 0;
      const netTable = NP.h.table(['', 'Amount'], [
        ['Loan principal repaid', fmt.inr(l.P)],
        ['Interest paid to the bank', fmt.inr(l.interest)],
        ['Invested in mutual fund SIP (' + fmt.inr(mf.sip) + ' × ' + l.n + ' months)', fmt.inr(mf.sipTotal)],
        ['<b>Total money paid out</b>', '<b>' + fmt.inr(l.P + l.interest + mf.sipTotal) + '</b>'],
        ['SIP value at loan end @ ' + fmt.pct(mfR), '− ' + fmt.inr(mf.sipValue)],
        { cells: ['<b>Net cost of the loan</b>', '<b>' + fmt.inr(l.P + l.interest + mf.sipTotal - mf.sipValue) + '</b>'], hl: true }
      ]);

      return {
        title: 'Your loan interest recovery plan',
        headline: {
          label: 'Monthly SIP to cancel the interest (mutual funds @ ' + fmt.pct(mfR) + ')',
          value: fmt.inr(mf.sip),
          note: 'alongside your EMI of ' + fmt.inr(l.emi) + ' for ' + fmt.yrs(Y) + '. On a ' + fmt.short(l.P) + ' loan at ' + fmt.pct(l.r, 2) + ' you pay <b>' + fmt.short(l.interest) + '</b> interest. ' +
            (zero ? 'The SIP earns that much and also returns your ' + fmt.short(mf.sipTotal) + ', so the interest is effectively <b>zero</b>.' : 'The SIP grows to ' + fmt.short(mf.sipValue) + ', recovering the full interest amount.'),
          icon: 'hand-coins'
        },
        tiles: [
          ['Total loan interest', fmt.short(l.interest), fmt.pct(l.interest / l.P * 100, 0) + ' of the loan'],
          ['LIC @ ' + fmt.pct(s.inv.lic), fmt.inr(lic.sip) + '/mo', 'or ' + fmt.short(lic.lump) + ' one time'],
          ['Post Office @ ' + fmt.pct(poR), fmt.inr(po.sip) + '/mo', 'or ' + fmt.short(po.lump) + ' one time'],
          ['Mutual fund @ ' + fmt.pct(mfR), fmt.inr(mf.sip) + '/mo', 'or ' + fmt.short(mf.lump) + ' one time']
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([
            ['Loan type', LOANS[s.type].t], ['Loan amount', fmt.inr(l.P)], ['Interest rate', fmt.pct(l.r, 2) + ' p.a.'],
            ['Tenure', fmt.months(l.n) + ' (till ' + fmt.yearFromNow(Y) + ')'], ['Monthly EMI', fmt.inr(l.emi)], ['Total interest', fmt.inr(l.interest)],
            ['Goal', MODES[s.mode].t], ['Inflation', fmt.pct(inf) + ' p.a.']
          ]) },
          { title: 'Monthly SIP needed: comparison', icon: 'scale', html: NP.charts.hbars({
            items: inv.rows.map((o, i) => ({ label: o.x.name, sub: fmt.pct(o.r) + ' p.a.', value: o.c.sip, color: ['#1b4785', '#5598e7', '#e0a21b'][i] })),
            fmt: fmt.inr, tipLabel: 'Monthly SIP'
          }) + '<div style="height:14px"></div>' + inv.table + '<div style="height:10px"></div>' +
            NP.h.note(zero ? 'Each amount is chosen so that the <b>earnings</b> (final value minus money invested) equal ' + fmt.short(l.interest) + ' by ' + fmt.yearFromNow(Y) + '.' : 'Each amount is chosen so that the <b>final value</b> equals ' + fmt.short(l.interest) + ' by ' + fmt.yearFromNow(Y) + '.') },
          { title: 'Interest paid vs investment, year by year', icon: 'trending-up', html: chart + '<div style="height:10px"></div>' + NP.h.note('Most EMI interest is paid in the early years, while the SIP grows fastest in the later years. The two lines meet when the loan ends.') },
          { title: 'Net cost of the loan (with mutual fund SIP)', icon: 'wallet', html: netTable }
        ],
        takeaways: [
          'Invest <b>' + fmt.inr(mf.sip) + ' a month</b> (about ' + fmt.pct(sipPctEmi, 0) + ' of your EMI) in equity mutual funds. Your total monthly outgo becomes ' + fmt.inr(l.emi + mf.sip) + '.',
          'A safe Post Office plan needs ' + fmt.inr(po.sip) + '/month: ' + fmt.inr(po.sip - mf.sip) + ' more than mutual funds. ' + (Y >= 7 ? 'A mix (e.g. 70% mutual funds, 30% Post Office) balances growth and safety.' : 'With less than 7 years, keep a larger share in Post Office schemes.'),
          'Start the SIP in the <b>same month as the first EMI</b>. Every year of delay raises the amount needed, because the SIP loses compounding time.',
          'Gains are taxable: equity mutual fund LTCG is taxed at 12.5% above ₹1.25 lakh a year, and Post Office interest is taxed at your slab rate. Invest a little more (about 10–15%) to cover tax.',
          s.type === 'home' ? 'Claim home loan tax benefits (Sec 24b interest up to ₹2 lakh and Sec 80C principal up to ₹1.5 lakh, old regime). The saving can fund part of the SIP.' : 'Compare offers from 3–4 lenders. A 1% lower rate cuts the interest by ' + fmt.short(l.interest - fin.amort(l.P, Math.max(0.1, l.r - 1), l.n).totalInterest) + ' and the SIP needed with it.',
          'Protect the plan with a <b>term insurance</b> cover at least equal to the loan, so your family is not left with the EMI.'
        ]
      };
    }
  });
})();
