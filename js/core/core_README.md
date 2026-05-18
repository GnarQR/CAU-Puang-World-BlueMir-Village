# core/

게임의 핵심 시스템을 담당하는 폴더.

## 포함 파일
- state.js
- firebase.js
- save.js
- utils.js

## 역할
- 전역 상태 관리
- Firebase 연동
- 저장 / 로드
- 공통 유틸 함수

## 주요 책임
### state.js
플레이어 상태, 데이터 조각, 저장 상태 관리

### firebase.js
Firebase 초기화 및 Firestore 연결

## 주의사항
- 상태 저장 로직은 반드시 여기서 통합 관리
- localStorage / Firebase 중복 저장 최소화 필요
