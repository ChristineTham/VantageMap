/**
 * Runs Drizzle ORM migrations programmatically using the neon-http driver.
 * Use this instead of `drizzle-kit migrate` so it works in non-TTY environments
 * (CI, Codespaces piped shells, etc.).
 *
 * Usage: npm run db:migrate
 * Requires: DATABASE_URL in environment
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required. Set it in .env.local or export it.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

async function runMigrations() {
  console.log("⏳ Running migrations…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations complete!");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
