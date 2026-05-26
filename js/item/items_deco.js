// ================================================================
// items_deco.js — 꾸미기 아이템 (50개)
// category: 'deco'
// 블루미르홀 푸앙이 방 꾸미기 전용
// slot: 배치될 방 슬롯 위치
// ================================================================

window.ITEMS_DECO = {
  deco_001: {
    id: 'deco_001', category: 'deco',
    name: '블루미르 깃발', icon: '🚩', price: 5,
    slot: 'wall', desc: '방 배경 변경',
  },
  deco_002: {
    id: 'deco_002', category: 'deco',
    name: '푸앙이 인형', icon: '🧸', price: 8,
    slot: 'shelf', desc: '방 장식 추가',
  },
  deco_003: {
    id: 'deco_003', category: 'deco',
    name: '중앙대 현수막', icon: '🎌', price: 6,
    slot: 'wall', desc: '방 분위기 변경',
  },
  deco_004: {
    id: 'deco_004', category: 'deco',
    name: '청룡호 수채화', icon: '🖼️', price: 10,
    slot: 'painting_left', desc: '방 벽 꾸미기',
  },
  deco_005: {
    id: 'deco_005', category: 'deco',
    name: '별빛 조명', icon: '🌟', price: 7,
    slot: 'lamp', desc: '방 조명 변경',
  },
  deco_006: {
    id: 'deco_006', category: 'deco',
    name: '이면 세계 포스터', icon: '📜', price: 9,
    slot: 'memo_poster', desc: '방 포스터 추가',
  },
  deco_007: {
    id: 'deco_007', category: 'deco',
    name: '중앙대 교기', icon: '🏴', price: 12,
    slot: 'wall', desc: '방 특별 배경',
  },
  deco_008: {
    id: 'deco_008', category: 'deco',
    name: '푸앙이 달력', icon: '📅', price: 15,
    slot: 'wall2', desc: '일일 보너스 활성화',
    effect: { daily_bonus: true },
  },
  deco_009: {
    id: 'deco_009', category: 'deco',
    name: '블루미르 수족관', icon: '🐠', price: 20,
    slot: 'wall2', desc: '방에 물고기 장식',
  },
  deco_010: {
    id: 'deco_010', category: 'deco',
    name: '응원 현수막', icon: '🎊', price: 10,
    slot: 'wall', desc: '전투 사기 +5%',
    effect: { battle_morale_pct: 5 },
  },
  deco_011: {
    id: 'deco_011', category: 'deco',
    name: '캠퍼스 벚꽃 화분', icon: '🌸', price: 8,
    slot: 'hanging_plant', theme: 'sakura', desc: '방 봄 테마',
  },
  deco_012: {
    id: 'deco_012', category: 'deco',
    name: '청룡 조각상', icon: '🗿', price: 18,
    slot: 'floor', desc: '방 위엄 UP',
  },
  deco_013: {
    id: 'deco_013', category: 'deco',
    name: '중앙대 시계탑 미니어처', icon: '🕰️', price: 14,
    slot: 'shelf', desc: '방 클래식 테마',
  },
  deco_014: {
    id: 'deco_014', category: 'deco',
    name: '이면 세계 수정구', icon: '🔮', price: 16,
    slot: 'shelf', desc: '방 신비 테마',
  },
  deco_015: {
    id: 'deco_015', category: 'deco',
    name: '푸앙이 사진액자', icon: '🪞', price: 10,
    slot: 'painting_right', desc: '호감도 +3 (장식)',
    effect: { favor: 3 },
  },
  deco_016: {
    id: 'deco_016', category: 'deco',
    name: '캠퍼스 지도 액자', icon: '🗾', price: 12,
    slot: 'painting_left', desc: '방 탐험가 테마',
  },
  deco_017: {
    id: 'deco_017', category: 'deco',
    name: '청룡산 풍경화', icon: '🏔️', price: 11,
    slot: 'painting_left', desc: '방 자연 테마',
  },
  deco_018: {
    id: 'deco_018', category: 'deco',
    name: '블루미르홀 야경 사진', icon: '🌃', price: 13,
    slot: 'background', theme: 'night', desc: '방 야경 테마',
  },
  deco_019: {
    id: 'deco_019', category: 'deco',
    name: '중앙대 졸업 앨범', icon: '📸', price: 15,
    slot: 'shelf', desc: '방 추억 테마',
  },
  deco_020: {
    id: 'deco_020', category: 'deco',
    name: '이면 세계 지도', icon: '🧭', price: 20,
    slot: 'wall', desc: '새 던전 힌트 제공',
    effect: { dungeon_hint: true },
  },
  deco_021: {
    id: 'deco_021', category: 'deco',
    name: '반짝이 커튼', icon: '🌠', price: 9,
    slot: 'wall', desc: '방 화려 테마',
  },
  deco_022: {
    id: 'deco_022', category: 'deco',
    name: '푸앙이 봉제인형 세트', icon: '🐲', price: 22,
    slot: 'shelf', desc: '방 귀여운 테마',
  },
  deco_023: {
    id: 'deco_023', category: 'deco',
    name: '캠퍼스 가로등 미니어처', icon: '🪔', price: 14,
    slot: 'lamp', desc: '방 빈티지 조명',
  },
  deco_024: {
    id: 'deco_024', category: 'deco',
    name: '청룡 깃발 세트', icon: '🎏', price: 16,
    slot: 'wall', desc: '방 전통 테마',
  },
  deco_025: {
    id: 'deco_025', category: 'deco',
    name: '이면 세계 균열 장식', icon: '💠', price: 18,
    slot: 'wall', theme: 'dark', desc: '방 이면 테마',
  },
  deco_026: {
    id: 'deco_026', category: 'deco',
    name: '중앙대 트로피', icon: '🏆', price: 20,
    slot: 'wall2', desc: '방 명예 테마',
  },
  deco_027: {
    id: 'deco_027', category: 'deco',
    name: '별자리 천장 장식', icon: '🌌', price: 17,
    slot: 'hanging_deco', desc: '방 우주 테마',
  },
  deco_028: {
    id: 'deco_028', category: 'deco',
    name: '푸앙이 발자국 카펫', icon: '👣', price: 12,
    slot: 'carpet', desc: '방 바닥 꾸미기',
  },
  deco_029: {
    id: 'deco_029', category: 'deco',
    name: '중앙대 문장 방패', icon: '🔵', price: 15,
    slot: 'wall', desc: '방 공식 테마',
  },
  deco_030: {
    id: 'deco_030', category: 'deco',
    name: '청룡탕 미니어처', icon: '🏊', price: 13,
    slot: 'shelf', desc: '방 여름 테마',
  },
  deco_031: {
    id: 'deco_031', category: 'deco',
    name: '이면 세계 버그 표본', icon: '🔬', price: 11,
    slot: 'shelf', desc: '방 연구자 테마',
  },
  deco_032: {
    id: 'deco_032', category: 'deco',
    name: '공대 로봇 피규어', icon: '🦾', price: 16,
    slot: 'shelf', desc: '방 공학 테마',
  },
  deco_033: {
    id: 'deco_033', category: 'deco',
    name: '도서관 미니어처 책장', icon: '🗂️', price: 14,
    slot: 'bookshelf_small', desc: '방 학구 테마',
  },
  deco_034: {
    id: 'deco_034', category: 'deco',
    name: '캠퍼스 분수대 피규어', icon: '⛲', price: 18,
    slot: 'floor', desc: '방 중앙 광장 테마',
  },
  deco_035: {
    id: 'deco_035', category: 'deco',
    name: '청룡 이무기 피규어', icon: '🐍', price: 22,
    slot: 'floor', desc: '방 전설 테마',
  },
  deco_036: {
    id: 'deco_036', category: 'deco',
    name: '이면 세계 달 장식', icon: '🌕', price: 15,
    slot: 'hanging_deco', desc: '방 밤 테마',
  },
  deco_037: {
    id: 'deco_037', category: 'deco',
    name: '푸앙이 생일 파티 세트', icon: '🎉', price: 20,
    slot: 'wall', desc: '방 파티 테마',
  },
  deco_038: {
    id: 'deco_038', category: 'deco',
    name: '중앙대 벽돌 장식', icon: '🧱', price: 10,
    slot: 'wall', desc: '방 고딕 테마',
  },
  deco_039: {
    id: 'deco_039', category: 'deco',
    name: '청룡 불꽃 장식', icon: '🔥', price: 17,
    slot: 'wall', desc: '방 열정 테마',
  },
  deco_040: {
    id: 'deco_040', category: 'deco',
    name: '이면 세계 포탈 미니어처', icon: '🌀', price: 25,
    slot: 'floor', desc: '방 포탈 테마',
  },
  deco_041: {
    id: 'deco_041', category: 'deco',
    name: '학식 메뉴판 액자', icon: '🪧', price: 8,
    slot: 'wall', desc: '방 맛집 테마',
  },
  deco_042: {
    id: 'deco_042', category: 'deco',
    name: '캠퍼스 단풍 화분', icon: '🍂', price: 9,
    slot: 'hanging_plant', desc: '방 가을 테마',
  },
  deco_043: {
    id: 'deco_043', category: 'deco',
    name: '청룡 눈꽃 장식', icon: '❄️', price: 9,
    slot: 'hanging_deco', desc: '방 겨울 테마',
  },
  deco_044: {
    id: 'deco_044', category: 'deco',
    name: '이면 세계 번개 장식', icon: '🌩️', price: 12,
    slot: 'wall', desc: '방 전기 테마',
  },
  deco_045: {
    id: 'deco_045', category: 'deco',
    name: '푸앙이 왕좌 미니어처', icon: '🪑', price: 30,
    slot: 'floor', desc: '방 왕실 테마',
  },
  deco_046: {
    id: 'deco_046', category: 'deco',
    name: '중앙대 캠퍼스 모형', icon: '🏛️', price: 35,
    slot: 'floor', desc: '방 캠퍼스 테마',
  },
  deco_047: {
    id: 'deco_047', category: 'deco',
    name: '청룡 오라 장식', icon: '💫', price: 28,
    slot: 'hanging_deco', desc: '방 신성 테마',
  },
  deco_048: {
    id: 'deco_048', category: 'deco',
    name: '이면 세계 암흑 결정', icon: '🖤', price: 32,
    slot: 'background', theme: 'dark', desc: '방 다크 테마',
  },
  deco_049: {
    id: 'deco_049', category: 'deco',
    name: '푸앙이 황금 조각상', icon: '🥇', price: 45,
    slot: 'floor', desc: '방 황금 테마 · 호감도 +5',
    effect: { favor: 5 },
  },
  deco_050: {
    id: 'deco_050', category: 'deco',
    name: '중앙대 푸앙월드 간판', icon: '🎆', price: 80,
    slot: 'wall', desc: '방 최고급 테마 · 모든 장식 효과 2배',
    effect: { deco_effect_multiplier: 2 },
  },
};
