# ADR-003: Authentication and Session Management

**Status:** Accepted  
**Date:** 2026-05-12  
**Decision:** Better Auth

## Context

VantageMap requires authentication that supports:

- Email/password sign-up and login for MVP
- OAuth 2.0 social providers (GitHub, Google, Microsoft) for convenience
- Session management (database-backed sessions for security and revocability)
- Technical user/API token support for machine-to-machine integrations
- SAML 2.0 SSO path for enterprise identity federation (Post-MVP, Phase 14)
- RBAC integration with workspace-scoped roles
- Next.js 16 App Router and middleware compatibility
- Zero-cost (self-hosted, no external auth service)
- Open-source license

## Options Evaluated

### 1. Better Auth

| Criterion          | Assessment                                                           |
| ------------------ | -------------------------------------------------------------------- |
| License            | MIT                                                                  |
| Framework support  | Framework-agnostic; official Next.js integration                     |
| Auth methods       | Email/password, OAuth (80+ providers), Magic Link, Passkeys/WebAuthn |
| Session strategy   | Database-backed sessions (secure, revocable)                         |
| Database adapters  | Built-in Kysely adapter + Drizzle adapter + Prisma adapter           |
| RBAC/Organizations | Built-in plugin for organizations, roles, permissions                |
| API tokens         | Bearer token plugin for machine-to-machine                           |
| SAML SSO           | Enterprise SSO plugin (SAML, OIDC)                                   |
| Two-factor auth    | Built-in TOTP, backup codes, SMS                                     |
| Rate limiting      | Built-in rate limiter                                                |
| Schema management  | CLI auto-generates/migrates database schema                          |
| Cost               | Free (self-hosted, open-source)                                      |
| TypeScript         | Fully typed client and server APIs                                   |
| AI familiarity     | Growing rapidly; official AI resources, MCP server, LLMs.txt         |

### 2. Auth.js (NextAuth v5)

| Criterion          | Assessment                                               |
| ------------------ | -------------------------------------------------------- |
| License            | ISC                                                      |
| Framework support  | Next.js first-class, also SvelteKit, Express             |
| Auth methods       | OAuth (80+ providers), Magic Link, Credentials (limited) |
| Session strategy   | JWT default, database sessions optional                  |
| Database adapters  | Drizzle, Prisma, Kysely, and more                        |
| RBAC/Organizations | **None built-in** — must build from scratch              |
| API tokens         | **None built-in** — must build from scratch              |
| SAML SSO           | Via BoxyHQ SAML provider (external dependency)           |
| Two-factor auth    | **None built-in**                                        |
| Rate limiting      | **None built-in**                                        |
| Cost               | Free (self-hosted)                                       |
| TypeScript         | Good typing but some rough edges in v5 beta              |
| AI familiarity     | Very high — widely used in tutorials                     |

**Concerns:**

- Auth.js has been in v5 beta for 2+ years; now merged into Better Auth as of 2026
- **Credentials provider is intentionally limited** — Auth.js discourages email/password auth
- No built-in RBAC, organizations, API tokens, 2FA, or rate limiting
- Building these features from scratch contradicts the vibe-coding approach
- The project has officially joined Better Auth, making Better Auth the successor

### 3. Clerk

| Criterion          | Assessment                                |
| ------------------ | ----------------------------------------- |
| License            | Proprietary                               |
| Cost               | Free tier (10K MAU), then paid            |
| Framework support  | Next.js first-class                       |
| Features           | Complete auth solution with UI components |
| RBAC/Organizations | Built-in organizations and roles          |

**Disqualified:** Proprietary, not open-source. Vendor lock-in. Free tier has limits that may be reached during MVP testing. Against open-source-first principle.

### 4. Auth0

| Criterion | Assessment                        |
| --------- | --------------------------------- |
| License   | Proprietary                       |
| Cost      | Free tier (25K MAU), then paid    |
| Features  | Complete enterprise auth platform |

**Disqualified:** Proprietary, vendor lock-in. While feature-rich, it violates the open-source-first constraint. The free tier is generous but creates dependency on Okta's commercial platform.

### 5. Custom JWT Implementation

| Criterion     | Assessment                                                        |
| ------------- | ----------------------------------------------------------------- |
| Cost          | Free                                                              |
| Flexibility   | Full control                                                      |
| Security risk | **Very high** — auth is the #1 source of security vulnerabilities |

**Disqualified:** Building auth from scratch is an anti-pattern for vibe coding. AI agents are likely to introduce subtle security flaws in custom auth implementations. The OWASP guidance is clear: use proven auth libraries.

## Decision

**Better Auth** is selected for authentication and session management.

## Rationale

```
                ┌─────────────────────────────────────────────────┐
                │           Decision Matrix (1-5)                 │
                ├──────────────────────┬────────┬───────┬─────────┤
                │                      │ Better │Auth.js│ Clerk   │
                │                      │ Auth   │  v5   │         │
                ├──────────────────────┼────────┼───────┼─────────┤
                │ Email/password       │   5    │   2   │   5     │
                │ OAuth providers      │   5    │   5   │   5     │
                │ Session management   │   5    │   4   │   5     │
                │ RBAC / Orgs          │   5    │   1   │   5     │
                │ API tokens           │   5    │   1   │   4     │
                │ SAML SSO path        │   5    │   3   │   4     │
                │ 2FA                  │   5    │   1   │   5     │
                │ Rate limiting        │   5    │   1   │   5     │
                │ Drizzle integration  │   5    │   4   │   2     │
                │ Open-source          │   5    │   5   │   1     │
                │ Zero-cost            │   5    │   5   │   3     │
                │ AI familiarity       │   4    │   5   │   4     │
                │ Active maintenance   │   5    │   3   │   5     │
                ├──────────────────────┼────────┼───────┼─────────┤
                │ TOTAL                │  64    │  40   │  53     │
                └──────────────────────┴────────┴───────┴─────────┘
```

### Key factors:

1. **Batteries included** — RBAC, organizations, API tokens, 2FA, rate limiting, and SAML are all built-in plugins. This eliminates weeks of custom auth code that would be error-prone in vibe coding.

2. **Auth.js succession** — Auth.js (NextAuth) officially joined Better Auth in 2026. Better Auth is the maintained successor with a migration path from Auth.js.

3. **Drizzle-native** — Better Auth has a first-class Drizzle adapter that auto-generates schema. This pairs perfectly with ADR-002.

4. **Database sessions** — Sessions stored in PostgreSQL (ADR-001), making them revocable and auditable. No JWT-only sessions that can't be invalidated.

5. **Enterprise SSO path** — SAML and OIDC are available as plugins for Phase 14, no architectural migration needed.

6. **Security-first** — Built-in rate limiting, CSRF protection, secure session handling, and password hashing. Reduces security risk from AI-generated auth code.

7. **Vibe-coding optimized** — Better Auth provides official AI resources (LLMs.txt, MCP server) specifically designed for AI-assisted development.

### Architecture integration:

```
┌──────────────────────────────────────────────────────┐
│                    Next.js App                        │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐│
│  │ Server       │  │ API Route   │  │ Middleware    ││
│  │ Components   │  │ Handlers    │  │ (auth check)  ││
│  └──────┬───────┘  └──────┬──────┘  └──────┬───────┘│
│         │                 │                 │        │
│         └─────────┬───────┴─────────┬───────┘        │
│                   │                 │                 │
│           ┌───────▼───────┐ ┌──────▼────────┐        │
│           │  Better Auth  │ │ Better Auth   │        │
│           │   (server)    │ │  (client)     │        │
│           └───────┬───────┘ └───────────────┘        │
│                   │                                   │
│           ┌───────▼───────┐                           │
│           │ Drizzle ORM   │                           │
│           │  (adapter)    │                           │
│           └───────┬───────┘                           │
│                   │                                   │
└───────────────────┼──────────────────────────────────┘
                    │
            ┌───────▼───────┐
            │  PostgreSQL   │
            │  (sessions,   │
            │   users,      │
            │   accounts)   │
            └───────────────┘
```

### Plugin roadmap:

| Phase    | Better Auth Plugin           | Purpose                          |
| -------- | ---------------------------- | -------------------------------- |
| Phase 4  | Core (email/password, OAuth) | Basic authentication             |
| Phase 10 | Organization, Admin          | User management, workspace roles |
| Phase 11 | Bearer (API tokens)          | Technical user support           |
| Phase 14 | Enterprise SSO (SAML)        | Enterprise identity federation   |
| Phase 14 | Two-Factor                   | Additional security              |

## Consequences

- Auth schema tables (`user`, `session`, `account`, `verification`) are managed by Better Auth's Drizzle adapter
- Phase 3.8 user/role tables integrate with Better Auth's organization plugin schema
- Phase 4.2 auth middleware uses Better Auth's `auth()` server-side helper
- Phase 4.3 RBAC builds on Better Auth's organization roles (not custom RBAC from scratch)
- Phase 10 user management UI uses Better Auth's admin API endpoints
- Phase 14 SAML SSO is a plugin addition, not an architectural change
