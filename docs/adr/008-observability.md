# ADR-008: Observability and Monitoring

**Status:** Accepted  
**Date:** 2026-05-12  
**Decision:** Sentry (error tracking) + Pino (structured logging) + OpenTelemetry (tracing)  

## Context

VantageMap requires observability that supports:
- Error tracking with stack traces and context
- Structured JSON logging on all service boundaries
- Distributed tracing across API routes, database queries, and async jobs
- Alerting on latency, error rate, and queue backlog thresholds
- Performance monitoring (p95/p99 latency tracking)
- Zero-cost for MVP

From [nfr.md](../phase-0/nfr.md):
- Structured logs on all service boundaries
- Distributed tracing across API, persistence, and async jobs
- Alerting thresholds for latency, error rate, queue backlog, webhook failures
- Dashboard review in pre-release gate

## Options Evaluated

### 1. Sentry + Pino + OpenTelemetry

| Criterion | Assessment |
|-----------|------------|
| Error tracking | Sentry Free: 5K errors/month, source maps, breadcrumbs |
| Structured logging | Pino: fastest Node.js JSON logger, zero-dep |
| Distributed tracing | OpenTelemetry SDK → Sentry or Grafana Cloud |
| Performance monitoring | Sentry Performance: transaction tracing, p95/p99 |
| Alerting | Sentry alerts on error rate, latency; configurable |
| Next.js integration | `@sentry/nextjs` with App Router support |
| Cost | **Free** — Sentry Free tier + Pino (OSS) + OTel (OSS) |
| AI familiarity | High — Sentry is the most common error tracker in tutorials |
| Vendor lock-in | Low — OTel is vendor-neutral; Sentry can be replaced |

### 2. Datadog

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary |
| Free tier | 14-day trial only — **no sustainable free tier** |
| Features | Excellent — best-in-class APM, logging, tracing, dashboards |
| Cost | Starts at $15/host/month |

**Disqualified:** No free tier. Enterprise pricing violates zero-cost MVP constraint.

### 3. Grafana Cloud Free

| Criterion | Assessment |
|-----------|------------|
| License | AGPL v3 (Grafana), Apache 2.0 (Loki, Tempo, Mimir) |
| Free tier | 10K metrics, 50GB logs, 50GB traces per month |
| Features | Dashboards, alerting, log aggregation, trace visualization |
| Complexity | Requires OpenTelemetry Collector setup; more configuration |
| AI familiarity | Low — complex setup for AI agents |

**Concerns:** Grafana Cloud Free is generous but requires significant setup: OTel Collector configuration, dashboard creation, alert rule authoring. This is operational complexity that doesn't fit the vibe-coding approach for MVP. Better suited as a production upgrade.

### 4. Vercel Analytics + Speed Insights

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary (Vercel platform) |
| Free tier | Included with Vercel Hobby |
| Features | Web Vitals, page-level analytics only |
| Limitations | **No error tracking, no API monitoring, no tracing** |
| Backend visibility | None |

**Disqualified:** Web analytics only. No backend observability, error tracking, or distributed tracing. Insufficient for NFR requirements.

## Decision

**Sentry Free** for error tracking and performance monitoring.  
**Pino** for structured JSON logging.  
**OpenTelemetry SDK** for vendor-neutral instrumentation (traces flow to Sentry).  

Upgrade to **Grafana Cloud** for production dashboards and log aggregation.

## Rationale

```
          ┌──────────────────────────────────────────────────────────┐
          │              Decision Matrix (1-5)                       │
          ├────────────────────┬────────────┬────────┬───────┬───────┤
          │                    │Sentry+Pino │Datadog │Grafana│Vercel │
          │                    │+OTel       │        │Cloud  │Analyt.│
          ├────────────────────┼────────────┼────────┼───────┼───────┤
          │ Error tracking     │     5      │   5    │   3   │   1   │
          │ Structured logging │     5      │   5    │   5   │   1   │
          │ Distributed tracing│     4      │   5    │   5   │   1   │
          │ Alerting           │     4      │   5    │   5   │   1   │
          │ Performance APM    │     4      │   5    │   4   │   2   │
          │ Zero-cost MVP      │     5      │   1    │   4   │   5   │
          │ Setup simplicity   │     5      │   4    │   2   │   5   │
          │ AI familiarity     │     5      │   3    │   2   │   4   │
          │ Vendor neutrality  │     4      │   1    │   5   │   1   │
          ├────────────────────┼────────────┼────────┼───────┼───────┤
          │ TOTAL              │    41      │  34    │  35   │  21   │
          └────────────────────┴────────────┴────────┴───────┴───────┘
```

### Key factors:

1. **Sentry is the standard** — most widely used error tracking in the Next.js ecosystem. AI agents know how to configure `@sentry/nextjs` correctly.
2. **Free tier is sufficient** — 5K errors/month, performance monitoring, and alerting cover MVP needs.
3. **Pino is the fastest** — zero-dependency structured JSON logger; 5x faster than Winston. Works in serverless.
4. **OpenTelemetry is vendor-neutral** — OTel instrumentation works with any backend (Sentry, Grafana, Datadog). No vendor lock-in.
5. **Incremental** — Start with Sentry for errors + Pino for logs. Add Grafana Cloud for dashboards when production observability demands it.

### Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ API Routes   │  │ Server       │  │ Inngest Functions │ │
│  │              │  │ Components   │  │                   │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘ │
│         │                 │                    │            │
│         └────────┬────────┴────────────────────┘            │
│                  │                                           │
│    ┌─────────────▼────────────────┐                          │
│    │  Instrumentation Layer       │                          │
│    │                              │                          │
│    │  @sentry/nextjs  (errors,    │                          │
│    │                   perf)      │                          │
│    │  pino            (structured │                          │
│    │                   JSON logs) │                          │
│    │  @opentelemetry  (traces,    │                          │
│    │                   spans)     │                          │
│    └─────────┬──────────┬─────────┘                          │
│              │          │                                    │
└──────────────┼──────────┼────────────────────────────────────┘
               │          │
    ┌──────────▼───┐  ┌───▼─────────────┐
    │  Sentry      │  │  stdout/stderr  │
    │  (errors,    │  │  (JSON logs)    │
    │   traces,    │  │                 │
    │   perf)      │  │  → Vercel Logs  │
    │              │  │  → Azure Monitor│
    │  Free: 5K    │  │  → Grafana Loki │
    │  errors/mo   │  │                 │
    └──────────────┘  └─────────────────┘
```

### Setup summary:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
});
```

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // JSON output for structured logging
  // Vercel and Azure both capture stdout
});
```

### Production upgrade path:

| Component | MVP | Production |
|-----------|-----|------------|
| Error tracking | Sentry Free | Sentry Team or Business |
| Logging | Pino → stdout → Vercel Logs | Pino → Azure Monitor / Grafana Loki |
| Tracing | OTel → Sentry | OTel → Azure Monitor / Grafana Tempo |
| Dashboards | Sentry dashboard | Grafana Cloud or Azure Monitor |
| Alerting | Sentry alerts | Sentry + Grafana alerting |

## Consequences

- `@sentry/nextjs` wraps the Next.js app for automatic error and performance capture
- `pino` is used for all application logging (API routes, services, async jobs)
- Logs are JSON-structured and written to stdout (platform captures them)
- OpenTelemetry SDK provides vendor-neutral trace context propagation
- No additional infrastructure needed for MVP observability
- Sentry DSN is the only required environment variable for observability
- Production migration adds log shipping to Azure Monitor or Grafana, without changing application code
