// 블로그 자동 생성기 — A1·A2 패턴을 그대로 가져와 system prompt만 교체
import { chatCompletion } from "./api.js";
import { CONFIG, BLOG_OPTIONS } from "../config.js";

const form = document.getElementById("blog-form");
const articleEl = document.getElementById("article");
const tokenInfoEl = document.getElementById("token-info");

// 톤 칩 토글
document.querySelectorAll(".tone-chip").forEach(chip =>
  chip.addEventListener("click", () => chip.classList.toggle("selected"))
);
// 길이 버튼 단일 선택
document.querySelectorAll(".length-group button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".length-group button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

async function generate(topic, audience, tones, length) {
  const sample = await fetch("./data/sample-blog.json").then(r => r.json());

  const systemPrompt = `당신은 ${audience}을(를) 위한 따뜻하고 실용적인 블로그 작가입니다.
톤: ${tones.join(", ")}. 길이: ${BLOG_OPTIONS.lengths[length].target}자 내외.
H1 1개, H2 2~3개, H3 1~3개로 구성하고, 마지막에 행동을 유도하는 한 문장으로 마무리하세요.`;

  const userPrompt = `주제: "${topic}"\n위 주제로 블로그 글을 한 편 써주세요.`;

  const result = await chatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]);

  // 데모에서는 mock의 content가 sample-blog 첫 문장만 줄 수 있어, 풀 콘텐츠로 대체
  const markdown = (CONFIG.useMock ? sample.markdown : result.content);
  return { markdown, tokens: result.tokens, model: result.model };
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const topic = form.topic.value.trim();
  const audience = form.audience.value;
  const tones = [...document.querySelectorAll(".tone-chip.selected")].map(c => c.dataset.tone);
  const length = document.querySelector(".length-group button.selected").dataset.length;

  articleEl.innerHTML = `<div class="loading">생성 중…</div>`;
  const { markdown, tokens, model } = await generate(topic, audience, tones, length);
  articleEl.innerHTML = markdownToHtml(markdown);
  tokenInfoEl.textContent = `${tokens} 토큰 · ${model}`;
});

/** 매우 단순한 마크다운 → HTML */
function markdownToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  for (const line of lines) {
    if (/^# /.test(line))      out.push(`<h1>${line.replace(/^# /, "")}</h1>`);
    else if (/^## /.test(line)) out.push(`<h2>${line.replace(/^## /, "")}</h2>`);
    else if (/^### /.test(line))out.push(`<h3>${line.replace(/^### /, "")}</h3>`);
    else if (line.trim() === "")out.push("");
    else out.push(`<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
  }
  return out.join("\n");
}
