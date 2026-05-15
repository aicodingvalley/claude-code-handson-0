# teamchat — 실시간 협업 도구

Claude Code 핸즈온 **D 섹션** 결과물입니다. Supabase Realtime으로 만든 미니 슬랙 위에 AI 기능을 더해갑니다.

| 강의 | 파일 | 내용 |
|------|------|------|
| **D1** | `index.html` | 채널·DM·멤버 패널을 가진 실시간 채팅 |
| **D2** | `meeting-notes.html` | 회의 채팅 + AI가 자동 정리한 회의록 패널 |
| **D3** | `translate.html` | 한·미·일 다국어 채널 + 자동 번역 |

## 실행

```bash
npm install
npm run dev          # http://localhost:5176
```

## 환경 변수

```bash
cp .env.example .env
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=...
# OPENAI_API_KEY=sk-...
```

데모는 `js/realtime-mock.js`가 Supabase Realtime을 흉내내며 `data/messages-*.json`을 재생합니다.

## 폴더 구조

```
teamchat/
├── package.json
├── README.md
├── .env.example
├── config.js               # 워크스페이스명, 채널 목록, AI 모델
├── index.html              # D1 — 미니 슬랙
├── meeting-notes.html      # D2 — AI 회의록 모드
├── translate.html          # D3 — 실시간 번역 모드
├── css/
│   ├── base.css
│   ├── chat.css            # 슬랙 레이아웃
│   └── notes.css           # 회의록 패널 전용
├── js/
│   ├── realtime-mock.js    # Supabase Realtime 모사
│   ├── message-list.js     # 메시지 렌더링 공통 모듈
│   ├── index-page.js       # D1
│   ├── notes-page.js       # D2 (요약 패널 트리거 포함)
│   └── translate-page.js   # D3
└── data/
    ├── channels.json
    ├── members.json
    ├── messages-general.json     # D1 대화
    ├── messages-marketing.json   # D2 회의
    ├── meeting-notes.json        # D2 AI 회의록 결과
    └── messages-global.json      # D3 다국어 대화
```

## 핵심 학습 포인트

- Supabase Realtime 흉내내기 → `js/realtime-mock.js`
- AI 회의록 Skill → `js/notes-page.js` `generateMeetingNotes()`
- 자동 번역 인라인 표시 → `js/translate-page.js`
