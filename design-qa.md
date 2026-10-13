# Design QA — Kho tri thức RAG

## Source visual truth

- `design-concepts/nexora-workbench-v3/02.Màn hình kho dữ liệu_Folder.png`
- `design-concepts/nexora-workbench-v3/03. Màn hình chi tiết các tài liệu trong folder.png`

## Implementation evidence

- Intended route: `/data-repo`
- Source dimensions: 1488 × 1059 px for both references.
- Intended states: folder list and an opened folder with its document list, in light and dark themes.
- Viewport: implementation capture not available. The Vite preview required elevated process permission and the request was rejected.
- Implementation screenshot: not captured; visual comparison and interaction checks could not be completed.
- Production build: `npm run build` passed. TypeScript and Vite completed; Vite reported the existing >500 KB bundle warning.
- Density normalization: not applicable because no implementation capture is available.

## Comparison

- Full-view comparison: blocked; the rendered `/data-repo` screen could not be captured.
- Focused region comparison: blocked because no implementation screenshot is available.
- Static review confirms the page retains folder and document views, nested folder controls, existing modals, and the activity panel. The activity panel is responsive and its tabs switch between indexing issues and documents in the current folder.

## Findings

- [P1] Runtime visual comparison and interaction checks could not be completed. The local preview launch permission request was rejected.
  - Fix: start the local preview with permission, open `/data-repo` in an authenticated session, and compare both states at the source viewport.

## Comparison history

- Implementation updates: the activity panel opens by default, overlays content below wide desktop sizes, and can be toggled from the page header. Its tabs switch content. Folder selection highlight follows the active folder; expand buttons expose `aria-expanded` state.
- Visual iteration: blocked before screenshot capture because local preview permission was rejected; no visual fixes were judged from a rendered comparison.

## Implementation checklist

- [x] Folder and document views, parent-child navigation, upload/create/detail flows, and existing API behavior are retained.
- [x] Light and dark theme styles remain; narrow layouts use the responsive activity panel.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `git diff --check` passes.
- [ ] Compare rendered folder and document views in light/dark themes and at a narrow viewport.
- [ ] Verify folder expand/collapse, tabs, activity panel controls, and existing actions in the browser.

## Final result

blocked

---

# Design QA — AI chat redesign

## Source and implementation

- Source: user-provided `codex-clipboard-b427e4ae-a4d6-46ee-b457-970555dd8353.png` (1272 px wide), compared with the current chat screenshot `codex-clipboard-16e30e57-55bf-4a6d-9882-7a661cdc295f.png`.
- Implementation: `src/pages/chat/ChatPage.tsx`, `ChatAnswerContent.tsx`, and `ChatSourcesPanel.tsx`.
- Production build: `npm.cmd run build` passed after the final responsive breakpoint change.

## Comparison

- Implemented the dark conversation rail, document-style message thread, compact composer, and source rail at the reference width. On narrower screens, the source rail opens as a drawer.
- Source entries and file-type filters are derived from the active answer's real API sources. The current API has no project-scoped context, saved conversations, feedback, or document excerpts, so those reference-only details were not fabricated.
- No authenticated frontend/backend session was running locally. A rendered screenshot in the same conversation state could not be captured and compared for exact spacing, typography, or narrow-screen behavior.

## Final result

blocked

---

# Design QA — AI chat layout

## Source visual truth

- User-provided chat screenshot: `codex-clipboard-e53e988d-b56e-433f-be8d-b4fd27771a01.png` (1611 × 732 px).
- Target: light three-column layout with conversation history, chat bubbles, and a reference panel.

## Implementation evidence

- Route: `/chat`.
- Updated `src/pages/chat/ChatPage.tsx` using live conversation, streaming, model, and source data.
- Frontend dev server started at `http://127.0.0.1:5173/`.
- TypeScript check: `npx tsc --noEmit` passed.
- Browser capture: unavailable because the desktop browser automation tool failed to initialize (`failed to write kernel assets`).

## Comparison

- Source screenshot inspected at its supplied dimensions.
- Runtime visual comparison and interaction inspection are blocked until the desktop browser tool works or the authenticated chat page is opened in a usable browser session.
- Source cards show available filename, score, page, and character location metadata. The chat API does not provide a passage excerpt, so no excerpt was fabricated for the expanded card.

## Final result

blocked

---

# Design QA — Meeting waiting room

## Source and implementation

- Source: user-provided screenshot `codex-clipboard-3a3ea5f0-6c81-43ae-8eef-4cfa5595f7e7.png` (1494 × 635, organizer, Scheduled).
- Implementation: `src/pages/meetings/MeetingRoomPage.tsx`.
- Production build: `npm.cmd run build` passed.

## Comparison

- The source image was inspected. The implementation could not be captured in the same authenticated meeting state because no local frontend/backend session was running.
- Fonts, layout, colors, icon, and copy cannot be judged against a rendered screenshot yet.
- Next check: open a Scheduled meeting as its organizer at 1494 × 635, compare a capture with the source, then inspect the participant and narrow-screen states.

## Final result

blocked

---

# Design QA — Meeting calendar by day period

## Source and implementation

- Source: user-provided screenshot `codex-clipboard-cf1a391b-134a-40c0-be6a-6ab5ca684ab3.png` (1396 × 597, week view).
- Implementation: `src/pages/meetings/MeetingsPage.tsx`.
- Production build: `npm.cmd run build` passed.

## Comparison

- The source image was inspected. The authenticated meeting calendar could not be captured locally because no frontend/backend session was running.
- The rendered typography, spacing, colors, icons, and meeting cards therefore remain unverified against the screenshot.
- Next check: open `/meetings` with meeting data at the source viewport, compare the week layout, then inspect month view and narrower widths.

## Final result

blocked

---

# Design QA — Dashboard sidebar alignment with AI chat

## Source and implementation

- Source: user-provided dashboard sidebar screenshot `codex-clipboard-dc06ccab-e029-4399-9bc1-a7fd5d0a1165.png` and the existing AI chat sidebar in `src/pages/chat/ChatPage.tsx`.
- Implementation: `src/components/sidebar/index.tsx`.
- Production build: `npm.cmd run build` passed.

## Comparison

- The dashboard sidebar now uses the chat sidebar's 238 px width, 62 px header, Segoe UI application font, navy surface, blue brand mark, muted text, and subdued active navigation style. Its collapsed version uses the same palette.
- Navigation groups and permission filtering remain intact; the account footer opens the account page like the chat sidebar.
- No authenticated local frontend session was running, so the rendered sidebar could not be captured in the same state as the screenshot for visual comparison.

## Final result

blocked

---

# Design QA — Meeting list and detail page

## Source and implementation

- Source: user-provided `codex-clipboard-f7f93e4a-8813-4727-bb88-833f98c2bb68.png` (meeting list with right detail panel).
- Implementation: `src/pages/meetings/MeetingsPage.tsx` and `MeetingCalendarView.tsx`.
- Production build: `npm.cmd run build` passed.

## Comparison

- The meeting route now opens in a list-and-detail layout with search, tabs, date and role filters, pagination, and a calendar toggle. The existing create, edit, and room navigation flows are retained.
- All rows, participants, timestamps, and statuses come from the meeting API. The API does not supply physical locations, Teams links, discussion, checklist, notes, or minutes, so the design does not display fabricated versions of them.
- An authenticated local frontend/backend session was not available for a same-state screenshot comparison. Exact rendered spacing, fonts, and responsive behavior remain visually unverified.

## Final result

blocked

---

# Design QA — Shared data tables

## Source and implementation

- Source: user-provided `codex-clipboard-bf96afd8-747b-4fa9-9273-9a5817646c8f.png` (dark data table with filters and pagination).
- Implementation: shared table parts in `src/components/customTable/index.tsx`, table styling in `src/index.css`, and list-table markup across dashboard, projects, data repository, and admin pages.
- `npx tsc --noEmit`, `npm run build`, and `git diff --check` passed.

## Comparison

- Static source review confirms all list tables use the shared `CustomTable` table, header, body, row, and cell components. Existing page-specific filters, selection, actions, and pagination callbacks remain in place.
- The in-app Browser rejected access to the local Vite preview at `127.0.0.1:5173` because permission was declined. A rendered screenshot and interaction check could not be completed.

## Final result

blocked
