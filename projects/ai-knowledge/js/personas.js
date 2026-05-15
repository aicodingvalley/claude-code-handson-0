// Claude Code Subagent로 정의된 페르소나를 로딩해 OpenAI 호출에 시스템 프롬프트로 주입.
import { CONFIG } from "../config.js";

/**
 * 단일 페르소나 .md 로드
 * @param {string} key  cfo / marketer / developer / designer
 */
export async function loadPersona(key) {
  const meta = CONFIG.personas.find(p => p.key === key);
  const md = await fetch(`${CONFIG.data.personaPath}${key}.md`).then(r => r.text());
  return { ...meta, systemPrompt: md };
}

/** 모든 페르소나 동시 로드 */
export async function loadAllPersonas() {
  return Promise.all(CONFIG.personas.map(p => loadPersona(p.key)));
}

/**
 * 한 주제에 대해 모든 페르소나에게 병렬 호출.
 * 데모에서는 brainstorm-result.json을 그대로 반환.
 */
export async function runBrainstorm(topic) {
  if (CONFIG.useMock) {
    const data = await fetch(CONFIG.data.result).then(r => r.json());
    await new Promise(r => setTimeout(r, 500));
    return data;
  }
  // 실제 구현 자리:
  // const personas = await loadAllPersonas();
  // const responses = await Promise.all(personas.map(p =>
  //   openai.chat.completions.create({
  //     model: CONFIG.model,
  //     messages: [
  //       { role: "system", content: p.systemPrompt },
  //       { role: "user",   content: topic }
  //     ]
  //   })
  // ));
  // return { topic, responses };
  throw new Error("실제 모드는 OPENAI_API_KEY 주입 후 활성화");
}
