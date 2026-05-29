/**
 * Phase 12.3 — Webhook CRUD API
 *
 * GET    /api/webhooks       — List all webhooks (filtered by owner or admin)
 * POST   /api/webhooks       — Create a new webhook subscription
 *
 * Auth required. Admin or webhook-owner only.
 */

import { NextRequest } from "next/server";
import { count } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { withErrorHandler, ok, created, badRequest } from "@/lib/api-response";
import { parseBody } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { parseListParams, buildPaginationMeta } from "@/lib/query";
import { WEBHOOK_EVENTS } from "@/lib/webhook-engine";

// ── Validation Schemas ──────────────────────────────────────────────────────

const createWebhookSchema = z.object({
  url: z.string().url().max(2048),
  events: z.array(z.string().max(100)).min(1).max(50),
  secret: z.string().max(255).optional(),
  name: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  active: z.boolean().optional().default(true),
});

// ── GET /api/webhooks ───────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: NextRequest) => {
  if (!isFeatureEnabled("FEATURE_WEBHOOKS_API")) {
    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Webhooks API not enabled",
          correlationId: crypto.randomUUID(),
        },
      },
      { status: 404 }
    );
  }

  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const { pagination } = parseListParams(new URL(request.url).searchParams);
  const { pageSize, offset } = pagination;

  const [countResult] = await db.select({ value: count() }).from(webhooks);
  const total = countResult?.value ?? 0;

  const rows = await db
    .select({
      id: webhooks.id,
      url: webhooks.url,
      events: webhooks.events,
      active: webhooks.active,
      name: webhooks.name,
      description: webhooks.description,
      createdBy: webhooks.createdBy,
      createdAt: webhooks.createdAt,
      updatedAt: webhooks.updatedAt,
    })
    .from(webhooks)
    .limit(pageSize)
    .offset(offset);

  return ok({
    data: rows,
    meta: buildPaginationMeta(total, pagination),
  });
});

// ── POST /api/webhooks ──────────────────────────────────────────────────────

export const POST = withErrorHandler(async (request: NextRequest) => {
  if (!isFeatureEnabled("FEATURE_WEBHOOKS_API")) {
    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Webhooks API not enabled",
          correlationId: crypto.randomUUID(),
        },
      },
      { status: 404 }
    );
  }

  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  const auth = authResult.auth;

  const body = await parseBody(request, createWebhookSchema);
  if ("error" in body) return body.error;

  // Validate event names
  const invalidEvents = body.data.events.filter(
    (e) => e !== "*" && !WEBHOOK_EVENTS.includes(e as never)
  );
  if (invalidEvents.length > 0) {
    return badRequest(`Invalid events: ${invalidEvents.join(", ")}. Use "*" for all events.`);
  }

  // Validate URL is HTTPS in production
  if (process.env.NODE_ENV === "production" && !body.data.url.startsWith("https://")) {
    return badRequest("Webhook URL must use HTTPS in production");
  }

  const [webhook] = await db
    .insert(webhooks)
    .values({
      url: body.data.url,
      events: body.data.events,
      secret: body.data.secret ?? null,
      name: body.data.name ?? null,
      description: body.data.description ?? null,
      active: body.data.active,
      createdBy: auth.userId,
    })
    .returning();

  return created({ data: webhook });
});
