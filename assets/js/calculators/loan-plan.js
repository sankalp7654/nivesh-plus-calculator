/* Loan Planner — affordability, down payment and savings plan */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  const PURPOSE = {
    home: { t: 'Buy a home', n: 'home', icon: 'home', price: 8000000, dp: 20, rate: 8.5, yrs: 20, ltv: 'Banks lend up to 75–90% of the property value. Add ~7% for stamp duty & registration.', extra: 7 },
    car: { t: 'Buy a car', n: 'car', icon: 'car', price: 1200000, dp: 20, rate: 9.25, yrs: 5, ltv: 'Banks lend up to 80–90% of the on-road price.', extra: 0 },
    edu: { t: 'Higher education', n: 'education', icon: 'graduation-cap', price: 2500000, dp: 10, rate: 10, yrs: 10, ltv: 'Banks usually need a 5–15% margin for loans above ₹4 lakh.', extra: 0 },
    business: { t: 'Business / shop', n: 'business', icon: 'briefcase', price: 2000000, dp: 25, rate: 13, yrs: 7, ltv: 'Lenders usually expect 20–30% of your own money.', extra: 0 },
    renovation: { t: 'Home renovation', n: 'renovation', icon: 'hotel', price: 1000000, dp: 20, rate: 10.5, yrs: 7, ltv: 'Home improvement loans are often linked to your existing home loan.', extra: 0 },
    wedding: { t: 'Wedding', n: 'wedding', icon: 'gem', price: 1500000, dp: 30, rate: 12.5, yrs: 4, ltv: 'Personal loans have high interest. Borrow as little as possible.', extra: 0 }
  };
  const p = s => PURPOSE[s.purpose];
  const months = s => Math.round((+s.years || 0) * 12);
  function calc(s, rOv) {
    const inc = +s.income || 0, emis = +s.emis || 0, foirPct = +s.foir || 0;
    const maxEmi = Math.max(0, inc * foirPct / 100 - emis);
    const i = (+s.rate || 0) / 1200, n = months(s);
    const maxLoan = i ? maxEmi * (1 - Math.pow(1 + i, -n)) / i : maxEmi * n;
    const price = +s.price || 0, extras = price * (+s.extraPct || 0) / 100;
    const dp = price * (+s.dp || 0) / 100;
    const loanNeeded = Math.max(0, price - dp);
    const emi = NP.fin.emi(loanNeeded, +s.rate || 0, n);
    const afford = loanNeeded <= maxLoan + 1;
    const ownNeeded = dp + extras + Math.max(0, loanNeeded - maxLoan);
    const buyYrs = +s.when || 0;
    const ownFV = NP.fin.fv(ownNeeded, +s.priceInf || 0, buyYrs);
    const savedFV = rOv != null ? NP.fin.fv(+s.saved || 0, rOv, buyYrs) : +s.saved || 0;
    const gap = Math.max(0, ownFV - savedFV);
    const foirActual = inc ? ((emis + emi) / inc) * 100 : 0;
    const interest = emi * n - loanNeeded;
    return { inc, maxEmi, maxLoan, price, extras, dp, loanNeeded, emi, afford, ownNeeded, ownFV, gap, foirActual, interest, n, buyYrs };
  }
  const target = (s, r) => calc(s, r).gap;

  NP.wizard({
    id: 'loan-plan', version: 1,
    heading: 'Loan Planner',
    intro: 'Before you borrow, check how much loan you can comfortably afford, how much of your own money you need and how to save for the down payment.',
    state: { purpose: 'home', price: 8000000, dp: 20, extraPct: 7, rate: 8.5, years: 20, income: 150000, emis: 0, foir: 40, when: 3, priceInf: 6, saved: 500000 },
    steps: [
      {
        title: 'What do you need the loan for?', nav: 'Purpose',
        render: s => F.choices({ k: 'purpose', value: s.purpose, options: Object.keys(PURPOSE).map(k => ({ v: k, t: PURPOSE[k].t, icon: PURPOSE[k].icon })) }),
        onChange: (s, k) => { if (k === 'purpose') { const x = p(s); s.price = x.price; s.dp = x.dp; s.rate = x.rate; s.years = x.yrs; s.extraPct = x.extra; } }
      },
      {
        title: 'Your income and existing EMIs', nav: 'Income',
        sub: 'Banks look at your FOIR (Fixed Obligation to Income Ratio): total EMIs should stay below 40–50% of take-home pay.',
        render: s => F.grid(
          F.money({ k: 'income', label: 'Monthly take-home income', value: s.income, hint: 'Include your spouse’s income if it is a joint loan' }),
          F.money({ k: 'emis', label: 'Existing EMIs per month', value: s.emis }),
          F.number({ k: 'foir', label: 'Maximum share of income for EMIs', value: s.foir, min: 20, max: 60, step: 5, range: true, suffix: '%', minLabel: '20% (safe)', maxLabel: '60% (stretched)', hint: 'We recommend 35–40% so you can still save' }),
          F.number({ k: 'rate', label: 'Expected interest rate', value: s.rate, min: 1, max: 25, step: 0.05, suffix: '% p.a.' }),
          F.number({ k: 'years', label: 'Loan tenure', value: s.years, min: 1, max: 30, suffix: 'years' })
        ) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s); NP.live(el, '<div class="live-grid">' + F.kpi('EMI you can afford', fmt.inr(r.maxEmi), 'per month') + F.kpi('Maximum loan', fmt.short(r.maxLoan), 'At ' + fmt.pct(s.rate, 2) + ' for ' + fmt.yrs(+s.years), true) + '</div>'); },
        validate: s => (!(+s.income > 0) ? 'Please enter your monthly income.' : !(months(s) > 0) ? 'Please enter the loan tenure.' : '')
      },
      {
        title: s => 'Cost of the ' + p(s).n, nav: 'Price & down payment',
        sub: s => esc(p(s).ltv),
        render: s => F.grid(
          F.money({ k: 'price', label: s.purpose === 'home' ? 'Property price (today)' : 'Total cost (today)', value: s.price }),
          F.number({ k: 'dp', label: 'Down payment (your own money)', value: s.dp, min: 0, max: 100, range: true, suffix: '% of price', minLabel: '0%', maxLabel: '100%' }),
          s.purpose === 'home' ? F.number({ k: 'extraPct', label: 'Stamp duty, registration & interiors', value: s.extraPct, min: 0, max: 20, step: 0.5, suffix: '% of price', hint: 'Not covered by the loan, so you pay this yourself' }) : ''
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const r = calc(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Loan needed', fmt.short(r.loanNeeded), 'EMI ' + fmt.inr(r.emi)) + F.kpi('You can borrow', fmt.short(r.maxLoan)) + F.kpi('Own money needed', fmt.short(r.ownNeeded), 'Down payment' + (r.extras ? ' + charges' : '') + (r.afford ? '' : ' + extra'), true) + '</div><div style="margin-top:12px">' +
            NP.h.note(r.afford ? 'Good news: the EMI of ' + fmt.inr(r.emi) + ' is within your comfortable limit (' + fmt.pct(r.foirActual, 0) + ' of income).' : 'The loan needed is ' + fmt.short(r.loanNeeded - r.maxLoan) + ' more than you can comfortably afford. Increase the down payment, choose a longer tenure or a lower price.', r.afford ? 'good' : 'warn') + '</div>');
        },
        validate: s => (!(+s.price > 0) ? 'Please enter the price.' : '')
      },
      {
        title: 'When do you plan to buy?', nav: 'Timeline',
        sub: 'If you will buy in a few years, save for the down payment now. Prices also rise over time.',
        render: s => F.grid(
          F.number({ k: 'when', label: 'Buy after', value: s.when, min: 0, max: 15, range: true, suffix: 'years', minLabel: 'Now', maxLabel: '15 yrs' }),
          F.number({ k: 'priceInf', label: 'Price increase per year', value: s.priceInf, min: 0, max: 15, step: 0.5, suffix: '% p.a.' }),
          F.money({ k: 'saved', label: 'Already saved for this', value: s.saved })
        ) + F.space(16) + F.live(''),
        live(s, el) { const r = calc(s, 7.2); NP.live(el, '<div class="live-grid">' + F.kpi('Own money needed then', fmt.short(r.ownFV), +s.when ? 'In ' + fmt.yearFromNow(+s.when) : 'Today') + F.kpi('Savings grow to (at 7.2%)', fmt.short(NP.fin.fv(+s.saved || 0, 7.2, +s.when || 0))) + F.kpi('Still to save', fmt.short(r.gap), '', true) + '</div>'); }
      },
      NP.investStep({
        title: 'Save for the down payment', nav: 'Saving plan',
        sub: s => +s.when < 1 ? 'You plan to buy now, so there is no time to invest. The remaining amount must come from your savings.' : +s.when < 3 ? 'For less than 3 years, keep the down payment money safe in Post Office RD / Time Deposit or a liquid fund.' : 'Compare the three options and pick a return from each drop-down.',
        before: s => { const r = calc(s, 7.2); return F.live('<div class="live-grid">' + F.kpi('Down payment & charges', fmt.short(r.ownFV), 'Needed by ' + fmt.yearFromNow(+s.when || 0), true) + F.kpi('Gap after savings', fmt.short(r.gap)) + F.kpi('Time', +s.when ? fmt.yrs(+s.when) : 'Buying now') + '</div>') + F.space(16); },
        target, years: s => Math.max(0.0833, +s.when || 0), inflation: s => +s.priceInf || 0
      })
    ],
    compute: s => calc(s, s.inv.po),
    summary(s) {
      const r = calc(s, s.inv.po), x = p(s), yrsBuy = Math.max(0.0833, +s.when || 0);
      const inv = NP.investSummary(s, rr => target(s, rr), yrsBuy, +s.priceInf || 0);
      const st = r.foirActual <= 40 && r.afford ? { cls: 'good', icon: 'check-circle', label: 'Comfortable' } : r.afford ? { cls: 'warn', icon: 'alert', label: 'Stretched' } : { cls: 'bad', icon: 'x-circle', label: 'Beyond budget' };
      const priceThen = NP.fin.fv(r.price, +s.priceInf || 0, +s.when || 0), loanThen = NP.fin.fv(r.loanNeeded, +s.priceInf || 0, +s.when || 0);
      return {
        title: 'Your loan plan: ' + x.n,
        headline: { label: 'Loan you can comfortably afford', value: fmt.inr(r.maxLoan), note: 'with an EMI of up to ' + fmt.inr(r.maxEmi) + ' (' + s.foir + '% of income). For this ' + x.n + ' you need a loan of <b>' + fmt.short(r.loanNeeded) + '</b> and <b>' + fmt.short(r.ownNeeded) + '</b> of your own money today.', icon: x.icon },
        tiles: [
          ['EMI for this loan', fmt.inr(r.emi), fmt.pct(s.rate, 2) + ' · ' + fmt.yrs(+s.years)],
          ['EMI-to-income', fmt.pct(r.foirActual, 0), NP.status(st)],
          ['Total interest', fmt.short(r.interest), 'Over the full tenure'],
          ['Monthly saving for DP', +s.when >= 1 ? fmt.inr(inv.rows[1].c.sip) : '—', +s.when >= 1 ? 'Post Office @ ' + fmt.pct(s.inv.po) : 'Buying now']
        ],
        sections: [
          { title: 'Affordability', icon: 'gauge', html: NP.h.kv([['Monthly income', fmt.inr(r.inc)], ['Existing EMIs', fmt.inr(+s.emis || 0)], ['Max EMI (' + s.foir + '% rule)', fmt.inr(r.maxEmi)], ['Max loan', fmt.inr(r.maxLoan)], ['Interest rate / tenure', fmt.pct(s.rate, 2) + ' / ' + fmt.yrs(+s.years)], ['Status', NP.status(st)]]) },
          { title: 'Funding the purchase (today’s prices)', icon: 'wallet', html: NP.h.table(['Item', 'Amount'], [
            ['Price', fmt.inr(r.price)], ['Down payment (' + s.dp + '%)', fmt.inr(r.dp)], r.extras ? ['Stamp duty, registration & interiors', fmt.inr(r.extras)] : null,
            ['Loan needed', fmt.inr(r.loanNeeded)], !r.afford ? { cells: ['Loan above your comfortable limit', fmt.inr(r.loanNeeded - r.maxLoan)], hl: true } : null,
            { cells: ['<b>Own money needed</b>', '<b>' + fmt.inr(r.ownNeeded) + '</b>'], hl: r.afford }
          ].filter(Boolean)) + (+s.when ? '<div style="height:10px"></div>' + NP.h.note('In ' + fmt.yearFromNow(+s.when) + ', at ' + fmt.pct(s.priceInf) + ' price growth, the price will be about ' + fmt.short(priceThen) + ', the loan about ' + fmt.short(loanThen) + ' and your own contribution about ' + fmt.short(r.ownFV) + '.') : '') },
          { title: 'Loan: principal vs interest', icon: 'bar-chart', html: NP.charts.split({ parts: [{ label: 'Principal', value: r.loanNeeded, color: 'var(--series-1)' }, { label: 'Interest', value: Math.max(0, r.interest), color: 'var(--series-2)' }] }) },
          +s.when >= 1 ? { title: 'Saving for the down payment', icon: 'scale', html: inv.table } : null
        ],
        takeaways: [
          r.afford ? 'This loan fits your budget. Keep total EMIs within ' + s.foir + '% of income so you can keep saving for other goals.' : 'Reduce the loan by ' + fmt.short(r.loanNeeded - r.maxLoan) + ': raise the down payment, extend the tenure or add a co-applicant.',
          'A higher down payment means a lower EMI and less interest. Every ₹1 lakh extra down payment saves about ' + fmt.inr(NP.fin.emi(100000, +s.rate, r.n) * r.n - 100000) + ' in interest.',
          'Keep a good <b>CIBIL score (750+)</b>. It gets you a lower interest rate.',
          'Keep 6 months of EMIs as an emergency fund, and take a <b>term plan</b> equal to the loan amount so your family is protected.'
        ]
      };
    }
  });
})();
