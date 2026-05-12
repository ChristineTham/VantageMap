import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon serverless HTTP driver — compatible with Vercel Edge and serverless
 * functions. DATABASE_URL must be set in the environment.
 */
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
export type Database = typeof db;
