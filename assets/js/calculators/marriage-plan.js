/* Marriage Planner */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  /* Cost per guest for venue+catering, and fixed costs (₹, today, metro). */
  const STYLE = {
    simple:  { t: 'Simple & elegant', d: 'Court / temple wedding with a reception', icon: 'heart', guests: 150, perGuest: 1200, days: 1,
               fx: { decor: 150000, attire: 200000, photo: 80000, invites: 25000, ent: 30000, travel: 60000, misc: 50000 } },
    classic: { t: 'Traditional', d: 'Sangeet, mehendi, wedding and reception', icon: 'gem', guests: 400, perGuest: 1800, days: 2,
               fx: { decor: 500000, attire: 500000, photo: 250000, invites: 75000, ent: 150000, travel: 200000, misc: 150000 } },
    grand:   { t: 'Grand celebration', d: 'Premium banquet, 3 days, large guest list', icon: 'sparkles', guests: 700, perGuest: 2800, days: 3,
               fx: { decor: 1500000, attire: 1000000, photo: 600000, invites: 150000, ent: 500000, travel: 500000, misc: 300000 } },
    dest:    { t: 'Destination wedding', d: 'Udaipur, Goa, Jaipur palace or abroad', icon: 'palm', guests: 200, perGuest: 9000, days: 3,
               fx: { decor: 1800000, attire: 1000000, photo: 700000, invites: 150000, ent: 600000, travel: 1500000, misc: 400000 } }
  };
  const CITY = { metro: ['Metro city', 1], tier2: ['Tier-2 city', 0.8], tier3: ['Smaller town', 0.65] };

  function populate(s) {
    const st = STYLE[s.style], m = CITY[s.city][1], r = v => Math.round(v / 5000) * 5000;
    s.guests = st.guests;
    s.cost = { venue: r(st.guests * st.perGuest * st.days * m) };
    Object.keys(st.fx).forEach(k => { s.cost[k] = r(st.fx[k] * (k === 'travel' && s.style === 'dest' ? 1 : m)); });
  }
  const yrs = s => Math.max(0, (+s.mAge || 0) - (+s.age || 0));
  const goldFV = s => (+s.goldGm || 0) * (+s.goldRate || 0) * Math.pow(1 + (+s.goldInf || 0) / 100, yrs(s));
  const costToday = s => NP.itemsTotal(s.cost);
  const costFV = s => NP.fin.fv(costToday(s), +s.inf || 0, yrs(s));
  const totalFV = s => costFV(s) + goldFV(s);
  const target = (s, r) => Math.max(0, totalFV(s) - NP.fin.fv(+s.saved || 0, r, yrs(s)));

  const state = { who: 'daughter', name: '', age: 8, mAge: 26, style: 'classic', city: 'metro', inf: 7, goldGm: 100, goldRate: 7500, goldInf: 8, saved: 0, cpi: 6 };
  populate(state);

  NP.wizard({
    id: 'marriage-plan', version: 1, state, onReset: populate,
    heading: 'Marriage Planner',
    intro: 'Weddings in India cost more every year. Estimate the full cost, including gold, and plan your savings so the big day is free of loans.',
    steps: [
      {
        title: 'Whose wedding are you planning?', nav: 'About the wedding',
        render: s => F.choices({ k: 'who', value: s.who, wide: true, options: [
          { v: 'daughter', t: 'Daughter’s wedding', icon: 'heart', d: 'Plan for your daughter' },
          { v: 'son', t: 'Son’s wedding', icon: 'users', d: 'Plan for your son' },
          { v: 'self', t: 'My own wedding', icon: 'user', d: 'Plan for yourself' }
        ] }) + F.space(18) + F.grid(
          F.text({ k: 'name', label: 'Name (optional)', value: s.name, placeholder: 'e.g. Priya' }),
          F.number({ k: 'age', label: 'Current age', value: s.age, min: 0, max: 40, suffix: 'years', range: true, minLabel: '0', maxLabel: '40' }),
          F.number({ k: 'mAge', label: 'Expected age at marriage', value: s.mAge, min: 18, max: 45, suffix: 'years', hint: 'Average age at marriage in urban India: 25–28 years' })
        ) + F.space(16) + F.live(''),
        live(s, el) { NP.live(el, yrs(s) > 0 ? '<div class="live-grid">' + F.kpi('Years to go', fmt.yrs(yrs(s))) + F.kpi('Wedding year', String(fmt.yearFromNow(yrs(s))), '', true) + '</div>' : NP.h.note('The marriage age must be higher than the current age.', 'warn')); },
        validate: s => (yrs(s) <= 0 ? 'The marriage age must be higher than the current age.' : '')
      },
      {
        title: 'What kind of wedding?', nav: 'Style & cost',
        sub: 'We estimate today’s cost by style and city. Edit any line to match your plans.',
        render: s => F.choices({ k: 'style', value: s.style, options: Object.keys(STYLE).map(k => ({ v: k, t: STYLE[k].t, d: STYLE[k].d, icon: STYLE[k].icon })) }) + F.space(16) +
          F.grid(F.select({ k: 'city', label: 'Where will it be held?', value: s.city, rerender: true, options: Object.keys(CITY).map(k => [k, CITY[k][0]]) }),
                 F.number({ k: 'guests', label: 'Approximate guests', value: s.guests, min: 20, max: 3000, step: 10, suffix: 'guests', hint: 'Changing guests updates the venue & catering cost' })) + F.space(16) +
          F.items({ k: 'cost', totalLabel: 'Total cost today (without gold)', items: [
            { k: 'venue', label: 'Venue & catering', hint: 'Banquet / lawn, food for all functions' }, { k: 'decor', label: 'Decoration & lighting', hint: 'Mandap, flowers, stage' },
            { k: 'attire', label: 'Clothes & make-up', hint: 'Lehenga, sherwani, family outfits, salon' }, { k: 'photo', label: 'Photography & video', hint: 'Pre-wedding shoot, album, drone' },
            { k: 'invites', label: 'Invitations & gifts', hint: 'Cards, return gifts, shagun' }, { k: 'ent', label: 'Music & entertainment', hint: 'DJ, band, baraat, choreographer' },
            { k: 'travel', label: 'Travel & guest stay', hint: 'Hotel rooms, transport for guests' }, { k: 'misc', label: 'Rituals & miscellaneous', hint: 'Pandit, puja, contingency' }
          ] }, s),
        onChange(s, k) {
          if (k === 'style' || k === 'city') populate(s);
          if (k === 'guests') { const st = STYLE[s.style]; s.cost.venue = Math.round((+s.guests || 0) * st.perGuest * st.days * CITY[s.city][1] / 5000) * 5000; const inp = document.querySelector('[data-ik="venue"]'); if (inp) { inp.value = fmt.num(s.cost.venue); inp.dispatchEvent(new Event('input', { bubbles: true })); } }
        },
        validate: s => (costToday(s) <= 0 ? 'Please enter the wedding costs.' : '')
      },
      {
        title: 'Gold, inflation and savings', nav: 'Gold & inflation',
        sub: 'Gold jewellery is often the largest single item. Its price has historically risen about 8–10% a year in rupees.',
        render: s => F.grid(
          F.number({ k: 'goldGm', label: 'Gold jewellery planned', value: s.goldGm, min: 0, max: 2000, step: 5, suffix: 'grams', hint: '100 g ≈ 10 tola' }),
          F.money({ k: 'goldRate', label: 'Gold price today (per gram, 22K)', value: s.goldRate, hint: 'Update with today’s rate' }),
          F.number({ k: 'inf', label: 'Wedding cost inflation', value: s.inf, min: 0, max: 15, step: 0.5, suffix: '% p.a.', range: true, minLabel: '0%', maxLabel: '15%' }),
          F.number({ k: 'goldInf', label: 'Gold price growth', value: s.goldInf, min: 0, max: 15, step: 0.5, suffix: '% p.a.' }),
          F.money({ k: 'saved', label: 'Already saved for the wedding (optional)', value: s.saved }),
          F.number({ k: 'cpi', label: 'General inflation (for real return)', value: s.cpi, min: 0, max: 15, step: 0.5, suffix: '% p.a.' })
        ) + F.space(18) + F.live(''),
        live(s, el) {
          NP.live(el, '<div class="live-grid">' + F.kpi('Wedding cost then', fmt.short(costFV(s)), 'Today ' + fmt.short(costToday(s))) +
            F.kpi('Gold then', fmt.short(goldFV(s)), (+s.goldGm || 0) + ' g') + F.kpi('Total needed in ' + fmt.yearFromNow(yrs(s)), fmt.short(totalFV(s)), fmt.inr(totalFV(s)), true) + '</div>');
        }
      },
      NP.investStep({
        title: 'How much to invest for the wedding?', nav: 'Investment plan',
        before: s => F.live('<div class="live-grid">' + F.kpi('Total needed', fmt.short(totalFV(s)), 'By ' + fmt.yearFromNow(yrs(s)), true) + F.kpi('Time to invest', fmt.yrs(yrs(s))) + F.kpi('Already saved', fmt.short(+s.saved || 0)) + '</div>') + F.space(16),
        target, years: yrs, inflation: s => +s.cpi || 0
      })
    ],
    compute: s => ({ n: yrs(s), today: costToday(s), fv: costFV(s), gold: goldFV(s), total: totalFV(s) }),
    summary(s, r) {
      const st = STYLE[s.style], whoName = s.name ? esc(s.name) + '’s' : (s.who === 'self' ? 'Your' : 'Your ' + s.who + '’s');
      const inv = NP.investSummary(s, rr => target(s, rr), r.n, +s.cpi || 0), adv = NP.goalAdvice(s, rr => target(s, rr), r.n, +s.cpi || 0, 'the wedding');
      const mf = inv.rows[2].c, po = inv.rows[1].c;
      const labels = { venue: 'Venue & catering', decor: 'Decoration', attire: 'Clothes & make-up', photo: 'Photography', invites: 'Invitations & gifts', ent: 'Entertainment', travel: 'Travel & stay', misc: 'Rituals & misc.' };
      const g = Math.pow(1 + (+s.inf || 0) / 100, r.n);
      return {
        title: whoName + ' wedding plan',
        headline: { label: 'Total wedding budget in ' + fmt.yearFromNow(r.n), value: fmt.inr(r.total), note: st.t + ' wedding for about ' + s.guests + ' guests, plus ' + s.goldGm + ' g of gold. Today the same wedding costs ' + fmt.short(r.today + (+s.goldGm) * (+s.goldRate)) + '.', icon: 'gem' },
        tiles: [
          ['Years to wedding', fmt.yrs(r.n), 'In ' + fmt.yearFromNow(r.n)],
          ['Monthly SIP (MF ' + fmt.pct(s.inv.mf) + ')', fmt.inr(mf.sip), 'or ' + fmt.short(mf.lump) + ' one-time'],
          ['Monthly (Post Office)', fmt.inr(po.sip), 'or ' + fmt.short(po.lump) + ' one-time'],
          ['Gold share', fmt.pct(r.gold / r.total * 100, 0), fmt.short(r.gold) + ' of the budget']
        ],
        sections: [
          { title: 'Wedding details', icon: 'sliders', html: NP.h.kv([
            ['Wedding of', s.name ? esc(s.name) : s.who === 'self' ? 'Self' : s.who === 'son' ? 'Son' : 'Daughter'], ['Current age → marriage age', s.age + ' → ' + s.mAge],
            ['Style', st.t], ['City', CITY[s.city][0]], ['Guests', String(s.guests)], ['Gold', s.goldGm + ' g @ ' + fmt.inr(s.goldRate) + '/g today'],
            ['Wedding inflation', fmt.pct(s.inf) + ' p.a.'], ['Gold price growth', fmt.pct(s.goldInf) + ' p.a.']
          ]) },
          { title: 'Budget: today vs wedding year', icon: 'wallet', html: NP.h.table(['Item', 'Cost today', 'Cost in ' + fmt.yearFromNow(r.n)],
            Object.keys(labels).map(k => [labels[k], fmt.inr(s.cost[k] || 0), fmt.inr((s.cost[k] || 0) * g)]).concat([['Gold jewellery (' + s.goldGm + ' g)', fmt.inr(s.goldGm * s.goldRate), fmt.inr(r.gold)]]),
            { foot: ['Total', fmt.inr(r.today + s.goldGm * s.goldRate), fmt.inr(r.total)] }) },
          { title: 'How much to invest: three options', icon: 'scale', html: inv.bars + '<div style="height:14px"></div>' + inv.table },
          { title: 'Suggested investment mix', icon: 'layers', html: adv.mixHtml }
        ],
        takeaways: [
          'Buy part of the gold over time through <b>Gold ETFs, gold mutual funds or a jeweller’s gold scheme</b> to average out the price.'
        ].concat(adv.takeaways, ['A wedding loan at 12–16% interest could add ' + fmt.short(NP.fin.emi(r.total, 14, 60) * 60 - r.total) + ' in interest over 5 years. Saving in advance avoids this.'])
      };
    }
  });
})();
