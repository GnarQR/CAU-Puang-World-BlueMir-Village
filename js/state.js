// ================================================================
// state.js — 전역 상태 관리
// 게임 전체에서 공유되는 변수와 localStorage 연동 함수 모음
// ================================================================

// ── Groq API 키 ──
// 인트로 화면에서 플레이어가 입력한 키를 저장
// sendChat(), giveItem() 등 LLM 호출 시 사용
let GROQ_API_KEY = '';
let serverDataLoaded = false; // 서버 데이터 로드 완료 전 저장 방지

// Firebase 초기화 및 DB 참조
// 데이터 동기화 핵심 함수 
// 1. 서버에서 모든 데이터를 한꺼번에 불러오기
async function loadAllDataFromServer() {
  if (!GROQ_API_KEY) return; // 키가 없으면 중단

  try {
    const docSnap = await getDoc(doc(db, "gameData", GROQ_API_KEY));
    if (docSnap.exists) {
      const serverData = docSnap.data();
      
      // 서버 데이터로 전역 변수들 업데이트
      if (serverData.puangState) {
        Object.assign(puangState, serverData.puangState);
        savePuangState(); // 로컬에도 백업
      }

      if (serverData.dailyUsage) {
        Object.assign(dailyUsage, serverData.dailyUsage);
        saveDailyUsage();
      }

      // 이전에 diamond 값 저장했던 것 수정 (마이그레이션)
      if (serverData.playerStats) {
        Object.assign(playerStats, serverData.playerStats);  // 서버 데이터 복사

        // 서버에 저장된 이름이 있다면 로컬에 다 복원해 줍니다.
        if (serverData.playerStats.name) {
          playerStats.name = serverData.playerStats.name;
          localStorage.setItem('playerName', serverData.playerStats.name);
        }

        // 1. 만약 서버에 'data'가 있으면 그걸 쓰고, 없는데 옛날 'diamond'가 남아있다면 'data'로 구출
        if (serverData.playerStats.data !== undefined) {
          playerStats.data = serverData.playerStats.data;
        } 
        
        else if (serverData.playerStats.diamond !== undefined) {
          playerStats.data = serverData.playerStats.diamond; 
        } 
        
        else {playerStats.data = 0;}  // 둘 다 없으면 0으로 초기화
        
        // 2. 전역 변수 객체에서 유령 diamond 필드를 완전히 삭제하여 청소합니다.
        if (playerStats.diamond !== undefined) {delete playerStats.diamond;}
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
      }
      
      serverDataLoaded = true; // 데이터 로드 완료 표시
      console.log("모든 데이터 서버 동기화 완료!");
      if (typeof updateMapStats === 'function') updateMapStats();
      else serverDataLoaded = true; // 신규 유저 (서버에 데이터 없음)
    }
  } 
  
  catch (e) {
    serverDataLoaded = true; // 데이터 로드 실패해도 저장은 허용
    console.error("데이터 로드 실패:", e);
  }
}

// 데이터를 변경한 후 호출할 통합 업데이트 함수
async function syncAndSave() {
  updateMapStats();  // 화면 업데이트 (즉각적인 피드백)
  await saveAllDataToServer(); // 서버에 전체 데이터 저장
}

// ── 맵 상단 스탯 바 업데이트 ──
// 게이지 바 + 경고 펄스 + 데이터 조각 팝업 연출 포함
let _prevData = null; // 데이터 조각 변화 감지용

window.updateMapStats = function() {
  const hpPct    = Math.max(0, Math.min(100, Math.round(playerStats.hp / playerStats.maxHp * 100)));
  const spPct    = Math.max(0, Math.min(100, Math.round(playerStats.sp / playerStats.maxSp * 100)));
  const curData  = playerStats.data || 0;

  // ── HP 게이지 ──
  const hpBar  = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-val');
  const hpPill = document.getElementById('hp-pill');
  if (hpBar)  { hpBar.style.width = hpPct + '%'; hpBar.style.background = hpPct <= 25 ? '#e24b4a' : hpPct <= 50 ? '#ef9f27' : '#1d9e75'; }
  if (hpText) hpText.textContent = playerStats.hp + ' / ' + playerStats.maxHp;
  if (hpPill) { hpPill.classList.toggle('stat-pill-danger', hpPct <= 25); }

  // ── SP 게이지 ──
  const spBar  = document.getElementById('sp-bar-fill');
  const spText = document.getElementById('sp-val');
  const spPill = document.getElementById('sp-pill');
  if (spBar)  { spBar.style.width = spPct + '%'; spBar.style.background = spPct <= 25 ? '#e24b4a' : spPct <= 50 ? '#ef9f27' : '#378add'; }
  if (spText) spText.textContent = playerStats.sp + ' / ' + playerStats.maxSp;
  if (spPill) { spPill.classList.toggle('stat-pill-danger', spPct <= 25); }

  // ── 데이터 조각 (증가 시 +N 팝업) ──
  const dataEl = document.getElementById('data-val');
  if (dataEl) dataEl.textContent = curData + '개';
  if (_prevData !== null && curData > _prevData) {
    const diff = curData - _prevData;
    if (typeof window.showDataPopup === 'function') window.showDataPopup('+' + diff + ' 💎');
  }
  _prevData = curData;

  // ── 푸앙이 호감도 ──
  const favorElement = document.getElementById('favor-display');
  if (favorElement) {
    const favorScore  = puangState.favorability || 0;
    const heartCount  = Math.floor((favorScore || 0) / 20);
    const finalHearts = Math.min(5, Math.max(0, heartCount));
    favorElement.textContent = '♥'.repeat(finalHearts) + '♡'.repeat(5 - finalHearts);
  }
};

// 함수 밖에서 페이지 로드 시 최초 1회 실행 설정
document.addEventListener('DOMContentLoaded', () => {window.updateMapStats();});

// 2. 서버에 통합 데이터 저장하기 (디바운싱 권장: 너무 자주 호출 방지)
async function saveAllDataToServer() {
  if (!GROQ_API_KEY) return;
  if (!serverDataLoaded) return; // 서버 데이터 로드 전에 저장 방지 (Firebase 값 덮어쓰기 방지)

  try {
    const dataToSave = {
      puangState: puangState,
      dailyUsage: dailyUsage,
      playerStats: {
        name: playerStats.name || localStorage.getItem('playerName') || '탐험가', // 🌟 닉네임 저장
        hp: playerStats.hp,
        maxHp: playerStats.maxHp,
        sp: playerStats.sp,
        maxSp: playerStats.maxSp,
        data: playerStats.data ?? 0,
        ownedRoomItems: playerStats.ownedRoomItems || [],
        roomDecorations: playerStats.roomDecorations || {}
      },
      inventory: inventory,
      lastUpdated: new Date()
    };

    // Firebase 저장과 동시에 localStorage도 항상 최신값으로 저장 (새로고침 시 구버전 값 읽는 것 방지)
    localStorage.setItem('playerStats', JSON.stringify(dataToSave.playerStats));
    localStorage.setItem('playerName', dataToSave.playerStats.name);
    localStorage.setItem('dailyUsage', JSON.stringify(dataToSave.dailyUsage));
    localStorage.setItem('puangState', JSON.stringify(dataToSave.puangState));

    await setDoc(doc(db, "gameData", GROQ_API_KEY), dataToSave);
    console.log("서버 데이터 구조 마이그레이션 및 닉네임 저장 완료!");
  } 
  
  catch (e) {console.error("서버 저장 실패:", e)};
}

// ── 전역 게임 스탯 ──
// 화면 간 공유되는 플레이어 수치 (HP, SP, 데이터 조각)
// 식당/의무실/체육관/전투 등 여러 화면에서 playerStats.hp 형태로 접근
const playerStats = JSON.parse(localStorage.getItem('playerStats')) || {
  name: localStorage.getItem('playerName') || '', // 로컬스토리지에 있는 닉네임을 기본값으로 연동      // 초기값 (게임 시작 시)
  hp: 60, maxHp: 60,        // 현재 HP / 최대 HP
  sp: 40, maxSp: 40,        // 현재 SP / 최대 SP
  data: 0,                  // 보유 데이터 조각 수 💎 (게임 내 화폐)
  ownedRoomItems: [],       // 구매한 방 아이템 ID 배열
  roomDecorations: {        // 현재 설치된 아이템
    background: 'default',  // 배경 테마
    // 가구 슬롯
    bed: null, desk: null, carpet: null,
    bookshelf_small: null, bookshelf_big: null,
    lamp: null, hanging_plant: null,
    // 벽 장식 슬롯
    shelf_left: null, shelf_right: null,
    painting_left: null, painting_right: null,
    wall_plant: null, hanging_deco: null,
    memo_poster: null, dreamcatcher: null,
    costume: null,
  },
};

// ── 푸앙이 상태 ──
// localStorage에서 불러오기 (없으면 기본값으로 초기화)
// 새로고침해도 호감도/아이템 카운트가 유지
const puangState = JSON.parse(localStorage.getItem('puangState')) || {
  favorability: 50,                            // 누적 호감도 (0~100), 초기 호감도 50
  itemGivenToday: { coffee: 0, snack: 0 },     // 오늘 준 아이템 횟수
  moodToday: Math.floor(Math.random() * 100),  // 오늘의 기분 (0~100, 날짜 기준으로 고정)
  moodDate: ''                                 // 마지막으로 기분이 결정된 날짜
};

// puangState가 바뀔 때마다 Firebase에 저장
// changeFavor(), giveItem(), enterRoom() 등에서 호출
window.savePuangState = function() {
  localStorage.setItem('puangState', JSON.stringify(puangState));
  saveAllDataToServer(); // 서버 저장 추가
}

// ── 일일 한도 시스템 ──
// 각 장소별 하루 최대 사용 횟수 정의 (밸런스 패치 가능)
// 날짜가 바뀌면 dailyUsage가 자동으로 초기화됨
const dailyLimits = {
  cafeteria: 3,  // 학생식당 주문 3회
  library:   5,  // 도서관 공부 5회
  gym:       3,  // 체육관 운동 3회 (휴식 제외)
  clinic:    1,  // 의무실 무료 응급처치 1회 (유료는 무제한)
  festival:  5,  // 축제 미니게임 5회
  lab2:      3,  // 공대 실험실 아이템 제조 3회
  union:     2,  // 학생회관 구매 2회
  praise:    2,  // 푸앙이 칭찬 2회
  lab:       2,   // 연구실 사용 3회
};


// 오늘 각 장소를 몇 번 사용했는지 카운트
// localStorage에 저장되어 새로고침해도 유지됨
const dailyUsage = JSON.parse(localStorage.getItem('dailyUsage')) || {
  date: '',  // 마지막으로 초기화된 날짜 (toDateString() 형식)
  cafeteria: 0, library: 0, gym: 0,
  clinic: 0, festival: 0, lab2: 0, union: 0, praise: 0,lab: 0
};


// 날짜가 바뀌었는지 확인하고, 바뀌었으면 dailyUsage 전체 초기화
// useDaily(), remainDaily() 호출 시 자동으로 실행됨
function checkAndResetDaily() {
  const today = new Date().toDateString();
  if (dailyUsage.date !== today) {
    Object.keys(dailyUsage).forEach(k => { dailyUsage[k] = 0; });
    dailyUsage.date = today;
    saveDailyUsage();
  }
  // localStorage에 저장된 이전 데이터에 새 키가 없을 경우 보완
  Object.keys(dailyLimits).forEach(k => {
    if (dailyUsage[k] === undefined) dailyUsage[k] = 0;
  });
}

// dailyUsage가 바뀔 때마다 Firebase에 저장
window.saveDailyUsage = function() {
  localStorage.setItem('dailyUsage', JSON.stringify(dailyUsage));
  saveAllDataToServer(); // 서버 저장 추가
}

// 특정 장소의 일일 한도를 체크하고 사용 횟수를 1 증가
// 사용 가능하면 true, 한도 초과면 false 반환
// 사용 예: if (!useDaily('cafeteria')) { 한도 초과 메시지 출력; return; }
function useDaily(key) {
  checkAndResetDaily();
  if (dailyUsage[key] >= dailyLimits[key]) return false;
  dailyUsage[key]++;
  saveDailyUsage();
  return true;
}

// 특정 장소의 오늘 남은 사용 횟수 반환
// 사용 예: '오늘 남은 주문 횟수: ' + remainDaily('cafeteria') + '회'
function remainDaily(key) {
  checkAndResetDaily();
  return dailyLimits[key] - dailyUsage[key];
}

// ── 인벤토리 ──
// 공대 실험실에서 제조한 아이템 목록
// localStorage에 저장되어 새로고침해도 유지됨
const inventory = JSON.parse(localStorage.getItem('cau_inventory')) || [];


// inventory가 바뀔 때마다 Firebase에 저장
// craftItem() 호출 후 실행됨
window.saveInventory = function() {
  localStorage.setItem('cau_inventory', JSON.stringify(inventory));
  saveAllDataToServer(); // 서버 저장 추가
}