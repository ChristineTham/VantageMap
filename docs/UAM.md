# SAP LeanIX User and Access Management (UAM) - Deep Research Documentation

> Primary source: https://help.sap.com/docs/leanix/ea/user-and-access-management
> Scope: UAM landing page plus linked setup and operating guides for users, roles, SSO, SCIM, and virtual workspaces
> Last reviewed: April 2026

---

## 1. Executive Summary

SAP LeanIX UAM combines identity, authorization, and data-scope controls to ensure that the right users can access the right data with the right privileges.

The official UAM landing page is concise and points to core capabilities:

- Invite users and assign standard roles (Viewer, Member, Admin)
- Enable SSO for centralized authentication
- Configure SCIM to synchronize user states
- Use virtual workspaces for fact-sheet-level access scoping

In practice, UAM depth is distributed across several documentation pages. This document consolidates them into one detailed operating guide.

---

## 2. UAM Capability Model

### 2.1 Authentication

Purpose:

- Verify user identity before workspace access

Modes:

- Native LeanIX authentication (email/password)
- SSO-based authentication via SAML 2.0 IdP integration

### 2.2 Authorization

Purpose:

- Determine what authenticated users can view/change

Modes:

- Authorization managed in LeanIX (standard roles only)
- Authorization managed in IdP (supports custom roles and ACE distribution)

### 2.3 Provisioning Lifecycle

Purpose:

- Keep user account state synchronized with organizational identity source

Mechanism:

- SCIM provisioning/deprovisioning/update (works alongside SSO)

### 2.4 Data Scope Controls

Purpose:

- Restrict fact-sheet visibility/editability by organizational boundaries

Mechanism:

- Virtual workspaces using ACE (access control entities) and ACL assignments

---

## 3. UAM Setup Journey (Recommended Sequence)

1. Bootstrap workspace access
- First registrant is default admin
- Form initial core admin team manually

2. Decide operating model
- Authentication source: LeanIX vs SSO
- Authorization source: LeanIX vs IdP

3. Establish baseline role governance
- Validate standard role assignments
- Define non-fact-sheet permissions per role
- Define fact-sheet permissions in meta model configuration

4. Enable SSO
- Implement SAML 2.0 trust and claim mapping
- Choose role management approach and default role behavior

5. Add SCIM (optional but recommended at scale)
- Automate create/update/archive user states
- Validate attribute mapping and Invite-only caveats

6. Add virtual workspaces (optional advanced control)
- Define ACE taxonomy and IdP group mapping
- Configure ACL behavior for new and existing fact sheets

---

## 4. Core Role and Permission Model

### 4.1 Standard Roles

- Viewer: view/subscribe/comment on fact sheets
- Member: viewer capabilities plus create/edit fact sheets
- Admin: member capabilities plus workspace administration

Important constraint:

- Standard roles cannot be deleted.

### 4.2 Custom Roles

Custom roles are available only when roles are managed externally in IdP.

Key mechanics:

- Standard role is still required for workspace access
- Custom role permissions take precedence over standard role permissions
- If multiple custom roles are assigned, permissions are aggregated
- Custom role assignment happens in IdP, not directly in LeanIX

### 4.3 Permission Domains

Role permissions are split into two domains:

1. Fact-sheet permissions
- Configured in meta model configuration (per fact-sheet type/section/field/relation controls)

2. Non-fact-sheet permissions
- Configured in User Roles and Permissions
- Includes modules such as KPIs, Portals, Surveys, Collections, Diagram Templates, Presentations, Discovery Inbox, Architecture Decisions, SBOM, Tech Stack Discovery, Transformations, and Developer Tools

Governance recommendation from SAP docs:

- Avoid granting full permissions broadly; assign only what each role requires to preserve data quality and reduce accidental changes.

---

## 5. Managing Users Without SSO

### 5.1 Invitation Flow

- Admin invites users from user-profile menu
- Role selected at invitation time
- Invitation email triggers account onboarding

### 5.2 Role Changes

- Admin can change user role in Users section
- Role update becomes effective on next sign-in

### 5.3 Deactivation

- Users are archived, not deleted
- Archive revokes access to that workspace while preserving access elsewhere if applicable

---

## 6. Managing Users With SSO

### 6.1 SSO Protocol and Flow

- LeanIX supports SAML 2.0
- SP-initiated authentication flow
- IdP sends user attributes; LeanIX verifies assertion and grants access
- JIT provisioning is supported for first-time sign-in account creation

### 6.2 Role Management Options with SSO

Option A: Roles managed within LeanIX

- IdP handles authentication
- LeanIX handles authorization
- Admin may set a default role for newly signed-in users
- If no default role, users must be manually invited

Option B: Roles managed in IdP

- IdP handles both authentication and authorization
- Role claims can overwrite existing LeanIX role assignments
- Custom roles become available

### 6.3 Critical Role Resolution Scenarios (IdP-Managed Authorization)

1. IdP sends role
- IdP role overwrites existing LeanIX role

2. IdP does not send role, LeanIX default role exists
- Default role is assigned and can overwrite current role

3. IdP does not send role, no default role configured
- User loses workspace access

### 6.4 Invite-Only with SSO

If Invite-only flow is enabled:

- IdP access is not sufficient by itself
- User also needs explicit LeanIX invitation to enter the workspace

---

## 7. SSO Attribute Mapping and Identity Semantics

### 7.1 Required SAML Attributes

- firstname
- lastname
- uid (email-format unique identifier)
- email

### 7.2 Optional Authorization and Scope Attributes

- role: ADMIN, MEMBER, VIEWER
- customer_roles: custom role identifiers
- ace: virtual workspace access control entity IDs

Behavior notes:

- If multiple role values are sent, LeanIX applies highest privilege among standard role values
- Custom role labels/technical names must align with IdP mappings
- ACE values must exactly match configured access control entity IDs

### 7.3 Validation Guidance

- Use SAML tracing tools to inspect outbound IdP assertions
- Verify attribute names, value casing, and expected role/ACE semantics before production rollout

---

## 8. SCIM Provisioning Deep Dive

### 8.1 Purpose and Relationship to SSO

SCIM handles user lifecycle synchronization. SSO handles authentication and authorization checks during sign-in.

SCIM lifecycle actions:

- Provision user records
- Deprovision (archive) user records
- Update user profile and role metadata

### 8.2 Synchronized Attributes

During sync, LeanIX can update:

- Given name
- Family name
- Email
- Username
- Role/custom roles/ACE values (if applicable)
- Department (if applicable)

### 8.3 Limitations

- SCIM configuration is workspace-specific
- No cross-workspace SCIM synchronization
- If Invite-only SSO flow is enabled, SCIM does not create user permissions

### 8.4 SCIM Setup Procedure

1. Create technical user (Admin role) and capture API token
2. Request ACCOUNTADMIN for technical user via support channel
3. Use API token to obtain short-lived access token
4. Use short-lived token to create long-lived SCIM token
5. Configure IdP SCIM endpoint and token
6. Configure IdP attribute mapping and enable sync jobs

SCIM endpoint format:

- https://{SUBDOMAIN}.leanix.net/services/mtm/v1/scim/v2

### 8.5 Token Model for SCIM

Short-lived token:

- Generated via OAuth2 client_credentials using technical user API token
- Valid for about 3600 seconds

Long-lived token:

- Created via MTM long-lived bearer token API
- No fixed expiration; valid until deactivated
- Contains SCIM workspace binding and default permission role
- Token value shown once at creation; must be securely stored

Operational controls:

- List existing long-lived tokens
- Deactivate token by token ID when rotating or responding to incidents

---

## 9. Users Overview and Lifecycle Operations

### 9.1 User Statuses in Admin UI

- All
- Active
- Invited
- Requested (when admin invitation mode is enabled by support)
- Not invited (contacts)
- Archived

Important nuance:

- Counts may include technical users even if they are not listed in standard user tables.

### 9.2 Contact Model (Not Invited)

Contacts are non-workspace users referenced as subscribers.

Properties:

- Can be subscribers
- No role assignment
- No workspace access
- Can be invited later (individually or in bulk)

### 9.3 User Detail Controls

Per user, admins can:

- Review profile/status/role/last-login
- Archive user
- Change role (depending on SSO authorization mode)
- Inspect fact-sheet subscriptions

---

## 10. Virtual Workspaces and Fine-Grained Access Control

### 10.1 What Virtual Workspaces Are

Virtual workspaces are fact-sheet access filters inside a single workspace. They do not replace core user roles.

Key outcome:

- User role defines capability type (view/edit/admin)
- Virtual workspace scope defines which fact sheets those capabilities apply to

### 10.2 Prerequisites

- Feature activation through SAP LeanIX support/contract
- SSO required
- Roles managed in IdP
- Ability to add SSO attributes (especially ace)

### 10.3 Access Control Components

- Access control entities (ACEs): logical scopes like region or department
- User ACE assignments: usually delivered via IdP groups and SAML claims
- Fact-sheet ACL assignments: read/write ACE restrictions on records
- ACL evaluation: user ACEs compared with fact-sheet ACE restrictions

### 10.4 Role Interaction Rules

- Viewer: sees only permitted fact sheets; no editing
- Member: can edit within permitted scope; new fact sheets inherit access context
- Admin: can view/edit all fact sheets and configure access controls globally

### 10.5 Configuration Pattern

1. Define ACE taxonomy and group model
2. Create ACEs in LeanIX (uppercase IDs, no spaces)
3. Add ace attribute in IdP and map to groups
4. Validate assertions (SAML tracer/profile checks)
5. Configure global access behavior for new fact sheets
6. Backfill existing fact sheets via import/table/manual assignment

### 10.6 Operational Caveats

- Virtual workspace restrictions apply to fact sheets only
- Diagrams/reports may still expose references to restricted fact sheets
- Admin-created fact sheets require explicit access settings to avoid unintended broad visibility

---

## 11. UAM Operating Patterns by Maturity Stage

### 11.1 Early Stage

- Start with direct invitations and standard roles
- Keep role matrix simple
- Introduce SSO once user volume grows

### 11.2 Growth Stage

- Centralize authentication via SSO
- Decide and document source of truth for authorization
- Begin custom role strategy if needed

### 11.3 Scale Stage

- Enable SCIM for lifecycle automation
- Enforce token governance for technical users
- Introduce virtual workspaces for strict segmentation
- Formalize periodic access reviews and role recertification

---

## 12. Common Failure Modes and Mitigations

1. Role-source ambiguity (LeanIX vs IdP)
- Mitigation: explicitly define source of truth for authorization and test role-overwrite scenarios before rollout.

2. Missing role claims with no default role
- Mitigation: configure a safe default role or enforce role-claim integrity in IdP.

3. Invite-only + SCIM misunderstanding
- Mitigation: document that SCIM won’t create permissions in Invite-only mode; maintain invite workflow.

4. Attribute mismatch (case/name/value)
- Mitigation: enforce uppercase/identifier conventions and validate with SAML traces.

5. Long-lived token exposure risk
- Mitigation: treat as secret, store in secret manager, rotate and invalidate during offboarding/incidents.

6. Overly complex ACE model
- Mitigation: keep ACE taxonomy minimal and aligned with organizational boundaries to reduce maintenance burden.

7. Unrestricted admin-created records in virtual workspaces
- Mitigation: enforce admin checklist to set ACL values during creation and run periodic ACL audits.

---

## 13. Practical UAM Control Checklist

Identity and authentication:

- SSO protocol and IdP ownership documented
- Required SAML attributes validated
- Default-role behavior decided

Authorization:

- Role matrix approved (standard and optional custom roles)
- Non-fact-sheet permissions reviewed
- Fact-sheet permissions aligned in meta model

Provisioning:

- SCIM enabled where required
- Attribute mapping tested
- Invite-only behavior explicitly accounted for

Scope controls:

- ACE taxonomy documented
- IdP group mapping completed
- Global ACL defaults configured
- Existing fact sheets backfilled

Operations and security:

- Access review cadence defined
- Technical user and token rotation policy defined
- Token revocation runbook available

---

## 14. Source Index

Primary requested source:

- https://help.sap.com/docs/leanix/ea/user-and-access-management

Primary linked pages used in this synthesis:

- https://help.sap.com/docs/leanix/ea/set-up-user-access
- https://help.sap.com/docs/leanix/ea/managing-users
- https://help.sap.com/docs/leanix/ea/users-overview
- https://help.sap.com/docs/leanix/ea/user-roles-and-permissions
- https://help.sap.com/docs/leanix/ea/single-sign-on-sso
- https://help.sap.com/docs/leanix/ea/sso-attribute-overview
- https://help.sap.com/docs/leanix/ea/scim-provisioning
- https://help.sap.com/docs/leanix/ea/access-tokens-required-for-scim
- https://help.sap.com/docs/leanix/ea/virtual-workspaces
- https://help.sap.com/docs/leanix/ea/virtual-workspaces-configuration
