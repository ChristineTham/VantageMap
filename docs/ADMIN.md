# SAP LeanIX Administrator Guide - Deep Research Documentation

> Primary source: https://help.sap.com/docs/leanix/ea/administrator-guide
> Scope: Administrator Guide landing page plus linked administration topics across workspace settings, access control, governance, automations, and integrations
> Last reviewed: April 2026

---

## 1. What the Administrator Guide Is

The SAP LeanIX Administrator Guide is an entry point for configuring and governing a workspace through the administration area.

Core intent:

- Configure workspace behavior and data governance
- Manage user authentication, authorization, and lifecycle
- Shape the meta model and permissions
- Enable automations and integrations safely

The landing page itself is intentionally lightweight. The operational depth is distributed across linked pages such as Workspace Settings Overview, Meta Model Configuration, User access, SSO, SCIM, Technical Users, Automations, Webhooks, and Portals.

---

## 2. Administration Area Taxonomy

Based on Workspace Settings Overview, admin capabilities are grouped into three major categories.

### 2.1 Basic Settings

Main domains:

- Adoption KPIs
- Branding
- General
- Meta Model Configuration
- Subscription Roles
- Tagging
- Users
- User Roles and Permissions
- Dashboards

What this category controls:

- Foundation of governance and user behavior
- Data model semantics and permissions
- Identity and accountability constructs

### 2.2 Advanced Settings

Main domains:

- Automations
- Calculations
- Export
- KPIs
- Managed Code
- Notifications Center
- Optional Features and Early Access
- Portals
- Reports access configuration
- To-Dos
- Transformations settings
- Workspace Views

What this category controls:

- Higher-order orchestration, quality controls, and scoped experiences
- Feature rollout and experimentation controls

### 2.3 Discovery and Integrations

Main domains:

- API Tokens notice and Technical Users
- Developer Tools
- Integrations
- Integration API
- Metrics
- Self-Built Software Discovery
- Reference Catalog
- Tech Stack Discovery
- Sync Logging
- Webhooks

What this category controls:

- Machine-to-machine access
- Integration trust boundary and observability
- Automated ingestion and event-driven workflows

---

## 3. Admin Onboarding Path (Recommended Sequence)

A practical sequence synthesized from the docs:

1. Access and bootstrap
- Confirm primary admin ownership and initial workspace access
- Invite core admin team

2. Identity and authorization model
- Decide where roles are managed: LeanIX or IdP
- Configure SSO and optionally SCIM
- Establish role and permission policy

3. Governance foundation
- Define subscription roles and subscription visibility rules
- Define tagging governance mode
- Set key general settings (idle timeout, fiscal year, maintenance posture)

4. Meta model alignment
- Confirm standard model usage
- Apply minimal safe customization
- Configure fact sheet permissions and quality controls

5. Automation and integration
- Introduce no-code automations for governance workflows
- Migrate integration credentials to technical users
- Configure webhooks and integration observability

6. Experience scoping
- Configure workspace views and portals for persona-based consumption
- Configure dashboard defaults and external-content policy

---

## 4. Identity, Access, and User Lifecycle Administration

### 4.1 Authentication and Authorization Choices

Documented pattern:

- Authentication can be local or via SSO
- Authorization can be managed in LeanIX or in IdP (when using SSO)

This choice strongly influences custom role capability and operational lifecycle patterns.

### 4.2 Standard and Custom Role Model

Standard roles:

- Viewer
- Member
- Admin

Custom roles:

- Available when role management is externalized to IdP
- Require role claims mapping
- Technical names are uppercase and mapped between IdP and LeanIX
- If multiple custom roles are assigned, permissions are aggregated
- Standard role remains required for access, but custom role permissions take precedence

### 4.3 Role-Based Permission Domains

Permissions are split into:

1. Fact-sheet permissions
- Configured in Meta Model Configuration

2. Non-fact-sheet permissions
- Configured in User Roles and Permissions
- Includes modules such as surveys, portals, transformations, SBOM, developer tools, and architecture decisions

Admin best-practice from docs:

- Avoid over-privileging all roles to preserve data quality and reduce unintended changes.

### 4.4 SSO Architecture and Operations

Key points:

- SAML 2.0 supported
- SP-initiated flow
- JIT provisioning supported
- Role assignment behaviors depend on role claims presence and default-role configuration

Critical scenarios documented:

- IdP role can overwrite existing LeanIX role
- If role info is absent and no default role is set, user loses workspace access

### 4.5 SCIM Provisioning

SCIM purpose:

- Provision, deprovision, and update user state data

Synchronized attributes include:

- Name, email, username
- Role/custom role/ACE context (if applicable)
- Department (if applicable)

Operational constraints:

- Configured per workspace
- Not a multi-workspace sync mechanism
- Invite-only SSO flow has caveats for permission creation

Setup essentials:

1. Create technical user and token
2. Request ACCOUNTADMIN for that technical user through support path
3. Obtain short-lived and long-lived access tokens
4. Configure IdP SCIM endpoint and attribute mappings

---

## 5. Users Administration in Practice

### 5.1 User Status Model

Users Overview exposes status tabs:

- All
- Active
- Invited
- Requested
- Not invited
- Archived

This enables admins to distinguish access-ready users from contacts and deactivated users.

### 5.2 Contacts vs Workspace Users

Contacts are subscribers without workspace access.

Differences from users:

- No assigned permission role
- No workspace login
- Can still appear in subscription workflows

Admin actions:

- Invite individually or in bulk
- For SSO workspaces, invitation email can be suppressed if needed

### 5.3 User Detail Operations

From user detail pages, admins can:

- View profile, status, role, and last login
- Archive users (delete is not supported)
- Change roles in role-management-compatible setups
- Inspect user subscriptions

---

## 6. General Workspace Settings (Governance Controls)

General Settings is one of the highest-leverage admin areas.

### 6.1 Tagging Policy

Tagging mode options:

- On-the-fly
- Hybrid (predefined groups or on-the-fly)
- Predefined only

Governance implication:

- On-the-fly can increase taxonomy drift; predefined-only improves consistency.

### 6.2 Search, Currency, and Time Alignment

Configurable controls include:

- Quick search default display mode
- Workspace currency display context
- Fiscal year start month for roadmap alignment

### 6.3 Session and Security

Idle timeout can be configured or disabled (0/0).

### 6.4 Subscription Governance Controls

Admins can configure:

- Mandatory role selection on subscribe
- Visibility of Accountable subscription type
- Multiple subscriptions per user per fact sheet
- Subscription privacy mode (Relaxed vs Normal)

### 6.5 Operational Safety and Compliance

Controls include:

- Maintenance mode with custom message (blocks non-admin access)
- Data breach contact details
- Workspace snapshot import guard checkbox

Maintenance mode note:

- Recommended for significant changes to reduce in-session inconsistency during major config updates.

---

## 7. Meta Model Administration

### 7.1 Scope of Meta Model Configuration

Admins can modify:

- Fact sheet structure (sections, subsections, order, visibility)
- Fields and relations
- Permissions
- Quality seal behavior
- Conditional attributes
- Completion scoring and filters
- Translations/help text

### 7.2 Customization Strategy Guidance

Official guidance is explicit:

- Meta model is highly customizable, but excessive customization adds complexity
- It can constrain future reporting and use-case extensibility
- Changes should be intentional, minimal, and well-governed

### 7.3 Fact Sheet Configuration Patterns

Common admin operations:

- Reorder and hide sections/subsections
- Add custom fields/relations with meaningful technical keys
- Move deprecated attributes to Unused Fields and Relations instead of deleting
- Configure quality seal, conditional attributes, and role permissions

### 7.4 Audit and Change Visibility

Configuration governance features include:

- Audit log on fact sheet configuration page
- Change history retrieval via Pathfinder endpoint for meta model action batches
- Email notifications to workspace admins for significant meta model changes

---

## 8. Subscription and Accountability Governance

Subscription Roles administration enables organizational accountability mapping.

### 8.1 Role Design Model

Subscription role dimensions:

- Role name
- Subscription type: responsible, accountable, observer, all
- Fact sheet type scope

### 8.2 Behavioral Nuances

- Changing role subscription type migrates existing subscriptions accordingly
- Reducing scope requires cleanup of existing subscriptions, including archived fact sheets
- Deleting a subscription role does not automatically unsubscribe users

### 8.3 Subscription Settings Coupled to General Settings

Connected controls:

- Mandatory role selection
- Accountable type activation
- Single vs multiple subscriptions per user/fact sheet
- Privacy mode for subscription visibility

### 8.4 Deprecated Report Caveat

The subscription management report is deprecated for new workspaces but remains usable where already present.

---

## 9. Tag Governance Administration

Tagging admin guide emphasizes taxonomy lifecycle management.

### 9.1 Tag Group Model

Each tag group has:

- Name
- Fact sheet scope
- Selection mode (single or multi)
- Optional description

### 9.2 Scope and Mode Change Constraints

- Expanding scope is easy
- Reducing scope requires removing existing tag assignments first
- Switching multi-select to single-select requires cleanup of conflicting assignments

### 9.3 Deletion Rules

- Tags must be unassigned before deletion
- If still used, removal can move them to Other tags rather than hard delete
- Tag groups are deletable only when all contained tags are removed or reassigned

---

## 10. Dashboard Administration

Dashboards Settings gives admins experience-level control.

### 10.1 Controls Available

- Activate predefined dashboards
- Configure default dashboard behavior
- Allow users to set personal default dashboards
- Restrict or allow external content URLs in embedded panels
- Configure external-content behavior (popups/forms/iframes)
- Add onboarding dashboard templates

### 10.2 Governance Implication

- External content policy is a security boundary and should be curated deliberately in enterprise environments.

---

## 11. Advanced Automation Administration

Automations are no-code, event-condition-action workflows for governance and process execution.

### 11.1 Configuration Model

Automation parameters:

- Trigger
- Conditions
- Actions

Fact sheet type scope:

- One fact sheet type per automation trigger context

### 11.2 Trigger and Condition Diversity

Supported trigger families include:

- Fact sheet creation
- Field value changes
- Lifecycle state reached (nightly check behavior)
- Quality state transitions
- Subscription/tag/relation events
- Completion score changes

Condition controls include:

- Include/exclude technical-user initiated events
- Category/tags/field and lifecycle constraints
- Numeric and completion score predicates

### 11.3 Actions and Sequencing

Action types include:

- To-do creation (action or approval)
- Field/quality-state updates
- Subscription changes
- Tag add/remove
- Send webhook
- Send email
- Run script

Operational constraints:

- Up to 100 actions per automation
- Sequential execution
- Runs waiting on to-do completion can time out at 180 days

### 11.4 Quotas and Runtime

Documented runtime/limits:

- Monthly quota depends on workspace type
- 80% and 100% threshold notifications to admins
- Most runs complete quickly, with longer windows in bulk-change scenarios

---

## 12. Integration and API Administration

### 12.1 Technical Users

Technical users replace personal-token patterns and decouple integrations from human account lifecycle.

Admin capabilities:

- Create technical users with role, optional customer roles/ACEs, and token expiry
- Replace tokens (old token immediately invalidated)
- Update metadata and expiry
- View history
- Delete technical users (revokes token)

Security practices explicitly recommended:

- Treat tokens like passwords
- Rotate periodically
- Use secure secret storage
- Monitor/audit usage

### 12.2 Webhooks

Webhook delivery types:

- PUSH: HTTP POST to target URL
- PULL: Polling API endpoint with retained events

Admin configuration lifecycle:

1. Create webhook
2. Choose visibility (private vs workspace)
3. Set delivery type and parameters
4. Configure triggering events
5. Activate/deactivate and monitor

Important rule:

- Delivery type cannot be changed after creation.

### 12.3 Automations with Webhook Actions

Automations can send webhook notifications with granular field-transition logic that standard webhook filters may not fully express.

---

## 13. Information Scoping for Users

### 13.1 Workspace Views

Workspace views let admins define filtered perspectives across dashboards, reports, diagrams, and fact sheet experiences.

Admin controls:

- Define view scopes
- Restrict by user role
- Set role-specific default views

User behavior impacts:

- Users can switch among available views
- Full View restores unfiltered scope
- Some pages may not support view switching (inactive control state)
- Saved searches outside current view scope can trigger fallback to Full View

### 13.2 Portals

Portals expose curated architecture data to broader audiences outside core workspace usage.

Admin capabilities include:

- Portal creation and enable/disable
- Audience restriction by roles
- Fact sheet type and filter configuration
- Search behavior (including alias search conditions)
- Detailed view composition (relations/resources/subscriptions)
- Branding/localization
- Optional advanced JSON customization

SSO synergy:

- Portals support transient-user patterns for lightweight access when configured with external IdP and proper role handling.

---

## 14. Administrator Operating Model (Practical)

### 14.1 Baseline Governance Checklist

1. Access model finalized (local vs SSO, role source of truth)
2. Role matrix and permission boundaries documented
3. Subscription roles created and privacy/mode settings validated
4. Tagging mode and tag-group taxonomy defined
5. Maintenance mode policy documented
6. Meta model change process and review workflow established
7. Technical user/token lifecycle process defined
8. Automation quota monitoring and fallback ownership defined

### 14.2 Change Management Recommendations

- Prefer incremental changes over broad model redesign
- Use maintenance mode for high-impact configuration work
- Validate downstream effects on reports, integrations, and automations
- Announce behavior changes (filters, roles, portal visibility) to users proactively

---

## 15. Common Pitfalls and Mitigations

1. Over-customizing meta model early
- Mitigation: keep close to standard model unless a concrete use case requires divergence.

2. Role ambiguity between IdP and workspace
- Mitigation: define one source of truth for authorization and test edge scenarios.

3. Ignoring technical user hygiene
- Mitigation: enforce token rotation, ownership, and incident-ready revocation process.

4. Silent automation overload
- Mitigation: watch quota thresholds, batch-change behavior, and owner fallback coverage.

5. Weak taxonomy governance
- Mitigation: use predefined tag groups and change-control for scope/mode transitions.

6. Incomplete subscription governance
- Mitigation: define accountable/responsible model and enforce role selection where appropriate.

---

## 16. Source Index

Primary requested source:

- https://help.sap.com/docs/leanix/ea/administrator-guide

Primary linked admin corpus used:

- https://help.sap.com/docs/leanix/ea/workspace-settings-overview
- https://help.sap.com/docs/leanix/ea/general-settings
- https://help.sap.com/docs/leanix/ea/meta-model-configuration
- https://help.sap.com/docs/leanix/ea/set-up-user-access
- https://help.sap.com/docs/leanix/ea/users-overview
- https://help.sap.com/docs/leanix/ea/user-roles-and-permissions
- https://help.sap.com/docs/leanix/ea/single-sign-on-sso
- https://help.sap.com/docs/leanix/ea/subscription-roles
- https://help.sap.com/docs/leanix/ea/tagging
- https://help.sap.com/docs/leanix/ea/dashboards-settings
- https://help.sap.com/docs/leanix/ea/automations
- https://help.sap.com/docs/leanix/ea/technical-users
- https://help.sap.com/docs/leanix/ea/webhooks
- https://help.sap.com/docs/leanix/ea/workspace-views
- https://help.sap.com/docs/leanix/ea/portals
