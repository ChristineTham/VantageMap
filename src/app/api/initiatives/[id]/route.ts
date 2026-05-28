/**
 * Step 5.4 — Initiative API (individual)
 *
 * GET    /api/initiatives/:id — Get by ID
 * PATCH  /api/initiatives/:id — Update
 * DELETE /api/initiatives/:id — Delete
 */

import { z } from "zod";
import { initiatives } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  subtype: z.enum(["Program", "Project", "Epic"]).optional(),
  status: z.enum(["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"]).optional(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  budget: z.string().nullish(),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: initiatives,
  entityType: "Initiative",
  createSchema,
  updateSchema,
  columnMap: {
    name: initiatives.name,
    subtype: initiatives.subtype,
    status: initiatives.status,
    lifecycle: initiatives.lifecycle,
    health: initiatives.health,
    qualitySeal: initiatives.qualitySeal,
    owner: initiatives.owner,
    startDate: initiatives.startDate,
    endDate: initiatives.endDate,
    createdAt: initiatives.createdAt,
    updatedAt: initiatives.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
