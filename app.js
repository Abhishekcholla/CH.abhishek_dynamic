(() => {
  const S = SITE, P = S.projects, C = S.contact, B = document.body.dataset.page;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const h = (a, f) => a.map(f).join("");
  const red = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tg = a => `<div class="tags">${h(a, t => `<span>${t}</span>`)}</div>`;
  const first = x => { const s = x.split(". ")[0]; return s.endsWith(".") ? s : s + "."; };
  const card = (p, i) => `<a class="pc" href="project.html?id=${i}" data-k="${p.tags.join("|")}"><div class="vis t${i % 5}"><em>${p.d}</em></div><div class="pb"><small>${p.tags[0]}</small><h3>${p.t}</h3><p>${p.x}</p><span class="lnk">Learn more</span></div></a>`;
  const row = (e, k) => `<div class="row"><small>${e.d}</small><div><h3>${e.t}</h3><p class="o">${e.o}</p><p>${k}</p></div></div>`;

  const nav = `<header class="nav"><div class="in"><a class="brand" href="index.html">${S.name}</a><nav>
    <div class="mg"><a href="projects.html">Work</a><div class="mega">${h(P, (p, i) => `<a href="project.html?id=${i}">${p.t}</a>`)}<a href="projects.html"><b>All projects ›</b></a></div></div>
    <a href="journey.html">Journey</a><a href="skills.html">Skills</a><a href="trading.html">Trading</a><a href="contact.html">Contact</a></nav></div></header>`;
  const foot = `<footer class="foot"><div class="fi">
    <div><b>Explore</b><a href="index.html">Home</a><a href="projects.html">Projects</a><a href="journey.html">Journey</a><a href="skills.html">Skills and trainings</a><a href="trading.html">Trading desk</a></div>
    <div><b>Featured work</b>${h(P.slice(0, 4), (p, i) => `<a href="project.html?id=${i}">${p.t}</a>`)}</div>
    <div><b>Connect</b><a href="mailto:${C.email}">Email</a><a href="resume.pdf">Resume (PDF)</a>${C.github ? `<a href="${C.github}">GitHub</a>` : ""}${C.linkedin ? `<a href="${C.linkedin}">LinkedIn</a>` : ""}</div></div>
    <p>Copyright © ${new Date().getFullYear()} ${S.name}. ${C.location}.</p></footer>`;

  const slides = [
    { c: 4, s: S.eyebrow, t: S.name, x: S.lead, a: ["projects.html", "See projects"], b: ["resume.pdf", "Download resume"] },
    ...P.slice(0, 4).map((p, i) => ({ c: i, s: p.d, t: p.t, x: first(p.x), a: [`project.html?id=${i}`, "Learn more"], b: ["projects.html", "All projects"] }))
  ];
  const cats = [[P.length, "Projects", "projects.html", 0], [S.experience.length, "Experience", "journey.html", 1], [S.skills.length, "Skill areas", "skills.html", 2], [S.certs.length, "Trainings", "skills.html#trainings", 3], ["@", "Contact", "contact.html", 4]];

  const pages = {
    home: () => `<section class="car" aria-roledescription="carousel" aria-label="Featured">${h(slides, (s, i) =>
      `<article class="sl t${s.c}${i ? "" : " on"}"><i class="blob b1"></i><i class="blob b2"></i><div class="txt"><small>${s.s}</small><h${i ? 2 : 1} class="big">${s.t}</h${i ? 2 : 1}><p>${s.x}</p><div><a class="pill" href="${s.a[0]}">${s.a[1]}</a><a class="pill ghost" href="${s.b[0]}">${s.b[1]}</a></div></div></article>`)}
      <div class="ctl">${h(slides, (s, i) => `<button class="dot${i ? "" : " on"}" aria-label="Slide ${i + 1}"></button>`)}<button class="pp" aria-label="Pause">❚❚</button></div></section>
      <nav class="cats" aria-label="Quick links">${h(cats, c => `<a href="${c[2]}"><span class="t${c[3]}">${c[0]}</span>${c[1]}</a>`)}</nav>
      <div class="sec"><h2>The latest.</h2><p class="sub">Take a look at what I'm building.</p><div class="rail" id="rail">${h(P, card)}</div>
        <div class="rb"><button id="rp" aria-label="Previous">‹</button><button id="rn" aria-label="Next">›</button></div></div>
      <div class="band"><div class="sec"><h2>By the numbers.</h2><p class="sub">Hands-on work behind the resume.</p>
        <div class="nums">${h(S.stats, s => `<div><b data-n="${s.n}" data-s="${s.s}">0</b><span>${s.l}</span></div>`)}</div></div></div>
      <div class="sec"><h2>Go further.</h2><p class="sub">More about how I work.</p><div class="tiles">
        <a class="tile" href="journey.html"><h3>Journey</h3><p>Internships, education and highlights.</p><span class="lnk">Learn more</span></a>
        <a class="tile" href="skills.html"><h3>Skills and trainings</h3><p>Hardware, VLSI, code and design tools.</p><span class="lnk">Learn more</span></a>
        <a class="tile" href="resume.pdf"><h3>Resume</h3><p>The full one-pager as a PDF.</p><span class="lnk">Download</span></a></div></div>`,

    projects: () => { const T = [...new Set(P.flatMap(p => p.tags))];
      return `<div class="ph"><h1 class="big">Projects.</h1><p class="sub">Hardware, chips and models, from prototype to paper.</p></div>
      <div class="sec tight"><div class="chips"><button class="chip on" data-f="">All</button>${h(T, t => `<button class="chip" data-f="${t}">${t}</button>`)}</div><div class="grid">${h(P, card)}</div></div>`; },

    project: () => { const i = Math.max(0, Math.min(+new URLSearchParams(location.search).get("id") || 0, P.length - 1)), p = P[i];
      document.title = `${p.t} | ${S.name}`;
      return `<section class="dh t${i % 5}"><i class="blob b1"></i><i class="blob b2"></i><div class="w"><a class="back" href="projects.html">‹ All projects</a><small style="margin-top:28px">${p.d}</small><h1 class="big">${p.t}</h1></div></section>
      <div class="sec narrow"><p class="lede">${p.x}</p>${tg(p.tags)}<div class="pn">${i ? `<a href="project.html?id=${i - 1}">‹ ${P[i - 1].t}</a>` : "<span></span>"}${i < P.length - 1 ? `<a href="project.html?id=${i + 1}">${P[i + 1].t} ›</a>` : ""}</div></div>`; },

    journey: () => `<div class="ph"><h1 class="big">Journey.</h1><p class="sub">Where I've worked and studied.</p></div>
      <div class="sec tight"><h2>Experience</h2>${h(S.experience, e => row(e, e.x))}</div>
      <div class="band"><div class="sec"><h2>Education</h2>${h(S.education, e => row(e, e.g))}</div></div>
      <div class="sec"><h2>Highlights</h2><ul class="plain" style="margin-top:22px">${h(S.highlights, x => `<li>${x}</li>`)}</ul></div>`,

    skills: () => `<div class="ph"><h1 class="big">Skills.</h1><p class="sub">Tools I use, grouped by what they're for.</p></div>
      <div class="sec tight"><div class="g3">${h(S.skills, g => `<div class="box"><h3>${g.g}</h3>${tg(g.i)}</div>`)}</div></div>
      <div class="band" id="trainings"><div class="sec"><h2>Trainings.</h2><p class="sub">Courses and certifications.</p>
        <div class="chips"><button class="chip on" data-f="">All</button><button class="chip" data-f="NPTEL">NPTEL</button><button class="chip" data-f="Other">Other</button></div>
        <ul class="cl">${h(S.certs, c => `<li data-k="${c.o.includes("NPTEL") ? "NPTEL" : "Other"}"><b>${c.t}</b><span>${c.o}</span><small>${c.d}</small></li>`)}</ul></div></div>`,

    trading: () => `<div class="dash" id="dash"></div>`,

    contact: () => `<div class="ph"><h1 class="big">Let's talk.</h1><p class="sub">Say hello about projects, internships or collaborations.</p></div>
      <div class="sec tight"><div class="tiles">
        <div class="tile"><h3>Email</h3><a href="mailto:${C.email}">${C.email}</a><button class="chip" id="cp">Copy address</button></div>
        <div class="tile"><h3>Phone</h3><a href="tel:${C.phone.replace(/\s/g, "")}">${C.phone}</a></div>
        <div class="tile"><h3>Location</h3><p>${C.location}</p>${C.github ? `<a href="${C.github}">GitHub</a>` : ""}${C.linkedin ? `<a href="${C.linkedin}">LinkedIn</a>` : ""}</div></div>
        <form class="frm" id="fm"><h2>Send a message</h2>
          <label>Your name<input name="n" required></label><label>Your email<input type="email" name="e" required></label>
          <label>Message<textarea name="m" rows="5" required></textarea></label>
          <button class="pill blue" type="submit">Open in email app</button><p class="mut">This opens your email app with the message filled in.</p></form></div>`
  };

  document.getElementById("app").innerHTML = nav + `<main>${(pages[B] || pages.home)()}</main>` + foot;

  /* carousel */
  const car = document.querySelector(".car");
  if (car) {
    const sl = $$(".sl"), dt = $$(".dot"), pp = car.querySelector(".pp"); let i = 0, t, on = !red;
    const go = n => { i = (n + sl.length) % sl.length; sl.forEach((s, k) => { s.classList.toggle("on", k === i); s.setAttribute("aria-hidden", k !== i); }); dt.forEach((d, k) => d.classList.toggle("on", k === i)); };
    const run = () => { clearInterval(t); if (on) t = setInterval(() => go(i + 1), 6500); };
    dt.forEach((d, k) => d.onclick = () => { go(k); run(); });
    pp.textContent = on ? "❚❚" : "▶";
    pp.onclick = () => { on = !on; pp.textContent = on ? "❚❚" : "▶"; pp.setAttribute("aria-label", on ? "Pause" : "Play"); run(); };
    addEventListener("keydown", e => { if (e.key === "ArrowRight") { go(i + 1); run(); } if (e.key === "ArrowLeft") { go(i - 1); run(); } });
    run();
    const rail = document.getElementById("rail");
    document.getElementById("rn").onclick = () => rail.scrollBy({ left: 360, behavior: "smooth" });
    document.getElementById("rp").onclick = () => rail.scrollBy({ left: -360, behavior: "smooth" });
  }

  /* filters */
  $$(".chips").forEach(c => c.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    $$(".chip", c).forEach(x => x.classList.toggle("on", x === b));
    $$("[data-k]", c.parentElement).forEach(el => el.hidden = !!b.dataset.f && !el.dataset.k.split("|").includes(b.dataset.f));
  }));

  /* contact */
  const cp = document.getElementById("cp");
  if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(C.email); cp.textContent = "Copied"; setTimeout(() => cp.textContent = "Copy address", 1600); } catch (e) { location.href = "mailto:" + C.email; } };
  const fm = document.getElementById("fm");
  if (fm) fm.onsubmit = e => { e.preventDefault(); const d = new FormData(fm);
    location.href = `mailto:${C.email}?subject=${encodeURIComponent("Hello from " + d.get("n"))}&body=${encodeURIComponent(d.get("m") + "\n\n" + d.get("n") + " (" + d.get("e") + ")")}`; };

  /* count-up and reveal */
  const cu = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cu.unobserve(e.target);
    const n = +e.target.dataset.n, s = e.target.dataset.s, t0 = performance.now();
    (function f(t) { const p = red ? 1 : Math.min((t - t0) / 1300, 1); e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + s; if (p < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .6 });
  $$("[data-n]").forEach(b => cu.observe(b));
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } }), { threshold: .12 });
  $$(".sec>*,.row,.box,.tile,.cats").forEach(el => { el.classList.add("rv"); rv.observe(el); });
})();
