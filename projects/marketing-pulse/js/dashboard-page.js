// dashboard.html (C2)
import { fetchKpis, fetchTrend, fetchChannels, fetchPages } from "./ga-client.js";
import { lineChart, doughnut } from "./charts.js";
import { PALETTE } from "../config.js";

/** 기간별 가공 — 7일 데이터를 베이스로 28일·분기 시리즈를 합성합니다. */
function transformByPeriod(period, base) {
  // 기간별 스케일(전반적 트래픽 증감) 및 라벨 생성
  if (period === "7") return base;

  if (period === "28") {
    const labels = Array.from({ length: 28 }, (_, i) => `${4 + Math.floor((i + 14) / 30)}/${((14 + i) % 30) + 1}`);
    const sessions = labels.map((_, i) => {
      const b = base.trend.sessions[i % 7];
      const wave = 1 + Math.sin(i / 4) * 0.12;
      return Math.round(b * wave);
    });
    const conversions = sessions.map(s => Math.round(s * 0.034));
    return {
      kpis: scaleKpis(base.kpis, { mul: 4.05, delta: 9.2, conv: 3.40 }),
      trend: { labels, sessions, conversions },
      channels: tilt(base.channels, { "Organic Search": +2, "Paid": +1, "Social": -1, "Direct": -2 }),
      pages: base.pages.map(p => ({ ...p, views: Math.round(p.views * 4.05) }))
    };
  }

  // 이번 분기 (~13주)
  const labels = Array.from({ length: 13 }, (_, i) => `W${i + 1}`);
  const sessions = labels.map((_, i) => Math.round(35000 + i * 1850 + Math.sin(i) * 4200));
  const conversions = sessions.map(s => Math.round(s * 0.031));
  return {
    kpis: scaleKpis(base.kpis, { mul: 13, delta: 16.7, conv: 3.21 }),
    trend: { labels, sessions, conversions },
    channels: tilt(base.channels, { "Organic Search": +4, "Paid": +3, "Social": -2, "Direct": -5 }),
    pages: base.pages.map(p => ({ ...p, views: Math.round(p.views * 13) }))
  };
}

function scaleKpis(kpis, { mul, delta, conv }) {
  return kpis.map((k, i) => {
    if (i === 0) return { ...k, value: fmt(Math.round(48392 * mul)), prev: fmt(Math.round(43058 * mul)), delta };
    if (i === 1) return { ...k, value: fmt(Math.round(31148 * mul)), prev: fmt(Math.round(28807 * mul)), delta: +(delta * 0.65).toFixed(1) };
    if (i === 2) return { ...k, value: `${(42.7 + (mul > 5 ? -1.4 : 0.6)).toFixed(1)}%`, prev: "41.4%", delta: mul > 5 ? -2.1 : 3.2, deltaUnit: "%" };
    return { ...k, value: `${conv}%`, prev: "2.62%", delta: +(conv - 2.62).toFixed(2), deltaUnit: "%p" };
  });
}

function tilt(channels, adj) {
  let arr = channels.map(c => ({ ...c, share: c.share + (adj[c.name] ?? 0) }));
  const sum = arr.reduce((a, c) => a + c.share, 0);
  return arr.map(c => ({ ...c, share: Math.round((c.share / sum) * 100) }));
}

function fmt(n) { return n.toLocaleString("ko-KR"); }

/* ─── 렌더링 ─── */
let charts = {};
function destroyChart(id) { if (charts[id]) { charts[id].destroy(); charts[id] = null; } }

function renderKpis(kpis) {
  const kpiRow = document.getElementById("kpi-row");
  kpiRow.innerHTML = kpis.map((k, i) => `
    <button class="kpi-card" data-idx="${i}" type="button">
      <div class="head">
        <span class="label">${k.label}</span>
        <span class="delta ${k.delta >= 0 ? 'up' : 'down'}">${k.delta >= 0 ? '+' : ''}${k.delta}${k.deltaUnit ?? '%'}</span>
      </div>
      <div class="value">${k.value}</div>
      <div class="prev">전주 ${k.prev}</div>
    </button>`).join("");

  // 인터랙션: 클릭 시 어떤 KPI를 강조할지 표시
  kpiRow.querySelectorAll(".kpi-card").forEach(card => {
    card.addEventListener("click", () => {
      kpiRow.querySelectorAll(".kpi-card").forEach(c => c.classList.remove("is-active"));
      card.classList.add("is-active");
      const label = card.querySelector(".label").textContent;
      flashNotice(`✨ ${label} 지표 기준으로 보고 있어요`);
    });
  });
}

function renderTrend(trend) {
  destroyChart("trendChart");
  charts.trendChart = lineChart("trendChart", trend.labels, [
    { label: "세션",  data: trend.sessions,    borderColor: PALETTE.brand },
    { label: "전환",  data: trend.conversions, borderColor: PALETTE.good, yAxisID: "y1" }
  ]);
  // 범례 토글 활성화
  charts.trendChart.options.plugins.legend = {
    display: true, position: "top",
    labels: { boxWidth: 12, font: { size: 11 } },
    onClick: (e, item, legend) => {
      const ci = legend.chart;
      const meta = ci.getDatasetMeta(item.datasetIndex);
      meta.hidden = meta.hidden === null ? !ci.data.datasets[item.datasetIndex].hidden : null;
      ci.update();
    }
  };
  // 툴팁 한국어 단위 표시
  charts.trendChart.options.plugins.tooltip = {
    callbacks: {
      label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("ko-KR")}${ctx.dataset.label === "세션" ? "회" : "건"}`
    }
  };
  charts.trendChart.update();
}

function renderChannels(channels) {
  destroyChart("channelChart");
  charts.channelChart = doughnut("channelChart", channels.map(c => c.name), channels.map(c => c.share));
  // 범례 클릭으로 항목 숨김
  charts.channelChart.options.plugins.tooltip = {
    callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` }
  };
  charts.channelChart.update();
}

function renderPages(pages, sortKey = "views", sortDir = "desc") {
  const tbody = document.getElementById("pages-tbody");
  const sorted = [...pages].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === "avgTime") { av = toSec(av); bv = toSec(bv); }
    return sortDir === "desc" ? bv - av : av - bv;
  });
  tbody.innerHTML = sorted.map(p => `
    <tr data-path="${p.path}">
      <td>${p.path}</td>
      <td>${p.views.toLocaleString()}</td>
      <td>${p.avgTime}</td>
      <td class="${p.bounce < 30 ? 'good' : p.bounce > 50 ? 'bad' : ''}">${p.bounce}%</td>
    </tr>`).join("");
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      flashNotice(`📄 ${tr.dataset.path} — GA 상세 보고서 열기 (mock)`);
    });
  });
}
function toSec(t) { const [m, s] = t.split(":").map(Number); return m * 60 + s; }

function flashNotice(text) {
  let el = document.getElementById("mp-flash");
  if (!el) {
    el = document.createElement("div");
    el.id = "mp-flash";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.remove("show"); void el.offsetWidth;
  el.classList.add("show");
}

/* ─── 부팅 ─── */
(async () => {
  const [kpis, trend, channels, pages] = await Promise.all([
    fetchKpis(), fetchTrend(), fetchChannels(), fetchPages()
  ]);
  const base = { kpis, trend, channels, pages };

  function applyPeriod(period) {
    const d = transformByPeriod(period, base);
    renderKpis(d.kpis);
    renderTrend(d.trend);
    renderChannels(d.channels);
    renderPages(d.pages);
  }

  // 기간 선택 인터랙션
  const periodSel = document.getElementById("period-select");
  periodSel.addEventListener("change", e => {
    applyPeriod(e.target.value);
    flashNotice(`📅 기간을 ${e.target.options[e.target.selectedIndex].text}(으)로 바꿨어요`);
  });

  // 페이지 테이블 헤더 정렬
  document.querySelectorAll("#pages-table thead th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const dir = th.dataset.dir === "desc" ? "asc" : "desc";
      th.dataset.dir = dir;
      const period = periodSel.value;
      const d = transformByPeriod(period, base);
      renderPages(d.pages, th.dataset.sort, dir);
    });
  });

  applyPeriod(periodSel.value);
})();
