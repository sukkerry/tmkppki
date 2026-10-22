'use strict';
/* TMK Tahun 4 - 3.1.1 & 3.1.2 Perisian Komunikasi Dalam Talian
   5 aktiviti x 3 aras kesukaran */

const $ = (s, r = document) => r.querySelector(s);
const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const LV = ['Mudah', 'Sederhana', 'Sukar'];
const APPS = {
  wa: ['💬', 'WhatsApp'], em: ['📧', 'E-mel'], vc: ['🎥', 'Panggilan video'],
  ph: ['📞', 'Panggilan suara'], sm: ['👍', 'Media sosial']
};

/* ---------- bunyi, suara, confetti ---------- */
let ac;
function tone(f, d = .15, t = 0) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain(), s = ac.currentTime + t;
    o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(.2, s); g.gain.exponentialRampToValueAtTime(.001, s + d);
    o.start(s); o.stop(s + d);
  } catch (e) { }
}
const sfx = {
  ok: () => { tone(660); tone(880, .2, .12); },
  no: () => tone(220, .25),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, i * .14))
};
function speak(t) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'ms-MY'; u.rate = .85; speechSynthesis.speak(u); } catch (e) { }
}
function confetti() {
  const c = $('#confetti'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cols = ['#ff6b6b', '#ffc93c', '#2ec4a6', '#3ba7ff', '#8d6bff'];
  const p = Array.from({ length: 130 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5, r: 6 + Math.random() * 8, vx: Math.random() * 4 - 2, vy: 2 + Math.random() * 4, c: cols[Math.random() * 5 | 0], a: Math.random() * 6 }));
  let n = 0;
  (function f() {
    x.clearRect(0, 0, c.width, c.height);
    p.forEach(q => { q.x += q.vx; q.y += q.vy; q.a += .1; x.fillStyle = q.c; x.save(); x.translate(q.x, q.y); x.rotate(q.a); x.fillRect(-q.r / 2, -q.r / 2, q.r, q.r * .6); x.restore(); });
    if (++n < 190) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height);
  })();
}

/* ---------- keadaan aplikasi ---------- */
let level = 1, stars = 0, cur = null, mistakes = 0;
const best = {};

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); }
function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); scrollTo(0, 0); }

const api = {
  prog(d, t) { $('#progress').style.width = (d / t * 100) + '%'; },
  good() { sfx.ok(); },
  bad(m) { mistakes++; sfx.no(); toast(m || 'Cuba lagi, awak boleh! 💪'); },
  finish(override) {
    const m = override === undefined ? mistakes : override;
    const n = m === 0 ? 3 : m <= 2 ? 2 : 1;
    stars += n; best[cur.id + level] = Math.max(best[cur.id + level] || 0, n);
    $('#totalStars').textContent = stars;
    $('#mStars').innerHTML = [1, 2, 3].map(i => `<span style="animation-delay:${i * .25}s">${i <= n ? '⭐' : '☆'}</span>`).join('');
    $('#next').hidden = level >= 3;
    $('#modal').hidden = false; sfx.win(); confetti(); speak('Hebat! Tahniah!');
  }
};

function start(a) {
  cur = a; mistakes = 0;
  $('#modal').hidden = true;
  const S = $('#stage'); S.innerHTML = '';
  $('#instr').textContent = a.ins;
  $('#actTitle').textContent = `${a.icon} ${a.name} - Aras ${level} (${LV[level - 1]})`;
  $('#progress').style.width = '0';
  show('play');
  a.fn(level, S, api);
}

/* ---------- enjin seret & lepas (sentuh, tetikus + ketik-pilih) ---------- */
const chip = (id, icon, label) => `<div class="chip" data-id="${id}" role="button" tabindex="0"><b>${icon}</b>${label}</div>`;

function dnd(R, A, fn) {
  let d = null, sel = null;
  const zoneAt = (x, y) => document.elementsFromPoint(x, y).find(e => e.classList && e.classList.contains('zone'));
  const hot = z => { R.querySelectorAll('.zone.hot').forEach(e => e !== z && e.classList.remove('hot')); if (z) z.classList.add('hot'); };
  const attempt = (c, z) => {
    if (!z || z.classList.contains('ok')) return;
    const ok = fn(c.dataset.id, z.dataset.key, c, z);
    c.classList.remove('sel', 'shake');
    if (ok) { c.classList.add('done'); A.good(); }
    else { A.bad(); void c.offsetWidth; c.classList.add('shake'); }
    sel = null;
  };
  R.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('pointerdown', e => {
      if (c.classList.contains('done')) return;
      e.preventDefault(); c.setPointerCapture(e.pointerId);
      d = { c, sx: e.clientX, sy: e.clientY, moved: false }; c.classList.add('lift');
    });
    c.addEventListener('pointermove', e => {
      if (!d || d.c !== c) return;
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
      if (Math.abs(dx) + Math.abs(dy) > 8) d.moved = true;
      c.style.transform = `translate(${dx}px,${dy}px) scale(1.1)`;
      hot(zoneAt(e.clientX, e.clientY));
    });
    const end = e => {
      if (!d || d.c !== c) return;
      c.classList.remove('lift'); c.style.transform = ''; hot(null);
      if (d.moved) { attempt(c, zoneAt(e.clientX, e.clientY)); }
      else {
        const was = c.classList.contains('sel');
        R.querySelectorAll('.chip.sel').forEach(x => x.classList.remove('sel'));
        sel = was ? null : c; if (!was) { c.classList.add('sel'); sfx.ok(); }
      }
      d = null;
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', () => { if (d) { c.classList.remove('lift'); c.style.transform = ''; hot(null); d = null; } });
  });
  R.querySelectorAll('.zone').forEach(z => z.addEventListener('click', () => { if (sel) attempt(sel, z); }));
}

/* ======================================================
   AKTIVITI 1: MENGECAM
   ====================================================== */
const Q1 = {
  1: [['💬', 'Apakah ini?', ['wa', 'em'], 'wa'], ['📧', 'Apakah ini?', ['vc', 'em'], 'em'],
      ['🎥', 'Apakah ini?', ['wa', 'vc'], 'vc'], ['📞', 'Apakah ini?', ['ph', 'em'], 'ph']],
  2: [['📝', 'Saya mahu hantar mesej kepada kawan.', ['em', 'wa', 'vc'], 'wa'],
      ['👩', 'Saya mahu berbual dan nampak muka ibu.', ['ph', 'vc', 'wa'], 'vc'],
      ['✉️', 'Saya mahu hantar surat kepada cikgu.', ['wa', 'em', 'sm'], 'em'],
      ['🖼️', 'Saya mahu kongsi gambar dengan ramai kawan.', ['sm', 'ph', 'em'], 'sm'],
      ['🎙️', 'Saya mahu bercakap dengan suara sahaja.', ['vc', 'em', 'ph'], 'ph']],
  3: [['👵', 'Nenek tinggal jauh. Saya mahu bercakap dan melihat wajah nenek.', ['wa', 'em', 'vc', 'ph'], 'vc'],
      ['📎', 'Cikgu mahu hantar kerja rumah beserta fail lampiran.', ['sm', 'em', 'vc', 'ph'], 'em'],
      ['👨‍👩‍👧', 'Murid mahu hantar mesej pantas dalam kumpulan kelas.', ['ph', 'em', 'wa', 'vc'], 'wa'],
      ['🏖️', 'Ayah mahu berkongsi gambar percutian dengan ramai orang.', ['sm', 'em', 'ph', 'wa'], 'sm'],
      ['🔋', 'Data internet tinggal sedikit. Saya mahu bercakap tanpa video.', ['vc', 'ph', 'em', 'sm'], 'ph']]
};
function kenal(L, S, A) {
  const qs = shuf(Q1[L]); let i = 0;
  (function next() {
    const [ic, t, o, a] = qs[i]; A.prog(i, qs.length);
    S.innerHTML = `<div class="qcard"><div class="big">${ic}</div><h2>${t}</h2><div class="opts">${shuf(o).map(k =>
      `<button class="opt" data-k="${k}">${L > 1 ? `<b>${APPS[k][0]}</b>` : ''}${APPS[k][1]}</button>`).join('')}</div></div>`;
    A.say && A.say(t); $('#instr').textContent = L === 1 ? 'Lihat gambar. Tekan nama yang betul.' : 'Baca soalan. Tekan jawapan yang betul.';
    S.querySelectorAll('.opt').forEach(b => b.onclick = async () => {
      if (b.dataset.k === a) {
        A.good(); b.classList.add('right'); S.querySelectorAll('.opt').forEach(x => x.disabled = true);
        await wait(900);
        if (++i < qs.length) next(); else { A.prog(1, 1); A.finish(); }
      } else { A.bad(); b.classList.add('wrong'); b.disabled = true; }
    });
  })();
}

/* ======================================================
   AKTIVITI 2: SERET & LEPAS - MEMADANKAN
   ====================================================== */
function padan(L, S, A) {
  const pairs = { 1: ['wa', 'em', 'vc'], 2: ['wa', 'em', 'vc', 'ph'], 3: ['wa', 'em', 'vc', 'ph', 'sm'] }[L];
  const F = L < 3
    ? { wa: 'Hantar mesej', em: 'Hantar surat dalam talian', vc: 'Nampak muka kawan', ph: 'Bercakap dengan suara', sm: 'Kongsi gambar' }
    : { wa: 'Berbual pantas dan hantar gambar dalam kumpulan', em: 'Hantar surat rasmi beserta fail', vc: 'Mesyuarat sambil melihat wajah', ph: 'Bercakap tanpa video', sm: 'Berkongsi gambar dengan ramai kawan' };
  S.innerHTML = `<div class="chips">${shuf(pairs).map(k => chip(k, APPS[k][0], APPS[k][1])).join('')}</div>
    <div class="zones">${shuf(pairs).map(k => `<div class="zone" data-key="${k}"><span>${F[k]}</span><div class="slot"></div></div>`).join('')}</div>`;
  let n = 0;
  dnd(S, A, (id, key, c, z) => {
    if (id !== key) return false;
    z.querySelector('.slot').appendChild(c); z.classList.add('ok'); A.prog(++n, pairs.length);
    if (n === pairs.length) setTimeout(() => A.finish(), 800);
    return true;
  });
}

/* ======================================================
   AKTIVITI 3: JIGSAW (tekan dua kepingan untuk tukar)
   ====================================================== */
function jigsaw(L, S, A) {
  const [cols, rows, em, lab, c1, c2] = {
    1: [2, 2, '💬', 'WhatsApp', '#2ec4a6', '#c8fff0'],
    2: [3, 2, '📧', 'E-mel', '#ff9f43', '#fff0c9'],
    3: [3, 3, '🎥', 'Panggilan video', '#8d6bff', '#e6deff']
  }[L];
  const W = cols * 200, H = rows * 200, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.arc((i * 97) % W, (i * 61) % H, 16 + (i % 4) * 10, 0, 7); x.fill(); }
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `${Math.min(W, H) * .5}px serif`; x.fillText(em, W / 2, H * .42);
  x.font = `800 ${Math.min(W, H) * .14}px sans-serif`; x.fillStyle = '#2b2d42'; x.fillText(lab, W / 2, H * .82, W * .9);
  const url = cv.toDataURL(), n = cols * rows;
  let order; do { order = shuf([...Array(n).keys()]); } while (order.every((v, i) => v === i));
  let sel = null, miss = 0;
  S.innerHTML = `<div class="jig"><img class="ref" src="${url}" alt="Gambar contoh"><div class="board" id="board" style="grid-template-columns:repeat(${cols},1fr);aspect-ratio:${W}/${H}"></div></div>`;
  const B = $('#board', S);
  function draw() {
    B.innerHTML = order.map((p, pos) => `<button class="piece${order[pos] === pos ? ' lock' : ''}${sel === pos ? ' sel' : ''}" data-pos="${pos}" aria-label="Kepingan ${pos + 1}"
      style="background-image:url(${url});background-size:${cols * 100}% ${rows * 100}%;background-position:${(p % cols) / (cols - 1) * 100}% ${Math.floor(p / cols) / (rows - 1) * 100}%"></button>`).join('');
    const ok = order.filter((p, i) => p === i).length; A.prog(ok, n);
    if (ok === n) setTimeout(() => A.finish(Math.max(0, miss - n)), 700);
  }
  B.addEventListener('click', e => {
    const b = e.target.closest('.piece'); if (!b) return;
    const pos = +b.dataset.pos; if (order[pos] === pos) return;
    if (sel === null) { sel = pos; sfx.ok(); }
    else if (sel === pos) sel = null;
    else {
      [order[sel], order[pos]] = [order[pos], order[sel]];
      const hit = order[sel] === sel || order[pos] === pos;
      if (hit) A.good(); else { sfx.no(); miss++; }
      sel = null;
    }
    draw();
  });
  draw();
}

/* ======================================================
   AKTIVITI 4: MENYUSUN SUSUNAN
   ====================================================== */
const SEQ = {
  1: ['Menghantar mesej WhatsApp', [['📲', 'Buka WhatsApp'], ['✍️', 'Taip mesej'], ['📤', 'Tekan butang hantar']]],
  2: ['Membuat panggilan video', [['📲', 'Buka aplikasi'], ['👤', 'Pilih nama kawan'], ['🎥', 'Tekan ikon kamera'], ['😀', 'Berbual dengan kawan']]],
  3: ['Menghantar e-mel', [['📲', 'Buka aplikasi e-mel'], ['➕', 'Tekan butang Tulis'], ['👤', 'Taip alamat penerima'], ['✍️', 'Taip mesej'], ['📤', 'Tekan Hantar']]]
};
function susun(L, S, A) {
  const [title, steps] = SEQ[L], n = steps.length;
  S.innerHTML = `<h2 class="sub">${title}</h2>
    <div class="slots">${steps.map((_, i) => `<div class="sl" data-i="${i}"><i>${i + 1}</i></div>`).join('')}</div>
    <div class="pool" id="pool">${shuf(steps.map((_, i) => i)).map(i => `<button class="step" data-i="${i}"><b>${steps[i][0]}</b>${steps[i][1]}</button>`).join('')}</div>
    <button class="btn go" id="chk" disabled>✅ Semak</button>`;
  const pool = $('#pool', S), slots = [...S.querySelectorAll('.sl')], chk = $('#chk', S);
  const upd = () => { chk.disabled = pool.querySelector('.step') !== null; A.prog(S.querySelectorAll('.step.ok').length, n); };
  S.addEventListener('click', e => {
    const b = e.target.closest('.step'); if (!b || b.classList.contains('ok')) return;
    if (b.parentElement === pool) { const s = slots.find(z => !z.querySelector('.step')); if (s) { s.appendChild(b); sfx.ok(); } }
    else { pool.appendChild(b); }
    upd();
  });
  chk.onclick = async () => {
    let bad = 0;
    slots.forEach(s => { const b = s.querySelector('.step'); if (!b || b.classList.contains('ok')) return; if (b.dataset.i === s.dataset.i) { b.classList.add('ok'); } else { bad++; b.classList.add('no'); } });
    if (!bad) { A.good(); A.prog(n, n); setTimeout(() => A.finish(), 800); return; }
    A.bad('Ada langkah yang belum betul. Cuba lagi! 😊');
    await wait(600);
    S.querySelectorAll('.step.no').forEach(b => { b.classList.remove('no'); pool.appendChild(b); });
    upd();
  };
}

/* ======================================================
   AKTIVITI 5: MENGKATEGORIKAN
   ====================================================== */
function kategori(L, S, A) {
  let B, I;
  if (L === 1) {
    B = [['on', 'Dalam talian', '🌐'], ['off', 'Bukan dalam talian', '🚫']];
    I = [['WhatsApp', '💬', 'on'], ['E-mel', '📧', 'on'], ['Surat pos', '📮', 'off'], ['Bercakap bersemuka', '🗣️', 'off']];
  } else {
    B = [['ms', 'Mesej', '💬'], ['vd', 'Panggilan video', '🎥'], ['em', 'E-mel', '📧']];
    I = [['WhatsApp', '💬', 'ms'], ['Telegram', '📨', 'ms'], ['Zoom', '🎥', 'vd'], ['Google Meet', '📹', 'vd'], ['Gmail', '📧', 'em'], ['Outlook', '📬', 'em']];
    if (L === 3) I.push(['Messenger', '🗨️', 'ms'], ['Skype', '🖥️', 'vd'], ['Yahoo Mail', '✉️', 'em']);
  }
  S.innerHTML = `<div class="chips">${shuf(I.map((_, i) => i)).map(i => chip(i, I[i][1], I[i][0])).join('')}</div>
    <div class="zones">${B.map(b => `<div class="zone bucket" data-key="${b[0]}"><h3>${b[2]} ${b[1]}</h3><div class="pile"></div></div>`).join('')}</div>`;
  let n = 0;
  dnd(S, A, (id, key, c, z) => {
    if (I[id][2] !== key) return false;
    z.querySelector('.pile').appendChild(c); A.prog(++n, I.length);
    if (n === I.length) setTimeout(() => A.finish(), 800);
    return true;
  });
}

/* ---------- menu utama ---------- */
const ACTS = [
  { id: 'kenal', name: 'Mengecam', icon: '🔍', col: '#3ba7ff', fn: kenal, ins: 'Lihat gambar. Tekan jawapan yang betul.' },
  { id: 'padan', name: 'Seret & Padankan', icon: '🧲', col: '#2ec4a6', fn: padan, ins: 'Seret gambar aplikasi ke kegunaannya. Atau tekan gambar, kemudian tekan kegunaannya.' },
  { id: 'jig', name: 'Jigsaw', icon: '🧩', col: '#ff9f43', fn: jigsaw, ins: 'Tekan dua kepingan untuk menukar tempat. Susun sehingga gambar lengkap.' },
  { id: 'susun', name: 'Menyusun Susunan', icon: '🔢', col: '#8d6bff', fn: susun, ins: 'Tekan langkah mengikut susunan yang betul, bermula dari nombor 1.' },
  { id: 'kat', name: 'Mengkategorikan', icon: '🗂️', col: '#ff6b6b', fn: kategori, ins: 'Seret setiap kad ke kumpulan yang betul. Atau tekan kad, kemudian tekan kumpulan.' }
];
function renderHome() {
  document.querySelectorAll('.lvl').forEach(b => b.setAttribute('aria-pressed', +b.dataset.l === level));
  $('#activityGrid').innerHTML = ACTS.map(a => {
    const s = best[a.id + level] || 0;
    return `<button class="card" data-id="${a.id}" style="background:${a.col}"><span class="ic">${a.icon}</span>${a.name}<span class="st">${s ? '⭐'.repeat(s) : 'Jom main!'}</span></button>`;
  }).join('');
}
$('#levels').addEventListener('click', e => { const b = e.target.closest('.lvl'); if (b) { level = +b.dataset.l; sfx.ok(); renderHome(); } });
$('#activityGrid').addEventListener('click', e => { const c = e.target.closest('.card'); if (c) start(ACTS.find(a => a.id === c.dataset.id)); });
$('#homeBtn').onclick = () => { $('#modal').hidden = true; speechSynthesis && speechSynthesis.cancel(); renderHome(); show('home'); };
$('#menu').onclick = $('#homeBtn').onclick;
$('#again').onclick = () => start(cur);
$('#next').onclick = () => { level = Math.min(3, level + 1); start(cur); };
$('#speak').onclick = () => speak($('#instr').textContent);
renderHome();
