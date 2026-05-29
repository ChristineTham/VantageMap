/**
 * Phase 11.5 — Todos API (individual)
 *
 * PATCH  /api/todos/:id — Update a todo (toggle done, change assignee, etc.)
 * DELETE /api/todos/:id — Delete a todo
 */

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { todos } from "@/db/schema";
import {
  ok,
  noContent,
  notFound,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

const updateTodoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).nullish(),
  assigneeId: z.string().uuid().nullish(),
  done: z.boolean().optional(),
  dueDate: z.string().datetime().nullish(),
});

export const PATCH = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "edit");
    if (!authz.ok) return authz.response;

    const body = await parseBody(request, updateTodoSchema);
    if ("error" in body) return body.error;

    // Build update object
    const updates: Record<string, unknown> = {};
    if (body.data.title !== undefined) updates.title = body.data.title;
    if (body.data.description !== undefined) updates.description = body.data.description;
    if (body.data.assigneeId !== undefined) updates.assigneeId = body.data.assigneeId;
    if (body.data.dueDate !== undefined) {
      updates.dueDate = body.data.dueDate ? new Date(body.data.dueDate) : null;
    }
    if (body.data.done !== undefined) {
      updates.done = body.data.done;
      updates.completedAt = body.data.done ? new Date() : null;
    }

    const [updated] = await db
      .update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();

    if (!updated) return notFound("Todo not found");
    return ok(updated);
  }
);

export const DELETE = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "delete");
    if (!authz.ok) return authz.response;

    const deleted = await db.delete(todos).where(eq(todos.id, id)).returning();
    if (deleted.length === 0) return notFound("Todo not found");
    return noContent();
  }
);
