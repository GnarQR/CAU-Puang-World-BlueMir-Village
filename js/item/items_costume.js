// ================================================================
// items_costume.js — 코스튬 아이템
// 플레이어(17) + 푸앙이(36)
// category: 'player_costume' | 'puang_costume'
// ================================================================

// ── 플레이어 코스튬 ──
window.ITEMS_PLAYER_COSTUME = {
  pc_female_darkKnight:   { id:'pc_female_darkKnight',   category:'player_costume', gender:'female', name:'다크 나이트 (여)',     icon:'🌑', price:30, desc:'검은 갑옷, 파란 불꽃 검', imgFile:'images/player/player_femal_darkKnight.png' },
  pc_female_battle:       { id:'pc_female_battle',       category:'player_costume', gender:'female', name:'배틀 (여)',            icon:'⚡', price:25, desc:'검은 전투복, 번개 검',    imgFile:'images/player/player_female_battle.png' },
  pc_female_fireWarrior:  { id:'pc_female_fireWarrior',  category:'player_costume', gender:'female', name:'화염 전사 (여)',       icon:'🔥', price:28, desc:'불꽃 갑옷, 화염 검',       imgFile:'images/player/player_female_fireWarrior.png' },
  pc_female_hunter:       { id:'pc_female_hunter',       category:'player_costume', gender:'female', name:'헌터 (여)',            icon:'🏹', price:25, desc:'초록 후드, 활과 화살',     imgFile:'images/player/player_female_hunter.png' },
  pc_female_iceWarrior:   { id:'pc_female_iceWarrior',   category:'player_costume', gender:'female', name:'빙결 전사 (여)',       icon:'❄️', price:28, desc:'얼음 갑옷, 얼음 검',       imgFile:'images/player/player_female_iceWarrior.png' },
  pc_female_macian:       { id:'pc_female_macian',       category:'player_costume', gender:'female', name:'마법사 (여)',          icon:'🔮', price:26, desc:'마법사 모자, 지팡이',       imgFile:'images/player/player_female_macian.png' },
  pc_female_mechEngineer: { id:'pc_female_mechEngineer', category:'player_costume', gender:'female', name:'기계 엔지니어 (여)',   icon:'🤖', price:30, desc:'기계 갑옷, 발광 건',        imgFile:'images/player/player_female_mechEngineer.png' },
  pc_female_necromancer:  { id:'pc_female_necromancer',  category:'player_costume', gender:'female', name:'네크로맨서 (여)',      icon:'💀', price:32, desc:'해골 지팡이, 유령 소환',    imgFile:'images/player/player_female_necromancer.png' },
  pc_male_default:        { id:'pc_male_default',        category:'player_costume', gender:'male',   name:'기본형 (남)',          icon:'🧑‍💻',price:0,  desc:'기본 전투복, 사원증',        imgFile:'images/player/player_male_default.png' },
  pc_male_battle:         { id:'pc_male_battle',         category:'player_costume', gender:'male',   name:'배틀 (남)',            icon:'⚡', price:25, desc:'전투복 SEOUL, 헤드셋',      imgFile:'images/player/player_male_battle.png' },
  pc_male_darkKnight:     { id:'pc_male_darkKnight',     category:'player_costume', gender:'male',   name:'다크 나이트 (남)',     icon:'🌑', price:30, desc:'후드 갑옷, 불꽃 검',        imgFile:'images/player/player_male_darkKnight.png' },
  pc_male_fireWarrior:    { id:'pc_male_fireWarrior',    category:'player_costume', gender:'male',   name:'화염 전사 (남)',       icon:'🔥', price:28, desc:'불꽃 갑옷, 화염 검',        imgFile:'images/player/player_male_fireWarrior.png' },
  pc_male_hunter:         { id:'pc_male_hunter',         category:'player_costume', gender:'male',   name:'헌터 (남)',            icon:'🏹', price:25, desc:'초록 후드, 활과 화살',      imgFile:'images/player/player_male_hunter.png' },
  pc_male_iceWarrior:     { id:'pc_male_iceWarrior',     category:'player_costume', gender:'male',   name:'빙결 전사 (남)',       icon:'❄️', price:28, desc:'얼음 갑옷, 얼음 검',        imgFile:'images/player/player_male_iceWarrior.png' },
  pc_male_macian:         { id:'pc_male_macian',         category:'player_costume', gender:'male',   name:'마법사 (남)',          icon:'🔮', price:26, desc:'마법사 모자, 지팡이',        imgFile:'images/player/player_male_macian.png' },
  pc_male_mechaEngineer:  { id:'pc_male_mechaEngineer',  category:'player_costume', gender:'male',   name:'기계 엔지니어 (남)',   icon:'🤖', price:30, desc:'기계 갑옷, 발광 건, 드론',  imgFile:'images/player/player_male_mechaEngineer.png' },
  pc_male_necromancer:    { id:'pc_male_necromancer',    category:'player_costume', gender:'male',   name:'네크로맨서 (남)',      icon:'💀', price:32, desc:'해골 지팡이, 유령 소환',    imgFile:'images/player/player_male_necromancer.png' },
};

// ── 푸앙이 코스튬 ──
window.ITEMS_PUANG_COSTUME = {
  puang_singer:       { id:'puang_singer',       category:'puang_costume', name:'가수',         icon:'🎤', price:20, desc:'반짝이 재킷, 마이크',          imgFile:'images/puang/puang_singer.png' },
  puang_santa:        { id:'puang_santa',        category:'puang_costume', name:'산타클로스',   icon:'🎅', price:15, desc:'빨간 산타복, 선물자루',         imgFile:'images/puang/puang_santa.png' },
  puang_salaryman:    { id:'puang_salaryman',    category:'puang_costume', name:'직장인',       icon:'💼', price:12, desc:'흰 셔츠, 넥타이, 사원증',       imgFile:'images/puang/puang_salaryman.png' },
  puang_rudolf:       { id:'puang_rudolf',       category:'puang_costume', name:'루돌프',       icon:'🦌', price:15, desc:'루돌프 인형 코스튬',            imgFile:'images/puang/puang_rudolf.png' },
  puang_professor:    { id:'puang_professor',    category:'puang_costume', name:'교수',         icon:'🎓', price:18, desc:'트위드 재킷, 칠판',             imgFile:'images/puang/puang_professor.png' },
  puang_poor:         { id:'puang_poor',         category:'puang_costume', name:'빈농',         icon:'🌾', price:10, desc:'밀짚모자, 괭이',                imgFile:'images/puang/puang_poor.png' },
  puang_police:       { id:'puang_police',       category:'puang_costume', name:'경찰',         icon:'👮', price:18, desc:'경찰 제복, 경례 자세',           imgFile:'images/puang/puang_police.png' },
  puang_pirate:       { id:'puang_pirate',       category:'puang_costume', name:'해적',         icon:'🏴‍☠️', price:20, desc:'빨간 코트, 검, 랜턴',          imgFile:'images/puang/puang_pirate.png' },
  puang_nurse:        { id:'puang_nurse',        category:'puang_costume', name:'간호사',       icon:'👩‍⚕️', price:15, desc:'하늘색 스크럽',               imgFile:'images/puang/puang_nurse.png' },
  puang_zookeeper:    { id:'puang_zookeeper',    category:'puang_costume', name:'사육사',       icon:'🦁', price:18, desc:'ZOO 모자, 동물들과 함께',       imgFile:'images/puang/puang_zookeeper.png' },
  puang_zombie:       { id:'puang_zombie',       category:'puang_costume', name:'좀비',         icon:'🧟', price:22, desc:'찢어진 옷, 흐린 눈',            imgFile:'images/puang/puang_zombie.png' },
  puang_wrestler:     { id:'puang_wrestler',     category:'puang_costume', name:'씨름 선수',   icon:'🤼', price:20, desc:'씨름복, 천하장사 메달',          imgFile:'images/puang/puang_wrestler.png' },
  puang_witch:        { id:'puang_witch',        category:'puang_costume', name:'마녀',         icon:'🧙', price:22, desc:'검은 마녀 모자, 지팡이',         imgFile:'images/puang/puang_witch.png' },
  puang_weddingDress: { id:'puang_weddingDress', category:'puang_costume', name:'웨딩드레스',   icon:'👰', price:25, desc:'흰 드레스, 부케',               imgFile:'images/puang/puang_weddingDress.png' },
  puang_swimmer:      { id:'puang_swimmer',      category:'puang_costume', name:'수영 선수',   icon:'🏊', price:18, desc:'파란 수영복, 금메달',            imgFile:'images/puang/puang_swimmer.png' },
  puang_title:        { id:'puang_title',        category:'puang_costume', name:'타이틀 기본', icon:'⭐', price:0,  desc:'심플한 기본 캐릭터',            imgFile:'images/puang/puang_title.png' },
  puang_sweeper:      { id:'puang_sweeper',      category:'puang_costume', name:'청소부',       icon:'🧹', price:12, desc:'청소 작업복, 빗자루',            imgFile:'images/puang/puang_sweeper.png' },
  puang_student:      { id:'puang_student',      category:'puang_costume', name:'학생',         icon:'🎒', price:10, desc:'교복, 교과서, 가방',             imgFile:'images/puang/puang_student.png' },
  puang_sorcerer:     { id:'puang_sorcerer',     category:'puang_costume', name:'마법사',       icon:'🔮', price:22, desc:'마법사 망토, 별 모자',           imgFile:'images/puang/puang_sorcerer.png' },
  puang_soilder:      { id:'puang_soilder',      category:'puang_costume', name:'군인',         icon:'🪖', price:20, desc:'특수부대 전투복, 야간투시경',    imgFile:'images/puang/puang_soilder.png' },
  puang_darkKnight:   { id:'puang_darkKnight',   category:'puang_costume', name:'다크 나이트', icon:'🌑', price:28, desc:'검은 갑옷, 빨간 눈',            imgFile:'images/puang/puang_darkKnight.png' },
  puang_camping:      { id:'puang_camping',      category:'puang_costume', name:'캠핑',         icon:'🏕️', price:15, desc:'백팩, 랜턴, 마시멜로 꼬치',     imgFile:'images/puang/puang_camping.png' },
  puang_battle:       { id:'puang_battle',       category:'puang_costume', name:'배틀/게이머', icon:'🎮', price:25, desc:'HUD 고글, 헤드셋',               imgFile:'images/puang/puang_battle.png' },
  puang_baristar:     { id:'puang_baristar',     category:'puang_costume', name:'바리스타',     icon:'☕', price:18, desc:'갈색 앞치마, 라떼아트',          imgFile:'images/puang/puang_baristar.png' },
  puang_astroanout:   { id:'puang_astroanout',   category:'puang_costume', name:'우주비행사',   icon:'🚀', price:30, desc:'우주복, 태극기 패치',            imgFile:'images/puang/puang_astroanout.png' },
  puang_angel:        { id:'puang_angel',        category:'puang_costume', name:'천사',         icon:'😇', price:25, desc:'후광, 천사 날개',                imgFile:'images/puang/puang_angel.png' },
  puang_lawnCareWorker:{ id:'puang_lawnCareWorker',category:'puang_costume',name:'잔디관리사',  icon:'🌿', price:12, desc:'초록 작업복, 잔디깎기',          imgFile:'images/puang/puang_lawnCareWorker.png' },
  puang_normal:       { id:'puang_normal',       category:'puang_costume', name:'노말 기본형', icon:'🐨', price:0,  desc:'기본 캐릭터',                    imgFile:'images/puang/puang_normal.png' },
  puang_ninja:        { id:'puang_ninja',        category:'puang_costume', name:'닌자',         icon:'🥷', price:22, desc:'닌자 복장, 수리검',              imgFile:'images/puang/puang_ninja.png' },
  puang_koreanDresser:{ id:'puang_koreanDresser',category:'puang_costume', name:'한복',         icon:'👘', price:20, desc:'전통 한복, 복주머니',            imgFile:'images/puang/puang_koreanDresser.png' },
  puang_fireFighter:  { id:'puang_fireFighter',  category:'puang_costume', name:'소방관',       icon:'🚒', price:18, desc:'소방 헬멧, 방화복',              imgFile:'images/puang/puang_fireFighter.png' },
  puang_farmer:       { id:'puang_farmer',       category:'puang_costume', name:'농부',         icon:'🌻', price:12, desc:'밀짚모자, 청바지 멜빵',          imgFile:'images/puang/puang_farmer.png' },
  puang_enteratiner:  { id:'puang_enteratiner',  category:'puang_costume', name:'엔터테이너',   icon:'🎭', price:20, desc:'반짝이 재킷, 마이크',            imgFile:'images/puang/puang_enteratiner.png' },
  puang_dragonSlayer: { id:'puang_dragonSlayer', category:'puang_costume', name:'드래곤 슬레이어',icon:'🗡️',price:30,desc:'은빛 기사 갑옷, 검',            imgFile:'images/puang/puang_dragonSlayer.png' },
  puang_doctor:       { id:'puang_doctor',       category:'puang_costume', name:'의사',         icon:'👨‍⚕️',price:18,desc:'흰 가운, 청진기',               imgFile:'images/puang/puang_doctor.png' },
  puang_detector:     { id:'puang_detector',     category:'puang_costume', name:'탐정',         icon:'🔍', price:22, desc:'트렌치코트, 돋보기',             imgFile:'images/puang/puang_detector.png' },
};
