/**
 * Phase 11.1 — Tag Assignments API (per fact sheet)
 *
 * GET    /api/fact-sheets/:type/:id/tags — List tags assigned to a fact sheet
 * POST   /api/fact-sheets/:type/:id/tags — Assign a tag to a fact sheet
 * DELETE /api/fact-sheets/:type/:id/tags — Remove a tag assignment
 */

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tagAssignments, tags, tagGroups } from "@/db/schema";
import {
  ok,
  created,
  noContent,
  notFound,
  badRequest,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import type { FactSheetType } from "@/lib/audit-types";

const VALID_TYPES: FactSheetType[] = [
  "BusinessCapability",
  "Organization",
  "BusinessContext",
  "Application",
  "DataObject",
  "Interface",
  "StrategicObjective",
  "Initiative",
  "Platform",
  "TechCategory",
  "ITComponent",
  "Provider",
];

const assignTagSchema = z.object({
  tagId: z.string().uuid(),
});

const removeTagSchema = z.object({
  tagId: z.string().uuid(),
});

export const GET = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ type: string; id: string }> }) => {
    const { type, id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "view");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    // Get assigned tags with tag group info
    const assignments = await db
      .select({
        assignmentId: tagAssignments.id,
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
        tagGroupId: tagGroups.id,
        tagGroupName: tagGroups.name,
        assignedAt: tagAssignments.createdAt,
      })
      .from(tagAssignments)
      .innerJoin(tags, eq(tagAssignments.tagId, tags.id))
      .innerJoin(tagGroups, eq(tags.tagGroupId, tagGroups.id))
      .where(
        and(
          eq(tagAssignments.factSheetType, type as FactSheetType),
          eq(tagAssignments.factSheetId, id)
        )
      );

    return ok(assignments);
  }
);

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ type: string; id: string }> }) => {
    const { type, id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "edit");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    const body = await parseBody(request, assignTagSchema);
    if ("error" in body) return body.error;

    // Verify tag exists
    const [tag] = await db.select().from(tags).where(eq(tags.id, body.data.tagId)).limit(1);
    if (!tag) return notFound("Tag not found");

    const [assignment] = await db
      .insert(tagAssignments)
      .values({
        tagId: body.data.tagId,
        factSheetType: type as FactSheetType,
        factSheetId: id,
      })
      .onConflictDoNothing()
      .returning();

    if (!assignment) {
      return ok({ message: "Tag already assigned" });
    }

    return created(assignment);
  }
);

export const DELETE = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ type: string; id: string }> }) => {
    const { type, id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "edit");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    const body = await parseBody(request, removeTagSchema);
    if ("error" in body) return body.error;

    const deleted = await db
      .delete(tagAssignments)
      .where(
        and(
          eq(tagAssignments.tagId, body.data.tagId),
          eq(tagAssignments.factSheetType, type as FactSheetType),
          eq(tagAssignments.factSheetId, id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return notFound("Tag assignment not found");
    }

    return noContent();
  }
);
