# marketing-pulse — GA 대시보드 + AI 인사이트

Claude Code 핸즈온 **C 섹션** 결과물입니다.

| 강의 | 파일 | 내용 |
|------|------|------|
| **C2** | `dashboard.html` | GA Data API로 가져온 KPI + 추세 차트 대시보드 |
| **C3** | `insights.html` | 같은 데이터에 AI가 자동으로 뽑은 3대 인사이트 패널 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5175
```

## 환경 변수

```bash
cp .env.example .env
# GA_PROPERTY_ID=...
# OPENAI_API_KEY=sk-...
```

데모는 `data/*.json`의 mock 데이터로 동작합니다. GA Data API에 직접 붙이려면 `js/ga-client.js`의 `fetchKpis()` 함수만 교체하면 돼요.

## 폴더 구조

```
marketing-pulse/
├── package.json
├── README.md
├── .env.example
├── config.js                   # GA property, AI 모델, 인사이트 옵션
├── dashboard.html              # C2 메인 대시보드
├── insights.html               # C3 AI 인사이트 패널
├── css/
│   ├── base.css
│   └── dashboard.css
├── js/
│   ├── ga-client.js            # GA Data API mock — KPI/trend/channels/pages
│   ├── charts.js               # Chart.js 래퍼
│   ├── insight-engine.js       # 인사이트 생성 Skill 모사
│   ├── dashboard-page.js       # C2 컨트롤러
│   └── insights-page.js        # C3 컨트롤러
└── data/
    ├── kpis.json               # 4종 KPI 카드
    ├── trend.json              # 7일 추세
    ├── channels.json           # 채널 비중
    ├── pages.json              # 인기 페이지 TOP 5
    └── insights.json           # AI가 뽑은 3대 인사이트 (mock)
```

## 핵심 학습 포인트

- GA Data API 모사 → `js/ga-client.js`
- 인사이트 Skill 패턴 → `js/insight-engine.js` (실제 OpenAI 호출 자리 표시)
- Chart.js 래핑 → `js/charts.js`
