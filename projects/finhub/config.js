// 경제 지표 + 리포트 자동화 설정
export const CONFIG = {
  useMock: true,
  model: "gpt-4o",
  schedule: {
    enabled: true,
    cron: "0 8 * * 1",                  // 매주 월요일 08:00
    description: "매주 월요일 오전 8시"
  },
  data: {
    indicatorsPath: "./data/indicators.json",
    reportIndexPath: "./data/report-index.json",
    reportsPath: "./data/reports/",
    scheduleLogPath: "./data/schedule-log.json"
  }
};

// 추적할 지표 정의 — 강의에서 검증·확정된 목록
export const INDICATORS = {
  주요지수: ["다우지수", "S&P500", "나스닥", "닛케이225", "코스피", "코스닥"],
  환율: ["달러인덱스", "원/달러", "원/엔", "원/유로", "원/파운드"],
  원자재: ["금", "구리", "WTI 원유"],
  AI빅테크: ["엔비디아", "애플", "구글", "마이크로소프트", "아마존", "메타", "테슬라"],
  반도체: ["인텔", "마이크론", "삼성전자", "SK하이닉스", "TSMC", "ASML", "브로드컴"]
};

// 리포트 섹션 구조 (시스템 프롬프트에 강제)
export const REPORT_SECTIONS = [
  "오늘 환율 · 증시",
  "전주 대비 변화",
  "주목할 포인트 3가지"
];
