// ================================================================
// items_pet.js — 펫 아이템 (40개)
// category: 'pet'
// 한 번에 하나만 동행 가능, 장착 즉시 패시브 적용
// rarity: 'common' | 'rare' | 'epic' | 'legendary'
// ================================================================

window.ITEMS_PET = {
  // ── 🩶 일반 (15개) ──
  pet_001: {
    id: 'pet_001', category: 'pet', rarity: 'common',
    name: '캠퍼스 고양이', icon: '🐱', price: 5,
    desc: '데이터 조각 +1 (매일)',
    effect: { daily_data: 1 },
  },
  pet_002: {
    id: 'pet_002', category: 'pet', rarity: 'common',
    name: '잔디밭 강아지', icon: '🐶', price: 5,
    desc: '호감도 +1 (매일)',
    effect: { daily_favor: 1 },
  },
  pet_003: {
    id: 'pet_003', category: 'pet', rarity: 'common',
    name: '도서관 햄스터', icon: '🐹', price: 8,
    desc: '도서관 공부 시간 -0.5초',
    effect: { lib_time: -0.5 },
  },
  pet_004: {
    id: 'pet_004', category: 'pet', rarity: 'common',
    name: '블루미르 토끼', icon: '🐰', price: 8,
    desc: 'HP +5 (매 전투 시작)',
    effect: { battle_start_hp: 5 },
  },
  pet_005: {
    id: 'pet_005', category: 'pet', rarity: 'common',
    name: '캠퍼스 병아리', icon: '🐤', price: 6,
    desc: '축제 보상 +10%',
    effect: { festival_reward_pct: 10 },
  },
  pet_006: {
    id: 'pet_006', category: 'pet', rarity: 'common',
    name: '청룡호 금붕어', icon: '🐠', price: 7,
    desc: 'SP +3 (매일)',
    effect: { daily_sp: 3 },
  },
  pet_007: {
    id: 'pet_007', category: 'pet', rarity: 'common',
    name: '청룡산 고슴도치', icon: '🦔', price: 10,
    desc: '피해 감소 2%',
    effect: { dmg_reduce_pct: 2 },
  },
  pet_008: {
    id: 'pet_008', category: 'pet', rarity: 'common',
    name: '학생처 거북이', icon: '🐢', price: 10,
    desc: '의무실 무료 횟수 +1',
    effect: { clinic_free: 1 },
  },
  pet_009: {
    id: 'pet_009', category: 'pet', rarity: 'common',
    name: '옥상 참새', icon: '🐦', price: 6,
    desc: '이동 SP 소모 -5%',
    effect: { move_sp_cost_pct: -5 },
  },
  pet_010: {
    id: 'pet_010', category: 'pet', rarity: 'common',
    name: '봄 캠퍼스 나비', icon: '🦋', price: 8,
    desc: '호감도 +2 (푸앙이 방 입장 시)',
    effect: { room_enter_favor: 2 },
  },
  pet_011: {
    id: 'pet_011', category: 'pet', rarity: 'common',
    name: '이면 세계 애벌레', icon: '🐛', price: 7,
    desc: '도서관 집중력 감소 -5%',
    effect: { lib_focus_decay_pct: -5 },
  },
  pet_012: {
    id: 'pet_012', category: 'pet', rarity: 'common',
    name: '공대 도마뱀', icon: '🦎', price: 9,
    desc: '실험실 제조 비용 -1',
    effect: { lab2_cost: -1 },
  },
  pet_013: {
    id: 'pet_013', category: 'pet', rarity: 'common',
    name: '청룡탕 개구리', icon: '🐸', price: 7,
    desc: 'SP +2 (매 전투 시작)',
    effect: { battle_start_sp: 2 },
  },
  pet_014: {
    id: 'pet_014', category: 'pet', rarity: 'common',
    name: '학식당 쥐', icon: '🐭', price: 8,
    desc: '학생식당 가격 -1',
    effect: { cafeteria_cost: -1 },
  },
  pet_015: {
    id: 'pet_015', category: 'pet', rarity: 'common',
    name: '이면 세계 귀뚜라미', icon: '🦗', price: 6,
    desc: '전투 턴 시작 시 SP +1',
    effect: { sp_regen_per_turn: 1 },
  },

  // ── 💙 레어 (15개) ──
  pet_016: {
    id: 'pet_016', category: 'pet', rarity: 'rare',
    name: '310관 여우', icon: '🦊', price: 20,
    desc: '전투 데미지 +4',
    effect: { battle_dmg: 4 },
  },
  pet_017: {
    id: 'pet_017', category: 'pet', rarity: 'rare',
    name: '청룡산 늑대', icon: '🐺', price: 25,
    desc: '보스 HP -5%',
    effect: { boss_hp_pct: -5 },
  },
  pet_018: {
    id: 'pet_018', category: 'pet', rarity: 'rare',
    name: '캠퍼스 독수리', icon: '🦅', price: 22,
    desc: '전투 회피율 +8%',
    effect: { dodge_pct: 8 },
  },
  pet_019: {
    id: 'pet_019', category: 'pet', rarity: 'rare',
    name: '청룡탕 돌고래', icon: '🐬', price: 25,
    desc: 'SP 자동 회복 +2 (매 턴)',
    effect: { sp_regen_per_turn: 2 },
  },
  pet_020: {
    id: 'pet_020', category: 'pet', rarity: 'rare',
    name: '학생회관 사자', icon: '🦁', price: 28,
    desc: '전투 데미지 +6 · 피해 +3',
    effect: { battle_dmg: 6, dmg_taken: 3 },
  },
  pet_021: {
    id: 'pet_021', category: 'pet', rarity: 'rare',
    name: '도서관 판다', icon: '🐼', price: 22,
    desc: '도서관 보상 +3',
    effect: { lib_reward: 3 },
  },
  pet_022: {
    id: 'pet_022', category: 'pet', rarity: 'rare',
    name: '분수대 홍학', icon: '🦩', price: 24,
    desc: '호감도 +5 (매일)',
    effect: { daily_favor: 5 },
  },
  pet_023: {
    id: 'pet_023', category: 'pet', rarity: 'rare',
    name: '의무실 코알라', icon: '🐨', price: 26,
    desc: 'HP 자동 회복 +3 (매 턴)',
    effect: { hp_regen_per_turn: 3 },
  },
  pet_024: {
    id: 'pet_024', category: 'pet', rarity: 'rare',
    name: '캠퍼스 기린', icon: '🦒', price: 23,
    desc: '체육관 훈련 효율 +30%',
    effect: { gym_efficiency_pct: 30 },
  },
  pet_025: {
    id: 'pet_025', category: 'pet', rarity: 'rare',
    name: '이면 세계 펭귄', icon: '🐧', price: 30,
    desc: '데이터 조각 +3 (매일)',
    effect: { daily_data: 3 },
  },
  pet_026: {
    id: 'pet_026', category: 'pet', rarity: 'rare',
    name: '중앙광장 너구리', icon: '🦝', price: 21,
    desc: '축제 보상 +25%',
    effect: { festival_reward_pct: 25 },
  },
  pet_027: {
    id: 'pet_027', category: 'pet', rarity: 'rare',
    name: '체육관 캥거루', icon: '🦘', price: 24,
    desc: '체육관 체력 소모 -20%',
    effect: { gym_hp_cost_pct: -20 },
  },
  pet_028: {
    id: 'pet_028', category: 'pet', rarity: 'rare',
    name: '청룡산 곰', icon: '🐻', price: 27,
    desc: '최대 HP +15',
    effect: { max_hp: 15 },
  },
  pet_029: {
    id: 'pet_029', category: 'pet', rarity: 'rare',
    name: '310관 앵무새', icon: '🦜', price: 22,
    desc: '퀴즈 정답 보상 +5',
    effect: { quiz_reward: 5 },
  },
  pet_030: {
    id: 'pet_030', category: 'pet', rarity: 'rare',
    name: '학식당 젖소', icon: '🐮', price: 25,
    desc: 'HP 회복 아이템 효과 +20%',
    effect: { hp_item_pct: 20 },
  },

  // ── 💜 에픽 (6개) ──
  pet_031: {
    id: 'pet_031', category: 'pet', rarity: 'epic',
    name: '블루미르 유니콘', icon: '🦄', price: 40,
    desc: '모든 스탯 +8%',
    effect: { all_stat_pct: 8 },
  },
  pet_032: {
    id: 'pet_032', category: 'pet', rarity: 'epic',
    name: '이면 세계 미니 드래곤', icon: '🐉', price: 50,
    desc: '전투 데미지 +10 · HP +20',
    effect: { battle_dmg: 10, max_hp: 20 },
  },
  pet_033: {
    id: 'pet_033', category: 'pet', rarity: 'epic',
    name: '청룡 환상 새', icon: '🦤', price: 45,
    desc: '축제 모든 보상 2배',
    effect: { festival_reward_multiplier: 2 },
  },
  pet_034: {
    id: 'pet_034', category: 'pet', rarity: 'epic',
    name: '캠퍼스 공작새', icon: '🦚', price: 55,
    desc: '호감도 +10 · 모든 장식 효과 +10%',
    effect: { favor: 10, deco_effect_pct: 10 },
  },
  pet_035: {
    id: 'pet_035', category: 'pet', rarity: 'epic',
    name: '청룡호 물범', icon: '🦭', price: 60,
    desc: '도서관·실험실·체육관 보상 +20%',
    effect: { study_reward_pct: 20 },
  },
  pet_036: {
    id: 'pet_036', category: 'pet', rarity: 'epic',
    name: '청룡호 상어', icon: '🦈', price: 58,
    desc: '보스 전투 데미지 +20%',
    effect: { boss_dmg_pct: 20 },
  },

  // ── 🧡 전설 (4개) ──
  pet_037: {
    id: 'pet_037', category: 'pet', rarity: 'legendary',
    name: '청룡의 불꽃 악어', icon: '🐊', price: 75,
    desc: '모든 스탯 +15% · 전투 데미지 +15',
    effect: { all_stat_pct: 15, battle_dmg: 15 },
  },
  pet_038: {
    id: 'pet_038', category: 'pet', rarity: 'legendary',
    name: '별빛 백호', icon: '🐯', price: 80,
    desc: '크리티컬 확률 +25% · HP +30',
    effect: { crit_pct: 25, max_hp: 30 },
  },
  pet_039: {
    id: 'pet_039', category: 'pet', rarity: 'legendary',
    name: '이면 세계 달의 정령', icon: '🌙', price: 90,
    desc: '모든 장소 보상 +30%',
    effect: { all_place_reward_pct: 30 },
  },
  pet_040: {
    id: 'pet_040', category: 'pet', rarity: 'legendary',
    name: '푸앙이의 분신', icon: '🌈', price: 99,
    desc: '모든 효과 +20% · 호감도 매일 +10',
    effect: { all_effect_pct: 20, daily_favor: 10 },
  },
};
