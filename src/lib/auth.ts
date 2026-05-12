/**
 * Step 4.2 — Authentication Middleware
 *
 * Extracts and validates the authenticated user from the request.
 * Supports two auth modes:
 *   1. Session-based (Better Auth cookie) — for browser users
 *   2. Bearer token — for technical users / API clients
 *
 * Returns an AuthContext with the user's identity and role,
 * or a 401 response if authentication fails.
 *
 * Better Auth integration is wired up in Phase 10. Until then,
 * this module provides a pluggable auth interface so all API routes
 * can be built auth-aware from day one.
 */

import { db } from "@/db";
import { users, userWorkspaceRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unauthorized, type ApiErrorBody } from "@/lib/api-response";
import type { NextResponse } from "next/server";

// ── Types ───────────────────────────────────────────────────────────────────

export type StandardRole = "Viewer" | "Member" | "Admin";

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  role: StandardRole;
  workspaceId: string;
}

type AuthResult =
  | { ok: true; auth: AuthContext }
  | { ok: false; response: NextResponse<ApiErrorBody> };

// ── Header Extraction ───────────────────────────────────────────────────────

/**
 * Extract Bearer token from the Authorization header.
 * Returns null if the header is missing or malformed.
 */
function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

/**
 * Extract session token from cookies.
 * Better Auth stores session in a cookie named `better-auth.session_token`.
 * Returns null if the cookie is not present.
 */
function extractSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  // Parse the cookie header manually to avoid importing a cookie library
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("better-auth.session_token="));

  if (!match) return null;
  return match.split("=").slice(1).join("=") || null;
}

// ── Authentication Functions ────────────────────────────────────────────────

/**
 * Authenticate a request.
 *
 * Checks in order:
 *   1. Bearer token (API / technical user)
 *   2. Session cookie (browser user)
 *
 * For MVP (before Better Auth is fully wired), this uses a dev-mode
 * bypass: if the `x-dev-user-id` header is set and NODE_ENV is
 * "development", it looks up the user directly.
 *
 * Returns an AuthResult with either the authenticated context or a 401 response.
 */
export async function authenticate(request: Request): Promise<AuthResult> {
  // ── Dev-mode bypass (development only) ──────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    const devUserId = request.headers.get("x-dev-user-id");
    if (devUserId) {
      return resolveUserContext(devUserId);
    }
  }

  // ── Bearer token authentication ─────────────────────────────────────────
  const bearerToken = extractBearerToken(request);
  if (bearerToken) {
    return authenticateWithToken(bearerToken);
  }

  // ── Session cookie authentication ───────────────────────────────────────
  const sessionToken = extractSessionToken(request);
  if (sessionToken) {
    return authenticateWithSession(sessionToken);
  }

  return { ok: false, response: unauthorized() };
}

/**
 * Authenticate using a Bearer token.
 * Phase 10 will integrate with Better Auth's API token system.
 * For now, tokens are not validated — this returns 401.
 */
async function authenticateWithToken(
  _token: string
): Promise<AuthResult> {
  // TODO: Phase 10 — validate token via Better Auth
  // For now, bearer tokens are not yet supported
  return {
    ok: false,
    response: unauthorized("Bearer token authentication not yet configured"),
  };
}

/**
 * Authenticate using a session cookie.
 * Phase 10 will integrate with Better Auth's session validation.
 * For now, sessions are not validated — this returns 401.
 */
async function authenticateWithSession(
  _sessionToken: string
): Promise<AuthResult> {
  // TODO: Phase 10 — validate session via Better Auth
  return {
    ok: false,
    response: unauthorized("Session authentication not yet configured"),
  };
}

/**
 * Resolve a user ID into a full AuthContext by querying the database.
 * Looks up the user and their workspace role.
 */
async function resolveUserContext(userId: string): Promise<AuthResult> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.status !== "Active") {
    return { ok: false, response: unauthorized("User not found or inactive") };
  }

  // Get the user's workspace role (first workspace for now)
  const [workspaceRole] = await db
    .select()
    .from(userWorkspaceRoles)
    .where(eq(userWorkspaceRoles.userId, userId))
    .limit(1);

  if (!workspaceRole) {
    return {
      ok: false,
      response: unauthorized("User has no workspace access"),
    };
  }

  return {
    ok: true,
    auth: {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: workspaceRole.role as StandardRole,
      workspaceId: workspaceRole.workspaceId,
    },
  };
}

// ── Convenience: require auth in a route handler ────────────────────────────

/**
 * Extract auth context from a request, or return early with a 401.
 *
 * @example
 * export const GET = withErrorHandler(async (req) => {
 *   const auth = await requireAuth(req);
 *   if (!auth.ok) return auth.response;
 *   const { userId, role } = auth.auth;
 *   // ...
 * });
 */
export { authenticate as requireAuth };
