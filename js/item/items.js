// ================================================================
// items.js — 아이템 통합 메인 파일
// 반드시 다음 파일들이 먼저 로드된 후 실행되어야 합니다:
//   items_food.js / items_equip.js / items_deco.js
//   items_pet.js / items_costume.js
//
// 사용법:
//   ITEM_DB['food_001']          → 아이템 정의 조회
//   ITEM_DB.getByCategory('pet') → 카테고리별 필터
// ================================================================

(function buildItemDB() {
  // 모든 카테고리 파일 취합
  const sources = [
    window.ITEMS_FOOD,
    window.ITEMS_EQUIP,
    window.ITEMS_DECO,
    window.ITEMS_PET,
    window.ITEMS_PLAYER_COSTUME,
    window.ITEMS_PUANG_COSTUME,
  ];

  const db = {};
  for (const source of sources) {
    if (!source) { console.warn('[ITEM_DB] 누락된 아이템 소스:', source); continue; }
    Object.assign(db, source);
  }

  // ── 카테고리별 조회 헬퍼 ──
  db.getByCategory = function(category) {
    return Object.values(db).filter(
      item => typeof item === 'object' && item.category === category
    );
  };

  // ── id로 단건 조회 ──
  db.get = function(id) {
    return db[id] || null;
  };

  // ── 카테고리 목록 ──
  db.CATEGORIES = {
    food:            { label: '🍚 음식',       tab: 'food' },
    equip:           { label: '⚔️ 착용',       tab: 'equip' },
    deco:            { label: '🎨 꾸미기',      tab: 'deco' },
    pet:             { label: '🐾 펫',          tab: 'pet' },
    player_costume:  { label: '👤 플레이어',    tab: 'player_costume' },
    puang_costume:   { label: '🐨 푸앙이',      tab: 'puang_costume' },
  };

  window.ITEM_DB = db;

  // ── 총 아이템 수 로그 ──
  const total = Object.values(db).filter(v => typeof v === 'object' && v.id).length;
  console.log(`[ITEM_DB] 로드 완료 — 총 ${total}개 아이템`);
})();


// ================================================================
// 기존 코드 호환성 유지 — 구 STORE_ITEMS / ROOM_ITEMS 참조 대체
// locations.js, puang_room.js 수정 전 임시 브릿지
// ================================================================

// STORE_ITEMS 브릿지 (기존 코드가 STORE_ITEMS[id]를 참조하는 곳 대응)
window.STORE_ITEMS = new Proxy({}, {
  get(_, id) {
    const item = window.ITEM_DB?.[id];
    if (item) return { name: item.name, cost: item.price, clerk: '' };
    // 기존 하드코딩 아이템 폴백
    const legacy = {
      hp_potion:   { name: 'HP 포션',       cost: 5,  clerk: '체력 회복에 딱이죠~' },
      sp_potion:   { name: 'SP 포션',       cost: 4,  clerk: '집중력 포션이에요! 😊' },
      full_potion: { name: '풀 회복 포션',  cost: 15, clerk: '최고 인기 상품이에요! ✨' },
      dmg_boost:   { name: '데미지 부스터', cost: 8,  clerk: '전투 전에 꼭 챙겨가세요 💪' },
      shield:      { name: '방어막',        cost: 8,  clerk: '안전이 최우선이죠! 🛡️' },
      mem_potion:  { name: '기억력 포션',   cost: 10, clerk: '공부 전에 딱이에요! 🧠' },
      cloak:       { name: '투명 망토',     cost: 18, clerk: '이면세계 탐험가 필수템! 🫥' },
      charm:       { name: '청룡 부적',     cost: 12, clerk: '위기의 순간 지켜줘요 🧧' },
    };
    return legacy[id] || undefined;
  }
});

// ROOM_ITEMS 브릿지 (기존 puang_room.js가 ROOM_ITEMS[id]를 참조하는 곳 대응)
// puang_room.js를 ITEM_DB로 완전 교체하기 전까지 유지
window._ROOM_ITEMS_BRIDGE_ACTIVE = true;
