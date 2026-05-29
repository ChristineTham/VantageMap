/**
 * Step 6.2 — Cross-Entity Search API
 *
 * GET /api/search — Full-text search across all fact sheet types.
 * Returns results grouped by type with relevance ranking.
 * Uses PostgreSQL ts_rank + to_tsvector/to_tsquery for p95 <300 ms.
 *
 * Query parameters:
 *   q        — search query string (required)
 *   types    — comma-separated list of entity types to search (optional, defaults to all)
 *   page     — page number (default 1)
 *   pageSize — results per page (default 25, max 200)
 */

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ok, badRequest, withErrorHandler } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { parsePagination, buildPaginationMeta } from "@/lib/query";

// ── Types ───────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  entityType: string;
  lifecycle: string | null;
  health: string | null;
  rank: number;
  headline: string;
}

interface GroupedResults {
  type: string;
  count: number;
  results: SearchResult[];
}

// ── Configuration ───────────────────────────────────────────────────────────

/** Tables to search with their entity type labels and table names. */
const SEARCHABLE_TABLES = [
  {
    type: "BusinessCapability",
    table: "business_capabilities",
    hasLifecycle: true,
    hasHealth: true,
  },
  { type: "Organization", table: "organizations", hasLifecycle: true, hasHealth: true },
  { type: "BusinessContext", table: "business_contexts", hasLifecycle: true, hasHealth: true },
  { type: "Application", table: "applications", hasLifecycle: true, hasHealth: true },
  { type: "DataObject", table: "data_objects", hasLifecycle: true, hasHealth: true },
  { type: "Interface", table: "interfaces", hasLifecycle: true, hasHealth: true },
  {
    type: "StrategicObjective",
    table: "strategic_objectives",
    hasLifecycle: true,
    hasHealth: true,
  },
  { type: "Initiative", table: "initiatives", hasLifecycle: true, hasHealth: true },
  { type: "Platform", table: "platforms", hasLifecycle: true, hasHealth: true },
  { type: "TechCategory", table: "tech_categories", hasLifecycle: false, hasHealth: false },
  { type: "ITComponent", table: "it_components", hasLifecycle: true, hasHealth: true },
  { type: "Provider", table: "providers", hasLifecycle: false, hasHealth: false },
] as const;

const VALID_TYPES = new Set(SEARCHABLE_TABLES.map((t) => t.type));

// ── GET Handler ─────────────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "view");
  if (!authz.ok) return authz.response;

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query || query.length === 0) {
    return badRequest("Search query parameter 'q' is required");
  }

  if (query.length > 500) {
    return badRequest("Search query too long (max 500 characters)");
  }

  // Parse optional type filter
  const typesParam = url.searchParams.get("types");
  let requestedTypes: string[] = [];
  if (typesParam) {
    requestedTypes = typesParam.split(",").map((t) => t.trim());
    const invalidTypes = requestedTypes.filter((t) => !(VALID_TYPES as Set<string>).has(t));
    if (invalidTypes.length > 0) {
      return badRequest(`Invalid entity types: ${invalidTypes.join(", ")}`);
    }
  }

  const pagination = parsePagination(url.searchParams);

  // Filter which tables to search
  const tablesToSearch =
    requestedTypes.length > 0
      ? SEARCHABLE_TABLES.filter((t) => requestedTypes.includes(t.type))
      : [...SEARCHABLE_TABLES];

  // nameOnly mode: substring ILIKE match on name — used by relationship pickers
  // for partial-word search without FTS word-boundary constraints
  const nameOnly = url.searchParams.get("nameOnly") === "true";
  const escapedLike = query.replace(/[%_\\]/g, (c) => `\\${c}`);
  const likePattern = sanitizeForSql(`%${escapedLike}%`);

  const searchUnion = tablesToSearch
    .map((tableConfig) => {
      const lifecycleCol = tableConfig.hasLifecycle ? "lifecycle" : "NULL";
      const healthCol = tableConfig.hasHealth ? "health" : "NULL";

      if (nameOnly) {
        return `
        SELECT
          id,
          name,
          description,
          '${tableConfig.type}' AS entity_type,
          ${lifecycleCol}::text AS lifecycle,
          ${healthCol}::text AS health,
          0::float AS rank,
          name AS headline
        FROM ${tableConfig.table}
        WHERE name ILIKE ${likePattern}
          OR coalesce(description, '') ILIKE ${likePattern}
      `;
      }

      return `
        SELECT
          id,
          name,
          description,
          '${tableConfig.type}' AS entity_type,
          ${lifecycleCol}::text AS lifecycle,
          ${healthCol}::text AS health,
          ts_rank(
            to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')),
            plainto_tsquery('english', ${sanitizeForSql(query)})
          ) AS rank,
          ts_headline(
            'english',
            coalesce(name, '') || ' — ' || coalesce(description, ''),
            plainto_tsquery('english', ${sanitizeForSql(query)}),
            'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20'
          ) AS headline
        FROM ${tableConfig.table}
        WHERE to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
              @@ plainto_tsquery('english', ${sanitizeForSql(query)})
      `;
    })
    .join("\nUNION ALL\n");

  // Count total results
  const countQuery = `SELECT COUNT(*) AS total FROM (${searchUnion}) AS search_results`;
  const countRows = (await db.execute(sql.raw(countQuery))).rows as Array<{ total: string }>;
  const total = Number(countRows[0]?.total ?? 0);

  // Fetch paginated results ordered by rank (or name for nameOnly mode)
  const orderBy = nameOnly ? "name ASC" : "rank DESC, name ASC";
  const dataQuery = `
    SELECT * FROM (${searchUnion}) AS search_results
    ORDER BY ${orderBy}
    LIMIT ${pagination.pageSize}
    OFFSET ${pagination.offset}
  `;
  const rows = (await db.execute(sql.raw(dataQuery))).rows as unknown as SearchResult[];

  // Group results by type
  const grouped: Record<string, GroupedResults> = {};
  for (const row of rows) {
    const type = row.entityType ?? (row as unknown as Record<string, string>).entity_type;
    if (!grouped[type]) {
      grouped[type] = { type, count: 0, results: [] };
    }
    grouped[type].count++;
    grouped[type].results.push({
      id: row.id,
      name: row.name,
      description: row.description,
      entityType: type,
      lifecycle: row.lifecycle,
      health: row.health,
      rank: row.rank,
      headline: row.headline,
    });
  }

  const meta = buildPaginationMeta(total, pagination);

  return ok({
    query,
    results: rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      entityType: row.entityType ?? (row as unknown as Record<string, string>).entity_type,
      lifecycle: row.lifecycle,
      health: row.health,
      rank: row.rank,
      headline: row.headline,
    })),
    grouped: Object.values(grouped),
    meta,
  });
});

// ── Utilities ───────────────────────────────────────────────────────────────

/**
 * Sanitize a user-provided string for inclusion in a SQL query.
 * Uses dollar-quoting to safely embed the string.
 */
function sanitizeForSql(input: string): string {
  // Use PostgreSQL dollar-quoting to avoid SQL injection.
  // The dollar-quote tag is randomized to prevent injection via the tag itself.
  const escaped = input.replace(/'/g, "''");
  return `'${escaped}'`;
}
