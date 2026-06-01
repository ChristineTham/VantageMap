import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon serverless HTTP driver — compatible with Vercel Edge and serverless
 * functions. DATABASE_URL must be set in the environment.
 *
 * Lazily initialised so that importing this module does not throw when
 * DATABASE_URL is absent (e.g. during Next.js static-export builds where
 * API routes are excluded but their modules are still analysed).
 *
 * Configuration:
 * - fetchOptions.priority: "high" — prioritises DB requests in the browser fetch queue
 * - fetchOptions.cache: "no-store" — prevents accidental response caching
 */
let _db: ReturnType<typeof drizzle> | undefined;

function createSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Provide a valid Neon connection string.");
  }
  return neon(url, {
    fetchOptions: { priority: "high", cache: "no-store" },
  });
}

function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    _db = drizzle(createSql(), { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as ReturnType<typeof getDb>;

export type Database = typeof db;
