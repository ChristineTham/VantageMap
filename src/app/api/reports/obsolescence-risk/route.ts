/**
 * Phase 13.4 — Obsolescence Risk Report API
 *
 * GET /api/reports/obsolescence-risk?horizon=365
 *
 * Returns IT components and applications approaching end-of-life or
 * end-of-support, with risk scoring and days-remaining calculations.
 *
 * Query params:
 *   - horizon: number of days to look ahead (default: 365)
 */

import { NextRequest } from "next/server";
import { withErrorHandler, ok, unauthorized, badRequest } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { getObsolescenceRiskReport } from "@/lib/reports";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return unauthorized("Authentication required");

  const { searchParams } = new URL(request.url);
  const horizonParam = searchParams.get("horizon");
  const horizon = horizonParam ? parseInt(horizonParam, 10) : 365;

  if (isNaN(horizon) || horizon < 1 || horizon > 3650) {
    return badRequest("horizon must be a number between 1 and 3650");
  }

  const report = await getObsolescenceRiskReport(horizon);

  return ok({ data: report });
});
