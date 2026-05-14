// ================================================================
// locations.js — 각 장소 로직, 새로운 맵 구현시 이 파일에 추가
// 학생식당 / 중앙도서관 / 310관 연구실 / 체육관 /
// 의무실 / 공대 실험실 / 축제 / 학생회관 / 청룡산  (2026.05.06)
// ================================================================

// ================================================================
// 아이템 가게 — 편의점
// ================================================================

// 아이템 데이터 (나중에 아이템 추가 시 여기에만 추가하면 됨)
const STORE_ITEMS = {
  hp_potion:  { name: 'HP 포션',       cost: 5,  desc: 'HP +30 즉시 회복',         clerk: '체력 회복에 딱이죠~ 많이 사 가세요!' },
  sp_potion:  { name: 'SP 포션',       cost: 4,  desc: 'SP +20 즉시 회복',         clerk: '집중력 포션이에요! 공부할 때 좋아요 😊' },
  full_potion:{ name: '풀 회복 포션',  cost: 15, desc: 'HP+SP 완전 회복',          clerk: '저희 가게 최고 인기 상품이에요! ✨' },
  dmg_boost:  { name: '데미지 부스터', cost: 8,  desc: '다음 전투 데미지 +50%',    clerk: '전투 전에 꼭 챙겨가세요 💪' },
  shield:     { name: '방어막',        cost: 8,  desc: '다음 전투 피해 -50%',      clerk: '안전이 최우선이죠! 방어막 추천해요 🛡️' },
};

// 점원 기본 멘트
const STORE_CLERK_DEFAULT = [
  '어서오세요~ 필요한 거 있으면 말씀해 주세요!',
  '오늘 날씨 좋죠? 포션 한 병 어떠세요? 😊',
  '이면 세계 탐험 가세요? 미리 준비해두세요!',
  '데이터 조각 많이 모으셨네요! 좋은 거 사 가세요 🎉',
];

// 아이템 가게 입장
window.enterStore = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('store-container').style.display = '';
  document.getElementById('store-container').classList.add('visible');
  document.getElementById('store-data-val').textContent = playerStats.data;

  // 점원 랜덤 멘트
  const el = document.getElementById('store-clerk-text');
  if (el) el.textContent = STORE_CLERK_DEFAULT[Math.floor(Math.random() * STORE_CLERK_DEFAULT.length)];

  // 영수증 시간 표시
  const timeEl = document.getElementById('store-receipt-time');
  if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
}

// 아이템 가게 퇴장
window.leaveStore = function() {
  document.getElementById('store-container').classList.remove('visible');
  document.getElementById('store-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 영수증 로그 추가
function addStoreLog(msg, cls) {
  const box = document.getElementById('store-receipt-body');
  box.innerHTML += '<br><span class="' + (cls || 'store-log-info') + '">' + msg + '</span>';
  const receipt = document.getElementById('store-log');
  if (receipt) receipt.scrollTop = receipt.scrollHeight;
}

// 아이템 구매
window.buyStore = function(id) {
  const item = STORE_ITEMS[id];
  if (!item) return;

  if (playerStats.data < item.cost) {
    addStoreLog('[❌] 데이터 조각 부족! (필요: ' + item.cost + '개, 보유: ' + playerStats.data + '개)', 'store-log-err');
    // 점원 멘트 변경
    const el = document.getElementById('store-clerk-text');
    if (el) el.textContent = '앗, 데이터 조각이 부족하네요... 더 모아오세요! 😅';
    return;
  }

  // 비용 차감
  playerStats.data -= item.cost;

  // 효과 적용
  if      (id === 'hp_potion')   { playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 30); }
  else if (id === 'sp_potion')   { playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + 20); }
  else if (id === 'full_potion') { playerStats.hp = playerStats.maxHp; playerStats.sp = playerStats.maxSp; }
  else if (id === 'dmg_boost')   { inventory.push({ id: 'dmg_boost', name: item.name, icon: '🔥', desc: item.desc }); saveInventory(); }
  else if (id === 'shield')      { inventory.push({ id: 'shield',    name: item.name, icon: '🛡️', desc: item.desc }); saveInventory(); }

  // 점원 멘트 변경
  const el = document.getElementById('store-clerk-text');
  if (el) el.textContent = item.clerk;

  // 영수증 로그
  addStoreLog('[✅] ' + item.name + ' 구매 완료! · 💎 -' + item.cost + '개', 'store-log-ok');

  // 스탯 갱신
  document.getElementById('store-data-val').textContent = playerStats.data;
  updateMapStats();
}

// ================================================================
// 청룡산 (보스전)
// ================================================================

// 청룡산 입장
window.enterMountain = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('mountain-container').style.display = 'flex';
  document.getElementById('mtn-hp-val').textContent = playerStats.hp;
}

// 청룡산 퇴장
window.leaveMountain = function() {
  document.getElementById('mountain-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 청룡산 로그 추가
function addMountainLog(msg, color) {
  const box = document.getElementById('mountain-log');
  box.innerHTML += '<br><span style="color:' + (color || '#f09595') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 보스 전투 진입 — HP 체크 후 battle-container로 전환
window.enterBoss = function(bossId) {
  if (playerStats.hp < 30) {
    addMountainLog('[경고] HP가 너무 낮습니다! 의무실에서 회복 후 도전하세요.', '#f09595');
    return;
  }

  const boss = BOSSES[bossId];
  if (!boss) return;

  addMountainLog('[진입] ' + boss.name + ' 과의 전투를 시작합니다!', '#ef9f27');

  setTimeout(() => {  // BOSS DB에서 이미지와 이름 불러온 후 전투 화면으로 전환
    document.getElementById('mountain-container').style.display = 'none';
    document.getElementById('battle-container').classList.add('visible');
    initBossBattle(boss);
  }, 1500);  // 1.5초 후 전투 화면으로 전환
}

// ================================================================
// 학생식당
// ================================================================

// 메뉴별 HP/SP 회복량과 데이터 조각 비용 정의 (메뉴 및 가격 수정 가능)
const cafMenu = {
  rice:    { hp: 20, sp: 10, cost: 3, name: '학식 정식' },
  ramen:   { hp: 10, sp: 20, cost: 2, name: '얼큰 라면' },
  coffee:  { hp:  0, sp: 30, cost: 1, name: '아이스 아메리카노' },
  special: { hp: 40, sp: 20, cost: 6, name: '특선 도시락' },
};

// 식당 입장 — 맵 숨기고 식당 화면 표시, 남은 주문 횟수 안내
window.enterCafeteria = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('cafeteria-container').classList.add('visible');
  syncCafStats();
  addCafLog('[식당] 오늘 남은 주문 횟수: ' + remainDaily('cafeteria') + '회', 'caf-log-hp');
}

// 식당 퇴장
window.leaveCafeteria = function() {
  document.getElementById('cafeteria-container').classList.remove('visible');
  document.getElementById('game-container').style.display = 'flex';
}

// 식당 스탯 바 동기화 — playerStats 값을 화면에 반영
function syncCafStats() {
  document.getElementById('caf-hp-val').textContent    = playerStats.hp + ' / ' + playerStats.maxHp;
  document.getElementById('caf-sp-val').textContent    = playerStats.sp + ' / ' + playerStats.maxSp;
  document.getElementById('caf-data-val').textContent  = playerStats.data;
  document.getElementById('caf-hp-bar').style.width    = (playerStats.hp / playerStats.maxHp * 100) + '%';
  document.getElementById('caf-sp-bar').style.width    = (playerStats.sp / playerStats.maxSp * 100) + '%';
}

// 식당 로그 추가
function addCafLog(msg, cls) {
  const box = document.getElementById('caf-log');
  box.innerHTML += '<br><span class="' + (cls || '') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 음식 주문 — 일일 한도 체크 후 HP/SP 회복, 데이터 조각 차감
window.orderFood = function(id) {
  if (!useDaily('cafeteria')) {
    addCafLog('[식당] 오늘은 더 이상 주문할 수 없어요!', 'caf-log-err');
    return;
  }
  const item = cafMenu[id];
  if (playerStats.data < item.cost) {
    addCafLog('[실패] 데이터 조각 부족! (필요: ' + item.cost + '개, 보유: ' + playerStats.data + '개)', 'caf-log-err');
    return;
  }
  playerStats.data -= item.cost;
  const hpGain = Math.min(item.hp, playerStats.maxHp - playerStats.hp);
  const spGain = Math.min(item.sp, playerStats.maxSp - playerStats.sp);
  playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + item.hp);
  playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + item.sp);
  syncCafStats(); updateMapStats();
  let msg = '[' + item.name + '] ';
  if (hpGain > 0) msg += 'HP +' + hpGain + ' ';
  if (spGain > 0) msg += 'SP +' + spGain + ' ';
  msg += '· 데이터 조각 -' + item.cost;
  addCafLog(msg, hpGain > 0 ? 'caf-log-hp' : 'caf-log-sp');
}

// ================================================================
// 중앙도서관
// ================================================================

// 과목별 보상과 공부 소요 시간 정의 (수정 가능)
const libSubjects = {
  cs:   { name: '컴퓨터공학', minR: 3, maxR: 6, time: 5000 },
  math: { name: '수학/통계',  minR: 2, maxR: 4, time: 4000 },
  eng:  { name: '영어/교양',  minR: 1, maxR: 3, time: 3000 },
  rest: { name: '휴식',       minR: 0, maxR: 0, time: 3000, isRest: true },
};

// 공부 중 상태 추적 변수
let libStudyCount = 0;    // 오늘 공부한 횟수
let libFocus      = 100;  // 현재 집중력 (공부할수록 감소, 휴식으로 회복)
let libBusy       = false; // 공부 중인지 확인용 (중복 클릭 방지)

// 도서관 입장
window.enterLibrary = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('library-container').classList.add('visible');
  syncLibStats();
}

// 도서관 퇴장
window.leaveLibrary = function() {
  document.getElementById('library-container').classList.remove('visible');
  document.getElementById('game-container').style.display = 'flex';
}

// 도서관 스탯 동기화
function syncLibStats() {
  document.getElementById('lib-data-val').textContent  = playerStats.data;
  document.getElementById('lib-study-count').textContent = libStudyCount;
  document.getElementById('lib-focus-val').textContent = libFocus + '%';
}

// 도서관 로그 추가
function addLibLog(msg, cls) {
  const box = document.getElementById('lib-log');
  box.innerHTML += '<br><span class="' + (cls || '') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 공부 버튼 일괄 비활성화/활성화 (공부 중 중복 클릭 방지)
function setLibButtons(disabled) {
  ['cs', 'math', 'eng', 'rest'].forEach(id => {
    document.getElementById('study-btn-' + id).disabled = disabled;
  });
}

// 공부 시작 — 진행 바 애니메이션 후 데이터 조각 보상 지급
window.startStudy = function(subjectId) {
  if (subjectId !== 'rest' && !useDaily('library')) {  // 휴식 제외하고 일일 한도 체크 
    addLibLog('[도서관] 오늘 공부는 충분히 했어요!', '');
    return;
  }
  if (libBusy) return;
  if (libFocus <= 0 && subjectId !== 'rest') {
    addLibLog('[도서관] 집중력이 바닥났습니다. 먼저 쉬어야 해요!', '');
    return;
  }

  libBusy = true;
  setLibButtons(true);

  const sub = libSubjects[subjectId];
  const btn = document.getElementById('study-btn-' + subjectId);
  btn.classList.add('studying');

  const fill  = document.getElementById('lib-progress-fill');
  const label = document.getElementById('lib-progress-label');
  const pct   = document.getElementById('lib-progress-pct');

  fill.style.width = '0%';
  // TODO : 휴식은 하루 한 번만 가능하도록 구현해주세요.
  label.textContent = sub.isRest ? '😴 휴식 중...' : '📖 ' + sub.name + ' 공부 중...';

  // 진행 바 애니메이션
  const start    = Date.now();
  const interval = setInterval(() => {
    const progress = Math.min(100, (Date.now() - start) / sub.time * 100);
    fill.style.width  = progress + '%';
    pct.textContent   = Math.round(progress) + '%';
    if (progress >= 100) clearInterval(interval);
  }, 50);

  // 공부/휴식 완료 처리
  setTimeout(() => {
    btn.classList.remove('studying');
    fill.style.width = '100%';
    clearInterval(interval);

    if (sub.isRest) {
      // 휴식: 집중력 회복 (TODO : 하루 한 번만 가능하도록 구현하기)
      libFocus = Math.min(100, libFocus + 40);
      addLibLog('[휴식] 집중력 회복! 현재 집중력: ' + libFocus + '%', 'lib-log-info');
    } else {
      // 공부: 집중력에 따라 보상 차등 지급 (수정 가능)
      const focusBonus = libFocus >= 70 ? 1 : libFocus >= 40 ? 0.7 : 0.4;
      const base       = sub.minR + Math.floor(Math.random() * (sub.maxR - sub.minR + 1));
      const reward     = Math.max(1, Math.round(base * focusBonus));
      playerStats.data += reward;
      libStudyCount++;
      libFocus = Math.max(0, libFocus - 25);
      addLibLog('[' + sub.name + '] 완료! 💎 +' + reward + '  (집중력: ' + libFocus + '%)', 'lib-log-reward');
      updateMapStats();
    }

    label.textContent = '완료!';
    pct.textContent   = '';
    fill.style.width  = '0%';
    syncLibStats();
    setLibButtons(false);
    libBusy = false;
  }, sub.time);
}

// ================================================================
// 310관 연구실
// ================================================================

// ── 연구 프로젝트 데이터 ──
const LAB_PROJECTS = {
  'upgrade-hp':   { name: 'HP 강화 연구',      cost: 10, time: 4000, desc: '최대 HP +20' },
  'upgrade-sp':   { name: 'SP 강화 연구',      cost: 8,  time: 3500, desc: '최대 SP +10' },
  'upgrade-atk':  { name: '전투 알고리즘 개발', cost: 15, time: 5000, desc: '전투 데미지 +5' },
  'upgrade-regen':{ name: '회복 프로토콜 연구', cost: 12, time: 4500, desc: '매 턴 HP +5' },
};

let labBusy = false;  // 연구 진행 중 여부

// 연구실 입장
window.enterLab = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('lab-container').classList.add('visible');
  syncLabStats();
  updateLabBadge();
}

// 연구실 퇴장
window.leaveLab = function() {
  document.getElementById('lab-container').classList.remove('visible');
  document.getElementById('game-container').style.display = 'flex';
}

// 연구실 스탯 동기화 — 기존 유지 + 모니터 업데이트 추가
function syncLabStats() {
  document.getElementById('lab-hp-val').textContent   = playerStats.hp;
  document.getElementById('lab-hp-max').textContent   = '/ ' + playerStats.maxHp;
  document.getElementById('lab-sp-val').textContent   = playerStats.sp;
  document.getElementById('lab-sp-max').textContent   = '/ ' + playerStats.maxSp;
  document.getElementById('lab-data-val').textContent = playerStats.data;
  document.getElementById('lab-hp-bar').style.width   = (playerStats.hp / playerStats.maxHp * 100) + '%';
  document.getElementById('lab-sp-bar').style.width   = (playerStats.sp / playerStats.maxSp * 100) + '%';
  const fav = puangState.favorability;
  document.getElementById('lab-favor-val').textContent = getFavorHearts(fav);
  document.getElementById('lab-favor-num').textContent = fav + ' / 100';
}

// 남은 연구 횟수 배지 업데이트
function updateLabBadge() {
  const el = document.getElementById('lab-remain-badge');
  if (el) el.textContent = '오늘 남은 연구 ' + remainDaily('lab') + '회';
}

// 연구실 로그 추가
function addLabLog(msg, cls) {
  const box = document.getElementById('lab-log');
  box.innerHTML += '<br><span class="' + (cls || 'lab-log-info') + '">&gt; ' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// ── 연구 프로젝트 실행 ──
window.startResearch = function(action) {
  if (labBusy) { addLabLog('이미 연구 중입니다!', 'lab-log-warning'); return; }
  if (!useDaily('lab')) { addLabLog('오늘 연구 한도 초과! (일일 2회)', 'lab-log-warning'); updateLabBadge(); return; }

  const proj = LAB_PROJECTS[action];
  if (!proj) return;

  if (playerStats.data < proj.cost) {
    addLabLog('데이터 조각 부족! (필요: ' + proj.cost + '개)', 'lab-log-warning');
    return;
  }

  // 비용 차감
  playerStats.data -= proj.cost;
  labBusy = true;
  updateMapStats();
  addLabLog('[START] ' + proj.name + ' 시작...', 'lab-log-info');

  // 진행 바 애니메이션
  const bar = document.getElementById('lab-bar-' + action);
  if (bar) {
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(100, (Date.now() - start) / proj.time * 100);
      bar.style.width = pct + '%';
      if (pct >= 100) clearInterval(tick);
    }, 50);
  }

  // 완료 처리
  setTimeout(() => {
    doLabAction(action);  // 기존 doLabAction 재활용
    labBusy = false;
    if (bar) bar.style.width = '0%';
    updateLabBadge();
    addLabLog('[DONE] ' + proj.desc + ' 적용 완료!', 'lab-log-save');
  }, proj.time);
}

// ── 연구실 기능 실행 (기존 유지) ──
window.doLabAction = function(action) {
  if (action === 'save') {
    const saveData = { playerStats, puangFav: puangState.favorability, ts: new Date().toLocaleTimeString() };
    localStorage.setItem('cau_save', JSON.stringify(saveData));
    addLabLog('[SAVE] 저장 완료 (' + saveData.ts + ')', 'lab-log-save');
    const header = document.querySelector('#lab-container .lab-header');
    header.classList.remove('save-flash');
    void header.offsetWidth;
    header.classList.add('save-flash');
  }
  else if (action === 'load') {
    const raw = localStorage.getItem('cau_save');
    if (!raw) { addLabLog('[LOAD] 저장 데이터가 없습니다.', 'lab-log-warning'); return; }
    const save = JSON.parse(raw);
    Object.assign(playerStats, save.playerStats);
    puangState.favorability = save.puangFav;
    savePuangState();
    syncLabStats(); updateMapStats();
    addLabLog('[LOAD] 불러오기 완료 (' + save.ts + ')', 'lab-log-save');
  }
  else if (action === 'upgrade-hp') {
    if (playerStats.data < 0) return;  // 이미 startResearch에서 차감됨
    playerStats.maxHp += 20;
    syncLabStats(); updateMapStats();
  }
  else if (action === 'upgrade-sp') {
    if (playerStats.data < 0) return;
    playerStats.maxSp += 10;
    syncLabStats(); updateMapStats();
  }
  else if (action === 'upgrade-atk') {
    if (typeof unionBonusDmg !== 'undefined') unionBonusDmg += 5;
    syncLabStats(); updateMapStats();
  }
  else if (action === 'upgrade-regen') {
    playerStats._regenPerTurn = (playerStats._regenPerTurn || 0) + 5;
    syncLabStats(); updateMapStats();
  }
}

// ================================================================
// 체육관
// ================================================================

// 오늘의 체력 (운동할수록 감소, 휴식으로 회복)
let gymStamina = 100;

// 체육관 입장
window.enterGym = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('gym-container').style.display = 'flex';
  syncGymStats();
}

// 체육관 퇴장
window.leaveGym = function() {
  document.getElementById('gym-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 체육관 스탯 동기화
function syncGymStats() {
  document.getElementById('gym-maxhp-val').textContent   = playerStats.maxHp;
  document.getElementById('gym-stamina-val').textContent = gymStamina + '%';
  document.getElementById('gym-data-val').textContent    = playerStats.data;
}

// 체육관 로그 추가
function addGymLog(msg, color) {
  const box = document.getElementById('gym-log');
  box.innerHTML += '<br><span style="color:' + (color || '#5dcaa5') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 운동 실행 — 데이터 조각/체력 소모 후 최대 HP/SP 영구 증가
window.doGym = function(type) {
  if (type !== 'rest' && !useDaily('gym')) {  // 휴식 제외하고 일일 한도 체크
    addGymLog('[체육관] 오늘은 충분히 훈련했어요! (일일 3회 한도)', '#f09595');
    return;
  }

  if (type === 'rest') {  // 휴식: 체력 50% 회복 (무료)
    gymStamina = Math.min(100, gymStamina + 50);
    addGymLog('[휴식] 체력 회복! 현재 체력: ' + gymStamina + '%', '#a0c4ff');
    syncGymStats();
    return;
  }

  const trains = {  // 운동 종류별 비용/효과 정의
    run:    { cost: 4,  stamina: 20, hpUp: 5,  spUp: 0, name: '달리기' },
    weight: { cost: 8,  stamina: 35, hpUp: 10, spUp: 0, name: '웨이트' },
    yoga:   { cost: 4,  stamina: 15, hpUp: 0,  spUp: 5, name: '요가'   },
  };
  const t = trains[type];

  if (playerStats.data < t.cost) {
    addGymLog('[실패] 데이터 조각 부족 (필요: ' + t.cost + '개)', '#f09595');
    return;
  }

  if (gymStamina < t.stamina) {
    addGymLog('[실패] 체력 부족! 먼저 휴식하세요. (필요: ' + t.stamina + '%)', '#f09595');
    return;
  }

  playerStats.data -= t.cost;
  gymStamina = Math.max(0, gymStamina - t.stamina);
  if (t.hpUp > 0) playerStats.maxHp += t.hpUp;
  if (t.spUp > 0) playerStats.maxSp += t.spUp;
  syncGymStats(); updateMapStats();

  let msg = '[' + t.name + '] 훈련 완료! ';
  if (t.hpUp > 0) msg += '최대 HP +' + t.hpUp + ' → ' + playerStats.maxHp;
  if (t.spUp > 0) msg += '최대 SP +' + t.spUp + ' → ' + playerStats.maxSp;
  addGymLog(msg, '#5dcaa5');
}

// ================================================================
// 의무실
// ================================================================

// 의무실 입장
window.enterClinic = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('clinic-container').style.display = 'flex';
  syncClinicStats();
}

// 의무실 퇴장
window.leaveClinic = function() {
  document.getElementById('clinic-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 의무실 스탯 동기화
function syncClinicStats() {
  document.getElementById('clinic-hp-val').textContent  = playerStats.hp + ' / ' + playerStats.maxHp;
  document.getElementById('clinic-sp-val').textContent  = playerStats.sp + ' / ' + playerStats.maxSp;
  document.getElementById('clinic-data-val').textContent = playerStats.data;
  document.getElementById('clinic-hp-bar').style.width  = (playerStats.hp / playerStats.maxHp * 100) + '%';
  document.getElementById('clinic-sp-bar').style.width  = (playerStats.sp / playerStats.maxSp * 100) + '%';
}

// 의무실 로그 추가
function addClinicLog(msg, color) {
  const box = document.getElementById('clinic-log');
  box.innerHTML += '<br><span style="color:' + (color || '#f09595') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 치료 실행
// hp/sp/full: 데이터 조각 소모 후 완전 회복
window.clinicTreat = function(type) {
  if (type === 'free') {  // free: 하루 1회 무료 응급처치 (HP +15)
    if (!useDaily('clinic')) {
      addClinicLog('[거절] 오늘 무료 응급처치는 이미 사용했습니다.', '#6c8ebf');
      return;
    }
    playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 15);
    addClinicLog('[응급처치] HP +15 회복 (오늘 사용 완료)', '#5dcaa5');
  } 
  
  else if (type === 'hp') {
    if (playerStats.data < 15) { addClinicLog('[실패] 데이터 조각 부족 (필요: 15개)', '#f09595'); return; }
    playerStats.data -= 15;
    playerStats.hp = playerStats.maxHp;
    addClinicLog('[치료] HP 완전 회복! · 데이터 조각 -15', '#5dcaa5');
  } 
  
  else if (type === 'sp') {
    if (playerStats.data < 10) { addClinicLog('[실패] 데이터 조각 부족 (필요: 10개)', '#f09595'); return; }
    playerStats.data -= 10;
    playerStats.sp = playerStats.maxSp;
    addClinicLog('[치료] SP 완전 회복! · 데이터 조각 -10', '#a0c4ff');
  } 
  
  else if (type === 'full') {
    if (playerStats.data < 20) { addClinicLog('[실패] 데이터 조각 부족 (필요: 20개)', '#f09595'); return; }
    playerStats.data -= 20;
    playerStats.hp = playerStats.maxHp;
    playerStats.sp = playerStats.maxSp;
    addClinicLog('[치료] HP + SP 완전 회복! · 데이터 조각 -20', '#5dcaa5');
  }

  syncClinicStats(); updateMapStats();
}

// ================================================================
// 공대 실험실
// ================================================================

// 제조 가능한 아이템 레시피 정의
const craftRecipes = {
  speed:  { name: '집중력 포션', icon: '⚡', cost: 8,  desc: '다음 전투 데미지 +50%' },
  shield: { name: '방어막',      icon: '🛡️', cost: 10, desc: '다음 전투 피해 -50%'  },
  regen:  { name: '재생 포션',   icon: '🌿', cost: 12, desc: '전투 중 매 턴 HP +5'   },
  lucky:  { name: '행운의 시약', icon: '🍀', cost: 6,  desc: '도서관 보상 2배'       },
};

// 공대 실험실 입장
window.enterLab2 = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('lab2-container').style.display = 'flex';
  renderInventory();
}

// 공대 실험실 퇴장
window.leaveLab2 = function() {
  document.getElementById('lab2-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 실험실 로그 추가
function addLab2Log(msg) {
  const box = document.getElementById('lab2-log');
  box.innerHTML += '<br><span style="color:#5dcaa5">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 인벤토리 화면에 보유 아이템 목록 표시
function renderInventory() {
  const el = document.getElementById('inventory-display');
  if (!el) return;
  el.textContent = inventory.length === 0
    ? '없음'
    : inventory.map(i => i.icon + ' ' + i.name).join('  ·  ');
}

// 아이템 제조 — 일일 한도 + 데이터 조각 체크 후 인벤토리에 추가
window.craftItem = function(id) {
  if (!useDaily('lab2')) {
    addLab2Log('[실험실] 오늘 제조는 다 했어요! (일일 3회 한도)');
    return;
  }
  const r = craftRecipes[id];
  if (playerStats.data < r.cost) {
    addLab2Log('[실패] 데이터 조각 부족 (필요: ' + r.cost + '개)');
    return;
  }
  playerStats.data -= r.cost;
  inventory.push({ id, name: r.name, icon: r.icon, desc: r.desc });
  saveInventory(); renderInventory(); updateMapStats();
  addLab2Log('[제조 완료] ' + r.icon + ' ' + r.name + ' 획득! · 데이터 조각 -' + r.cost);
}

// ================================================================
// 중앙 축제
// ================================================================

// 퀴즈 문제 데이터 (중앙대 관련 퀴즈) - TODO : 나중에 문제 추가하거나 변경해주세요.
const quizData = [
  { q: '중앙대학교의 마스코트는?',        choices: ['푸앙이', '파란이', '청룡이', '중앙이'], ans: 0 },
  { q: '중앙대학교가 위치한 구는?',        choices: ['동작구', '관악구', '마포구', '서대문구'], ans: 0 },
  { q: '중앙대학교의 상징 색은?',          choices: ['파란색', '빨간색', '초록색', '노란색'], ans: 0 },
  { q: '블루미르홀은 어떤 건물인가요?',    choices: ['기숙사', '도서관', '강의동', '본관'], ans: 0 },
];

// 현재 진행 중인 퀴즈 (answerQuiz에서 정답 체크 시 사용)
let currentQuiz = null;

// 축제 입장
window.enterFestival = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('festival-container').style.display = 'flex';
  ['quiz-panel', 'janken-panel', 'slot-panel'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}

// 축제 퇴장
window.leaveFestival = function() {
  document.getElementById('festival-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 축제 로그 추가
function addFestivalLog(msg, color) {
  const box = document.getElementById('festival-log');
  box.innerHTML += '<br><span style="color:' + (color || '#ef9f27') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 미니게임 시작 — 일일 한도 체크 후 선택한 게임 패널 표시
window.playFestival = function(game) {
  ['quiz-panel', 'janken-panel', 'slot-panel'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });

  if (!useDaily('festival')) {
    addFestivalLog('[축제] 오늘은 더 이상 게임을 할 수 없어요! (일일 5회 한도)', '#f09595');
    return;
  }

  if (game === 'quiz') {  // 퀴즈: 랜덤 문제 출제
    currentQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    document.getElementById('quiz-question').textContent = currentQuiz.q;
    const choicesEl = document.getElementById('quiz-choices');
    choicesEl.innerHTML = '';
    currentQuiz.choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.textContent = c;
      btn.style.cssText = 'background:#1a1408;border:1px solid #2a2010;border-radius:8px;padding:8px;cursor:pointer;font-family:inherit;color:#e0e0e0;font-size:13px;transition:border-color 0.2s;';
      btn.onmouseover = () => btn.style.borderColor = '#ef9f27';
      btn.onmouseout  = () => btn.style.borderColor = '#2a2010';
      btn.onclick     = () => answerQuiz(i);
      choicesEl.appendChild(btn);
    });
    document.getElementById('quiz-panel').style.display = 'flex';
  } 
  
  else if (game === 'dice') {  // 주사위: 0~10 랜덤 데이터 조각 획득
    const roll = Math.floor(Math.random() * 11);
    playerStats.data += roll; updateMapStats();
    addFestivalLog('[주사위] ' + roll + ' 나왔습니다! 💎 +' + roll, roll >= 7 ? '#5dcaa5' : '#ef9f27');
  } 
  
  else if (game === 'janken') {  // 가위바위보 패널 표시
    document.getElementById('janken-result').textContent = '';
    document.getElementById('janken-panel').style.display = 'flex';
  } 
  
  else if (game === 'slot') {  // 슬롯머신 패널 표시
    document.getElementById('slot-result').textContent = '';
    document.getElementById('slot-panel').style.display = 'flex';
  }
}

// 퀴즈 정답 체크 — 맞으면 💎 +5, 틀리면 정답 공개
window.answerQuiz = function(idx) {
  if (idx === currentQuiz.ans) {
    playerStats.data += 5; updateMapStats();
    addFestivalLog('[퀴즈] 정답! 💎 +5', '#5dcaa5');
  } 
  
  else {
    addFestivalLog('[퀴즈] 오답... 정답은 "' + currentQuiz.choices[currentQuiz.ans] + '"', '#f09595');
  }
  document.getElementById('quiz-panel').style.display = 'none';
}

// 가위바위보 — 이기면 💎 +8, 비기면 0, 지면 0
window.jankenPlay = function(choice) {
  const choices = ['✊', '✌️', '🖐️'];
  const cpu     = choices[Math.floor(Math.random() * 3)];
  const wins    = { '✊': '✌️', '✌️': '🖐️', '🖐️': '✊' };

  let result = '';
  if (choice === cpu) {
    result = '비겼습니다!';
    addFestivalLog('[가위바위보] 나: ' + choice + ' CPU: ' + cpu + ' → 비김', '#6c8ebf');
  } 
  
  else if (wins[choice] === cpu) {
    playerStats.data += 8; updateMapStats();
    result = '이겼습니다! 💎 +8';
    addFestivalLog('[가위바위보] 나: ' + choice + ' CPU: ' + cpu + ' → 승리! 💎 +8', '#5dcaa5');
  } 
  
  else {
    result = '졌습니다...';
    addFestivalLog('[가위바위보] 나: ' + choice + ' CPU: ' + cpu + ' → 패배', '#f09595');
  }
  document.getElementById('janken-result').textContent = result;
}

// 슬롯머신 — 💎 3개 베팅, 결과에 따라 보상 지급
// 777 → +30, 💎💎💎 → +20, 쓰리카인드 → +10, 페어 → +3(본전), 꽝 → -3
async function spinSlot() {
  if (playerStats.data < 3) { addFestivalLog('[슬롯] 데이터 조각 부족 (필요: 3개)', '#f09595'); return; }
  playerStats.data -= 3; updateMapStats();

  const btn     = document.getElementById('slot-btn');
  btn.disabled  = true;
  const symbols = ['🍎', '🍋', '🍇', '⭐', '💎', '7️⃣'];
  const slots   = ['slot-1', 'slot-2', 'slot-3'];
  let results   = [];

  // 각 슬롯 랜덤 애니메이션 후 최종값 결정
  for (let s = 0; s < 3; s++) {
    for (let i = 0; i < 10; i++) {
      document.getElementById(slots[s]).textContent = symbols[Math.floor(Math.random() * symbols.length)];
      await new Promise(r => setTimeout(r, 60));
    }
    const final = symbols[Math.floor(Math.random() * symbols.length)];
    document.getElementById(slots[s]).textContent = final;
    results.push(final);
  }

  // 결과 판정
  let reward = 0, msg = '';
  if (results[0] === results[1] && results[1] === results[2]) {
    if (results[0] === '7️⃣')  { reward = 30; msg = '🎉 JACKPOT! 777! 💎 +30!'; }
    else if (results[0] === '💎') { reward = 20; msg = '💎 대박! 💎💎💎 → +20!'; }
    else                          { reward = 10; msg = '✨ 쓰리 오브 어 카인드! 💎 +10'; }
  } 
  
  else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
    reward = 3; msg = '페어! 💎 +3 (본전)';
  } 
  
  else {
    msg = '꽝... 💎 -3';
  }

  playerStats.data += reward; updateMapStats();
  document.getElementById('slot-result').textContent = msg;
  addFestivalLog('[슬롯] ' + results.join(' ') + ' → ' + msg, reward > 0 ? '#5dcaa5' : '#f09595');
  btn.disabled = false;
}

// ================================================================
// 학생회관
// ================================================================

// 영구 버프 누적 변수 (게임 내내 유지)
let unionBonusDmg   = 0;  // 전투 매뉴얼 구매 시 전투 데미지 +3씩 누적
let unionBonusStudy = 0;  // 집중력 교재 구매 시 도서관 보상 +1씩 누적

// 학생회관 입장
window.enterUnion = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('union-container').style.display = 'flex';
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';
}

// 학생회관 퇴장
window.leaveUnion = function() {
  document.getElementById('union-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

// 학생회관 로그 추가
function addUnionLog(msg, color) {
  const box = document.getElementById('union-log');
  box.innerHTML += '<br><span style="color:' + (color || '#c4a0ff') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// 프리미엄 아이템 구매 — 일일 한도 + 데이터 조각 체크 후 효과 적용
window.buyUnion = function(id) {
  if (!useDaily('union')) {
    addUnionLog('[학생회관] 오늘 구매 한도를 초과했어요! (일일 2회 한도)', '#f09595');
    return;
  }

  const items = {
    puang_doll: { cost: 25, name: '푸앙이 인형' },
    hp_max:     { cost: 20, name: '생명력 결정' },
    exp_boost:  { cost: 30, name: '집중력 교재' },
    battle_str: { cost: 35, name: '전투 매뉴얼' },
  };
  const item = items[id];

  if (playerStats.data < item.cost) {
    addUnionLog('[실패] 데이터 조각 부족 (필요: ' + item.cost + '개)', '#f09595');
    return;
  }

  playerStats.data -= item.cost;
  if      (id === 'puang_doll') { changeFavor(20); addUnionLog('[구매] 푸앙이 인형! 호감도 +20', '#d4537e'); }
  else if (id === 'hp_max')     { playerStats.maxHp += 30; addUnionLog('[구매] 생명력 결정! 최대 HP +30 → ' + playerStats.maxHp, '#5dcaa5'); }
  else if (id === 'exp_boost')  { unionBonusStudy++; addUnionLog('[구매] 집중력 교재! 도서관 보상 +1 영구 적용', '#a0c4ff'); }
  else if (id === 'battle_str') { unionBonusDmg += 3; addUnionLog('[구매] 전투 매뉴얼! 전투 데미지 +3 영구 적용', '#ef9f27'); }
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';
  updateMapStats();
}