// ================================================================
// map.js — 맵 화면 로직
// 장소 데이터, 장소 진입 함수, 툴팁, 날짜/시간 표시
// ================================================================

// ── 계절별 맵 이미지 ──
const SEASON_MAPS = {

  spring: 'images/map/cau_map_spring.png',  // 3~5월
  summer: 'images/map/cau_map_summer.png',  // 6~8월
  autumn: 'images/map/cau_map_autmn.png',   // 9~11월 (파일명 오타 그대로 유지)
  winter: 'images/map/cau_map_winter.png',  // 12~2월
};

const SEASON_LABELS = {
  spring: '🌸 봄',
  summer: '🌿 여름',
  autumn: '🍂 가을',
  winter: '❄️ 겨울',
};

function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1~12
  if (month >= 3 && month <= 5)  return 'spring';
  if (month >= 6 && month <= 8)  return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter'; // 12, 1, 2
}

function updateSeasonMap() {
  const season = getCurrentSeason();
  const img = document.getElementById('map-season-img');
  if (!img) return;

  // 이미 같은 계절이면 스킵
  if (img.getAttribute('data-season') === season) return;
  img.setAttribute('data-season', season);

  // 페이드 아웃 → 이미지 교체 → 페이드 인
  img.style.transition = 'opacity 0.8s ease';
  img.style.opacity = '0';

  setTimeout(() => {
    img.src = SEASON_MAPS[season];
    img.onerror = () => {
      img.src = 'images/map/cau_map.png'; // 이미지 없으면 기본값 폴백
    };
    img.style.opacity = '1';

    // 계절 배지 표시 (있으면)
    const badge = document.getElementById('season-badge');
    if (badge) {
      badge.textContent = SEASON_LABELS[season];
      badge.style.opacity = '1';
      setTimeout(() => { badge.style.opacity = '0'; }, 3000);
    }
  }, 800);
}

// ── 맵 장소 데이터 ──
// 각 장소의 라벨, 설명, 잠금 여부 정의
// enterPlace()에서 참조하고 툴팁 호버에도 사용됨
const placeInfo = {
  dormitory:      { label: '블루미르홀',    desc: '푸앙 수호신과 대화하고 호감도를 올려보세요!',       locked: false },
  lab:            { label: '310관 연구실',  desc: '베이스캠프 — 세이브 & 스탯 확인',                 locked: false },
  battle:         { label: '205관 이면세계', desc: '공사중인 건물에서 이상 반응이?! 전투 진입',         locked: false },
  cafeteria:      { label: '학생식당',      desc: 'HP/SP 회복 — 얼어붙은 아메리카노 판매 중',         locked: false },
  store:          { label: '아이템 가게',   desc: '아이템 구매 — 데이터 조각으로 교환',               locked: false },
  library:        { label: '중앙도서관',    desc: '공부하면 데이터 조각 획득!',                       locked: false },
  bluedragonlake: { label: '청룡호',        desc: '🔒 푸앙이 호감도 MAX 달성 시 개방',               locked: true  },
  clinic:         { label: '의무실',        desc: 'HP/SP 완전 회복 — 비용 높음',                     locked: false },
  lab2:           { label: '공대 실험실',   desc: '데이터 조각으로 아이템 제조!',                     locked: false },
  festival:       { label: '중앙 축제',     desc: '미니게임으로 데이터 조각 획득!',                   locked: false },
  union:          { label: '학생회관',      desc: '프리미엄 아이템 구매',                             locked: false },
  mountain:       { label: '청룡산',        desc: '⚠ 보스 던전 — 강한 적, 큰 보상',                 locked: false },
  gym:            { label: '체육관',        desc: '훈련으로 최대 HP/SP 영구 증가!',                   locked: false },
};

// ── body 배경 테마 제어 ──
const PLACE_BG_CLASSES = [
  'place-dormitory','place-cafeteria','place-library','place-lab',
  'place-gym','place-clinic','place-lab2','place-festival',
  'place-union','place-store','place-mountain','place-battle',
  'place-explore','place-bluedragonlake'
];
window.setPlaceBg = function(id) {
  PLACE_BG_CLASSES.forEach(c => document.body.classList.remove(c));
  if (id) document.body.classList.add('place-' + id);
};
window.clearPlaceBg = function() {
  PLACE_BG_CLASSES.forEach(c => document.body.classList.remove(c));
};

// ── 장소 진입 함수 ──
// 맵 버튼 클릭 시 호출, 잠금 여부 확인 후 해당 화면으로 전환
window.enterPlace = function(placeId) {
  const info = placeInfo[placeId];
  if (info.locked) {
    alert('🔒 ' + info.desc);
    return;
  }

  // ★ Fix: HP 0 상태에서 전투/탐험 진입 차단 (의무실 외)
  if (typeof playerStats !== 'undefined' && playerStats.hp <= 0) {
    const safePlaces = ['clinic', 'lab', 'dormitory'];
    if (!safePlaces.includes(placeId)) {
      showSystemMsgOnMap('⚠️ HP가 0입니다! 의무실에서 회복 후 이동하세요.');
      if (typeof showToast === 'function') showToast('❤️ HP 0 — 의무실에서 회복하세요!', 'error', 3000);
      return;
    }
  }

  // 1. 모든 컨테이너 숨기기 
  // (index.html에 추가한 explore-container를 포함하여 숨깁니다)
  const containers = [
    'game-container', 'battle-container', 'cafeteria-container', 
    'library-container', 'lab-container', 'explore-container', 
    'puang-room', 'gym-container', 'clinic-container', 'lab2-container',
    'festival-container', 'union-container', 'mountain-container', 'store-container'
  ];

  // 장소 이동 시 모든 컨테이너 숨기기
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('visible');
    }
  });

  // 2. 이면 세계 (탐험) 진입
  // ★ Fix #3: setTimeout 콜백 내 return은 outer 함수를 종료하지 못하므로
  //   블록 바깥에 return을 추가해 아래 if문들이 연달아 실행되는 버그 수정
  if (placeId === 'battle') {
    // 층 선택 장면 추가
    if (typeof window.showFloorSelectScreen === 'function') window.showFloorSelectScreen();

    return;
  }

  // 각 장소 진입 함수 연결
  if (placeId === 'dormitory') { window.setPlaceBg('dormitory'); enterRoom();      return; }
  if (placeId === 'cafeteria') { window.setPlaceBg('cafeteria'); enterCafeteria(); return; }
  if (placeId === 'library')   { window.setPlaceBg('library');   enterLibrary();   return; }
  if (placeId === 'lab')       { window.setPlaceBg('lab');       enterLab();       return; }
  if (placeId === 'clinic')    { window.setPlaceBg('clinic');    enterClinic();    return; }
  if (placeId === 'lab2')      { window.setPlaceBg('lab2');      enterLab2();      return; }
  if (placeId === 'festival')  { window.setPlaceBg('festival');  enterFestival();  return; }
  if (placeId === 'union')     { window.setPlaceBg('union');     enterUnion();     return; }
  if (placeId === 'mountain')  { window.setPlaceBg('mountain');  enterMountain();  return; }
  if (placeId === 'gym')       { window.setPlaceBg('gym');       enterGym();       return; }
  if (placeId === 'store')     { window.setPlaceBg('store');     enterStore();     return; }

  // 미구현 장소는 툴팁으로 안내
  showSystemMsgOnMap('[' + info.label + '] ' + info.desc + ' (추후 구현 예정)');
}

// ── 맵 시스템 메시지 ──
// 툴팁을 재활용해서 맵 중앙에 메시지 표시
// 이면 세계 진입 연출 등에 사용
function showSystemMsgOnMap(msg) {
  const tip = document.getElementById('map-tooltip');
  tip.textContent = msg;
  tip.style.left = '50%';
  tip.style.top = '50%';
  tip.style.opacity = '1';
  setTimeout(() => { tip.style.opacity = '0'; }, 2500);
}

// ── 맵으로 복귀 ──
// 전투/장소 화면에서 맵으로 돌아올 때 공통으로 사용
window.returnToGame = function() {
  window.clearPlaceBg();
  // 1. 모든 전투 화면 정리
  const battleCont = document.getElementById('battle-container');
  if (battleCont) {
    battleCont.classList.remove('visible');
    battleCont.style.display = 'none';
  }

  // ★ Fix #5: battleOrigin은 battle.js의 let 변수이므로 window.battleOrigin으로 안전 참조
  //   (파일 로드 순서나 스코프 변경에도 깨지지 않도록)
  const origin = (typeof window.battleOrigin !== 'undefined')
    ? window.battleOrigin
    : (typeof battleOrigin !== 'undefined' ? battleOrigin : 'other');

  // 2. 복귀 위치 분기 처리
  if (origin === 'map'){
    // 205관 탐험 맵으로 복귀
    const exploreCont = document.getElementById('explore-container');
    if (exploreCont) exploreCont.style.display = 'block';

    // 🌟 중요: 이동 잠금 해제 및 좌표 동기화
    if (typeof player !== 'undefined') {
      player.isMoving = false;
      player.x = player.gridX * 32;
      player.y = player.gridY * 32;
    }

    // 방 전투 콜백 실행
    if (typeof window._onExploreRoomBattleEnd === 'function') window._onExploreRoomBattleEnd();
    else {
      if (typeof update === 'function') requestAnimationFrame(update);
    }
  } 
  
  else {
    // 일반 전체 맵(청룡산 등)으로 복귀
    // ★ Fix: battle-container visible 클래스까지 제거 + 모든 장소 컨테이너 숨기기
    const bc = document.getElementById('battle-container');
    if (bc) { bc.classList.remove('visible'); bc.style.display = 'none'; }
    
    ['mountain-container', 'cafeteria-container', 'library-container',
     'lab-container', 'gym-container', 'clinic-container', 'lab2-container',
     'festival-container', 'union-container', 'store-container', 'puang-room'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    document.getElementById('game-container').style.display = 'flex';
  }
}

// ── 실시간 날짜/시간 표시 ──
// 페르소나 5 스타일로 맵 좌측 상단에 표시
// 게임 내 시간으로 바꾸려면 이 함수 안 로직만 수정하면 됨
function updateDatetime() {
  const now = new Date();
  const days   = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  const month = months[now.getMonth()];
  const date  = now.getDate();
  const day   = days[now.getDay()];
  const hour  = String(now.getHours()).padStart(2, '0');
  const min   = String(now.getMinutes()).padStart(2, '0');

  document.getElementById('datetime-display').textContent
    = `${month}${date}日 ${day} ${hour}:${min}`;
}

// ── 툴팁 호버 이벤트 등록 ──
// 맵 버튼에 마우스를 올리면 장소 설명 툴팁 표시
// ★ Fix #14: 모바일(touch) 지원 추가 — touchstart로 툴팁 표시, touchend로 숨김
document.addEventListener('DOMContentLoaded', () => {
    // 계절 맵 적용 (페이지 로드 시)
    updateSeasonMap();

    // 1분마다 시간 갱신
    updateDatetime();
    setInterval(updateDatetime, 60000);

    document.querySelectorAll('.map-spot').forEach(btn => {
        const place = btn.getAttribute('onclick').match(/'(\w+)'/)[1];
        const tip   = document.getElementById('map-tooltip');

        function showTip(e) {
            tip.textContent = placeInfo[place].desc;
            const bRect = btn.getBoundingClientRect();
            const mRect = document.getElementById('map-bg').getBoundingClientRect();
            tip.style.left    = (bRect.left - mRect.left + bRect.width / 2) + 'px';
            tip.style.top     = (bRect.bottom - mRect.top + 8) + 'px';
            tip.style.opacity = '1';
        }
        function hideTip() { tip.style.opacity = '0'; }

        // 데스크탑
        btn.addEventListener('mouseenter', showTip);
        btn.addEventListener('mouseleave', hideTip);

        // ★ Fix #14: 모바일 터치
        btn.addEventListener('touchstart', (e) => {
            showTip(e);
            // 1.5초 후 자동으로 숨기기 (터치는 mouseleave 없음)
            clearTimeout(btn._tipTimer);
            btn._tipTimer = setTimeout(hideTip, 1500);
        }, { passive: true });
        btn.addEventListener('touchend', () => {
            clearTimeout(btn._tipTimer);
            btn._tipTimer = setTimeout(hideTip, 800);
        }, { passive: true });
  });
});