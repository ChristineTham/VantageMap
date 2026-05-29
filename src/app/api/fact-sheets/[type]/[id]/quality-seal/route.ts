/**
 * Phase 11.3 — Quality Seal API (per fact sheet)
 *
 * GET  /api/fact-sheets/:type/:id/quality-seal — Get current state + valid transitions
 * POST /api/fact-sheets/:type/:id/quality-seal — Transition the quality seal state
 */

import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { qualitySealTransitions } from "@/db/schema";
import {
  ok,
  created,
  badRequest,
  forbidden,
  withErrorHandler,
  parseBody,
} from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import {
  type QualitySealState,
  getValidTransitions,
  isTransitionAllowed,
} from "@/lib/quality-seal";
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

const transitionSchema = z.object({
  toState: z.enum(["Draft", "Check Needed", "Approved", "Rejected"]),
  reason: z.string().max(1000).optional(),
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

    // Get the latest transition to determine current state
    const [latest] = await db
      .select()
      .from(qualitySealTransitions)
      .where(
        and(
          eq(qualitySealTransitions.factSheetType, type as FactSheetType),
          eq(qualitySealTransitions.factSheetId, id)
        )
      )
      .orderBy(desc(qualitySealTransitions.createdAt))
      .limit(1);

    const currentState: QualitySealState = latest ? (latest.toState as QualitySealState) : "Draft";
    const validTransitions = getValidTransitions(currentState, auth.auth.role);

    // Get transition history
    const history = await db
      .select()
      .from(qualitySealTransitions)
      .where(
        and(
          eq(qualitySealTransitions.factSheetType, type as FactSheetType),
          eq(qualitySealTransitions.factSheetId, id)
        )
      )
      .orderBy(desc(qualitySealTransitions.createdAt))
      .limit(20);

    return ok({
      currentState,
      validTransitions: validTransitions.map((t) => ({
        toState: t.to,
        label: t.label,
      })),
      history,
    });
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

    const authz = requirePermission(auth.auth, "edit");
    if (!authz.ok) return authz.response;

    if (!VALID_TYPES.includes(type as FactSheetType)) {
      return badRequest(`Invalid fact sheet type: ${type}`);
    }

    const body = await parseBody(request, transitionSchema);
    if (!body.ok) return body.response;

    // Determine current state
    const [latest] = await db
      .select()
      .from(qualitySealTransitions)
      .where(
        and(
          eq(qualitySealTransitions.factSheetType, type as FactSheetType),
          eq(qualitySealTransitions.factSheetId, id)
        )
      )
      .orderBy(desc(qualitySealTransitions.createdAt))
      .limit(1);

    const currentState: QualitySealState = latest ? (latest.toState as QualitySealState) : "Draft";
    const targetState = body.data.toState as QualitySealState;

    // Validate transition
    if (!isTransitionAllowed(currentState, targetState, auth.auth.role)) {
      return forbidden(
        `Transition from '${currentState}' to '${targetState}' is not allowed for role '${auth.auth.role}'`
      );
    }

    // Record the transition
    const [transition] = await db
      .insert(qualitySealTransitions)
      .values({
        factSheetType: type as FactSheetType,
        factSheetId: id,
        fromState: currentState,
        toState: targetState,
        actorId: auth.auth.userId,
        reason: body.data.reason ?? null,
      })
      .returning();

    return created({
      transition,
      newState: targetState,
    });
  }
);
