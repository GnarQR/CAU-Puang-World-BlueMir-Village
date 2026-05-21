// ================================================================
// battle.js — 전투 화면 로직
// 전투 초기화, 커맨드 처리, 주사위 애니메이션, 적 턴 자동 처리
// 전투의 재미를 위해 우선 순위로 수정할 파일
// ================================================================

// ── 전투 상태 변수 ──
// 전투 중 상태를 추적하는 변수들
// initBattle() 호출 시 초기화됨 (나중에는 플레이어 현재 HP / SP 상태 연동되도록)
let battlePlayerHp    = 80;     // 현재 플레이어 HP
let battlePlayerMaxHp = 100;    // 플레이어 최대 HP
let battlePlayerSp    = 40;     // ★ 현재 플레이어 SP
let battlePlayerMaxSp = 40;     // ★ 플레이어 최대 SP
// ★ Fix #5: battleOrigin을 window에도 노출 — map.js의 returnToGame에서 window.battleOrigin으로 안전하게 참조 가능
let battleOrigin      = 'map';  // 전투 시작 시 위치 (205관, 청룡산 등), 'map' | 'mountain'
window.battleOrigin   = battleOrigin; // ★ Fix #5 추가
let currentMonster    = null;   // 현재 전투 중인 몬스터 데이터 (MONSTERS 또는 BOSSES에서 가져옴)
let enemyHp           = 60;     // 현재 적 HP  (나중에는 몬스터에 따라 값 변경)
let enemyMaxHp        = 60;     // 적 최대 HP
let battleTurn        = 1;      // 현재 턴 수
let buffActive        = false;  // 하이퍼 프롬프트 버프 활성 여부 (다음 공격 데미지 2배)
let battleBusy        = false;  // 커맨드 처리 중 여부 (중복 입력 방지)

let player = {
  gridX: 2, 
  gridY: 10,           // 왼쪽 입구 근처로 시작접 지정
  x: 2 * 32, 
  y: 10 * 32,          // 초기 위치 조정
  isMoving: false,
  speed: 4             // 부드러운 이동 속도
};

// ── 탐험 맵 이미지 설정 ──
const TILE_SIZE = 32;
const MAP_WIDTH_TILES = 32; // collisionData의 한 줄 개수 (32개)
const MAP_HEIGHT_TILES = 19; // collisionData의 줄 수 (약 19줄)

const bgImage = new Image();
bgImage.src = 'images/map/205_building.jpg'; 

const playerImage = new Image();
playerImage.src = 'images/player/player_male_default.png'; 

const collisionData =  // 격자에 대한 충돌 데이터 (56은 벽, 0은 이동 가능)
            [56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56];

// 이미지가 로드되었는지 확인하는 플래그
let assetsLoaded = 0;
[bgImage, playerImage].forEach(img => {
    img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === 2) {
            console.log("모든 이미지 로드 완료!");
            // ★ Fix 4: requestAnimationFrame(update) 제거
            // 루프는 startExploration() 에서만 시작 — 이미지 로드·startExploration·복귀 시
            // 3중 루프가 동시에 돌아 캐릭터가 배속 이동하던 버그 수정
        }
    };
});

// ── 그리기 함수 (draw) ──
function draw() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // 1. 배경 지우기
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);  // 2. 배경 그리기 ★ Fix 6: 고정 1024→canvas.width/height (그림 잘림 방지)

    // 3. 캐릭터 그 위에 얹기
    // player.x와 player.y는 '스르륵' 로직으로 변하는 실시간 좌표입니다.
    if (playerImage.complete && playerImage.naturalWidth !== 0){
      // 캐릭터의 발 위치가 타일 중앙에 오도록 살짝 보정 (x는 그대로, y는 이미지 높이만큼 위로)
      // 캐릭터 크기가 64x64이므로, 타일(32x32) 중앙에 발을 맞추려면 조절이 필요합니다.
      const drawX = player.x - 16; // 64px 이미지이므로 중앙 정렬을 위해 16px 왼쪽으로
      const drawY = player.y - 48; // 발끝이 타일 위치에 오도록 위로 48px 올림
      ctx.drawImage(playerImage, drawX, drawY, 64, 64);  // 이미지가 완전히 로드된 경우에만 그리기
    } 

    // [디버깅용] 벽 위치 눈으로 확인하기 
    /*
    collisionData.forEach((val, i) => {
        if (val === 56) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect((i % 32) * 32, Math.floor(i / 32) * 32, 32, 32);
        }
    });
    */
}

// ── 메인 맵으로 돌아가기 기능 구현 ──
// 1. 팝업 열기
window.showExitPopup = function() {
    const popup = document.getElementById('exit-popup');
    if (popup) {
        popup.classList.remove('hidden');
        player.isMoving = false;  // 이동 중이라면 잠시 멈춤 처리
    }
};

// 2. 팝업 닫기 (취소 버튼)
window.closeExitPopup = function() {
    const popup = document.getElementById('exit-popup');
    if (popup) popup.classList.add('hidden');
};

// 3. 탈출 확인 (확인 버튼)
window.confirmExitExploration = function() {
    closeExitPopup();  // 팝업 닫기

    console.log("탐험 중단 및 캠퍼스 복귀");  // 기존 탈출 로직 실행
    
    // 전투 관련 localStorage 초기화
    localStorage.removeItem('inBattle');
    localStorage.removeItem('battleOrigin');
    localStorage.removeItem('battleEnemyHp');
    localStorage.removeItem('battlePlayerHp');
    localStorage.removeItem('battleTurn');
    localStorage.removeItem('battleBossId');

    // 화면 전환
    document.getElementById('explore-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';

    // 맵 상태 업데이트
    if (typeof updateMapStats === 'function') updateMapStats();
};

// ── 탐험 모드 시작 함수 ──
window.startExploration = function() {
    console.log("이면 세계 탐험 시작");

    // ★ Fix 3: 이미지 로드 전 진입 시 검은 화면 방지
    // 이미지가 아직 로드 중이면 로드 완료 후 재시도
    if (assetsLoaded < 2) {
        console.log("이미지 로드 중... 대기");
        const checkReady = setInterval(() => {
            if (assetsLoaded >= 2) {
                clearInterval(checkReady);
                window.startExploration();
            }
        }, 100);
        return;
    }

    // ★ Fix 6: 캔버스 해상도를 컨테이너 실제 크기에 맞게 설정 (그림 잘림 방지)
    // CSS로 건드리지 않고 canvas.width/height를 직접 설정해야 해상도 불일치 없음
    const canvas = document.getElementById('map-canvas');
    const container = document.getElementById('explore-container');
    if (canvas && container) {
    // ★ Fix #6: 모바일에서 container.clientWidth가 0일 때 window.innerWidth로 폴백
    //   (1024 고정 폴백은 모바일에서 가로 스크롤 및 좌표 어긋남 유발)
    const w = container.clientWidth  || window.innerWidth  || 1024;
    const h = container.clientHeight || window.innerHeight || 598;
    // 실제 픽셀 해상도 설정 (이걸 안 하면 위쪽 절반만 보이고 아래 검은색)
    canvas.width  = w;
    canvas.height = h;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    }

    // 플레이어 초기 위치 설정
    player.gridX = 2;
    player.gridY = 10;
    player.x = player.gridX * 32;
    player.y = player.gridY * 32;
    player.isMoving = false;

    // ★ Fix #7: 창 크기 변경 시 탐험 캔버스도 리사이즈
    //   기존에는 resize 핸들러가 없어 브라우저 창 조절 시 캔버스가 잘리거나 늘어남
    if (!window._exploreResizeHandler) {
      window._exploreResizeHandler = function() {
        const cv = document.getElementById('map-canvas');
        const ct = document.getElementById('explore-container');
        if (!cv || !ct || ct.style.display === 'none') return;
        const nw = ct.clientWidth  || window.innerWidth  || 1024;
        const nh = ct.clientHeight || window.innerHeight || 598;
        cv.width  = nw; cv.height  = nh;
        cv.style.width  = nw + 'px';
        cv.style.height = nh + 'px';
      };
      window.addEventListener('resize', window._exploreResizeHandler);
    }

    // 애니메이션 루프 시작
    requestAnimationFrame(update);
};

// 캐릭터 움직이는 함수
function movePlayer(dx, dy) {
    const nextGridX = player.gridX + dx;
    const nextGridY = player.gridY + dy;

    // 1. 맵 경계 체크
    if (nextGridX < 0 || nextGridX >= MAP_WIDTH_TILES || nextGridY < 0 || nextGridY >= MAP_HEIGHT_TILES) return;

    // 2. 벽 체크 (56이면 리턴)
    const nextIdx = nextGridY * MAP_WIDTH_TILES + nextGridX;

    // 데이터 보호: 인덱스 범위를 벗어나는지 확인
    if (nextIdx >= collisionData.length) return;

    // 56(빨간 칸)이면 이동하지 않고 리턴
    if (collisionData[nextIdx] === 56) {
        console.log("벽에 부딪혔습니다!", nextGridX, nextGridY);
        return;
    }

    // 3. 이동 가능한 곳(0)이면 좌표 갱신
    player.gridX = nextGridX;
    player.gridY = nextGridY;
    player.isMoving = true;
}

function update() {
    // 탐험 화면이 보일 때만 루프 생성
    const exploreCont = document.getElementById('explore-container');
    if (!exploreCont || exploreCont.style.display === 'none') return; // 탐험 화면이 보이지 않으면 업데이트 중지

    if (player.isMoving) {
      let targetX = player.gridX * 32;
      let targetY = player.gridY * 32;

      // 목표 지점까지 스르륵 이동하는 효과
      if (player.x < targetX) player.x += player.speed;
      else if (player.x > targetX) player.x -= player.speed;

      if (player.y < targetY) player.y += player.speed;
      else if (player.y > targetY) player.y -= player.speed;

      // 도착 확인
      if (player.x === targetX && player.y === targetY) {
        player.isMoving = false;
        
        // 1. 방 이동(포탈) 체크
        // ★ Fix #8: checkRoomPortal()이 true를 반환하면 이미 전투 진입 → 10% 전투 체크 건너뜀
        const portalTriggeredBattle = checkRoomPortal();
        if (portalTriggeredBattle) return; // 포탈에서 전투 발생 → 루프 종료

        // 2. 전투 발생 체크 (포탈에서 전투 미발생 시에만 진입)
        if (Math.random() < 0.1) {  // 이동할 때마다 10% 확률로 전투 발생 (조정 가능)
          triggerBattle();
          return; // 전투로 넘어가므로 더 이상 업데이트하지 않음
        }
      }
    }
    draw();  // 매 프레임마다 그리기 함수 호출
    requestAnimationFrame(update);  // 루프 지속
}

// 방향키 입력 활성화
document.addEventListener('keydown', (e) => {  
  // 탐험 컨테이너가 보일 때만 작동
  const exploreCont = document.getElementById('explore-container');
  if (!exploreCont || exploreCont.style.display === 'none') return;

  if (player.isMoving) return; // 이동 중에는 중복 입력 방지

  let dx = 0, dy = 0;
  if (e.key === 'ArrowUp') dy = -1;
  else if (e.key === 'ArrowDown') dy = 1;
  else if (e.key === 'ArrowLeft') dx = -1;
  else if (e.key === 'ArrowRight') dx = 1;

  // 방향키를 눌렀다면 movePlayer 함수를 실행해 벽 체크 후 이동
  if (dx !== 0 || dy !== 0) {
    movePlayer(dx, dy);
  }
});

// 방 이동 로직 함수 (연출 변경 가능)
function checkRoomPortal() {
    let hasMoved = false;

    // 위쪽 문 (예: 중앙 계단 위쪽 좌표)
    if (player.gridY <= 4) { 
        player.gridY = 14; // 아래쪽으로 이동
        hasMoved = true;
    }
    // 왼쪽 끝
    else if (player.gridX <= 0) {
        player.gridX = 27; // 오른쪽으로 이동
        hasMoved = true;
    }
    // 오른쪽 끝
    else if (player.gridX >= 28) {
        player.gridX = 1; // 왼쪽으로 이동
        hasMoved = true;
    }

    if (hasMoved) {
        // 즉시 픽셀 위치 업데이트 및 화면 깜빡임 연출
        player.x = player.gridX * 32;
        player.y = player.gridY * 32;
        
        // 화면이 번쩍하는 연출 (밝아졌다가 돌아옴)
        const canvas = document.getElementById('map-canvas');
        canvas.style.filter = 'brightness(2)';
        setTimeout(() => { canvas.style.filter = 'brightness(1)'; }, 150);

        // 방을 옮겼을 때는 30%의 높은 확률로 전투 발생
        if (Math.random() < 0.3) {
            triggerBattle();
            // ★ Fix #8: 포탈에서 전투 발생 시 true 반환 — update()가 이를 받아 10% 전투 체크를 건너뜀
            return true; // ★ Fix 4 유지 + Fix #8: 반환값으로 전투 발생 여부 전파
        }
    }
    // ★ Fix #8: 전투 미발생 시 false 반환
    return false;
}

// 탐험 중 전투 발생 시 호출
function triggerBattle() {
  console.log("전투 발생!");

  // 1. 모든 레이어 정리 & 탐험 화면 숨기기
  const exploreCont = document.getElementById('explore-container');
  if (exploreCont) exploreCont.style.display = 'none';

  // 2. 기존 전투 화면 띄우기 (원래 map.js에 있던 코드들)
  const battleCont = document.getElementById('battle-container');
  if (battleCont) {
    battleCont.style.display = 'flex';  // 그릇을 먼저 보여주고
    battleCont.classList.add('visible');  // CSS 애니메이션 클래스 추가
    battleCont.style.zIndex = '2000'; // 탐험 화면보다 위에 오도록 z-index 조정
  }

  // 3. 전투 시스템 초기화
  if (typeof window.initBattle === 'function') {
    window.initBattle('map', null); // 일반 몬스터 전투로 초기화 // ★ Fix #4: bossId = null → null (전역 변수 오염 방지)
  }
}

// ── 전투 초기화 ──
// 205관 이면 세계 진입 시 호출
// 모든 전투 변수를 초기값으로 리셋 (나중에는 플레이어 현재 HP / SP 상태 연동되도록)
window.initBattle = function(origin = 'map', bossId = null) {
  // 1. 전역 변수 설정
  battleOrigin = origin;
  window.battleOrigin = origin; // ★ Fix #5: window에도 동기화
  battleBusy = false;
  battlePlayerHp    = playerStats.hp;
  battlePlayerMaxHp = playerStats.maxHp;
  battlePlayerSp    = playerStats.sp;    // ★ SP 초기화
  battlePlayerMaxSp = playerStats.maxSp; // ★ 최대 SP 초기화
  battleTurn = 1;
  buffActive = false;

  // ── ★ 버프 연동: 전투 시작 시 패시브 적용 로그 ──
  setTimeout(() => {
    const lines = [];
    if (typeof window.getCafOvereatPenalty === 'function' && window.getCafOvereatPenalty())
      lines.push('[패널티] 과식 상태 — 적 공격 주사위 +2');
    if (typeof window.hasLibEffect === 'function' && window.hasLibEffect('battle_dmg'))
      lines.push('[버프] 전략 전술 교범 — 공격 데미지 +5');
    if (typeof window.getVaccineBuff === 'function') {
      const v = window.getVaccineBuff();
      if (v && v.type === 'battle') lines.push('[버프] 예방접종 — 피해 30% 감소');
    }
    if ((playerStats._regenPerTurn || 0) > 0)
      lines.push('[패시브] 리젠 +' + playerStats._regenPerTurn + ' HP / 턴');
    if ((playerStats._agilityBonus || 0) > 0)
      lines.push('[패시브] 선공 확률 +' + playerStats._agilityBonus + '%');
    const efx = typeof window.getStatusEffects === 'function' ? window.getStatusEffects() : [];
    const efxNames = { poison:'중독(매턴HP-3)', fatigue:'피로(데미지-30%)', fracture:'골절(최대HP-20)', curse:'저주(보상-50%)' };
    efx.forEach(id => { if (efxNames[id]) lines.push('[상태이상] ' + efxNames[id]); });
    if (typeof inventory !== 'undefined') {
      if (inventory.some(i => i.id === 'dmg_boost' || i.id === 'speed'))
        lines.push('[아이템] 공격 강화 — 데미지 +50%');
      if (inventory.some(i => i.id === 'shield'))
        lines.push('[아이템] 방어막 — 피해 -50%');
    }
    lines.forEach(l => { if (typeof addBattleLog === 'function') addBattleLog(l, 'log-system2'); });
  }, 900);

  // 탐험 횟수 누적 (스킬 트리용)
  playerStats._explorationCount = (playerStats._explorationCount || 0) + 1;

  // 2. 몬스터 / 보스 데이터 가져오기
  if (origin === 'mountain' && bossId) {
    currentMonster = window.BOSSES[bossId];  // 보스 데이터베이스에서 해당 보스 정보 가져오기
  } 
  
  else {
    // ★ Fix 5: 새로고침 복구 시 저장된 몬스터 ID가 있으면 그 몬스터로 복구
    const savedMonsterId = localStorage.getItem('battleMonsterId');
    const savedInBattle  = localStorage.getItem('inBattle') === 'true';
    if (savedInBattle && savedMonsterId && window.MONSTERS && window.MONSTERS[savedMonsterId]) {
      currentMonster = window.MONSTERS[savedMonsterId];
    } else {
      currentMonster = window.getRandomMonster();  // 새 전투 — 랜덤 몬스터 선택
    }
  }

  // ERROR 체크: 몬스터 데이터가 제대로 로드되지 않았을 때 대비
  if (!currentMonster) return;

  // 3. 적 스탯 초기화
  enemyMaxHp = currentMonster.hp;
  enemyHp = currentMonster.hp;

  // 세부 상태 복구 (새로고침 시 저장된 값이 있으면 사용)
  const savedInBattle = localStorage.getItem('inBattle') === 'true';
  const savedEnemyHp = localStorage.getItem('battleEnemyHp');
  const savedPlayerHP = localStorage.getItem('battlePlayerHp');
  const savedTurn = localStorage.getItem('battleTurn');

  if (savedInBattle && savedEnemyHp !== null && savedPlayerHP !== null) {
    // 저장된 값이 있으면 해당 값으로 복구
    enemyHp = parseInt(savedEnemyHp);
    battlePlayerHp = parseInt(savedPlayerHP);
    battleTurn = parseInt(savedTurn) || 1;
    // ★ Fix #4: SP도 복구 (저장된 값이 있으면 사용, 없으면 playerStats.sp 사용)
    const savedSp = localStorage.getItem('battlePlayerSp');
    if (savedSp !== null) {
      battlePlayerSp = parseInt(savedSp);
    }
  } 
  
  else {  // 새로 시작하는 전투일 때만 초기화
    enemyHp = currentMonster.hp;
    battlePlayerHp = playerStats.hp;  // ★ Fix 1: 대소문자 오타 수정 (HP → Hp)
    battleTurn = 1;
  }

  // ★ Fix #5: enemyMaxHp 이중 초기화 제거 — 위(412줄)에서 이미 설정됨. 중복 할당 시 복구된 enemyHp와 비율 불일치 발생
  battlePlayerMaxHp = playerStats.maxHp;

  // 현재 전투 상태를 localStorage에 동기화
  localStorage.setItem('inBattle', 'true');
  localStorage.setItem('battleOrigin', battleOrigin);
  localStorage.setItem('battleEnemyHp', enemyHp);
  localStorage.setItem('battlePlayerHp', battlePlayerHp);
  localStorage.setItem('battlePlayerSp', battlePlayerSp); // ★ Fix #4: SP도 저장 (새로고침 복구 시 SP 복원)
  localStorage.setItem('battleTurn', battleTurn);
  if (bossId) localStorage.setItem('battleBossId', bossId);  // ★ Fix 2: 'bossId' → 'battleBossId' (checkResumeBattle과 키 일치)
  // ★ Fix 5: 일반 몬스터 ID 저장 — 새로고침 복구 시 같은 몬스터 유지
  if (!bossId && currentMonster) localStorage.setItem('battleMonsterId', currentMonster.id);

  // 4. UI 업데이트
  // 복구된 데이터를 기반으로 턴 정보 갱신
  if (typeof updateBattleBars === 'function') updateBattleBars(); 
  const turnDisplay = document.getElementById('turn-display');
  // '턴 1' 대신 복구된 battleTurn 사용
  if (turnDisplay) turnDisplay.textContent = '턴 ' + battleTurn; 

  // 몬스터 이름 및 정보
  const enemyNameElement = document.getElementById('enemy-name');
  if (enemyNameElement) {
    enemyNameElement.textContent = `${currentMonster.name} (Lv.${currentMonster.level || '?'})`;
  }

  // 몬스터 HP 수치 및 바 및 텍스트
  const hpValElement = document.getElementById('enemy-hp-val');
  const hpMaxElement = document.getElementById('enemy-hp-max');
  const hpFillElement = document.getElementById('enemy-hp-fill');
  
  if (hpValElement) hpValElement.textContent = enemyHp;
  if (hpMaxElement) hpMaxElement.textContent = enemyMaxHp;
  // if (hpFillElement) hpFillElement.style.width = '100%';
  
  // 5. 이미지 로드
  const enemyImg = document.getElementById('enemy-img');
  if (enemyImg) {
    enemyImg.src = currentMonster.image;  // monster.js에 정의된 경로 삽입
    enemyImg.style.display = 'block';
    enemyImg.onerror = () => { 
      console.warn("몬스터 이미지 로드 실패, 기본 이미지로 대체합니다.");
      enemyImg.src = 'images/monster/default.png'; };  // 실패 시 대비
  }

  // 6. 로그 초기화 및 화면 전환
  document.getElementById('dice-display').textContent = '🎲';
  document.getElementById('dice-result').textContent = '커맨드를 선택하세요';

  const logBox = document.getElementById('battle-log');
  if (logBox) {
    logBox.innerHTML = 
      `<span class="log-system2">[SYSTEM] ${currentMonster.intro}</span><br>` +
      `<span class="log-system2">[RAG] ${currentMonster.name} 약점 DB → ${currentMonster.weakness}에 취약</span><br>` +
      `<span class="log-system2">[AGENT] 룰 판정 에이전트 대기 중...</span>`;
  }

  // 7. 화면 표시 및 이전 화면 숨기기
  const containers = ['explore-container', 'game-container', 'mountain-container'];
  containers.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });

  const battleCont = document.getElementById('battle-container');
  if (battleCont) {
    battleCont.style.display = 'flex';
    battleCont.classList.add('visible');
    battleCont.style.zIndex = '2000';
  }

  // (선택사항) 버튼 잠금 해제 함수가 있다면 호출
  if (typeof setBattleButtons === 'function') {
    setBattleButtons(false);
  }
};

// ── 보스 전투 초기화 ──
// 청룡산에서 보스 선택 시 호출
// 기존 battle-container를 재활용하되 보스 스펙으로 덮어씀
window.initBossBattle = function(boss) {
  battleOrigin = 'mountain';  // 전투 시작 위치
  window.battleOrigin = 'mountain'; // ★ Fix #5: window에도 동기화
  // ★ Fix #7: BOSSES → window.BOSSES (monsters.js는 window.BOSSES로만 노출하므로 직접 참조 시 ReferenceError 위험)
  const monsterId = Object.keys(window.BOSSES).find(k => window.BOSSES[k].name === boss.name);
  const monster   = monsterId ? window.BOSSES[monsterId] : {
    ...boss, level: '?', image: 'images/monster/F-ghost.png',
    weakness: '알 수 없음', intro: boss.name + ' 등장!',
    attackMin: 3, attackMax: 18, isBoss: true,
  };
  battlePlayerHp = playerStats.hp; 
  battlePlayerMaxHp = playerStats.maxHp;
  enemyHp = monster.hp;               
  enemyMaxHp = monster.hp;
  battleTurn = 1; buffActive = false; battleBusy = false;

  // ★ Fix #1: applyMonsterUI()가 전체 코드베이스에 미정의 → 직접 UI 업데이트로 대체
  //   (기존 applyMonsterUI 호출 줄을 제거하고 동일 동작을 인라인으로 구현)
  const enemyNameEl2 = document.getElementById('enemy-name');
  if (enemyNameEl2) enemyNameEl2.textContent = monster.name + ' (Lv.' + (monster.level || '?') + ')';
  const enemyImgEl2 = document.getElementById('enemy-img');
  if (enemyImgEl2) {
    enemyImgEl2.src = monster.image;
    enemyImgEl2.style.display = 'block';
    enemyImgEl2.onerror = () => { enemyImgEl2.src = 'images/monster/default.png'; };
  }
  const hpValEl2 = document.getElementById('enemy-hp-val');
  const hpMaxEl2 = document.getElementById('enemy-hp-max');
  if (hpValEl2) hpValEl2.textContent = enemyHp;
  if (hpMaxEl2) hpMaxEl2.textContent = enemyMaxHp;

  updateBattleBars();
  document.getElementById('turn-display').textContent    = '턴 1';
  document.getElementById('dice-display').textContent    = '🎲';
  document.getElementById('dice-result').textContent     = '커맨드를 선택하세요';
  document.getElementById('battle-log').innerHTML =
    '<span class="log-damage">[BOSS] ' + monster.intro + ' 강력한 적!</span><br>' +
    '<span class="log-system2">[AGENT] 보스 약점 → ' + monster.weakness + '</span>';
  setBattleButtons(false);
}

// ── HP 바 업데이트 ──
// 적/플레이어 HP가 바뀔 때마다 호출해서 게이지와 숫자 갱신
function updateBattleBars() {
  const ep = Math.max(0, Math.round(enemyHp        / enemyMaxHp        * 100));
  const pp = Math.max(0, Math.round(battlePlayerHp / battlePlayerMaxHp * 100));
  const sp = Math.max(0, Math.round(battlePlayerSp / Math.max(1, battlePlayerMaxSp) * 100));
  document.getElementById('enemy-hp-bar').style.width          = ep + '%';
  document.getElementById('battle-player-hp-bar').style.width  = pp + '%';
  document.getElementById('enemy-hp-text').textContent         = Math.max(0, enemyHp)        + ' / ' + enemyMaxHp;
  document.getElementById('battle-player-hp-text').textContent = Math.max(0, battlePlayerHp) + ' / ' + battlePlayerMaxHp;
  // ★ SP 바
  const spBar  = document.getElementById('battle-player-sp-bar');
  const spText = document.getElementById('battle-player-sp-text');
  if (spBar)  spBar.style.width   = sp + '%';
  if (spText) spText.textContent  = Math.max(0, battlePlayerSp) + ' / ' + battlePlayerMaxSp;
  // ★ SP 부족 시 special 버튼 비활성
  const spBtn = document.querySelector('.cmd-btn.special');
  if (spBtn) spBtn.disabled = battlePlayerSp < 15;
}

// 커맨드 처리 중에는 버튼을 막아서 중복 입력 방지
function setBattleButtons(disabled) {
  document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = disabled);
}

// ── 전투 로그 추가 ──
// 전투 중 발생하는 이벤트를 로그창에 출력
// cls: 'log-damage' | 'log-success' | 'log-system2' | 'log-dice'
function addBattleLog(msg, cls) {
  const box = document.getElementById('battle-log');
  box.innerHTML += '<br><span class="' + (cls || '') + '">' + msg + '</span>';
  box.scrollTop = box.scrollHeight;
}

// ── ms 단위 딜레이 ──
// async 함수 안에서 await sleepMs(ms)로 사용
function sleepMs(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ★ Fix 8: 전투 중 아이템 사용 실행 함수
window._useBattleItem = function(idx) {
  const inv = (typeof inventory !== 'undefined') ? inventory : [];
  const item = inv[idx];
  if (!item) return;

  let log = '';
  if (item.id === 'hp_potion' || item.id === 'rx_hp') {
    const gain = Math.min(30, battlePlayerMaxHp - battlePlayerHp);
    battlePlayerHp = Math.min(battlePlayerMaxHp, battlePlayerHp + 30);
    playerStats.hp = battlePlayerHp;
    log = '[아이템] ' + item.icon + ' ' + item.name + ' — HP +' + gain + '!';
  } else if (item.id === 'sp_potion' || item.id === 'rx_sp') {
    const gain = Math.min(20, battlePlayerMaxSp - battlePlayerSp);
    battlePlayerSp = Math.min(battlePlayerMaxSp, battlePlayerSp + 20);
    playerStats.sp = battlePlayerSp;
    log = '[아이템] ' + item.icon + ' ' + item.name + ' — SP +' + gain + '!';
  } else if (item.id === 'full_potion') {
    battlePlayerHp = battlePlayerMaxHp;
    battlePlayerSp = battlePlayerMaxSp;
    playerStats.hp = battlePlayerHp;
    playerStats.sp = battlePlayerSp;
    log = '[아이템] ' + item.icon + ' 풀 회복! HP + SP 완전 회복!';
  } else if (item.id === 'rx_cure') {
    if (typeof playerStats.statusEffects !== 'undefined') playerStats.statusEffects = [];
    log = '[아이템] ' + item.icon + ' 모든 상태이상 제거!';
  } else if (item.id === 'shield' || item.id === 'dmg_boost' || item.id === 'speed' || item.id === 'regen') {
    // 이미 자동 소모 아이템 — 효과는 enemyTurn/doCmd에서 적용됨
    log = '[아이템] ' + item.icon + ' ' + item.name + ' — 다음 턴에 자동 적용!';
  }

  inventory.splice(idx, 1);
  if (typeof saveInventory === 'function') saveInventory();
  if (typeof updateBattleBars === 'function') updateBattleBars();
  if (log) addBattleLog(log, 'log-success');

  // 커맨드 버튼 원상복구
  const grid = document.querySelector('.cmd-grid');
  if (grid) grid.innerHTML = `
    <button class="cmd-btn attack" onclick="doCmd('attack')"><span class="cmd-name">벡터 캐논</span><span class="cmd-desc">물리 공격 · 데미지 d20 [1]</span></button>
    <button class="cmd-btn" onclick="doCmd('rag')"><span class="cmd-name">RAG 리커버리</span><span class="cmd-desc">HP 회복 · 회복량 d10 [2]</span></button>
    <button class="cmd-btn attack" onclick="doCmd('hyper')"><span class="cmd-name">하이퍼 프롬프트</span><span class="cmd-desc">버프 · 다음 턴 데미지 2배 [3]</span></button>
    <button class="cmd-btn special" onclick="doCmd('special')"><span class="cmd-name">⚡ 데이터 서지</span><span class="cmd-desc">SP 15 소모 · 강력 공격+회복 [4]</span></button>
    <button class="cmd-btn" onclick="doCmd('run')"><span class="cmd-name">이면 세계 탈출</span><span class="cmd-desc">전투 종료 · 50% 확률 [5]</span></button>
    <button class="cmd-btn" onclick="doCmd('item')"><span class="cmd-name">🎒 아이템</span><span class="cmd-desc">인벤토리 사용 [6]</span></button>`;
  document.getElementById('dice-result').textContent = '아이템 사용 완료!';
  if (typeof setBattleButtons === 'function') setBattleButtons(false);
};

window._cancelItemSelect = function() {
  // ★ Fix #6: _useBattleItem 성공 후 복원 HTML과 구조 통일
  //   기존: 단순 텍스트 버튼 → 취소 후 cmd-name/cmd-desc span이 없어 스타일 깨짐
  //   수정: _useBattleItem의 복원 HTML과 동일한 구조로 재렌더링
  const grid = document.querySelector('.cmd-grid');
  if (grid) {
    grid.innerHTML =
      `<button class="cmd-btn attack" onclick="doCmd('attack')"><span class="cmd-name">벡터 캐논</span><span class="cmd-desc">물리 공격 · 데미지 d20 [1]</span></button>` +
      `<button class="cmd-btn" onclick="doCmd('rag')"><span class="cmd-name">RAG 리커버리</span><span class="cmd-desc">HP 회복 · 회복량 d10 [2]</span></button>` +
      `<button class="cmd-btn attack" onclick="doCmd('hyper')"><span class="cmd-name">하이퍼 프롬프트</span><span class="cmd-desc">버프 · 다음 턴 데미지 2배 [3]</span></button>` +
      `<button class="cmd-btn special" onclick="doCmd('special')"><span class="cmd-name">⚡ 데이터 서지</span><span class="cmd-desc">SP 15 소모 · 강력 공격+회복 [4]</span></button>` +
      `<button class="cmd-btn" onclick="doCmd('run')"><span class="cmd-name">이면 세계 탈출</span><span class="cmd-desc">전투 종료 · 50% 확률 [5]</span></button>` +
      `<button class="cmd-btn" onclick="doCmd('item')"><span class="cmd-name">🎒 아이템</span><span class="cmd-desc">인벤토리 사용 [6]</span></button>`;
  }
  document.getElementById('dice-result').textContent = '커맨드를 선택하세요';
  if (typeof setBattleButtons === 'function') setBattleButtons(false);
};

// ── 전투 종료 시 상태 삭제 ──
function clearBattleState() {
  localStorage.removeItem('inBattle');
  localStorage.removeItem('battleOrigin');
  localStorage.removeItem('battleBossId');    // ★ Fix 2: 구버전 'bossId' → 'battleBossId'로 통일
  localStorage.removeItem('battleMonsterId'); // ★ Fix 5: 일반 몬스터 ID도 삭제
  localStorage.removeItem('battleEnemyHp');
  localStorage.removeItem('battlePlayerHp');
  localStorage.removeItem('battleTurn');
}

// ── 주사위 굴리기 애니메이션 ──
// sides: 주사위 면 수 (d20이면 20, d10이면 10)
// 애니메이션 후 1~sides 사이 랜덤 결과 반환
//
// [푸앙이 황금 주사위 모드] : 나중에 호감도 효과가 바뀔 수 있음.
// 조건: puangState.favorability >= 80
// 효과 1 - 시각: 주사위가 황금색으로 변하고 1.3배 크기로 확대
// 효과 2 - 수치: 주사위 결과 최소 4 보장 (1~3 나와도 강제로 4로 올림)
//
// TODO: 아이디어 변경 시 수정할 부분
//   - 발동 조건 변경: puangState.favorability >= 80 이 숫자 조정
//   - 최솟값 변경: Math.max(4, ...) 에서 4를 다른 숫자로 교체
//   - 완전히 다른 효과로 교체 시 isPuangMode 블록 전체 교체
//   - 예: 하트가 쏟아지는 연출 → faces 배열을 ['♥','♥','♥','♥','♥','♥']로 교체
async function animateDice(sides, ignoreGold = false) {
  const element = document.getElementById('dice-display');
  const faces   = ['⚀','⚁','⚂','⚃','⚄','⚅'];  // 인덱스 0 ~ 5

  // 호감도 80 이상이면 황금 주사위 (최소 4 보장)
  // 다른 효과로 교체 시 이 블록을 교체할 것.
  const isPuangMode = !ignoreGold && puangState.favorability >= 80;
  if (isPuangMode) {
    element.style.filter    = 'sepia(1) saturate(5) hue-rotate(10deg)';
    element.style.transform = 'scale(1.3)';
  }

  // 주사위 굴리는 애니메이션 연출
  element.classList.add('rolling');  // CSS의 diceShake 애니메이션 시작 (주사위가 흔들림)
  for (let i = 0; i < 8; i++) {
    // ⚀⚁⚂⚃⚄⚅ 중 랜덤으로 골라서 화면에 표시
    element.textContent = faces[Math.floor(Math.random() * faces.length)];
    await sleepMs(50);  // 50ms 대기 → 다시 2번 반복 (총 8번)
  }  // 결과: 주사위 눈이 50ms마다 빠르게 바뀌는 것처럼 보임
  element.classList.remove('rolling');  // 흔들림 애니메이션 종료

  // 황금 주사위는 최소 4 보장 (변경 가능)
  const result = isPuangMode  // 조건: 황금 주사위 모드인가?
    ? Math.max(4, Math.floor(Math.random() * sides) + 1)  // true  → 황금 주사위 (최소 4 보장)
    : Math.floor(Math.random() * sides) + 1;              // false → 일반 주사위

  element.textContent = faces[Math.min(result - 1, 5)];  // 주사위 결과값을 화면에 표시 (d20이어도 1~6으로 표시)

  if (isPuangMode) {  // 황금 주사위 모드일 때 500ms 후에 주사위를 원래 모습으로 되돌리는 코드
    setTimeout(() => { element.style.filter = ''; element.style.transform = ''; }, 500);
  }

  return result;
}

// ── 적 턴 자동 처리 ──
// 플레이어 커맨드 처리 후 자동으로 실행
// 적 공격 → 플레이어 피격 → 사망 체크 → 다음 턴 시작
async function enemyTurn() {
  await sleepMs(600);

  // ── ★ 턴 시작: 리젠 적용 ──
  const regenAmt = playerStats._regenPerTurn || 0;
  if (regenAmt > 0) {
    battlePlayerHp = Math.min(battlePlayerMaxHp, battlePlayerHp + regenAmt);
    localStorage.setItem('battlePlayerHp', battlePlayerHp);
    addBattleLog('[패시브] 턴 리젠 HP +' + regenAmt, 'log-success');
    updateBattleBars();
  }
  // 중독 상태이상 (-3 HP/턴)
  if (typeof window.hasStatusEffect === 'function' && window.hasStatusEffect('poison')) {
    battlePlayerHp = Math.max(1, battlePlayerHp - 3);
    localStorage.setItem('battlePlayerHp', battlePlayerHp);
    addBattleLog('[상태이상] 중독 — HP -3', 'log-damage');
    updateBattleBars();
  }

  // ★ Fix #9: 적 공격력을 몬스터 데이터의 attackMin/attackMax로 계산
  //   기존: 항상 Math.random()*12+1 고정 → 모든 몬스터가 동일한 공격력
  //   수정: currentMonster의 attackMin~attackMax 범위 내 랜덤값 사용
  const atkMin = (currentMonster && currentMonster.attackMin != null) ? currentMonster.attackMin : 1;
  const atkMax = (currentMonster && currentMonster.attackMax != null) ? currentMonster.attackMax : 12;
  const roll   = Math.floor(Math.random() * (atkMax - atkMin + 1)) + atkMin;
  // 과식 패널티 (+2)
  const overeatAdd = (typeof window.getCafOvereatPenalty === 'function' && window.getCafOvereatPenalty()) ? 2 : 0;
  let dmg = Math.max(1, roll + overeatAdd);  // 몹 딜량 (Fix #9: roll-5 제거, 범위값 그대로 사용)

  addBattleLog('[룰 판정] ' + (currentMonster ? currentMonster.name : '적') + ' 공격! 주사위: ' + (roll + overeatAdd), 'log-dice');
  await sleepMs(400);

  // ── ★ 방어 버프 연동 ──
  // 예방접종 (전투 피해 30% 감소)
  if (typeof window.getVaccineBuff === 'function') {
    const v = window.getVaccineBuff();
    if (v && v.type === 'battle') {
      dmg = Math.floor(dmg * 0.7);
      addBattleLog('[버프] 예방접종 — 피해 30% 감소', 'log-success');
    }
  }
  // 방어막 아이템
  if (typeof inventory !== 'undefined') {
    const shieldIdx = inventory.findIndex(i => i.id === 'shield');
    if (shieldIdx >= 0) {
      dmg = Math.floor(dmg * 0.5);
      inventory.splice(shieldIdx, 1);
      if (typeof saveInventory === 'function') saveInventory();
      addBattleLog('[아이템 소모] 방어막 — 피해 50% 감소!', 'log-success');
    }
  }
  dmg = Math.max(0, dmg);

  // 플레이어 피격 애니메이션
  const playerImg = document.getElementById('player-img');
  if (playerImg) {
    playerImg.classList.add('flash-player');
    setTimeout(() => playerImg.classList.remove('flash-player'), 300);
  } 
  
  else {
    console.warn("ID 'player-img'를 찾을 수 없어 애니메이션을 건너뜁니다.");
  }

  battlePlayerHp -= dmg;
  localStorage.setItem('battlePlayerHp', battlePlayerHp);  // 플레이어 HP 상태 저장
  playerStats.hp = battlePlayerHp;
  updateBattleBars();

  if (typeof updateBattleBars === 'function') updateBattleBars();
  addBattleLog('[결과] 플레이어가 ' + dmg + ' 데미지를 받았다!', 'log-damage');

  // 플레이어 사망 → 패배 처리 (보험 체크)
  if (battlePlayerHp <= 0) {
    // 의료 보험 — HP 30으로 부활
    if (typeof window.useClinicInsurance === 'function' && window.useClinicInsurance()) {
      battlePlayerHp = 30;
      playerStats.hp = 30;
      localStorage.setItem('battlePlayerHp', battlePlayerHp);
      updateBattleBars();
      addBattleLog('[🛡️ 보험 발동!] HP 30으로 부활! 보험이 소모되었습니다.', 'log-success');
      if (typeof showToast === 'function') showToast('🛡️ 의료보험 발동! 부활!', 'warning', 3000);
      battleBusy = false;
      return;
    }
    addBattleLog('[SYSTEM] 플레이어가 쓰러졌다... 3초 후 복귀합니다.', 'log-damage');
    document.getElementById('dice-result').textContent = '전투 패배...';
    if (typeof showToast === 'function') showToast('💀 전투 패배...', 'error', 3000);
    // ★ Fix #10: 패배 시 hp가 음수 그대로 저장되는 버그 방지 — 최소 1로 보정
    playerStats.hp = Math.max(1, battlePlayerHp);
    battlePlayerHp = playerStats.hp;
    // ★ Fix #3: 패배 시에도 clearBattleState 호출 — 미호출 시 새로고침마다 전투 복구 루프
    clearBattleState();
    await sleepMs(3000);
    if (typeof returnToGame === 'function') returnToGame();
    return;
  }

  // 다음 턴 시작
  battleTurn++;
  document.getElementById('turn-display').textContent = '턴 ' + battleTurn;
  document.getElementById('dice-result').textContent  = '커맨드를 선택하세요';

  if (typeof setBattleButtons === 'function') setBattleButtons(false);
  battleBusy = false;
}

// ── 커맨드 버튼 핸들러 ──
// 플레이어가 커맨드 버튼 클릭 시 호출
// battleBusy로 중복 입력 방지
window.doCmd = async function(cmd) {
  if (battleBusy) return;
  battleBusy = true;
  if (typeof setBattleButtons === 'function') setBattleButtons(true);

  // ── 벡터 캐논 (공격) ──
  if (cmd === 'attack') {
    document.getElementById('dice-result').textContent = 'd20 굴리는 중...';
    const roll = await animateDice(20);
    addBattleLog('[룰 판정] 벡터 캐논! 주사위: ' + roll + '/20', 'log-dice');
    await sleepMs(300);

    if (roll >= 8) {  // 8 이상 명중 (밸런스 조정 시 이 숫자 수정)
      let dmg = Math.floor(roll / 1.5);  // 딜량 조정 시 이 공식 수정

      // 하이퍼 프롬프트 버프 발동 시 데미지 2배
      if (buffActive) {
        dmg *= 2; buffActive = false;
        addBattleLog('[버프] 하이퍼 프롬프트 발동! 데미지 2배', 'log-success');
      }

      // ── ★ 패시브 데미지 버프 연동 ──
      // 체육관 근력 트레이닝
      if ((playerStats.unionBonusDmg || 0) > 0) dmg += playerStats.unionBonusDmg;
      // 베테랑 탐험가 스킬
      if ((playerStats._battleBonusReward || 0) > 0) dmg += Math.floor(playerStats._battleBonusReward / 2);
      // 도서관 전술 교범
      if (typeof window.hasLibEffect === 'function' && window.hasLibEffect('battle_dmg')) dmg += 5;
      // 피로 상태이상 (-30%)
      if (typeof window.hasStatusEffect === 'function' && window.hasStatusEffect('fatigue')) {
        dmg = Math.floor(dmg * 0.7);
        addBattleLog('[상태이상] 피로 — 데미지 30% 감소', 'log-damage');
      }
      // 인벤토리 dmg_boost / speed 아이템
      if (typeof inventory !== 'undefined') {
        const boostIdx = inventory.findIndex(i => i.id === 'dmg_boost' || i.id === 'speed');
        if (boostIdx >= 0) {
          dmg = Math.floor(dmg * 1.5);
          inventory.splice(boostIdx, 1);
          if (typeof saveInventory === 'function') saveInventory();
          addBattleLog('[아이템 소모] 공격 강화 — 데미지 1.5배!', 'log-success');
        }
      }
      dmg = Math.max(1, dmg);

      // 적 피격 애니메이션
      document.getElementById('enemy-img').classList.add('shake-enemy');
      setTimeout(() => document.getElementById('enemy-img').classList.remove('shake-enemy'), 300);

      enemyHp -= dmg;
      updateBattleBars();
      addBattleLog('[결과] ' + (currentMonster ? currentMonster.name : '적') + '에게 ' + dmg + ' 데미지!', 'log-success');
      document.getElementById('dice-result').textContent = '명중! ' + dmg + ' 데미지';
    } 
    
    else {  // 명중 실패
      addBattleLog('[결과] 빗나갔다! (판정 실패: ' + roll + ' < 8)', 'log-damage');
      document.getElementById('dice-result').textContent = '빗나감 (roll: ' + roll + ')';
    }

    if (enemyHp <= 0) {  // 적 사망 → 승리 처리
      let reward = currentMonster ? currentMonster.reward : 5;
      // 저주 상태이상 (-50% 보상)
      if (typeof window.hasStatusEffect === 'function' && window.hasStatusEffect('curse')) {
        reward = Math.floor(reward * 0.5);
        addBattleLog('[상태이상] 저주 — 보상 50% 감소', 'log-damage');
      }
      // 베테랑 탐험가 스킬 보너스
      reward += (playerStats._battleBonusReward || 0);
      // 축제 2× 버프
      if (typeof window.hasFestDoubleBuff === 'function' && window.hasFestDoubleBuff()) {
        reward *= 2;
        addBattleLog('[이벤트] 축제 2× 버프 — 보상 2배!', 'log-success');
      }
      // ★ Fix 2: battle_bonus (수요일 요일 보너스) — 보상 +5
      if (window._todayBonusKey === 'battle_bonus') {
        reward += 5;
        addBattleLog('[🗓️ 수요일 보너스] 전투 보상 +5 💎', 'log-success');
      }
      // ★ Fix 7: data_bonus (토요일 요일 보너스) — 모든 💎 획득 +2
      if (window._todayBonusKey === 'data_bonus') {
        reward += 2;
        addBattleLog('[🗓️ 토요일 보너스] 💎 +2', 'log-success');
      }
      // 전투 승리 횟수 누적 (업적용)
      playerStats._battleWins = (playerStats._battleWins || 0) + 1;
      // 과식 패널티 해제
      if (typeof window.clearCafOvereatPenalty === 'function') window.clearCafOvereatPenalty();

      // ★ 도감 등록
      if (typeof window.registerMonsterCompendium === 'function') window.registerMonsterCompendium(currentMonster);
      addBattleLog('[SYSTEM] ' + (currentMonster ? currentMonster.name : '적') + '을(를) 물리쳤다! 데이터 조각 x' + reward + ' 획득', 'log-success');
      document.getElementById('dice-result').textContent = '전투 승리! 3초 후 복귀합니다.';
      document.getElementById('dice-display').textContent = '🎉';
      playerStats.data += reward;
      updateMapStats();
      if (typeof window.checkAchievements === 'function') window.checkAchievements();
      if (typeof window.updateDailyBadges === 'function') window.updateDailyBadges();
      if (typeof showToast === 'function') showToast('⚔️ 전투 승리! 💎 +' + reward, 'success', 3000);
      // ★ Fix #3: 승리 시 clearBattleState — 미호출 시 inBattle=true 잔류 → 새로고침마다 전투 루프 재진입
      clearBattleState();
      await sleepMs(3000);
      returnToGame();
      battleBusy = false;
      return;
    }
  }

  // ── RAG 리커버리 (회복) ──
  else if (cmd === 'rag') {
    document.getElementById('dice-result').textContent = 'd10 굴리는 중...';
    const roll = await animateDice(10);
    addBattleLog('[RAG] 과거 데이터 검색 중... 완료', 'log-system2');
    const heal = roll + 2;  // 회복량 조정 시 이 공식 수정

    battlePlayerHp = Math.min(battlePlayerMaxHp, battlePlayerHp + heal);
    localStorage.setItem('battlePlayerHp', battlePlayerHp);  // 플레이어 HP 상태 저장
    playerStats.hp = battlePlayerHp;
    updateBattleBars();

    addBattleLog('[결과] HP ' + heal + ' 회복!', 'log-success');
    document.getElementById('dice-result').textContent = 'HP +' + heal + ' 회복';
  }

  // ── 하이퍼 프롬프트 (버프) ──
  // 다음 공격 데미지 2배, 빗나가도 유지됨
  else if (cmd === 'hyper') {
    buffActive = true;
    addBattleLog('[버프] 하이퍼 프롬프트! 다음 공격 데미지 2배', 'log-success');

    // UI 업데이트
    document.getElementById('dice-result').textContent = '다음 공격 데미지 2배!';
    document.getElementById('dice-display').textContent = '⚡';
  }

  // ── ★ 데이터 서지 (SP 스킬) ──
  else if (cmd === 'special') {
    const spCost = 15;
    if (battlePlayerSp < spCost) {
      addBattleLog('[SP 부족] 데이터 서지 사용 불가! (SP ' + spCost + ' 필요, 현재: ' + battlePlayerSp + ')', 'log-damage');
      battleBusy = false;
      if (typeof setBattleButtons === 'function') setBattleButtons(false);
      return;
    }
    battlePlayerSp -= spCost;
    playerStats.sp = battlePlayerSp;
    localStorage.setItem('battlePlayerSp', battlePlayerSp); // ★ Fix #4: SP 변경 시 저장
    updateBattleBars();

    document.getElementById('dice-result').textContent = 'd12 굴리는 중...';
    const roll = await animateDice(12);
    addBattleLog('[데이터 서지] SP ' + spCost + ' 소모! 강력한 에너지를 방출!', 'log-success');
    await sleepMs(300);

    // 효과: 광역 폭발 데미지 + 자신 소량 회복
    let dmg   = roll + 8;  // 기본 대미지 높음
    const heal = Math.floor(roll / 3);

    // 패시브 데미지 버프 적용
    if (typeof window.hasLibEffect === 'function' && window.hasLibEffect('battle_dmg')) dmg += 5;
    if ((playerStats.unionBonusDmg || 0) > 0) dmg += playerStats.unionBonusDmg;
    if (typeof window.hasStatusEffect === 'function' && window.hasStatusEffect('fatigue')) dmg = Math.floor(dmg * 0.7);

    enemyHp -= dmg;
    battlePlayerHp = Math.min(battlePlayerMaxHp, battlePlayerHp + heal);
    localStorage.setItem('battlePlayerHp', battlePlayerHp);
    playerStats.hp = battlePlayerHp;
    updateBattleBars();

    document.getElementById('enemy-img').classList.add('shake-enemy');
    setTimeout(() => document.getElementById('enemy-img').classList.remove('shake-enemy'), 300);

    addBattleLog('[결과] 데이터 서지 폭발! ' + dmg + ' 데미지 + HP ' + heal + ' 회복!', 'log-success');
    document.getElementById('dice-result').textContent = '서지! ' + dmg + ' 데미지 / HP +' + heal;

    if (enemyHp <= 0) {
      let reward = currentMonster ? currentMonster.reward : 5;
      if (typeof window.hasStatusEffect === 'function' && window.hasStatusEffect('curse')) reward = Math.floor(reward * 0.5);
      reward += (playerStats._battleBonusReward || 0);
      if (typeof window.hasFestDoubleBuff === 'function' && window.hasFestDoubleBuff()) reward *= 2;
      // ★ Fix 2+7: battle_bonus / data_bonus 요일 보너스
      if (window._todayBonusKey === 'battle_bonus') reward += 5;
      if (window._todayBonusKey === 'data_bonus')   reward += 2;
      playerStats._battleWins = (playerStats._battleWins || 0) + 1;
      if (typeof window.clearCafOvereatPenalty === 'function') window.clearCafOvereatPenalty();
      // ★ 도감 등록
      if (typeof window.registerMonsterCompendium === 'function') window.registerMonsterCompendium(currentMonster);
      addBattleLog('[SYSTEM] 데이터 서지로 격파! 데이터 조각 x' + reward + ' 획득', 'log-success');
      document.getElementById('dice-result').textContent = '전투 승리! 3초 후 복귀';
      document.getElementById('dice-display').textContent = '🎉';
      playerStats.data += reward;
      updateMapStats();
      if (typeof window.checkAchievements === 'function') window.checkAchievements();
      if (typeof showToast === 'function') showToast('⚡ 서지로 승리! 💎 +' + reward, 'success', 3000);
      // ★ Fix #3: 서지 승리 시에도 clearBattleState — inBattle 잔류 방지
      clearBattleState();
      await sleepMs(3000);
      returnToGame();
      battleBusy = false;
      return;
    }
  }
  // ★ Fix 8: 전투 중 아이템 사용 커맨드
  else if (cmd === 'item') {
    const inv = (typeof inventory !== 'undefined') ? inventory : [];
    if (inv.length === 0) {
      addBattleLog('[아이템] 보유 중인 아이템이 없습니다.', 'log-damage');
      battleBusy = false;
      if (typeof setBattleButtons === 'function') setBattleButtons(false);
      return;
    }

    // 전투 중 사용 가능한 아이템만 필터
    const usableInBattle = ['hp_potion','sp_potion','full_potion','rx_hp','rx_sp','rx_cure','regen','shield','speed','dmg_boost'];
    const usable = inv.filter(i => usableInBattle.includes(i.id));

    if (usable.length === 0) {
      addBattleLog('[아이템] 전투 중 사용 가능한 아이템이 없습니다.', 'log-damage');
      battleBusy = false;
      if (typeof setBattleButtons === 'function') setBattleButtons(false);
      return;
    }

    // 목록 표시 (dice-result에 텍스트로 안내)
    const listText = usable.map((it, i) => (i+1) + '.' + it.icon + it.name).join('  ');
    document.getElementById('dice-result').textContent = '사용할 아이템 번호 선택:';
    addBattleLog('[아이템] 보유: ' + listText, 'log-system2');

    // 선택 버튼 동적 생성
    const grid = document.querySelector('.cmd-grid');
    if (grid) {
      // ★ Fix #8: old_html 방식 제거 → _cancelItemSelect()가 직접 버튼 재생성
      grid.innerHTML = usable.map((it, i) =>
        `<button class="cmd-btn" style="font-size:11px;" onclick="window._useBattleItem(${inv.indexOf(it)})">${it.icon} ${it.name}<br><span style="font-size:10px;color:#888;">${it.desc || ''}</span></button>`
      ).join('') + `<button class="cmd-btn" onclick="window._cancelItemSelect()">취소</button>`;
    }

    battleBusy = false;
    return;
  }

  else if (cmd === 'run') {
    document.getElementById('dice-result').textContent = 'd2 굴리는 중...';
    const roll = await animateDice(2, true); // 도망은 황금 주사위 효과 없음

    if (roll === 2) {
      clearBattleState();  // 전투 상태 삭제
      addBattleLog('[결과] 전투에서 벗어났다!', 'log-success');
      document.getElementById('dice-result').textContent = '탈출 성공!';

      await sleepMs(1000);

      // 탈출 성공 → 전투 화면 숨기기
      document.getElementById('battle-container').classList.remove('visible');
      document.getElementById('battle-container').style.display = 'none'; 

      // 전투 시작 지점(battleOrigin)에 따라 복귀 장소 결정
      if (battleOrigin === 'mountain') {  // 청룡산 화면으로 복귀
        document.getElementById('mountain-container').style.display = 'flex';
      }

      else {  //그 외에는 일반 탐험 화면으로 복귀
        document.getElementById('explore-container').style.display = 'block';
        player.isMoving = false;  // 이동 잠금 해제
        player.x = player.gridX * 32;
        player.y = player.gridY * 32;
        requestAnimationFrame(update); // 탐험 루프 재개
      }

      battleBusy = false;
      return;
    }

    else {
      addBattleLog('[결과] 탈출 실패! ' + (currentMonster ? currentMonster.name : '적') + '이(가) 가로막았다.', 'log-damage');
      document.getElementById('dice-result').textContent = '탈출 실패...';
      await enemyTurn();  // 탈출 실패 시 적 턴
      return;             // ★ Fix 3: return 추가 — 아래 await enemyTurn() 이중 호출 방지
    }
  }
  await enemyTurn();  // 플레이어 행동 후 적 턴 자동 실행
}