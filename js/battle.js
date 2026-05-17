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
let battleOrigin      = 'map';  // 전투 시작 시 위치 (205관, 청룡산 등), 'map' | 'mountain'
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
playerImage.src = 'images/player/player_male_battle.png'; 

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
            requestAnimationFrame(update); // 모든 이미지가 불러와지면 게임 루프 시작
        }
    };
});

// ── 그리기 함수 (draw) ──
function draw() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // 1. 배경 지우기
    ctx.drawImage(bgImage, 0, 0, 1024, 598);  // 2. 도서관 배경 그리기 (JSON 상 가로 1024, 세로 598 크기)

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
    
    // 플레이어 초기 위치 설정
    player.gridX = 2;
    player.gridY = 10;
    player.x = player.gridX * 32;
    player.y = player.gridY * 32;
    player.isMoving = false;

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
        checkRoomPortal();

        // 2. 전투 발생 체크
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
        }
    }
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
    window.initBattle('map', bossId = null); // 일반 몬스터 전투로 초기화
  }
}

// ── 전투 초기화 ──
// 205관 이면 세계 진입 시 호출
// 모든 전투 변수를 초기값으로 리셋 (나중에는 플레이어 현재 HP / SP 상태 연동되도록)
window.initBattle = function(origin = 'map', bossId = null) {
  // 1. 전역 변수 설정
  battleOrigin = origin;
  battleBusy = false;
  battlePlayerHp = playerStats.hp;
  battlePlayerMaxHp = playerStats.maxHp;
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
    currentMonster = window.getRandomMonster();  // 몬스터 데이터베이스에서 랜덤 몬스터 선택 
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
  } 
  
  else {  // 새로 시작하는 전투일 때만 초기화
    enemyHp = currentMonster.hp;
    battlePlayerHP = playerStats.hp;
    battleTurn = 1;
  }

  enemyMaxHp = currentMonster.hp;
  battlePlayerMaxHp = playerStats.maxHp;

  // 현재 전투 상태를 localStorage에 동기화
  localStorage.setItem('inBattle', 'true');
  localStorage.setItem('battleOrigin', battleOrigin);
  localStorage.setItem('battleEnemyHp', enemyHp);
  localStorage.setItem('battlePlayerHp', battlePlayerHp);
  localStorage.setItem('battleTurn', battleTurn);
  if (bossId) localStorage.setItem('bossId', bossId);

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
  const monsterId = Object.keys(BOSSES).find(k => BOSSES[k].name === boss.name);
  const monster   = monsterId ? BOSSES[monsterId] : {
    ...boss, level: '?', image: 'images/monster/F-ghost.png',
    weakness: '알 수 없음', intro: boss.name + ' 등장!',
    attackMin: 3, attackMax: 18, isBoss: true,
  };
  battlePlayerHp = playerStats.hp; 
  battlePlayerMaxHp = playerStats.maxHp;
  enemyHp = monster.hp;               
  enemyMaxHp = monster.hp;
  battleTurn = 1; buffActive = false; battleBusy = false;

  applyMonsterUI(monster);
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
  document.getElementById('enemy-hp-bar').style.width          = ep + '%';
  document.getElementById('battle-player-hp-bar').style.width  = pp + '%';
  document.getElementById('enemy-hp-text').textContent         = Math.max(0, enemyHp)        + ' / ' + enemyMaxHp;
  document.getElementById('battle-player-hp-text').textContent = Math.max(0, battlePlayerHp) + ' / ' + battlePlayerMaxHp;
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

// ── 전투 종료 시 상태 삭제 ──
function clearBattleState() {
  localStorage.removeItem('inBattle');
  localStorage.removeItem('battleOrigin');
  localStorage.removeItem('bossId');
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

  const roll = Math.floor(Math.random() * 12) + 1;
  // 과식 패널티 (+2)
  const overeatAdd = (typeof window.getCafOvereatPenalty === 'function' && window.getCafOvereatPenalty()) ? 2 : 0;
  let dmg = Math.max(1, roll - 5 + overeatAdd);  // 몹 딜량

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
      // 전투 승리 횟수 누적 (업적용)
      playerStats._battleWins = (playerStats._battleWins || 0) + 1;
      // 과식 패널티 해제
      if (typeof window.clearCafOvereatPenalty === 'function') window.clearCafOvereatPenalty();

      addBattleLog('[SYSTEM] ' + (currentMonster ? currentMonster.name : '적') + '을(를) 물리쳤다! 데이터 조각 x' + reward + ' 획득', 'log-success');
      document.getElementById('dice-result').textContent = '전투 승리! 3초 후 복귀합니다.';
      document.getElementById('dice-display').textContent = '🎉';
      playerStats.data += reward;
      updateMapStats();
      if (typeof window.checkAchievements === 'function') window.checkAchievements();
      if (typeof window.updateDailyBadges === 'function') window.updateDailyBadges();
      if (typeof showToast === 'function') showToast('⚔️ 전투 승리! 💎 +' + reward, 'success', 3000);
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

  // ── 도망 ──
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
      await enemyTurn();  // 탈출 실패 시 즉시 적 턴으로 넘어감
    }
  }
  await enemyTurn();  // 플레이어 행동 후 적 턴 자동 실행 
}