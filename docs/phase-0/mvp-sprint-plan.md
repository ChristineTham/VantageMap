# MVP Sprint Plan (Dependency Sequenced)

This plan maps MVP epics to a 7-sprint sequence and aligns to milestone labels in [epic-catalog.md](epic-catalog.md).

## Planning Assumptions

- Sprint cadence: 2 weeks
- Start date: 2026-05-04
- Primary dependencies follow epic dependency chains defined in [epic-catalog.md](epic-catalog.md)
- Accountable owner for this interim plan: Christine Tham

## Sprint Sequence

## Sprint 1 (2026-05-04 to 2026-05-15) - Foundation A

- EP-PLATFORM-001 Managed Platform Baseline
- EP-MODEL-001 Canonical Meta Model Engine (foundational subset)

Definition of done

- Managed platform skeleton operational
- Core domain type model confirmed against docs parity baseline

## Sprint 2 (2026-05-18 to 2026-05-29) - Foundation B

- EP-MODEL-001 Canonical Meta Model Engine (completion)
- EP-PLATFORM-002 Static-to-Persistent Data Migration (read path phase)
- EP-ID-001 Role-Based Access and Permission Evaluation (policy baseline)

Definition of done

- Canonical model complete for MVP entities
- Read APIs available for core inventory routes
- Permission checks in place for baseline module access

## Sprint 3 (2026-06-01 to 2026-06-12) - Data Cutover A

- EP-ID-002 Technical Users and Token Lifecycle
- EP-INT-001 REST API Baseline
- EP-PLATFORM-003 Async Processing Runtime

Definition of done

- Technical user token flow operational
- REST contracts ready for core inventory and admin operations
- Queue runtime supports import/export and webhook jobs

## Sprint 4 (2026-06-15 to 2026-06-26) - Data Cutover B

- EP-FACT-001 Fact Sheet CRUD and Relationship Management
- EP-FACT-002 Inventory Search, Filtering, and Query Performance
- EP-INT-002 GraphQL Reporting Access

Definition of done

- Core create/read/update relationship flows in persistent mode
- Search and filter paths hit target baseline performance
- GraphQL reporting access available with permission enforcement

## Sprint 5 (2026-06-29 to 2026-07-10) - Governance A

- EP-ADMIN-001 Workspace Governance Controls
- EP-SEC-001 Audit Trail and Compliance Logging
- EP-PLATFORM-004 Backup and Recovery Controls

Definition of done

- Governance controls enabled for tagging and subscriptions
- Audit trails available for all mutation classes
- Backup and restore runbooks tested at least once

## Sprint 6 (2026-07-13 to 2026-07-24) - Governance B

- EP-ADMIN-002 Quality Seal Workflow
- EP-INT-003 Webhooks and Delivery Reliability
- EP-FACT-003 Bulk Data Operations

Definition of done

- Quality workflow and notifications available
- Webhook retry/dead-letter behavior validated
- Bulk import/export/update supports operational data stewardship

## Sprint 7 (2026-07-27 to 2026-08-07) - MVP Product Completion

- EP-REPORT-001 Core Reporting Runtime
- EP-REPORT-002 Application Rationalization Use Case
- EP-ROADMAP-001 Strategic Roadmap Orchestration

Definition of done

- Dashboard/reporting modules powered by persistent APIs
- Rationalization use case baseline available
- Roadmap route fully API-backed with parity behavior

## Critical Path

1. EP-PLATFORM-001 -> EP-ID-001 -> EP-ID-002 -> EP-INT-001 -> EP-FACT-003
2. EP-PLATFORM-001 -> EP-MODEL-001 -> EP-FACT-001 -> EP-INT-002 -> EP-REPORT-001 -> EP-REPORT-002
3. EP-PLATFORM-001 -> EP-PLATFORM-002 -> EP-REPORT-001

## Risk Controls

- Keep feature flags active for route-level rollback during Sprints 3 to 6
- Enforce NFR checks from [nfr.md](nfr.md) before Sprint 7 exit
- Review gate checklist in [gates.md](gates.md) at each sprint boundary