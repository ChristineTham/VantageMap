/**
 * Step 6.1 — Relationship CRUD API (individual)
 *
 * GET    /api/relationships/[id] — Get a single relationship by ID
 * PATCH  /api/relationships/[id] — Update relationship metadata/description
 * DELETE /api/relationships/[id] — Delete a relationship
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { relationships } from "@/db/schema";
import {
  ok,
  noContent,
  notFound,
  badRequest,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog, computeDiff } from "@/lib/audit";
import { isFeatureEnabled } from "@/lib/feature-flags";

// ── Schemas ─────────────────────────────────────────────────────────────────

const updateSchema = z.object({
  description: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});

// ── UUID Validation ─────────────────────────────────────────────────────────

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ── GET /api/relationships/[id] ─────────────────────────────────────────────

export const GET = withErrorHandler(
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
      .from(relationships)
      .where(eq(relationships.id, id))
      .limit(1);

    if (!row) {
      return notFound("Relationship not found");
    }

    return ok(row);
  }
);

// ── PATCH /api/relationships/[id] ───────────────────────────────────────────

export const PATCH = withErrorHandler(
  async (request: Request, context: { params: Promise<Record<string, string>> }) => {
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "edit");
    if (!authz.ok) return authz.response;

    const { id } = await context.params;
    if (!id || !isValidUUID(id)) {
      return badRequest("Invalid ID format");
    }

    const [existing] = await db
      .select()
      .from(relationships)
      .where(eq(relationships.id, id))
      .limit(1);

    if (!existing) {
      return notFound("Relationship not found");
    }

    const parsed = await parseBody(request, updateSchema);
    if ("error" in parsed) return parsed.error;

    const [updated] = await db
      .update(relationships)
      .set(parsed.data)
      .where(eq(relationships.id, id))
      .returning();

    if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
      const diff = computeDiff(
        existing as unknown as Record<string, unknown>,
        parsed.data as Record<string, unknown>
      );

      await writeAuditLog({
        auth: auth.auth,
        action: "update",
        targetType: "BusinessCapability",
        targetId: id,
        targetDisplayName: `${updated.sourceType}→${updated.targetType} (${updated.relationshipType})`,
        diff: diff as Record<string, unknown> | undefined,
        request,
      });
    }

    return ok(updated);
  }
);

// ── DELETE /api/relationships/[id] ──────────────────────────────────────────

export const DELETE = withErrorHandler(
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
      .from(relationships)
      .where(eq(relationships.id, id))
      .limit(1);

    if (!existing) {
      return notFound("Relationship not found");
    }

    await db.delete(relationships).where(eq(relationships.id, id));

    if (isFeatureEnabled("FEATURE_AUDIT_LOGGING")) {
      await writeAuditLog({
        auth: auth.auth,
        action: "delete",
        targetType: "BusinessCapability",
        targetId: id,
        targetDisplayName: `${existing.sourceType}→${existing.targetType} (${existing.relationshipType})`,
        request,
      });
    }

    return noContent();
  }
);
