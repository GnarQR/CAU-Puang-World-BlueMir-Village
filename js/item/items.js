// ================================================================
// items.js — 아이템 통합 메인
// 로드 순서: items_food → items_equip → items_deco → items_pet → items_costume → items.js
// ================================================================

(function buildItemDB() {
  const sources = [
    window.ITEMS_FOOD,
    window.ITEMS_EQUIP,
    window.ITEMS_DECO,
    window.ITEMS_PET,
    window.ITEMS_PLAYER_COSTUME,
    window.ITEMS_PUANG_COSTUME,
  ];

  const db = {};
  sources.forEach(src => {
    if (!src) { console.warn('[ITEM_DB] 누락된 소스'); return; }
    Object.assign(db, src);
  });

  // ── id로 조회 ──
  db.get = function(id) { return db[id] || null; };

  // ── 카테고리 필터 ──
  db.getByCategory = function(cat) {
    return Object.values(db).filter(v => v && typeof v === 'object' && v.category === cat);
  };

  // ── 카테고리 메타 ──
  db.CATEGORIES = [
    { key: 'food',           label: '🍚 음식',      desc: '즉시 사용, HP/SP 회복' },
    { key: 'equip',          label: '⚔️ 착용',      desc: '장착하면 패시브 효과' },
    { key: 'deco',           label: '🎨 꾸미기',     desc: '푸앙이 방 꾸미기' },
    { key: 'pet',            label: '🐾 펫',         desc: '동행 펫, 패시브 효과' },
    { key: 'player_costume', label: '👤 플레이어',   desc: '플레이어 외형 변경' },
    { key: 'puang_costume',  label: '🐨 푸앙이',     desc: '푸앙이 코스튬 변경' },
  ];

  window.ITEM_DB = db;

  // ── 기존 STORE_ITEMS 완전 대체 ──
  // locations.js의 STORE_ITEMS[id].name / .cost / .clerk 참조를 그대로 지원
  window.STORE_ITEMS = new Proxy({}, {
    get(_, id) {
      const item = window.ITEM_DB[id];
      if (!item) return undefined;
      return {
        name:  item.name,
        cost:  item.price,
        clerk: item.clerk || '',
        icon:  item.icon,
        desc:  item.desc,
      };
    }
  });

  const total = Object.values(db).filter(v => v && v.id).length;
  console.log(`[ITEM_DB] 로드 완료 — 총 ${total}개`);
})();
