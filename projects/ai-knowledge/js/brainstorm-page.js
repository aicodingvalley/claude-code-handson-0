// brainstorm.html (E1) — 카톡 스타일 멀티 페르소나 브레인스토밍 + 인터랙티브 질문
import { runBrainstorm } from "./personas.js";
import { CONFIG } from "../config.js";

const messagesEl = document.getElementById("messages");
const personasEl = document.getElementById("personas-bar");
const askForm    = document.getElementById("ask-form");
const askInput   = document.getElementById("ask-input");
const askSubmit  = document.getElementById("ask-submit");

let busy = false;

(() => {
  const today = new Date();
  const dayKor = ["일","월","화","수","목","금","토"][today.getDay()];
  const dateLabel = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일 (${dayKor})`;

  messagesEl.innerHTML = `
    <span class="bs-pill">${dateLabel}</span>
    <span class="bs-system">🧠 페르소나 ${CONFIG.personas.length}명 입장 · 주제를 입력하면 동시에 답변해요</span>
    <div class="bs-empty">아래 입력창에 브레인스토밍 주제를 적어보세요 ✍️</div>
  `;

  personasEl.innerHTML = `<span style="color:#94a3b8">참여 페르소나:</span>` +
    CONFIG.personas.map(p => `<span class="chip">${p.emoji} ${p.name}</span>`).join("") +
    `<span style="color:var(--color-brand-dark);font-weight:600">+ 추가</span>`;

  askInput?.focus();
})();

/* ── 입력 → 페르소나 응답 시퀀스 ── */
askForm?.addEventListener("submit", async e => {
  e.preventDefault();
  if (busy) return;
  const topic = askInput.value.trim();
  if (!topic) return;
  askInput.value = "";
  busy = true;
  askSubmit.disabled = true;
  askInput.disabled = true;

  // 기존 CTA / 빈 상태 문구 제거
  messagesEl.querySelector(".bs-cta")?.remove();
  messagesEl.querySelector(".bs-empty")?.remove();

  appendUserBubble(topic, nowTs(), CONFIG.personas.length);
  scrollToBottom();

  // 페르소나별로 약간씩 시차를 두고 "입력 중…" → 답변
  const results = await Promise.all(CONFIG.personas.map((p, i) => respondAs(p, topic, i)));

  // 마인드맵 페이지에서 사용할 수 있도록 세션 저장
  sessionStorage.setItem("brainstorm:last", JSON.stringify({
    topic,
    askedAt: nowTs(),
    personas: results.map(r => ({ key: r.key, name: r.name, emoji: r.emoji, color: r.color, points: r.points })),
  }));

  appendCta(CONFIG.personas.length);
  scrollToBottom();
  busy = false;
  askSubmit.disabled = false;
  askInput.disabled = false;
  askInput.focus();
});

async function respondAs(p, topic, idx) {
  await wait(400 + idx * 600);
  const typing = appendTypingBubble(p);
  scrollToBottom();
  await wait(1100 + Math.random() * 900);
  const answer = composeAnswer(p.key, topic);
  // 타이핑 버블을 실제 메시지로 교체 (스트리밍)
  const row = typing.row;
  const bubble = typing.bubble;
  bubble.classList.remove("typing");
  bubble.innerHTML = "";
  const ts = nowTs();
  await typeInto(bubble, answer.html);
  // 마인드맵 leaf로 갈 핵심 키워드를 칩으로 명시
  if (answer.points?.length) {
    const chipBlock = document.createElement("div");
    chipBlock.className = "key-chips";
    chipBlock.style.cssText = `--chip-color:${p.color}`;
    chipBlock.innerHTML = `<span class="kc-label">핵심</span>` +
      answer.points.map(pt => `<span class="kc">${pt}</span>`).join("");
    bubble.appendChild(chipBlock);
  }
  // 반응 영역 추가
  const reactions = document.createElement("div");
  reactions.className = "reactions";
  reactions.innerHTML = `<button>👍 ${1 + Math.floor(Math.random() * 8)}</button><button>${pickTag(p.key)} ${1 + Math.floor(Math.random() * 5)}</button><span class="ts">${ts}</span>`;
  row.querySelector(".body").appendChild(reactions);
  scrollToBottom();
  return { key: p.key, name: p.name, emoji: p.emoji, color: p.color, points: answer.points };
}

/* ── 렌더 유틸 ── */
function appendUserBubble(topic, ts, readCount) {
  const wrap = document.createElement("div");
  wrap.className = "bs-user-row";
  wrap.innerHTML = `
    <div>
      <div class="bs-user-bubble">${escapeHtml(topic)}</div>
      <div class="bs-user-meta">${ts} · 읽음 ${readCount}</div>
    </div>`;
  messagesEl.appendChild(wrap);
}

function appendBotMessage(p, message, r) {
  const row = document.createElement("div");
  row.className = "bs-bot-row";
  row.innerHTML = `
    <div class="avatar" style="background:${p.color}">${p.emoji}</div>
    <div class="body">
      <div class="name">${p.name} <span class="role">· ${p.short}</span></div>
      <div class="bubble">${message}</div>
      <div class="reactions">
        <button>👍 ${r.likes}</button>
        <button>${r.tag} ${r.tagCount}</button>
        <span class="ts">${r.ts}</span>
      </div>
    </div>`;
  messagesEl.appendChild(row);
}

function appendTypingBubble(p) {
  const row = document.createElement("div");
  row.className = "bs-bot-row";
  row.innerHTML = `
    <div class="avatar" style="background:${p.color}">${p.emoji}</div>
    <div class="body">
      <div class="name">${p.name} <span class="role">· ${p.short}</span></div>
      <div class="bubble typing"><span class="td"></span><span class="td"></span><span class="td"></span></div>
    </div>`;
  messagesEl.appendChild(row);
  return { row, bubble: row.querySelector(".bubble") };
}

function appendCta(count) {
  messagesEl.querySelector(".bs-cta")?.remove();
  const a = document.createElement("a");
  a.href = "./mindmap.html";
  a.className = "bs-cta";
  a.textContent = `🗺️ ${count}명의 의견 마인드맵으로 정리하기 →`;
  messagesEl.appendChild(a);
}

async function typeInto(el, html) {
  // 텍스트 노드를 한 글자씩 늘리되 HTML 태그는 즉시 처리
  // 단순화를 위해 텍스트 길이 기반으로 substring 사용
  const total = html.length;
  let i = 0;
  while (i < total) {
    i = Math.min(total, i + 2);
    el.innerHTML = html.slice(0, i) + '<span class="bs-cursor">▍</span>';
    await wait(10);
  }
  el.innerHTML = html;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function personaOf(key) { return CONFIG.personas.find(p => p.key === key); }
function pickTag(key) {
  return { cfo: "💡", marketer: "🔥", developer: "🎯", designer: "🥺" }[key] ?? "✨";
}
function nowTs() {
  const d = new Date(); const h = d.getHours(); const m = d.getMinutes();
  const ap = h < 12 ? "오전" : "오후"; const hh = ((h + 11) % 12) + 1;
  return `${ap} ${hh}:${String(m).padStart(2, "0")}`;
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

/* ── 페르소나 답변 생성기 (목업) ──
   실제 환경에서는 OpenAI에 4명 페르소나 시스템 프롬프트와 함께 호출.
   여기서는 사용자의 주제를 페르소나 톤으로 감싸서 보여줍니다. */
function composeAnswer(key, topic) {
  const t = escapeHtml(topic);
  const templates = {
    cfo: [
      { html: `먼저 <strong>전체 그림</strong>부터 잡아야 합니다. 목표·KPI·실행 순서가 정리되지 않으면 다음 단계로 갈 수 없습니다.`, points: ["성공 KPI 정의", "실행 순서 합의", "다음 단계 명시"] },
      { html: `이 안건의 <strong>성공 기준</strong>이 무엇인지부터 합의해야 합니다. 목표 숫자 한 개, 기간 한 개, 측정 방식 한 개가 명시되지 않으면 모든 의사결정이 주관이 됩니다.`, points: ["목표 숫자 1개", "기간 1개", "측정 방식 1개"] },
      { html: `기획 단계에서 세 가지부터 정리되어야 합니다.<br><br>· 목표 (무엇을, 언제까지)<br>· <strong>측정 가능한 KPI 3개</strong> 사전 정의<br>· <strong>2주 한정 실험</strong>으로 검증 후 확장<br><br>이 순서가 지켜져야 다음 회의가 의미를 가집니다.`, points: ["목표·기한 명시", "KPI 3개 정의", "2주 단위 실험"] },
      { html: `한 가지 묻겠습니다. 이 안건이 성공했다면 <strong>3개월 뒤 어떤 지표</strong>가 어떻게 바뀌어 있어야 합니까. 그 숫자가 없으면 실행을 시작할 수 없습니다.`, points: ["3개월 후 지표", "성공/실패 기준선"] },
    ],
    marketer: [
      { html: `이거 트렌드 흐름 잘 타면 <strong>인스타 릴스 한 방</strong>입니다. 짧고 인용 가능한 카피 한 줄부터 잡읍시다.`, points: ["인스타 릴스 집중", "한 줄 카피"] },
      { html: `자연 도달이 광고비를 이길 수 있는 구조입니다. <strong>UGC 챌린지</strong> + 댓글 유도형 후크 + 인플루언서 1차 → 우리 계정 2차 리포스트, 이 사이클이 한 번 돌면 광고비 50%는 콘텐츠 제작에 박아두는 게 맞습니다.`, points: ["UGC 챌린지", "댓글 유도 후크", "인플루언서 리포스트"] },
      { html: `3일 안에 시안 한 장 떼고 가야 합니다.<br><br>✅ <strong>MZ 인플루언서 5명</strong> 한 달 협업<br>✅ <strong>UGC 챌린지</strong> 한 줄 카피로 통일<br>✅ 댓글 유도형 후크 (질문형 카피)<br><br>광고비보다 첫 콘텐츠의 임팩트가 먼저입니다.`, points: ["MZ 인플루언서 5명", "UGC 챌린지", "질문형 카피"] },
      { html: `한 가지만 봅시다. 이 안건을 <strong>한 줄 캐치프레이즈</strong>로 만든다면 뭐가 됩니까. 그게 또렷하지 않으면 인스타에서도, 검색에서도 안 걸립니다.`, points: ["한 줄 캐치프레이즈", "검색 키워드 설계"] },
    ],
    developer: [
      { html: `이거 실행 전에 <strong>퍼널부터</strong> 봅시다. 어느 단계에서 새고 있는지 측정되지 않으면 광고도 의미 없습니다.`, points: ["퍼널 단계별 측정", "이탈 지점 식별"] },
      { html: `<strong>측정 가능한 이벤트 트래킹</strong>부터 깔아야 합니다. GA4 이벤트 매핑, 서버 로그와 클라이언트 이벤트 대조, A/B 그룹 1:1 분리. 이거 없이 캠페인 돌리면 뭐가 효과인지 영영 모릅니다.`, points: ["GA4 이벤트 매핑", "A/B 그룹 분리", "로그 대조"] },
      { html: `광고 전에 세 가지부터 끝내야 합니다.<br><br>· 가입/결제 페이지 이탈률 측정<br>· 모바일 LCP 2초 이내 보장<br>· <strong>SNS 간편가입 1-탭</strong> 추가<br><br>이 3개만 해도 전환 +15%는 보장됩니다.`, points: ["이탈률 측정", "LCP 2초 이내", "SNS 1-탭 가입"] },
      { html: `한 가지 묻겠습니다. 지금 우리 회원가입 플로우 <strong>이탈률</strong> 수치를 가지고 있습니까. 없으면 추측만 쌓이고 실제 문제는 그대로입니다.`, points: ["가입 플로우 이탈률", "데이터 기반 의사결정"] },
    ],
    designer: [
      { html: `숫자도 중요하지만, 본질은 <strong>감정</strong>입니다. 사람이 움직이는 건 기능이 아니라 작은 안심입니다.`, points: ["감정 우선", "안심 신호"] },
      { html: `결과가 아니라 <strong>장면</strong>을 보여줘야 합니다. "내 가족에게 주는 작은 선물" 같은 톤, 패키지에 손편지 한 줄. 가입은 결과일 뿐이고, 먼저 <strong>사랑받는 것</strong>이 순서입니다.`, points: ["장면 중심 메시지", "한 줄 손편지 톤"] },
      { html: `브랜드는 기억되는 장면이 만듭니다.<br><br>· 한 컷에 담기는 <strong>상징적 이미지</strong> 한 장<br>· 짧은 영상 시리즈 (15초 × 7편)<br>· 카피보다 <strong>여백</strong>이 먼저인 디자인<br><br>이 셋이 모이면 사용자가 자기 SNS에 올리고 싶어집니다.`, points: ["상징 이미지 한 장", "15초 영상 시리즈", "여백 있는 디자인"] },
      { html: `한 가지만 묻겠습니다. 이 서비스를 한 장의 사진으로 표현한다면 어떤 장면입니까. 그게 안 떠오르면, 브랜드는 아직 만들어지지 않은 겁니다.`, points: ["대표 장면 한 컷", "브랜드 정체성"] },
    ],
  };
  const arr = templates[key] || [{ html: "...", points: [] }];
  return arr[Math.floor(Math.random() * arr.length)];
}
