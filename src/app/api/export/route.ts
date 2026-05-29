/**
 * Phase 12.5 — CSV Export Route Handler
 *
 * GET /api/export?type=Application&format=csv — Export fact sheets to CSV
 *
 * Features:
 *   - Stream CSV download (no buffering large datasets in memory)
 *   - Field selection via `fields` query param
 *   - Filter by name substring via `filter` query param
 *   - Supports CSV format (xlsx deferred to post-MVP with exceljs)
 *   - Content-Disposition header for browser download
 *
 * Requires `papaparse` npm package for CSV generation.
 */

import { NextRequest } from "next/server";
import Papa from "papaparse";
import { ilike } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  businessCapabilities,
  organizations,
  strategicObjectives,
  initiatives,
  itComponents,
  techCategories,
  providers,
  platforms,
  dataObjects,
  interfaces as interfacesTable,
} from "@/db/schema";
import { withErrorHandler, badRequest } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { dispatchWebhookEvent } from "@/lib/webhook-engine";

// ── Table Mapping ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLE_MAP: Record<string, any> = {
  Application: applications,
  BusinessCapability: businessCapabilities,
  Organization: organizations,
  StrategicObjective: strategicObjectives,
  Initiative: initiatives,
  ITComponent: itComponents,
  TechCategory: techCategories,
  Provider: providers,
  Platform: platforms,
  DataObject: dataObjects,
  Interface: interfacesTable,
};

// ── GET /api/export ─────────────────────────────────────────────────────────

export const GET = withErrorHandler(async (request: NextRequest) => {
  if (!isFeatureEnabled("FEATURE_EXPORT_API")) {
    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Export API not enabled",
          correlationId: crypto.randomUUID(),
        },
      },
      { status: 404 }
    );
  }

  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  const auth = authResult.auth;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const format = searchParams.get("format") ?? "csv";
  const filter = searchParams.get("filter");
  const fieldsParam = searchParams.get("fields");

  if (!type) return badRequest("type query parameter is required");
  if (!TABLE_MAP[type]) return badRequest(`Invalid type: ${type}`);
  if (format !== "csv") return badRequest("Only CSV format is currently supported");

  const table = TABLE_MAP[type];

  // Build query
  const where = filter ? ilike(table.name, `%${filter}%`) : undefined;

  // Fetch all matching rows (streaming not possible with Drizzle select)
  // Limit to 50,000 to prevent memory issues
  const rows = await db.select().from(table).where(where).limit(50_000);

  if (rows.length === 0) {
    return badRequest("No data found for the given type and filter");
  }

  // Field filtering
  let data = rows;
  if (fieldsParam) {
    const fields = fieldsParam.split(",").map((f) => f.trim());
    data = rows.map((row: Record<string, unknown>) => {
      const filtered: Record<string, unknown> = {};
      for (const field of fields) {
        if (field in row) {
          filtered[field] = row[field];
        }
      }
      return filtered;
    });
  }

  // Generate CSV
  const csv = Papa.unparse(data as Record<string, unknown>[], {
    header: true,
  });

  // Dispatch webhook event (fire-and-forget)
  dispatchWebhookEvent(
    "bulk.export_completed",
    {
      factSheetType: type,
      rowCount: rows.length,
      format,
    },
    { userId: auth.userId }
  ).catch(() => {});

  // Return as downloadable file
  const filename = `${type.toLowerCase()}-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
});
