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
