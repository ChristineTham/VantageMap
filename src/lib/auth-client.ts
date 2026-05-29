/**
 * Phase 10 — Better Auth Client
 *
 * Client-side auth utilities for sign-in, sign-up, sign-out,
 * session management, and user operations.
 *
 * Import this in Client Components ("use client") for auth interactions.
 */

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
