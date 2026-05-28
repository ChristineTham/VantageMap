/**
 * Step 5.7 — Data Object API (individual)
 *
 * GET    /api/data-objects/:id — Get by ID
 * PATCH  /api/data-objects/:id — Update
 * DELETE /api/data-objects/:id — Delete
 */

import { z } from "zod";
import { dataObjects } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  dataClassification: z.string().max(100).nullish(),
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
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

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
