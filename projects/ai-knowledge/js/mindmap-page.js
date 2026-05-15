// mindmap.html (E2) — 브레인스토밍 결과를 받아 vis-network으로 시각화
import { CONFIG } from "../config.js";

// 세련된 톤 매핑 — Tailwind 500 계열 + 50 leaf bg + 900 text
const BORDER_OF = { "#6366f1": "#4f46e5", "#ec4899": "#db2777", "#334155": "#1e293b", "#8b5cf6": "#7c3aed", "#10b981": "#047857", "#f59e0b": "#b45309" };
const LEAF_BG_OF = { "#6366f1": "#eef2ff", "#ec4899": "#fdf2f8", "#334155": "#f1f5f9", "#8b5cf6": "#f5f3ff", "#10b981": "#ecfdf5", "#f59e0b": "#fffbeb" };
const LEAF_FG_OF = { "#6366f1": "#312e81", "#ec4899": "#831843", "#334155": "#0f172a", "#8b5cf6": "#4c1d95", "#10b981": "#065f46", "#f59e0b": "#78350f" };

(async () => {
  const data = await loadData();

  const nodes = new vis.DataSet(data.nodes.map(n => ({
    id: n.id,
    label: n.label,
    x: n.x, y: n.y,
    fixed: n.fixed,
    color: {
      background: n.bg,
      border: n.border,
      highlight: { background: n.bg, border: n.border },
      hover: { background: n.bg, border: n.border },
    },
    font: {
      color: n.fontColor ?? "#0f172a",
      size: n.tier === "center" ? 22 : n.tier === "persona" ? 14 : 11.5,
      face: "Pretendard, -apple-system, sans-serif",
      bold: n.tier !== "leaf",
      strokeWidth: 0,
    },
    shape: n.tier === "center" ? "ellipse" : "box",
    shapeProperties: { borderRadius: n.tier === "persona" ? 24 : n.tier === "leaf" ? 18 : 0 },
    widthConstraint: n.tier === "center" ? { minimum: 150, maximum: 200 } : n.tier === "persona" ? { minimum: 120, maximum: 150 } : { minimum: 60, maximum: 130 },
    margin: n.tier === "center" ? 24 : n.tier === "persona" ? 14 : 10,
    borderWidth: n.tier === "center" ? 0 : n.tier === "persona" ? 0 : 1.5,
    tier: n.tier,
  })));
  // 엣지 — 트렁크(중심→페르소나)는 두껍게, 가지(페르소나→리프)는 얇게
  const personaIds = new Set(data.nodes.filter(n => n.tier === "persona").map(n => n.id));
  const edges = new vis.DataSet(data.edges.map((e, i) => {
    const isTrunk = e.from === 0 || e.to === 0;
    const isBranch = personaIds.has(e.from) || personaIds.has(e.to);
    return {
      id: `e${i}`,
      from: e.from, to: e.to,
      width: isTrunk ? 2.6 : isBranch ? 1.3 : 1.0,
      color: { color: e.color ?? (isTrunk ? "rgba(99,102,241,0.45)" : "rgba(148,163,184,0.4)"), highlight: "#0f172a", hover: "#334155" },
      smooth: { enabled: true, type: "cubicBezier", roundness: 0.5, forceDirection: "none" },
    };
  }));

  const network = new vis.Network(document.getElementById("mindmap"), { nodes, edges }, {
    layout: { improvedLayout: true },
    nodes: {
      shadow: { enabled: true, color: "rgba(15,23,42,0.12)", size: 16, x: 0, y: 6 },
      chosen: {
        node: (values) => { values.shadowSize = 24; values.shadowColor = "rgba(15,23,42,0.22)"; },
        label: () => {},
      },
    },
    edges: {
      smooth: { enabled: true, type: "dynamic", roundness: 0.5 },
      hoverWidth: 0.6,
      selectionWidth: 1.4,
    },
    physics: {
      enabled: true,
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -40,
        centralGravity: 0.002,
        springLength: 130,
        springConstant: 0.02,
        damping: 0.55,
        avoidOverlap: 0.95,
      },
      stabilization: false,
      maxVelocity: 6,
      minVelocity: 0.05,
      timestep: 0.33,
    },
    interaction: {
      hover: true, dragNodes: true, dragView: true, zoomView: true,
      tooltipDelay: 100,
      hideEdgesOnDrag: false,
      navigationButtons: false,
    },
  });

  // 진입 — 캔버스 즉시 표시, 모든 노드가 들어오도록 자동 프레이밍
  const root = document.getElementById("mindmap");
  network.fit({ animation: false });
  requestAnimationFrame(() => root.classList.add("is-ready"));

  // 드래그 시작 시 "직접 연결된 노드"만 풀어주고 나머지는 모두 잠금
  // → 물리 엔진은 그대로 작동하지만, 무관한 노드는 어떤 힘이 와도 절대 못 움직임.
  let lockedDuringDrag = []; // [{ id, originalFixed }]
  network.on("dragStart", (params) => {
    const draggedId = params.nodes[0];
    if (draggedId == null) return;
    const movable = new Set(network.getConnectedNodes(draggedId));
    movable.add(draggedId);
    lockedDuringDrag = [];
    const updates = [];
    nodes.forEach((n) => {
      if (movable.has(n.id)) return;
      lockedDuringDrag.push({ id: n.id, originalFixed: n.fixed });
      updates.push({ id: n.id, fixed: { x: true, y: true } });
    });
    if (updates.length) nodes.update(updates);
  });
  network.on("dragEnd", () => {
    if (!lockedDuringDrag.length) return;
    nodes.update(lockedDuringDrag.map(({ id, originalFixed }) => ({
      id, fixed: originalFixed ?? false,
    })));
    lockedDuringDrag = [];
  });
})();

/** 세션에 브레인스토밍 결과가 있으면 그것으로, 없으면 기본 JSON으로. */
async function loadData() {
  try {
    const raw = sessionStorage.getItem("brainstorm:last");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.topic && parsed?.personas?.length) {
        return buildFromBrainstorm(parsed);
      }
    }
  } catch {}
  const fallback = await fetch(CONFIG.data.mindmap).then(r => r.json());
  // 기존 JSON엔 tier가 없어서 추정해 붙임
  fallback.nodes = fallback.nodes.map(n => ({
    ...n,
    tier: n.size === "lg" ? "center" : n.size === "md" ? "persona" : "leaf",
  }));
  return fallback;
}

function buildFromBrainstorm({ topic, personas }) {
  const nodes = [];
  const edges = [];

  // 중심 — (0,0)에 고정. 항상 정중앙.
  const centerLabel = wrap(topic, 14);
  nodes.push({
    id: 0,
    label: centerLabel,
    bg: "#0f172a", border: "#0f172a", fontColor: "#fff",
    tier: "center", shape: "ellipse",
    x: 0, y: 0, fixed: { x: true, y: true },
  });

  // 4방향(NW/NE/SE/SW) 시드. 페르소나는 중간 거리, 자식은 페르소나보다 더 바깥에 부채꼴로.
  const PERSONA_ANGLES = [
    -Math.PI * 3 / 4, -Math.PI / 4, Math.PI / 4, Math.PI * 3 / 4,
  ];
  const PERSONA_DIST = 240;     // 중심 → 페르소나
  const LEAF_DIST    = 460;     // 중심 → 자식 (페르소나보다 바깥)
  const LEAF_FAN     = Math.PI / 3.4;

  let nextId = 1;
  personas.forEach((p, idx) => {
    const angle = PERSONA_ANGLES[idx % 4];
    const personaId = nextId++;
    nodes.push({
      id: personaId,
      label: `${p.emoji} ${p.name}`,
      bg: p.color,
      border: BORDER_OF[p.color] ?? "#475569",
      fontColor: "white",
      tier: "persona",
      x: Math.cos(angle) * PERSONA_DIST + jitter(),
      y: Math.sin(angle) * PERSONA_DIST + jitter(),
    });
    edges.push({ from: 0, to: personaId, width: 1.8, color: p.color + "55" });

    const points = p.points || [];
    points.forEach((pt, j) => {
      // 페르소나 각도 기준 부채꼴 안에 균등 배치 — 중심에서 바깥 방향으로 뻗음
      const t = points.length === 1 ? 0 : (j / (points.length - 1)) - 0.5;
      const leafAngle = angle + t * LEAF_FAN;
      const pid = nextId++;
      nodes.push({
        id: pid,
        label: wrap(pt, 12),
        bg: LEAF_BG_OF[p.color] ?? "#fef3c7",
        border: p.color,
        fontColor: LEAF_FG_OF[p.color] ?? "#0f172a",
        tier: "leaf",
        x: Math.cos(leafAngle) * LEAF_DIST + jitter(),
        y: Math.sin(leafAngle) * LEAF_DIST + jitter(),
      });
      edges.push({ from: personaId, to: pid, color: p.color + "44" });
    });
  });

  return {
    centerLabel,
    tokens: 800 + personas.reduce((a, p) => a + (p.points?.length ?? 0) * 80, 0),
    oneLine: composeOneLine(topic, personas),
    nodes,
    edges,
  };
}

function jitter() { return (Math.random() - 0.5) * 8; }

function composeOneLine(topic, personas) {
  const tones = personas.map(p => `${p.emoji} ${p.name}`).join(" · ");
  return `"${topic}" — ${tones} 네 관점에서 모은 핵심 아이디어입니다.`;
}

/** 한국어 길이 기준으로 단어 단위 줄바꿈. */
function wrap(text, maxPerLine = 12) {
  if (text.length <= maxPerLine) return text;
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxPerLine && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}
