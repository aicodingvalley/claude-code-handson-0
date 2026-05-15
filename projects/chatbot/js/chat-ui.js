// 챗봇 화면 컨트롤러
import { chatCompletion } from "./api.js";
import { buildSystemPrompt } from "./rag.js";

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// 멀티턴 대화 히스토리
const history = [];

/** 화면에 메시지 버블 추가 */
function appendMessage(role, text, sources = null) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${role} fade-in`;

  if (role === "bot") {
    wrap.innerHTML = `
      <div class="avatar-sm">🥬</div>
      <div>
        <div class="bubble"></div>
        ${sources ? `<div class="meta">📚 ${sources.join(" · ")}</div>` : ""}
      </div>`;
    wrap.querySelector(".bubble").innerHTML = text;
  } else {
    wrap.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  }

  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendTyping() {
  const wrap = document.createElement("div");
  wrap.id = "typing";
  wrap.className = "msg bot";
  wrap.innerHTML = `
    <div class="avatar-sm">🥬</div>
    <div><div class="bubble"><span class="typing-indicator"><span></span><span></span><span></span></span></div></div>`;
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function removeTyping() { document.getElementById("typing")?.remove(); }

async function send(text) {
  if (!text.trim()) return;
  appendMessage("user", text);
  history.push({ role: "user", content: text });
  inputEl.value = "";

  appendTyping();
  try {
    const systemPrompt = await buildSystemPrompt(text);
    const reply = await chatCompletion([
      { role: "system", content: systemPrompt },
      ...history
    ]);
    removeTyping();
    appendMessage("bot", reply.content, reply.sources);
    history.push({ role: "assistant", content: reply.content });
  } catch (err) {
    removeTyping();
    appendMessage("bot", `⚠️ 답변 생성 중 오류가 발생했어요. (${err.message})`);
  }
}

/** 초기 시연 대화: sample-conversation.json을 빠르게 재생 */
async function playInitialDemo() {
  const samples = await fetch("./data/sample-conversation.json").then(r => r.json());
  // 처음 인사
  appendMessage("bot", `안녕하세요 고객님! 싱싱박스 상담원 <strong>뚜비</strong>예요 🌿<br>무엇을 도와드릴까요?`);
  // 처음 두 개만 자동 재생
  for (const s of samples.slice(0, 2)) {
    await new Promise(r => setTimeout(r, 600));
    appendMessage("user", s.question);
    history.push({ role: "user", content: s.question });
    appendTyping();
    await new Promise(r => setTimeout(r, 900));
    removeTyping();
    appendMessage("bot", s.answer, s.sources);
    history.push({ role: "assistant", content: s.answer });
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
}

// 이벤트 바인딩
sendBtn.addEventListener("click", () => send(inputEl.value));
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inputEl.value); }
});
document.querySelectorAll(".quick-replies button").forEach(b => {
  b.addEventListener("click", () => send(b.textContent));
});

// 시작
playInitialDemo();
