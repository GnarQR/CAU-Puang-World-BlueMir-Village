// ================================================================
// intro.js — 인트로 화면 로직
// 순서: 1단계(API 키 입력) → 2단계(스토리 타이핑) → 3단계(닉네임 입력) → 게임 시작
// ================================================================

// ── 새로 고침 시 전투 데이터 이어하기 확인 ──
window.checkResumeBattle = function() {
  const inBattle = localStorage.getItem('inBattle');
  if (inBattle === 'true') {
    const origin = localStorage.getItem('battleOrigin') || 'map';
    const bossId = localStorage.getItem('battleBossId');

    console.log("전투 복구 시도:", { origin, bossId });
    
    // 🌟 약간의 지연을 주어 다른 데이터(playerStats 등)가 로드된 후 실행
    setTimeout(() => {
      if (typeof window.initBattle === 'function') {
        window.initBattle(origin, bossId);
      }
    }, 100); 
  }
};

// ── 인트로 스킵 ──
// Firebase에 키+닉네임이 이미 있으면 인트로 전체를 건너뜀 (재방문 유저)
// DOMContentLoaded 이벤트에서 자동 호출됨
window.skipIntro = function() {
  document.getElementById('intro-overlay').classList.add('hidden');
  // 맵 상단 스탯 바로 이동해서 초기값 표시
  if (typeof updateMapStats === 'function') updateMapStats();  
}

// ── 1단계: API 키 제출 ──
// gsk_ 로 시작하는지 검증 후 localStorage에 저장
// 유효하면 스토리 단계로 전환
window.submitApiKey = function() {
  const key = document.getElementById('api-key-input').value.trim();

  if (!key.startsWith('gsk_')) {
    shakeInput('api-key-input');
    return;
  }

  localStorage.setItem('groqApiKey', key);
  GROQ_API_KEY = key;  // 키 저장

  // Firebase에서 기존 데이터 불러오기 시도
  if (typeof loadAllDataFromServer === 'function') {
    loadAllDataFromServer(); 
  }

  switchStep('step-api', 'step-story');  // 화면 전환
  startStoryTyping();
}

// ── 2단계: 스토리 타이핑 ──
// 한 글자씩 타이핑 효과로 출력
// 다 출력되면 '계속 ▶' 버튼이 나타남
const STORY_TEXT =  // 스토리 내용 변경 시 STORY_TEXT 수정
  `2026년, 중앙대학교.\n\n` +
  `캠퍼스 어딘가에 균열이 생겼다.\n` +
  `겉으로 보기엔 평범한 건물들.\n` +
  `하지만 그 이면엔 또 다른 세계가 존재한다.\n\n` +
  `버그처럼 번지는 이상 현상들.\n` +
  `학점귀신, 데드라인 악령, 그리고 정체불명의 존재들.\n\n` +
  `중앙대 마스코트 푸앙이만이 이 세계의 비밀을 알고 있다.\n\n` +
  `이제 선택받은 당신이 그 문을 열 차례다.`;

function startStoryTyping() { 
  const element = document.getElementById('story-text');
  const nextBtn = document.getElementById('story-next-btn');
  element.textContent = '';
  let i = 0;

  function step() {
    if (i < STORY_TEXT.length) {
      element.textContent += STORY_TEXT[i];
      i++;
      setTimeout(step, i < 60 ? 40 : 28);
    } 
    
    else {
      nextBtn.style.display = 'block';
    }
  }
  step();
}

// ── 3단계: 닉네임 입력으로 이동 ──
window.goToNameStep = function() {
  switchStep('step-story', 'step-name');
}

// ── 닉네임 제출 ──
window.submitName = function() {  // Firebase에 저장 후 오버레이 페이드아웃
  const name = document.getElementById('name-input').value.trim();
  if (!name) {
    shakeInput('name-input');
    return;
  }
  localStorage.setItem('playerName', name);
  const overlay = document.getElementById('intro-overlay');
  overlay.style.transition = 'opacity 0.6s ease';
  overlay.style.opacity = '0';
  setTimeout(() => overlay.classList.add('hidden'), 600);
}

// ── 단계 전환 헬퍼 ──
function switchStep(fromId, toId) {  // fromId 단계를 숨기고 toId 단계를 표시
  document.getElementById(fromId).classList.add('hidden');
  document.getElementById(toId).classList.remove('hidden');
}

// ── 입력 오류 시 흔들기 ──
// API 키나 닉네임 검증 실패 시 시각적 피드백
function shakeInput(id) {
  const element = document.getElementById(id);
  element.style.borderColor = '#f09595';
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
      element.style.animation = '';
      element.style.borderColor = '';
    }, 300);
  }, 10);
}


// ── DOMContentLoaded: 초기화 ──
// 페이지 로드 시 재방문 유저면 인트로 스킵
// Enter 키로 각 입력창 제출 가능하도록 이벤트 등록
document.addEventListener('DOMContentLoaded', () => {
  const savedKey  = localStorage.getItem('groqApiKey');
  const savedName = localStorage.getItem('playerName');

  if (savedKey && savedName) {
    GROQ_API_KEY = savedKey;
    window.skipIntro();
    window.checkResumeBattle();  // 전투 데이터 이어하기 확인
  }

  document.getElementById('api-key-btn').onclick = () => window.submitApiKey();
  document.getElementById('name-confirm-btn').onclick = () => window.submitName();

  document.getElementById('api-key-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') submitApiKey(); });
  document.getElementById('name-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') submitName(); });
});