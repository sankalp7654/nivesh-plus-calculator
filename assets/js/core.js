/* ==========================================================
   Nivesh Plus — core library
   Formatting, finance maths, icons, layout, charts, registry.
   ========================================================== */
(function () {
  'use strict';
  const NP = (window.NP = window.NP || {});
  const CFG = (NP.config = window.NP_CONFIG || {});
  const ROOT = (document.body && document.body.dataset.root) || '';
  NP.root = ROOT;

  /* ---------------- Icons (Lucide-style, MIT) ---------------- */
  const I = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    'graduation-cap': '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    stethoscope: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    calculator: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    refresh: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    umbrella: '<path d="M22 12a10.06 10.06 1 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    'piggy-bank': '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>',
    'bar-chart': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    palm: '<path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"/><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/>',
    mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    rupee: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    sliders: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
    hotel: '<path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    bus: '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
    laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    'hand-coins': '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/>'
  };
  NP.icon = function (name, cls) {
    const body = I[name] || I.info;
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  };

  NP.logo = function (cls) {
    return '<svg class="brand-mark ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#0b2545"/><rect x=".75" y=".75" width="46.5" height="46.5" rx="11.25" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/><path d="M12 34V15l14 19V15" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 24.5h9M35.5 20v9" stroke="#e0a21b" stroke-width="3.4" stroke-linecap="round"/></svg>';
  };

  /* ---------------- Escaping & formatting ---------------- */
  NP.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };
  const nf0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const trim = s => (s.indexOf('.') < 0 ? s : s.replace(/\.?0+$/, ''));
  const fmt = (NP.fmt = {
    num: n => nf0.format(Math.round(n || 0)),
    inr: n => (n < 0 ? '−' : '') + '₹' + nf0.format(Math.abs(Math.round(n || 0))),
    short(n) {
      n = Math.round(n || 0);
      const a = Math.abs(n), sg = n < 0 ? '−' : '';
      if (a >= 1e7) return sg + '₹' + trim((a / 1e7).toFixed(2)) + ' Cr';
      if (a >= 1e5) return sg + '₹' + trim((a / 1e5).toFixed(2)) + ' L';
      return sg + '₹' + nf0.format(a);
    },
    words(n) {
      n = Math.round(n || 0);
      const a = Math.abs(n);
      if (!a) return '';
      if (a >= 1e7) return '₹' + trim((a / 1e7).toFixed(2)) + ' Crore';
      if (a >= 1e5) return '₹' + trim((a / 1e5).toFixed(2)) + ' Lakh';
      if (a >= 1e3) return '₹' + trim((a / 1e3).toFixed(1)) + ' Thousand';
      return '₹' + a;
    },
    pct: (n, d) => (n == null || isNaN(n) ? '—' : trim(Number(n).toFixed(d == null ? 1 : d)) + '%'),
    pctFixed: (n, d) => Number(n).toFixed(d == null ? 1 : d) + '%',
    yrs: n => { n = Math.round(n * 10) / 10; return trim(n.toFixed(1)) + (n === 1 ? ' year' : ' years'); },
    months(m) {
      m = Math.round(m);
      const y = Math.floor(m / 12), r = m % 12;
      return [y ? y + (y === 1 ? ' yr' : ' yrs') : '', r ? r + (r === 1 ? ' mo' : ' mos') : ''].filter(Boolean).join(' ') || '0 mos';
    },
    date: d => (d || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    yearFromNow: n => new Date().getFullYear() + Math.round(n)
  });
  NP.parseNum = function (v) {
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v || '').replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  /* ---------------- Finance maths ---------------- */
  const fin = (NP.fin = {
    fv: (pv, r, n) => pv * Math.pow(1 + r / 100, n),
    pv: (fv, r, n) => fv / Math.pow(1 + r / 100, n),
    real: (r, i) => ((1 + r / 100) / (1 + i / 100) - 1) * 100,
    cagr: (pv, fv, n) => (pv > 0 && fv > 0 && n > 0 ? (Math.pow(fv / pv, 1 / n) - 1) * 100 : NaN),
    /* Monthly SIP, invested at the start of each month; optional yearly step-up. */
    sipFV(m, r, years, stepUp) {
      const i = r / 1200, months = Math.round(years * 12);
      let bal = 0, amt = m;
      for (let k = 0; k < months; k++) {
        if (k && k % 12 === 0) amt *= 1 + (stepUp || 0) / 100;
        bal = (bal + amt) * (1 + i);
      }
      return bal;
    },
    sipInvested(m, years, stepUp) {
      const months = Math.round(years * 12);
      let tot = 0, amt = m;
      for (let k = 0; k < months; k++) { if (k && k % 12 === 0) amt *= 1 + (stepUp || 0) / 100; tot += amt; }
      return tot;
    },
    sipFor: (target, r, years) => (target <= 0 ? 0 : target / fin.sipFV(1, r, years)),
    /* Yearly investment at the start of each year. */
    yearlyFV(a, r, years) {
      const n = Math.max(1, Math.round(years)); let bal = 0;
      for (let k = 0; k < n; k++) bal = (bal + a) * (1 + r / 100);
      return bal;
    },
    yearlyFor: (target, r, years) => (target <= 0 ? 0 : target / fin.yearlyFV(1, r, years)),
    emi(P, r, months) {
      if (P <= 0 || months <= 0) return 0;
      const i = r / 1200;
      if (!i) return P / months;
      const f = Math.pow(1 + i, months);
      return (P * i * f) / (f - 1);
    },
    /* Amortisation with optional prepayments. Returns yearly rows and totals. */
    amort(P, r, months, opt) {
      opt = opt || {};
      const i = r / 1200, emi = fin.emi(P, r, months);
      let bal = P, m = 0, totI = 0, totPre = 0;
      const rows = []; let row = { year: 1, principal: 0, interest: 0, prepay: 0, balance: P };
      while (bal > 0.5 && m < months + 1) {
        m++;
        const int = bal * i;
        let prin = Math.min(emi - int, bal);
        bal -= prin; totI += int;
        row.principal += prin; row.interest += int;
        let pre = 0;
        if (opt.onceAmt && m === Math.round(opt.onceMonth)) pre += opt.onceAmt;
        if (opt.yearlyAmt && m % 12 === 0) pre += opt.yearlyAmt;
        if (opt.stepUpPct && m % 12 === 0) { /* handled via extra EMI below */ }
        if (opt.extraMonthly) pre += opt.extraMonthly;
        pre = Math.min(pre, bal);
        bal -= pre; totPre += pre; row.prepay += pre; row.principal += pre;
        row.balance = Math.max(0, bal);
        if (m % 12 === 0 || bal <= 0.5) { rows.push(row); row = { year: rows.length + 1, principal: 0, interest: 0, prepay: 0, balance: bal }; }
      }
      return { emi, months: m, totalInterest: totI, totalPaid: P + totI, prepaid: totPre, rows };
    },
    /* Annual IRR for dated cash flows [{t: years, amt}] using bisection. */
    irr(flows) {
      const npv = r => flows.reduce((s, f) => s + f.amt / Math.pow(1 + r, f.t), 0);
      let lo = -0.99, hi = 2, fLo = npv(lo), fHi = npv(hi);
      if (fLo * fHi > 0) return NaN;
      for (let k = 0; k < 200; k++) {
        const mid = (lo + hi) / 2, fm = npv(mid);
        if (Math.abs(fm) < 1e-7) return mid * 100;
        if (fLo * fm < 0) { hi = mid; fHi = fm; } else { lo = mid; fLo = fm; }
      }
      return ((lo + hi) / 2) * 100;
    },
    /* PV of n yearly payments (first payment today) growing at g, discounted at r. */
    pvGrowingDue(C, g, r, n) {
      let s = 0;
      for (let k = 0; k < Math.round(n); k++) s += (C * Math.pow(1 + g / 100, k)) / Math.pow(1 + r / 100, k);
      return s;
    }
  });

  /* ---------------- Investment options (shared by all goal calculators) ---------------- */
  NP.INVEST = [
    {
      key: 'lic', name: 'Risk Cover', product: 'LIC / Insurance savings plans', icon: 'shield-check', def: '5',
      blurb: 'Life cover + guaranteed, low-risk returns',
      rates: [['4', '4% · Endowment (low)'], ['4.5', '4.5% · Money-back'], ['5', '5% · Typical endowment'], ['5.5', '5.5% · With bonus'], ['6', '6% · Guaranteed income'], ['6.5', '6.5% · High bonus']]
    },
    {
      key: 'po', name: 'Moderate Return', product: 'Post Office small savings', icon: 'landmark', def: '7.2',
      blurb: 'Government-backed, capital protected',
      rates: [['6.7', '6.7% · RD (5 yr)'], ['7.1', '7.1% · PPF'], ['7.2', '7.2% · Blended PO avg'], ['7.4', '7.4% · Monthly Income'], ['7.5', '7.5% · KVP / Time Dep.'], ['7.7', '7.7% · NSC'], ['8.2', '8.2% · Sukanya (SSY)']]
    },
    {
      key: 'mf', name: 'Aggressive Return', product: 'Equity mutual funds (SIP)', icon: 'trending-up', def: '12',
      blurb: 'Market-linked, highest long-term growth',
      rates: [['9', '9% · Hybrid (low risk)'], ['10', '10% · Balanced adv.'], ['11', '11% · Large-cap / index'], ['12', '12% · Diversified equity'], ['13', '13% · Flexi / mid-cap'], ['14', '14% · Small-cap']]
    }
  ];
  NP.investDefaults = function () {
    const o = {};
    NP.INVEST.forEach(x => { o[x.key] = parseFloat(x.def); o[x.key + 'Sel'] = x.def; });
    return o;
  };
  NP.investCalc = function (target, years, rate, inflation) {
    target = Math.max(0, target);
    return {
      rate,
      real: fin.real(rate, inflation || 0),
      lump: fin.pv(target, rate, years),
      sip: fin.sipFor(target, rate, years),
      yearly: fin.yearlyFor(target, rate, years),
      sipTotal: fin.sipFor(target, rate, years) * Math.round(years * 12),
      yearlyTotal: fin.yearlyFor(target, rate, years) * Math.max(1, Math.round(years))
    };
  };
  NP.suitability = function (key, years) {
    if (key === 'mf') {
      if (years < 3) return { cls: 'bad', icon: 'x-circle', label: 'Not suitable under 3 yrs' };
      if (years < 5) return { cls: 'warn', icon: 'alert', label: 'Use hybrid funds' };
      return { cls: 'good', icon: 'check-circle', label: 'Ideal for 5+ yrs' };
    }
    if (key === 'lic') {
      if (years < 5) return { cls: 'warn', icon: 'alert', label: 'Short terms not ideal' };
      return { cls: 'good', icon: 'check-circle', label: 'Adds life cover' };
    }
    return { cls: 'good', icon: 'check-circle', label: 'Capital safe' };
  };
  NP.status = (st) => '<span class="status ' + st.cls + '">' + NP.icon(st.icon) + NP.esc(st.label) + '</span>';

  /* ---------------- Calculator registry ---------------- */
  NP.GROUPS = [
    { key: 'bima', title: 'Life Insurance & Retirement', icon: 'shield', chip: 'Bima' },
    { key: 'goals', title: 'Goal Planning', icon: 'target', chip: 'Most popular' },
    { key: 'invest', title: 'Investment Calculators', icon: 'trending-up', chip: 'Returns' },
    { key: 'loan', title: 'Loans', icon: 'landmark', chip: 'Loan' }
  ];
  NP.CALCS = [
    { id: 'human-life-value', group: 'bima', icon: 'umbrella', title: 'Human Life Value', short: 'Life cover you really need', desc: 'Find the right life cover for your family, based on your income, inflation, loans and future goals.', steps: 5 },
    { id: 'retirement-pension', group: 'bima', icon: 'sunset', title: 'Retirement & Pension', short: 'Corpus for a worry-free retirement', desc: 'From your current income, find the monthly pension and retirement corpus you will need, adjusted for inflation.', steps: 6 },
    { id: 'child-education', group: 'goals', icon: 'graduation-cap', title: 'Child Education Planner', short: 'Engineering, medical, MBA and more', desc: 'Pick a course and city, see today’s full cost, project it to admission year and plan the investment.', steps: 5 },
    { id: 'goal-savings', group: 'goals', icon: 'target', title: 'Goal Savings Planner', short: 'How much to invest today?', desc: 'Need ₹1 crore in 20 years? Compare how much to invest today in LIC, Post Office or mutual funds.', steps: 5 },
    { id: 'marriage-plan', group: 'goals', icon: 'gem', title: 'Marriage Planner', short: 'Plan a wedding without loans', desc: 'Estimate wedding costs by style, guests and city, including gold, then plan savings for the big day.', steps: 5 },
    { id: 'honeymoon-plan', group: 'goals', icon: 'plane', title: 'Honeymoon Planner', short: 'Domestic and international trips', desc: 'Choose a destination and travel style, estimate the trip cost and start saving for it in time.', steps: 5 },
    { id: 'future-value', group: 'invest', icon: 'trending-up', title: 'Future Value', short: 'Grow a lump sum or SIP', desc: 'See what your lump sum or monthly SIP grows into, and what that money is worth after inflation.', steps: 4 },
    { id: 'real-return', group: 'invest', icon: 'percent', title: 'Real Return', short: 'Your return after inflation', desc: 'Know what you invested and what you received? Find your true annual return after inflation and tax.', steps: 4 },
    { id: 'emi-calculator', group: 'loan', icon: 'calculator', title: 'EMI Calculator', short: 'EMI, interest and prepayment', desc: 'Calculate EMI for any loan, see the full repayment schedule and how much prepayment saves.', steps: 4 },
    { id: 'loan-plan', group: 'loan', icon: 'home', title: 'Loan Planner', short: 'Affordability and down payment', desc: 'Check how much loan you can comfortably afford and plan the down payment for your home or car.', steps: 6 },
    { id: 'loan-interest-recovery', group: 'loan', icon: 'hand-coins', title: 'Loan Interest Recovery', short: 'Make your loan interest zero', desc: 'Find how much to invest alongside your EMI so the returns pay back every rupee of loan interest.', steps: 5 },
    { id: 'extra-emi-sip', group: 'loan', icon: 'zap', title: 'Extra EMI vs SIP', short: 'Close early or invest the extra?', desc: 'Pay x% over your EMI to see when the loan closes, or put x% of the EMI in a SIP to see how much interest comes back.', steps: 5 }
  ];
  NP.calcHref = id => ROOT + 'calculators/' + id + '.html';

  /* ---------------- Layout: header & footer ---------------- */
  function contactList(cls) {
    const c = CFG.contact || {};
    const tel = c.phoneLink ? '<a href="tel:' + NP.esc(c.phoneLink) + '">' + NP.esc(c.phone) + '</a>' : NP.esc(c.phone);
    return '<ul class="contact-list ' + (cls || '') + '">' +
      '<li>' + NP.icon('phone') + '<span>' + tel + '</span></li>' +
      '<li>' + NP.icon('mail') + '<span><a href="mailto:' + NP.esc(c.email) + '">' + NP.esc(c.email) + '</a></span></li>' +
      '<li>' + NP.icon('map-pin') + '<span>' + NP.esc(c.address) + '</span></li>' +
      (c.hours ? '<li>' + NP.icon('clock') + '<span>' + NP.esc(c.hours) + '</span></li>' : '') +
      '</ul>';
  }
  NP.contactList = contactList;
  NP.photoSrc = () => ROOT + ((CFG.advisor && CFG.advisor.photo) || 'assets/img/advisor-placeholder.svg');
  NP.callHref = function () {
    const c = CFG.contact || {};
    if (c.whatsapp) return 'https://wa.me/' + c.whatsapp;
    if (c.phoneLink) return 'tel:' + c.phoneLink;
    return ROOT + 'index.html#contact';
  };

  function renderHeader() {
    const el = document.getElementById('np-header');
    if (!el) return;
    const cur = document.body.dataset.calc;
    const menu = NP.GROUPS.map(g =>
      '<div class="grp">' + NP.esc(g.title) + '</div>' +
      NP.CALCS.filter(c => c.group === g.key).map(c =>
        '<a href="' + NP.calcHref(c.id) + '"' + (c.id === cur ? ' class="active"' : '') + '>' + NP.icon(c.icon) + NP.esc(c.title) + '</a>').join('')
    ).join('');
    el.outerHTML =
      '<header class="site-header"><div class="container">' +
      '<a class="brand" href="' + ROOT + 'index.html" aria-label="' + NP.esc(CFG.company) + ' home">' + NP.logo() +
      '<span><span class="brand-name">Nivesh<span> Plus</span></span><span class="brand-tag">' + NP.esc(CFG.advisor.name) + ' · ' + NP.esc(CFG.advisor.title) + '</span></span></a>' +
      '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false">' + NP.icon('menu') + '</button>' +
      '<nav class="nav" aria-label="Main">' +
      '<a href="' + ROOT + 'index.html"' + (cur ? '' : ' class="active"') + '>Home</a>' +
      '<div class="nav-drop"><a href="' + ROOT + 'index.html#calculators"' + (cur ? ' class="active"' : '') + '>Calculators</a><div class="nav-drop-menu">' + menu + '</div></div>' +
      '<a href="' + ROOT + 'index.html#about">About</a>' +
      '<a href="' + ROOT + 'index.html#contact">Contact</a>' +
      '<a class="btn btn-primary btn-sm" href="' + NP.callHref() + '">' + NP.icon('phone') + 'Talk to an advisor</a>' +
      '</nav></div></header>';
    const t = document.querySelector('.nav-toggle'), n = document.querySelector('.nav');
    t.addEventListener('click', () => { const o = n.classList.toggle('open'); t.setAttribute('aria-expanded', o); });
  }

  function renderFooter() {
    const el = document.getElementById('np-footer');
    if (!el) return;
    const links = (keys) => NP.CALCS.filter(c => keys.includes(c.group)).map(c => '<li><a href="' + NP.calcHref(c.id) + '">' + NP.esc(c.title) + '</a></li>').join('');
    el.outerHTML =
      '<footer class="site-footer"><div class="container"><div class="cols">' +
      '<div><a class="brand" href="' + ROOT + 'index.html">' + NP.logo() + '<span><span class="brand-name">Nivesh<span> Plus</span></span><span class="brand-tag">' + NP.esc(CFG.tagline) + '</span></span></a>' +
      '<p style="margin-top:16px;max-width:300px">Goal-based financial planning for Indian families: insurance, investments, retirement and loans.</p></div>' +
      '<div><h4>Plan & Protect</h4><ul>' + links(['bima', 'goals']) + '</ul></div>' +
      '<div><h4>Invest & Borrow</h4><ul>' + links(['invest', 'loan']) + '</ul></div>' +
      '<div><h4>' + NP.esc(CFG.advisor.name) + '</h4>' + contactList() + '</div>' +
      '</div><div class="legal">' +
      '<div>© ' + new Date().getFullYear() + ' ' + NP.esc(CFG.company) + '. All rights reserved.</div>' +
      '<div>Disclaimer: All calculators are for illustration and planning only. Actual returns, costs and inflation will vary. Mutual fund investments are subject to market risks; read all scheme-related documents carefully. Insurance is the subject matter of solicitation. Post Office rates are set by the Government of India and revised quarterly. Please consult your advisor before investing.</div>' +
      '</div></div></footer>';
  }

  /* ---------------- Charts (SVG/HTML, print friendly) ---------------- */
  const charts = (NP.charts = { _d: {} });
  let cid = 0;
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
    const n = f <= 1 ? 1 : f <= 1.5 ? 1.5 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 3 ? 3 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 6 ? 6 : f <= 8 ? 8 : 10;
    return n * p;
  }
  /* Line chart: labels[], series [{name, color, values[], area?}] */
  charts.line = function (o) {
    const id = 'ch' + (++cid), W = 720, H = o.height || 250, m = { l: 66, r: 18, t: 14, b: 30 };
    const N = o.labels.length, all = o.series.flatMap(s => s.values);
    const yMax = niceMax(Math.max.apply(null, all.concat([0])));
    const x = i => m.l + (N <= 1 ? 0 : (i / (N - 1)) * (W - m.l - m.r));
    const y = v => m.t + (1 - v / yMax) * (H - m.t - m.b);
    const f = o.fmt || fmt.short;
    let g = '';
    for (let k = 0; k <= 4; k++) {
      const v = (yMax * k) / 4, yy = y(v);
      g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + (k ? 'var(--grid)' : 'var(--line-2)') + '" stroke-width="1"/>';
      g += '<text class="axis-text" x="' + (m.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + f(v) + '</text>';
    }
    const every = Math.max(1, Math.ceil(N / 7));
    o.labels.forEach((l, i) => {
      if (i % every === 0 || i === N - 1) {
        if (i !== N - 1 && N - 1 - i < every * 0.6) return;
        g += '<text class="axis-text" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + NP.esc(l) + '</text>';
      }
    });
    let paths = '';
    o.series.forEach((s, si) => {
      const d = s.values.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('');
      if (s.area) paths += '<path d="' + d + 'L' + x(N - 1) + ',' + y(0) + 'L' + x(0) + ',' + y(0) + 'Z" fill="' + s.color + '" opacity=".08"/>';
      paths += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      const lv = s.values[N - 1];
      paths += '<circle cx="' + x(N - 1) + '" cy="' + y(lv) + '" r="4" fill="' + s.color + '" stroke="var(--surface)" stroke-width="2"/>';
      if (si === 0 && o.labelLast !== false) paths += '<text class="val-text" x="' + (x(N - 1) - 8) + '" y="' + (y(lv) - 10) + '" text-anchor="end">' + f(lv) + '</text>';
    });
    charts._d[id] = { o, x, y, N, f };
    const legend = o.series.length > 1 ? '<div class="legend">' + o.series.map(s => '<span><i style="background:' + s.color + '"></i>' + NP.esc(s.name) + '</span>').join('') + '</div>' : '';
    return '<div class="chart" data-chart="line" id="' + id + '">' + legend +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + NP.esc(o.aria || 'Line chart') + '">' + g + paths +
      '<line class="xh" x1="0" x2="0" y1="' + m.t + '" y2="' + (H - m.b) + '" stroke="var(--ink-3)" stroke-width="1" opacity="0"/>' +
      o.series.map((s, i) => '<circle class="xd" data-i="' + i + '" r="4.5" fill="' + s.color + '" stroke="#fff" stroke-width="2" opacity="0"/>').join('') +
      '<rect class="hit" x="' + m.l + '" y="0" width="' + (W - m.l - m.r) + '" height="' + H + '"/></svg><div class="tip"></div></div>';
  };
  /* Horizontal bars: items [{label, sub, value, color}] */
  charts.hbars = function (o) {
    const max = Math.max.apply(null, o.items.map(i => i.value).concat([1]));
    const f = o.fmt || fmt.short;
    return '<div class="chart hbars" style="display:grid;gap:12px">' + o.items.map(it =>
      '<div data-tip="' + NP.esc('<b>' + it.label + '</b><br>' + (o.tipLabel || 'Value') + ': ' + (o.fmt ? f(it.value) : fmt.inr(it.value))) + '" style="display:grid;grid-template-columns:minmax(110px,190px) 1fr auto;gap:12px;align-items:center">' +
      '<div style="font-size:.86rem;font-weight:600;color:var(--ink)">' + NP.esc(it.label) + (it.sub ? '<span class="td-sub">' + NP.esc(it.sub) + '</span>' : '') + '</div>' +
      '<div style="height:14px;background:var(--surface-2);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + Math.max(1.5, (it.value / max) * 100).toFixed(2) + '%;background:' + (it.color || 'var(--series-1)') + ';border-radius:0 4px 4px 0"></div></div>' +
      '<div style="font:700 .9rem/1 var(--font-head);color:var(--ink);min-width:78px;text-align:right">' + f(it.value) + '</div></div>'
    ).join('') + '<div class="tip"></div></div>';
  };
  /* Part-to-whole split bar: parts [{label, value, color}] */
  charts.split = function (o) {
    const tot = o.parts.reduce((s, p) => s + p.value, 0) || 1;
    return '<div class="chart split">' +
      '<div class="legend">' + o.parts.map(p => '<span><i style="background:' + p.color + '"></i>' + NP.esc(p.label) + '</span>').join('') + '</div>' +
      '<div style="display:flex;gap:2px;height:26px">' + o.parts.map((p, i) =>
        '<div data-tip="' + NP.esc('<b>' + p.label + '</b><br>' + fmt.inr(p.value) + ' · ' + fmt.pct((p.value / tot) * 100)) + '" style="flex:' + Math.max(p.value, 0) + ' 1 0;background:' + p.color + ';border-radius:' + (i === 0 ? '4px 0 0 4px' : i === o.parts.length - 1 ? '0 4px 4px 0' : '0') + '"></div>').join('') + '</div>' +
      '<div style="display:flex;justify-content:space-between;gap:12px;margin-top:8px;font-size:.84rem;color:var(--ink-2)">' + o.parts.map((p, i) =>
        '<div style="text-align:' + (i === 0 ? 'left' : 'right') + '"><b style="color:var(--ink);font-family:var(--font-head)">' + fmt.short(p.value) + '</b> · ' + fmt.pct((p.value / tot) * 100, 0) + '<br><span class="muted">' + NP.esc(p.label) + '</span></div>').join('') +
      '</div><div class="tip"></div></div>';
  };
  charts.bind = function (root) {
    root.querySelectorAll('.chart[data-chart=line]').forEach(el => {
      const d = charts._d[el.id]; if (!d) return;
      const svg = el.querySelector('svg'), hit = el.querySelector('.hit'), tip = el.querySelector('.tip');
      const xh = el.querySelector('.xh'), dots = el.querySelectorAll('.xd');
      const move = ev => {
        const r = svg.getBoundingClientRect(), sx = 720 / r.width;
        const px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * sx;
        let best = 0, bd = 1e9;
        for (let i = 0; i < d.N; i++) { const dd = Math.abs(d.x(i) - px); if (dd < bd) { bd = dd; best = i; } }
        const X = d.x(best);
        xh.setAttribute('x1', X); xh.setAttribute('x2', X); xh.setAttribute('opacity', '.5');
        dots.forEach((c, si) => { c.setAttribute('cx', X); c.setAttribute('cy', d.y(d.o.series[si].values[best])); c.setAttribute('opacity', '1'); });
        tip.innerHTML = '<b>' + NP.esc((d.o.tipPrefix || '') + d.o.labels[best]) + '</b><br>' + d.o.series.map(s => '<i style="background:' + s.color + '"></i>' + NP.esc(s.name) + ': ' + fmt.inr(s.values[best])).join('<br>');
        tip.classList.add('show');
        const er = el.getBoundingClientRect(), left = X / sx + (r.left - er.left);
        tip.style.left = Math.min(Math.max(0, left + 12), er.width - tip.offsetWidth) + 'px';
        tip.style.top = (r.top - er.top + 10) + 'px';
        if (left + 12 + tip.offsetWidth > er.width) tip.style.left = Math.max(0, left - tip.offsetWidth - 12) + 'px';
      };
      const out = () => { tip.classList.remove('show'); xh.setAttribute('opacity', '0'); dots.forEach(c => c.setAttribute('opacity', '0')); };
      hit.addEventListener('mousemove', move); hit.addEventListener('touchmove', move, { passive: true });
      hit.addEventListener('mouseleave', out); hit.addEventListener('touchend', out);
    });
    root.querySelectorAll('.chart').forEach(el => {
      const tip = el.querySelector('.tip'); if (!tip) return;
      el.querySelectorAll('[data-tip]').forEach(t => {
        t.addEventListener('mousemove', ev => {
          tip.innerHTML = t.dataset.tip; tip.classList.add('show');
          const er = el.getBoundingClientRect();
          let lx = ev.clientX - er.left + 14; if (lx + tip.offsetWidth > er.width) lx = ev.clientX - er.left - tip.offsetWidth - 14;
          tip.style.left = Math.max(0, lx) + 'px'; tip.style.top = (ev.clientY - er.top - tip.offsetHeight - 10) + 'px';
        });
        t.addEventListener('mouseleave', () => tip.classList.remove('show'));
      });
    });
  };

  /* ---------------- Small HTML helpers for summaries ---------------- */
  NP.h = {
    kv: rows => '<div class="kv-list">' + rows.filter(Boolean).map(r => '<div><span>' + NP.esc(r[0]) + '</span><span>' + r[1] + '</span></div>').join('') + '</div>',
    table(head, rows, opt) {
      opt = opt || {};
      return '<div class="table-wrap"><table class="data"><thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr' + (r.hl ? ' class="hl"' : '') + '>' + (r.cells || r).map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') +
        '</tbody>' + (opt.foot ? '<tfoot><tr>' + opt.foot.map(c => '<td>' + c + '</td>').join('') + '</tr></tfoot>' : '') + '</table></div>';
    },
    note: (html, kind, icon) => '<div class="note ' + (kind || '') + '">' + NP.icon(icon || (kind === 'warn' ? 'alert' : kind === 'good' ? 'check-circle' : kind === 'bad' ? 'x-circle' : 'info')) + '<div>' + html + '</div></div>'
  };

  /* ---------------- Boot ---------------- */
  NP.ready = function (fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); };
  NP.ready(function () {
    renderHeader();
    renderFooter();
    document.querySelectorAll('[data-np]').forEach(el => {
      const k = el.dataset.np, c = CFG.contact || {}, a = CFG.advisor || {};
      const map = { name: a.name, title: a.title, credentials: a.credentials, bio: a.bio, phone: c.phone, email: c.email, address: c.address, hours: c.hours, company: CFG.company, tagline: CFG.tagline };
      if (k === 'photo') el.src = NP.photoSrc();
      else if (k === 'contact') el.innerHTML = contactList();
      else if (k === 'call') el.href = NP.callHref();
      else if (map[k] != null) el.textContent = map[k];
    });
    charts.bind(document);
  });
})();
