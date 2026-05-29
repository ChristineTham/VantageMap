/**
 * Phase 10.3 — Change User Status API
 *
 * PATCH /api/admin/users/[id]/status — Archive or restore a user
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { ok, notFound, badRequest, withErrorHandler, parseBody } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["Active", "Invited", "Archived"]),
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "manage_users");
  if (!authz.ok) return authz.response;

  // Prevent self-archival
  if (id === auth.auth.userId) {
    return badRequest("Cannot change your own status");
  }

  const parsed = await parseBody(request, statusSchema);
  if (!parsed.ok) return parsed.response;

  const { status } = parsed.data;

  // Find user
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!existing) {
    return notFound("User");
  }

  // Update status
  await db
    .update(users)
    .set({ status: status as "Active" | "Invited" | "Archived" })
    .where(eq(users.id, id));

  await writeAuditLog({
    auth: auth.auth,
    action: "update",
    targetType: "User",
    targetId: id,
    oldRecord: { status: existing.status },
    newRecord: { status },
    request,
  });

  return ok({ userId: id, status });
});
