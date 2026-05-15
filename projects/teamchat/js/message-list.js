// 메시지 렌더링 공통 모듈
export function renderMessage(m, opts = {}) {
  const avatar = m.avatar || { letter: m.name?.[0] ?? "?", color: "#94a3b8" };
  const reactions = m.reactions?.length
    ? `<div class="reactions">${m.reactions.map(r => `<span>${r}</span>`).join("")}</div>`
    : "";
  const flag = m.flag ? `<span class="flag-pill">${m.flag}</span>` : "";

  const isForeign = m.lang && m.lang !== "ko";
  const autoOn = !!opts.autoTranslate;
  const showBlock = isForeign && m.translation && autoOn;
  const translateChip = isForeign && m.translation
    ? `<button class="translate-chip" data-action="toggle-translate" type="button">🌐 ${autoOn ? "원문 보기" : "번역 보기"}</button>`
    : "";

  return `
    <div class="msg-row" data-lang="${m.lang || "ko"}">
      <div class="avatar" style="background:${avatar.color}">${avatar.letter}</div>
      <div style="flex:1;min-width:0">
        <div><span class="name">${m.name}</span> ${flag} <span class="ts">${m.ts}</span> ${translateChip}</div>
        <div class="body">${m.body}</div>
        ${m.translation ? `
          <div class="translate-block ${showBlock ? "" : "is-collapsed"}">
            <span class="tb-label">🇰🇷 한국어 번역</span>
            <span class="tb-source">${m.flag || "🌐"} 원문</span>
            <div class="tb-text">${m.translation}</div>
          </div>` : ""}
        ${m.autoSent ? `<div><span class="auto-sent">자동 발송됨: ${m.autoSent}</span></div>` : ""}
        ${reactions}
      </div>
    </div>`;
}

export function renderDateDivider(label) {
  return `<div class="date-divider"><hr/><span>${label}</span><hr/></div>`;
}
