// translate.html (D3) — 다국어 채널 + 자동 번역
import { loadMessages, loadMembers } from "./realtime-mock.js";
import { renderMessage, renderDateDivider } from "./message-list.js";

(async () => {
  const [msgs, members] = await Promise.all([loadMessages("global"), loadMembers()]);

  const messagesEl = document.getElementById("messages");
  messagesEl.innerHTML =
    renderDateDivider("오늘 · 2026.05.11") +
    msgs.map(renderMessage).join("");

  const membersEl = document.getElementById("members");
  membersEl.innerHTML = members.map(m => {
    const dotClass = m.status === "online" ? "online" : m.status === "away" ? "away" : "offline";
    return `<li><span class="dot ${dotClass}"></span>${m.name} <span class="lang ${m.flag || 'KR'}">${m.flag || 'KR'}</span></li>`;
  }).join("");
})();
