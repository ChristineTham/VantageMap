/**
 * Phase 11.1 — Tags API (nested under tag groups)
 *
 * GET  /api/tag-groups/:id/tags — List tags in a group
 * POST /api/tag-groups/:id/tags — Create a tag in a group
 */

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tags, tagGroups } from "@/db/schema";
import { ok, created, notFound, withErrorHandler, parseBody } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

const createTagSchema = z.object({
  name: z.string().min(1).max(255),
  color: z.string().max(50).nullish(),
});

export const GET = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "view");
    if (!authz.ok) return authz.response;

    // Verify tag group exists
    const [group] = await db.select().from(tagGroups).where(eq(tagGroups.id, id)).limit(1);
    if (!group) return notFound("Tag group not found");

    const items = await db.select().from(tags).where(eq(tags.tagGroupId, id));
    return ok(items);
  }
);

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "create");
    if (!authz.ok) return authz.response;

    // Verify tag group exists
    const [group] = await db.select().from(tagGroups).where(eq(tagGroups.id, id)).limit(1);
    if (!group) return notFound("Tag group not found");

    const body = await parseBody(request, createTagSchema);
    if ("error" in body) return body.error;

    const [tag] = await db
      .insert(tags)
      .values({ tagGroupId: id, name: body.data.name, color: body.data.color ?? null })
      .returning();

    return created(tag);
  }
);
