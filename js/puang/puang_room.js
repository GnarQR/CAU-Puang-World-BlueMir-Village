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
 
  if (!itemId) {  // 빈 슬롯 — 이미 비어있으면 스킵 (불필요한 DOM 조작 방지)
    if (el.dataset.renderedItem) {
      delete el.dataset.renderedItem;
      el.className = 'room-slot-hint';
      el.innerHTML = '';
    }
    return;
  }
 
  const item = ROOM_ITEMS[itemId];
  if (!item || !item.imgFile) return;
 
  // 이미 같은 아이템이 렌더돼있으면 스킵 — 재장전으로 인한 이미지 깜박임 방지
  if (el.dataset.renderedItem === itemId) return;
  el.dataset.renderedItem = itemId;

  el.className = 'room-slot-filled';

  
  // 완성본 방향(좌향)에 맞게 좌우 반전할 가구 모음
  const flipStyle = (['bed', 'shelf_right', 'memo_poster', 'dreamcatcher'].includes(slotId))
   ? 'transform:scaleX(-1);' : '';
  
  el.innerHTML = `<img
    src="images/furniture/${item.imgFile}"
    alt="${item.name}"
    style="width:100%;height:100%;object-fit:contain;pointer-events:none;${flipStyle}"
    draggable="false"
  >`;
}

// 아이템 가게 UI 열기
window.openRoomShop = function() {
  const modal = document.getElementById('room-shop-modal');
  const content = document.getElementById('room-shop-content');
  if (!modal || !content) return;
  content.innerHTML = renderRoomShop();
  modal.style.display = 'flex';
  // 바깥 클릭 시 닫기
  modal.onclick = (e) => { if (e.target === modal) closeRoomShop(); };
};

// 아이템 가게 UI 닫기
window.closeRoomShop = function() {
  const modal = document.getElementById('room-shop-modal');
  if (modal) modal.style.display = 'none';
};

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

  // ★ 상점 UI 실시간 갱신
  const content = document.getElementById('room-shop-content');
  if (content) content.innerHTML = renderRoomShop();

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
  const owned     = playerStats.ownedRoomItems || [];
  const installed = playerStats.roomDecorations || {};

  const categories = {
    '🛏️ 가구':    ['item_bed','item_desk','item_carpet','item_bookshelf_small','item_bookshelf_big','item_lamp','item_hanging_plant'],
    '🖼️ 벽 장식': ['item_shelf_left','item_shelf_right','item_painting_left','item_painting_right','item_wall_plant','item_hanging_deco','item_memo_poster','item_dreamcatcher'],
    '🎨 배경 테마': ['item_night','item_sakura','item_dark'],
  };

  let html = `
    <div style="padding:4px 0 16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div>
          <div style="font-size:11px;letter-spacing:2px;color:#2a3a5a;margin-bottom:4px;">블루미르홀</div>
          <div style="font-size:20px;font-weight:800;color:#e0e0e0;">🛒 방 꾸미기 상점</div>
        </div>
        <div style="background:rgba(93,202,165,.15);border:1px solid #5dcaa5;border-radius:20px;padding:6px 14px;font-size:13px;color:#5dcaa5;font-weight:700;">
          💎 ${playerStats.data} 보유
        </div>
      </div>`;

  for (const [catName, ids] of Object.entries(categories)) {
    html += `<div style="font-size:12px;font-weight:700;color:#5dcaa5;letter-spacing:1px;margin:16px 0 10px;padding-bottom:6px;border-bottom:1px solid #0f3460;">${catName}</div>`;
    html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">`;

    for (const id of ids) {
      const item = ROOM_ITEMS[id];
      if (!item) continue;
      const isOwned     = owned.includes(id);
      const isInstalled = installed[item.slot] === id ||
                          (item.slot === 'background' && installed.background === item.theme);
      const canBuy      = !isOwned && playerStats.data >= item.price;

      const cardBorder = isInstalled ? '#5dcaa5' : isOwned ? '#1e3a5a' : '#0f3460';
      const cardBg     = isInstalled ? 'rgba(93,202,165,.08)' : 'rgba(10,14,26,.8)';

      let btnHtml = '';
      if (!isOwned) {
        btnHtml = `<button onclick="buyRoomItem('${id}')" ${canBuy ? '' : 'disabled'}
          style="width:100%;padding:6px 0;border-radius:6px;font-size:12px;font-weight:700;
          cursor:${canBuy ? 'pointer' : 'default'};
          background:${canBuy ? 'rgba(93,202,165,.2)' : 'rgba(22,22,22,.5)'};
          border:1px solid ${canBuy ? '#5dcaa5' : '#1a1a2e'};
          color:${canBuy ? '#5dcaa5' : '#2a2a4a'};">
          💎 ${item.price} 구매
        </button>`;
      } else if (isInstalled) {
        btnHtml = `<button disabled style="width:100%;padding:6px 0;border-radius:6px;font-size:12px;
          background:rgba(93,202,165,.1);border:1px solid #5dcaa5;color:#5dcaa5;">✅ 설치됨</button>`;
      } else {
        btnHtml = `<button onclick="installRoomItem('${id}')"
          style="width:100%;padding:6px 0;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;
          background:rgba(93,162,255,.15);border:1px solid #3a6abf;color:#a0c4ff;">설치하기</button>`;
      }

      const imgSrc = item.imgFile ? `images/furniture/${item.imgFile}` : null;
      const imgHtml = imgSrc
        ? `<img src="${imgSrc}" style="width:80px;height:80px;object-fit:contain;image-rendering:pixelated;"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
           <div style="display:none;font-size:36px;line-height:80px;">${item.emoji}</div>`
        : `<div style="font-size:36px;line-height:80px;">${item.emoji}</div>`;

      html += `
        <div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:12px;
          padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px;">
          <div style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;
            background:rgba(22,33,62,.6);border-radius:8px;overflow:hidden;">
            ${imgHtml}
          </div>
          <div style="text-align:center;">
            <div style="font-size:13px;font-weight:700;color:#e0e0e0;margin-bottom:2px;">${item.name}</div>
            <div style="font-size:10px;color:#6c8ebf;line-height:1.4;">${item.desc}</div>
          </div>
          ${btnHtml}
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