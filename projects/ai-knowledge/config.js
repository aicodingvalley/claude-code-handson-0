export const CONFIG = {
  useMock: true,
  model: "gpt-4o",
  personas: [
    { key: "cfo",       name: "김기획", emoji: "💼", color: "#6366f1", short: "전략적 기획 관점" },
    { key: "marketer",  name: "조마케", emoji: "📢", color: "#ec4899", short: "MZ 마케팅 관점" },
    { key: "developer", name: "이개발", emoji: "⚙️", color: "#334155", short: "깐깐한 시스템 관점" },
    { key: "designer",  name: "박디자", emoji: "🎨", color: "#8b5cf6", short: "감성 브랜드 관점" }
  ],
  data: {
    personaPath: "./data/personas/",
    result:      "./data/brainstorm-result.json",
    mindmap:     "./data/mindmap-data.json"
  }
};
