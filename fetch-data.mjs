// Builds live-data.json from free public sources. Run by GitHub Actions (Node 20+, no packages needed).
import { readFileSync, writeFileSync } from "node:fs";
const w = {}; new Function("window", readFileSync("market.js", "utf8"))(w); const M = w.MARKET;
const UA = { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36", "Accept-Language": "en-US,en;q=0.9" };
const sleep = ms => new Promise(r => setTimeout(r, ms)), errors = [];
async function get(url, tries = 2) {
  for (let i = 0; i < tries; i++) { try { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) }); if (r.ok) return r; } catch (e) {} await sleep(700 * (i + 1)); }
  throw new Error("request failed");
}
async function yahoo(sym) {
  for (const host of ["query1", "query2"]) try {
    const j = await (await get(`https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=5d`)).json();
    const r = j.chart.result[0], m = r.meta, off = m.gmtoffset || 0, cl = r.indicators.quote[0].close || [];
    const pts = (r.timestamp || []).map((t, i) => [t, cl[i]]).filter(x => x[1] != null);
    if (!pts.length || !m.regularMarketPrice) continue;
    const day = t => Math.floor((t + off) / 86400), ld = day(pts[pts.length - 1][0]), before = pts.filter(x => day(x[0]) < ld);
    return { p: m.regularMarketPrice, prev: before.length ? before[before.length - 1][1] : m.chartPreviousClose, t: m.regularMarketTime || pts[pts.length - 1][0], h: pts.slice(-150).map(x => +x[1].toFixed(4)) };
  } catch (e) {}
  throw new Error("no data");
}
const jobs = [...M.indices, ...M.stocks, { s: "GOLD", y: M.metals.gold.y }, { s: "SILVER", y: M.metals.silver.y }, { s: "USD/INR", y: M.fxY }], quotes = {};
async function run(j) { for (const y of [].concat(j.y)) try { quotes[j.s] = await yahoo(y); return; } catch (e) { errors.push(`${j.s} (${y}): ${e.message}`); } }
const queue = [...jobs]; await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await run(queue.shift()); }));

// Fuel prices scraped from public pages; every source is optional and sanity-checked.
const txt = async u => (await (await get(u)).text()).replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#\d+;/g, " ").replace(/\s+/g, " ");
const pick = async (srcs, lo, hi) => { for (const [u, re] of srcs) try { const m = (await txt(u)).match(re), v = m && parseFloat(m[1]); if (v > lo && v < hi) return v; } catch (e) { errors.push("fuel " + u + ": " + e.message); } return null; };
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const clean = o => { const r = Object.fromEntries(Object.entries(o).filter(([, v]) => v)); return Object.keys(r).length ? { ...r, date: today } : undefined; };
const GR = "https://www.goodreturns.in/", CD = "https://www.cardekho.com/", AAA = "https://gasprices.aaa.com/";
const fuel = {
  india: clean({
    petrol: await pick([[GR + "petrol-price-in-new-delhi.html", /Petrol Price is (?:Rs\.?|₹)\s*([\d.]+)/i], [CD + "petrol-price-in-delhi-state", /Petrol price in Delhi stands at\s*₹\s*([\d.]+)/i]], 50, 200),
    diesel: await pick([[GR + "diesel-price-in-new-delhi.html", /Diesel Price is (?:Rs\.?|₹)\s*([\d.]+)/i], [CD + "diesel-price-in-delhi-state", /Diesel price in Delhi stands at\s*₹\s*([\d.]+)/i]], 50, 200)
  }),
  usa: clean({
    gasoline: await pick([[AAA, /National Average\s*\$\s*([\d.]+)/i]], 2, 10),
    diesel: await pick([[AAA, /Current Avg\.?\s*\$\s*[\d.]+\s*\$\s*[\d.]+\s*\$\s*[\d.]+\s*\$\s*([\d.]+)/i]], 2, 12)
  })
};
writeFileSync("live-data.json", JSON.stringify({ updated: new Date().toISOString(), quotes, fuel, errors }));
console.log(`quotes ${Object.keys(quotes).length}/${jobs.length}`, JSON.stringify(fuel), errors.length ? "\nerrors:\n" + errors.join("\n") : "");
