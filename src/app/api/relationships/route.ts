/**
 * Step 6.1 — Relationship CRUD API (collection)
 *
 * GET  /api/relationships — List relationships with pagination, sorting, filtering
 * POST /api/relationships — Create a new relationship (or bulk create)
 *
 * Supports filtering by sourceType, sourceId, targetType, targetId, relationshipType.
 * Supports bulk creation via array body.
 */

import { z } from "zod";
import { eq, and, count, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { relationships } from "@/db/schema";
import {
  ok,
  created,
  list,
  badRequest,
  conflict,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { parseListParams, buildOrderBy, buildPaginationMeta } from "@/lib/query";
import {
  VALID_RELATIONSHIP_PAIRS,
  isValidRelationshipPair,
  type RelationshipPair,
} from "@/lib/relationship-rules";

// ── Schemas ─────────────────────────────────────────────────────────────────

const factSheetTypes = [
  "BusinessCapability",
  "Organization",
  "BusinessContext",
  "Application",
  "DataObject",
  "Interface",
  "StrategicObjective",
  "Initiative",
  "Platform",
  "TechCategory",
  "ITComponent",
  "Provider",
] as const;

const relationshipTypes = [
  "supports",
  "supported by",
  "used by",
  "uses",
  "used in",
  "provides",
  "consumes",
  "processes",
  "manages",
  "runs on",
  "depends on",
  "belongs to",
  "contains",
  "in scope of",
  "impacts",
  "improves",
  "drives",
  "linked to",
  "related to",
  "performed by",
  "assigned to",
  "owns",
  "owned by",
  "offered by",
  "classified in",
  "classifies",
  "implements",
  "implemented via",
  "transfers",
  "transferred via",
  "involved in",
  "requires",
  "required by",
  "parent",
  "child",
] as const;

const createSchema = z.object({
  sourceType: z.enum(factSheetTypes),
  sourceId: z.string().uuid(),
  targetType: z.enum(factSheetTypes),
  targetId: z.string().uuid(),
  relationshipType: z.enum(relationshipTypes),
  description: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});

const bulkCreateSchema = z.array(createSchema).min(1).max(100);

// ── Column Map ──────────────────────────────────────────────────────────────

const columnMap = {
  sourceType: relationships.sourceType,
  sourceId: relationships.sourceId,
  targetType: relationships.targetType,
  targetId: relationships.targetId,
  relationshipType: relationships.relationshipType,
  createdAt: relationships.createdAt,
  updatedAt: relationships.updatedAt,
};

// ── GET Handler ─────────────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "view");
  if (!authz.ok) return authz.response;

  const url = new URL(request.url);
  const query = parseListParams(url.searchParams);

  // Build WHERE conditions from filters
  const conditions: SQL[] = [];

  for (const filter of query.filters) {
    const column = columnMap[filter.field as keyof typeof columnMap];
    if (!column) continue;

    if (filter.operator === "eq") {
      conditions.push(eq(column, filter.value));
    }
  }

  // Also support direct query params for convenience
  const sourceType = url.searchParams.get("sourceType");
  const sourceId = url.searchParams.get("sourceId");
  const targetType = url.searchParams.get("targetType");
  const targetId = url.searchParams.get("targetId");
  const relType = url.searchParams.get("relationshipType");

  if (sourceType) conditions.push(eq(relationships.sourceType, sourceType));
  if (sourceId) conditions.push(eq(relationships.sourceId, sourceId));
  if (targetType) conditions.push(eq(relationships.targetType, targetType));
  if (targetId) conditions.push(eq(relationships.targetId, targetId));
  if (relType) conditions.push(eq(relationships.relationshipType, relType));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderBy = buildOrderBy(query.sort, columnMap);

  // Count total
  const [countResult] = await db
    .select({ value: count() })
    .from(relationships)
    .where(whereClause);
  const total = countResult?.value ?? 0;

  // Fetch page
  let queryBuilder = db
    .select()
    .from(relationships)
    .where(whereClause)
    .limit(query.pagination.pageSize)
    .offset(query.pagination.offset);

  if (orderBy) {
    queryBuilder = queryBuilder.orderBy(orderBy) as typeof queryBuilder;
  }

  const rows = await queryBuilder;
  const meta = buildPaginationMeta(total, query.pagination);

  return list(rows, meta);
});

// ── POST Handler ────────────────────────────────────────────────────────────

export const POST = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "create");
  if (!authz.ok) return authz.response;

  // Detect if body is array (bulk) or single object
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  // ── Bulk create ─────────────────────────────────────────────────────────
  if (Array.isArray(body)) {
    const parsed = bulkCreateSchema.safeParse(body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "_root";
        if (!details[path]) details[path] = [];
        details[path].push(issue.message);
      }
      return badRequest("Validation failed", details);
    }

    // Validate each relationship pair
    const invalidPairs: string[] = [];
    for (let i = 0; i < parsed.data.length; i++) {
      const item = parsed.data[i];
      if (!isValidRelationshipPair(item.sourceType, item.targetType, item.relationshipType)) {
        invalidPairs.push(
          `[${i}]: ${item.sourceType} → ${item.targetType} via "${item.relationshipType}" is not allowed`
        );
      }
    }

    if (invalidPairs.length > 0) {
      return badRequest("Invalid relationship type(s) for the given entity pair", {
        relationships: invalidPairs,
      });
    }

    // Insert all (ignore duplicates via ON CONFLICT DO NOTHING)
    const rows = await db
      .insert(relationships)
      .values(parsed.data)
      .onConflictDoNothing({
        target: [
          relationships.sourceType,
          relationships.sourceId,
          relationships.targetType,
          relationships.targetId,
          relationships.relationshipType,
        ],
      })
      .returning();

    if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
      for (const row of rows) {
        await writeAuditLog({
          auth: auth.auth,
          action: "create",
          targetType: "BusinessCapability", // generic; relationship doesn't have its own FactSheetType
          targetId: row.id,
          targetDisplayName: `${row.sourceType}→${row.targetType} (${row.relationshipType})`,
          request,
        });
      }
    }

    return created(rows);
  }

  // ── Single create ───────────────────────────────────────────────────────
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_root";
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    return badRequest("Validation failed", details);
  }

  const data = parsed.data;

  // Validate relationship pair
  if (!isValidRelationshipPair(data.sourceType, data.targetType, data.relationshipType)) {
    return badRequest(
      `Relationship type "${data.relationshipType}" is not allowed between ${data.sourceType} and ${data.targetType}`,
      {
        allowed: VALID_RELATIONSHIP_PAIRS.filter(
          (p: RelationshipPair) => p.source === data.sourceType && p.target === data.targetType
        ).map((p: RelationshipPair) => p.type),
      }
    );
  }

  // Prevent self-referencing (unless parent/child)
  if (
    data.sourceId === data.targetId &&
    data.sourceType === data.targetType &&
    data.relationshipType !== "parent" &&
    data.relationshipType !== "child"
  ) {
    return badRequest("An entity cannot have a non-hierarchical relationship with itself");
  }

  const [row] = await db
    .insert(relationships)
    .values(data)
    .onConflictDoNothing({
      target: [
        relationships.sourceType,
        relationships.sourceId,
        relationships.targetType,
        relationships.targetId,
        relationships.relationshipType,
      ],
    })
    .returning();

  if (!row) {
    return conflict("This relationship already exists");
  }

  if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
    await writeAuditLog({
      auth: auth.auth,
      action: "create",
      targetType: "BusinessCapability",
      targetId: row.id,
      targetDisplayName: `${row.sourceType}→${row.targetType} (${row.relationshipType})`,
      request,
    });
  }

  return created(row);
});
