// 경제 지표 대시보드 (index.html)
import { getIndicators } from "./data-source.js";

const UP = "rgba(16,185,129,0.85)";
const DOWN = "rgba(244,63,94,0.85)";

(async () => {
  const ind = await getIndicators();
  renderKpiGrid(document.getElementById("kpi-grid"), ind);
  renderChangeChart(document.getElementById("indicator-chart"), ind);
  renderRatioChart(document.getElementById("ratio-chart"), ind);
  document.getElementById("updated-at").textContent =
    `업데이트: ${new Date().toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`;
})();

function renderKpiGrid(el, indicators) {
  el.innerHTML = indicators.map(i => {
    const up = i.change >= 0;
    const color = up ? "#10b981" : "#f43f5e";
    const arrow = up ? "▲" : "▼";
    return `
      <div class="card" style="padding:0.9rem 1rem">
        <div style="font-size:0.7rem;color:#64748b;font-weight:600">${i.name}</div>
        <div style="font-size:1.4rem;font-weight:700;color:#0f172a;margin-top:0.25rem">${i.value}</div>
        <div style="font-size:0.8rem;color:${color};font-weight:600;margin-top:0.15rem">
          ${arrow} ${up ? "+" : ""}${i.change}%
        </div>
      </div>`;
  }).join("");
}

function renderChangeChart(canvas, indicators) {
  const labels = indicators.map(i => i.name);
  const data = indicators.map(i => i.change);
  const values = indicators.map(i => i.value);
  const bg = data.map(v => v >= 0 ? UP : DOWN);

  new Chart(canvas, {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: bg, borderRadius: 4, borderSkipped: false }] },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = values[ctx.dataIndex];
              const c = data[ctx.dataIndex];
              return `  ${v}  (${c >= 0 ? "+" : ""}${c}%)`;
            },
          },
        },
      },
      scales: {
        x: { grid: { color: "rgba(148,163,184,0.2)" }, ticks: { callback: v => `${v}%`, font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

function renderRatioChart(canvas, indicators) {
  const ups = indicators.filter(i => i.change >= 0);
  const downs = indicators.filter(i => i.change < 0);
  const up = ups.length;
  const down = downs.length;
  const ratio = down === 0 ? "∞" : (up / down).toFixed(2);

  document.getElementById("breadth-summary").innerHTML = `
    <span><strong style="color:#10b981">▲ ${up}</strong> 상승</span>
    <span style="color:#64748b">A/D Ratio <strong style="color:#0f172a">${ratio}</strong></span>
    <span><strong style="color:#f43f5e">▼ ${down}</strong> 하락</span>`;

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: [""],
      datasets: [
        { label: "상승", data: [up], backgroundColor: UP, borderRadius: 4 },
        { label: "하락", data: [down], backgroundColor: DOWN, borderRadius: 4 },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `  ${ctx.dataset.label}: ${ctx.parsed.x}개` } },
      },
      scales: {
        x: { stacked: true, display: false, max: indicators.length },
        y: { stacked: true, display: false },
      },
    },
  });

  // 상승/하락 종목 리스트
  const row = items => items
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .map(i => `<span style="font-size:0.7rem;background:${i.change >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'};color:${i.change >= 0 ? '#047857' : '#be123c'};padding:0.15rem 0.45rem;border-radius:0.3rem;margin-right:0.3rem">${i.name} ${i.change >= 0 ? '+' : ''}${i.change}%</span>`)
    .join("");
  document.getElementById("breadth-detail").innerHTML = `
    <div>${row(ups)}</div>
    <div>${row(downs)}</div>`;
}
