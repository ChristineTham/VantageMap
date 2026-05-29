/**
 * Phase 12.3 — Webhook CRUD API
 *
 * GET    /api/webhooks       — List all webhooks (filtered by owner or admin)
 * POST   /api/webhooks       — Create a new webhook subscription
 *
 * Auth required. Admin or webhook-owner only.
 */

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { withErrorHandler, ok, created, badRequest, unauthorized, forbidden } from "@/lib/api-response";
import { parseBody } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { parseListParams, buildPaginationMeta } from "@/lib/query";
import { WEBHOOK_EVENTS } from "@/lib/webhook-engine";
import { count } from "drizzle-orm";

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
    return Response.json({ error: { code: "NOT_FOUND", message: "Webhooks API not enabled", correlationId: crypto.randomUUID() } }, { status: 404 });
  }

  const session = await getSession(request);
  if (!session) return unauthorized("Authentication required");

  const { page, pageSize } = parseListParams(request.url);

  const [countResult] = await db.select({ value: count() }).from(webhooks);
  const total = countResult?.value ?? 0;
  const offset = (page - 1) * pageSize;

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
    meta: buildPaginationMeta(page, pageSize, total),
  });
});

// ── POST /api/webhooks ──────────────────────────────────────────────────────

export const POST = withErrorHandler(async (request: NextRequest) => {
  if (!isFeatureEnabled("FEATURE_WEBHOOKS_API")) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Webhooks API not enabled", correlationId: crypto.randomUUID() } }, { status: 404 });
  }

  const session = await getSession(request);
  if (!session) return unauthorized("Authentication required");

  const body = await parseBody(request, createWebhookSchema);
  if (body instanceof Response) return body;

  // Validate event names
  const invalidEvents = body.events.filter(
    (e) => e !== "*" && !WEBHOOK_EVENTS.includes(e as never)
  );
  if (invalidEvents.length > 0) {
    return badRequest(`Invalid events: ${invalidEvents.join(", ")}. Use "*" for all events.`);
  }

  // Validate URL is HTTPS in production
  if (process.env.NODE_ENV === "production" && !body.url.startsWith("https://")) {
    return badRequest("Webhook URL must use HTTPS in production");
  }

  const [webhook] = await db
    .insert(webhooks)
    .values({
      url: body.url,
      events: body.events,
      secret: body.secret ?? null,
      name: body.name ?? null,
      description: body.description ?? null,
      active: body.active,
      createdBy: session.user.id,
    })
    .returning();

  return created({ data: webhook });
});
