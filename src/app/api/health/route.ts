/**
 * Health check endpoint — GET /api/health
 *
 * Returns basic service status. No authentication required.
 * Used by monitoring, load balancers, and CI health checks.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
