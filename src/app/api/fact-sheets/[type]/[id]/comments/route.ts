/**
 * Phase 11.4 — Comments API (per fact sheet)
 *
 * GET  /api/fact-sheets/:type/:id/comments — List comments (threaded)
 * POST /api/fact-sheets/:type/:id/comments — Create a comment or reply
 */

import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { comments } from "@/db/schema";
import {
  ok,
  created,
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

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().uuid().nullish(),
  mentions: z.array(z.string().uuid()).optional(),
});

export const GET = withErrorHandler(
  async (
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
  ) => {
    const { type, id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "view");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    // Get top-level comments (no parent)
    const topLevel = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.factSheetType, type as FactSheetType),
          eq(comments.factSheetId, id),
          isNull(comments.parentId)
        )
      )
      .orderBy(desc(comments.createdAt));

    // Get all replies for this fact sheet
    const allReplies = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.factSheetType, type as FactSheetType),
          eq(comments.factSheetId, id)
        )
      )
      .orderBy(comments.createdAt);

    // Build threaded structure
    const repliesMap = new Map<string, typeof allReplies>();
    for (const reply of allReplies) {
      if (reply.parentId) {
        const existing = repliesMap.get(reply.parentId) ?? [];
        existing.push(reply);
        repliesMap.set(reply.parentId, existing);
      }
    }

    const threaded = topLevel.map((comment) => ({
      ...comment,
      replies: repliesMap.get(comment.id) ?? [],
    }));

    return ok(threaded);
  }
);

export const POST = withErrorHandler(
  async (
    request: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
  ) => {
    const { type, id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "create");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    const body = await parseBody(request, createCommentSchema);
    if (!body.ok) return body.response;

    const [comment] = await db
      .insert(comments)
      .values({
        factSheetType: type as FactSheetType,
        factSheetId: id,
        authorId: auth.auth.userId,
        parentId: body.data.parentId ?? null,
        content: body.data.content,
        mentions: body.data.mentions ?? null,
      })
      .returning();

    return created(comment);
  }
);
