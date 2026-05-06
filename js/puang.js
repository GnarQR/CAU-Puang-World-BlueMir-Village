// ================================================================
// puang.js — 푸앙이의 방(블루미르홀) 로직
// 방 입장/퇴장, 채팅, 아이템 증정, Groq API 호출, UI 업데이트
// ================================================================

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
// amount만큼 호감도를 올리거나 내림 (0~100 범위 클램프)
// changeFavor(+8), changeFavor(-15) 형태로 호출 -> 나중에 수치 변경 가능
function changeFavor(amount) {
  puangState.favorability = Math.max(0, Math.min(100, puangState.favorability + amount));
  savePuangState();
  updateRoomUI();
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
async function giveItem(itemId) {
  // 아이템별 일일 한도 (고정값 — 기기마다 moodToday가 달라서 고정으로 통일)
  const limits = { coffee: 3, snack: 2 };

  // 상황 설명 텍스트 — LLM 시스템 프롬프트에 삽입되어 대사 맥락 제공
  let situation = '';

  if (itemId === 'coffee') {
    const count = puangState.itemGivenToday.coffee;
    puangState.itemGivenToday.coffee++;
    savePuangState();

    if (count < limits.coffee)         situation = '커피를 받아서 기뻐하는 상황. 호감도 +8 반환.';
    else if (count === limits.coffee)  situation = '커피를 한 잔 더 받았는데 좀 많다 싶은 상황. 호감도 +1 반환.';
    else                               situation = '커피를 너무 많이 받아서 화난 상황. 호감도 -15 반환.';
    addChatMsg('player', '☕ 커피를 건넸다');
  }

  else if (itemId === 'snack') {
    const count = puangState.itemGivenToday.snack;
    puangState.itemGivenToday.snack++;
    savePuangState();

    if (count < limits.snack)  situation = '간식을 받아서 기뻐하는 상황. 호감도 +10 반환.';
    else                       situation = '간식을 너무 많이 받아서 배부른 상황. 호감도 -5 반환.';
    addChatMsg('player', '🍪 간식을 건넸다');
  }

  // TODO : 칭찬하는 것도 일일 횟수 제한 걸어주세요.
  else if (itemId === 'praise') {
    situation = '칭찬을 받아서 쑥스러워하는 상황. 호감도 +5 반환.';
    addChatMsg('player', '👏 푸앙이를 칭찬했다');
  }

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
  }

  updateRoomUI();
}

// ── 채팅 전송 ──
// 플레이어 입력을 Groq LLM에 전달하고 푸앙이 응답을 받아 표시
// 나중에 키 숨길 때: fetch URL을 Cloudflare Workers URL로 교체
async function sendChat() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;

  addChatMsg('player', text);
  input.value = '';
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
        temperature: 0.85,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            // 푸앙이 prompt 수정할 필요 있음
            content: `You must respond only in Korean. Never use Chinese characters or Japanese. Always write in Korean Hangul only.
                    너는 중앙대학교 마스코트 푸앙이야.
                    항상 같은 캐릭터를 유지해. 절대 말투가 바뀌면 안 돼.
                    - 문장 끝에 반드시 "푸앙"을 붙여 (예: "고마워 푸앙~", "기분 좋다 푸앙!")
                    - 반말로 말해. 존댓말 절대 금지.
                    - 귀엽고 솔직한 성격. 가끔 장난기 있게.

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
          { role: 'user', content: text }
        ]
      })
    });

    const data   = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const log = document.getElementById('chat-log');
    log.removeChild(log.lastElementChild);

    addChatMsg('puang', parsed.dialog, parsed.favorability_change);
    changeFavor(parsed.favorability_change);
  } 
  
  catch (e) {
    const log = document.getElementById('chat-log');
    log.removeChild(log.lastElementChild);
    addChatMsg('puang', '미안 푸앙, 지금 좀 멍했어 푸앙...', 0);
    console.error('Groq API 오류:', e);
  }
}

// ── 방 입장 ──
// 날짜 기준으로 기분/아이템 한도 초기화 체크 후 방 화면 표시
function enterRoom() {
  const today = new Date().toDateString();

  // 날짜가 바뀌었으면 기분 + 아이템 카운트 초기화
  if (puangState.moodDate !== today) {
    puangState.moodToday      = Math.floor(Math.random() * 100);
    puangState.moodDate       = today;
    puangState.itemGivenToday = { coffee: 0, snack: 0 };
    savePuangState();
  }

  updateRoomUI();
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('puang-room').classList.add('visible');
}

// ── 방 퇴장 ──
// 푸앙이 방을 닫고 맵으로 복귀
function leaveRoom() {
  document.getElementById('puang-room').classList.remove('visible');
  document.getElementById('game-container').style.display = 'flex';
}