# ai-knowledge — 멀티 페르소나 브레인스토밍 + 마인드맵

Claude Code 핸즈온 **E 섹션** 결과물입니다.

| 강의 | 파일 | 내용 |
|------|------|------|
| **E1** | `brainstorm.html` | CFO·마케터·개발자·디자이너 4명 페르소나가 동시에 답하는 카톡방 |
| **E2** | `mindmap.html` | E1의 의견을 AI가 구조화한 인터랙티브 마인드맵 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5177
```

## 환경 변수

```bash
cp .env.example .env
# OPENAI_API_KEY=sk-...
```

## 폴더 구조

```
ai-knowledge/
├── package.json
├── README.md
├── .env.example
├── config.js                   # 페르소나 목록, 모델
├── brainstorm.html             # E1
├── mindmap.html                # E2
├── css/
│   ├── base.css
│   ├── brainstorm.css          # 카톡 스타일
│   └── mindmap.css
├── js/
│   ├── personas.js             # 페르소나 .md 로더 + OpenAI 호출 래퍼
│   ├── brainstorm-page.js      # E1
│   └── mindmap-page.js         # E2 (vis-network)
└── data/
    ├── personas/               # Claude Code Subagent .md (4명)
    │   ├── cfo.md
    │   ├── marketer.md
    │   ├── developer.md
    │   └── designer.md
    ├── brainstorm-result.json  # E1 시연 대화
    └── mindmap-data.json       # E2 마인드맵 노드/엣지
```

## 핵심 학습 포인트

- Claude Code **Subagent**로 페르소나 정의 → `data/personas/*.md`
- 4명에게 **병렬 호출** → `js/personas.js` `runBrainstorm()`
- 마인드맵 시각화 → `js/mindmap-page.js` (vis-network CDN)
