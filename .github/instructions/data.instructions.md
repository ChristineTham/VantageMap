---
description: "Use when adding, modifying, or querying data models, types, or sample data. Covers the VantageMap data layer in src/lib/data.ts — entities, relationships, and helper functions."
applyTo: "src/lib/**"
---

# VantageMap Data Layer

All data access goes through `src/lib/data.ts`. Do not inline data in page files.

## Core Types

```ts
type HealthStatus   = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
type LifecyclePhase = "Plan" | "Phase In" | "Active" | "Phase Out" | "End of Life";
type TechRing       = "Adopt" | "Trial" | "Assess" | "Hold";
type TechQuadrant   = "Techniques" | "Tools" | "Platforms" | "Languages & Frameworks";
type StrategicPerspective = "Financial" | "Customer" | "Internal Process" | "Learning & Growth";
type InitiativeStatus = "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
type CapabilityLevel  = 1 | 2 | 3;
```

## Exported Collections

| Export | Type | Description |
|--------|------|-------------|
| `capabilities` | `BusinessCapability[]` | Hierarchical capability map (levels 1–3 via `parentId`) |
| `applications` | `Application[]` | Application portfolio; linked to capabilities via `capabilityIds` |
| `strategicObjectives` | `StrategicObjective[]` | Balanced Scorecard objectives with nested `kpis[]` and `initiatives[]` IDs |
| `initiatives` | `Initiative[]` | Roadmap items; linked to objectives and capabilities |
| `techRadar` | `TechEntry[]` | Technology Radar entries organised by ring and quadrant |

## Helper Maps

| Export | Type | Description |
|--------|------|-------------|
| `healthColour` | `Record<HealthStatus, string>` | Tailwind class for a `HealthStatus` value |
| `healthBg` | `Record<HealthStatus, string>` | Tailwind background class for a `HealthStatus` value |
| `initiativeStatusColour` | `Record<InitiativeStatus, string>` | Tailwind class for an `InitiativeStatus` value |

Use as dictionaries, not functions: `healthColour[cap.health]`, `healthBg[cap.health]`.
Always use these maps rather than hardcoding colour classes for status values.

## Relationships

```
BusinessCapability (1) ──< Application (via capabilityIds)
BusinessCapability (1) ──< Initiative  (via capabilityIds)
StrategicObjective (1) ──< Initiative  (via objectiveIds on Initiative)
StrategicObjective     ──> KPI[]       (nested array, not a separate collection)
BusinessCapability     ──> children    (self-referential via parentId)
```

## Conventions for New Entities

- IDs: use kebab-case with a prefix (e.g., `"cap-7"`, `"app-12"`, `"init-5"`)
- Dates: ISO 8601 strings `"YYYY-MM-DD"`
- Optional monetary fields (`cost`, `budget`): numbers in whole dollars
- All arrays default to `[]`, not `undefined`
- Do not add `null` — use optional (`?`) fields or omit them

## Adding a New Entity Type

1. Add the TypeScript interface above the sample data section
2. Export the typed constant array below the existing exports
3. If other entities reference the new type by ID, add the ID array field to those interfaces
4. Update the barrel exports at the bottom of the file if they exist

## Filtering Patterns

```ts
// Filter by level
const l1 = capabilities.filter(c => c.level === 1);

// Find children
const children = capabilities.filter(c => c.parentId === parentId);

// Cross-reference by ID
const capNames = applications
  .flatMap(a => a.capabilityIds)
  .map(id => capabilities.find(c => c.id === id)?.name ?? "Unknown");
```
