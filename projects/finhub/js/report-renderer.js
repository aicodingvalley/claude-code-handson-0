// 마크다운 → HTML 단순 렌더러
// 학습용이라 외부 라이브러리 없이 직접 구현. (실제 운영에서는 marked 등 사용 권장)

export function renderMarkdown(md) {
  const lines = md.split("\n");
  const out = [];
  let inList = false;

  const flushList = () => {
    if (inList) { out.push("</ul>"); inList = false; }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^# /.test(line))      { flushList(); out.push(`<h1>${inline(line.replace(/^# /, ""))}</h1>`); }
    else if (/^## /.test(line)) { flushList(); out.push(`<h2>${inline(line.replace(/^## /, ""))}</h2>`); }
    else if (/^### /.test(line)){ flushList(); out.push(`<h3>${inline(line.replace(/^### /, ""))}</h3>`); }
    else if (/^- /.test(line))  {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.replace(/^- /, ""))}</li>`);
    }
    else if (line.trim() === "") { flushList(); }
    else { flushList(); out.push(`<p>${inline(line)}</p>`); }
  }
  flushList();
  return out.join("\n");
}

function inline(s) {
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
