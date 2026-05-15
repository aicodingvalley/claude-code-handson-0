# chatbot — 싱싱박스 고객상담 + 블로그 생성기

Claude Code 핸즈온 **A 섹션** 결과물입니다. AI를 서비스 안에 처음 붙여보는 두 가지 패턴을 같은 프로젝트에서 보여줍니다.

## 들어 있는 화면

| 강의 | 파일 | 내용 |
|------|------|------|
| **A2** | `chat.html` | 회사 문서 5개를 시스템 프롬프트에 주입한 RAG 챗봇 |
| **A3** | `blog.html` | 같은 패턴으로 만든 블로그 자동 생성기 |

`index.html`에서 두 페이지를 선택할 수 있어요.

## 실행

```bash
npm install
npm run dev          # http://localhost:5173 열림
```

Node가 없으면 `index.html`을 그냥 더블클릭해도 동작합니다. (CDN 의존성만 씀)

## 환경 변수

실제 운영에서는 `.env.example`을 복사해 `.env`로 만들고 키를 채워넣으세요:

```bash
cp .env.example .env
# OPENAI_API_KEY=sk-...
```

이번 데모는 키 없이도 동작하도록 **mock 응답**(`data/sample-conversation.json`, `data/sample-blog.json`)이 들어 있어요.

## 폴더 구조

```
chatbot/
├── package.json
├── README.md
├── .env.example
├── config.js                 # 모델·페르소나·모드 설정
├── index.html                # 페이지 선택 허브
├── chat.html                 # A2 결과 화면
├── blog.html                 # A3 결과 화면
├── css/
│   ├── base.css              # 공통 토큰/리셋
│   ├── chat.css              # 챗봇 전용
│   └── blog.css              # 블로그 생성기 전용
├── js/
│   ├── api.js                # OpenAI 호출 래퍼 (mock 포함)
│   ├── rag.js                # 문서 로딩 + 관련 청크 검색
│   ├── chat-ui.js            # 챗봇 화면 컨트롤러
│   └── blog-generator.js     # 블로그 생성 폼 컨트롤러
└── data/
    ├── docs/                 # RAG 원본 문서 5개
    │   ├── faq.md
    │   ├── service.md
    │   ├── support-rules.md
    │   ├── return-policy.md
    │   └── membership.md
    ├── sample-conversation.json   # 시연용 데모 대화
    └── sample-blog.json           # 시연용 데모 블로그
```

## 강의에서 다루는 핵심 코드 위치

- 시스템 프롬프트에 문서 주입 → `js/rag.js` `buildSystemPrompt()`
- 페르소나 톤·금지 표현 → `config.js` `PERSONA`
- API 호출 (mock 전환) → `js/api.js` `chatCompletion()`
