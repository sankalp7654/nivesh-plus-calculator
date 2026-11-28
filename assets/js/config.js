/*
 * ============================================================
 *  NIVESH PLUS — SITE CONFIGURATION
 *  Edit the values below to update the advisor details shown
 *  on every page and on every downloaded PDF report.
 *  Items marked PLACEHOLDER must be replaced with real values.
 * ============================================================
 */
window.NP_CONFIG = {
  company: 'Nivesh Plus',
  tagline: 'Plan today. Prosper tomorrow.',

  advisor: {
    name: 'Sanjay Dubey',
    title: 'Financial Advisor',
    // PLACEHOLDER — e.g. 'LIC Agent · AMFI-registered Mutual Fund Distributor (ARN-123456)'
    credentials: 'Insurance · Mutual Funds · Post Office Schemes · Loans',
    // Advisor photo (square, 800×800 px). Shown in the hero card, About section and PDF reports.
    photo: 'assets/img/sanjay-dubey.jpg',
    // PLACEHOLDER — short introduction shown in the "About" section
    bio: 'I help families plan for the moments that matter: protecting their income, educating their children, celebrating weddings and retiring with dignity. Every plan starts with your goals and is built on simple, transparent numbers.'
  },

  /*
   * Services shown around the services wheel on the home page.
   * Each "url" is where that service's card and wheel quadrant lead.
   * Today they point to calculators or a WhatsApp chat; when the subdomains
   * are ready, just change the url, e.g. 'https://bima.niveshplus.in'.
   * "quadrant" is the matching slice of the wheel image (tl, tr, bl, br).
   */
  servicesWheel: 'assets/img/services-wheel.jpg',
  services: [
    { key: 'bima', quadrant: 'tl', icon: 'umbrella', color: '#1f5fd1',
      title: 'Insurance Agency', titleHi: 'बीमा एजेंसी',
      desc: 'Life and general insurance: term plans, LIC policies, vehicle and shop insurance.',
      url: 'calculators/human-life-value.html', cta: 'Check your life cover' },
    { key: 'property', quadrant: 'tr', icon: 'building', color: '#d62d2d',
      title: 'Property (Real Estate)', titleHi: 'संपत्ति (प्रॉपर्टी)',
      desc: 'Buy or sell a house, shop, flat or farm land with trusted local guidance.',
      url: 'whatsapp:Namaste Sanjay ji, I am interested in property (house / shop / flat / land). Please share details.', cta: 'Enquire on WhatsApp' },
    { key: 'health', quadrant: 'bl', icon: 'heart', color: '#14923a',
      title: 'Health Insurance', titleHi: 'स्वास्थ्य बीमा',
      desc: 'Family floater and individual health policies, top-ups and renewals.',
      url: 'whatsapp:Namaste Sanjay ji, I would like to know about health insurance for my family.', cta: 'Get a health quote' },
    { key: 'home-loan', quadrant: 'br', icon: 'home', color: '#c98a00',
      title: 'Home Loan', titleHi: 'होम लोन',
      desc: 'Home, plot and construction loans: check eligibility and plan your down payment.',
      url: 'calculators/loan-plan.html', cta: 'Check loan eligibility' }
  ],

  contact: {
    phone: '+91 94251 72507',             // shown on the site and PDF
    phoneLink: '+919425172507',           // used for click-to-call
    whatsapp: '919425172507',             // digits with country code, used for wa.me chat links
    whatsappMessage: 'Namaste Sanjay ji, I would like a free financial planning consultation.', // pre-filled WhatsApp text
    email: 'info@niveshplus.com',
    address: 'Shivkripa Complex, Opp Shiv-Sai Mandir Gali No 5, Virat Nagar Main Rd, Rajendra Nagar, Satna, Madhya Pradesh 485001',
    mapUrl: 'https://maps.app.goo.gl/fAxbkeqs9ZLVtA74A', // Google Maps link for the address
    hours: 'Mon–Sat, 10:00 AM – 7:00 PM', // PLACEHOLDER
    website: 'www.niveshplus.com'          // printed on the PDF footer
  }
};
