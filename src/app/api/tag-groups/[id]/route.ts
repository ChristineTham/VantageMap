/**
 * Phase 11.1 — Tag Groups API (individual)
 *
 * GET    /api/tag-groups/:id — Get tag group by ID
 * PATCH  /api/tag-groups/:id — Update tag group
 * DELETE /api/tag-groups/:id — Delete tag group (cascades to tags)
 */

import { z } from "zod";
import { tagGroups } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  mode: z.enum(["on-the-fly", "hybrid", "predefined-only"]).optional(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: tagGroups,
  entityType: "BusinessCapability",
  createSchema,
  updateSchema,
  columnMap: {
    name: tagGroups.name,
    mode: tagGroups.mode,
    createdAt: tagGroups.createdAt,
    updatedAt: tagGroups.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
