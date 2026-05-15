// Supabase 클라이언트를 모사하는 데이터 소스.
// 실제 운영에서는 supabase-js의 .from('reports').select() 등이 들어갈 자리.
import { CONFIG } from "../config.js";

export async function getIndicators() {
  return fetch(CONFIG.data.indicatorsPath).then(r => r.json());
}

export async function getReportIndex() {
  return fetch(CONFIG.data.reportIndexPath).then(r => r.json());
}

export async function getReportByDate(date) {
  return fetch(`${CONFIG.data.reportsPath}${date}.md`).then(r => r.text());
}

export async function getLatestReport() {
  const idx = await getReportIndex();
  const latest = idx[0];
  const md = await getReportByDate(latest.date);
  return { ...latest, markdown: md };
}

export async function getScheduleLog() {
  return fetch(CONFIG.data.scheduleLogPath).then(r => r.json());
}
