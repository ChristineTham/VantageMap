/**
 * Phase 11.6 — Surveys API (individual)
 *
 * GET    /api/surveys/:id — Get survey with questions and response summary
 * PATCH  /api/surveys/:id — Update survey metadata (status, title, etc.)
 * DELETE /api/surveys/:id — Delete a survey
 */

import { eq, count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { surveys, surveyQuestions, surveyResponses } from "@/db/schema";
import {
  ok,
  noContent,
  notFound,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

const updateSurveySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullish(),
  status: z.enum(["draft", "active", "closed"]).optional(),
  closesAt: z.string().datetime().nullish(),
});

export const GET = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "view");
    if (!authz.ok) return authz.response;

    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
    if (!survey) return notFound("Survey not found");

    const questions = await db
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.surveyId, id))
      .orderBy(surveyQuestions.sortOrder);

    // Count unique respondents
    const [responseCount] = await db
      .select({ value: count() })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, id));

    return ok({
      ...survey,
      questions,
      responseCount: responseCount?.value ?? 0,
    });
  }
);

export const PATCH = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "edit");
    if (!authz.ok) return authz.response;

    const body = await parseBody(request, updateSurveySchema);
    if (!body.ok) return body.response;

    const updates: Record<string, unknown> = {};
    if (body.data.title !== undefined) updates.title = body.data.title;
    if (body.data.description !== undefined) updates.description = body.data.description;
    if (body.data.status !== undefined) updates.status = body.data.status;
    if (body.data.closesAt !== undefined) {
      updates.closesAt = body.data.closesAt ? new Date(body.data.closesAt) : null;
    }

    const [updated] = await db
      .update(surveys)
      .set(updates)
      .where(eq(surveys.id, id))
      .returning();

    if (!updated) return notFound("Survey not found");
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

    const deleted = await db.delete(surveys).where(eq(surveys.id, id)).returning();
    if (deleted.length === 0) return notFound("Survey not found");
    return noContent();
  }
);
