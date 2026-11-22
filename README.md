# Nivesh Plus — Financial Calculators

A static website (GitHub Pages ready) with a landing page and 10 multi-step financial calculators. Each calculator ends with a summary and a branded A4 PDF report.

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

## Replace the placeholder details

All advisor details live in **one file**: `assets/js/config.js`. Edit the name, credentials, phone, WhatsApp, email, address, office hours and website there. The change shows up on every page and every PDF.

Photo: add a square photo (400×400 px or larger), e.g. `assets/img/sanjay-dubey.jpg`, then set `photo: 'assets/img/sanjay-dubey.jpg'` in `config.js`.

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
