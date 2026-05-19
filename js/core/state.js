// ================================================================
// state.js — 전역 상태 관리
// 게임 전체에서 공유되는 변수와 localStorage 연동 함수 모음
// ================================================================

// ── Groq API 키 ──
let GROQ_API_KEY = '';
let serverDataLoaded = false; // 서버 데이터 로드 완료 전 저장 방지

// ================================================================
// ★ Fix: 디바운싱 — 1.5초 내 중복 saveAllDataToServer 호출을 1번으로 압축
// 한 번의 게임 액션에서 Firebase write가 여러 번 발생하던 문제 해결
// ================================================================
let _saveDebounceTimer = null;
function debouncedSave() {
  if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => {
    _saveDebounceTimer = null;
    saveAllDataToServer();
  }, 1500);
}

// ================================================================
// 1. 서버에서 모든 데이터를 한꺼번에 불러오기
// ★ Fix: docSnap.exists() 괄호 추가 (compat SDK는 함수로 호출해야 함)
// ★ Fix: 로드 중 savePuangState/saveDailyUsage → localStorage만 백업
//         (serverDataLoaded = false 상태에서 saveAllDataToServer가 호출되어
//          타이밍에 따라 로드 직후 데이터가 덮어써지는 버그 방지)
// ★ Fix: 신규 유저(문서 없음)도 serverDataLoaded = true 처리
// ================================================================
async function loadAllDataFromServer() {
  if (!GROQ_API_KEY) return;

  try {
    const docSnap = await getDoc(doc(db, 'gameData', GROQ_API_KEY));

    if (docSnap.exists()) {                      // ★ Fix: () 추가
      const serverData = docSnap.data();

      if (serverData.puangState) {
        Object.assign(puangState, serverData.puangState);
        localStorage.setItem('puangState', JSON.stringify(puangState)); // ★ Fix: localStorage만
      }

      if (serverData.dailyUsage) {
        Object.assign(dailyUsage, serverData.dailyUsage);
        localStorage.setItem('dailyUsage', JSON.stringify(dailyUsage)); // ★ Fix: localStorage만
      }

      if (serverData.playerStats) {
        Object.assign(playerStats, serverData.playerStats);

        if (serverData.playerStats.name) {
          playerStats.name = serverData.playerStats.name;
          localStorage.setItem('playerName', serverData.playerStats.name);
        }

        // diamond → data 마이그레이션 유지
        if (serverData.playerStats.data !== undefined) {
          playerStats.data = serverData.playerStats.data;
        } else if (serverData.playerStats.diamond !== undefined) {
          playerStats.data = serverData.playerStats.diamond;
        } else {
          playerStats.data = 0;
        }

        if (playerStats.diamond !== undefined) delete playerStats.diamond;
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
      }

      if (serverData.inventory && Array.isArray(serverData.inventory)) {
        inventory.length = 0;
        serverData.inventory.forEach(item => inventory.push(item));
        localStorage.setItem('cau_inventory', JSON.stringify(inventory));
      }

      console.log('서버 데이터 로드 완료');
    } else {
      // ★ Fix: 신규 유저 — 문서 없어도 serverDataLoaded = true 처리
      console.log('신규 유저 — 기본값으로 시작');
    }

    // ★ Fix: 기존/신규 유저 모두 여기서 true (try 블록 안에서 처리)
    serverDataLoaded = true;
    if (typeof updateMapStats === 'function') updateMapStats();

  } catch (e) {
    serverDataLoaded = true; // 실패해도 저장은 허용
    console.error('데이터 로드 실패:', e);
    if (typeof showToast === 'function') showToast('⚠️ 서버 로드 실패 — 로컬 데이터로 시작합니다.', 'warning', 3500);
  }
}

// ================================================================
// 데이터를 변경한 후 호출할 통합 업데이트 함수
// ★ Fix: await 제거 + debouncedSave 사용 (즉각 UI 반영, 저장은 디바운싱)
// ================================================================
function syncAndSave() {
  updateMapStats();
  debouncedSave();
}
window.syncAndSave = syncAndSave;

// ── 맵 상단 스탯 바 업데이트 ──
let _prevData = null;

window.updateMapStats = function() {
  const hpPct   = Math.max(0, Math.min(100, Math.round(playerStats.hp / playerStats.maxHp * 100)));
  const spPct   = Math.max(0, Math.min(100, Math.round(playerStats.sp / playerStats.maxSp * 100)));
  const curData = playerStats.data || 0;

  const hpBar  = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-val');
  const hpPill = document.getElementById('hp-pill');
  if (hpBar)  { hpBar.style.width = hpPct + '%'; hpBar.style.background = hpPct <= 25 ? '#e24b4a' : hpPct <= 50 ? '#ef9f27' : '#1d9e75'; }
  if (hpText) hpText.textContent = playerStats.hp + ' / ' + playerStats.maxHp;
  if (hpPill) hpPill.classList.toggle('stat-pill-danger', hpPct <= 25);

  const spBar  = document.getElementById('sp-bar-fill');
  const spText = document.getElementById('sp-val');
  const spPill = document.getElementById('sp-pill');
  if (spBar)  { spBar.style.width = spPct + '%'; spBar.style.background = spPct <= 25 ? '#e24b4a' : spPct <= 50 ? '#ef9f27' : '#378add'; }
  if (spText) spText.textContent = playerStats.sp + ' / ' + playerStats.maxSp;
  if (spPill) spPill.classList.toggle('stat-pill-danger', spPct <= 25);

  const dataEl = document.getElementById('data-val');
  if (dataEl) dataEl.textContent = curData + '개';
  if (_prevData !== null && curData > _prevData) {
    const diff = curData - _prevData;
    if (typeof window.showDataPopup === 'function') window.showDataPopup('+' + diff + ' 💎');
  }
  _prevData = curData;

  const favorElement = document.getElementById('favor-display');
  if (favorElement) {
    const favorScore  = puangState.favorability || 0;
    const heartCount  = Math.floor(favorScore / 20);
    const finalHearts = Math.min(5, Math.max(0, heartCount));
    favorElement.textContent = '♥'.repeat(finalHearts) + '♡'.repeat(5 - finalHearts);
  }
};

document.addEventListener('DOMContentLoaded', () => { window.updateMapStats(); });

// ================================================================
// 2. 서버에 통합 데이터 저장
// ★ Fix: 저장 실패 시 토스트 알림 추가
// ================================================================
async function saveAllDataToServer() {
  if (!GROQ_API_KEY) return;
  if (!serverDataLoaded) return;

  try {
    const dataToSave = {
      puangState:  puangState,
      dailyUsage:  dailyUsage,
      playerStats: {
        name:               playerStats.name || localStorage.getItem('playerName') || '탐험가',
        hp:                 playerStats.hp,
        maxHp:              playerStats.maxHp,
        sp:                 playerStats.sp,
        maxSp:              playerStats.maxSp,
        data:               playerStats.data ?? 0,
        ownedRoomItems:     playerStats.ownedRoomItems || [],
        roomDecorations:    playerStats.roomDecorations || {},
        statusEffects:      playerStats.statusEffects || [],
        _battleWins:        playerStats._battleWins || 0,
        _explorationCount:  playerStats._explorationCount || 0,
        _regenPerTurn:      playerStats._regenPerTurn || 0,
        _battleBonusReward: playerStats._battleBonusReward || 0,
        unionBonusDmg:      playerStats.unionBonusDmg || 0,
        _slotLucky:         playerStats._slotLucky || false,
        _libTimeBonus:      playerStats._libTimeBonus || 0,
      },
      inventory:   inventory,
      lastUpdated: new Date(),
    };

    // localStorage 최신화
    localStorage.setItem('playerStats',   JSON.stringify(dataToSave.playerStats));
    localStorage.setItem('playerName',    dataToSave.playerStats.name);
    localStorage.setItem('dailyUsage',    JSON.stringify(dataToSave.dailyUsage));
    localStorage.setItem('puangState',    JSON.stringify(dataToSave.puangState));
    localStorage.setItem('cau_inventory', JSON.stringify(dataToSave.inventory));

    await setDoc(doc(db, 'gameData', GROQ_API_KEY), dataToSave);
    console.log('Firebase 저장 완료');
  } catch (e) {
    console.error('서버 저장 실패:', e);
    // ★ Fix: 저장 실패 시 유저에게 알림
    if (typeof showToast === 'function') showToast('⚠️ 서버 저장 실패 — 데이터는 로컬에 보관됩니다.', 'warning', 4000);
  }
}

// ── 전역 게임 스탯 ──
const playerStats = JSON.parse(localStorage.getItem('playerStats')) || {
  name:    localStorage.getItem('playerName') || '',
  hp: 60,  maxHp: 60,
  sp: 40,  maxSp: 40,
  data: 0,
  ownedRoomItems: [],
  roomDecorations: {
    background: 'default',
    bed: null, desk: null, carpet: null,
    bookshelf_small: null, bookshelf_big: null,
    lamp: null, hanging_plant: null,
    shelf_left: null, shelf_right: null,
    painting_left: null, painting_right: null,
    wall_plant: null, hanging_deco: null,
    memo_poster: null, dreamcatcher: null,
    costume: null,
  },
};

// ── 푸앙이 상태 ──
const puangState = JSON.parse(localStorage.getItem('puangState')) || {
  favorability:   50,
  itemGivenToday: { coffee: 0, snack: 0 },
  moodToday:      Math.floor(Math.random() * 100),
  moodDate:       '',
};

// ★ Fix: savePuangState — Firebase 직접 호출 대신 debouncedSave 사용
window.savePuangState = function() {
  localStorage.setItem('puangState', JSON.stringify(puangState));
  debouncedSave();
};

// ── 일일 한도 시스템 ──
const dailyLimits = {
  cafeteria: 3, library: 5, gym: 3,
  clinic: 1,    festival: 5, lab2: 3,
  union: 2,     praise: 2,   lab: 2,
};

const dailyUsage = JSON.parse(localStorage.getItem('dailyUsage')) || {
  date: '',
  cafeteria: 0, library: 0, gym: 0,
  clinic: 0,    festival: 0, lab2: 0,
  union: 0,     praise: 0,   lab: 0,
};

function checkAndResetDaily() {
  const today = new Date().toDateString();
  if (dailyUsage.date !== today) {
    Object.keys(dailyUsage).forEach(k => { dailyUsage[k] = 0; });
    dailyUsage.date = today;
    saveDailyUsage();
  }
  Object.keys(dailyLimits).forEach(k => {
    if (dailyUsage[k] === undefined) dailyUsage[k] = 0;
  });
}

// ★ Fix: saveDailyUsage — Firebase 직접 호출 대신 debouncedSave 사용
window.saveDailyUsage = function() {
  localStorage.setItem('dailyUsage', JSON.stringify(dailyUsage));
  debouncedSave();
};

function useDaily(key) {
  checkAndResetDaily();
  if (dailyUsage[key] >= dailyLimits[key]) return false;
  dailyUsage[key]++;
  saveDailyUsage();
  return true;
}

function remainDaily(key) {
  checkAndResetDaily();
  return dailyLimits[key] - dailyUsage[key];
}

// ── 인벤토리 ──
const inventory = JSON.parse(localStorage.getItem('cau_inventory')) || [];

// ★ Fix: saveInventory — Firebase 직접 호출 대신 debouncedSave 사용
window.saveInventory = function() {
  localStorage.setItem('cau_inventory', JSON.stringify(inventory));
  debouncedSave();
};
