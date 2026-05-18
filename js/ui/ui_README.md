# ui/

UI 및 연출 전용 폴더.

## 포함 파일
- ui_enhancements.js
- ui_ideas4.js
- toast.js
- animations.js
- hud.js

## 역할
- 토스트 메시지
- 테마 변경
- 전환 애니메이션
- 전투 연출
- HUD 표시

## 문제점
현재 ui_ideas4.js가 기존 함수 후킹 방식으로 동작함.

예:
window.initBattle = function()

이 방식은 유지보수 시 충돌 위험 존재.

## 추천
이벤트 기반 구조로 변경:
emit('battle:start')
