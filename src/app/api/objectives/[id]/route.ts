/**
 * Step 5.3 — Strategic Objective API (individual)
 *
 * GET    /api/objectives/:id — Get by ID
 * PATCH  /api/objectives/:id — Update
 * DELETE /api/objectives/:id — Delete
 */

import { z } from "zod";
import { strategicObjectives } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  perspective: z.enum(["Financial", "Customer", "Internal Process", "Learning & Growth"]),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig<typeof strategicObjectives> = {
  table: strategicObjectives,
  entityType: "StrategicObjective",
  createSchema,
  updateSchema,
  columnMap: {
    name: strategicObjectives.name,
    perspective: strategicObjectives.perspective,
    lifecycle: strategicObjectives.lifecycle,
    health: strategicObjectives.health,
    qualitySeal: strategicObjectives.qualitySeal,
    owner: strategicObjectives.owner,
    createdAt: strategicObjectives.createdAt,
    updatedAt: strategicObjectives.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
