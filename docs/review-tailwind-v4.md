# Tailwind CSS v4 Best Practices Review

**Date:** 2026-06-01  
**Scope:** Full codebase (`src/app/`, `src/components/`, `src/app/globals.css`, `postcss.config.mjs`)

## Verdict: PASS — Well-Configured for Tailwind v4

The codebase has **no breaking anti-patterns** and is properly set up for Tailwind CSS v4.

## Configuration (All Correct)

| Aspect           | Status | Notes                                                    |
| ---------------- | ------ | -------------------------------------------------------- |
| Entry point      | ✅     | `@import "tailwindcss"` in `globals.css`                 |
| Theme config     | ✅     | `@theme inline { }` with CSS variables                   |
| PostCSS          | ✅     | `@tailwindcss/postcss` plugin (not legacy `tailwindcss`) |
| No legacy config | ✅     | No `tailwind.config.ts` / `tailwind.config.js`           |
| No v3 directives | ✅     | No `@tailwind base/components/utilities`                 |
| `tailwind-merge` | ✅     | v3.6+ (has native v4 support)                            |
| `cn()` utility   | ✅     | Correct `twMerge(clsx(...))` pattern                     |

## Findings

### 1. `bg-white` Should Be `bg-card` — Low Priority

**Impact:** Cosmetic consistency  
**Count:** 30+ occurrences  
**Risk:** If the card background ever changes from `#ffffff`, these won't update.

The theme defines `--color-card: #ffffff` and `--card: #ffffff`. Using `bg-card` instead of `bg-white` would make theming (including future dark mode) trivial.

**Files with highest density:**

- `src/components/BulkEditDialog.tsx` (4 occurrences)
- `src/components/TechRadarView.tsx` (3 occurrences)
- `src/components/ApplicationsView.tsx` (2 occurrences)
- `src/app/admin/users/page.tsx` (3 occurrences)

**Recommendation:** Replace `bg-white` → `bg-card` in card/panel contexts. Leave `text-white` on colored backgrounds (it's semantically correct there).

---

### 2. Repeated Arbitrary Font Size — Low Priority

**Impact:** Maintainability  
**Count:** 6 occurrences of `text-[9px]` or `text-[10px]`

**Files:**

- `src/components/RoadmapView.tsx` — lines 164, 166, 204
- `src/components/SearchModal.tsx` — lines 191, 192
- `src/components/SearchBar.tsx` — line 171

**Recommendation:** Define a custom font-size token in `@theme inline`:

```css
@theme inline {
  --font-size-2xs: 0.625rem; /* 10px */
  --font-size-3xs: 0.5625rem; /* 9px */
}
```

Then use `text-2xs` / `text-3xs` instead of arbitrary values.

---

### 3. No Dark Mode Implementation — Informational

**Impact:** None (design decision)  
**Status:** The `:root` variables are defined but no `.dark` class overrides or `@custom-variant dark` declaration exists.

This is fine for the current Rosely light-only design. When dark mode is needed:

1. Add `@custom-variant dark (&:where(.dark, .dark *));` to `globals.css`
2. Add `.dark { --rosely0: ...; --background: ...; }` overrides
3. Use `dark:` prefixes in components

---

### 4. `space-y-*` / `divide-*` Usage — Informational (No Action Needed)

**Impact:** None — these utilities still work in v4  
**Count:** 100+ occurrences of `space-y-*`, 20+ of `divide-y`

These are **not deprecated** in Tailwind v4. The `gap-*` approach is preferred for new code on flex/grid containers, but existing `space-*` usage is fine and does not need migration.

---

### 5. No `@layer` / `@apply` Anti-Patterns

✅ The codebase does not use `@layer base/components/utilities` blocks or `@apply` in CSS files. All styling is done with utility classes in JSX — this is the correct v4 approach.

---

### 6. Arbitrary Size Values — Acceptable

A handful of arbitrary values for viewport-relative sizing (`max-h-[60vh]`, `min-h-[50vh]`, etc.) are used where no standard utility exists. These are fine in v4.

One improvement: `min-w-[2rem]` in `Pagination.tsx` could be `min-w-8`.

---

## Summary of Recommendations

| #   | Finding                                         | Priority      | Effort          | Impact            |
| --- | ----------------------------------------------- | ------------- | --------------- | ----------------- |
| 1   | Replace `bg-white` → `bg-card` in card contexts | Low           | ~30 edits       | Theme flexibility |
| 2   | Define `text-2xs`/`text-3xs` custom tokens      | Low           | 1 CSS + 6 edits | Consistency       |
| 3   | Dark mode prep (future)                         | Deferred      | N/A             | Future feature    |
| 4   | `space-*`→`gap-*` for new code                  | Informational | None            | Style preference  |
| 5   | `min-w-[2rem]` → `min-w-8`                      | Trivial       | 1 edit          | Cleanliness       |

## Conclusion

The VantageMap codebase is **Tailwind v4 clean**. No migration blockers, no deprecated patterns, no v3 holdovers. The CSS-first configuration, PostCSS setup, and token architecture are all correct and idiomatic. The recommendations above are cosmetic improvements, not functional issues.
