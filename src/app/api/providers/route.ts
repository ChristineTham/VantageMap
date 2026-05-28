/**
 * Step 5.9 — Provider API (collection)
 *
 * GET  /api/providers — List with pagination, sorting, filtering
 * POST /api/providers — Create a new provider
 */

import { z } from "zod";
import { providers } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  location: z.string().max(255).nullish(),
  contactInfo: z.string().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig<typeof providers> = {
  table: providers,
  entityType: "Provider",
  createSchema,
  updateSchema,
  columnMap: {
    name: providers.name,
    lifecycle: providers.lifecycle,
    health: providers.health,
    qualitySeal: providers.qualitySeal,
    location: providers.location,
    owner: providers.owner,
    createdAt: providers.createdAt,
    updatedAt: providers.updatedAt,
  },
};

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
