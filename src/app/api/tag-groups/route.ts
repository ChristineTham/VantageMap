/**
 * Phase 11.1 — Tag Groups API (collection)
 *
 * GET  /api/tag-groups — List tag groups with pagination
 * POST /api/tag-groups — Create a new tag group
 */

import { z } from "zod";
import { tagGroups } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  mode: z.enum(["on-the-fly", "hybrid", "predefined-only"]).optional(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: tagGroups,
  entityType: "BusinessCapability", // Use closest fact sheet type for audit
  createSchema,
  updateSchema,
  columnMap: {
    name: tagGroups.name,
    mode: tagGroups.mode,
    createdAt: tagGroups.createdAt,
    updatedAt: tagGroups.updatedAt,
  },
};

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
