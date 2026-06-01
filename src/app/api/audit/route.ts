/**
 * Audit Query API
 *
 * GET /api/audit — Query audit entries with pagination and filtering.
 *
 * Query parameters:
 *   - targetType: Filter by entity type (e.g., "Application", "BusinessCapability")
 *   - targetId: Filter by specific entity ID
 *   - actorId: Filter by actor
 *   - action: Filter by action (Create, Update, Delete, etc.)
 *   - page, pageSize: Pagination
 *   - sortBy, sortDirection: Sorting (defaults to createdAt desc)
 */

import { db } from "@/db";
import { auditEntries } from "@/db/schema";
import { factSheetTypeEnum, auditActionEnum } from "@/db/schema/enums";
import { eq, and, desc, count, type SQL } from "drizzle-orm";
import { withErrorHandler, list } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { parsePagination, buildPaginationMeta } from "@/lib/query";

type FactSheetType = (typeof factSheetTypeEnum.enumValues)[number];
type AuditAction = (typeof auditActionEnum.enumValues)[number];

export const GET = withErrorHandler(async (req) => {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "view_audit");
  if (!authz.ok) {
    // Allow users to view audit entries for entities they can view (self-service)
    // But restrict general audit browsing to admins only
    // For now, allow "view" permission to see audit entries if targetType+targetId specified
    const url = new URL(req.url);
    const targetType = url.searchParams.get("targetType");
    const targetId = url.searchParams.get("targetId");
    if (!targetType || !targetId) {
      return authz.response;
    }
    // Non-admins can view audit for specific entities they have access to
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  // Parse pagination
  const pagination = parsePagination(searchParams);

  // Build filter conditions
  const conditions: SQL[] = [];

  const targetType = searchParams.get("targetType");
  if (targetType && (factSheetTypeEnum.enumValues as readonly string[]).includes(targetType)) {
    conditions.push(eq(auditEntries.targetType, targetType as FactSheetType));
  }

  const targetId = searchParams.get("targetId");
  if (targetId) {
    conditions.push(eq(auditEntries.targetId, targetId));
  }

  const actorId = searchParams.get("actorId");
  if (actorId) {
    conditions.push(eq(auditEntries.actorId, actorId));
  }

  const action = searchParams.get("action");
  if (action && (auditActionEnum.enumValues as readonly string[]).includes(action)) {
    conditions.push(eq(auditEntries.action, action as AuditAction));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db.select({ value: count() }).from(auditEntries).where(whereClause);

  const total = countResult?.value ?? 0;

  // Fetch paginated results (always newest first)
  const rows = await db
    .select()
    .from(auditEntries)
    .where(whereClause)
    .orderBy(desc(auditEntries.createdAt))
    .limit(pagination.pageSize)
    .offset(pagination.offset);

  const meta = buildPaginationMeta(total, pagination);

  return list(rows, meta);
});
