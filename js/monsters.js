// ================================================================
// monsters.js — 몬스터 데이터베이스
// ================================================================

// 랜덤 몬스터 생성 함수 (나중에 몬스터 풀 확장 시 활용)
function getRandomMonster() {
  const pool = Object.values(MONSTERS);
  const total = pool.reduce((sum, m) => sum + m.spawnRate, 0);
  let rand = Math.random() * total;
  for (const m of pool) {
    rand -= m.spawnRate;
    if (rand <= 0) return m;
  }
  return pool[0]; // 폴백
}

// ── 일반 몹 ──
const MONSTERS = {
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
    spawnRate: 100,  // 몹 등장 확률 (0-100, 나중에 밸런스 패치 가능)
  },
  // 나중에 일반 몹 추가 시 여기에
};

// ── 보스 ──
const BOSSES = {
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
  // 나중에 보스 몹 추가 시 여기에
};