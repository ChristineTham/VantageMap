# ADR-007: Hosting and Deployment

**Status:** Accepted  
**Date:** 2026-05-12  
**Decision:** Vercel (MVP free tier), Azure App Service (Production)  

## Context

VantageMap needs a hosting platform that supports:
- Next.js 16 App Router with Server Components and route handlers
- Zero-cost deployment for MVP
- Preview deployments for PR review workflows
- Serverless execution (no server management)
- CI/CD integration with GitHub
- Azure upgrade path for production
- 99.5% availability target (from [nfr.md](../phase-0/nfr.md))

## Options Evaluated

### 1. Vercel

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary platform (Next.js is MIT) |
| Next.js 16 support | **First-class** — Vercel is the creator of Next.js |
| Free tier | Hobby plan: 100 GB bandwidth, 100 hrs serverless, unlimited deployments |
| Preview deployments | Automatic on every PR |
| Serverless | Native serverless and edge functions |
| CI/CD | Automatic from GitHub push |
| Custom domains | 1 custom domain on free tier |
| Limitations | 10s function timeout on free tier, 1 team member |
| Azure path | Export to standalone Node.js for Azure App Service |

### 2. Netlify

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary platform |
| Next.js 16 support | Supported via `@netlify/next` adapter, but historically lags Vercel |
| Free tier | 100 GB bandwidth, 300 build minutes/month |
| Preview deployments | Deploy Previews on PRs |
| Serverless | Netlify Functions (AWS Lambda-based) |
| Limitations | Some Next.js features may not work due to adapter translation layer |

**Concerns:** Netlify's Next.js support relies on a translation layer that occasionally breaks with new Next.js features. Less reliable for bleeding-edge Next.js 16.

### 3. Railway

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary platform |
| Next.js 16 support | Full support (runs as Node.js server) |
| Free tier | **Removed** — $5/month minimum (Trial: $5 credit, expires) |
| Preview deployments | Manual setup |
| Execution model | Container-based (not serverless) |

**Disqualified:** No sustainable free tier. $5/month minimum violates zero-cost MVP constraint.

### 4. Fly.io

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary platform |
| Next.js 16 support | Full support via Docker |
| Free tier | 3 shared VMs (256 MB), 160 GB bandwidth |
| Preview deployments | Manual setup |
| Execution model | Container-based with auto-scaling |
| Complexity | Requires Dockerfile, `fly.toml`, manual configuration |

**Concerns:** Fly.io requires Docker knowledge and manual deployment configuration. Higher operational complexity for vibe coding. Less seamless GitHub integration.

### 5. AWS Amplify

| Criterion | Assessment |
|-----------|------------|
| License | Proprietary platform |
| Next.js 16 support | Supported, but historically slower to adopt new features |
| Free tier | 12 months: 1000 build minutes, 15 GB hosting |
| Preview deployments | Supported |
| Complexity | AWS account setup, IAM configuration |

**Concerns:** AWS Amplify's Next.js support lags behind Vercel. AWS account setup and IAM configuration adds friction. Free tier expires after 12 months.

### 6. Self-hosted Docker (VPS)

| Criterion | Assessment |
|-----------|------------|
| License | Open-source (Docker) |
| Next.js 16 support | Full support |
| Free tier | No free VPS options suitable for production |
| Operational burden | **High** — server management, updates, monitoring |

**Disqualified:** No free hosting option. High operational burden contradicts vibe-coding approach.

## Decision

**Vercel Hobby** for MVP. **Azure App Service** for production.

## Rationale

```
          ┌─────────────────────────────────────────────────────────────┐
          │              Decision Matrix (1-5)                          │
          ├─────────────────────┬───────┬────────┬──────┬──────┬───────┤
          │                     │Vercel │Netlify │Fly.io│AWS   │Docker │
          ├─────────────────────┼───────┼────────┼──────┼──────┼───────┤
          │ Next.js 16 support  │   5   │   3    │  4   │  3   │  5    │
          │ Zero-cost MVP       │   5   │   5    │  4   │  3   │  1    │
          │ Preview deployments │   5   │   4    │  2   │  4   │  1    │
          │ Developer experience│   5   │   4    │  3   │  3   │  2    │
          │ CI/CD integration   │   5   │   4    │  3   │  4   │  2    │
          │ Serverless          │   5   │   4    │  3   │  4   │  1    │
          │ Azure upgrade path  │   4   │   3    │  3   │  2   │  4    │
          │ AI familiarity      │   5   │   3    │  2   │  3   │  3    │
          │ Operational burden  │   5   │   4    │  3   │  3   │  1    │
          ├─────────────────────┼───────┼────────┼──────┼──────┼───────┤
          │ TOTAL               │  44   │   34   │  27  │  29  │  20   │
          └─────────────────────┴───────┴────────┴──────┴──────┴───────┘
```

### Key factors:

1. **Next.js 16 first-class support** — Vercel created Next.js. New features work on Vercel first, every time. This eliminates compatibility risk.
2. **Zero-friction deployment** — Push to GitHub → automatic deploy. No Dockerfile, no config files, no CI pipeline setup.
3. **Preview deployments** — Every PR gets a unique URL. Critical for vibe-coding review workflow.
4. **AI familiarity** — Vercel is the most common deployment target in Next.js tutorials. AI agents know the patterns.
5. **Cloud-agnostic code** — Next.js standalone output (`output: 'standalone'` in `next.config.ts`) produces a standard Node.js server that runs anywhere.

### Deployment topology:

```
                  MVP (Zero-cost)              Production (Azure)
                  ┌──────────────┐             ┌──────────────────────┐
                  │   Vercel     │             │  Azure App Service   │
                  │   Hobby      │             │  (Node.js runtime)   │
                  │              │             │                      │
                  │  Next.js 16  │ ────────►   │  Next.js 16          │
                  │  Serverless  │  same code  │  Standalone          │
                  │  Functions   │             │                      │
                  └──────┬───────┘             └──────────┬───────────┘
                         │                                │
                  ┌──────▼───────┐             ┌──────────▼───────────┐
                  │  Neon Free   │             │  Azure Database for  │
                  │  PostgreSQL  │             │  PostgreSQL          │
                  └──────────────┘             └──────────────────────┘
```

### next.config.ts for portability:

```typescript
const nextConfig = {
  output: 'standalone', // Produces self-contained Node.js server
  // Same code deploys to Vercel (auto-detected) or Azure (standalone)
};
```

### Azure deployment path:

1. Set `output: 'standalone'` in `next.config.ts`
2. `npm run build` produces `.next/standalone/` directory
3. Deploy as Node.js app on Azure App Service (Linux, B1 tier for production)
4. Or containerize with Docker for Azure Container Apps

### Environment-only differences:

```env
# MVP (.env - Vercel)
DATABASE_URL=postgresql://...@neon.tech/vantagemap
BETTER_AUTH_SECRET=...

# Production (.env - Azure)
DATABASE_URL=postgresql://...@azure-pg.postgres.database.azure.com/vantagemap
BETTER_AUTH_SECRET=...
# Same application code, different connection strings
```

## Consequences

- MVP deploys to Vercel with zero configuration (auto-detected Next.js)
- `next.config.ts` includes `output: 'standalone'` for Azure portability
- No Vercel-specific APIs used in application code (no `@vercel/*` packages in business logic)
- Vercel-specific features (Analytics, Speed Insights) are optional and removable
- Production migration to Azure requires only environment variable changes and Azure App Service setup
- Inngest (ADR-005) and Better Auth (ADR-003) are deployment-platform-agnostic
