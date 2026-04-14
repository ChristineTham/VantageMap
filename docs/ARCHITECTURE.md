Understood. Below is the proposed content for docs/ARCHITECTURE.md, shown inline only.

# VantageMap Architecture

## 1. Purpose and Scope
This document defines the target architecture for VantageMap as a LeanIX-class enterprise architecture platform. It describes the technology stack, system boundaries, data and integration patterns, and why each major design decision was selected.

Scope includes:
- MVP architecture for persistent, multi-user, API-driven operation
- Post-MVP expansion path for scale and advanced capability parity
- Security, observability, and operational controls required for enterprise use

Out of scope:
- Detailed endpoint specifications
- Detailed schema DDL and migration scripts
- UI component-level implementation details

## 2. Current State and Architectural Gap

Current implementation strengths:
- Modern frontend foundation with Next.js 16, TypeScript, Tailwind v4
- Clear domain-oriented views (dashboard, capabilities, applications, strategy, radar, roadmap)
- Good baseline for UX and information design

Current limitations requiring architecture changes:
- Static in-memory data with no durable persistence
- No backend service layer, no API contracts, no integration runtime
- No authentication, authorization, tenant isolation, or auditability
- No asynchronous job processing for connectors or reporting workloads

Conclusion:
The current system is visualization-first. The target system must be data-first and governance-first to support LeanIX-style enterprise scenarios.

## 3. Architecture Principles

1. Incremental delivery over big-bang rewrite  
   Start with a production-capable monolith, then split services only when scale and team topology require it.

2. Managed services first  
   Prefer managed database, cache, logging, and storage to reduce operational overhead and accelerate delivery.

3. API-first domain model  
   Frontend modules consume stable APIs; no direct dependency on static data modules.

4. Security and audit by design  
   RBAC, token hygiene, tenant scoping, and immutable audit trails are mandatory platform capabilities.

5. Operational resilience as a feature  
   Retries, idempotency, observability, and backup/restore are part of the core architecture, not afterthoughts.

## 4. Recommended Tech Stack and Justification

| Layer | Technology | Why this decision |
|---|---|---|
| Frontend | Next.js 16 App Router + React 19 + TypeScript | Reuses existing codebase, strong SSR/RSC model, fast team velocity, strict typing for large domain evolution |
| Backend API | Next.js route handlers for MVP | Low-friction full-stack TypeScript development; avoids early distributed-system complexity |
| Database | Managed PostgreSQL 16 | ACID guarantees, mature indexing, JSONB for extensibility, strong ecosystem, enterprise reliability |
| ORM/Data access | Prisma | High developer productivity, schema migrations, typed query APIs, stable fit for TypeScript teams |
| Authentication | NextAuth.js v5 + OAuth 2.0 | Fast path to production auth flows with standards-based integration patterns |
| Enterprise SSO | SAML support (phase-aligned) | Required for enterprise identity federation and LeanIX parity expectations |
| Provisioning | SCIM (phase-aligned) | Required for automated user lifecycle management in enterprise deployments |
| Authorization | Role-based access control with workspace scoping | Enables module-level and entity-level permissions needed for governance and multi-tenant use |
| Cache/session/rate controls | Managed Redis | Improves read performance, supports session/state patterns, rate limiting, queue backend |
| Async processing | Bull with Redis | Handles imports, connectors, webhook retries, report generation, scheduled sync jobs |
| Search | Elasticsearch or managed equivalent | Supports high-volume filtering and cross-entity search beyond transactional DB patterns |
| API docs | OpenAPI for REST | Makes integration contracts explicit and testable for external systems and internal teams |
| Observability | OpenTelemetry + centralized logs/metrics/traces | Enables SLO-driven operations, faster incident triage, and capacity planning |
| Storage | S3-compatible object storage | Durable storage for exports/import artifacts, audit bundles, and connector payload archives |
| Hosting | Vercel + managed PostgreSQL + managed Redis | Fast deployment workflow, strong DX, lower ops burden for MVP and early growth |

Why not microservices first:
- Higher operational complexity with limited early payoff
- Slower MVP delivery and more difficult debugging
- Unnecessary before workload and team boundaries become clear

## 5. Target Logical Architecture

Client layer:
- Next.js pages and components
- Query/mutation clients consuming REST and later GraphQL
- Role-aware UI rendering and workspace context switching

Application/API layer:
- Route handlers for CRUD, search, governance operations, admin, and integrations
- Domain services for fact sheets, relationships, reporting, automation, and UAM
- Policy enforcement service for RBAC and workspace isolation checks

Data and state layer:
- PostgreSQL as system of record
- Redis for cache, queue state, and throttling/session patterns
- Search engine for advanced discovery and cross-entity queries

Integration and automation layer:
- Connector workers for pull/push synchronization
- Webhook delivery engine with retries and dead-letter handling
- Scheduled jobs for lifecycle checks, quality metrics, and derived analytics

Observability and operations:
- Unified logs, traces, metrics, alerting
- Audit event store
- Backup, restore, and migration safety controls

## 6. Bounded Contexts

Primary bounded contexts:
- Identity and Access Management
- Meta Model and Schema Configuration
- Fact Sheets and Relationships
- Reporting and Analytics
- Integrations and Connector Runtime
- Automation and Eventing
- Administrative Settings and Governance

Reasoning:
These boundaries align with business ownership, deployment evolution, and risk containment. They also map directly to plan phases and testing strategy.

## 7. Data Model Strategy

MVP model objectives:
- Support core LeanIX-like fact sheet entities and typed relationships
- Preserve referential integrity and lifecycle states
- Store ownership, subscriptions, tagging, and quality signals
- Capture immutable audit history for change tracking

Design approach:
- Relational core for strong consistency and queryability
- JSONB extensions for controlled custom fields and tenant-specific schema additions
- Versioned migrations to evolve model safely over time

Why this approach:
- Balances flexibility with governance
- Avoids premature graph-database complexity
- Supports incremental parity while preserving operational simplicity

## 8. API Strategy: REST First, GraphQL for Query Depth

MVP:
- REST for transactional operations, admin flows, and integration endpoints
- OpenAPI contracts for internal/external consumers
- Idempotent endpoints for import and connector operations

Phase 2+:
- GraphQL introduced for report-heavy, relationship-dense exploration
- Maintains REST for lifecycle operations and webhook/event interactions

Justification:
REST accelerates delivery and integration clarity. GraphQL is introduced where it produces clear value: complex, client-driven reporting and cross-domain traversal.

## 9. Security and UAM Architecture

Authentication:
- NextAuth.js with OAuth 2.0 flows
- SAML federation for enterprise SSO
- Technical/service users for machine-to-machine integrations

Authorization:
- Workspace-scoped RBAC
- Policy checks at API boundary and service layer
- Least-privilege defaults for roles and API tokens

Governance and audit:
- Immutable audit log for create/update/delete/admin/security events
- Token lifecycle management (rotation, revocation, expiry)
- Security telemetry integrated with observability stack

Why this is required:
LeanIX-class enterprise usage depends on trust, traceability, and policy enforcement, not just data visualization.

## 10. Scalability and Performance

Target profile:
- MVP: 50 to 500 concurrent users
- Data scale path: 100K to 1M fact sheets (with post-MVP expansion beyond)

Performance strategy:
- Indexed relational queries and pagination defaults
- Query budget controls and endpoint guardrails
- Redis caching for hot reads and repeated aggregations
- Async workload offload for heavy operations
- Search engine for full-text and broad cross-entity retrieval

Reliability strategy:
- Retry and idempotency patterns for connectors and webhooks
- Dead-letter handling for failed deliveries
- Backup/restore procedures and migration rollback plans

## 11. Integration and Extensibility

Integration patterns:
- Inbound connector sync jobs from enterprise systems
- Outbound webhook subscriptions for event-driven consumers
- Import/export pipelines with validation and reconciliation logging

Extensibility model:
- Meta model-driven custom fields and relationships
- Versioned extension points to avoid breaking tenant data
- Worker-based architecture to add new connector types safely

Justification:
Integration breadth is central to LeanIX parity and enterprise adoption. A stable extension model reduces long-term platform fragmentation.

## 12. Deployment Topology

Recommended MVP topology:
- Vercel hosting for web app and API routes
- Managed PostgreSQL for transactional persistence
- Managed Redis for cache and jobs
- Managed object storage for artifacts
- Managed observability provider for telemetry and alerting

Why this topology:
- Fastest route to production
- Lowest platform operations burden for MVP
- Clear upgrade path to service decomposition and regional scaling later

## 13. Migration Strategy from Current Implementation

Step 1:
- Preserve existing UX modules while introducing backend service contracts

Step 2:
- Migrate data source from static module imports to API-backed reads

Step 3:
- Introduce write paths, validation, and audit logging

Step 4:
- Add auth and workspace-aware RBAC controls

Step 5:
- Enable async integration/reporting workflows and webhook infrastructure

Step 6:
- Add GraphQL where reporting complexity justifies it

Migration guardrails:
- No UI route regressions during data-layer swap
- Backward-compatible transitional adapters where required
- Verification gates per phase before expanding scope

## 14. Phase Mapping

Phase 1 to 2:
- Foundation, persistence, bounded contexts, canonical domain model

Phase 3:
- UAM and security hardening

Phase 4:
- API-driven core product modules

Phase 5:
- Integration and eventing baseline

Phase 6:
- Reporting and use-case engines

Phase 7+:
- Advanced automation, virtual workspaces, transformation intelligence, expanded AI/MCP capabilities

## 15. Key Decision Summary

1. Managed cloud over self-hosting for MVP  
   Chosen for delivery speed, reduced operations burden, and better early-stage cost efficiency.

2. Modular monolith over early microservices  
   Chosen for faster iteration, simpler observability, and easier cross-domain changes in early phases.

3. PostgreSQL plus Prisma over specialized graph-first persistence  
   Chosen for strong consistency, operational maturity, and sufficient relationship-query capability for MVP to mid-scale growth.

4. REST-first with phased GraphQL adoption  
   Chosen to minimize delivery risk while preserving a path to advanced reporting and traversal queries.

5. Security and audit capabilities introduced before broad feature expansion  
   Chosen because enterprise adoption requires governance and trust as foundational attributes.

## Data Platform Decision (Updated)

Primary system of record: Managed PostgreSQL 16 with Prisma.  
Supporting stores are introduced only when measurable needs emerge (search index, graph projection/read model, cache).

### Why PostgreSQL is the primary datastore

1. Enterprise consistency requirements  
The platform must safely handle role enforcement, lifecycle transitions, audit capture, and integration sync. These are transactional workloads where ACID guarantees materially reduce data integrity risk.

2. Governance-heavy domain model  
Fact sheets, typed relationships, ownership, quality states, and policy checks benefit from relational constraints and referential integrity.

3. Reporting and analytics fit  
LeanIX-style value depends on cross-domain queries and aggregations. SQL is the most direct and maintainable foundation for these workloads in MVP and early scale.

4. Controlled extensibility  
PostgreSQL JSONB allows custom fields while preserving a governed relational core. This balances flexibility with compliance and operational predictability.

5. Delivery speed and operational maturity  
PostgreSQL plus Prisma provides a strong migration workflow, backup/restore ecosystem, and broad team familiarity, improving time-to-value.

### Why MongoDB (or similar NoSQL document stores) is not the primary datastore

1. Schema flexibility can weaken governance  
The platform needs controlled evolution, not unconstrained document drift across tenants and modules.

2. Relationship-heavy reporting is less natural  
Complex cross-entity analysis often requires denormalization or application-level joins, increasing implementation and maintenance complexity.

3. Governance controls are harder to standardize  
Permission and audit semantics across many document variants create higher long-term complexity than a relational core.

### Why a Graph DB is not the primary datastore (initially)

1. Graph traversal is only part of the workload  
The system also needs strong admin, security, audit, configuration, and integration workflows that are not graph-native first.

2. Early operational complexity is higher  
Running a dedicated graph datastore from phase one adds platform and modeling overhead before usage patterns justify it.

3. PostgreSQL can satisfy early-to-mid graph needs  
Typed edge tables plus indexing cover most required relationship traversal for MVP and early growth.

### Evolution path (important)

1. Keep PostgreSQL as source of truth.  
2. Add managed search for full-text and faceted discovery when needed.  
3. Add a graph read model or graph datastore only if traversal latency, query complexity, or scale metrics consistently exceed targets.  
4. Keep write-path governance in the relational core even if specialized read models are introduced.

### Decision trigger points for adding specialized stores

1. Search index: when complex free-text/faceted search impacts primary database performance or response targets.  
2. Graph projection: when relationship traversal queries repeatedly breach agreed SLOs despite indexing and query optimization.  
3. Additional datastores: only after clear production evidence and explicit operational ownership.
