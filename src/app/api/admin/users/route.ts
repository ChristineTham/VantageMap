/**
 * Phase 10.3 — Admin Users API
 *
 * GET /api/admin/users — List all users (Admin only)
 * POST /api/admin/users — Not used (invite flow instead)
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, userWorkspaceRoles } from "@/db/schema";
import { eq, like, or, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { ok, list, withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "manage_users");
  if (!authz.ok) return authz.response;

  const { searchParams } = new URL(request.url);
  const searchName = searchParams.get("search[name]");
  const filterStatus = searchParams.get("filter[status]");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50"), 200);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .$dynamic();

  // Apply filters
  const conditions = [];
  if (searchName) {
    conditions.push(
      or(
        like(users.name, `%${searchName}%`),
        like(users.email, `%${searchName}%`)
      )
    );
  }
  if (filterStatus) {
    conditions.push(eq(users.status, filterStatus as "Active" | "Invited" | "Requested" | "Not Invited" | "Archived"));
  }

  if (conditions.length > 0) {
    for (const condition of conditions) {
      if (condition) {
        query = query.where(condition);
      }
    }
  }

  const results = await query
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get roles for each user
  const userIds = results.map((u) => u.id);
  const roles = userIds.length > 0
    ? await db
        .select({
          userId: userWorkspaceRoles.userId,
          role: userWorkspaceRoles.role,
        })
        .from(userWorkspaceRoles)
        .where(eq(userWorkspaceRoles.workspaceId, auth.auth.workspaceId))
    : [];

  const roleMap = new Map(roles.map((r) => [r.userId, r.role]));

  const data = results.map((u) => ({
    ...u,
    role: roleMap.get(u.id) || "Viewer",
  }));

  return list(data, { page, pageSize, total: data.length });
});
