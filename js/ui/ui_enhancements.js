// ================================================================
// ui_enhancements.js — UI 개선 모음
// 1. 토스트 알림 시스템
// 2. 다크 / 라이트 테마 토글
// 3. 장소 입장 페이드 전환 + 진입 아이콘 연출
// 4. 일일 리셋 카운트다운 타이머
// 5. 데이터 조각 +N 팝업 (updateMapStats에서 호출)
// ================================================================


// ================================================================
// 1. 토스트 알림 시스템
// ================================================================

/**
 * showToast(msg, type, duration)
 * type: 'success' | 'error' | 'warning' | 'info' (default)
 * duration: ms (default 2500)
 * 전역 노출 → 어느 파일에서든 window.showToast('메시지', 'success') 형태로 호출
 */
window.showToast = function(msg, type = 'info', duration = 2500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: { bg: '#0d2a1a', border: '#1d9e75', icon: '✅', text: '#5dcaa5' },
    error:   { bg: '#2a0d0d', border: '#e24b4a', icon: '❌', text: '#f09595' },
    warning: { bg: '#2a1e0d', border: '#ef9f27', icon: '⚠️', text: '#fcd34d' },
    info:    { bg: '#0d1a2a', border: '#378add', icon: 'ℹ️',  text: '#a0c4ff' },
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background:${c.bg};
    border:1px solid ${c.border};
    border-radius:10px;
    padding:10px 14px;
    font-size:12px;
    color:${c.text};
    display:flex;
    align-items:center;
    gap:8px;
    min-width:200px;
    max-width:300px;
    pointer-events:auto;
    opacity:0;
    transform:translateX(20px);
    transition:opacity 0.2s ease, transform 0.2s ease;
    font-family:'Segoe UI','Malgun Gothic',sans-serif;
    box-shadow:0 4px 16px rgba(0,0,0,0.5);
    line-height:1.5;
  `;
  toast.innerHTML = `<span style="font-size:14px;flex-shrink:0;">${c.icon}</span><span>${msg}</span>`;
  container.appendChild(toast);

  // 등장 애니메이션
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
  });

  // 자동 제거
  const remove = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 220);
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
};

// 기존 코드와 연결: syncAndSave 후 자동 토스트 (선택적)
// 각 장소의 핵심 액션에 showToast 자동 삽입
const _toastPatches = [
  // [함수명, 토스트 타입, 메시지 생성 함수]
  // → 아래 후킹 블록에서 처리
];

// orderFood 후킹 — 구매 성공 시 토스트
const _origOrderFood_toast = window.orderFood;
if (_origOrderFood_toast) {
  window.orderFood = function(id) {
    const before = playerStats.data;
    _origOrderFood_toast(id);
    if (playerStats.data < before || playerStats.hp > (playerStats._prevHp || 0)) {
      // 이미 caf-log에 출력되므로 토스트는 짧게
      const menus = { rice:'학식 정식', ramen:'얼큰 라면', coffee:'아이스 아메리카노', special:'특선 도시락' };
      showToast('🍽️ ' + (menus[id] || id) + ' 주문 완료!', 'success', 2000);
    }
    playerStats._prevHp = playerStats.hp;
  };
}

// buyStoreItem 후킹 (구매 토스트 알림)
// buyStore → buyStoreItem으로 교체됨 (ITEM_DB 통합 이후)
const _origBuyStoreItem_toast = window.buyStoreItem;
if (_origBuyStoreItem_toast) {
  window.buyStoreItem = function(id) {
    const before = playerStats.data;
    _origBuyStoreItem_toast(id);
    if (playerStats.data < before) {
      const name = window.ITEM_DB?.get(id)?.name || id;
      showToast('🛒 ' + name + ' 구매!', 'success', 2000);
    }
  };
}

// clinicTreat 후킹
const _origClinicTreat_toast = window.clinicTreat;
if (_origClinicTreat_toast) {
  window.clinicTreat = function(type) {
    _origClinicTreat_toast(type);
    const msgs = { free:'응급처치 완료! HP 회복', hp:'HP 완전 회복!', sp:'SP 완전 회복!', full:'HP + SP 완전 회복!' };
    showToast('🏥 ' + (msgs[type] || '치료 완료!'), 'success', 2200);
  };
}

// buyUnion 후킹
const _origBuyUnion_toast = window.buyUnion;
if (_origBuyUnion_toast) {
  window.buyUnion = function(id) {
    const before = playerStats.data;
    _origBuyUnion_toast(id);
    if (playerStats.data < before) showToast('🏫 학생회관 구매 완료!', 'success', 2000);
  };
}

// doGacha 후킹 — 등급별 색상
const _origDoGacha_toast = window.doGacha;
if (_origDoGacha_toast) {
  window.doGacha = function() {
    const before = playerStats.data;
    _origDoGacha_toast();
    const diff = playerStats.data - before;
    if (diff > 20)      showToast('🌟 전설 등급 획득!!', 'warning', 3500);
    else if (diff > 0)  showToast('💜 희귀 아이템 획득!', 'info', 2500);
  };
}

// startStudy 후킹 (도서관 완료 시)
const _origStartStudy_toast = window.startStudy;
if (_origStartStudy_toast) {
  window.startStudy = function(subjectId) {
    if (subjectId !== 'rest') {
      const _dataBefore = playerStats.data;
      _origStartStudy_toast(subjectId);
      // finishLibTyping이 비동기적으로 실행되므로 타임아웃으로 감지
      setTimeout(() => {
        const diff = playerStats.data - _dataBefore;
        if (diff > 0) showToast('📚 공부 완료! 💎 +' + diff, 'success', 2500);
      }, 12000);
    } else {
      _origStartStudy_toast(subjectId);
    }
  };
}


// ================================================================
// 2. 다크 / 라이트 테마 토글
// ================================================================

// 라이트 모드일 때 body에 class="light-theme" 추가
// 기존 CSS는 어두운 배경 기반 → light-theme 클래스로 오버라이드

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = '🌙';
  }
}

window.toggleTheme = function() {
  const current = localStorage.getItem('cauTheme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('cauTheme', next);
  applyTheme(next);
  showToast(next === 'light' ? '☀️ 라이트 모드' : '🌙 다크 모드', 'info', 1500);
};

// 페이지 로드 시 저장된 테마 적용
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('cauTheme') || 'dark';
  applyTheme(saved);
});


// ================================================================
// 3. 장소 입장 페이드 전환 + 진입 아이콘 연출
// ================================================================

// 장소별 진입 메시지 & 아이콘
const PLACE_ENTER_INFO = {
  dormitory: { icon: '🐉', msg: '블루미르홀 입장', color: '#d4537e' },
  cafeteria: { icon: '🍽️', msg: '학생식당 입장',   color: '#f97316' },
  library:   { icon: '📚', msg: '중앙도서관 입장', color: '#c9a84c' },
  lab:       { icon: '💻', msg: '310관 연구실 입장', color: '#4dff88' },
  battle:    { icon: '⚔️', msg: '이면 세계 진입...', color: '#e24b4a' },
  clinic:    { icon: '🏥', msg: '의무실 입장',      color: '#dc2626' },
  lab2:      { icon: '⚗️', msg: '공대 실험실 입장', color: '#0284c7' },
  festival:  { icon: '🎪', msg: '중앙 축제 입장',   color: '#a855f7' },
  union:     { icon: '🏫', msg: '학생회관 입장',    color: '#1d4ed8' },
  mountain:  { icon: '⛰️', msg: '청룡산 입장',     color: '#e24b4a' },
  gym:       { icon: '💪', msg: '체육관 입장',      color: '#facc15' },
  store:     { icon: '🛒', msg: 'CAU 편의점 입장',  color: '#7c3aed' },
};

/**
 * fadeToPlace(placeId, callback)
 * 0.15초 페이드아웃 → 진입 연출 표시 → callback() → 0.15초 페이드인
 */
window.fadeToPlace = function(placeId, callback) {
  const overlay = document.getElementById('place-transition-overlay');
  const info = PLACE_ENTER_INFO[placeId] || { icon: '🚪', msg: '입장 중...', color: '#a0c4ff' };

  // 진입 연출 배너 생성
  let banner = document.getElementById('place-enter-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'place-enter-banner';
    banner.style.cssText = `
      position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%);
      z-index:8500;
      display:flex; flex-direction:column; align-items:center; gap:10px;
      pointer-events:none; opacity:0;
      transition:opacity 0.15s ease;
      font-family:'Segoe UI','Malgun Gothic',sans-serif;
    `;
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <div style="font-size:52px;filter:drop-shadow(0 0 12px ${info.color});">${info.icon}</div>
    <div style="font-size:14px;font-weight:600;color:${info.color};letter-spacing:2px;">${info.msg}</div>
  `;

  // 페이드 아웃
  if (overlay) { overlay.style.pointerEvents = 'all'; overlay.style.opacity = '0.85'; }
  banner.style.opacity = '1';

  setTimeout(() => {
    if (typeof callback === 'function') callback();
    // 페이드 인
    setTimeout(() => {
      if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
      banner.style.opacity = '0';
    }, 220);
  }, 320);
};

// enterPlace 후킹 — 페이드 전환 삽입
const _origEnterPlace = window.enterPlace;
if (_origEnterPlace) {
  window.enterPlace = function(placeId) {
    window.fadeToPlace(placeId, () => {
      _origEnterPlace(placeId);
    });
  };
}

// leaveXxx 후킹 — 맵 복귀 시에도 페이드
function wrapLeave(fnName) {
  const orig = window[fnName];
  if (!orig) return;
  window[fnName] = function() {
    const overlay = document.getElementById('place-transition-overlay');
    if (overlay) { overlay.style.pointerEvents = 'all'; overlay.style.opacity = '0.6'; }
    setTimeout(() => {
      orig.apply(this, arguments);
      setTimeout(() => {
        if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
      }, 180);
    }, 160);
  };
}
['leaveCafeteria','leaveLibrary','leaveLab','leaveGym','leaveClinic',
 'leaveLab2','leaveFestival','leaveUnion','leaveMountain','leaveStore','leaveRoom'].forEach(wrapLeave);


// ================================================================
// 4. 일일 리셋 카운트다운 타이머
// ================================================================

function updateResetTimer() {
  const el = document.getElementById('stat-reset-timer');
  if (!el) return;

  const now  = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;

  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

  el.textContent = h + ':' + m + ':' + s;
  // 1시간 미만이면 빨간색 강조
  el.style.color = diff < 3600000 ? '#f09595' : '#6c8ebf';
}

document.addEventListener('DOMContentLoaded', () => {
  updateResetTimer();
  setInterval(updateResetTimer, 1000);
});


// ================================================================
// 5. 데이터 조각 +N 팝업 (updateMapStats에서 호출)
// ================================================================

window.showDataPopup = function(text) {
  const el = document.getElementById('data-popup');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = '1';
  el.style.transform = 'translateY(-18px)';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-28px)';
  }, 1000);
};


// ================================================================
// 6. 인벤토리 오버레이
// ================================================================

window.openInventory = function() {
  let overlay = document.getElementById('inventory-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'inventory-overlay';
    overlay.className = 'inv-overlay';
    overlay.innerHTML = `
      <div class="inv-panel">
        <div class="inv-header">
          <span class="inv-title">🎒 인벤토리</span>
          <span class="inv-count" id="inv-count">0개</span>
          <button class="inv-close-btn" onclick="closeInventory()">✕</button>
        </div>
        <div class="inv-grid" id="inv-grid"></div>
        <div class="inv-tooltip" id="inv-tooltip" style="display:none;"></div>
        <div class="inv-empty" id="inv-empty">아이템이 없어요.<br><span>전투, 도서관, 가게에서 획득해보세요!</span></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeInventory(); });
    document.body.appendChild(overlay);
  }

  renderInventoryOverlay();
  overlay.classList.add('inv-open');
  document.body.style.overflow = 'hidden';
};

window.closeInventory = function() {
  const overlay = document.getElementById('inventory-overlay');
  if (overlay) overlay.classList.remove('inv-open');
  document.body.style.overflow = '';
  const tip = document.getElementById('inv-tooltip');
  if (tip) tip.style.display = 'none';
};

window.renderInventoryOverlay = function renderInventoryOverlay() {
  const grid   = document.getElementById('inv-grid');
  const empty  = document.getElementById('inv-empty');
  const count  = document.getElementById('inv-count');
  if (!grid) return;

  const inv = (typeof inventory !== 'undefined') ? inventory : [];
  if (count) count.textContent = inv.length + '개';

  if (inv.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  // 아이템 타입별 색상
  const typeColor = {
    dmg_boost: '#ef9f27', speed: '#ef9f27',
    shield: '#378add',
    regen: '#1d9e75', lucky: '#1d9e75',
    rx_hp: '#e24b4a', rx_sp: '#378add', rx_cure: '#a855f7', rx_boost: '#ef9f27',
    ultimate: '#fcd34d', mirror: '#5dcaa5',
  };

  grid.innerHTML = inv.map((item, i) => {
    const lvl   = item.enhanceLevel ? ` <span class="inv-item-lv">+${item.enhanceLevel}</span>` : '';
    const color = typeColor[item.id] || '#6c8ebf';
    return `
      <div class="inv-item-card" style="--item-color:${color};"
           onmouseenter="showInvTooltip(event,${i})"
           onmouseleave="hideInvTooltip()"
           ontouchstart="showInvTooltip(event,${i})">
        <div class="inv-item-icon">${item.icon || '📦'}</div>
        <div class="inv-item-name">${item.name || '아이템'}${lvl}</div>
        <button class="inv-use-btn" onclick="useInventoryItem(${i})">사용</button>
      </div>`;
  }).join('');
}

window.showInvTooltip = function(e, idx) {
  const inv = (typeof inventory !== 'undefined') ? inventory : [];
  const item = inv[idx];
  if (!item) return;
  const tip = document.getElementById('inv-tooltip');
  if (!tip) return;

  const lvl = item.enhanceLevel ? ` (+${item.enhanceLevel} 강화)` : '';
  tip.innerHTML = `
    <div class="inv-tip-name">${item.icon} ${item.name}${lvl}</div>
    <div class="inv-tip-desc">${item.desc || '효과 없음'}</div>`;
  tip.style.display = 'block';
};

window.hideInvTooltip = function() {
  const tip = document.getElementById('inv-tooltip');
  if (tip) tip.style.display = 'none';
};

// 인벤토리 아이템 즉시 사용 (전투 외부)
window.useInventoryItem = function(idx) {
  const inv = (typeof inventory !== 'undefined') ? inventory : [];
  const item = inv[idx];
  if (!item) return;

  let msg = '';
  let type = 'info';

  if (item.id === 'rx_hp' || item.id === 'hp_potion') {
    const gain = Math.min(50, playerStats.maxHp - playerStats.hp);
    playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 50);
    msg = `❤️ HP +${gain} 회복!`;  type = 'success';
  } else if (item.id === 'rx_sp' || item.id === 'sp_potion') {
    const gain = Math.min(40, playerStats.maxSp - playerStats.sp);
    playerStats.sp = Math.min(playerStats.maxSp, playerStats.sp + 40);
    msg = `💧 SP +${gain} 회복!`;  type = 'success';
  } else if (item.id === 'rx_cure') {
    if (typeof playerStats.statusEffects !== 'undefined') playerStats.statusEffects = [];
    msg = '🧬 모든 상태이상 제거!'; type = 'success';
  } else if (item.id === 'full_potion') {
    playerStats.hp = playerStats.maxHp;
    playerStats.sp = playerStats.maxSp;
    msg = '✨ HP + SP 완전 회복!';  type = 'success';
  } else {
    // 전투용 아이템은 맵에서 사용 불가 안내
    if (typeof showToast === 'function') showToast('⚔️ ' + item.name + ' — 전투 중에만 사용 가능해요!', 'warning', 2500);
    return;
  }

  inventory.splice(idx, 1);
  if (typeof saveInventory === 'function') saveInventory();
  if (typeof window.updateMapStats === 'function') window.updateMapStats();
  if (typeof showToast === 'function') showToast(msg, type, 2200);
  renderInventoryOverlay();
};


// ================================================================
// 7. 일일 리셋 — 장소별 한도 소진 표시 (맵 버튼 뱃지)
// ================================================================

// 장소 key ↔ placeId 매핑
const PLACE_DAILY_KEY = {
  cafeteria: 'cafeteria',
  library:   'library',
  gym:       'gym',
  clinic:    'clinic',
  lab2:      'lab2',
  festival:  'festival',
  union:     'union',
  lab:       'lab',
};

window.updateDailyBadges = function() {
  if (typeof dailyLimits === 'undefined' || typeof dailyUsage === 'undefined') return;
  if (typeof checkAndResetDaily === 'function') checkAndResetDaily();

  Object.entries(PLACE_DAILY_KEY).forEach(([placeId, key]) => {
    const badge = document.getElementById('daily-badge-' + placeId);
    if (!badge) return;
    const remain = dailyLimits[key] - (dailyUsage[key] || 0);
    if (remain <= 0) {
      badge.textContent = '✕';
      badge.className = 'map-daily-badge badge-exhausted';
      badge.style.display = 'flex';
    } else {
      badge.textContent = remain;
      badge.className = 'map-daily-badge badge-remain';
      badge.style.display = 'flex';
    }
  });
};

// 맵 버튼에 뱃지 DOM 주입 (DOMContentLoaded 후 1회)
function injectDailyBadges() {
  Object.keys(PLACE_DAILY_KEY).forEach(placeId => {
    // map-spot 버튼에서 onclick에 해당 placeId 찾기
    const btn = document.querySelector(`.map-spot[onclick*="'${placeId}'"]`);
    if (!btn) return;
    const wrap = btn.querySelector('.map-spot-wrap');
    if (!wrap || wrap.querySelector('#daily-badge-' + placeId)) return;
    const badge = document.createElement('span');
    badge.id = 'daily-badge-' + placeId;
    badge.className = 'map-daily-badge badge-remain';
    badge.style.display = 'none';
    wrap.appendChild(badge);
  });
  window.updateDailyBadges();
}

// enterPlace / leaveXxx 후 뱃지 갱신
const _origEnterPlace_badge = window.enterPlace;
if (_origEnterPlace_badge) {
  window.enterPlace = function(placeId) {
    _origEnterPlace_badge(placeId);
    setTimeout(window.updateDailyBadges, 500);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(injectDailyBadges, 300);
  // 1분마다 갱신 (자정 직후 초기화 감지)
  setInterval(window.updateDailyBadges, 60000);
});


// ================================================================
// 8. 모바일 최적화
// ================================================================

// ── 8-1. 스탯바 접기/펼치기 ──
window.toggleStatBar = function() {
  const bar = document.querySelector('.stat-main');
  const btn = document.getElementById('stat-collapse-btn');
  if (!bar || !btn) return;
  const collapsed = bar.classList.toggle('stat-collapsed');
  btn.textContent  = collapsed ? '▼' : '▲';
  btn.title        = collapsed ? '스탯 보기' : '스탯 숨기기';
  localStorage.setItem('statBarCollapsed', collapsed ? '1' : '0');
};

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('statBarCollapsed');
  if (saved === '1') {
    const bar = document.querySelector('.stat-main');
    const btn = document.getElementById('stat-collapse-btn');
    if (bar) { bar.classList.add('stat-collapsed'); }
    if (btn) { btn.textContent = '▼'; btn.title = '스탯 보기'; }
  }
});

// ── 8-2. 하단 퀵 액세스 바 ──
function buildQuickBar() {
  if (document.getElementById('quick-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'quick-bar';
  bar.className = 'quick-bar';
  bar.innerHTML = `
    <button class="quick-btn" onclick="openInventory()" title="인벤토리">
      <span class="quick-icon">🎒</span>
      <span class="quick-label">인벤토리</span>
    </button>
    <button class="quick-btn quick-btn-center" onclick="goToMap()" title="맵으로">
      <span class="quick-icon">🗺️</span>
      <span class="quick-label">맵</span>
    </button>
    <button class="quick-btn" onclick="quickSave()" title="저장" id="quick-save-btn">
      <span class="quick-icon">💾</span>
      <span class="quick-label">저장</span>
    </button>`;
  document.body.appendChild(bar);
}

window.goToMap = function() {
  // ★ Fix 10: 전투 중이면 맵 이동 차단
  const battleCont = document.getElementById('battle-container');
  const inBattle = battleCont &&
    (battleCont.classList.contains('visible') || battleCont.style.display === 'flex');
  if (inBattle) {
    if (typeof showToast === 'function') showToast('⚔️ 전투 중에는 이동할 수 없어요!', 'warning', 2000);
    return;
  }

  // 현재 열려 있는 모든 장소 컨테이너를 닫고 맵으로
  const ids = ['battle-container','cafeteria-container','library-container',
                'lab-container','explore-container','puang-room','gym-container',
                'clinic-container','lab2-container','festival-container',
                'union-container','mountain-container','store-container'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.classList.remove('visible'); }
  });
  const game = document.getElementById('game-container');
  if (game) game.style.display = 'flex';
  if (typeof window.updateMapStats === 'function') window.updateMapStats();
  if (typeof window.updateDailyBadges === 'function') window.updateDailyBadges();
};

window.quickSave = async function() {
  const btn = document.getElementById('quick-save-btn');
  const icon = btn ? btn.querySelector('.quick-icon') : null;
  if (icon) icon.textContent = '⏳';

  try {
    if (typeof saveAllDataToServer === 'function') await saveAllDataToServer();
    if (icon) icon.textContent = '✅';
    if (typeof showToast === 'function') showToast('💾 저장 완료!', 'success', 1800);
  } catch(e) {
    if (icon) icon.textContent = '❌';
    if (typeof showToast === 'function') showToast('저장 실패 — 다시 시도해주세요.', 'error', 2500);
  }
  setTimeout(() => { if (icon) icon.textContent = '💾'; }, 2000);
};

document.addEventListener('DOMContentLoaded', () => {
  buildQuickBar();
});



// ================================================================
// 9. 퀘스트 / 데일리 미션 시스템
// ================================================================

// ★ Fix 4: 전투 퀘스트 기준값 — 날짜 기반으로 localStorage에 저장
// 새로고침해도 오늘 시작 시점의 승리 수 유지
function getQuestBattleBase() {
  const today = new Date().toDateString();
  const saved = JSON.parse(localStorage.getItem('questBattleBase') || 'null');
  if (saved && saved.date === today) return saved.base;
  // 오늘 기준점 없으면 현재 값으로 저장
  const base = playerStats._battleWins || 0;
  localStorage.setItem('questBattleBase', JSON.stringify({ date: today, base }));
  return base;
}

const DAILY_QUESTS = [
  { id: 'q_cafeteria', label: '🍽️ 식당 2회 방문',    check: () => (dailyUsage.cafeteria || 0) >= 2, reward: 5 },
  { id: 'q_library',   label: '📚 도서관 공부 2회',  check: () => (dailyUsage.library   || 0) >= 2, reward: 6 },
  { id: 'q_battle',    label: '⚔️ 전투 1회 승리',    check: () => (playerStats._battleWins || 0) >= getQuestBattleBase() + 1, reward: 8 },
  { id: 'q_gym',       label: '💪 체육관 방문',       check: () => (dailyUsage.gym       || 0) >= 1, reward: 4 },
  { id: 'q_clinic',    label: '🏥 의무실 방문',       check: () => (dailyUsage.clinic    || 0) >= 1, reward: 3 },
  { id: 'q_festival',  label: '🎪 축제 미니게임 2회', check: () => (dailyUsage.festival  || 0) >= 2, reward: 5 },
];

function getTodayQuests() {
  const seed = new Date().toDateString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  // 매일 3개 랜덤 선택 (시드 기반)
  const shuffled = [...DAILY_QUESTS].sort((a, b) => {
    const ha = (seed * a.id.length) % 100;
    const hb = (seed * b.label.length) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, 3);
}

function getQuestCompletions() {
  const today = new Date().toDateString();
  const raw = JSON.parse(localStorage.getItem('questCompleted') || '{}');
  if (raw.date !== today) return { date: today };
  return raw;
}
function saveQuestCompletions(data) {
  localStorage.setItem('questCompleted', JSON.stringify(data));
}

window.checkDailyQuests = function() {
  const quests = getTodayQuests();
  const done   = getQuestCompletions();
  let newDone  = false;

  quests.forEach(q => {
    if (!done[q.id] && q.check()) {
      done[q.id] = true;
      playerStats.data += q.reward;
      newDone = true;
      if (typeof showToast === 'function') showToast('✅ 미션 완료: ' + q.label + ' +💎' + q.reward, 'success', 3000);
    }
  });

  if (newDone) {
    saveQuestCompletions(done);                                          // ★ Fix 5-1: localStorage 먼저 저장
    if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Fix 5-2: 그 다음 Firebase 저장
    // (순서 수정: 이전엔 syncAndSave가 saveQuestCompletions보다 먼저 호출되어 Firebase에 미완료 상태 저장될 수 있었음)
  }
  renderQuestPanel();
};

function renderQuestPanel() {
  const panel = document.getElementById('quest-panel');
  if (!panel) return;

  const quests = getTodayQuests();
  const done   = getQuestCompletions();

  panel.innerHTML = quests.map(q => {
    const isDone = !!done[q.id];
    const pct    = isDone ? 100 : 0;
    return `
      <div class="quest-row ${isDone ? 'quest-done' : ''}">
        <span class="quest-check">${isDone ? '✅' : '⬜'}</span>
        <span class="quest-label">${q.label}</span>
        <span class="quest-reward">+💎${q.reward}</span>
      </div>`;
  }).join('');
}

// 주기적으로 퀘스트 체크 (30초마다)
document.addEventListener('DOMContentLoaded', () => {
  // ★ Fix 6: _questBattleBase 제거 — getQuestBattleBase()가 날짜 기반으로 localStorage에서 관리
  renderQuestPanel();
  setInterval(() => {
    if (typeof dailyUsage !== 'undefined') window.checkDailyQuests();
  }, 30000);
});


// ================================================================
// 10. 플레이어 프로필 팝업 + 칭호 시스템
// ================================================================

const TITLES = [
  { id: 't_newbie',   name: '신입 탐험가',    check: () => true,  color: '#6c8ebf' },
  { id: 't_fighter',  name: '이면세계 용사',   check: () => (playerStats._battleWins || 0) >= 5,  color: '#ef9f27' },
  { id: 't_scholar',  name: '중앙대 수석',     check: () => (typeof libStudyCount !== 'undefined' ? libStudyCount : 0) >= 10, color: '#c9a84c' },
  { id: 't_friend',   name: '푸앙이 친구',     check: () => puangState.favorability >= 80, color: '#d4537e' },
  { id: 't_rich',     name: '데이터 재벌',     check: () => playerStats.data >= 100, color: '#fcd34d' },
  { id: 't_veteran',  name: '베테랑 탐험가',   check: () => (playerStats._explorationCount || 0) >= 20, color: '#5dcaa5' },
  { id: 't_legend',   name: '캠퍼스 전설',     check: () => (playerStats._battleWins || 0) >= 20 && puangState.favorability >= 90, color: '#a855f7' },
];

window.getActiveTitle = function getActiveTitle() { // ★ Fix 1: window 노출 — 탐험카드에서 참조 가능하게
  // 가장 희귀한 달성 칭호 반환
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (TITLES[i].check()) return TITLES[i];
  }
  return TITLES[0];
}

// ── 프로필 탭 상태 ──
let _profileTab = 'stat'; // 'stat' | 'costume' | 'pet'

window.openProfile = function() {
  let overlay = document.getElementById('profile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'profile-overlay';
    overlay.className = 'profile-overlay';
    overlay.innerHTML = `
      <div class="profile-panel">
        <button class="profile-close" onclick="closeProfile()">✕</button>
        <div class="profile-avatar" id="profile-avatar-display">🧑‍💻</div>
        <div class="profile-name" id="profile-name">탐험가</div>
        <div class="profile-title-badge" id="profile-title">신입 탐험가</div>

        <div class="profile-tab-bar">
          <button class="profile-tab-btn active" id="ptab-stat"    onclick="switchProfileTab('stat')">📊 스탯</button>
          <button class="profile-tab-btn"        id="ptab-costume" onclick="switchProfileTab('costume')">👗 코스튬</button>
          <button class="profile-tab-btn"        id="ptab-pet"     onclick="switchProfileTab('pet')">🐾 펫</button>
        </div>

        <div id="profile-tab-content"></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeProfile(); });
    document.body.appendChild(overlay);

    // 탭 바 스타일 주입 (한 번만)
    if (!document.getElementById('profile-tab-style')) {
      const st = document.createElement('style');
      st.id = 'profile-tab-style';
      st.textContent = `
        .profile-tab-bar{display:flex;gap:6px;margin:10px 0 14px;padding:0 2px;}
        .profile-tab-btn{flex:1;padding:7px 4px;border:1px solid #1a3a5c;border-radius:8px;background:rgba(10,20,40,0.6);color:#6090b0;font-size:12px;cursor:pointer;transition:all .18s;}
        .profile-tab-btn.active{background:#0f2a40;border-color:#378add;color:#a0c4ff;font-weight:700;}
        .profile-tab-btn:hover:not(.active){border-color:#2a5a8c;color:#80b0d0;}

        .ptab-costume-section{margin-bottom:14px;}
        .ptab-section-title{font-size:11px;color:#5080a0;letter-spacing:.5px;margin-bottom:8px;text-transform:uppercase;}
        .ptab-item-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
        .ptab-item{border:1px solid #1a3a5c;border-radius:8px;padding:10px 6px;text-align:center;cursor:pointer;background:rgba(10,20,40,0.5);transition:all .15s;position:relative;}
        .ptab-item:hover{border-color:#378add;background:rgba(15,42,64,0.8);}
        .ptab-item.equipped{border-color:#5dcaa5;background:rgba(13,50,36,0.6);}
        .ptab-item.equipped::after{content:'착용중';position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#1d9e75;color:#e0ffe0;font-size:9px;padding:1px 6px;border-radius:8px;white-space:nowrap;}
        .ptab-item.locked{opacity:.45;cursor:default;}
        .ptab-item-icon{font-size:28px;margin-bottom:4px;}
        .ptab-item-name{font-size:10px;color:#8ab0c8;line-height:1.3;}
        .ptab-item-price{font-size:10px;color:#ef9f27;margin-top:2px;}
        .ptab-unequip-btn{width:100%;margin-top:10px;padding:6px;border:1px solid #2a4a6c;border-radius:7px;background:transparent;color:#6090b0;font-size:11px;cursor:pointer;}
        .ptab-unequip-btn:hover{border-color:#378add;color:#a0c4ff;}
        .ptab-empty{text-align:center;padding:20px 0;color:#3a5a7a;font-size:12px;line-height:1.8;}
      `;
      document.head.appendChild(st);
    }
  }
  _profileTab = 'stat';
  renderProfile();
  overlay.classList.add('profile-open');
};

window.closeProfile = function() {
  const o = document.getElementById('profile-overlay');
  if (o) o.classList.remove('profile-open');
};

// ── 탭 전환 ──
window.switchProfileTab = function(tab) {
  _profileTab = tab;
  ['stat','costume','pet'].forEach(t => {
    const btn = document.getElementById('ptab-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
  });
  renderProfileTabContent();
};

function renderProfile() {
  const nameEl  = document.getElementById('profile-name');
  const titleEl = document.getElementById('profile-title');
  const avatarEl = document.getElementById('profile-avatar-display');

  const name   = playerStats.name || localStorage.getItem('playerName') || '탐험가';
  const active = getActiveTitle();

  if (nameEl)   nameEl.textContent  = name;
  if (titleEl)  { titleEl.textContent = active.name; titleEl.style.color = active.color; titleEl.style.borderColor = active.color + '55'; }

  // 아바타: 펫 착용 중이면 펫 아이콘 우선 표시
  if (avatarEl) {
    const petIcon  = _getPetIcon(playerStats.equippedPet);
    const avatar   = localStorage.getItem('playerAvatar') || '🧑‍💻';
    avatarEl.textContent = petIcon || avatar;
  }

  renderProfileTabContent();
}

function renderProfileTabContent() {
  const el = document.getElementById('profile-tab-content');
  if (!el) return;

  if (_profileTab === 'stat') {
    el.innerHTML = _renderStatTab();
  } else if (_profileTab === 'costume') {
    el.innerHTML = _renderCostumeTab();
  } else if (_profileTab === 'pet') {
    el.innerHTML = _renderPetTab();
  }
}

// ── 스탯 탭 ──
function _renderStatTab() {
  const stats = [
    { icon:'❤️', label:'HP',       val: playerStats.hp + '/' + playerStats.maxHp },
    { icon:'💙', label:'SP',       val: playerStats.sp + '/' + playerStats.maxSp },
    { icon:'💎', label:'데이터',   val: playerStats.data + '개' },
    { icon:'⚔️', label:'전투 승리', val: (playerStats._battleWins || 0) + '회' },
    { icon:'🗺️', label:'탐험 수',  val: (playerStats._explorationCount || 0) + '회' },
    { icon:'🐉', label:'호감도',   val: puangState.favorability + '/ 100' },
  ].map(s => `
    <div class="profile-stat-card">
      <div class="profile-stat-icon">${s.icon}</div>
      <div class="profile-stat-label">${s.label}</div>
      <div class="profile-stat-val">${s.val}</div>
    </div>`).join('');

  const titles = TITLES.map(t => {
    const unlocked = t.check();
    return `<div class="profile-title-row ${unlocked ? 'unlocked' : 'locked'}">
      <span style="color:${unlocked ? t.color : '#444'};font-weight:700;">${unlocked ? '🔓' : '🔒'} ${t.name}</span>
    </div>`;
  }).join('');

  return `
    <div class="profile-stats-grid">${stats}</div>
    <div class="profile-titles-section">
      <div class="profile-section-label">🏷️ 칭호 목록</div>
      <div class="profile-titles-list">${titles}</div>
    </div>`;
}

// ── 코스튬 탭 ──
function _renderCostumeTab() {
  const curPlayerCostume = localStorage.getItem('playerCostume') || '';
  const curPuangCostume  = (playerStats.roomDecorations || {}).costume || '';
  // 플레이어 성별에 맞는 코스튬만 표시
  const gender = localStorage.getItem('playerGender') || playerStats.gender || 'male';

  const allPlayerCostumes = _getCostumeItems('player_costume');
  // 성별 필터: gender 필드가 없거나 일치하는 것만
  const playerCostumes = allPlayerCostumes.filter(item => !item.gender || item.gender === gender);
  const puangCostumes  = _getCostumeItems('puang_costume');

  const renderItems = (items, equipped, onSelect) => {
    if (items.length === 0)
      return `<div class="ptab-empty">구매한 코스튬이 없어요<br>아이템 가게에서 구매하세요 🛒</div>`;
    return `<div class="ptab-item-grid">` + items.map(item => {
      const isEquipped = equipped === item.id;
      return `<div class="ptab-item ${isEquipped ? 'equipped' : ''}" onclick="${onSelect}('${item.id}')">
        <div class="ptab-item-icon">${item.icon || '👗'}</div>
        <div class="ptab-item-name">${item.name}</div>
      </div>`;
    }).join('') + `</div>`;
  };

  const genderLabel = gender === 'female' ? '여학생' : '남학생';
  return `
    <div style="max-height:340px;overflow-y:auto;padding-right:2px;">
      <div class="ptab-costume-section">
        <div class="ptab-section-title">👤 플레이어 코스튬 (${genderLabel})</div>
        ${renderItems(playerCostumes, curPlayerCostume, 'equipPlayerCostume')}
        ${curPlayerCostume ? `<button class="ptab-unequip-btn" onclick="equipPlayerCostume('')">해제</button>` : ''}
      </div>
      <div class="ptab-costume-section">
        <div class="ptab-section-title">🐨 푸앙이 코스튬</div>
        ${renderItems(puangCostumes, curPuangCostume, 'equipPuangCostume')}
        ${curPuangCostume ? `<button class="ptab-unequip-btn" onclick="equipPuangCostume('')">해제</button>` : ''}
      </div>
    </div>`;
}

// ── 펫 탭 ──
function _renderPetTab() {
  const purchased = _getStorePurchased();
  const equippedPet = playerStats.equippedPet || '';
  const petItems = _getCostumeItems('pet');

  if (petItems.length === 0)
    return `<div class="ptab-empty">구매한 펫이 없어요<br>아이템 가게에서 구매하세요 🛒</div>`;

  const grid = `<div class="ptab-item-grid">` + petItems.map(item => {
    const isEquipped = equippedPet === item.id;
    return `<div class="ptab-item ${isEquipped ? 'equipped' : ''}" onclick="equipPet('${item.id}')">
      <div class="ptab-item-icon">${item.icon || '🐾'}</div>
      <div class="ptab-item-name">${item.name}</div>
      ${item.desc ? `<div class="ptab-item-price">${item.desc}</div>` : ''}
    </div>`;
  }).join('') + `</div>`;

  return `
    <div style="max-height:340px;overflow-y:auto;padding-right:2px;">
      <div class="ptab-section-title">동행 펫 선택</div>
      ${grid}
      ${equippedPet ? `<button class="ptab-unequip-btn" onclick="equipPet('')">펫 해제</button>` : ''}
    </div>`;
}

// ── 헬퍼: 구매한 카테고리 아이템 조회 ──
function _getCostumeItems(category) {
  const purchased = _getStorePurchased();
  if (!window.ITEM_DB) return [];
  return window.ITEM_DB.getByCategory(category).filter(item => purchased.includes(item.id));
}

function _getStorePurchased() {
  return JSON.parse(localStorage.getItem('storePurchased') || '[]');
}

function _getPetIcon(petId) {
  if (!petId || !window.ITEM_DB) return null;
  const item = window.ITEM_DB.get(petId);
  return item ? item.icon : null;
}

// ── 코스튬 / 펫 장착 함수 ──
window.equipPlayerCostume = function(id) {
  // playerStats + localStorage 동시 저장 (Firebase로도 동기화됨)
  playerStats.playerCostume = id || '';
  if (id) {
    localStorage.setItem('playerCostume', id);
    if (typeof showToast === 'function') {
      const item = window.ITEM_DB && window.ITEM_DB.get(id);
      showToast('👗 ' + (item ? item.name : id) + ' 착용!', 'success', 2000);
    }
  } else {
    localStorage.removeItem('playerCostume');
    if (typeof showToast === 'function') showToast('코스튬 해제', 'info', 1500);
  }
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  _applyPlayerCostumeToMap();
  renderProfileTabContent();
};

window.equipPuangCostume = function(id) {
  if (!playerStats.roomDecorations) playerStats.roomDecorations = {};
  playerStats.roomDecorations.costume = id || null;

  // 푸앙이 방 안의 캐릭터 이미지 반영 (방 진입 중일 때만 실제로 보임)
  _applyPuangCostumeToRoom(id);

  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  if (typeof showToast === 'function') {
    if (id) {
      const item = window.ITEM_DB && window.ITEM_DB.get(id);
      showToast('🐨 ' + (item ? item.name : id) + ' 착용!', 'success', 2000);
    } else {
      showToast('푸앙이 코스튬 해제', 'info', 1500);
    }
  }
  renderProfileTabContent();
};

// 푸앙이 방 캐릭터 이미지 업데이트
// - puang-room-img: 방 전신 이미지
// - applyRoomDecorations: 방 꾸미기 코스튬 이모지/이미지
function _applyPuangCostumeToRoom(id) {
  // 1) puang_room.js의 applyRoomDecorations 호출 (이모지 코스튬 처리)
  if (typeof window.applyRoomDecorations === 'function') window.applyRoomDecorations();

  // 2) puang-room-img (방 전신 이미지 img 태그)
  const roomImg = document.getElementById('puang-room-img');
  if (roomImg) {
    const item = id && window.ITEM_DB ? window.ITEM_DB.get(id) : null;
    roomImg.src = (item && item.imgFile) ? item.imgFile : 'images/puang/puang_normal.png';
  }
}

window.equipPet = function(id) {
  playerStats.equippedPet = id || null;
  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  // stat-avatar에 펫 아이콘 반영
  _updateAvatarWithPet();
  if (typeof showToast === 'function') {
    if (id) {
      const item = window.ITEM_DB && window.ITEM_DB.get(id);
      showToast('🐾 ' + (item ? item.name : id) + ' 동행!', 'success', 2000);
    } else {
      showToast('펫 해제', 'info', 1500);
    }
  }
  renderProfileTabContent();
};

// stat-avatar에 펫 아이콘 표시
function _updateAvatarWithPet() {
  const ae = document.getElementById('stat-avatar');
  if (!ae) return;
  const petIcon = _getPetIcon(playerStats.equippedPet);
  const baseAvatar = localStorage.getItem('playerAvatar') || '🧑‍💻';
  ae.textContent = petIcon || baseAvatar;
  // 프로필 패널 아바타도 동기화
  const pae = document.getElementById('profile-avatar-display');
  if (pae) pae.textContent = petIcon || baseAvatar;
}

// 맵 플레이어 이미지 적용 — imgFile 경로 직접 사용
function _applyPlayerCostumeToMap() {
  const costumeId = localStorage.getItem('playerCostume') || '';
  const gender    = localStorage.getItem('playerGender') || playerStats.gender || 'male';
  const battleImg = document.getElementById('player-img');
  if (!battleImg) return;

  if (costumeId && window.ITEM_DB) {
    const item = window.ITEM_DB.get(costumeId);
    // imgFile은 'images/player/...' 전체 경로로 저장되어 있음
    if (item && item.imgFile) {
      battleImg.src = item.imgFile;
      return;
    }
  }
  // 코스튬 없으면 성별 기본 이미지
  battleImg.src = 'images/player/player_' + gender + '_battle.png';
}

// 푸앙이 코스튬 초기 복원 — Firebase 로드 후 저장된 코스튬 이미지 반영
function _restorePuangCostume() {
  const costumeId = (playerStats.roomDecorations || {}).costume;
  if (!costumeId || !window.ITEM_DB) return;
  // 방 안 이미지만 복원 (맵 버튼은 건드리지 않음)
  _applyPuangCostumeToRoom(costumeId);
}

// stat-brand 클릭으로 프로필 열기 (DOMContentLoaded에서 등록)
document.addEventListener('DOMContentLoaded', () => {
  const brand = document.querySelector('.stat-brand');
  if (brand) { brand.style.cursor = 'pointer'; brand.addEventListener('click', window.openProfile); }
  // 초기 펫/코스튬 상태 반영 (Firebase 로드 완료 후 실행되도록 지연)
  setTimeout(() => {
    _updateAvatarWithPet();
    _applyPlayerCostumeToMap();
    _restorePuangCostume();
  }, 1200);
});


// ================================================================
// 11. 맵 방문 기록 하이라이트 + NEW 뱃지
// ================================================================

function getTodayVisits() {
  const today = new Date().toDateString();
  const raw   = JSON.parse(localStorage.getItem('mapVisits') || '{}');
  if (raw.date !== today) return { date: today, places: [] };
  return raw;
}
function markVisit(placeId) {
  const v = getTodayVisits();
  if (!v.places.includes(placeId)) v.places.push(placeId);
  localStorage.setItem('mapVisits', JSON.stringify(v));
}
function isFirstEverVisit(placeId) {
  const all = JSON.parse(localStorage.getItem('allVisits') || '[]');
  if (!all.includes(placeId)) {
    all.push(placeId);
    localStorage.setItem('allVisits', JSON.stringify(all));
    return true;
  }
  return false;
}

function updateVisitHighlights() {
  const visits = getTodayVisits().places;
  document.querySelectorAll('.map-spot').forEach(btn => {
    const match = btn.getAttribute('onclick')?.match(/'(\w+)'/);
    if (!match) return;
    const pid = match[1];
    const wrap = btn.querySelector('.map-spot-wrap');
    if (!wrap) return;
    // 오늘 방문한 장소에 초록 점 추가
    let dot = wrap.querySelector('.visit-dot');
    if (visits.includes(pid)) {
      if (!dot) { dot = document.createElement('span'); dot.className = 'visit-dot'; wrap.appendChild(dot); }
    } else {
      if (dot) dot.remove();
    }
  });
}

// enterPlace 후킹 — 방문 기록
const _origEnterPlace_visit = window.enterPlace;
if (_origEnterPlace_visit) {
  window.enterPlace = function(placeId) {
    const isFirst = isFirstEverVisit(placeId);
    if (isFirst && typeof showToast === 'function') {
      const labels = { dormitory:'블루미르홀', cafeteria:'학생식당', library:'중앙도서관', lab:'310관 연구실', battle:'이면 세계', clinic:'의무실', lab2:'공대 실험실', festival:'중앙 축제', union:'학생회관', mountain:'청룡산', gym:'체육관', store:'CAU 편의점' };
      showToast('🆕 처음 방문! ' + (labels[placeId] || placeId), 'info', 2500);
    }
    markVisit(placeId);
    setTimeout(updateVisitHighlights, 400);
    _origEnterPlace_visit(placeId);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateVisitHighlights, 500);
});


// ================================================================
// 12. 맵 NPC 말풍선
// ================================================================

const NPC_LINES = {
  dormitory: [
    () => puangState.favorability >= 80 ? '푸앙이가 기다리고 있어요! 🐉' : '푸앙이한테 말 걸어봐요~',
    () => '오늘 기분: ' + (puangState.moodToday >= 60 ? '좋음 😊' : '별로 😒'),
  ],
  cafeteria: [
    () => playerStats.hp < playerStats.maxHp * 0.4 ? '얼굴이 안 좋아 보이는데... 밥은 먹었어요? 🍽️' : '오늘 특선 먹어봤어요?',
    () => '남은 주문: ' + (typeof remainDaily === 'function' ? remainDaily('cafeteria') + '회' : '?회'),
  ],
  library: [
    () => new Date().getHours() >= 22 ? '야자 중이에요? 파이팅! 📚' : '공부하러 왔어요?',
    () => '남은 공부: ' + (typeof remainDaily === 'function' ? remainDaily('library') + '회' : '?회'),
  ],
  lab: [
    () => '연구실에서 저장 잊지 마세요! 💾',
    () => (playerStats._explorationCount || 0) >= 10 ? '베테랑 탐험가 기운이 느껴져요!' : '탐험 많이 해야 스킬 해금돼요!',
  ],
  battle: [
    () => playerStats.hp < 30 ? '⚠️ HP가 너무 낮아요! 회복 먼저 하세요!' : '이면 세계로 돌진! ⚔️',
    () => '전투 승리 ' + (playerStats._battleWins || 0) + '회째!',
  ],
  gym: [
    () => new Date().getDay() === 1 ? '오늘 체육대회 날! 🎽' : '꾸준히 오면 체력 올라요!',
    () => '연속 방문: ' + (localStorage.getItem('gymStreak') || '0') + '일',
  ],
  clinic: [
    () => (playerStats.statusEffects || []).length > 0 ? '⚠️ 상태이상 있어요! 어서 치료 받으세요' : '몸 상태 양호! 예방접종도 맞아봐요',
    () => window.getClinicInsurance?.() ? '🛡️ 보험 가입 중' : '보험 가입하면 안심이에요~',
  ],
  festival: [
    () => window.hasFestDoubleBuff?.() ? '🌟 지금 2× 보너스 활성 중!' : '오늘 연예인 나올 수도 있어요!',
    () => '야시장 먹거리도 있어요 🍢',
  ],
  store: [
    () => '오늘 재고 확인했어요? 🛒',
    () => '3개 이상 사면 10% 할인!',
  ],
  union: [
    () => new Date().getDay() === 1 ? '🏷️ 오늘 한정 세일 날!' : '오늘의 동아리 부스 확인해봐요',
    () => (JSON.parse(localStorage.getItem('unionJoinedClubs') || '[]').length > 0) ? '동아리 활동 중 🎓' : '동아리 가입하면 패시브 버프!',
  ],
  lab2:     [() => '실험 실패해도 포기하지 마요! 💥', () => '아이템 강화도 할 수 있어요'],
  mountain: [() => '⛰️ 강한 적이 나와요! HP 꽉 채우고 가세요', () => '보스 처치하면 큰 보상!'],
};

function getRandomLine(placeId) {
  const lines = NPC_LINES[placeId];
  if (!lines || lines.length === 0) return null;
  try {
    const fn = lines[Math.floor(Math.random() * lines.length)];
    return typeof fn === 'function' ? fn() : fn;
  } catch(e) { return null; }
}

function initNpcBubbles() {
  const tooltip = document.getElementById('map-tooltip');
  if (!tooltip) return;

  document.querySelectorAll('.map-spot').forEach(btn => {
    const match = btn.getAttribute('onclick')?.match(/'(\w+)'/);
    if (!match) return;
    const pid = match[1];

    btn.addEventListener('mouseenter', () => {
      const line = getRandomLine(pid);
      if (line) {
        // 기존 툴팁 위에 NPC 말풍선 추가 (별도 요소)
        let bubble = document.getElementById('npc-bubble');
        if (!bubble) {
          bubble = document.createElement('div');
          bubble.id = 'npc-bubble';
          bubble.className = 'npc-bubble';
          document.getElementById('map-bg')?.appendChild(bubble);
        }
        bubble.textContent = line;
        const rect = btn.getBoundingClientRect();
        const mapRect = document.getElementById('map-bg')?.getBoundingClientRect();
        if (mapRect) {
          bubble.style.left = (rect.left - mapRect.left + rect.width / 2) + 'px';
          bubble.style.top  = (rect.top  - mapRect.top  - 44) + 'px';
        }
        bubble.classList.add('bubble-show');
      }
    });
    btn.addEventListener('mouseleave', () => {
      const bubble = document.getElementById('npc-bubble');
      if (bubble) bubble.classList.remove('bubble-show');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => { setTimeout(initNpcBubbles, 400); });


// ================================================================
// 13. 통계 뷰어 (연구실 탭)
// ================================================================

window.openStatsViewer = function() {
  let overlay = document.getElementById('stats-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'stats-overlay';
    overlay.className = 'stats-overlay';
    overlay.innerHTML = `
      <div class="stats-panel">
        <div class="stats-header">
          <span class="stats-title">📊 탐험 통계</span>
          <button class="stats-close" onclick="closeStatsViewer()">✕</button>
        </div>
        <div class="stats-body" id="stats-body"></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeStatsViewer(); });
    document.body.appendChild(overlay);
  }
  renderStats();
  overlay.classList.add('stats-open');
};

window.closeStatsViewer = function() {
  const o = document.getElementById('stats-overlay');
  if (o) o.classList.remove('stats-open');
};

function renderStats() {
  const el = document.getElementById('stats-body');
  if (!el) return;

  // 장소별 방문 기록
  const usage = (typeof dailyUsage !== 'undefined') ? dailyUsage : {};
  const placeLabels = { cafeteria:'식당', library:'도서관', gym:'체육관', clinic:'의무실', festival:'축제', lab2:'실험실', union:'학생회관', lab:'연구실' };
  const usageBars = Object.entries(placeLabels).map(([k, label]) => {
    const used  = usage[k] || 0;
    const limit = (typeof dailyLimits !== 'undefined') ? (dailyLimits[k] || 1) : 1;
    const pct   = Math.min(100, Math.round(used / limit * 100));
    return `<div class="stats-bar-row">
      <span class="stats-bar-label">${label}</span>
      <div class="stats-bar-wrap"><div class="stats-bar-fill" style="width:${pct}%;"></div></div>
      <span class="stats-bar-val">${used}/${limit}</span>
    </div>`;
  }).join('');

  // 7일 데이터 조각 기록 (간이 그래프)
  const dataHistory = JSON.parse(localStorage.getItem('dataHistory') || '[]');
  const graphBars = dataHistory.slice(-7).map((d, i) => {
    const max = Math.max(...dataHistory.slice(-7), 1);
    const h = Math.max(4, Math.round(d.val / max * 60));
    return `<div class="graph-bar-col">
      <div class="graph-bar" style="height:${h}px;" title="${d.val}💎"></div>
      <div class="graph-bar-label">${d.day}</div>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="stats-section-title">📅 오늘 장소 이용</div>
    ${usageBars}
    <div class="stats-section-title" style="margin-top:14px;">💎 최근 7일 데이터 조각</div>
    <div class="graph-wrap">${graphBars || '<span style="color:#555;font-size:12px;">기록 없음</span>'}</div>
    <div class="stats-nums-grid">
      <div class="stats-num-card"><div class="sn-val">${playerStats._battleWins || 0}</div><div class="sn-label">전투 승리</div></div>
      <div class="stats-num-card"><div class="sn-val">${playerStats._explorationCount || 0}</div><div class="sn-label">총 탐험</div></div>
      <div class="stats-num-card"><div class="sn-val">${puangState.favorability}</div><div class="sn-label">호감도</div></div>
      <div class="stats-num-card"><div class="sn-val">${(JSON.parse(localStorage.getItem('labAchievements') || '[]')).length}</div><div class="sn-label">업적</div></div>
    </div>`;
}

// 매일 데이터 조각 이력 기록 (하루 1회 스냅샷)
function recordDataHistory() {
  const today = new Date().toDateString();
  const history = JSON.parse(localStorage.getItem('dataHistory') || '[]');
  const last = history[history.length - 1];
  if (!last || last.date !== today) {
    const days = ['일','월','화','수','목','금','토'];
    history.push({ date: today, day: days[new Date().getDay()], val: playerStats.data || 0 });
    if (history.length > 14) history.shift();
    localStorage.setItem('dataHistory', JSON.stringify(history));
  }
}
// ★ Fix 2: Firebase 로드 완료 후 스냅샷 — 1초 고정 타이머 대신 serverDataLoaded 확인
// (1초 고정이면 Firebase 로드 전이라 playerStats.data가 0으로 기록될 수 있음)
function recordDataHistorySafe() {
  // serverDataLoaded가 true면 바로, 아직이면 최대 5초 대기
  let attempts = 0;
  const tryRecord = () => {
    if (typeof serverDataLoaded === 'undefined' || serverDataLoaded === true) {
      recordDataHistory();
    } else if (attempts < 10) {
      attempts++;
      setTimeout(tryRecord, 500);
    }
  };
  setTimeout(tryRecord, 800);
}
document.addEventListener('DOMContentLoaded', () => { recordDataHistorySafe(); });


// ================================================================
// 14. Web Audio 효과음
// ================================================================

let _audioCtx = null;
let _sfxEnabled = true;

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playTone(freq, duration, type = 'sine', gain = 0.18) {
  if (!_sfxEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol); vol.connect(ctx.destination);
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

window.sfx = {
  click:    () => playTone(600, 0.07, 'square', 0.1),
  success:  () => { playTone(523, 0.1); setTimeout(() => playTone(659, 0.1), 100); setTimeout(() => playTone(784, 0.15), 200); },
  error:    () => { playTone(220, 0.15, 'sawtooth', 0.12); setTimeout(() => playTone(180, 0.2, 'sawtooth', 0.1), 120); },
  warning:  () => { playTone(440, 0.1, 'triangle'); setTimeout(() => playTone(440, 0.1, 'triangle'), 180); },
  purchase: () => { playTone(440, 0.08); setTimeout(() => playTone(550, 0.08), 80); setTimeout(() => playTone(660, 0.12), 160); },
  battle:   () => { playTone(150, 0.15, 'sawtooth', 0.15); setTimeout(() => playTone(200, 0.2, 'square', 0.1), 100); },
  levelup:  () => [523,587,659,698,784,880].forEach((f,i) => setTimeout(() => playTone(f, 0.12), i * 80)),
  enter:    () => { playTone(330, 0.08, 'sine', 0.12); setTimeout(() => playTone(440, 0.1), 90); },
};

window.toggleSfx = function() {
  _sfxEnabled = !_sfxEnabled;
  const btn = document.getElementById('sfx-toggle-btn');
  if (btn) btn.textContent = _sfxEnabled ? '🔊' : '🔇';
  localStorage.setItem('sfxEnabled', _sfxEnabled ? '1' : '0');
  if (typeof showToast === 'function') showToast(_sfxEnabled ? '🔊 효과음 ON' : '🔇 효과음 OFF', 'info', 1500);
};

// 버튼 클릭에 효과음 연결
document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.classList.contains('map-spot'))     { window.sfx.enter();    return; }
  if (btn.classList.contains('inv-use-btn'))  { window.sfx.purchase(); return; }
  if (btn.classList.contains('quick-btn'))    { window.sfx.click();    return; }
  if (btn.classList.contains('store-cart-buy-btn')) { window.sfx.purchase(); return; }
  window.sfx.click();
}, { passive: true });

// 토스트 타입별 효과음
const _origShowToast = window.showToast;
if (_origShowToast) {
  window.showToast = function(msg, type = 'info', duration = 2500) {
    _origShowToast(msg, type, duration);
    if (type === 'success') window.sfx.success();
    else if (type === 'error') window.sfx.error();
    else if (type === 'warning') window.sfx.warning();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('sfxEnabled');
  if (saved === '0') _sfxEnabled = false;
  // 퀵바에 효과음 버튼 추가
  const bar = document.getElementById('quick-bar');
  if (bar) {
    const btn = document.createElement('button');
    btn.id = 'sfx-toggle-btn';
    btn.className = 'quick-btn';
    btn.title = '효과음 토글';
    btn.innerHTML = `<span class="quick-icon">${_sfxEnabled ? '🔊' : '🔇'}</span><span class="quick-label">효과음</span>`;
    btn.onclick = window.toggleSfx;
    bar.appendChild(btn);
  }
});


// ================================================================
// 15. 날씨 연동 이벤트 (Open-Meteo 무료 API)
// ================================================================

let _weatherData = null;

async function fetchWeather() {
  // 서울 좌표 고정 (중앙대 위치)
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5045&longitude=126.9544&current=weathercode,temperature_2m&timezone=Asia%2FSeoul';
  try {
    const res  = await fetch(url);
    const data = await res.json();
    const code = data?.current?.weathercode;
    const temp = data?.current?.temperature_2m;
    _weatherData = { code, temp };
    applyWeatherEffects(code, temp);
    showWeatherOverlay(code);
    displayWeatherBadge(code, temp);
  } catch(e) {
    console.log('날씨 API 실패:', e);
  }
}

// WMO 날씨 코드 분류
function getWeatherType(code) {
  if (code === 0) return 'clear';
  if (code <= 3)  return 'cloudy';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 99) return 'storm';
  return 'cloudy';
}

function applyWeatherEffects(code, temp) {
  const type = getWeatherType(code);
  // 비 오는 날 보너스
  if (type === 'rain' || type === 'storm') {
    window._weatherCafBonus  = 10; // 식당 SP+10
    window._weatherLibBonus  = 2;  // 도서관 보상+2
    if (typeof showToast === 'function') showToast('🌧️ 비 오는 날 보너스! 식당 SP+10, 도서관+2💎', 'info', 4000);
  }
  // 눈 오는 날
  if (type === 'snow') {
    window._weatherCafBonus  = 5;
    if (typeof showToast === 'function') showToast('❄️ 눈 오는 날! 따뜻한 식당 SP+5 보너스', 'info', 3500);
  }
  // 맑은 날
  if (type === 'clear') {
    window._weatherFestBonus = 3;
    if (typeof showToast === 'function') showToast('☀️ 맑은 날! 축제 보상+3💎 보너스', 'success', 3500);
  }
}

function showWeatherOverlay(code) {
  const type = getWeatherType(code);
  const mapBg = document.getElementById('map-bg');
  if (!mapBg) return;

  // 기존 날씨 레이어 제거
  const old = document.getElementById('weather-layer');
  if (old) old.remove();

  if (type === 'clear') return;

  const layer = document.createElement('div');
  layer.id = 'weather-layer';
  layer.className = 'weather-layer weather-' + type;

  // 파티클 생성
  const count = type === 'rain' || type === 'storm' ? 40 : type === 'snow' ? 30 : 0;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'weather-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = (Math.random() * 3) + 's';
    p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    p.textContent = type === 'snow' ? '❄' : '|';
    layer.appendChild(p);
  }
  mapBg.appendChild(layer);
}

function displayWeatherBadge(code, temp) {
  const type = getWeatherType(code);
  const icons = { clear:'☀️', cloudy:'☁️', rain:'🌧️', snow:'❄️', storm:'⛈️' };
  const el = document.getElementById('weather-badge');
  if (el) {
    el.textContent = (icons[type] || '🌤️') + ' ' + Math.round(temp) + '°C';
    el.style.display = 'flex';
  }
}

// 날씨 뱃지 HTML은 index.html map-info-group에 추가됨 (아래 index.html 수정에서 처리)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(fetchWeather, 2000);
  setInterval(fetchWeather, 10 * 60 * 1000); // 10분마다 갱신
});



// ================================================================
// 16. 몬스터 도감
// ================================================================

window.registerMonsterCompendium = function(monster) {
  if (!monster) return;
  const comp = JSON.parse(localStorage.getItem('monsterCompendium') || '{}');
  if (!comp[monster.id]) {
    comp[monster.id] = { id: monster.id, name: monster.name, weakness: monster.weakness, count: 0, image: monster.image };
  }
  comp[monster.id].count++;
  localStorage.setItem('monsterCompendium', JSON.stringify(comp));
  if (comp[monster.id].count === 1) {
    if (typeof showToast === 'function') showToast('📖 도감 등록! ' + monster.name, 'info', 2500);
  }
  checkCompendiumReward(comp);
};

function checkCompendiumReward(comp) {
  const allMonsters = typeof window.MONSTERS !== 'undefined' ? Object.keys(window.MONSTERS) : [];
  const allBosses   = typeof window.BOSSES   !== 'undefined' ? Object.keys(window.BOSSES)   : [];
  const total = allMonsters.length + allBosses.length;
  const done  = Object.keys(comp).length;
  const key   = 'compendiumRewarded_' + done;
  if (!localStorage.getItem(key) && done >= Math.ceil(total * 0.5)) {
    localStorage.setItem(key, '1');
    playerStats.data += 20;
    if (typeof window.syncAndSave === 'function') window.syncAndSave();
    if (typeof showToast === 'function') showToast('📖 도감 50% 완성! 💎 +20', 'warning', 4000);
  }
}

window.openCompendium = function() {
  let ov = document.getElementById('compendium-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'compendium-overlay';
    ov.className = 'compendium-overlay';
    ov.innerHTML = `
      <div class="compendium-panel">
        <div class="compendium-header">
          <span class="compendium-title">📖 몬스터 도감</span>
          <button class="compendium-close" onclick="closeCompendium()">✕</button>
        </div>
        <div class="compendium-body" id="compendium-body"></div>
      </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) closeCompendium(); });
    document.body.appendChild(ov);
  }
  renderCompendium();
  ov.classList.add('comp-open');
};
window.closeCompendium = function() {
  const o = document.getElementById('compendium-overlay');
  if (o) o.classList.remove('comp-open');
};

window.renderCompendium = function renderCompendium() {
  const el   = document.getElementById('compendium-body');
  if (!el) return;
  const comp = JSON.parse(localStorage.getItem('monsterCompendium') || '{}');
  const allM = typeof window.MONSTERS !== 'undefined' ? Object.values(window.MONSTERS) : [];
  const allB = typeof window.BOSSES   !== 'undefined' ? Object.values(window.BOSSES)   : [];
  const all  = [...allM, ...allB];
  const done = Object.keys(comp).length;

  el.innerHTML = `<div class="comp-progress">발견 ${done} / ${all.length}종 — ${Math.round(done/Math.max(1,all.length)*100)}%</div>
    <div class="comp-progress-bar"><div class="comp-progress-fill" style="width:${Math.round(done/Math.max(1,all.length)*100)}%"></div></div>
    <div class="comp-grid">` +
    all.map(m => {
      const found = comp[m.id];
      return `<div class="comp-card ${found ? '' : 'comp-unknown'}">
        <div class="comp-img">${found ? '👹' : '❓'}</div>
        <div class="comp-name">${found ? m.name : '???'}</div>
        <div class="comp-info">${found ? '약점: ' + m.weakness + '<br>포획: ' + found.count + '회' : '미발견'}</div>
      </div>`;
    }).join('') + '</div>';
}


// ================================================================
// 17. 이벤트 캘린더
// ================================================================

const WEEK_EVENTS = {
  0: { name: '☀️ 일요일 휴식 보너스',   effect: () => { playerStats.sp = playerStats.maxSp; }, desc: '모든 장소 SP 완전 회복!' },
  1: { name: '💪 월요일 체육의 날',      effect: null, desc: '체육관 비용 -1 💎', bonusKey: 'gym_discount' },
  2: { name: '📚 화요일 도서관의 날',    effect: null, desc: '도서관 보상 2×', bonusKey: 'lib_double' },
  3: { name: '⚔️ 수요일 전투의 날',      effect: null, desc: '전투 보상 +5 💎', bonusKey: 'battle_bonus' },
  4: { name: '🍽️ 목요일 맛있는 날',     effect: null, desc: '식당 HP/SP 회복량 +10', bonusKey: 'caf_bonus' },
  5: { name: '🎪 금요일 축제의 날',      effect: null, desc: '축제 미니게임 보상 2×', bonusKey: 'fest_double' },
  6: { name: '💎 토요일 데이터의 날',    effect: null, desc: '모든 💎 획득 +2', bonusKey: 'data_bonus' },
};

// 중앙대 기념일 (월/일 기준)
const CAU_SPECIAL_DAYS = [
  { month: 4,  day: 10, name: '🎂 중앙대 개교기념일', desc: '모든 보상 1.5×! 💎 +10 지급', reward: 10 },
  { month: 5,  day: 5,  name: '🧒 어린이날',          desc: '도서관 무료 이용 + SP 완전 회복', reward: 5  },
  { month: 12, day: 25, name: '🎄 크리스마스',         desc: '전체 회복 + 💎 +15 지급',       reward: 15 },
];

window.getTodayEvent = function() {
  const now  = new Date();
  const day  = now.getDay();
  const mon  = now.getMonth() + 1;
  const date = now.getDate();
  const special = CAU_SPECIAL_DAYS.find(d => d.month === mon && d.day === date);
  return { weekEvent: WEEK_EVENTS[day], special };
};

// 요일 보너스 플래그 전역 노출
window._calendarBonusKey = function() {
  const { weekEvent } = window.getTodayEvent();
  return weekEvent?.bonusKey || null;
};

window.openCalendar = function() {
  let ov = document.getElementById('calendar-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'calendar-overlay';
    ov.className = 'calendar-overlay';
    ov.innerHTML = `
      <div class="calendar-panel">
        <div class="calendar-header">
          <span class="calendar-title">📅 이벤트 캘린더</span>
          <button class="calendar-close" onclick="closeCalendar()">✕</button>
        </div>
        <div class="calendar-body" id="calendar-body"></div>
      </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) closeCalendar(); });
    document.body.appendChild(ov);
  }
  renderCalendar();
  ov.classList.add('cal-open');
};
window.closeCalendar = function() {
  const o = document.getElementById('calendar-overlay');
  if (o) o.classList.remove('cal-open');
};

function renderCalendar() {
  const el = document.getElementById('calendar-body');
  if (!el) return;
  const { weekEvent, special } = window.getTodayEvent();
  const days = ['일','월','화','수','목','금','토'];

  el.innerHTML = `
    <div class="cal-today-section">
      <div class="cal-section-label">오늘 이벤트</div>
      <div class="cal-today-card">
        <div class="cal-today-name">${weekEvent.name}</div>
        <div class="cal-today-desc">${weekEvent.desc}</div>
        ${special ? `<div class="cal-special-badge">🎉 ${special.name} — ${special.desc}</div>` : ''}
      </div>
    </div>
    <div class="cal-section-label" style="margin-top:12px;">이번 주 일정</div>
    <div class="cal-week-grid">
      ${Object.entries(WEEK_EVENTS).map(([d, ev]) => {
        const isToday = parseInt(d) === new Date().getDay();
        return `<div class="cal-day-card ${isToday ? 'cal-today' : ''}">
          <div class="cal-day-label">${days[d]}</div>
          <div class="cal-day-event">${ev.name}</div>
          <div class="cal-day-desc">${ev.desc}</div>
        </div>`;
      }).join('')}
    </div>`;

  // 기념일 보상 지급 (하루 1회)
  if (special) {
    const rewardKey = 'specialReward_' + new Date().toDateString();
    if (!localStorage.getItem(rewardKey)) {
      localStorage.setItem(rewardKey, '1');
      playerStats.data += special.reward;
      if (typeof window.syncAndSave === 'function') window.syncAndSave();
      if (typeof showToast === 'function') showToast('🎉 ' + special.name + ' 💎 +' + special.reward, 'warning', 5000);
    }
  }
}

// 요일 보너스를 locations.js 계열에서 읽을 수 있도록 전역 노출
document.addEventListener('DOMContentLoaded', () => {
  const { weekEvent } = window.getTodayEvent();
  if (weekEvent) {
    window._todayBonusKey = weekEvent.bonusKey;
    if (weekEvent.effect) {
      setTimeout(() => {
        weekEvent.effect();
        if (typeof window.updateMapStats === 'function') window.updateMapStats();
        if (typeof showToast === 'function') showToast('📅 ' + weekEvent.name + ' — ' + weekEvent.desc, 'info', 4000);
      }, 2000);
    } else {
      setTimeout(() => {
        if (typeof showToast === 'function') showToast('📅 ' + weekEvent.name + ' — ' + weekEvent.desc, 'info', 3500);
      }, 2000);
    }
  }
});


// ================================================================
// 18. Firebase 리더보드
// ================================================================

window.openLeaderboard = function() {
  let ov = document.getElementById('leaderboard-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'leaderboard-overlay';
    ov.className = 'leaderboard-overlay';
    ov.innerHTML = `
      <div class="leaderboard-panel">
        <div class="leaderboard-header">
          <span class="leaderboard-title">🏆 리더보드</span>
          <button class="leaderboard-close" onclick="closeLeaderboard()">✕</button>
        </div>
        <div class="lb-tabs">
          <button class="lb-tab active" onclick="switchLbTab('data')">💎 데이터</button>
          <button class="lb-tab" onclick="switchLbTab('favor')">🐉 호감도</button>
          <button class="lb-tab" onclick="switchLbTab('battle')">⚔️ 전투</button>
        </div>
        <div class="leaderboard-body" id="leaderboard-body">
          <div class="lb-loading">불러오는 중...</div>
        </div>
      </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) closeLeaderboard(); });
    document.body.appendChild(ov);
  }
  ov.classList.add('lb-open');
  loadLeaderboard('data');
};
window.closeLeaderboard = function() {
  const o = document.getElementById('leaderboard-overlay');
  if (o) o.classList.remove('lb-open');
};

let _lbCurrentTab = 'data';
window.switchLbTab = function(tab) {
  _lbCurrentTab = tab;
  document.querySelectorAll('.lb-tab').forEach(b => b.classList.remove('active'));
  document.querySelector(`.lb-tab[onclick*="${tab}"]`)?.classList.add('active');
  loadLeaderboard(tab);
};

window.loadLeaderboard = async function loadLeaderboard(tab) {
  const el = document.getElementById('leaderboard-body');
  if (!el) return;
  el.innerHTML = '<div class="lb-loading">🔄 불러오는 중...</div>';

  try {
    if (typeof db === 'undefined') throw new Error('Firebase 미연결');
    const fieldMap = { data: 'playerStats.data', favor: 'puangState.favorability', battle: 'playerStats._battleWins' };
    const field = fieldMap[tab];

    const snap = await db.collection('gameData').orderBy(field, 'desc').limit(10).get();
    if (snap.empty) { el.innerHTML = '<div class="lb-loading">데이터가 없어요.</div>'; return; }

    const rows = [];
    snap.forEach((doc, i) => {
      const d = doc.data();
      const name = d.playerStats?.name || '탐험가';
      let val;
      if (tab === 'data')   val = (d.playerStats?.data || 0) + ' 💎';
      if (tab === 'favor')  val = Number(d.puangState?.favorability || 0) + ' / 100';  // 호감도 랭킹 '/' 표시 안 되는 것 수정 완료
      if (tab === 'battle') val = (d.playerStats?._battleWins || 0) + ' 승';
      rows.push({ name, val });
    });

    const myKey  = GROQ_API_KEY;
    const mySnap = myKey ? await db.collection('gameData').doc(myKey).get() : null;
    const myData = mySnap?.data();
    let myVal;
    if (myData) {
      if (tab === 'data')   myVal = (myData.playerStats?.data || 0) + ' 💎';
      if (tab === 'favor')  myVal = Number(myData.puangState?.favorability || 0) + ' / 100';
      if (tab === 'battle') myVal = (myData.playerStats?._battleWins || 0) + ' 승';
    }

    const medals = ['🥇','🥈','🥉'];
    el.innerHTML = `<div class="lb-list">` +
      rows.map((r, i) => `
        <div class="lb-row ${i < 3 ? 'lb-top' : ''}">
          <span class="lb-rank">${medals[i] || (i + 1)}</span>
          <span class="lb-name">${r.name}</span>
          <span class="lb-val">${r.val}</span>
        </div>`).join('') +
      (myVal ? `<div class="lb-myrank">내 기록: ${myVal}</div>` : '') +
      `</div>`;
  } catch(e) {
    el.innerHTML = `<div class="lb-loading">리더보드를 불러올 수 없어요.<br><small>${e.message}</small></div>`;
  }
}


// ================================================================
// 19. 키보드 단축키
// ================================================================

document.addEventListener('keydown', e => {
  // 입력 중일 때는 무시
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const key = e.key.toLowerCase();

  // 전역 단축키
  if (key === 'i') { e.preventDefault(); typeof window.openInventory === 'function' && window.openInventory(); return; }
  if (key === 'p') { e.preventDefault(); typeof window.openProfile   === 'function' && window.openProfile();   return; }
  if (key === 'm') { e.preventDefault(); typeof window.goToMap       === 'function' && window.goToMap();       return; }
  if (key === 'd') { e.preventDefault(); typeof window.openCompendium=== 'function' && window.openCompendium();return; }
  if (key === 'l') { e.preventDefault(); typeof window.openLeaderboard==='function' && window.openLeaderboard();return;}
  if (key === 'c') { e.preventDefault(); typeof window.openCalendar  === 'function' && window.openCalendar();  return; }

  // ESC — 모든 팝업 닫기
  if (key === 'escape') {
    ['inventory-overlay','profile-overlay','stats-overlay','compendium-overlay',
     'calendar-overlay','leaderboard-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('inv-open','profile-open','stats-open','comp-open','cal-open','lb-open');
    });
    return;
  }

  // 전투 중 숫자 단축키
  const battleCont = document.getElementById('battle-container');
  if (battleCont && (battleCont.classList.contains('visible') || battleCont.style.display !== 'none')) {
    const cmdMap = { '1':'attack', '2':'rag', '3':'hyper', '4':'special', '5':'run' };
    if (cmdMap[e.key]) {
      e.preventDefault();
      if (typeof window.doCmd === 'function') window.doCmd(cmdMap[e.key]);
    }
  }
});

// 키보드 힌트 토스트 (최초 1회)
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('keyHintShown')) {
    setTimeout(() => {
      if (typeof showToast === 'function') showToast('⌨️ 단축키: I=인벤 P=프로필 D=도감 L=리더보드 C=캘린더 ESC=닫기', 'info', 5000);
      localStorage.setItem('keyHintShown', '1');
    }, 3000);
  }
});


// ================================================================
// 20. 공유 카드 생성 (Canvas API)
// ================================================================

window.generateShareCard = function() {
  const canvas = document.createElement('canvas');
  canvas.width  = 480;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');

  // 배경 그라디언트
  const grad = ctx.createLinearGradient(0, 0, 480, 280);
  grad.addColorStop(0, '#0d1117');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 280);

  // 테두리
  ctx.strokeStyle = '#0f3460';
  ctx.lineWidth   = 2;
  ctx.strokeRect(4, 4, 472, 272);

  // 타이틀
  ctx.fillStyle = '#6c8ebf';
  ctx.font      = 'bold 11px monospace';
  ctx.fillText('CAU 푸앙 월드 · 탐험 기록', 20, 30);

  // 닉네임 + 칭호
  const name  = playerStats.name || localStorage.getItem('playerName') || '탐험가';
  const title = typeof getActiveTitle === 'function' ? getActiveTitle().name : '탐험가';
  ctx.fillStyle = '#e0e0e0';
  ctx.font      = 'bold 22px sans-serif';
  ctx.fillText(name, 20, 65);
  ctx.fillStyle = '#6c8ebf';
  ctx.font      = '13px monospace';
  ctx.fillText('[' + title + ']', 20, 88);

  // 구분선
  ctx.strokeStyle = '#0f3460';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(20, 100); ctx.lineTo(460, 100); ctx.stroke();

  // 스탯 그리드
  const stats = [
    ['❤️ HP', playerStats.hp + '/' + playerStats.maxHp],
    ['💙 SP', playerStats.sp + '/' + playerStats.maxSp],
    ['💎 데이터', (playerStats.data || 0) + '개'],
    ['⚔️ 전투승리', (playerStats._battleWins || 0) + '회'],
    ['🗺️ 탐험수', (playerStats._explorationCount || 0) + '회'],
    ['🐉 호감도', (puangState.favorability) + '/ 100'],  // 호감도 랭킹 UI '/' 표시 안 되는 것 수정 완료
  ];
  ctx.font = '13px monospace';
  stats.forEach(([label, val], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x   = 20 + col * 230;
    const y   = 128 + row * 38;
    ctx.fillStyle = '#6c8ebf'; ctx.fillText(label, x, y);
    ctx.fillStyle = '#e0e0e0'; ctx.fillText(val,   x, y + 16);
  });

  // 날짜
  ctx.fillStyle = '#4a6090';
  ctx.font      = '10px monospace';
  ctx.fillText(new Date().toLocaleDateString('ko-KR') + ' 기록', 20, 262);
  ctx.fillText('🌐 CAU 블루미르 빌리지', 300, 262);

  // 다운로드
  const a  = document.createElement('a');
  a.download = 'cau_puang_' + name + '.png';
  a.href     = canvas.toDataURL('image/png');
  a.click();
  if (typeof showToast === 'function') showToast('📤 탐험 카드 저장 완료!', 'success', 2500);
};


// ================================================================
// 21. 닉네임 · 아바타 편집 (프로필 팝업 확장)
// ================================================================

const AVATAR_OPTIONS = ['🧑‍💻','👨‍🎓','👩‍🎓','🧙','🦸','🧝','🤖','👾','🐉','🦊'];

window.openProfileEdit = function() {
  const current = playerStats.name || localStorage.getItem('playerName') || '';
  const curAvatar = localStorage.getItem('playerAvatar') || '🧑‍💻';
  let html = `
    <div class="edit-profile-modal">
      <div class="edit-title">✍️ 프로필 편집</div>
      <input id="edit-name-input" class="edit-name-input" value="${current}" placeholder="닉네임 입력" maxlength="12">
      <div class="edit-avatar-label">아바타 선택</div>
      <div class="edit-avatar-grid">
        ${AVATAR_OPTIONS.map(a => `<button class="edit-avatar-btn ${a === curAvatar ? 'selected' : ''}" onclick="selectAvatar('${a}')">${a}</button>`).join('')}
      </div>
      <div class="edit-btns">
        <button class="edit-save-btn" onclick="saveProfileEdit()">저장</button>
        <button class="edit-cancel-btn" onclick="closeProfileEdit()">취소</button>
      </div>
    </div>`;

  let ov = document.getElementById('profile-edit-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'profile-edit-overlay';
    ov.className = 'profile-edit-overlay';
    ov.addEventListener('click', e => { if (e.target === ov) closeProfileEdit(); });
    document.body.appendChild(ov);
  }
  ov.innerHTML = html;
  ov.classList.add('edit-open');
};

window.selectAvatar = function(emoji) {
  document.querySelectorAll('.edit-avatar-btn').forEach(b => b.classList.remove('selected'));
  const btn = [...document.querySelectorAll('.edit-avatar-btn')].find(b => b.textContent === emoji);
  if (btn) btn.classList.add('selected');
  localStorage.setItem('playerAvatar', emoji);
  const profileAvatar = document.getElementById('profile-avatar-emoji');
  if (profileAvatar) profileAvatar.textContent = emoji;
};

window.saveProfileEdit = function() {
  const input = document.getElementById('edit-name-input');
  const name  = input ? input.value.trim() : '';
  if (!name) { if (typeof showToast === 'function') showToast('닉네임을 입력해주세요!', 'warning', 2000); return; }

  playerStats.name = name;
  localStorage.setItem('playerName', name);
  const avatar = localStorage.getItem('playerAvatar') || '🧑‍💻';
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = name;
  const avatarEl = document.getElementById('profile-avatar-display');
  if (avatarEl) avatarEl.textContent = avatar;

  if (typeof window.syncAndSave === 'function') window.syncAndSave();
  closeProfileEdit();
  if (typeof showToast === 'function') showToast('✅ 프로필 저장 완료!', 'success', 2000);
};

window.closeProfileEdit = function() {
  const o = document.getElementById('profile-edit-overlay');
  if (o) o.classList.remove('edit-open');
};


// ================================================================
// 22. PWA — manifest + Service Worker 자동 등록
// ================================================================

// manifest.json 동적 생성
function injectManifest() {
  if (document.querySelector('link[rel="manifest"]')) return;
  const manifest = {
    name: 'CAU 푸앙 월드',
    short_name: '푸앙 월드',
    description: '중앙대학교 캠퍼스 RPG 게임',
    start_url: './',
    display: 'standalone',
    background_color: '#0d1117',
    theme_color: '#16213e',
    icons: [
      { src: 'images/puang/puang_title.png', sizes: '192x192', type: 'image/png' },
      { src: 'images/puang/puang_title.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('link');
  link.rel   = 'manifest'; link.href = url;
  document.head.appendChild(link);
}

// Service Worker 등록 (오프라인 캐시)
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  const swCode = `
const CACHE = 'cau-puang-v1';
const ASSETS = ['/', './index.html', './js/state.js', './js/locations.js', './js/ui_enhancements.js', './css/style.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.filter(Boolean))));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});`;
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl).catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
  injectManifest();
  setTimeout(registerSW, 1000);
});

