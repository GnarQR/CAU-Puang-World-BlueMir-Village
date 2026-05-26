// =============================================
// puang_room.js — 푸앙이의 방 (쿼터뷰)
// =============================================

// ── 아이템 데이터베이스 ──
// 구매 가능한 방 꾸미기 아이템 정의
const ROOM_ITEMS = {
  // ── 바닥 가구 (furniture sprite) ──
  'item_bed': {
    id: 'item_bed', slot: 'bed',
    imgFile: 'bed.png',
    name: '블루 체크 침대', emoji: '🛏️', price: 20,
    desc: '포근한 블루 체크 침대'
  },

  'item_desk': {
    id: 'item_desk', slot: 'desk',
    imgFile: 'desk.png',
    name: '달빛 컴퓨터 책상', emoji: '💻', price: 18,
    desc: '밤하늘 모니터가 있는 책상'
  },

  'item_carpet': {
    id: 'item_carpet', slot: 'carpet',
    imgFile: 'carpet.png',
    name: '블루 플로럴 카펫', emoji: '🟦', price: 12,
    desc: '꽃무늬 블루 카펫'
  },

  'item_bookshelf_small': {
    id: 'item_bookshelf_small', slot: 'bookshelf_small',
    imgFile: 'bookshelf_small.png',
    name: '작은 책장', emoji: '📚', price: 14,
    desc: '푸앙이 인형이 앉아있는 작은 책장'
  },

  'item_bookshelf_big': {
    id: 'item_bookshelf_big', slot: 'bookshelf_big',
    imgFile: 'bookshelf_big.png',
    name: '큰 책장', emoji: '📖', price: 22,
    desc: '책과 소품이 가득한 큰 책장'
  },

  'item_lamp': {
    id: 'item_lamp', slot: 'lamp',
    imgFile: 'lamp.png',
    name: '플로럴 스탠드 조명', emoji: '🌟', price: 10,
    desc: '꽃무늬 스탠드 조명'
  },

  'item_hanging_plant': {
    id: 'item_hanging_plant', slot: 'hanging_plant',
    imgFile: 'hanging_plant.png',
    name: '행잉 화분', emoji: '🪴', price: 8,
    desc: '천장에 매달린 행잉 화분'
  },
 
  // ── 벽 장식 (wall furniture sprite) ──
  'item_shelf_left': {
    id: 'item_shelf_left', slot: 'shelf_left',
    imgFile: 'shelf_left.png',
    name: '벽 선반 (왼쪽)', emoji: '🔖', price: 15,
    desc: '왼쪽 벽에 달린 책·화분 선반'
  },

  'item_shelf_right': {
    id: 'item_shelf_right', slot: 'shelf_right',
    imgFile: 'shelf_right.png',
    name: '벽 선반 (오른쪽)', emoji: '🔖', price: 15,
    desc: '오른쪽 벽에 달린 선반'
  },

  'item_painting_left': {
    id: 'item_painting_left', slot: 'painting_left',
    imgFile: 'painting_left.png',
    name: '달밤 액자 (왼쪽)', emoji: '🖼️', price: 10,
    desc: '왼쪽 벽의 달밤 그림 액자'
  },

  'item_painting_right': {
    id: 'item_painting_right', slot: 'painting_right',
    imgFile: 'painting_right.png',
    name: '꽃 액자 (오른쪽)', emoji: '🖼️', price: 10,
    desc: '오른쪽 벽의 꽃 그림 액자'
  },

  'item_wall_plant': {
    id: 'item_wall_plant', slot: 'wall_plant',
    imgFile: 'wall_plant.png',
    name: '벽 화분 장식', emoji: '🌿', price: 9,
    desc: '벽에 달린 식물 화분'
  },

  'item_hanging_deco': {
    id: 'item_hanging_deco', slot: 'hanging_deco',
    imgFile: 'hanging_deco.png',
    name: '행잉 장식', emoji: '✨', price: 11,
    desc: '달과 별 모양 행잉 장식'
  },

  'item_memo_poster': {
    id: 'item_memo_poster', slot: 'memo_poster',
    imgFile: 'memo_poster.png',
    name: '메모 포스터', emoji: '📌', price: 8,
    desc: '달밤 사진 & 메모 포스터'
  },

  'item_dreamcatcher': {
    id: 'item_dreamcatcher', slot: 'dreamcatcher',
    imgFile: 'dreamcatcher.png',
    name: '드림캐처', emoji: '🌙', price: 13,
    desc: '블루 드림캐처 장식'
  },

  // 이 밑은 아직 미구현 항목
  // 배경 테마 아이템 (background 슬롯)
  'item_night':    { id: 'item_night',   slot: 'background', theme: 'night',  name: '블루미르홀 야경 사진', emoji: '🌃', price: 13, desc: '방 야경 테마로 변경' },
  'item_sakura':   { id: 'item_sakura',  slot: 'background', theme: 'sakura', name: '캠퍼스 벚꽃 화분',    emoji: '🌸', price: 8,  desc: '방 봄 테마로 변경' },
  'item_dark':     { id: 'item_dark',    slot: 'background', theme: 'dark',   name: '이면 세계 암흑 결정', emoji: '🖤', price: 32, desc: '방 다크 테마로 변경' },

  // 벽 아이템 (wall 슬롯)
  'item_poster':   { id: 'item_poster',  slot: 'wall',   sprite: 'none',        name: '이면 세계 포스터',   emoji: '📜', price: 9,  desc: '벽 포스터 추가' },
  'item_painting': { id: 'item_painting',slot: 'wall',   sprite: 'none',        name: '청룡호 수채화',      emoji: '🖼️', price: 10, desc: '벽 그림 추가' },

  // 바닥 아이템 (floor 슬롯)
  // ★ 수정: 'item_carpet' / 'item_lamp' 키 중복으로 앞 정의가 덮어씌워지던 버그 수정
  //         미구현 항목이므로 키만 구분해두고 slot/sprite는 추후 확정
  'item_carpet_floor': { id: 'item_carpet_floor', slot: 'floor',  sprite: 'spr-carpet-blue', name: '푸앙이 발자국 카펫', emoji: '👣', price: 12, desc: '바닥 카펫 추가' },
  'item_plant':        { id: 'item_plant',         slot: 'floor2', sprite: 'spr-plant',       name: '캠퍼스 벚꽃 화분',  emoji: '🌿', price: 8,  desc: '화분 장식' },
  'item_lamp_floor':   { id: 'item_lamp_floor',    slot: 'floor3', sprite: 'spr-lamp',        name: '별빛 조명',         emoji: '🌟', price: 7,  desc: '방 조명 변경' },

  // 특수 가구 (furniture 슬롯) — 기본 배치됨
  // 추후 추가용: 'item_tank', 'item_doll' 등

  // ★ wall2 슬롯 아이템
  'item_tank':   { id: 'item_tank',   slot: 'wall2',  sprite: 'none', name: '청룡 어항',       emoji: '🐠', price: 14, desc: '벽 오른쪽 어항 장식' },
  'item_doll':   { id: 'item_doll',   slot: 'wall2',  sprite: 'none', name: '푸앙이 인형',     emoji: '🧸', price: 11, desc: '벽 오른쪽 인형 장식' },
  'item_trophy': { id: 'item_trophy', slot: 'wall2',  sprite: 'none', name: '이면세계 트로피', emoji: '🏆', price: 18, desc: '전투 승리 기념 트로피' },

  // ★ 코스튬 스킨 아이템 (푸앙이 캐릭터 변경)
  'skin_cat':    { id: 'skin_cat',    slot: 'costume', sprite: 'none', name: '고양이 코스튬',   emoji: '🐱', price: 20, desc: '푸앙이 → 고양이로 변신!' },
  'skin_dragon': { id: 'skin_dragon', slot: 'costume', sprite: 'none', name: '청룡 코스튬',     emoji: '🐲', price: 25, desc: '푸앙이 → 청룡으로 변신!' },
  'skin_robot':  { id: 'skin_robot',  slot: 'costume', sprite: 'none', name: '이면세계 로봇',   emoji: '🤖', price: 22, desc: '이면세계 로봇 코스튬' },
};

// ── 아이템 렌더링 ──
window.applyRoomDecorations = function() {
  const scene = document.getElementById('puang-room-scene');
  if (!scene) return;
 
  const decos = playerStats.roomDecorations || {};
 
  // 1) 배경 테마
  scene.className = `theme-${decos.background || 'default'}`;
 
  // 2) 모든 슬롯 렌더링
  Object.keys(ROOM_ITEMS).forEach(itemId => {
    const item = ROOM_ITEMS[itemId];
    if (item.slot === 'background') return;
    renderSlot(item.slot, decos[item.slot] === itemId ? itemId : null);
  });
 
  // 3) 코스튬
  // room-puang-char: 쿼터뷰 방 안 캐릭터 (80×80)
  const charEl = document.getElementById('room-puang-char');
  if (charEl) {
    const costumeId = decos.costume;
    // ITEM_DB에서 imgFile 조회 (items_costume.js의 puang_costume 아이템)
    const costumeItem = costumeId && window.ITEM_DB ? window.ITEM_DB.get(costumeId) : null;

    if (costumeItem && costumeItem.imgFile) {
      // 새 코스튬 시스템: imgFile 이미지로 교체
      charEl.innerHTML = '<img src="' + costumeItem.imgFile + '" alt="' + costumeItem.name + '" style="width:80px;height:80px;object-fit:contain;" onerror="this.src=\'images/puang/puang_normal.png\'">';
    } else if (!costumeId) {
      // 코스튬 없으면 기본 이미지
      charEl.innerHTML = '<img src="images/puang/puang_normal.png" alt="푸앙이" style="width:80px;height:80px;object-fit:contain;">';
    }
    // costumeId 있지만 ITEM_DB 미로드면 그대로 유지
  }
};
 
function renderSlot(slotId, itemId) {
  const el = document.getElementById(`room-slot-${slotId}`);
  if (!el) return;
 
  if (!itemId) {  // 빈 슬롯 — 점선 힌트 복원
    el.className = 'room-slot-hint';
    el.style.backgroundImage = '';
    el.style.backgroundColor = '';
    el.innerHTML = '';
    return;
  }
 
  const item = ROOM_ITEMS[itemId];
  if (!item || !item.imgFile) return;
 
  // 슬롯 div 위치/크기(인라인 style)는 유지, img 태그로 표시
  el.className = 'room-slot-filled';
  el.style.backgroundImage = '';
  el.style.backgroundColor = 'transparent';
  
  // 완성본 방향(좌향)에 맞게 좌우 반전할 가구 모음
  const flipStyle = (['bed', 'shelf_right', 'memo_poster', 'dreamcatcher'].includes(slotId)) ? 'transform:scaleX(-1);' : '';
  
  
  el.innerHTML = `<img
    src="images/furniture/${item.imgFile}"
    alt="${item.name}"
    style="width:100%;height:100%;object-fit:contain;pointer-events:none;${flipStyle}"
    draggable="false"
  >`;
}

// ── 아이템 구매 ──
window.buyRoomItem = function(itemId) {
  const item = ROOM_ITEMS[itemId];
  if (!item) return false;
 
  if (playerStats.ownedRoomItems.includes(itemId)) {
    addChatMsg('puang', '이미 갖고 있는 아이템이에요 푸앙~');
    return false;
  }
  if (playerStats.data < item.price) {
    addChatMsg('puang', `💎가 부족해요 푸앙! (필요: ${item.price}, 보유: ${playerStats.data})`);
    return false;
  }
 
  playerStats.data -= item.price;
  playerStats.ownedRoomItems.push(itemId);
  // 구매 즉시 자동 설치
  installRoomItem(itemId);
  saveAllDataToServer();
  updateMapStats();
  return true;
};
 
// ── 아이템 설치 ──
window.installRoomItem = function(itemId) {
  const item = ROOM_ITEMS[itemId];
  if (!item) return;
  if (!playerStats.ownedRoomItems.includes(itemId)) return;
 
  if (!playerStats.roomDecorations) playerStats.roomDecorations = {};
 
  if (item.slot === 'background') {
    playerStats.roomDecorations.background = item.theme;
  } else if (item.slot === 'costume') {
    playerStats.roomDecorations.costume = itemId;
  } else {
    playerStats.roomDecorations[item.slot] = itemId;
  }
 
  applyRoomDecorations();
};

// ── 상점 UI 렌더링 ──
window.renderRoomShop = function() {
  const owned    = playerStats.ownedRoomItems || [];
  const installed = playerStats.roomDecorations || {};
 
  // 카테고리별 분류
  const categories = {
    '🛏️ 가구': ['item_bed','item_desk','item_carpet','item_bookshelf_small','item_bookshelf_big','item_lamp','item_hanging_plant'],
    '🖼️ 벽 장식': ['item_shelf_left','item_shelf_right','item_painting_left','item_painting_right','item_wall_plant','item_hanging_deco','item_memo_poster','item_dreamcatcher'],
    '🎨 배경 테마': ['item_night','item_sakura','item_dark'],
  };
 
  let html = `<div class="room-shop">`;
  html += `<div class="room-shop-header">🛒 방 꾸미기 상점 <span class="diamond-badge">💎 ${playerStats.data}</span></div>`;
 
  for (const [catName, ids] of Object.entries(categories)) {
    html += `<div class="shop-category-title">${catName}</div>`;
    html += `<div class="room-shop-grid">`;
 
    for (const id of ids) {
      const item = ROOM_ITEMS[id];
      if (!item) continue;
      const isOwned     = owned.includes(id);
      const isInstalled = installed[item.slot] === id ||
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
    html += `</div>`;
  }
 
  html += `</div>`;
  return html;
};
 
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

// ================================================================
// ★ Fix #1 #2 #11 설명 (아래 블록은 원본 그대로 유지):
//   원본의 /* ... */ 안에 있는 코드는 구버전 중복 정의입니다.
//   이미 주석 처리되어 실행되지 않으므로 버그에 영향 없습니다.
//   실제 수정은 위쪽 첫 번째 buyRoomItem/installRoomItem 정의에서 완료됐습니다:
//     - addChatMsg() 사용 (addChatMessage 미정의 오류 없음)
//     - saveAllDataToServer() 포함 (구매 후 Firebase 저장)
// ================================================================

/*
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
  } else if (item.slot === 'costume') {
    playerStats.roomDecorations.costume = itemId; // ★ 코스튬 저장
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
*/