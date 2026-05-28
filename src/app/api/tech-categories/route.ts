/**
 * Step 5.5 — Tech Category API (collection)
 *
 * GET  /api/tech-categories — List with pagination, sorting, filtering
 * POST /api/tech-categories — Create a new tech category
 */

import { z } from "zod";
import { techCategories } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  level: z.number().int().min(1).optional(),
  parentId: z.string().uuid().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
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

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
