# sales-dashboard — 엑셀 업로드 매출 대시보드 + AI 매출 예측

Claude Code 핸즈온 **C 섹션** 결과물입니다.

| 강의 | 파일 | 내용 |
|------|------|------|
| **C2** | `dashboard.html` | 엑셀 파일을 업로드하면 자동으로 KPI·추세·카테고리·채널을 시각화 |
| **C3** | `insights.html`  | 같은 데이터에 AI가 다음 달 매출과 시나리오를 자동 예측 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5175
```

## 흐름

1. `dashboard.html`에서 매출 엑셀(.xlsx/.csv)을 드래그 또는 선택
2. 데모는 `js/sample-data.js`의 샘플 12개월 매출로 자동 렌더링
3. 우측 상단의 **AI 매출 예측** 버튼 → `insights.html`에서 다음 달 매출 시나리오 4종 비교

## 폴더 구조

```
sales-dashboard/
├── package.json
├── README.md
├── dashboard.html              # C2 메인 대시보드 (엑셀 업로드)
├── insights.html               # C3 AI 매출 예측 리포트
├── css/
│   ├── base.css
│   └── dashboard.css
└── js/
    ├── sample-data.js          # 데모용 샘플 매출 (엑셀 파싱 결과 대용)
    ├── dashboard-page.js       # C2 컨트롤러 (업로드 → 차트)
    └── insights-page.js        # C3 컨트롤러 (시나리오 → 예측)
```

## 핵심 학습 포인트

- 엑셀 파싱 자리 표시 → `js/dashboard-page.js`의 `loadFile()` (실제로는 SheetJS 등으로 교체)
- 4가지 시나리오 매출 예측 → `js/insights-page.js`의 `SCENARIOS`
- 신뢰구간이 포함된 예측 차트 → Chart.js로 실선+점선+음영 결합
