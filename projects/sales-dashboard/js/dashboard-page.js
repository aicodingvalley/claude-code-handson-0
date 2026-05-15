// dashboard.html (C2) — 엑셀 업로드 → 매출 대시보드 (데모는 샘플 데이터로 렌더)
import { SAMPLE } from "./sample-data.js";

const uploadZone = document.getElementById("upload-zone");
const dashboard = document.getElementById("dashboard");
const fileInput = document.getElementById("file-input");
const fileStatus = document.getElementById("file-status");
const sampleBtn = document.getElementById("use-sample");
const flash = document.getElementById("mp-flash");

fileInput.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  loadFile(f.name);
});

// drag & drop
["dragenter", "dragover"].forEach(ev => uploadZone.addEventListener(ev, (e) => {
  e.preventDefault();
  uploadZone.classList.add("is-dragover");
}));
["dragleave", "drop"].forEach(ev => uploadZone.addEventListener(ev, (e) => {
  e.preventDefault();
  uploadZone.classList.remove("is-dragover");
}));
uploadZone.addEventListener("drop", (e) => {
  const f = e.dataTransfer.files?.[0];
  if (f) loadFile(f.name);
});

sampleBtn.addEventListener("click", () => loadFile("sample-매출-2025-2026.xlsx"));

function loadFile(name) {
  fileStatus.textContent = `📄 ${name} · 파싱 중…`;
  showFlash(`📄 ${name} 분석 중`);
  setTimeout(() => {
    fileStatus.textContent = `✅ ${name}`;
    uploadZone.classList.add("hidden");
    dashboard.classList.remove("hidden");
    render(SAMPLE);
    showFlash("✨ 대시보드 생성 완료");
  }, 700);
}

function showFlash(msg) {
  flash.textContent = msg;
  flash.classList.remove("show");
  void flash.offsetWidth;
  flash.classList.add("show");
}

function render(data) {
  renderKpis(data);
  renderTrend(data);
  renderCategory(data);
  renderProducts(data);
  renderChannel(data);
}

function fmt(n) {
  if (n >= 1e8) return `${(n/1e8).toFixed(1)}억`;
  if (n >= 1e4) return `${(n/1e4).toFixed(0)}만`;
  return n.toLocaleString();
}

function renderKpis(data) {
  const cur = data.trend.at(-1).revenue;
  const prev = data.trend.at(-2).revenue;
  const delta = ((cur - prev) / prev) * 100;
  const txn = data.trend.at(-1).txn;
  const aov = Math.round(cur / txn);
  const target = data.target;
  const targetPct = (cur / target) * 100;

  const kpis = [
    { label: "이번 달 매출", value: `₩${fmt(cur)}`, delta, prev: `전월 ₩${fmt(prev)}` },
    { label: "거래 건수", value: txn.toLocaleString(), delta: ((txn - data.trend.at(-2).txn) / data.trend.at(-2).txn) * 100, prev: `전월 ${data.trend.at(-2).txn.toLocaleString()}건` },
    { label: "평균 거래액", value: `₩${fmt(aov)}`, delta: 4.2, prev: "전월 대비 +4.2%" },
    { label: "월 목표 달성률", value: `${targetPct.toFixed(0)}%`, delta: targetPct - 100, prev: `목표 ₩${fmt(target)}` },
  ];

  const html = kpis.map((k) => {
    const dir = k.delta >= 0 ? "up" : "down";
    const sign = k.delta >= 0 ? "▲" : "▼";
    return `<button class="kpi-card">
      <div class="head">
        <span class="label">${k.label}</span>
        <span class="delta ${dir}">${sign} ${Math.abs(k.delta).toFixed(1)}%</span>
      </div>
      <div class="value">${k.value}</div>
      <div class="prev">${k.prev}</div>
    </button>`;
  }).join("");
  document.getElementById("kpi-row").innerHTML = html;
}

function renderTrend(data) {
  const labels = data.trend.map(t => t.month);
  new Chart(document.getElementById("trendChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          type: "line",
          label: "매출(₩)",
          data: data.trend.map(t => t.revenue),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.18)",
          tension: 0.35,
          yAxisID: "y",
          fill: true,
          pointRadius: 3,
        },
        {
          type: "bar",
          label: "거래 건수",
          data: data.trend.map(t => t.txn),
          backgroundColor: "rgba(99,102,241,0.55)",
          borderRadius: 6,
          yAxisID: "y1",
          barThickness: 14,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
      scales: {
        y: { position: "left", grid: { color: "#f1f5f9" }, ticks: { callback: v => `₩${fmt(v)}`, font: { size: 10 } } },
        y1: { position: "right", grid: { display: false }, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

function renderCategory(data) {
  new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: data.categories.map(c => c.name),
      datasets: [{
        data: data.categories.map(c => c.revenue),
        backgroundColor: ["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#0ea5e9"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ₩${fmt(ctx.parsed)}` } },
      },
    },
  });
}

let sortKey = "revenue";
let sortDir = "desc";

function renderProducts(data) {
  const tbody = document.getElementById("products-tbody");
  const sorted = [...data.products].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
    return sortDir === "asc" ? cmp : -cmp;
  });
  tbody.innerHTML = sorted.slice(0, 5).map(p => {
    const cls = p.growth >= 0 ? "good" : "bad";
    const sign = p.growth >= 0 ? "+" : "";
    return `<tr>
      <td>${p.name}</td>
      <td>₩${fmt(p.revenue)}</td>
      <td>${p.units.toLocaleString()}</td>
      <td class="${cls}">${sign}${p.growth.toFixed(1)}%</td>
    </tr>`;
  }).join("");

  document.querySelectorAll("#products-table th").forEach(th => {
    th.onclick = () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
      else { sortKey = key; sortDir = th.dataset.dir || "desc"; }
      renderProducts(data);
    };
  });
}

function renderChannel(data) {
  new Chart(document.getElementById("channelChart"), {
    type: "bar",
    data: {
      labels: data.channels.map(c => c.name),
      datasets: [{
        data: data.channels.map(c => c.share),
        backgroundColor: ["#f59e0b", "#6366f1", "#ec4899", "#10b981"],
        borderRadius: 6,
        barThickness: 22,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `  ${ctx.parsed.x}%` } },
      },
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: "#f1f5f9" }, ticks: { callback: v => `${v}%`, font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { font: { size: 12 } } },
      },
    },
  });
}
