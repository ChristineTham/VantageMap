/**
 * Phase 5 — Generic CRUD Route Factory
 *
 * Creates standard REST route handlers (GET list, GET by ID, POST, PATCH, DELETE)
 * for any Drizzle table with the common fact-sheet column pattern.
 *
 * Every entity endpoint in Phase 5 uses this factory to avoid duplication.
 * Custom logic (hierarchical queries, sub-resources) is layered on top.
 */

import { NextResponse } from "next/server";
import { eq, and, count, type SQL, type Column } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import { z, type ZodSchema } from "zod";
import { db } from "@/db";
import {
  ok,
  created,
  list,
  noContent,
  notFound,
  badRequest,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog, computeDiff } from "@/lib/audit";
import type { FactSheetType } from "@/lib/audit-types";
import { isFeatureEnabled } from "@/lib/feature-flags";
import {
  parseListParams,
  buildOrderBy,
  buildWhereConditions,
  buildPaginationMeta,
} from "@/lib/query";

// ── Types ───────────────────────────────────────────────────────────────────

export interface CrudConfig<TTable extends PgTableWithColumns<any>> {
  /** The Drizzle table object. */
  table: TTable;
  /** Fact sheet type name for audit logging. */
  entityType: FactSheetType;
  /** Zod schema for creating a new entity. */
  createSchema: ZodSchema;
  /** Zod schema for updating an entity (all fields optional). */
  updateSchema: ZodSchema;
  /** Map of sortable/filterable field names to Drizzle columns. */
  columnMap: Record<string, Column>;
  /** Column to use as display name in audit logs (default: "name"). */
  displayNameColumn?: string;
  /** Additional WHERE conditions to always apply (e.g., workspace scoping). */
  baseConditions?: () => SQL[];
}

// ── Factory Functions ───────────────────────────────────────────────────────

/**
 * Create a GET handler for listing entities with pagination, sorting, and filtering.
 */
export function createListHandler<TTable extends PgTableWithColumns<any>>(
  config: CrudConfig<TTable>
) {
  return withErrorHandler(async (request: Request) => {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "view");
    if (!authz.ok) return authz.response;

    const url = new URL(request.url);
    const query = parseListParams(url.searchParams);

    // Build WHERE conditions
    const filterConditions = buildWhereConditions(query.filters, config.columnMap);
    const baseConditions = config.baseConditions?.() ?? [];
    const allConditions = [...baseConditions, ...filterConditions];
    const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;

    // Build ORDER BY
    const orderBy = buildOrderBy(query.sort, config.columnMap);

    // Count total
    const [countResult] = await db
      .select({ value: count() })
      .from(config.table)
      .where(whereClause);
    const total = countResult?.value ?? 0;

    // Fetch page
    let queryBuilder = db
      .select()
      .from(config.table)
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
}

/**
 * Create a GET handler for fetching a single entity by ID.
 */
export function createGetByIdHandler<TTable extends PgTableWithColumns<any>>(
  config: CrudConfig<TTable>
) {
  return withErrorHandler(
    async (request: Request, context: { params: Promise<Record<string, string>> }) => {
      const auth = await requireAuth(request);
      if (!auth.ok) return auth.response;

      const authz = requirePermission(auth.auth, "view");
      if (!authz.ok) return authz.response;

      const { id } = await context.params;
      if (!id || !isValidUUID(id)) {
        return badRequest("Invalid ID format");
      }

      const [row] = await db
        .select()
        .from(config.table)
        .where(eq((config.table as any).id, id))
        .limit(1);

      if (!row) {
        return notFound(`${config.entityType} not found`);
      }

      return ok(row);
    }
  );
}

/**
 * Create a POST handler for creating a new entity.
 */
export function createCreateHandler<TTable extends PgTableWithColumns<any>>(
  config: CrudConfig<TTable>
) {
  return withErrorHandler(async (request: Request) => {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "create");
    if (!authz.ok) return authz.response;

    const parsed = await parseBody(request, config.createSchema);
    if ("error" in parsed) return parsed.error;

    const [row] = await db
      .insert(config.table)
      .values(parsed.data as any)
      .returning();

    if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
      const displayName =
        config.displayNameColumn && (row as any)[config.displayNameColumn]
          ? (row as any)[config.displayNameColumn]
          : (row as any).name ?? undefined;

      await writeAuditLog({
        auth: auth.auth,
        action: "create",
        targetType: config.entityType,
        targetId: (row as any).id,
        targetDisplayName: displayName,
        request,
      });
    }

    return created(row);
  });
}

/**
 * Create a PATCH handler for updating an entity.
 */
export function createUpdateHandler<TTable extends PgTableWithColumns<any>>(
  config: CrudConfig<TTable>
) {
  return withErrorHandler(
    async (request: Request, context: { params: Promise<Record<string, string>> }) => {
      const auth = await requireAuth(request);
      if (!auth.ok) return auth.response;

      const authz = requirePermission(auth.auth, "edit");
      if (!authz.ok) return authz.response;

      const { id } = await context.params;
      if (!id || !isValidUUID(id)) {
        return badRequest("Invalid ID format");
      }

      // Fetch current record for diff
      const [existing] = await db
        .select()
        .from(config.table)
        .where(eq((config.table as any).id, id))
        .limit(1);

      if (!existing) {
        return notFound(`${config.entityType} not found`);
      }

      const parsed = await parseBody(request, config.updateSchema);
      if ("error" in parsed) return parsed.error;

      const [updated] = await db
        .update(config.table)
        .set(parsed.data as any)
        .where(eq((config.table as any).id, id))
        .returning();

      if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
        const diff = computeDiff(
          existing as Record<string, unknown>,
          parsed.data as Record<string, unknown>
        );

        await writeAuditLog({
          auth: auth.auth,
          action: "update",
          targetType: config.entityType,
          targetId: id,
          targetDisplayName: (updated as any).name ?? undefined,
          diff: diff as Record<string, unknown> | undefined,
          request,
        });
      }

      return ok(updated);
    }
  );
}

/**
 * Create a DELETE handler for removing an entity.
 */
export function createDeleteHandler<TTable extends PgTableWithColumns<any>>(
  config: CrudConfig<TTable>
) {
  return withErrorHandler(
    async (request: Request, context: { params: Promise<Record<string, string>> }) => {
      const auth = await requireAuth(request);
      if (!auth.ok) return auth.response;

      const authz = requirePermission(auth.auth, "delete");
      if (!authz.ok) return authz.response;

      const { id } = await context.params;
      if (!id || !isValidUUID(id)) {
        return badRequest("Invalid ID format");
      }

      const [existing] = await db
        .select()
        .from(config.table)
        .where(eq((config.table as any).id, id))
        .limit(1);

      if (!existing) {
        return notFound(`${config.entityType} not found`);
      }

      await db.delete(config.table).where(eq((config.table as any).id, id));

      if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
        await writeAuditLog({
          auth: auth.auth,
          action: "delete",
          targetType: config.entityType,
          targetId: id,
          targetDisplayName: (existing as any).name ?? undefined,
          request,
        });
      }

      return noContent();
    }
  );
}

// ── Utilities ───────────────────────────────────────────────────────────────

/** UUID v4 format validation. */
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
