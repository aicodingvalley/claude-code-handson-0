export const CONFIG = {
  useMock: true,
  workspace: {
    name: "TeamChat",
    organization: "싱싱박스",
  },
  ai: {
    model: "gpt-4o",
    notesSchema: ["결정 사항", "액션 아이템", "주요 논의", "다음 회의 안건"],
    translateLanguages: ["ko", "en", "ja"]
  },
  data: {
    channels: "./data/channels.json",
    members:  "./data/members.json",
    messages: {
      general:   "./data/messages-general.json",
      marketing: "./data/messages-marketing.json",
      dev:       "./data/messages-dev.json",
      support:   "./data/messages-support.json",
      global:    "./data/messages-global.json"
    },
    meetingNotes: "./data/meeting-notes.json"
  }
};
