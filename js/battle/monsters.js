// ================================================================
// monsters.js — 몬스터 데이터베이스
// ================================================================

// 몬스터 속성 부여
// [시간관리] ➔ [과제수행] ➔ [족보수집] ➔ [자체휴강] ➔ [광클릭] ➔ [벼락치기] ➔ [시간관리] 속성 상성
// A가 B를 상성으로 이길 경우, A ➔ B로 표기
// 강한 상성으로 때릴 경우 데미지 1.3배, 약한 상성으로 때릴 경우 데미지 0.5배

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
    attackMin: 1, attackMax: 8,   // 12 → 8 (평균 4.5)
    reward:    5,
    image:     'images/monster/normal/F_ghost.png',
    attribute: '자체휴강',
    weakness:  '족보수집',  // 던지려고 했는데 족보 밀어 넣으면 공부해야 함
    intro:     '학점귀신이 나타났다!',
    isBoss:    false,
    spawnRate: 40,
  },
  assignment_demon: {
    id:        'assignment_demon',
    name:      '과제악마',
    level:     9,
    hp:        75,
    attackMin: 2, attackMax: 10,  // 14 → 10 (평균 6)
    reward:    7,
    image:     'images/monster/normal/assignment_demon.png',
    attribute: '과제수행',
    weakness:  '시간관리',  // 계획적인 학생한테는 과제 폭탄이 통하지 않음 
    intro:     '마감 기한이 다가온다... 과제악마가 소환됐다!',
    isBoss:    false,
    spawnRate: 25,
  },
  sugang_bot: {
    id:        'sugang_bot',
    name:      '수강신청봇',
    level:     11,
    hp:        50,
    attackMin: 3, attackMax: 9,   // 16 → 9 (평균 6)
    reward:    9,
    image:     'images/monster/normal/sugang_robot.png',
    attribute: '광클릭',
    weakness:  '자체휴강',  // 수강신청 자체를 드랍한 자를 이길 수는 없음
    intro:     '수강신청봇이 접속을 차단한다!',
    isBoss:    false,
    spawnRate: 20,
  },
  syllabus_wraith: {
    id:        'syllabus_wraith',
    name:      '족보귀신',
    level:     13,
    hp:        90,
    attackMin: 3, attackMax: 11,  // 4~15 → 3~11 (평균 7)
    reward:    11,
    image:     'images/monster/normal/syllabus_wraith.png',
    attribute: '족보수집',
    weakness:  '과제수행',  // 직접 과제를 수행하며 다져진 정공법에 깨짐
    intro:     '족보 없는 시험... 족보귀신이 나타났다!',
    isBoss:    false,
    spawnRate: 10,
  },
  sleep_specter: {
    id:        'sleep_specter',
    name:      '졸음유령',
    level:     5,
    hp:        40,
    attackMin: 1, attackMax: 6,   // 8 → 6 (평균 3.5, 입문 몹)
    reward:    4,
    image:     'images/monster/normal/sleep_specter.png',
    attribute: '시간관리',
    weakness:  '벼락치기',  // 시간관리로 극복 가능하지만 벼락치기한테는 약함
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
    attackMin: 3, attackMax: 10,  // 18 → 10 (평균 6.5, 입문 보스)
    reward:    20,
    image:     'images/monster/boss/deadline_ghost.png',
    attribute: '벼락치기',
    weakness:  '광클릭',  // 마감 직전 광클릭으로 세이프
    intro:     '데드라인 악령이 강림했다!',
    isBoss:    true,
  },
  registrar: {
    id:        'registrar',
    name:      '행정처 망령',
    level:     18,
    hp:        160,
    attackMin: 4, attackMax: 12,  // 20 → 12 (평균 8, 중간 난이도)
    reward:    28,
    image:     'images/monster/boss/deadline_ghost.png',
    attribute: '족보수집',  // 행정 서류는 데이터 덩어리니까
    weakness:  '과제수행',
    intro:     '행정처 망령이 나타났다! 서류를 제출하지 않은 죗값을 치러라!',
    isBoss:    true,
  },
  professor: {
    id:        'professor',
    name:      '족보없는 교수',
    level:     20,
    hp:        200,
    attackMin: 5, attackMax: 14,  // 22 → 14 (평균 9.5)
    reward:    35,
    image:     'images/monster/boss/random_professor.png',
    attribute: '자체휴강',  
    weakness:  '족보수집',  // 족보가 없는 교수는 족보로 이기도록 하자. 
    intro:     '족보없는 교수가 등장했다!',
    isBoss:    true,
  },
  // 나중에 보스 몹 추가 시 여기에
};