/**
 * Step 5.5 — Tech Category API (individual)
 *
 * GET    /api/tech-categories/:id — Get by ID
 * PATCH  /api/tech-categories/:id — Update
 * DELETE /api/tech-categories/:id — Delete
 */

import { z } from "zod";
import { techCategories } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  level: z.number().int().min(1).optional(),
  parentId: z.string().uuid().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig<typeof techCategories> = {
  table: techCategories,
  entityType: "TechCategory",
  createSchema,
  updateSchema,
  columnMap: {
    name: techCategories.name,
    level: techCategories.level,
    owner: techCategories.owner,
    createdAt: techCategories.createdAt,
    updatedAt: techCategories.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
