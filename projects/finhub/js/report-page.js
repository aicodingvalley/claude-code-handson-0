// report.html — AI 리포트 + 타이핑 애니메이션
import { getLatestReport, getReportIndex } from "./data-source.js";
import { renderMarkdown } from "./report-renderer.js";

const articleEl = document.getElementById("article");
const titleMetaEl = document.getElementById("title-meta");
const historyEl = document.getElementById("report-history");

(async () => {
  const report = await getLatestReport();
  titleMetaEl.textContent = `${report.date} (${report.dayKor}) · 자동 생성 · ${report.tokens.toLocaleString()} 토큰`;

  const idx = await getReportIndex();
  historyEl.innerHTML = idx.map((r, i) => `
    <li>
      <span>
        <span style="font-size:0.7rem;color:#94a3b8">${r.date}</span><br/>
        <span style="font-size:0.85rem">${r.title}</span>
      </span>
      <strong class="${i === 0 ? 'up' : ''}" style="font-size:0.7rem">${r.weekAgo}</strong>
    </li>`).join("");

  await typeReport(articleEl, report);
})();

async function typeReport(el, report) {
  const header = `<span class="badge">WEEKLY</span><span style="font-size:0.75rem;color:#64748b">${report.weekLabel}</span>`;
  const md = report.markdown;

  const CHAR_MS = 8;
  const NEWLINE_PAUSE = 80;

  let i = 0;
  let lastRender = 0;
  el.innerHTML = `${header}<span class="typing-cursor">▍</span>`;

  return new Promise(resolve => {
    function tick() {
      if (i >= md.length) {
        el.innerHTML = header + renderMarkdown(md);
        resolve();
        return;
      }
      const ch = md[i++];
      const now = performance.now();
      if (now - lastRender > 30 || ch === "\n") {
        el.innerHTML = header + renderMarkdown(md.slice(0, i)) + `<span class="typing-cursor">▍</span>`;
        lastRender = now;
      }
      const delay = ch === "\n" ? NEWLINE_PAUSE : CHAR_MS;
      setTimeout(tick, delay);
    }
    tick();
  });
}
