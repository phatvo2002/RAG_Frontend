# Design QA — Kho tri thức RAG

## Source visual truth

- `design-concepts/nexora-workbench-v3/02.Màn hình kho dữ liệu_Folder.png`
- `design-concepts/nexora-workbench-v3/03. Màn hình chi tiết các tài liệu trong folder.png`

## Implementation evidence

- Intended route: `/data-repo`
- Intended states: `Theo thư mục` (default) and an opened folder with its document list.
- Viewport: not captured.
- Source dimensions: 1488 × 1059 px for both references.
- Implementation screenshot: unavailable because the local route requires an authenticated session; the preview stopped at the login screen.
- Density normalization: not applicable; no implementation capture was available.

## Comparison

- Full-view comparison: blocked; the authenticated Kho tri thức screen could not be opened in the preview browser.
- Focused region comparison: blocked for the same reason.
- Static source review confirms the intended flow is represented in `DataRepoPage`: folder table first, then filtered document table after opening a folder. The visible secondary tree was removed from the layout and the right-side health panel was replaced by the activity panel shown in the references.

## Findings

- [P1] Runtime visual comparison could not be completed. The preview route requires login and no authenticated browser session was available.
  - Fix: open `/data-repo` with a valid local session and re-run the two-state visual comparison.

## Comparison history

- Initial pass: the implementation still showed a secondary folder tree and a knowledge-health panel, which differed from the 02/03 reference structure.
- Fix applied: the tree is hidden from the visible layout; Folder rows are rendered in the main `CustomTable`; the right panel now presents indexing issues and recent uploads as `Hoạt động`.
- Post-fix capture: blocked because the preview browser remains unauthenticated.

## Implementation checklist

- [x] Default repository view is Folder-first.
- [x] Folder rows open the matching document list.
- [x] Breadcrumb and active folder title update when a folder is opened.
- [x] Existing upload, search, filters, callbacks and route remain in place.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `git diff --check` passes.

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
