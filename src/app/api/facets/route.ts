/**
 * Step 6.3 — Faceted Filter API
 *
 * GET /api/facets — Get available facet values for filtering fact sheets.
 *   Returns distinct values for: type, lifecycle, health, qualitySeal, tags, and subtypes.
 *   Supports filtering by type to narrow facets.
 *
 * GET /api/facets/filter — Filter fact sheets across types with faceted criteria.
 *   Query parameters:
 *     types          — comma-separated fact sheet types (required at least one)
 *     lifecycle      — comma-separated lifecycle values
 *     health         — comma-separated health values
 *     qualitySeal    — comma-separated quality seal values
 *     tags           — comma-separated tag IDs
 *     subscriptions  — comma-separated user IDs (entities those users subscribe to)
 *     page / pageSize — pagination
 */

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ok, badRequest, withErrorHandler } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

// ── Types ───────────────────────────────────────────────────────────────────

interface FacetValue {
  value: string;
  count: number;
}

interface FacetGroup {
  field: string;
  values: FacetValue[];
}

// ── Configuration ───────────────────────────────────────────────────────────

const FACETABLE_TABLES = [
  { type: "BusinessCapability", table: "business_capabilities", hasSubtype: false },
  { type: "Organization", table: "organizations", hasSubtype: true, subtypeCol: "subtype" },
  { type: "BusinessContext", table: "business_contexts", hasSubtype: true, subtypeCol: "subtype" },
  { type: "Application", table: "applications", hasSubtype: true, subtypeCol: "subtype" },
  { type: "DataObject", table: "data_objects", hasSubtype: false },
  { type: "Interface", table: "interfaces", hasSubtype: true, subtypeCol: "subtype" },
  { type: "StrategicObjective", table: "strategic_objectives", hasSubtype: false },
  { type: "Initiative", table: "initiatives", hasSubtype: true, subtypeCol: "subtype" },
  { type: "Platform", table: "platforms", hasSubtype: false },
  { type: "TechCategory", table: "tech_categories", hasSubtype: false },
  { type: "ITComponent", table: "it_components", hasSubtype: true, subtypeCol: "subtype" },
  { type: "Provider", table: "providers", hasSubtype: false },
] as const;

const VALID_TYPES = new Set(FACETABLE_TABLES.map((t) => t.type));

// ── GET /api/facets ─────────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "view");
  if (!authz.ok) return authz.response;

  const url = new URL(request.url);
  const typesParam = url.searchParams.get("types");

  let tablesToQuery = [...FACETABLE_TABLES];
  if (typesParam) {
    const requestedTypes = typesParam.split(",").map((t) => t.trim());
    const invalidTypes = requestedTypes.filter((t) => !(VALID_TYPES as Set<string>).has(t));
    if (invalidTypes.length > 0) {
      return badRequest(`Invalid entity types: ${invalidTypes.join(", ")}`);
    }
    tablesToQuery = FACETABLE_TABLES.filter((t) => requestedTypes.includes(t.type));
  }

  // Build facet queries
  const facets: FacetGroup[] = [];

  // Type facet — count per entity type
  const typeCountQueries = tablesToQuery.map(
    (t) => `SELECT '${t.type}' AS value, COUNT(*)::int AS count FROM ${t.table}`
  );
  const typeResults = (await db.execute(sql.raw(typeCountQueries.join(" UNION ALL "))))
    .rows as unknown as FacetValue[];
  facets.push({
    field: "type",
    values: typeResults.filter((r) => r.count > 0),
  });

  // Lifecycle facet
  const lifecycleQueries = tablesToQuery
    .filter((t) => t.type !== "TechCategory" && t.type !== "Provider")
    .map(
      (t) =>
        `SELECT lifecycle AS value, COUNT(*)::int AS count FROM ${t.table} WHERE lifecycle IS NOT NULL GROUP BY lifecycle`
    );
  if (lifecycleQueries.length > 0) {
    const lifecycleRaw = (
      await db.execute(
        sql.raw(
          `SELECT value, SUM(count)::int AS count FROM (${lifecycleQueries.join(" UNION ALL ")}) sub GROUP BY value ORDER BY count DESC`
        )
      )
    ).rows as unknown as FacetValue[];
    facets.push({ field: "lifecycle", values: lifecycleRaw });
  }

  // Health facet
  const healthQueries = tablesToQuery
    .filter((t) => t.type !== "TechCategory" && t.type !== "Provider")
    .map(
      (t) =>
        `SELECT health AS value, COUNT(*)::int AS count FROM ${t.table} WHERE health IS NOT NULL GROUP BY health`
    );
  if (healthQueries.length > 0) {
    const healthRaw = (
      await db.execute(
        sql.raw(
          `SELECT value, SUM(count)::int AS count FROM (${healthQueries.join(" UNION ALL ")}) sub GROUP BY value ORDER BY count DESC`
        )
      )
    ).rows as unknown as FacetValue[];
    facets.push({ field: "health", values: healthRaw });
  }

  // Quality seal facet
  const sealQueries = tablesToQuery
    .filter((t) => t.type !== "TechCategory" && t.type !== "Provider")
    .map(
      (t) =>
        `SELECT quality_seal AS value, COUNT(*)::int AS count FROM ${t.table} WHERE quality_seal IS NOT NULL GROUP BY quality_seal`
    );
  if (sealQueries.length > 0) {
    const sealRaw = (
      await db.execute(
        sql.raw(
          `SELECT value, SUM(count)::int AS count FROM (${sealQueries.join(" UNION ALL ")}) sub GROUP BY value ORDER BY count DESC`
        )
      )
    ).rows as unknown as FacetValue[];
    facets.push({ field: "qualitySeal", values: sealRaw });
  }

  // Tags facet — count distinct tags assigned to entities of selected types
  if (tablesToQuery.length > 0) {
    const typeFilter = tablesToQuery.map((t) => `'${t.type}'`).join(",");
    const tagQuery = `
      SELECT t.name AS value, COUNT(DISTINCT ta.fact_sheet_id)::int AS count
      FROM tag_assignments ta
      JOIN tags t ON ta.tag_id = t.id
      WHERE ta.fact_sheet_type IN (${typeFilter})
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 50
    `;
    const tagResults = (await db.execute(sql.raw(tagQuery))).rows as unknown as FacetValue[];
    facets.push({ field: "tags", values: tagResults });
  }

  return ok({ facets });
});
