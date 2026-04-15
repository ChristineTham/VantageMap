---
description: "Use when creating or editing Phase 0 planning artifacts, including traceability matrix, epic catalogs, acceptance criteria, migration plans, and non-functional readiness gates."
applyTo: "docs/phase-0/**,docs/PLAN.md"
---

# Requirements and Planning Instructions

## Purpose

Ensure planning artifacts are consistent, measurable, and implementation-ready.

## Required Artifacts

- Traceability matrix in CSV or Markdown table format
- Epic catalog grouped by bounded context
- Acceptance criteria templates with role, behavior, and validation outcomes
- Non-functional requirements with numeric thresholds and validation methods
- Migration plan with staged cutover and rollback strategy
- Security and RBAC matrix aligned to UAM model
- Phase gates checklist for go/no-go readiness

## Traceability Rules

- Every requirement must have a stable requirement ID
- Every row must include source document path and owning epic
- Every row must include MVP or Post-MVP tag
- Every row must include at least one acceptance criteria identifier

## Epic Authoring Rules

- Group epics by bounded context from architecture documentation
- Include explicit dependencies and readiness notes
- Keep scope boundary explicit: MVP vs Post-MVP
- Prefer implementation outcomes over design-only language

## Acceptance Criteria Rules

- Use Given, When, Then format for workflow scenarios
- Include at least one permission check for mutation workflows
- Include audit expectations for create, update, and delete operations
- Include failure-path assertions where relevant

## Non-Functional Rules

- Use measurable thresholds with percentile, rate, or duration targets
- Include validation mechanism for each threshold
- Link targets to operational ownership when possible

## Migration Rules

- Preserve route and UX continuity during data-source migration
- Define per-module cutover strategy and rollback trigger
- Keep fixture/static data isolated to dev/test-only paths after migration

## Security Rules

- Define role-operation matrix before implementation begins
- Require authorization checks at API boundaries
- Require immutable audit entries for all mutation actions

## Quality Bar

- Avoid ambiguous wording such as fast, scalable, secure without a metric
- Avoid orphaned requirements without owner or dependency
- Avoid introducing new requirement artifacts without linking them from the Phase 0 index