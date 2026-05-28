/**
 * Step 5.6 — Organization API (individual)
 *
 * GET    /api/organizations/:id — Get by ID
 * PATCH  /api/organizations/:id — Update
 * DELETE /api/organizations/:id — Delete
 */

import { z } from "zod";
import { organizations } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  subtype: z.enum(["Business Unit", "Department", "Team", "Committee", "External"]).optional(),
  level: z.number().int().min(1).optional(),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: organizations,
  entityType: "Organization",
  createSchema,
  updateSchema,
  columnMap: {
    name: organizations.name,
    subtype: organizations.subtype,
    lifecycle: organizations.lifecycle,
    health: organizations.health,
    qualitySeal: organizations.qualitySeal,
    owner: organizations.owner,
    createdAt: organizations.createdAt,
    updatedAt: organizations.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
