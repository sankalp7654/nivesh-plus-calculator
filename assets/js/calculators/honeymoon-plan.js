/* Honeymoon Planner */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  /* Per couple, today, mid-range: flight (return, both), hotel/night, food+local/day per couple, activities/day, visa+insurance */
  const DEST = {
    goa:      { t: 'Goa', d: 'Beaches & nightlife', icon: 'palm', intl: false, nights: 5, fl: 18000, ht: 6000, fd: 3500, ac: 2000, vi: 0 },
    kerala:   { t: 'Kerala', d: 'Backwaters, Munnar, houseboat', icon: 'palm', intl: false, nights: 6, fl: 22000, ht: 6500, fd: 3000, ac: 2500, vi: 0 },
    andaman:  { t: 'Andaman', d: 'Havelock, scuba, white sand', icon: 'palm', intl: false, nights: 6, fl: 34000, ht: 7500, fd: 3500, ac: 4000, vi: 0 },
    himachal: { t: 'Kashmir / Himachal', d: 'Gulmarg, Manali, snow', icon: 'mountain', intl: false, nights: 6, fl: 20000, ht: 6000, fd: 3000, ac: 3000, vi: 0 },
    thailand: { t: 'Thailand', d: 'Phuket, Krabi, Bangkok', icon: 'plane', intl: true, nights: 6, fl: 50000, ht: 6500, fd: 4500, ac: 4500, vi: 6000 },
    bali:     { t: 'Bali', d: 'Villas, temples, beaches', icon: 'plane', intl: true, nights: 6, fl: 62000, ht: 8000, fd: 4000, ac: 4000, vi: 8000 },
    dubai:    { t: 'Dubai', d: 'Desert safari, shopping', icon: 'building', intl: true, nights: 5, fl: 50000, ht: 10000, fd: 6000, ac: 7000, vi: 14000 },
    maldives: { t: 'Maldives', d: 'Overwater villa, all-inclusive', icon: 'palm', intl: true, nights: 5, fl: 60000, ht: 30000, fd: 8000, ac: 6000, vi: 3000 },
    europe:   { t: 'Europe', d: 'Switzerland, Paris, Italy', icon: 'globe', intl: true, nights: 9, fl: 130000, ht: 14000, fd: 9000, ac: 7000, vi: 30000 }
  };
  const TIER = { budget: ['Budget', 0.65, 0.8], comfort: ['Comfort (3–4★)', 1, 1], luxury: ['Luxury (5★)', 2.2, 1.6] };

  function populate(s) {
    const d = DEST[s.dest], t = TIER[s.tier], r = v => Math.round(v / 1000) * 1000;
    s.nights = s.nights && s._lastDest === s.dest ? s.nights : d.nights;
    s._lastDest = s.dest;
    const n = +s.nights || d.nights;
    s.cost = { fl: r(d.fl * t[2]), ht: r(d.ht * t[1] * n), fd: r(d.fd * t[2] * (n + 1)), ac: r(d.ac * t[2] * n), vi: d.vi, sh: r((d.intl ? 30000 : 15000) * t[2]) };
  }
  const months = s => Math.max(1, +s.months || 0);
  const yrs = s => months(s) / 12;
  const costToday = s => NP.itemsTotal(s.cost);
  const costFV = s => NP.fin.fv(costToday(s), +s.inf || 0, yrs(s));
  const target = (s, r) => Math.max(0, costFV(s) - NP.fin.fv(+s.saved || 0, r, yrs(s)));

  const state = { dest: 'bali', tier: 'comfort', nights: 6, months: 18, inf: 6, saved: 0 };
  populate(state);

  NP.wizard({
    id: 'honeymoon-plan', version: 1, state, onReset: populate,
    heading: 'Honeymoon Planner',
    intro: 'Pick a destination and travel style. We estimate the full trip cost for two, project it to your travel date and show the monthly saving needed.',
    steps: [
      {
        title: 'Where would you like to go?', nav: 'Destination',
        render: s => '<div class="field-label" style="margin-bottom:8px">Within India</div>' +
          F.choices({ k: 'dest', value: s.dest, options: Object.keys(DEST).filter(k => !DEST[k].intl).map(k => ({ v: k, t: DEST[k].t, d: DEST[k].d, icon: DEST[k].icon })) }) + F.space(16) +
          '<div class="field-label" style="margin-bottom:8px">International</div>' +
          F.choices({ k: 'dest', value: s.dest, options: Object.keys(DEST).filter(k => DEST[k].intl).map(k => ({ v: k, t: DEST[k].t, d: DEST[k].d, icon: DEST[k].icon })) }),
        onChange: (s, k) => { if (k === 'dest') populate(s); }
      },
      {
        title: s => 'Your trip to ' + DEST[s.dest].t, nav: 'Trip cost',
        sub: 'Estimated cost for two people in today’s prices. Adjust anything you like.',
        render: s => F.grid(
          F.segmented({ k: 'tier', label: 'Travel style', value: s.tier, options: Object.keys(TIER).map(k => [k, TIER[k][0]]) }),
          F.number({ k: 'nights', label: 'Number of nights', value: s.nights, min: 2, max: 21, suffix: 'nights', range: true, minLabel: '2', maxLabel: '21' })
        ) + F.space(16) + F.items({ k: 'cost', totalLabel: 'Total trip cost (for two)', items: [
          { k: 'fl', label: 'Flights (return, two people)' }, { k: 'ht', label: 'Hotel / resort', hint: 'All nights' },
          { k: 'fd', label: 'Food & local travel', hint: 'Meals, cabs, ferries, transfers' }, { k: 'ac', label: 'Sightseeing & activities', hint: 'Tours, water sports, candlelight dinner' },
          { k: 'vi', label: DEST[s.dest].intl ? 'Visa, forex & travel insurance' : 'Travel insurance & permits' }, { k: 'sh', label: 'Shopping & gifts' }
        ] }, s) + F.space(14) + F.live(''),
        onChange: (s, k) => { if (k === 'tier') populate(s); if (k === 'nights') { populate(s); } },
        live(s, el) {
          if (el.dataset.nightsBound !== String(s.nights)) {
            el.dataset.nightsBound = s.nights;
            ['fl', 'ht', 'fd', 'ac', 'vi', 'sh'].forEach(k => { const i = el.querySelector('[data-ik="' + k + '"]'); if (i && document.activeElement !== i) i.value = fmt.num(s.cost[k]); });
            const t = el.querySelector('[data-items-total="cost"]'); if (t) t.textContent = fmt.inr(costToday(s));
            const w = el.querySelector('[data-items-words="cost"]'); if (w) w.textContent = fmt.words(costToday(s));
          }
          NP.live(el, '<div class="live-grid">' + F.kpi('Per person', fmt.short(costToday(s) / 2)) + F.kpi('Per night (for two)', fmt.inr(costToday(s) / Math.max(1, +s.nights))) + F.kpi('Total today', fmt.short(costToday(s)), fmt.inr(costToday(s)), true) + '</div>');
        },
        validate: s => (costToday(s) <= 0 ? 'Please enter the trip costs.' : '')
      },
      {
        title: 'When are you travelling?', nav: 'Travel date',
        sub: 'Travel costs rise every year. We project the budget to your travel month.',
        render: s => F.grid(
          F.number({ k: 'months', label: 'Months until the trip', value: s.months, min: 1, max: 120, suffix: 'months', range: true, minLabel: '1 month', maxLabel: '10 years' }),
          F.number({ k: 'inf', label: 'Travel cost inflation', value: s.inf, min: 0, max: 15, step: 0.5, suffix: '% p.a.' }),
          F.money({ k: 'saved', label: 'Already saved for the trip (optional)', value: s.saved })
        ) + F.space(18) + F.live(''),
        live(s, el) {
          const d = new Date(); d.setMonth(d.getMonth() + months(s));
          NP.live(el, '<div class="live-grid">' + F.kpi('Travel around', d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })) + F.kpi('Cost today', fmt.short(costToday(s))) + F.kpi('Budget needed then', fmt.short(costFV(s)), fmt.inr(costFV(s)), true) + '</div>');
        }
      },
      NP.investStep({
        title: 'Save for your honeymoon', nav: 'Saving plan',
        sub: s => months(s) < 36 ? 'For trips within 3 years, keep the money safe: Post Office RD or a short-term debt fund works best.' : 'Compare the three options and pick a return from each drop-down.',
        before: s => F.live('<div class="live-grid">' + F.kpi('Budget needed', fmt.short(costFV(s)), 'In ' + months(s) + ' months', true) + F.kpi('Monthly saving (no growth)', fmt.inr(target(s, 0) / months(s))) + F.kpi('Already saved', fmt.short(+s.saved || 0)) + '</div>') + F.space(16),
        target, years: yrs, inflation: s => +s.inf || 0
      })
    ],
    compute: s => ({ today: costToday(s), fv: costFV(s), m: months(s) }),
    summary(s, r) {
      const d = DEST[s.dest], inv = NP.investSummary(s, rr => target(s, rr), yrs(s), +s.inf || 0), po = inv.rows[1].c, mf = inv.rows[2].c;
      const dt = new Date(); dt.setMonth(dt.getMonth() + r.m);
      const labels = { fl: 'Flights', ht: 'Hotel / resort', fd: 'Food & local travel', ac: 'Sightseeing & activities', vi: d.intl ? 'Visa, forex & insurance' : 'Insurance & permits', sh: 'Shopping & gifts' };
      const g = Math.pow(1 + (+s.inf || 0) / 100, yrs(s));
      return {
        title: 'Your honeymoon in ' + d.t,
        headline: { label: 'Save every month (Post Office RD ' + fmt.pct(s.inv.po) + ')', value: fmt.inr(po.sip), note: 'to have <b>' + fmt.short(r.fv) + '</b> for ' + s.nights + ' nights in ' + esc(d.t) + ', ' + TIER[s.tier][0] + ' style, around ' + dt.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + '.', icon: 'plane' },
        tiles: [
          ['Trip cost today', fmt.short(r.today), fmt.short(r.today / 2) + ' per person'],
          ['Budget at travel time', fmt.short(r.fv), 'At ' + fmt.pct(s.inf) + ' travel inflation'],
          ['One-time today (PO)', fmt.short(po.lump), 'Post Office @ ' + fmt.pct(s.inv.po)],
          ['Monthly SIP (MF)', fmt.inr(mf.sip), 'MF @ ' + fmt.pct(s.inv.mf)]
        ],
        sections: [
          { title: 'Trip details', icon: 'sliders', html: NP.h.kv([['Destination', esc(d.t) + (d.intl ? ' (international)' : ' (India)')], ['Style', TIER[s.tier][0]], ['Duration', s.nights + ' nights'], ['Travel in', r.m + ' months'], ['Travel inflation', fmt.pct(s.inf) + ' p.a.'], ['Already saved', fmt.inr(+s.saved || 0)]]) },
          { title: 'Trip budget for two', icon: 'wallet', html: NP.h.table(['Item', 'Cost today', 'At travel time'], Object.keys(labels).map(k => [labels[k], fmt.inr(s.cost[k] || 0), fmt.inr((s.cost[k] || 0) * g)]), { foot: ['Total', fmt.inr(r.today), fmt.inr(r.fv)] }) },
          { title: 'How to save for it', icon: 'scale', html: inv.table + '<div style="height:10px"></div>' + NP.h.note(r.m < 36 ? 'With less than 3 years to go, equity mutual funds are not recommended. Use a Post Office RD or a liquid / short-term debt fund.' : 'For 3–5 years, a hybrid fund or Post Office scheme balances growth and safety.', r.m < 36 ? 'warn' : '') }
        ],
        takeaways: [
          'Book flights 3–4 months early and travel off-season to save 20–30% on this budget.',
          d.intl ? 'Use a <b>forex card</b> instead of credit cards abroad to avoid 3.5% mark-up fees.' : 'Many hotels offer honeymoon packages with free upgrades. Ask when booking.',
          'Start a <b>' + fmt.inr(po.sip) + '/month</b> Post Office RD today and set it to auto-debit after salary day.',
          'Buy travel insurance for the trip, and make sure both of you have <b>health and term cover</b> as you start your married life.'
        ]
      };
    }
  });
})();
