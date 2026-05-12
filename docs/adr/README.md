# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) produced during Phase 1 — Tech Stack Research. Each ADR documents a technology evaluation: the problem, options considered, decision, and rationale.

## Index

| ADR                                | Title                                 | Decision                         | Date       |
| ---------------------------------- | ------------------------------------- | -------------------------------- | ---------- |
| [ADR-001](001-database.md)         | Database                              | PostgreSQL 16                    | 2026-05-12 |
| [ADR-002](002-orm.md)              | ORM and Migration Tooling             | Drizzle ORM                      | 2026-05-12 |
| [ADR-003](003-authentication.md)   | Authentication and Session Management | Better Auth                      | 2026-05-12 |
| [ADR-004](004-api-layer.md)        | API Layer Strategy                    | Next.js Route Handlers (REST)    | 2026-05-12 |
| [ADR-005](005-async-processing.md) | Async Job Processing                  | Inngest                          | 2026-05-12 |
| [ADR-006](006-search.md)           | Search Engine                         | PostgreSQL Full-Text Search      | 2026-05-12 |
| [ADR-007](007-hosting.md)          | Hosting and Deployment                | Vercel (MVP), Azure (Production) | 2026-05-12 |
| [ADR-008](008-observability.md)    | Observability and Monitoring          | Sentry + Pino + OpenTelemetry    | 2026-05-12 |

## Decision Criteria

All evaluations applied these cross-cutting criteria from [AGENTS.md](../../AGENTS.md):

1. **Open-source first** — prefer OSS (MIT/Apache/BSD) over commercial at every layer
2. **Zero-cost MVP** — must deploy on free tiers with no monetary cost
3. **Azure production path** — must have a clear upgrade to Azure managed services
4. **Vibe-coding friendly** — well-known to AI coding agents, strong documentation, large community
5. **TypeScript-native** — first-class TypeScript support with strict mode
6. **Next.js 16 compatibility** — works with App Router, Server Components, route handlers

## Status

All ADRs are **accepted** as of 2026-05-12. Decisions take effect starting Phase 2 (Project Bootstrap).
