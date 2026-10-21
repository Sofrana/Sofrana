# Project guide for Claude

Sofrana is a recipe platform built as a single Next.js app that is also installable as a PWA. Read `README.md` and `docs/ROADMAP.md` for context.

## Structure

- `src/app` — routes, pages, API route handlers, admin form
- `src/components` — UI and design system components
- `src/lib/core` — pure business logic (scaling, menu builder, voice command parser, consensus math)
- `src/lib/db` — Drizzle schema and queries
- `src/lib/ai` — Claude client and tool definitions (server only)
- `scripts/pipeline` — normalize → consensus → score

## Conventions

- TypeScript strict everywhere. No `any`.
- Business logic lives in `src/lib/core` as pure functions with no React, Next.js or database imports, so it stays testable and portable.
- Database access goes through Drizzle in `src/lib/db`. No raw SQL in components except search queries in `src/lib/db/search.ts`.
- User-facing strings go through `next-intl`. Turkish is the default locale, English the second.
- Styling uses the design system tokens; do not hardcode colors.
- Browser APIs that are not universally supported (Web Speech API, Screen Wake Lock) are feature-detected, with a working fallback.

## Testing

- Every function in `src/lib/core` has Vitest tests next to it (`*.test.ts`).
- Write or update the test first, then the implementation.
- Run `pnpm lint && pnpm typecheck && pnpm test` before finishing a task.

## AI in the product

- Voice commands: rules first (`src/lib/core/voice`), Claude only when no rule matches.
- Pipeline calls to Claude use the Batch API and results are stored in the database. Never call Claude on page render.
- Never expose API keys to client code; Claude is only called from server code.

## Data and copyright

- Store only ingredient lists and quantities from external recipes, always with `source_url`.
- Never copy recipe text or photos. Never write scrapers.

## Reviews

- When asked to review a pull request, check: correctness, tests for `src/lib/core`, i18n for new strings, accessibility, and anything that sends data or keys to the client.

## Commits

- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
- Keep changes focused on the issue being worked on.
