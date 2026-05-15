// Chart.js 래퍼 — 색상 팔레트 일관성 + 옵션 기본값
import { PALETTE } from "../config.js";

export function lineChart(ctxId, labels, datasets) {
  const ctx = document.getElementById(ctxId);
  return new Chart(ctx, {
    type: "line",
    data: { labels, datasets: datasets.map(d => ({
      ...d,
      tension: 0.35, fill: true,
      backgroundColor: d.backgroundColor ?? hexToRgba(d.borderColor, 0.08)
    })) },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y:  { beginAtZero: false, grid: { color: "#f1f5f9" } },
        y1: { position: "right", beginAtZero: false, grid: { display: false } }
      }
    }
  });
}

export function doughnut(ctxId, labels, data, opts = {}) {
  const ctx = document.getElementById(ctxId);
  return new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: PALETTE.channels, borderWidth: 0 }] },
    options: {
      cutout: opts.cutout ?? "55%",
      plugins: { legend: opts.legend ?? { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } }
    }
  });
}

export function bar(ctxId, labels, datasets, opts = {}) {
  const ctx = document.getElementById(ctxId);
  return new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      indexAxis: opts.indexAxis ?? "x",
      plugins: { legend: opts.legend ?? { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: { x: { grid: { color: "#f1f5f9" } }, y: { grid: { color: "#f1f5f9" } } }
    }
  });
}

function hexToRgba(hex, alpha = 1) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16),
        g = parseInt(m.slice(2, 4), 16),
        b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
