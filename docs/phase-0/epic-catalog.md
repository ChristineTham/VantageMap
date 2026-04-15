# Phase 0 Epic Catalog

This catalog defines initial implementation epics grouped by bounded context.

## Platform Foundation

### EP-PLATFORM-001 Managed Platform Baseline

- Scope: MVP
- Outcome: establish managed-cloud baseline, backend service skeleton, migration pipeline, and job runtime
- Dependencies: none
- Acceptance criteria IDs: AC-PLATFORM-001, AC-PLATFORM-002, AC-PLATFORM-003, AC-PLATFORM-004, AC-PLATFORM-005, AC-PLATFORM-006
- Owner: Architecture
- Target milestone: M1 Foundation
- Accountable owner: Christine Tham (interim)
- Target date: 2026-05-09
- Readiness notes: must complete before identity, integrations, and data migration epics

### EP-PLATFORM-002 Static-to-Persistent Data Migration

- Scope: MVP
- Outcome: replace static data sourcing with API-backed persistence while preserving existing routes and UX
- Dependencies: EP-PLATFORM-001
- Acceptance criteria IDs: AC-PLATFORM-010, AC-PLATFORM-011, AC-PLATFORM-012, AC-PLATFORM-013
- Owner: Architecture
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-06
- Readiness notes: use feature-flag cutover and rollback path per module

### EP-PLATFORM-003 Async Processing Runtime

- Scope: MVP
- Outcome: queue-backed processing for imports, exports, connector jobs, and report generation
- Dependencies: EP-PLATFORM-001
- Acceptance criteria IDs: AC-PLATFORM-020, AC-PLATFORM-021, AC-PLATFORM-022
- Owner: Platform
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-13
- Readiness notes: required before large import workflows and webhook retry scaling

### EP-PLATFORM-004 Backup and Recovery Controls

- Scope: MVP
- Outcome: backup, restore, and migration safety procedures with operational runbooks
- Dependencies: EP-PLATFORM-001
- Acceptance criteria IDs: AC-PLATFORM-030, AC-PLATFORM-031, AC-PLATFORM-032
- Owner: Operations
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-04
- Readiness notes: must pass pre-release reliability gate

## Identity and Access

### EP-ID-001 Role-Based Access and Permission Evaluation

- Scope: MVP
- Outcome: standard roles, custom role mapping, permission checks for core modules
- Dependencies: EP-PLATFORM-001
- Acceptance criteria IDs: AC-ID-001, AC-ID-002, AC-ID-003, AC-ID-004, AC-ID-005, AC-ID-006
- Owner: Security
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-06
- Readiness notes: baseline for all mutation APIs and admin workflows

### EP-ID-002 Technical Users and Token Lifecycle

- Scope: MVP
- Outcome: technical user provisioning, token issuance/rotation/revocation, audit logs
- Dependencies: EP-ID-001
- Acceptance criteria IDs: AC-ID-010, AC-ID-011, AC-ID-012, AC-ID-013
- Owner: Security
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-13
- Readiness notes: required for integration endpoints and automation service calls

### EP-ID-003 SAML SSO and SCIM Sync

- Scope: Post-MVP
- Outcome: enterprise identity federation and user lifecycle synchronization
- Dependencies: EP-ID-001
- Acceptance criteria IDs: AC-ID-020, AC-ID-021, AC-ID-022, AC-ID-023
- Owner: Security
- Target milestone: M4 Enterprise Expansion
- Readiness notes: pull into MVP only if pilot requires federated identity

## Meta Model and Fact Sheets

### EP-MODEL-001 Canonical Meta Model Engine

- Scope: MVP
- Outcome: fact sheet type definitions, relationships, lifecycle semantics, and extensibility hooks
- Dependencies: EP-PLATFORM-001
- Acceptance criteria IDs: AC-MODEL-001, AC-MODEL-002, AC-MODEL-003, AC-MODEL-004, AC-MODEL-005, AC-MODEL-006, AC-MODEL-007, AC-MODEL-008, AC-MODEL-009, AC-MODEL-010, AC-MODEL-011, AC-MODEL-012, AC-MODEL-013, AC-MODEL-014, AC-MODEL-015, AC-MODEL-016, AC-MODEL-017, AC-MODEL-018
- Owner: Architecture
- Target milestone: M1 Foundation
- Accountable owner: Christine Tham (interim)
- Target date: 2026-05-16
- Readiness notes: align strictly with documentation parity model

### EP-MODEL-002 Custom Field Extension Governance

- Scope: Post-MVP
- Outcome: governed custom fields and validation for extensible domain modeling
- Dependencies: EP-MODEL-001
- Acceptance criteria IDs: AC-MODEL-040, AC-MODEL-041
- Owner: Architecture
- Target milestone: M4 Enterprise Expansion
- Readiness notes: implement only after baseline model stability

### EP-FACT-001 Fact Sheet CRUD and Relationship Management

- Scope: MVP
- Outcome: create/read/update core fact sheets and maintain cross-entity relationships
- Dependencies: EP-MODEL-001, EP-ID-001
- Acceptance criteria IDs: AC-FACT-001, AC-FACT-002, AC-FACT-003, AC-FACT-004, AC-FACT-005, AC-FACT-006
- Owner: Product
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-20
- Readiness notes: base inventory functionality for all product views

### EP-FACT-002 Inventory Search, Filtering, and Query Performance

- Scope: MVP
- Outcome: searchable/filterable inventory with target response budgets
- Dependencies: EP-FACT-001
- Acceptance criteria IDs: AC-FACT-010, AC-FACT-011, AC-FACT-012, AC-FACT-013
- Owner: Product
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-20
- Readiness notes: include pagination and index strategy in design

### EP-FACT-003 Bulk Data Operations

- Scope: MVP
- Outcome: bulk update, import, and export workflows for inventory management
- Dependencies: EP-FACT-001, EP-INT-001, EP-PLATFORM-003
- Acceptance criteria IDs: AC-FACT-020, AC-FACT-021, AC-FACT-022
- Owner: Product
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-11
- Readiness notes: enforce validation and partial-failure reporting

## Admin and Governance

### EP-ADMIN-001 Workspace Governance Controls

- Scope: MVP
- Outcome: tagging governance, subscription roles, user administration defaults
- Dependencies: EP-ID-001
- Acceptance criteria IDs: AC-ADMIN-001, AC-ADMIN-002, AC-ADMIN-003, AC-ADMIN-004, AC-ADMIN-005, AC-ADMIN-006
- Owner: Operations
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-04
- Readiness notes: required for enterprise onboarding and governance parity

### EP-ADMIN-002 Quality Seal Workflow

- Scope: MVP
- Outcome: configurable quality states, review workflow, and notification behavior
- Dependencies: EP-ADMIN-001, EP-ID-001
- Acceptance criteria IDs: AC-ADMIN-010, AC-ADMIN-011, AC-ADMIN-012
- Owner: Operations
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-11
- Readiness notes: integrate with subscriptions and audit logs

### EP-SEC-001 Audit Trail and Compliance Logging

- Scope: MVP
- Outcome: immutable mutation audit trail and queryable compliance views
- Dependencies: EP-PLATFORM-001, EP-ID-001
- Acceptance criteria IDs: AC-SEC-001, AC-SEC-002, AC-SEC-003, AC-SEC-004
- Owner: Security
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-04
- Readiness notes: must be integrated across API and background job paths

## Integrations and APIs

### EP-INT-001 REST API Baseline

- Scope: MVP
- Outcome: REST endpoints for fact sheets, settings, admin, and integration operations
- Dependencies: EP-PLATFORM-001, EP-ID-002
- Acceptance criteria IDs: AC-INT-001, AC-INT-002, AC-INT-003, AC-INT-004
- Owner: Platform
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-13
- Readiness notes: publish OpenAPI contracts early

### EP-INT-002 GraphQL Reporting Access

- Scope: MVP
- Outcome: GraphQL endpoint for report-friendly and relationship-centric querying
- Dependencies: EP-FACT-001, EP-REPORT-001
- Acceptance criteria IDs: AC-INT-010, AC-INT-011, AC-INT-012, AC-INT-013
- Owner: Platform
- Target milestone: M2 Data Cutover
- Accountable owner: Christine Tham (interim)
- Target date: 2026-06-20
- Readiness notes: align schema with canonical model, enforce RBAC

### EP-INT-003 Webhooks and Delivery Reliability

- Scope: MVP
- Outcome: event subscriptions, retries, dead-letter handling, run logs
- Dependencies: EP-PLATFORM-001
- Acceptance criteria IDs: AC-INT-020, AC-INT-021, AC-INT-022, AC-INT-023
- Owner: Platform
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-11
- Readiness notes: include idempotency keys and replay safety

### EP-INT-004 MCP Integration Surface

- Scope: Post-MVP
- Outcome: MCP endpoint with scoped tools, identity checks, and audit coverage
- Dependencies: EP-ID-002, EP-INT-001
- Acceptance criteria IDs: AC-INT-040, AC-INT-041
- Owner: Platform
- Target milestone: M4 Enterprise Expansion
- Readiness notes: introduce after core API governance is stable

## Reporting and Strategy Use Cases

### EP-REPORT-001 Core Reporting Runtime

- Scope: MVP
- Outcome: dashboard and report datasets backed by persistent APIs
- Dependencies: EP-FACT-001, EP-PLATFORM-002
- Acceptance criteria IDs: AC-REPORT-001, AC-REPORT-002, AC-REPORT-003, AC-REPORT-004
- Owner: Product
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-18
- Readiness notes: establish report query guardrails and export baseline

### EP-REPORT-002 Application Rationalization Use Case

- Scope: MVP
- Outcome: TIME and related rationalization signals in portfolio analysis
- Dependencies: EP-REPORT-001, EP-FACT-002
- Acceptance criteria IDs: AC-REPORT-010, AC-REPORT-011, AC-REPORT-012, AC-REPORT-013
- Owner: Product
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-25
- Readiness notes: tune for transparency and explainability of scoring

### EP-REPORT-003 Modernization and Pace-Layering Analytics

- Scope: Post-MVP
- Outcome: 6R strategy and pace-layering analysis for modernization planning
- Dependencies: EP-REPORT-001, EP-ROADMAP-001
- Acceptance criteria IDs: AC-REPORT-030, AC-REPORT-031, AC-REPORT-032, AC-REPORT-033
- Owner: Product
- Target milestone: M4 Enterprise Expansion

### EP-REPORT-004 Obsolescence Risk Analytics

- Scope: Post-MVP
- Outcome: risk aggregation and remediation tracking for technology obsolescence
- Dependencies: EP-REPORT-001, EP-FACT-002
- Acceptance criteria IDs: AC-REPORT-040, AC-REPORT-041
- Owner: Product
- Target milestone: M4 Enterprise Expansion

### EP-REPORT-005 AI Governance Analytics

- Scope: Post-MVP
- Outcome: AI adoption and governance metrics linked to domain inventory
- Dependencies: EP-REPORT-001, EP-MODEL-001
- Acceptance criteria IDs: AC-REPORT-050, AC-REPORT-051
- Owner: Product
- Target milestone: M4 Enterprise Expansion

### EP-ROADMAP-001 Strategic Roadmap Orchestration

- Scope: MVP
- Outcome: initiative timeline modeling linked to capabilities and objectives
- Dependencies: EP-FACT-001
- Acceptance criteria IDs: AC-ROADMAP-001, AC-ROADMAP-002, AC-ROADMAP-003
- Owner: Product
- Target milestone: M3 Hardening
- Accountable owner: Christine Tham (interim)
- Target date: 2026-07-25
- Readiness notes: preserve existing roadmap route while replacing static data

### EP-COLLAB-001 Collaboration Workflows

- Scope: Post-MVP
- Outcome: comments, to-dos, and collaborative data stewardship workflows
- Dependencies: EP-FACT-001, EP-ID-001
- Acceptance criteria IDs: AC-COLLAB-001, AC-COLLAB-002
- Owner: Product
- Target milestone: M4 Enterprise Expansion

## Post-MVP Expansion

### EP-AUTO-001 Advanced Automation Orchestration

- Scope: Post-MVP
- Outcome: branching automation flows and advanced conditional processing
- Dependencies: EP-INT-003, EP-ID-002
- Acceptance criteria IDs: AC-AUTO-001, AC-AUTO-002
- Owner: Platform
- Target milestone: M4 Enterprise Expansion

### EP-TRANSFORM-001 Transformation Scenario Engine

- Scope: Post-MVP
- Outcome: scenario comparison, rollback planning, and transformation templates
- Dependencies: EP-ROADMAP-001, EP-REPORT-001
- Acceptance criteria IDs: AC-TRANSFORM-001, AC-TRANSFORM-002, AC-TRANSFORM-003, AC-TRANSFORM-004
- Owner: Product
- Target milestone: M4 Enterprise Expansion