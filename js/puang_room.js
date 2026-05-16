// =============================================
// puang_room.js — 푸앙이의 방 (쿼터뷰)
// =============================================

// ── 아이템 데이터베이스 ──
// 구매 가능한 방 꾸미기 아이템 정의
const ROOM_ITEMS = {
  // 배경 테마 아이템 (background 슬롯)
  'item_night':    { id: 'item_night',   slot: 'background', theme: 'night',  name: '블루미르홀 야경 사진', emoji: '🌃', price: 13, desc: '방 야경 테마로 변경' },
  'item_sakura':   { id: 'item_sakura',  slot: 'background', theme: 'sakura', name: '캠퍼스 벚꽃 화분',    emoji: '🌸', price: 8,  desc: '방 봄 테마로 변경' },
  'item_dark':     { id: 'item_dark',    slot: 'background', theme: 'dark',   name: '이면 세계 암흑 결정', emoji: '🖤', price: 32, desc: '방 다크 테마로 변경' },

  // 벽 아이템 (wall 슬롯)
  'item_poster':   { id: 'item_poster',  slot: 'wall',   sprite: 'none',        name: '이면 세계 포스터',   emoji: '📜', price: 9,  desc: '벽 포스터 추가' },
  'item_painting': { id: 'item_painting',slot: 'wall',   sprite: 'none',        name: '청룡호 수채화',      emoji: '🖼️', price: 10, desc: '벽 그림 추가' },

  // 바닥 아이템 (floor 슬롯)
  'item_carpet':   { id: 'item_carpet',  slot: 'floor',  sprite: 'spr-carpet-blue', name: '푸앙이 발자국 카펫', emoji: '👣', price: 12, desc: '바닥 카펫 추가' },
  'item_plant':    { id: 'item_plant',   slot: 'floor2', sprite: 'spr-plant',       name: '캠퍼스 벚꽃 화분',  emoji: '🌿', price: 8,  desc: '화분 장식' },
  'item_lamp':     { id: 'item_lamp',    slot: 'floor3', sprite: 'spr-lamp',        name: '별빛 조명',         emoji: '🌟', price: 7,  desc: '방 조명 변경' },

  // 특수 가구 (furniture 슬롯) — 기본 배치됨
  // 추후 추가용: 'item_tank', 'item_doll' 등
};

// ── 방 배치 설정 ──
// 각 슬롯의 화면 위치 (%, 절대px)
const ROOM_SLOTS = {
  background: null,  // CSS 테마 클래스로 처리

  wall: {            // 뒷벽 왼쪽
    right: '28%', top: '8%', zIndex: 5
  },
  wall2: {           // 뒷벽 오른쪽 (추후)
    right: '8%', top: '6%', zIndex: 5
  },

  floor: {           // 바닥 중앙 (카펫)
    left: '30%', bottom: '22%', zIndex: 8
  },
  floor2: {          // 바닥 왼쪽 (화분)
    left: '16%', bottom: '20%', zIndex: 9
  },
  floor3: {          // 바닥 오른쪽 (램프)
    right: '10%', bottom: '20%', zIndex: 9
  },
};

// ── HTML 생성 ──
function buildRoomHTML() {
  return `
    <div id="puang-room-scene" class="theme-default">
      <!-- 방 구조 레이어 -->
      <div id="room-back-wall"></div>
      <div id="room-left-wall"></div>
      <div id="room-ceiling"></div>
      <div id="room-left-edge"></div>
      <div id="room-floor"></div>
      <div id="room-wall-floor-line"></div>

      <!-- 창문 -->
      <div id="room-window">
        <div class="room-window-arch"></div>
      </div>
      <div id="room-window-light"></div>

      <!-- 기본 가구 (항상 표시) -->
      <div id="furniture-bed"      class="room-item spr-bed"      style="right:8%; top:8%; z-index:6;"></div>
      <div id="furniture-wardrobe" class="room-item spr-wardrobe" style="right:2%; top:4%; z-index:5;"></div>
      <div id="furniture-sofa"     class="room-item spr-sofa"     style="left:14%; bottom:28%; z-index:9;"></div>

      <!-- 아이템 슬롯 (동적) -->
      <div id="room-slot-wall"   class="room-slot-target"></div>
      <div id="room-slot-floor"  class="room-slot-target"></div>
      <div id="room-slot-floor2" class="room-slot-target"></div>
      <div id="room-slot-floor3" class="room-slot-target"></div>

      <!-- 원근 그림자 -->
      <div id="room-left-shadow"></div>
      <div id="room-right-shadow"></div>

      <!-- 푸앙이 캐릭터 -->
      <div id="room-puang-char">🦎</div>
    </div>
  `;
}

// ── 아이템 렌더링 ──
window.applyRoomDecorations = function() {
  const scene = document.getElementById('puang-room-scene');
  if (!scene) return;

  const decos = playerStats.roomDecorations;

  // 1) 배경 테마
  scene.className = `theme-${decos.background || 'default'}`;

  // 2) 각 슬롯 렌더링
  renderSlot('wall',   decos.wall,   { right: '28%', top: '8%',     zIndex: 5 });
  renderSlot('floor',  decos.floor,  { left:  '30%', bottom: '22%', zIndex: 8 });
  renderSlot('floor2', decos.floor2, { left:  '16%', bottom: '20%', zIndex: 9 });
  renderSlot('floor3', decos.floor3, { right: '10%', bottom: '20%', zIndex: 9 });
}

function renderSlot(slotId, itemId, pos) {
  const el = document.getElementById(`room-slot-${slotId}`);
  if (!el) return;

  // 빈 슬롯이면 힌트 점선만
  if (!itemId) {
    el.className = 'room-slot-hint';
    el.innerHTML = '';
    Object.assign(el.style, {
      ...posToStyle(pos),
      width: '48px', height: '48px',
      zIndex: pos.zIndex || 5,
    });
    return;
  }

  const item = ROOM_ITEMS[itemId];
  if (!item) return;

  el.className = 'room-slot-target';
  el.innerHTML = '';
  Object.assign(el.style, posToStyle(pos));
  el.style.zIndex = pos.zIndex || 5;

  if (item.sprite && item.sprite !== 'none') {
    // 스프라이트 이미지 아이템
    const div = document.createElement('div');
    div.className = `room-item ${item.sprite}`;
    el.appendChild(div);
  } else {
    // 이모지 아이템 (스프라이트 없는 경우)
    const span = document.createElement('span');
    span.style.cssText = 'font-size:32px; filter:drop-shadow(0 3px 3px rgba(0,0,0,0.25));';
    span.textContent = item.emoji;
    el.appendChild(span);
  }
}

// ── 아이템 구매 ──
window.buyRoomItem = function(itemId) {
  const item = ROOM_ITEMS[itemId];
  if (!item) return false;

  // 이미 구매했는지 확인
  if (playerStats.ownedRoomItems.includes(itemId)) {
    addChatMessage('system', '이미 갖고 있는 아이템이에요!');
    return false;
  }

  // 다이아 확인
  if (playerStats.data < item.price) {
    addChatMessage('system', `💎가 부족해요! (필요: ${item.price}, 보유: ${playerStats.data})`);
    return false;
  }

  // 구매 처리
  playerStats.data -= item.price;
  playerStats.ownedRoomItems.push(itemId);
  addChatMessage('system', `${item.emoji} ${item.name}을(를) 구매했어요!`);
  updateMapStats();
  return true;
}

// ── 아이템 설치 ──
window.installRoomItem = function(itemId) {
  const item = ROOM_ITEMS[itemId];
  if (!item) return;

  if (!playerStats.ownedRoomItems.includes(itemId)) {
    addChatMessage('system', '먼저 구매해야 해요!');
    return;
  }

  if (item.slot === 'background') {
    playerStats.roomDecorations.background = item.theme;
  } else {
    playerStats.roomDecorations[item.slot] = itemId;
  }

  applyRoomDecorations();
  addChatMessage('system', `${item.emoji} ${item.name}을(를) 설치했어요!`);
}

// ── 상점 UI 렌더링 ──
window.renderRoomShop = function() {
  const owned = playerStats.ownedRoomItems;
  const installed = playerStats.roomDecorations;

  let html = `<div class="room-shop">`;
  html += `<div class="room-shop-header">🛒 방 꾸미기 상점 <span class="diamond-badge">💎 ${playerStats.data}</span></div>`;
  html += `<div class="room-shop-grid">`;

  for (const [id, item] of Object.entries(ROOM_ITEMS)) {
    const isOwned     = owned.includes(id);
    const isInstalled = Object.values(installed).includes(id) ||
                        (item.slot === 'background' && installed.background === item.theme);
    const canBuy      = !isOwned && playerStats.data >= item.price;

    html += `
      <div class="shop-item ${isOwned ? 'owned' : ''} ${isInstalled ? 'installed' : ''}">
        <div class="shop-item-emoji">${item.emoji}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="shop-item-price">💎 ${item.price}</div>
        <div class="shop-item-btns">
          ${!isOwned
            ? `<button onclick="buyRoomItem('${id}')" ${canBuy ? '' : 'disabled'}>구매</button>`
            : isInstalled
              ? `<button disabled>설치됨</button>`
              : `<button onclick="installRoomItem('${id}')">설치</button>`
          }
        </div>
      </div>`;
  }

  html += `</div></div>`;
  return html;
}

// ── 유틸 ──
function posToStyle(pos) {
  const style = {};
  if (pos.left   !== undefined) style.left   = pos.left;
  if (pos.right  !== undefined) style.right  = pos.right;
  if (pos.top    !== undefined) style.top    = pos.top;
  if (pos.bottom !== undefined) style.bottom = pos.bottom;
  style.position = 'absolute';
  return style;
}
