// Supabase Realtime을 흉내내는 모듈.
// 실제 코드: supabase.channel('messages').on('postgres_changes', ...)
import { CONFIG } from "../config.js";

export async function loadChannels() { return jload(CONFIG.data.channels); }
export async function loadMembers()  { return jload(CONFIG.data.members); }
export async function loadMessages(channelKey) {
  const path = CONFIG.data.messages[channelKey];
  if (!path) return [];
  return jload(path);
}
export async function loadMeetingNotes() { return jload(CONFIG.data.meetingNotes); }

async function jload(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`데이터 로딩 실패: ${path}`);
  return r.json();
}

// 새 메시지가 들어왔을 때를 흉내내는 헬퍼 (실시간 시연용)
export function simulateIncoming(callback, intervalMs = 4000) {
  return setInterval(() => callback({
    id: crypto.randomUUID(),
    name: "박세현",
    avatar: { letter: "세", color: "#60a5fa" },
    ts: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    body: "(데모) 새 메시지가 도착했어요. Realtime DB로 동기화 중!"
  }), intervalMs);
}
