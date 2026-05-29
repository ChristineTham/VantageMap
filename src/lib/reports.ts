/**
 * Phase 13.1 — Reporting Data Pipeline
 *
 * Provides on-demand aggregation functions that power the reporting
 * and analytics dashboard widgets. Each function computes a specific
 * report from the database using aggregate queries.
 *
 * Reports are served via API endpoints under /api/reports/* and cached
 * at the HTTP level with a short TTL for freshness.
 *
 * Separation of concerns:
 *   - This file: pure data aggregation logic (no HTTP layer)
 *   - Route handlers: auth, caching headers, response envelope
 *   - UI components: visualization and layout
 */

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, itComponents, relationships, businessCapabilities } from "@/db/schema";

// ── Report Types ────────────────────────────────────────────────────────────

export interface DistributionEntry {
  label: string;
  count: number;
  percentage: number;
}

export interface TimeDistributionReport {
  distribution: DistributionEntry[];
  total: number;
  classified: number;
  unclassified: number;
  recommendations: TimeRecommendation[];
}

export interface TimeRecommendation {
  appId: string;
  appName: string;
  suggestedClassification: string;
  reason: string;
  technicalFit: number | null;
  functionalFit: number | null;
}

export interface SixRDistributionReport {
  distribution: DistributionEntry[];
  total: number;
  classified: number;
  unclassified: number;
}

export interface ObsolescenceRiskItem {
  id: string;
  name: string;
  type: "Application" | "ITComponent";
  lifecycle: string | null;
  endOfLife: string | null;
  endOfSupport: string | null;
  daysUntilEol: number | null;
  daysUntilEos: number | null;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  owner: string | null;
}

export interface ObsolescenceRiskReport {
  items: ObsolescenceRiskItem[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  upcomingEolCount: number;
  pastEolCount: number;
}

export interface LifecycleDistributionReport {
  applications: DistributionEntry[];
  itComponents: DistributionEntry[];
  total: number;
}

export interface PortfolioHealthReport {
  overallScore: number;
  dimensions: {
    healthDistribution: DistributionEntry[];
    lifecycleDistribution: DistributionEntry[];
    fitScoreAvg: { technical: number; functional: number };
    criticalityDistribution: DistributionEntry[];
  };
  trends: {
    appsInPhaseOut: number;
    appsInEndOfLife: number;
    appsWithPoorHealth: number;
    appsWithCriticalHealth: number;
  };
}

export interface CapabilityCoverageReport {
  capabilities: {
    id: string;
    name: string;
    level: number | null;
    appCount: number;
    healthScore: number | null;
  }[];
  uncoveredCapabilities: number;
  avgAppsPerCapability: number;
}

// ── Helper: Convert count map to distribution entries ────────────────────────

function toDistribution(countMap: Record<string, number>, total: number): DistributionEntry[] {
  return Object.entries(countMap)
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ── 13.2 — TIME Distribution Report ────────────────────────────────────────

export async function getTimeDistributionReport(): Promise<TimeDistributionReport> {
  const allApps = await db
    .select({
      id: applications.id,
      name: applications.name,
      timeClassification: applications.timeClassification,
      technicalFit: applications.technicalFit,
      functionalFit: applications.functionalFit,
    })
    .from(applications);

  const total = allApps.length;
  const countMap: Record<string, number> = {
    Tolerate: 0,
    Invest: 0,
    Migrate: 0,
    Eliminate: 0,
  };

  let classified = 0;
  for (const app of allApps) {
    if (app.timeClassification && app.timeClassification in countMap) {
      countMap[app.timeClassification]++;
      classified++;
    }
  }

  // Generate recommendations for unclassified apps based on fit scores
  const recommendations: TimeRecommendation[] = [];
  const unclassified = allApps.filter((a) => !a.timeClassification);

  for (const app of unclassified.slice(0, 20)) {
    const techFit = app.technicalFit as number | null;
    const funcFit = app.functionalFit as number | null;

    if (techFit !== null && funcFit !== null) {
      const suggested = suggestTimeClassification(techFit, funcFit);
      recommendations.push({
        appId: app.id,
        appName: app.name,
        suggestedClassification: suggested.classification,
        reason: suggested.reason,
        technicalFit: techFit,
        functionalFit: funcFit,
      });
    }
  }

  return {
    distribution: toDistribution(countMap, classified),
    total,
    classified,
    unclassified: total - classified,
    recommendations,
  };
}

/**
 * Suggest TIME classification based on technical/functional fit scores.
 *
 * TIME Model Matrix (fit scores 1-5):
 *   - Invest: high tech + high func (both >= 4)
 *   - Tolerate: high tech + low func OR acceptable overall (tech >= 3 && func >= 3)
 *   - Migrate: low tech + high func (tech < 3, func >= 3)
 *   - Eliminate: low tech + low func (both < 3)
 */
function suggestTimeClassification(
  technicalFit: number,
  functionalFit: number
): { classification: string; reason: string } {
  if (technicalFit >= 4 && functionalFit >= 4) {
    return { classification: "Invest", reason: "High technical and functional fit" };
  }
  if (technicalFit < 3 && functionalFit < 3) {
    return { classification: "Eliminate", reason: "Low technical and functional fit" };
  }
  if (technicalFit < 3 && functionalFit >= 3) {
    return { classification: "Migrate", reason: "Low technical fit but good functional fit" };
  }
  return { classification: "Tolerate", reason: "Acceptable fit scores, maintain as-is" };
}

// ── 13.3 — 6R Distribution Report ──────────────────────────────────────────

export async function getSixRDistributionReport(): Promise<SixRDistributionReport> {
  const allApps = await db
    .select({
      sixRClassification: applications.sixRClassification,
    })
    .from(applications);

  const total = allApps.length;
  const countMap: Record<string, number> = {
    Retire: 0,
    Retain: 0,
    Repurchase: 0,
    Rehost: 0,
    Replatform: 0,
    Rearchitect: 0,
  };

  let classified = 0;
  for (const app of allApps) {
    if (app.sixRClassification && app.sixRClassification in countMap) {
      countMap[app.sixRClassification]++;
      classified++;
    }
  }

  return {
    distribution: toDistribution(countMap, classified),
    total,
    classified,
    unclassified: total - classified,
  };
}

// ── 13.4 — Obsolescence Risk Report ────────────────────────────────────────

export async function getObsolescenceRiskReport(
  horizonDays: number = 365
): Promise<ObsolescenceRiskReport> {
  const now = new Date();

  // Fetch IT components with EOL/EOS dates
  const components = await db
    .select({
      id: itComponents.id,
      name: itComponents.name,
      lifecycle: itComponents.lifecycle,
      endOfLife: itComponents.endOfLife,
      endOfSupport: itComponents.endOfSupport,
      owner: itComponents.owner,
    })
    .from(itComponents)
    .where(sql`${itComponents.endOfLife} IS NOT NULL OR ${itComponents.endOfSupport} IS NOT NULL`);

  // Also check applications in Phase Out or End of Life
  const eolApps = await db
    .select({
      id: applications.id,
      name: applications.name,
      lifecycle: applications.lifecycle,
      owner: applications.owner,
    })
    .from(applications)
    .where(sql`${applications.lifecycle} IN ('Phase Out', 'End of Life')`);

  const items: ObsolescenceRiskItem[] = [];
  let pastEolCount = 0;
  let upcomingEolCount = 0;

  for (const comp of components) {
    const eolDate = comp.endOfLife ? new Date(comp.endOfLife) : null;
    const eosDate = comp.endOfSupport ? new Date(comp.endOfSupport) : null;

    const daysUntilEol = eolDate
      ? Math.ceil((eolDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : null;
    const daysUntilEos = eosDate
      ? Math.ceil((eosDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : null;

    const riskLevel = computeRiskLevel(daysUntilEol, daysUntilEos);

    if (daysUntilEol !== null && daysUntilEol < 0) pastEolCount++;
    if (daysUntilEol !== null && daysUntilEol >= 0 && daysUntilEol <= horizonDays)
      upcomingEolCount++;

    items.push({
      id: comp.id,
      name: comp.name,
      type: "ITComponent",
      lifecycle: comp.lifecycle,
      endOfLife: comp.endOfLife,
      endOfSupport: comp.endOfSupport,
      daysUntilEol,
      daysUntilEos,
      riskLevel,
      owner: comp.owner,
    });
  }

  // Add EOL applications
  for (const app of eolApps) {
    items.push({
      id: app.id,
      name: app.name,
      type: "Application",
      lifecycle: app.lifecycle,
      endOfLife: null,
      endOfSupport: null,
      daysUntilEol: null,
      daysUntilEos: null,
      riskLevel: app.lifecycle === "End of Life" ? "Critical" : "High",
      owner: app.owner,
    });
    if (app.lifecycle === "End of Life") pastEolCount++;
  }

  // Sort by risk level (Critical first) then by days remaining
  const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  items.sort((a, b) => {
    const orderDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (orderDiff !== 0) return orderDiff;
    return (a.daysUntilEol ?? Infinity) - (b.daysUntilEol ?? Infinity);
  });

  const summary = {
    critical: items.filter((i) => i.riskLevel === "Critical").length,
    high: items.filter((i) => i.riskLevel === "High").length,
    medium: items.filter((i) => i.riskLevel === "Medium").length,
    low: items.filter((i) => i.riskLevel === "Low").length,
    total: items.length,
  };

  return { items, summary, upcomingEolCount, pastEolCount };
}

/**
 * Compute risk level based on days until EOL/EOS.
 *
 * - Critical: past EOL or within 90 days
 * - High: within 180 days
 * - Medium: within 365 days
 * - Low: beyond 365 days
 */
function computeRiskLevel(
  daysUntilEol: number | null,
  daysUntilEos: number | null
): "Critical" | "High" | "Medium" | "Low" {
  const minDays = Math.min(daysUntilEol ?? Infinity, daysUntilEos ?? Infinity);

  if (minDays === Infinity) return "Low";
  if (minDays <= 0) return "Critical";
  if (minDays <= 90) return "Critical";
  if (minDays <= 180) return "High";
  if (minDays <= 365) return "Medium";
  return "Low";
}

// ── Portfolio Health Score ───────────────────────────────────────────────────

export async function getPortfolioHealthReport(): Promise<PortfolioHealthReport> {
  const allApps = await db
    .select({
      health: applications.health,
      lifecycle: applications.lifecycle,
      technicalFit: applications.technicalFit,
      functionalFit: applications.functionalFit,
      businessCriticality: applications.businessCriticality,
    })
    .from(applications);

  const total = allApps.length;

  // Health distribution
  const healthCounts: Record<string, number> = {};
  for (const app of allApps) {
    const h = app.health ?? "Unknown";
    healthCounts[h] = (healthCounts[h] ?? 0) + 1;
  }

  // Lifecycle distribution
  const lifecycleCounts: Record<string, number> = {};
  for (const app of allApps) {
    const l = app.lifecycle ?? "Unknown";
    lifecycleCounts[l] = (lifecycleCounts[l] ?? 0) + 1;
  }

  // Fit score averages
  const fitScoreMap: Record<string, number> = { Insufficient: 1, Adequate: 3, Full: 5 };
  let techSum = 0,
    techCount = 0,
    funcSum = 0,
    funcCount = 0;
  for (const app of allApps) {
    if (app.technicalFit !== null) {
      techSum += fitScoreMap[app.technicalFit as string] ?? 0;
      techCount++;
    }
    if (app.functionalFit !== null) {
      funcSum += fitScoreMap[app.functionalFit as string] ?? 0;
      funcCount++;
    }
  }

  // Criticality distribution
  const critCounts: Record<string, number> = {};
  for (const app of allApps) {
    const c = (app.businessCriticality as string) ?? "Unknown";
    critCounts[c] = (critCounts[c] ?? 0) + 1;
  }

  // Trend indicators
  const appsInPhaseOut = allApps.filter((a) => a.lifecycle === "Phase Out").length;
  const appsInEndOfLife = allApps.filter((a) => a.lifecycle === "End of Life").length;
  const appsWithPoorHealth = allApps.filter((a) => a.health === "Poor").length;
  const appsWithCriticalHealth = allApps.filter((a) => a.health === "Critical").length;

  // Compute overall portfolio health score (0-100)
  // Factors: % healthy apps, avg fit scores, % not in EOL
  const healthyPct =
    total > 0 ? ((healthCounts["Excellent"] ?? 0) + (healthCounts["Good"] ?? 0)) / total : 0;
  const fitAvg =
    techCount > 0 && funcCount > 0
      ? (techSum / techCount + funcSum / funcCount) / 2 / 5 // Normalize to 0-1
      : 0.5;
  const activeLifecyclePct = total > 0 ? (total - appsInPhaseOut - appsInEndOfLife) / total : 1;

  const overallScore =
    Math.round((healthyPct * 40 + fitAvg * 30 + activeLifecyclePct * 30) * 100) / 100;

  return {
    overallScore: Math.min(100, Math.max(0, Math.round(overallScore * 100))),
    dimensions: {
      healthDistribution: toDistribution(healthCounts, total),
      lifecycleDistribution: toDistribution(lifecycleCounts, total),
      fitScoreAvg: {
        technical: techCount > 0 ? Math.round((techSum / techCount) * 10) / 10 : 0,
        functional: funcCount > 0 ? Math.round((funcSum / funcCount) * 10) / 10 : 0,
      },
      criticalityDistribution: toDistribution(critCounts, total),
    },
    trends: {
      appsInPhaseOut,
      appsInEndOfLife,
      appsWithPoorHealth,
      appsWithCriticalHealth,
    },
  };
}

// ── Capability Coverage Report ──────────────────────────────────────────────

export async function getCapabilityCoverageReport(): Promise<CapabilityCoverageReport> {
  // Get all capabilities
  const caps = await db
    .select({
      id: businessCapabilities.id,
      name: businessCapabilities.name,
      level: businessCapabilities.level,
    })
    .from(businessCapabilities);

  // Get relationships from capabilities to applications
  const rels = await db
    .select({
      sourceId: relationships.sourceId,
      targetId: relationships.targetId,
      sourceType: relationships.sourceType,
      targetType: relationships.targetType,
    })
    .from(relationships)
    .where(
      sql`(${relationships.sourceType} = 'BusinessCapability' AND ${relationships.targetType} = 'Application')
       OR (${relationships.sourceType} = 'Application' AND ${relationships.targetType} = 'BusinessCapability')`
    );

  // Map: capabilityId → set of linked app IDs
  const capAppMap = new Map<string, Set<string>>();
  for (const rel of rels) {
    if (rel.sourceType === "BusinessCapability") {
      if (!capAppMap.has(rel.sourceId)) capAppMap.set(rel.sourceId, new Set());
      capAppMap.get(rel.sourceId)!.add(rel.targetId);
    } else {
      if (!capAppMap.has(rel.targetId)) capAppMap.set(rel.targetId, new Set());
      capAppMap.get(rel.targetId)!.add(rel.sourceId);
    }
  }

  const capabilities = caps.map((cap) => ({
    id: cap.id,
    name: cap.name,
    level: cap.level ? Number(cap.level) : null,
    appCount: capAppMap.get(cap.id)?.size ?? 0,
    healthScore: null as number | null, // Could be computed from linked app health
  }));

  const uncoveredCapabilities = capabilities.filter((c) => c.appCount === 0).length;
  const totalApps = capabilities.reduce((sum, c) => sum + c.appCount, 0);
  const avgAppsPerCapability =
    caps.length > 0 ? Math.round((totalApps / caps.length) * 10) / 10 : 0;

  return {
    capabilities: capabilities.sort((a, b) => b.appCount - a.appCount),
    uncoveredCapabilities,
    avgAppsPerCapability,
  };
}
