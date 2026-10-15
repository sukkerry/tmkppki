/* Kod Blok – permainan belajar coding.
   Setiap level dijana daripada satu laluan penyelesaian (F=maju, L=kiri, R=kanan,
   n(...)=ulang n kali), jadi semua level dijamin boleh diselesaikan. */
const SOL = [
  // Asas: maju
  "FF", "FFF", "FFRFF", "FFLFF", "FRFLFF",
  // Asas: belok
  "FFRFFLFF", "FRFRFF", "FFFRFFLFF", "LFFRFFRFF", "FRFLFRFLFF",
  // Gelung (ulang)
  "4(F)", "3(F)R3(F)", "3(FR)", "2(3(F)R)F", "3(FRFL)",
  "4(FRFL)F", "2(FFRFFL)", "3(F)L3(F)R3(F)", "5(F)R5(F)", "2(FRFRFLFL)",
  // Gelung bersarang & mencabar
  "3(2(F)R)", "3(2(F)L)2(F)", "2(FFRF)L2(F)", "3(FLFR)F", "2(3(FR)L)",
  "4(FFRFL)", "2(2(FR)FL)3(F)", "3(FFRFFL)F", "2(3(FFR)LL)F", "3(2(FR)2(FL))F"
];
const HINTS = {
  0: "Tekan blok <b>Maju</b> untuk bergerak, kemudian ▶ Jalankan.",
  2: "Gunakan <b>Kanan</b> atau <b>Kiri</b> untuk membelok sebelum maju.",
  10: "Blok <b>Ulang</b> mengulang arahan di dalamnya. Ketik blok Ulang untuk tukar bilangan.",
  13: "Blok Ulang boleh diletakkan di dalam blok Ulang lain!",
  25: "Hampir tamat! Cari corak yang berulang."
};
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const LABEL = { F: "⬆ Maju", L: "↺ Kiri", R: "↻ Kanan", end: "Tamat" };

/* ---------- Pembantu ---------- */
function parse(s) {
  let i = 0;
  (function nothing() {})();
  function seq() {
    const a = [];
    while (i < s.length && s[i] !== ")") {
      const c = s[i];
      if (/\d/.test(c)) {
        i += 2; a.push({ t: "loop", n: +c });
        const b = seq(); i++;
        a.push(...b, { t: "end" });
      } else { a.push({ t: c }); i++; }
    }
    return a;
  }
  return seq();
}
function expand(t) {
  let i = 0;
  function seq() {
    const o = [];
    while (i < t.length && t[i].t !== "end") {
      const k = t[i++];
      if (k.t === "loop") {
        const inner = seq(); i++;
        for (let n = 0; n < k.n; n++) o.push(...inner);
      } else o.push(k.t);
    }
    return o;
  }
  return seq();
}
const count = t => t.filter(k => k.t !== "end").length;
const key = (x, y) => x + "," + y;

function build(sol, idx) {
  const tokens = parse(sol), acts = expand(tokens);
  let x = 0, y = 0, d = 1; const path = [[0, 0]];
  for (const a of acts) {
    if (a === "F") { x += DIRS[d][0]; y += DIRS[d][1]; path.push([x, y]); }
    else d = (d + (a === "R" ? 1 : 3)) % 4;
  }
  const minx = Math.min(...path.map(p => p[0])), miny = Math.min(...path.map(p => p[1]));
  const maxx = Math.max(...path.map(p => p[0])), maxy = Math.max(...path.map(p => p[1]));
  const P = path.map(p => [p[0] - minx, p[1] - miny]);
  const cells = new Set(P.map(p => key(...p)));
  const start = P[0], goal = P[P.length - 1], stars = new Set();
  if (idx >= 2) P.forEach((p, i) => {
    const k = key(...p);
    if (i % 3 === 2 && i < P.length - 1 && k !== key(...start) && k !== key(...goal)) stars.add(k);
  });
  const turns = /[LR]/.test(sol);
  const tools = ["F", ...(turns ? ["L", "R"] : []), ...(/\d/.test(sol) ? ["loop"] : [])];
  return {
    tokens, cells, start, goal, stars, tools, hint: HINTS[idx],
    w: maxx - minx + 1, h: maxy - miny + 1,
    max: count(tokens) + (idx < 5 ? 3 : idx < 10 ? 2 : 1)
  };
}
const LEVELS = SOL.map(build);

/* ---------- Bunyi (Web Audio, tanpa fail luaran) ---------- */
let muted = localStorage.getItem("kodblok-mute") === "1", AC;
function ctx() {
  if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
  if (AC.state === "suspended") AC.resume();
  return AC;
}
const N = n => 440 * Math.pow(2, (n - 9) / 12); // n = semiton dari C4
function tone(f, d = 0.12, type = "sine", v = 0.15, delay = 0, to) {
  if (muted) return;
  const a = ctx(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + 0.02);
}
const PENTA = [0, 2, 4, 7, 9];
const sfx = {
  click() { tone(N(12), .07, "triangle", .12); tone(N(19), .08, "triangle", .08, .04); },
  pop(t) {
    const f = N(t === "F" ? 12 : t === "loop" ? 19 : 16);
    tone(f * .8, .1, "square", .07, 0, f * 1.25); tone(f * 2, .08, "sine", .06, .05);
  },
  tick(n) { tone(N(17 + n * 2), .08, "triangle", .12); },
  del() { tone(N(9), .14, "sawtooth", .06, 0, N(-3)); },
  err() { tone(N(-5), .12, "square", .08); tone(N(-5), .12, "square", .08, .14); },
  start() { tone(N(0), .1, "square", .07); tone(N(7), .1, "square", .07, .08); tone(N(12), .16, "square", .07, .16); },
  step(i) { tone(N(12 + PENTA[i % 5] + 12 * (Math.floor(i / 5) % 2)), .1, "square", .06); },
  turn() { tone(N(5), .16, "triangle", .12, 0, N(17)); },
  star() { [24, 28, 31, 36].forEach((n, i) => tone(N(n), .14, "sine", .13, i * .06)); },
  bump() { tone(120, .25, "sawtooth", .16, 0, 50); },
  fail() { [7, 4, 0].forEach((n, i) => tone(N(n), i === 2 ? .45 : .2, "triangle", .16, .2 + i * .2)); },
  win() {
    [12, 16, 19, 24, 28, 31, 36].forEach((n, i) => {
      const last = i === 6;
      tone(N(n), last ? .7 : .14, "square", .07, i * .1);
      tone(N(n - 12), last ? .7 : .14, "triangle", .12, i * .1);
    });
  }
};
document.addEventListener("pointerdown", e => {
  if (e.target.closest(".btn:not(#run):not(#mute), .lv")) sfx.click();
});

/* ---------- Keadaan ---------- */
const $ = id => document.getElementById(id);
let save = JSON.parse(localStorage.getItem("kodblok") || "{}");
let lv = 0, L, prog = [], cur = 0, running = false, rot = 0, tries = 0;
const cellEls = {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const persist = () => localStorage.setItem("kodblok", JSON.stringify(save));
const unlocked = i => i === 0 || save[i - 1] !== undefined;

/* ---------- Menu ---------- */
function showMenu() {
  $("game").classList.add("hidden"); $("menu").classList.remove("hidden");
  const box = $("levels"); box.innerHTML = "";
  let total = 0;
  LEVELS.forEach((_, i) => {
    const b = document.createElement("button"), s = save[i];
    b.className = "lv" + (s ? " done" : "") + (unlocked(i) && s === undefined ? " new" : "");
    b.disabled = !unlocked(i);
    total += s || 0;
    b.innerHTML = `<b>${unlocked(i) ? i + 1 : "🔒"}</b><small>${s ? "⭐".repeat(s) : ""}</small>`;
    b.onclick = () => startLevel(i);
    box.appendChild(b);
  });
  $("hud").textContent = `⭐ ${total} / ${LEVELS.length * 3}`;
}

/* ---------- Level ---------- */
function startLevel(i) {
  lv = i; L = LEVELS[i]; prog = []; cur = 0; tries = 0;
  $("menu").classList.add("hidden"); $("game").classList.remove("hidden");
  $("modal").classList.add("hidden");
  $("title").textContent = `Level ${i + 1} / ${LEVELS.length}`;
  const pal = $("pal"); pal.innerHTML = "";
  L.tools.forEach(t => {
    const b = document.createElement("button");
    b.className = "blk " + (t === "loop" ? "loop" : t);
    b.textContent = t === "loop" ? "🔁 Ulang" : LABEL[t];
    b.onclick = () => add(t);
    pal.appendChild(b);
  });
  drawBoard(); drawProg();
  say(L.hint || "Susun blok, kemudian tekan ▶ Jalankan.");
}
function drawBoard() {
  const bd = $("board"); bd.innerHTML = "";
  bd.style.setProperty("--c", L.w); bd.style.setProperty("--r", L.h);
  const deco = ["🌲", "🪨", "🌳", "🌵"];
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
    const k = key(x, y), c = document.createElement("div");
    const f = L.cells.has(k);
    c.className = "cell " + (f ? "f" : "w");
    if (!f) c.textContent = deco[(x * 7 + y * 3 + lv) % deco.length];
    if (L.stars.has(k)) c.classList.add("s");
    if (k === key(...L.goal)) c.classList.add("g");
    cellEls[k] = c; bd.appendChild(c);
  }
  const bot = document.createElement("div");
  bot.className = "bot"; bot.id = "bot"; bot.innerHTML = '<div class="face" id="face"></div>';
  bd.appendChild(bot);
  placeBot(L.start[0], L.start[1], true);
  $("stars").textContent = `⭐ 0 / ${L.stars.size}`;
}
function placeBot(x, y, reset) {
  const bot = $("bot");
  if (reset) { rot = 0; $("face").style.transition = "none"; $("face").style.transform = "rotate(0deg)";
    void $("face").offsetWidth; $("face").style.transition = ""; }
  bot.style.transform = `translate(${x * 100}%,${y * 100}%)`;
}
const say = (h, cls = "") => { $("msg").innerHTML = h; $("msg").className = "msg " + cls; };

/* ---------- Atur cara ---------- */
function drawProg() {
  const p = $("prog"); p.innerHTML = "";
  if (!prog.length) p.innerHTML = '<span class="empty">Ketik blok di bawah untuk menambah…</span>';
  const curEl = () => { const e = document.createElement("span"); e.className = "cur"; return e; };
  prog.forEach((k, i) => {
    if (i === cur && prog.length) p.appendChild(curEl());
    const b = document.createElement("button");
    b.className = "blk " + (k.t === "loop" ? "loop" : k.t);
    b.textContent = k.t === "loop" ? `🔁 Ulang ${k.n}×` : LABEL[k.t];
    b.onclick = () => tap(i);
    p.appendChild(b);
  });
  if (cur === prog.length && prog.length) p.appendChild(curEl());
  $("count").textContent = `${count(prog)} / ${L.max} blok`;
}
function add(t) {
  if (running) return;
  if (count(prog) >= L.max) return sfx.err(), say("Had blok sudah penuh! Cuba guna <b>Ulang</b> atau buang blok.", "bad");
  if (t === "loop") { prog.splice(cur, 0, { t: "loop", n: 2 }, { t: "end" }); }
  else prog.splice(cur, 0, { t });
  sfx.pop(t); cur++; drawProg();
}
function tap(i) {
  if (running) return;
  const k = prog[i];
  if (k.t === "loop") { k.n = k.n >= 5 ? 2 : k.n + 1; sfx.tick(k.n); }
  else if (k.t === "end") { cur = i + 1; sfx.click(); }
  else { prog.splice(i, 1); if (i < cur) cur--; sfx.del(); }
  drawProg();
}
function matchEnd(i) {
  let d = 0;
  for (let j = i; j < prog.length; j++) {
    if (prog[j].t === "loop") d++;
    if (prog[j].t === "end" && --d === 0) return j;
  }
  return -1;
}
function undo() {
  if (running || cur === 0) return;
  sfx.del();
  const i = cur - 1, k = prog[i];
  if (k.t === "end") cur = i;
  else if (k.t === "loop") { prog.splice(matchEnd(i), 1); prog.splice(i, 1); cur = i; }
  else { prog.splice(i, 1); cur = i; }
  drawProg();
}

/* ---------- Jalankan ---------- */
function resetRun() {
  L.stars.forEach(k => cellEls[k].classList.remove("got"));
  placeBot(L.start[0], L.start[1], true); $("stars").textContent = `⭐ 0 / ${L.stars.size}`;
}
async function run() {
  if (running) return;
  const acts = expand(prog).slice(0, 300);
  if (!acts.length) return say("Tambah beberapa blok dahulu!", "bad");
  resetRun(); sfx.start(); running = true; $("run").disabled = true; say("Robot sedang bergerak…");
  let [x, y] = L.start, d = 1, got = 0, si = 0;
  try {
    for (const a of acts) {
      await sleep(420);
      if (a === "F") {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        if (!L.cells.has(key(nx, ny))) {
          sfx.bump(); const b = $("bot"); b.classList.add("bump"); setTimeout(() => b.classList.remove("bump"), 320);
          return fail("Aduh! Robot terlanggar. Semak arahan anda.");
        }
        x = nx; y = ny; placeBot(x, y); sfx.step(si++);
        const k = key(x, y);
        if (L.stars.has(k) && !cellEls[k].classList.contains("got")) {
          cellEls[k].classList.add("got"); got++; sfx.star(); $("stars").textContent = `⭐ ${got} / ${L.stars.size}`;
        }
      } else {
        const dd = a === "R" ? 1 : -1; d = (d + (dd > 0 ? 1 : 3)) % 4; rot += dd * 90; sfx.turn();
        $("face").style.transform = `rotate(${rot}deg)`;
      }
    }
    await sleep(350);
    if (key(x, y) === key(...L.goal)) win(got);
    else fail("Robot belum sampai ke bendera 🏁. Cuba lagi!");
  } finally { running = false; $("run").disabled = false; }
}
function fail(m) { sfx.fail(); tries++; say(m + (tries >= 3 ? " Buntu? Tekan 💡 Petunjuk." : ""), "bad"); }
function win(got) {
  sfx.win();
  const n = L.stars.size, s = !n || got === n ? 3 : got * 2 >= n ? 2 : 1;
  save[lv] = Math.max(save[lv] || 0, s); persist();
  say("Hebat! Level selesai 🎉", "ok");
  const last = lv === LEVELS.length - 1;
  $("m-emoji").textContent = last ? "🏆" : "🎉";
  $("m-title").textContent = last ? "Tahniah! Semua 30 level tamat!" : `Level ${lv + 1} selesai!`;
  $("m-stars").textContent = "⭐".repeat(s) + "☆".repeat(3 - s);
  $("m-next").textContent = last ? "☰ Menu" : "Seterusnya ➜";
  $("m-next").onclick = () => last ? (showMenu(), $("modal").classList.add("hidden")) : startLevel(lv + 1);
  $("modal").classList.remove("hidden");
}

/* ---------- Butang ---------- */
$("run").onclick = run;
$("undo").onclick = undo;
$("clear").onclick = () => { if (!running) { prog = []; cur = 0; drawProg(); resetRun(); } };
$("hint").onclick = () => {
  if (running) return;
  prog = L.tokens.map(k => ({ ...k })); cur = prog.length; drawProg(); resetRun();
  say("Ini satu penyelesaian. Tekan ▶ untuk lihat, dan cuba fahami coraknya!");
};
$("back").onclick = () => { if (!running) showMenu(); };
$("m-replay").onclick = () => { $("modal").classList.add("hidden"); prog = []; cur = 0; drawProg(); resetRun(); say("Cuba dengan lebih sedikit blok!"); };
$("reset-all").onclick = () => { if (confirm("Padam semua kemajuan?")) { save = {}; persist(); showMenu(); } };

showMenu();

/* Butang bisu / buka bunyi */
const syncMute = () => { $("mute").textContent = muted ? "🔇" : "🔊"; };
$("mute").onclick = () => {
  muted = !muted; localStorage.setItem("kodblok-mute", muted ? "1" : "0"); syncMute();
  if (!muted) sfx.click();
};
syncMute();
