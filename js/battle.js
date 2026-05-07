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
      addBattleLog('[결과] 이면 세계에서 탈출했다!', 'log-success');
      document.getElementById('dice-result').textContent = '탈출 성공!';
      document.getElementById('battle-container').classList.remove('visible');
      document.getElementById('game-container').style.display = 'flex';
      battleBusy = false;
      return;
    } else {
      addBattleLog('[결과] 탈출 실패! 학점귀신이 가로막았다.', 'log-damage');
      document.getElementById('dice-result').textContent = '탈출 실패...';
    }
  }

  // 적 턴 실행
  await enemyTurn();
}