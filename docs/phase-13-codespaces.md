# Phase 13 — Reporting and Analytics (Codespaces Continuation)

Phase 13 implements the reporting and analytics engine for VantageMap:
portfolio health scoring, TIME rationalization, 6R cloud migration strategy,
obsolescence risk monitoring, and capability coverage analysis.

---

## New Dependencies

**None required.** Phase 13 uses only existing packages (Drizzle ORM for
aggregation queries, Recharts for visualization).

---

## No Database Migration Needed

Phase 13 reads from existing tables — it does not create new tables.
All report data is computed on-demand from:

- `applications` (TIME, 6R, lifecycle, health, fit scores)
- `it_components` (end_of_life, end_of_support dates)
- `business_capabilities` (capability list)
- `relationships` (capability-application mapping)

---

## New Files Created

### Backend — Report Engine

| File                                               | Purpose                                |
| -------------------------------------------------- | -------------------------------------- |
| `src/lib/reports.ts`                               | Core aggregation logic for all reports |
| `src/app/api/reports/time-distribution/route.ts`   | TIME rationalization API               |
| `src/app/api/reports/six-r-distribution/route.ts`  | 6R distribution API                    |
| `src/app/api/reports/obsolescence-risk/route.ts`   | Obsolescence risk API                  |
| `src/app/api/reports/portfolio-health/route.ts`    | Portfolio health score API             |
| `src/app/api/reports/capability-coverage/route.ts` | Capability coverage API                |

### Frontend — UI Components

| File                                         | Purpose                                        |
| -------------------------------------------- | ---------------------------------------------- |
| `src/components/ReportingCharts.tsx`         | TIME donut, 6R bar, health gauge, risk summary |
| `src/components/ObsolescenceTable.tsx`       | Risk items table with severity badges          |
| `src/components/CapabilityCoverageChart.tsx` | Capability-to-app coverage bar chart           |
| `src/app/reports/page.tsx`                   | Full-page Reports & Analytics view             |

### Modified Files

| File                         | Change                                       |
| ---------------------------- | -------------------------------------------- |
| `src/app/page.tsx`           | Added ReportingCharts to dashboard           |
| `src/lib/data.ts`            | Added report-fetching wrapper functions      |
| `src/components/Sidebar.tsx` | Added "Reports" nav item with BarChart3 icon |

### Tests

| File                                    | Purpose                                      |
| --------------------------------------- | -------------------------------------------- |
| `src/__tests__/phase13-reports.test.ts` | Unit tests for classification, risk, scoring |

---

## Testing

```bash
# Run Phase 13 unit tests
npx vitest run src/__tests__/phase13-reports.test.ts

# Run all tests
npx vitest run

# Type check
npx tsc --noEmit

# Lint
npx eslint .
```

---

## Verification Steps

### 13.1 — Portfolio Health & Capability Coverage

```bash
# Portfolio health score
curl http://localhost:3000/api/reports/portfolio-health \
  -H "Authorization: Bearer <token>"

# Capability coverage
curl http://localhost:3000/api/reports/capability-coverage \
  -H "Authorization: Bearer <token>"
```

Expected response (portfolio-health):

```json
{
  "data": {
    "overallScore": 72,
    "dimensions": {
      "healthDistribution": [{"label": "Good", "count": 8, "percentage": 53.3}],
      "lifecycleDistribution": [...],
      "fitScoreAvg": {"technical": 3.5, "functional": 3.8},
      "criticalityDistribution": [...]
    },
    "trends": {
      "appsInPhaseOut": 2,
      "appsInEndOfLife": 1,
      "appsWithPoorHealth": 1,
      "appsWithCriticalHealth": 0
    }
  }
}
```

### 13.2 — TIME Rationalization

```bash
curl http://localhost:3000/api/reports/time-distribution \
  -H "Authorization: Bearer <token>"
```

Expected response:

```json
{
  "data": {
    "distribution": [
      { "label": "Tolerate", "count": 5, "percentage": 38.5 },
      { "label": "Invest", "count": 4, "percentage": 30.8 },
      { "label": "Migrate", "count": 2, "percentage": 15.4 },
      { "label": "Eliminate", "count": 2, "percentage": 15.4 }
    ],
    "total": 15,
    "classified": 13,
    "unclassified": 2,
    "recommendations": [
      {
        "appId": "...",
        "appName": "Legacy CRM",
        "suggestedClassification": "Migrate",
        "reason": "Low technical fit but good functional fit",
        "technicalFit": 2,
        "functionalFit": 4
      }
    ]
  }
}
```

### 13.3 — 6R Cloud Migration Strategy

```bash
curl http://localhost:3000/api/reports/six-r-distribution \
  -H "Authorization: Bearer <token>"
```

### 13.4 — Obsolescence Risk

```bash
# Default horizon (365 days)
curl http://localhost:3000/api/reports/obsolescence-risk \
  -H "Authorization: Bearer <token>"

# Custom horizon (90 days)
curl "http://localhost:3000/api/reports/obsolescence-risk?horizon=90" \
  -H "Authorization: Bearer <token>"
```

Expected response:

```json
{
  "data": {
    "items": [
      {
        "id": "...",
        "name": "jQuery 1.x",
        "type": "ITComponent",
        "lifecycle": "End of Life",
        "endOfLife": "2024-01-01",
        "daysUntilEol": -547,
        "riskLevel": "Critical",
        "owner": "Frontend Team"
      }
    ],
    "summary": { "critical": 2, "high": 3, "medium": 5, "low": 8, "total": 18 },
    "upcomingEolCount": 5,
    "pastEolCount": 2
  }
}
```

### Reports UI

1. Start dev server: `npm run dev`
2. Open http://localhost:3000 — dashboard now shows Phase 13 charts below existing charts
3. Open http://localhost:3000/reports — full reports page with:
   - Quick stat cards (portfolio health, TIME classified, risk count, coverage)
   - TIME donut chart
   - 6R horizontal bar chart
   - Portfolio health gauge
   - Obsolescence risk donut
   - TIME recommendation table
   - Obsolescence risk detail table
   - Capability coverage bar chart
   - Portfolio health breakdown cards

---

## Architecture Notes

### Computation Strategy

All reports are computed **on-demand** (no pre-materialized views) for MVP:

- Simple queries against existing tables
- No background jobs or scheduled aggregation
- No caching beyond HTTP-level `Cache-Control` headers

Post-MVP optimization path:

1. Add `Cache-Control: private, max-age=300` to report endpoints (5min cache)
2. Create materialized views for expensive joins (e.g., capability coverage)
3. Schedule Inngest functions to refresh materialized views every 15 minutes
4. Add Redis/Vercel KV cache for frequently-accessed dashboards

### TIME Model Implementation

The TIME (Tolerate/Invest/Migrate/Eliminate) model uses a 2x2 matrix:

```
                    Functional Fit →
                    Low (1-2)       High (4-5)
Technical   High   Tolerate        Invest
Fit ↓       Low    Eliminate       Migrate
```

- **Invest**: Both fits ≥ 4 — strategic investment target
- **Tolerate**: Acceptable fit, maintain as-is
- **Migrate**: Good business value but poor technology — migrate to modern stack
- **Eliminate**: Poor on both dimensions — phase out and replace

### Risk Level Thresholds

| Risk Level | Days Until EOL/EOS          |
| ---------- | --------------------------- |
| Critical   | ≤ 0 (past due) or ≤ 90 days |
| High       | 91 – 180 days               |
| Medium     | 181 – 365 days              |
| Low        | > 365 days or no date set   |

### Portfolio Health Score (0-100)

Composite score = (healthyPct × 40) + (fitAvg × 30) + (activeLifecyclePct × 30)

Where:

- `healthyPct`: % of apps with Excellent or Good health (weight: 40%)
- `fitAvg`: normalized average of technical + functional fit scores (weight: 30%)
- `activeLifecyclePct`: % of apps NOT in Phase Out or End of Life (weight: 30%)

---

## Seed Data Tips

For meaningful reports, ensure seed data includes:

- Applications with diverse `time_classification` values
- Applications with diverse `six_r_classification` values
- Applications with `technical_fit` and `functional_fit` scores (1-5)
- IT components with `end_of_life` and `end_of_support` dates (some past, some near future)
- Relationships between capabilities and applications

The existing seed script (`npm run db:seed`) should already populate these if run from Phase 3.

---

## Known Limitations (MVP)

1. **No caching** — reports are computed on every request
2. **No time-series trends** — only current snapshot, no historical comparison
3. **No export** — report data not available as PDF/CSV (use /api/export for raw data)
4. **No alerting** — obsolescence risks not pushed to notification system
5. **No drill-through** — chart items don't link to filtered entity views (wire post-MVP)
6. **Recommendation engine is rule-based** — no ML/AI predictions
