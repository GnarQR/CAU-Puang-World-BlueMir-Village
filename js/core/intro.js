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

    console.log('전투 복구 시도:', { origin, bossId });

    // serverDataLoaded 완료 후 실행되도록 지연
    setTimeout(() => {
      if (typeof window.initBattle === 'function') {
        // ★ BugFix #8: origin='map'일 때 전투 복구 후 returnToGame()이
        //   explore-container를 보여주고 requestAnimationFrame(update)를 호출하는데,
        //   canvas 크기가 설정되지 않아 검은 화면이 됨.
        //   복구 전에 startExploration()을 먼저 호출해 canvas를 초기화한 뒤 숨기고,
        //   전투 화면으로 전환. 전투 종료 시 returnToGame()이 다시 explore를 표시.
        if (origin === 'map' && typeof window.startExploration === 'function') {
          const exploreCont = document.getElementById('explore-container');
          if (exploreCont) exploreCont.style.display = 'block';
          window.startExploration(); // canvas 크기 초기화
          // 잠시 후 전투 화면으로 전환 (startExploration의 requestAnimationFrame 1프레임 후)
          setTimeout(() => {
            if (exploreCont) exploreCont.style.display = 'none';
            window.initBattle(origin, bossId);
          }, 50);
        } 
        
        else {
          // ★ Fix: mountain 복구 시 모든 컨테이너 먼저 숨기기
          ['mountain-container','game-container','cafeteria-container',
           'library-container','lab-container','gym-container','clinic-container',
           'lab2-container','festival-container','union-container',
           'store-container','puang-room'
          ].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
          window.initBattle(origin, bossId);
        }
      }
    }, 100);
  }
};

// ── 인트로 스킵 ──
window.skipIntro = function() {
  document.getElementById('intro-overlay').classList.add('hidden');
  // ★ Fix: 전투 복구 중이면 updateMapStats만 호출, game-container 표시는 스킵
  if (typeof updateMapStats === 'function') updateMapStats();
};

// ── 1단계: API 키 제출 ──
// ★ Fix: async 추가 + await loadAllDataFromServer()
//        로드 완료 후 화면 전환하여 serverDataLoaded = true 보장
window.submitApiKey = async function() {
  const key = document.getElementById('api-key-input').value.trim();

  if (!key.startsWith('gsk_')) {
    shakeInput('api-key-input');
    return;
  }

  localStorage.setItem('groqApiKey', key);
  GROQ_API_KEY = key;

  // ★ Fix: await로 로드 완료까지 대기 (이전엔 await 없이 바로 화면 전환)
  if (typeof loadAllDataFromServer === 'function') {
    await loadAllDataFromServer();
  }

  switchStep('step-api', 'step-story');
  startStoryTyping();
};

// ── 2단계: 스토리 타이핑 ──
const STORY_TEXT =
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
    } else {
      nextBtn.style.display = 'block';
    }
  }
  step();
}

// ── 3단계: 닉네임 입력으로 이동 ──
window.goToNameStep = function() {
  switchStep('step-story', 'step-name');
};

// ── 닉네임 제출 ──
window.submitName = async function() {
  const nameInput = document.getElementById('name-input');
  const name = nameInput.value.trim();

  if (!name) {
    if (typeof shakeInput === 'function') shakeInput('name-input');
    return;
  }

  localStorage.setItem('playerName', name);

  if (typeof playerStats !== 'undefined') {
    playerStats.name = name;
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
  }

  // ★ Fix: serverDataLoaded가 true인 상태에서 저장 (submitApiKey에서 await 보장됨)
  if (typeof saveAllDataToServer === 'function') {
    await saveAllDataToServer();
  }

  const overlay = document.getElementById('intro-overlay');
  overlay.style.transition = 'opacity 0.6s ease';
  overlay.style.opacity = '0';

  setTimeout(() => {
    overlay.classList.add('hidden');
    if (typeof window.playIntroVideo === 'function') {
      window.playIntroVideo();
    }
  }, 600);
};

// ── 단계 전환 헬퍼 ──
function switchStep(fromId, toId) {
  document.getElementById(fromId).classList.add('hidden');
  document.getElementById(toId).classList.remove('hidden');
}

// ── 입력 오류 시 흔들기 ──
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

// ── 인트로 영상 클릭 시작 ──
window.startIntroVideo = function() {
  const startOverlay = document.getElementById('video-start-overlay');
  if (startOverlay) {
    startOverlay.classList.add('hidden');
    startOverlay.style.display = 'none';
  }
  if (typeof window.playIntroVideo === 'function') {
    window.playIntroVideo();
  }
};

// ── 실제 비디오 재생 ──
window.playIntroVideo = function() {
  const videoCont = document.getElementById('video-container');
  const video = document.getElementById('intro-video');
  if (!videoCont || !video) return;

  videoCont.classList.remove('hidden');
  videoCont.style.display = 'flex';

  video.currentTime = 0;
  video.play().catch(e => {
    console.warn('재생 실패:', e);
    finishVideo();
  });

  video.onended = finishVideo;
};

// ── 영상 종료 후 메인 게임 표시 ──
window.finishVideo = function() {
  const videoCont = document.getElementById('video-container');
  const video = document.getElementById('intro-video');

  if (video) video.pause();
  if (videoCont) {
    videoCont.classList.add('hidden');
    videoCont.style.display = 'none';
  }

  sessionStorage.setItem('introVideoPlayed', 'true');

  // ★ Fix: game-container 열기 전 모든 컨테이너 숨기기
  ['mountain-container','cafeteria-container','library-container',
   'lab-container','gym-container','clinic-container','lab2-container',
   'festival-container','union-container','store-container','puang-room',
   'battle-container','explore-container'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.classList.remove('visible'); }
  });

  // ★ Fix: 전투 복구 중이면 game-container 표시 스킵 (checkResumeBattle이 처리)
  const inBattle = localStorage.getItem('inBattle') === 'true';
  if (!inBattle) {
    const gameCont = document.getElementById('game-container');
    if (gameCont) gameCont.style.display = 'flex';
  }
};

// ── DOMContentLoaded: 초기화 ──
// ★ Fix: 재방문 유저도 loadAllDataFromServer() 호출하여 serverDataLoaded = true 보장
document.addEventListener('DOMContentLoaded', async () => {
  const savedKey  = localStorage.getItem('groqApiKey');
  const savedName = localStorage.getItem('playerName');

  if (savedKey && savedName) {
    GROQ_API_KEY = savedKey;

    // ★ Fix: 재방문 유저도 서버 로드 (이전엔 로드 없이 skipIntro만 했음)
    if (typeof loadAllDataFromServer === 'function') {
      await loadAllDataFromServer();
    }

    // 인트로 오버레이 숨기기
    if (typeof window.skipIntro === 'function') window.skipIntro();
    
    const inBattle = localStorage.getItem('inBattle') === 'true';

    // // ★ Fix: 전투 복구 중이면 영상/game-container 표시 스킵
    if (!inBattle) {
      if (sessionStorage.getItem('introVideoPlayed') !== 'true') {
        const startOverlay = document.getElementById('video-start-overlay');
        if (startOverlay) {
          startOverlay.classList.remove('hidden');
          startOverlay.style.display = 'flex';
        }
      } 
      else {
        document.getElementById('game-container').style.display = 'flex';
      }
    }

    // 전투 복구 (로드 완료 후 실행)
    if (typeof window.checkResumeBattle === 'function') window.checkResumeBattle();
  }

  // 버튼 이벤트 등록
  document.getElementById('api-key-btn').onclick      = () => window.submitApiKey();
  document.getElementById('name-confirm-btn').onclick = () => window.submitName();

  document.getElementById('api-key-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') window.submitApiKey(); });
  document.getElementById('name-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') window.submitName(); });
});
