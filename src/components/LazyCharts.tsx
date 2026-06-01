"use client";
/**
 * Lazy-loaded chart wrappers.
 * `ssr: false` is only valid inside Client Components in Next.js 16,
 * so these dynamic imports live here rather than in page.tsx.
 */
import dynamic from "next/dynamic";

export const DashboardChartsLazy = dynamic(
  () => import("@/components/DashboardCharts").then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => <div className="h-60 animate-pulse rounded-lg bg-rosely-blush/30" />,
  }
);

export const ReportingChartsLazy = dynamic(
  () => import("@/components/ReportingCharts").then((m) => m.ReportingCharts),
  {
    ssr: false,
    loading: () => <div className="h-60 animate-pulse rounded-lg bg-rosely-blush/30" />,
  }
);

export const CapabilityCoverageChartLazy = dynamic(
  () => import("@/components/CapabilityCoverageChart").then((m) => m.CapabilityCoverageChart),
  {
    ssr: false,
    loading: () => <div className="h-60 animate-pulse rounded-lg bg-rosely-blush/30" />,
  }
);
