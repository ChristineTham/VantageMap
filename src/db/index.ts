import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon serverless HTTP driver — compatible with Vercel Edge and serverless
 * functions. DATABASE_URL must be set in the environment.
 *
 * Lazily initialised so that importing this module does not throw when
 * DATABASE_URL is absent (e.g. during Next.js static-export builds where
 * API routes are excluded but their modules are still analysed).
 */
let _db: ReturnType<typeof drizzle> | undefined;

function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set. Provide a valid Neon connection string.");
    }
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as ReturnType<typeof getDb>;

export type Database = typeof db;
