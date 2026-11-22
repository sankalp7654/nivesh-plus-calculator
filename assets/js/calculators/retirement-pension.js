/* Retirement & Pension Planner */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  const toRet = s => Math.max(0, (+s.retAge || 0) - (+s.age || 0));
  const inRet = s => Math.max(1, (+s.life || 0) - (+s.retAge || 0));
  function calc(s, rOverride) {
    const n = toRet(s), m = inRet(s), inf = +s.inf || 0;
    const monthlyToday = s.method === 'pct' ? (+s.income || 0) / 12 * (+s.pct || 0) / 100 : +s.expense || 0;
    const monthlyAtRet = NP.fin.fv(monthlyToday, inf, n);
    const yearlyAtRet = monthlyAtRet * 12;
    const corpus = NP.fin.pvGrowingDue(yearlyAtRet, inf, +s.postRet || 0, m);
    /* Pension is the amount expected in the first month of retirement; indexed pensions rise with inflation after that. */
    const pensionCorpus = NP.fin.pvGrowingDue((+s.pension || 0) * 12, s.pensionIndexed === 'yes' ? inf : 0, +s.postRet || 0, m);
    const needCorpus = Math.max(0, corpus - pensionCorpus);
    const r = rOverride != null ? rOverride : 7.2;
    const fromSavings = NP.fin.fv(+s.saved || 0, r, n) + NP.fin.sipFV(+s.sip || 0, r, n);
    return { n, m, monthlyToday, monthlyAtRet, yearlyAtRet, corpus, pensionCorpus, needCorpus, fromSavings, gap: Math.max(0, needCorpus - fromSavings) };
  }
  const target = (s, r) => calc(s, r).gap;

  NP.wizard({
    id: 'retirement-pension', version: 1,
    heading: 'Retirement & Pension Planner',
    intro: 'Based on your income today, find the monthly pension you will need at retirement, the corpus required to pay it for life, and how to build it.',
    state: { name: '', age: 35, retAge: 60, life: 85, method: 'pct', income: 1200000, pct: 70, expense: 50000, inf: 6, postRet: 7, pension: 0, pensionIndexed: 'no', saved: 500000, sip: 0 },
    steps: [
      {
        title: 'Your retirement timeline', nav: 'Timeline',
        render: s => F.grid(
          F.text({ k: 'name', label: 'Your name (optional)', value: s.name }),
          F.number({ k: 'age', label: 'Current age', value: s.age, min: 18, max: 70, suffix: 'years', range: true, minLabel: '18', maxLabel: '70' }),
          F.number({ k: 'retAge', label: 'Retirement age', value: s.retAge, min: 40, max: 75, suffix: 'years', range: true, minLabel: '40', maxLabel: '75' }),
          F.number({ k: 'life', label: 'Plan income until age', value: s.life, min: 60, max: 100, suffix: 'years', hint: 'Plan for a long life. 85–90 is a safe assumption.' })
        ) + F.space(16) + F.live(''),
        live: (s, el) => NP.live(el, toRet(s) > 0 && +s.life > +s.retAge ? '<div class="live-grid">' + F.kpi('Years to retirement', fmt.yrs(toRet(s)), 'Retire in ' + fmt.yearFromNow(toRet(s))) + F.kpi('Years in retirement', fmt.yrs(inRet(s)), 'Income needed till ' + s.life, true) + '</div>' : NP.h.note('Check the ages: current age < retirement age < life expectancy.', 'warn')),
        validate: s => (toRet(s) <= 0 ? 'Retirement age must be higher than your current age.' : +s.life <= +s.retAge ? 'Life expectancy must be higher than retirement age.' : '')
      },
      {
        title: 'How much will you need every month?', nav: 'Monthly need',
        sub: 'Most people need about 70–80% of their pre-retirement income to keep the same lifestyle.',
        render: s => F.grid(
          F.segmented({ k: 'method', label: 'Calculate from', value: s.method, full: true, options: [['pct', 'My current income'], ['exp', 'My current monthly expenses']] }),
          s.method === 'pct' ? F.money({ k: 'income', label: 'Current annual income', value: s.income }) : F.money({ k: 'expense', label: 'Current monthly household expenses', value: s.expense, hint: 'Exclude EMIs and children’s costs that will end before retirement' }),
          s.method === 'pct' ? F.number({ k: 'pct', label: 'Income needed after retirement', value: s.pct, min: 30, max: 120, step: 5, suffix: '% of today', range: true, minLabel: '30%', maxLabel: '120%' }) : ''
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const r = calc(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Monthly need (today’s money)', fmt.inr(r.monthlyToday)) + F.kpi('Same lifestyle in ' + fmt.yearFromNow(r.n), fmt.inr(r.monthlyAtRet), 'per month, at ' + fmt.pct(s.inf) + ' inflation', true) + '</div>');
        },
        validate: s => (calc(s).monthlyToday <= 0 ? 'Please enter your income or expenses.' : '')
      },
      {
        title: 'Inflation and returns in retirement', nav: 'Inflation & returns',
        sub: 'Your pension must rise with inflation every year of retirement. The corpus earns a safe return while you draw from it.',
        render: s => F.grid(
          F.number({ k: 'inf', label: 'Inflation', value: s.inf, min: 0, max: 12, step: 0.5, suffix: '% p.a.', range: true, minLabel: '0%', maxLabel: '12%' }),
          F.number({ k: 'postRet', label: 'Return on corpus after retirement', value: s.postRet, min: 3, max: 12, step: 0.5, suffix: '% p.a.', hint: 'SCSS (8.2%), Post Office MIS, annuity, debt funds. 7% is a safe mix.' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const r = calc(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Pension needed at ' + s.retAge, fmt.inr(r.monthlyAtRet) + '/mo') + F.kpi('Pension needed at ' + (+s.life - 1), fmt.inr(r.monthlyAtRet * Math.pow(1 + s.inf / 100, r.m - 1)) + '/mo') + F.kpi('Retirement corpus needed', fmt.short(r.corpus), fmt.inr(r.corpus), true) + '</div>');
        }
      },
      {
        title: 'Pension and savings you already have', nav: 'Existing savings',
        sub: 'Include any pension (NPS annuity, EPS, government pension) and money already saved for retirement.',
        render: s => F.grid(
          F.money({ k: 'pension', label: 'Expected pension per month at retirement', value: s.pension, hint: 'Amount in the first month of retirement. Leave 0 if none.' }),
          F.segmented({ k: 'pensionIndexed', label: 'Does the pension rise with inflation?', value: s.pensionIndexed, options: [['no', 'No, fixed'], ['yes', 'Yes (e.g. government DA)']] }),
          F.money({ k: 'saved', label: 'Retirement savings today', value: s.saved, hint: 'EPF, PPF, NPS, MF and FD kept for retirement' }),
          F.money({ k: 'sip', label: 'Monthly amount you already invest', value: s.sip, hint: 'Existing SIP / NPS / PPF contributions per month' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const r = calc(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Corpus needed', fmt.short(r.needCorpus), r.pensionCorpus ? 'After pension worth ' + fmt.short(r.pensionCorpus) : '') + F.kpi('Savings grow to (at 7.2%)', fmt.short(r.fromSavings)) + F.kpi('Gap to build', fmt.short(r.gap), '', true) + '</div>');
        }
      },
      NP.investStep({
        title: 'How to build your retirement corpus', nav: 'Investment plan',
        sub: 'Amount needed to fill the gap, for each option. Your existing savings grow at the same rate as the option.',
        before: s => { const r = calc(s, s.inv.mf); return F.live('<div class="live-grid">' + F.kpi('Corpus needed', fmt.short(r.needCorpus), 'By age ' + s.retAge, true) + F.kpi('Years to invest', fmt.yrs(r.n)) + F.kpi('Monthly pension needed', fmt.inr(r.monthlyAtRet), 'In ' + fmt.yearFromNow(r.n)) + '</div>') + F.space(16); },
        target, years: toRet, inflation: s => +s.inf || 0
      })
    ],
    compute: s => calc(s),
    summary(s) {
      const r = calc(s, s.inv.mf), inv = NP.investSummary(s, rr => target(s, rr), r.n, +s.inf || 0), adv = NP.goalAdvice(s, rr => target(s, rr), r.n, +s.inf || 0, 'your retirement');
      /* Corpus depletion */
      let bal = r.needCorpus + r.pensionCorpus, wd = r.yearlyAtRet; const lab = [], vals = [], rows = [];
      for (let k = 0; k <= r.m; k++) {
        lab.push(String(+s.retAge + k)); vals.push(Math.max(0, bal));
        if (k < r.m) {
          if (k % 5 === 0) rows.push([String(+s.retAge + k), String(fmt.yearFromNow(r.n + k)), fmt.inr(wd / 12), fmt.inr(wd), fmt.inr(Math.max(0, bal))]);
          bal = (bal - wd) * (1 + s.postRet / 100); wd *= 1 + s.inf / 100;
        }
      }
      const mf = inv.rows[2].c, po = inv.rows[1].c;
      return {
        title: (s.name ? esc(s.name) + '’s ' : 'Your ') + 'retirement plan',
        headline: { label: 'Retirement corpus needed at age ' + s.retAge, value: fmt.inr(r.needCorpus), note: 'To draw <b>' + fmt.inr(r.monthlyAtRet) + ' a month</b> from ' + fmt.yearFromNow(r.n) + ', rising with ' + fmt.pct(s.inf) + ' inflation until age ' + s.life + '. That is ' + fmt.inr(r.monthlyToday) + ' in today’s money.', icon: 'sunset' },
        tiles: [
          ['Monthly pension at ' + s.retAge, fmt.inr(r.monthlyAtRet), 'Today: ' + fmt.inr(r.monthlyToday)],
          ['Savings will grow to', fmt.short(r.fromSavings), 'At ' + fmt.pct(s.inv.mf) + ' (MF)'],
          ['Extra SIP needed (MF)', fmt.inr(mf.sip), 'per month for ' + fmt.yrs(r.n)],
          ['Extra SIP (Post Office)', fmt.inr(po.sip), 'per month at ' + fmt.pct(s.inv.po)]
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([
            ['Current age → retirement', s.age + ' → ' + s.retAge], ['Plan till age', String(s.life)],
            s.method === 'pct' ? ['Income today', fmt.inr(s.income) + ' / yr'] : ['Expenses today', fmt.inr(s.expense) + ' / mo'], s.method === 'pct' ? ['Needed after retirement', fmt.pct(s.pct) + ' of income'] : null,
            ['Inflation', fmt.pct(s.inf) + ' p.a.'], ['Return after retirement', fmt.pct(s.postRet) + ' p.a.'],
            ['Pension', fmt.inr(s.pension) + '/mo' + (s.pensionIndexed === 'yes' ? ' (indexed)' : ' (fixed)')], ['Savings today / monthly', fmt.inr(s.saved) + ' / ' + fmt.inr(s.sip)]
          ]) },
          { title: 'How your corpus lasts through retirement', icon: 'trending-up', html: NP.charts.line({ labels: lab, series: [{ name: 'Corpus balance', color: 'var(--series-1)', values: vals, area: true }], tipPrefix: 'Age ', labelLast: false, aria: 'Corpus balance during retirement' }) +
            '<div style="height:12px"></div>' + NP.h.table(['Age', 'Year', 'Monthly pension', 'Yearly withdrawal', 'Corpus at start'], rows) },
          { title: 'How to fill the gap of ' + fmt.short(calc(s, 7.2).gap) + ' (at 7.2%)', icon: 'scale', html: inv.bars + '<div style="height:14px"></div>' + inv.table + '<div style="height:10px"></div>' + NP.h.note('Each option assumes your existing savings and SIPs also earn that option’s return.') },
          { title: 'Suggested investment mix', icon: 'layers', html: adv.mixHtml }
        ],
        takeaways: [
          'Use <b>NPS</b> for an extra ₹50,000 tax deduction (Sec 80CCD(1B)) and <b>PPF</b> for tax-free, safe growth as the base of your retirement plan.',
          'At retirement, move the corpus into <b>Senior Citizens’ Savings Scheme (8.2%)</b>, Post Office MIS, LIC annuity (e.g. Jeevan Akshay) and a conservative hybrid fund for a monthly pension.'
        ].concat(adv.takeaways.slice(0, 3), ['Buy a <b>health insurance</b> policy now, while you are healthy. Medical costs are the biggest risk to a retirement corpus.'])
      };
    }
  });
})();
