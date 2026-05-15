# finhub — 경제 지표 + AI 주간 리포트

Claude Code 핸즈온 **B 섹션** 결과물입니다.

| 강의 | 파일 | 내용 |
|------|------|------|
| **B2** | `index.html` | `/report` Skill로 생성된 최신 마크다운 리포트 |
| **B3** | `archive.html` | `/schedule`로 매주 자동 발행되는 누적 아카이브 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5174
```

## 환경 변수

```bash
cp .env.example .env
# FINNHUB_API_KEY=...   (지표 데이터)
# OPENAI_API_KEY=sk-... (리포트 작성)
# SUPABASE_URL=...      (실제 운영 시)
# SUPABASE_ANON_KEY=...
```

데모는 `data/reports/`의 마크다운 + `data/report-index.json`을 읽어 돌아갑니다. Supabase 없이도 그대로 동작해요.

## 폴더 구조

```
finhub/
├── package.json
├── README.md
├── .env.example
├── config.js                   # 지표 목록·발행 주기·모델
├── index.html                  # B2 최신 리포트
├── archive.html                # B3 자동 발행 + 아카이브
├── css/
│   ├── base.css
│   └── report.css
├── js/
│   ├── data-source.js          # Supabase mock — 리포트/지표 read API
│   ├── report-renderer.js      # 마크다운 → HTML 렌더러
│   ├── report-page.js          # index.html (B2) 컨트롤러
│   └── archive-page.js         # archive.html (B3) 컨트롤러
└── data/
    ├── indicators.json         # 현재 지표 스냅샷
    ├── report-index.json       # 발행 이력 메타데이터
    ├── schedule-log.json       # /schedule 실행 로그
    └── reports/                # 발행된 리포트 5개
        ├── 2026-05-11.md
        ├── 2026-05-04.md
        ├── 2026-04-27.md
        ├── 2026-04-20.md
        └── 2026-04-13.md
```

## 핵심 코드 위치

- `/report` Skill 흐름의 모사 → `js/data-source.js` `getLatestReport()`
- `/schedule` 자동 발행 상태 → `data/schedule-log.json` + `js/archive-page.js`
- 지표 카드 → `data/indicators.json`
