/**
 * Step 5.9 — Provider API (individual)
 *
 * GET    /api/providers/:id — Get by ID
 * PATCH  /api/providers/:id — Update
 * DELETE /api/providers/:id — Delete
 */

import { z } from "zod";
import { providers } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  location: z.string().max(255).nullish(),
  contactInfo: z.string().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
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

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
