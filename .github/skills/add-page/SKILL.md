---
name: add-page
description: "Add a new view/page to VantageMap. Use when creating a new route, building a new section, or adding a page to the app. Covers the full checklist: page file, nav registration, data types, Sidebar update."
argument-hint: "Name and description of the new view (e.g. 'Risk Register — shows enterprise risks')"
---

# Add a New View to VantageMap

## When to Use

- Adding a new top-level route (e.g. `/risk`, `/costs`, `/stakeholders`)
- Building out a new section of the platform
- Scaffolding a new page from the existing design system

## Overview

VantageMap has six views today. Adding a seventh requires touching four areas:

1. **Data types & sample data** — `src/lib/data.ts`
2. **Page component** — `src/app/<route>/page.tsx`
3. **Sidebar navigation** — `src/components/Sidebar.tsx`

---

## Step 1 — Define Data Types

Add interfaces and sample data to `src/lib/data.ts` following existing patterns:

```ts
// 1. Add type aliases if needed
export type MyStatus = "Active" | "Inactive";

// 2. Add the interface
export interface MyEntity {
  id: string;
  name: string;
  description: string;
  status: MyStatus;
  tags: string[];
}

// 3. Add sample data array
export const myEntities: MyEntity[] = [
  { id: "me-1", name: "...", description: "...", status: "Active", tags: [] },
];

// 4. Add helper colour map if displaying status badges
export const myStatusColour: Record<MyStatus, string> = {
  Active:   "bg-rosely-teal/20 text-rosely-teal",
  Inactive: "bg-rosely-mist/20 text-rosely-mist",
};
```

---

## Step 2 — Create the Page

Create `src/app/<route>/page.tsx`. Use this scaffold:

```tsx
import { myEntities, myStatusColour } from "@/lib/data";

export default function MyViewPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">View Title</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Short description of what this view shows.
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-rosely-blush overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rosely-blush text-left text-rosely-mist">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rosely-petal">
            {myEntities.map((e) => (
              <tr key={e.id} className="hover:bg-rosely-petal/40 transition-colors">
                <td className="px-4 py-3 font-medium text-rosely-night">{e.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${myStatusColour[e.status]}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

> **Server Component by default.** Only add `"use client"` if you need hooks, state, or event handlers.

> **Optional metadata:**
> ```tsx
> import type { Metadata } from "next";
> export const metadata: Metadata = {
>   title: "View Title – VantageMap",
>   description: "Short description.",
> };
> ```

---

## Step 3 — Register in Sidebar

Edit `src/components/Sidebar.tsx`. Add an entry to the `navItems` array:

```tsx
import { SomeIcon } from "lucide-react"; // pick an appropriate icon

const navItems = [
  // ...existing items...
  { href: "/my-route", label: "My View", icon: SomeIcon },
];
```

The Sidebar is a Client Component — the active state is highlighted automatically via `usePathname`.

---

## Checklist

- [ ] Types and sample data added to `src/lib/data.ts`
- [ ] Page file created at `src/app/<route>/page.tsx`
- [ ] Page uses Rosely colour tokens throughout
- [ ] Page imports data via `@/lib/data`, not inlined
- [ ] Nav entry added to `Sidebar.tsx` `navItems` array
- [ ] `"use client"` only added if truly needed
- [ ] No raw hex values or arbitrary Tailwind utilities used
