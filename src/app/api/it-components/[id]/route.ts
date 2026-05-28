/**
 * Step 5.5 — IT Component API (individual)
 *
 * GET    /api/it-components/:id — Get by ID
 * PATCH  /api/it-components/:id — Update
 * DELETE /api/it-components/:id — Delete
 */

import { z } from "zod";
import { itComponents } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  subtype: z
    .enum(["Hardware", "Software", "Service", "Platform Component", "Infrastructure"])
    .nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  version: z.string().max(100).nullish(),
  technicalStandard: z.enum(["Standard", "Preferred", "Restricted", "Prohibited"]).nullish(),
  ring: z.enum(["Adopt", "Trial", "Assess", "Hold"]).nullish(),
  quadrant: z.enum(["Languages & Frameworks", "Platforms", "Tools", "Techniques"]).nullish(),
  endOfLife: z.string().nullish(),
  endOfSupport: z.string().nullish(),
  techCategoryId: z.string().uuid().nullish(),
  providerId: z.string().uuid().nullish(),
  parentId: z.string().uuid().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig<typeof itComponents> = {
  table: itComponents,
  entityType: "ITComponent",
  createSchema,
  updateSchema,
  columnMap: {
    name: itComponents.name,
    subtype: itComponents.subtype,
    lifecycle: itComponents.lifecycle,
    health: itComponents.health,
    qualitySeal: itComponents.qualitySeal,
    ring: itComponents.ring,
    quadrant: itComponents.quadrant,
    technicalStandard: itComponents.technicalStandard,
    owner: itComponents.owner,
    createdAt: itComponents.createdAt,
    updatedAt: itComponents.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
