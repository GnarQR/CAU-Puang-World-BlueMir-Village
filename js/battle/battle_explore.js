// ================================================================
// battle_explore.js — 205관 탐험 시스템
// 로그라이크 방 구조, 마우스 클릭 이동, 미니맵, 방 이벤트
// ================================================================

// ================================================================
// 1. 탐험 상태 변수
// ================================================================

let player = {
  gridX: 2,
  gridY: 10,
  x: 2 * 32,
  y: 10 * 32,
  isMoving: false,
  speed: 4
};

// ── 탐험 맵 이미지 설정 ──
const TILE_SIZE       = 32;
const MAP_WIDTH_TILES = 32;
const MAP_HEIGHT_TILES = 19;

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
            0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56,
            0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 56, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 56,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 0, 0, 0, 0, 0, 0, 0, 0];

// 층 시스템
let exploreFloor      = 1;   // 현재 층 (1~10)
const MAX_FLOOR       = 10;

// 클릭 이동
let _clickPath   = [];    // 이동할 그리드 좌표 배열 [{x,y}, ...]
let _clickTarget = null;  // 클릭 목표 픽셀 좌표 — 클릭 표시용
let _clickAnim   = 0;     // 클릭 표시 애니메이션 프레임 카운터

// 방 시스템
// roomGrid[roomId] = { type, cleared, hasFought, hasStatue, x, y, connections }
let roomGrid     = {};
let currentRoomId = 'start';
let roomEventActive = false; // 방 이벤트 처리 중 플래그

// ================================================================
// 2. 이미지 로드
// ================================================================

const bgImage = new Image();
const playerImage = new Image();

// 이미지가 로드되었는지 확인하는 플래그
let assetsLoaded = 0;

function _loadExploreAssets(floor) {
  assetsLoaded = 0;
 
  const gender = playerStats?.gender || localStorage.getItem('playerGender') || 'male';
  playerImage.src = gender === 'female'
    ? 'images/player/player_female_battle.png'
    : 'images/player/player_male_battle.png';

  // 층마다 밝기 조절 (1층=100%, 10층=40%)
  const brightness = Math.max(40, 100 - (floor - 1) * 6.5);
  bgImage.src = 'images/map/205_building.jpg';
  playerImage.src = 'images/player/player_male_default.png';
  [bgImage, playerImage].forEach(img => {
    img.onload = () => { assetsLoaded++; };
  });
  return brightness;
}

// ================================================================
// 3. 방 생성 (랜덤 로그라이크 구조)
// ================================================================

// 방 종류
const ROOM_TYPES = ['empty', 'empty', 'empty', 'empty', 'item', 'empty', 'empty', 'bonfire', 'empty', 'empty'];
// empty 비중 높게, bonfire(모닥불)와 item 적당히

function generateRooms(floor) {
  roomGrid = {};

  // 한 개의 층에 방 30 ~ 40개 생성
  const roomCount = 30 + Math.floor(Math.random() * 11);

  // 시작방
  roomGrid['start'] = {
    id: 'start', type: 'empty', cleared: true, hasFought: true,
    hasStatue: false, x: 0, y: 0, connections: []
  };

  // BFS로 방 연결 생성 (상하좌우 모두 허용)
  const positions = new Set(['0,0']);
  const queue = ['start'];
  let idCounter = 1;

  while (idCounter < roomCount) {
    const parentId = queue[Math.floor(Math.random() * queue.length)];
    const parent   = roomGrid[parentId];
    const dirs = [[1,0],[-1,0],[0,-1],[0,1]].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
      const nx = parent.x + dx;
      const ny = parent.y + dy;
      const key = `${nx},${ny}`;
      if (positions.has(key)) continue;

      positions.add(key);
      const roomId = `room_${idCounter}`;
      const type = ROOM_TYPES[Math.floor(Math.random() * ROOM_TYPES.length)];  // 마지막 방은 계단방
      const hasStatue = Math.random() < 0.2;  // 조각상 확률 (계단방 제외, 20%)

      roomGrid[roomId] = {
        id: roomId, type, cleared: false, hasFought: false,
        hasStatue, x: nx, y: ny, connections: [parentId]
      };
      parent.connections.push(roomId);
      queue.push(roomId);
      idCounter++;
      break;
    }
  }

  // BFS로 시작방에서 각 방까지 거리 계산
  const dist = { start: 0 };
  const bfsQ = [{ id: 'start', d: 0 }];
  while (bfsQ.length) {
    const { id, d } = bfsQ.shift();
    for (const cId of roomGrid[id].connections) {
      if (dist[cId] === undefined) {
        dist[cId] = d + 1;
        bfsQ.push({ id: cId, d: d + 1 });
      }
    }
  }

  // 가장 먼 방을 계단으로 지정 (최소 거리 5 보장)
  let farthestId = null, maxDist = 0;
  for (const [id, d] of Object.entries(dist)) {
    if (id !== 'start' && d > maxDist) { maxDist = d; farthestId = id; }
  }

  if (farthestId) {  // 기존 계단 타입 제거
    Object.values(roomGrid).forEach(r => { if (r.type === 'stairs') r.type = 'empty'; });
    roomGrid[farthestId].type = 'stairs';
    roomGrid[farthestId].hasStatue = false;
  }
}

// 계단방까지의 대략적인 방향 힌트
function _calcStairsHint() {
  const stairsRoom = Object.values(roomGrid).find(r => r.type === 'stairs');
  if (!stairsRoom) return;
  const dx = stairsRoom.x - 0;
  const dy = stairsRoom.y - 0;
  let hint = '';
  if (Math.abs(dx) > Math.abs(dy)) hint = dx > 0 ? '동쪽' : '서쪽';
  else hint = dy < 0 ? '북쪽' : '남쪽';
  window._stairsHint = hint;
}

// ================================================================
// 4. 방 이동 화살표
// ================================================================

// 화살표 근접 활성화 임계값 (그리드 칸 수)
const ARROW_ACTIVATE_DIST = 4;

function renderRoomArrows() {
  // 기존 화살표 제거
  document.querySelectorAll('.room-arrow').forEach(e => e.remove());

  const room = roomGrid[currentRoomId];
  if (!room) return;

  const container = document.getElementById('explore-container');
  if (!container) return;

  const cw = container.clientWidth  || 1024;
  const ch = container.clientHeight || 598;

  room.connections.forEach(connId => {
    const conn = roomGrid[connId];
    if (!conn) return;

    const dx = conn.x - room.x;
    const dy = conn.y - room.y;

    // 화살표 위치 (캔버스 기준)
    let left, top, symbol;
    if      (dx ===  1) { left = cw - 52;     top = ch / 2 - 22; symbol = '▶'; nearX = MAP_WIDTH_TILES - 3; nearY = player.gridY; }
    else if (dx === -1) { left = 8;           top = ch / 2 - 22; symbol = '◀'; nearX = 2;                   nearY = player.gridY; }
    else if (dy === -1) { left = cw / 2 - 22; top = 8;           symbol = '▲'; nearX = player.gridX;        nearY = 4; }
    else if (dy ===  1) { left = cw / 2 - 22; top = ch - 52;     symbol = '▼'; nearX = player.gridX;        nearY = MAP_HEIGHT_TILES - 3; }
    else return;

    const distX = Math.abs(player.gridX - nearX);
    const distY = Math.abs(player.gridY - nearY);
    const isNear = distX <= ARROW_ACTIVATE_DIST && distY <= ARROW_ACTIVATE_DIST;

    const btn = document.createElement('button');
    btn.className = 'room-arrow';
    btn.dataset.connId = connId;
    btn.textContent = symbol;
    btn.title = _getRoomLabel(conn.type) + (conn.cleared ? ' ✅' : '');
    btn.style.cssText = `
      position:absolute; left:${left}px; top:${top}px;
      background:rgba(10,12,20,.85); border:1px solid ${isNear ? '#5dcaa5' : '#0f3460'};
      border-radius:8px; color:${isNear ? '#5dcaa5' : '#2a4a6a'}; font-size:20px;
      padding:6px 10px; z-index:50; transition:all .2s;
      cursor:${isNear ? 'pointer' : 'default'};
      opacity:${isNear ? '1' : '0.4'};
    `;

    if (isNear) {
      btn.onmouseenter = () => { btn.style.background = 'rgba(30,50,80,.95)'; btn.style.transform = 'scale(1.15)'; };
      btn.onmouseleave = () => { btn.style.background = 'rgba(10,12,20,.85)'; btn.style.transform = 'scale(1)'; };
      btn.onclick = () => moveToRoom(connId);
    }
    container.appendChild(btn);
  });

  // 조각상 힌트 표시
  if (room.hasStatue && !room.cleared) _showStatueHintPopup();
}

// 캐릭터 이동 시 화살표 활성화 상태 갱신
function _updateArrowActivation() {
  const room = roomGrid[currentRoomId];
  if (!room) return;

  document.querySelectorAll('.room-arrow').forEach(btn => {
    const connId = btn.dataset.connId;
    const conn = roomGrid[connId];
    if (!conn) return;

    const dx = conn.x - room.x;
    const dy = conn.y - room.y;

    let nearX, nearY;
    if      (dx ===  1) { nearX = MAP_WIDTH_TILES - 3; nearY = player.gridY; }
    else if (dx === -1) { nearX = 2;                   nearY = player.gridY; }
    else if (dy === -1) { nearX = player.gridX;        nearY = 4; }
    else if (dy ===  1) { nearX = player.gridX;        nearY = MAP_HEIGHT_TILES - 3; }
    else return;

    const isNear = Math.abs(player.gridX - nearX) <= ARROW_ACTIVATE_DIST &&
                   Math.abs(player.gridY - nearY) <= ARROW_ACTIVATE_DIST;

    btn.style.border  = `1px solid ${isNear ? '#5dcaa5' : '#0f3460'}`;
    btn.style.color   = isNear ? '#5dcaa5' : '#2a4a6a';
    btn.style.opacity = isNear ? '1' : '0.4';
    btn.style.cursor  = isNear ? 'pointer' : 'default';
    btn.onclick       = isNear ? () => moveToRoom(connId) : null;
    btn.onmouseenter  = isNear ? () => { btn.style.background = 'rgba(30,50,80,.95)'; btn.style.transform = 'scale(1.15)'; } : null;
    btn.onmouseleave  = isNear ? () => { btn.style.background = 'rgba(10,12,20,.85)'; btn.style.transform = 'scale(1)'; } : null;
  });
}

function _getRoomLabel(type) {
  return { empty: '빈 방', item: '아이템 방', bonfire: '모닥불', stairs: '계단' }[type] || '방';
}

// ================================================================
// 5. 방 이동
// ================================================================

function moveToRoom(roomId) {
  if (roomEventActive) return;

  const prevRoom = roomGrid[currentRoomId];
  const nextRoom = roomGrid[roomId];
  if (!nextRoom) return;

  // 화면 전환 연출
  const canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.style.transition = 'filter .25s';
    canvas.style.filter = 'brightness(0)';
    setTimeout(() => {
      canvas.style.filter = `brightness(${_getFloorBrightness()})`;
    }, 250);
  }

  // 현재 방 클리어 처리
  if (prevRoom) prevRoom.cleared = true;

  currentRoomId = roomId;

  // 플레이어 위치 중앙으로 리셋
  player.gridX = 2; player.gridY = 10;
  player.x = player.gridX * TILE_SIZE;
  player.y = player.gridY * TILE_SIZE;
  _clickPath = [];
  _bonfirePos = null;  // 방 이동 시 상호작용 아이템 초기화
  _chestPos   = null;
  _stairsPos  = null;
  _statuePos  = null;
  document.getElementById('bonfire-confirm')?.remove();
  document.getElementById('statue-popup')?.remove();

  // 화살표 갱신
  setTimeout(() => {
    renderRoomArrows();
    // 방 입장 이벤트 (계단방 제외, 미전투 방만)
    if (nextRoom.type !== 'stairs' && !nextRoom.hasFought) _onEnterRoom(nextRoom);
    else if (nextRoom.type === 'stairs') _onEnterStairs();
    // 미니맵 갱신
    renderMiniMap();
  }, 300);
}

// ================================================================
// 6. 방 입장 이벤트
// ================================================================

function _onEnterRoom(room) {
  // 전투 확률: 빈방 30%, 아이템방 20%, 모닥불 0%
  const fightChance = { empty: 0.60, item: 0.40, bonfire: 0 }[room.type] ?? 0.50;

  if (Math.random() < fightChance) {
    room.hasFought = true;
    roomEventActive = true;
    setTimeout(() => {
      window.triggerExploreRoomBattle(() => {
        // 전투 후 복귀 콜백
        roomEventActive = false;
        room.cleared = true;
        _afterFight(room);
      });
    }, 400);
    return;
  }

  // 전투 없이 입장
  _afterFight(room);
}

function _afterFight(room) {
  room.hasFought = true;
  if (room.type === 'item')    _triggerItemRoom(room);
  if (room.type === 'bonfire') _triggerBonfireRoom(room);
  if (room.type === 'stairs')  _onEnterStairs();
  if (room.hasStatue) _spawnStatue(room);
  renderMiniMap();
}

// ── 아이템 방 ──
// ── 방 오브젝트 위치 ──
let _chestPos   = null;       // 아이템 상자
let _statuePos  = null;       // 조각상
let _stairsPos  = null;       // 계단
const OBJ_ACTIVATE_DIST = 3;  // 근접 활성화 거리

function _getRandomWalkable() {
  const walkable = [];
  for (let y = 7; y <= 14; y++) {
    for (let x = 3; x <= 28; x++) {
      if (collisionData[y * MAP_WIDTH_TILES + x] === 0) walkable.push({x, y});
    }
  }
  return walkable.length ? walkable[Math.floor(Math.random() * walkable.length)] : null;
}

function _triggerItemRoom(room) {
  if (room.chestSpawned) return;
  room.chestSpawned = true;
  _chestPos = _getRandomWalkable();
  if (typeof showToast === 'function') showToast('📦 상자가 있어요! 가까이 가서 클릭하세요.', 'warning', 2500);
}

// 모닥불 위치 (그리드 좌표) — 방 입장 시 랜덤 생성
let _bonfirePos = null;

function _triggerBonfireRoom(room) { 
  if (room.bonfireSpawned) return;
  room.bonfireSpawned = true;
  _bonfirePos = _getRandomWalkable();
  if (typeof showToast === 'function') showToast('🔥 모닥불이 있어요! 가까이 가서 클릭하세요.', 'warning', 2500);
}

// ── 모닥불 확인창 ──
function _showBonfireConfirm() {
  const room = roomGrid[currentRoomId];
  if (!room) return;
  if (room.bonfireUsed) return;

  const container = document.getElementById('explore-container');
  if (!container) return;

  // 기존 확인창 제거
  document.getElementById('bonfire-confirm')?.remove();

  const box = document.createElement('div');
  box.id = 'bonfire-confirm';
  box.style.cssText = `
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    background:rgba(10,12,20,.97); border:1px solid #ef9f27;
    border-radius:14px; padding:20px 28px; z-index:200;
    text-align:center; min-width:260px;
  `;
  box.innerHTML = `
    <div style="font-size:28px;margin-bottom:8px;">🔥</div>
    <div style="color:#ef9f27;font-size:15px;font-weight:700;margin-bottom:6px;">모닥불 근처에서 쉬기</div>
    <div style="color:#a0c4ff;font-size:12px;margin-bottom:16px;">HP / SP를 전부 회복하시겠습니까?</div>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button id="bonfire-yes" style="background:rgba(239,159,39,.2);border:1px solid #ef9f27;border-radius:8px;color:#ef9f27;padding:7px 20px;font-size:13px;cursor:pointer;">네</button>
      <button id="bonfire-no"  style="background:rgba(22,33,62,.8);border:1px solid #0f3460;border-radius:8px;color:#6c8ebf;padding:7px 20px;font-size:13px;cursor:pointer;">아니요</button>
    </div>
  `;
  container.appendChild(box);

  document.getElementById('bonfire-yes').onclick = () => {
    room.bonfireUsed = true;
    _bonfirePos = null; // 사용 후 모닥불 제거

    playerStats.hp = playerStats.maxHp;
    playerStats.sp = playerStats.maxSp;
    if (typeof updateMapStats === 'function') updateMapStats();
    if (typeof saveAllDataToServer === 'function') saveAllDataToServer();
    if (typeof showToast === 'function') showToast('🔥 HP / SP 완전 회복!', 'success', 2500);
    box.remove();
  };
  document.getElementById('bonfire-no').onclick = () => box.remove();
}

// ── 상자 열기 ──
function _openChest() {
  const room = roomGrid[currentRoomId];
  if (!room || room.chestOpened) return;  // 이미 열린 상자면 조용히 무시
  room.chestOpened = true;
  _chestPos = null;

  // 실제 인벤토리 아이템 ID 사용
  const items = [
    { id: 'hp_potion',    name: 'HP 포션',       emoji: '🧪' },
    { id: 'sp_potion',    name: 'SP 포션',       emoji: '💙' },
    { id: 'full_potion',  name: '완전 회복제',    emoji: '💊' },
    { id: 'dmg_boost',    name: '공격 강화제',    emoji: '⚡' },
    //{ id: 'shield',       name: '방어막',         emoji: '🛡️' }, 일단 밸런스 용으로 방어막은 제거
    { id: 'regen',        name: '재생 물약',      emoji: '✨' },
  ];
  const pick = items[Math.floor(Math.random() * items.length)];

  if (typeof inventory !== 'undefined') {
    // inventory가 객체 배열이면 그대로, 아니면 ITEM_DB에서 찾아서 push
    const itemObj = window.ITEM_DB ? window.ITEM_DB.get(pick.id) : null;

    if (itemObj) inventory.push({ ...itemObj });
    else inventory.push({ id: pick.id, name: pick.name, icon: pick.emoji, qty: 1 });

    if (typeof saveInventory === 'function') saveInventory();
  }
  if (typeof saveAllDataToServer === 'function') saveAllDataToServer();
  if (typeof showToast === 'function') showToast(`${pick.emoji} 상자에서 [${pick.name}] 획득!`, 'success', 2500);
}

// ── 계단 방 ──
function _onEnterStairs() {
  _stairsPos = _getRandomWalkable();
  if (typeof showToast === 'function') showToast('🪜 계단이 있어요! 가까이 가서 클릭하세요.', 'success', 2500);
}

// ── 조각상 스폰 ──
function _spawnStatue(room) {
  _statuePos = _getRandomWalkable();
}

// ── 조각상 방향 힌트 (현재 방 → 계단방 BFS) ──
function _getStatueHint() {
  const stairsRoom = Object.values(roomGrid).find(r => r.type === 'stairs');
  if (!stairsRoom) return '???';

  // 방 노드 BFS (roomGrid 기준)
  const visited = new Set([currentRoomId]);
  const queue   = [{ id: currentRoomId, path: [] }];
  while (queue.length) {
    const { id, path } = queue.shift();
    const room = roomGrid[id];
    if (!room) continue;
    for (const connId of room.connections) {
      if (visited.has(connId)) continue;
      visited.add(connId);
      const newPath = [...path, connId];
      if (connId === stairsRoom.id) {
        // 첫 번째 이동 방향 계산
        const firstRoom = roomGrid[newPath[0]];
        const dx = firstRoom.x - room.x; // 잘못된 참조 방지를 위해 시작방 기준
        const start = roomGrid[currentRoomId];
        const fdx = firstRoom.x - start.x;
        const fdy = firstRoom.y - start.y;
        if      (fdx >  0) return '동쪽(오른쪽)';
        else if (fdx <  0) return '서쪽(왼쪽)';
        else if (fdy < 0)  return '북쪽(위쪽)';
        else               return '남쪽(아래쪽)';
      }
      queue.push({ id: connId, path: newPath });
    }
  }
  return '???';
}

function _goNextFloor() {
  puangFloorInterventionCount  = 0;
  puangBattleInterventionCount = 0;

  if (exploreFloor >= MAX_FLOOR) {
    _showDungeonClearScreen();
    return;
  }

  if (typeof window.resetPuangIntervention === 'function') window.resetPuangIntervention();  // 층이 넘어가면 푸앙 agent 개입 초기화

  // 현재 층 클리어 저장
  const prev = parseInt(localStorage.getItem('exploreFloorCleared') || '0');
  if (exploreFloor > prev) localStorage.setItem('exploreFloorCleared', exploreFloor);

  exploreFloor++;
  localStorage.setItem('exploreFloor', exploreFloor);

  // 오브젝트/화살표 초기화
  _chestPos = null; _bonfirePos = null; _stairsPos = null; _statuePos = null;
  document.querySelectorAll('.room-arrow').forEach(e => e.remove());
  document.getElementById('bonfire-confirm')?.remove();

  // 새 층 생성
  generateRooms(exploreFloor);
  currentRoomId = 'start';
  player.gridX = 2; player.gridY = 10;
  player.x = player.gridX * TILE_SIZE;
  player.y = player.gridY * TILE_SIZE;

  const badge = document.getElementById('explore-floor-badge');
  if (badge) badge.textContent = `B${exploreFloor}F`;

  renderRoomArrows();
  renderMiniMap();

  if (typeof showToast === 'function') showToast(`🪜 B${exploreFloor}F 진입!`, 'success', 2000);
}

// ── 조각상 힌트 팝업 ──
function _showStatueHintPopup() {
  const hint = _getStatueHint();
  const container = document.getElementById('explore-container');
  if (!container) return;

  document.getElementById('statue-popup')?.remove();
  const box = document.createElement('div');
  box.id = 'statue-popup';
  box.style.cssText = `
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    background:rgba(10,12,20,.97); border:1px solid #6c8ebf;
    border-radius:14px; padding:20px 28px; z-index:200;
    text-align:center; min-width:240px;
  `;
  box.innerHTML = `
    <div style="font-size:28px;margin-bottom:8px;">🗿</div>
    <div style="color:#a0c4ff;font-size:13px;line-height:1.6;margin-bottom:16px;">
      "계단은 <span style="color:#5dcaa5;font-weight:700;">${hint}</span> 방향에 있노라..."
    </div>
    <button onclick="document.getElementById('statue-popup').remove()"
      style="background:rgba(22,33,62,.8);border:1px solid #0f3460;border-radius:8px;color:#6c8ebf;padding:6px 20px;cursor:pointer;">
      확인
    </button>
  `;
  container.appendChild(box);
}

// 던전 클리어 UI 추가
function _showDungeonClearScreen() {
  const container = document.getElementById('explore-container');
  if (!container) return;

  // 클리어 기록 저장
  localStorage.setItem('exploreFloorCleared', MAX_FLOOR);
  if (typeof saveAllDataToServer === 'function') saveAllDataToServer();

  const box = document.createElement('div');
  box.style.cssText = `
    position:absolute;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,10,.92);z-index:200;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;
  `;
  box.innerHTML = `
    <div style="font-size:40px;margin-bottom:16px;">🏆</div>
    <div style="font-size:11px;letter-spacing:3px;color:#5dcaa5;margin-bottom:8px;">DUNGEON CLEAR</div>
    <div style="font-size:22px;font-weight:800;color:#e0e0e0;margin-bottom:12px;">
      205관 이면세계 클리어를 축하합니다!
    </div>
    <div style="font-size:13px;color:#6c8ebf;margin-bottom:32px;">
      B1F ~ B10F 모든 층을 정복했습니다.
    </div>
    <button onclick="this.parentElement.remove();document.getElementById('game-container').style.display='flex';"
      style="background:rgba(93,202,165,.2);border:1px solid #5dcaa5;border-radius:10px;
      color:#5dcaa5;font-size:14px;font-weight:700;padding:12px 32px;cursor:pointer;">
      ← 맵으로 돌아가기
    </button>
  `;
  container.appendChild(box);
}

// ================================================================
// 7. 전투 연결 (battle.js의 triggerBattle 대체)
// ================================================================

// 탐험 중 전투 발생 시 호출
window.triggerExploreRoomBattle = function(onBattleEnd) {
  window._exploreRoomBattleCallback = onBattleEnd;

  // 1. 모든 레이어 정리 & 탐험 화면 숨기기
  const exploreCont = document.getElementById('explore-container');
  if (exploreCont) exploreCont.style.display = 'none';

  // 2. 기존 전투 화면 띄우기
  const battleCont = document.getElementById('battle-container');
  if (battleCont) {
    battleCont.style.display = 'flex';
    battleCont.classList.add('visible');
    battleCont.style.zIndex = '2000';
  }

  // 3. 전투 시스템 초기화
  if (typeof window.initBattle === 'function') {
    window.initBattle('map', null);  // 일반 몬스터 전투로 초기화
  }
};

// battle.js의 returnToGame에서 origin='map'일 때 이 콜백 실행
window._onExploreRoomBattleEnd = function() {
  const cb = window._exploreRoomBattleCallback;
  window._exploreRoomBattleCallback = null;
  roomEventActive = false;
  const exploreCont = document.getElementById('explore-container');
  if (exploreCont) exploreCont.style.display = 'block';
  if (typeof update === 'function') requestAnimationFrame(update);
  if (cb) cb();
};

// ================================================================
// 8. 미니맵 오버레이
// ================================================================

function renderMiniMap() {
  const overlay = document.getElementById('explore-minimap-overlay');
  if (!overlay) return;

  const rooms = Object.values(roomGrid);
  if (!rooms.length) return;

  // 좌표 범위 계산
  const xs = rooms.map(r => r.x);
  const ys = rooms.map(r => r.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const CELL = 36, PAD = 20;
  const W = (maxX - minX + 1) * CELL + PAD * 2;
  const H = (maxY - minY + 1) * CELL + PAD * 2;

  let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;

  // 연결선 - 양쪽 모두 탐험한 방 사이만 표시
  rooms.forEach(room => {
    if (!room.cleared && room.id !== currentRoomId) return;
    room.connections.forEach(connId => {
      const conn = roomGrid[connId];
      if (!conn) return;
      if (!conn.cleared && conn.id !== currentRoomId) return; // 미탐험 방은 연결선 숨김
      const x1 = (room.x - minX) * CELL + PAD + CELL/2;
      const y1 = (room.y - minY) * CELL + PAD + CELL/2;
      const x2 = (conn.x - minX) * CELL + PAD + CELL/2;
      const y2 = (conn.y - minY) * CELL + PAD + CELL/2;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0f3460" stroke-width="2"/>`;
    });
  });

  // 방 노드 (탐험한 방만)
  rooms.forEach(room => {
    if (!room.cleared && room.id !== currentRoomId) return; // 미탐험 방 숨김

    const cx = (room.x - minX) * CELL + PAD + CELL/2;
    const cy = (room.y - minY) * CELL + PAD + CELL/2;
    const isCurrent = room.id === currentRoomId;

    const colors = {
      empty:   '#16213e',
      item:    '#1a3a2a',
      bonfire: '#2a1a0a',
      stairs:  '#0a2a3a',
    };

    const icons = { empty: '·', item: '📦', bonfire: '🔥', stairs: '🪜' };

    const fill   = colors[room.type] || '#16213e';
    const stroke = isCurrent ? '#5dcaa5' : room.cleared ? '#0f3460' : '#333';
    const sw     = isCurrent ? 2.5 : 1.5;

    svg += `<rect x="${cx-13}" y="${cy-13}" width="26" height="26" rx="6"
              fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    svg += `<text x="${cx}" y="${cy+5}" text-anchor="middle"
              font-size="13" fill="${isCurrent ? '#5dcaa5' : '#a0c4ff'}">${icons[room.type] || '·'}</text>`;
  });

  svg += '</svg>';

  overlay.innerHTML = `
    <div style="background:rgba(10,12,20,.96);border:1px solid #0f3460;border-radius:12px;padding:12px;max-width:90vw;max-height:80vh;overflow:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#5dcaa5;font-weight:700;">🗺️ B${exploreFloor}F 탐험 지도</span>
        <button onclick="toggleMiniMap()" style="background:none;border:none;color:#6c8ebf;font-size:18px;cursor:pointer;">✕</button>
      </div>
      <div style="color:#6c8ebf;font-size:11px;margin-bottom:8px;">🟦 현재 위치 &nbsp; 탐험한 방만 표시</div>
      ${svg}
    </div>`;
}

window.toggleMiniMap = function() {
  const overlay = document.getElementById('explore-minimap-overlay');
  if (!overlay) return;
  const isVisible = overlay.style.display !== 'none' && overlay.style.display !== '';
  overlay.style.display = isVisible ? 'none' : 'flex';
  if (!isVisible) renderMiniMap();
};

// ================================================================
// 9. 층 선택 화면
// ================================================================

window.showFloorSelectScreen = function() {
  const clearedFloor = parseInt(localStorage.getItem('exploreFloorCleared') || '0');
  const maxSelectable = Math.min(clearedFloor + 1, MAX_FLOOR);

  const overlay = document.getElementById('explore-floor-select');
  if (!overlay) return;

  const btnHTML = Array.from({ length: MAX_FLOOR }, (_, i) => {
    const f        = i + 1;
    const unlocked = f <= maxSelectable;
    const isCurrent = f === exploreFloor;
    const bg     = unlocked ? (isCurrent ? 'rgba(93,202,165,.2)' : 'rgba(22,33,62,.9)') : 'rgba(10,12,20,.6)';
    const border = unlocked ? (isCurrent ? '#5dcaa5' : '#0f3460') : '#1a1a2e';
    const color  = unlocked ? (isCurrent ? '#5dcaa5' : '#e0e0e0') : '#2a2a4a';

    return `
      <button
        ${unlocked ? `onclick="window.startFloor(${f})"` : ''}
        style="padding:14px 0 10px;border-radius:10px;font-size:14px;font-weight:700;
          cursor:${unlocked ? 'pointer' : 'default'};
          background:${bg};border:1px solid ${border};color:${color};transition:all .15s;"
        ${unlocked ? `onmouseenter="this.style.transform='scale(1.06)';this.style.boxShadow='0 0 8px rgba(93,202,165,.3)'"` : ''}
        ${unlocked ? `onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='none'"` : ''}
      >
        B${f}F
        ${!unlocked ? '<div style="font-size:10px;margin-top:3px;opacity:.4;">🔒</div>' : ''}
        ${isCurrent ? '<div style="font-size:9px;margin-top:2px;color:#5dcaa5;letter-spacing:1px;">NOW</div>' : ''}
        ${unlocked && !isCurrent && f <= clearedFloor ? '<div style="font-size:9px;margin-top:2px;color:#6c8ebf;">CLEAR</div>' : ''}
      </button>`;
  }).join('');

  overlay.innerHTML = `
    <div style="background:rgba(8,10,18,.98);border:1px solid #0f3460;border-radius:20px;
      padding:28px 32px;max-width:480px;width:90%;box-shadow:0 0 40px rgba(0,0,0,.8);">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:3px;color:#2a3a5a;margin-bottom:6px;">205관 이면세계</div>
        <div style="font-size:22px;font-weight:800;color:#e0e0e0;letter-spacing:1px;">탐험할 층을 선택해주세요.</div>
        <div style="width:40px;height:2px;background:#5dcaa5;margin:10px auto 0;border-radius:2px;"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;">
        ${btnHTML}
      </div>
      <button
        onclick="document.getElementById('explore-floor-select').style.display='none';document.getElementById('game-container').style.display='flex';"
        style="width:100%;padding:11px;border-radius:10px;background:rgba(15,22,40,.8);
          border:1px solid #0f3460;color:#6c8ebf;font-size:13px;cursor:pointer;transition:all .15s;"
        onmouseenter="this.style.color='#a0c4ff';this.style.borderColor='#1e3a60'"
        onmouseleave="this.style.color='#6c8ebf';this.style.borderColor='#0f3460'"
      >← 맵으로 돌아가기</button>
    </div>`;

  overlay.style.display = 'flex';
};

window.startFloor = function(floor) {
  puangFloorInterventionCount  = 0;
  puangBattleInterventionCount = 0;
  exploreFloor = floor;
  localStorage.setItem('exploreFloor', floor);

  const overlay = document.getElementById('explore-floor-select');
  if (overlay) overlay.style.display = 'none';

  if (typeof window.resetPuangIntervention === 'function') window.resetPuangIntervention();  // 층이 넘어가면 푸앙 agent 개입 초기화

  // 방 생성 및 탐험 시작
  generateRooms(floor);
  currentRoomId = 'start';

  const badge = document.getElementById('explore-floor-badge');
  if (badge) badge.textContent = `B${floor}F`;

  const exploreCont = document.getElementById('explore-container');
  if (exploreCont) exploreCont.style.display = 'block';

  if (typeof window.startExploration === 'function') window.startExploration();

  setTimeout(() => renderRoomArrows(), 200);
  renderMiniMap();
};

// ================================================================
// 10. 그리기 (draw)
// ================================================================

function _getFloorBrightness() {
  return Math.max(0.4, 1 - (exploreFloor - 1) * 0.065);
}

function draw() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 층별 밝기 필터
  ctx.filter = `brightness(${_getFloorBrightness()})`;
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';

  // 캐릭터
  if (playerImage.complete && playerImage.naturalWidth !== 0) {
    const drawX = player.x - 16;
    const drawY = player.y - 48;
    ctx.drawImage(playerImage, drawX, drawY, 64, 64);
  }

  // 모닥불 렌더링
  if (_bonfirePos) {
    const bx = _bonfirePos.x * TILE_SIZE + TILE_SIZE / 2;
    const by = _bonfirePos.y * TILE_SIZE + TILE_SIZE / 2;
    const t  = Date.now() / 200;
    const flicker = 0.85 + Math.sin(t) * 0.15;

    ctx.save();
    ctx.globalAlpha = flicker;
    // 모닥불 글로우
    const grad = ctx.createRadialGradient(bx, by, 2, bx, by, 20);
    grad.addColorStop(0, 'rgba(255,180,50,0.6)');
    grad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, 20, 0, Math.PI * 2);
    ctx.fill();

    // 모닥불 이모지
    ctx.globalAlpha = 1;
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔥', bx, by);

    // 근접 시 안내 텍스트
    const dist = Math.hypot(player.gridX - _bonfirePos.x, player.gridY - _bonfirePos.y);
    if (dist <= OBJ_ACTIVATE_DIST) {
      ctx.fillStyle = '#ef9f27';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('클릭하여 쉬기', bx, by - 24);
    }
    ctx.restore();
  }

  // 아이템 상자 렌더링
  if (_chestPos) {
    const cx = _chestPos.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = _chestPos.y * TILE_SIZE + TILE_SIZE / 2;
    const dist = Math.hypot(player.gridX - _chestPos.x, player.gridY - _chestPos.y);
    ctx.save();
    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('📦', cx, cy);
    if (dist <= OBJ_ACTIVATE_DIST) {
      ctx.fillStyle = '#a0c4ff'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('클릭하여 조사', cx, cy - 24);
    }
    ctx.restore();
  }

  // 계단 렌더링
  if (_stairsPos) {
    const sx = _stairsPos.x * TILE_SIZE + TILE_SIZE / 2;
    const sy = _stairsPos.y * TILE_SIZE + TILE_SIZE / 2;
    const dist = Math.hypot(player.gridX - _stairsPos.x, player.gridY - _stairsPos.y);
    ctx.save();
    // 계단 글로우
    const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, 22);
    grad.addColorStop(0, 'rgba(93,202,165,0.5)');
    grad.addColorStop(1, 'rgba(93,202,165,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🪜', sx, sy);
    if (dist <= OBJ_ACTIVATE_DIST) {
      ctx.fillStyle = '#5dcaa5'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('다음 층으로', sx, sy - 24);
    }
    ctx.restore();
  }

  // 조각상 렌더링
  if (_statuePos) {
    const tx = _statuePos.x * TILE_SIZE + TILE_SIZE / 2;
    const ty = _statuePos.y * TILE_SIZE + TILE_SIZE / 2;
    const dist = Math.hypot(player.gridX - _statuePos.x, player.gridY - _statuePos.y);
    ctx.save();
    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🗿', tx, ty);
    if (dist <= OBJ_ACTIVATE_DIST) {
      ctx.fillStyle = '#6c8ebf'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('클릭하여 조사', tx, ty - 24);
    }
    ctx.restore();
  }

  // 클릭 목표 표시
  if (_clickTarget && _clickAnim > 0) {
    const alpha  = _clickAnim / 25;
    const radius = 6 + (1 - alpha) * 10;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#5dcaa5';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(_clickTarget.x, _clickTarget.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(_clickTarget.x - 5, _clickTarget.y);
    ctx.lineTo(_clickTarget.x + 5, _clickTarget.y);
    ctx.moveTo(_clickTarget.x, _clickTarget.y - 5);
    ctx.lineTo(_clickTarget.x, _clickTarget.y + 5);
    ctx.stroke();
    ctx.restore();
    _clickAnim--;
  }

  /*
  // [디버깅용] 벽 위치 눈으로 확인하기 
  collisionData.forEach((val, i) => {
    if (val === 56) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fillRect((i % 32) * 32, Math.floor(i / 32) * 32, 32, 32);
    }
  });
  */
}

// ================================================================
// 11. 이동 (update + movePlayer + findPath + 클릭)
// ================================================================

// 캐릭터 이동 함수 
function movePlayer(dx, dy) {
  const nextGridX = player.gridX + dx;
  const nextGridY = player.gridY + dy;

  // 1. 맵 경계 체크
  if (nextGridX < 0 || nextGridX >= MAP_WIDTH_TILES || nextGridY < 0 || nextGridY >= MAP_HEIGHT_TILES) return;
  
  // 2. 벽 체크 (56이면 리턴)
  const nextIdx = nextGridY * MAP_WIDTH_TILES + nextGridX;
  
  // 데이터 보호: 인덱스 범위를 벗어나는지 확인
  if (nextIdx >= collisionData.length || collisionData[nextIdx] === 56) return;
  
  // 대각선 끼임 방지
  if (dx !== 0 && dy !== 0) {
    const sideX = player.gridY  * MAP_WIDTH_TILES + nextGridX;
    const sideY = nextGridY     * MAP_WIDTH_TILES + player.gridX;
    if (collisionData[sideX] === 56 && collisionData[sideY] === 56) return;
  }

  // 3. 이동 가능한 곳(0)이면 좌표 갱신
  player.gridX = nextGridX;
  player.gridY = nextGridY;
  player.isMoving = true;
}

// BFS 경로 탐색
function findPath(fromX, fromY, toX, toY) {
  const tidx = toY * MAP_WIDTH_TILES + toX;
  if (tidx < 0 || tidx >= collisionData.length || collisionData[tidx] === 56) return [];
  const visited = new Uint8Array(MAP_WIDTH_TILES * MAP_HEIGHT_TILES);
  const queue   = [{ x: fromX, y: fromY, path: [] }];
  visited[fromY * MAP_WIDTH_TILES + fromX] = 1;
  const dirs = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]];
  while (queue.length) {
    const { x, y, path } = queue.shift();
    if (x === toX && y === toY) return path;
    for (const [ddx, ddy] of dirs) {
      const nx = x + ddx, ny = y + ddy;
      if (nx < 0 || nx >= MAP_WIDTH_TILES || ny < 0 || ny >= MAP_HEIGHT_TILES) continue;
      const idx = ny * MAP_WIDTH_TILES + nx;
      if (visited[idx] || collisionData[idx] === 56) continue;
      
      // 대각선 끼임 방지
      if (ddx !== 0 && ddy !== 0) {
        const sx = y  * MAP_WIDTH_TILES + nx;
        const sy = ny * MAP_WIDTH_TILES + x;
        if (collisionData[sx] === 56 && collisionData[sy] === 56) continue;
      }
      visited[idx] = 1;
      queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
    }
  }
  return [];
}

function update() {
  // 탐험 화면이 보일 때만 루프 생성
  const exploreCont = document.getElementById('explore-container');
  if (!exploreCont || exploreCont.style.display === 'none') return;  // 탐험 화면이 보이지 않으면 업데이트 중지


  if (player.isMoving) {
    const targetX = player.gridX * TILE_SIZE;
    const targetY = player.gridY * TILE_SIZE;

    // 목표 지점까지 스르륵 이동하는 효과
    if (player.x < targetX) player.x = Math.min(player.x + player.speed, targetX);
    else if (player.x > targetX) player.x = Math.max(player.x - player.speed, targetX);
    if (player.y < targetY) player.y = Math.min(player.y + player.speed, targetY);
    else if (player.y > targetY) player.y = Math.max(player.y - player.speed, targetY);

    // 한 칸 도착
    if (player.x === targetX && player.y === targetY) {
      player.isMoving = false;
      _updateArrowActivation(); // 도착 시마다 화살표 활성화 갱신
      if (_clickPath.length > 0) {
        const next = _clickPath.shift();
        player.gridX = next.x;
        player.gridY = next.y;
        player.isMoving = true;
      }
    }
  } 
    
  else if (_clickPath.length > 0) {
    const next = _clickPath.shift();
    player.gridX = next.x;
    player.gridY = next.y;
    player.isMoving = true;
  }

  draw();
  requestAnimationFrame(update);
}

// 캔버스 클릭 이벤트
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;

  canvas.addEventListener('click', (e) => {
    const exploreCont = document.getElementById('explore-container');
    if (!exploreCont || exploreCont.style.display === 'none') return;

    // 캔버스 내 클릭 좌표 → 그리드 좌표 변환 (CSS 스케일 보정)
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const px     = (e.clientX - rect.left) * scaleX;
    const py     = (e.clientY - rect.top)  * scaleY;
    const gx     = Math.floor(px / TILE_SIZE);
    const gy     = Math.floor(py / TILE_SIZE);

    // 모닥불 클릭 체크 (근접 시)
    if (_bonfirePos) {
      const bDist = Math.hypot(gx - _bonfirePos.x, gy - _bonfirePos.y);
      const pDist = Math.hypot(player.gridX - _bonfirePos.x, player.gridY - _bonfirePos.y);
      if (bDist <= 1.5 && pDist <= OBJ_ACTIVATE_DIST) {
        _showBonfireConfirm();
        return;
      }
    }

    // 상자 클릭 체크
    if (_chestPos) {
      const bDist = Math.hypot(gx - _chestPos.x, gy - _chestPos.y);
      const pDist = Math.hypot(player.gridX - _chestPos.x, player.gridY - _chestPos.y);
      if (bDist <= 1.5 && pDist <= OBJ_ACTIVATE_DIST) { _openChest(); return; }
    }

    // 계단 클릭 체크
    if (_stairsPos) {
      const bDist = Math.hypot(gx - _stairsPos.x, gy - _stairsPos.y);
      const pDist = Math.hypot(player.gridX - _stairsPos.x, player.gridY - _stairsPos.y);
      if (bDist <= 1.5 && pDist <= OBJ_ACTIVATE_DIST) { _goNextFloor(); return; }
    }

    // 조각상 클릭 체크
    if (_statuePos) {
      const bDist = Math.hypot(gx - _statuePos.x, gy - _statuePos.y);
      const pDist = Math.hypot(player.gridX - _statuePos.x, player.gridY - _statuePos.y);
      if (bDist <= 1.5 && pDist <= OBJ_ACTIVATE_DIST) { _showStatueHintPopup(); return; }
    }

    // 범위/벽 체크
    const idx    = gy * MAP_WIDTH_TILES + gx;
    if (gx < 0 || gx >= MAP_WIDTH_TILES || gy < 0 || gy >= MAP_HEIGHT_TILES) return;
    if (idx < 0 || idx >= collisionData.length || collisionData[idx] === 56) return;

    // 클릭 표시 (원 이펙트)
    _clickTarget = { x: gx * TILE_SIZE + TILE_SIZE / 2, y: gy * TILE_SIZE + TILE_SIZE / 2 };
    _clickAnim   = 25;
    _clickPath   = findPath(player.gridX, player.gridY, gx, gy);  // BFS로 경로 계산 후 저장
  });
});

// ================================================================
// 12. startExploration (battle.js에서 이전)
// ================================================================

// ── 탐험 모드 시작 함수 ──
window.startExploration = function() {
  // 이미지가 아직 로드 중이면 로드 완료 후 재시도
  if (assetsLoaded < 2) {
    const checkReady = setInterval(() => {
      if (assetsLoaded >= 2) { clearInterval(checkReady); window.startExploration(); }
    }, 100);
    return;
  }

  // 캔버스 해상도를 컨테이너 실제 크기에 맞게 설정 (그림 잘림 방지)
  // CSS로 건드리지 않고 canvas.width/height를 직접 설정해야 해상도 불일치 없음
  const canvas    = document.getElementById('map-canvas');
  const container = document.getElementById('explore-container');
  if (canvas && container) {
    // 모바일에서 container.clientWidth가 0일 때 window.innerWidth로 폴백
    // (1024 고정 폴백은 모바일에서 가로 스크롤 및 좌표 어긋남 유발)
    const w = container.clientWidth  || window.innerWidth  || 1024;
    const h = container.clientHeight || window.innerHeight || 598;
    // 실제 픽셀 해상도 설정 (이걸 안 하면 위쪽 절반만 보이고 아래 검은색)
    canvas.width  = w; canvas.height  = h;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
  }

  // 플레이어 초기 위치 설정
  player.gridX = 2; player.gridY = 10;
  player.x = player.gridX * TILE_SIZE;
  player.y = player.gridY * TILE_SIZE;
  player.isMoving = false;
  _clickPath = [];

  // 방 생성 및 화살표 렌더
  if (Object.keys(roomGrid).length === 0) generateRooms(exploreFloor);
  setTimeout(() => renderRoomArrows(), 100);

  // 창 크기 변경 시 탐험 캔버스도 리사이즈
  if (!window._exploreResizeHandler) {
    window._exploreResizeHandler = function() {
      const cv = document.getElementById('map-canvas');
      const ct = document.getElementById('explore-container');
      if (!cv || !ct || ct.style.display === 'none') return;
      const nw = ct.clientWidth  || window.innerWidth  || 1024;
      const nh = ct.clientHeight || window.innerHeight || 598;
      cv.width = nw; cv.height = nh;
      cv.style.width = nw + 'px'; cv.style.height = nh + 'px';
    };
    window.addEventListener('resize', window._exploreResizeHandler);
  }

  // 애니메이션 루프 시작
  requestAnimationFrame(update);
};

// ================================================================
// 13. 이미지 로드 시작
// ================================================================

_loadExploreAssets(exploreFloor);
