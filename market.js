/* Trading desk configuration. Edit values here; no code changes needed.
   Reference prices come from 18 to 20 Sep 2026 sources. Ticks are simulated around them
   unless mode is "live". Entries with approx:true are rough seeds, please update them. */
window.MARKET = {
  mode: "auto",        // "auto" = real data from live-data.json when available, else simulated; "demo" = always simulated
  tickMs: 1500,        // screen refresh for simulated assets
  pollMs: 60000,       // how often the page re-reads live-data.json
  fxY: "INR=X",        // Yahoo Finance symbols (y) are read by scripts/fetch-data.mjs
  asOf: "18 Sep 2026 close",
  fx: 95.89,           // USD to INR
  indices: [
    { s: "NIFTY 50", y: "^NSEI", n: "NSE benchmark", cur: "INR", p: 23346.40, vol: .0004 },
    { s: "SENSEX", y: "^BSESN", n: "BSE benchmark", cur: "INR", p: 74294.96, vol: .0004 },
    { s: "S&P 500", y: "^GSPC", n: "US large caps", cur: "USD", p: 7650.50, vol: .0004 },
    { s: "NASDAQ", y: "^IXIC", n: "Nasdaq Composite", cur: "USD", p: 26522.55, vol: .0006 }
  ],
  stocks: [
    { s: "RELIANCE", y: "RELIANCE.NS", n: "Reliance Industries", mk: "NSE", cur: "INR", p: 1226.40, vol: .0009 },
    { s: "TCS", y: "TCS.NS", n: "Tata Consultancy", mk: "NSE", cur: "INR", p: 2123.10, vol: .0009 },
    { s: "INFY", y: "INFY.NS", n: "Infosys", mk: "NSE", cur: "INR", p: 1046.10, vol: .001 },
    { s: "ICICIBANK", y: "ICICIBANK.NS", n: "ICICI Bank", mk: "NSE", cur: "INR", p: 1379.30, vol: .0009 },
    { s: "SBIN", y: "SBIN.NS", n: "State Bank of India", mk: "NSE", cur: "INR", p: 995.70, vol: .001 },
    { s: "HCLTECH", y: "HCLTECH.NS", n: "HCL Technologies", mk: "NSE", cur: "INR", p: 1242.40, vol: .001 },
    { s: "AAPL", y: "AAPL", n: "Apple", mk: "US", cur: "USD", p: 336, vol: .0009, approx: true },
    { s: "NVDA", y: "NVDA", n: "Nvidia", mk: "US", cur: "USD", p: 190, vol: .0016, approx: true },
    { s: "MSFT", y: "MSFT", n: "Microsoft", mk: "US", cur: "USD", p: 520, vol: .0009, approx: true },
    { s: "TSLA", y: "TSLA", n: "Tesla", mk: "US", cur: "USD", p: 330, vol: .002, approx: true },
    { s: "AMZN", y: "AMZN", n: "Amazon", mk: "US", cur: "USD", p: 235, vol: .0011, approx: true },
    { s: "GOOGL", y: "GOOGL", n: "Alphabet", mk: "US", cur: "USD", p: 250, vol: .0011, approx: true }
  ],
  metals: {                                   // USD per troy ounce
    gold: { y: ["XAUUSD=X", "GC=F"], p: 4380, vol: .0003 },
    silver: { y: ["XAGUSD=X", "SI=F"], p: 67.0, vol: .0007 }
  },
  fuel: {
    india: { city: "Delhi", petrol: 102.12, diesel: 95.20, cng: 83.09, date: "19 Sep 2026" },   // Rs per litre, CNG Rs per kg
    usa: { gasoline: 4.48, diesel: 6.31, date: "16 to 19 Sep 2026" }                           // USD per gallon, AAA national average
  }
};
