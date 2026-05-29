"use client";

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

const HEALTH_COLORS: Record<string, string> = {
  Excellent: "#64bfa4",
  Good: "#64bfa4",
  Fair: "#eada4f",
  Poor: "#ec809e",
  Critical: "#d2386c",
  Unknown: "#a49e9e",
};

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "#a49e9e",
  "In Progress": "#93a9d1",
  Completed: "#64bfa4",
  "On Hold": "#eada4f",
  Cancelled: "#d2386c",
};

interface DashboardChartsProps {
  healthDist: Record<string, number>;
  statusDist: Record<string, number>;
}

export function DashboardCharts({
  healthDist,
  statusDist,
}: DashboardChartsProps) {
  const healthData = Object.entries(healthDist)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(statusDist)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Health Distribution */}
      <div className="rounded-xl border border-rosely-blush bg-white p-5">
        <h3 className="text-sm font-semibold text-rosely-night mb-4">
          Application Health Distribution
        </h3>
        {healthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {healthData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={HEALTH_COLORS[entry.name] || "#a49e9e"}
                  />
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
            No health data available
          </p>
        )}
      </div>

      {/* Initiative Status */}
      <div className="rounded-xl border border-rosely-blush bg-white p-5">
        <h3 className="text-sm font-semibold text-rosely-night mb-4">
          Initiative Status
        </h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical">
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
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || "#a49e9e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-12 text-center text-sm text-rosely-mist">
            No initiative data available
          </p>
        )}
      </div>
    </div>
  );
}
