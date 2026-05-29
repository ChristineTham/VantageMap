/**
 * Phase 13.1 — Capability Coverage Report API
 *
 * GET /api/reports/capability-coverage
 *
 * Returns capability-to-application mapping with coverage analysis.
 * Shows which capabilities have no supporting applications and the
 * average app count per capability.
 */

import { NextRequest } from "next/server";
import { withErrorHandler, ok, unauthorized } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { getCapabilityCoverageReport } from "@/lib/reports";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;

  const report = await getCapabilityCoverageReport();

  return ok({ data: report });
});
