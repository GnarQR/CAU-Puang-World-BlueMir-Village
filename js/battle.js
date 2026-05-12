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
const bgImage = new Image();
bgImage.src = 'images/map/205_building.png'; 

const playerImage = new Image();
playerImage.src = 'images/player/player_male_battle.png'; 


// TODO : 이 값이 뭔가 이상하니까 나중에 값 다시 짜오기
const collisionData =  // 29x16 격자에 대한 충돌 데이터 (56은 벽, 0은 이동 가능)
            [56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 56, 56, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 0, 0, 0, 0, 0, 0, 44, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56,
            56, 56, 56, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 56, 56, 56, 0, 0, 56, 56,
            56, 56, 56, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 56, 56, 0, 0, 56, 56,
            56, 56, 56, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 56, 0, 0, 56, 56,
            56, 56, 0, 0, 0, 44, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56,
            56, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 56, 56,
            0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 56, 56,];

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

    // 1. 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 도서관 배경 그리기 (JSON 상 가로 928, 세로 512 크기)
    ctx.drawImage(bgImage, 0, 0, 928, 512);

    // 3. 캐릭터 그 위에 얹기
    // player.x와 player.y는 '스르륵' 로직으로 변하는 실시간 좌표입니다.
    if (playerImage.complete && playerImage.naturalWidth !== 0){
      ctx.drawImage(playerImage, player.x, player.y, 64, 64);  // 이미지가 완전히 로드된 경우에만 그리기
    } 
}

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
    if (nextGridX < 0 || nextGridX >= 29 || nextGridY < 0 || nextGridY >= 16) return;

    // 2. 벽 체크 (56이면 리턴)
    const nextIdx = nextGridY * 29 + nextGridX;
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
    window.initBattle();
  }
}

// ── 전투 초기화 ──
// 이면 세계 진입 또는 보스 전투 시작 시 호출
// 모든 전투 변수를 초기값으로 리셋 (나중에는 플레이어 현재 HP / SP 상태 연동되도록)
window.initBattle = function() {
  battlePlayerHp = 80; battlePlayerMaxHp = 100;
  enemyHp = 60;        enemyMaxHp = 60;
  battleTurn = 1;      buffActive = false; battleBusy = false;

  updateBattleBars();
  document.getElementById('turn-display').textContent  = '턴 1';
  document.getElementById('dice-display').textContent  = '🎲';
  document.getElementById('dice-result').textContent   = '커맨드를 선택하세요';
  document.getElementById('battle-log').innerHTML =
    '<span class="log-system2">[SYSTEM] 전투 시작! 학점귀신이 나타났다.</span><br>' +
    '<span class="log-system2">[RAG] 학점귀신 약점 DB 로드 완료 → 집중력 속성에 취약</span><br>' +
    '<span class="log-system2">[AGENT] 룰 판정 에이전트 대기 중...</span>';
  setBattleButtons(false);
}

// ── 보스 전투 초기화 ──
// 청룡산에서 보스 선택 시 호출
// 기존 battle-container를 재활용하되 보스 스펙으로 덮어씀
window.initBossBattle = function(boss) {
  battlePlayerHp = playerStats.hp; battlePlayerMaxHp = playerStats.maxHp;
  enemyHp = boss.hp;               enemyMaxHp = boss.hp;
  battleTurn = 1; buffActive = false; battleBusy = false;

  document.querySelector('.battle-title').textContent    = boss.name;
  document.querySelector('.fighter-name').textContent    = boss.name + ' (BOSS)';
  updateBattleBars();
  document.getElementById('turn-display').textContent    = '턴 1';
  document.getElementById('dice-display').textContent    = '🎲';
  document.getElementById('dice-result').textContent     = '커맨드를 선택하세요';
  document.getElementById('battle-log').innerHTML =
    '<span class="log-damage">[BOSS] ' + boss.name + ' 등장! 강력한 적입니다!</span><br>' +
    '<span class="log-system2">[AGENT] 보스 약점 분석 중...</span>';
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

// ── 커맨드 버튼 일괄 비활성화/활성화 ──
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
async function animateDice(sides) {
  const el    = document.getElementById('dice-display');
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];  // 인덱스 0 ~ 5

  // 호감도 80 이상이면 황금 주사위 (최소 4 보장)
  // 다른 효과로 교체 시 이 블록을 교체할 것.
  const isPuangMode = puangState.favorability >= 80;
  if (isPuangMode) {
    el.style.filter    = 'sepia(1) saturate(5) hue-rotate(10deg)';
    el.style.transform = 'scale(1.3)';
  }

  // 주사위 굴리는 애니메이션 연출
  el.classList.add('rolling');  // CSS의 diceShake 애니메이션 시작 (주사위가 흔들림)
  for (let i = 0; i < 8; i++) {
    // ⚀⚁⚂⚃⚄⚅ 중 랜덤으로 골라서 화면에 표시
    el.textContent = faces[Math.floor(Math.random() * faces.length)];
    await sleepMs(50);  // 50ms 대기 → 다시 2번 반복 (총 8번)
  }  // 결과: 주사위 눈이 50ms마다 빠르게 바뀌는 것처럼 보임
  el.classList.remove('rolling');  // 흔들림 애니메이션 종료

  // 황금 주사위는 최소 4 보장 (변경 가능)
  const result = isPuangMode  // 조건: 황금 주사위 모드인가?
    ? Math.max(4, Math.floor(Math.random() * sides) + 1)  // true  → 황금 주사위 (최소 4 보장)
    : Math.floor(Math.random() * sides) + 1;              // false → 일반 주사위

  el.textContent = faces[Math.min(result - 1, 5)];  // 주사위 결과값을 화면에 표시 (d20이어도 1~6으로 표시)

  if (isPuangMode) {  // 황금 주사위 모드일 때 500ms 후에 주사위를 원래 모습으로 되돌리는 코드
    setTimeout(() => { el.style.filter = ''; el.style.transform = ''; }, 500);
  }

  return result;
}

// ── 적 턴 자동 처리 ──
// 플레이어 커맨드 처리 후 자동으로 실행
// 적 공격 → 플레이어 피격 → 사망 체크 → 다음 턴 시작
async function enemyTurn() {
  await sleepMs(600);
  const roll = Math.floor(Math.random() * 12) + 1;
  const dmg  = Math.max(1, roll - 5);  // 몹 딜량 조정 시 이 줄 수정
  addBattleLog('[룰 판정] 학점귀신 공격! 주사위: ' + roll, 'log-dice');
  await sleepMs(400);

  // 플레이어 피격 애니메이션
  document.getElementById('player-svg2').classList.add('flash-player');
  setTimeout(() => document.getElementById('player-svg2').classList.remove('flash-player'), 300);

  battlePlayerHp -= dmg;
  updateBattleBars();
  addBattleLog('[결과] 플레이어가 ' + dmg + ' 데미지를 받았다!', 'log-damage');

  // 플레이어 사망 → 패배 처리
  if (battlePlayerHp <= 0) {
    addBattleLog('[SYSTEM] 플레이어가 쓰러졌다... 3초 후 복귀합니다.', 'log-damage');
    document.getElementById('dice-result').textContent = '전투 패배...';
    await sleepMs(3000);
    returnToGame();
    return;
  }

  // 다음 턴 시작
  battleTurn++;
  document.getElementById('turn-display').textContent = '턴 ' + battleTurn;
  document.getElementById('dice-result').textContent  = '커맨드를 선택하세요';
  setBattleButtons(false);
  battleBusy = false;
}

// ── 커맨드 버튼 핸들러 ──
// 플레이어가 커맨드 버튼 클릭 시 호출
// battleBusy로 중복 입력 방지
window.doCmd = async function(cmd) {
  if (battleBusy) return;
  battleBusy = true;
  setBattleButtons(true);

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

      // 적 피격 애니메이션
      document.getElementById('enemy-svg').classList.add('shake-enemy');
      setTimeout(() => document.getElementById('enemy-svg').classList.remove('shake-enemy'), 300);

      enemyHp -= dmg;
      updateBattleBars();
      addBattleLog('[결과] 학점귀신에게 ' + dmg + ' 데미지!', 'log-success');
      document.getElementById('dice-result').textContent = '명중! ' + dmg + ' 데미지';
    } 
    
    else {  // 명중 실패
      addBattleLog('[결과] 빗나갔다! (판정 실패: ' + roll + ' < 8)', 'log-damage');
      document.getElementById('dice-result').textContent = '빗나감 (roll: ' + roll + ')';
    }

    if (enemyHp <= 0) {  // 적 사망 → 승리 처리
      addBattleLog('[SYSTEM] 학점귀신을 물리쳤다! 데이터 조각 x5 획득', 'log-success');
      document.getElementById('dice-result').textContent = '전투 승리! 3초 후 복귀합니다.';
      document.getElementById('dice-display').textContent = '🎉';
      playerStats.data += 5;  // 승리 보상
      updateMapStats();
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
    updateBattleBars();
    addBattleLog('[결과] HP ' + heal + ' 회복!', 'log-success');
    document.getElementById('dice-result').textContent = 'HP +' + heal + ' 회복';
  }

  // ── 하이퍼 프롬프트 (버프) ──
  // 다음 공격 데미지 2배, 빗나가도 유지됨
  else if (cmd === 'hyper') {
    buffActive = true;
    addBattleLog('[버프] 하이퍼 프롬프트! 다음 공격 데미지 2배', 'log-success');
    document.getElementById('dice-result').textContent = '다음 공격 데미지 2배!';
    document.getElementById('dice-display').textContent = '⚡';
  }

  // ── 이면 세계 탈출 (도망) ──
  // d2 굴려서 2 나오면 탈출 성공 (50% 확률)
  else if (cmd === 'run') {
    document.getElementById('dice-result').textContent = 'd2 굴리는 중...';
    const roll = await animateDice(2);

    if (roll === 2) {
      addBattleLog('[결과] 전투에서 벗어났다!', 'log-success');
      document.getElementById('dice-result').textContent = '탈출 성공!';

      // 탈출 성공 → 즉시 탐험 화면으로 복귀
      document.getElementById('battle-container').classList.remove('visible');
      document.getElementById('battle-container').style.display = 'none';  // 확실히 숨김
      document.getElementById('explore-container').style.display = 'flex';

      // 🌟 이동 잠금 해제 및 좌표 동기화 🌟
      player.isMoving = false;  // 다시 움직일 수 있게 잠금을 풉니다.
      player.x = player.gridX * 32; // 현재 위치 픽셀 동기화
      player.y = player.gridY * 32;
        
      // 3. 루프가 멈췄을 경우를 대비해 다시 깨우기
      requestAnimationFrame(update); //

      battleBusy = false;
      return;
    } 
    
    else {
      addBattleLog('[결과] 탈출 실패! 학점귀신이 가로막았다.', 'log-damage');
      document.getElementById('dice-result').textContent = '탈출 실패...';
    }
  }

  // 적 턴 실행
  await enemyTurn();
}