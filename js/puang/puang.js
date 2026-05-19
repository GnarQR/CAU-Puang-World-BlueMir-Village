// ================================================================
// puang.js — 푸앙이의 방(블루미르홀) 로직
// 방 입장/퇴장, 채팅, 아이템 증정, Groq API 호출, UI 업데이트
// ================================================================

// 채팅 패널 열기
window.openRoomChat = function() {
  document.getElementById('room-chat-panel').style.display = 'flex';
  document.getElementById('room-talk-btn-wrap').style.display = 'none';
  updateRoomUI();
}

// 채팅 패널 닫기 (방으로 돌아가기)
window.closeRoomChat = function() {
  document.getElementById('room-chat-panel').style.display = 'none';
  document.getElementById('room-talk-btn-wrap').style.display = 'flex';
}

// ── 호감도 → 하트 이모지 변환 ──
// favorability 0~100 값을 ♥♡ 조합으로 표시
// 20점마다 하트 1개 (100점 = ♥♥♥♥♥, 0점 = ♡♡♡♡♡)
function getFavorHearts(fav) {
  const hearts = Math.round(fav / 20);
  return '♥'.repeat(hearts) + '♡'.repeat(5 - hearts);
}

// ── 호감도 → 푸앙이 말투 지시 ──
// Groq 시스템 프롬프트에 삽입되어 호감도에 따라 말투가 달라짐
function getFavorLabel(fav) {
  if (fav >= 80) return '매우 친근하고 애정 넘치게, 별명 부르기 가능';
  if (fav >= 60) return '편하고 따뜻하게, 가끔 농담';
  if (fav >= 40) return '친절하지만 약간 격식 있게';
  if (fav >= 20) return '조심스럽고 공손하게';
  return '어색하고 약간 방어적으로';
}

// ── 컨디션 → 이모지 + 텍스트 + 게이지 색상 ──
// moodToday(0~100) 값을 화면에 표시할 형태로 변환
function getConditionInfo(mood) {
  if (mood >= 80) return { emoji: '😄', text: '기분 최고 푸앙!',      color: '#5dcaa5' };
  if (mood >= 60) return { emoji: '😊', text: '기분 좋음 푸앙~',      color: '#5dcaa5' };
  if (mood >= 40) return { emoji: '😐', text: '그냥 보통 푸앙.',       color: '#ef9f27' };
  if (mood >= 20) return { emoji: '😒', text: '오늘 기분 별로 푸앙...', color: '#f09595' };
  return           { emoji: '😠', text: '건드리지 마 푸앙!!',          color: '#e24b4a' };
}

// ── 푸앙이 방 UI 전체 업데이트 ──
// puangState가 바뀔 때마다 호출해서 화면에 반영
// 컨디션 이모지/게이지/텍스트, 호감도 하트, 아이템 카운트, 맵 상단 호감도
function updateRoomUI() {
  const cond = getConditionInfo(puangState.moodToday);
  document.getElementById('condition-emoji').textContent      = cond.emoji;
  document.getElementById('condition-text').textContent       = cond.text;
  document.getElementById('condition-fill').style.width       = puangState.moodToday + '%';
  document.getElementById('condition-fill').style.background  = cond.color;
  document.getElementById('room-favor-hearts').textContent    = getFavorHearts(puangState.favorability);
  document.getElementById('coffee-count').textContent         = puangState.itemGivenToday.coffee;
  document.getElementById('snack-count').textContent          = puangState.itemGivenToday.snack;
  document.getElementById('favor-display').textContent        = getFavorHearts(puangState.favorability);
}

// ── 호감도 변경 ──
function changeFavor(amount) {
  const prev = puangState.favorability;
  puangState.favorability = Math.max(0, Math.min(100, puangState.favorability + amount));
  savePuangState();
  updateRoomUI();

  // ★ 호감도 구간 돌파 이벤트 대사
  const milestones = [20, 40, 60, 80, 100];
  for (const ms of milestones) {
    if (prev < ms && puangState.favorability >= ms) {
      _triggerFavorMilestone(ms);
      break;
    }
  }

  // ★ 청룡호 잠금 해제 (호감도 100 달성)
  if (puangState.favorability >= 100 && !localStorage.getItem('lakeUnlocked')) {
    _unlockBluedragonLake();
  }
}

// 호감도 구간 돌파 이벤트 대사 (Groq 없이도 동작하는 고정 대사)
const MILESTONE_LINES = {
  20:  '어, 이름 기억하고 있어 푸앙... 앞으로 자주 와줘 푸앙!',
  40:  '요즘 네가 자꾸 생각나 푸앙. 이상하다 푸앙?',
  60:  '넌 특별한 것 같아 푸앙~ 비밀인데 알려주는 거야 푸앙!',
  80:  '사실... 네가 제일 좋아 푸앙! 말하기 부끄러웠어 푸앙...',
  100: '호감도 MAX 달성 푸앙!! 청룡호로 같이 가자 푸앙! 🏞️',
};

function _triggerFavorMilestone(level) {
  const line = MILESTONE_LINES[level];
  if (!line) return;
  setTimeout(() => {
    addChatMsg('puang', `[${level}♥ 달성!] ${line}`, level === 100 ? 0 : 5);
    if (typeof showToast === 'function') showToast('💕 호감도 ' + level + ' 달성!', 'success', 3000);
    if (typeof window.sfx === 'object') window.sfx.levelup();
  }, 200);
}

// 청룡호 잠금 해제 연출
function _unlockBluedragonLake() {
  localStorage.setItem('lakeUnlocked', 'true');
  if (typeof window.syncAndSave === 'function') window.syncAndSave(); // ★ Firebase 동기화
  // placeInfo 잠금 해제
  if (typeof placeInfo !== 'undefined' && placeInfo.bluedragonlake) {
    placeInfo.bluedragonlake.locked = false;
  }
  // 맵 버튼 locked 클래스 제거
  const lakeBtn = document.querySelector('.map-spot.locked[onclick*="bluedragonlake"]');
  if (lakeBtn) lakeBtn.classList.remove('locked');

  // 연출
  setTimeout(() => {
    addChatMsg('puang', '✨ 청룡호가 열렸어 푸앙!! 같이 산책가자 푸앙~~ 🏞️', 0);
    if (typeof showToast === 'function') {
      showToast('🔓 청룡호 잠금 해제! 맵에서 방문하세요', 'warning', 5000);
    }
    if (typeof window.sfx === 'object') window.sfx.levelup();
  }, 500);
}

// ── 채팅 로그에 메시지 추가 ──
// who: 'puang' | 'player'
// favorChange: 호감도 변화량 (있으면 메시지 아래 +/- 표시)
function addChatMsg(who, text, favorChange) {
  const log = document.getElementById('chat-log');

  if (who === 'puang') {
    log.innerHTML += `
      <div class="chat-puang">
        <div class="chat-puang-avatar">🐉</div>
        <div class="chat-puang-bubble">
          <div class="chat-puang-name">푸앙</div>
          ${text}
        </div>
      </div>`;
  }

  else {
    log.innerHTML += `
      <div class="chat-player">
        <div class="chat-player-bubble">${text}</div>
      </div>`;
  }

  // 호감도 변화량이 있으면 메시지 아래에 표시
  if (favorChange !== undefined && favorChange !== 0) {
    const sign = favorChange > 0 ? '+' : '';
    const cls  = favorChange > 0 ? 'favor-up' : 'favor-down';
    log.innerHTML += `
      <div class="chat-favor-change">
        <span class="${cls}">호감도 ${sign}${favorChange}</span>
      </div>`;
  }

  log.scrollTop = log.scrollHeight;
}

// ── 아이템 증정 ──
// 아이템 한도 체크는 JS에서 판단하고 대사만 Groq LLM에 요청
// itemId: 'coffee' | 'snack' | 'praise'
window.giveItem = async function(itemId) {
  const limits = { coffee: 3, snack: 2 };  // 아이템별 일일 한도 (고정값 — 기기마다 moodToday가 달라서 고정으로 통일)

  let situation = '';  // 상황 설명 텍스트 — LLM 시스템 프롬프트에 삽입되어 대사 맥락 제공
  let favorChange = 0; // 호감도 변화량 

  if (itemId === 'coffee') {
    const count = puangState.itemGivenToday.coffee;
    puangState.itemGivenToday.coffee++;
    savePuangState();

    if (count < limits.coffee) {
      situation = '커피를 받아서 기뻐하는 상황.';
      favorChange = 3;
    }         
    else if (count === limits.coffee) {
      situation = '커피를 한 잔 더 받았는데 좀 많다 싶은 상황.';
      favorChange = 1;
    } 
    else {
      situation = '커피를 너무 많이 받아서 화난 상황. 호감도 -15 반환.';
      favorChange = -10;
    }                             
    addChatMsg('player', '☕ 커피를 건넸다');
  }

  else if (itemId === 'snack') {
    const count = puangState.itemGivenToday.snack;
    puangState.itemGivenToday.snack++;
    savePuangState();

    if (count < limits.snack) {
      situation = '간식을 받아서 기뻐하는 상황.';
      favorChange = 3;
    }
    else {
      situation = '간식을 너무 많이 받아서 배부른 상황. 호감도 -5 반환.';
      favorChange = -5;
    }
    addChatMsg('player', '🍪 간식을 건넸다');
  }

  else if (itemId === 'praise') {
    if (!useDaily('praise')) {  // 푸앙이 칭찬 2번 제한
      addChatMsg('puang', '오늘은 칭찬 많이 들었어 푸앙~ 내일 또 해줘 푸앙!', 0);
      return;
    }
    situation = '칭찬을 받아서 쑥스러워하는 상황.';
    favorChange = 2;
    addChatMsg('player', '👏 푸앙이를 칭찬했다');
  }

  // ★ Fix: 아이템 버튼 중복 클릭 방지 (로딩 중 잠금)
  const itemBtns = document.querySelectorAll('.room-item-btn');
  itemBtns.forEach(b => b.disabled = true);

  // 로딩 표시
  addChatMsg('puang', '...');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        max_tokens: 150,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            // 푸앙이 prompt engineering 추가로 할 필요 있음
            content: `You must respond only in Korean. Never use Chinese characters or Japanese. Always write in Korean Hangul only.
                    너는 중앙대학교 마스코트 푸앙이야.
                    항상 같은 캐릭터를 유지해. 절대 말투가 바뀌면 안 돼.
                    - 문장 끝에 반드시 "푸앙"을 붙여 (예: "고마워 푸앙~", "기분 좋다 푸앙!")
                    - 반말로 말해. 존댓말 절대 금지.
                    - 귀엽고 솔직한 성격. 가끔 장난기 있게.

                    현재 호감도: ${puangState.favorability}/100
                    상황: ${situation}
                    반드시 JSON으로만 응답해.
                    {"dialog": "대사 1~2문장", "favorability_change": 숫자}`
          },
          { role: 'user', content: '(아이템을 건네받음)' }
        ]
      })
    });

    const data   = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // 로딩 메시지 제거 후 실제 응답 삽입
    const log = document.getElementById('chat-log');
    log.removeChild(log.lastElementChild);

    addChatMsg('puang', parsed.dialog, parsed.favorability_change);
    changeFavor(parsed.favorability_change);
  } 
  
  catch (e) {  // API 실패 시 폴백 메시지
    const log = document.getElementById('chat-log');
    log.removeChild(log.lastElementChild);
    addChatMsg('puang', '고마워 푸앙~', 0);
    console.error('Groq API 오류:', e);
  } finally {
    // ★ Fix: 아이템 버튼 잠금 해제
    const itemBtns2 = document.querySelectorAll('.room-item-btn');
    itemBtns2.forEach(b => b.disabled = false);
  }

  updateRoomUI();
}

// ── 채팅 전송 ──
// 나중에 키 숨길 때: fetch URL을 Cloudflare Workers URL로 교체
// ★ Fix: 대화 맥락(최근 6턴) 전달 + 로딩 중 버튼 중복 입력 방지
let _chatBusy = false;

// chat-log DOM에서 최근 대화를 messages 배열로 변환 (최대 6턴)
function buildChatHistory() {
  const log = document.getElementById('chat-log');
  if (!log) return [];
  const msgs = [];
  log.querySelectorAll('.chat-player .chat-player-bubble').forEach(el => {
    msgs.push({ role: 'user', content: el.textContent });
  });
  log.querySelectorAll('.chat-puang .chat-puang-bubble').forEach(el => {
    const text = el.childNodes[el.childNodes.length - 1]?.textContent?.trim();
    if (text && text !== '...') msgs.push({ role: 'assistant', content: text });
  });
  // 인터리브가 깨질 수 있으므로 DOM 순서 기반 재구성 (최근 6개 메시지)
  const ordered = [];
  log.children && Array.from(log.children).forEach(el => {
    if (el.classList.contains('chat-player')) {
      const t = el.querySelector('.chat-player-bubble')?.textContent?.trim();
      if (t) ordered.push({ role: 'user', content: t });
    } else if (el.classList.contains('chat-puang')) {
      const nodes = el.querySelector('.chat-puang-bubble')?.childNodes;
      if (nodes) {
        const t = Array.from(nodes).map(n => n.textContent).join('').replace('푸앙', '').trim();
        const full = el.querySelector('.chat-puang-bubble')?.textContent?.trim();
        if (full && full !== '...') ordered.push({ role: 'assistant', content: full });
      }
    }
  });
  return ordered.slice(-6); // 최근 6턴만
}

window.sendChat = async function() {
  if (_chatBusy) return; // ★ Fix: 중복 전송 방지
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;

  _chatBusy = true;
  const sendBtn = document.getElementById('room-send-btn');
  if (sendBtn) sendBtn.disabled = true; // ★ Fix: 버튼 잠금

  addChatMsg('player', text);
  input.value = '';
  addChatMsg('puang', '...');

  // ★ Fix: 이전 대화 맥락 구성 (현재 입력 제외한 이전 히스토리)
  const history = buildChatHistory();
  // 마지막에 추가된 player 메시지(방금 입력)와 puang '...' 제외
  const contextMsgs = history.slice(0, -1);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.85,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You must respond only in Korean. Never use Chinese characters or Japanese. Always write in Korean Hangul only.
                    너는 중앙대학교 마스코트 푸앙이야.
                    항상 같은 캐릭터를 유지해. 절대 말투가 바뀌면 안 돼.
                    - 문장 끝에 반드시 "푸앙"을 붙여 (예: "고마워 푸앙~", "기분 좋다 푸앙!")
                    - 반말로 말해. 존댓말 절대 금지.
                    - 귀엽고 솔직한 성격. 가끔 장난기 있게.
                    - 이전 대화 맥락을 기억해서 자연스럽게 이어가.

                    현재 호감도: ${puangState.favorability}/100
                    말투 지시: ${getFavorLabel(puangState.favorability)}
                    오늘 받은 아이템: 커피 ${puangState.itemGivenToday.coffee}잔, 간식 ${puangState.itemGivenToday.snack}개

                    반드시 아래 JSON으로만 응답해. 다른 텍스트 금지.
                    {"dialog": "푸앙이 대사 1~2문장", "favorability_change": 숫자}

                    favorability_change 기준:
                    - 친근한 대화: +2 ~ +5
                    - 무례하거나 이상한 말: -3 ~ -8
                    - 보통 대화: 0 ~ +2`
          },
          ...contextMsgs, // ★ Fix: 이전 대화 히스토리 삽입
          { role: 'user', content: text }
        ]
      })
    });

    const data   = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('API 응답 없음');
    const parsed = JSON.parse(content);

    const log = document.getElementById('chat-log');
    log.removeChild(log.lastElementChild);

    addChatMsg('puang', parsed.dialog, parsed.favorability_change);
    changeFavor(parsed.favorability_change);
  } 
  
  catch (e) {
    const log = document.getElementById('chat-log');
    if (log.lastElementChild) log.removeChild(log.lastElementChild);
    addChatMsg('puang', '미안 푸앙, 지금 좀 멍했어 푸앙...', 0);
    console.error('Groq API 오류:', e);
  } finally {
    _chatBusy = false;
    if (sendBtn) sendBtn.disabled = false; // ★ Fix: 버튼 잠금 해제
  }
}

// ── 방 입장 ──
// 날짜 기준으로 기분/아이템 한도 초기화 체크 후 방 화면 표시
window.enterRoom = function() {
  const today = new Date().toDateString();

  // 방 진입 시 채팅 패널 닫힌 상태로 초기화
  document.getElementById('room-chat-panel').style.display = 'none';
  document.getElementById('room-talk-btn-wrap').style.display = 'flex';

  applyRoomDecorations();

  // ★ Fix #15: game-container 숨기기 중복 호출 제거 (아래에서 한 번만)
  // ★ Fix #16: display와 visible 클래스를 일관되게 한 곳에서 처리
  document.getElementById('game-container').style.display = 'none';

  const roomEl = document.getElementById('puang-room');
  roomEl.style.display = 'flex';
  roomEl.classList.add('visible'); // ★ Fix #16: display와 클래스 한 번에 처리

  // 날짜가 바뀌었으면 기분 + 아이템 카운트 초기화
  if (puangState.moodDate !== today) {
    puangState.moodToday      = Math.floor(Math.random() * 100);
    puangState.moodDate       = today;
    puangState.itemGivenToday = { coffee: 0, snack: 0 };
    savePuangState();
  }
  
  updateRoomUI();
}

// ── 방 퇴장 ──
// 푸앙이 방을 닫고 맵으로 복귀
window.leaveRoom = function() {
  // 1. 푸앙이 방 컨테이너(puang-room)를 완전히 숨깁니다.
  const roomCont = document.getElementById('puang-room');
  if (roomCont) {
    roomCont.style.display = 'none';
    roomCont.classList.remove('visible'); // ★ Fix #16: visible 클래스도 제거하여 display/class 상태 일관화
  }

  // 2. 메인 맵 컨테이너를 보여줍니다.
  const gameCont = document.getElementById('game-container');
  if (gameCont) {
    gameCont.style.display = 'flex';
  }

  // 3. 맵으로 돌아왔으므로 상단 스탯 UI를 최신화합니다.
  if (typeof updateMapStats === 'function') {
    window.updateMapStats();
  }
}