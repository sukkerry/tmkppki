const $=s=>document.querySelector(s),sh=a=>[...a].sort(()=>Math.random()-.5);
const D=[
{n:'E-mel',e:'📧',u:'Hantar surat melalui internet',c:'tulis'},
{n:'WhatsApp',e:'💬',u:'Hantar mesej dan gambar',c:'tulis'},
{n:'SMS',e:'✉️',u:'Hantar mesej ringkas guna telefon',c:'tulis'},
{n:'Panggilan Suara',e:'📞',u:'Bercakap dengan suara',c:'cakap'},
{n:'Mesej Suara',e:'🎤',u:'Rakam suara dan hantar',c:'cakap'},
{n:'Panggilan Video',e:'📹',u:'Bercakap sambil nampak wajah',c:'wajah'},
{n:'Google Meet',e:'🖥️',u:'Belajar dan bermesyuarat dalam talian',c:'wajah'}];
const C={tulis:{n:'Tulis Mesej',e:'✍️'},cakap:{n:'Bercakap',e:'🗣️'},wajah:{n:'Nampak Wajah',e:'👀'}};
const S=[['📱 Buka aplikasi WhatsApp','👦 Pilih nama rakan','➡️ Tekan hantar'],
['📧 Buka aplikasi e-mel','✍️ Tulis alamat penerima','💬 Tulis mesej','➡️ Tekan hantar'],
['🖥️ Buka Google Meet','🔗 Klik sertai mesyuarat','🎥 Hidupkan kamera dan mikrofon','👋 Beri salam kepada rakan','🔴 Tekan butang merah untuk tamat']];
const ST=['Menghantar WhatsApp','Menghantar E-mel','Panggilan Video'];
const ACT=[['Mengecam','👀',recog],['Padankan','🧲',match],['Jigsaw','🧩',jig],['Susun Langkah','🔢',seq],['Kategorikan','🧺',cat]];
const COL=['#ff6b6b','#3ab4f2','#f5a623','#4cd08a','#8b6bff'];
let lvl=0,act=0,P={d:0,t:0},done={},ac;

/* bunyi & suara */
function snd(f,d=.15,t='sine'){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
const say=t=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ms-MY';u.rate=.85;speechSynthesis.speak(u)}catch(e){}};
const good=()=>{snd(660);setTimeout(()=>snd(880),100)};
const bad=el=>{snd(180,.25,'square');if(el){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}};
const prog=()=>$('#pb').style.width=P.d/P.t*100+'%';
const step=()=>{P.d++;prog();if(P.d>=P.t)setTimeout(win,700)};

/* menu */
function menu(){
  fw(false);$('#win').classList.add('hide');$('#game').classList.add('hide');$('#menu').classList.remove('hide');
  $('#cards').innerHTML=ACT.map((a,i)=>`<button class="card" style="--col:${COL[i]};animation-delay:${i*.08}s" data-i="${i}"><span>${a[1]}</span>${i+1}. ${a[0]}${done[i+'-'+lvl]?' ✅':''}</button>`).join('');
}
function start(i){
  act=i;P={d:0,t:0};fw(false);
  $('#menu').classList.add('hide');$('#win').classList.add('hide');$('#game').classList.remove('hide');
  $('#gt').textContent=`${ACT[i][1]} ${ACT[i][0]} – Aras ${lvl+1}`;
  $('#pb').style.width=0;ACT[i][2]();scrollTo(0,0);
}
$('#cards').onclick=e=>{const b=e.target.closest('.card');if(b)start(+b.dataset.i)};
$('#lv').onclick=e=>{const b=e.target.closest('button');if(!b)return;lvl=+b.dataset.l;document.querySelectorAll('#lv button').forEach(x=>x.classList.toggle('on',x===b));menu()};
$('#back').onclick=menu;$('#tomenu').onclick=menu;$('#again').onclick=()=>start(act);

/* enjin seret & lepas (juga sentuh pilih lalu sentuh sasaran) */
function dnd(root,check){
  let sel=null;
  const drop=(el,d)=>{
    if(check(el,d)){
      el.classList.remove('sel');el.classList.add('done','good');el.style.transform='';sel=null;
      d.appendChild(el);d.classList.add('full');good();step();
    }else{el.classList.remove('sel');sel=null;bad(el)}
  };
  root.querySelectorAll('.drag').forEach(el=>{
    el.onpointerdown=e=>{
      if(el.classList.contains('done'))return;e.preventDefault();
      const sx=e.clientX,sy=e.clientY;let moved=false;el.setPointerCapture(e.pointerId);
      el.onpointermove=m=>{const dx=m.clientX-sx,dy=m.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>8)moved=true;if(moved){el.classList.add('drag-on');el.style.transform=`translate(${dx}px,${dy}px) scale(1.1)`}};
      el.onpointerup=u=>{
        el.onpointermove=el.onpointerup=null;el.classList.remove('drag-on');el.style.transform='';
        if(moved){el.style.visibility='hidden';const t=document.elementFromPoint(u.clientX,u.clientY);el.style.visibility='';const d=t&&t.closest('.drop');if(d)drop(el,d);}
        else if(sel===el){el.classList.remove('sel');sel=null}
        else{if(sel)sel.classList.remove('sel');sel=el;el.classList.add('sel');say(el.dataset.say||'')}
      };
    };
  });
  root.querySelectorAll('.drop').forEach(d=>d.onclick=()=>{if(sel)drop(sel,d)});
}

/* 1. MENGECAM */
function recog(){
  const n=[4,5,6][lvl],k=lvl+2,pool=sh(D);P.t=n;let i=0;
  (function next(){
    const t=pool[i%pool.length],o=sh([t,...sh(D.filter(x=>x!==t)).slice(0,k-1)]);
    $('#stage').innerHTML=`<div class="q">${lvl<2?'Apakah ini?':'Pilih gambar yang betul:<br>“'+t.u+'”'}</div>${lvl<2?`<div class="big">${t.e}</div>`:''}<div class="opts">${o.map((x,j)=>`<button class="opt" data-j="${j}">${lvl<2?x.n:`<span class="em">${x.e}</span>`}</button>`).join('')}</div>`;
    say(lvl<2?'Apakah ini?':t.u);
    $('#stage').onclick=e=>{
      const b=e.target.closest('.opt');if(!b||b.dataset.lock)return;
      if(o[+b.dataset.j]===t){$('#stage').onclick=null;b.classList.add('good');good();say(t.n);i++;step();if(P.d<P.t)setTimeout(next,1100)}
      else bad(b);
    };
  })();
}

/* 2. PADANKAN (seret & lepas) */
function match(){
  const n=lvl+3,p=sh(D).slice(0,n);P.t=n;
  $('#stage').innerHTML=`<div class="q">Seret gambar ke jawapan yang betul</div><div class="cols"><div>${sh(p).map(x=>`<div class="drag" data-k="${x.n}" data-say="${x.n}"><span class="em">${x.e}</span></div>`).join('')}</div><div>${sh(p).map(x=>`<div class="drop" data-k="${x.n}">${lvl<2?x.n:x.u}</div>`).join('')}</div></div>`;
  dnd($('#stage'),(a,d)=>a.dataset.k===d.dataset.k);
}

/* 3. JIGSAW (sentuh dua keping untuk tukar) */
function jig(){
  const [r,c]=[[2,2],[2,3],[3,3]][lvl],n=r*c,it=sh(D)[0];P.t=n;
  const cv=document.createElement('canvas');cv.width=c*100;cv.height=r*100;const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,cv.width,cv.height);g.addColorStop(0,'#ffe27a');g.addColorStop(1,'#8fd8ff');
  x.fillStyle=g;x.fillRect(0,0,cv.width,cv.height);
  x.font=Math.min(cv.width,cv.height)*.7+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(it.e,cv.width/2,cv.height/2+6);
  const url=cv.toDataURL();let o=[...Array(n).keys()];
  do{o=sh(o)}while(o.every((v,i)=>v===i));
  let s=-1,fin=false;
  $('#stage').innerHTML=`<div class="q">Susun gambar ${it.n}<br><small>Sentuh dua keping untuk bertukar</small></div>${lvl<2?`<img class="pv" src="${url}" alt="contoh">`:''}<div class="jig" style="grid-template-columns:repeat(${c},1fr)"></div>`;
  const B=$('.jig');
  function draw(){
    B.innerHTML=o.map((v,i)=>`<div class="tile${v===i?' ok':''}${s===i?' sel':''}" data-i="${i}" style="background-image:url(${url});background-size:${c*100}% ${r*100}%;background-position:${(v%c)/(c-1)*100}% ${Math.floor(v/c)/(r-1)*100}%"></div>`).join('');
    P.d=o.filter((v,i)=>v===i).length;prog();
    if(P.d===n&&!fin){fin=true;good();say(it.n);setTimeout(win,900)}
  }
  B.onclick=e=>{
    const t=e.target.closest('.tile');if(!t||fin)return;const i=+t.dataset.i;
    if(s<0){s=i;snd(500)}
    else if(s===i)s=-1;
    else{[o[s],o[i]]=[o[i],o[s]];s=-1;snd(700)}
    draw();
  };
  draw();
}

/* 4. MENYUSUN SUSUNAN */
function seq(){
  const s=S[lvl],n=s.length;P.t=n;let nx=0;
  $('#stage').innerHTML=`<div class="q">${ST[lvl]}<br><small>Tekan langkah mengikut urutan yang betul</small></div><div class="slots">${s.map((_,i)=>`<div class="slot"><b>${i+1}</b></div>`).join('')}</div><div class="opts">${sh(s.map((_,i)=>i)).map(i=>`<button class="opt" data-i="${i}">${s[i]}</button>`).join('')}</div>`;
  $('#stage').onclick=e=>{
    const b=e.target.closest('.opt');if(!b)return;const i=+b.dataset.i;
    if(i===nx){const sl=document.querySelectorAll('.slot')[nx];sl.innerHTML=`<b>${nx+1}</b>${s[i]}`;sl.classList.add('on','good');b.remove();nx++;good();say(s[i].replace(/^\S+\s/,''));step()}
    else bad(b);
  };
}

/* 5. MENGKATEGORIKAN (seret ke bakul) */
function cat(){
  const ks=lvl?['tulis','cakap','wajah']:['tulis','cakap'];
  const it=sh(D.filter(x=>ks.includes(x.c))).slice(0,[4,6,7][lvl]);P.t=it.length;
  $('#stage').innerHTML=`<div class="q">Masukkan ke dalam bakul yang betul</div><div class="baskets">${ks.map(k=>`<div class="drop" data-k="${k}"><div>${C[k].e} ${C[k].n}</div></div>`).join('')}</div><div class="pool">${it.map(x=>`<div class="drag" data-k="${x.c}" data-say="${x.n}"><span class="em">${x.e}</span>${x.n}</div>`).join('')}</div>`;
  dnd($('#stage'),(a,d)=>a.dataset.k===d.dataset.k);
}

/* kemenangan: piala + bunga api */
function win(){
  done[act+'-'+lvl]=1;$('#win').classList.remove('hide');
  say('Tahniah! Anda berjaya!');[523,659,784,1047].forEach((f,i)=>setTimeout(()=>snd(f,.25),i*150));fw(true);
}
const cv=$('#fx'),cx=cv.getContext('2d');let ps=[],run=false,tm;
function fw(on){
  run=on;clearInterval(tm);
  if(on){cv.width=innerWidth;cv.height=innerHeight;burst();tm=setInterval(burst,450);loop()}
  else{ps=[];cx.clearRect(0,0,cv.width,cv.height)}
}
function burst(){
  const x=Math.random()*cv.width*.8+cv.width*.1,y=Math.random()*cv.height*.5+cv.height*.1,h=Math.random()*360;
  for(let i=0;i<50;i++){const a=i/50*6.283,s=2+Math.random()*4;ps.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h})}
  snd(110+Math.random()*100,.2,'triangle');
}
function loop(){
  if(!run&&!ps.length)return;
  cx.globalCompositeOperation='destination-out';cx.fillStyle='rgba(0,0,0,.2)';cx.fillRect(0,0,cv.width,cv.height);
  cx.globalCompositeOperation='lighter';ps=ps.filter(p=>p.l>0);
  ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.vx*=.98;p.l-=.012;cx.fillStyle=`hsla(${p.h},100%,60%,${p.l})`;cx.beginPath();cx.arc(p.x,p.y,3.5,0,7);cx.fill()});
  requestAnimationFrame(loop);
}
menu();
