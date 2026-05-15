// index.html (D1) — 실시간 협업 · AI 회의록 · 실시간 번역 데모
import { loadChannels, loadMembers, loadMessages } from "./realtime-mock.js";
import { renderMessage, renderDateDivider } from "./message-list.js";

const channelListEl = document.getElementById("channel-list");
const dmListEl      = document.getElementById("dm-list");
const messagesEl    = document.getElementById("messages");
const membersEl     = document.getElementById("members");

const sendForm   = document.getElementById("send-form");
const sendInput  = document.getElementById("send-input");
const typingEl   = document.getElementById("typing-indicator");
const typingText = document.getElementById("typing-text");

const autoTrBtn   = document.getElementById("auto-translate-toggle");
const trState     = document.getElementById("translate-state");

const openNotesBtn = document.getElementById("open-notes");
const closeNotesBtn = document.getElementById("close-notes");
const notesPanel = document.getElementById("notes-panel");
const notesOverlay = document.getElementById("notes-overlay");
const notesBody = document.getElementById("notes-body");
const notesMeta = document.getElementById("notes-meta");

let messages = [];
let autoTranslate = false;
let currentChannel = null;
let channels = [];

const CHANNEL_META = {
  general:   { sub: "팀원 12명 · 회사 전체 채널",         empty: "이 채널의 첫 메시지를 남겨보세요." },
  marketing: { sub: "팀원 5명 · 캠페인 · GA · 광고 운영", empty: "캠페인 관련 이야기를 시작해보세요." },
  dev:       { sub: "팀원 6명 · 배포 · PR 리뷰 · 알림",   empty: "오늘의 PR/배포 이야기를 시작해보세요." },
  design:    { sub: "팀원 3명 · UI 시안 · 디자인 시스템", empty: "아직 메시지가 없어요. 첫 글을 남겨보세요." },
  support:   { sub: "팀원 4명 · CS 티켓 · CSAT · 환불",    empty: "오늘의 인입 이슈를 정리해보세요." },
  random:    { sub: "팀원 12명 · 잡담 · 점심 메뉴 추천",   empty: "아직 메시지가 없어요." },
};

const channelTitleEl = document.getElementById("channel-title");
const channelSubEl   = document.getElementById("channel-sub");

(async () => {
  const [chs, members, msgs] = await Promise.all([
    loadChannels(), loadMembers(), loadMessages("general")
  ]);
  channels = chs;
  messages = msgs;
  currentChannel = "general";

  // 채널 / DM
  renderSidebar();

  // 멤버
  renderMembers(members);

  // 메시지
  renderAllMessages();

  // 채널 클릭 → 전환
  channelListEl.addEventListener("click", e => {
    const li = e.target.closest("li[data-key]");
    if (!li) return;
    switchChannel(li.dataset.key);
  });

  // 데모: 후보를 순차적으로 1번씩만 (반복 X)
  scheduleNextIncoming(6000);
})();

let incomingTimer = null;
function scheduleNextIncoming(delay) {
  clearTimeout(incomingTimer);
  incomingTimer = setTimeout(() => {
    if (simulateIncoming()) scheduleNextIncoming(20000);
  }, delay);
}

function renderSidebar() {
  channelListEl.innerHTML = channels.filter(c => c.type === "channel").map(c => `
    <li data-key="${c.key}" class="${c.key === currentChannel ? 'active' : ''}"># ${c.name}${c.unread ? `<span class="unread">${c.unread}</span>` : ""}</li>`).join("");
  dmListEl.innerHTML = channels.filter(c => c.type === "dm").map(c => `
    <li><span class="dot online" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:0.3rem"></span>${c.name}</li>`).join("");
}

async function switchChannel(key) {
  if (key === currentChannel) return;
  currentChannel = key;
  const ch = channels.find(c => c.key === key);
  if (!ch) return;
  // 안 읽음 뱃지 제거
  ch.unread = 0;
  renderSidebar();

  // 헤더 + 입력창 placeholder
  channelTitleEl.textContent = `# ${ch.name}`;
  channelSubEl.textContent = CHANNEL_META[key]?.sub ?? "";
  sendInput.placeholder = `#${ch.name}에 메시지 보내기`;

  // 메시지 로드 (없는 채널은 빈 상태)
  try {
    messages = await loadMessages(key);
  } catch {
    messages = [];
  }
  renderAllMessages();
}

function renderAllMessages() {
  if (!messages.length) {
    const empty = CHANNEL_META[currentChannel]?.empty ?? "아직 메시지가 없어요.";
    messagesEl.innerHTML = `<div class="empty-channel">💬 ${empty}</div>`;
    return;
  }
  messagesEl.innerHTML =
    renderDateDivider("오늘 · 2026년 5월 11일") +
    messages.map(m => renderMessage(m, { autoTranslate })).join("");
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMembers(members) {
  const online  = members.filter(m => m.status === "online");
  const away    = members.filter(m => m.status === "away");
  const offline = members.filter(m => m.status === "offline");
  membersEl.innerHTML = `
    <h4>온라인 — ${online.length}</h4>
    <ul>${online.map(m => `<li><span class="dot online"></span>${m.name}${m.isMe ? ' <span style="color:#94a3b8;font-size:0.7rem">(나)</span>' : ''}</li>`).join("")}</ul>
    <h4>자리 비움 — ${away.length}</h4>
    <ul>${away.map(m => `<li><span class="dot away"></span>${m.name}</li>`).join("")}</ul>
    <h4>오프라인 — ${offline.length}</h4>
    <ul>${offline.map(m => `<li><span class="dot offline"></span>${m.name}</li>`).join("")}</ul>
    <div class="tc-helper">💡 <strong>Realtime DB</strong>로 만들어서 누군가 메시지를 보내면 모든 접속자에게 즉시 전파돼요.</div>`;
}

/* ── 사이드바 토글 ── */
const sidebarToggle = document.getElementById("sidebar-toggle");
const shellEl = document.querySelector(".tc-shell");
const SIDEBAR_KEY = "teamchat:sidebar-collapsed";
if (localStorage.getItem(SIDEBAR_KEY) === "1") shellEl.classList.add("sidebar-collapsed");
sidebarToggle?.addEventListener("click", () => {
  shellEl.classList.toggle("sidebar-collapsed");
  localStorage.setItem(SIDEBAR_KEY, shellEl.classList.contains("sidebar-collapsed") ? "1" : "0");
});
// ⌘\ / Ctrl+\ 단축키
window.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
    e.preventDefault();
    sidebarToggle?.click();
  }
});

/* ── 1) 실시간 협업: 메시지 전송 + 타이핑 + 자동 수신 ── */

sendForm?.addEventListener("submit", e => {
  e.preventDefault();
  const text = sendInput.value.trim();
  if (!text) return;
  appendMessage({
    name: "AI 코딩밸리",
    ts: nowTs(),
    avatar: { letter: "나", color: "#fbbf24" },
    body: escapeHtml(text),
    mine: true,
  });
  sendInput.value = "";

  // 잠시 뒤 누군가 입력 중 → 답장
  setTimeout(() => showTyping("박세현"), 600);
  setTimeout(() => {
    hideTyping();
    appendMessage({
      name: "박세현",
      ts: nowTs(),
      avatar: { letter: "세", color: "#60a5fa" },
      body: pickReply(),
    });
  }, 2200);
});

const INCOMING_QUEUE = [
  { name: "최민지", avatar: { letter: "민", color: "#a78bfa" }, body: "방금 디자인 시스템에 새 토큰 추가했어요. <code>--brand-50</code> 부터 <code>--brand-900</code>까지요!" },
  { name: "Linda Chen", avatar: { letter: "L", color: "#2dd4bf" }, lang: "en", flag: "🇺🇸",
    body: "Posted the v2 spec in the Notion doc — could you review section 3 today?",
    translation: "Notion 문서에 v2 스펙 올렸어요 — 오늘 섹션 3 리뷰 가능하세요?" },
  { name: "이도윤", avatar: { letter: "도", color: "#34d399" }, body: "회의 5분 전이에요. 줌 링크 다시 올려둘게요 🔗" },
];
let incomingIdx = 0;
function simulateIncoming() {
  if (incomingIdx >= INCOMING_QUEUE.length) return false;
  const pick = INCOMING_QUEUE[incomingIdx++];
  showTyping(pick.name);
  setTimeout(() => {
    hideTyping();
    appendMessage({ ...pick, ts: nowTs() });
  }, 1500);
  return true;
}

function appendMessage(m) {
  messages.push(m);
  const wrap = document.createElement("div");
  wrap.innerHTML = renderMessage(m, { autoTranslate });
  const el = wrap.firstElementChild;
  el.classList.add("msg-incoming");
  if (m.mine) el.classList.add("mine");
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping(name) {
  typingText.textContent = `${name}님이 입력 중…`;
  typingEl.hidden = false;
}
function hideTyping() { typingEl.hidden = true; }

const REPLY_QUEUE = [
  "오 좋네요 👍 바로 반영해볼게요.",
  "넵 확인했습니다! 11시 미팅 안건에 같이 올릴게요.",
  "공유 감사합니다 🙏 정리해서 회신 드릴게요.",
  "흠 그 부분은 회의 때 같이 결정하시죠.",
];
let replyIdx = 0;
function pickReply() {
  const r = REPLY_QUEUE[replyIdx % REPLY_QUEUE.length];
  replyIdx++;
  return r;
}

/* ── 2) 실시간 번역: 인라인 칩 토글 + 헤더 자동 번역 토글 ── */

messagesEl.addEventListener("click", e => {
  const btn = e.target.closest('[data-action="toggle-translate"]');
  if (!btn) return;
  const row = btn.closest(".msg-row");
  const block = row.querySelector(".translate-block");
  if (!block) return;
  const wasCollapsed = block.classList.contains("is-collapsed");
  block.classList.toggle("is-collapsed");
  btn.textContent = wasCollapsed ? "🌐 원문 보기" : "🌐 번역 보기";
});

autoTrBtn?.addEventListener("click", () => {
  autoTranslate = !autoTranslate;
  autoTrBtn.classList.toggle("is-on", autoTranslate);
  trState.textContent = autoTranslate ? "ON" : "OFF";
  messagesEl.querySelectorAll(".msg-row").forEach(row => {
    if (row.dataset.lang === "ko") return;
    const block = row.querySelector(".translate-block");
    const chip = row.querySelector(".translate-chip");
    if (!block) return;
    block.classList.toggle("is-collapsed", !autoTranslate);
    if (chip) chip.textContent = autoTranslate ? "🌐 원문 보기" : "🌐 번역 보기";
  });
});

/* ── 3) AI 회의록: 슬라이드 패널 + 스트리밍 ── */

openNotesBtn?.addEventListener("click", () => openNotes());
closeNotesBtn?.addEventListener("click", () => closeNotes());
notesOverlay?.addEventListener("click", () => closeNotes());

function openNotes() {
  notesPanel.hidden = false;
  notesOverlay.hidden = false;
  requestAnimationFrame(() => {
    notesPanel.classList.add("open");
    notesOverlay.classList.add("open");
  });
  notesMeta.textContent = `최근 메시지 ${messages.length}건 기반 · GPT-4o · ${nowTs()}`;
  streamNotes();
}
function closeNotes() {
  notesPanel.classList.remove("open");
  notesOverlay.classList.remove("open");
  setTimeout(() => { notesPanel.hidden = true; notesOverlay.hidden = true; }, 200);
}

const NOTE_TEMPLATE = `## 🎯 핵심 결정
- 랜딩 시안은 **B안 확정**, CTA 크기를 키워 적용
- 인스타그램 릴스 캠페인 예산 유지, 다른 채널은 ROAS 보고 재조정

## 📊 공유된 수치
- 새 캠페인 **CTR 1.8배** (평균 대비)
- 랜딩 페이지 **이탈률 58%** — 카피 점검 필요

## 🌐 해외 팀 안건
- Linda(US): 영문 랜딩 카피 EOD까지 준비
- 田中(JP): 도쿄팀에 릴스 안건 공유, CVR 수치 요청

## ✅ 다음 액션
- [ ] 박세현 · 11시 미팅에 GA 데이터 공유
- [ ] AI 코딩밸리 · 카피 워딩 회의 안건 추가
- [ ] 김지원 · 미팅 후 B안 즉시 적용`;

let streamTimer = null;
function streamNotes() {
  clearTimeout(streamTimer);
  notesBody.innerHTML = `<div class="notes-thinking">🧠 대화를 분석하는 중…</div>`;
  setTimeout(() => {
    let i = 0;
    notesBody.innerHTML = "";
    function tick() {
      if (i >= NOTE_TEMPLATE.length) {
        notesBody.innerHTML = renderNoteMd(NOTE_TEMPLATE);
        return;
      }
      i = Math.min(NOTE_TEMPLATE.length, i + (Math.random() < 0.15 ? 3 : 1));
      notesBody.innerHTML = renderNoteMd(NOTE_TEMPLATE.slice(0, i)) + `<span class="notes-cursor">▍</span>`;
      streamTimer = setTimeout(tick, 18);
    }
    tick();
  }, 700);
}

function renderNoteMd(md) {
  return md.split("\n").map(line => {
    if (/^## /.test(line)) return `<h4>${line.slice(3)}</h4>`;
    if (/^- \[ \] /.test(line)) return `<div class="todo"><input type="checkbox" disabled/> ${inline(line.slice(6))}</div>`;
    if (/^- /.test(line)) return `<div class="bullet">• ${inline(line.slice(2))}</div>`;
    if (line.trim() === "") return "";
    return `<div>${inline(line)}</div>`;
  }).join("");
}
function inline(s) { return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }

/* ── 유틸 ── */
function nowTs() {
  const d = new Date();
  const h = d.getHours(); const m = d.getMinutes();
  const ap = h < 12 ? "오전" : "오후";
  const hh = ((h + 11) % 12) + 1;
  return `${ap} ${hh}:${String(m).padStart(2, "0")}`;
}
function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
