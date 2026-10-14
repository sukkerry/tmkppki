(() => {
  "use strict";

  const TILES = { EMPTY: 0, WALL: 1, START: 2, GOAL: 3, FRUIT: 4, ROCK: 5 };
  const FRUITS = ["🍎", "🍌", "🍉", "🥭", "🍍", "🍊", "🍇", "🍓"];

  const LEVELS = {
    mudah: [
      { nama: "Lurus ke Kanan",
        grid: [[1,1,1,1,1,1],[1,2,0,0,4,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 5,
        hint: "Chompy perlu jalan 3 langkah ke kanan untuk makan buah.",
        hintAudio: "Chompy needs to walk three steps to the right to eat the fruit." },
      { nama: "Turun ke Bawah",
        grid: [[1,1,1,1,1,1],[1,2,1,1,1,1],[1,0,1,1,1,1],[1,4,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 5,
        hint: "Chompy perlu jalan 2 langkah ke bawah.",
        hintAudio: "Chompy needs to walk two steps down." },
      { nama: "Belok Sikit",
        grid: [[1,1,1,1,1,1],[1,2,0,0,1,1],[1,1,1,0,1,1],[1,1,1,4,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 8,
        hint: "Jalan kanan, kanan, bawah, bawah.",
        hintAudio: "Go right, right, down, down." },
      { nama: "Buah di Tepi",
        grid: [[1,1,1,1,1,1],[1,2,0,0,4,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 5,
        hint: "Sama seperti tahap 1, tetapi ulang supaya mahir.",
        hintAudio: "Same as level one. Repeat to master it." },
    ],
    sederhana: [
      { nama: "Dua Buah",
        grid: [[1,1,1,1,1,1],[1,2,0,4,0,1],[1,1,0,1,1,1],[1,1,4,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 10,
        hint: "Kumpul buah pertama di kanan, kemudian turun ke buah kedua.",
        hintAudio: "Collect the first fruit on the right, then go down to the second fruit." },
      { nama: "Ada Batu",
        grid: [[1,1,1,1,1,1],[1,2,0,5,4,1],[1,0,0,0,0,1],[1,4,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 12,
        hint: "Batu tak boleh dilalui. Pusing ikut bawah.",
        hintAudio: "You cannot pass the rock. Go around the bottom." },
      { nama: "Pusing S",
        grid: [[1,1,1,1,1,1],[1,2,0,4,1,1],[1,1,1,0,1,1],[1,4,0,0,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 12,
        hint: "Jalan seperti huruf S.",
        hintAudio: "Walk like the letter S." },
      { nama: "Rumah Chompy",
        grid: [[1,1,1,1,1,1],[1,2,0,4,0,1],[1,1,1,1,0,1],[1,1,1,1,3,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 10,
        hint: "Makan buah dahulu, kemudian pergi ke rumah.",
        hintAudio: "Eat the fruit first, then go home." },
    ],
    susah: [
      { nama: "Labirin Kecil",
        grid: [[1,1,1,1,1,1],[1,2,0,1,4,1],[1,1,0,1,0,1],[1,4,0,0,0,1],[1,1,1,1,3,1],[1,1,1,1,1,1]],
        maxBlocks: 18,
        hint: "Rancang jalan: kumpul semua buah, elak dinding, sampai rumah.",
        hintAudio: "Plan the path: collect all fruits, avoid walls, reach home." },
      { nama: "Zig-Zag Buah",
        grid: [[1,1,1,1,1,1],[1,2,0,4,0,1],[1,1,1,1,0,1],[1,4,0,0,0,1],[1,0,1,1,0,1],[1,3,1,1,4,1]],
        maxBlocks: 22,
        hint: "Ikut bentuk zig-zag. Setiap buah beri tenaga!",
        hintAudio: "Follow the zig-zag. Each fruit gives energy." },
      { nama: "Kubu Batu",
        grid: [[1,1,1,1,1,1],[1,2,0,5,0,1],[1,0,5,5,5,1],[1,0,0,4,0,1],[1,1,0,1,3,1],[1,1,1,1,1,1]],
        maxBlocks: 20,
        hint: "Batu menghalang. Cari jalan pusing.",
        hintAudio: "The rock blocks the way. Find a path around." },
      { nama: "Cabaran Hebat",
        grid: [[1,1,1,1,1,1],[1,2,0,4,0,1],[1,1,0,1,0,1],[1,4,0,5,0,1],[1,0,0,0,4,1],[1,3,1,1,1,1]],
        maxBlocks: 24,
        hint: "Ambil masa, fikir langkah satu-satu. Kamu boleh!",
        hintAudio: "Take your time, think step by step. You can do it." },
    ],
    bebas: [
      { nama: "Cipta Sendiri",
        grid: [[1,1,1,1,1,1],[1,2,0,0,0,1],[1,0,0,0,0,1],[1,0,0,0,3,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
        maxBlocks: 99,
        hint: "Guru boleh ubah peta dalam kod. Murid cari jalan sendiri.",
        hintAudio: "Teachers can change the map in the code. Students find their own path." },
    ],
  };

  const MODES = {
    mudah:     { title: "Tahap Mudah",     hint: "Pilih peta. Susun blok arahan.", color: "#4CB944" },
    sederhana: { title: "Tahap Sederhana", hint: "Ada buah banyak dan halangan.", color: "#F5B700" },
    susah:     { title: "Tahap Susah",     hint: "Labirin dan banyak buah.", color: "#FF6B4A" },
    bebas:     { title: "Mod Bebas",       hint: "Cipta jalan sendiri.", color: "#7B5CFF" },
  };

  const BLOCKS = [
    { id: "up",    label: "Atas",  icon: "⬆️", color: "#7B5CFF" },
    { id: "down",  label: "Bawah", icon: "⬇️", color: "#13A89E" },
    { id: "left",  label: "Kiri",  icon: "⬅️", color: "#FF6B4A" },
    { id: "right", label: "Kanan", icon: "➡️", color: "#4CB944" },
    { id: "eat",   label: "Makan", icon: "😋", color: "#F5B700" },
  ];

  const STORE_KEY = "chompy-buah-01";
  const store = (() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  })();
  store.progress ||= {};
  store.sound ??= true;
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {} };
  const getStars = (mode, id) => (store.progress[mode] || {})[id] || 0;
  const setStars = (mode, id, s) => {
    store.progress[mode] ||= {};
    store.progress[mode][id] = Math.max(getStars(mode, id), s);
    save();
  };

  let actx;
  function tone(freq, dur = 0.12, type = "triangle", delay = 0, vol = 0.18) {
    if (!store.sound) return;
    try {
      actx ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + delay;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch {}
  }
  const fanfare = (n) => [523, 659, 784, 1047].slice(0, n + 1).forEach((f, i) => tone(f, 0.25, "triangle", i * 0.13, 0.22));
  const yumSound = () => { tone(880, 0.08); setTimeout(() => tone(1175, 0.1), 80); };
  const stepSound = () => tone(440, 0.05, "square", 0, 0.08);
  const bumpSound = () => tone(150, 0.15, "sawtooth", 0, 0.15);
  const winSound = () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, "triangle", i * 0.1, 0.2)); };

  let voice = null;
  function pickEnglishVoice() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices();
    if (!vs.length) return;
    voice =
      vs.find((v) => /^en[-_]GB/i.test(v.lang)) ||
      vs.find((v) => /^en[-_]US/i.test(v.lang)) ||
      vs.find((v) => /^en[-_]AU/i.test(v.lang)) ||
      vs.find((v) => /^en/i.test(v.lang)) ||
      vs.find((v) => v.default) ||
      vs[0];
  }
  if (window.speechSynthesis) {
    pickEnglishVoice();
    speechSynthesis.onvoiceschanged = pickEnglishVoice;
    setTimeout(pickEnglishVoice, 500);
    setTimeout(pickEnglishVoice, 1500);
  }

  function say(text) {
    if (!store.sound || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB";
      if (voice) u.voice = voice;
      u.rate = 0.95; u.pitch = 1.1; u.volume = 1;
      speechSynthesis.speak(u);
    } catch {}
  }

  let audioWarmed = false;
  function warmAudio() {
    if (audioWarmed) return;
    audioWarmed = true;
    try {
      actx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
    } catch {}
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance("");
      u.lang = "en-GB";
      speechSynthesis.speak(u);
    }
  }
  ["pointerdown", "click", "keydown"].forEach((ev) =>
    document.addEventListener(ev, warmAudio, { once: true })
  );

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const starsHTML = (n) => [0, 1, 2].map((i) => `<span class="${i < n ? "" : "star-off"}">⭐</span>`).join("");

  function show(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    window.scrollTo(0, 0);
  }
  function refreshSoundButtons() {
    $$('[data-action="sound"]').forEach((b) => (b.textContent = store.sound ? "🔊" : "🔇"));
  }
  function refreshHome() {
    Object.keys(MODES).forEach((m) => {
      const arr = LEVELS[m] || [];
      const total = arr.reduce((s, l, i) => s + getStars(m, "L" + i), 0);
      const el = $(`[data-stars-for="${m}"]`);
      if (el) el.textContent = `⭐ ${total} / ${arr.length * 3}`;
    });
  }

  const state = {
    mode: null, levelIndex: 0, grid: [], start: { r: 0, c: 0 },
    chompy: { r: 0, c: 0, dir: "right" }, fruitsLeft: 0,
    code: [], running: false, _win: false, _lose: false,
  };

  function cloneGrid(g) { return g.map((row) => [...row]); }

  function openLevels(mode) {
    state.mode = mode;
    const m = MODES[mode];
    $("#levelsTitle").textContent = m.title;
    $("#levelsHint").textContent = m.hint;
    const grid = $("#levelGrid");
    grid.innerHTML = (LEVELS[mode] || []).map((lv, i) => `
      <button class="level-tile" data-level="${i}">
        <div class="level-preview">${renderMiniPreview(lv.grid)}</div>
        <span class="level-name">${i + 1}. ${lv.nama}</span>
        <span class="level-stars">${starsHTML(getStars(mode, "L" + i))}</span>
      </button>`).join("");
    show("levels");
  }

  function renderMiniPreview(grid) {
    return grid.map((row) => row.map((cell) => {
      if (cell === 1) return "⬛";
      if (cell === 2) return "🐵";
      if (cell === 3) return "🏠";
      if (cell === 4) return "🍎";
      if (cell === 5) return "🪨";
      return "⬜";
    }).join("")).join("<br>");
  }

  function startLevel(i) {
    state.levelIndex = i;
    const lv = LEVELS[state.mode][i];
    state.grid = cloneGrid(lv.grid);
    state.code = [];
    state.running = false;
    state._win = false;
    state._lose = false;

    state.fruitsLeft = 0;
    for (let r = 0; r < state.grid.length; r++) {
      for (let c = 0; c < state.grid[r].length; c++) {
        if (state.grid[r][c] === TILES.START) {
          state.start = { r, c };
          state.chompy = { r, c, dir: "right" };
        }
        if (state.grid[r][c] === TILES.FRUIT) state.fruitsLeft++;
      }
    }

    $("#playTitle").textContent = `${MODES[state.mode].title}: ${lv.nama}`;
    $("#playInstruction").textContent = lv.hint;
    $("#progressFill").style.width = "0%";
    updateBlockCount();
    renderPalette();
    renderBoard();
    renderCode();
    show("play");
    say(lv.hintAudio || lv.hint);
  }

  function renderPalette() {
    $("#palette").innerHTML = BLOCKS.map((b) => `
      <button class="block-btn" data-block="${b.id}" style="--bc:${b.color}">
        <span class="block-icon">${b.icon}</span>
        <span class="block-label">${b.label}</span>
      </button>`).join("");
  }

  function renderBoard() {
    const board = $("#board");
    const rows = state.grid.length;
    const cols = state.grid[0].length;
    board.style.setProperty("--rows", rows);
    board.style.setProperty("--cols", cols);

    let html = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = state.grid[r][c];
        let cls = "cell", content = "";
        if (cell === TILES.WALL) cls += " wall";
        else if (cell === TILES.GOAL) { cls += " goal"; content = "🏠"; }
        else if (cell === TILES.FRUIT) { cls += " fruit"; content = FRUITS[(r * cols + c) % FRUITS.length]; }
        else if (cell === TILES.ROCK) { cls += " rock"; content = "🪨"; }
        else cls += " empty";
        if (r === state.chompy.r && c === state.chompy.c) { cls += " chompy"; content = "🐵"; }
        html += `<div class="${cls}">${content}</div>`;
      }
    }
    board.innerHTML = html;
  }

  function addBlock(id) {
    const lv = LEVELS[state.mode][state.levelIndex];
    if (state.code.length >= lv.maxBlocks) { say("Code is full."); return; }
    state.code.push(id);
    stepSound();
    renderCode();
    updateBlockCount();
  }
  function removeLastBlock() {
    if (!state.code.length) return;
    state.code.pop();
    tone(330, 0.08);
    renderCode();
    updateBlockCount();
  }
  function clearCode() {
    state.code = [];
    tone(220, 0.1);
    renderCode();
    updateBlockCount();
  }
  function updateBlockCount() {
    const lv = LEVELS[state.mode][state.levelIndex];
    $("#blockCount").textContent = `${state.code.length} / ${lv.maxBlocks}`;
  }
  function renderCode() {
    const list = $("#codeList");
    if (!state.code.length) {
      list.innerHTML = `<p class="code-empty">Tekan blok di bawah untuk tambah arahan ⬇️</p>`;
      return;
    }
    list.innerHTML = state.code.map((id, i) => {
      const b = BLOCKS.find((x) => x.id === id);
      return `<div class="code-item" style="--bc:${b.color}">
        <span class="code-num">${i + 1}</span>
        <span class="code-icon">${b.icon}</span>
        <span class="code-label">${b.label}</span>
      </div>`;
    }).join("");
  }

  async function runCode() {
    if (state.running) return;
    if (!state.code.length) { say("Add some blocks first."); return; }
    state.running = true;
    state._win = false;
    state._lose = false;
    state.chompy = { r: state.start.r, c: state.start.c, dir: "right" };
    renderBoard();

    for (let i = 0; i < state.code.length; i++) {
      $$(".code-item").forEach((el, idx) => el.classList.toggle("active", idx === i));
      await doAction(state.code[i]);
      await sleep(280);
      if (state._win || state._lose) break;
    }
    $$(".code-item").forEach((el) => el.classList.remove("active"));

    if (state._win) {
      winSound();
      say("Well done! Chompy is full!");
      setStars(state.mode, "L" + state.levelIndex, 3);
      confetti();
      setTimeout(() => showResult(3, "Syabas!", "Chompy berjaya makan semua buah!"), 700);
    } else if (state._lose) {
      say("Chompy is stuck. Try again!");
      bumpSound();
      setTimeout(() => showResult(1, "Cuba Lagi!", "Chompy tidak sampai ke rumah."), 700);
    } else {
      say("Not finished yet. Add more blocks.");
      setTimeout(() => showResult(0, "Belum Selesai", "Tambah lagi blok untuk sampai ke rumah."), 700);
    }
    state.running = false;
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function doAction(action) {
    const g = state.grid;
    const ch = state.chompy;
    if (action === "eat") {
      if (g[ch.r][ch.c] === TILES.FRUIT) {
        g[ch.r][ch.c] = TILES.EMPTY;
        state.fruitsLeft--;
        yumSound();
        say("Yum yum!");
      } else {
        tone(220, 0.1);
        say("No fruit here.");
      }
      renderBoard();
      return;
    }
    let dr = 0, dc = 0;
    if (action === "up") { dr = -1; ch.dir = "up"; }
    if (action === "down") { dr = 1; ch.dir = "down"; }
    if (action === "left") { dc = -1; ch.dir = "left"; }
    if (action === "right") { dc = 1; ch.dir = "right"; }

    const nr = ch.r + dr, nc = ch.c + dc;
    if (nr < 0 || nc < 0 || nr >= g.length || nc >= g[0].length) {
      bumpSound(); say("Chompy is stuck."); state._lose = true; return;
    }
    const target = g[nr][nc];
    if (target === TILES.WALL || target === TILES.ROCK) {
      bumpSound(); say("There's an obstacle."); state._lose = true; return;
    }
    ch.r = nr; ch.c = nc;
    stepSound();
    renderBoard();
    if (target === TILES.FRUIT) tone(1047, 0.1);
    if (target === TILES.GOAL && state.fruitsLeft === 0) state._win = true;
  }

  function showResult(stars, title, msg) {
    const name = (store.name || "").trim();
    $("#resultStars").innerHTML = starsHTML(stars);
    $("#resultTitle").textContent = name ? `${title} ${name}!` : title;
    $("#resultMsg").textContent = msg;
    $('[data-action="next"]').textContent =
      state.levelIndex < LEVELS[state.mode].length - 1 ? "Seterusnya ➜" : "Selesai 🏁";
    $("#result").hidden = false;
    if (stars >= 3) { fanfare(3); confetti(); }
    const audioMsg = {
      0: "Not finished. Add more blocks to finish.",
      1: "Try again. Check your instructions.",
      2: "Good job. Try again to do better.",
      3: "Well done! Your code worked!",
    }[stars] || "Try again.";
    say(audioMsg);
  }

  function confetti() {
    const box = $("#confetti");
    const cols = ["#FF6B4A", "#13A89E", "#7B5CFF", "#F5B700", "#FF8FA3", "#4CB944"];
    for (let i = 0; i < 60; i++) {
      const b = document.createElement("i");
      b.className = "bit";
      b.style.left = Math.random() * 100 + "vw";
      b.style.background = cols[i % cols.length];
      b.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
      b.style.animationDelay = Math.random() * 0.5 + "s";
      box.appendChild(b);
      setTimeout(() => b.remove(), 4200);
    }
  }

  function showHint() {
    const lv = LEVELS[state.mode][state.levelIndex];
    const board = $("#board");
    let bubble = board.querySelector(".hint-bubble");
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.className = "hint-bubble";
      board.appendChild(bubble);
    }
    bubble.textContent = "💡 " + lv.hint;
    bubble.classList.add("show");
    setTimeout(() => bubble.classList.remove("show"), 3500);
    say(lv.hintAudio || lv.hint);
  }

  function openGuru() {
    const name = (store.name || "").trim();
    $("#guruStudent").textContent = name ? `– ${name}` : "";
    const modes = Object.keys(MODES);
    const rows = [];
    modes.forEach((m) => {
      LEVELS[m].forEach((lv, i) => {
        const s = getStars(m, "L" + i);
        rows.push(`<tr><td>${MODES[m].title} · ${lv.nama}</td>${modes.map((mm) => `<td>${mm === m && s ? "⭐".repeat(s) : "–"}</td>`).join("")}</tr>`);
      });
    });
    $("#recordTable").innerHTML =
      `<thead><tr><th>Tahap</th>${modes.map((m) => `<th>${MODES[m].title}</th>`).join("")}</tr></thead>` +
      `<tbody>${rows.join("")}</tbody>`;
    $("#guru").hidden = false;
  }

  const nameInput = $("#studentName");
  nameInput.value = store.name || "";
  nameInput.addEventListener("input", () => { store.name = nameInput.value; save(); });

  $("#palette").addEventListener("click", (e) => {
    const b = e.target.closest("[data-block]");
    if (!b || state.running) return;
    addBlock(b.dataset.block);
  });

  document.addEventListener("click", (e) => {
    const modeBtn = e.target.closest("[data-mode]");
    if (modeBtn) { tone(587, 0.1); openLevels(modeBtn.dataset.mode); return; }
    const lvl = e.target.closest("[data-level]");
    if (lvl) { tone(659, 0.1); startLevel(+lvl.dataset.level); return; }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    switch (act.dataset.action) {
      case "home": refreshHome(); show("home"); break;
      case "levels": openLevels(state.mode); break;
      case "sound":
        store.sound = !store.sound; save(); refreshSoundButtons();
        if (!store.sound && window.speechSynthesis) speechSynthesis.cancel();
        if (store.sound) say("Sound on.");
        break;
      case "undo": removeLastBlock(); break;
      case "clear-code": clearCode(); break;
      case "run": runCode(); break;
      case "reset": startLevel(state.levelIndex); break;
      case "hint": showHint(); break;
      case "retry": $("#result").hidden = true; startLevel(state.levelIndex); break;
      case "next":
        $("#result").hidden = true;
        if (state.levelIndex < LEVELS[state.mode].length - 1) startLevel(state.levelIndex + 1);
        else openLevels(state.mode);
        break;
      case "guru": openGuru(); break;
      case "close-guru": $("#guru").hidden = true; break;
      case "reset-record":
        if (confirm("Padam semua rekod bintang?")) {
          store.progress = {}; save(); openGuru(); refreshHome();
        }
        break;
    }
  });

  $("#guru").addEventListener("click", (e) => { if (e.target.id === "guru") $("#guru").hidden = true; });

  refreshSoundButtons();
  refreshHome();
})();
