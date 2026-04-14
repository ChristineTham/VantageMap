## Plan: LeanIX Replication Implementation

Build an incremental MVP that establishes a durable LeanIX-like platform foundation (data model + UAM + inventory + core reporting + integrations) on a managed-cloud stack, then iteratively add advanced capabilities (automation depth, virtual workspaces, transformation intelligence, and AI/MCP expansion). Use the existing VantageMap frontend as a UX seed only; introduce a production backend, persistence, identity, and integration runtime as first-class architecture components. Include explicit updates to Copilot instructions/skills so implementation work stays aligned with this plan.

**Steps**
1. Phase 0 - Program Setup and Parity Baseline
   : Build a requirements traceability matrix from the docs corpus (admin, user, UAM, developer, model, use-cases, getting started) into epics/capabilities with MVP vs Post-MVP tags. Define acceptance criteria and non-functional targets for v1 MVP.

2. Phase 1 - Target Architecture and Platform Foundation (*depends on 1*)
   : Stand up managed-cloud baseline (recommended: Vercel + managed Postgres + managed Redis + object storage + centralized logging/APM).
   : Define bounded contexts: `Identity/UAM`, `Meta Model`, `Fact Sheets`, `Reporting`, `Integrations`, `Automation`, `Admin Settings`.
   : Introduce backend API layer (REST first), persistence, migration pipeline, and background job runner.
   : Establish tenant/workspace isolation model and audit/event foundation from day one.

3. Phase 2 - Canonical Domain Model and Meta Model Engine (*depends on 2*)
   : Implement canonical entity model to cover LeanIX core fact sheets and relations, including lifecycle, quality states, subscriptions, tags, and ownership semantics.
   : Build meta model configuration capabilities (fact sheet type configuration, custom fields/relations, permissions hooks, audit logs for model changes).
   : Add versioned schema migrations and data evolution strategy for customer-specific extensions.

4. Phase 3 - UAM, Security, and Access Control (*parallel with 3 where possible*)
   : Implement technical users and token lifecycle for API access.
   : Implement OAuth token exchange flow for service auth, then SAML SSO and SCIM user-state sync.
   : Add role/permission framework (standard + custom role mapping), invite flows, archive lifecycle, and permission evaluation for modules.
   : Defer full virtual workspace ACL complexity to Post-MVP unless needed for pilot customers.

5. Phase 4 - Core Product MVP Experiences (*depends on 3 and 4*)
   : Replace static data sourcing with backend APIs for inventory, fact sheet detail/editing, relationships, and search/filtering.
   : Deliver dashboard, capabilities, applications, strategy, radar, and roadmap as API-driven modules with persistence.
   : Add governance controls required for MVP: tagging modes, subscription roles, basic quality seal workflow, user/role admin, dashboard defaults.

6. Phase 5 - Integration and Eventing MVP (*depends on 4*)
   : Deliver GraphQL endpoint for fact-sheet-centric access and report queries.
   : Deliver REST APIs for admin/user/settings/integration operations with OpenAPI docs.
   : Deliver webhook infrastructure (PUSH first, retries, event catalog subset), and baseline integration-run logging.
   : Provide initial import/export workflows (CSV/Excel + API) with idempotent upsert semantics.

7. Phase 6 - Reporting and Use-Case Engines (*depends on 5 and 6*)
   : Implement custom reporting runtime path (GraphQL-powered report datasets + export).
   : Deliver MVP use-case engines: application rationalization (TIME/6R), lifecycle/obsolescence indicators, roadmap impact views.
   : Add phased analytics for adoption and data quality metrics.

8. Phase 7 - Post-MVP Expansion (*parallel tracks after MVP release*)
   : Advanced automation orchestration (branching/complex conditions/scripts).
   : Virtual workspaces and ACE/ACL fact-sheet scoping.
   : Transformation template engine with scenario comparison and rollback support.
   : Expanded MCP/AI tooling, portal enhancements, and deeper connector catalog.

9. Cross-Cutting Delivery Controls (*runs throughout Phases 1-7*)
   : Observability: traces, logs, metrics, error budgets.
   : Reliability: queues/retries/idempotency, backup/restore, migration safety gates.
   : Security/compliance: secret management, audit retention, privacy controls.
   : Performance: query budgets, pagination, cache strategy, search indexing.

10. Copilot Instructions and Skills Update Plan (*starts after plan approval; *parallel with Phase 1*)
   : Update existing instruction files to encode LeanIX-replication architecture decisions and domain rules.
   : Add new instruction coverage for EA domain semantics, integration patterns, and permission modeling.
   : Add/extend skill workflows for adding enterprise entities/capabilities, not just pages.
   : Add a reusable planning prompt for parity tracking and phased delivery governance.

**Relevant files**
- [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) - product onboarding and baseline product positioning to anchor MVP scope framing.
- [docs/MODEL.md](docs/MODEL.md) - canonical meta model, entity/relationship coverage, and mapping guidance.
- [docs/USE-CASES.md](docs/USE-CASES.md) - strategic use-case engines and methodology requirements.
- [docs/USER-GUIDE.md](docs/USER-GUIDE.md) - end-user workflow parity requirements.
- [docs/ADMIN.md](docs/ADMIN.md) - administration/gov controls and operational feature requirements.
- [docs/UAM.md](docs/UAM.md) - identity/access lifecycle, SSO/SCIM, and role model requirements.
- [docs/DEVELOPER.md](docs/DEVELOPER.md) - API/integration/developer tooling requirements.
- [src/lib/data.ts](src/lib/data.ts) - current static data shape and short-term migration source.
- [src/app/layout.tsx](src/app/layout.tsx) - shell/layout composition to preserve while swapping data sources.
- [src/components/Sidebar.tsx](src/components/Sidebar.tsx) - module navigation baseline for phased module delivery.
- [AGENTS.md](AGENTS.md) - top-level engineering guidance to align with new platform architecture plan.
- [.github/instructions/data.instructions.md](.github/instructions/data.instructions.md) - data-model authoring rules to evolve from sample-only to enterprise canonical modeling.
- [.github/instructions/nextjs.instructions.md](.github/instructions/nextjs.instructions.md) - frontend implementation constraints and server/client component rules.
- [.github/instructions/styling.instructions.md](.github/instructions/styling.instructions.md) - design system constraints for consistency while adding complex modules.
- [.github/skills/add-page/SKILL.md](.github/skills/add-page/SKILL.md) - existing workflow skill to expand toward domain-capability workflows.

**Verification**
1. Requirements Traceability Check
   : Confirm every major capability family from docs is mapped to a phase and tagged as MVP or Post-MVP.

2. Architecture Review Gate
   : Validate target stack against scale/security/integration needs and approve managed-cloud baseline.

3. MVP Scope Gate
   : Confirm Incremental MVP includes: persistent data model, UAM baseline, inventory/editing, core reports, REST/GraphQL/webhook baseline.

4. Technical Readiness Gate
   : Ensure migration strategy exists for moving from static `src/lib/data.ts` to persistent API-backed model with no broken UI routes.

5. Instruction/Skill Governance Gate
   : Confirm instruction updates explicitly reflect domain modeling, integration policies, and access-control rules before implementation handoff.

6. Non-Functional Readiness Gate
   : Define measurable targets for API latency, search/report performance, auditability, and reliability before build execution.

**Decisions**
- Hosting: Managed Cloud (selected)
- Delivery strategy: Incremental MVP (selected)
- Architecture direction: Keep Next.js frontend but add full backend/persistence/security/integration layers; do not treat current stack as sufficient on its own.
- Scope boundary for MVP: prioritize core parity (data model/UAM/core modules/reporting/integrations baseline), defer full enterprise depth (advanced automation branching, full ACL virtual workspaces, broad AI/portal depth) to post-MVP phases.
- Included in this planning deliverable: explicit plan for updating Copilot instructions/skills to enforce architectural and domain consistency.
- Excluded from this planning turn: direct code/config edits (planning-only mode).

**Further Considerations**
1. MVP Boundary Recommendation
   : Option A (recommended): include virtual workspace ACL in Post-MVP; Option B: include minimal ACL if first pilot requires strict data segmentation.

2. API Strategy Recommendation
   : Option A (recommended): REST-first MVP with GraphQL added in Phase 5 for reporting/complex queries; Option B: GraphQL-only from Phase 1 (requires schema maturity first).

3. Custom Field Strategy Recommendation
   : Option A (recommended): JSON/JSONB columns for custom field storage with configurable validation; Option B: fully relational schema for each customer extension (requires meta-model schema migration machinery).
