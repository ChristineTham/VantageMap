import {
  strategicObjectives,
  initiatives,
  perspectiveColour,
  perspectiveBg,
  kpiStatusColour,
  initiativeStatusColour,
  type StrategicPerspective,
} from "@/lib/data";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

const PERSPECTIVES: StrategicPerspective[] = [
  "Financial",
  "Customer",
  "Internal Process",
  "Learning & Growth",
];

function KPIStatusIcon({ status }: { status: string }) {
  if (status === "On Track")
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  if (status === "At Risk")
    return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
  return <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
}

export default function StrategyPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Strategy Map</h1>
        <p className="text-sm text-slate-500 mt-1">
          Balanced Scorecard view of strategic objectives across Financial,
          Customer, Internal Process, and Learning &amp; Growth perspectives.
        </p>
      </div>

      {/* Strategy Map grid */}
      <div className="space-y-4">
        {PERSPECTIVES.map((perspective) => {
          const objs = strategicObjectives.filter(
            (o) => o.perspective === perspective
          );
          return (
            <div key={perspective} className={`rounded-xl border p-5 ${perspectiveBg[perspective]}`}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h2 className="text-base font-bold text-slate-800">
                  {perspective}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${perspectiveColour[perspective]}`}
                >
                  {objs.length} objective{objs.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {objs.map((obj) => {
                  const linkedInitiatives = initiatives.filter((i) =>
                    obj.initiatives.includes(i.id)
                  );
                  return (
                    <div
                      key={obj.id}
                      className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs"
                    >
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">
                        {obj.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {obj.description}
                      </p>

                      {/* KPIs */}
                      <div className="space-y-2 mb-3">
                        {obj.kpis.map((kpi) => (
                          <div key={kpi.name} className="flex items-start gap-2">
                            <KPIStatusIcon status={kpi.status} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs text-slate-700 font-medium truncate">
                                  {kpi.name}
                                </span>
                                <span
                                  className={`text-xs font-semibold shrink-0 ${kpiStatusColour[kpi.status]}`}
                                >
                                  {kpi.current}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                Target: {kpi.target}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Linked initiatives */}
                      {linkedInitiatives.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-400 mb-1.5">
                            Initiatives:
                          </p>
                          <div className="space-y-1">
                            {linkedInitiatives.map((ini) => (
                              <div
                                key={ini.id}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-slate-600 truncate">
                                  {ini.name}
                                </span>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ml-2 shrink-0 ${initiativeStatusColour[ini.status]}`}
                                >
                                  {ini.status}
                                </span>
                              </div>
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
        })}
      </div>

      {/* Objectives table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          All Strategic Objectives
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  Objective
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  Perspective
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  KPIs
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500">
                  Initiatives
                </th>
              </tr>
            </thead>
            <tbody>
              {strategicObjectives.map((obj) => {
                const linkedInits = initiatives.filter((i) =>
                  obj.initiatives.includes(i.id)
                );
                const kpiOnTrack = obj.kpis.filter(
                  (k) => k.status === "On Track"
                ).length;
                const kpiAtRisk = obj.kpis.filter(
                  (k) => k.status === "At Risk"
                ).length;
                const kpiOffTrack = obj.kpis.filter(
                  (k) => k.status === "Off Track"
                ).length;
                return (
                  <tr
                    key={obj.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-2.5 pr-4 font-medium text-slate-800">
                      {obj.name}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${perspectiveColour[obj.perspective]}`}
                      >
                        {obj.perspective}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        {kpiOnTrack > 0 && (
                          <span className="text-xs text-emerald-700 font-medium">
                            {kpiOnTrack} ✓
                          </span>
                        )}
                        {kpiAtRisk > 0 && (
                          <span className="text-xs text-yellow-700 font-medium">
                            {kpiAtRisk} ⚠
                          </span>
                        )}
                        {kpiOffTrack > 0 && (
                          <span className="text-xs text-red-700 font-medium">
                            {kpiOffTrack} ✗
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-500 text-xs">
                      {linkedInits.map((i) => i.name).join(", ") || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
