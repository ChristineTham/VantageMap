/**
 * Phase 12.1 — OpenAPI JSON Endpoint
 *
 * GET /api/docs/openapi.json — Serves the OpenAPI 3.1 specification as JSON
 */

import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
