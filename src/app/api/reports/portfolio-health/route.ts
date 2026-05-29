/**
 * Phase 13.1 — Portfolio Health Report API
 *
 * GET /api/reports/portfolio-health
 *
 * Returns a composite portfolio health score (0-100) with breakdown
 * across health, lifecycle, fit score, and criticality dimensions.
 */

import { NextRequest } from "next/server";
import { withErrorHandler, ok, unauthorized } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { getPortfolioHealthReport } from "@/lib/reports";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return unauthorized("Authentication required");

  const report = await getPortfolioHealthReport();

  return ok({ data: report });
});
