---
description: "Use when styling components, adding colours, or modifying CSS. Covers Tailwind CSS v4 syntax differences, the Rosely colour palette tokens, and UI patterns used throughout VantageMap."
applyTo: "src/**/*.tsx,src/**/*.css"
---

# Tailwind CSS v4 + Rosely Palette

## Tailwind v4 Setup (Breaking Change)

Tailwind v4 uses a CSS-first configuration. Do NOT use v3 directives:

```css
/* ✅ Correct (v4) */
@import "tailwindcss";

/* ❌ Wrong (v3 — will not work) */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Theme customisation is done with `@theme inline { }` in `globals.css`, not `tailwind.config.js`.

## Rosely Colour Tokens

Always use Rosely semantic tokens. Never use raw hex values or arbitrary Tailwind values like `text-[#27272a]`.

| Token | Colour | CSS Variable | Typical Use |
|-------|--------|-------------|-------------|
| `rosely-night` | `#27272a` Velvet Night | `--rosely0` | Primary text, headings |
| `rosely-dusk` | `#615f5f` | `--rosely1` | Secondary text labels |
| `rosely-mauve` | `#85677b` | `--rosely2` | Accent text |
| `rosely-mist` | `#a49e9e` | `--rosely3` | Placeholder, captions |
| `rosely-blush` | `#f7caca` | `--rosely4` | Borders, dividers |
| `rosely-petal` | `#f4dede` | `--rosely5` | Hover backgrounds |
| `rosely-cream` | `#f4eee8` | `--rosely6` | Page/card backgrounds |
| `rosely-periwinkle` | `#93a9d1` | `--rosely7` | Info / neutral accent |
| `rosely-lilac` | `#be9cc1` | `--rosely8` | Purple accent, hover borders |
| `rosely-dusty` | `#b0879b` | `--rosely9` | Dusty rose accent |
| `rosely-plum` | `#b565a7` | `--rosely10` | Strong purple |
| `rosely-rose` | `#d2386c` | `--rosely11` | Error, critical status |
| `rosely-flamingo` | `#ec809e` | `--rosely12` | Warning |
| `rosely-golden` | `#eada4f` | `--rosely13` | Highlight, at-risk |
| `rosely-teal` | `#64bfa4` | `--rosely14` | Success, good health |
| `rosely-cornflower` | `#919bc9` | `--rosely15` | Blue accent |

Usage: `text-rosely-night`, `bg-rosely-cream`, `border-rosely-blush`, `ring-rosely-lilac`

## Common UI Patterns

**Card / panel:**
```tsx
<div className="bg-white rounded-xl border border-rosely-blush p-5 hover:border-rosely-lilac hover:shadow-sm transition-all">
```

**Section heading:**
```tsx
<h1 className="text-2xl font-bold text-rosely-night">Title</h1>
<p className="text-sm text-rosely-mist mt-1">Subtitle</p>
```

**Table:**
```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-rosely-blush text-left text-rosely-mist">
      <th className="pb-2 font-medium">Column</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-rosely-petal">
    <tr className="hover:bg-rosely-petal/40 transition-colors">
      <td className="py-3 text-rosely-night">Value</td>
    </tr>
  </tbody>
</table>
```

**Status badge:**
```tsx
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-rosely-teal/20 text-rosely-teal">
  Active
</span>
```

**Icon button:**
```tsx
<button className="p-2 rounded-lg text-rosely-mist hover:text-rosely-night hover:bg-rosely-petal transition-colors">
  <IconName className="w-4 h-4" />
</button>
```

## Health Status Colours

Follow existing `healthColour` helper from `@/lib/data` — do not hardcode status colours directly:

```tsx
import { healthColour } from "@/lib/data";
// Returns Tailwind class strings for each HealthStatus value
```

## Layout

- Page padding: `p-6`
- Max width: `max-w-7xl mx-auto`
- Vertical spacing: `space-y-6`
- Grid: prefer `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
