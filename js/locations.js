// ================================================================
// locations.js — 각 장소 로직, 새로운 맵 구현시 이 파일에 추가
// 학생식당 / 중앙도서관 / 310관 연구실 / 체육관 /
// 의무실 / 공대 실험실 / 축제 / 학생회관 / 청룡산  (2026.05.06)
// ================================================================

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

  const boss = window.BOSSES[bossId];
  if (!boss) return;

  addMountainLog('[진입] ' + boss.name + ' 과의 전투를 시작합니다!', '#ef9f27');

  setTimeout(() => {  // BOSS DB에서 이미지와 이름 불러온 후 전투 화면으로 전환
    document.getElementById('mountain-container').style.display = 'none';
    document.getElementById('battle-container').classList.add('visible');
    window.initBattle('mountain', bossId);
  }, 1500);  // 1.5초 후 전투 화면으로 전환
}

// ================================================================
// 학생식당
// ================================================================

const cafMenu = {
  rice:    { hp: 20, sp: 10, cost: 3, name: '학식 정식' },
  ramen:   { hp: 10, sp: 20, cost: 2, name: '얼큰 라면' },
  coffee:  { hp:  0, sp: 30, cost: 1, name: '아이스 아메리카노' },
  special: { hp: 40, sp: 20, cost: 6, name: '특선 도시락' },
};

const cafNpcTexts = [
  '어서오세요~ 오늘 뭐 드실래요? 😊',
  '오늘 특선 도시락 강추예요! 맛있거든요 🍱',
  '배고프죠? 얼른 드세요~ 힘내야죠!',
  '커피 한 잔 어때요? SP가 확 올라요 ☕',
];

window.enterCafeteria = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('cafeteria-container').style.display = '';
  document.getElementById('cafeteria-container').classList.add('visible');
  syncCafStats();

  // NPC 랜덤 멘트
  const el = document.getElementById('caf-npc-text');
  if (el) el.textContent = cafNpcTexts[Math.floor(Math.random() * cafNpcTexts.length)];

  // 남은 주문 횟수
  const remain = document.getElementById('caf-remain');
  if (remain) remain.textContent = remainDaily('cafeteria');
}

window.leaveCafeteria = function() {
  document.getElementById('cafeteria-container').classList.remove('visible');
  document.getElementById('cafeteria-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

function syncCafStats() {
  document.getElementById('caf-hp-val').textContent   = playerStats.hp;
  document.getElementById('caf-hp-max').textContent   = playerStats.maxHp;
  document.getElementById('caf-sp-val').textContent   = playerStats.sp;
  document.getElementById('caf-sp-max').textContent   = playerStats.maxSp;
  document.getElementById('caf-data-val').textContent = playerStats.data;
  document.getElementById('caf-hp-bar').style.width   = (playerStats.hp / playerStats.maxHp * 100) + '%';
  document.getElementById('caf-sp-bar').style.width   = (playerStats.sp / playerStats.maxSp * 100) + '%';
}

function addCafLog(msg, cls) {
  const box = document.getElementById('caf-log');
  box.innerHTML += '<br><span class="' + (cls || 'caf-log-ok') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

window.orderFood = function(id) {
  if (!useDaily('cafeteria')) {
    addCafLog('[❌] 오늘은 더 이상 주문할 수 없어요! (일일 3회 한도)', 'caf-log-err');
    const el = document.getElementById('caf-npc-text');
    if (el) el.textContent = '오늘 한도를 다 채우셨어요~ 내일 또 오세요! 😅';
    return;
  }
  const item = cafMenu[id];
  if (playerStats.data < item.cost) {
    addCafLog('[❌] 데이터 조각 부족! (필요: ' + item.cost + '개)', 'caf-log-err');
    return;
  }
  playerStats.data -= item.cost;
  const hpGain = Math.min(item.hp, playerStats.maxHp - playerStats.hp);
  const spGain = Math.min(item.sp, playerStats.maxSp - playerStats.sp);
  playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + item.hp);
  playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + item.sp);
  syncCafStats(); updateMapStats();

  // 남은 횟수 갱신
  const remain = document.getElementById('caf-remain');
  if (remain) remain.textContent = remainDaily('cafeteria');

  // NPC 멘트
  const el = document.getElementById('caf-npc-text');
  if (el) el.textContent = '맛있게 드세요~ 🍽️ 힘내세요!';

  let msg = '[✅ ' + item.name + '] ';
  if (hpGain > 0) msg += 'HP +' + hpGain + ' ';
  if (spGain > 0) msg += 'SP +' + spGain + ' ';
  msg += '· 💎 -' + item.cost;
  addCafLog(msg, hpGain > 0 ? 'caf-log-ok' : 'caf-log-sp');
}

// ================================================================
// 중앙도서관
// ================================================================

// ── 단어 목록 (중앙대 관련) ──
const LIB_WORDS = [
  '푸앙이','청룡호','블루미르','중앙대학교','이면세계',
  '데드라인','학점귀신','블루미르홀','청룡산','동아리',
  '족보','교양','수강신청','과제','시험기간',
  '학생식당','도서관','연구실','체육관','공대',
];

const libNpcTexts = [
  '🤫 조용히 해주세요. 과목을 선택하면 타이핑 게임이 시작돼요!',
  '🤫 5단어 모두 맞추면 💎 6개! 도전해보세요.',
  '🤫 10초 안에 입력해야 해요. 집중하세요!',
  '🤫 오탈자 주의! 정확하게 입력해야 정답이에요.',
];

let libStudyCount  = 0;
let libFocus       = 100;
let libBusy        = false;

// 타이핑 게임 상태
let libTypingWords   = [];
let libTypingIdx     = 0;
let libTypingCorrect = 0;
let libTypingTimer   = null;

window.enterLibrary = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('library-container').style.display = '';
  document.getElementById('library-container').classList.add('visible');
  document.getElementById('lib-select-panel').style.display = 'block';
  document.getElementById('lib-typing-panel').style.display = 'none';
  syncLibStats();
  const el = document.getElementById('lib-npc-text');
  if (el) el.textContent = libNpcTexts[Math.floor(Math.random() * libNpcTexts.length)];
}

window.leaveLibrary = function() {
  if (libTypingTimer) { clearInterval(libTypingTimer); libTypingTimer = null; }
  libBusy = false;
  document.getElementById('library-container').classList.remove('visible');
  document.getElementById('library-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

function syncLibStats() {
  document.getElementById('lib-data-val').textContent    = playerStats.data + '개';
  document.getElementById('lib-study-count').textContent = libStudyCount;
  document.getElementById('lib-focus-val').textContent   = libFocus + '%';
  const bm = document.getElementById('lib-bookmark-fill');
  if (bm) bm.style.width = libFocus + '%';
}

function addLibLog(msg, cls) {
  const box = document.getElementById('lib-log');
  box.innerHTML += '<br><span class="' + (cls || 'lib-log-info') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

window.startStudy = function(subjectId) {
  if (libBusy) return;

  // 휴식
  if (subjectId === 'rest') {
    libFocus = Math.min(100, libFocus + 40);
    syncLibStats();
    addLibLog('[😴 휴식] 집중력 회복! 현재: ' + libFocus + '%', 'lib-log-info');
    const npc = document.getElementById('lib-npc-text');
    if (npc) npc.textContent = '🤫 잘 쉬셨나요? 다시 열심히 해봐요.';
    return;
  }

  if (!useDaily('library')) {
    addLibLog('[❌] 오늘 공부는 충분히 했어요! (일일 5회 한도)', 'lib-log-info');
    return;
  }

  libBusy          = true;
  libTypingIdx     = 0;
  libTypingCorrect = 0;

  // 5개 랜덤 단어 선택
  const shuffled   = [...LIB_WORDS].sort(() => Math.random() - 0.5);
  libTypingWords   = shuffled.slice(0, 5);

  // 화면 전환
  document.getElementById('lib-select-panel').style.display = 'none';
  document.getElementById('lib-typing-panel').style.display = 'block';

  const subjects = { cs: '💻 컴퓨터공학', math: '📐 수학/통계', eng: '🌐 영어/교양' };
  document.getElementById('lib-typing-subject').textContent = subjects[subjectId] || '📚 공부';

  const npc = document.getElementById('lib-npc-text');
  if (npc) npc.textContent = '🤫 빠르고 정확하게 입력하세요!';

  showNextLibWord();
}

function showNextLibWord() {
  if (libTypingIdx >= 5) {
    finishTyping();
    return;
  }

  const word  = libTypingWords[libTypingIdx];
  const input = document.getElementById('lib-typing-input');
  const bar   = document.getElementById('lib-typing-timer-bar');

  document.getElementById('lib-typing-word').textContent     = word;
  document.getElementById('lib-typing-cur').textContent      = libTypingIdx;
  document.getElementById('lib-typing-feedback').textContent = '';
  input.value = '';
  input.focus();

  // 타이머 바 10초
  bar.style.transition = 'none';
  bar.style.width      = '100%';
  setTimeout(() => {
    bar.style.transition = 'width 10s linear';
    bar.style.width      = '0%';
  }, 30);

  if (libTypingTimer) clearInterval(libTypingTimer);
  let timeLeft = 10;
  libTypingTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(libTypingTimer);
      const fb = document.getElementById('lib-typing-feedback');
      fb.textContent = '⏰ 시간 초과! (정답: ' + word + ')';
      fb.style.color = '#ef4444';
      libTypingIdx++;
      setTimeout(showNextLibWord, 900);
    }
  }, 1000);
}

// Enter 키 처리 — DOMContentLoaded에서 한 번만 등록
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('lib-typing-input');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (!libBusy || libTypingIdx >= 5) return;

    clearInterval(libTypingTimer);

    const val     = input.value.trim();
    const correct = libTypingWords[libTypingIdx];
    const fb      = document.getElementById('lib-typing-feedback');

    if (val === correct) {
      libTypingCorrect++;
      fb.textContent = '✅ 정답!';
      fb.style.color = '#059669';
    } else {
      fb.textContent = '❌ 오답 (정답: ' + correct + ')';
      fb.style.color = '#ef4444';
    }
    libTypingIdx++;
    setTimeout(showNextLibWord, 600);
  });
});

function finishTyping() {
  if (libTypingTimer) { clearInterval(libTypingTimer); libTypingTimer = null; }

  document.getElementById('lib-select-panel').style.display = 'block';
  document.getElementById('lib-typing-panel').style.display = 'none';

  // 보상 기준: 5개→6개, 3~4개→3개, 1~2개→1개, 0개→0개
  let reward = 0;
  if      (libTypingCorrect === 5) reward = 6;
  else if (libTypingCorrect >= 3)  reward = 3;
  else if (libTypingCorrect >= 1)  reward = 1;

  playerStats.data += reward;
  libStudyCount++;
  libFocus = Math.max(0, libFocus - 20);
  libBusy  = false;

  addLibLog(
    '[✅ 완료] ' + libTypingCorrect + '/5 정답 → 💎 +' + reward,
    'lib-log-reward'
  );
  syncLibStats();
  updateMapStats();

  const npc = document.getElementById('lib-npc-text');
  if (npc) npc.textContent = libTypingCorrect === 5
    ? '🤫 완벽해요! 💎 ' + reward + '개 획득!'
    : '🤫 수고하셨어요. 💎 ' + reward + '개 획득!';
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
  const labCont = document.getElementById('lab-container');
  labCont.style.display = 'flex';  // 명시적으로 flex로 변경 (display 속성 깨우기)
  labCont.classList.add('visible');
  syncLabStats();
  updateLabBadge();
}

// 연구실 퇴장
window.leaveLab = function() {
  // 310관 컨테이너를 숨김
  const labCont = document.getElementById('lab-container');
  if (labCont) {
    labCont.style.display = 'none';
    labCont.classList.remove('visible');
  }

  // 메인 맵 표시
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

let unionBonusDmg   = 0;
let unionBonusStudy = 0;

const unionNpcTexts = [
  '안녕하세요! 학생회관에 오신 걸 환영합니다 😊<br>오늘도 열심히 활동하시는 모습이 멋지네요!',
  '오늘의 추천 아이템은 <b>생명력 결정</b>이에요!<br>HP를 올려두면 전투에서 훨씬 유리해요 💪',
  '데이터 조각을 모아서 좋은 아이템 챙겨가세요!<br>학생회가 항상 응원합니다 📣',
  '푸앙이 인형은 호감도를 올려줘요!<br>푸앙이랑 친해지면 좋은 일이 생길지도? 🐉',
];

window.enterUnion = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('union-container').style.display = '';
  document.getElementById('union-container').classList.add('visible');
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';

  const npc = document.getElementById('union-npc-text');
  if (npc) npc.innerHTML = unionNpcTexts[Math.floor(Math.random() * unionNpcTexts.length)];
}

window.leaveUnion = function() {
  document.getElementById('union-container').classList.remove('visible');
  document.getElementById('union-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

function addUnionLog(msg, cls) {
  const box = document.getElementById('union-log');
  box.innerHTML += '<br><span class="' + (cls || 'union-log-info') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

function stampItem(id) {
  const el = document.getElementById('union-stamp-' + id);
  if (!el) return;
  el.textContent = '✅';
  el.classList.add('stamped');
  setTimeout(() => { el.classList.remove('stamped'); el.textContent = ''; }, 2000);
}

window.buyUnion = function(id) {
  if (!useDaily('union')) {
    addUnionLog('[❌] 오늘 구매 한도를 초과했어요! (일일 2회)', 'union-log-err');
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
    addUnionLog('[❌] 데이터 조각 부족! (필요: ' + item.cost + '개, 보유: ' + playerStats.data + '개)', 'union-log-err');
    const npc = document.getElementById('union-npc-text');
    if (npc) npc.innerHTML = '앗, 데이터 조각이 부족하네요... 더 모아오세요! 😅';
    return;
  }

  playerStats.data -= item.cost;

  if      (id === 'puang_doll') { changeFavor(20);    addUnionLog('[✅ 승인] 푸앙이 인형 구매! 호감도 +20', 'union-log-ok'); }
  else if (id === 'hp_max')     { playerStats.maxHp += 30; addUnionLog('[✅ 승인] 생명력 결정 구매! 최대 HP +30 → ' + playerStats.maxHp, 'union-log-ok'); }
  else if (id === 'exp_boost')  { unionBonusStudy++;  addUnionLog('[✅ 승인] 집중력 교재 구매! 도서관 보상 +1', 'union-log-ok'); }
  else if (id === 'battle_str') { unionBonusDmg += 3; addUnionLog('[✅ 승인] 전투 매뉴얼 구매! 전투 데미지 +3', 'union-log-ok'); }

  stampItem(id);
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';

  const npc = document.getElementById('union-npc-text');
  if (npc) npc.innerHTML = item.name + ' 구매 완료! 도장 찍어드렸어요 😊';

  updateMapStats();
}

// ================================================================
// 아이템 가게 (편의점)
// ================================================================

const STORE_ITEMS = {
  hp_potion:   { name: 'HP 포션',       cost: 5,  clerk: '체력 회복에 딱이죠~ 많이 사 가세요!' },
  sp_potion:   { name: 'SP 포션',       cost: 4,  clerk: '집중력 포션이에요! 공부할 때 좋아요 😊' },
  full_potion: { name: '풀 회복 포션',  cost: 15, clerk: '저희 가게 최고 인기 상품이에요! ✨' },
  dmg_boost:   { name: '데미지 부스터', cost: 8,  clerk: '전투 전에 꼭 챙겨가세요 💪' },
  shield:      { name: '방어막',        cost: 8,  clerk: '안전이 최우선이죠! 방어막 추천해요 🛡️' },
};

const STORE_CLERK_DEFAULT = [
  '어서오세요~ 필요한 거 있으면 말씀해 주세요!',
  '오늘 날씨 좋죠? 포션 한 병 어떠세요? 😊',
  '이면 세계 탐험 가세요? 미리 준비해두세요!',
  '데이터 조각 많이 모으셨네요! 좋은 거 사 가세요 🎉',
];

window.enterStore = function() {
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('store-container').style.display = '';
  document.getElementById('store-container').classList.add('visible');
  document.getElementById('store-data-val').textContent = playerStats.data;

  const el = document.getElementById('store-clerk-text');
  if (el) el.textContent = STORE_CLERK_DEFAULT[Math.floor(Math.random() * STORE_CLERK_DEFAULT.length)];

  const timeEl = document.getElementById('store-receipt-time');
  if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
}

window.leaveStore = function() {
  document.getElementById('store-container').classList.remove('visible');
  document.getElementById('store-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

function addStoreLog(msg, cls) {
  const box = document.getElementById('store-receipt-body');
  if (!box) return;
  box.innerHTML += '<br><span class="' + (cls || 'store-log-info') + '">' + msg + '</span>';
  const receipt = document.getElementById('store-log');
  if (receipt) receipt.scrollTop = receipt.scrollHeight;
}

window.buyStore = function(id) {
  const item = STORE_ITEMS[id];
  if (!item) return;

  if (playerStats.data < item.cost) {
    addStoreLog('[❌] 데이터 조각 부족! (필요: ' + item.cost + '개, 보유: ' + playerStats.data + '개)', 'store-log-err');
    const el = document.getElementById('store-clerk-text');
    if (el) el.textContent = '앗, 데이터 조각이 부족하네요... 더 모아오세요! 😅';
    return;
  }

  playerStats.data -= item.cost;

  if      (id === 'hp_potion')   { playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 30); }
  else if (id === 'sp_potion')   { playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + 20); }
  else if (id === 'full_potion') { playerStats.hp = playerStats.maxHp; playerStats.sp = playerStats.maxSp; }
  else if (id === 'dmg_boost')   { inventory.push({ id: 'dmg_boost', name: item.name, icon: '🔥', desc: '다음 전투 데미지 +50%' }); saveInventory(); }
  else if (id === 'shield')      { inventory.push({ id: 'shield',    name: item.name, icon: '🛡️', desc: '다음 전투 피해 -50%'  }); saveInventory(); }

  const el = document.getElementById('store-clerk-text');
  if (el) el.textContent = item.clerk;

  addStoreLog('[✅] ' + item.name + ' 구매 완료! · 💎 -' + item.cost + '개', 'store-log-ok');

  document.getElementById('store-data-val').textContent = playerStats.data;
  updateMapStats();
}