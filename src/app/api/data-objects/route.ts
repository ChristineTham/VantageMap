/**
 * Step 5.7 — Data Object API (collection)
 *
 * GET  /api/data-objects — List with pagination, sorting, filtering
 * POST /api/data-objects — Create a new data object
 */

import { z } from "zod";
import { dataObjects } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  dataClassification: z.string().max(100).nullish(),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig<typeof dataObjects> = {
  table: dataObjects,
  entityType: "DataObject",
  createSchema,
  updateSchema,
  columnMap: {
    name: dataObjects.name,
    dataClassification: dataObjects.dataClassification,
    lifecycle: dataObjects.lifecycle,
    health: dataObjects.health,
    qualitySeal: dataObjects.qualitySeal,
    owner: dataObjects.owner,
    createdAt: dataObjects.createdAt,
    updatedAt: dataObjects.updatedAt,
  },
};

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
