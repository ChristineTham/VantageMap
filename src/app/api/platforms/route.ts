/**
 * Step 5.10 — Platform API (collection)
 *
 * GET  /api/platforms — List with pagination, sorting, filtering
 * POST /api/platforms — Create a new platform
 */

import { z } from "zod";
import { platforms } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: platforms,
  entityType: "Platform",
  createSchema,
  updateSchema,
  columnMap: {
    name: platforms.name,
    lifecycle: platforms.lifecycle,
    health: platforms.health,
    qualitySeal: platforms.qualitySeal,
    owner: platforms.owner,
    createdAt: platforms.createdAt,
    updatedAt: platforms.updatedAt,
  },
};

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
