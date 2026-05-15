// meeting-notes.html (D2) — 채팅 + AI 회의록 패널
import { loadMessages, loadMeetingNotes } from "./realtime-mock.js";
import { renderMessage, renderDateDivider } from "./message-list.js";

(async () => {
  const [msgs, notes] = await Promise.all([loadMessages("marketing"), loadMeetingNotes()]);

  // 채팅 메시지
  const messagesEl = document.getElementById("messages");
  messagesEl.innerHTML =
    renderDateDivider("오늘 · 11:00 — 11:42 (42분)") +
    msgs.map(renderMessage).join("") +
    `<div style="background:#f3e8ff;border:2px solid #ddd6fe;border-radius:0.5rem;padding:0.625rem 0.875rem;color:#6d28d9;font-size:0.75rem;display:flex;align-items:center;gap:0.5rem">
       <span style="font-size:1rem">🤖</span>
       <span><strong>AI Assistant</strong>가 회의록을 정리했어요. 우측 패널에서 확인하세요.</span>
       <span style="margin-left:auto;color:#a78bfa">11:42:18 · 1,920 토큰</span>
     </div>`;

  // 회의록 패널
  const notesEl = document.getElementById("notes");
  document.getElementById("notes-title").textContent = notes.title;
  document.getElementById("notes-meta").textContent  = notes.meta;
  notesEl.innerHTML = `
    <section class="notes-section decisions">
      <h4 class="decisions">✅ 결정 사항</h4>
      ${notes.decisions.map(d => `<div class="item"><strong>${d.title}</strong>: ${d.body}</div>`).join("")}
    </section>
    <section class="notes-section actions">
      <h4 class="actions">📋 액션 아이템</h4>
      ${notes.actions.map(a => `
        <div class="item">
          <div>
            <strong>${a.title}</strong>
            <div class="who-when">담당: ${a.owner} · 마감: ${a.due}</div>
          </div>
          <span class="pill">${a.status}</span>
        </div>`).join("")}
    </section>
    <section class="notes-section discussion">
      <h4 class="discussion">💬 주요 논의</h4>
      <div class="item">${notes.discussion}</div>
    </section>
    <section class="notes-section">
      <h4 class="next">⏭ 다음 회의 안건</h4>
      <ul style="margin:0;padding-left:1.25rem;color:#475569;font-size:0.875rem;line-height:1.8">
        ${notes.nextAgenda.map(n => `<li>${n}</li>`).join("")}
      </ul>
    </section>`;
})();
