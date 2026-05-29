/**
 * Phase 10 — Better Auth Server Configuration
 *
 * Central Better Auth instance with plugins for email/password auth,
 * session management, and admin operations.
 *
 * Plugins used:
 *   - Core: email/password authentication
 *   - Admin: user management operations for Admin role
 *
 * Better Auth manages its own tables (user, session, account, verification)
 * via the Drizzle adapter. These are separate from the Phase 3.8 users table
 * which holds VantageMap-specific fields (status lifecycle, workspace roles).
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      avatarUrl: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [admin()],

  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : ["http://localhost:3000"],
});

export type Auth = typeof auth;
