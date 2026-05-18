# battle/

전투 및 탐험 시스템 전용 폴더.

## 포함 파일
- battle.js
- monsters.js
- bosses.js
- battle_ui.js
- explore.js

## 역할
- 전투 로직
- 몬스터 데이터
- 보스전
- 탐험 이동
- 충돌 판정

## 추천 분리 구조
### combat.js
전투 계산

### explore.js
탐험 이동 및 충돌

### battle_ui.js
HP/SP UI 및 로그 렌더링

## 개선 필요
현재 battle.js에 탐험/전투/UI가 모두 섞여 있음.
