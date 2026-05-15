// 챗봇 + 블로그 생성기 공통 설정
// 클라이언트 직접 호출 구조 (학습용). 실제 운영에서는 백엔드 프록시 권장.

export const CONFIG = {
  // OpenAI
  model: "gpt-4o-mini",
  temperature: 0.7,

  // 데모 모드: 실제 키 없이 sample 데이터로 응답
  useMock: true,

  // RAG 설정
  rag: {
    topK: 4,
    embeddingModel: "text-embedding-3-small",
    docsPath: "./data/docs/",
    docFiles: ["faq.md", "service.md", "support-rules.md", "return-policy.md", "membership.md"]
  }
};

// 싱싱박스 상담원 페르소나 (A2 시스템 프롬프트의 베이스)
export const PERSONA = {
  company: "싱싱박스",
  description: "신선식품 새벽배송 쇼핑몰",
  agentName: "뚜비",
  scope: ["배송 조회", "교환/반품", "멤버십 혜택"],
  tone: "친구처럼 캐주얼한 부드러운 존댓말, 이모지 1~2개",
  forbidden: ["경쟁사 비방", "확인되지 않은 정보 제공", "개인정보 요청"]
};

// 블로그 생성기 (A3) 옵션
export const BLOG_OPTIONS = {
  audiences: ["30대 워킹맘", "1인 가구", "50대 부부", "대학생"],
  tones: ["친근한", "전문적", "따뜻한", "유머러스", "실용적", "감성적"],
  lengths: {
    short: { label: "짧게", target: 500 },
    medium: { label: "보통", target: 1200 },
    long: { label: "길게", target: 2500 }
  }
};
