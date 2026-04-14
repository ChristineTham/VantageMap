# SAP LeanIX Getting Started - Deep Research Notes

> Primary source: SAP Help Portal, SAP LeanIX EA docs
> Core entry page: https://help.sap.com/docs/leanix/ea/getting-started
> Last reviewed: April 2026

---

## 1. What "Getting Started" Covers

The SAP LeanIX Getting Started area is an orientation layer for new users and teams. It establishes:

1. What SAP LeanIX is and why it exists
2. Which product modules are available and when to use each
3. Foundational concepts (fact sheets, meta model, inventory, collaboration, reports, diagrams)
4. Who should use the platform and for what outcomes
5. Where to go next based on role, maturity, and use case

The page itself is high-level, but it intentionally links into operational guides (access setup, data onboarding, role-specific workflows, use-case playbooks).

---

## 2. SAP LeanIX in One Sentence

SAP LeanIX is a SaaS enterprise architecture management platform that helps organizations align IT with business strategy by modeling architecture data as interconnected fact sheets and analyzing it through reports, diagrams, and roadmaps.

---

## 3. Strategic Outcomes Promised by Getting Started

Based on the official wording across the Getting Started ecosystem, SAP LeanIX is positioned to help teams:

- Align IT strategy with business goals
- Map applications to business capabilities and dependencies
- Define and communicate target architecture (to-be)
- Find cost optimization opportunities in the application portfolio
- Improve system integration and interoperability
- Manage technology obsolescence risk and technical debt
- Support faster decision-making with shared architecture visibility

These outcomes are not tied to one screen or feature; they depend on disciplined data onboarding and governance.

---

## 4. Product Landscape Explained

Getting Started introduces three products as a layered capability stack.

### 4.1 SAP LeanIX Application Portfolio Management (APM)

Role: Base product and foundation.

Core purpose:
- Build and maintain the architecture inventory
- Understand as-is landscape
- Assess lifecycle, functional fit, technical fit, and business relevance

Typical use cases:
- Application Portfolio Assessment
- Application Rationalization

What you can do first with APM:
- Create a single source of truth for applications and key relationships
- Run baseline reports to identify redundancy and risk
- Establish ownership and governance over architecture data

### 4.2 SAP LeanIX Architecture and Road Map Planning

Role: Transformation planning extension (formerly BTM).

Core purpose:
- Model to-be architecture changes without cloning whole landscapes
- Plan and compare transformation scenarios
- Track and execute roadmap impacts over time

Key capabilities:
- Predefined and custom transformations
- Milestones in initiative/project roadmaps
- Impact views and timeline projections in reports
- Transformation Explorer for centralized management

Primary use cases:
- Application Modernization
- ERP Transformation

### 4.3 SAP LeanIX Technology Risk and Compliance

Role: Technology risk and standards extension.

Core purpose:
- Build technology inventory depth
- Detect and manage obsolescence risk
- Govern tech standards and lifecycle compliance

Key capabilities:
- Discovery of IT components/infrastructure relationships
- Lifecycle and support transparency
- Obsolescence-focused dashboards and report views
- Integrations (for example ServiceNow, Jira Service Management) and reference catalog support

Primary use case:
- Obsolescence Risk Management

---

## 5. Key Concepts from Getting Started

### 5.1 Fact Sheets

Fact sheets are the core data objects in SAP LeanIX. Each architectural element (application, business capability, IT component, etc.) is represented as a typed fact sheet with attributes and relationships.

Important implication:
- Data quality is architecture quality. Weak fact sheet ownership leads to weak decisions.

### 5.2 Meta Model

The meta model defines how fact sheet types are related. Getting Started emphasizes the standard model as well-designed and warns that customization should be deliberate.

Practical takeaway:
- Start with standard model semantics; customize only for concrete use-case needs.

### 5.3 Inventory and Collaboration

Inventory is the operational repository for finding, creating, and maintaining fact sheets.

Collaboration mechanisms highlighted by SAP:
- Surveys
- Subscriptions
- Comments
- To-dos
- Fact sheet completeness measures
- Quality Seal concept (in role guides)

Practical takeaway:
- LeanIX is not just a data store; it is a governed collaboration workflow.

### 5.4 Reports and Diagrams

Reports and diagrams are the decision surfaces built on top of fact sheet data.

Examples referenced in docs:
- Landscape reports for architecture overviews
- Matrix reports for cross-domain correlations
- Roadmap reports for planned transformation timelines
- Diagramming for visual dependency and flow analysis

Practical takeaway:
- Reporting value scales with relationship completeness, not just record count.

---

## 6. Who Uses SAP LeanIX and How

Getting Started and linked role guides frame usage by role:

| Role | Typical Focus |
|------|---------------|
| Enterprise Architects | Meta model design, governance, use-case execution, transformation planning |
| CIO / IT Leadership | Portfolio transparency, strategic alignment, risk and investment decisions |
| Application Owners | Application fact sheet accuracy, lifecycle and fit maintenance |
| Business Owners | Capability and business context relevance, business impact alignment |
| Security / Risk Teams | Obsolescence and compliance exposure management |
| Transformation / Project Managers | Initiative visibility, roadmap sequencing, impact monitoring |
| Solution Architects | Integration and target-state architecture design |

Key insight from SAP role pages:
- Enterprise architecture management is collaborative by design; no single role can maintain trustworthy architecture data alone.

---

## 7. First-Time Onboarding Sequence (Synthesized)

This sequence combines Getting Started with linked operational guides.

### Phase 0: Access and Security Setup

1. Receive workspace access (provisioned through SAP LeanIX onboarding process)
2. Identify primary workspace admins
3. Invite core team manually first
4. Decide authentication and authorization model
5. Set up SSO (recommended)
6. Optionally set up SCIM for user lifecycle automation
7. Configure roles and permissions (Viewer, Member, Admin, optional custom roles with SSO)

Why this matters:
- Early access model choices shape governance and scaling.

### Phase 1: Model Foundation and Scope

1. Understand standard meta model and fact sheet semantics
2. Define realistic initial scope (avoid "model everything")
3. Prioritize foundational fact sheets:
   - Application
   - Business Capability
   - Organization
4. Define naming and hierarchy conventions

Why this matters:
- These three types create immediate business-IT traceability with manageable effort.

### Phase 2: Bring Data into Inventory

Supported ingestion channels:
- Integrations and discovery
- Inventory Builder (AI extraction from diagrams/images)
- Excel import/export
- Manual creation/editing

SAP guidance emphasizes:
- Relevance and accuracy over volume
- Simple hierarchies (2-3 levels)
- Stakeholder validation of relationships and ownership
- Essential attributes completeness from day one

### Phase 3: Governance and Data Quality

1. Assign subscription roles (Responsible, Accountable, Observer, or combined)
2. Set recurring data maintenance expectations
3. Use collaboration mechanics (comments, to-dos, surveys)
4. Track data quality indicators:
   - Fact sheet completeness
   - Quality seal behavior where used
5. Use reference data and integrations to enrich and standardize

Why this matters:
- High-quality onboarding is not a one-time import; it is an operating model.

### Phase 4: Baseline Analysis

Start with Application Portfolio Assessment:
- Assess application inventory and relationships
- Evaluate business criticality and fit
- Identify dependencies and obvious portfolio risks

Outcome:
- Shared, evidence-based as-is understanding.

### Phase 5: Advanced Use Cases

Then progress to:
- Application Rationalization
- Application Modernization
- ERP Transformation
- Obsolescence Risk Management

Each use case introduces deeper data requirements and often additional products/extensions.

---

## 8. Data-Onboarding Guidance from SAP (Detailed)

From "Getting Data into Your Workspace":

### 8.1 Recommended Starting Point

Start with:
- Applications
- Business capabilities
- Organizations

Then link them:
- Applications <-> Business Capabilities
- Applications <-> Organizations

This delivers immediate analytical value and avoids over-scoping.

### 8.2 Import Methods and Best Fit

| Method | Best For | Trade-Offs |
|--------|----------|------------|
| Integrations / Discovery | Ongoing automated sync from source systems | Requires connector setup and source quality |
| Inventory Builder | Fast extraction from existing architecture visuals | May need manual normalization post-extraction |
| Excel import | Structured bulk bootstrap | Requires disciplined template preparation |
| Manual editing | Targeted curation and corrections | Slow at scale |

### 8.3 Inventory Modeling Principles

- Keep names and descriptions clear and business-readable
- Keep hierarchy depth lean (2-3 levels)
- Model how value is actually delivered, not just formal org chart structure
- Focus on attributes needed for your first decisions
- Validate relationships with domain owners early

### 8.4 Expansion Path

After baseline maturity:
- Add IT components (often via ServiceNow or SAP discovery paths)
- Add business context/process (for example via SAP Signavio integration)
- Add data objects (for example via Collibra integration)
- Add use-case-specific assessments (TIME, 6R, risk aggregation)

---

## 9. Role-Specific Quick Starts

### 9.1 Enterprise Architects

Primary path:
1. Access workspace and admin setup
2. Understand meta model deeply
3. Prioritize first use case (usually Application Portfolio Assessment)
4. Define import strategy and initial scope
5. Establish subscription roles and governance
6. Guide transformation and risk programs after baseline maturity

Key linked guides:
- For Enterprise Architects
- Set Up User Access
- Getting Data into Your Workspace
- Meta Model

### 9.2 Application and Business Owners

Primary path:
1. Access workspace and complete user profile
2. Locate assigned/subscribed fact sheets
3. Learn inventory filtering and fact sheet navigation
4. Update core attributes and relationships in owned fact sheets
5. Use collaboration channels (comments/surveys/to-dos)
6. Participate in quality and completeness cycles

Key practical actions documented by SAP:
- Find apps supporting capabilities in specific regions/business units via inventory filters
- Open fact sheets and maintain section-specific attributes
- Use subscriptions to monitor ownership scope

---

## 10. Use-Case Progression Linked from Getting Started

Getting Started links to multiple use-case playbooks. Their onboarding intent can be read as maturity steps.

### 10.1 Application Portfolio Assessment (APM Foundation)

Goal:
- Build transparent as-is understanding and governance baseline

Core steps:
1. Add data
2. Collect and maintain data
3. Assess portfolio

Dependency:
- Requires APM product

### 10.2 Application Rationalization

Goal:
- Reduce complexity and cost; remove redundancy and poor-fit apps

Typical data preconditions:
- Lifecycle
- Business criticality
- Functional fit
- Technical fit
- Core relationships to capabilities and organizations

Process shape:
- 7-step guide from strategy definition through scope, enrichment, evaluation, roadmap, initiative launch, and KPI reporting

Product dependency:
- APM mandatory; Architecture and Road Map Planning recommended for roadmap/transformation execution
- Total Cost of Ownership extension requirements depend on tenant vintage

### 10.3 Application Modernization

Goal:
- Continuously evolve landscape to meet changing business/technology goals

Key preconditions:
- Application and IT component inventory
- Capability map
- Relationship completeness
- TIME classification baseline

Process shape:
- 7-step flow similar to rationalization, with stronger to-be design focus

Product dependency:
- APM + Architecture and Road Map Planning + Technology Risk and Compliance (recommended stack in docs)

### 10.4 ERP Transformation

Goal:
- Support multi-year ERP programs with architecture transparency and decision support

Why LeanIX is used:
- Shared as-is baseline
- To-be scenario modeling and comparison
- Roadmap and milestone transparency
- Cross-stakeholder communication

Product dependency:
- APM for as-is assessment
- Architecture and Road Map Planning for to-be and transformation execution

Important SAP note:
- LeanIX complements project management tools (for example Jira); it does not replace them.

### 10.5 Obsolescence Risk Management

Goal:
- Identify, prioritize, and mitigate technology obsolescence risk with business context

Core shape:
1. Build software/IT component inventory
2. Enrich lifecycle and relationship data
3. Discover and prioritize risk
4. Plan mitigation initiatives
5. Monitor and report

Product dependency:
- APM baseline + Technology Risk and Compliance for specialized capabilities

Important modeling dependency:
- Risk aggregation quality depends on correct IT component relationships to applications and surrounding model.

---

## 11. Architecture and Road Map Planning (Transformation Deep Dive)

From the dedicated product guide linked in Getting Started:

Main concept:
- Model changes as transformations tied to initiatives/objectives, then project/report those impacts over time.

Highlighted capabilities:
- Transformation templates (plus custom transformations)
- Milestones inside initiative roadmaps
- Impact views in reports
- Timeline projections across landscape/matrix/portfolio reports
- Transformation Explorer for bulk management and execution

Operational pattern:
1. Define objective
2. Decompose into initiatives/projects
3. Model transformations and impacts
4. Compare scenarios in reports
5. Approve roadmap
6. Track milestones/status
7. Execute transformations to reflect implemented change

---

## 12. Technology Risk and Compliance (Operational Deep Dive)

From the dedicated product guide linked in Getting Started:

Main concept:
- Proactively manage technology lifecycle risk and standards adoption.

Capabilities emphasized:
- Infrastructure/IT component discovery
- Lifecycle and support visibility
- Obsolescence views and dashboards
- Standards governance support
- Integration-driven inventory enrichment

Practical value:
- Moves risk management from ad-hoc to measurable, repeatable portfolio process.

---

## 13. Onboarding Dashboard for APM (Versioning Notes)

The onboarding guide for APM introduces an in-product progress system:

Structure:
- Goals -> Milestones -> Tasks
- Optional skip/reopen mechanics
- Best-practice metrics for data quality benchmarking

Version notes in documentation:
- Version 3 available in new workspaces and self-service activation from Feb 4, 2026
- Version 2 had earlier rollout windows in 2024

Practical implication:
- Teams can use onboarding artifacts not only for enablement but for governance checkpoints.

---

## 14. Common Getting Started Pitfalls (Inferred from SAP Guidance)

1. Over-scoping too early
- Trying to model every fact sheet type before baseline governance exists

2. Data volume over data quality
- Large imports without ownership or relationship quality

3. Weak access strategy
- Delaying role/SSO decisions causes governance drift

4. Missing relationship backbone
- Capturing applications without capability and organization links limits analysis

5. Treating LeanIX as project task manager
- Transformation planning is architectural; detailed delivery tracking stays in PM tools

6. Neglecting collaboration features
- Without subscriptions/surveys/comments, data freshness declines quickly

---

## 15. Recommended 90-Day Adoption Blueprint

### Days 0-15: Foundation

- Set up access model, invite core team, configure roles
- Align on initial scope and naming conventions
- Confirm first use case and KPI expectations

### Days 16-45: Baseline Inventory

- Import initial application set
- Build first capability and organization structures
- Link core relationships
- Assign subscription responsibilities

### Days 46-60: Data Quality and Reporting

- Improve completeness of essential attributes
- Launch first survey cycle for data validation
- Publish baseline landscape and matrix reports

### Days 61-90: First Strategic Use Case

- Execute initial portfolio assessment
- Choose next track (rationalization, modernization, ERP, or risk)
- Build roadmap and stakeholder cadence

---

## 16. Crosswalk to VantageMap

How this Getting Started research maps to VantageMap's current architecture app design:

| LeanIX Getting Started Theme | VantageMap Equivalent |
|------------------------------|-----------------------|
| Application Portfolio Management baseline | Applications view + Dashboard |
| Capability to application traceability | Capabilities view + Applications linking |
| Strategy alignment | Strategy view (objectives/KPIs/initiatives) |
| Transformation roadmap | Roadmap view |
| Technology risk and standards | Radar view |

Gaps to consider in VantageMap if aiming closer LeanIX parity:
- Explicit Organization entity and relationships
- Subscription/governance workflow concepts
- Data quality indicators/completeness scoring
- Interface and Data Object entities
- Role-based responsibility model for data ownership

---

## 17. Source Index

Core Getting Started:
- https://help.sap.com/docs/leanix/ea/getting-started

Role and onboarding pages:
- https://help.sap.com/docs/leanix/ea/for-enterprise-architects
- https://help.sap.com/docs/leanix/ea/for-application-and-business-owners
- https://help.sap.com/docs/leanix/ea/set-up-user-access
- https://help.sap.com/docs/leanix/ea/get-data-into-workspace
- https://help.sap.com/docs/leanix/ea/onboarding-guide-application-portfolio-management

Product pages:
- https://help.sap.com/docs/leanix/ea/sap-leanix-architecture-and-road-map-planning
- https://help.sap.com/docs/leanix/ea/sap-leanix-technology-risk-and-compliance

Use-case pages linked from Getting Started:
- https://help.sap.com/docs/leanix/ea/application-portfolio-assessment
- https://help.sap.com/docs/leanix/ea/application-rationalization
- https://help.sap.com/docs/leanix/ea/application-modernization
- https://help.sap.com/docs/leanix/ea/erp-transformation
- https://help.sap.com/docs/leanix/ea/obsolescence-risk-management

Additional resources hub:
- https://help.sap.com/docs/leanix/ea/resources
