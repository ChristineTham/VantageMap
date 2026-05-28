/**
 * Step 5.2 — Application API (collection)
 *
 * GET  /api/applications — List with pagination, sorting, filtering
 * POST /api/applications — Create a new application
 */

import { z } from "zod";
import { applications } from "@/db/schema";
import { createListHandler, createCreateHandler, type CrudConfig } from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  subtype: z
    .enum(["Custom Application", "SaaS", "COTS", "Mobile App", "Suite", "Module"])
    .nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  technicalFit: z.enum(["Excellent", "Adequate", "Insufficient", "Poor"]).nullish(),
  functionalFit: z.enum(["Excellent", "Adequate", "Insufficient", "Poor"]).nullish(),
  businessCriticality: z
    .enum(["Mission Critical", "Business Critical", "Business Operational", "Administrative"])
    .nullish(),
  timeClassification: z.enum(["Tolerate", "Invest", "Migrate", "Eliminate"]).nullish(),
  sixRClassification: z
    .enum(["Retain", "Retire", "Rehost", "Replatform", "Refactor", "Replace"])
    .nullish(),
  version: z.string().max(100).nullish(),
  parentId: z.string().uuid().nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig<typeof applications> = {
  table: applications,
  entityType: "Application",
  createSchema,
  updateSchema,
  columnMap: {
    name: applications.name,
    subtype: applications.subtype,
    lifecycle: applications.lifecycle,
    health: applications.health,
    qualitySeal: applications.qualitySeal,
    technicalFit: applications.technicalFit,
    functionalFit: applications.functionalFit,
    businessCriticality: applications.businessCriticality,
    timeClassification: applications.timeClassification,
    owner: applications.owner,
    createdAt: applications.createdAt,
    updatedAt: applications.updatedAt,
  },
};

export const GET = createListHandler(config);
export const POST = createCreateHandler(config);
