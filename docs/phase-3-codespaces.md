# Phase 3 — Database Schema: Codespaces Completion Guide

Phase 3 schema files and seed script have been created locally. Since package installation and database operations cannot run on the local Windows environment, complete the following steps in GitHub Codespaces.

## Prerequisites

- Push the Phase 3 branch to GitHub and open a Codespace
- Ensure `.env.local` has a valid `DATABASE_URL` pointing to a Neon PostgreSQL database

## Steps to Complete

### 1. Install Dependencies

```bash
npm install
```

This ensures all packages (`drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `tsx`) are installed.

### 2. Verify TypeScript Compilation

```bash
npm run type-check
```

Fix any type errors in the schema files under `src/db/schema/`. All schema files should compile cleanly.

### 3. Generate Database Migration

```bash
npm run db:generate
```

This runs `drizzle-kit generate` and creates SQL migration files in `./drizzle/`. Review the generated SQL to confirm:

- All 22 tables are created (see list below)
- All enums are created
- All indexes and unique constraints are present
- Foreign key references are correct

**Expected tables:**

| File                | Tables                                                    |
| ------------------- | --------------------------------------------------------- |
| `enums.ts`          | 25 PostgreSQL enums                                       |
| `business.ts`       | `business_capabilities`, `organizations`, `business_contexts` |
| `applications.ts`   | `applications`, `data_objects`, `interfaces`              |
| `strategy.ts`       | `strategic_objectives`, `kpis`, `initiatives`, `platforms` |
| `technology.ts`     | `tech_categories`, `it_components`, `providers`           |
| `relationships.ts`  | `relationships`                                           |
| `tags.ts`           | `tag_groups`, `tags`, `tag_assignments`, `subscriptions`  |
| `audit.ts`          | `audit_entries`                                           |
| `users.ts`          | `users`, `workspaces`, `user_workspace_roles`             |

### 4. Apply Migration to Database

```bash
npm run db:migrate
```

Or push directly for dev (no migration file needed):

```bash
npm run db:push
```

### 5. Run Seed Script

```bash
npm run db:seed
```

This runs `tsx src/db/seed.ts` and populates all tables with sample data. Expected output:

```
🌱 Seeding database...

  → Truncating existing data
  → Users & Workspace
  → Business Capabilities
  → Organizations
  → Business Contexts
  → Applications
  → Data Objects
  → Interfaces
  → Strategic Objectives & KPIs
  → Initiatives
  → Providers
  → Tech Categories
  → IT Components
  → Platforms
  → Relationships
  → Tags
  → Subscriptions
  → Audit Entries (samples)

✅ Seed complete!
```

The seed script is idempotent — it truncates all tables before inserting.

### 6. Verify with Drizzle Studio

```bash
npm run db:studio
```

Open the Drizzle Studio URL in the browser and spot-check:

- [ ] `business_capabilities` has 19 rows (8 L1 + 6 L2 + 5 L3... approximate)
- [ ] `applications` has 10 rows with all enum fields populated
- [ ] `strategic_objectives` has 6 rows; `kpis` has 8 rows linked correctly
- [ ] `initiatives` has 6 rows with different subtypes and statuses
- [ ] `relationships` has cross-entity links (Application→Capability, Initiative→Objective, etc.)
- [ ] `it_components` has 12 rows with ring/quadrant values for radar
- [ ] `tag_groups` has 3 groups; `tags` has 7 tags
- [ ] `users` has 2 users; `workspaces` has 1; `user_workspace_roles` has 2
- [ ] `audit_entries` has 2 sample entries

### 7. Run Tests

```bash
npm run test
```

Ensure the existing smoke test still passes. Consider adding schema-level tests if needed.

### 8. Run Lint and Format

```bash
npm run lint
npm run format
```

Fix any lint or formatting issues.

### 9. Build Verification

```bash
SKIP_ENV_VALIDATION=true npm run build
```

Ensure the Next.js build succeeds with the new schema files.

## Files Created / Modified

### New files (Step 3.1–3.9):

| File                           | Phase Step | Description                                  |
| ------------------------------ | ---------- | -------------------------------------------- |
| `src/db/schema/enums.ts`       | 3.1–3.8    | All PostgreSQL enums (shared)                |
| `src/db/schema/business.ts`    | 3.1        | BusinessCapability, Organization, BusinessContext |
| `src/db/schema/applications.ts`| 3.2        | Application, DataObject, Interface           |
| `src/db/schema/strategy.ts`    | 3.3        | StrategicObjective, KPI, Initiative, Platform |
| `src/db/schema/technology.ts`  | 3.4        | TechCategory, ITComponent, Provider          |
| `src/db/schema/relationships.ts`| 3.5       | Generic typed edge table                     |
| `src/db/schema/tags.ts`        | 3.6        | TagGroup, Tag, TagAssignment, Subscription   |
| `src/db/schema/audit.ts`       | 3.7        | AuditEntry (immutable log)                   |
| `src/db/schema/users.ts`       | 3.8        | User, Workspace, UserWorkspaceRole           |
| `src/db/seed.ts`               | 3.9        | Dev seed script with sample data             |

### Modified files:

| File                           | Change                                        |
| ------------------------------ | --------------------------------------------- |
| `src/db/schema/index.ts`       | Updated barrel to re-export all schema files  |

## Troubleshooting

### "relation does not exist" during seed

Run `npm run db:push` first to create all tables before seeding.

### Enum type conflicts

If you've previously pushed a partial schema, drop the database and re-push:

```bash
# In Neon console or psql:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Then re-push:
npm run db:push
npm run db:seed
```

### Drizzle Kit version mismatch

Ensure `drizzle-kit` version matches `drizzle-orm`. Both should be latest compatible versions:

```bash
npm ls drizzle-orm drizzle-kit
```
