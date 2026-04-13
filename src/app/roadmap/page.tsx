import {
  initiatives,
  capabilities,
  strategicObjectives,
  initiativeStatusColour,
} from "@/lib/data";
import { Calendar } from "lucide-react";

// Helper: parse "YYYY-MM-DD" and return year fraction
function dateToNum(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return year + (month - 1) / 12 + (day - 1) / 365;
}

const YEARS = [2024, 2025, 2026];

// Compute global min and max for the timeline
const minDate = dateToNum("2024-01-01");
const maxDate = dateToNum("2026-12-31");
const totalSpan = maxDate - minDate;

function pct(dateStr: string): number {
  return ((dateToNum(dateStr) - minDate) / totalSpan) * 100;
}

const STATUS_ORDER = [
  "In Progress",
  "Not Started",
  "Completed",
  "On Hold",
  "Cancelled",
] as const;

export default function RoadmapPage() {
  // Group by status order
  const sorted = [...initiatives].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status as never) -
      STATUS_ORDER.indexOf(b.status as never)
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Strategic Roadmap
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gantt-style timeline of all strategic initiatives. Bars are
          colour-coded by status.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {STATUS_ORDER.map((status) => (
          <span
            key={status}
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${initiativeStatusColour[status]}`}
          >
            {status}
          </span>
        ))}
      </div>

      {/* Gantt chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 overflow-x-auto">
        {/* Year axis */}
        <div className="relative ml-64 mb-2">
          <div className="flex">
            {YEARS.map((year) => {
              const left = pct(`${year}-01-01`);
              const right = pct(`${year + 1}-01-01`);
              return (
                <div
                  key={year}
                  className="absolute text-xs font-semibold text-slate-400"
                  style={{ left: `${left}%`, width: `${right - left}%` }}
                >
                  {year}
                </div>
              );
            })}
          </div>
          {/* Height placeholder */}
          <div className="h-5" />
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {sorted.map((ini) => {
            const left = pct(ini.startDate);
            const width = pct(ini.endDate) - left;

            const barColour =
              ini.status === "In Progress"
                ? "bg-blue-500"
                : ini.status === "Not Started"
                ? "bg-slate-400"
                : ini.status === "Completed"
                ? "bg-emerald-500"
                : ini.status === "On Hold"
                ? "bg-yellow-400"
                : "bg-red-400";

            return (
              <div key={ini.id} className="flex items-center gap-2 group">
                {/* Label column */}
                <div className="w-64 shrink-0 pr-3 text-right">
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {ini.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{ini.owner}</p>
                </div>

                {/* Bar area */}
                <div className="flex-1 relative h-8 bg-slate-50 rounded border border-slate-100">
                  {/* Grid lines */}
                  {YEARS.map((year) => (
                    <div
                      key={year}
                      className="absolute top-0 bottom-0 w-px bg-slate-200"
                      style={{ left: `${pct(`${year}-01-01`)}%` }}
                    />
                  ))}
                  {/* Bar */}
                  <div
                    className={`absolute top-1.5 bottom-1.5 rounded ${barColour} opacity-90 flex items-center px-2 overflow-hidden`}
                    style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                    title={`${ini.startDate} → ${ini.endDate}${ini.budget ? ` | $${(ini.budget / 1000).toFixed(0)}k` : ""}`}
                  >
                    <span className="text-xs text-white font-medium truncate hidden sm:block">
                      {ini.name}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="w-24 shrink-0">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${initiativeStatusColour[ini.status]}`}
                  >
                    {ini.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Initiative detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((ini) => {
          const caps = capabilities.filter((c) =>
            ini.capabilityIds.includes(c.id)
          );
          const objs = strategicObjectives.filter((o) =>
            ini.objectiveIds.includes(o.id)
          );
          return (
            <div
              key={ini.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                  {ini.name}
                </h3>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${initiativeStatusColour[ini.status]}`}
                >
                  {ini.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                {ini.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {ini.startDate.slice(0, 7)} → {ini.endDate.slice(0, 7)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Owner</span>
                  <span className="text-slate-700">{ini.owner}</span>
                </div>
                {ini.budget && (
                  <div className="flex items-center justify-between">
                    <span>Budget</span>
                    <span className="text-slate-700">
                      ${ini.budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {ini.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {caps.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {caps.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {objs.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">
                    Strategic Objectives:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {objs.map((o) => (
                      <span
                        key={o.id}
                        className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full"
                      >
                        {o.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
