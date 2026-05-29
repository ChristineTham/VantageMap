/**
 * Phase 11.5 — Todos API (per fact sheet)
 *
 * GET  /api/fact-sheets/:type/:id/todos — List todos for a fact sheet
 * POST /api/fact-sheets/:type/:id/todos — Create a todo on a fact sheet
 */

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { ok, created, badRequest, withErrorHandler, parseBody } from "@/lib/api-response";
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

const createTodoSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullish(),
  assigneeId: z.string().uuid().nullish(),
  dueDate: z.string().datetime().nullish(),
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

    const items = await db
      .select()
      .from(todos)
      .where(and(eq(todos.factSheetType, type as FactSheetType), eq(todos.factSheetId, id)))
      .orderBy(todos.createdAt);

    return ok(items);
  }
);

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ type: string; id: string }> }) => {
    const { type, id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "create");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    const body = await parseBody(request, createTodoSchema);
    if ("error" in body) return body.error;

    const [todo] = await db
      .insert(todos)
      .values({
        factSheetType: type as FactSheetType,
        factSheetId: id,
        title: body.data.title,
        description: body.data.description ?? null,
        assigneeId: body.data.assigneeId ?? null,
        createdById: auth.auth.userId,
        dueDate: body.data.dueDate ? new Date(body.data.dueDate) : null,
      })
      .returning();

    return created(todo);
  }
);
