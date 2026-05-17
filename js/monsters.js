// ================================================================
// monsters.js — 몬스터 데이터베이스
// ================================================================

// 랜덤 몬스터 생성 함수 (나중에 몬스터 풀 확장 시 활용)
window.getRandomMonster = function() {
  const pool = Object.values(window.MONSTERS);  // window.MONSTERS에서 몬스터 목록 가져오기
  const total = pool.reduce((sum, m) => sum + m.spawnRate, 0);
  let rand = Math.random() * total;
  for (const m of pool) {
    rand -= m.spawnRate;
    if (rand <= 0) return m;
  }
  return pool[0]; // 폴백
}

// ── 일반 몹 ──
window.MONSTERS = {
  ghost: {
    id:        'ghost',
    name:      '학점귀신',
    level:     7,
    hp:        60,
    attackMin: 1, attackMax: 12,
    reward:    5,
    image:     'images/monster/normal/F_ghost.png',
    weakness:  '집중력 속성',
    intro:     '학점귀신이 나타났다!',
    isBoss:    false,
    spawnRate: 40,
  },
  // ★ 신규 일반 몹
  assignment_demon: {
    id:        'assignment_demon',
    name:      '과제악마',
    level:     9,
    hp:        75,
    attackMin: 2, attackMax: 14,
    reward:    7,
    image:     'images/monster/normal/F_ghost.png',
    weakness:  '시간 관리 속성',
    intro:     '마감 기한이 다가온다... 과제악마가 소환됐다!',
    isBoss:    false,
    spawnRate: 25,
  },
  sugang_bot: {
    id:        'sugang_bot',
    name:      '수강신청봇',
    level:     11,
    hp:        50,
    attackMin: 3, attackMax: 16,
    reward:    9,
    image:     'images/monster/normal/F_ghost.png',
    weakness:  '빠른 손가락 속성',
    intro:     '수강신청봇이 접속을 차단한다!',
    isBoss:    false,
    spawnRate: 20,
  },
  syllabus_wraith: {
    id:        'syllabus_wraith',
    name:      '족보귀신',
    level:     13,
    hp:        90,
    attackMin: 4, attackMax: 15,
    reward:    11,
    image:     'images/monster/normal/F_ghost.png',
    weakness:  '족보 수집 속성',
    intro:     '족보 없는 시험... 족보귀신이 나타났다!',
    isBoss:    false,
    spawnRate: 10,
  },
  sleep_specter: {
    id:        'sleep_specter',
    name:      '졸음유령',
    level:     5,
    hp:        40,
    attackMin: 1, attackMax: 8,
    reward:    4,
    image:     'images/monster/normal/F_ghost.png',
    weakness:  '카페인 속성',
    intro:     '눈꺼풀이 무거워진다... 졸음유령 출현!',
    isBoss:    false,
    spawnRate: 5,
  },
};

// ── 보스 ──
window.BOSSES = {
  deadline: {
    id:        'deadline',
    name:      '데드라인 악령',
    level:     15,
    hp:        120,
    attackMin: 3, attackMax: 18,
    reward:    20,
    image:     'images/monster/boss/deadline_ghost.png',
    weakness:  '시간 관리 속성',
    intro:     '데드라인 악령이 강림했다!',
    isBoss:    true,
  },
  professor: {
    id:        'professor',
    name:      '족보없는 교수',
    level:     20,
    hp:        200,
    attackMin: 5, attackMax: 22,
    reward:    35,
    image:     'images/monster/boss/random_professor.png',
    weakness:  '족보 수집 속성',
    intro:     '족보없는 교수가 등장했다!',
    isBoss:    true,
  },
  // ★ 신규 보스
  registrar: {
    id:        'registrar',
    name:      '행정처 망령',
    level:     18,
    hp:        160,
    attackMin: 4, attackMax: 20,
    reward:    28,
    image:     'images/monster/boss/deadline_ghost.png',
    weakness:  '서류 제출 속성',
    intro:     '행정처 망령이 나타났다! 서류를 제출하지 않은 죗값을 치러라!',
    isBoss:    true,
  },
  // 나중에 보스 몹 추가 시 여기에
};