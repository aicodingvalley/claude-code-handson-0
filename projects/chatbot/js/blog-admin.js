// blog.html (관리자 대시보드) — 데모 데이터로 동작
const PAGE_SIZE = 5;
let currentPage = 1;

const POSTS = [
  {
    id: "p1",
    createdAt: "2026-05-10 06:42",
    audience: "30대 워킹맘",
    category: "라이프스타일",
    title: "새벽 6시, 문 앞의 작은 여유",
    summary: "자는 동안 끝나는 장보기. 워킹맘 아침 30분을 돌려받는 이야기. 산지 직송으로 신선도까지 보장.",
    brief: "주제: 새벽배송이 워킹맘에게 주는 일상의 여유\n톤: 친근한 · 따뜻한 · 실용적\n길이: 보통 (~1,200자)",
    status: "published",
    body: `# 새벽 6시, 문 앞의 작은 여유

## 아침을 책임지는 일, 더 이상 혼자 하지 않아도 돼요

워킹맘에게 아침은 '준비'가 아니라 '전쟁'입니다. 아이 도시락, 남편 출근 식사, 그리고 내 아침까지. 그 모든 걸 8시 전에 끝내야 하니까요.

그래서 많은 워킹맘들이 싱싱박스를 선택해요. 밤 11시까지 주문하면, 다음날 새벽 7시 전에 문 앞에 도착하거든요. "내가 자는 동안 장을 봐주는 느낌"이라는 후기가 가장 많은 이유예요.

## 왜 워킹맘들은 새벽배송에 빠질까요?

1. 아침 30분을 돌려받는 마법
2. 진짜 신선한 식재료 (산지 직송 · 100% 환불 보장)
3. 월 4,900원 멤버십으로 더 똑똑하게

오늘 밤, 한번 시도해보세요. 내일 아침의 식탁이 달라져요.`,
    tokens: 982,
    savedAt: "2026-05-10 06:44",
  },
  {
    id: "p2",
    createdAt: "2026-05-08 14:11",
    audience: "1인 가구",
    category: "실용팁",
    categoryLabel: "실용 팁",
    title: "시들지 않는 채소를 고르는 3가지 기준",
    summary: "진열대에 며칠 묵은 잎채소를 피하는 법, 산지 직송이 왜 다른지, 보관 팁까지 한 번에.",
    brief: "주제: 신선한 채소 고르는 법\n톤: 실용적 · 친근한\n길이: 보통 (~1,200자)",
    status: "published",
    body: `# 시들지 않는 채소를 고르는 3가지 기준

마트 진열대에서 며칠 묵은 채소를 사오면, 일주일이 채 안 돼 시들어요. 1인 가구라면 더 아쉽죠. 핵심은 세 가지입니다.

## 1. 잎의 단면을 보세요
잘린 면이 갈색이면 며칠 지난 채소. 깨끗한 흰색·연두색이면 신선해요.

## 2. 줄기를 눌러보세요
탄력이 있고 단단하면 OK. 물컹하면 수분이 빠진 상태예요.

## 3. 산지 직송 여부 확인
중간 유통이 줄어들수록 식탁에 닿기까지의 시간이 짧아요. 싱싱박스는 평균 18시간 안에 배송됩니다.`,
    tokens: 1148,
    savedAt: "2026-05-08 14:18",
  },
  {
    id: "p3",
    createdAt: "2026-05-05 09:30",
    audience: "30대 부부",
    category: "멤버십",
    title: "월 4,900원, 멤버십이 본전인 순간",
    summary: "한 달 8번 주문이면 무조건 이득. 숫자로 보는 프리미엄 멤버십 손익분기점.",
    brief: "주제: 멤버십 손익분기점 분석\n톤: 분석적 · 친근한\n길이: 짧게 (~500자)",
    status: "published",
    body: `# 월 4,900원, 멤버십이 본전인 순간

배송비 한 번에 3,000원. 멤버십은 월 4,900원에 무제한 무료배송.

손익분기점은 **한 달 2번 주문**. 워킹맘 가정의 평균 주문 횟수는 8번. 사실상 매달 19,000원 절약하는 셈이에요.

쇼핑 시간을 돈으로 환산하면? 그건 덤이고요.`,
    tokens: 876,
    savedAt: "2026-05-05 09:33",
  },
  {
    id: "p4",
    createdAt: "2026-05-03 21:08",
    audience: "워킹맘",
    category: "레시피",
    title: "아침 5분 도시락, 냉장고 털기 레시피",
    summary: "전날 배송된 재료로 만드는 한 끼. 도마 한 번이면 끝나는 메뉴 다섯 가지.",
    brief: "주제: 5분 도시락 레시피 모음\n톤: 따뜻한 · 실용적\n길이: 길게 (~2,500자)",
    status: "draft",
    statusLabel: "초안",
    body: "",
    tokens: 0,
    savedAt: null,
  },
  {
    id: "p5",
    createdAt: "2026-04-28 11:55",
    audience: "50대 부부",
    category: "브랜드",
    categoryLabel: "브랜드 스토리",
    title: "로컬푸드, 왜 더 비싼데 더 싸게 느껴질까",
    summary: "중간 유통을 줄이면 가격이 아니라 신뢰가 달라진다는 이야기. 산지 인터뷰 포함.",
    brief: "주제: 로컬푸드의 가치\n톤: 감성적 · 전문적\n길이: 길게 (~2,500자)",
    status: "review",
    statusLabel: "검토 중",
    body: "# 로컬푸드, 왜 더 비싼데 더 싸게 느껴질까\n\n(검토 중인 초안...)",
    tokens: 1205,
    savedAt: "2026-04-28 12:30",
  },
  ...buildMorePosts(),
];

function buildMorePosts() {
  const seeds = [
    ["라이프스타일", "30대 워킹맘", "퇴근 후 30분이 사라지는 이유"],
    ["레시피", "1인 가구", "전자레인지 한 번이면 끝나는 저녁"],
    ["멤버십", "40대 부부", "두 번째 결제일에 깨닫는 것"],
    ["실용팁", "대학생", "기숙사 미니냉장고 200% 활용법"],
    ["브랜드", "50대 부부", "산지 인터뷰: 강원도 양배추 농부 이야기"],
    ["라이프스타일", "1인 가구", "냉장고 정리, 일요일 밤 10분"],
    ["레시피", "30대 워킹맘", "도시락 5종 세트, 일주일 식단"],
    ["실용팁", "30대 부부", "신선도 7일 가는 보관 용기 고르기"],
    ["멤버십", "워킹맘", "연간 47,000원, 그게 그렇게 큰가요?"],
    ["라이프스타일", "1인 가구", "혼자 사는 사람들의 새벽 6시"],
    ["브랜드", "30대 부부", "왜 우리는 농부의 이름을 알아야 할까"],
    ["레시피", "50대 부부", "건강 식단, 외식보다 싸게 만들기"],
    ["실용팁", "워킹맘", "주말 장보기를 1시간 단축하는 법"],
    ["라이프스타일", "대학생", "자취 1년차, 가장 후회되는 소비"],
    ["멤버십", "30대 워킹맘", "프리미엄 vs 베이직, 무엇이 다른가"],
    ["레시피", "1인 가구", "냉장고에 늘 있어야 할 5가지 재료"],
    ["브랜드", "워킹맘", "엄마들이 직접 고른 베스트 5"],
    ["실용팁", "50대 부부", "두 사람 분량으로 주문하는 똑똑한 법"],
    ["라이프스타일", "30대 부부", "새벽배송 1년, 우리집이 달라진 점"],
    ["레시피", "워킹맘", "유치원 도시락, 5분 메뉴 모음"],
  ];
  const labelMap = { 라이프스타일: "라이프스타일", 레시피: "레시피", 멤버십: "멤버십", 실용팁: "실용 팁", 브랜드: "브랜드 스토리" };
  const statuses = ["published", "published", "published", "published", "draft", "review"];
  const now = new Date("2026-04-27T00:00:00");
  return seeds.map((s, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 2);
    d.setHours(7 + (i * 3) % 14, (i * 17) % 60);
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const status = statuses[i % statuses.length];
    return {
      id: `p${6 + i}`,
      createdAt: stamp,
      audience: s[1],
      category: s[0],
      categoryLabel: labelMap[s[0]],
      title: s[2],
      summary: `${s[1]}을 위한 ${labelMap[s[0]]} 글. AI가 작성한 초안을 검토 후 발행하세요.`,
      brief: `주제: ${s[2]}\n톤: 친근한 · 실용적\n길이: 보통 (~1,200자)`,
      status,
      body: status === "draft" ? "" : `# ${s[2]}\n\n${s[1]}을 위한 본문입니다. 이 글은 AI가 작성한 데모 초안이에요.`,
      tokens: status === "draft" ? 0 : 800 + (i * 47) % 800,
      savedAt: status === "draft" ? null : stamp,
    };
  });
}

const STATUS_MAP = {
  published: { label: "발행됨", className: "answered" },
  draft: { label: "초안", className: "pending" },
  review: { label: "검토 중", className: "pending" },
};

const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const tableBody = document.getElementById("postList");
const statusInfo = document.getElementById("statusInfo");
const refreshBtn = document.getElementById("refreshBtn");
const backBtn = document.getElementById("backBtn");

const detailDate = document.getElementById("detailDate");
const detailCustomer = document.getElementById("detailCustomer");
const detailType = document.getElementById("detailType");
const detailTitle = document.getElementById("detailTitle");
const detailStatus = document.getElementById("detailStatus");
const detailContent = document.getElementById("detailContent");
const answerInput = document.getElementById("answerInput");
const aiGenerateBtn = document.getElementById("aiGenerateBtn");
const saveBtn = document.getElementById("saveBtn");
const aiStatus = document.getElementById("aiStatus");
const answeredMeta = document.getElementById("answeredMeta");
const toast = document.getElementById("toast");

let currentPost = null;
let typingTimer = null;

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function showToast(message, kind = "") {
  toast.textContent = message;
  toast.className = `toast ${kind}`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function statusBadge(post) {
  const s = STATUS_MAP[post.status] || { label: post.statusLabel || post.status, className: "pending" };
  return `<span class="answer-status ${s.className}">${escapeHtml(s.label)}</span>`;
}

const pagination = document.getElementById("pagination");

function renderList() {
  const totalPages = Math.max(1, Math.ceil(POSTS.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = POSTS.slice(start, start + PAGE_SIZE);

  tableBody.innerHTML = slice.map(p => `
    <li class="post-item" data-id="${p.id}">
      <div class="post-row-top">
        <span class="type-badge type-${p.category}">${escapeHtml(p.categoryLabel || p.category)}</span>
        ${statusBadge(p)}
      </div>
      <div class="post-title">${escapeHtml(p.title)}</div>
      <div class="post-summary">${escapeHtml(p.summary)}</div>
      <div class="post-meta">
        <span>👤 ${escapeHtml(p.audience)}</span>
        <span>📅 ${escapeHtml(p.createdAt)}</span>
        ${p.tokens ? `<span>🔤 ${p.tokens.toLocaleString()} 토큰</span>` : ""}
      </div>
    </li>
  `).join("");

  tableBody.querySelectorAll(".post-item").forEach(el => {
    el.addEventListener("click", () => {
      const post = POSTS.find(p => p.id === el.dataset.id);
      if (post) openDetail(post);
    });
  });

  const published = POSTS.filter(p => p.status === "published").length;
  statusInfo.textContent = `총 ${POSTS.length}건 · 발행 ${published}건`;

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  pagination.innerHTML = `
    <button class="page-btn" data-action="prev" ${currentPage === 1 ? "disabled" : ""}>‹</button>
    ${pages.map(i => `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`).join("")}
    <button class="page-btn" data-action="next" ${currentPage === totalPages ? "disabled" : ""}>›</button>
  `;
  pagination.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.action === "prev") currentPage--;
      else if (btn.dataset.action === "next") currentPage++;
      else currentPage = Number(btn.dataset.page);
      renderList();
    });
  });
}

function openDetail(post) {
  currentPost = post;
  detailDate.textContent = post.createdAt;
  detailCustomer.textContent = post.audience;
  detailType.textContent = post.categoryLabel || post.category;
  detailTitle.textContent = post.title;
  detailStatus.innerHTML = statusBadge(post);
  detailContent.textContent = post.brief;
  answerInput.value = post.body || "";
  aiStatus.textContent = "";
  aiStatus.className = "ai-status";
  answeredMeta.textContent = post.savedAt
    ? `마지막 저장: ${post.savedAt} · ${post.tokens} 토큰`
    : "아직 저장된 본문이 없습니다.";

  listView.classList.add("hidden");
  detailView.classList.remove("hidden");
}

function closeDetail() {
  if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  currentPost = null;
  detailView.classList.add("hidden");
  listView.classList.remove("hidden");
  renderList();
}

// 데모용 — 글감별 미리 작성된 본문을 한 글자씩 타이핑
function generateAI() {
  if (!currentPost) return;
  if (typingTimer) return;

  const draft = buildDraft(currentPost);
  const existing = answerInput.value.trim();
  if (existing && !confirm("기존 본문을 새 초안으로 덮어쓸까요?")) return;

  aiGenerateBtn.disabled = true;
  saveBtn.disabled = true;
  aiStatus.textContent = "AI가 본문을 생성하는 중...";
  aiStatus.className = "ai-status";

  answerInput.value = "";
  let i = 0;
  const CHUNK = 3;
  typingTimer = setInterval(() => {
    if (i >= draft.length) {
      clearInterval(typingTimer);
      typingTimer = null;
      aiGenerateBtn.disabled = false;
      saveBtn.disabled = false;
      aiStatus.textContent = "초안 생성 완료. 내용을 검토·수정한 뒤 저장하세요.";
      aiStatus.className = "ai-status success";
      return;
    }
    answerInput.value += draft.slice(i, i + CHUNK);
    answerInput.scrollTop = answerInput.scrollHeight;
    i += CHUNK;
  }, 18);
}

const HOOKS = [
  "이런 적, 한 번쯤 있으셨죠.",
  "솔직히, 처음엔 저도 반신반의했어요.",
  "사실 어제까지만 해도 몰랐던 이야기예요.",
  "주변에서 자주 듣는 고민이 있어요.",
  "통계 하나로 시작해볼게요.",
  "최근 들어 부쩍 많아진 질문이에요.",
];
const SECTION_TITLES = [
  ["우리가 매일 마주하는 작은 불편", "그래서 어떻게 바뀌었나요", "한 번 써보면 다시 못 돌아가는 이유"],
  ["문제는 시간이 아니라 선택지였어요", "싱싱박스가 다르게 접근한 방식", "데이터로 보는 변화"],
  ["하루 30분, 의외로 큰 차이", "신선함을 만드는 세 가지 단계", "독자들이 가장 많이 묻는 질문"],
  ["출발점은 '귀찮음'이었습니다", "그 귀찮음을 줄이는 방법", "결과적으로 남는 것"],
];
const BULLETS = [
  ["산지 직송으로 평균 18시간 안에 도착", "자체 품질관리팀의 검수", "마음에 안 들면 100% 환불"],
  ["월 4,900원 멤버십으로 무제한 무료배송", "한 달 2회만 주문해도 본전", "워킹맘 가정 평균 8회 = 매달 19,000원 절약"],
  ["밤 11시 주문 → 다음날 새벽 7시 도착", "냉장고 빈자리 걱정 끝", "잠자는 동안 장보기 완료"],
  ["로컬푸드 비중 47%까지 확대", "농부와 직접 연결되는 큐레이션", "지역마다 다른 제철 박스"],
];
const CLOSINGS = [
  "오늘 밤, 한 번만 시도해보세요. 내일 아침이 달라져요.",
  "작은 변화 하나가 일주일을 바꿉니다.",
  "지금 시작해도 늦지 않아요. 어쩌면 가장 빠른 타이밍일지도.",
  "당신의 30분이, 그리고 가족의 식탁이 돌아옵니다.",
  "한 번의 주문이 어떻게 일상을 바꾸는지 직접 느껴보세요.",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function buildDraft(post) {
  // 매번 새로운 조합으로 글 생성
  const hook = pick(HOOKS);
  const sections = pick(SECTION_TITLES);
  const bullets = pick(BULLETS);
  const closing = pick(CLOSINGS);
  const variant = Math.floor(Math.random() * 1000);

  return `# ${post.title}

${hook} ${post.summary}

## ${sections[0]}

${post.audience} 분들에게 이 이야기는 특히 와 닿을 거예요. ${post.title.replace(/[#?!.]/g, "")}—이 한 줄 안에 사실 많은 맥락이 담겨 있거든요.

## ${sections[1]}

${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

## ${sections[2]}

핵심은 결국 ‘선택지를 단순하게 만드는 일’입니다. 우리는 매일 너무 많은 선택을 하고, 그래서 정작 중요한 결정에 쓸 에너지를 잃죠. 싱싱박스는 그 선택 한 칸을 대신 채워두는 도구예요.

> ${closing}

— BlogCraft AI · draft #${variant}`;
}

function saveAnswer() {
  if (!currentPost) return;
  const body = answerInput.value.trim();
  if (!body) {
    aiStatus.textContent = "본문을 입력해주세요.";
    aiStatus.className = "ai-status error";
    return;
  }
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  currentPost.body = body;
  currentPost.tokens = Math.max(400, Math.round(body.length * 0.75));
  currentPost.savedAt = stamp;
  if (currentPost.status === "draft") currentPost.status = "published";

  detailStatus.innerHTML = statusBadge(currentPost);
  answeredMeta.textContent = `마지막 저장: ${stamp} · ${currentPost.tokens} 토큰`;
  aiStatus.textContent = "";
  showToast("글을 저장했어요", "success");
}

refreshBtn.addEventListener("click", () => {
  refreshBtn.disabled = true;
  statusInfo.textContent = "동기화 중...";
  setTimeout(() => {
    renderList();
    refreshBtn.disabled = false;
    showToast("목록을 새로고침했어요", "success");
  }, 500);
});
backBtn.addEventListener("click", closeDetail);
aiGenerateBtn.addEventListener("click", generateAI);
saveBtn.addEventListener("click", saveAnswer);

renderList();
