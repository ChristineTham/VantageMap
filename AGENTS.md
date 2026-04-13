<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# VantageMap — Project Guidelines

## Project Overview

VantageMap is an enterprise architecture and business strategy platform. It gives Chief Strategy Officers, Business Architects, and Product Leaders a unified view of business capabilities, applications, strategy objectives, technology health, and roadmap initiatives.

Six integrated views:

| Route | View |
|-------|------|
| `/` | Dashboard |
| `/capabilities` | Business Capability Map |
| `/applications` | Application Portfolio |
| `/strategy` | Strategy Map (Balanced Scorecard) |
| `/radar` | Technology Radar |
| `/roadmap` | Strategic Roadmap (Gantt) |

## Tech Stack

- **Next.js 16.2.3** — App Router only. No Pages Router. No `getServerSideProps`/`getStaticProps`.
- **TypeScript** — strict mode
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in globals.css (NOT `@tailwind` directives)
- **Rosely colour palette** — custom CSS variables + Tailwind theme; see `src/app/globals.css`
- **Lucide React** — icon set
- **Recharts** — chart library

## Build and Test

```bash
npm install      # install deps
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

## Architecture Conventions

- All pages: `src/app/<route>/page.tsx` (App Router Server Components by default)
- Components: `src/components/` — keep reusable UI pieces here
- Data layer: `src/lib/data.ts` — typed models and sample data (static for now)
- Path alias: `@/` maps to `src/`
- Layout: `src/app/layout.tsx` wraps every page with `<Sidebar />` + `<main>`

## Key Conventions

- Use `@/lib/data` imports for all data access — do not inline data in page files
- Use Rosely colour tokens (`text-rosely-night`, `bg-rosely-cream`, etc.) — do not use raw hex or arbitrary Tailwind values
- Server Components by default; add `"use client"` only when state/effects/browser APIs are needed
- Icon imports come from `lucide-react`
- For new pages, follow the pattern in existing `page.tsx` files (see `src/app/capabilities/page.tsx`)

## Next.js 16 Breaking Changes to Watch

- `params` and `searchParams` in page components are now **async** — must be awaited
- Image, Script, and Font APIs may differ from Next.js 13/14 training data
- When in doubt: `node_modules/next/dist/docs/`
