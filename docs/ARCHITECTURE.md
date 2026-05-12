Understood. Below is the proposed content for docs/ARCHITECTURE.md, shown inline only.

# VantageMap Architecture

## 1. Purpose and Scope
This document defines the target architecture for VantageMap as an enterprise architecture platform inspired by SAP LeanIX. It describes the technology stack, system boundaries, data and integration patterns, and why each major design decision was selected.

Scope includes:
- MVP architecture for persistent, multi-user, API-driven operation
- Post-MVP expansion path for scale and advanced capability parity
- Security, observability, and operational controls required for enterprise use
- Deployment cost model: zero-cost for MVP, production-ready on Azure (preferred)

Out of scope:
- Detailed endpoint specifications
- Detailed schema DDL and migration scripts
- UI component-level implementation details

## 2. Deployment and Cost Constraints

### Zero-Cost MVP Deployment
The MVP must be deployable at zero monetary cost using free tiers from hosting, database, and service providers. This enables rapid iteration without budget approval gates and supports the vibe-coding execution model.

### Open-Source First
Prefer open-source tools and libraries over commercial/proprietary offerings at every layer. Commercial services are acceptable only when:
- No viable open-source alternative exists for the capability
- The commercial offering has a free tier sufficient for MVP scale
- Migration to an open-source alternative is feasible post-MVP

### Production Deployment (Post-MVP)
Production workloads target hyperscaler managed services in this order of preference:
1. **Microsoft Azure** (preferred) — Azure App Service, Azure Database for PostgreSQL, Azure Cache for Redis, Azure Blob Storage
2. **Google Cloud** (secondary) — Cloud Run, Cloud SQL, Memorystore, Cloud Storage
3. **AWS** (tertiary) — ECS/Lambda, RDS, ElastiCache, S3

### Free Tier Baseline for MVP
The following free tiers are representative starting points (to be validated in Phase 1 step 1.7):

| Layer | Free tier options | Limits |
|-------|------------------|--------|
| Hosting | Vercel Hobby, Netlify Free, Cloudflare Pages, Railway Starter | Varies; typically 100 GB bandwidth, serverless function limits |
| Database | Neon Free, Supabase Free, PlanetScale Hobby, local SQLite/PostgreSQL | Typically 500 MB–1 GB storage, connection limits |
| Cache/Queue | Upstash Free (Redis-compatible), local in-memory for dev | Typically 10K commands/day |
| Search | PostgreSQL full-text search (no additional service), Meilisearch (self-hosted) | Built-in; no cost |
| Object Storage | Cloudflare R2 Free, Supabase Storage Free | Typically 10 GB |
| Auth | Open-source libraries (Auth.js, Lucia) — no external service cost | Self-hosted |
| Observability | Sentry Free, Grafana Cloud Free, Better Stack Free | Limited retention/volume |
| CI/CD | GitHub Actions Free (2,000 min/month for public repos) | Sufficient for MVP |

## 3. Current State and Architectural Gap

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

2. Zero-cost MVP, production-ready architecture  
   Every technology choice must have a free-tier path for MVP. Architecture must also scale to managed cloud services for production without rewriting application code.

3. Open-source first  
   Prefer open-source tools at every layer. Use commercial services only when they offer a free tier and no viable open-source alternative exists.

4. Managed services for production  
   For production deployment, prefer managed database, cache, logging, and storage on Azure (preferred), GCP, or AWS to reduce operational overhead.

5. API-first domain model  
   Frontend modules consume stable APIs; no direct dependency on static data modules.

6. Security and audit by design  
   RBAC, token hygiene, tenant scoping, and immutable audit trails are mandatory platform capabilities.

7. Operational resilience as a feature  
   Retries, idempotency, observability, and backup/restore are part of the core architecture, not afterthoughts.

## 5. Recommended Tech Stack and Justification

All choices below are preliminary hypotheses to be validated in Phase 1. Final decisions will be recorded as ADRs in `docs/adr/`.

| Layer | Recommendation | Open-source? | Free tier for MVP? | Production path | Why this direction |
|---|---|---|---|---|---|
| Frontend | Next.js 16 App Router + React 19 + TypeScript | Yes (MIT) | Yes (self-hosted or Vercel Hobby) | Azure App Service / Vercel Pro | Reuses existing codebase; strong SSR/RSC model |
| Backend API | Next.js route handlers for MVP | Yes (MIT) | Yes (same deployment) | Same as frontend | Low-friction full-stack TypeScript |
| Database | PostgreSQL 16 | Yes (PostgreSQL License) | Yes (Neon Free, Supabase Free, or local) | Azure Database for PostgreSQL | ACID, JSONB, mature ecosystem |
| ORM/Data access | Prisma or Drizzle ORM | Yes (Apache 2.0 / MIT) | Yes (library only) | Same | Type-safe queries, migrations |
| Authentication | Auth.js (NextAuth) v5 or Lucia | Yes (MIT) | Yes (self-hosted, no external service) | Same | Standards-based; no vendor dependency |
| Enterprise SSO | SAML via open-source library (phase-aligned) | Yes | Yes (library only) | Keycloak or Azure AD | Enterprise identity federation |
| Provisioning | SCIM endpoint (phase-aligned) | Yes (custom implementation) | Yes | Same | Automated user lifecycle |
| Authorization | RBAC with workspace scoping | Yes (custom) | Yes | Same | Module/entity-level permissions |
| Cache/session | Redis-compatible (Upstash free or local) | Yes (BSD) | Yes (Upstash Free or local) | Azure Cache for Redis | Read performance, sessions, rate limiting |
| Async processing | BullMQ with Redis, or Inngest (free tier) | Yes (MIT) / freemium | Yes | Same or Azure Queue Storage | Imports, webhooks, reports |
| Search | PostgreSQL full-text search (MVP); Meilisearch (if needed) | Yes | Yes (built-in / self-hosted) | Azure Cognitive Search or Meilisearch Cloud | Cross-entity queries |
| API docs | OpenAPI for REST | Yes (standard) | Yes | Same | Explicit, testable contracts |
| Observability | Sentry Free + Grafana Cloud Free, or OpenTelemetry → self-hosted | Yes (MIT) / freemium | Yes (free tiers) | Azure Monitor or Grafana Cloud | SLO-driven operations |
| Storage | Cloudflare R2 Free or Supabase Storage | Yes / freemium | Yes | Azure Blob Storage | Exports, imports, audit bundles |
| Hosting | Vercel Hobby, Netlify Free, or self-hosted Docker | Mixed | Yes | Azure App Service | Fast deployment for MVP |

Why not microservices first:
- Higher operational complexity with limited early payoff
- Slower MVP delivery and more difficult debugging
- Unnecessary before workload and team boundaries become clear

Why PostgreSQL full-text search before a dedicated search engine:
- Zero additional infrastructure cost for MVP
- Sufficient for early entity volumes (< 10K fact sheets)
- Upgrade path to Meilisearch or managed search when metrics justify it

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
- Auth.js (NextAuth) v5 or Lucia with OAuth 2.0 flows (open-source, self-hosted)
- SAML federation for enterprise SSO (Post-MVP; open-source library or Keycloak)
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

MVP topology (zero-cost):
- Vercel Hobby (or Netlify Free / self-hosted Docker) for web app and API routes
- Neon Free or Supabase Free for PostgreSQL (or local PostgreSQL for dev)
- Upstash Free for Redis-compatible cache/queue (or local Redis for dev)
- Cloudflare R2 Free for object storage (or local filesystem for dev)
- Sentry Free + Grafana Cloud Free for observability

Production topology (Azure-preferred):
- Azure App Service for web app and API routes
- Azure Database for PostgreSQL Flexible Server
- Azure Cache for Redis
- Azure Blob Storage for artifacts
- Azure Monitor + Application Insights for observability

Alternative production paths:
- Google Cloud: Cloud Run + Cloud SQL + Memorystore + Cloud Storage
- AWS: ECS/Lambda + RDS + ElastiCache + S3

Why this topology:
- MVP runs at zero cost on free tiers
- Same application code deploys to any target without modification
- Production upgrade is configuration-only (environment variables, not code changes)
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

Phase 1:
- Tech stack research and architecture decisions (ADRs)

Phase 2:
- Project bootstrap, database setup, CI, testing

Phase 3:
- Database schema and core domain models

Phases 4–6:
- Backend API foundation, entity CRUD, relationships, search

Phases 7–8:
- Frontend shell, shared components, six core views

Phase 9:
- CRUD and editing UI

Phase 10:
- User management and authentication flows

Phase 11:
- Governance controls, tagging, quality seal

Phase 12:
- Integration surface (OpenAPI, GraphQL, webhooks, import/export)

Phase 13:
- Reporting, analytics, and use-case engines

Phases 14–15 (Post-MVP):
- Enterprise identity (SSO/SCIM), advanced automation, transformations, MCP, AI, portals

## 15. Key Decision Summary

1. Zero-cost MVP with free-tier services  
   Chosen to enable rapid iteration without budget gates. All tech choices must have a free-tier deployment path.

2. Open-source first at every layer  
   Chosen to avoid vendor lock-in and ensure long-term flexibility. Commercial services used only when free tier exists and no open-source alternative is viable.

3. Azure-preferred production deployment  
   Chosen as the primary hyperscaler target. Application code is cloud-agnostic; only configuration changes between providers.

4. Modular monolith over early microservices  
   Chosen for faster iteration, simpler observability, and easier cross-domain changes in early phases.

5. PostgreSQL over specialized graph-first persistence  
   Chosen for strong consistency, operational maturity, zero-cost availability (Neon/Supabase free), and sufficient relationship-query capability for MVP.

6. REST-first with phased GraphQL adoption  
   Chosen to minimize delivery risk while preserving a path to advanced reporting and traversal queries.

7. Security and audit capabilities introduced before broad feature expansion  
   Chosen because enterprise adoption requires governance and trust as foundational attributes.

## Data Platform Decision (Updated)

Primary system of record: PostgreSQL 16 (open-source; free-tier hosting via Neon or Supabase for MVP; Azure Database for PostgreSQL for production).  
ORM: Prisma or Drizzle (to be evaluated in Phase 1 step 1.3).  
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
