// insights.html (C3) — AI 매출 예측 리포트
import { SAMPLE } from "./sample-data.js";

const SCENARIOS = {
  base: {
    label: "베이스라인",
    delta: 0.045,
    range: [-0.04, 0.07],
    cards: [
      { type: "good",    title: "리빙 카테고리가 6월 매출의 35%를 견인",         body: "최근 4개월 평균 성장률 12.6%. 신제품 캔들 라인업이 메인 모멘텀입니다.", action: "리빙 광고 예산을 15% 증액해 모멘텀 유지를 검토하세요." },
      { type: "warning", title: "뷰티 카테고리 전월비 -3.4% 추세",                body: "비건 키트 재구매율 하락. 6월 매출 기여도가 8%p 감소할 수 있어요.",   action: "재구매 쿠폰 + 6/15 이전 리타겟팅 캠페인을 권장합니다." },
      { type: "summary", title: "다음 달 예상 매출 ₩528M (신뢰 95%: ₩486–₩541M)",  body: "이번 달 대비 +4.5%. 12월 시즌 효과 제외 시 가장 높은 단월 매출 전망.",   action: "월 목표 ₩520M 대비 +1.5%p 초과 예상 — 재고 발주 +12% 가속." },
    ],
  },
  optimistic: {
    label: "낙관",
    delta: 0.085,
    range: [0.04, 0.13],
    cards: [
      { type: "good",    title: "여름 시즌 + 신제품 효과 동시 작용",              body: "휴대용 에스프레소 24%, 캔들 세트 18% 성장이 지속된다고 가정.",          action: "공급망 리드타임 7일 단축 협의를 6/3 이전에 완료하세요." },
      { type: "good",    title: "자사몰 채널 점유율 45% 돌파 시나리오",            body: "네이버 의존도 28→25%로 분산. 마진율은 +1.8%p 개선됩니다.",            action: "자사몰 단독 번들을 6/10 런칭해 채널 분산을 가속화하세요." },
      { type: "summary", title: "다음 달 예상 매출 ₩549M (낙관 시나리오)",          body: "베이스 대비 +₩21M. 광고 ROAS가 4.2 이상 유지될 때 도달 가능.",          action: "월 목표 + 5%로 상향 가이드 검토." },
    ],
  },
  conservative: {
    label: "보수",
    delta: 0.005,
    range: [-0.05, 0.04],
    cards: [
      { type: "warning", title: "거시 둔화 + 6월 공휴일 영업일 -1일",              body: "1분기 대비 거래 단가가 4% 하락한 흐름을 반영한 보수 추정.",            action: "프로모션 의존을 낮추고 객단가 방어 캠페인을 우선하세요." },
      { type: "warning", title: "스마트 도어락 v3 출시 지연 리스크",                body: "메인 SKU 발주가 6/12 이후로 밀릴 경우 -₩9M 영향.",                    action: "대체 SKU 우선 진열 및 사전 알림 신청 전환을 강화하세요." },
      { type: "summary", title: "다음 달 예상 매출 ₩508M (보수 시나리오)",          body: "이번 달과 거의 동일 수준. 목표 ₩520M 대비 -2.3%p 미달 가능.",          action: "광고 예산을 8% 보수적으로 재할당하고 KPI 알림을 주 1회 설정." },
    ],
  },
  promo: {
    label: "프로모션 가정",
    delta: 0.12,
    range: [0.07, 0.17],
    cards: [
      { type: "good",    title: "6/10-6/16 자사몰 쿠폰 + 리타겟팅 진행 시",       body: "유사 캠페인 ROAS 평균 4.6, 신규 구매자 +18% 효과 가정.",              action: "쿠폰 마진 가드레일을 12% 이상으로 유지해 수익성 보호." },
      { type: "warning", title: "프로모션 종료 후 7월 일시 둔화 가능",              body: "구매 당겨오기 효과로 7월 첫째 주 -8%까지 단기 하락 가능.",            action: "7월 1주차 재방문 쿠폰 자동 발급을 미리 셋업하세요." },
      { type: "summary", title: "다음 달 예상 매출 ₩566M (프로모션 시 최대치)",      body: "베이스 대비 +₩38M. 광고비 추가 ₩42M 투입 가정.",                       action: "성공 KPI: 신규 구매자 +18%, 마진율 ≥ 24%." },
    ],
  },
};

const KRW = n => `₩${(n/1e8).toFixed(2)}억`;
const CUR = SAMPLE.trend.at(-1).revenue;

let activeLens = "base";
let forecastChart, contribChart;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("refresh-stamp").textContent = `방금 분석 · ${new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}`;
  bindLens();
  bindAsk();
  bindRefresh();
  render(activeLens);
});

function bindLens() {
  document.querySelectorAll(".lens-chip").forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll(".lens-chip").forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeLens = chip.dataset.lens;
      render(activeLens);
    };
  });
}

function bindAsk() {
  const form = document.getElementById("ask-form");
  const input = document.getElementById("ask-input");
  form.onsubmit = (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    answerQuestion(q);
    input.value = "";
  };
  document.querySelectorAll(".ask-example").forEach(b => {
    b.onclick = () => { input.value = b.textContent; form.requestSubmit(); };
  });
}

function bindRefresh() {
  const btn = document.getElementById("refresh-btn");
  btn.onclick = () => {
    btn.classList.add("is-loading");
    setTimeout(() => {
      btn.classList.remove("is-loading");
      document.getElementById("refresh-stamp").textContent = `방금 분석 · ${new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}`;
      render(activeLens);
    }, 800);
  };
}

function answerQuestion(q) {
  const row = document.getElementById("insight-row");
  const card = document.createElement("div");
  card.className = "insight-card summary reveal";
  card.innerHTML = `
    <div class="ribbon">Q&A</div>
    <h3>💬 ${q}</h3>
    <p>현재 시나리오(<b>${SCENARIOS[activeLens].label}</b>) 기준 답변: 다음 달 매출은 <b>${KRW(CUR * (1 + SCENARIOS[activeLens].delta))}</b> 수준으로 예상되며, 질문하신 가정 변경 시 ±₩14M 변동 가능합니다. (데모 응답)</p>
    <div class="action">💡 후속 액션: 시나리오 칩을 바꿔보며 민감도를 비교해 보세요.</div>
  `;
  row.prepend(card);
}

function render(lens) {
  const s = SCENARIOS[lens];
  const forecast = CUR * (1 + s.delta);
  const lo = CUR * (1 + s.range[0]);
  const hi = CUR * (1 + s.range[1]);

  document.getElementById("forecast-value").textContent = KRW(forecast);
  document.getElementById("forecast-range").textContent = `${KRW(lo)} ~ ${KRW(hi)}`;

  renderCards(s);
  renderForecastChart(forecast, lo, hi);
  renderContribChart(s);
}

function renderCards(s) {
  const row = document.getElementById("insight-row");
  row.innerHTML = s.cards.map((c, i) => `
    <div class="insight-card ${c.type} reveal" style="animation-delay:${i*0.08}s">
      <div class="ribbon">${ribbonLabel(c.type)}</div>
      <h3>${c.title}</h3>
      <p>${c.body}</p>
      <div class="action">💡 ${c.action}</div>
    </div>
  `).join("");
}

function ribbonLabel(t) {
  return t === "good" ? "기회" : t === "warning" ? "주의" : "예측";
}

function renderForecastChart(forecast, lo, hi) {
  const ctx = document.getElementById("forecastChart");
  forecastChart?.destroy();
  const histLabels = SAMPLE.trend.map(t => t.month);
  const histData = SAMPLE.trend.map(t => t.revenue);
  const labels = [...histLabels, "2026-06"];
  forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "실적",
          data: [...histData, null],
          borderColor: "#0f172a",
          backgroundColor: "rgba(15,23,42,0.08)",
          tension: 0.35,
          pointRadius: 3,
          fill: false,
        },
        {
          label: "예측",
          data: [...histData.map(() => null), forecast],
          borderColor: "#f59e0b",
          borderDash: [6, 4],
          pointRadius: 5,
          pointBackgroundColor: "#f59e0b",
          showLine: true,
        },
        {
          label: "신뢰구간(상)",
          data: [...histData.map(() => null), hi],
          borderColor: "rgba(245,158,11,0)",
          backgroundColor: "rgba(245,158,11,0.18)",
          pointRadius: 0,
          fill: "+1",
        },
        {
          label: "신뢰구간(하)",
          data: [...histData.map(() => null), lo],
          borderColor: "rgba(245,158,11,0)",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { size: 11 }, filter: i => !i.text.startsWith("신뢰구간(하)") },
        },
        tooltip: { callbacks: { label: c => c.parsed.y == null ? null : `${c.dataset.label}: ${KRW(c.parsed.y)}` } },
      },
      scales: {
        y: { grid: { color: "#f1f5f9" }, ticks: { callback: v => KRW(v), font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

function renderContribChart(s) {
  contribChart?.destroy();
  const factor = 1 + s.delta;
  const contribs = SAMPLE.categories.map(c => Math.round(c.revenue * factor));
  contribChart = new Chart(document.getElementById("contribChart"), {
    type: "bar",
    data: {
      labels: SAMPLE.categories.map(c => c.name),
      datasets: [{
        label: "다음 달 예상 매출",
        data: contribs,
        backgroundColor: ["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#0ea5e9"],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${KRW(c.parsed.y)}` } },
      },
      scales: {
        y: { grid: { color: "#f1f5f9" }, ticks: { callback: v => KRW(v), font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}
