---
description: NowRift project context — read before every task
---

# NowRift Project Rules

## What this project is
A dark-mode-first AI and tech news platform. Next.js 15 App Router.
TypeScript strict mode. Tailwind CSS. PostgreSQL via Prisma.

## Non-negotiable rules
1. All colours from CSS variables in globals.css — never hardcode hex values
2. All text sizes from the typography scale — never arbitrary font sizes
3. Admin routes: Server Components only, never Client Components
4. Auth: httpOnly cookies only — never localStorage or sessionStorage
5. Database: Prisma only — never raw SQL in application code except for
   RLS context setting via $executeRaw
6. Images: next/image only — never bare <img> tags
7. Icons: Tabler Icons only — never emojis or other icon libraries
8. Mobile-first: every component must work at 320px width before desktop
9. Database connection: Docker locally (port 5432), never attempt direct
   psql connections from the terminal — all DB access through Prisma only.

## File naming
- Components: PascalCase (.tsx)
- Utilities: camelCase (.ts)
- API routes: route.ts in the correct App Router segment
- Never create .js files — TypeScript everywhere

## Commit after every completed component
Run `tsc --noEmit` and fix all type errors before marking any task done.
