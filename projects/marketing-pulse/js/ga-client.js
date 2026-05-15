// GA Data API 클라이언트 모사.
// 실제 운영에서는 google-analytics-data 라이브러리의 runReport()가 들어가요.
import { CONFIG } from "../config.js";

export async function fetchKpis()     { return jload(CONFIG.data.kpis); }
export async function fetchTrend()    { return jload(CONFIG.data.trend); }
export async function fetchChannels() { return jload(CONFIG.data.channels); }
export async function fetchPages()    { return jload(CONFIG.data.pages); }

async function jload(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`GA Data fetch 실패: ${path}`);
  return r.json();
}
