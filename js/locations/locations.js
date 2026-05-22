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
  // ★ Fix #9: 이전 전투 화면이 남아있으면 mountain-container와 겹침 — battle-container도 숨기기
  const prevBattle = document.getElementById('battle-container');
  if (prevBattle) {
    prevBattle.style.display = 'none';
    prevBattle.classList.remove('visible');
  }
  document.getElementById('mountain-container').style.display = 'flex';
  document.getElementById('mtn-hp-val').textContent = playerStats.hp;
  // ★ BugFix #20: maxHp 표시 엘리먼트도 갱신 — 원본에 hp만 갱신하던 누락 수정
  //   사이드이펙트: 없음 — 엘리먼트 없으면 조용히 무시
  const mtnHpMax = document.getElementById('mtn-hp-max');
  if (mtnHpMax) mtnHpMax.textContent = playerStats.maxHp;
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

  // ★ Fix 3a: caf_bonus (목요일 요일 보너스) — HP/SP 회복량 +10
  const cafBonus = (window._todayBonusKey === 'caf_bonus') ? 10 : 0;
  // ★ Fix 4a: 날씨 보너스 — _weatherCafBonus (비/눈 올 때 SP 추가 회복)
  const weatherCafBonus = window._weatherCafBonus || 0;

  const hpRaw  = item.hp + cafBonus;
  const spRaw  = item.sp + cafBonus + weatherCafBonus;
  const hpGain = Math.min(hpRaw, playerStats.maxHp - playerStats.hp);
  const spGain = Math.min(spRaw, playerStats.maxSp - playerStats.sp);
  playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + hpRaw);
  playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + spRaw);
  syncCafStats(); 
  if (typeof window.syncAndSave === 'function') window.syncAndSave();

  // 남은 횟수 갱신
  const remain = document.getElementById('caf-remain');
  if (remain) remain.textContent = remainDaily('cafeteria');

  // NPC 멘트
  const el = document.getElementById('caf-npc-text');
  if (el) el.textContent = '맛있게 드세요~ 🍽️ 힘내세요!';

  let msg = '[✅ ' + item.name + '] ';
  if (hpGain > 0) msg += 'HP +' + hpGain + ' ';
  if (spGain > 0) msg += 'SP +' + spGain + ' ';
  if (cafBonus > 0) msg += '[🗓️+' + cafBonus + '] ';
  if (weatherCafBonus > 0) msg += '[🌧️+' + weatherCafBonus + '] ';
  msg += '· 💎 -' + item.cost;
  addCafLog(msg, hpGain > 0 ? 'caf-log-ok' : 'caf-log-sp');
}

// ================================================================
// 중앙도서관 — 단어 타이핑 게임
// ================================================================

const LIB_WORDS = [
  // 기존 단어 (유지)
  '푸앙이','청룡호','블루미르','중앙대학교','이면세계',
  '데드라인','학점귀신','블루미르홀','청룡산','동아리',
  '족보','교양','수강신청','과제','시험기간',
  '학생식당','도서관','연구실','체육관','공대',
  // ★ Fix 9: 단어 풀 대폭 확장 (20→60개)
  '알고리즘','자료구조','운영체제','데이터베이스','컴퓨터구조',
  '프로그래밍','네트워크','인공지능','머신러닝','딥러닝',
  '캡스톤','졸업논문','학위논문','성적증명서','재수강',
  '축제','이면균열','탐험가','학점','출석인정',
  '프로젝트','팀플','발표수업','오픈북','선택과목',
  '전공필수','일반교양','복수전공','부전공','연계전공',
  '학생회','과대표','동아리방','봉사활동','장학금',
  '기말고사','중간고사','레포트','퀴즈','출석체크',
];

const libNpcTexts = [
  '🤫 조용히 해주세요. 과목을 선택하면 타이핑 게임이 시작돼요!',
  '🤫 5단어 모두 맞추면 💎 6개! 도전해보세요.',
  '🤫 10초 안에 입력해야 해요. 집중하세요!',
  '🤫 오탈자 주의! 정확하게 입력해야 정답이에요.',
];

let libStudyCount  = parseInt(localStorage.getItem('libStudyCount')) || 0;
let libFocus       = parseInt(localStorage.getItem('libFocus') ?? '100');
let libBusy        = false;
let libTypingWords = [];
let libTypingIdx   = 0;
let libTypingCorrect = 0;
let libTypingTimer = null;

// ★ BugFix #25: Firebase 로드 완료 후 지역 변수를 최신 localStorage 값으로 동기화하는 헬퍼
//   문제: locations.js 파싱 시 libStudyCount/libFocus가 초기화되지만, 이후
//   loadAllDataFromServer()가 localStorage를 업데이트해도 지역 변수는 그대로 0.
//   해결: enterLibrary 진입 시 항상 localStorage에서 재읽기.
function _syncLibLocalVars() {
  libStudyCount = parseInt(localStorage.getItem('libStudyCount') || '0');
  const rawFocus = localStorage.getItem('libFocus');
  libFocus = rawFocus !== null ? parseInt(rawFocus) : 100;
}

window.enterLibrary = function() {
  const today = new Date().toDateString();  // 날짜가 바뀌었으면 lib 관련 변수도 초기화
  if (localStorage.getItem('libDate') !== today) {
    libStudyCount = 0;
    libFocus = 100;
    localStorage.setItem('libStudyCount', 0);
    localStorage.setItem('libFocus', 100);
    localStorage.setItem('libDate', today);
  } else {
    // ★ BugFix #25: 같은 날이면 Firebase에서 복원된 최신값을 지역변수에 반영
    _syncLibLocalVars();
  }

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
    localStorage.setItem('libFocus', libFocus);
    syncLibStats();
    addLibLog('[😴 휴식] 집중력 회복! 현재: ' + libFocus + '%', 'lib-log-info');
    const npc = document.getElementById('lib-npc-text');
    if (npc) npc.textContent = '🤫 잘 쉬셨나요? 다시 열심히 해봐요.';
    return;
  }

  // ★ BugFix #9: _libStudyIsDouble 플래그를 startStudy 본체 내에서 직접 설정
  //   기존: locations.js 하단의 별도 후킹 래퍼에서 설정 → ui_enhancements.js가 이를 다시
  //   후킹하면 플래그 설정 줄이 실행되지 않을 수 있음.
  //   해결: 원본 함수 내부에서 세팅하여 어떤 후킹 체인에서도 반드시 실행되도록 보장.
  window._libStudyIsDouble = (window._todayBonusKey === 'lib_double');

  if (!useDaily('library')) {
    addLibLog('[❌] 오늘 공부는 충분히 했어요! (일일 5회 한도)', 'lib-log-info');
    return;
  }

  libBusy          = true;
  libTypingIdx     = 0;
  libTypingCorrect = 0;
  libTypingWords   = [...LIB_WORDS].sort(() => Math.random() - 0.5).slice(0, 5);

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
    finishLibTyping();
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

// Enter 키 처리
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

function finishLibTyping() {
  if (libTypingTimer) { clearInterval(libTypingTimer); libTypingTimer = null; }

  document.getElementById('lib-select-panel').style.display = 'block';
  document.getElementById('lib-typing-panel').style.display = 'none';

  // 보상: 5개→6개, 3~4개→3개, 1~2개→1개, 0개→0개
  let reward = 0;
  if      (libTypingCorrect === 5) reward = 6;
  else if (libTypingCorrect >= 3)  reward = 3;
  else if (libTypingCorrect >= 1)  reward = 1;

  // ★ Fix 구멍1: unionBonusStudy(집중력 교재/컴퓨터학회) 도서관 보상 적용
  //   기존: unionBonusStudy 변수가 증가해도 reward 계산에 전혀 반영 안 됨
  //   수정: reward > 0일 때 unionBonusStudy만큼 추가
  if (reward > 0 && (unionBonusStudy || 0) > 0) {
    reward += unionBonusStudy;
    addLibLog('[📚 공부 버프] 집중력 교재 효과 +' + unionBonusStudy + '💎', 'lib-log-reward');
  }

  // ★ Fix 5: _libStudyIsDouble (화요일 도서관 2× 요일 보너스)
  if (reward > 0 && window._libStudyIsDouble) {
    reward *= 2;
    addLibLog('[🗓️ 화요일 2×] 도서관 보너스 적용!', 'lib-log-reward');
  }
  // ★ Fix 4b: 날씨 보너스 — _weatherLibBonus (비/눈 올 때 보상 추가)
  if (reward > 0 && (window._weatherLibBonus || 0) > 0) {
    reward += window._weatherLibBonus;
    addLibLog('[🌧️ 날씨 보너스] +' + window._weatherLibBonus + '💎 추가!', 'lib-log-reward');
  }

  playerStats.data += reward;
  libStudyCount++;
  libFocus = Math.max(0, libFocus - 20);
  libBusy  = false;

  // 새로고침해도 유지되도록 localStorage에 저장
  localStorage.setItem('libStudyCount', libStudyCount);
  localStorage.setItem('libFocus', libFocus);

  addLibLog('[✅ 완료] ' + libTypingCorrect + '/5 정답 → 💎 +' + reward, 'lib-log-reward');
  syncLibStats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();

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

// 코드 디버깅 퀴즈 문제
const LAB_QUIZ_BANK = [
  { q: '다음 코드의 버그는?\nfor(i=0; i<10; i--)',            choices:['i-- → i++','i=0 → i=1','i<10 → i>10','세미콜론 누락'], ans:0 },
  { q: '재할당 불가능한 변수 선언 방법은?',                    choices:['let','var','const','function'], ans:2 },
  { q: '올바른 배열 선언은?',                                  choices:['arr={1,2,3}','arr=[1,2,3]','arr=(1,2,3)','arr=<1,2,3>'], ans:1 },
  { q: 'null과 undefined의 차이는?',                           choices:['같다','null은 의도적 없음, undefined는 선언만','undefined가 null 포함','모두 0과 같다'], ans:1 },
  { q: 'querySelector("#id")와 같은 결과를 내는 것은?',        choices:['getElementsByClass','getElementById','getElementByTag','getAllElements'], ans:1 },
  { q: '비동기 처리 방법이 아닌 것은?',                        choices:['async/await','Promise','Callback','for loop'], ans:3 },
  { q: 'JSON.parse()의 반대 함수는?',                          choices:['JSON.convert()','JSON.stringify()','JSON.encode()','JSON.toString()'], ans:1 },
  { q: 'localStorage에 데이터 저장 메서드는?',                 choices:['localStorage.save()','localStorage.put()','localStorage.setItem()','localStorage.store()'], ans:2 },
];

let labPendingAction = null;

// ── 연구 프로젝트 실행 — 퀴즈 먼저 ──
window.startResearch = function(action) {
  if (labBusy) { addLabLog('이미 연구 중입니다!', 'lab-log-warning'); return; }
  if (!useDaily('lab')) { addLabLog('오늘 연구 한도 초과! (일일 2회)', 'lab-log-warning'); updateLabBadge(); return; }

  const proj = LAB_PROJECTS[action];
  if (!proj) return;

  if (playerStats.data < proj.cost) {
    addLabLog('데이터 조각 부족! (필요: ' + proj.cost + '개)', 'lab-log-warning');
    return;
  }

  // 퀴즈 먼저! (한도/비용은 정답 후 차감)
  labPendingAction = action;
  showLabQuiz();
}

function showLabQuiz() {
  const q     = LAB_QUIZ_BANK[Math.floor(Math.random() * LAB_QUIZ_BANK.length)];
  const panel = document.getElementById('lab-quiz-panel');
  if (!panel) { proceedResearch(labPendingAction); return; }

  panel.style.display = 'flex';
  document.getElementById('lab-quiz-q').textContent = q.q;
  const choicesEl = document.getElementById('lab-quiz-choices');
  choicesEl.innerHTML = '';
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.style.cssText = 'background:#070d07;border:1px solid #1a3a1a;border-radius:6px;padding:8px 10px;cursor:pointer;font-family:Courier New,monospace;font-size:11px;color:#c0e0c0;text-align:left;';
    btn.onmouseover = () => { btn.style.borderColor = '#4dff88'; btn.style.background = '#0d1f0d'; };
    btn.onmouseout  = () => { btn.style.borderColor = '#1a3a1a'; btn.style.background = '#070d07'; };
    btn.onclick     = () => answerLabQuiz(i, q.ans);
    choicesEl.appendChild(btn);
  });
  addLabLog('[QUIZ] 연구 전 코드 디버깅 퀴즈를 풀어야 해요!', 'lab-log-info');
}

window.answerLabQuiz = function(idx, ans) {
  const panel = document.getElementById('lab-quiz-panel');
  if (panel) panel.style.display = 'none';

  if (idx === ans) {
    addLabLog('[QUIZ] 정답! 연구를 시작합니다.', 'lab-log-save');
    proceedResearch(labPendingAction);
  } else {
    addLabLog('[QUIZ] 오답! 연구가 취소됐어요. 데이터 조각은 소모되지 않았어요.', 'lab-log-warning');
    // 한도 복구
    if (dailyUsage['lab'] > 0) dailyUsage['lab']--;
    updateLabBadge();
  }
  labPendingAction = null;
}

function proceedResearch(action) {
  const proj = LAB_PROJECTS[action];
  playerStats.data -= proj.cost;
  labBusy = true;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addLabLog('[START] ' + proj.name + ' 시작...', 'lab-log-info');

  const bar = document.getElementById('lab-bar-' + action);
  if (bar) {
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(100, (Date.now() - start) / proj.time * 100);
      bar.style.width = pct + '%';
      if (pct >= 100) clearInterval(tick);
    }, 50);
  }

  setTimeout(() => {
    doLabAction(action);
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
    syncLabStats();
    if (typeof window.syncAndSave === 'function') window.syncAndSave(); 
    addLabLog('[LOAD] 불러오기 완료 (' + save.ts + ')', 'lab-log-save');
  }
  else if (action === 'upgrade-hp') {
    if (playerStats.data < 0) return;  // 이미 startResearch에서 차감됨
    playerStats.maxHp += 20;
    syncLabStats();
    if (typeof window.syncAndSave === 'function') window.syncAndSave();  
  }
  else if (action === 'upgrade-sp') {
    if (playerStats.data < 0) return;
    playerStats.maxSp += 10;
    syncLabStats(); 
    if (typeof window.syncAndSave === 'function') window.syncAndSave(); 
  }
  else if (action === 'upgrade-atk') {
    if (typeof unionBonusDmg !== 'undefined') unionBonusDmg += 5;
    playerStats.unionBonusDmg = unionBonusDmg;  // playerStats에 저장
    syncLabStats(); 
    if (typeof window.syncAndSave === 'function') window.syncAndSave(); 
  }
  else if (action === 'upgrade-regen') {
    playerStats._regenPerTurn = (playerStats._regenPerTurn || 0) + 5;
    syncLabStats(); 
    if (typeof window.syncAndSave === 'function') window.syncAndSave(); 
  }
}

// ================================================================
// 체육관
// ================================================================

// ── 체육관 — 버튼 순서 기억 미니게임 ──
let gymCurrentMode  = null;
let gymSequence     = [];
let gymPlayerSeq    = [];
let gymShowingSeq   = false;
const GYM_COLORS    = ['🔴','🔵','🟢','🟡'];

window.enterGym = function() {
  document.getElementById('game-container').style.display = 'none';

  // map.js가 style.display='none' 인라인으로 설정하므로 setTimeout으로 덮어씀
  setTimeout(() => {
    const gymEl = document.getElementById('gym-container');
    gymEl.style.display = 'flex';
    gymEl.classList.add('visible');
    syncGymStats();

    // UI 초기화
    document.getElementById('gym-select-panel').style.display = 'block';
    document.getElementById('gym-game-panel').style.display = 'none';
    document.getElementById('gym-input-btns').style.display = 'none';
    document.getElementById('gym-game-status').textContent = '';
    document.getElementById('gym-game-title').textContent = '버튼 순서를 기억하세요!';
    document.getElementById('gym-log').innerHTML = '<span>[체육관] 훈련 종목을 선택하고 미니게임을 클리어하세요!</span>';

    // 시퀀스 박스 초기화
    for (let i = 0; i < 4; i++) {
      const el = document.getElementById('gym-seq-' + i);
      if (el) el.textContent = '❓';
    }

    // 상태 변수 초기화
    gymSequence   = [];
    gymPlayerSeq  = [];
    gymShowingSeq = false;
  }, 0);
}

window.leaveGym = function() {
  const gymEl = document.getElementById('gym-container');
  gymEl.classList.remove('visible');
  gymEl.style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

function syncGymStats() {
  document.getElementById('gym-maxhp-val').textContent  = playerStats.maxHp;
  document.getElementById('gym-maxsp-val').textContent  = playerStats.maxSp;
  document.getElementById('gym-data-val').textContent   = playerStats.data;
  document.getElementById('gym-remain-val').textContent = remainDaily('gym') + '회';
}

function addGymLog(msg, color) {
  const box = document.getElementById('gym-log');
  box.innerHTML += '<br><span style="color:' + (color || '#5dcaa5') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

window.doGymRest = function() {
  playerStats.hp = playerStats.maxHp;
  playerStats.sp = playerStats.maxSp;
  updateMapStats();
  addGymLog('[💤 휴식] HP/SP 완전 회복!', '#a0c4ff');
}

window.startGymGame = function(mode) {
  if (!useDaily('gym')) {
    addGymLog('[❌] 오늘 훈련 한도 초과! (일일 3회)', '#f09595');
    syncGymStats();
    return;
  }
  const costs = { run: 4, weight: 8, yoga: 4 };
  // ★ Fix 3b: gym_discount (월요일 요일 보너스) — 비용 -1
  const gymDiscount = (window._todayBonusKey === 'gym_discount') ? 1 : 0;
  const finalCost = Math.max(0, costs[mode] - gymDiscount);
  if (playerStats.data < finalCost) {
    addGymLog('[❌] 데이터 조각 부족! (필요: ' + finalCost + '개)', '#f09595');
    return;
  }
  if (gymDiscount > 0) addGymLog('[🗓️ 월요일 할인] 비용 -1!', '#5dcaa5');
  playerStats.data -= finalCost;
  gymCurrentMode = mode;
  gymSequence    = [];
  gymPlayerSeq   = [];
  updateMapStats();
  syncGymStats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();

  document.getElementById('gym-select-panel').style.display = 'none';
  document.getElementById('gym-game-panel').style.display = 'flex';
  document.getElementById('gym-input-btns').style.display = 'none';

  const names = { run: '달리기 🏃', weight: '웨이트 🏋️', yoga: '요가 🧘' };
  document.getElementById('gym-game-title').textContent = names[mode] + ' — 순서를 기억하세요!';

  for (let i = 0; i < 4; i++) gymSequence.push(Math.floor(Math.random() * 4));
  showGymSequence();
}

function showGymSequence() {
  gymShowingSeq = true;
  document.getElementById('gym-game-status').textContent = '👀 순서를 기억하세요...';
  for (let i = 0; i < 4; i++) document.getElementById('gym-seq-' + i).textContent = '❓';

  let idx = 0;
  const iv = setInterval(() => {
    if (idx > 0) document.getElementById('gym-seq-' + (idx-1)).textContent = '❓';
    if (idx < gymSequence.length) {
      document.getElementById('gym-seq-' + idx).textContent = GYM_COLORS[gymSequence[idx]];
      idx++;
    } else {
      clearInterval(iv);
      if (idx > 0) document.getElementById('gym-seq-' + (idx-1)).textContent = '❓';
      gymShowingSeq = false;
      gymPlayerSeq  = [];
      document.getElementById('gym-game-title').textContent = '이제 순서대로 눌러보세요!';
      document.getElementById('gym-game-status').textContent = '0 / 4 입력';
      document.getElementById('gym-input-btns').style.display = 'flex';
    }
  }, 700);
}

window.gymInputBtn = function(colorIdx) {
  if (gymShowingSeq) return;
  gymPlayerSeq.push(colorIdx);
  const cur = gymPlayerSeq.length - 1;
  document.getElementById('gym-game-status').textContent = gymPlayerSeq.length + ' / 4 입력';

  if (gymPlayerSeq[cur] !== gymSequence[cur]) {
    document.getElementById('gym-game-title').textContent = '❌ 틀렸어요!';
    document.getElementById('gym-game-status').textContent = '정답: ' + gymSequence.map(i => GYM_COLORS[i]).join(' ');
    document.getElementById('gym-input-btns').style.display = 'none';
    addGymLog('[❌] 훈련 실패! 데이터 조각만 소모됐어요.', '#f09595');
    setTimeout(() => {
      document.getElementById('gym-select-panel').style.display = 'block';
      document.getElementById('gym-game-panel').style.display = 'none';
    }, 1500);
    return;
  }

  if (gymPlayerSeq.length === 4) {
    document.getElementById('gym-game-title').textContent = '🎉 성공!';
    document.getElementById('gym-input-btns').style.display = 'none';
    const mode = gymCurrentMode;
    if      (mode === 'run')    { playerStats.maxHp += 5;  addGymLog('[🏃 달리기] 성공! 최대 HP +5 → ' + playerStats.maxHp, '#5dcaa5'); }
    else if (mode === 'weight') { playerStats.maxHp += 10; addGymLog('[🏋️ 웨이트] 성공! 최대 HP +10 → ' + playerStats.maxHp, '#5dcaa5'); }
    else if (mode === 'yoga')   { playerStats.maxSp += 5;  addGymLog('[🧘 요가] 성공! 최대 SP +5 → ' + playerStats.maxSp, '#5dcaa5'); }
    syncGymStats();
    if (typeof window.syncAndSave === 'function') window.syncAndSave();

    setTimeout(() => {
      document.getElementById('gym-select-panel').style.display = 'block';
      document.getElementById('gym-game-panel').style.display = 'none';
    }, 1500);
  }
}

// ================================================================
// 의무실
// ================================================================

// 의무실 입장
window.enterClinic = function() {
  document.getElementById('game-container').style.display = 'none';
  const clinicEl = document.getElementById('clinic-container');
  clinicEl.style.display = 'flex';
  clinicEl.classList.add('visible');
  syncClinicStats();
}

// 의무실 퇴장
window.leaveClinic = function() {
  const clinicEl2 = document.getElementById('clinic-container');
  clinicEl2.style.display = 'none';
  clinicEl2.classList.remove('visible');
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
  syncLab2Stats();
  resetLab2();
}

window.leaveLab2 = function() {
  document.getElementById('lab2-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

function syncLab2Stats() {
  document.getElementById('lab2-data-val').textContent   = playerStats.data;
  document.getElementById('lab2-inv-count').textContent  = inventory.length + '개';
  document.getElementById('lab2-remain-val').textContent = remainDaily('lab2') + '회';
  renderInventory();
}

function addLab2Log(msg) {
  const box = document.getElementById('lab2-log');
  box.innerHTML += '<br><span style="color:#5dcaa5">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

function renderInventory() {
  const el = document.getElementById('inventory-display');
  if (!el) return;
  el.textContent = inventory.length === 0 ? '없음' : inventory.map(i => i.icon + ' ' + i.name).join('  ·  ');
}

// 재료 조합 레시피
const LAB2_RECIPES = [
  { materials: ['fire','water','leaf'],   result: { id:'regen',  name:'재생 포션',   icon:'🌿', desc:'전투 중 매 턴 HP +5' }},
  { materials: ['fire','gear','crystal'], result: { id:'speed',  name:'집중력 포션', icon:'⚡', desc:'다음 전투 데미지 +50%' }},
  { materials: ['water','leaf','star'],   result: { id:'lucky',  name:'행운의 시약', icon:'🍀', desc:'도서관 보상 2배' }},
  { materials: ['crystal','gear','star'], result: { id:'shield', name:'방어막',       icon:'🛡️', desc:'다음 전투 피해 -50%' }},
];
const LAB2_EMOJI = { fire:'🔥', water:'💧', leaf:'🌿', crystal:'💎', gear:'⚙️', star:'⭐' };
let lab2Selected = [];

function resetLab2() {
  lab2Selected = [];
  updateLab2Slots();
  ['fire','water','leaf','crystal','gear','star'].forEach(id => {
    const btn = document.getElementById('mat-' + id);
    if (btn) { btn.style.borderColor = '#2e1a5e'; btn.style.background = '#0d0720'; btn.classList.remove('selected'); }
  });
}

function updateLab2Slots() {
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById('lab2-slot-' + i);
    if (!el) continue;
    el.textContent = lab2Selected[i] ? LAB2_EMOJI[lab2Selected[i]] : '?';
    el.style.borderColor = lab2Selected[i] ? '#c4a0ff' : '#2e1a5e';
  }
  const btn = document.getElementById('lab2-craft-btn');
  if (btn) { btn.disabled = lab2Selected.length < 3; btn.style.opacity = lab2Selected.length < 3 ? '0.4' : '1'; }
}

window.selectMaterial = function(matId) {
  const btn = document.getElementById('mat-' + matId);
  if (lab2Selected.includes(matId)) {
    lab2Selected = lab2Selected.filter(m => m !== matId);
    if (btn) { btn.style.borderColor = '#2e1a5e'; btn.style.background = '#0d0720'; btn.classList.remove('selected'); }
  } else if (lab2Selected.length < 3) {
    lab2Selected.push(matId);
    if (btn) { btn.style.borderColor = '#c4a0ff'; btn.style.background = '#1a0a3a'; btn.classList.add('selected'); }
  }
  updateLab2Slots();
}

window.craftByRecipe = function() {
  if (lab2Selected.length < 3) return;
  if (!useDaily('lab2')) { addLab2Log('[❌] 오늘 제조 한도 초과! (일일 3회)'); syncLab2Stats(); return; }
  if (playerStats.data < 5) { addLab2Log('[❌] 데이터 조각 부족! (최소 5개 필요)'); return; }

  const sorted  = [...lab2Selected].sort();
  const matched = LAB2_RECIPES.find(r => [...r.materials].sort().join() === sorted.join());
  playerStats.data -= 5;

  if (matched) {
    inventory.push(matched.result);
    saveInventory();
    addLab2Log('[✅ 조합 성공!] ' + matched.result.icon + ' ' + matched.result.name + ' 제조! · 💎 -5');
  } else {
    addLab2Log('[💥 실패] 알 수 없는 조합... 재료가 낭비됐어요. · 💎 -5');
  }
  syncLab2Stats(); updateMapStats(); resetLab2();
}

// 기존 craftItem 호환
window.craftItem = function(id) { addLab2Log('[안내] 이제 재료를 직접 선택해서 조합하세요!'); }

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
  const festEl = document.getElementById('festival-container');
  festEl.style.display = 'flex';
  festEl.classList.add('visible');
  ['quiz-panel', 'janken-panel', 'slot-panel'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}

// 축제 퇴장
window.leaveFestival = function() {
  const festEl2 = document.getElementById('festival-container');
  festEl2.style.display = 'none';
  festEl2.classList.remove('visible');
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
    playerStats.data += roll;
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
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
    // ★ Fix 4c: 날씨 보너스 — _weatherFestBonus
    const festWBonus2 = window._weatherFestBonus || 0;
    const quizReward = 5 + festWBonus2;
    playerStats.data += quizReward;
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    addFestivalLog('[퀴즈] 정답! 💎 +' + quizReward + (festWBonus2 > 0 ? ' [☀️+' + festWBonus2 + ']' : ''), '#5dcaa5');
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
    // ★ Fix 4c: 날씨 보너스 — _weatherFestBonus (맑은 날 축제 보상 +3)
    const festWBonus = window._weatherFestBonus || 0;
    const jankenReward = 8 + festWBonus;
    playerStats.data += jankenReward;
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    result = '이겼습니다! 💎 +' + jankenReward + (festWBonus > 0 ? ' [☀️+' + festWBonus + ']' : '');
    addFestivalLog('[가위바위보] 나: ' + choice + ' CPU: ' + cpu + ' → 승리! 💎 +' + jankenReward, '#5dcaa5');
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
  playerStats.data -= 3;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();

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
  // ★ Fix 1: _slotLucky 버프 — "행운아" 스킬 해금 시 꽝이 나오면 강제로 페어로 상향
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
    // ★ Fix 1: _slotLucky 활성이면 꽝 → 페어로 상향 (꽝 확률 절반 효과)
    if (playerStats._slotLucky && Math.random() < 0.5) {
      reward = 3; msg = '🍀 행운아 발동! 꽝 → 페어! 💎 +3';
      addFestivalLog('[🍀 행운아] 꽝을 페어로 구했어요!', '#1d9e75');
    } else {
      msg = '꽝... 💎 -3';
    }
  }

  // ★ Fix 7b: data_bonus (토요일 요일 보너스) — 슬롯 보상에도 +2
  if (reward > 0 && window._todayBonusKey === 'data_bonus') {
    reward += 2;
    msg += ' [🗓️+2]';
  }
  playerStats.data += reward;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  document.getElementById('slot-result').textContent = msg;
  addFestivalLog('[슬롯] ' + results.join(' ') + ' → ' + msg, reward > 0 ? '#5dcaa5' : '#f09595');
  btn.disabled = false;
}

// ================================================================
// 학생회관
// ================================================================

// 영구 버프 적용
let unionBonusDmg   = playerStats.unionBonusDmg   || 0;
let unionBonusStudy = playerStats.unionBonusStudy || 0;

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
  else if (id === 'exp_boost')  { unionBonusStudy++;  playerStats.unionBonusStudy = unionBonusStudy; addUnionLog('[✅ 승인] 집중력 교재 구매! 도서관 보상 +1', 'union-log-ok'); }
  else if (id === 'battle_str') { 
    unionBonusDmg += 3; 
    playerStats.unionBonusDmg = unionBonusDmg;      // playerStats에 저장
    addUnionLog('[✅ 승인] 전투 매뉴얼 구매! 전투 데미지 +3', 'union-log-ok'); 
  }

  stampItem(id);
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';

  const npc = document.getElementById('union-npc-text');
  if (npc) npc.innerHTML = item.name + ' 구매 완료! 도장 찍어드렸어요 😊';

  if (typeof window.syncAndSave === 'function') window.syncAndSave();
}

// 뽑기
const GACHA_TABLE = {
  common: [
    { name: 'HP 포션',        icon: '🧪', effect: () => { playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 30); } },
    { name: 'SP 포션',        icon: '💧', effect: () => { playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + 20); } },
    { name: '데이터 조각 +3', icon: '💎', effect: () => { playerStats.data += 3; } },
  ],
  rare: [
    { name: '방어막',      icon: '🛡️', effect: () => { inventory.push({ id:'shield', name:'방어막',       icon:'🛡️', desc:'다음 전투 피해 -50%'   }); saveInventory(); } },
    { name: '집중력 포션', icon: '⚡', effect: () => { inventory.push({ id:'speed',  name:'집중력 포션', icon:'⚡', desc:'다음 전투 데미지 +50%' }); saveInventory(); } },
    { name: '최대 HP +10', icon: '❤️', effect: () => { playerStats.maxHp += 10; } },
  ],
  legend: [
    { name: '최대 HP +30', icon: '💖', effect: () => { playerStats.maxHp += 30; } },
    { name: '최대 SP +20', icon: '💫', effect: () => { playerStats.maxSp += 20; } },
    { name: '푸앙이 인형', icon: '🐉', effect: () => { changeFavor(30); } },
  ],
};

window.doGacha = function() {
  if (playerStats.data < 3) {
    addUnionLog('[❌] 데이터 조각 부족! (뽑기 비용: 3개)', 'union-log-err');
    return;
  }
  playerStats.data -= 3;
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';

  const rand = Math.random() * 100;
  let grade, pool;
  if      (rand < 10) { grade = '🌟 전설'; pool = GACHA_TABLE.legend; }
  else if (rand < 40) { grade = '💜 희귀'; pool = GACHA_TABLE.rare;   }
  else if (rand < 90) { grade = '⚪ 일반'; pool = GACHA_TABLE.common;  }
  else                { grade = '💨 꽝';   pool = null; }

  if (pool) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    item.effect();
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    const cls = grade.includes('전설') ? 'union-log-legend' : grade.includes('희귀') ? 'union-log-rare' : 'union-log-ok';
    addUnionLog('[🎰 뽑기] ' + grade + ' — ' + item.icon + ' ' + item.name + ' 획득!', cls);
    const npc = document.getElementById('union-npc-text');
    if (npc) npc.innerHTML = grade.includes('전설') ? '🎉 전설!! 정말 운이 좋으시네요!' : item.icon + ' ' + item.name + ' 획득!';
  } else {
    addUnionLog('[🎰 뽑기] 💨 꽝... 아쉽네요!', 'union-log-info');
    const npc = document.getElementById('union-npc-text');
    if (npc) npc.innerHTML = '아쉽지만 다음엔 좋은 결과가 있을 거예요! 😅';
  }
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
  // ★ BugFix #18: 주간 신상품 아이템을 STORE_ITEMS에 등록 — 미등록 시 buyStore()에서 STORE_ITEMS[id] undefined로 구매 불가
  //   getStoreNewItem()이 반환하는 id와 일치하는 키로 등록.
  //   사이드이펙트: getStoreStock()의 STORE_STOCK_LIMIT에 없어 재고 무제한이지만, 신상품은 의도적으로 주 1회 제한이므로 별도 구매 처리.
  mem_potion:  { name: '기억력 포션', cost: 10, clerk: '공부 전에 딱이에요! 🧠' },
  cloak:       { name: '투명 망토',   cost: 18, clerk: '이면세계 탐험가 필수템! 🫥' },
  charm:       { name: '청룡 부적',   cost: 12, clerk: '위기의 순간 당신을 지켜줘요 🧧' },
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
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
}

// ================================================================
// ★ 신규 기능 추가 (기존 코드 유지, 아래에 추가만)
// ================================================================

// ================================================================
// 학생식당 — 신규: 오늘의 메뉴 / 세트 보너스 / 단골카드 / 과식 패널티
// ================================================================

// 오늘의 메뉴: 날짜 기반 랜덤 메뉴명 (매일 바뀜, Groq 없이도 동작)
const CAF_DAILY_MENUS = [
  { name: '청룡 돼지갈비 정식',  bonus: { hp: 10 }, tag: '오늘의 특선' },
  { name: '이면세계 순두부찌개', bonus: { sp: 10 }, tag: '교수님 추천' },
  { name: '블루미르 비빔밥',     bonus: { hp: 5, sp: 5 }, tag: '인기 메뉴' },
  { name: '푸앙이 제육볶음',     bonus: { hp: 15 }, tag: '학식 최강' },
  { name: '데드라인 곱창전골',   bonus: { sp: 15 }, tag: '야식 특선' },
  { name: '청룡산 삼겹 보쌈',    bonus: { hp: 8, sp: 8 }, tag: '등산객 추천' },
];

// 오늘 날짜 기준으로 하루 1개 메뉴 고정
function getTodaySpecial() {
  const seed = new Date().toDateString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CAF_DAILY_MENUS[seed % CAF_DAILY_MENUS.length];
}

// 단골 카드: cafeteria 누적 방문 횟수 (dailyUsage와 별도로 localStorage에 영구 저장)
function getCafVisitTotal() {
  return parseInt(localStorage.getItem('cafVisitTotal') || '0');
}
function addCafVisitTotal() {
  const v = getCafVisitTotal() + 1;
  localStorage.setItem('cafVisitTotal', v);
  return v;
}

// 단골 무료 식권 여부
function hasCafFreeTicket() {
  return localStorage.getItem('cafFreeTicket') === 'true';
}
function useCafFreeTicket() {
  localStorage.setItem('cafFreeTicket', 'false');
}
function checkCafFreeTicket(total) {
  // 5회마다 무료 식권 1장 지급
  if (total % 5 === 0) {
    localStorage.setItem('cafFreeTicket', 'true');
    addCafLog('[🎫 단골 카드] 5회 달성! 무료 식권 1장이 생겼어요!', 'caf-log-reward');
    const npc = document.getElementById('caf-npc-text');
    if (npc) npc.textContent = '단골 손님이시네요! 무료 식권 드릴게요 🎫';
  }
}

// 과식 패널티 플래그 (이면세계 탐험/전투에서 체크용)
window.getCafOvereatPenalty = function() {
  return localStorage.getItem('cafOvereat') === 'true';
};
window.clearCafOvereatPenalty = function() {
  localStorage.removeItem('cafOvereat');
};

// 오늘의 특선 주문 (별도 버튼)
window.orderTodaySpecial = function() {
  const special = getTodaySpecial();
  const cost = 5;

  // 단골 무료 식권 체크
  const useFree = hasCafFreeTicket();

  if (!useFree && playerStats.data < cost) {
    addCafLog('[❌] 데이터 조각 부족! (필요: ' + cost + '개)', 'caf-log-err');
    return;
  }
  if (!useDaily('cafeteria')) {
    addCafLog('[❌] 오늘은 더 이상 주문할 수 없어요! (일일 3회 한도)', 'caf-log-err');
    return;
  }

  if (useFree) {
    useCafFreeTicket();
    addCafLog('[🎫] 무료 식권 사용!', 'caf-log-ok');
  } else {
    playerStats.data -= cost;
  }

  // 보너스 적용
  let msg = '[✅ 오늘의 특선: ' + special.name + '] ';
  if (special.bonus.hp) {
    const gain = Math.min(special.bonus.hp, playerStats.maxHp - playerStats.hp);
    playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + special.bonus.hp);
    msg += 'HP +' + gain + ' ';
  }
  if (special.bonus.sp) {
    const gain = Math.min(special.bonus.sp, playerStats.maxSp - playerStats.sp);
    playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + special.bonus.sp);
    msg += 'SP +' + gain + ' ';
  }
  if (!useFree) msg += '· 💎 -' + cost;

  // 과식 체크: HP가 이미 90% 이상인데 또 먹으면
  if (playerStats.hp >= playerStats.maxHp * 0.9) {
    localStorage.setItem('cafOvereat', 'true');
    addCafLog('[😵 과식 패널티] 너무 많이 드셨어요! 다음 전투 속도 -10% 적용됩니다...', 'caf-log-err');
  }

  // 단골 카드 누적
  const total = addCafVisitTotal();
  checkCafFreeTicket(total);

  syncCafStats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addCafLog(msg, 'caf-log-ok');

  const remain = document.getElementById('caf-remain');
  if (remain) remain.textContent = remainDaily('cafeteria');

  // 단골 카운터 UI 갱신
  updateCafLoyaltyUI();

  const npc = document.getElementById('caf-npc-text');
  if (npc) npc.textContent = special.name + ' 맛있게 드세요~ 🍽️';
};

// 세트 메뉴 보너스: 특정 2가지 조합 주문 기록
// cafComboLog에 오늘 먹은 메뉴 id 기록, 조합 감지 시 보너스
const CAF_COMBOS = [
  { items: ['rice', 'coffee'],   bonus: { sp: 10 }, name: '밥+커피 세트' },
  { items: ['ramen', 'special'], bonus: { hp: 20 }, name: '라면+특선 세트' },
];

function checkCafCombo(orderedId) {
  let log = JSON.parse(sessionStorage.getItem('cafComboLog') || '[]');
  log.push(orderedId);
  sessionStorage.setItem('cafComboLog', JSON.stringify(log));

  for (const combo of CAF_COMBOS) {
    const matched = combo.items.every(id => log.includes(id));
    const alreadyUsed = sessionStorage.getItem('cafCombo_' + combo.items.join('_'));
    if (matched && !alreadyUsed) {
      sessionStorage.setItem('cafCombo_' + combo.items.join('_'), '1');
      if (combo.bonus.hp) playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + combo.bonus.hp);
      if (combo.bonus.sp) playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + combo.bonus.sp);
      addCafLog('[🍱 세트 보너스! ' + combo.name + '] HP+' + (combo.bonus.hp || 0) + ' SP+' + (combo.bonus.sp || 0), 'caf-log-ok');
      const npc = document.getElementById('caf-npc-text');
      if (npc) npc.textContent = '세트 메뉴 할인 적용! 보너스 드려요 😊';
    }
  }
}

// 기존 orderFood를 감싸서 세트/단골 체크 주입 (원본 함수는 그대로)
const _origOrderFood = window.orderFood;
window.orderFood = function(id) {
  _origOrderFood(id);
  checkCafCombo(id);
  const total = addCafVisitTotal();
  checkCafFreeTicket(total);
  updateCafLoyaltyUI();
};

// 단골 카드 UI 갱신
function updateCafLoyaltyUI() {
  const el = document.getElementById('caf-loyalty-count');
  if (!el) return;
  const total = getCafVisitTotal();
  const progress = total % 5;
  el.textContent = progress + '/5';
  const bar = document.getElementById('caf-loyalty-bar');
  if (bar) bar.style.width = (progress / 5 * 100) + '%';
  const ticket = document.getElementById('caf-ticket-badge');
  if (ticket) ticket.style.display = hasCafFreeTicket() ? 'inline-block' : 'none';
}

// enterCafeteria 후크: 신규 UI 초기화
const _origEnterCafeteria = window.enterCafeteria;
window.enterCafeteria = function() {
  _origEnterCafeteria();
  // 오늘의 특선 메뉴 표시
  const special = getTodaySpecial();
  const tagEl = document.getElementById('caf-special-tag');
  const nameEl = document.getElementById('caf-special-name');
  const bonusEl = document.getElementById('caf-special-bonus');
  if (tagEl)   tagEl.textContent  = special.tag;
  if (nameEl)  nameEl.textContent = special.name;
  if (bonusEl) bonusEl.textContent = (special.bonus.hp ? 'HP +' + special.bonus.hp + ' ' : '') + (special.bonus.sp ? 'SP +' + special.bonus.sp : '');
  // 단골 UI
  updateCafLoyaltyUI();
  // 과식 경고
  const ovEl = document.getElementById('caf-overeat-warn');
  if (ovEl) ovEl.style.display = window.getCafOvereatPenalty() ? 'block' : 'none';
};


// ================================================================
// 중앙도서관 — 신규: 전공 분야 / 집중모드 2x / 도서 대출 / 열람실 만석
// ================================================================

// 전공 분야별 패시브 버프 저장 (playerStats 확장)
function getLibMajorBuff() {
  return playerStats.libMajorBuff || null; // 'cs'|'math'|'eng'|'art'
}

// 전공 선택 (한번 선택하면 유지, 재선택 가능)
window.selectLibMajor = function(major) {
  const majorNames = { cs:'💻 컴퓨터공학', math:'📐 수학/통계', eng:'🌐 영어/교양', art:'🎨 예체능' };
  playerStats.libMajorBuff = major;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addLibLog('[전공 선택] ' + majorNames[major] + ' 집중! 해당 전공 공부 시 보상 +2', 'lib-log-reward');
  updateLibMajorUI();
};

function updateLibMajorUI() {
  const el = document.getElementById('lib-major-badge');
  if (!el) return;
  const majorNames = { cs:'💻 CS', math:'📐 수학', eng:'🌐 영어', art:'🎨 예체능' };
  const m = getLibMajorBuff();
  el.textContent = m ? majorNames[m] + ' 전공 중' : '전공 미선택';
  el.style.opacity = m ? '1' : '0.5';
}

// 집중 모드: 타이핑 정확도 80% 이상이면 보상 2×
// finishLibTyping 후크로 처리
const _origFinishLibTyping = window.finishLibTyping;
// finishLibTyping은 내부 함수라 직접 후킹 대신 startStudy 래핑
const _origStartStudy = window.startStudy;
window.startStudy = function(subjectId) {
  // 전공 일치 여부 기억
  window._libCurrentSubject = subjectId;
  _origStartStudy(subjectId);
};

// 도서 대출 시스템
const LIB_BOOKS = [
  { id: 'book_focus',   name: '초집중 전략서',    icon: '📕', effect: 'study_x2',   desc: '대출 중: 공부 보상 2배 (3일)', days: 3 },
  { id: 'book_hp',      name: '운동 생리학 교재', icon: '📗', effect: 'hp_regen',   desc: '대출 중: 매 장소 입장 시 HP +5 (2일)', days: 2 },
  { id: 'book_battle',  name: '전략 전술 교범',   icon: '📘', effect: 'battle_dmg', desc: '대출 중: 전투 데미지 +5 (2일)', days: 2 },
];

function getLibBorrowedBooks() {
  return JSON.parse(localStorage.getItem('libBorrowedBooks') || '[]');
}
function saveLibBorrowedBooks(books) {
  localStorage.setItem('libBorrowedBooks', JSON.stringify(books));
  if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Firebase 동기화
}

window.borrowBook = function(bookId) {
  const book = LIB_BOOKS.find(b => b.id === bookId);
  if (!book) return;

  // 이미 대출 중인지 확인
  const borrowed = getLibBorrowedBooks();
  const existing = borrowed.find(b => b.id === bookId);
  if (existing) {
    addLibLog('[📚 이미 대출 중] ' + book.name + ' (반납일: ' + existing.dueDate + ')', 'lib-log-info');
    return;
  }

  // 대출 처리
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + book.days);
  borrowed.push({ id: bookId, name: book.name, icon: book.icon, effect: book.effect, dueDate: dueDate.toDateString() });
  saveLibBorrowedBooks(borrowed);

  addLibLog('[📚 대출 완료] ' + book.icon + ' ' + book.name + ' (반납 기한: ' + dueDate.toLocaleDateString() + ')', 'lib-log-reward');
  updateLibBorrowUI();
};

window.returnBook = function(bookId) {
  let borrowed = getLibBorrowedBooks();
  const book = borrowed.find(b => b.id === bookId);
  if (!book) return;
  borrowed = borrowed.filter(b => b.id !== bookId);
  saveLibBorrowedBooks(borrowed);
  addLibLog('[📚 반납 완료] ' + book.icon + ' ' + book.name, 'lib-log-info');
  updateLibBorrowUI();
};

// 대출 효과 체크 (외부에서도 호출 가능)
window.hasLibEffect = function(effectId) {
  const today = new Date().toDateString();
  const borrowed = getLibBorrowedBooks();
  // 만료된 책 자동 제거
  const valid = borrowed.filter(b => new Date(b.dueDate) >= new Date(today));
  if (valid.length !== borrowed.length) saveLibBorrowedBooks(valid);
  return valid.some(b => b.effect === effectId);
};

function updateLibBorrowUI() {
  const el = document.getElementById('lib-borrow-list');
  if (!el) return;
  const borrowed = getLibBorrowedBooks();
  const today = new Date();
  if (borrowed.length === 0) {
    el.innerHTML = '<span style="color:#888;font-size:12px;">대출 중인 책 없음</span>';
    return;
  }
  el.innerHTML = borrowed.map(b => {
    const due = new Date(b.dueDate);
    const expired = due < today;
    return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:4px 0;">
      <span>${b.icon}</span>
      <span style="flex:1;color:${expired ? '#f09595' : '#c0e0c0'}">${b.name} ${expired ? '(만료)' : '(' + due.toLocaleDateString() + '까지)'}</span>
      <button onclick="returnBook('${b.id}')" style="background:transparent;border:1px solid #444;border-radius:4px;padding:2px 6px;color:#aaa;cursor:pointer;font-size:10px;">반납</button>
    </div>`;
  }).join('');
}

// 열람실 만석 시스템 (15% 확률)
function checkLibraryFull() {
  if (Math.random() < 0.15) {
    addLibLog('[😤 열람실 만석!] 오늘은 자리가 없어요... 야외 공부로 대신합니다. 보상 -1', 'lib-log-info');
    // 야외 공부: 보상 절반, 횟수는 소모
    if (!useDaily('library')) return false;
    const reward = 1;
    playerStats.data += reward;
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    addLibLog('[🌳 야외 공부] 나무 그늘에서 공부! 💎 +' + reward, 'lib-log-info');
    syncLibStats();
    return true; // 만석 처리됨 → 정규 공부 중단
  }
  return false;
}

// startStudy 추가 래핑: 전공 보너스 + 만석 + 도서 효과
const _origStartStudy2 = window.startStudy;
window.startStudy = function(subjectId) {
  if (subjectId === 'rest') { _origStartStudy2(subjectId); return; }
  if (checkLibraryFull()) return; // 만석이면 중단 (useDaily는 내부에서 소모)
  // 일반 공부 진행 (원본 함수가 useDaily 처리)
  window._libCurrentSubject = subjectId;
  _origStartStudy2(subjectId);
  updateLibMajorUI();
  updateLibBorrowUI();
};

// finishLibTyping 완료 후 전공/도서 보너스 적용을 위해 lib-log 모니터링 대신
// enterLibrary 후크
const _origEnterLibrary = window.enterLibrary;
window.enterLibrary = function() {
  _origEnterLibrary();
  updateLibMajorUI();
  updateLibBorrowUI();
  // HP 리젠 도서 효과
  if (window.hasLibEffect('hp_regen')) {
    const gain = Math.min(5, playerStats.maxHp - playerStats.hp);
    if (gain > 0) {
      playerStats.hp += gain;
      addLibLog('[📗 운동 생리학 교재] 입장 시 HP +' + gain, 'lib-log-reward');
      syncLibStats();
    }
  }
};


// ================================================================
// 310관 연구실 — 신규: 세이브 슬롯 3개 / 업적 / 일지 / 스킬트리
// ================================================================

// ── 세이브 슬롯 3개 ──
window.saveToSlot = function(slot) {
  const name = prompt('세이브 이름을 입력하세요 (슬롯 ' + slot + '):', '탐험 기록 ' + slot) || ('슬롯 ' + slot);
  const saveData = {
    name,
    playerStats: { ...playerStats },
    puangFav: puangState.favorability,
    ts: new Date().toLocaleString(),
  };
  localStorage.setItem('cau_save_slot_' + slot, JSON.stringify(saveData));
  addLabLog('[SAVE] 슬롯 ' + slot + ' "' + name + '" 저장 완료 (' + saveData.ts + ')', 'lab-log-save');
  updateLabSlotsUI();
  if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Firebase 동기화
};

window.loadFromSlot = function(slot) {
  const raw = localStorage.getItem('cau_save_slot_' + slot);
  if (!raw) { addLabLog('[LOAD] 슬롯 ' + slot + '에 저장된 데이터가 없습니다.', 'lab-log-warning'); return; }
  const save = JSON.parse(raw);
  if (!confirm('슬롯 ' + slot + ' "' + save.name + '" 불러오기? (현재 상태가 덮어씌워집니다)')) return;
  Object.assign(playerStats, save.playerStats);
  puangState.favorability = save.puangFav;
  savePuangState();
  syncLabStats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addLabLog('[LOAD] 슬롯 ' + slot + ' "' + save.name + '" 불러오기 완료 (' + save.ts + ')', 'lab-log-save');
};

function updateLabSlotsUI() {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('lab-slot-info-' + i);
    if (!el) continue;
    const raw = localStorage.getItem('cau_save_slot_' + i);
    if (raw) {
      const s = JSON.parse(raw);
      el.textContent = '"' + s.name + '" — ' + s.ts;
      el.style.color = '#5dcaa5';
    } else {
      el.textContent = '비어 있음';
      el.style.color = '#555';
    }
  }
}

// ── 업적 시스템 ──
const LAB_ACHIEVEMENTS = [
  { id: 'first_battle',  name: '첫 전투',         desc: '이면세계 첫 전투 승리',         check: () => (playerStats._battleWins || 0) >= 1,  reward: 5  },
  { id: 'study_10',      name: '공부벌레',         desc: '도서관 공부 10회 달성',          check: () => libStudyCount >= 10,                   reward: 8  },
  { id: 'visit_all',     name: '탐험가',           desc: '모든 장소 1번씩 방문',           check: () => (playerStats._visitedAll || false),    reward: 15 },
  { id: 'favor_80',      name: '푸앙이 친구',      desc: '푸앙이 호감도 80 이상',          check: () => puangState.favorability >= 80,         reward: 10 },
  { id: 'data_100',      name: '데이터 부자',      desc: '데이터 조각 100개 이상 보유',    check: () => playerStats.data >= 100,               reward: 0  },
];

window.checkAchievements = function() {
  const earned = JSON.parse(localStorage.getItem('labAchievements') || '[]');
  let newOnes = [];
  for (const ach of LAB_ACHIEVEMENTS) {
    if (!earned.includes(ach.id) && ach.check()) {
      earned.push(ach.id);
      newOnes.push(ach);
      if (ach.reward > 0) {
        playerStats.data += ach.reward;
        if (typeof window.syncAndSave === 'function') window.syncAndSave();
      }
      addLabLog('[🏆 업적 달성!] ' + ach.name + ' — ' + ach.desc + (ach.reward ? ' (💎 +' + ach.reward + ')' : ''), 'lab-log-save');
    }
  }
  localStorage.setItem('labAchievements', JSON.stringify(earned));
  if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Firebase 동기화
  updateLabAchievementsUI();
  return newOnes;
};

function updateLabAchievementsUI() {
  const el = document.getElementById('lab-achievements-list');
  if (!el) return;
  const earned = JSON.parse(localStorage.getItem('labAchievements') || '[]');
  el.innerHTML = LAB_ACHIEVEMENTS.map(a => {
    const done = earned.includes(a.id);
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;opacity:${done ? 1 : 0.4}">
      <span>${done ? '🏆' : '⬜'}</span>
      <span style="flex:1;font-size:12px;color:${done ? '#5dcaa5' : '#aaa'}">${a.name}</span>
      <span style="font-size:11px;color:#888">${a.desc}</span>
      ${a.reward ? '<span style="font-size:11px;color:#ef9f27">💎+' + a.reward + '</span>' : ''}
    </div>`;
  }).join('');
}

// ── 오늘의 일지 (Groq 생성) ──
window.generateLabDiary = async function() {
  if (!GROQ_API_KEY) { addLabLog('[일지] API 키가 없습니다.', 'lab-log-warning'); return; }

  const summary = `오늘 데이터 조각: ${playerStats.data}개, HP: ${playerStats.hp}/${playerStats.maxHp}, ` +
    `푸앙이 호감도: ${puangState.favorability}, 도서관 공부: ${libStudyCount}회`;

  addLabLog('[일지] 오늘의 탐험 기록을 작성 중...', 'lab-log-info');
  const el = document.getElementById('lab-diary-content');
  if (el) el.textContent = '생성 중...';

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        messages: [{
          role: 'system',
          content: '너는 중앙대 RPG 게임의 일지 작가야. 플레이어의 오늘 활동을 2~3문장으로 요약한 일기를 한국어로 써줘. 게임 분위기에 맞게 재미있게 작성해.'
        }, {
          role: 'user',
          content: '오늘 활동: ' + summary
        }]
      })
    });
    const data = await res.json();
    const diary = data.choices[0].message.content;
    if (el) el.textContent = diary;
    addLabLog('[일지] 오늘의 탐험 기록 완성!', 'lab-log-save');
  } catch(e) {
    if (el) el.textContent = '일지 작성에 실패했어요.';
    addLabLog('[일지] 생성 실패: ' + e.message, 'lab-log-warning');
  }
};

// ── 스킬 트리 (누적 탐험 횟수 기반) ──
const LAB_SKILLS = [
  { id: 'skill_tough',    name: '강인한 체력',   req: 5,  desc: '최대 HP +15',       apply: () => { playerStats.maxHp += 15; } },
  { id: 'skill_smart',    name: '두뇌 회전',     req: 10, desc: '도서관 타이핑 시간 +3초', apply: () => { playerStats._libTimeBonus = (playerStats._libTimeBonus || 0) + 3; } },
  { id: 'skill_lucky',    name: '행운아',        req: 20, desc: '슬롯머신 꽝 확률 절반', apply: () => { playerStats._slotLucky = true; } },
  { id: 'skill_veteran',  name: '베테랑 탐험가', req: 30, desc: '전투 보상 +2',      apply: () => { playerStats._battleBonusReward = (playerStats._battleBonusReward || 0) + 2; } },
];

window.unlockSkill = function(skillId) {
  const skill = LAB_SKILLS.find(s => s.id === skillId);
  if (!skill) return;

  const unlocked = JSON.parse(localStorage.getItem('labSkills') || '[]');
  if (unlocked.includes(skillId)) { addLabLog('[스킬] 이미 해금된 스킬입니다.', 'lab-log-warning'); return; }

  const explorations = playerStats._explorationCount || 0;
  if (explorations < skill.req) {
    addLabLog('[스킬] 탐험 횟수 부족! (필요: ' + skill.req + '회, 현재: ' + explorations + '회)', 'lab-log-warning');
    return;
  }

  skill.apply();
  unlocked.push(skillId);
  localStorage.setItem('labSkills', JSON.stringify(unlocked));
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addLabLog('[✨ 스킬 해금!] ' + skill.name + ' — ' + skill.desc, 'lab-log-save');
  updateLabSkillUI();
};

function updateLabSkillUI() {
  const el = document.getElementById('lab-skill-list');
  if (!el) return;
  const unlocked = JSON.parse(localStorage.getItem('labSkills') || '[]');
  const explorations = playerStats._explorationCount || 0;
  el.innerHTML = LAB_SKILLS.map(s => {
    const done    = unlocked.includes(s.id);
    const canUnlock = !done && explorations >= s.req;
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #1a3a1a;">
      <span style="font-size:14px">${done ? '✅' : canUnlock ? '🔓' : '🔒'}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:${done ? '#5dcaa5' : '#ccc'}">${s.name}</div>
        <div style="font-size:10px;color:#888">${s.desc} · 탐험 ${s.req}회 필요</div>
      </div>
      ${canUnlock ? `<button onclick="unlockSkill('${s.id}')" style="background:#0d1f0d;border:1px solid #4dff88;border-radius:4px;padding:3px 8px;color:#4dff88;cursor:pointer;font-size:10px;">해금</button>` : ''}
    </div>`;
  }).join('');
}

// enterLab 후크
const _origEnterLab = window.enterLab;
window.enterLab = function() {
  _origEnterLab();
  updateLabSlotsUI();
  updateLabAchievementsUI();
  updateLabSkillUI();
  window.checkAchievements();
};


// ================================================================
// 체육관 — 신규: 트레이닝 루틴 선택 / 연속 방문 보너스 / 체육대회
// ================================================================

// 연속 방문 보너스
function checkGymStreak() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('gymLastVisit');
  let streak = parseInt(localStorage.getItem('gymStreak') || '0');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastVisit === yesterday.toDateString()) {
    streak++;
  } else if (lastVisit !== today) {
    streak = 1;
  }
  localStorage.setItem('gymStreak', streak);
  localStorage.setItem('gymLastVisit', today);
  if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Firebase 동기화

  if (streak > 0 && streak % 3 === 0) {
    playerStats.maxHp += 5;
    addGymLog('[🔥 연속 방문 보너스!] ' + streak + '일 연속 방문! 최대 HP +5 → ' + playerStats.maxHp, '#ef9f27');
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
  }

  const el = document.getElementById('gym-streak-val');
  if (el) el.textContent = streak + '일 연속';
}

// 트레이닝 루틴: 근력/지구력/민첩 3종 (기존 run/weight/yoga와 별개로 추가 효과)
const GYM_ROUTINES = {
  strength:  { name: '💪 근력 트레이닝', desc: '최대 HP +8, 전투 데미지 +2', cost: 6 },
  endurance: { name: '🏃 지구력 훈련',  desc: '최대 SP +8, 탐험 중 HP 리젠 +1', cost: 5 },
  agility:   { name: '⚡ 민첩 훈련',    desc: '전투 선공 확률 +10%', cost: 5 },
};

window.doGymRoutine = function(routineId) {
  const routine = GYM_ROUTINES[routineId];
  if (!routine) return;
  if (!useDaily('gym')) { addGymLog('[❌] 오늘 훈련 한도 초과! (일일 3회)', '#f09595'); syncGymStats(); return; }
  if (playerStats.data < routine.cost) { addGymLog('[❌] 데이터 조각 부족! (필요: ' + routine.cost + '개)', '#f09595'); return; }

  playerStats.data -= routine.cost;

  if (routineId === 'strength') {
    playerStats.maxHp += 8;
    playerStats.unionBonusDmg = (playerStats.unionBonusDmg || 0) + 2;
    addGymLog('[💪 근력] 최대 HP +8 → ' + playerStats.maxHp + ', 전투 데미지 +2', '#5dcaa5');
  } else if (routineId === 'endurance') {
    playerStats.maxSp += 8;
    playerStats._regenPerTurn = (playerStats._regenPerTurn || 0) + 1;
    addGymLog('[🏃 지구력] 최대 SP +8 → ' + playerStats.maxSp + ', 리젠 +1', '#5dcaa5');
  } else if (routineId === 'agility') {
    playerStats._agilityBonus = (playerStats._agilityBonus || 0) + 10;
    addGymLog('[⚡ 민첩] 선공 확률 +10% (누적: ' + playerStats._agilityBonus + '%)', '#5dcaa5');
  }

  syncGymStats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
};

// 체육대회 미니게임 (주 1회: 월요일 체크)
function isGymEventDay() {
  return new Date().getDay() === 1; // 월요일
}
function hasPlayedGymEvent() {
  return localStorage.getItem('gymEventWeek') === getWeekKey();
}
function getWeekKey() {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return d.getFullYear() + '-W' + week;
}

window.playGymEvent = function() {
  if (!isGymEventDay()) { addGymLog('[체육대회] 체육대회는 매주 월요일에 열려요!', '#a0c4ff'); return; }
  if (hasPlayedGymEvent()) { addGymLog('[체육대회] 이번 주 체육대회는 이미 참가했어요.', '#a0c4ff'); return; }

  // 간단한 점수 계산 (체력 기반 + 랜덤)
  const score = Math.floor(Math.random() * 50) + Math.floor(playerStats.maxHp / 5);
  let rank, reward;
  if (score >= 70)       { rank = '🥇 1등'; reward = 20; }
  else if (score >= 50)  { rank = '🥈 2등'; reward = 12; }
  else if (score >= 30)  { rank = '🥉 3등'; reward = 6;  }
  else                   { rank = '참가상';  reward = 2;  }

  playerStats.data += reward;
  localStorage.setItem('gymEventWeek', getWeekKey());
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  syncGymStats();
  addGymLog('[🎽 체육대회] 점수: ' + score + '점 → ' + rank + ' 💎 +' + reward, '#ef9f27');
};

// enterGym 후크
const _origEnterGym = window.enterGym;
window.enterGym = function() {
  _origEnterGym();
  setTimeout(() => {
    checkGymStreak();
    // 체육대회 버튼 상태 갱신
    const evBtn = document.getElementById('gym-event-btn');
    if (evBtn) {
      const canPlay = isGymEventDay() && !hasPlayedGymEvent();
      evBtn.style.opacity = canPlay ? '1' : '0.4';
      evBtn.textContent = isGymEventDay()
        ? (hasPlayedGymEvent() ? '🎽 체육대회 (완료)' : '🎽 체육대회 참가!')
        : '🎽 체육대회 (월요일 개최)';
    }
  }, 50);
};


// ================================================================
// 의무실 — 신규: 상태이상 치료 / 예방접종 / 보험 / 처방전
// ================================================================

// 상태이상 시스템
const STATUS_EFFECTS = {
  poison:   { name: '중독',   icon: '🤢', desc: '매 전투 턴 HP -3', color: '#5dcaa5' },
  fatigue:  { name: '피로',   icon: '😴', desc: '전투 데미지 -30%', color: '#a0c4ff' },
  fracture: { name: '골절',   icon: '🦴', desc: '이동 불가, 최대 HP -20', color: '#f09595' },
  curse:    { name: '저주',   icon: '💀', desc: '데이터 조각 획득 -50%', color: '#c084fc' },
};

window.getStatusEffects = function() {
  return playerStats.statusEffects || [];
};
window.addStatusEffect = function(id) {
  if (!playerStats.statusEffects) playerStats.statusEffects = [];
  if (!playerStats.statusEffects.includes(id)) {
    playerStats.statusEffects.push(id);
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
  }
};
window.removeStatusEffect = function(id) {
  if (!playerStats.statusEffects) return;
  playerStats.statusEffects = playerStats.statusEffects.filter(s => s !== id);
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
};
window.hasStatusEffect = function(id) {
  return (playerStats.statusEffects || []).includes(id);
};

window.clinicCureStatus = function(statusId) {
  const costs = { poison: 8, fatigue: 6, fracture: 15, curse: 20 };
  const cost = costs[statusId];
  if (!cost) return;
  if (!window.hasStatusEffect(statusId)) { addClinicLog('[치료] 해당 상태이상이 없습니다.', '#6c8ebf'); return; }
  if (playerStats.data < cost) { addClinicLog('[실패] 데이터 조각 부족 (필요: ' + cost + '개)', '#f09595'); return; }

  playerStats.data -= cost;
  window.removeStatusEffect(statusId);
  const effect = STATUS_EFFECTS[statusId];
  addClinicLog('[완치] ' + effect.icon + ' ' + effect.name + ' 제거 완료! · 💎 -' + cost, '#5dcaa5');
  syncClinicStats();
  updateClinicStatusUI();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
};

// 예방접종 (1일 유지, 특정 속성 피해 30% 감소)
window.getVaccineBuff = function() {
  const data = JSON.parse(localStorage.getItem('clinicVaccine') || 'null');
  if (!data) return null;
  if (new Date(data.expires) < new Date()) { localStorage.removeItem('clinicVaccine'); return null; }
  return data;
};

window.clinicVaccinate = function(type) {
  const costs = { battle: 12, status: 10 };
  const names = { battle: '전투 피해 경감 주사', status: '상태이상 내성 주사' };
  const cost = costs[type];
  if (playerStats.data < cost) { addClinicLog('[실패] 데이터 조각 부족 (필요: ' + cost + '개)', '#f09595'); return; }

  playerStats.data -= cost;
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);
  localStorage.setItem('clinicVaccine', JSON.stringify({ type, expires: expires.toISOString() }));
  addClinicLog('[💉 접종 완료] ' + names[type] + ' · 24시간 유지 · 💎 -' + cost, '#5dcaa5');
  syncClinicStats();
  updateClinicVaccineUI();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
};

// 보험 시스템 (전투 사망 시 부활)
window.getClinicInsurance = function() {
  return localStorage.getItem('clinicInsurance') === 'true';
};
window.clinicBuyInsurance = function() {
  if (window.getClinicInsurance()) { addClinicLog('[보험] 이미 보험에 가입되어 있어요.', '#6c8ebf'); return; }
  if (playerStats.data < 25) { addClinicLog('[실패] 데이터 조각 부족 (필요: 25개)', '#f09595'); return; }
  playerStats.data -= 25;
  localStorage.setItem('clinicInsurance', 'true');
  addClinicLog('[🛡️ 보험 가입] 전투 사망 시 HP 30으로 부활! · 💎 -25', '#5dcaa5');
  syncClinicStats();
  updateClinicInsuranceUI();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
};
// 보험 사용 (전투에서 호출)
window.useClinicInsurance = function() {
  if (!window.getClinicInsurance()) return false;
  localStorage.removeItem('clinicInsurance');
  playerStats.hp = 30;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  return true;
};

// 처방전 시스템: 특수 회복 아이템 처방
window.clinicPrescription = function() {
  if (!useDaily('clinic')) { addClinicLog('[처방전] 오늘 처방전은 이미 사용했어요.', '#6c8ebf'); return; }
  if (playerStats.data < 8) { addClinicLog('[처방전] 데이터 조각 부족 (필요: 8개)', '#f09595'); return; }
  playerStats.data -= 8;

  // 현재 상태에 맞는 처방
  let item;
  if (playerStats.hp < playerStats.maxHp * 0.4) {
    item = { id: 'rx_hp', name: '처방 HP 회복약', icon: '💊', desc: 'HP +50 즉시 회복' };
  } else if (playerStats.sp < playerStats.maxSp * 0.4) {
    item = { id: 'rx_sp', name: '처방 SP 회복약', icon: '🔵', desc: 'SP +40 즉시 회복' };
  } else if ((playerStats.statusEffects || []).length > 0) {
    item = { id: 'rx_cure', name: '만능 해독제', icon: '🧬', desc: '모든 상태이상 제거' };
  } else {
    item = { id: 'rx_boost', name: '처방 강화제', icon: '⚕️', desc: '다음 전투 데미지 +30%' };
  }

  inventory.push(item);
  saveInventory();
  addClinicLog('[📋 처방전] ' + item.icon + ' ' + item.name + ' 지급! · 💎 -8', '#5dcaa5');
  syncClinicStats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
};

function updateClinicStatusUI() {
  const el = document.getElementById('clinic-status-list');
  if (!el) return;
  const effects = window.getStatusEffects();
  if (effects.length === 0) {
    el.innerHTML = '<span style="color:#5dcaa5;font-size:12px;">✅ 상태이상 없음</span>';
    return;
  }
  el.innerHTML = effects.map(id => {
    const e = STATUS_EFFECTS[id];
    if (!e) return '';
    const costs = { poison: 8, fatigue: 6, fracture: 15, curse: 20 };
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
      <span>${e.icon}</span>
      <span style="flex:1;font-size:12px;color:${e.color}">${e.name} — ${e.desc}</span>
      <button onclick="clinicCureStatus('${id}')" style="background:transparent;border:1px solid #f09595;border-radius:4px;padding:2px 6px;color:#f09595;cursor:pointer;font-size:10px;">치료 💎${costs[id]}</button>
    </div>`;
  }).join('');
}

function updateClinicVaccineUI() {
  const el = document.getElementById('clinic-vaccine-status');
  if (!el) return;
  const v = window.getVaccineBuff();
  el.textContent = v ? '💉 ' + (v.type === 'battle' ? '전투 피해 경감' : '상태이상 내성') + ' 접종 중' : '접종 없음';
  el.style.color = v ? '#5dcaa5' : '#888';
}

function updateClinicInsuranceUI() {
  const el = document.getElementById('clinic-insurance-status');
  if (!el) return;
  el.textContent = window.getClinicInsurance() ? '🛡️ 보험 가입됨' : '보험 미가입';
  el.style.color  = window.getClinicInsurance() ? '#5dcaa5' : '#888';
}

// enterClinic 후크
const _origEnterClinic = window.enterClinic;
window.enterClinic = function() {
  _origEnterClinic();
  updateClinicStatusUI();
  updateClinicVaccineUI();
  updateClinicInsuranceUI();
};


// ================================================================
// 공대 실험실 — 신규: 아이템 강화 / 분해 / 실패 폭발 / 레시피 해금
// ================================================================

// 아이템 강화 (+1~+3)
window.enhanceItem = function(invIdx) {
  const item = inventory[invIdx];
  if (!item) { addLab2Log('[❌] 존재하지 않는 아이템입니다.'); return; }

  const level   = item.enhanceLevel || 0;
  if (level >= 3) { addLab2Log('[❌] 이미 최대 강화 (+3) 상태입니다.'); return; }

  const cost    = 5 + level * 3;
  const failChance = [0.1, 0.25, 0.45][level]; // +0→+1: 10%, +1→+2: 25%, +2→+3: 45% 실패

  if (playerStats.data < cost) { addLab2Log('[❌] 데이터 조각 부족! (필요: ' + cost + '개)'); return; }
  playerStats.data -= cost;

  if (Math.random() < failChance) {
    // 실패: 폭발! HP 소량 감소
    const dmg = Math.floor(Math.random() * 8) + 3;
    playerStats.hp = Math.max(1, playerStats.hp - dmg);
    addLab2Log('[💥 실패!] 강화 실패! 폭발로 HP -' + dmg + ' · 💎 -' + cost);
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    syncLab2Stats();
    return;
  }

  item.enhanceLevel = level + 1;
  item.name = item.name.replace(/ \+\d$/, '') + ' +' + item.enhanceLevel;
  saveInventory();
  syncLab2Stats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addLab2Log('[✅ 강화 성공!] ' + item.icon + ' ' + item.name + ' 강화 완료! · 💎 -' + cost);
};

// 아이템 분해
window.disassembleItem = function(invIdx) {
  const item = inventory[invIdx];
  if (!item) { addLab2Log('[❌] 존재하지 않는 아이템입니다.'); return; }

  const reward = 2 + (item.enhanceLevel || 0) * 2;
  inventory.splice(invIdx, 1);
  playerStats.data += reward;
  saveInventory();
  syncLab2Stats();
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addLab2Log('[🔧 분해] ' + item.icon + ' ' + item.name + ' 분해 → 💎 +' + reward);
};

// 레시피 해금 (도서관 공부 횟수 기반)
const LAB2_SECRET_RECIPES = [
  { id: 'ultimate', reqStudy: 15, materials: ['fire','water','crystal'], result: { id:'ultimate', name:'궁극 포션', icon:'🌈', desc:'HP+SP 완전 회복 + 다음 전투 데미지 +50%' }, name: '궁극 포션 레시피', desc: '공부 15회 달성 시 해금' },
  { id: 'mirror',   reqStudy: 8,  materials: ['leaf','star','gear'],     result: { id:'mirror',  name:'반사 방패', icon:'🪞', desc:'피해를 10% 반사' },                           name: '반사 방패 레시피',  desc: '공부 8회 달성 시 해금' },
];

function getUnlockedRecipes() {
  return JSON.parse(localStorage.getItem('lab2UnlockedRecipes') || '[]');
}

window.checkLab2Recipes = function() {
  const unlocked = getUnlockedRecipes();
  let newUnlocked = false;
  for (const r of LAB2_SECRET_RECIPES) {
    if (!unlocked.includes(r.id) && libStudyCount >= r.reqStudy) {
      unlocked.push(r.id);
      newUnlocked = true;
      addLab2Log('[📖 레시피 해금!] ' + r.name + ' (' + r.desc + ')');
    }
  }
  if (newUnlocked) {
    localStorage.setItem('lab2UnlockedRecipes', JSON.stringify(unlocked));
    if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Firebase 동기화
  }
  updateLab2RecipeUI();
};

function updateLab2RecipeUI() {
  const el = document.getElementById('lab2-recipe-list');
  if (!el) return;
  const unlocked = getUnlockedRecipes();
  const allRecipes = [...LAB2_RECIPES.map(r => ({ ...r, secret: false })), ...LAB2_SECRET_RECIPES.map(r => ({ ...r, secret: true }))];
  el.innerHTML = allRecipes.map(r => {
    const available = !r.secret || unlocked.includes(r.id);
    const mats = r.materials.map(m => LAB2_EMOJI[m] || m).join('+');
    return `<div style="padding:4px 0;font-size:11px;color:${available ? '#c0e0c0' : '#555'}">
      ${available ? (r.result.icon + ' ' + r.result.name) : '???'} = ${available ? mats : '???'}
      ${r.secret && !available ? ' (공부 ' + r.reqStudy + '회 필요)' : ''}
    </div>`;
  }).join('');
}

// enterLab2 후크
const _origEnterLab2 = window.enterLab2;
window.enterLab2 = function() {
  _origEnterLab2();
  window.checkLab2Recipes();
  renderEnhancePanel();
};

function renderEnhancePanel() {
  const el = document.getElementById('lab2-enhance-list');
  if (!el) return;
  if (inventory.length === 0) {
    el.innerHTML = '<span style="color:#888;font-size:12px;">인벤토리가 비어 있어요</span>';
    return;
  }
  el.innerHTML = inventory.map((item, i) => {
    const level = item.enhanceLevel || 0;
    const cost  = 5 + level * 3;
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #1a1a2e;">
      <span>${item.icon}</span>
      <span style="flex:1;font-size:12px;color:#c0e0c0">${item.name}</span>
      ${level < 3 ? `<button onclick="enhanceItem(${i})" style="background:#0d0720;border:1px solid #c4a0ff;border-radius:4px;padding:2px 6px;color:#c4a0ff;cursor:pointer;font-size:10px;">강화 💎${cost}</button>` : '<span style="font-size:10px;color:#ef9f27">MAX</span>'}
      <button onclick="disassembleItem(${i})" style="background:#0d0720;border:1px solid #555;border-radius:4px;padding:2px 6px;color:#888;cursor:pointer;font-size:10px;">분해</button>
    </div>`;
  }).join('');
}


// ================================================================
// 중앙 축제 — 신규: 야시장 부스 / 한정판 아이템 / 랜덤 이벤트
// ================================================================

// 야시장 부스 (SP 회복 야식 판매)
const FEST_FOOD_STALL = [
  { name: '떡볶이', sp: 20, cost: 3 },
  { name: '순대',   hp: 15, sp: 10, cost: 4 },
  { name: '닭꼬치', hp: 20, cost: 3 },
];

window.buyFestFood = function(idx) {
  const food = FEST_FOOD_STALL[idx];
  if (!food) return;
  if (playerStats.data < food.cost) { addFestivalLog('[야시장] 데이터 조각 부족!', '#f09595'); return; }
  playerStats.data -= food.cost;
  if (food.hp) playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + food.hp);
  if (food.sp) playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + food.sp);
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addFestivalLog('[🍢 야시장] ' + food.name + ' 먹었다!' + (food.hp ? ' HP +' + food.hp : '') + (food.sp ? ' SP +' + food.sp : '') + ' · 💎 -' + food.cost, '#ef9f27');
};

// 한정판 코스튬 아이템 (1일 1회, 오늘의 한정 아이템)
const FEST_DAILY_ITEMS = [
  { name: '축제 왕관',     icon: '👑', cost: 15, roomItem: { id: 'fest_crown',  slot: 'wall',  emoji: '👑', desc: '왕관 장식' } },
  { name: '불꽃 머리핀',   icon: '🎆', cost: 12, roomItem: { id: 'fest_firework', slot: 'wall', emoji: '🎆', desc: '불꽃 장식' } },
  { name: '별빛 풍선',     icon: '🎈', cost: 10, roomItem: { id: 'fest_balloon', slot: 'floor3', emoji: '🎈', desc: '풍선 장식' } },
];

function getTodayFestItem() {
  const seed = new Date().toDateString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return FEST_DAILY_ITEMS[seed % FEST_DAILY_ITEMS.length];
}

window.buyFestLimitedItem = function() {
  const today = new Date().toDateString();
  if (localStorage.getItem('festLimitedBought') === today) {
    addFestivalLog('[한정 아이템] 오늘의 한정 아이템은 이미 구매했어요!', '#f09595');
    return;
  }
  const item = getTodayFestItem();
  if (playerStats.data < item.cost) { addFestivalLog('[한정 아이템] 데이터 조각 부족!', '#f09595'); return; }
  playerStats.data -= item.cost;
  // 방 꾸미기 아이템으로 추가
  if (!playerStats.ownedRoomItems.includes(item.roomItem.id)) {
    playerStats.ownedRoomItems.push(item.roomItem.id);
  }
  localStorage.setItem('festLimitedBought', today);
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addFestivalLog('[🎁 한정 아이템] ' + item.icon + ' ' + item.name + ' 구매! 방 꾸미기에 추가됐어요! · 💎 -' + item.cost, '#5dcaa5');
};

// 랜덤 이벤트: 축제 입장 시 10% 확률로 연예인 등장 → 데이터 조각 2× 버프 (30분)
function checkFestRandomEvent() {
  if (Math.random() < 0.1) {
    const eventExpires = Date.now() + 30 * 60 * 1000;
    localStorage.setItem('festDoubleBuff', eventExpires.toString());
    addFestivalLog('[🌟 스페셜 이벤트!] 연예인이 무대에 등장했다! 30분간 💎 획득 2배!', '#ef9f27');
  }
}

window.hasFestDoubleBuff = function() {
  const exp = parseInt(localStorage.getItem('festDoubleBuff') || '0');
  return Date.now() < exp;
};

// enterFestival 후크
const _origEnterFestival = window.enterFestival;
window.enterFestival = function() {
  _origEnterFestival();
  checkFestRandomEvent();
  // 오늘의 한정 아이템 UI
  const special = getTodayFestItem();
  const el = document.getElementById('fest-limited-name');
  if (el) el.textContent = special.icon + ' ' + special.name + ' (💎 ' + special.cost + ')';
  const boughtEl = document.getElementById('fest-limited-badge');
  if (boughtEl) boughtEl.style.display = (localStorage.getItem('festLimitedBought') === new Date().toDateString()) ? 'inline' : 'none';
  // 버프 상태 표시
  const buffEl = document.getElementById('fest-buff-status');
  if (buffEl) buffEl.textContent = window.hasFestDoubleBuff() ? '🌟 2× 보너스 활성!' : '';
};

// 축제 보상에 2× 버프 적용 (answerQuiz, jankenPlay, spinSlot 후크)
const _origAnswerQuiz = window.answerQuiz;
window.answerQuiz = function(idx) {
  _origAnswerQuiz(idx);
  if (idx === currentQuiz?.ans && window.hasFestDoubleBuff()) {
    playerStats.data += 5; // 추가 5개 (총 10개)
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    addFestivalLog('[🌟 2× 보너스] 추가 💎 +5!', '#ef9f27');
  }
};


// ================================================================
// 학생회관 — 신규: 부스 로테이션 / 한정 세일 / 동아리 가입 / 코스튬
// ================================================================

// 부스 로테이션: 매일 다른 동아리 부스 3종
const UNION_BOOTHS = [
  [
    { name: '📸 사진학회',  item: 'photo_card',    effect: () => { playerStats.data += 3; }, desc: '데이터 조각 +3', cost: 5 },
    { name: '🎵 밴드부',    item: 'band_buff',     effect: () => { puangState.favorability = Math.min(100, puangState.favorability + 5); savePuangState(); }, desc: '푸앙 호감도 +5', cost: 6 },
    { name: '🏃 마라톤부',  item: 'marathon_buff', effect: () => { playerStats.maxHp += 5; }, desc: '최대 HP +5', cost: 8 },
  ],
  [
    { name: '🎮 게임학회',  item: 'game_chip',    effect: () => { playerStats.data += 5; }, desc: '데이터 조각 +5', cost: 8 },
    { name: '📚 독서클럽',  item: 'book_token',   effect: () => { playerStats.maxSp += 5; }, desc: '최대 SP +5', cost: 7 },
    { name: '🍳 요리부',    item: 'cooking_buff', effect: () => { playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 20); }, desc: 'HP +20', cost: 5 },
  ],
  [
    { name: '🔬 과학탐구',  item: 'science_chip',  effect: () => { playerStats._regenPerTurn = (playerStats._regenPerTurn || 0) + 2; }, desc: '전투 리젠 +2', cost: 10 },
    { name: '🎭 연극부',    item: 'drama_token',   effect: () => { playerStats.unionBonusDmg = (playerStats.unionBonusDmg || 0) + 3; }, desc: '전투 데미지 +3', cost: 9 },
    { name: '🌿 환경동아리', item: 'eco_badge',     effect: () => { playerStats.data += 4; }, desc: '데이터 조각 +4', cost: 6 },
  ],
];

function getTodayBooths() {
  const seed = new Date().toDateString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return UNION_BOOTHS[seed % UNION_BOOTHS.length];
}

window.buyUnionBooth = function(idx) {
  const booths = getTodayBooths();
  const booth  = booths[idx];
  if (!booth) return;

  const boughtKey = 'unionBooth_' + new Date().toDateString() + '_' + idx;
  if (localStorage.getItem(boughtKey)) { addUnionLog('[부스] 오늘 이미 이 부스를 이용했어요.', 'union-log-info'); return; }
  if (playerStats.data < booth.cost) { addUnionLog('[부스] 데이터 조각 부족! (필요: ' + booth.cost + '개)', 'union-log-err'); return; }

  playerStats.data -= booth.cost;
  booth.effect();
  localStorage.setItem(boughtKey, '1');
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';
  addUnionLog('[✅ ' + booth.name + '] ' + booth.desc + ' · 💎 -' + booth.cost, 'union-log-ok');
};

// 한정 세일: 매주 월요일 특정 아이템 50% 할인
function isUnionSaleDay() { return new Date().getDay() === 1; }

window.buyUnionSale = function() {
  if (!isUnionSaleDay()) { addUnionLog('[세일] 한정 세일은 매주 월요일에 진행돼요!', 'union-log-info'); return; }
  const saleKey = 'unionSale_' + getWeekKey();
  if (localStorage.getItem(saleKey)) { addUnionLog('[세일] 이번 주 세일 구매를 이미 완료했어요.', 'union-log-info'); return; }

  const saleCost = 10; // 원가 20 → 50% 할인
  if (playerStats.data < saleCost) { addUnionLog('[세일] 데이터 조각 부족! (필요: ' + saleCost + '개)', 'union-log-err'); return; }

  playerStats.data -= saleCost;
  playerStats.maxHp += 20;
  localStorage.setItem(saleKey, '1');
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';
  addUnionLog('[🏷️ 한정 세일 50%!] 생명력 결정 구매! 최대 HP +20 · 💎 -' + saleCost + ' (원가 20)', 'union-log-ok');
};

// 동아리 가입 (한 번만 가입 가능)
const UNION_CLUBS = {
  cs_club:     { name: '컴퓨터학회', icon: '💻', cost: 15, buff: '공부 보상 +1, 전투 리젠 +2',   apply: () => { unionBonusStudy++; playerStats.unionBonusStudy = unionBonusStudy; playerStats._regenPerTurn = (playerStats._regenPerTurn || 0) + 2; } },
  sports_club: { name: '스포츠부',   icon: '🏃', cost: 15, buff: '최대 HP +20, 체육관 비용 -1',  apply: () => { playerStats.maxHp += 20; playerStats._gymDiscount = (playerStats._gymDiscount || 0) + 1; } },
  art_club:    { name: '예술부',     icon: '🎨', cost: 15, buff: '푸앙 호감도 +10, 축제 보상 +2', apply: () => { puangState.favorability = Math.min(100, puangState.favorability + 10); savePuangState(); playerStats._festBonus = (playerStats._festBonus || 0) + 2; } },
};

window.joinUnionClub = function(clubId) {
  const club = UNION_CLUBS[clubId];
  if (!club) return;

  const joined = JSON.parse(localStorage.getItem('unionJoinedClubs') || '[]');
  if (joined.includes(clubId)) { addUnionLog('[동아리] ' + club.icon + ' ' + club.name + '는 이미 가입되어 있어요.', 'union-log-info'); return; }
  if (joined.length >= 1)      { addUnionLog('[동아리] 동아리는 1개만 가입할 수 있어요.', 'union-log-info'); return; }
  if (playerStats.data < club.cost) { addUnionLog('[동아리] 데이터 조각 부족! (필요: ' + club.cost + '개)', 'union-log-err'); return; }

  playerStats.data -= club.cost;
  club.apply();
  joined.push(clubId);
  localStorage.setItem('unionJoinedClubs', JSON.stringify(joined));
  // ★ BugFix #12: 동아리 가입은 1회성 영구 이벤트이므로 debouncedSave(1.5초 지연) 대신
  //   즉시 Firebase 저장. 지연 중 새로고침 시 패시브 적용은 됐지만 서버 저장 안 된 상태 방지.
  //   사이드이펙트: Firebase write 1회 즉시 발생 — 가입은 게임 전체에서 최대 1회라 비용 무시 가능.
  if (typeof window.saveAllDataToServer === 'function') {
    window.saveAllDataToServer();
  } else if (typeof window.syncAndSave === 'function') {
    window.syncAndSave(); // fallback
  }
  document.getElementById('union-data-val').textContent = playerStats.data + ' 💎';
  addUnionLog('[🎓 동아리 가입!] ' + club.icon + ' ' + club.name + ' — ' + club.buff + ' · 💎 -' + club.cost, 'union-log-ok');
  updateUnionClubUI();
};

function updateUnionClubUI() {
  const el = document.getElementById('union-club-status');
  if (!el) return;
  const joined = JSON.parse(localStorage.getItem('unionJoinedClubs') || '[]');
  el.textContent = joined.length > 0
    ? '소속: ' + joined.map(id => UNION_CLUBS[id]?.icon + ' ' + UNION_CLUBS[id]?.name).join(', ')
    : '동아리 미가입';
  el.style.color = joined.length > 0 ? '#5dcaa5' : '#888';
}

// enterUnion 후크
const _origEnterUnion = window.enterUnion;
window.enterUnion = function() {
  _origEnterUnion();
  updateUnionClubUI();
  // 부스 로테이션 UI
  const booths = getTodayBooths();
  for (let i = 0; i < 3; i++) {
    const nameEl  = document.getElementById('union-booth-name-' + i);
    const descEl  = document.getElementById('union-booth-desc-' + i);
    const costEl  = document.getElementById('union-booth-cost-' + i);
    if (nameEl) nameEl.textContent = booths[i].name;
    if (descEl) descEl.textContent = booths[i].desc;
    if (costEl) costEl.textContent = '💎 ' + booths[i].cost;
  }
  // 세일 배너
  const saleEl = document.getElementById('union-sale-banner');
  if (saleEl) {
    saleEl.style.display = isUnionSaleDay() ? 'block' : 'none';
  }
};


// ================================================================
// 아이템 가게 — 신규: 재고 시스템 / 묶음 할인 / 찜 목록 / 신상품 알림
// ================================================================

// 재고 시스템: 아이템별 일일 한도
const STORE_STOCK_LIMIT = { hp_potion: 5, sp_potion: 5, full_potion: 2, dmg_boost: 3, shield: 3 };

function getStoreStock() {
  const today = new Date().toDateString();
  const raw   = JSON.parse(localStorage.getItem('storeStock') || '{}');
  if (raw.date !== today) {
    const fresh = { date: today };
    Object.keys(STORE_STOCK_LIMIT).forEach(k => fresh[k] = STORE_STOCK_LIMIT[k]);
    localStorage.setItem('storeStock', JSON.stringify(fresh));
    return fresh;
  }
  return raw;
}
function saveStoreStock(stock) {
  localStorage.setItem('storeStock', JSON.stringify(stock));
}

// 찜 목록
function getStoreWishlist() { return JSON.parse(localStorage.getItem('storeWishlist') || '[]'); }
function saveStoreWishlist(list) { localStorage.setItem('storeWishlist', JSON.stringify(list)); }

window.toggleStoreWishlist = function(id) {
  let list = getStoreWishlist();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    addStoreLog('[🤍 찜 해제] ' + STORE_ITEMS[id]?.name, 'store-log-info');
  } else {
    list.push(id);
    addStoreLog('[❤️ 찜 추가] ' + STORE_ITEMS[id]?.name, 'store-log-ok');
  }
  saveStoreWishlist(list);
  updateStoreWishlistUI();
  updateStoreStockUI();
};

function updateStoreWishlistUI() {
  const el = document.getElementById('store-wishlist');
  if (!el) return;
  const list = getStoreWishlist();
  el.textContent = list.length > 0
    ? '❤️ 찜: ' + list.map(id => STORE_ITEMS[id]?.name || id).join(', ')
    : '찜한 아이템 없음';
}

function updateStoreStockUI() {
  const stock = getStoreStock();
  const wishlist = getStoreWishlist();
  Object.keys(STORE_STOCK_LIMIT).forEach(id => {
    const el = document.getElementById('store-stock-' + id);
    if (el) {
      el.textContent = '재고 ' + (stock[id] || 0) + '/' + STORE_STOCK_LIMIT[id];
      el.style.color = stock[id] === 0 ? '#f09595' : '#888';
    }
    // 찜 버튼 상태
    const wishBtn = document.getElementById('store-wish-' + id);
    if (wishBtn) wishBtn.textContent = wishlist.includes(id) ? '❤️' : '🤍';
  });
}

// 묶음 구매 카트
let storeCart = [];

window.addToCart = function(id) {
  storeCart.push(id);
  updateStoreCartUI();
  addStoreLog('[🛒 카트] ' + STORE_ITEMS[id]?.name + ' 추가', 'store-log-info');
};

window.clearCart = function() {
  storeCart = [];
  updateStoreCartUI();
};

window.buyCart = function() {
  if (storeCart.length === 0) { addStoreLog('[❌] 카트가 비어 있어요.', 'store-log-err'); return; }

  const stock = getStoreStock();
  // 재고 체크
  const countMap = {};
  for (const id of storeCart) countMap[id] = (countMap[id] || 0) + 1;
  for (const [id, count] of Object.entries(countMap)) {
    if ((stock[id] || 0) < count) { addStoreLog('[❌] ' + STORE_ITEMS[id]?.name + ' 재고 부족!', 'store-log-err'); return; }
  }

  // 총액 계산 (3개 이상 10% 할인)
  let total = storeCart.reduce((sum, id) => sum + (STORE_ITEMS[id]?.cost || 0), 0);
  const discount = storeCart.length >= 3;
  if (discount) total = Math.floor(total * 0.9);

  if (playerStats.data < total) { addStoreLog('[❌] 데이터 조각 부족! (필요: ' + total + '개)', 'store-log-err'); return; }

  playerStats.data -= total;
  // 아이템 효과 적용
  // ★ BugFix #4: 기존에 hp/sp_potion, full_potion은 즉시 회복만 하고 인벤토리에 추가하지 않아
  //   단일 구매(buyStore)와 동작 불일치. inventory에 추가하도록 통일.
  //   origBuy 변수는 실제로 사용되지 않았으므로 제거(사이드이펙트 없음).
  //   원본 즉시 회복 로직은 주석으로 보존 ↓
  for (const id of storeCart) {
    const origBuy = _origBuyStore; // 원본 선언 보존 (미사용 변수였으나 원본 코드 유지)
    // 재고 차감
    stock[id] = (stock[id] || 0) - 1;
    // 원본 효과 직접 적용 코드 (주석으로 보존):
    // if      (id === 'hp_potion')   { playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 30); }
    // else if (id === 'sp_potion')   { playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + 20); }
    // else if (id === 'full_potion') { playerStats.hp = playerStats.maxHp; playerStats.sp = playerStats.maxSp; }
    // else if (id === 'dmg_boost')   { inventory.push({ id: 'dmg_boost', name: STORE_ITEMS[id].name, icon: '🔥', desc: '다음 전투 데미지 +50%' }); saveInventory(); }
    // else if (id === 'shield')      { inventory.push({ id: 'shield',    name: STORE_ITEMS[id].name, icon: '🛡️', desc: '다음 전투 피해 -50%'  }); saveInventory(); }
    // 효과 적용 — buyStore와 동일한 방식(인벤토리 추가)으로 통일
    if      (id === 'hp_potion')   { inventory.push({ id: 'hp_potion',   name: STORE_ITEMS[id]?.name || 'HP 포션',      icon: '🧃', desc: 'HP +30 회복' });           saveInventory(); }
    else if (id === 'sp_potion')   { inventory.push({ id: 'sp_potion',   name: STORE_ITEMS[id]?.name || 'SP 포션',      icon: '💙', desc: 'SP +20 회복' });           saveInventory(); }
    else if (id === 'full_potion') { inventory.push({ id: 'full_potion', name: STORE_ITEMS[id]?.name || '풀 회복 포션', icon: '✨', desc: 'HP+SP 완전 회복' });       saveInventory(); }
    else if (id === 'dmg_boost')   { inventory.push({ id: 'dmg_boost',   name: STORE_ITEMS[id]?.name || '데미지 부스터', icon: '🔥', desc: '다음 전투 데미지 +50%' }); saveInventory(); }
    else if (id === 'shield')      { inventory.push({ id: 'shield',      name: STORE_ITEMS[id]?.name || '방어막',        icon: '🛡️', desc: '다음 전투 피해 -50%' });  saveInventory(); }
  }
  saveStoreStock(stock);
  storeCart = [];
  updateStoreCartUI();
  updateStoreStockUI();
  document.getElementById('store-data-val').textContent = playerStats.data;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  addStoreLog('[✅ 카트 구매 완료]' + (discount ? ' 3개 이상 10% 할인 적용!' : '') + ' · 💎 -' + total, 'store-log-ok');
  const npc = document.getElementById('store-clerk-text');
  if (npc) npc.textContent = '감사합니다~ 또 오세요! 🙏';
};

function updateStoreCartUI() {
  const el = document.getElementById('store-cart-count');
  if (el) el.textContent = storeCart.length + '개';
  const totalEl = document.getElementById('store-cart-total');
  if (totalEl) {
    let total = storeCart.reduce((sum, id) => sum + (STORE_ITEMS[id]?.cost || 0), 0);
    if (storeCart.length >= 3) total = Math.floor(total * 0.9);
    totalEl.textContent = total + '💎' + (storeCart.length >= 3 ? ' (10%↓)' : '');
  }
}

// 신상품 알림: 주 1회 새 아이템 입고
// ★ BugFix #18: id 필드를 STORE_ITEMS 키와 일치시킴
// 원본 배열 (id 없어 buyStore 불가 — 주석으로 보존):
// { name: '기억력 포션', icon: '🧠', cost: 10, desc: '도서관 정답률 +20% (5분)' },
// { name: '투명 망토',   icon: '🫥', cost: 18, desc: '이면세계 몬스터 조우율 -30%' },
// { name: '청룡 부적',   icon: '🧧', cost: 12, desc: '전투 사망 시 HP 15로 부활 1회' },
function getStoreNewItem() {
  const week = getWeekKey();
  const weekNum = parseInt(week.split('-W')[1]) || 1;
  const newItems = [
    { id: 'mem_potion', name: '기억력 포션', icon: '🧠', cost: 10, desc: '도서관 정답률 +20% (5분)' },
    { id: 'cloak',      name: '투명 망토',   icon: '🫥', cost: 18, desc: '이면세계 몬스터 조우율 -30%' },
    { id: 'charm',      name: '청룡 부적',   icon: '🧧', cost: 12, desc: '전투 사망 시 HP 15로 부활 1회' },
  ];
  return newItems[weekNum % newItems.length];
}

// ★ BugFix #18: 신상품 구매 함수 — 주 1회 한도
window.buyNewStoreItem = function() {
  const item = getStoreNewItem();
  const weekKey = 'newItem_' + getWeekKey();
  if (localStorage.getItem(weekKey)) {
    addStoreLog('[❌] 이번 주 신상품은 이미 구매하셨어요!', 'store-log-err');
    return;
  }
  if (playerStats.data < item.cost) {
    addStoreLog('[❌] 데이터 조각 부족! (필요: ' + item.cost + '개)', 'store-log-err');
    return;
  }
  playerStats.data -= item.cost;
  inventory.push({ id: item.id, name: item.name, icon: item.icon, desc: item.desc });
  saveInventory();
  localStorage.setItem(weekKey, '1');
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  document.getElementById('store-data-val').textContent = playerStats.data;
  addStoreLog('[🆕 신상품 구매!] ' + item.icon + ' ' + item.name + ' · 💎 -' + item.cost, 'store-log-ok');
  const npc = document.getElementById('store-clerk-text');
  if (npc) npc.textContent = '좋은 선택이에요! 이번 주 한정이에요 😊';
};

// buyStore 후크: 재고 차감 적용
const _origBuyStore = window.buyStore;
window.buyStore = function(id) {
  const stock = getStoreStock();
  if ((stock[id] || 0) <= 0) {
    addStoreLog('[❌] ' + (STORE_ITEMS[id]?.name || id) + ' 재고가 없어요! 내일 다시 입고됩니다.', 'store-log-err');
    return;
  }
  stock[id]--;
  saveStoreStock(stock);
  _origBuyStore(id);
  updateStoreStockUI();
};

// enterStore 후크
const _origEnterStore = window.enterStore;
window.enterStore = function() {
  _origEnterStore();
  updateStoreStockUI();
  updateStoreWishlistUI();
  updateStoreCartUI();
  // 신상품 표시
  const newItem = getStoreNewItem();
  const el = document.getElementById('store-new-item');
  if (el) el.textContent = '🆕 이번 주 신상품: ' + newItem.icon + ' ' + newItem.name + ' (💎 ' + newItem.cost + ') — ' + newItem.desc;
};




// ================================================================
// ★ 청룡호 (호감도 100 해금 콘텐츠)
// ================================================================

window.enterBluedragonLake = function() {
  if (!localStorage.getItem('lakeUnlocked') && puangState.favorability < 100) {
    if (typeof showToast === 'function') showToast('🔒 푸앙이 호감도 100 달성 시 입장 가능합니다.', 'warning', 3000);
    return;
  }
  const containers = [
    'game-container','battle-container','cafeteria-container','library-container',
    'lab-container','explore-container','puang-room','gym-container','clinic-container',
    'lab2-container','festival-container','union-container','mountain-container','store-container'
  ];
  containers.forEach(id => { const el = document.getElementById(id); if (el) { el.style.display = 'none'; el.classList.remove('visible'); } });

  const lakeCont = document.getElementById('bluedragonlake-container');
  if (lakeCont) lakeCont.style.display = 'flex';
  _initLake();
};

window.leaveBluedragonLake = function() {
  const el = document.getElementById('bluedragonlake-container');
  if (el) el.style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  if (typeof window.updateMapStats === 'function') window.updateMapStats();
};

// placeInfo 연동
if (typeof placeInfo !== 'undefined') {
  placeInfo.bluedragonlake.locked = !localStorage.getItem('lakeUnlocked');
}

function _initLake() {
  const log = document.getElementById('lake-chat-log');
  if (log && log.children.length === 0) {
    const intro = document.createElement('div');
    intro.style.cssText = 'color:#5dcaa5;padding:6px 10px;background:rgba(29,158,117,0.1);border-radius:8px;';
    intro.textContent = '🐉 푸앙: 드디어 왔어 푸앙! 여기 청룡호야 푸앙~ 예쁘지 푸앙?';
    log.appendChild(intro);
  }
  _spawnLakeParticles();
}

function _spawnLakeParticles() {
  const container = document.getElementById('lake-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;font-size:${10+Math.random()*10}px;opacity:${0.3+Math.random()*0.4};left:${Math.random()*100}%;top:${Math.random()*100}%;animation:snowFall ${3+Math.random()*4}s linear ${Math.random()*3}s infinite;pointer-events:none;`;
    p.textContent = ['✨','💫','🌟','⭐'][Math.floor(Math.random()*4)];
    container.appendChild(p);
  }
}

window.lakeWalk = function() {
  if (!useDaily('dormitory')) { addLakeMsg('system', '오늘은 이미 산책했어요! 내일 또 와줘 푸앙~'); return; }
  playerStats.data += 5;
  if (typeof changeFavor === 'function') changeFavor(3);
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  if (typeof showToast === 'function') showToast('🚶 산책 완료! 호감도 +3 💎 +5', 'success', 2500);
  addLakeMsg('puang', '같이 걸으니까 좋다 푸앙~ 달빛이 예쁘지 않아 푸앙?');
};

window.lakeMeditate = function() {
  playerStats.hp = playerStats.maxHp;
  playerStats.sp = playerStats.maxSp;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  if (typeof window.updateMapStats === 'function') window.updateMapStats();
  if (typeof showToast === 'function') showToast('🧘 명상 완료! HP + SP 완전 회복!', 'success', 2500);
  addLakeMsg('puang', '숨 들이쉬고... 내쉬고... 기분 어때 푸앙? 나는 좋아 푸앙~');
};

window.sendLakeChat = function() {
  const input = document.getElementById('lake-chat-input');
  const text  = input ? input.value.trim() : '';
  if (!text) return;
  addLakeMsg('player', text);
  input.value = '';
  addLakeMsg('puang', '...');

  if (!GROQ_API_KEY) { const log = document.getElementById('lake-chat-log'); if (log && log.lastChild) log.lastChild.textContent = '미안 푸앙, 지금 말 못 해 푸앙...'; return; }

  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: `You must respond only in Korean Hangul. 너는 중앙대학교 마스코트 푸앙이야. 청룡호에서 둘이 특별한 시간을 보내고 있어. 호감도 MAX 달성한 특별한 상황이야. 문장 끝에 반드시 "푸앙"을 붙여. 반말. 귀엽고 감성적으로. {"dialog": "대사 1~2문장"}`
      }, { role: 'user', content: text }]
    })
  }).then(r => r.json()).then(d => {
    const parsed = JSON.parse(d.choices[0].message.content);
    const log = document.getElementById('lake-chat-log');
    if (log && log.lastChild) { log.lastChild.textContent = ''; log.lastChild.remove(); }
    addLakeMsg('puang', parsed.dialog);
  }).catch(() => {
    const log = document.getElementById('lake-chat-log');
    if (log && log.lastChild) log.lastChild.textContent = '잠깐 멍했어 푸앙... 다시 말해줘 푸앙';
  });
};

function addLakeMsg(who, text) {
  const log = document.getElementById('lake-chat-log');
  if (!log) return;
  const div = document.createElement('div');
  if (who === 'puang') {
    div.style.cssText = 'color:#5dcaa5;padding:5px 10px;background:rgba(29,158,117,0.1);border-radius:8px;align-self:flex-start;max-width:85%;';
    div.textContent = '🐉 ' + text;
  } else if (who === 'player') {
    div.style.cssText = 'color:#a0c4ff;padding:5px 10px;background:rgba(55,138,221,0.1);border-radius:8px;align-self:flex-end;max-width:85%;text-align:right;';
    div.textContent = text;
  } else {
    div.style.cssText = 'color:#6c8ebf;font-size:10px;text-align:center;';
    div.textContent = text;
  }
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// enterPlace 후킹 — 청룡호 진입
const _origEnterPlace_lake = window.enterPlace;
if (_origEnterPlace_lake) {
  window.enterPlace = function(placeId) {
    if (placeId === 'bluedragonlake') {
      window.enterBluedragonLake();
      return;
    }
    _origEnterPlace_lake(placeId);
  };
}

// ================================================================
// ★ 요일 보너스 — locations 연동
// ================================================================

// 도서관 공부 보상에 화요일 2× 적용
// ★ BugFix #9: 원본 래퍼 코드 보존. 플래그 설정은 startStudy 본체에도 추가되어 있으므로
//   후킹 체인이 어떻게 연결되어도 _libStudyIsDouble이 반드시 세팅됨.
const _origFinishStudyReward = window.startStudy;
if (_origFinishStudyReward) {
  const _origSS = window.startStudy;
  window.startStudy = function(subjectId) {
    window._libStudyIsDouble = (window._todayBonusKey === 'lib_double');
    _origSS(subjectId);
  };
}

// 전투 보상에 수요일 +5 적용 (battle.js initBattle 후크)
// _todayBonusKey === 'battle_bonus' → 이미 ui4.js에서 노출됨
// battle.js win 로직에서 window._todayBonusKey 체크
