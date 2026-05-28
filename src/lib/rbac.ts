/**
 * Step 4.3 — RBAC Permission Middleware
 *
 * Role-based permission checking at the API boundary.
 * Maps operations (view, create, edit, delete) to roles per security-rbac.md.
 * Returns 403 with reason on unauthorized access.
 *
 * Role Matrix (from docs/phase-0/security-rbac.md):
 *
 * | Operation                      | Viewer | Member | Admin |
 * | ------------------------------ | ------ | ------ | ----- |
 * | View inventory and details     | Yes    | Yes    | Yes   |
 * | Create fact sheets             | No     | Yes    | Yes   |
 * | Edit fact sheets               | No     | Yes*   | Yes   |
 * | Delete fact sheets             | No     | No     | Yes   |
 * | Manage users and roles         | No     | No     | Yes   |
 * | Configure workspace governance | No     | No     | Yes   |
 * | Access audit logs              | No     | No     | Yes   |
 *
 * *Member edit is "limited by policy" — treated as allowed for MVP.
 */

import { forbidden, type ApiErrorBody } from "@/lib/api-response";
import type { AuthContext, StandardRole } from "@/lib/auth";
import type { NextResponse } from "next/server";

// ── Operation Types ─────────────────────────────────────────────────────────

export type Operation =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "manage_users"
  | "manage_workspace"
  | "view_audit";

// ── Permission Matrix ───────────────────────────────────────────────────────

const PERMISSIONS: Record<Operation, readonly StandardRole[]> = {
  view: ["Viewer", "Member", "Admin"],
  create: ["Member", "Admin"],
  edit: ["Member", "Admin"],
  delete: ["Admin"],
  manage_users: ["Admin"],
  manage_workspace: ["Admin"],
  view_audit: ["Admin"],
} as const;

// ── Authorization Check ─────────────────────────────────────────────────────

export type AuthzResult = { ok: true } | { ok: false; response: NextResponse<ApiErrorBody> };

/**
 * Check if the authenticated user has permission for a given operation.
 *
 * @param auth - The authenticated user context from `requireAuth()`
 * @param operation - The operation being attempted
 * @returns `{ ok: true }` if permitted, `{ ok: false, response }` with a 403 if not
 *
 * @example
 * const authz = checkPermission(auth.auth, "create");
 * if (!authz.ok) return authz.response;
 */
export function checkPermission(auth: AuthContext, operation: Operation): AuthzResult {
  const allowedRoles = PERMISSIONS[operation];

  if (allowedRoles.includes(auth.role)) {
    return { ok: true };
  }

  return {
    ok: false,
    response: forbidden(`Role '${auth.role}' is not permitted to perform '${operation}'`),
  };
}

/**
 * Higher-level check: authenticate + authorize in one call.
 * Use when you want to assert a specific operation in a route handler.
 *
 * @example
 * export const POST = withErrorHandler(async (req) => {
 *   const auth = await requireAuth(req);
 *   if (!auth.ok) return auth.response;
 *
 *   const authz = requirePermission(auth.auth, "create");
 *   if (!authz.ok) return authz.response;
 *
 *   // ...proceed with creation
 * });
 */
export { checkPermission as requirePermission };

// ── HTTP Method → Operation Mapping ─────────────────────────────────────────

/**
 * Map an HTTP method to the default RBAC operation.
 * Useful for generic middleware that auto-checks permissions.
 */
export function methodToOperation(method: string): Operation {
  switch (method.toUpperCase()) {
    case "GET":
    case "HEAD":
    case "OPTIONS":
      return "view";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "edit";
    case "DELETE":
      return "delete";
    default:
      return "view";
  }
}
