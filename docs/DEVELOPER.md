# SAP LeanIX Developer Guide - Deep Research Documentation

> Primary source: https://help.sap.com/docs/leanix/ea/developer-guide
> Scope: Developer Guide landing page plus linked technical references and tutorials (Basics, APIs, Reporting Framework/CLI, MCP, integrations, authentication, and selected implementation guides)
> Last reviewed: April 2026

---

## 1. What the Developer Guide Covers

The SAP LeanIX Developer Guide is the entry point for building programmatic integrations and developer workflows around LeanIX data.

The top-level page positions five primary tracks:

- Basics
- Guides and Tutorials
- SAP LeanIX APIs
- Reporting Framework and CLI
- MCP Server

The landing page itself is intentionally high-level. Operational details are spread across linked guides, which are consolidated in this document.

---

## 2. Developer Capability Map

### 2.1 Core Building Blocks

1. Authentication and credentials
- Technical users issue API tokens
- OAuth 2.0 exchange provides short-lived access tokens

2. API interaction models
- REST APIs for broad platform resources
- GraphQL API for fact sheets and relations
- Integration API for LDIF-based connector processing
- Webhooks for event-driven integrations

3. Tooling and implementation surfaces
- OpenAPI Explorer for REST endpoints
- GraphiQL for schema/query exploration
- Reporting Framework + CLI for custom reports
- MCP server for AI-client tool invocation

### 2.2 Typical Outcomes Supported

- Import/export data with external systems
- Automate workflows and notifications
- Build custom reports and dashboards
- Integrate LeanIX into AI-assisted workflows

---

## 3. Getting Started Path for Developers

Recommended sequence synthesized from the docs:

1. Determine integration type and constraints
- Real-time events vs scheduled sync
- Build-vs-configure preference
- Data domains (fact sheets, users, surveys, metrics)

2. Establish authentication baseline
- Create technical user
- Secure API token handling
- Implement OAuth token acquisition and refresh

3. Select API/model per use case
- GraphQL for fact-sheet-centric querying/updating
- REST for non-fact-sheet resources and admin operations
- Integration API for LDIF connector pipelines
- Webhooks for asynchronous event triggering

4. Add developer tooling
- OpenAPI Explorer for REST discovery and testing
- GraphiQL for schema-driven GraphQL development

5. Operationalize
- Logging and error handling
- Permission-scoped technical users
- Token rotation/revocation process

---

## 4. Choosing the Right Integration Technology

The "Choosing a Technology for Your Integration" guide outlines three primary options and trade-offs.

### 4.1 Out-of-the-Box Integrations

Best for:

- Fast adoption with minimal engineering effort
- Common vendor scenarios

Advantages:

- LeanIX manages implementation and maintenance
- Admin-configurable in product UI

Limitations:

- Scope may not match specialized requirements
- Sync cadence depends on specific integration capabilities

### 4.2 Custom Integration with GraphQL/REST/Webhooks

Best for:

- High flexibility and custom logic
- Team-controlled engineering lifecycle

Advantages:

- Precise control over integration behavior and cadence
- Broad ecosystem tooling support

Limitations:

- Full ownership of development/operations on customer side

### 4.3 Integration API (LDIF + Processors)

Best for:

- Structured data exchange with lower coding burden
- Connector-style mappings and transformation logic

Advantages:

- Reduced need to deeply code against internal LeanIX model
- Config-centric processing model

Limitations:

- Requires LDIF/middleware model
- No true real-time synchronization
- Processor language/UX is different from typical software engineering tooling

---

## 5. Authentication and Credential Model

### 5.1 Authentication Flow

LeanIX APIs use OAuth 2.0 client credentials flow:

1. Create technical user and obtain API token
2. Exchange API token for short-lived OAuth access token
3. Use Bearer access token in API calls

### 5.2 Key Endpoints and Patterns

Token endpoint:

- https://{SUBDOMAIN}.leanix.net/services/mtm/v1/oauth2/token

Request pattern:

- Basic auth username: apitoken
- Basic auth password: API token
- grant_type=client_credentials

Typical response behavior:

- JWT access token
- Expires in about 3600 seconds

### 5.3 Operational Security Guidance

- API tokens are shown once at creation; store securely
- Reuse valid access tokens during lifetime rather than requesting unnecessarily
- Rotate and replace technical user tokens periodically
- Revoke credentials immediately when compromised or decommissioning integrations

---

## 6. Base URL and Endpoint Construction

LeanIX base URL pattern:

- https://{SUBDOMAIN}.leanix.net

This base is customer-specific and should be externalized in configuration.

Service endpoints append to this base by service domain, for example:

- /services/pathfinder/v1/graphql
- /services/mtm/v1/...
- /services/survey/v1/...
- /services/mcp-server/v1/mcp

---

## 7. API Portfolio Deep Dive

### 7.1 REST APIs

Purpose:

- Access broad resources beyond fact sheets (users, workspace settings, surveys, metrics, etc.)

Key tooling:

- OpenAPI Explorer (from workspace: Developer Tools > OpenAPI Documentation)

Use case examples from docs:

- Update user permissions via MTM API
- Retrieve survey data/results via Survey APIs

### 7.2 GraphQL API

Purpose:

- Query and mutate fact sheets and related relationships efficiently

Notable strengths:

- Fetch exactly required fields
- Strongly typed schema
- Suitable for complex relation graphs and report data extraction

Endpoints:

- Standard: https://{SUBDOMAIN}.leanix.net/services/pathfinder/v1/graphql
- Uploads: https://{SUBDOMAIN}.leanix.net/services/pathfinder/v1/graphql/upload

Developer experience:

- GraphiQL in workspace (Developer Tools > GraphQL Editor)
- Docs explorer, history, explorer-based query builder, variable support
- Inventory can export query context as JSON query or open in GraphiQL

Practical best practices from docs:

- Use pagination for large result sets
- Avoid excessive query complexity (complexity limits are enforced)
- Prefer GraphQL for one-off or report-style data pulls; evaluate Integration API for heavier ongoing sync logic

### 7.3 Integration API

Purpose:

- Generic import/export processing through LeanIX Data Interchange Format (LDIF)

Conceptual model:

- Inbound processors transform LDIF into LeanIX commands
- Outbound processors transform LeanIX data into LDIF
- Processor configurations can be managed via UI and API

LDIF essentials:

- Includes connector metadata, workspace/version context, and content array
- Data objects include mandatory id, type, data
- Supports processing mode (PARTIAL/FULL), chunking metadata, custom fields

Advanced capabilities:

- Grouped execution of multiple processor configurations via executionGroups (API-level advanced feature)
- Per-processor logging control (off/warning/debug)
- In-config descriptive comments for maintainability

Cautions:

- Grouped execution merges configs with no cross-config ordering guarantees at same run level
- Conflicting inbound/outbound settings can fail runs

### 7.4 Webhooks

Purpose:

- Near real-time event delivery for event-driven architecture

Delivery modes:

- PUSH: HTTP POST to target URL (recommended)
- PULL: client polling when inbound exposure is not possible

Important operational rules:

- Delivery type cannot be changed after creation
- Event sets and visibility (private/workspace) are configurable
- Event payload examples and event catalogs are documented separately

---

## 8. Reporting Framework and CLI

### 8.1 What It Enables

- Build custom reports embedded in LeanIX context
- Develop, build, upload, and publish reports

Components:

- LeanIX Reporting Framework (library/API integration layer)
- LeanIX Reporting CLI (project lifecycle tooling)

### 8.2 Developer Requirements

Recommended knowledge:

- Command-line workflows
- JavaScript framework usage
- GraphQL and REST API fundamentals

### 8.3 Typical Report Development Pattern

1. Initialize report project with CLI
2. Implement data access and visualization logic
3. Test against workspace data
4. Upload to workspace or publish to LeanIX Store

---

## 9. MCP Server for AI-Driven Integrations

### 9.1 Purpose

The MCP server exposes selected LeanIX capabilities as discoverable tools for AI clients.

Value proposition:

- Standardized tool metadata (inputs, outputs, descriptions)
- Consistent way for LLM-based assistants to call LeanIX capabilities

### 9.2 Connection Essentials

Endpoint:

- https://{SUBDOMAIN}.leanix.net/services/mcp-server/v1/mcp

Authentication options:

- Authorization: Token {API_TOKEN}
- Basic auth using apitoken:{API_TOKEN}
- Bearer JWT access token

Prerequisites:

- MCP-capable client/runtime
- LeanIX workspace and technical user/API token

### 9.3 Permission and Tool Visibility

- Tool visibility is permission-scoped by role linked to token
- Least privilege is recommended to prevent unintended write-heavy operations

### 9.4 Toolsets and Performance Control

Toolsets query parameter can narrow available tools, for example:

- ?toolsets=inventory
- ?toolsets=inventory,surveys

Constraints:

- Up to 10 toolsets per query
- Toolset names have length limits
- Invalid toolset values return errors

### 9.5 Streaming

- MCP server supports HTTP streaming responses for improved responsiveness in AI workflows.

---

## 10. Technical Users and Token Lifecycle

Technical users are the credential anchor for integrations.

Admin/developer lifecycle operations:

- Create technical user (role + optional custom roles/ACE + expiry)
- Capture API token once at creation
- Replace token (old token immediately invalid)
- Update metadata/expiry
- Delete technical user (token invalidated)

Security practices emphasized in docs:

- Treat token like a password
- Use secure secret storage and secure transfer
- Rotate and monitor token usage

---

## 11. Practical Tutorial Patterns (Developer-Focused)

### 11.1 Importing and Exporting Data

Guidance emphasizes selecting technology by data type:

- Fact sheets: GraphQL or Integration API
- Users: MTM API
- Metrics: Metrics API
- To-dos: To-Do API
- Surveys: Survey API

Alternative channels include:

- Out-of-the-box integrations
- Excel import/export workflows

### 11.2 Updating User Permissions via MTM API

Pattern:

1. Retrieve existing permission object by workspace and filters
2. POST updated permission payload to MTM permissions endpoint

Key semantics:

- One permission object per user per workspace
- Role is single-valued
- Some fields support multi-value (for example custom roles)
- Status changes include ARCHIVED and ACTIVE semantics

### 11.3 Retrieving Survey Results

Current state note:

- Poll API v2 is deprecated; migration to Survey API v1 is required

Tutorial flow:

1. Fetch survey ID
2. Fetch survey run ID
3. Fetch result set (all fact sheets or specific result)

### 11.4 Alerts to Slack and Microsoft Teams

Pattern:

- Configure PUSH webhook for integration run events
- Trigger on run finished/aborted events
- Use callback logic to send only failed-run alerts
- Include sync log deep links for triage

---

## 12. Decision Matrix for Common Developer Scenarios

1. Need to query/update fact sheets and relations interactively
- Choose GraphQL API + GraphiQL

2. Need broad admin/resource operations (users, settings, surveys, metrics)
- Choose REST APIs + OpenAPI Explorer

3. Need configurable connector pipelines and LDIF-based transformations
- Choose Integration API

4. Need near real-time event reactions
- Choose PUSH webhooks

5. Need custom in-product visual analytics
- Choose Reporting Framework + CLI

6. Need AI assistant/tooling integration
- Choose MCP server with scoped toolsets and permissioned technical user

---

## 13. Reliability, Governance, and Security Recommendations

1. Principle of least privilege
- Assign narrow roles to technical users and MCP tokens

2. Credential hygiene
- Rotate API tokens, store secrets in managed vaults, and revoke stale tokens

3. Query and load control
- Use pagination and bounded query complexity in GraphQL

4. Eventing resilience
- Explicitly design retry/error handling for webhook consumers

5. Config governance
- Treat Integration API processor configs as versioned assets with change review

6. Operational observability
- Use synchronization logs, API responses, and webhook delivery diagnostics as standard runbook inputs

---

## 14. Known Constraints and Caveats to Track

- Integration API is not designed for real-time synchronization
- GraphQL complexity limits can reject very large queries
- Webhook delivery type is immutable after creation
- MCP toolset values and counts have strict validation limits
- API token is shown only once at technical-user creation
- Some tutorial content references deprecated Poll API and should be aligned to Survey API v1 over time

---

## 15. Source Index

Primary requested source:

- https://help.sap.com/docs/leanix/ea/developer-guide

Core linked pages used:

- https://help.sap.com/docs/leanix/ea/basics
- https://help.sap.com/docs/leanix/ea/choosing-technology-for-your-integration
- https://help.sap.com/docs/leanix/ea/authentication-to-sap-leanix-services
- https://help.sap.com/docs/leanix/ea/base-url
- https://help.sap.com/docs/leanix/ea/sap-leanix-apis
- https://help.sap.com/docs/leanix/ea/rest-apis
- https://help.sap.com/docs/leanix/ea/graphql-api
- https://help.sap.com/docs/leanix/ea/integration-api
- https://help.sap.com/docs/leanix/ea/webhooks
- https://help.sap.com/docs/leanix/ea/reporting-framework-and-cli
- https://help.sap.com/docs/leanix/ea/custom-reports
- https://help.sap.com/docs/leanix/ea/importing-and-exporting-data
- https://help.sap.com/docs/leanix/ea/updating-user-permissions
- https://help.sap.com/docs/leanix/ea/retrieving-survey-results
- https://help.sap.com/docs/leanix/ea/sending-alerts-to-slack-and-microsoft-teams
- https://help.sap.com/docs/leanix/ea/mcp-server
- https://help.sap.com/docs/leanix/ea/connecting-to-mcp-server
- https://help.sap.com/docs/leanix/ea/overview
- https://help.sap.com/docs/leanix/ea/technical-users
