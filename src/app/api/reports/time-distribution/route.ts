/**
 * Phase 13.2 — TIME Distribution Report API
 *
 * GET /api/reports/time-distribution
 *
 * Returns the TIME (Tolerate/Invest/Migrate/Eliminate) classification
 * distribution across all applications, plus AI-suggested classifications
 * for unclassified apps based on their fit scores.
 */

import { NextRequest } from "next/server";
import { withErrorHandler, ok, unauthorized } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { getTimeDistributionReport } from "@/lib/reports";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return unauthorized("Authentication required");

  const report = await getTimeDistributionReport();

  return ok({ data: report });
});
