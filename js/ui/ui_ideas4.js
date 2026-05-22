// ================================================================
// ui_ideas4.js — UI ideas4 전체 구현
// ================================================================

// ================================================================
// 1. 전투 보스 전용 UI (분노 페이즈, 진입 컷씬, 로그 아이콘)
// ================================================================

window.applyBattleMode = function(boss) {
  const cont    = document.getElementById('battle-container');
  const bossBg  = document.getElementById('battle-boss-bg');
  const rageOv  = document.getElementById('battle-rage-overlay');
  const label   = document.getElementById('battle-label');
  const title   = document.getElementById('battle-title');
  if (!cont) return;
  if (boss) {
    cont.classList.add('battle-boss-mode');
    if (bossBg)  bossBg.style.display = 'block';
    if (label)   label.textContent = '⚠ 보스 전투';
    if (title)   title.textContent = boss.name;
    const wb = document.getElementById('enemy-weakness-badge');
    if (wb) { wb.textContent = '약점: ' + boss.weakness; wb.style.display = 'block'; }
  } else {
    cont.classList.remove('battle-boss-mode','battle-rage-mode');
    if (bossBg) bossBg.style.display = 'none';
    if (rageOv) rageOv.style.display = 'none';
    if (label)  label.textContent = '전투 발생';
    if (title)  title.textContent = '205관 이면 세계';
    const wb = document.getElementById('enemy-weakness-badge');
    if (wb) wb.style.display = 'none';
    const pb = document.getElementById('battle-phase-badge');
    if (pb) pb.style.display = 'none';
  }
  const sm = document.getElementById('battle-sp-mini');
  if (sm && typeof playerStats !== 'undefined')
    sm.textContent = 'SP ' + playerStats.sp + '/' + playerStats.maxSp;
};

window.triggerBossIntro = async function(boss) {
  if (!boss) return;
  const b = document.getElementById('battle-monster-intro');
  if (!b) return;
  b.textContent = boss.intro || boss.name + '이(가) 나타났다!';
  b.style.display = 'block'; b.classList.add('boss-intro-anim');
  const c = document.getElementById('battle-container');
  if (c) { c.style.animation = 'bossEntryFlash 0.6s ease'; setTimeout(()=>{ c.style.animation=''; },600); }
  if (navigator.vibrate) navigator.vibrate([100,50,200]);
  await new Promise(r=>setTimeout(r,2200));
  b.style.display = 'none'; b.classList.remove('boss-intro-anim');
};

// ★ BugFix #3: const _origIB4 이름 충돌(SyntaxError) 방지를 위해 두 변수명을 분리
//   원본 첫 번째 후킹은 _origIB4_ui (applyBattleMode + bossIntro)
//   원본 두 번째 후킹은 _origIB4 (타이머 ON) — 이름만 다를 뿐 동일 역할
let _origIB4_ui = window.initBattle;
if (_origIB4_ui) window.initBattle = function(origin, bossId) {
  _origIB4_ui(origin, bossId);
  setTimeout(() => {
    const boss = bossId && window.BOSSES ? window.BOSSES[bossId] : null;
    window.applyBattleMode(boss);
    if (boss) window.triggerBossIntro(boss);
  }, 150);
};

// ── 분노 페이즈 감지 & SP 미니 업데이트 ──
// ★ 수정: 항상 실행되던 setInterval을 전투 시작/종료에 연동하여
//         전투 화면이 없을 때는 타이머가 돌지 않도록 개선
let _rageIntervalId  = null;
let _spMiniIntervalId = null;

function _startBattleTimers() {
  // 이미 실행 중이면 중복 등록 방지
  if (_rageIntervalId) return;

  let _prevHP4 = 100;

  // 분노 페이즈 감지 (400ms)
  _rageIntervalId = setInterval(() => {
    const bar = document.getElementById('enemy-hp-bar');
    if (!bar) return;
    const pct = parseFloat(bar.style.width) || 100;
    const c = document.getElementById('battle-container');
    if (!c || !c.classList.contains('battle-boss-mode')) { _prevHP4=100; return; }
    if (pct <= 50 && _prevHP4 > 50) {
      c.classList.add('battle-rage-mode');
      const ro = document.getElementById('battle-rage-overlay');
      if (ro) ro.style.display = 'block';
      const pb = document.getElementById('battle-phase-badge');
      if (pb) { pb.textContent = '🔥 분노 페이즈'; pb.style.display = 'flex'; }
      bar.style.background = '#ff2222';
      if (typeof showToast === 'function') showToast('🔥 분노 페이즈!', 'warning', 3000);
    }
    _prevHP4 = pct;
  }, 400);

  // SP 미니 업데이트 (800ms)
  _spMiniIntervalId = setInterval(() => {
    const sm = document.getElementById('battle-sp-mini');
    const bc = document.getElementById('battle-container');
    if (!sm || !bc || bc.style.display==='none') return;
    if (typeof playerStats !== 'undefined')
      sm.textContent = 'SP '+(playerStats.sp||0)+'/'+(playerStats.maxSp||40);
  }, 800);
}

function _stopBattleTimers() {
  if (_rageIntervalId)   { clearInterval(_rageIntervalId);   _rageIntervalId   = null; }
  if (_spMiniIntervalId) { clearInterval(_spMiniIntervalId); _spMiniIntervalId = null; }
}

// initBattle 후킹 — 전투 시작 시 타이머 ON
// ★ BugFix #3: const → let 으로 변경 (위의 _origIB4_ui와 이름 충돌 방지)
let _origIB4 = window.initBattle;
if (_origIB4) window.initBattle = function(origin, bossId) {
  _origIB4(origin, bossId);
  _startBattleTimers();  // ★ 전투 시작할 때만 타이머 켬
  setTimeout(() => {
    const boss = bossId && window.BOSSES ? window.BOSSES[bossId] : null;
    window.applyBattleMode(boss);       // ★ 병합: 첫 번째 후킹의 applyBattleMode
    if (boss) window.triggerBossIntro(boss); // ★ 병합: 첫 번째 후킹의 bossIntro
  }, 150);
};

// returnToGame 후킹 — 전투 종료 시 타이머 OFF + 조우 게이지 리셋
const _origRTG4 = window.returnToGame;
if (_origRTG4) window.returnToGame = function() {
  _stopBattleTimers();   // ★ 전투 끝나면 타이머 끔
  // ★ BugFix #16: 탐험 복귀 시 조우 게이지(_exploreSteps) 리셋
  //   문제: startExploration()은 전투 최초 진입 시에만 호출돼 0으로 초기화하지만
  //   전투 후 복귀 시 update() 루프만 재개되어 이전 게이지값이 그대로 남음
  //   사이드이펙트: 없음 — 전역 카운터 리셋만 함
  window._exploreSteps = 0;
  _origRTG4.apply(this, arguments);
};

// 전투 로그 아이콘 (MutationObserver — 항상 감시해도 DOM 변경 시에만 콜백 실행되므로 부담 없음)
document.addEventListener('DOMContentLoaded', () => {
  const log = document.getElementById('battle-log');
  if (!log) return;
  const icons = {'log-damage':'💥 ','log-success':'✅ ','log-dice':'🎲 ','log-system2':'ℹ️ '};
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (!n.classList) return;
    for (const [cls,ic] of Object.entries(icons))
      if (n.classList.contains(cls) && !n.dataset.ic) { n.textContent=ic+n.textContent; n.dataset.ic='1'; n.style.animation='logSlide .2s ease'; }
  }))).observe(log, {childList:true});
});

// ================================================================
// 2. 탐험 HUD + 터치 방향키
// ================================================================
function updateExploreHUD() {
  const c = document.getElementById('explore-container');
  if (!c || c.style.display==='none') return;
  if (typeof playerStats==='undefined') return;
  const pct = Math.max(0,Math.min(100,Math.round(playerStats.hp/playerStats.maxHp*100)));
  const hf = document.getElementById('explore-hp-fill');
  const ht = document.getElementById('explore-hp-text');
  if (hf) { hf.style.width=pct+'%'; hf.style.background=pct<=25?'#e24b4a':pct<=50?'#ef9f27':'#1d9e75'; }
  if (ht) ht.textContent = playerStats.hp+'/'+playerStats.maxHp;
  const ef = document.getElementById('explore-encounter-fill');
  if (ef) ef.style.width = ((window._exploreSteps||0)%10*10)+'%';
}
setInterval(updateExploreHUD, 600);

let _dpadIv4=null;
window.dpadPress = function(dir) {
  const m={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const [dx,dy]=m[dir]||[0,0];
  // ★ Fix #13: player.isMoving 체크 추가 — 이동 애니메이션 완료 전 중복 호출 방지
  if (typeof movePlayer==='function' && typeof player!=='undefined' && !player.isMoving) movePlayer(dx,dy);
  if (_dpadIv4) clearInterval(_dpadIv4); // 이전 인터벌 정리
  _dpadIv4=setInterval(()=>{
    // ★ Fix #13: setInterval 내부에서도 isMoving 체크
    if(typeof movePlayer==='function' && typeof player!=='undefined' && !player.isMoving) movePlayer(dx,dy);
  },180);
};
window.dpadRelease = function() { if (_dpadIv4){clearInterval(_dpadIv4);_dpadIv4=null;} };

const _origSE4 = window.startExploration;
if (_origSE4) window.startExploration = function() { window._exploreSteps=0; _origSE4(); };

// ================================================================
// 3. 인트로 파티클 + API 키 자동 검증
// ================================================================

function startParticles() {
  const cv = document.getElementById('intro-particles-canvas');
  if (!cv) return;
  cv.width=window.innerWidth; cv.height=window.innerHeight;
  const ctx=cv.getContext('2d');
  const ps=Array.from({length:55},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.4+0.4,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,a:Math.random()*.45+.1}));
  let run=true;
  function draw() {
    if(!run) return;
    ctx.clearRect(0,0,cv.width,cv.height);
    ps.forEach(p=>{
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(160,196,255,${p.a})`;ctx.fill();
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=cv.width;if(p.x>cv.width)p.x=0;
      if(p.y<0)p.y=cv.height;if(p.y>cv.height)p.y=0;
    });
    for(let i=0;i<ps.length;i++) for(let j=i+1;j<ps.length;j++){
      const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<90){ctx.beginPath();ctx.strokeStyle=`rgba(100,150,255,${.07*(1-d/90)})`;ctx.lineWidth=.5;ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.stroke();}
    }
    requestAnimationFrame(draw);
  }
  draw();
  const ov=document.getElementById('intro-overlay');
  if(ov) new MutationObserver(()=>{ if(ov.classList.contains('hidden')) run=false; }).observe(ov,{attributes:true});
  window.addEventListener('resize',()=>{ cv.width=window.innerWidth;cv.height=window.innerHeight; });
}

function initApiValidation() {
  const inp=document.getElementById('api-key-input');
  const btn=document.getElementById('api-key-btn');
  if(!inp||!btn) return;
  inp.addEventListener('input',()=>{
    const v=inp.value.trim();
    if(v.startsWith('gsk_')&&v.length>10){
      inp.style.borderColor='#1d9e75';inp.style.boxShadow='0 0 0 2px rgba(29,158,117,.25)';
      btn.style.background='#1d9e75';btn.textContent='✅ 접속 ▶';
    } else if(v.length>0){
      inp.style.borderColor='#ef9f27';inp.style.boxShadow='0 0 0 2px rgba(239,159,39,.2)';
      btn.style.background='';btn.textContent='접속 ▶';
    } else {
      inp.style.borderColor='';inp.style.boxShadow='';btn.style.background='';btn.textContent='접속 ▶';
    }
  });
}

document.addEventListener('DOMContentLoaded',()=>{ setTimeout(startParticles,80); initApiValidation(); });

// ================================================================
// 4. 스탯바 아바타 + 닉네임 + 칭호 + 위험 흔들림
// ================================================================

function updateStatBrand() {
  const ae=document.getElementById('stat-avatar');
  const ne=document.getElementById('stat-brand-name');
  const te=document.getElementById('stat-brand-title');
  if(!ae&&!ne) return;
  const avatar=localStorage.getItem('playerAvatar')||'🧑\u200d💻';
  const name=(typeof playerStats!=='undefined'&&playerStats.name)||localStorage.getItem('playerName')||'탐험가';
  if(ae){ ae.textContent=avatar; ae.classList.toggle('avatar-danger',typeof playerStats!=='undefined'&&playerStats.hp/playerStats.maxHp<=.25); }
  if(ne) ne.textContent=name;
  if(te&&typeof getActiveTitle==='function'){
    const t=getActiveTitle();
    te.textContent=t.name; te.style.color=t.color;
    te.classList.toggle('title-rainbow',t.id==='t_legend');
  }
}
document.addEventListener('DOMContentLoaded',()=>{ setTimeout(updateStatBrand,900); setInterval(updateStatBrand,6000); });
const _origUMS4=window.updateMapStats;
if(_origUMS4) window.updateMapStats=function(){ _origUMS4(); updateStatBrand(); };

// ================================================================
// 5. 장소별 배경 애니메이션
// ================================================================

function addBgLayer(cid,lid,cls,pcls,n,styleFn){
  const c=document.getElementById(cid);
  if(!c||document.getElementById(lid)) return;
  const l=document.createElement('div');l.id=lid;l.className=cls;
  for(let i=0;i<n;i++){const p=document.createElement('div');p.className=pcls;styleFn&&styleFn(p,i);l.appendChild(p);}
  c.style.position='relative';c.appendChild(l);
}

function initCafSmoke(){addBgLayer('cafeteria-container','caf-smoke','caf-smoke-layer','caf-smoke-p',8,(p)=>{p.style.left=(5+Math.random()*90)+'%';p.style.bottom='28%';p.style.animationDelay=(Math.random()*4)+'s';p.style.animationDuration=(3+Math.random()*2)+'s';});}
function initLibDust(){addBgLayer('library-container','lib-dust','lib-dust-layer','lib-dust-p',14,(p)=>{p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';p.style.animationDelay=(Math.random()*6)+'s';p.style.animationDuration=(6+Math.random()*6)+'s';});}
function initLakeSparkle(){addBgLayer('bluedragonlake-container','lake-sparkle','lake-sparkle-layer','lake-sparkle-p',18,(p)=>{p.style.left=Math.random()*100+'%';p.style.top=(40+Math.random()*50)+'%';p.style.animationDelay=(Math.random()*4)+'s';p.style.animationDuration=(1.5+Math.random()*2.5)+'s';});}
function initGlitch(){
  const c=document.getElementById('explore-container');
  if(!c||document.getElementById('ex-glitch')) return;
  const l=document.createElement('div');l.id='ex-glitch';l.className='explore-glitch-layer';c.appendChild(l);
  setInterval(()=>{ if(c.style.display==='none') return; if(Math.random()<.06){l.classList.add('glitch-active');setTimeout(()=>l.classList.remove('glitch-active'),140);} },2200);
}

const _hk=(name,fn)=>{ const o=window[name]; if(o) window[name]=function(){o.apply(this,arguments);setTimeout(fn,60);}; };
_hk('enterCafeteria',initCafSmoke); _hk('enterLibrary',initLibDust);
_hk('enterBluedragonLake',initLakeSparkle); _hk('startExploration',initGlitch);

// ================================================================
// 6. 채팅 fade-in + 호감도 하트 파티클
// ================================================================

document.addEventListener('DOMContentLoaded',()=>{
  const cl=document.getElementById('chat-log');
  if(!cl) return;
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
    if(n.nodeType===1&&!n.dataset.fi){n.classList.add('chat-msg-fadein');n.dataset.fi='1';}
  }))).observe(cl,{childList:true});
});

let _lastFav4=null;
setInterval(()=>{
  if(typeof puangState==='undefined') return;
  const cur=puangState.favorability;
  if(_lastFav4!==null&&cur>_lastFav4) spawnHearts4();
  _lastFav4=cur;
},600);

function spawnHearts4(){
  const r=document.getElementById('puang-room');
  if(!r||r.style.display==='none') return;
  for(let i=0;i<7;i++){
    const h=document.createElement('div');h.className='heart-particle';h.textContent='♥';
    h.style.left=(35+Math.random()*30)+'%';h.style.bottom=(20+Math.random()*10)+'%';
    h.style.animationDelay=(Math.random()*.5)+'s';
    r.style.position='relative';r.appendChild(h);setTimeout(()=>h.remove(),2000);
  }
}

// ================================================================
// 7. 팝업 bottom-sheet 스와이프 닫기
// ================================================================

function addSwipeClose(id,cls){
  const el=document.getElementById(id);if(!el) return;
  let sy=0;
  el.addEventListener('touchstart',e=>{sy=e.touches[0].clientY;},{passive:true});
  el.addEventListener('touchend',e=>{if(e.changedTouches[0].clientY-sy>80) el.classList.remove(cls);},{passive:true});
}
document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    [['inventory-overlay','inv-open'],['profile-overlay','profile-open'],['stats-overlay','stats-open'],
     ['compendium-overlay','comp-open'],['calendar-overlay','cal-open'],['leaderboard-overlay','lb-open']]
    .forEach(([i,c])=>addSwipeClose(i,c));
  },1200);
});

// ================================================================
// 8. 장소 입장 연출 강화
// ================================================================

const _origFTP4=window.fadeToPlace;
if(_origFTP4) window.fadeToPlace=function(placeId,cb){
  const ov=document.getElementById('place-transition-overlay');
  if(placeId==='battle'){ if(ov) ov.style.background='rgba(180,0,0,.65)'; document.body.classList.add('screen-skew'); setTimeout(()=>document.body.classList.remove('screen-skew'),400); }
  else if(placeId==='mountain'){ let n=0; const iv=setInterval(()=>{ document.body.classList.toggle('thunder-flash'); if(++n>=4){clearInterval(iv);document.body.classList.remove('thunder-flash');} },80); }
  else if(placeId==='bluedragonlake'){ if(ov) ov.style.background='rgba(0,80,200,.45)'; }
  _origFTP4(placeId,()=>{ if(ov) ov.style.background='#000'; if(cb) cb(); });
};

// ================================================================
// 9. 퀘스트 완료 스탬프 + 💎 날아가기
// ================================================================

const _origCQ4=window.checkDailyQuests;
if(_origCQ4) window.checkDailyQuests=function(){
  const b=Object.values(JSON.parse(localStorage.getItem('questCompleted')||'{}')).filter(Boolean).length;
  _origCQ4();
  const a=Object.values(JSON.parse(localStorage.getItem('questCompleted')||'{}')).filter(Boolean).length;
  if(a>b) triggerQuestFx(a>=3);
};

function triggerQuestFx(all){
  const panel=document.getElementById('quest-panel-wrap'); if(!panel) return;
  const r=panel.getBoundingClientRect();
  const s=document.createElement('div');s.className='quest-stamp';s.textContent=all?'✅ ALL DONE!':'✅';
  s.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;`;
  document.body.appendChild(s); setTimeout(()=>s.remove(),1300);
  for(let i=0;i<6;i++){
    const g=document.createElement('div');g.className='quest-gem-fly';g.textContent='💎';
    g.style.cssText=`left:${r.left+Math.random()*r.width}px;top:${r.top+Math.random()*r.height}px;animation-delay:${i*.08}s;`;
    document.body.appendChild(g);setTimeout(()=>g.remove(),1600);
  }
  if(all){panel.classList.add('quest-all-glow');setTimeout(()=>panel.classList.remove('quest-all-glow'),3000);}
}

// ================================================================
// 10. 업적/칭호 전용 팝업
// ================================================================

window.showAchievementPopup=function(ach){
  let p=document.getElementById('ach-popup');
  if(!p){p=document.createElement('div');p.id='ach-popup';p.className='ach-popup';document.body.appendChild(p);}
  p.innerHTML=`<div class="ach-popup-inner"><div class="ach-popup-tag">🏆 업적 달성!</div><div class="ach-popup-name">${ach.name}</div><div class="ach-popup-desc">${ach.desc}</div>${ach.reward?`<div class="ach-popup-reward">💎 +${ach.reward}</div>`:''}</div>`;
  p.classList.add('ach-popup-show');
  if(typeof window.sfx==='object'&&window.sfx.levelup) window.sfx.levelup();
  if(typeof triggerVictoryConfetti==='function') triggerVictoryConfetti();
  setTimeout(()=>p.classList.remove('ach-popup-show'),3500);
};
window.showTitlePopup=function(title){
  let p=document.getElementById('title-unlock-popup');
  if(!p){p=document.createElement('div');p.id='title-unlock-popup';p.className='title-unlock-popup';document.body.appendChild(p);}
  p.innerHTML=`<div class="title-popup-inner" style="border-color:${title.color};"><div class="title-popup-tag">🎖️ 칭호 해금!</div><div class="title-popup-name" style="color:${title.color};">${title.name}</div></div>`;
  p.classList.add('title-popup-show');setTimeout(()=>p.classList.remove('title-popup-show'),4000);
};
const _origCA4=window.checkAchievements;
if(_origCA4) window.checkAchievements=function(){
  const n=_origCA4(); if(n&&n.length>0) n.forEach((a,i)=>setTimeout(()=>window.showAchievementPopup(a),i*1300)); return n;
};

// ================================================================
// 11. 숫자 카운트업
// ================================================================

window.animateCount=function(el,from,to,dur){
  if(!el) return; dur=dur||700;
  const t0=performance.now();
  (function step(now){ const p=Math.min((now-t0)/dur,1),v=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));
    el.textContent=v; if(p<1) requestAnimationFrame(step); else el.textContent=to; })(t0);
};
const _origUMS4c=window.updateMapStats;
if(_origUMS4c) window.updateMapStats=function(){
  const de=document.getElementById('data-val'); const pv=de?parseInt(de.textContent)||0:0;
  _origUMS4c();
  const nv=typeof playerStats!=='undefined'?(playerStats.data||0):0;
  if(nv!==pv&&de&&nv>pv){ window.animateCount(de,pv,nv,500); setTimeout(()=>{if(de) de.textContent=nv+'개';},550); }
};

// ================================================================
// 12. 미니 sticky 스탯 바
// ================================================================

function buildMiniStat(){
  if(document.getElementById('mini-stat-bar')) return;
  const b=document.createElement('div');b.id='mini-stat-bar';b.className='mini-stat-bar';
  b.innerHTML=`<div class="msi"><span>❤️</span><div class="mg"><div class="mgf" id="mhf" style="background:#1d9e75;width:100%;"></div></div><span class="msn" id="mhv">--</span></div><div class="msi"><span>💙</span><div class="mg"><div class="mgf" id="msf" style="background:#378add;width:100%;"></div></div><span class="msn" id="msv">--</span></div><div class="msi"><span>💎</span><span class="msn mini-data" id="mdv">0</span></div>`;
  document.body.appendChild(b);
}
function updateMiniStat(show){
  const b=document.getElementById('mini-stat-bar'); if(!b) return;
  if(!show){b.style.display='none';return;} b.style.display='flex';
  if(typeof playerStats==='undefined') return;
  const hp=Math.max(0,Math.min(100,Math.round(playerStats.hp/playerStats.maxHp*100)));
  const sp=Math.max(0,Math.min(100,Math.round(playerStats.sp/playerStats.maxSp*100)));
  const hf=document.getElementById('mhf'),sf=document.getElementById('msf'),hv=document.getElementById('mhv'),sv=document.getElementById('msv'),dv=document.getElementById('mdv');
  if(hf){hf.style.width=hp+'%';hf.style.background=hp<=25?'#e24b4a':hp<=50?'#ef9f27':'#1d9e75';}
  if(sf) sf.style.width=sp+'%'; if(hv) hv.textContent=playerStats.hp; if(sv) sv.textContent=playerStats.sp; if(dv) dv.textContent=playerStats.data||0;
  b.classList.toggle('mini-danger',hp<=25);
}
const PLACE_IDS4=['cafeteria-container','library-container','lab-container','gym-container','clinic-container','lab2-container','festival-container','union-container','store-container','mountain-container','puang-room','bluedragonlake-container'];
document.addEventListener('DOMContentLoaded',()=>{
  buildMiniStat();
  setInterval(()=>{
    const vis=PLACE_IDS4.some(id=>{const e=document.getElementById(id);if(!e)return false;const d=e.style.display;return d==='flex'||d==='block'||e.classList.contains('visible');});
    updateMiniStat(vis);
  },1000);
});

// ================================================================
// 13. 빈 상태 일러스트 개선
// ================================================================

const _origRI4=window.renderInventoryOverlay;
if(_origRI4) window.renderInventoryOverlay=function(){
  _origRI4();
  const e=document.getElementById('inv-empty');
  if(e&&e.style.display!=='none') e.innerHTML=`<div style="font-size:52px;margin-bottom:10px;">🎒</div><div style="font-size:14px;font-weight:600;color:#6c8ebf;margin-bottom:6px;">인벤토리가 비어 있어요</div><div style="font-size:11px;color:#4a5a7a;line-height:1.8;">⚔️ 전투 &nbsp;📚 도서관 &nbsp;🛒 편의점<br><span style="color:#5dcaa5;">에서 아이템을 획득해보세요!</span></div>`;
};
const _origRC4=window.renderCompendium;
if(_origRC4) window.renderCompendium=function(){
  _origRC4();
  const b=document.getElementById('compendium-body'); if(!b) return;
  if(Object.keys(JSON.parse(localStorage.getItem('monsterCompendium')||'{}')).length===0)
    b.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:12px;"><div style="font-size:56px;">👹</div><div style="font-size:14px;font-weight:600;color:#6c8ebf;">아직 발견한 몬스터가 없어요</div><div style="font-size:11px;color:#4a5a7a;text-align:center;line-height:1.8;">⚔️ 이면세계에서 몬스터를 처치하면<br>도감에 자동 등록됩니다!</div></div>`;
};

// ================================================================
// 14. 리더보드 숫자 롤링
// ================================================================

const _origLL4 = window.loadLeaderboard;
if (_origLL4) window.loadLeaderboard = async function(tab) {
  await _origLL4(tab);
  setTimeout(()=>{ 
    document.querySelectorAll('.lb-val').forEach(e => { 
      const text = e.textContent.trim();
      const n = parseInt(text) || 0;
      const spaceIdx = text.indexOf(' ');
      // 첫 공백 이후를 suffix로 (예: " / 100", " 💎", " 승")
      const suffix = spaceIdx !== -1? text.slice(spaceIdx) : '';
      if (n > 0 && suffix) {
        const dur = 900;
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const v = Math.round(n * (1 - Math.pow(1 - p, 3)));
          e.textContent = v + suffix;  // 매 프레임마다 suffix 포함
          if (p < 1) requestAnimationFrame(step);
          })(t0);
      }
    }); 
  },200);
};

// ================================================================
// 15. 탐험 다층 구조 UI (B1/B2/B3)
// ================================================================

window._curFloor=1;
window.goToFloor=function(f){
  window._curFloor=f;
  const b=document.getElementById('explore-floor-badge');if(b) b.textContent='B'+f+'F';
  const cv=document.getElementById('map-canvas');
  if(cv){const fs={1:'none',2:'brightness(.85) saturate(.8)',3:'brightness(.65) saturate(.6) hue-rotate(15deg)'};cv.style.filter=fs[f]||'none';}
  const c=document.getElementById('explore-container');
  if(c){const fl=document.createElement('div');fl.style.cssText='position:absolute;inset:0;background:#000;z-index:50;animation:floorTransit .6s ease forwards;pointer-events:none;';c.appendChild(fl);setTimeout(()=>fl.remove(),700);}
  if(typeof showToast==='function') showToast('🛗 B'+f+'F 진입!','info',2000);
};

const _origSE4b=window.startExploration;
if(_origSE4b) window.startExploration=function(){
  _origSE4b();
  setTimeout(()=>{
    const c=document.getElementById('explore-container');
    if(!c||document.getElementById('floor-nav')) return;
    const nav=document.createElement('div');nav.id='floor-nav';nav.className='floor-nav';
    nav.innerHTML=`<button class="floor-nav-btn" onclick="goToFloor(1)">B1F</button><button class="floor-nav-btn" onclick="goToFloor(2)">B2F</button><button class="floor-nav-btn" onclick="goToFloor(3)">B3F</button>`;
    c.appendChild(nav);
  },200);
};

// ================================================================
// 16. 온보딩 튜토리얼
// ================================================================

window.startOnboarding = function() {
  if (localStorage.getItem('onboardingDone')) return;

  // ── 수정 1: stat-right-group ID 존재 보장 (index.html에 id 추가됨)
  const steps = [
    {
      id: 'map-bg',
      icon: '🗺️',
      title: '캠퍼스 맵',
      msg: '여기가 중앙대학교 캠퍼스 맵이에요!<br>장소 버튼을 눌러 각 장소에 입장해보세요.',
    },
    {
      id: 'hp-pill',
      icon: '❤️',
      title: 'HP / SP 관리',
      msg: 'HP와 SP를 항상 확인하세요.<br>낮아지면 <b>식당</b>이나 <b>의무실</b>에서 회복할 수 있어요!',
    },
    {
      id: 'quest-panel-wrap',
      icon: '📋',
      title: '오늘의 미션',
      msg: '매일 3개의 미션이 주어져요.<br>완료하면 <b>💎 데이터 조각</b> 보상을 받을 수 있어요!',
    },
    {
      id: 'stat-right-group',
      icon: '🎒',
      title: '빠른 메뉴',
      msg: '인벤토리·프로필·도감·캘린더 등<br>다양한 기능을 여기서 바로 열 수 있어요.',
    },
  ];

  let step = 0;
  // ── 수정 3: 이벤트 중복 등록 방지용 플래그
  let _listenerAdded = false;

  function clr() {
    ['ob-ov', 'ob-box', 'ob-card', 'ob-connector'].forEach(id => {
      const e = document.getElementById(id);
      if (e) e.remove();
    });
  }

  function next() {
    step++;
    show(step);
  }

  function show(i) {
    clr();
    if (i >= steps.length) {
      localStorage.setItem('onboardingDone', '1');
      return;
    }

    const s  = steps[i];
    const el = document.getElementById(s.id);
    // ── 수정 1: ID 없으면 건너뜀 (무한루프 방지용 상한 추가)
    if (!el) {
      if (i < steps.length - 1) show(i + 1);
      else { localStorage.setItem('onboardingDone', '1'); }
      return;
    }

    // 어두운 오버레이
    const ov = document.createElement('div');
    ov.id = 'ob-ov';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0);z-index:9200;pointer-events:all;';
    // ── 수정 4: ov 클릭은 오버레이 배경 직접 클릭 시만 다음으로 (버블링 차단)
    ov.addEventListener('click', function(e) {
      if (e.target === ov) next();
    });
    document.body.appendChild(ov);

    // 타겟 요소 위치 계산
    const r = el.getBoundingClientRect();
    const PAD = 8;

    // 하이라이트 박스
    const box = document.createElement('div');
    box.id = 'ob-box';
    box.className = 'ob-highlight-box';
    box.style.cssText = [
      'position:fixed',
      `left:${r.left - PAD}px`,
      `top:${r.top - PAD}px`,
      `width:${r.width + PAD * 2}px`,
      `height:${r.height + PAD * 2}px`,
      'z-index:9201',
      'pointer-events:none',
      'box-shadow:0 0 0 9999px rgba(0,0,0,0.65),0 0 0 3px #5dcaa5,0 0 20px rgba(93,202,165,0.5)',
      'border-radius:12px',
      'animation:obBoxPulse 1.4s ease-in-out infinite',
    ].join(';');
    document.body.appendChild(box);

    // 툴팁 카드
    const card = document.createElement('div');
    card.id = 'ob-card';
    card.className = 'ob-card';

    const progress = Array.from({length: steps.length}, (_, k) =>
      `<div class="ob-dot ${k === i ? 'ob-dot-active' : k < i ? 'ob-dot-done' : ''}"></div>`
    ).join('');

    const isLast = i >= steps.length - 1;

    card.innerHTML = `
      <div class="ob-card-header">
        <span class="ob-card-icon">${s.icon}</span>
        <span class="ob-card-title">${s.title}</span>
        <button class="ob-skip-btn" id="ob-skip-btn">건너뛰기</button>
      </div>
      <div class="ob-card-msg">${s.msg}</div>
      <div class="ob-card-footer">
        <div class="ob-dots">${progress}</div>
        <button class="ob-next-btn" id="ob-next-btn">
          ${isLast ? '시작하기 ✅' : '다음 ▶'}
        </button>
      </div>`;

    // 카드 위치
    const cardW = 280;
    let cardLeft = r.left + r.width / 2 - cardW / 2;
    cardLeft = Math.max(10, Math.min(cardLeft, window.innerWidth - cardW - 10));
    const spaceBelow = window.innerHeight - (r.bottom + PAD + 12);
    const cardTop = spaceBelow > 150
      ? r.bottom + PAD + 12
      : r.top - PAD - 12 - 140;

    card.style.cssText = [
      'position:fixed',
      `left:${cardLeft}px`,
      `top:${Math.max(10, cardTop)}px`,
      `width:${cardW}px`,
      'z-index:9202',
      'pointer-events:all',
    ].join(';');
    document.body.appendChild(card);

    // ── 수정 4: 버튼에 addEventListener 사용 (onclick 인라인 제거 → 버블링 stopPropagation)
    document.getElementById('ob-next-btn').addEventListener('click', function(e) {
      e.stopPropagation(); // ov의 click 이벤트로 버블링 차단
      next();
    });
    document.getElementById('ob-skip-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      window.skipOnboarding();
    });

    // 연결선 삼각형
    const arrowEl = document.createElement('div');
    arrowEl.id = 'ob-connector';
    arrowEl.className = spaceBelow > 150 ? 'ob-connector-down' : 'ob-connector-up';
    arrowEl.style.cssText = [
      'position:fixed',
      `left:${r.left + r.width / 2 - 8}px`,
      `top:${spaceBelow > 150 ? r.bottom + PAD + 3 : r.top - PAD - 16}px`,
      'z-index:9202',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(arrowEl);
  }

  window.skipOnboarding = function() {
    clr();
    localStorage.setItem('onboardingDone', '1');
  };

  // ── 수정 2+3: MutationObserver 강화 + 중복 실행 방지
  let _started = false;

  function tryStart() {
    if (_started) return;
    const ge = document.getElementById('game-container');
    if (!ge) return;
    const d = ge.style.display;
    // display 속성이 없거나(초기 상태) flex/block이면 표시 중으로 판단
    if (d === '' || d === 'flex' || d === 'block') {
      _started = true;
      setTimeout(() => show(0), 1200);
    }
  }

  const ge = document.getElementById('game-container');
  if (ge) {
    // ── 수정 2: style 속성 외 childList도 감시 + 초기 상태 즉시 체크
    const obs = new MutationObserver(() => { tryStart(); });
    obs.observe(ge, { attributes: true, attributeFilter: ['style'] });

    // 이미 표시 중인 경우(재방문 유저가 skipIntro 후 바로 보이는 경우) 즉시 체크
    tryStart();
  }
};

document.addEventListener('DOMContentLoaded', () => { setTimeout(window.startOnboarding, 500); });
