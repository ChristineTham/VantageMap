/**
 * Phase 10.3 — Invite User API
 *
 * POST /api/admin/users/invite — Create an invited user record
 */

import { db } from "@/db";
import { users, userWorkspaceRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { created, conflict, withErrorHandler, parseBody } from "@/lib/api-response";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["Viewer", "Member", "Admin"]).default("Member"),
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "manage_users");
  if (!authz.ok) return authz.response;

  const parsed = await parseBody(request, inviteSchema);
  if ("error" in parsed) return parsed.error;

  const { email, role } = parsed.data;

  // Check if user already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    return conflict(`User with email ${email} already exists`);
  }

  // Create invited user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name: email.split("@")[0], // Placeholder name until they register
      status: "Invited",
      emailVerified: false,
    })
    .returning();

  // Assign workspace role
  await db.insert(userWorkspaceRoles).values({
    userId: newUser.id,
    workspaceId: auth.auth.workspaceId,
    role: role as "Viewer" | "Member" | "Admin",
  });

  return created({ id: newUser.id, email, role, status: "Invited" });
});
