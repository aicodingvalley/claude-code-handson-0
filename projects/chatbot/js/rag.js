// 회사 문서를 로딩해 시스템 프롬프트에 주입하는 간소 RAG.
// 실제 강의에서는 임베딩 + 코사인 유사도로 top-k 청크 검색.
// 이 모듈은 학습용으로 "전체 문서를 그대로 시스템 프롬프트에 넣는" 방식까지 보여줘요.
import { CONFIG, PERSONA } from "../config.js";

let docsCache = null;

/** 모든 문서를 fetch해 마크다운 문자열로 반환 */
export async function loadDocs() {
  if (docsCache) return docsCache;
  const entries = await Promise.all(
    CONFIG.rag.docFiles.map(async (file) => {
      const text = await fetch(`${CONFIG.rag.docsPath}${file}`).then(r => r.text());
      return { file, text };
    })
  );
  docsCache = entries;
  return entries;
}

/** 단순 키워드 기반 top-k 청크 검색 (학습용) */
export function retrieve(query, docs, topK = CONFIG.rag.topK) {
  const tokens = query.replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter(Boolean);
  const chunks = docs.flatMap(d =>
    d.text.split(/\n(?=#{1,3} )/).map(chunk => ({ file: d.file, text: chunk }))
  );
  const scored = chunks.map(c => {
    const lower = c.text.toLowerCase();
    const score = tokens.reduce((s, t) => s + (lower.includes(t.toLowerCase()) ? 1 : 0), 0);
    return { ...c, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

/** 회사 페르소나 + 회사 문서 컨텍스트가 합쳐진 시스템 프롬프트 */
export async function buildSystemPrompt(query) {
  const docs = await loadDocs();
  const top = retrieve(query, docs);
  const ctx = top.map(t => `### ${t.file}\n${t.text}`).join("\n\n");

  return `당신은 ${PERSONA.company}의 고객상담 챗봇 '${PERSONA.agentName}'입니다.
- 회사 소개: ${PERSONA.description}
- 응대 영역: ${PERSONA.scope.join(", ")}
- 톤: ${PERSONA.tone}
- 금지: ${PERSONA.forbidden.join(", ")}

[참고 문서]
${ctx}

위 문서의 내용에 근거해 답하고, 문서에 없는 수치는 지어내지 마세요.`;
}
