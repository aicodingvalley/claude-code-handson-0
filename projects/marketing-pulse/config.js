export const CONFIG = {
  useMock: true,
  ga: {
    propertyId: "properties/123456789",
    metrics: ["sessions", "newUsers", "bounceRate", "conversionRate"],
    dateRange: { startDaysAgo: 7, endDaysAgo: 0 }
  },
  ai: {
    model: "gpt-4o",
    insightCount: 3,
    perspectives: [
      { key: "biggest_change", label: "가장 큰 변화" },
      { key: "needs_attention", label: "주의가 필요한 지표" },
      { key: "week_summary",   label: "이번 주 추세 한 줄 요약" }
    ]
  },
  data: {
    kpis:    "./data/kpis.json",
    trend:   "./data/trend.json",
    channels:"./data/channels.json",
    pages:   "./data/pages.json",
    insights:"./data/insights.json"
  }
};

// 색상 팔레트 (대시보드 일관성)
export const PALETTE = {
  brand: "#f59e0b",
  brandDark: "#b45309",
  good: "#10b981",
  bad: "#ef4444",
  channels: ["#f59e0b", "#3b82f6", "#a855f7", "#ec4899", "#64748b"],
  // 채널별 ROAS 막대 색 (인사이트 페이지)
  roas:     ["#10b981", "#3b82f6", "#ef4444", "#a855f7", "#f59e0b"]
};
