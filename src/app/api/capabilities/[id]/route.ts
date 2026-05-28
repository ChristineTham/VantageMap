/**
 * Step 5.1 — Business Capability API (individual)
 *
 * GET    /api/capabilities/:id — Get by ID
 * PATCH  /api/capabilities/:id — Update
 * DELETE /api/capabilities/:id — Delete
 */

import { z } from "zod";
import { businessCapabilities } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  level: z.enum(["1", "2", "3", "4"]).optional(),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  maturity: z.number().int().min(1).max(5).nullish(),
  strategicImportance: z.number().int().min(1).max(5).nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: businessCapabilities,
  entityType: "BusinessCapability",
  createSchema,
  updateSchema,
  columnMap: {
    name: businessCapabilities.name,
    level: businessCapabilities.level,
    lifecycle: businessCapabilities.lifecycle,
    health: businessCapabilities.health,
    qualitySeal: businessCapabilities.qualitySeal,
    owner: businessCapabilities.owner,
    createdAt: businessCapabilities.createdAt,
    updatedAt: businessCapabilities.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
