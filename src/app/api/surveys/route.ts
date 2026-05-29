/**
 * Phase 11.6 — Surveys API (collection)
 *
 * GET  /api/surveys — List surveys (with optional status filter)
 * POST /api/surveys — Create a new survey
 */

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { surveys, surveyQuestions } from "@/db/schema";
import {
  ok,
  created,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";

const createSurveySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).nullish(),
  factSheetType: z
    .enum([
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
    ])
    .nullish(),
  factSheetId: z.string().uuid().nullish(),
  closesAt: z.string().datetime().nullish(),
  questions: z.array(
    z.object({
      questionText: z.string().min(1).max(1000),
      questionType: z.enum(["text", "select", "rating", "boolean"]).default("text"),
      options: z.array(z.string()).nullish(),
      targetField: z.string().max(255).nullish(),
      required: z.boolean().default(false),
    })
  ).min(1),
});

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "view");
  if (!authz.ok) return authz.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let items;
  if (status) {
    items = await db.select().from(surveys).where(eq(surveys.status, status));
  } else {
    items = await db.select().from(surveys);
  }

  return ok(items);
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "create");
  if (!authz.ok) return authz.response;

  const body = await parseBody(request, createSurveySchema);
  if (!body.ok) return body.response;

  // Create survey
  const [survey] = await db
    .insert(surveys)
    .values({
      title: body.data.title,
      description: body.data.description ?? null,
      createdById: auth.auth.userId,
      factSheetType: body.data.factSheetType ?? null,
      factSheetId: body.data.factSheetId ?? null,
      closesAt: body.data.closesAt ? new Date(body.data.closesAt) : null,
    })
    .returning();

  // Create questions
  const questionValues = body.data.questions.map((q, idx) => ({
    surveyId: survey.id,
    questionText: q.questionText,
    questionType: q.questionType,
    options: q.options ?? null,
    targetField: q.targetField ?? null,
    sortOrder: idx,
    required: q.required,
  }));

  const questions = await db
    .insert(surveyQuestions)
    .values(questionValues)
    .returning();

  return created({ ...survey, questions });
});
