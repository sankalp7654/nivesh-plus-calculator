/* Goal Savings Planner — "how much do I need to invest today?" */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  const GOALS = {
    marriage: { t: 'Daughter’s / son’s marriage', d: 'A grand, debt-free wedding', icon: 'gem', amt: 10000000, yrs: 20 },
    education: { t: 'Child’s higher education', d: 'College, professional course or abroad', icon: 'graduation-cap', amt: 5000000, yrs: 15 },
    house: { t: 'Dream home', d: 'Down payment or full purchase', icon: 'home', amt: 3000000, yrs: 8 },
    car: { t: 'New car', d: 'Buy without a car loan', icon: 'car', amt: 1200000, yrs: 4 },
    retire: { t: 'Retirement corpus', d: 'Financial freedom after work', icon: 'sunset', amt: 30000000, yrs: 25 },
    travel: { t: 'World tour / pilgrimage', d: 'Family trip, Char Dham, Europe', icon: 'plane', amt: 800000, yrs: 3 },
    business: { t: 'Start a business', d: 'Seed capital for your venture', icon: 'briefcase', amt: 2500000, yrs: 7 },
    other: { t: 'Something else', d: 'Any goal with an amount and a date', icon: 'target', amt: 1000000, yrs: 10 }
  };

  const yrs = s => +s.years || 0;
  const futureTarget = s => (s.basis === 'today' ? NP.fin.fv(+s.amount || 0, +s.inf || 0, yrs(s)) : +s.amount || 0);
  const target = (s, r) => Math.max(0, futureTarget(s) - NP.fin.fv(+s.saved || 0, r, yrs(s)));
  const goalName = s => (s.goal === 'other' && s.label ? s.label : GOALS[s.goal].t);

  NP.wizard({
    id: 'goal-savings', version: 1,
    heading: 'Goal Savings Planner',
    intro: 'Tell us your goal, the amount and when you need it. We will compare how much you need to invest today in LIC, Post Office or mutual funds.',
    state: { goal: 'marriage', label: '', amount: 10000000, years: 20, basis: 'future', inf: 6, saved: 0 },
    steps: [
      {
        title: 'What are you saving for?', nav: 'Your goal',
        sub: 'Pick the goal closest to yours. Every number can be changed in the next step.',
        render: s => F.choices({ k: 'goal', value: s.goal, options: Object.keys(GOALS).map(k => ({ v: k, t: GOALS[k].t, d: GOALS[k].d, icon: GOALS[k].icon })) }) +
          (s.goal === 'other' ? F.space(16) + F.grid(F.text({ k: 'label', label: 'Name your goal', value: s.label, placeholder: 'e.g. Daughter’s wedding gift' })) : ''),
        onChange: (s, k) => { if (k === 'goal') { s.amount = GOALS[s.goal].amt; s.years = GOALS[s.goal].yrs; } }
      },
      {
        title: 'How much do you need, and when?', nav: 'Amount & time',
        sub: 'Example: “I need ₹1 crore for my daughter’s wedding in 20 years.”',
        render: s => F.grid(
          F.money({ k: 'amount', label: 'Amount needed', value: s.amount }),
          F.number({ k: 'years', label: 'Needed after', value: s.years, min: 1, max: 40, range: true, suffix: 'years', minLabel: '1 yr', maxLabel: '40 yrs' }),
          F.segmented({ k: 'basis', label: 'This amount is in…', value: s.basis, full: true, options: [['future', 'Future value (the actual amount on that day)'], ['today', 'Today’s value (inflate it for me)']] })
        ) + F.space(18) + F.live(''),
        live(s, el) {
          NP.live(el, '<div class="live-grid">' + F.kpi('Goal year', String(fmt.yearFromNow(yrs(s))), 'In ' + fmt.yrs(yrs(s))) +
            (s.basis === 'today' ? F.kpi('Future amount needed', fmt.short(futureTarget(s)), 'At ' + fmt.pct(s.inf) + ' inflation', true) : F.kpi('Worth in today’s money', fmt.short(NP.fin.pv(+s.amount || 0, +s.inf || 0, yrs(s))), 'At ' + fmt.pct(s.inf) + ' inflation')) +
            F.kpi('Target', fmt.short(futureTarget(s)), fmt.inr(futureTarget(s)), s.basis !== 'today') + '</div>');
        },
        validate: s => (!(+s.amount > 0) ? 'Please enter the amount you need.' : !(yrs(s) >= 1) ? 'Please enter the number of years (at least 1).' : '')
      },
      {
        title: 'Inflation and existing savings', nav: 'Inflation & savings',
        sub: 'Inflation shows what your returns are really worth. Money already set aside will keep growing towards the goal.',
        render: s => F.grid(
          F.number({ k: 'inf', label: 'Expected inflation', value: s.inf, min: 0, max: 15, step: 0.5, range: true, suffix: '% p.a.', minLabel: '0%', maxLabel: '15%', hint: 'India’s long-term average CPI inflation is about 6%' }),
          F.money({ k: 'saved', label: 'Already saved for this goal (optional)', value: s.saved, hint: 'FD, PPF, MF or any money set aside' })
        ) + F.space(18) + F.live(''),
        live(s, el) {
          NP.live(el, '<div class="live-grid">' + F.kpi('Target', fmt.short(futureTarget(s)), 'In ' + fmt.yearFromNow(yrs(s))) +
            F.kpi('Savings grow to (at 7.2%)', fmt.short(NP.fin.fv(+s.saved || 0, 7.2, yrs(s)))) +
            F.kpi('Gap to fill (at 7.2%)', fmt.short(target(s, 7.2)), '', true) + '</div>');
        }
      },
      NP.investStep({
        title: 'How much should you invest today?', nav: 'Compare options',
        before: s => F.live('<div class="live-grid">' + F.kpi('Goal', esc(goalName(s))) + F.kpi('Target', fmt.short(futureTarget(s)), 'By ' + fmt.yearFromNow(yrs(s)), true) + F.kpi('Time', fmt.yrs(yrs(s))) + '</div>') + F.space(16),
        target, years: yrs, inflation: s => +s.inf || 0
      })
    ],
    compute: s => ({ fv: futureTarget(s) }),
    summary(s, r) {
      const n = yrs(s), inf = +s.inf || 0, inv = NP.investSummary(s, rr => target(s, rr), n, inf), adv = NP.goalAdvice(s, rr => target(s, rr), n, inf);
      const [lic, po, mf] = inv.rows.map(o => o.c);
      const growth = NP.charts.line({
        labels: Array.from({ length: n + 1 }, (_, i) => String(fmt.yearFromNow(i))),
        series: inv.rows.map((o, i) => ({ name: o.x.name + ' (' + fmt.pct(o.r) + ')', color: ['#1b4785', '#5598e7', '#e0a21b'][i], values: Array.from({ length: n + 1 }, (_, k) => NP.fin.fv(o.c.lump, o.r, k)) })),
        tipPrefix: 'Year ', labelLast: true, aria: 'Growth of one-time investment'
      });
      return {
        title: 'Your plan: ' + goalName(s),
        headline: { label: 'Invest today (mutual funds at ' + fmt.pct(s.inv.mf) + ')', value: fmt.inr(mf.lump), note: 'to have <b>' + fmt.short(r.fv) + '</b> for ' + esc(goalName(s).toLowerCase()) + ' in ' + fmt.yearFromNow(n) + '. Or a monthly SIP of ' + fmt.inr(mf.sip) + '.', icon: GOALS[s.goal].icon },
        tiles: [
          ['Target in ' + fmt.yearFromNow(n), fmt.short(r.fv), s.basis === 'today' ? fmt.short(+s.amount) + ' in today’s money' : 'Worth ' + fmt.short(NP.fin.pv(r.fv, inf, n)) + ' today'],
          ['LIC @ ' + fmt.pct(s.inv.lic), fmt.short(lic.lump), 'or ' + fmt.inr(lic.sip) + '/month'],
          ['Post Office @ ' + fmt.pct(s.inv.po), fmt.short(po.lump), 'or ' + fmt.inr(po.sip) + '/month'],
          ['Mutual fund @ ' + fmt.pct(s.inv.mf), fmt.short(mf.lump), 'or ' + fmt.inr(mf.sip) + '/month']
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([
            ['Goal', esc(goalName(s))], ['Amount', fmt.inr(+s.amount) + (s.basis === 'today' ? ' (today’s value)' : ' (future value)')],
            ['Time to goal', fmt.yrs(n) + ' (' + fmt.yearFromNow(n) + ')'], ['Inflation', fmt.pct(inf) + ' p.a.'],
            ['Already saved', fmt.inr(+s.saved || 0)], ['Target corpus', fmt.inr(r.fv)]
          ]) },
          { title: 'Investment needed today: comparison', icon: 'scale', html: inv.bars + '<div style="height:14px"></div>' + inv.table },
          { title: 'How a one-time investment grows', icon: 'trending-up', html: growth + '<div style="height:10px"></div>' + NP.h.note('Each line starts from the one-time amount for that option and reaches the same target of ' + fmt.short(r.fv) + '. Higher returns need a smaller start.') },
          { title: 'Suggested investment mix', icon: 'layers', html: adv.mixHtml }
        ],
        takeaways: [
          'Choosing mutual funds over LIC-type plans for this goal lowers the one-time amount by <b>' + fmt.short(lic.lump - mf.lump) + '</b> (' + fmt.pct((1 - mf.lump / lic.lump) * 100, 0) + ' less).',
          'Real return after ' + fmt.pct(inf) + ' inflation: LIC ' + fmt.pctFixed(lic.real, 1) + ', Post Office ' + fmt.pctFixed(po.real, 1) + ', mutual funds ' + fmt.pctFixed(mf.real, 1) + '.'
        ].concat(adv.takeaways)
      };
    }
  });
})();
