// ================================================================
// puang_battle.js — 푸앙이 전투 난입 시스템
// 조건: 청룡호 해금 (lakeUnlocked) + 층당 최대 2회 난입
// 흐름: 매 enemyTurn 종료 후 LLM이 상황 판단 → 난입 여부 결정
//       → puang_dice.mp4 연출 → 버프 적용
// ================================================================

// ── 전투당 난입 횟수 카운터 ──
let puangFloorInterventionCount = 0;   // 층당 카운터 (층 이동 시 초기화)
let puangBattleInterventionCount = 0;  // 전투당 카운터 (전투 시작 시 초기화)

const PUANG_MAX_PER_FLOOR  = 2;  // 층당 최대 2회로 제한
const PUANG_MAX_PER_BATTLE = 1;  // 전투당 최대 1회로 제한

// ── 버프 종류 정의 ──
const PUANG_BUFFS = {
  heal: {
    name: '💚 황금 치유',
    desc: 'HP 30% 회복',
    apply: () => {
      const amt = Math.floor(battlePlayerMaxHp * 0.3);
      battlePlayerHp = Math.min(battlePlayerMaxHp, battlePlayerHp + amt);
      localStorage.setItem('battlePlayerHp', battlePlayerHp);
      updateBattleBars();
      addBattleLog(`[푸앙 버프] 황금 치유 — HP +${amt}!`, 'log-success');
    }
  },
  shield: {
    name: '🛡️ 황금 방어막',
    desc: '다음 공격 무효화',
    apply: () => {
      window._puangShield = true;
      addBattleLog('[푸앙 버프] 황금 방어막 — 다음 공격을 막아냅니다!', 'log-success');
    }
  },
  attack_up: {
    name: '⚡ 황금 강화',
    desc: '다음 턴 공격력 2배',
    apply: () => {
      window._puangAttackUp = true;
      addBattleLog('[푸앙 버프] 황금 강화 — 다음 공격이 2배로 강해집니다!', 'log-success');
    }
  },
  extra_turn: {
    name: '🌀 황금 연속기',
    desc: '이번 턴 한 번 더',
    apply: () => {
      window._puangExtraTurn = true;
      addBattleLog('[푸앙 버프] 황금 연속기 — 한 번 더 공격하세요!', 'log-success');
      // 버튼 재활성화
      if (typeof setBattleButtons === 'function') setBattleButtons(false);
      battleBusy = false;
    }
  },
  regen: {
    name: '✨ 황금 재생',
    desc: '3턴간 매 턴 HP 회복',
    apply: () => {
      playerStats._regenPerTurn = (playerStats._regenPerTurn || 0) + 8;
      playerStats._regenTurns  = 3;
      addBattleLog('[푸앙 버프] 황금 재생 — 3턴간 매 턴 HP +8!', 'log-success');
    }
  },
  damage_reduce: {
    name: '💫 황금 결계',
    desc: '3턴간 피해 40% 감소',
    apply: () => {
      window._puangDamageReduce = 3;
      addBattleLog('[푸앙 버프] 황금 결계 — 3턴간 피해가 40% 감소합니다!', 'log-success');
    }
  }
};

// ================================================================
// LLM 판단 함수
// ================================================================
async function askPuangBuff(buffPool) {
  if (!GROQ_API_KEY) {
    // API 없으면 풀에서 랜덤 선택
    return buffPool[Math.floor(Math.random() * buffPool.length)];
  }
 
  const hpRatio    = battlePlayerHp / battlePlayerMaxHp;
  const enemyRatio = enemyHp / enemyMaxHp;
 
  const prompt = `너는 푸앙이야. 지금 친구가 전투 중이야.
현재 상황:
- 플레이어 HP: ${battlePlayerHp}/${battlePlayerMaxHp} (${Math.round(hpRatio*100)}%)
- 적 HP: ${enemyHp}/${enemyMaxHp} (${Math.round(enemyRatio*100)}%)
- 현재 턴: ${battleTurn}턴
 
사용 가능한 버프: ${buffPool.join(', ')}
이 중에서 지금 상황에 가장 적합한 버프 하나만 골라줘.
 
JSON 형식으로만 답해:
{"buff": "${buffPool[0]}"}`;
 
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 50,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      })
    });
 
    const data  = await res.json();
    const text  = data.choices?.[0]?.message?.content?.trim() || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
 
    // 버프 풀에 없는 값이면 랜덤 선택
    return buffPool.includes(parsed.buff) ? parsed.buff : buffPool[Math.floor(Math.random() * buffPool.length)];
  } 
  
  catch (e) {
    console.warn('[푸앙 버프] LLM 실패, 랜덤 선택:', e);
    return buffPool[Math.floor(Math.random() * buffPool.length)];
  }
}

// ================================================================
// 난입 연출 + 버프 적용
// ================================================================
window.triggerPuangIntervention = async function(buffType) {
  puangFloorInterventionCount++;
  puangBattleInterventionCount++;

  // 전투 버튼 잠금
  if (typeof setBattleButtons === 'function') setBattleButtons(true);
  battleBusy = true;

  // 1단계: 배경 어둡게
  const overlay = _createBattleOverlay();
  await sleepMs(300);

  // 2단계: 푸앙이 등장 텍스트
  addBattleLog('✨ 푸앙이가 나타났다!', 'log-system2');
  _showPuangAppearText(overlay);
  await sleepMs(800);

  // 3단계: 황금주사위 영상 재생
  await _playPuangDiceVideo(overlay);

  // 4단계: 버프 적용
  const buff = PUANG_BUFFS[buffType] || PUANG_BUFFS['heal'];
  addBattleLog(`[✨ 푸앙 난입] ${buff.name} — ${buff.desc}`, 'log-system2');
  buff.apply();
  await sleepMs(500);

  // 5단계: 오버레이 제거
  overlay.remove();

  // extra_turn이 아닐 때만 버튼 복귀
  if (buffType !== 'extra_turn') {
    if (typeof setBattleButtons === 'function') setBattleButtons(false);
    battleBusy = false;
  }

  updateBattleBars();
};

// ================================================================
// 배경 오버레이 생성
// ================================================================
function _createBattleOverlay() {
  const existing = document.getElementById('puang-battle-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'puang-battle-overlay';
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,10,0); z-index:3000;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    transition:background .4s;
  `;
  document.body.appendChild(overlay);

  // 페이드인
  requestAnimationFrame(() => {
    overlay.style.background = 'rgba(0,0,10,0.85)';
  });

  return overlay;
}

// ================================================================
// 푸앙이 등장 텍스트 연출
// ================================================================
function _showPuangAppearText(overlay) {
  const text = document.createElement('div');
  text.style.cssText = `
    color:#ffd700; font-size:22px; font-weight:800;
    letter-spacing:3px; opacity:0; transform:scale(0.8);
    transition:all .4s; text-align:center; margin-bottom:12px;
    text-shadow:0 0 20px rgba(255,215,0,0.8);
  `;
  text.textContent = '✨ 푸앙이 난입! ✨';
  overlay.appendChild(text);

  requestAnimationFrame(() => {
    text.style.opacity = '1';
    text.style.transform = 'scale(1.1)';
  });
}

// ================================================================
// 황금주사위 영상 재생
// ================================================================
function _playPuangDiceVideo(overlay) {
  return new Promise(resolve => {
    const video = document.createElement('video');
    video.src = 'videos/puang_dice.mp4';
    video.style.cssText = `
      max-width:480px; width:90%; border-radius:16px;
      box-shadow:0 0 40px rgba(255,215,0,0.5);
    `;
    video.muted = false;
    video.autoplay = true;
    overlay.appendChild(video);

    video.onended = () => resolve();
    video.onerror = () => resolve(); // 영상 실패해도 진행

    // 최대 5초 대기 (영상이 너무 길면 강제 진행)
    setTimeout(() => { video.pause(); resolve(); }, 5000);
  });
}

// ================================================================
// enemyTurn 이후 자동 호출 — battle.js에서 연결
// ================================================================
window.checkPuangIntervention = async function() {
  if (!localStorage.getItem('lakeUnlocked')) return;
  if (puangFloorInterventionCount  >= PUANG_MAX_PER_FLOOR)  return;  // 층당 2회
  if (puangBattleInterventionCount >= PUANG_MAX_PER_BATTLE) return;  // 전투당 1회
  if (enemyHp <= 0 || battlePlayerHp <= 0) return;

  // ★ 1단계: HP 비율에 따른 발동 확률 체크
  const hpRatio = battlePlayerHp / battlePlayerMaxHp;
  const triggerChance = hpRatio < 0.4 ? 0.90   // 위급(HP 40% 미만) — 90%
                      : hpRatio < 0.7 ? 0.50   // 위험(HP 40-70%) — 50%
                      : 0.01;                   // 여유(HP 70% 이상) — 1%
  if (Math.random() > triggerChance) return;
 
  // ★ 2단계: HP 비율에 따른 버프 풀 결정
  const buffPool = hpRatio < 0.4
    ? ['heal', 'shield', 'damage_reduce']
    : hpRatio < 0.7
      ? ['shield', 'damage_reduce', 'regen', 'attack_up']
      : ['attack_up', 'extra_turn', 'regen'];

  const buff = await askPuangBuff(buffPool);
  if (!buff) return;
 
  console.log(`[푸앙 난입] 버프: ${buff}, HP: ${Math.round(hpRatio*100)}%`);
  await sleepMs(400);
  await window.triggerPuangIntervention(buff);
};

// ================================================================
// 전투 시작 시 카운터 초기화 (battle.js의 initBattle에서 호출)
// ================================================================
window.resetPuangIntervention = function() {
  puangBattleInterventionCount = 0;
  window._puangShield      = false;
  window._puangAttackUp    = false;
  window._puangExtraTurn   = false;
  window._puangDamageReduce = 0;
};

// ================================================================
// 방어막 버프 적용 (battle.js의 enemyTurn에서 참조)
// ================================================================
window.applyPuangShield = function(dmg) {
  if (window._puangShield) {
    window._puangShield = false;
    addBattleLog('[푸앙 방어막] 공격을 완전히 막아냈다!', 'log-success');
    return 0;
  }
  if (window._puangDamageReduce > 0) {
    window._puangDamageReduce--;
    addBattleLog(`[푸앙 결계] 피해 40% 감소! (${window._puangDamageReduce}턴 남음)`, 'log-success');
    return Math.floor(dmg * 0.6);
  }
  return dmg;
};

// ================================================================
// 공격력 강화 버프 적용 (battle.js의 doCmd attack에서 참조)
// ================================================================
window.applyPuangAttackUp = function(dmg) {
  if (window._puangAttackUp) {
    window._puangAttackUp = false;
    addBattleLog('[푸앙 강화] 공격력 2배 발동!', 'log-success');
    return dmg * 2;
  }
  return dmg;
};
