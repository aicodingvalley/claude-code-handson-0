// AI 인사이트 생성 Skill 모사.
// 실제 운영에서는 OpenAI에 KPI 변화율을 JSON으로 던지고 구조화된 응답을 받음.
import { CONFIG } from "../config.js";

export async function generateInsights() {
  if (CONFIG.useMock) {
    const data = await fetch(CONFIG.data.insights).then(r => r.json());
    await new Promise(r => setTimeout(r, 400)); // API 호출 모사
    return data;
  }
  // ↓ 실제 호출 자리
  // const kpis = await fetch(...);
  // const res = await openai.chat.completions.create({
  //   model: CONFIG.ai.model,
  //   response_format: { type: "json_object" },
  //   messages: [
  //     { role: "system", content: insightSystemPrompt() },
  //     { role: "user",   content: JSON.stringify(kpis) }
  //   ]
  // });
  throw new Error("실제 모드는 OPENAI_API_KEY 주입 후 활성화");
}
