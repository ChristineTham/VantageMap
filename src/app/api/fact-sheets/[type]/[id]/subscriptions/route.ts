/**
 * Phase 11.2 — Subscriptions API (per fact sheet)
 *
 * GET    /api/fact-sheets/:type/:id/subscriptions — List subscriptions
 * POST   /api/fact-sheets/:type/:id/subscriptions — Subscribe to fact sheet
 * DELETE /api/fact-sheets/:type/:id/subscriptions — Unsubscribe
 */

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
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

const subscribeSchema = z.object({
  role: z.enum(["Responsible", "Accountable", "Observer"]).default("Observer"),
});

const unsubscribeSchema = z.object({
  role: z.enum(["Responsible", "Accountable", "Observer"]),
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

    const items = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.factSheetType, type as FactSheetType),
          eq(subscriptions.factSheetId, id)
        )
      );

    return ok(items);
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

    const body = await parseBody(request, subscribeSchema);
    if (!body.ok) return body.response;

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId: auth.auth.userId,
        factSheetType: type as FactSheetType,
        factSheetId: id,
        role: body.data.role,
      })
      .onConflictDoNothing()
      .returning();

    if (!subscription) {
      return ok({ message: "Already subscribed with this role" });
    }

    return created(subscription);
  }
);

export const DELETE = withErrorHandler(
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

    const body = await parseBody(request, unsubscribeSchema);
    if (!body.ok) return body.response;

    const deleted = await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, auth.auth.userId),
          eq(subscriptions.factSheetType, type as FactSheetType),
          eq(subscriptions.factSheetId, id),
          eq(subscriptions.role, body.data.role)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return notFound("Subscription not found");
    }

    return noContent();
  }
);
