(() => {
  const M = MARKET, R = document.getElementById("dash"); if (!R) return;
  const q = s => R.querySelector(s);
  const N = (v, c = "USD", d = 2) => v.toLocaleString(c === "INR" ? "en-IN" : "en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const cs = c => (c === "INR" ? "₹" : "$"), rnd = () => Math.random() - .5;
  const pc = v => (v >= 0 ? "+" : "") + v.toFixed(2) + "%", cl = v => (v >= 0 ? "g" : "r");
  const bd = a => (a.src === "live" ? (Date.now() / 1000 - a.t < 1800 ? "LIVE" : "CLOSE") : "SIM");
  const chg = a => (a.p / a.prev - 1) * 100, dc = a => (a.dir > 0 ? "up" : a.dir < 0 ? "dn" : "");

  /* ---------- assets ---------- */
  const mk = o => {
    const a = { vol: .0008, ...o, src: "sim", dir: 0 }; a.prev = a.p; a.p *= 1 + rnd() * .006;
    const h = [1]; for (let i = 1; i < 120; i++) h.push(h[i - 1] * (1 + rnd() * 4 * a.vol));
    const k = a.p / h[119]; a.h = h.map(v => v * k); return a;
  };
  const idx = M.indices.map(mk), stk = M.stocks.map(mk);
  const gold = mk({ s: "GOLD", n: "Gold spot, USD per oz", cur: "USD", ...M.metals.gold });
  const silver = mk({ s: "SILVER", n: "Silver spot, USD per oz", cur: "USD", ...M.metals.silver });
  const fxa = mk({ s: "USD/INR", n: "US dollar in rupees", cur: "INR", p: M.fx, vol: .0002 });
  const all = [...idx, ...stk, gold, silver, fxa];
  const step = a => {
    if (a.src === "live") return;   // real data only changes when a new snapshot arrives
    const o = a.p; a.p *= 1 + rnd() * 2 * a.vol + (a.prev - a.p) / a.p * .0015;
    a.dir = Math.sign(a.p - o); a.h.push(a.p); if (a.h.length > 150) a.h.shift();
  };

  /* ---------- indicators ---------- */
  const sma = (h, n) => (h.length < n ? null : h.slice(-n).reduce((x, y) => x + y, 0) / n);
  const smaS = (h, n) => h.map((_, i) => (i < n - 1 ? null : h.slice(i - n + 1, i + 1).reduce((x, y) => x + y, 0) / n));
  const rsi = h => { if (h.length < 15) return 50; let g = 0, l = 0; for (let i = h.length - 14; i < h.length; i++) { const d = h[i] - h[i - 1]; d > 0 ? g += d : l -= d; } return l === 0 ? 100 : 100 - 100 / (1 + g / l); };
  const rsiS = h => h.map((_, i) => (i < 14 ? null : rsi(h.slice(0, i + 1))));

  /* ---------- strategy: SMA 9/21 crossover with RSI filter, paper trading ---------- */
  const CAP = 1000000; let cash, log, closed, wins, eq;
  const inr = a => (a.cur === "USD" ? fxa.p : 1);
  const reset = () => { cash = CAP; log = []; closed = 0; wins = 0; eq = [CAP]; stk.forEach(a => { a.q = 0; a.e = 0; a.cd = 0; }); };
  const order = (side, a, qty, g) => { log.unshift({ t: new Date().toLocaleTimeString("en-GB"), side, s: a.s, qty, px: a.p, cur: a.cur, g }); if (log.length > 10) log.pop(); };
  const algo = a => {
    const h = a.h, p = h.slice(0, -1), f = sma(h, 9), s = sma(h, 21), pf = sma(p, 9), ps = sma(p, 21), r = rsi(h);
    a.r = r; a.sig = Math.abs(f - s) / s < .0002 ? "HOLD" : f > s ? "BUY" : "SELL";
    if (a.cd > 0) { a.cd--; return; }
    if (!a.q && pf <= ps && f > s && r < 70) {
      const qty = Math.floor(CAP * .05 / (a.p * inr(a)));
      if (qty > 0 && cash >= qty * a.p * inr(a)) { cash -= qty * a.p * inr(a); a.q = qty; a.e = a.p; a.cd = 12; order("BUY", a, qty); }
    } else if (a.q && ((pf >= ps && f < s) || r > 78)) {
      const g = (a.p - a.e) * a.q * inr(a); cash += a.q * a.p * inr(a); closed++; if (g > 0) wins++;
      order("SELL", a, a.q, g); a.q = 0; a.cd = 12;
    }
  };
  const equity = () => cash + stk.reduce((t, a) => t + a.q * a.p * inr(a), 0);

  /* ---------- real data: live-data.json is rebuilt by the scheduled GitHub Action ---------- */
  let stamp = null;
  async function live() {
    if (M.mode === "demo") return;
    try {
      const r = await fetch("live-data.json?t=" + Math.floor(Date.now() / 60000), { cache: "no-store" }); if (!r.ok) return;
      const j = await r.json(); stamp = j.updated;
      all.forEach(a => {
        const x = j.quotes && j.quotes[a.s]; if (!x || !x.p) return;
        a.dir = Math.sign(x.p - a.p); a.p = x.p; a.prev = x.prev || a.prev; a.t = x.t; a.src = "live";
        if (x.h && x.h.length > 25) { a.h = x.h.slice(-149); a.h.push(x.p); }
      });
      if (j.fuel) { Object.assign(M.fuel.india, j.fuel.india || {}); Object.assign(M.fuel.usa, j.fuel.usa || {}); }
    } catch (e) { /* file missing or offline: keep simulating */ }
  }

  /* ---------- drawing helpers ---------- */
  const sp = (h, up) => {
    const n = h.slice(-50), lo = Math.min(...n), d = Math.max(...n) - lo || 1;
    return `<svg class="sp ${up ? "g" : "r"}" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${n.map((v, i) => `${(i / (n.length - 1) * 100).toFixed(1)},${(26 - (v - lo) / d * 24).toFixed(1)}`).join(" ")}"/></svg>`;
  };
  function setup(cv, hh) { const d = devicePixelRatio || 1, w = cv.clientWidth; if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = hh * d; } const x = cv.getContext("2d"); x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, w, hh); return [x, w]; }
  function chart(a) {
    const cv = q("#cv"), H = 320, [x, w] = setup(cv, H), h = a.h, n = h.length, f = smaS(h, 9), s = smaS(h, 21), pad = 52;
    let lo = Math.min(...h), hi = Math.max(...h); const m = (hi - lo) * .12 || 1; lo -= m; hi += m;
    const X = i => pad + i / (n - 1) * (w - pad - 10), Y = v => H - 14 - (v - lo) / (hi - lo) * (H - 28);
    x.font = "11px system-ui"; x.fillStyle = "#8b98a9"; x.strokeStyle = "#1c2533"; x.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4, y = Y(v); x.beginPath(); x.moveTo(pad, y); x.lineTo(w, y); x.stroke(); x.fillText(N(v, a.cur, v > 1000 ? 0 : 2), 2, y + 4); }
    const path = arr => { x.beginPath(); let on = false; arr.forEach((v, i) => { if (v == null) return; on ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v)); on = true; }); };
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(59,130,246,.30)"); g.addColorStop(1, "rgba(59,130,246,0)");
    path(h); x.lineTo(X(n - 1), H); x.lineTo(X(0), H); x.fillStyle = g; x.fill();
    [[h, "#3b82f6", 2], [f, "#f59e0b", 1.3], [s, "#a78bfa", 1.3]].forEach(([arr, c, lw]) => { path(arr); x.strokeStyle = c; x.lineWidth = lw; x.stroke(); });
    for (let i = 22; i < n; i++) {
      const p = f[i - 1] - s[i - 1], c = f[i] - s[i], d = p <= 0 && c > 0 ? 1 : p >= 0 && c < 0 ? -1 : 0; if (!d) continue;
      const px = X(i), py = Y(h[i]) + d * 12; x.fillStyle = d > 0 ? "#22c55e" : "#ef4444"; x.beginPath();
      x.moveTo(px, py - d * 6); x.lineTo(px - 5, py + d * 4); x.lineTo(px + 5, py + d * 4); x.closePath(); x.fill();
    }
    const y = Y(a.p); x.setLineDash([4, 4]); x.strokeStyle = "#3b82f6"; x.lineWidth = 1; x.beginPath(); x.moveTo(pad, y); x.lineTo(w, y); x.stroke(); x.setLineDash([]);
    x.fillStyle = "#3b82f6"; x.fillRect(w - 62, y - 9, 62, 18); x.fillStyle = "#fff"; x.fillText(N(a.p, a.cur, a.p > 1000 ? 0 : 2), w - 58, y + 4);
    const [z, zw] = setup(q("#cr"), 70), rs = rsiS(h), RX = i => pad + i / (n - 1) * (zw - pad - 10), RY = v => 66 - v / 100 * 62;
    z.font = "11px system-ui"; z.fillStyle = "#8b98a9"; z.strokeStyle = "#1c2533"; z.setLineDash([3, 4]);
    [30, 70].forEach(v => { z.beginPath(); z.moveTo(pad, RY(v)); z.lineTo(zw, RY(v)); z.stroke(); z.fillText(v, 26, RY(v) + 4); });
    z.setLineDash([]); z.fillText("RSI", 2, 12); z.beginPath(); let on = false;
    rs.forEach((v, i) => { if (v == null) return; on ? z.lineTo(RX(i), RY(v)) : z.moveTo(RX(i), RY(v)); on = true; }); z.strokeStyle = "#22d3ee"; z.lineWidth = 1.4; z.stroke();
  }

  /* ---------- page ---------- */
  R.innerHTML = `<div class="dg">
    <div class="tape" aria-label="Market ticker"><div class="track" id="tape"></div></div>
    <header class="dhd"><div><h1>Algo Trading Desk</h1><p id="asof"></p></div>
      <div class="ctl"><span class="pill" id="st"></span><span class="clock" id="ck"></span><button class="btn2" id="md"></button><button class="btn2" id="pz">Pause</button><button class="btn2" id="rs">Reset paper account</button></div></header>
    <div class="kpis" id="kp"></div>
    <section class="card c8"><div class="ch" id="ch"></div><canvas id="cv"></canvas><canvas id="cr"></canvas></section>
    <section class="card c4"><div class="tabs" id="tb"></div><div class="sc"><table id="wl"></table></div></section>
    <section class="card c4" id="mt"></section><section class="card c8" id="fu"></section>
    <section class="card c6" id="pf"></section><section class="card c6" id="od"></section>
    <p class="note" id="nt"></p></div>`;
  q("#asof").textContent = `Real quotes come from Yahoo Finance and public fuel pages via a scheduled job (about every 10 minutes). Reference values (${M.asOf}) and simulated ticks fill in whenever a feed is unavailable.`;
  q("#nt").textContent = "Paper trading only, not investment advice. Quotes use Yahoo Finance public endpoints (unofficial, may be delayed or occasionally unavailable) and AAA, Goodreturns and CarDekho fuel pages; badges show LIVE, CLOSE (market shut, last close) or SIM (simulated). Assets marked ≈ use rough seeds until real data arrives. Metal rupee values are spot equivalents and exclude Indian import duty, GST and making charges.";
  let sel = "RELIANCE", flt = "ALL", paused = false; reset();

  function draw() {
    const a = all.find(x => x.s === sel) || stk[0], fx = fxa.p, nl = all.filter(x => x.src === "live").length;
    const tp = all.filter(x => x !== fxa || true).map(x => `<span>${x.s}<b class="${cl(chg(x))}">${N(x.p, x.cur)} ${pc(chg(x))}</b></span>`).join("");
    q("#tape").innerHTML = tp + tp;
    const lvN = all.filter(x => bd(x) === "LIVE").length, ago = stamp ? Math.max(0, Math.round((Date.now() - Date.parse(stamp)) / 60000)) : 0;
    q("#st").textContent = nl ? `REAL DATA: ${lvN} live, ${nl - lvN} at last close, snapshot ${ago} min old` : "SIMULATED"; q("#st").className = "pill" + (nl ? " lv" : "");
    q("#md").textContent = M.mode === "demo" ? "Data: simulated" : "Data: real when available"; q("#pz").textContent = paused ? "Resume" : "Pause";
    q("#kp").innerHTML = [...idx, gold, silver].slice(0, 4).map(k => `<div class="card kpi${k.s === sel ? " on" : ""}" data-s="${k.s}"><small>${k.s}</small><i class="bd">${bd(k)}</i><b class="${dc(k)}">${cs(k.cur)}${N(k.p, k.cur)}</b><span class="${cl(chg(k))}">${pc(chg(k))}</span>${sp(k.h, chg(k) >= 0)}</div>`).join("");
    const rs = rsi(a.h), sg = a.sig || "HOLD";
    q("#ch").innerHTML = `<div><b>${a.s}</b><small>${a.n || ""}</small> <i class="sg ${sg}">${sg}</i> <small>RSI ${rs.toFixed(0)}</small></div><div class="px ${cl(chg(a))}">${cs(a.cur)}${N(a.p, a.cur)}<span>${pc(chg(a))}</span></div>
      <div class="lg"><i style="background:#3b82f6"></i>Price<i style="background:#f59e0b"></i>SMA 9<i style="background:#a78bfa"></i>SMA 21<i style="background:#22d3ee"></i>RSI 14 below<span class="g"> ▲ buy cross</span><span class="r"> ▼ sell cross</span></div>`;
    chart(a);
    q("#tb").innerHTML = [["ALL", "All"], ["NSE", "India"], ["US", "US"]].map(([k, t]) => `<button data-f="${k}" class="${flt === k ? "on" : ""}">${t}</button>`).join("");
    q("#wl").innerHTML = `<tr><th>Symbol</th><th>Price</th><th>Change</th><th>Trend</th><th>Signal</th></tr>` + stk.filter(x => flt === "ALL" || (flt === "NSE") === (x.mk === "NSE")).map(x =>
      `<tr data-s="${x.s}" class="${x.s === sel ? "on" : ""}"><td><b>${x.s}</b><small>${x.n}${x.approx ? " ≈" : ""}</small></td><td class="${dc(x)}">${cs(x.cur)}${N(x.p, x.cur)}</td><td class="${cl(chg(x))}">${pc(chg(x))}</td><td>${sp(x.h, chg(x) >= 0)}</td><td><i class="sg ${x.sig || "HOLD"}">${x.sig || "HOLD"}</i></td></tr>`).join("");
    const m = (t, k, extra) => `<div data-s="${k.s}" style="cursor:pointer"><h3>${t}</h3><b class="${dc(k)}">$${N(k.p)}</b> <span class="${cl(chg(k))}">${pc(chg(k))}</span><p>per troy ounce, ${bd(k) === "SIM" ? "simulated" : bd(k) === "LIVE" ? "live" : "last close"}</p>${extra}${sp(k.h, chg(k) >= 0)}</div>`;
    q("#mt").innerHTML = `<div class="met">${m("Gold", gold, `<p><strong>₹${N(gold.p * fx / 31.1035 * 10, "INR", 0)}</strong> per 10 g, spot equivalent</p>`)}${m("Silver", silver, `<p><strong>₹${N(silver.p * fx / 31.1035 * 1000, "INR", 0)}</strong> per kg, spot equivalent</p>`)}<p>Gold to silver ratio ${(gold.p / silver.p).toFixed(1)}. USD/INR ${fx.toFixed(2)}.</p></div>`;
    const I = M.fuel.india, U = M.fuel.usa, gal = 3.78541, mx = Math.max(I.petrol, I.diesel, U.gasoline * fx / gal, U.diesel * fx / gal);
    const fr = (t, ip, up) => `<tr><td>${t}</td><td>₹${N(ip)}</td><td>$${N(ip / fx)}</td><td>$${N(up)}</td><td>$${N(up / gal)}</td><td>₹${N(up * fx / gal)}</td></tr>`;
    const bar = (l, v, us) => `<div class="bar ${us ? "us" : ""}"><span>${l}</span><div><i style="width:${v / mx * 100}%"></i></div><span>₹${N(v)}/L</span></div>`;
    q("#fu").innerHTML = `<h3>Fuel prices, India (${I.city}) and USA</h3><div class="sc"><table><tr><th>Fuel</th><th>India ₹/L</th><th>India $/L</th><th>US $/gal</th><th>US $/L</th><th>US ₹/L</th></tr>${fr("Petrol / gasoline", I.petrol, U.gasoline)}${fr("Diesel", I.diesel, U.diesel)}</table></div>
      <div class="bars">${bar("Petrol India", I.petrol)}${bar("Gasoline US", U.gasoline * fx / gal, 1)}${bar("Diesel India", I.diesel)}${bar("Diesel US", U.diesel * fx / gal, 1)}</div>
      <p class="mut">${I.city} CNG ₹${N(I.cng)} per kg. India as of ${I.date} (revised daily at 6 AM). US national average as of ${U.date}.</p>`;
    const eqv = equity(), pl = eqv - CAP, open = stk.filter(x => x.q);
    q("#pf").innerHTML = `<h3>Paper portfolio, strategy: SMA 9/21 crossover with RSI filter</h3><div class="stats4"><div><small>Equity</small><b>₹${N(eqv, "INR", 0)}</b></div><div><small>P&amp;L</small><b class="${cl(pl)}">${pl >= 0 ? "+" : "-"}₹${N(Math.abs(pl), "INR", 0)}</b></div><div><small>Open positions</small><b>${open.length}</b></div><div><small>Win rate</small><b>${closed ? Math.round(wins / closed * 100) + "%" : "n/a"}</b></div></div>${sp(eq, pl >= 0)}
      ${open.length ? `<div class="sc"><table><tr><th>Symbol</th><th>Qty</th><th>Entry</th><th>Last</th><th>P&amp;L</th></tr>${open.map(x => { const g = (x.p - x.e) * x.q * inr(x); return `<tr data-s="${x.s}"><td>${x.s}</td><td>${x.q}</td><td>${cs(x.cur)}${N(x.e, x.cur)}</td><td>${cs(x.cur)}${N(x.p, x.cur)}</td><td class="${cl(g)}">₹${N(g, "INR", 0)}</td></tr>`; }).join("")}</table></div>` : `<p class="mut">No open positions. The strategy buys when SMA 9 crosses above SMA 21 with RSI under 70, and exits on the reverse cross or RSI above 78. Each entry uses 5% of the ₹10,00,000 starting capital.</p>`}`;
    q("#od").innerHTML = `<h3>Order log</h3><ul class="ol">${log.length ? log.map(o => `<li><i class="sg ${o.side}">${o.side}</i><b>${o.s}</b>${o.qty} @ ${cs(o.cur)}${N(o.px, o.cur)}<span>${o.t}</span>${o.g !== undefined ? `<em class="${cl(o.g)}">₹${N(o.g, "INR", 0)}</em>` : ""}</li>`).join("") : `<li class="mut">Waiting for the first signal.</li>`}</ul>`;
  }

  function tick() { if (paused) return; all.forEach(step); stk.forEach(algo); eq.push(equity()); if (eq.length > 150) eq.shift(); draw(); }

  R.addEventListener("click", e => {
    const t = e.target, r = t.closest("[data-s]"), f = t.closest("[data-f]");
    if (r) sel = r.dataset.s; else if (f) flt = f.dataset.f;
    else if (t.id === "pz") paused = !paused;
    else if (t.id === "rs") reset();
    else if (t.id === "md") { M.mode = M.mode === "demo" ? "auto" : "demo"; if (M.mode === "demo") all.forEach(x => x.src = "sim"); else live(); }
    else return;
    draw();
  });
  const clock = () => { q("#ck").textContent = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST  |  " + new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York" }) + " New York"; };
  addEventListener("resize", draw);
  clock(); setInterval(clock, 1000); tick(); setInterval(tick, M.tickMs); live(); setInterval(live, M.pollMs);
})();
