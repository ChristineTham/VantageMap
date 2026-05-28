/**
 * Step 5.5 — IT Component API (collection)
 *
 * GET  /api/it-components — List with pagination, sorting, filtering
 * POST /api/it-components — Create a new IT component (tech radar entry)
 */

import { z } from "zod";
import { itComponents } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

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
  endOfLife: z.string().nullish(), // ISO date
  endOfSupport: z.string().nullish(),
  techCategoryId: z.string().uuid().nullish(),
  providerId: z.string().uuid().nullish(),
  parentId: z.string().uuid().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
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

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
