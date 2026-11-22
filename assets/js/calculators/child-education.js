/* Child Education Planner */
(function () {
  'use strict';
  const NP = window.NP, F = NP.F, fmt = NP.fmt, esc = NP.esc;

  /* Average yearly cost TODAY (₹, 2026 estimates) for a metro city with hostel stay.
     gov = government / top public institute, pvt = private institute.
     y: tuition & college fees, h: hostel & mess, t: local transport, b: books, laptop & other
     o: one-time (entrance coaching + admission/deposit) */
  const EDU = {
    engg:   { t: 'Engineering', d: 'B.Tech / B.E. · JEE, IITs, NITs', icon: 'laptop', dur: 4, age: 18,
              gov: { y: 225000, h: 110000, t: 30000, b: 45000, o: 280000 }, pvt: { y: 380000, h: 160000, t: 36000, b: 55000, o: 330000 } },
    medical:{ t: 'Medical (MBBS)', d: '4.5 yrs + 1 yr internship · NEET', icon: 'stethoscope', dur: 5.5, age: 18,
              gov: { y: 90000, h: 95000, t: 30000, b: 75000, o: 330000 }, pvt: { y: 1500000, h: 200000, t: 36000, b: 90000, o: 500000 } },
    dental: { t: 'Dental (BDS)', d: '4 yrs + 1 yr internship · NEET', icon: 'stethoscope', dur: 5, age: 18,
              gov: { y: 75000, h: 90000, t: 30000, b: 70000, o: 300000 }, pvt: { y: 550000, h: 170000, t: 36000, b: 85000, o: 380000 } },
    mgmt:   { t: 'Management (MBA)', d: 'IIMs & top B-schools · CAT', icon: 'briefcase', dur: 2, age: 22,
              gov: { y: 1150000, h: 160000, t: 30000, b: 60000, o: 90000 }, pvt: { y: 800000, h: 180000, t: 36000, b: 60000, o: 110000 } },
    law:    { t: 'Law', d: 'Integrated BA LLB (5 yrs) · CLAT', icon: 'scale', dur: 5, age: 18,
              gov: { y: 300000, h: 120000, t: 30000, b: 35000, o: 150000 }, pvt: { y: 350000, h: 160000, t: 36000, b: 40000, o: 180000 } },
    ca:     { t: 'Chartered Accountancy', d: 'CA Foundation → Final with articleship', icon: 'bar-chart', dur: 4.5, age: 18,
              gov: { y: 90000, h: 110000, t: 30000, b: 30000, o: 60000 }, pvt: { y: 180000, h: 160000, t: 36000, b: 35000, o: 80000 } },
    design: { t: 'Design / Fashion', d: 'B.Des · NID, NIFT, private', icon: 'palette', dur: 4, age: 18,
              gov: { y: 320000, h: 130000, t: 30000, b: 80000, o: 150000 }, pvt: { y: 500000, h: 170000, t: 36000, b: 90000, o: 180000 } },
    arch:   { t: 'Architecture', d: 'B.Arch (5 yrs) · NATA / JEE Paper 2', icon: 'building', dur: 5, age: 18,
              gov: { y: 130000, h: 110000, t: 30000, b: 70000, o: 150000 }, pvt: { y: 320000, h: 160000, t: 36000, b: 80000, o: 180000 } },
    pharma: { t: 'Pharmacy', d: 'B.Pharm · state & private colleges', icon: 'flask', dur: 4, age: 18,
              gov: { y: 70000, h: 90000, t: 30000, b: 35000, o: 80000 }, pvt: { y: 180000, h: 140000, t: 36000, b: 40000, o: 100000 } },
    grad:   { t: 'Graduation', d: 'B.Sc / B.Com / BA · DU, state universities', icon: 'book', dur: 3, age: 18,
              gov: { y: 30000, h: 90000, t: 30000, b: 25000, o: 40000 }, pvt: { y: 160000, h: 140000, t: 36000, b: 30000, o: 60000 } },
    abroad: { t: 'Masters Abroad', d: 'MS / MBA in USA, UK, Canada, Australia', icon: 'globe', dur: 2, age: 22, abroad: true,
              gov: { y: 2200000, h: 1100000, t: 180000, b: 150000, o: 250000 }, pvt: { y: 3500000, h: 1300000, t: 200000, b: 170000, o: 300000 } }
  };
  const CITY = {
    metro: { t: 'Metro city', d: 'Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Pune, Kolkata', m: 1 },
    tier2: { t: 'Tier-2 city', d: 'Jaipur, Lucknow, Indore, Chandigarh, Kochi, Bhopal…', m: 0.78 },
    tier3: { t: 'Smaller city', d: 'Tier-3 towns and district HQs', m: 0.62 }
  };
  const STAY = {
    hostel: { t: 'College hostel', d: 'Hostel room + mess food', m: 1 },
    pg:     { t: 'PG / rented flat', d: 'Rent, food, utilities', m: 1.4 },
    home:   { t: 'Living at home', d: 'Daily commute, home food', m: 0.3, tm: 1.5 }
  };

  function populate(s) {
    const e = EDU[s.domain], c = e[s.inst], cm = e.abroad ? 1 : CITY[s.city].m, st = STAY[e.abroad ? 'hostel' : s.stay];
    const r = v => Math.round(v / 1000) * 1000;
    s.cost = { y: c.y, h: r(c.h * cm * st.m), t: r(c.t * cm * (st.tm || 1)), b: c.b };
    s.once = { o: c.o, l: 70000 };
    s.dur = e.dur;
    s.startAge = e.age;
  }
  const yearly = s => NP.itemsTotal(s.cost);
  const onceT = s => NP.itemsTotal(s.once);
  const yrsTo = s => Math.max(0, (+s.startAge || 0) - (+s.age || 0));

  function schedule(s) {
    const n = yrsTo(s), inf = +s.eduInf || 0, Y = yearly(s), rows = [];
    let fvTot = 0, todayTot = 0;
    const once = onceT(s) * Math.pow(1 + inf / 100, n);
    for (let k = 0; k < Math.ceil(s.dur); k++) {
      const frac = Math.min(1, s.dur - k), today = Y * frac, fv = NP.fin.fv(today, inf, n + k);
      rows.push({ k, year: fmt.yearFromNow(n + k), age: (+s.startAge) + k, today, fv, frac });
      fvTot += fv; todayTot += today;
    }
    return { n, rows, once, fvTot: fvTot + once, todayTot: todayTot + onceT(s), courseToday: todayTot };
  }
  const target = (s, r) => Math.max(0, schedule(s).fvTot - NP.fin.fv(+s.saved || 0, r, yrsTo(s)));

  const state = { domain: 'engg', inst: 'pvt', city: 'metro', stay: 'hostel', child: '', age: 5, eduInf: 10, cpi: 6, saved: 0 };
  populate(state);

  NP.wizard({
    id: 'child-education', version: 2, state,
    heading: 'Child Education Planner',
    intro: 'Plan your child’s higher education in four steps: choose the course, review today’s full cost, project it to the admission year, and see how much to invest today.',
    onReset: populate,
    steps: [
      {
        title: 'What would you like your child to study?', nav: 'Choose the course',
        sub: 'Choose a field. You can fine-tune every cost in the next step.',
        render: s => F.choices({ k: 'domain', value: s.domain, options: Object.keys(EDU).map(k => ({ v: k, t: EDU[k].t, d: EDU[k].d, icon: EDU[k].icon })) }),
        onChange: (s, k) => { if (k === 'domain') populate(s); }
      },
      {
        title: s => 'Today’s cost of ' + EDU[s.domain].t, nav: 'Cost today',
        sub: 'Average costs in today’s money, including fees, hostel and transport. Edit any figure to match the college you have in mind.',
        render(s) {
          const e = EDU[s.domain];
          return F.grid(
            F.segmented({ k: 'inst', label: 'Type of institute', value: s.inst, options: [['gov', e.abroad ? 'Public university' : 'Government'], ['pvt', e.abroad ? 'Private university' : 'Private']] }),
            e.abroad ? '<div class="field"><div class="field-label">City</div>' + NP.h.note('Living costs for study abroad are averaged across popular destinations.') + '</div>'
              : F.select({ k: 'city', label: 'Where will the college be?', value: s.city, rerender: true, options: Object.keys(CITY).map(k => [k, CITY[k].t + ' (' + CITY[k].d.split(',').slice(0, 3).join(',') + ')']) }),
            e.abroad ? '' : F.segmented({ k: 'stay', label: 'Where will your child stay?', value: s.stay, options: Object.keys(STAY).map(k => [k, STAY[k].t]) }),
            F.number({ k: 'dur', label: 'Course duration', value: s.dur, min: 1, max: 8, step: 0.5, suffix: 'years' })
          ) + F.space(20) +
            '<div class="field-label" style="margin-bottom:8px">Yearly expenses</div>' +
            F.items({ k: 'cost', totalLabel: 'Total per year', items: [
              { k: 'y', label: 'Tuition & college fees', hint: 'Including exam, lab and development fees' },
              { k: 'h', label: e.abroad ? 'Accommodation & food' : STAY[s.stay].t + ' & food', hint: e.abroad ? 'Rent, groceries, utilities, health insurance' : STAY[s.stay].d },
              { k: 't', label: 'Local transport', hint: e.abroad ? 'Including flights home' : (s.stay === 'home' ? 'Daily metro / bus / cab commute' : 'Metro, bus, auto and trips home') },
              { k: 'b', label: 'Books, devices & personal', hint: 'Study material, mobile, clothes, pocket money' }
            ] }, s) + F.space(14) +
            '<div class="field-label" style="margin-bottom:8px">One-time expenses</div>' +
            F.items({ k: 'once', totalLabel: 'Total one-time', items: [
              { k: 'o', label: e.abroad ? 'Tests, applications & visa' : 'Entrance coaching & admission', hint: e.abroad ? 'GRE / GMAT / IELTS, application fees, visa, deposit' : 'Coaching for the entrance exam, admission and caution deposit' },
              { k: 'l', label: 'Laptop & setting up', hint: 'Laptop, bedding, travel to college' }
            ] }, s) + F.space(16) + F.live('');
        },
        onChange: (s, k) => { if (k === 'inst' || k === 'city' || k === 'stay') { const d = s.dur; populate(s); if (k !== 'inst') s.dur = d; } },
        live(s, el) {
          const Y = yearly(s);
          NP.live(el, '<div class="live-grid">' + F.kpi('Per year', fmt.short(Y), fmt.inr(Y)) + F.kpi('Monthly average', fmt.inr(Y / 12), 'Spread across 12 months') +
            F.kpi('Full course today', fmt.short(Y * s.dur + onceT(s)), fmt.yrs(+s.dur || 0) + ' + one-time costs', true) + '</div>');
        },
        validate: s => (!(s.dur > 0) ? 'Please enter the course duration.' : yearly(s) <= 0 ? 'Please enter at least one yearly cost.' : '')
      },
      {
        title: 'When will your child start college?', nav: 'Timeline & future cost',
        sub: 'Education costs in India rise by about 10–12% a year, faster than general inflation. We project every year of the course to the year it is paid.',
        render: s => F.grid(
          F.text({ k: 'child', label: 'Child’s name (optional)', value: s.child, placeholder: 'e.g. Aarav' }),
          F.number({ k: 'age', label: 'Child’s current age', value: s.age, min: 0, max: 25, range: true, suffix: 'years', minLabel: 'Newborn', maxLabel: '25 yrs' }),
          F.number({ k: 'startAge', label: 'Age when the course starts', value: s.startAge, min: 15, max: 30, suffix: 'years', hint: 'Typical age in India for ' + esc(EDU[s.domain].t) + ': <b>' + EDU[s.domain].age + '</b>' }),
          F.number({ k: 'eduInf', label: 'Education inflation', value: s.eduInf, min: 0, max: 20, step: 0.5, suffix: '% p.a.', range: true, minLabel: '0%', maxLabel: '20%', hint: 'India average 10–12% for professional courses' }),
          F.money({ k: 'saved', label: 'Already saved for this goal (optional)', value: s.saved, hint: 'Existing FD, PPF, Sukanya or MF set aside for education' }),
          F.number({ k: 'cpi', label: 'General inflation (for real return)', value: s.cpi, min: 0, max: 15, step: 0.5, suffix: '% p.a.' })
        ) + F.space(18) + F.live(''),
        live(s, el) {
          const sc = schedule(s), nm = s.child ? esc(s.child) : 'your child';
          if (yrsTo(s) <= 0) return NP.live(el, NP.h.note('The course start age must be higher than the child’s current age.', 'warn'));
          NP.live(el, '<div class="live-grid">' + F.kpi('Years to go', fmt.yrs(sc.n), 'Admission in ' + fmt.yearFromNow(sc.n)) +
            F.kpi('Course cost today', fmt.short(sc.todayTot)) + F.kpi('Cost when ' + nm + ' studies', fmt.short(sc.fvTot), fmt.inr(sc.fvTot), true) + '</div>' +
            '<div style="margin-top:14px">' + NP.charts.line({ labels: Array.from({ length: sc.n + 1 }, (_, i) => String(fmt.yearFromNow(i))), series: [{ name: 'Full course cost', color: 'var(--series-1)', area: true, values: Array.from({ length: sc.n + 1 }, (_, i) => sc.todayTot * Math.pow(1 + s.eduInf / 100, i)) }], height: 200, aria: 'Rising cost of the course' }) + '</div>');
        },
        validate: s => (s.age === '' || s.age < 0 ? 'Please enter your child’s age.' : yrsTo(s) <= 0 ? 'The course start age must be higher than the child’s current age.' : '')
      },
      NP.investStep({
        title: 'How much do you need to invest today?', nav: 'Investment plan',
        sub: 'Compare the three ways to fund this goal. Pick an expected return for each option from the drop-down.',
        before: s => {
          const sc = schedule(s);
          return F.live('<div class="live-grid">' + F.kpi('Target corpus', fmt.short(sc.fvTot), 'Needed by ' + fmt.yearFromNow(sc.n), true) + F.kpi('Time to invest', fmt.yrs(sc.n)) + F.kpi('Already saved', fmt.short(+s.saved || 0), 'Grows at each option’s rate') + '</div>') + F.space(16);
        },
        target, years: yrsTo, inflation: s => +s.cpi || 0
      })
    ],
    compute: s => schedule(s),
    summary(s, sc) {
      const e = EDU[s.domain], nm = s.child ? esc(s.child) : 'your child', n = sc.n, inf = +s.cpi || 0;
      const inv = NP.investSummary(s, r => target(s, r), n, inf);
      const adv = NP.goalAdvice(s, r => target(s, r), n, inf, nm + '’s admission');
      const mf = inv.rows[2].c, po = inv.rows[1].c;
      return {
        title: (s.child ? esc(s.child) + '’s ' : 'Your child’s ') + e.t + ' plan',
        headline: { label: 'Corpus needed in ' + fmt.yearFromNow(n), value: fmt.inr(sc.fvTot), note: e.t + ' (' + (s.inst === 'gov' ? (e.abroad ? 'public' : 'government') : 'private') + ') for ' + nm + ', starting at age ' + s.startAge + '. Today it costs ' + fmt.short(sc.todayTot) + '.', icon: e.icon },
        tiles: [
          ['Years to admission', fmt.yrs(n), 'Course starts ' + fmt.yearFromNow(n)],
          ['Monthly SIP (MF ' + fmt.pct(s.inv.mf) + ')', fmt.inr(mf.sip), 'or ' + fmt.short(mf.lump) + ' one-time'],
          ['Monthly (Post Office ' + fmt.pct(s.inv.po) + ')', fmt.inr(po.sip), 'or ' + fmt.short(po.lump) + ' one-time'],
          ['Education inflation', fmt.pct(s.eduInf), 'Cost grows ' + (sc.fvTot / sc.todayTot).toFixed(1) + '× by then']
        ],
        sections: [
          { title: 'Your inputs', icon: 'sliders', html: NP.h.kv([
            ['Course', esc(e.t)], ['Institute', s.inst === 'gov' ? (e.abroad ? 'Public university' : 'Government') : (e.abroad ? 'Private university' : 'Private')],
            e.abroad ? ['Destination', 'Abroad (averaged)'] : ['City', CITY[s.city].t], e.abroad ? null : ['Stay', STAY[s.stay].t],
            ['Child’s age today', s.age + ' years'], ['Course starts at age', s.startAge + ' (' + fmt.yrs(s.dur) + ')'],
            ['Education inflation', fmt.pct(s.eduInf) + ' p.a.'], ['General inflation', fmt.pct(inf) + ' p.a.'], ['Already saved', fmt.inr(+s.saved || 0)]
          ]) },
          { title: 'Cost today', icon: 'wallet', html: NP.h.table(['Expense', 'Per year', 'Per month'], [
            ['Tuition & college fees', fmt.inr(s.cost.y), fmt.inr(s.cost.y / 12)],
            [e.abroad ? 'Accommodation & food' : STAY[s.stay].t + ' & food', fmt.inr(s.cost.h), fmt.inr(s.cost.h / 12)],
            ['Local transport', fmt.inr(s.cost.t), fmt.inr(s.cost.t / 12)],
            ['Books, devices & personal', fmt.inr(s.cost.b), fmt.inr(s.cost.b / 12)],
            ['One-time (coaching, admission, laptop)', fmt.inr(onceT(s)), '—']
          ], { foot: ['Full course today', fmt.inr(sc.todayTot), fmt.inr(yearly(s) / 12) + ' avg'] }) },
          { title: 'Future cost, year by year', icon: 'calendar', allowBreak: true, html: NP.h.table(['Course year', 'Year', 'Age', 'Cost today', 'Cost in that year'],
            [{ cells: ['One-time costs', String(fmt.yearFromNow(n)), String(s.startAge), fmt.inr(onceT(s)), fmt.inr(sc.once)] }].concat(sc.rows.map(r => ['Year ' + (r.k + 1) + (r.frac < 1 ? ' (half)' : ''), String(r.year), String(r.age), fmt.inr(r.today), fmt.inr(r.fv)])),
            { foot: ['Total', '', '', fmt.inr(sc.todayTot), fmt.inr(sc.fvTot)] }) },
          { title: 'How much to invest: three options', icon: 'scale', html: inv.bars + '<div style="height:14px"></div>' + inv.table + ((+s.saved) > 0 ? '<div style="height:10px"></div>' + NP.h.note('Includes the growth of your existing savings of ' + fmt.inr(+s.saved) + ' at each option’s rate.') : '') },
          { title: 'Suggested investment mix', icon: 'layers', html: adv.mixHtml }
        ],
        takeaways: adv.takeaways.concat([
          (+s.age) < 10 ? 'If your child is a daughter under 10, <b>Sukanya Samriddhi Yojana</b> (8.2%, tax-free) is a strong, safe part of this plan.' : 'Keep an <b>education loan</b> as a backup, not the plan. Interest at 9–12% adds heavily to the cost.',
          'Review the plan every year. If fees rise faster than ' + fmt.pct(s.eduInf) + ', increase the SIP.'
        ])
      };
    }
  });
})();
