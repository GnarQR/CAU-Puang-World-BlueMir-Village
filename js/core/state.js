// ================================================================
// state.js — 전역 상태 관리
// ================================================================
//
// ┌──────────────────────────┬────────────────────────────────────┐
// │  Firebase (영구)         │  localStorage (임시/기기별)        │
// ├──────────────────────────┼────────────────────────────────────┤
// │  playerStats             │  groqApiKey       ← 민감 정보      │
// │  puangState              │  dailyUsage       ← 오늘만 유효    │
// │  inventory               │  libStudyCount    ← 오늘만         │
// │  achievements            │  libFocus         ← 오늘만         │
// │  skills                  │  cafVisitTotal    ← 오늘만         │
// │  lakeUnlocked            │  cafFreeTicket    ← 오늘만         │
// │  questCompleted          │  cafOvereat       ← 오늘만         │
// │  saveSlots (1~3)         │  festLimitedBought← 오늘만         │
// │  gymStreak               │  festDoubleBuff   ← 만료시간       │
// │  gymLastVisit            │  gymEventWeek     ← 이번주만       │
// │  clinicVaccine           │  storeStock       ← 오늘만         │
// │  clinicInsurance         │  union_booth_*    ← 오늘만         │
// │  lab2Recipes             │  union_sale_*     ← 이번주만       │
// │  unionClubs              │  inBattle         ← 임시 복구      │
// │  libBorrowedBooks        │  battleOrigin     ← 임시 복구      │
// │  playerAvatar            │  cauTheme         ← 기기별 UI      │
// │  monsterCompendium       │  statBarCollapsed ← 기기별 UI      │
// │  dataHistory             │  sfxEnabled       ← 기기별 UI      │
// └──────────────────────────┴────────────────────────────────────┘

// ── Groq API 키 ──
let GROQ_API_KEY = '';
let serverDataLoaded = false;

// ================================================================
// 디바운싱 — 1.5초 내 중복 Firebase write를 1번으로 압축
// ================================================================
let _saveDebounceTimer = null;
// ★ Fix 구멍3: serverDataLoaded 전 debouncedSave 호출 시 저장이 조용히 무시되는 문제
//   기존: saveAllDataToServer 첫 줄에서 !serverDataLoaded면 그냥 return
//   수정: 로드 전이면 _pendingSave 플래그를 세워두고 로드 완료 후 자동 1회 저장
let _pendingSave = false;
function debouncedSave() {
  if (!serverDataLoaded) {
    _pendingSave = true; // 로드 완료 후 저장하도록 예약
    return;
  }
  if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => {
    _saveDebounceTimer = null;
    saveAllDataToServer();
  }, 1500);
}

// ================================================================
// 1. Firebase → 로컬 데이터 로드
// ================================================================
async function loadAllDataFromServer() {
  if (!GROQ_API_KEY) return;

  try {
    const docSnap = await getDoc(doc(db, 'gameData', GROQ_API_KEY));

    if (docSnap.exists) {
      const s = docSnap.data();  // s = serverData

      // ── 핵심 게임 데이터 ──
      if (s.playerStats) {
        Object.assign(playerStats, s.playerStats);
        if (s.playerStats.name) {
          playerStats.name = s.playerStats.name;
          localStorage.setItem('playerName', s.playerStats.name);
        }
        // diamond → data 마이그레이션
        if (s.playerStats.data !== undefined)        playerStats.data = s.playerStats.data;
        else if (s.playerStats.diamond !== undefined) playerStats.data = s.playerStats.diamond;
        else                                          playerStats.data = 0;
        if (playerStats.diamond !== undefined) delete playerStats.diamond;
        // ★ BugFix #2: 체육관/동아리 패시브 필드 복원 (저장 추가와 짝을 이루는 로드 처리)
        if (s.playerStats._agilityBonus !== undefined) playerStats._agilityBonus = s.playerStats._agilityBonus;
        if (s.playerStats._gymDiscount  !== undefined) playerStats._gymDiscount  = s.playerStats._gymDiscount;
        if (s.playerStats._festBonus    !== undefined) playerStats._festBonus    = s.playerStats._festBonus;
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
      }

      if (s.puangState) {
        Object.assign(puangState, s.puangState);
        localStorage.setItem('puangState', JSON.stringify(puangState));
      }

      if (s.inventory && Array.isArray(s.inventory)) {
        inventory.length = 0;
        s.inventory.forEach(item => inventory.push(item));
        localStorage.setItem('cau_inventory', JSON.stringify(inventory));
      }

      // dailyUsage: 날짜 같을 때만 복원
      // ★ Fix #12: 멀티 디바이스 동기화 — 같은 날짜면 서버/로컬 중 더 높은 값(max)으로 병합
      //   예) A기기에서 도서관 3회, B기기에서 2회 → 서버값(3)으로 덮어쓰지 않고 max(3,2)=3 유지
      if (s.dailyUsage) {
        const today = new Date().toDateString();
        if (s.dailyUsage.date === today) {
          Object.keys(s.dailyUsage).forEach(k => {
            if (k === 'date') return;
            // 숫자 필드: 서버와 로컬 중 더 큰 값 사용 (중복 차감 방지)
            if (typeof s.dailyUsage[k] === 'number' && typeof dailyUsage[k] === 'number') {
              dailyUsage[k] = Math.max(dailyUsage[k], s.dailyUsage[k]);
            } else {
              dailyUsage[k] = s.dailyUsage[k];
            }
          });
          dailyUsage.date = today;
          localStorage.setItem('dailyUsage', JSON.stringify(dailyUsage));
        }
        // 날짜가 다르면 로컬 초기화 (checkAndResetDaily가 처리)
      }

      // ── 영구 보존 데이터 → localStorage 복원 ──
      if (s.achievements)       localStorage.setItem('labAchievements',     JSON.stringify(s.achievements));
      if (s.skills)             localStorage.setItem('labSkills',           JSON.stringify(s.skills));
      if (s.lakeUnlocked)       localStorage.setItem('lakeUnlocked',        'true');
      if (s.questCompleted)     localStorage.setItem('questCompleted',      JSON.stringify(s.questCompleted));
      if (s.saveSlots) {
        if (s.saveSlots.slot1)  localStorage.setItem('cau_save_slot_1',     JSON.stringify(s.saveSlots.slot1));
        if (s.saveSlots.slot2)  localStorage.setItem('cau_save_slot_2',     JSON.stringify(s.saveSlots.slot2));
        if (s.saveSlots.slot3)  localStorage.setItem('cau_save_slot_3',     JSON.stringify(s.saveSlots.slot3));
      }

      // ── 추가 영구 데이터 → localStorage 복원 ──
      if (s.gymStreak !== undefined) localStorage.setItem('gymStreak',      String(s.gymStreak));
      if (s.gymLastVisit)            localStorage.setItem('gymLastVisit',   s.gymLastVisit);
      if (s.clinicVaccine)           localStorage.setItem('clinicVaccine',  JSON.stringify(s.clinicVaccine));
      if (s.clinicInsurance)         localStorage.setItem('clinicInsurance','true');
      if (s.lab2Recipes)             localStorage.setItem('lab2UnlockedRecipes', JSON.stringify(s.lab2Recipes));
      if (s.unionClubs)              localStorage.setItem('unionJoinedClubs',    JSON.stringify(s.unionClubs));
      if (s.libBorrowedBooks)        localStorage.setItem('libBorrowedBooks',    JSON.stringify(s.libBorrowedBooks));
      if (s.playerAvatar)            localStorage.setItem('playerAvatar',        s.playerAvatar);
      if (s.monsterCompendium)       localStorage.setItem('monsterCompendium',   JSON.stringify(s.monsterCompendium));
      if (s.dataHistory)             localStorage.setItem('dataHistory',         JSON.stringify(s.dataHistory));

      // ★ Fix 구멍2: libStudyCount / libFocus 복원
      //   날짜가 같을 때만 복원 (날짜 바뀌면 locations.js의 enterLibrary에서 초기화)
      if (s.libStudyCount !== undefined || s.libFocus !== undefined) {
        const today = new Date().toDateString();
        const savedLibDate = localStorage.getItem('libDate');
        if (savedLibDate === today) {
          // 같은 날짜면 서버/로컬 중 더 큰 값 사용 (멀티 디바이스 보호)
          if (s.libStudyCount !== undefined) {
            const localCount = parseInt(localStorage.getItem('libStudyCount') || '0');
            localStorage.setItem('libStudyCount', String(Math.max(localCount, s.libStudyCount)));
          }
          if (s.libFocus !== undefined) {
            const localFocus = parseInt(localStorage.getItem('libFocus') || '100');
            // libFocus는 낮을수록 더 공부한 것 — 더 낮은 값(더 많이 공부한 기기) 사용
            localStorage.setItem('libFocus', String(Math.min(localFocus, s.libFocus)));
          }
        }
      }
      
      // ★ BugFix #11: Firebase 로드 완료 후 placeInfo.bluedragonlake.locked 재설정
      //  문제: locations.js 파일 로드 시 1회만 실행 → 다른 기기에서 lakeUnlocked가
      //  Firebase로 복원돼도 placeInfo.locked가 true로 고정될 수 있음
      //  사이드이펙트: 없음 — placeInfo가 정의된 경우에만 실행
      if (typeof placeInfo !== 'undefined' && placeInfo.bluedragonlake) {
        const isUnlocked = s.lakeUnlocked === true || localStorage.getItem('lakeUnlocked') === 'true';
        placeInfo.bluedragonlake.locked = !isUnlocked;
        
        if (isUnlocked) {  // 맵 버튼 locked 클래스도 동기화
          const lakeBtn = document.querySelector('.map-spot[onclick*="bluedragonlake"]');
          if (lakeBtn) lakeBtn.classList.remove('locked');
        }
      }

      console.log('Firebase 로드 완료');
    } else {
      console.log('신규 유저 — 기본값으로 시작');
    }

    serverDataLoaded = true;
    // ★ Fix 구멍3: 로드 전에 예약된 저장이 있으면 즉시 실행
    if (_pendingSave) {
      _pendingSave = false;
      saveAllDataToServer();
    }

    // ★ Fix #13: 서버 로드 완료 후 _prevData를 현재 data값으로 맞춰
    //   이유: loadAllDataFromServer 완료 후 updateMapStats 재호출 시 _prevData=null(초기값)이고
    //   서버 data가 양수이면 "💎 +N 획득" 팝업이 오발됨 — 실제 획득이 아님에도 표시
    //   해결: updateMapStats 호출 전 _prevData를 현재 data로 동기화해 diff=0 으로 만듦
    _prevData = playerStats.data;
    if (typeof updateMapStats === 'function') updateMapStats();
  }
   
  catch (e) {
    serverDataLoaded = true;
    // ★ Fix 구멍3: 로드 실패해도 예약된 저장 처리 (로컬 데이터라도 보존)
    if (_pendingSave) { _pendingSave = false; saveAllDataToServer(); }
    console.error('데이터 로드 실패:', e);
    if (typeof showToast === 'function') showToast('⚠️ 서버 로드 실패 — 로컬 데이터로 시작합니다.', 'warning', 3500);
  }
}

// ================================================================
// 2. 로컬 데이터 → Firebase 저장
// ================================================================
async function saveAllDataToServer() {
  if (!GROQ_API_KEY) return;
  if (!serverDataLoaded) return;

  try {
    const dataToSave = {

      // ── 핵심 게임 데이터 ──
      playerStats: {
        name:               playerStats.name || localStorage.getItem('playerName') || '탐험가',
        hp:                 playerStats.hp,
        maxHp:              playerStats.maxHp,
        sp:                 playerStats.sp,
        maxSp:              playerStats.maxSp,
        data:               playerStats.data ?? 0,
        ownedRoomItems:     playerStats.ownedRoomItems     || [],
        roomDecorations:    playerStats.roomDecorations    || {},
        statusEffects:      playerStats.statusEffects      || [],
        _battleWins:        playerStats._battleWins        || 0,
        _explorationCount:  playerStats._explorationCount  || 0,
        _regenPerTurn:      playerStats._regenPerTurn      || 0,
        _battleBonusReward: playerStats._battleBonusReward || 0,
        unionBonusDmg:      playerStats.unionBonusDmg      || 0,
        unionBonusStudy:    playerStats.unionBonusStudy    || 0,  // ★ Fix 구멍1: 집중력 교재 효과 Firebase 저장
        _slotLucky:         playerStats._slotLucky         || false,
        _libTimeBonus:      playerStats._libTimeBonus      || 0,
        // ★ BugFix #2: 아래 세 필드가 누락되어 체육관/동아리 패시브가 새로고침 후 초기화되던 버그 수정
        //   사이드이펙트 없음 — 기존 필드에 추가만 하는 변경
        _agilityBonus:      playerStats._agilityBonus      || 0,
        _gymDiscount:       playerStats._gymDiscount       || 0,
        _festBonus:         playerStats._festBonus         || 0,
      },

      puangState:  puangState,
      inventory:   inventory,
      dailyUsage:  dailyUsage,

      // ── 영구 보존 데이터 ──
      achievements:       JSON.parse(localStorage.getItem('labAchievements')      || '[]'),
      skills:             JSON.parse(localStorage.getItem('labSkills')            || '[]'),
      lakeUnlocked:       localStorage.getItem('lakeUnlocked') === 'true',
      questCompleted:     JSON.parse(localStorage.getItem('questCompleted')       || '{}'),
      saveSlots: {
        slot1: JSON.parse(localStorage.getItem('cau_save_slot_1') || 'null'),
        slot2: JSON.parse(localStorage.getItem('cau_save_slot_2') || 'null'),
        slot3: JSON.parse(localStorage.getItem('cau_save_slot_3') || 'null'),
      },

      // ── 추가 영구 데이터 ──
      gymStreak:          parseInt(localStorage.getItem('gymStreak')              || '0'),
      gymLastVisit:       localStorage.getItem('gymLastVisit')                    || '',
      clinicVaccine:      JSON.parse(localStorage.getItem('clinicVaccine')        || 'null'),
      clinicInsurance:    localStorage.getItem('clinicInsurance') === 'true',
      lab2Recipes:        JSON.parse(localStorage.getItem('lab2UnlockedRecipes')  || '[]'),
      unionClubs:         JSON.parse(localStorage.getItem('unionJoinedClubs')     || '[]'),
      libBorrowedBooks:   JSON.parse(localStorage.getItem('libBorrowedBooks')     || '[]'),
      playerAvatar:       localStorage.getItem('playerAvatar')                    || '🧑‍💻',
      monsterCompendium:  JSON.parse(localStorage.getItem('monsterCompendium')    || '{}'),
      dataHistory:        JSON.parse(localStorage.getItem('dataHistory')          || '[]'),

      // ★ Fix 구멍2: libStudyCount / libFocus를 Firebase에도 저장
      //   기존: localStorage에만 저장 → 다른 기기 접속 시 초기화, 업적 달성 누락
      libStudyCount:      parseInt(localStorage.getItem('libStudyCount') || '0'),
      libFocus:           parseInt(localStorage.getItem('libFocus')      || '100'),

      lastUpdated: new Date(),
    };

    // localStorage도 동시에 최신화
    localStorage.setItem('playerStats',   JSON.stringify(dataToSave.playerStats));
    localStorage.setItem('playerName',    dataToSave.playerStats.name);
    localStorage.setItem('puangState',    JSON.stringify(dataToSave.puangState));
    localStorage.setItem('dailyUsage',    JSON.stringify(dataToSave.dailyUsage));
    localStorage.setItem('cau_inventory', JSON.stringify(dataToSave.inventory));

    await setDoc(doc(db, 'gameData', GROQ_API_KEY), dataToSave);
    console.log('Firebase 저장 완료');

  } catch (e) {
    console.error('서버 저장 실패:', e);
    if (typeof showToast === 'function') showToast('⚠️ 서버 저장 실패 — 데이터는 로컬에 보관됩니다.', 'warning', 4000);
  }
}

// ================================================================
// 통합 업데이트 함수 — 데이터 변경 후 항상 이걸 호출
// ================================================================
function syncAndSave() {
  updateMapStats();
  debouncedSave();
}
window.syncAndSave = syncAndSave;

// ================================================================
// 맵 상단 스탯 바 업데이트
// ================================================================
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
// 전역 변수 — localStorage 초기값 로드
// ================================================================

// ── 플레이어 스탯 ──
const playerStats = JSON.parse(localStorage.getItem('playerStats')) || {
  name:    localStorage.getItem('playerName') || '',
  hp: 60,  maxHp: 60,
  sp: 40,  maxSp: 40,
  data: 0,
  ownedRoomItems: [],
  roomDecorations: {
    background:      'default',
    bed:             null, desk:           null, carpet:         null,
    bookshelf_small: null, bookshelf_big:  null,
    lamp:            null, hanging_plant:  null,
    shelf_left:      null, shelf_right:    null,
    painting_left:   null, painting_right: null,
    wall_plant:      null, hanging_deco:   null,
    memo_poster:     null, dreamcatcher:   null,
    costume:         null,
  },
};

// ── 푸앙이 상태 ──
const puangState = JSON.parse(localStorage.getItem('puangState')) || {
  favorability:   50,
  itemGivenToday: { coffee: 0, snack: 0 },
  moodToday:      Math.floor(Math.random() * 100),
  moodDate:       '',
};

window.savePuangState = function() {
  localStorage.setItem('puangState', JSON.stringify(puangState));
  debouncedSave();
};

// ── 일일 한도 ──
const dailyLimits = {
  cafeteria: 3, library: 5, gym:  3,
  clinic:    1, festival: 5, lab2: 3,
  union:     2, praise:   2, lab:  2,
  // ★ BugFix #6: dormitory 키 추가 — 미등록 시 useDaily('dormitory')가 항상 통과되어 청룡호 산책 무한 반복 허용
  dormitory: 3,
  lake_meditate: 1,  // 청룡호 명상 — 하루 1회
};

const dailyUsage = JSON.parse(localStorage.getItem('dailyUsage')) || {
  date:      '',
  cafeteria: 0, library: 0, gym:  0,
  clinic:    0, festival: 0, lab2: 0,
  union:     0, praise:   0, lab:  0,
  // ★ BugFix #6: dailyLimits와 키 일치
  dormitory: 0,
  lake_meditate: 0,  // 청룡호 명상
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

window.saveInventory = function() {
  localStorage.setItem('cau_inventory', JSON.stringify(inventory));
  debouncedSave();
};

// ★ Fix #2: loadAllDataFromServer / saveAllDataToServer를 window에 명시 노출
//   기존: 일반 async function 선언 → 타 파일에서 스코프 격리 시 접근 불가 위험
//   수정: window에 붙여 어느 파일에서든 typeof 체크 없이 안전하게 호출 가능
window.loadAllDataFromServer = loadAllDataFromServer;
window.saveAllDataToServer   = saveAllDataToServer;
