# Migration Plan: Static Data to Persistent APIs

## Current State

- No application source code exists yet (project not bootstrapped)
- The plan builds backend before frontend, so the frontend will be API-backed from inception
- Static fixture data will exist only as seed scripts for development and testing

## Target State

- All business views read and mutate data through backend APIs
- Persistent storage (database) is the sole source of truth
- Static fixture data is used only for database seeding in non-production environments

## Migration Principles

- Build backend APIs first (Phases 3–6), then frontend views (Phases 7–8)
- Frontend data layer (step 7.2) supports feature-flag toggle between static fixtures and API calls
- Feature flags enable per-module rollback if an API is unstable during development
- Seed scripts (step 3.9) populate database with representative sample data matching the types defined in AGENTS.md

## Cutover Sequence

1. Database schema and seed data (Phase 3)
   - Create all entity tables, relationship tables, audit log, user/role tables
   - Seed with sample data equivalent to the static fixture shapes from data.instructions.md
   - Validate: entity counts, type coverage, relationship integrity

2. API foundation and entity CRUD (Phases 4–5)
   - Build shared middleware (auth, RBAC, audit, pagination)
   - Implement CRUD endpoints for each entity type
   - Validate: each endpoint passes integration tests with seeded data

3. Frontend data layer with feature flags (step 7.2)
   - Create `src/lib/api.ts` with typed fetch wrappers for all entity APIs
   - Create `src/lib/data.ts` with TypeScript types and optional static fixture fallback
   - Feature flag per module: `FEATURE_[MODULE]_API=true` to switch data source
   - Default: API mode enabled; static fallback for modules whose API is not yet ready

4. Frontend views consume API data (Phase 8)
   - Each view fetches data via the API client layer
   - Feature flag allows reverting individual views to static fixtures
   - Validate: all six routes render without errors in API mode

5. Static fixture retirement
   - Remove feature-flag fallback code after all APIs are stable
   - Keep seed scripts in `prisma/seed.ts` (or equivalent) for dev/test only
   - Validate: production build has no runtime dependency on static data

## Rollback Strategy

- Feature flags per module to revert data source to static fixtures if API issues occur
- Writes disabled automatically under degraded mode unless explicit override is approved
- All deployment releases require database snapshot before schema migrations

## Validation Gates

- Seed data entity counts match expected baseline from data.instructions.md type definitions
- All six routes render without fatal errors in API mode
- Critical workflows pass acceptance criteria from [acceptance-criteria-templates.md](acceptance-criteria-templates.md)
- Non-functional thresholds from [nfr.md](nfr.md) pass baseline testing
- Feature flag toggle works bidirectionally (API → static and static → API) without data loss
