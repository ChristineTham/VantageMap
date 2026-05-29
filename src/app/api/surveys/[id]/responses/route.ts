/**
 * Phase 11.6 — Survey Responses API
 *
 * GET  /api/surveys/:id/responses — Get all responses (admin)
 * POST /api/surveys/:id/responses — Submit responses to a survey
 */

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { surveys, surveyQuestions, surveyResponses } from "@/db/schema";
import { ok, created, notFound, badRequest, withErrorHandler, parseBody } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

const submitResponsesSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: z.string().max(5000),
      })
    )
    .min(1),
});

export const GET = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "view");
    if (!authz.ok) return authz.response;

    // Verify survey exists
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
    if (!survey) return notFound("Survey not found");

    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, id));

    return ok(responses);
  }
);

export const POST = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;

    const authz = requirePermission(auth.auth, "create");
    if (!authz.ok) return authz.response;

    // Verify survey exists and is active
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
    if (!survey) return notFound("Survey not found");
    if (survey.status !== "active") {
      return badRequest("Survey is not currently accepting responses");
    }

    // Check if survey has expired
    if (survey.closesAt && new Date(survey.closesAt) < new Date()) {
      return badRequest("Survey has closed");
    }

    const body = await parseBody(request, submitResponsesSchema);
    if ("error" in body) return body.error;

    // Validate that all question IDs belong to this survey
    const questions = await db
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.surveyId, id));

    const questionIds = new Set(questions.map((q) => q.id));
    for (const answer of body.data.answers) {
      if (!questionIds.has(answer.questionId)) {
        return badRequest(`Question ${answer.questionId} does not belong to this survey`);
      }
    }

    // Upsert responses (allow re-submission by same user)
    const responseValues = body.data.answers.map((a) => ({
      surveyId: id,
      questionId: a.questionId,
      respondentId: auth.auth.userId,
      value: a.value,
    }));

    // Delete existing responses for this user and re-insert
    await db
      .delete(surveyResponses)
      .where(
        and(eq(surveyResponses.surveyId, id), eq(surveyResponses.respondentId, auth.auth.userId))
      );

    const responses = await db.insert(surveyResponses).values(responseValues).returning();

    return created(responses);
  }
);
