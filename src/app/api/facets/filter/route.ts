/**
 * Step 6.3 — Faceted Filter API (filter results)
 *
 * GET /api/facets/filter — Filter fact sheets across types with faceted criteria.
 *
 * Query parameters:
 *   types          — comma-separated fact sheet types (required, at least one)
 *   lifecycle      — comma-separated lifecycle values to include
 *   health         — comma-separated health values to include
 *   qualitySeal    — comma-separated quality seal values to include
 *   tags           — comma-separated tag IDs (entities must have at least one of these tags)
 *   owner          — filter by owner (partial match)
 *   page / pageSize — pagination
 *   sortBy         — field to sort by (default: name)
 *   sortDirection  — asc or desc (default: asc)
 */

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ok, badRequest, withErrorHandler } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { parsePagination, buildPaginationMeta } from "@/lib/query";

// ── Types ───────────────────────────────────────────────────────────────────

interface FilteredResult {
  id: string;
  name: string;
  description: string | null;
  entityType: string;
  lifecycle: string | null;
  health: string | null;
  qualitySeal: string | null;
  owner: string | null;
  updatedAt: string;
}

// ── Configuration ───────────────────────────────────────────────────────────

const FILTERABLE_TABLES: Record<
  string,
  { table: string; hasLifecycle: boolean; hasHealth: boolean; hasSeal: boolean; hasOwner: boolean }
> = {
  BusinessCapability: {
    table: "business_capabilities",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  Organization: {
    table: "organizations",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  BusinessContext: {
    table: "business_contexts",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  Application: {
    table: "applications",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  DataObject: {
    table: "data_objects",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  Interface: {
    table: "interfaces",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  StrategicObjective: {
    table: "strategic_objectives",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  Initiative: {
    table: "initiatives",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  Platform: {
    table: "platforms",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  TechCategory: {
    table: "tech_categories",
    hasLifecycle: false,
    hasHealth: false,
    hasSeal: false,
    hasOwner: true,
  },
  ITComponent: {
    table: "it_components",
    hasLifecycle: true,
    hasHealth: true,
    hasSeal: true,
    hasOwner: true,
  },
  Provider: {
    table: "providers",
    hasLifecycle: false,
    hasHealth: false,
    hasSeal: false,
    hasOwner: true,
  },
};

const VALID_TYPES = new Set(Object.keys(FILTERABLE_TABLES));
const VALID_SORT_FIELDS = new Set(["name", "updatedAt", "lifecycle", "health"]);

// ── GET Handler ─────────────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "view");
  if (!authz.ok) return authz.response;

  const url = new URL(request.url);

  // Parse required types param
  const typesParam = url.searchParams.get("types");
  if (!typesParam) {
    return badRequest("Query parameter 'types' is required (comma-separated entity types)");
  }

  const requestedTypes = typesParam.split(",").map((t) => t.trim());
  const invalidTypes = requestedTypes.filter((t) => !VALID_TYPES.has(t));
  if (invalidTypes.length > 0) {
    return badRequest(`Invalid entity types: ${invalidTypes.join(", ")}`);
  }

  // Parse optional filters
  const lifecycleFilter =
    url.searchParams
      .get("lifecycle")
      ?.split(",")
      .map((v) => v.trim()) ?? [];
  const healthFilter =
    url.searchParams
      .get("health")
      ?.split(",")
      .map((v) => v.trim()) ?? [];
  const qualitySealFilter =
    url.searchParams
      .get("qualitySeal")
      ?.split(",")
      .map((v) => v.trim()) ?? [];
  const tagFilter =
    url.searchParams
      .get("tags")
      ?.split(",")
      .map((v) => v.trim()) ?? [];
  const ownerFilter = url.searchParams.get("owner")?.trim() ?? "";

  // Parse sorting
  const sortBy = url.searchParams.get("sortBy") ?? "name";
  const sortDirection = url.searchParams.get("sortDirection") === "desc" ? "DESC" : "ASC";

  if (!VALID_SORT_FIELDS.has(sortBy)) {
    return badRequest(`Invalid sortBy field. Allowed: ${[...VALID_SORT_FIELDS].join(", ")}`);
  }

  const pagination = parsePagination(url.searchParams);

  // Build per-type queries
  const subQueries: string[] = [];

  for (const typeName of requestedTypes) {
    const config = FILTERABLE_TABLES[typeName];
    if (!config) continue;

    const conditions: string[] = [];

    // Lifecycle filter
    if (lifecycleFilter.length > 0 && config.hasLifecycle) {
      const escaped = lifecycleFilter.map((v) => `'${v.replace(/'/g, "''")}'`).join(",");
      conditions.push(`lifecycle IN (${escaped})`);
    } else if (lifecycleFilter.length > 0 && !config.hasLifecycle) {
      // This type doesn't have lifecycle — skip it entirely
      continue;
    }

    // Health filter
    if (healthFilter.length > 0 && config.hasHealth) {
      const escaped = healthFilter.map((v) => `'${v.replace(/'/g, "''")}'`).join(",");
      conditions.push(`health IN (${escaped})`);
    } else if (healthFilter.length > 0 && !config.hasHealth) {
      continue;
    }

    // Quality seal filter
    if (qualitySealFilter.length > 0 && config.hasSeal) {
      const escaped = qualitySealFilter.map((v) => `'${v.replace(/'/g, "''")}'`).join(",");
      conditions.push(`quality_seal IN (${escaped})`);
    } else if (qualitySealFilter.length > 0 && !config.hasSeal) {
      continue;
    }

    // Owner filter (partial match)
    if (ownerFilter && config.hasOwner) {
      conditions.push(`owner ILIKE '%${ownerFilter.replace(/'/g, "''")}%'`);
    }

    // Tag filter — entity must have at least one of the specified tags
    if (tagFilter.length > 0) {
      const escaped = tagFilter.map((v) => `'${v.replace(/'/g, "''")}'`).join(",");
      conditions.push(
        `id IN (SELECT fact_sheet_id FROM tag_assignments WHERE fact_sheet_type = '${typeName}' AND tag_id IN (${escaped}))`
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    subQueries.push(`
      SELECT
        id,
        name,
        description,
        '${typeName}' AS entity_type,
        ${config.hasLifecycle ? "lifecycle::text" : "NULL::text"} AS lifecycle,
        ${config.hasHealth ? "health::text" : "NULL::text"} AS health,
        ${config.hasSeal ? "quality_seal::text" : "NULL::text"} AS quality_seal,
        ${config.hasOwner ? "owner" : "NULL::text"} AS owner,
        updated_at::text AS updated_at
      FROM ${config.table}
      ${whereClause}
    `);
  }

  if (subQueries.length === 0) {
    return ok({
      results: [],
      meta: { page: pagination.page, pageSize: pagination.pageSize, total: 0, totalPages: 0 },
    });
  }

  const unionQuery = subQueries.join("\nUNION ALL\n");

  // Count total
  const countQuery = `SELECT COUNT(*)::int AS total FROM (${unionQuery}) AS filtered`;
  const countResult = (await db.execute(sql.raw(countQuery))).rows as Array<{ total: number }>;
  const total = Number(countResult[0]?.total ?? 0);

  // Map sort field for the outer query
  const outerSortCol =
    sortBy === "updatedAt" ? "updated_at" : sortBy === "qualitySeal" ? "quality_seal" : sortBy;

  // Fetch results
  const dataQuery = `
    SELECT * FROM (${unionQuery}) AS filtered
    ORDER BY ${outerSortCol} ${sortDirection} NULLS LAST, name ASC
    LIMIT ${pagination.pageSize}
    OFFSET ${pagination.offset}
  `;
  const rows = (await db.execute(sql.raw(dataQuery))).rows as unknown as FilteredResult[];

  const meta = buildPaginationMeta(total, pagination);

  return ok({
    results: rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      entityType: row.entityType ?? (row as unknown as Record<string, string>).entity_type,
      lifecycle: row.lifecycle,
      health: row.health,
      qualitySeal: row.qualitySeal ?? (row as unknown as Record<string, string>).quality_seal,
      owner: row.owner,
      updatedAt: row.updatedAt ?? (row as unknown as Record<string, string>).updated_at,
    })),
    meta,
  });
});
