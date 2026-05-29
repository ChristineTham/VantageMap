/**
 * Phase 13.3 — 6R Distribution Report API
 *
 * GET /api/reports/six-r-distribution
 *
 * Returns the 6R (Retire/Retain/Repurchase/Rehost/Replatform/Rearchitect)
 * cloud migration classification distribution across all applications.
 */

import { NextRequest } from "next/server";
import { withErrorHandler, ok, unauthorized } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { getSixRDistributionReport } from "@/lib/reports";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getSession(request);
  if (!session) return unauthorized("Authentication required");

  const report = await getSixRDistributionReport();

  return ok({ data: report });
});
