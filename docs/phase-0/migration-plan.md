# Phase 0 Migration Plan: Static Data to Persistent APIs

## Current State

- Frontend routes render from static domain exports in [src/lib/data.ts](src/lib/data.ts)
- No persistent storage, backend API, or background processing runtime

## Target State

- All business views read and mutate data through backend APIs
- Persistent storage becomes the source of truth
- Static data remains only as seed fixtures for non-production environments

## Migration Principles

- Preserve existing routes and user-facing navigation during migration
- Use phased, module-by-module cutover instead of big-bang replacement
- Keep rollback path available for each module until stabilization

## Cutover Sequence

1. Platform bootstrap
: Deploy backend service skeleton, persistence schema, and auth baseline

2. Read-path parity
: Implement read-only endpoints for dashboard, inventory, and detail views
: Add adapter layer to allow route-level toggle between static and API data

3. Write-path enablement
: Enable create/update flows for Applications and Capabilities first
: Add audit logging for every mutation

4. Relationship and reporting parity
: Enable relationship mutation APIs and report data feeds
: Validate route parity for strategy, radar, and roadmap views

5. Static data retirement
: Remove runtime dependency on static exports for production builds
: Keep seed scripts in controlled dev/test paths only

## Rollback Strategy

- Feature flags per module to revert read-path to static fixtures if severe API issues occur
- Writes disabled automatically under degraded mode unless explicit override is approved
- All migration releases require data integrity snapshot before deployment

## Validation Gates

- Entity counts match between static fixtures and seeded persistent environment before cutover
- All existing routes render without fatal errors in API mode
- Critical workflows pass acceptance criteria templates in [docs/phase-0/acceptance-criteria-templates.md](docs/phase-0/acceptance-criteria-templates.md)
- Non-functional thresholds from [docs/phase-0/nfr.md](docs/phase-0/nfr.md) pass baseline testing