/**
 * Phase 12.4 — CSV Import Route Handler
 *
 * POST /api/import — Import fact sheets from CSV
 *
 * Modes:
 *   - preview: Parse CSV and return validation results without persisting
 *   - execute: Parse CSV, validate, and upsert into database
 *
 * Features:
 *   - Automatic column mapping (header names → DB columns)
 *   - Validation with per-row error reporting
 *   - Upsert (update if ID exists, insert if new)
 *   - Max file size: 5MB
 *   - Max rows: 10,000
 *
 * Requires `papaparse` npm package for CSV parsing.
 */

import { NextRequest } from "next/server";
import Papa from "papaparse";
import { eq } from "drizzle-orm";
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
import { withErrorHandler, ok, badRequest, unauthorized } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { dispatchWebhookEvent } from "@/lib/webhook-engine";

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10_000;

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

// Column name normalization: common CSV headers → DB column names
const COLUMN_ALIASES: Record<string, string> = {
  "id": "id",
  "name": "name",
  "display name": "name",
  "display_name": "name",
  "description": "description",
  "lifecycle": "lifecycle",
  "lifecycle phase": "lifecycle",
  "health": "health",
  "health status": "health",
  "owner": "owner",
  "quality seal": "qualitySeal",
  "quality_seal": "qualitySeal",
  "qualityseal": "qualitySeal",
  "parent_id": "parentId",
  "parentid": "parentId",
  "parent id": "parentId",
  "level": "level",
  "subtype": "subtype",
  "ring": "ring",
  "quadrant": "quadrant",
  "perspective": "perspective",
  "status": "status",
  "start_date": "startDate",
  "start date": "startDate",
  "end_date": "endDate",
  "end date": "endDate",
  "version": "version",
};

// ── POST /api/import ────────────────────────────────────────────────────────

export const POST = withErrorHandler(async (request: NextRequest) => {
  if (!isFeatureEnabled("FEATURE_IMPORT_API")) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Import API not enabled", correlationId: crypto.randomUUID() } },
      { status: 404 }
    );
  }

  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  const auth = authResult.auth;

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const factSheetType = formData.get("factSheetType") as string | null;
  const mode = (formData.get("mode") as string) || "preview";

  if (!file) return badRequest("File is required");
  if (!factSheetType) return badRequest("factSheetType is required");
  if (!TABLE_MAP[factSheetType]) return badRequest(`Invalid factSheetType: ${factSheetType}`);
  if (!["preview", "execute"].includes(mode)) return badRequest("mode must be 'preview' or 'execute'");

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    return badRequest(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of 5MB`);
  }

  // Read and parse CSV
  const text = await file.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      const normalized = header.trim().toLowerCase();
      return COLUMN_ALIASES[normalized] ?? normalized;
    },
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return badRequest(`CSV parsing failed: ${parsed.errors[0]?.message}`);
  }

  const rows = parsed.data as Record<string, string>[];

  if (rows.length === 0) return badRequest("CSV file contains no data rows");
  if (rows.length > MAX_ROWS) return badRequest(`Too many rows (${rows.length}). Maximum is ${MAX_ROWS}`);

  // Validate each row
  const validRows: Record<string, unknown>[] = [];
  const errors: { row: number; field: string; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 for 1-indexed + header row

    // Name is required for all fact sheet types
    if (!row.name || row.name.trim() === "") {
      errors.push({ row: rowNum, field: "name", message: "Name is required" });
      continue;
    }

    // Build clean row with only valid columns
    const cleanRow: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value !== undefined && value !== null && value.trim() !== "") {
        cleanRow[key] = value.trim();
      }
    }

    // Convert level to integer if present
    if (cleanRow.level) {
      const level = parseInt(cleanRow.level as string, 10);
      if (isNaN(level) || level < 1 || level > 4) {
        errors.push({ row: rowNum, field: "level", message: "Level must be 1-4" });
        continue;
      }
      cleanRow.level = level;
    }

    validRows.push(cleanRow);
  }

  // Preview mode — return validation results only
  if (mode === "preview") {
    return ok({
      data: {
        mode: "preview",
        factSheetType,
        totalRows: rows.length,
        validRows: validRows.length,
        errorCount: errors.length,
        errors: errors.slice(0, 100), // Limit error reporting
        sampleData: validRows.slice(0, 5),
        detectedColumns: Object.keys(rows[0] ?? {}),
      },
    });
  }

  // Execute mode — upsert rows
  const table = TABLE_MAP[factSheetType];
  let insertedCount = 0;
  let updatedCount = 0;
  const rowErrors: { row: number; message: string }[] = [];

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    try {
      if (row.id) {
        // Upsert: try update first
        const [existing] = await db
          .select({ id: table.id })
          .from(table)
          .where(eq(table.id, row.id as string))
          .limit(1);

        if (existing) {
          await db
            .update(table)
            .set({ ...row, updatedAt: new Date() })
            .where(eq(table.id, row.id as string));
          updatedCount++;
        } else {
          await db.insert(table).values({ ...row, createdAt: new Date(), updatedAt: new Date() });
          insertedCount++;
        }
      } else {
        // Insert new
        await db.insert(table).values({ ...row, createdAt: new Date(), updatedAt: new Date() });
        insertedCount++;
      }
    } catch (err) {
      rowErrors.push({
        row: i + 2,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // Dispatch webhook event
  await dispatchWebhookEvent("bulk.import_completed", {
    factSheetType,
    inserted: insertedCount,
    updated: updatedCount,
    errors: rowErrors.length,
  }, { userId: auth.userId });

  return ok({
    data: {
      mode: "execute",
      factSheetType,
      totalRows: rows.length,
      inserted: insertedCount,
      updated: updatedCount,
      errorCount: rowErrors.length + errors.length,
      errors: [...errors.slice(0, 50), ...rowErrors.slice(0, 50)],
    },
  });
});
