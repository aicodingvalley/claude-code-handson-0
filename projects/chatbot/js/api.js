// OpenAI Chat Completions API 래퍼.
// CONFIG.useMock === true 면 실제 호출 없이 sample-conversation.json 으로 답변.
import { CONFIG } from "../config.js";

/**
 * @param {Array<{role:string, content:string}>} messages
 * @param {Object} [opts]
 * @returns {Promise<{content:string, tokens:number, model:string}>}
 */
export async function chatCompletion(messages, opts = {}) {
  if (CONFIG.useMock) {
    return mockReply(messages);
  }

  const apiKey = window.OPENAI_API_KEY; // 실제 운영에서는 백엔드 프록시 권장
  if (!apiKey) throw new Error("OPENAI_API_KEY 누락: config.js의 useMock을 true로 두거나 키를 주입하세요.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: opts.model ?? CONFIG.model,
      temperature: opts.temperature ?? CONFIG.temperature,
      messages
    })
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}`);
  const json = await res.json();
  return {
    content: json.choices[0].message.content,
    tokens: json.usage?.total_tokens ?? 0,
    model: json.model
  };
}

/** 데모용: 사용자 질문에 가장 유사한 sample 답변을 반환 */
async function mockReply(messages) {
  const userMsg = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const samples = await fetch("./data/sample-conversation.json").then(r => r.json());
  const hit = samples.find(s => similarity(userMsg, s.question) > 0.35) || samples[0];
  // 짧은 의도적 지연 — 진짜 호출처럼 보이게
  await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
  return {
    content: hit.answer,
    sources: hit.sources,
    tokens: Math.round(120 + Math.random() * 80),
    model: "gpt-4o-mini (mock)"
  };
}

/** 매우 단순한 자카드 유사도 */
function similarity(a, b) {
  const sa = new Set(a.replace(/\s+/g, "").toLowerCase().split(""));
  const sb = new Set(b.replace(/\s+/g, "").toLowerCase().split(""));
  const inter = [...sa].filter(c => sb.has(c)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}
