/**
 * Step 5.4 — Initiative API (collection)
 *
 * GET  /api/initiatives — List with pagination, sorting, filtering
 * POST /api/initiatives — Create a new initiative
 */

import { z } from "zod";
import { initiatives } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  subtype: z.enum(["Program", "Project", "Epic"]).optional(),
  status: z.enum(["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"]).optional(),
  startDate: z.string().nullish(), // ISO date string
  endDate: z.string().nullish(),
  budget: z.string().nullish(), // numeric stored as string
  parentId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: initiatives,
  entityType: "Initiative",
  createSchema,
  updateSchema,
  columnMap: {
    name: initiatives.name,
    subtype: initiatives.subtype,
    status: initiatives.status,
    lifecycle: initiatives.lifecycle,
    health: initiatives.health,
    qualitySeal: initiatives.qualitySeal,
    owner: initiatives.owner,
    startDate: initiatives.startDate,
    endDate: initiatives.endDate,
    createdAt: initiatives.createdAt,
    updatedAt: initiatives.updatedAt,
  },
};

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
