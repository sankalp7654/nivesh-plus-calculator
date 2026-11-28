# Nivesh Plus — Financial Calculators

A static website (GitHub Pages ready) with a landing page and 12 multi-step financial calculators. Each calculator ends with a summary and a branded A4 PDF report.

| Group | Calculator | File |
|---|---|---|
| Life Insurance & Retirement | Human Life Value (inflation-adjusted) | `calculators/human-life-value.html` |
| | Retirement & Pension | `calculators/retirement-pension.html` |
| Goal Planning | Child Education Planner | `calculators/child-education.html` |
| | Goal Savings Planner (e.g. ₹1 Cr in 20 years) | `calculators/goal-savings.html` |
| | Marriage Planner | `calculators/marriage-plan.html` |
| | Honeymoon Planner | `calculators/honeymoon-plan.html` |
| Investment | Future Value (lump sum / SIP) | `calculators/future-value.html` |
| | Real Return (CAGR after inflation & tax) | `calculators/real-return.html` |
| Loans | EMI Calculator (with prepayment) | `calculators/emi-calculator.html` |
| | Loan Planner (affordability & down payment) | `calculators/loan-plan.html` |
| | Loan Interest Recovery (invest to make loan interest zero) | `calculators/loan-interest-recovery.html` |
| | Extra EMI vs SIP (prepay x% or invest x% of EMI) | `calculators/extra-emi-sip.html` |

## Replace the placeholder details

All advisor details live in **one file**: `assets/js/config.js`. Edit the name, credentials, phone, WhatsApp, email, address, office hours and website there. The change shows up on every page and every PDF.

WhatsApp: set `contact.whatsapp` (digits with country code, e.g. `919425172507`) and optionally `contact.whatsappMessage` (pre-filled chat text). When it is set, every page shows a floating WhatsApp button, and the "Talk to an advisor" and "Book a free consultation" buttons, the contact list and the calculator summaries all link to a WhatsApp chat. Leave it empty to turn WhatsApp off.

Map: set `contact.mapUrl` to a Google Maps link. The address then becomes a clickable link.

Photo: the advisor photo is `assets/img/sanjay-dubey.jpg` (square, 800×800 px). To change it, replace that file or point `advisor.photo` in `config.js` at a new one.

## Change default costs and rates

- Investment options and the rates in each drop-down (LIC, Post Office, mutual funds): `NP.INVEST` in `assets/js/core.js`. Post Office rates change every quarter, so update them here.
- Course costs (education), wedding costs, honeymoon destinations, loan rates: the constants at the top of each file in `assets/js/calculators/`.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
3. The site will be live at `https://<username>.github.io/<repo>/` within a minute or two.

No build step and no dependencies: plain HTML, CSS and JavaScript. Fonts load from Google Fonts. Everything else is in the repo.

## PDF reports

**Download PDF report** on the summary step opens the browser's print dialog with a fixed A4 report template: header with logo, advisor photo and contact details, client name, date, reference number, results, signature block, disclaimer, and a footer with page numbers. Choose **Save as PDF** as the destination. Pressing Ctrl/Cmd+P on a calculator produces the same report.

Inputs are remembered in the visitor's browser (localStorage), so they can come back and adjust them. **Reset** restores the defaults.

## Preview locally

Open `index.html` directly in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Services wheel and future subdomains

The home page has an **Our services** section built around `assets/img/services-wheel.jpg` (the original artwork is kept as `services-wheel-original.png`). Each of the four coloured slices of the wheel is clickable, and so is the card next to it.

Where each service leads is set in `services` in `assets/js/config.js`. Change only `url` to re-route a service:

- `'calculators/loan-plan.html'`: a page on this site
- `'whatsapp:<message>'`: opens a WhatsApp chat with that message pre-filled
- `'https://bima.niveshplus.in'`: a subdomain or any other website (opens in a new tab)

`quadrant` ties a service to its slice of the wheel: `tl` Insurance, `tr` Property, `bl` Health, `br` Home Loan.
