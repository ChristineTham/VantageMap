/**
 * Phase 10.4 — Revoke API Token
 *
 * DELETE /api/admin/tokens/[id] — Revoke (delete) an API token
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { apiTokens } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { noContent, notFound, withErrorHandler } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import { eq, and } from "drizzle-orm";

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "manage_users");
  if (!authz.ok) return authz.response;

  // Find the token (scoped to workspace)
  const [existing] = await db
    .select()
    .from(apiTokens)
    .where(
      and(
        eq(apiTokens.id, id),
        eq(apiTokens.workspaceId, auth.auth.workspaceId)
      )
    )
    .limit(1);

  if (!existing) {
    return notFound("API Token");
  }

  // Delete the token
  await db.delete(apiTokens).where(eq(apiTokens.id, id));

  await writeAuditLog({
    auth: auth.auth,
    action: "delete",
    targetType: "ApiToken",
    targetId: id,
    oldRecord: { name: existing.name, prefix: existing.prefix },
    request,
  });

  return noContent();
});
