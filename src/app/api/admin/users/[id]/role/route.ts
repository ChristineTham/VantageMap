/**
 * Phase 10.3 — Change User Role API
 *
 * PATCH /api/admin/users/[id]/role — Update a user's workspace role
 */

import { db } from "@/db";
import { userWorkspaceRoles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { ok, withErrorHandler, parseBody } from "@/lib/api-response";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["Viewer", "Member", "Admin"]),
});

export const PATCH = withErrorHandler(
  async (request: Request, { params }: { params: Promise<Record<string, string>> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "manage_users");
    if (!authz.ok) return authz.response;

    const parsed = await parseBody(request, roleSchema);
    if ("error" in parsed) return parsed.error;

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

    return ok({ userId: id, role });
  }
);
