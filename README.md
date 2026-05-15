# Claude Code 핸즈온 · AI 자동화편 — 데모 프로젝트 모음

코스 인트로 영상 녹화용 데모 모음입니다. 각 섹션이 **하나의 독립된 프로젝트**로 구성되어 있어, 강의 흐름대로 실제 프로젝트가 어떻게 자라나는지 보여줄 수 있어요.

## 폴더 구조

```
course-demo/
├── README.md                         ← 이 파일
├── index.html                        ← 5개 프로젝트로 가는 허브
└── projects/
    ├── chatbot/         # A 섹션 — 고객상담 챗봇 + 블로그 생성기
    ├── finhub/          # B 섹션 — 경제 지표·리포트 자동화
    ├── marketing-pulse/ # C 섹션 — GA 대시보드 + AI 인사이트
    ├── teamchat/        # D 섹션 — 실시간 협업 + 회의록 + 번역
    └── ai-knowledge/    # E 섹션 — 페르소나 브레인스토밍 + 마인드맵
```

## 빠르게 실행하는 법

각 프로젝트 폴더에는 동일한 패턴의 `package.json`이 들어 있어요. Node가 설치되어 있다면:

```bash
cd projects/chatbot
npm install     # serve 패키지만 설치 (정적 서버)
npm run dev     # http://localhost:5173 자동 오픈
```

Node 없이 그냥 보고 싶다면, 각 프로젝트의 HTML 파일을 브라우저로 직접 열어도 동작합니다. (CDN으로 Tailwind/Chart.js/vis-network을 가져옵니다)

## 각 프로젝트의 공통 구조

```
projects/<name>/
├── package.json          ← npm run dev 한 줄로 정적 서버 실행
├── README.md             ← 무엇을 만들고, 어떻게 동작하는지
├── .env.example          ← 실제 운영에서 필요한 환경변수 자리
├── config.js             ← 모델 / API 엔드포인트 / 옵션
├── *.html                ← 결과 페이지 (강의별로 1~3개)
├── css/                  ← 모듈화된 스타일
├── js/                   ← ES Module 단위 분리
└── data/                 ← Mock 데이터 (JSON / MD)
```

## 강의별 매핑

| 섹션 | 프로젝트 | 결과 페이지 |
|------|----------|-------------|
| **A · AI 연동하기** | `chatbot` | `chat.html` (A2 회사 맥락) · `blog.html` (A3 블로그) |
| **B · 핀 허브** | `finhub` | `index.html` (B2 리포트) · `archive.html` (B3 자동 발행) |
| **C · 마케팅 대시보드** | `marketing-pulse` | `dashboard.html` (C2) · `insights.html` (C3) |
| **D · 실시간 협업** | `teamchat` | `index.html` (D1) · `meeting-notes.html` (D2) · `translate.html` (D3) |
| **E · AI 지식관리** | `ai-knowledge` | `brainstorm.html` (E1) · `mindmap.html` (E2) |

## 영상 녹화 팁

- 카메라 캡처는 `npm run dev`로 띄운 정적 서버 화면을 권장합니다. (URL 표시줄이 `localhost`로 나오면 "실제 동작 중" 느낌이 살아요)
- 페이지 전환은 좌측 상단의 ← 링크 또는 직접 URL 입력으로 이동할 수 있어요.
