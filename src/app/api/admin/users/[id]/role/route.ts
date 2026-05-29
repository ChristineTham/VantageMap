/**
 * Phase 10.3 — Change User Role API
 *
 * PATCH /api/admin/users/[id]/role — Update a user's workspace role
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { userWorkspaceRoles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { ok, notFound, withErrorHandler, parseBody } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["Viewer", "Member", "Admin"]),
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

  const parsed = await parseBody(request, roleSchema);
  if (!parsed.ok) return parsed.response;

  const { role } = parsed.data;

  // Find existing role assignment
  const [existing] = await db
    .select()
    .from(userWorkspaceRoles)
    .where(
      and(
        eq(userWorkspaceRoles.userId, id),
        eq(userWorkspaceRoles.workspaceId, auth.auth.workspaceId)
      )
    )
    .limit(1);

  if (!existing) {
    // Create new role assignment
    await db.insert(userWorkspaceRoles).values({
      userId: id,
      workspaceId: auth.auth.workspaceId,
      role: role as "Viewer" | "Member" | "Admin",
    });
  } else {
    // Update existing
    await db
      .update(userWorkspaceRoles)
      .set({ role: role as "Viewer" | "Member" | "Admin" })
      .where(eq(userWorkspaceRoles.id, existing.id));
  }

  await writeAuditLog({
    auth: auth.auth,
    action: "update",
    targetType: "User",
    targetId: id,
    oldRecord: existing ? { role: existing.role } : undefined,
    newRecord: { role },
    request,
  });

  return ok({ userId: id, role });
});
