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

// buyStore 후킹
const _origBuyStore_toast = window.buyStore;
if (_origBuyStore_toast) {
  window.buyStore = function(id) {
    const before = playerStats.data;
    _origBuyStore_toast(id);
    if (playerStats.data < before) {
      const names = { hp_potion:'HP 포션', sp_potion:'SP 포션', full_potion:'풀 회복 포션', dmg_boost:'데미지 부스터', shield:'방어막' };
      showToast('🛒 ' + (names[id] || id) + ' 구매!', 'success', 2000);
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
