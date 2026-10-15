# Design — NEXORA Workbench

This document is the shared visual contract for the NEXORA Workbench frontend.
It describes presentation only; routes, API contracts, data, permissions, and
business workflows remain owned by the application source code.

## Genre

Modern-minimal enterprise workbench.

## Visual direction

- Light canvas with cool blue-white surfaces.
- Deep navy navigation rail with cobalt active states.
- Dense but readable operational tables and compact controls.
- Blue is reserved for primary actions, current navigation, links, and focus.
- Green, amber, and red communicate status only.

## App shell

- Desktop sidebar: 240px expanded, 64px collapsed.
- Header: 60px high with workspace identity, global search, utilities, and profile.
- Mobile sidebar: overlay drawer opened from the header and closed by selection,
  overlay click, close control, or Escape.
- Main content uses a full-height scroll region; detail panels stay visually
  separated with a vertical rule and white surface.

## Typography

- Body: system UI stack already used by the project.
- Display: system UI stack with semibold/bold weight.
- Body text remains compact for tables, filters, and dense operational views.
- Headings use upright roman styling; emphasis comes from weight and colour.

## Tokens

Runtime tokens live in `src/index.css` under the `--nexora-*` namespace. New
visual code should consume those tokens through CSS classes or Tailwind theme
aliases instead of introducing unrelated colours.

## Interaction

- Preserve all existing route, API, form, CRUD, query, and permission behavior.
- Visual states: default, hover, focus-visible, active, disabled, loading,
  success, and error.
- Motion is restrained and limited to transform/opacity. Reduced motion removes
  spatial movement.

## Page families

- Workbench pages: dashboard, repository, projects, tasks, reports, calendar,
  meetings, and administration.
- Conversation page: AI chat with a dedicated history/context composition.
- Entry page: login with the existing authentication flow.

## Source of truth

The reference set is `design-concepts/nexora-workbench-v3`. Its visual rhythm,
colour relationships, density, panel composition, and navigation hierarchy are
the target; its sample data is not copied into runtime behavior.
