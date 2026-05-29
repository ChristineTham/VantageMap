# Phase 7 — Frontend Shell and Shared Components: Codespaces Continuation Guide

## What was done (locally)

The application shell, navigation, API client layer, shared component library, and error/loading patterns have all been implemented.

### New files created

| File                                 | Purpose                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                 | Root layout with `<Sidebar />` + `<main>` wrapper, Noto Sans/Serif/Mono fonts                      |
| `src/app/page.tsx`                   | Dashboard placeholder with navigation cards                                                        |
| `src/app/loading.tsx`                | Root loading skeleton (uses `PageSkeleton`)                                                        |
| `src/app/error.tsx`                  | Global error boundary (Client Component)                                                           |
| `src/app/not-found.tsx`              | Custom 404 page                                                                                    |
| `src/components/Sidebar.tsx`         | Collapsible sidebar navigation (Client Component), 6 routes, Lucide icons                          |
| `src/lib/api.ts`                     | Typed fetch wrappers: `createEntityClient<T>()` factory, 12 entity clients, search/facets/bulk ops |
| `src/lib/types.ts`                   | Frontend TypeScript types (12 entities, all enums, colour maps)                                    |
| `src/lib/data.ts`                    | Unified data access layer with feature-flag toggle (async, API-backed)                             |
| `src/components/StatusBadge.tsx`     | Rounded pill badge for status values + `HealthBadge` specialization                                |
| `src/components/HealthIndicator.tsx` | Coloured dot for health status with optional label                                                 |
| `src/components/LifecycleTag.tsx`    | Badge for lifecycle phase values                                                                   |
| `src/components/SearchInput.tsx`     | Search input with icon (Client Component)                                                          |
| `src/components/FilterBar.tsx`       | Active filter pills with remove/clear-all (Client Component)                                       |
| `src/components/EmptyState.tsx`      | Empty state placeholder with icon and optional action                                              |
| `src/components/LoadingSpinner.tsx`  | Animated spinner + `PageLoader` full-page variant                                                  |
| `src/components/Skeleton.tsx`        | Skeleton placeholders: `Skeleton`, `CardSkeleton`, `TableSkeleton`, `PageSkeleton`                 |
| `src/components/Pagination.tsx`      | Pagination controls with page numbers (Client Component)                                           |
| `src/components/DataTable.tsx`       | Generic sortable data table + `useTableSort` hook (Client Component)                               |

### Modified files

| File                 | Changes                                 |
| -------------------- | --------------------------------------- |
| `src/app/layout.tsx` | Added Sidebar, main wrapper, Noto fonts |

### Architecture decisions

1. **API client factory** (`src/lib/api.ts`): `createEntityClient<T>()` produces typed `list`, `getById`, `create`, `update`, `remove` methods for any entity. Avoids duplicated fetch boilerplate across 12 entity types.

2. **Feature-flag data layer** (`src/lib/data.ts`): All data access goes through async functions that check `FEATURE_API_DATA` flag. When disabled, returns empty arrays (static fixtures removed). When enabled, calls the API client.

3. **Colour maps in types** (`src/lib/types.ts`): Centralized `healthColour`, `healthBg`, `lifecycleColour`, `techRingColour`, `initiativeStatusColour` maps using Rosely tokens. Components import these rather than hardcoding colours.

4. **Skeleton loading pattern**: Route-level `loading.tsx` files use composed skeleton components (`PageSkeleton`, `TableSkeleton`, `CardSkeleton`) rather than generic spinners, giving users instant layout structure.

5. **DataTable with sort hook**: `useTableSort()` manages sort state; `DataTable` renders columns generically. View pages (Phase 8) just define columns and pass data.

---

## Steps to complete in Codespaces

### 1. Install dependencies

```bash
npm install
```

### 2. Install shadcn/ui base components

The shared components reference shadcn/ui primitives that need to be installed via the CLI:

```bash
npx shadcn@latest add button card table dialog tabs badge input
```

This installs each component into `src/components/ui/` and registers them in `components.json`.

### 3. Type-check

```bash
npx tsc --noEmit
```

Expected: zero errors. All files passed the VS Code TypeScript language server locally.

**Potential issues to watch for:**

- If shadcn/ui components have different export signatures than expected, update imports in app-specific components
- `src/lib/api.ts` references `process.env.NEXT_PUBLIC_APP_URL` — ensure this is set or defaults to `http://localhost:3000`

### 4. Lint

```bash
npm run lint
```

Fix any ESLint issues (likely formatting-only).

### 5. Build

```bash
npm run build
```

Ensures Next.js can compile the layout, all components, and the data layer.

### 6. Run development server

```bash
npm run dev
```

### 7. Visual smoke-test

Open `http://localhost:3000` in a browser and verify:

- [ ] **Sidebar** renders on the left with all 6 navigation items
- [ ] **Active state** — current route is highlighted in the sidebar
- [ ] **Collapse toggle** — sidebar collapses to icon-only mode
- [ ] **Dashboard** shows placeholder cards with links to all 5 views
- [ ] **404 page** — navigate to `/nonexistent` → shows custom 404 with "Go to Dashboard" link
- [ ] **Loading state** — the page skeleton briefly flashes on initial load

### 8. Component verification

You can test individual components by temporarily rendering them in `src/app/page.tsx`:

```tsx
import { StatusBadge, HealthBadge } from "@/components/StatusBadge";
import { HealthIndicator } from "@/components/HealthIndicator";
import { LifecycleTag } from "@/components/LifecycleTag";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner, PageLoader } from "@/components/LoadingSpinner";
import { Skeleton, CardSkeleton, TableSkeleton } from "@/components/Skeleton";

// In your page JSX:
<HealthBadge health="Good" />
<HealthIndicator health="Critical" showLabel />
<LifecycleTag lifecycle="Active" />
<StatusBadge status="Approved" />
<EmptyState title="No capabilities" description="Add your first capability" />
<LoadingSpinner size="lg" />
<CardSkeleton />
<TableSkeleton rows={3} cols={4} />
```

### 9. Validate error boundary

To test the error boundary, temporarily throw in a component:

```tsx
// In any component
throw new Error("Test error boundary");
```

The global `error.tsx` should catch it and show the "Something went wrong" UI with "Try again" and "Dashboard" buttons.

---

## Component reference

### App-specific components (`src/components/`)

| Component         | Props                                                                                                | Notes                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `Sidebar`         | none                                                                                                 | Client Component, uses `usePathname()`                |
| `StatusBadge`     | `status, colorMap?, className?`                                                                      | Generic; pass any `Record<string, string>` colour map |
| `HealthBadge`     | `health, className?`                                                                                 | Pre-configured for `HealthStatus` values              |
| `HealthIndicator` | `health, showLabel?, className?`                                                                     | Small coloured dot                                    |
| `LifecycleTag`    | `lifecycle, className?`                                                                              | Pill for lifecycle phase                              |
| `SearchInput`     | `value, onChange, placeholder?, className?`                                                          | Client Component                                      |
| `FilterBar`       | `filters, colorMap?, onRemove, onClearAll?, className?`                                              | Client Component, removable pills                     |
| `EmptyState`      | `title?, description?, icon?, action?, className?`                                                   | Server Component compatible                           |
| `LoadingSpinner`  | `size?, label?, className?`                                                                          | Animated Lucide `Loader2`                             |
| `PageLoader`      | `label?`                                                                                             | Full-page centered spinner                            |
| `Skeleton`        | `className?`                                                                                         | Animated pulse bar                                    |
| `CardSkeleton`    | `className?`                                                                                         | Card-shaped skeleton                                  |
| `TableSkeleton`   | `rows?, cols?, className?`                                                                           | Table-shaped skeleton                                 |
| `PageSkeleton`    | `className?`                                                                                         | Full page skeleton (title + search + table)           |
| `Pagination`      | `page, totalPages, onPageChange, className?`                                                         | Client Component                                      |
| `DataTable<T>`    | `columns, data, getRowKey, onRowClick?, sortBy?, sortDirection?, onSort?, emptyMessage?, className?` | Client Component                                      |
| `useTableSort`    | `(defaultField?, defaultDirection?)`                                                                 | Hook for sort state                                   |

### Data layer

| Export                                          | From          | Notes                                                                  |
| ----------------------------------------------- | ------------- | ---------------------------------------------------------------------- |
| `capabilitiesApi`, `applicationsApi`, etc.      | `@/lib/api`   | 12 entity clients with `list`, `getById`, `create`, `update`, `remove` |
| `searchEntities`, `getFacets`, `filterByFacets` | `@/lib/api`   | Cross-entity search                                                    |
| `bulkUpdate`, `bulkDelete`, `bulkUpsert`        | `@/lib/api`   | Bulk operations                                                        |
| `getCapabilities()`, `getApplications()`, etc.  | `@/lib/data`  | Feature-flag-gated data access                                         |
| All types and colour maps                       | `@/lib/types` | Also re-exported from `@/lib/data`                                     |

---

## Ready for Phase 8

Phase 7 provides everything Phase 8 view pages need:

- **Layout**: Sidebar + main content area
- **Data access**: Typed API clients and data layer functions
- **Components**: DataTable, StatusBadge, HealthIndicator, SearchInput, Pagination, etc.
- **Patterns**: Loading skeletons, error boundaries, empty states

Each Phase 8 step creates a Server Component page at its route, fetches data via `src/lib/data.ts`, and renders using shared components.
