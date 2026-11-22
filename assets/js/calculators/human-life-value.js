/* Human Life Value (inflation-adjusted income replacement) */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  const work = s => Math.max(0, (+s.retAge || 0) - (+s.age || 0));
  function calc(s) {
    const n = work(s), inc = +s.income || 0, self = (+s.selfPct || 0) / 100;
    const contribution = inc * (1 - self);
    const hlv = NP.fin.pvGrowingDue(contribution, +s.growth || 0, +s.disc || 0, n);
    const goals = NP.itemsTotal(s.goals), loans = NP.itemsTotal(s.loans);
    const need = hlv + goals + loans + (+s.emergency || 0);
    const have = (+s.cover || 0) + (+s.assets || 0);
    const gap = Math.max(0, need - have);
    const roundUp = v => (v <= 0 ? 0 : Math.ceil(v / 2500000) * 2500000);
    const real = NP.fin.real(+s.disc || 0, +s.growth || 0);
    return { n, contribution, hlv, goals, loans, need, have, gap, recommend: roundUp(gap), multiple: inc ? need / inc : 0, real };
  }

  NP.wizard({
    id: 'human-life-value', version: 1,
    heading: 'Human Life Value Calculator',
    intro: 'How much life insurance does your family really need? We value your future income, grow it with inflation, then add loans and goals.',
    state: { name: '', age: 32, retAge: 60, dependents: '3', income: 1200000, selfPct: 25, growth: 6, disc: 8,
             loans: { home: 2500000, car: 0, other: 0 }, goals: { edu: 2500000, marriage: 2000000, other: 0 }, emergency: 300000, cover: 5000000, assets: 800000 },
    steps: [
      {
        title: 'Tell us about yourself', nav: 'About you',
        sub: 'Your human life value is the money your family would lose if your income stopped today.',
        render: s => F.grid(
          F.text({ k: 'name', label: 'Your name (optional)', value: s.name, placeholder: 'e.g. Rahul Sharma' }),
          F.select({ k: 'dependents', label: 'Family members who depend on you', value: s.dependents, options: [['1', '1 (spouse or parent)'], ['2', '2'], ['3', '3 (e.g. spouse + 2 children)'], ['4', '4'], ['5', '5 or more']] }),
          F.number({ k: 'age', label: 'Your current age', value: s.age, min: 18, max: 65, suffix: 'years', range: true, minLabel: '18', maxLabel: '65' }),
          F.number({ k: 'retAge', label: 'Planned retirement age', value: s.retAge, min: 40, max: 75, suffix: 'years', range: true, minLabel: '40', maxLabel: '75' })
        ) + F.space(16) + F.live(''),
        live: (s, el) => NP.live(el, work(s) > 0 ? '<div class="live-grid">' + F.kpi('Earning years left', fmt.yrs(work(s)), 'Until ' + fmt.yearFromNow(work(s)), true) + '</div>' : NP.h.note('Retirement age must be higher than your current age.', 'warn')),
        validate: s => (work(s) <= 0 ? 'Retirement age must be higher than your current age.' : '')
      },
      {
        title: 'Your income, with inflation', nav: 'Income & inflation',
        sub: 'Your income will grow over the years. We grow it every year and discount it back to today’s value at a safe return.',
        render: s => F.grid(
          F.money({ k: 'income', label: 'Annual income (after tax)', value: s.income, hint: 'Take-home salary or business income per year' }),
          F.number({ k: 'selfPct', label: 'Spent on yourself', value: s.selfPct, min: 0, max: 60, suffix: '% of income', range: true, minLabel: '0%', maxLabel: '60%', hint: 'Your personal spending, which stops with you. Usually 20–30%.' }),
          F.number({ k: 'growth', label: 'Yearly income growth (inflation)', value: s.growth, min: 0, max: 15, step: 0.5, suffix: '% p.a.', hint: 'Keeps the cover in step with inflation. 5–8% is typical.' }),
          F.number({ k: 'disc', label: 'Safe return on the insurance money', value: s.disc, min: 1, max: 15, step: 0.5, suffix: '% p.a.', hint: 'What your family could earn safely on the payout (FD, Post Office)' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const r = calc(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Family’s share each year', fmt.short(r.contribution), 'Grows ' + fmt.pct(s.growth) + ' a year') +
            F.kpi('Income in final year', fmt.short(r.contribution * Math.pow(1 + s.growth / 100, Math.max(0, r.n - 1))), 'At age ' + (+s.retAge - 1)) +
            F.kpi('Income value (HLV)', fmt.short(r.hlv), 'Over ' + fmt.yrs(r.n), true) + '</div>');
        },
        validate: s => (!(+s.income > 0) ? 'Please enter your annual income.' : '')
      },
      {
        title: 'Loans and family goals', nav: 'Loans & goals',
        sub: 'Insurance should also clear any loans and fund your children’s important goals. Enter goals in today’s value.',
        render: s => '<div class="field-label" style="margin-bottom:8px">Outstanding loans</div>' +
          F.items({ k: 'loans', totalLabel: 'Total loans', items: [{ k: 'home', label: 'Home loan' }, { k: 'car', label: 'Car / vehicle loan' }, { k: 'other', label: 'Personal, business or other loans' }] }, s) + F.space(14) +
          '<div class="field-label" style="margin-bottom:8px">Future goals for the family</div>' +
          F.items({ k: 'goals', totalLabel: 'Total goals', items: [{ k: 'edu', label: 'Children’s higher education', hint: 'Use the Child Education Planner for an exact figure' }, { k: 'marriage', label: 'Children’s marriage' }, { k: 'other', label: 'Other goals', hint: 'House, parents’ care, etc.' }] }, s) + F.space(14) +
          F.grid(F.money({ k: 'emergency', label: 'Emergency & final expenses', value: s.emergency, hint: '6 months of expenses is a good rule' }))
      },
      {
        title: 'What you already have', nav: 'Existing cover',
        sub: 'Existing life insurance and savings reduce the new cover you need.',
        render: s => F.grid(
          F.money({ k: 'cover', label: 'Existing life insurance cover', value: s.cover, hint: 'Total sum assured of all LIC, term and employer policies' }),
          F.money({ k: 'assets', label: 'Savings & investments', value: s.assets, hint: 'FD, PPF, MF, shares. Do not include your home.' })
        ) + F.space(16) + F.live(''),
        live(s, el) {
          const r = calc(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Total need', fmt.short(r.need)) + F.kpi('You already have', fmt.short(r.have)) + F.kpi('Additional cover needed', fmt.short(r.gap), r.gap ? 'Recommended: ' + fmt.short(r.recommend) : 'You are well covered', true) + '</div>');
        }
      }
    ],
    compute: calc,
    summary(s, r) {
      const covered = r.need > 0 ? Math.min(100, (r.have / r.need) * 100) : 100;
      const st = covered >= 100 ? { cls: 'good', icon: 'check-circle', label: 'Fully covered' } : covered >= 60 ? { cls: 'warn', icon: 'alert', label: 'Partly covered' } : { cls: 'bad', icon: 'x-circle', label: 'Under-insured' };
      const yrsRows = []; let cum = 0;
      for (let k = 0; k < r.n; k++) {
        const inc = r.contribution * Math.pow(1 + s.growth / 100, k), pv = inc / Math.pow(1 + s.disc / 100, k);
        cum += pv;
        if (k % 5 === 0 || k === r.n - 1) yrsRows.push([String(+s.age + k), String(fmt.yearFromNow(k)), fmt.inr(inc), fmt.inr(pv), fmt.inr(cum)]);
      }
      return {
        title: (s.name ? esc(s.name) + '’s ' : 'Your ') + 'life cover need',
        headline: { label: r.gap > 0 ? 'Recommended additional life cover' : 'Your family is well protected', value: r.gap > 0 ? fmt.inr(r.recommend) : fmt.inr(r.have), note: 'Total protection needed: <b>' + fmt.short(r.need) + '</b> (' + r.multiple.toFixed(1) + '× your annual income). You already have ' + fmt.short(r.have) + '.', icon: 'umbrella' },
        tiles: [
          ['Human life value', fmt.short(r.hlv), 'Income value, inflation-adjusted'],
          ['Loans + goals', fmt.short(r.loans + r.goals + (+s.emergency || 0)), 'Including emergency fund'],
          ['Existing cover + assets', fmt.short(r.have), fmt.pct(covered, 0) + ' of the need'],
          ['Protection status', NP.status(st), r.gap > 0 ? 'Gap of ' + fmt.short(r.gap) : 'No gap']
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([
            ['Age / retirement age', s.age + ' / ' + s.retAge], ['Dependents', String(s.dependents)], ['Annual income', fmt.inr(s.income)],
            ['Spent on self', fmt.pct(s.selfPct)], ['Income growth (inflation)', fmt.pct(s.growth) + ' p.a.'], ['Safe return (discount rate)', fmt.pct(s.disc) + ' p.a.']
          ]) },
          { title: 'How we calculated your cover', icon: 'calculator', html: NP.h.table(['Component', 'Amount'], [
            ['Human life value (family’s share of income for ' + r.n + ' years)', fmt.inr(r.hlv)],
            ['+ Outstanding loans', fmt.inr(r.loans)], ['+ Children’s education, marriage & other goals', fmt.inr(r.goals)],
            ['+ Emergency & final expenses', fmt.inr(+s.emergency || 0)], ['<b>= Total protection needed</b>', '<b>' + fmt.inr(r.need) + '</b>'],
            ['− Existing life cover', fmt.inr(+s.cover || 0)], ['− Savings & investments', fmt.inr(+s.assets || 0)],
            { cells: ['<b>Additional cover needed</b>', '<b>' + fmt.inr(r.gap) + '</b>'], hl: true }
          ]) },
          { title: 'Protection: need vs. what you have', icon: 'bar-chart', html: NP.charts.split({ parts: [{ label: 'Already covered', value: Math.min(r.have, r.need), color: 'var(--series-1)' }, { label: 'Protection gap', value: r.gap, color: 'var(--series-2)' }] }) },
          { title: 'Your income value, year by year', icon: 'calendar', allowBreak: true, html: NP.h.table(['Age', 'Year', 'Family’s share', 'Value today', 'Running total'], yrsRows) + '<div style="height:8px"></div>' + NP.h.note('Each year’s income grows at ' + fmt.pct(s.growth) + ' and is discounted at ' + fmt.pct(s.disc) + '. The real (inflation-adjusted) discount rate is ' + fmt.pctFixed(r.real, 2) + '.') }
        ],
        takeaways: (r.gap > 0 ? [
          'Buy a <b>pure term insurance plan of ' + fmt.short(r.recommend) + '</b> till age ' + s.retAge + '. Term insurance gives the highest cover for the lowest premium.',
          'Choose an <b>increasing cover</b> term plan, or review the cover every 3 years, so it keeps pace with ' + fmt.pct(s.growth) + ' inflation.'
        ] : ['Your current cover meets your family’s needs. Review it whenever your income, loans or family size changes.']).concat([
          'Add a <b>critical illness</b> and <b>accidental disability</b> rider. A disability can stop income just like death.',
          'Make sure every policy has an up-to-date <b>nominee</b>, and tell your family where the documents are kept.',
          'Keep investments separate from insurance: use LIC endowment plans for guaranteed savings, but get the bulk of your cover from a term plan.'
        ])
      };
    }
  });
})();
