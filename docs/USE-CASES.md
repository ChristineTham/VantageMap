# SAP LeanIX Use Cases and Methodologies

> Primary index: https://help.sap.com/docs/leanix/ea/use-cases-methodologies
> Research scope: SAP Help pages linked from the index, plus methodology and transformation guides
> Last reviewed: April 2026

---

## 1. Executive Summary

The SAP LeanIX Use Cases and Methodologies area presents a maturity path for enterprise architecture teams:

1. Build a reliable as-is baseline with Application Portfolio Assessment
2. Progress to decision-heavy use cases (Rationalization, Modernization)
3. Run major transformation programs (ERP Transformation)
4. Manage technical risk continuously (Obsolescence Risk Management)
5. Govern emerging technology adoption (AI Governance)

Methodologies such as TIME, 6R, and Pace Layering provide a consistent decision language across these use cases, while Transformations operationalize how to-be changes are modeled, compared, and executed.

---

## 2. What the Use Cases & Methodologies Index Says

The index page is intentionally short and points to six key use cases:

- Application Portfolio Assessment
- Application Rationalization
- Application Modernization
- ERP Transformation
- Obsolescence Risk Management
- AI Governance and Adoption

It also emphasizes a prerequisite before executing any use case:

- Understand the Meta Model and modeling guidelines first

Why this matters:
- All outcomes depend on the quality of fact sheet relationships and field semantics.
- Weak modeling discipline creates misleading reports, especially in transformation and risk views.

---

## 3. Portfolio of Use Cases

### 3.1 Application Portfolio Assessment (APA)

Purpose:
- Establish architecture transparency and governance over the as-is landscape.

Core questions answered:
- Which applications exist?
- What do they support in the business?
- Where are dependencies, overlap, or obvious optimization opportunities?

Business value:
- Single source of truth for architecture data
- Better prioritization for downstream programs
- Foundation for every advanced use case

Required product:
- SAP LeanIX Application Portfolio Management (base)

Guide structure:
1. Add Data
2. Collect and Maintain Data
3. Assess Your Application Portfolio

Key output:
- A governed baseline inventory that supports rationalization, modernization, and risk initiatives.

### 3.2 Application Rationalization

Purpose:
- Reduce portfolio complexity and total cost of ownership while preserving business capability coverage.

Typical business drivers:
- Cost reduction and budget release for innovation
- Redundancy removal
- Legacy and end-of-life risk reduction

Prerequisites:
- Completed APA baseline
- Key attributes populated: lifecycle, business criticality, functional fit, technical fit
- Core relations in place: applications to business capabilities and organizations

Required products/extensions:
- APM (required)
- Architecture and Road Map Planning (for initiative/impact execution)
- Application Total Cost of Ownership extension (activation depends on tenant vintage)

Guide structure:
1. Understand Strategy
2. Scope Applications
3. Enrich Data
4. Evaluate Data
5. Create Rationalization Roadmap
6. Start Rationalization Initiative
7. Track and Report

Evidence cited in SAP docs:
- Case examples include notable decommission and reduction rates and fast payback windows.

### 3.3 Application Modernization

Purpose:
- Continuously evolve applications and supporting technology to improve agility, resilience, and strategic fit.

Modernization patterns referenced:
- Replace outdated systems
- Build API-enabled applications
- Adopt data platform architecture
- Migrate selected workloads to cloud

Important nuance:
- "Modern" is context-dependent and changes over time.

Prerequisites:
- Application and IT component inventory
- Business capability map
- Quality relations across fact sheets
- TIME baseline

Recommended product stack:
- APM
- Architecture and Road Map Planning
- Technology Risk and Compliance

Guide structure:
1. Understand Strategy
2. Scope Applications
3. Collect Data
4. Evaluate Data
5. Plan Transformations and Create Roadmap
6. Start Modernization
7. Track and Report

### 3.4 ERP Transformation

Purpose:
- Guide large multi-year ERP change programs with architecture transparency and scenario planning.

Context highlighted by SAP:
- ERP transformations are high-complexity programs with broad architecture impact.
- The shift from monolithic legacy ERP to modern platforms increases integration and target-state design complexity.

Typical drivers:
- Vendor-mandated upgrades (for SAP customers, ECC to S/4HANA timeline pressure)
- M&A integration or carve-out requirements
- Cost and agility pressures

Challenges addressed:
- Limited as-is visibility
- Weak impact awareness across options
- Incomplete stakeholder data for decisions
- Difficulty monitoring post-program impact

Benefits by stakeholder:
- CIOs: target-state clarity and milestone transparency
- EAs: scenario comparison and impact visibility
- Program managers: better sequencing and risk awareness

Products needed:
- APM for as-is and baseline assessment
- Architecture and Road Map Planning for to-be modeling, milestones, and transformation execution

Important note:
- LeanIX complements project management tools (for example Jira); it does not replace them.

### 3.5 Obsolescence Risk Management

Purpose:
- Identify, assess, prioritize, and mitigate risks caused by outdated technology.

Risk process in docs:
1. Identify obsolescence exposure
2. Assess business impact
3. Plan remediation or risk acceptance
4. Execute mitigation
5. Monitor and review continuously

Drivers:
- Security and availability risk from unsupported technology
- Financial and reputational exposure
- Need to prioritize mitigation budget by business impact

Products needed:
- APM for architecture context and business linkage
- Technology Risk and Compliance for inventory discovery, lifecycle data, and dedicated risk views/dashboard

Guide structure:
1. Bring Software Assets Information
2. Enrich Data
3. Discover and Prioritize Risks
4. Plan and Manage Mitigation Initiatives
5. Monitor, Measure, and Report

Critical modeling dependency:
- Aggregated risk quality depends on correct IT component relationships and lifecycle data completeness.

### 3.6 AI Governance and Adoption

Purpose:
- Govern AI usage and adoption with policy, risk, architecture, and business alignment.

What AI governance means in this context:
- Structured policies and control mechanisms for responsible AI development and use.

Key outcomes expected:
- Strategic alignment of AI initiatives
- Ethical and regulatory compliance
- Reduction of shadow AI and vendor sprawl
- Scalable experimentation with controlled risk

Required products/extensions:
- APM (base)
- Architecture and Road Map Planning (for AI-related transformations)
- AI Governance extension to the meta model
- AI Agent extension to the meta model

Guide structure:
1. Collect Data
2. Assess AI Potential and Usage
3. Evaluate AI-Related Risks
4. Standardize AI Usage
5. Create AI-Related Transformations
6. Track and Report

---

## 4. Methodologies Used Across Use Cases

### 4.1 Gartner TIME Framework

Purpose:
- Classify applications by business value and technical condition using functional fit and technical fit.

Categories:
- Tolerate
- Invest
- Migrate
- Eliminate

How SAP LeanIX applies TIME:
- TIME is an application attribute in Portfolio Strategy.
- In meta model v4, it is available by default.
- In v3 workspaces, it can be activated via optional features.

Practical guidance from SAP docs:
- Start TIME classification early, including for APA and Rationalization.
- Use surveys to collect consistent fit assessments from owners.
- Use reports to identify low-impact elimination candidates and cost-weighted priorities.
- Final decision should not be purely algorithmic; validate with affected stakeholders.

### 4.2 6R Framework

Purpose:
- Classify cloud migration and modernization strategy per application.

Categories:
- Rehost
- Replatform
- Rearchitect
- Repurchase
- Retain
- Retire

How SAP LeanIX applies 6R:
- 6R Strategy is captured in Application fact sheets.
- In v4, available by default; in v3, can be enabled/added.

Practical guidance from SAP docs:
- Use collaborative classification with business and technical owners.
- Assess complexity and priority alongside 6R category.
- Combine TIME and 6R in matrix/portfolio reports to prioritize quick wins:
  - Low business criticality + Retire
  - Tolerate + Rehost
  - Invest + modernization paths for strategic assets

### 4.3 Pace Layering Framework

Purpose:
- Classify business capabilities by strategic value and pace of change, then tune governance and investment by layer.

Layers:
- Innovation (high change pace, exploratory)
- Differentiation (moderate pace, competitive advantage)
- Commodity (slow pace, stable core)

Indicative portfolio mix in SAP guidance:
- Innovation: 5-10%
- Differentiation: about 20%
- Commodity: about 70%

Prerequisite:
- Business capability map

How SAP LeanIX applies it:
- Classify capabilities into pace layers
- Use assessments and reports to prioritize architecture actions
- Combine with TIME and 6R for stronger investment and roadmap choices

---

## 5. Transformation Methodology in Execution

Transformations are the operational mechanism for to-be planning in Initiative fact sheets.

### 5.1 What Transformations Provide

- Predefined templates for common changes
- Custom transformations for local requirements
- Automatic implied impacts and relation updates
- Preview of architecture change before applying it to as-is

### 5.2 Predefined Template Families Mentioned

Application-focused templates:
- Introduce New Application
- Change Application Technology
- Rollout Application
- Discontinue Application
- Withdraw Application
- Decommission Application

Interface-focused templates:
- Introduce New Interface
- Decommission Interface
- Change Interface Technology
- Change Data Transfer

### 5.3 Lifecycle and Control Model

1. Create transformation item(s)
2. Review implied and optional custom impacts
3. Compare scenarios in reports
4. Execute transformation when approved
5. Reflect realized impacts in active architecture

Operational capabilities:
- Bulk create/edit/execute via table mode
- Explorer view for cross-initiative management
- Planned status for newly created fact sheets until execution

Administrative caution documented by SAP:
- Do not customize system-managed transformation fields (status/impact type) in ways that break transformation services.

Relation handling option (tenant/version dependent):
- Immediate remove/create direct relations, or
- Preserve historical relations using active from/until semantics

---

## 6. Obsolescence Risk Aggregation Logic (Methodological Detail)

SAP's aggregation documentation clarifies how application-level obsolescence risk is computed.

Included signals:
- Direct active app-to-IT component relations
- Indirect IT component links via hierarchy and requires relations
- Indirect links through related application hierarchies
- Indirect links via microservices

Risk status severity order (high to low):
1. Unaddressed Risk
2. Unaddressed Phase Out
3. Upcoming Risk
4. Missing IT Component Information
5. Risk Accepted
6. Risk Addressed
7. No Risk

Design implication:
- Risk results are only as good as relation hygiene, lifecycle quality, and active relation periods.

---

## 7. Product and Capability Matrix

| Use Case | APM | Architecture and Road Map Planning | Technology Risk and Compliance | Meta Model Extensions |
|----------|-----|------------------------------------|-------------------------------|----------------------|
| Application Portfolio Assessment | Required | Optional | Optional | None |
| Application Rationalization | Required | Recommended/Required for transformation execution | Optional | TCO extension considerations |
| Application Modernization | Required | Required for to-be planning | Recommended | None |
| ERP Transformation | Required | Required | Optional but often useful | None |
| Obsolescence Risk Management | Required | Optional | Required for advanced risk capabilities | None |
| AI Governance and Adoption | Required | Required for AI transformation planning | Optional | AI Governance + AI Agent |

---

## 8. Recommended Adoption Sequence

A practical sequence derived from the use-case ecosystem:

1. Prepare modeling foundation
- Align on meta model conventions and naming
- Define data scope and ownership

2. Execute Application Portfolio Assessment
- Build baseline inventory and governance controls

3. Introduce shared methodology language
- Apply TIME
- Apply 6R
- Apply Pace Layering where capability governance is mature

4. Choose primary strategic track
- Rationalization for cost/complexity goals
- Modernization for agility/tech-fit goals
- ERP Transformation for major program execution

5. Add continuous risk track
- Stand up obsolescence risk process and dashboard cadence

6. Add AI governance track
- Introduce AI extensions and standardization controls

---

## 9. Typical Pitfalls and Mitigations

1. Starting advanced use cases before APA baseline
- Mitigation: complete foundational data and ownership first.

2. Treating TIME/6R labels as one-time static tags
- Mitigation: set periodic review cadence and tie to roadmap cycles.

3. Mixing transformation planning with delivery task-level tracking
- Mitigation: keep LeanIX architectural; use PM tools for detailed execution.

4. Under-modeling IT component relationships in risk programs
- Mitigation: validate relation completeness and lifecycle quality before risk reporting.

5. Launching AI governance without extension and ownership setup
- Mitigation: activate required meta model extensions and define policy owners.

---

## 10. Crosswalk to VantageMap

How the SAP LeanIX use-case model maps to VantageMap's current views:

| LeanIX Use Case/Methodology | VantageMap View Alignment |
|-----------------------------|---------------------------|
| Application Portfolio Assessment | Applications + Dashboard |
| Rationalization | Applications + Strategy + Roadmap |
| Modernization | Roadmap + Radar + Applications |
| ERP Transformation | Roadmap + Strategy + Applications |
| Obsolescence Risk Management | Radar + Applications |
| AI Governance | Strategy + Applications (future expansion needed) |
| TIME / 6R | Strategy attributes in applications (future data enrichment) |
| Pace Layering | Capabilities view (future layering attributes) |

Potential data model enhancements for closer parity:
- Explicit organization entity and usage relations
- Explicit IT component lifecycle and vendor lifecycle fields
- TIME and 6R fields at application level
- Pace layer field at capability level
- Transformation entity with implied/custom impacts
- AI governance and AI agent entities/attributes

---

## 11. Source Index

Primary index:
- https://help.sap.com/docs/leanix/ea/use-cases-methodologies

Use-case pages:
- https://help.sap.com/docs/leanix/ea/application-portfolio-assessment
- https://help.sap.com/docs/leanix/ea/application-rationalization
- https://help.sap.com/docs/leanix/ea/application-modernization
- https://help.sap.com/docs/leanix/ea/erp-transformation
- https://help.sap.com/docs/leanix/ea/obsolescence-risk-management
- https://help.sap.com/docs/leanix/ea/ai-governance-and-adoption

Methodology and execution pages:
- https://help.sap.com/docs/leanix/ea/time
- https://help.sap.com/docs/leanix/ea/6r
- https://help.sap.com/docs/leanix/ea/pace-layering
- https://help.sap.com/docs/leanix/ea/transformations
- https://help.sap.com/docs/leanix/ea/views-aggregation

Foundational reference:
- https://help.sap.com/docs/leanix/ea/meta-model
