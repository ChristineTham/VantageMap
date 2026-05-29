/**
 * Phase 10 — Better Auth API Route Handler
 *
 * Catch-all route that delegates all /api/auth/* requests to Better Auth.
 * Handles: sign-up, sign-in, sign-out, session, password reset, etc.
 */

import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
