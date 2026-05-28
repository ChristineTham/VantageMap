/**
 * Step 5.3 — Strategic Objective API (collection)
 *
 * GET  /api/objectives — List with pagination, sorting, filtering
 * POST /api/objectives — Create a new strategic objective
 */

import { z } from "zod";
import { strategicObjectives } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  perspective: z.enum(["Financial", "Customer", "Internal Process", "Learning & Growth"]),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
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

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
