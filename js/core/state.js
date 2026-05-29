// ================================================================
// state.js — 전역 상태 관리 v3
// ================================================================
//
// ╔══════════════════════════════════════════════════════════════╗
// ║  설계 원칙 (멀티 디바이스 단일 진실 원천)                    ║
// ║                                                              ║
// ║  1. Firebase = 유일한 진실 원천                              ║
// ║     - 로드 전에는 게임 화면 자체를 열지 않음 (intro.js 게이팅)║
// ║     - 로컬스토리지 초기값은 절대 Firebase를 덮어쓰지 않음     ║
// ║                                                              ║
// ║  2. 저장 타이밍                                              ║
// ║     - 일반 데이터 변경: 디바운스 0.8초                       ║
// ║     - 전투 종료 / 보상 획득: immediateSave() 즉시 저장       ║
// ║                                                              ║
// ║  3. localStorage 역할                                        ║
// ║     - UI 설정(테마, SFX 등) 기기별 보관                      ║
// ║     - 전투 복구용 임시 플래그 (inBattle 등)                  ║
// ║     - Firebase 로드 성공 후 캐시로만 갱신됨                  ║
// ║                                                              ║
// ║  4. 타임아웃                                                 ║
// ║     - Firebase 응답 5초 초과 시 로컬 캐시로 폴백             ║
// ║     - 폴백 시 화면에 경고 배너 표시                          ║
// ╚══════════════════════════════════════════════════════════════╝
//
// ┌──────────────────────────┬────────────────────────────────────┐
// │  Firebase (영구·크로스기기)│  localStorage (기기별 캐시/UI)    │
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
// │  libStudyCount / libFocus│  cauTheme         ← 기기별 UI      │
// │  playerAvatar            │  statBarCollapsed ← 기기별 UI      │
// │  monsterCompendium       │  sfxEnabled       ← 기기별 UI      │
// │  dataHistory             │                                    │
// └──────────────────────────┴────────────────────────────────────┘

// ── Groq API 키 ──
let GROQ_API_KEY = '';

// ── 로드 완료 플래그 ──
// true가 되기 전에는 게임 화면 진입 불가 (intro.js가 게이팅)
// saveAllDataToServer도 이 플래그 없이는 실행 안 됨
let serverDataLoaded = false;

// ── 디바운스 타이머 ──
let _saveDebounceTimer = null;

// ── _pendingSave 제거 이유 ──
// 이전: 로드 전 debouncedSave 호출 → _pendingSave=true → 로드 완료 후 즉시 저장
// 문제: 로컬 초기값(hp:60 등)으로 Firebase 실제 데이터를 덮어쓰는 버그 원인
// 해결: intro.js 로딩 게이트가 로드 전 게임 진입을 막으므로
//       로드 전 debouncedSave 자체가 호출될 일이 없음 → 경고만 출력하고 무시

function debouncedSave() {
  if (!serverDataLoaded) {
    console.warn('[State] 로드 완료 전 저장 시도 — 무시됨 (로컬 초기값 보호)');
    return;
  }
  if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
  _saveDebounceTimer = setTimeout(() => {
    _saveDebounceTimer = null;
    saveAllDataToServer();
  }, 800);
}

// ── 즉시 저장 (전투 종료, 보상 획득 등 손실 허용 불가 순간) ──
function immediateSave() {
  if (!serverDataLoaded) {
    console.warn('[State] 로드 완료 전 즉시 저장 시도 — 무시됨');
    return;
  }
  if (_saveDebounceTimer) { clearTimeout(_saveDebounceTimer); _saveDebounceTimer = null; }
  saveAllDataToServer();
}
window.immediateSave = immediateSave;

// ================================================================
// 1. Firebase → 로컬 데이터 로드
//    원칙: 서버값이 있으면 항상 서버값 우선. 로컬 병합 없음.
//    타임아웃: 5초 초과 시 로컬 캐시로 폴백 + 경고 배너 표시
// ================================================================
async function loadAllDataFromServer() {
  if (!GROQ_API_KEY) return;

  // ── 5초 타임아웃 ──
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), 5000)
  );

  try {
    const configSnap = await getDoc(doc(db, 'config', 'app_keys'));
    if (configSnap.exists) {
    const cfg = configSnap.data();
      window.DIFY_PUANG_CHAT_KEY   = cfg.dify_chat_key;
      window.DIFY_BATTLE_KEY       = cfg.dify_battle_key;
      window.DIFY_DIARY_KEY        = cfg.dify_diary_key;
      console.log('[Dify 키 로드]', window.DIFY_PUANG_CHAT_KEY);
    }


    const docSnap = await Promise.race([
      getDoc(doc(db, 'gameData', GROQ_API_KEY)),
      timeoutPromise
    ]);


    if (docSnap.exists) {
      const s = docSnap.data();

      // ── 플레이어 스탯 ──
      if (s.playerStats) {
        Object.assign(playerStats, s.playerStats);
        if (s.playerStats.name) {
          playerStats.name = s.playerStats.name;
          localStorage.setItem('playerName', s.playerStats.name);
        }
        // diamond → data 마이그레이션 (구버전 호환)
        // 원본 로직 그대로 유지: data 없으면 diamond 시도, 둘 다 없으면 0
        if (s.playerStats.data !== undefined)        playerStats.data = s.playerStats.data;
        else if (s.playerStats.diamond !== undefined) playerStats.data = s.playerStats.diamond;
        else                                          playerStats.data = 0;

        if (playerStats.diamond !== undefined) delete playerStats.diamond;

        // 체육관/동아리 패시브 필드 복원 (BugFix #2 유지)
        if (s.playerStats._agilityBonus !== undefined) playerStats._agilityBonus = s.playerStats._agilityBonus;
        if (s.playerStats._gymDiscount  !== undefined) playerStats._gymDiscount  = s.playerStats._gymDiscount;
        if (s.playerStats._festBonus    !== undefined) playerStats._festBonus    = s.playerStats._festBonus;

        localStorage.setItem('playerStats', JSON.stringify(playerStats));
      }

      // ── 푸앙이 상태 ──
      if (s.puangState) {
        Object.assign(puangState, s.puangState);
        localStorage.setItem('puangState', JSON.stringify(puangState));
      }

      // ── 인벤토리 ──
      if (s.inventory && Array.isArray(s.inventory)) {
        inventory.length = 0;
        s.inventory.forEach(item => inventory.push(item));
        localStorage.setItem('cau_inventory', JSON.stringify(inventory));
      }

      // ── dailyUsage ──
      // 변경: Math.max 병합 제거 → 서버값 완전 교체
      // 이유: 멀티 디바이스에서 기기A가 한도를 다 쓰면 기기B도 한도 도달처럼 보이는 문제
      //       서버의 마지막 저장값을 신뢰하고 완전 교체
      if (s.dailyUsage) {
        const today = new Date().toDateString();
        if (s.dailyUsage.date === today) {
          Object.assign(dailyUsage, s.dailyUsage);
          localStorage.setItem('dailyUsage', JSON.stringify(dailyUsage));
        }
        // 날짜 다르면 checkAndResetDaily()가 자동 초기화
      }

      // ── 영구 보존 데이터 → localStorage 캐시 갱신 ──
      if (s.achievements)    localStorage.setItem('labAchievements',      JSON.stringify(s.achievements));
      if (s.skills)          localStorage.setItem('labSkills',            JSON.stringify(s.skills));
      if (s.lakeUnlocked)    localStorage.setItem('lakeUnlocked',         'true');
      if (s.questCompleted)  localStorage.setItem('questCompleted',       JSON.stringify(s.questCompleted));
      if (s.saveSlots) {
        if (s.saveSlots.slot1) localStorage.setItem('cau_save_slot_1',    JSON.stringify(s.saveSlots.slot1));
        if (s.saveSlots.slot2) localStorage.setItem('cau_save_slot_2',    JSON.stringify(s.saveSlots.slot2));
        if (s.saveSlots.slot3) localStorage.setItem('cau_save_slot_3',    JSON.stringify(s.saveSlots.slot3));
      }

      if (s.gymStreak !== undefined)  localStorage.setItem('gymStreak',          String(s.gymStreak));
      if (s.gymLastVisit)             localStorage.setItem('gymLastVisit',        s.gymLastVisit);
      if (s.clinicVaccine)            localStorage.setItem('clinicVaccine',       JSON.stringify(s.clinicVaccine));
      if (s.clinicInsurance)          localStorage.setItem('clinicInsurance',     'true');
      if (s.lab2Recipes)              localStorage.setItem('lab2UnlockedRecipes', JSON.stringify(s.lab2Recipes));
      if (s.unionClubs)               localStorage.setItem('unionJoinedClubs',    JSON.stringify(s.unionClubs));
      if (s.libBorrowedBooks)         localStorage.setItem('libBorrowedBooks',    JSON.stringify(s.libBorrowedBooks));
      if (s.playerAvatar)             localStorage.setItem('playerAvatar',        s.playerAvatar);
      if (s.monsterCompendium)        localStorage.setItem('monsterCompendium',   JSON.stringify(s.monsterCompendium));
      if (s.dataHistory)              localStorage.setItem('dataHistory',         JSON.stringify(s.dataHistory));
      if (s.playerStats?.equippedPet !== undefined)
        playerStats.equippedPet = s.playerStats.equippedPet;
      // playerCostume: playerStats 안에 저장된 값 우선, 없으면 최상위 playerCostume 폴백
      // (이중 저장 구조 통일 — playerStats.playerCostume이 단일 진실 원천)
      const _pc = s.playerStats?.playerCostume || s.playerCostume || '';
      if (_pc) {
        playerStats.playerCostume = _pc;
        localStorage.setItem('playerCostume', _pc);
      }
      if (s.storePurchased)           localStorage.setItem('storePurchased',      JSON.stringify(s.storePurchased));

      // ── libStudyCount / libFocus ──
      // 원본 Fix 구멍2 로직 유지 + 서버값 우선으로 변경
      // 단, libDate가 없는 신규 기기도 서버값 로드되도록 조건 완화:
      //   원본: savedLibDate === today (libDate 없으면 로드 안 됨 → 신규 기기 공부 카운트 초기화 버그)
      //   수정: savedLibDate가 없거나 today면 서버값 로드 (신규 기기 보호)
      if (s.libStudyCount !== undefined || s.libFocus !== undefined) {
        const today = new Date().toDateString();
        const savedLibDate = localStorage.getItem('libDate');
        if (!savedLibDate || savedLibDate === today) {
          if (s.libStudyCount !== undefined)
            localStorage.setItem('libStudyCount', String(s.libStudyCount));
          if (s.libFocus !== undefined)
            localStorage.setItem('libFocus', String(s.libFocus));
          // libDate가 없었으면 오늘로 설정
          if (!savedLibDate) localStorage.setItem('libDate', today);
        }
      }

      // ── 청룡호 잠금 해제 동기화 (BugFix #11 유지) ──
      if (typeof placeInfo !== 'undefined' && placeInfo.bluedragonlake) {
        const isUnlocked = s.lakeUnlocked === true || localStorage.getItem('lakeUnlocked') === 'true';
        placeInfo.bluedragonlake.locked = !isUnlocked;
        if (isUnlocked) {
          const lakeBtn = document.querySelector('.map-spot[onclick*="bluedragonlake"]');
          if (lakeBtn) {
            lakeBtn.classList.remove('locked');
            const icon = lakeBtn.querySelector('.map-spot-icon');
            if (icon) icon.textContent = '🏞️';
            const badge = lakeBtn.querySelector('.map-badge');
            if (badge) badge.remove();
          }
        }
      }

      // ── 기존 유저 엔딩 영상 스킵 처리 ──
      if ((s.puangState?.favorability >= 100 || s.lakeUnlocked) && !localStorage.getItem('endingVideoPlayed')) {
        localStorage.setItem('endingVideoPlayed', 'true');
      }

      console.log('[State] Firebase 로드 완료 —', new Date().toLocaleTimeString());
    } else {
      console.log('[State] 신규 유저 — 기본값으로 시작');
    }

    serverDataLoaded = true;

    // 기존 유저 마이그레이션용 코드 — _maxData / _maxFavorability 없으면 현재값으로 초기화
    if (!playerStats._maxData) {
      playerStats._maxData = playerStats.data || 0;
    }
    if (typeof puangState !== 'undefined' && !puangState._maxFavorability) {
      puangState._maxFavorability = puangState.favorability || 0;
    }

    // _prevData 동기화 — 로드 후 updateMapStats 오발 방지 (BugFix #13 유지)
    _prevData = playerStats.data;
    if (typeof updateMapStats === 'function') updateMapStats();

  } catch (e) {
    serverDataLoaded = true; // 에러/타임아웃이어도 게임은 계속

    // ★ 기존 유저 마이그레이션 (로컬 데이터 기반)
    if (!playerStats._maxData) playerStats._maxData = playerStats.data || 0;
    if (typeof puangState !== 'undefined' && !puangState._maxFavorability) {
      puangState._maxFavorability = puangState.favorability || 0;
    }

    if (e.message === 'TIMEOUT') {
      console.warn('[State] Firebase 응답 5초 초과 — 로컬 데이터로 시작');
      // 화면에 경고 배너 표시
      _showOfflineWarning();
    } else {
      console.error('[State] 데이터 로드 실패:', e);
    }

    if (typeof showToast === 'function')
      showToast('⚠️ 서버 로드 실패 — 로컬 데이터로 시작합니다.', 'warning', 3500);

    // 로드 실패해도 _prevData 동기화
    _prevData = playerStats.data;
    if (typeof updateMapStats === 'function') updateMapStats();
  }
}

// ── 오프라인/타임아웃 경고 배너 ──
// 맵 화면 상단에 고정 표시, 3번 클릭하거나 10초 후 자동 제거
function _showOfflineWarning() {
  // DOMContentLoaded 이후에 삽입
  const insert = () => {
    if (document.getElementById('offline-warning')) return;
    const banner = document.createElement('div');
    banner.id = 'offline-warning';
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 8888;
      background: #7a3a1a; color: #ffd580;
      font-size: 13px; text-align: center;
      padding: 7px 12px; cursor: pointer;
      font-family: 'Noto Sans KR', sans-serif;
      border-bottom: 1px solid #c06020;
    `;
    banner.textContent = '⚠️ 서버 연결 실패 — 로컬 데이터로 시작됨. 진행상황이 동기화되지 않을 수 있습니다. (클릭해서 닫기)';
    banner.onclick = () => banner.remove();
    document.body.prepend(banner);
    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 10000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insert);
  } else {
    insert();
  }
}

// ================================================================
// 2. 로컬 데이터 → Firebase 저장
//    원칙: serverDataLoaded=true 전에는 절대 실행 안 됨
// ================================================================
async function saveAllDataToServer() {
  if (!GROQ_API_KEY) return;
  if (!serverDataLoaded) {
    console.warn('[State] 로드 완료 전 저장 차단');
    return;
  }

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
        gender:             playerStats.gender || 'male',
        playerCostume:      playerStats.playerCostume       || '',
        equippedPet:        playerStats.equippedPet          || '',
        ownedRoomItems:     playerStats.ownedRoomItems     || [],
        roomDecorations:    playerStats.roomDecorations    || {},
        statusEffects:      playerStats.statusEffects      || [],
        _battleWins:        playerStats._battleWins        || 0,
        _explorationCount:  playerStats._explorationCount  || 0,
        _regenPerTurn:      playerStats._regenPerTurn      || 0,
        _battleBonusReward: playerStats._battleBonusReward || 0,
        unionBonusDmg:      playerStats.unionBonusDmg      || 0,
        unionBonusStudy:    playerStats.unionBonusStudy    || 0,
        _slotLucky:         playerStats._slotLucky         || false,
        _libTimeBonus:      playerStats._libTimeBonus      || 0,
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
      gymStreak:         parseInt(localStorage.getItem('gymStreak')              || '0'),
      gymLastVisit:      localStorage.getItem('gymLastVisit')                    || '',
      clinicVaccine:     JSON.parse(localStorage.getItem('clinicVaccine')        || 'null'),
      clinicInsurance:   localStorage.getItem('clinicInsurance') === 'true',
      lab2Recipes:       JSON.parse(localStorage.getItem('lab2UnlockedRecipes')  || '[]'),
      unionClubs:        JSON.parse(localStorage.getItem('unionJoinedClubs')     || '[]'),
      libBorrowedBooks:  JSON.parse(localStorage.getItem('libBorrowedBooks')     || '[]'),
      playerAvatar:      localStorage.getItem('playerAvatar')                    || '🧑‍💻',
      monsterCompendium: JSON.parse(localStorage.getItem('monsterCompendium')    || '{}'),
      dataHistory:       JSON.parse(localStorage.getItem('dataHistory')          || '[]'),
      libStudyCount:     parseInt(localStorage.getItem('libStudyCount') || '0'),
      libFocus:          parseInt(localStorage.getItem('libFocus')      || '100'),
      playerCostume:     localStorage.getItem('playerCostume')                   || '',
      storePurchased:    JSON.parse(localStorage.getItem('storePurchased')       || '[]'),

      lastUpdated: new Date(),
      lastDevice:  navigator.userAgent.slice(0, 80), // 마지막 저장 기기 추적
    };

    // localStorage 캐시 동시 갱신
    localStorage.setItem('playerStats',   JSON.stringify(dataToSave.playerStats));
    localStorage.setItem('playerName',    dataToSave.playerStats.name);
    localStorage.setItem('puangState',    JSON.stringify(dataToSave.puangState));
    localStorage.setItem('dailyUsage',    JSON.stringify(dataToSave.dailyUsage));
    localStorage.setItem('cau_inventory', JSON.stringify(dataToSave.inventory));

    await setDoc(doc(db, 'gameData', GROQ_API_KEY), dataToSave);
    console.log('[State] Firebase 저장 완료 —', new Date().toLocaleTimeString());

  } catch (e) {
    console.error('[State] 서버 저장 실패:', e);
    if (typeof showToast === 'function')
      showToast('⚠️ 서버 저장 실패 — 데이터는 로컬에 보관됩니다.', 'warning', 4000);
  }
}

// ================================================================
// 통합 업데이트 함수
// ================================================================

// 일반 데이터 변경 후 호출 (0.8초 디바운스)
function syncAndSave() {
  updateMapStats();
  debouncedSave();
}
window.syncAndSave = syncAndSave;

// 중요 데이터 변경 후 호출 (전투 승리, 보상 등 — 즉시 저장)
function syncAndSaveNow() {
  updateMapStats();
  immediateSave();
}
window.syncAndSaveNow = syncAndSaveNow;

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
// 전역 변수 초기값
// 주의: 이 값들은 intro.js 로딩 게이트가 뜨는 동안의 임시값.
//       loadAllDataFromServer() 완료 후 반드시 서버값으로 덮어씌워짐.
// ================================================================

// ── 플레이어 스탯 ──
const playerStats = JSON.parse(localStorage.getItem('playerStats')) || {
  name:    localStorage.getItem('playerName') || '',
  hp: 60,  maxHp: 60,
  sp: 40,  maxSp: 40,
  data: 0,
  gender: 'male',
  playerCostume: '',
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

  // 호감도 100 달성 시 플래그만 저장 (영상은 맵 복귀 시 재생)
  if (puangState.favorability >= 100 && !localStorage.getItem('lakeUnlocked') && !localStorage.getItem('endingVideoPlayed')) {
    localStorage.setItem('lakeUnlocked', 'true');
    localStorage.setItem('endingVideoPending', 'true');

    if (typeof placeInfo !== 'undefined' && placeInfo.bluedragonlake) {
      placeInfo.bluedragonlake.locked = false;
      const btn = document.querySelector('.map-spot[onclick*="bluedragonlake"]');
      if (btn) btn.classList.remove('locked');
    }
  }

  debouncedSave();
};

// ── 일일 한도 ──
const dailyLimits = {
  cafeteria: 3, library: 5, gym:  3,
  clinic:    1, festival: 5, lab2: 3,
  union:     2, praise:   2, lab:  2,
  dormitory: 3,        // BugFix #6: 미등록 시 청룡호 산책 무한 반복 허용 버그
  lake_meditate: 1,    // 청룡호 명상 — 하루 1회
};

const dailyUsage = JSON.parse(localStorage.getItem('dailyUsage')) || {
  date:      '',
  cafeteria: 0, library: 0, gym:  0,
  clinic:    0, festival: 0, lab2: 0,
  union:     0, praise:   0, lab:  0,
  dormitory: 0,
  lake_meditate: 0,
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

// window 노출 (Fix #2 유지: 타 파일에서 안전하게 호출 가능하도록)
window.loadAllDataFromServer = loadAllDataFromServer;
window.saveAllDataToServer   = saveAllDataToServer;
