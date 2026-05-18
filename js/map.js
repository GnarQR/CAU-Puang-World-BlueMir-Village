// ================================================================
// map.js — 맵 화면 로직
// 장소 데이터, 장소 진입 함수, 툴팁, 날짜/시간 표시
// ================================================================

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
  if (placeId === 'battle') {
    showSystemMsgOnMap('학생증을 단말기에 찍는다... 이면 세계의 균열 속으로 뛰어듭니다...');
    setTimeout(() => {
      // 탐험 컨테이너 표시
      const exploreCont = document.getElementById('explore-container');
      if (exploreCont) exploreCont.style.display = 'block';

      // 탐험 로직 및 루프 시작
      if (typeof startExploration === 'function') startExploration();
      return;
    });
  };

  // 각 장소 진입 함수 연결
  if (placeId === 'dormitory') { enterRoom();       return; }
  if (placeId === 'cafeteria') { enterCafeteria();  return; }
  if (placeId === 'library')   { enterLibrary();    return; }
  if (placeId === 'lab')       { enterLab();        return; }
  if (placeId === 'clinic')    { enterClinic();     return; }
  if (placeId === 'lab2')      { enterLab2();       return; }
  if (placeId === 'festival')  { enterFestival();   return; }
  if (placeId === 'union')     { enterUnion();      return; }
  if (placeId === 'mountain')  { enterMountain();   return; }
  if (placeId === 'gym')       { enterGym();        return; }
  if (placeId === 'store')     { enterStore();      return; }

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
  // 1. 모든 전투 화면 정리
  const battleCont = document.getElementById('battle-container');
  if (battleCont) {
    battleCont.classList.remove('visible');
    battleCont.style.display = 'none';
  }

  // 2. 복귀 위치 분기 처리
  if (battleOrigin === 'map'){
    // 205관 탐험 맵으로 복귀
    const exploreCont = document.getElementById('explore-container');
    if (exploreCont) exploreCont.style.display = 'block';

    // 🌟 중요: 이동 잠금 해제 및 좌표 동기화
    player.isMoving = false;
    player.x = player.gridX * 32;
    player.y = player.gridY * 32;

    // 🌟 루프 재실행
    requestAnimationFrame(update);
  } 
  
  else {
    // 일반 전체 맵(청룡산 등)으로 복귀
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
// 맵 버튼에 마우스를 올리면 장소 설명 툴팁 표시 (모바일에서는 미지원)
document.addEventListener('DOMContentLoaded', () => {
    // 1분마다 시간 갱신
    updateDatetime();
    setInterval(updateDatetime, 60000);

    document.querySelectorAll('.map-spot').forEach(btn => {
        const place = btn.getAttribute('onclick').match(/'(\w+)'/)[1];
        const tip   = document.getElementById('map-tooltip');
        btn.addEventListener('mouseenter', () => {
            tip.textContent = placeInfo[place].desc;
            const bRect = btn.getBoundingClientRect();
            const mRect = document.getElementById('map-bg').getBoundingClientRect();
            tip.style.left    = (bRect.left - mRect.left + bRect.width / 2) + 'px';
            tip.style.top     = (bRect.bottom - mRect.top + 8) + 'px';
            tip.style.opacity = '1';
        });
        btn.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  });
});