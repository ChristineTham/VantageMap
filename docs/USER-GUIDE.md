# SAP LeanIX User Guides - Deep Research Documentation

> Requested source: https://help.sap.com/docs/leanix/ea/user-guides
> Research scope: user-guides landing behavior, role guides, access management, inventory operations, collaboration, and data quality workflows
> Last reviewed: April 2026

---

## 1. Scope and Navigation Notes

### 1.1 Observed Landing Behavior

At the time of research, the URL https://help.sap.com/docs/leanix/ea/user-guides resolved to Getting Started-oriented content rather than a separate standalone "User Guides" index page with explicit categories.

Because of that, this document compiles the practical user-guide corpus by following:

1. The observed landing page content and links
2. Role-specific guides linked from that flow
3. Access and identity management guides
4. Day-to-day inventory and fact-sheet operation guides
5. Collaboration and data-quality governance guides

### 1.2 What This Document Provides

This guide is a consolidated operational map for SAP LeanIX usage across:

- End users (application owners, business owners, contributors)
- Enterprise architects
- Workspace admins and access administrators

It combines user actions, governance mechanics, and recommended sequencing.

---

## 2. Foundational User-Guide Concepts

### 2.1 Fact Sheets as the Core UX Unit

SAP LeanIX is centered on fact sheets, each representing an architectural object (application, business capability, IT component, etc.).

Key practical implications for users:

- Most workflows begin in Inventory and end with fact-sheet updates
- Data quality depends on ownership and recurring validation
- Relationships between fact sheets are as important as fields

### 2.2 Typical Fact Sheet Layout (User Perspective)

Per documentation, users interact with four zones:

1. Header: key metadata, quality seal, subscription, quick actions
2. Body: structured sections for attributes and relations
3. Tabs: fact sheet details, subscriptions, comments, to-dos, resources, metrics/surveys/history
4. Right-side panel: integrations, to-dos, recently viewed items, related diagrams

### 2.3 Why User Guides Emphasize Collaboration

SAP LeanIX documentation repeatedly frames EA data maintenance as distributed work:

- Architects design governance
- Owners and domain experts provide/validate data
- Subscribers review quality changes
- Surveys and comments replace ad-hoc email loops

---

## 3. Role-Based Guide Paths

### 3.1 Enterprise Architect Path

From the enterprise-architect guide, the recommended flow is:

1. Access workspace and establish admin baseline
2. Understand meta model and modeling conventions
3. Select and prioritize use cases (starting with Application Portfolio Assessment)
4. Define and execute data ingestion strategy
5. Assign subscription roles and run recurring data collection

Key responsibilities:

- Set realistic onboarding scope
- Build relation backbone early
- Establish responsibility/accountability in subscriptions
- Transition from initial inventory to recurring governance operations

### 3.2 Application and Business Owner Path

From the application/business-owner guide, the primary user workflow is:

1. Access workspace and complete profile
2. Find relevant fact sheets using inventory search/filter
3. Open and review details across fact-sheet tabs
4. Update assigned fields and relationships
5. Use collaboration tools (comments, surveys, quality review)

Role-oriented focus examples:

- Application owners: lifecycle, fit, criticality, dependencies
- Business owners: capability context and business alignment
- Data architects: data object and relation quality

---

## 4. Access and Identity User Guides

### 4.1 Set Up User Access (Admin Onboarding)

The setup guide defines a practical order:

1. Decide authentication/authorization model
2. Access workspace and identify primary admins
3. Invite core team manually first
4. Configure SSO for centralized access (recommended)
5. Optionally configure SCIM synchronization
6. Adjust role permissions

Standard roles:

- Viewer: view, subscribe, comment
- Member: create/edit fact sheets
- Admin: member rights + workspace administration

### 4.2 User and Access Management (Operational Summary)

The overview emphasizes progressive maturity:

- Start with manual invitations and standard roles
- Move to SSO for centralized authentication
- Add SCIM for lifecycle automation
- Use virtual workspaces and role controls for segmentation

### 4.3 User Roles and Permissions (Detailed Model)

Core model:

- Standard roles always exist
- Custom roles are possible when role management is externalized to IdP via SSO
- A standard role is still required; custom role takes precedence
- Multiple custom roles aggregate permissions

Permission domains:

1. Fact-sheet permissions (meta model configuration)
2. Non-fact-sheet permissions (user roles/permissions admin section)

Non-fact-sheet permission examples include:

- Surveys
- Portals
- Presentations
- Transformations
- Architecture decisions
- SBOM and tech-stack discovery
- Developer tools / GraphQL access

Best-practice note from docs:

- Grant broad write permissions sparingly to protect data quality.

### 4.4 SSO Guide (Authentication and Authorization Patterns)

Protocol support documented:

- SAML 2.0

Supported model patterns:

1. Authentication via SSO, authorization managed in LeanIX
2. Authentication and authorization both managed in IdP

Additional SSO capabilities:

- Just-in-time provisioning on first login
- Default role assignment behaviors when role data is/ is not sent by IdP
- Transient users for self-service portal access without full workspace access

Important operational scenarios documented:

- IdP role can overwrite LeanIX-assigned role on login
- If IdP sends no role and no default role exists, user loses access
- Transient users are useful for broad portal sharing but require careful role and directory setup

### 4.5 SCIM Provisioning (Lifecycle Automation)

SCIM purpose in LeanIX:

- Provision users
- Deprovision users
- Update user profile attributes

Synchronized attributes include:

- First/last name
- Email
- Username
- Role/custom roles/ACEs (where applicable)
- Department (where applicable)

Key limitations documented:

- SCIM is configured per workspace
- Not a multi-workspace synchronization mechanism
- Invite-only + SSO flow can affect permission creation behavior

Configuration highlights:

1. Create technical user and obtain API token
2. Request ACCOUNTADMIN role for technical user via support process
3. Generate short-lived then long-lived token
4. Configure IdP provisioning endpoint and token
5. Configure attribute mappings
6. Enable synchronization in IdP

Reference endpoint format:

- https://{SUBDOMAIN}.leanix.net/services/mtm/v1/scim/v2

---

## 5. Personal Account User Guide

### 5.1 User Profile Operations

Users can manage:

- Profile details (name, email visibility, role visibility context)
- Workspace language
- Profile picture

Password management:

- Password change and reset apply only to local credential login
- SSO users rely on IdP-side credential management

Operational relevance:

- Profile setup is one of the first onboarding tasks for contributors
- Notification and language settings affect collaboration responsiveness

---

## 6. Inventory and Fact-Sheet Operations

### 6.1 Searching and Filtering in Inventory

Documented capabilities include:

- Global search with suggestions
- Smart search via Add Filter
- Full-text search
- Filter search and filter-group discovery
- Show/hide filter groups to tailor UI
- Save and share search configurations
- Jump from filtered inventory result to relevant reports

Important caveat in docs:

- Search results in memory expire after 5 minutes; users may need to re-run searches.

### 6.2 Natural Language Filtering (AI-enabled Workspaces)

If AI capabilities are enabled, users can issue natural-language filter requests.

Examples include questions like:

- Which applications are used in specific regions?
- Which software is out of lifecycle?
- Which data objects are sensitive?

This lowers entry barriers for non-expert users and speeds ad-hoc exploration.

### 6.3 Adding and Editing Data in Fact Sheets

Base editing flow:

1. Hover section
2. Click Add/Edit
3. Enter values
4. Save (or Save & Next)

Rich text support includes formatting and links.

Efficiency features:

- Section navigator
- In-page field/section search
- Link-to-section sharing

### 6.4 Relation Management

Supported patterns:

- Add relations one by one
- Add relations in bulk via filter-based selection
- Edit single or multiple relations
- Delete relation entries
- Leave relation empty intentionally (counts for completion and can be filtered)

Advanced relation controls:

- Constraining relations (higher granularity, higher maintenance)
- Relation fields editable across multiple selected targets simultaneously

Best-practice emphasis in docs:

- Start without constraints unless needed to avoid maintenance overhead.

### 6.5 Bulk Update Options

Users/admins can update at scale via:

- Inventory table view inline editing
- Excel import/export workflows

This is crucial for initial baseline loading and periodic mass updates.

### 6.6 AI-Powered Data Recommendations

In supported contexts, LeanIX provides recommendations for:

- Fact-sheet descriptions
- Application-to-business-capability relations

Behavior highlights:

- Recommendations are reviewed in the Recommendations tab
- Users can accept or undo before finalizing
- Business capability recommendations rely on sufficient application description context

---

## 7. Collaboration User Guides

### 7.1 Surveys

Survey value proposition:

- Structured multi-stakeholder data collection
- Reduced manual follow-ups
- Direct integration of responses into fact-sheet data

Governance model:

- Admins can create/manage surveys
- Rights can be delegated to non-admins if configured

Survey lifecycle (from detailed guide index):

1. Create survey
2. Send to selected recipients
3. Collect responses
4. Manage runs/results centrally
5. Re-run, restart, finish, or delete runs as needed

Advanced options:

- Safety controls for notifications
- API-based management
- Calculated fields using JavaScript

### 7.2 Subscriptions, Comments, and To-Dos

Role in user workflows:

- Subscriptions define responsibility and notification pathways
- Comments support clarification/change requests without direct data editing
- To-dos support actionable follow-up on fact-sheet maintenance

These mechanisms are repeatedly referenced as core to scaling collaborative data quality.

---

## 8. Data Quality Governance User Guides

### 8.1 Quality Seal Mechanism

Quality seal establishes explicit accountability for data correctness.

When seal breaks:

- Fact sheet shows Check needed
- Responsible/accountable subscribers are expected to review and approve

### 8.2 Default Breaking Rules (As Documented)

- Admin edits do not break quality seal
- Responsible/accountable member edits generally do not break quality seal
- Non-responsible/non-accountable member edits can break seal
- Viewer cannot break seal (no edit rights)

Changes that break seal include attribute and relation changes; actions in subscriptions/comments/metrics/surveys do not.

### 8.3 Quality Seal States

Documented states:

- Check needed
- Approved
- Draft (optional)
- Rejected (optional)

Admin controls include:

- Enable/disable quality seal by fact-sheet type
- Configure renewal interval for periodic reassessment
- Enable additional states

### 8.4 Notifications

When quality seal breaks, responsible/accountable subscribers are notified via configured channels.

This closes the loop between editing events and accountable review.

---

## 9. Practical End-to-End User Journeys

### 9.1 New Contributor Journey

1. Receive invite or SSO access
2. Complete profile settings
3. Learn inventory search/filter basics
4. Open assigned fact sheets
5. Update fields and relations
6. Respond to surveys/comments
7. Monitor subscriptions and data-quality signals

### 9.2 Enterprise Architect Journey

1. Configure access model and role governance
2. Define data scope and import strategy
3. Assign subscription roles
4. Launch surveys for enrichment
5. Monitor completion and quality seal states
6. Iterate with reports and use-case programs

### 9.3 Admin Identity Governance Journey

1. Start with manual invitations and standard roles
2. Introduce SSO and decide role-authority location
3. Add custom roles if managed in IdP
4. Enable SCIM for lifecycle sync
5. Regularly review role permissions and edge-case access scenarios

---

## 10. Common Pitfalls and Mitigations

1. Treating "user guides" as only end-user clicks
- Mitigation: include identity and role governance since user experience depends on access model.

2. Over-granting write permissions
- Mitigation: keep least-privilege role design and adjust by business need.

3. Ignoring subscription/accountability model
- Mitigation: define responsible/accountable subscriptions early.

4. Heavy relation constraints too early
- Mitigation: start simple, constrain only where business-critical.

5. Assuming SCIM replaces SSO
- Mitigation: treat SCIM as lifecycle sync and SSO as auth/authz gateway.

6. Not defining default-role behavior for SSO edge cases
- Mitigation: document role-mapping scenarios to avoid accidental lockouts.

---

## 11. Suggested Structure for Internal Team Enablement

Use this documentation set in onboarding order:

1. Getting Started and role guide (architect or contributor)
2. Set Up User Access and User Roles/Permissions
3. SSO and SCIM (if enterprise identity integration is required)
4. Inventory search/filter guide
5. Fact-sheet editing and relation management guide
6. Surveys and quality seal governance

This sequence mirrors how teams move from initial access to repeatable data governance.

---

## 12. Source Index

Requested landing URL:

- https://help.sap.com/docs/leanix/ea/user-guides

Core pages used in this synthesis:

- https://help.sap.com/docs/leanix/ea/getting-started
- https://help.sap.com/docs/leanix/ea/for-enterprise-architects
- https://help.sap.com/docs/leanix/ea/for-application-and-business-owners
- https://help.sap.com/docs/leanix/ea/set-up-user-access
- https://help.sap.com/docs/leanix/ea/user-and-access-management
- https://help.sap.com/docs/leanix/ea/user-profile
- https://help.sap.com/docs/leanix/ea/user-roles-and-permissions
- https://help.sap.com/docs/leanix/ea/single-sign-on-sso
- https://help.sap.com/docs/leanix/ea/scim-provisioning
- https://help.sap.com/docs/leanix/ea/fact-sheets
- https://help.sap.com/docs/leanix/ea/searching-and-filtering-in-inventory
- https://help.sap.com/docs/leanix/ea/adding-and-editing-data-in-fact-sheets
- https://help.sap.com/docs/leanix/ea/surveys
- https://help.sap.com/docs/leanix/ea/quality-seal
