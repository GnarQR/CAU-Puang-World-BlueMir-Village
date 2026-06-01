// ================================================================
// monsters.js — 몬스터 데이터베이스
// ================================================================

// 몬스터 속성 부여
// [시간관리] ➔ [과제수행] ➔ [족보수집] ➔ [자체휴강] ➔ [광클릭] ➔ [벼락치기] ➔ [시간관리] 속성 상성
// A가 B를 상성으로 이길 경우, A ➔ B로 표기
// 강한 상성으로 때릴 경우 데미지 1.3배, 약한 상성으로 때릴 경우 데미지 0.5배

// 랜덤 몬스터 생성 함수 (나중에 몬스터 풀 확장 시 활용)
// ── 1. 층별 몬스터 스폰 제어 함수 ──
// battle_explore.js 등에서 호출할 때 window.getRandomMonster(exploreFloor) 형태로 층을 넘겨줍니다.
window.getRandomMonster = function(floor = 1) {
  let poolIds = [];

  // 층역(Zone)에 따른 몬스터 풀 및 스폰율 정의
  if (floor >= 1 && floor <= 3) {
    // 🟩 초반 구역 (1~3층): 졸음유령과 학점귀신 위주
    poolIds = [
      { id: 'sleep_specter',    rate: 60 },
      { id: 'ghost',            rate: 40 }
    ];
  } else if (floor >= 4 && floor <= 6) {
    // 🟨 중반 구역 (4~6층): 과제악마와 수강신청봇 등장
    poolIds = [
      { id: 'ghost',            rate: 30 },
      { id: 'assignment_demon', rate: 45 },
      { id: 'sugang_bot',       rate: 25 }
    ];
  } else if (floor >= 7 && floor <= 9) {
    // 🟥 후반 구역 (7~9층): 고난도 족보귀신과 과제악마 대량 출현
    poolIds = [
      { id: 'assignment_demon', rate: 20 },
      { id: 'sugang_bot',       rate: 30 },
      { id: 'syllabus_wraith',  rate: 50 }
    ];
  } else {
    // 💀 보스 구간 혹은 예외 (10층 등) 일반 몹 풀백용
    poolIds = [{ id: 'syllabus_wraith', rate: 100 }];
  }

  // 가중치 랜덤 선택 알고리즘
  const total = poolIds.reduce((sum, item) => sum + item.rate, 0);
  let rand = Math.random() * total;

  for (const item of poolIds) {
    rand -= item.rate;
    if (rand <= 0) {
      return window.MONSTERS[item.id] || window.MONSTERS['sleep_specter'];
    }
  }
  return window.MONSTERS['sleep_specter']; // 최종 폴백
};

// ── 2. 일반 몬스터 데이터베이스 (전리품 추가) ──
window.MONSTERS = {
  ghost: {
    id:        'ghost',
    name:      '학점귀신',
    level:  7,  hp:  60,  attackMin:  1,  attackMax:  8,  reward:  5,  // 12 → 8 (평균 4.5)
    image:     'images/monster/normal/F_ghost.png',
    attribute: '자체휴강',  weakness:  '족보수집', 
    intro:     '학점귀신이 나타났다!',
    isBoss:    false,
    // 🎁 추후 기술 조합 및 주사위 강화에 쓰일 전리품 설계
    drops: [
      { id: 'f_grade_shard',    name: 'F학점의 파편',  chance: 0.60 },
      { id: 'ink_cartridge',    name: '번진 잉크 카트리지', chance: 0.25 }
    ]
  },
  assignment_demon: {
    id:        'assignment_demon',
    name:      '과제악마',
    level:  9,  hp:  75,  attackMin:  2,  attackMax:  10,  reward:  7,
    image:     'images/monster/normal/assignment_demon.png',
    attribute: '과제수행',  weakness:  '시간관리',  // 계획적인 학생한테는 과제 폭탄이 통하지 않음 
    intro:     '마감 기한이 다가온다... 과제악마가 소환됐다!',
    isBoss:    false,
    drops: [
      { id: 'report_paper',     name: '구겨진 보고서',  chance: 0.65 },
      { id: 'red_pen_core',     name: '빨간 펜촉',      chance: 0.15 }
    ]
  },
  sugang_bot: {
    id:        'sugang_bot',
    name:      '수강신청봇',
    level:  11,  hp:  50,  attackMin:  3,  attackMax:  9,  reward:  9,
    image:     'images/monster/normal/sugang_robot.png',
    attribute: '광클릭',  weakness:  '자체휴강',  // 수강신청 자체를 드랍한 자를 이길 수는 없음
    intro:     '수강신청봇이 접속을 차단한다!',
    isBoss:    false,
    drops: [
      { id: 'macro_circuit',    name: '매크로 회로 조각', chance: 0.50 },
      { id: 'broken_mouse_wheel', name: '고장난 마우스 휠', chance: 0.35 }
    ]
  },
  syllabus_wraith: {
    id:        'syllabus_wraith',
    name:      '족보귀신',
    level:  13,  hp:  90,  attackMin:  3, attackMax:  11,  reward:  11,
    image:     'images/monster/normal/syllabus_wraith.png',
    attribute: '족보수집',  weakness:  '과제수행',  // 직접 과제를 수행하며 다져진 정공법에 깨짐
    intro:     '족보 없는 시험... 족보귀신이 나타났다!',
    isBoss:    false,
    drops: [
      { id: 'ancient_exam_sheet', name: '기출문제 사본', chance: 0.40 },
      { id: 'secret_note',        name: 'A+ 요약 노트',   chance: 0.10 } // 레어 전리품
    ]
  },
  sleep_specter: {
    id:        'sleep_specter',
    name:      '졸음유령',
    level:  5,  hp:  40,  attackMin:  1,  attackMax:  6,  reward:  4,
    image:     'images/monster/normal/sleep_specter.png',
    attribute: '시간관리',  weakness:  '벼락치기',  // 시간관리로 극복 가능하지만 벼락치기한테는 약함
    intro:     '눈꺼풀이 무거워진다... 졸음유령 출현!',
    isBoss:    false,
    drops: [
      { id: 'caffeine_essence', name: '카페인 정수', chance: 0.70 }, // 70% 확률
      { id: 'torn_pillow',      name: '찢어진 베갯깃', chance: 0.30 }  // 30% 확률
    ]
  },
};

// ── 보스 ──
window.BOSSES = {
  deadline: {
    id:        'deadline',
    name:      '데드라인 악령',
    level:  15,  hp:  120,  attackMin:  3,  attackMax:  10,  reward:  20,
    image:     'images/monster/boss/deadline_ghost.png',
    attribute: '벼락치기',  weakness:  '광클릭',  // 마감 직전 광클릭으로 세이프
    intro:     '데드라인 악령이 강림했다!',
    isBoss:    true,
    drops: [
      { id: 'sandglass_of_time', name: '뒤틀린 모래시계', chance: 1.00 } // 보스는 100% 드롭
    ]
  },
  registrar: {
    id:        'registrar',
    name:      '행정처 망령',
    level:  18,  hp:  160,  attackMin:  4,  attackMax:  12,  reward:  28,
    image:     'images/monster/boss/deadline_ghost.png',
    attribute: '족보수집',  weakness:  '과제수행',
    intro:     '행정처 망령이 나타났다! 서류를 제출하지 않은 죗값을 치러라!',
    isBoss:    true,
    drops: [
      { id: 'official_seal',     name: '망령의 총장직인', chance: 1.00 }
    ]
  },
  professor: {
    id:        'professor',
    name:      '족보없는 교수',
    level:  20,  hp:  200,  attackMin:  5,  attackMax:  14,  reward:  35,
    image:     'images/monster/boss/random_professor.png',
    attribute: '자체휴강',  weakness:  '족보수집',  // 족보가 없는 교수는 족보로 이기도록 하자. 
    intro:     '족보없는 교수가 등장했다!',
    isBoss:    true,
    drops: [
      { id: 'prof_fountain_pen', name: '만년필 모양 다이스 코어', chance: 1.00 }
    ]
  },
  // 나중에 보스 몹 추가 시 여기에
};