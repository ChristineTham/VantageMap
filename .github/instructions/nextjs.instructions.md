---
description: "Use when writing, editing, or reviewing Next.js pages, route handlers, components, or any TypeScript/TSX files. Covers App Router conventions, Server vs Client Components, async params, and import patterns for VantageMap."
applyTo: "src/app/**/*.tsx,src/app/**/*.ts,src/components/**/*.tsx"
---

# Next.js 16 App Router Conventions

## Critical: Async Params (Next.js 16 Breaking Change)

`params` and `searchParams` props are now **Promises** — always await them:

```tsx
// ✅ Correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// ❌ Wrong (Next.js 13/14 pattern)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}
```

## Server Components (Default)

All files in `src/app/` are Server Components unless marked otherwise.

- No `useState`, `useEffect`, or browser APIs
- Can be `async` and use `await` directly
- Import data from `@/lib/data` at the top level

```tsx
import { capabilities } from "@/lib/data";

export default function CapabilitiesPage() {
  // Direct data access — no hooks needed
  const l1 = capabilities.filter((c) => c.level === 1);
  return <div>...</div>;
}
```

## Client Components

Add `"use client"` only when you need:
- `useState` / `useReducer` / `useContext`
- `useEffect` / `useRef` / lifecycle hooks
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers that call state setters
- Third-party client-only libraries (e.g., charts with interactivity)

```tsx
"use client";
import { useState } from "react";
```

## Page File Structure

Every page lives at `src/app/<route>/page.tsx`. Follow this pattern:

```tsx
import { dataFunction } from "@/lib/data";
import { SomeIcon } from "lucide-react";

export default function MyViewPage() {
  const data = dataFunction();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">View Title</h1>
        <p className="text-sm text-rosely-mist mt-1">Short description</p>
      </div>
      {/* page content */}
    </div>
  );
}
```

## Imports

- Path alias `@/` maps to `src/` — always use it for internal imports
- Icons: `import { IconName } from "lucide-react"`
- Data: `import { ... } from "@/lib/data"`
- Components: `import { ComponentName } from "@/components/ComponentName"`

## Metadata

Export `metadata` from page files for SEO:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View Name – VantageMap",
  description: "Brief description of this view.",
};
```

## Routing

- App Router only — no `pages/` directory
- No `getServerSideProps`, `getStaticProps`, or `getInitialProps`
- Navigation: use `<Link href="/route">` from `next/link`
- All six routes: `/`, `/capabilities`, `/applications`, `/strategy`, `/radar`, `/roadmap`
