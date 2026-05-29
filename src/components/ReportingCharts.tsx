"use client";

/**
 * Phase 13 — Reporting and Analytics Dashboard Widgets
 *
 * Client component that renders Phase 13 report visualizations:
 * - TIME distribution (donut chart)
 * - 6R distribution (horizontal bar)
 * - Portfolio health score (gauge-like indicator)
 * - Obsolescence risk summary (segmented bar)
 */

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Color Maps ──────────────────────────────────────────────────────────────

const TIME_COLORS: Record<string, string> = {
  Tolerate: "#93a9d1", // rosely-cornflower
  Invest: "#64bfa4", // rosely-teal
  Migrate: "#eada4f", // rosely-golden
  Eliminate: "#d2386c", // rosely-rose
};

const SIX_R_COLORS: Record<string, string> = {
  Retire: "#d2386c", // rosely-rose
  Retain: "#a49e9e", // rosely-mist
  Repurchase: "#b884c8", // rosely-lilac
  Rehost: "#64bfa4", // rosely-teal
  Replatform: "#93a9d1", // rosely-cornflower
  Rearchitect: "#eada4f", // rosely-golden
};

const RISK_COLORS: Record<string, string> = {
  Critical: "#d2386c",
  High: "#ec809e",
  Medium: "#eada4f",
  Low: "#64bfa4",
};

// ── Types ───────────────────────────────────────────────────────────────────

interface DistributionEntry {
  label: string;
  count: number;
  percentage: number;
}

interface ReportingChartsProps {
  timeDistribution: DistributionEntry[];
  timeTotal: number;
  timeClassified: number;
  sixRDistribution: DistributionEntry[];
  sixRTotal: number;
  sixRClassified: number;
  portfolioHealthScore: number;
  obsolescenceRiskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

export function ReportingCharts({
  timeDistribution,
  timeTotal,
  timeClassified,
  sixRDistribution,
  sixRTotal,
  sixRClassified,
  portfolioHealthScore,
  obsolescenceRiskSummary,
}: ReportingChartsProps) {
  const timeData = timeDistribution
    .filter((d) => d.count > 0)
    .map((d) => ({ name: d.label, value: d.count }));

  const sixRData = sixRDistribution
    .filter((d) => d.count > 0)
    .map((d) => ({ name: d.label, value: d.count }));

  const riskData = [
    { name: "Critical", value: obsolescenceRiskSummary.critical },
    { name: "High", value: obsolescenceRiskSummary.high },
    { name: "Medium", value: obsolescenceRiskSummary.medium },
    { name: "Low", value: obsolescenceRiskSummary.low },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Portfolio Health Score */}
      <div className="rounded-xl border border-rosely-blush bg-white p-5">
        <h3 className="text-sm font-semibold text-rosely-night mb-4">Portfolio Health Score</h3>
        <div className="flex items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f4dede" strokeWidth="10" />
              {/* Score arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={getScoreColor(portfolioHealthScore)}
                strokeWidth="10"
                strokeDasharray={`${(portfolioHealthScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-rosely-night">{portfolioHealthScore}</span>
              <span className="text-xs text-rosely-mist">/ 100</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-rosely-mist mt-2">
          Composite score based on health, lifecycle, and fit dimensions
        </p>
      </div>

      {/* TIME Distribution */}
      <div className="rounded-xl border border-rosely-blush bg-white p-5">
        <h3 className="text-sm font-semibold text-rosely-night mb-1">
          Application Rationalization (TIME)
        </h3>
        <p className="text-xs text-rosely-mist mb-4">
          {timeClassified} of {timeTotal} classified
        </p>
        {timeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={timeData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {timeData.map((entry) => (
                  <Cell key={entry.name} fill={TIME_COLORS[entry.name] || "#a49e9e"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs text-rosely-dusk">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-rosely-mist">
            No TIME classifications assigned yet
          </p>
        )}
      </div>

      {/* 6R Distribution */}
      <div className="rounded-xl border border-rosely-blush bg-white p-5">
        <h3 className="text-sm font-semibold text-rosely-night mb-1">
          Cloud Migration Strategy (6R)
        </h3>
        <p className="text-xs text-rosely-mist mb-4">
          {sixRClassified} of {sixRTotal} classified
        </p>
        {sixRData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sixRData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f4dede" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#a49e9e" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: "#615f5f" }}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {sixRData.map((entry) => (
                  <Cell key={entry.name} fill={SIX_R_COLORS[entry.name] || "#a49e9e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-rosely-mist">
            No 6R classifications assigned yet
          </p>
        )}
      </div>

      {/* Obsolescence Risk */}
      <div className="rounded-xl border border-rosely-blush bg-white p-5">
        <h3 className="text-sm font-semibold text-rosely-night mb-4">Obsolescence Risk</h3>
        {obsolescenceRiskSummary.total > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#a49e9e"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-xs text-rosely-dusk">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-lg font-bold text-rosely-rose">
                  {obsolescenceRiskSummary.critical}
                </span>
                <p className="text-xs text-rosely-mist">Critical</p>
              </div>
              <div>
                <span className="text-lg font-bold text-rosely-flamingo">
                  {obsolescenceRiskSummary.high}
                </span>
                <p className="text-xs text-rosely-mist">High</p>
              </div>
              <div>
                <span className="text-lg font-bold text-rosely-golden">
                  {obsolescenceRiskSummary.medium}
                </span>
                <p className="text-xs text-rosely-mist">Medium</p>
              </div>
              <div>
                <span className="text-lg font-bold text-rosely-teal">
                  {obsolescenceRiskSummary.low}
                </span>
                <p className="text-xs text-rosely-mist">Low</p>
              </div>
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-rosely-mist">
            No components with EOL dates tracked
          </p>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 75) return "#64bfa4"; // teal
  if (score >= 50) return "#eada4f"; // golden
  if (score >= 25) return "#ec809e"; // flamingo
  return "#d2386c"; // rose
}
