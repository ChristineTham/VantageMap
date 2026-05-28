/**
 * Step 5.10 — Platform API (individual)
 *
 * GET    /api/platforms/:id — Get by ID
 * PATCH  /api/platforms/:id — Update
 * DELETE /api/platforms/:id — Delete
 */

import { z } from "zod";
import { platforms } from "@/db/schema";
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
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
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

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
