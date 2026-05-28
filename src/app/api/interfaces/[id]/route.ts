/**
 * Step 5.8 — Interface API (individual)
 *
 * GET    /api/interfaces/:id — Get by ID
 * PATCH  /api/interfaces/:id — Update
 * DELETE /api/interfaces/:id — Delete
 */

import { z } from "zod";
import { interfaces } from "@/db/schema";
import {
  createGetByIdHandler,
  createUpdateHandler,
  createDeleteHandler,
  type CrudConfig,
} from "@/lib/crud-factory";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  subtype: z.enum(["Logical Interface", "Physical Interface", "API", "MCP Server"]).optional(),
  dataFlowDirection: z.enum(["Inbound", "Outbound", "Bidirectional"]).nullish(),
  frequency: z.string().max(100).nullish(),
  providerApplicationId: z.string().uuid().nullish(),
  lifecycle: z.enum(["Plan", "Phase In", "Active", "Phase Out", "End of Life"]).optional(),
  health: z.enum(["Good", "Adequate", "Insufficient", "Critical"]).optional(),
  qualitySeal: z.enum(["Draft", "Reviewed", "Approved"]).optional(),
  endpointUrl: z.string().url().max(2048).nullish(),
  authProtocol: z.string().max(100).nullish(),
  owner: z.string().max(255).nullish(),
  customFields: z.record(z.string(), z.unknown()).nullish(),
});

const updateSchema = createSchema.partial();

const config: CrudConfig = {
  table: interfaces,
  entityType: "Interface",
  createSchema,
  updateSchema,
  columnMap: {
    name: interfaces.name,
    subtype: interfaces.subtype,
    dataFlowDirection: interfaces.dataFlowDirection,
    lifecycle: interfaces.lifecycle,
    health: interfaces.health,
    qualitySeal: interfaces.qualitySeal,
    owner: interfaces.owner,
    createdAt: interfaces.createdAt,
    updatedAt: interfaces.updatedAt,
  },
};

export const GET = createGetByIdHandler(config);
export const PATCH = createUpdateHandler(config);
export const DELETE = createDeleteHandler(config);
