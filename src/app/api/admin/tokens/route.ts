/**
 * Phase 10.4 — API Token Management Routes
 *
 * GET /api/admin/tokens — List all tokens (metadata only, no secrets)
 * POST /api/admin/tokens — Create a new token (returns full token ONCE)
 */

import { db } from "@/db";
import { apiTokens } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { list, created, withErrorHandler, parseBody } from "@/lib/api-response";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";

// ── GET: List tokens ────────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "manage_users");
  if (!authz.ok) return authz.response;

  const tokens = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      prefix: apiTokens.prefix,
      expiresAt: apiTokens.expiresAt,
      lastUsedAt: apiTokens.lastUsedAt,
      createdAt: apiTokens.createdAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.workspaceId, auth.auth.workspaceId))
    .orderBy(desc(apiTokens.createdAt));

  return list(tokens, { page: 1, pageSize: 100, total: tokens.length, totalPages: 1 });
});

// ── POST: Create token ──────────────────────────────────────────────────────

const createTokenSchema = z.object({
  name: z.string().min(1).max(255),
  expiresInDays: z.number().int().positive().optional(),
});

export const POST = withErrorHandler(async (request: Request) => {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const authz = requirePermission(auth.auth, "manage_users");
  if (!authz.ok) return authz.response;

  const parsed = await parseBody(request, createTokenSchema);
  if ("error" in parsed) return parsed.error;

  const { name, expiresInDays } = parsed.data;

  // Generate a secure random token
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = `vmap_${Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
  const prefix = token.slice(0, 12);

  // Hash the token for storage (using SHA-256)
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Calculate expiry
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const [record] = await db
    .insert(apiTokens)
    .values({
      name,
      tokenHash,
      prefix,
      userId: auth.auth.userId,
      workspaceId: auth.auth.workspaceId,
      expiresAt,
    })
    .returning({
      id: apiTokens.id,
      name: apiTokens.name,
      prefix: apiTokens.prefix,
      expiresAt: apiTokens.expiresAt,
      createdAt: apiTokens.createdAt,
    });

  // Return full token — shown ONCE only
  return created({ ...record, token });
});
