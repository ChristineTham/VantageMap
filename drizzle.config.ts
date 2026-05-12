import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 * DATABASE_URL must be set before running any drizzle-kit commands.
 * Use a .env.local file for local development.
 */
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});
