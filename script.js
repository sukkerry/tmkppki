'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);

/* ===== DATA ===== */
const DATA=[
 {e:'📋',n:'Senarai kehadiran',u:'Tahu siapa yang hadir ke sekolah',k:'Sekolah'},
 {e:'📝',n:'Markah ujian',u:'Tahu kemajuan belajar',k:'Sekolah'},
 {e:'🗓️',n:'Jadual waktu',u:'Tahu mata pelajaran hari ini',k:'Sekolah'},
 {e:'⚖️',n:'Berat badan',u:'Tahu badan sihat atau tidak',k:'Kesihatan'},
 {e:'🌡️',n:'Suhu badan',u:'Tahu kita demam atau tidak',k:'Kesihatan'},
 {e:'📏',n:'Tinggi badan',u:'Tahu kita sedang membesar',k:'Kesihatan'},
 {e:'🧾',n:'Resit belian',u:'Tahu jumlah wang yang dibelanjakan',k:'Kedai'},
 {e:'🏷️',n:'Harga barang',u:'Tahu barang mahal atau murah',k:'Kedai'},
 {e:'🛒',n:'Senarai membeli-belah',u:'Tahu barang yang perlu dibeli',k:'Kedai'},
 {e:'📞',n:'Nombor telefon',u:'Menghubungi ahli keluarga',k:'Lain'},
 {e:'☁️',n:'Ramalan cuaca',u:'Tahu hari akan hujan atau cerah',k:'Lain'}];
const NON=[['🪑','Kerusi'],['🚗','Kereta'],['🍎','Epal'],['⚽','Bola'],['🧸','Patung'],['🌳','Pokok'],['👟','Kasut'],['🛏️','Katil']];
const SEQ=[
 {t:'Berat badan',s:[['⚖️','Timbang berat badan'],['📒','Tulis berat dalam buku'],['👀','Lihat angka berat'],['🥗','Tahu badan sihat atau tidak'],['💬','Beritahu cikgu']]},
 {t:'Markah ujian',s:[['✏️','Jawab kertas ujian'],['📝','Cikgu beri markah'],['📒','Cikgu rekod markah'],['📊','Lihat markah'],['💪','Tahu perlu belajar lagi']]},
 {t:'Ramalan cuaca',s:[['☁️','Kumpul data cuaca'],['📺','Ramalan cuaca disiarkan'],['👀','Kita lihat ramalan'],['☔','Tahu hari akan hujan'],['🌂','Bawa payung']]},
 {t:'Kehadiran',s:[['🏫','Murid datang ke sekolah'],['🙋','Guru panggil nama murid'],['📋','Guru tanda kehadiran'],['🔢','Kira murid yang hadir'],['✅','Tahu berapa orang hadir']]}];
const CI={Data:'✅','Bukan Data':'❌',Sekolah:'🏫',Kesihatan:'🏥',Kedai:'🛒'};
const CC={Data:'#d6f7dc','Bukan Data':'#ffe0e0',Sekolah:'#d9f2ff',Kesihatan:'#ffe0e6',Kedai:'#fff3c4'};
const NAMES={mengecam:'🔍 Mengecam',padanan:'🧩 Padankan',jigsaw:'🖼️ Jigsaw',susun:'🔢 Susun',kategori:'🧺 Kategori'};
const mk=(t,c,h)=>{const e=document.createElement(t);e.className=c;e.innerHTML=h;return e};

/* ===== BUNYI ===== */
let snd=true,ac;
function tone(f,d=.15,t=0){if(!snd)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();
  const o=ac.createOscillator(),g=ac.createGain(),s=ac.currentTime+t;o.type='triangle';o.frequency.value=f;
  o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.15,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.start(s);o.stop(s+d)}catch(e){}}
const good=()=>{tone(660);tone(880,.2,.1)},bad=()=>tone(180,.3);

/* ===== ASAS ===== */
let L=1,A=null,fid=0;
const say=t=>$('#ins').textContent=t;
const show=id=>$$('.screen').forEach(s=>s.classList.toggle('show',s.id===id));
const prog=(d,t)=>$('#pb').style.width=(d/t*100)+'%';
function step(d,t){good();prog(d,t);if(d>=t)setTimeout(win,900)}
const shake=e=>{e.classList.remove('no');void e.offsetWidth;e.classList.add('no')};

function start(a){A=a;$('#ov').classList.remove('show');fid++;show('game');
  $('#gt').textContent=NAMES[a]+' • Aras '+L;$('#board').innerHTML='';prog(0,1);ACT[a](L)}

/* Seret & lepas (sokong tetikus dan sentuhan) */
function drag(e,chk){
  e.onpointerdown=ev=>{ev.preventDefault();e.setPointerCapture(ev.pointerId);const x0=ev.clientX,y0=ev.clientY;e.classList.add('drag');
    e.onpointermove=m=>e.style.transform=`translate(${m.clientX-x0}px,${m.clientY-y0}px) scale(1.15)`;
    e.onpointerup=e.onpointercancel=u=>{e.onpointermove=e.onpointerup=e.onpointercancel=null;e.classList.remove('drag');e.style.transform='';
      e.style.visibility='hidden';const el=document.elementFromPoint(u.clientX,u.clientY);e.style.visibility='';
      const s=el&&el.closest('.slot');if(s&&!chk(s)){bad();shake(e)}}}}

/* ===== AKTIVITI ===== */
const ACT={};

/* 1. MENGECAM – apa itu data & apa kegunaannya */
ACT.mengecam=L=>{const N=5,n=[3,4,4][L-1];let q=0;
  (function next(){const d=pick(DATA,1)[0],ty=L===1||(L===3&&q%2===0);let o,c,h='';
    if(ty){o=shuffle([[d.e,d.n],...pick(NON,n-1)]);c=d.n;say('Yang manakah DATA? 🤔')}
    else{o=shuffle([d,...pick(DATA.filter(x=>x!==d),n-1)]).map(x=>['💡',x.u]);c=d.u;h=`<div class="chip big"><b>${d.e}</b>${d.n}</div>`;say('Apakah kegunaan data ini? 🤔')}
    const B=$('#board');B.innerHTML=h+'<div class="row"></div>';const R=B.lastChild;
    o.forEach(([e,t],i)=>{const b=mk('button','chip',`<b>${e}</b>${t}`);b.style.animationDelay=i*.08+'s';
      b.onclick=()=>{if(t===c){b.classList.add('ok');R.style.pointerEvents='none';say(`✅ ${d.e} ${d.n}: ${d.u}`);step(++q,N);if(q<N)setTimeout(next,2200)}else{bad();shake(b)}};R.append(b)})})()};

/* 2. PADANKAN – seret data ke kegunaannya */
ACT.padanan=L=>{const n=[3,4,6][L-1],it=pick(DATA,n);let d=0;say('Seret data ke kegunaannya! 👆');
  $('#board').innerHTML='<div class="row" id="sl"></div><div class="row" id="dr"></div>';
  shuffle(it).forEach(x=>{const s=mk('div','slot w',`<b>💡</b>${x.u}`);s.dataset.v=x.n;$('#sl').append(s)});
  shuffle(it).forEach(x=>{const e=mk('div','chip dr',`<b>${x.e}</b>${x.n}`);$('#dr').append(e);
    drag(e,s=>{if(s.dataset.v!==x.n||s.classList.contains('done'))return 0;s.classList.add('done');s.innerHTML=`<b>${x.e}</b>${x.n}<small>${x.u}</small>`;e.remove();step(++d,n);return 1})})};

/* 3. JIGSAW – cantumkan gambar data */
ACT.jigsaw=L=>{const [r,c]=[[2,2],[2,3],[3,3]][L-1],S=Math.min(100,Math.floor((Math.min(innerWidth,640)-50)/c)),N=r*c,p=pick(DATA,1)[0];
  const cv=document.createElement('canvas');cv.width=c*100;cv.height=r*100;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,cv.width,cv.height);
  g.addColorStop(0,'#bdeaff');g.addColorStop(1,'#ffe3f0');x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);
  x.font=Math.min(cv.width,cv.height)*.8+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(p.e,cv.width/2,cv.height/2+8);
  const url=`url(${cv.toDataURL()})`;let d=0;
  const st=(e,i)=>{e.classList.add('jg');Object.assign(e.style,{width:S+'px',height:S+'px',backgroundImage:url,backgroundSize:`${c*S}px ${r*S}px`,backgroundPosition:`-${i%c*S}px -${Math.floor(i/c)*S}px`})};
  say(`Cantumkan gambar data: ${p.n} 🧩`);
  $('#board').innerHTML=`<div id="gb" style="display:grid;grid-template-columns:repeat(${c},${S}px);gap:3px"></div><div class="row" id="dr"></div>`;
  for(let i=0;i<N;i++){const s=mk('div','slot gh'+(L===3?' h':''),'');s.dataset.v=i;st(s,i);$('#gb').append(s)}
  shuffle([...Array(N).keys()]).forEach(i=>{const e=mk('div','t dr','');st(e,i);$('#dr').append(e);
    drag(e,s=>{if(+s.dataset.v!==i||s.classList.contains('done'))return 0;s.classList.remove('gh');s.classList.add('done');e.remove();step(++d,N);if(d===N)say(`✅ ${p.n}: ${p.u}`);return 1})})};

/* 4. SUSUN – susun langkah menggunakan data */
ACT.susun=L=>{const n=[3,4,5][L-1],R=3,ss=pick(SEQ,R);let q=0;
  (function next(){const sq=ss[q],st=sq.s.slice(0,n);say(`Susun langkah: ${sq.t} (${q+1}/${R})`);
    $('#board').innerHTML='<div class="row col" id="an"></div><div class="row" id="tr"></div>';
    const an=$('#an'),tr=$('#tr'),cells=st.map((_,i)=>{const c=mk('div','slot w sn','');c.dataset.n=i+1;an.append(c);return c});
    const toks=shuffle(st.map((_,i)=>i)).map(i=>{const b=mk('button','chip',`<b>${st[i][0]}</b>${st[i][1]}`);b.dataset.v=i;
      b.onclick=()=>{if(b.parentNode===tr){const c=cells.find(c=>!c.firstChild);if(c){c.append(b);check()}}else tr.append(b)};tr.append(b);return b});
    function check(){if(cells.some(c=>!c.firstChild))return;
      if(cells.every((c,i)=>+c.firstChild.dataset.v===i)){an.style.pointerEvents='none';cells.forEach(c=>c.classList.add('done'));step(++q,R);if(q<R)setTimeout(next,1300)}
      else{bad();cells.forEach(c=>shake(c.firstChild));setTimeout(()=>toks.forEach(b=>{b.classList.remove('no');tr.append(b)}),700)}}})()};

/* 5. KATEGORI – asingkan data ke bakul yang betul */
ACT.kategori=L=>{let cs,it;
  if(L===1){cs=['Data','Bukan Data'];it=[...pick(DATA,2).map(x=>[x.e,x.n,'Data']),...pick(NON,2).map(x=>[x[0],x[1],'Bukan Data'])]}
  else{cs=pick(['Sekolah','Kesihatan','Kedai'],L===2?2:3);it=cs.flatMap(c=>pick(DATA.filter(x=>x.k===c),3).map(x=>[x.e,x.n,c]))}
  let d=0;const n=it.length;say(L===1?'Data atau bukan data? Letakkan dalam bakul! 🧺':'Letakkan data dalam bakul yang betul! 🧺');
  $('#board').innerHTML='<div class="row" id="sl" style="align-items:stretch;width:100%"></div><div class="row" id="dr"></div>';
  cs.forEach(c=>{const b=mk('div','slot bk',`<b>${CI[c]} ${c}</b><div class="in"></div>`);b.dataset.c=c;b.style.background=CC[c];$('#sl').append(b)});
  shuffle(it).forEach(([e,t,c])=>{const x=mk('div','chip dr',`<b>${e}</b>${t}`);$('#dr').append(x);
    drag(x,s=>{if(s.dataset.c!==c)return 0;s.querySelector('.in').append(mk('div','chip mini',`<b>${e}</b>${t}`));x.remove();step(++d,n);return 1})})};

/* ===== KEJAYAAN: PIALA + BUNGA API ===== */
function win(){$('#ov').classList.add('show');[523,659,784,1047].forEach((f,i)=>tone(f,.3,i*.15));fire()}
function fire(){const c=$('#fx'),x=c.getContext('2d'),id=++fid;c.width=innerWidth;c.height=innerHeight;let P=[],t=0;
  const burst=()=>{const X=Math.random()*c.width,Y=Math.random()*c.height*.55+30,h=rnd(360);
    for(let i=0;i<50;i++){const a=i/50*6.283,s=2+Math.random()*4;P.push({x:X,y:Y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h})}};
  (function loop(){if(fid!==id)return;
    x.globalCompositeOperation='destination-out';x.fillStyle='rgba(0,0,0,.2)';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='lighter';
    if(t++%25===0){burst();tone(120+rnd(100),.25)}
    P=P.filter(p=>p.l>0);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.05;p.vx*=.99;p.l-=.012;
      x.fillStyle=`hsla(${p.h},100%,60%,${p.l})`;x.beginPath();x.arc(p.x,p.y,3,0,6.3);x.fill()});
    requestAnimationFrame(loop)})()}

/* ===== PERISTIWA ===== */
$$('.lv').forEach(b=>b.onclick=()=>{L=+b.dataset.l;$$('.lv').forEach(x=>x.classList.toggle('on',x===b))});
$$('.card').forEach(b=>b.onclick=()=>start(b.dataset.a));
$('#again').onclick=()=>start(A);
$('#menuBtn').onclick=$('#back').onclick=()=>{$('#ov').classList.remove('show');fid++;show('menu')};
$('#snd').onclick=e=>{snd=!snd;e.currentTarget.textContent=snd?'🔊':'🔇'};
$('#bg').innerHTML=Array.from({length:14},()=>`<span style="left:${rnd(95)}%;animation-duration:${12+rnd(14)}s;animation-delay:-${rnd(20)}s;font-size:${1.5+rnd(20)/10}rem">${['⭐','🎈','☁️','🌈','🦋','🌸'][rnd(6)]}</span>`).join('');
