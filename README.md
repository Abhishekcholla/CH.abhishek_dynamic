# Abhishek Cholla, portfolio (multi-page)

Pages: `index.html` (home), `projects.html`, `project.html?id=N` (detail), `journey.html`, `skills.html`, `contact.html`.
All text lives in `data.js`; `resume.pdf` is the download button. No build step.

Publish: see the Trading desk section below (Pages source must be GitHub Actions).
Update: edit `data.js` on GitHub and commit. Add GitHub and LinkedIn links in its `contact` block.

## Trading desk with real data (`trading.html`)
Real quotes come from `live-data.json`, rebuilt about every 10 minutes by a GitHub Action (`.github/workflows/live-data.yml`) running `scripts/fetch-data.mjs`.
It reads Yahoo Finance public chart data (NSE and US stocks, indices, USD/INR, gold, silver) and public fuel pages (Goodreturns and CarDekho for Delhi, AAA for the US).
If a source fails, that asset falls back to the reference value in `market.js` with simulated ticks. Badges show LIVE, CLOSE (market shut) or SIM.

One-time setup: upload every file (including the `.github` and `scripts` folders), then Settings > Pages > Source = **GitHub Actions**.
Then open the Actions tab, pick "Refresh market data and deploy site" and press Run workflow. After that it runs by itself.
Edit stocks or symbols in `market.js` (`y` is the Yahoo symbol). Paper trading only, not investment advice.
