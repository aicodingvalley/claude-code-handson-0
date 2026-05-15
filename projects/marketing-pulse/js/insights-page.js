// insights.html (C3)
import { generateInsights } from "./insight-engine.js";
import { bar } from "./charts.js";
import { PALETTE } from "../config.js";

const TONE = {
  good:    { ribbon: "🔥 가장 큰 변화",  icon: "📈" },
  warning: { ribbon: "⚠️ 주의 필요",     icon: "📉" },
  summary: { ribbon: "📊 이번 주 추세",   icon: "🎯" }
};

const containerEl   = document.getElementById("insight-row");
const refreshBtn    = document.getElementById("refresh-btn");
const refreshStamp  = document.getElementById("refresh-stamp");
const metaEl        = document.getElementById("ai-meta");
const titleEl       = document.getElementById("ai-title");
const lensChipsEl   = document.getElementById("lens-chips");
const askFormEl     = document.getElementById("ask-form");
const askInputEl    = document.getElementById("ask-input");

const LENS_TITLES = {
  overall:     "이번 주 가장 주목해야 할 신호 3가지",
  acquisition: "유입·획득 관점에서 본 핵심 신호",
  conversion:  "전환·매출 관점에서 본 핵심 신호",
  retention:   "이탈·리텐션 관점에서 본 핵심 신호",
  channel:     "채널 효율 관점에서 본 핵심 신호",
};

let lastGeneratedAt = Date.now();
let stampTimer = null;

// 다시 생성 버튼을 눌렀을 때 돌려쓸 변형 셋
const VARIANTS = [
  null, // 0번은 베이스(원본 JSON 그대로)
  {
    insights: [
      {
        tone: "good",
        label: "신규 방문 폭증",
        headline: "신규 방문자 비중이 64%로 역대 최고치예요.",
        body: "검색 트래픽 중 <strong>'유기농 채소' 키워드 유입</strong>이 38% 늘었어요. SEO 콘텐츠가 신규 고객 확보에 직접 기여하는 흐름입니다.",
        action: "잘 작동한 키워드 3개를 골라 후속 콘텐츠를 1주 안에 발행하세요."
      },
      {
        tone: "warning",
        label: "Display 채널 적신호",
        headline: "Display 광고 ROAS가 1.8로 손익분기점 아래예요.",
        body: "Display 캠페인이 매출의 4%만 만들면서 광고비의 22%를 차지하고 있어요. <strong>크리에이티브 피로도</strong>가 의심됩니다.",
        action: "Display 예산 30%를 Email/Organic으로 일시 이전하고 A/B 소재를 교체하세요."
      },
      {
        tone: "summary",
        label: "한 줄 요약",
        headline: "\"검색은 효자, Display는 부담\"",
        body: "오가닉·이메일이 매출을 견인하는 사이, Display는 비용 대비 효율이 1년 만에 최저로 내려왔어요. <strong>채널 믹스 재조정 시점</strong>입니다.",
        action: "Display 비중을 18% → 10%로 줄이고 차이는 SEO 콘텐츠 투자로 옮기세요."
      }
    ],
    evidence: {
      pages: [
        { label: "/products",   traffic: 31, conv: 28 },
        { label: "/promotions", traffic: 16, conv: 30 },
        { label: "/",           traffic: 17, conv: 9  },
        { label: "/category",   traffic: 14, conv: 14 },
        { label: "/membership", traffic: 12, conv: 19 }
      ],
      roas: [
        { channel: "Organic",     value: 9.6 },
        { channel: "Paid Search", value: 4.4 },
        { channel: "Display",     value: 1.8 },
        { channel: "Social",      value: 3.2 },
        { channel: "Email",       value: 14.1 }
      ]
    }
  },
  {
    insights: [
      {
        tone: "good",
        label: "리뷰 콘텐츠 효과",
        headline: "사용자 리뷰 페이지 전환 기여도가 27%로 두 배 됐어요.",
        body: "지난주 도입한 <strong>실사용자 사진 리뷰 모듈</strong>이 제품 상세 페이지 체류 시간을 1분 22초 더 늘렸어요. 구매 직전 신뢰 신호가 강화됐다는 뜻이에요.",
        action: "베스트 리뷰 3건을 광고 소재로 재활용해 Paid Social에 노출하세요."
      },
      {
        tone: "warning",
        label: "재방문 감소",
        headline: "재방문 비율이 32%에서 25%로 떨어졌어요.",
        body: "신규 유입은 늘었지만 충성 사용자 재방문이 줄고 있어요. <strong>리텐션 후크</strong>가 약해진 신호입니다.",
        action: "최근 30일 비방문 회원에게 개인화 추천 메일을 자동 발송해보세요."
      },
      {
        tone: "summary",
        label: "한 줄 요약",
        headline: "\"확보는 잘했고, 이제 묶어둘 차례\"",
        body: "신규 확보 효율은 분기 최고치인데 <strong>리텐션 지표</strong>가 함께 따라오지 않고 있어요. 이번 주 포커스는 재방문 전환입니다.",
        action: "리텐션 KPI(W1·W4)를 대시보드 상단에 고정 노출하세요."
      }
    ],
    evidence: {
      pages: [
        { label: "/products",   traffic: 24, conv: 27 },
        { label: "/reviews",    traffic: 18, conv: 23 },
        { label: "/",           traffic: 19, conv: 7  },
        { label: "/category",   traffic: 14, conv: 15 },
        { label: "/membership", traffic: 13, conv: 21 }
      ],
      roas: [
        { channel: "Organic",     value: 8.8 },
        { channel: "Paid Search", value: 4.0 },
        { channel: "Display",     value: 2.5 },
        { channel: "Social",      value: 5.1 },
        { channel: "Email",       value: 11.2 }
      ]
    }
  },
  {
    insights: [
      {
        tone: "good",
        label: "주말 트래픽 회복",
        headline: "토·일 전환율이 평일 수준까지 올라왔어요.",
        body: "지난 4주간 주말 효율이 평일의 70% 수준이었는데, 이번 주말은 <strong>98%</strong>까지 회복됐어요. 주말 한정 무료배송 캠페인이 적중한 것으로 보입니다.",
        action: "이 캠페인을 4주간 유지하면서 동일 조건의 평일 A/B 그룹과 비교하세요."
      },
      {
        tone: "warning",
        label: "장바구니 이탈",
        headline: "장바구니 → 결제 전환이 14%p 떨어졌어요.",
        body: "장바구니까지는 잘 오는데 마지막 결제 단계에서 빠져요. <strong>결제 수단 추가 후 결제 시도 오류율</strong>이 6.2%로 올라온 게 가장 큰 원인입니다.",
        action: "Stripe Webhook 로그에서 최근 결제 실패 100건 분석을 1차 우선순위로 처리하세요."
      },
      {
        tone: "summary",
        label: "한 줄 요약",
        headline: "\"퍼널 상단 OK, 하단에서 새고 있다\"",
        body: "유입·체류·장바구니까지는 분기 최고치인데, <strong>결제 단계 누수</strong>가 전체 매출을 누르고 있어요. 한 단계 수정이 가장 큰 임팩트를 줄 수 있어요.",
        action: "결제 페이지 에러 모니터링과 모바일 결제 UX A/B 테스트를 동시에 시작하세요."
      }
    ],
    evidence: {
      pages: [
        { label: "/products",   traffic: 28, conv: 24 },
        { label: "/cart",       traffic: 22, conv: 36 },
        { label: "/",           traffic: 17, conv: 8  },
        { label: "/checkout",   traffic: 12, conv: 21 },
        { label: "/membership", traffic: 11, conv: 17 }
      ],
      roas: [
        { channel: "Organic",     value: 8.4 },
        { channel: "Paid Search", value: 4.6 },
        { channel: "Display",     value: 2.0 },
        { channel: "Social",      value: 3.7 },
        { channel: "Email",       value: 13.1 }
      ]
    }
  },
  {
    insights: [
      {
        tone: "good",
        label: "SEO 키워드 확장",
        headline: "롱테일 키워드 유입이 전주 대비 +41%예요.",
        body: "지난주 발행한 <strong>'친환경 포장' 시리즈 콘텐츠 5편</strong>이 노출 점유율을 빠르게 끌어올리고 있어요. 평균 노출 순위가 12위 → 6위로 상승했어요.",
        action: "같은 키워드 클러스터로 후속 글 3편을 7일 안에 추가 발행하세요."
      },
      {
        tone: "warning",
        label: "Paid Search CPC 급등",
        headline: "Paid Search CPC가 한 주 만에 +22% 올랐어요.",
        body: "경쟁사 신규 진입으로 핵심 키워드 입찰가가 빠르게 오르고 있어요. <strong>현재 ROAS 4.6</strong> 수준이지만 추세가 이어지면 다음 주 손익분기 진입 가능성이 큽니다.",
        action: "키워드별 ROAS 하위 30%에 자동 입찰 상한을 걸어두세요."
      },
      {
        tone: "summary",
        label: "한 줄 요약",
        headline: "\"SEO는 청신호, Paid는 비용 경계\"",
        body: "유기 검색 비중을 더 키우기 좋은 시점이고, 동시에 <strong>Paid 채널 효율 모니터링</strong>을 강화해야 해요. 채널 균형을 다시 잡을 타이밍이에요.",
        action: "SEO 콘텐츠 예산을 +20% 늘리고 Paid Search 예산은 동결로 유지하세요."
      }
    ],
    evidence: {
      pages: [
        { label: "/blog",       traffic: 32, conv: 19 },
        { label: "/products",   traffic: 23, conv: 26 },
        { label: "/promotions", traffic: 15, conv: 28 },
        { label: "/category",   traffic: 17, conv: 16 },
        { label: "/membership", traffic: 10, conv: 18 }
      ],
      roas: [
        { channel: "Organic",     value: 10.5 },
        { channel: "Paid Search", value: 4.6 },
        { channel: "Display",     value: 1.9 },
        { channel: "Social",      value: 3.4 },
        { channel: "Email",       value: 13.6 }
      ]
    }
  },
  {
    insights: [
      {
        tone: "good",
        label: "Email 캠페인 성과",
        headline: "Email ROAS 12.4 — 가장 효율 높은 채널이에요.",
        body: "이번 주 발송한 신규회원 환영 시퀀스의 클릭률이 18%로 평균 대비 2.3배예요. <strong>자동화 시퀀스</strong>가 안정적으로 매출을 만들고 있습니다.",
        action: "비활성 회원에게도 동일한 시퀀스를 30일 이내 재발송 트리거로 걸어보세요."
      },
      {
        tone: "warning",
        label: "모바일 이탈 증가",
        headline: "모바일 이탈률이 데스크톱 대비 12%p 높아요.",
        body: "모바일 트래픽이 68%인데도 이탈률이 빠르게 오르고 있어요. <strong>첫 화면 로딩 시간(LCP) 3.4초</strong>가 원인일 가능성이 큽니다.",
        action: "메인 페이지 히어로 이미지를 WebP로 교체하고 LCP를 2초 이내로 낮추세요."
      },
      {
        tone: "summary",
        label: "한 줄 요약",
        headline: "\"채널 효율은 OK, UX는 점검 필요\"",
        body: "유입 측면의 효율은 좋아졌지만, <strong>온사이트 경험</strong>이 발목을 잡고 있어요. 이번 주는 UI/UX 개선에 집중할 시점입니다.",
        action: "PageSpeed Insights 점수가 70 미만인 페이지를 골라 우선순위로 처리하세요."
      }
    ],
    evidence: {
      pages: [
        { label: "/products",   traffic: 26, conv: 22 },
        { label: "/promotions", traffic: 21, conv: 35 },
        { label: "/",           traffic: 16, conv: 6  },
        { label: "/category",   traffic: 15, conv: 19 },
        { label: "/membership", traffic: 10, conv: 18 }
      ],
      roas: [
        { channel: "Organic",     value: 7.9 },
        { channel: "Paid Search", value: 3.8 },
        { channel: "Display",     value: 2.1 },
        { channel: "Social",      value: 4.2 },
        { channel: "Email",       value: 12.4 }
      ]
    }
  }
];

let variantIdx = 0;
let charts = {};
function destroyChart(id) { if (charts[id]) { charts[id].destroy(); charts[id] = null; } }

async function render({ regenerated = false, askText = "", lens = null } = {}) {
  setLoading(true);
  const loadingMsg = askText
    ? `OpenAI가 답변을 작성하는 중 — "${askText}"`
    : lens
      ? `OpenAI가 ${LENS_TITLES[lens]?.split(" ")[0] ?? "관점"} 관점으로 재분석 중…`
      : "OpenAI가 KPI 변화를 해석하는 중…";
  containerEl.innerHTML = `<div class="insight-loading">
    <div class="dots"><span></span><span></span><span></span></div>
    <div>${loadingMsg}</div>
  </div>`;

  // 1) 베이스 데이터 + 변형 적용
  const base = await generateInsights();
  await new Promise(r => setTimeout(r, regenerated ? 700 : 200));
  const variant = VARIANTS[variantIdx];
  const data = variant ? { ...base, ...variant, generatedAt: nowStamp(), tokens: 1800 + Math.floor(Math.random() * 900) } : base;

  // 2) 메타
  metaEl.textContent = `${data.generatedAt} · ${data.model} · ${data.tokens.toLocaleString()} 토큰`;

  // 3) 카드 (staggered fade-in + 헤드라인 타이핑)
  containerEl.innerHTML = data.insights.map((ins, i) => {
    const t = TONE[ins.tone];
    return `
      <div class="insight-card ${ins.tone} reveal" tabindex="0" style="animation-delay:${i * 180}ms">
        <span class="ribbon">${t.ribbon}</span>
        <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.75rem">
          <span style="font-size:1.5rem">${t.icon}</span>
          <span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b">${ins.label}</span>
        </div>
        <h3 class="typing-target" data-text="${escapeAttr(ins.headline)}"></h3>
        <p class="fade-in" style="animation-delay:${i * 180 + 600}ms">${ins.body}</p>
        <div class="action fade-in" style="animation-delay:${i * 180 + 800}ms">💡 <strong>다음 액션:</strong> ${ins.action}</div>
        <div class="card-foot fade-in" style="animation-delay:${i * 180 + 950}ms">
          <div class="feedback">
            <button class="fb-btn" data-fb="up" type="button" title="도움 됐어요">👍</button>
            <button class="fb-btn" data-fb="down" type="button" title="별로예요">👎</button>
            <button class="deepen-btn" type="button">🔍 더 깊이 보기</button>
          </div>
          <button class="copy-btn" type="button" title="액션 복사">📋 복사</button>
        </div>
      </div>`;
  }).join("");

  // 헤드라인 타이핑 — 카드별로 stagger
  containerEl.querySelectorAll(".typing-target").forEach((el, i) => {
    typeText(el, el.dataset.text, { startDelay: i * 180 + 300, charMs: 22 });
  });

  // 카드 인터랙션 — 복사 / 클릭 강조
  containerEl.querySelectorAll(".insight-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest(".copy-btn")) return;
      containerEl.querySelectorAll(".insight-card").forEach(c => c.classList.remove("is-active"));
      card.classList.add("is-active");
    });
    card.querySelector(".copy-btn").addEventListener("click", async e => {
      e.stopPropagation();
      const txt = card.querySelector(".action").textContent.replace("💡 다음 액션:", "").trim();
      try {
        await navigator.clipboard.writeText(txt);
        flash("📋 다음 액션을 클립보드에 복사했어요");
      } catch {
        flash("⚠️ 복사가 차단됐어요 — 텍스트를 직접 선택해주세요");
      }
    });
    card.querySelectorAll(".fb-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        card.querySelectorAll(".fb-btn").forEach(b => b.classList.remove("is-on"));
        btn.classList.add("is-on");
        flash(btn.dataset.fb === "up" ? "👍 피드백 반영됐어요" : "👎 다음에는 다른 각도로 분석할게요");
      });
    });
    card.querySelector(".deepen-btn").addEventListener("click", e => {
      e.stopPropagation();
      const label = card.querySelector("h3").textContent.trim();
      askInputEl.value = `"${label}" 더 자세히 분석해줘`;
      regenerate({ askText: askInputEl.value });
    });
  });

  // 4) 근거 차트
  destroyChart("contribChart");
  charts.contribChart = bar("contribChart",
    data.evidence.pages.map(p => p.label),
    [
      { label: "트래픽 %", data: data.evidence.pages.map(p => p.traffic), backgroundColor: "#cbd5e1" },
      { label: "전환 %",   data: data.evidence.pages.map(p => p.conv),    backgroundColor: "#10b981" }
    ],
    { indexAxis: "y" }
  );
  destroyChart("roasChart");
  charts.roasChart = bar("roasChart",
    data.evidence.roas.map(r => r.channel),
    [{ data: data.evidence.roas.map(r => r.value), backgroundColor: PALETTE.roas }],
    { legend: { display: false } }
  );

  lastGeneratedAt = Date.now();
  updateRefreshStamp();

  setLoading(false);
  if (regenerated) {
    const tag = askText ? `질문` : lens ? `${lens} 관점` : `재분석`;
    flash(`✨ ${tag} 완료 — ${data.tokens.toLocaleString()} 토큰 사용`);
  }
}

function setLoading(loading) {
  if (refreshBtn) {
    refreshBtn.disabled = loading;
    refreshBtn.classList.toggle("is-loading", loading);
  }
  if (askFormEl) {
    askFormEl.querySelector(".ask-submit").disabled = loading;
  }
}

function updateRefreshStamp() {
  if (!refreshStamp) return;
  const sec = Math.floor((Date.now() - lastGeneratedAt) / 1000);
  refreshStamp.textContent = sec < 5 ? "방금 분석" : sec < 60 ? `${sec}초 전 분석` : `${Math.floor(sec / 60)}분 전 분석`;
  clearTimeout(stampTimer);
  stampTimer = setTimeout(updateRefreshStamp, 15000);
}

function regenerate(opts = {}) {
  variantIdx = (variantIdx + 1) % VARIANTS.length;
  render({ regenerated: true, ...opts });
}

function escapeAttr(s) {
  return s.replace(/"/g, "&quot;");
}

function typeText(el, text, { startDelay = 0, charMs = 25 } = {}) {
  el.textContent = "";
  el.classList.add("typing");
  let i = 0;
  setTimeout(function tick() {
    if (i >= text.length) { el.classList.remove("typing"); return; }
    el.textContent = text.slice(0, ++i);
    setTimeout(tick, charMs);
  }, startDelay);
}

function nowStamp() {
  const d = new Date();
  const w = ["일","월","화","수","목","금","토"][d.getDay()];
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} (${w}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function flash(text) {
  let el = document.getElementById("mp-flash");
  if (!el) { el = document.createElement("div"); el.id = "mp-flash"; document.body.appendChild(el); }
  el.textContent = text;
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
}

// 새로고침 (subtle pill)
refreshBtn?.addEventListener("click", () => regenerate());

// 관점 칩 — 클릭 시 타이틀 변경 + 재분석
lensChipsEl?.addEventListener("click", e => {
  const chip = e.target.closest(".lens-chip");
  if (!chip) return;
  lensChipsEl.querySelectorAll(".lens-chip").forEach(c => c.classList.remove("is-active"));
  chip.classList.add("is-active");
  const lens = chip.dataset.lens;
  titleEl.textContent = LENS_TITLES[lens];
  regenerate({ lens });
});

// 자연어 질문
askFormEl?.addEventListener("submit", e => {
  e.preventDefault();
  const q = askInputEl.value.trim();
  if (!q) return;
  titleEl.textContent = `"${q}"에 대한 분석`;
  regenerate({ askText: q });
});

// 예시 질문 칩
document.querySelectorAll(".ask-example").forEach(btn => {
  btn.addEventListener("click", () => {
    askInputEl.value = btn.textContent;
    askInputEl.focus();
  });
});

render();
updateRefreshStamp();
