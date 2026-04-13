import { techRadar, ringColour, ringBg, type TechQuadrant, type TechRing } from "@/lib/data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const QUADRANTS: TechQuadrant[] = [
  "Techniques",
  "Tools",
  "Platforms",
  "Languages & Frameworks",
];
const RINGS: TechRing[] = ["Adopt", "Trial", "Assess", "Hold"];

function MovedIcon({ moved }: { moved?: -1 | 0 | 1 }) {
  if (moved === 1)
    return <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />;
  if (moved === -1)
    return <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />;
  return <Minus className="w-3 h-3 text-slate-300 shrink-0" />;
}

export default function RadarPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Technology Radar</h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspired by ThoughtWorks Technology Radar. Entries are classified into
          four rings: <strong>Adopt</strong>, <strong>Trial</strong>,{" "}
          <strong>Assess</strong>, and <strong>Hold</strong>. Trend arrows show
          movement since the last update.
        </p>
      </div>

      {/* Ring legend */}
      <div className="flex flex-wrap gap-3">
        {RINGS.map((ring) => (
          <span
            key={ring}
            className={`text-xs px-3 py-1 rounded-full font-medium ${ringColour[ring]}`}
          >
            {ring}
          </span>
        ))}
        <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
          <TrendingUp className="w-3 h-3 text-emerald-500" /> Moving in
          <TrendingDown className="w-3 h-3 text-red-400 ml-1" /> Moving out
          <Minus className="w-3 h-3 text-slate-300 ml-1" /> Stable
        </span>
      </div>

      {/* Quadrant grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {QUADRANTS.map((quadrant) => {
          const entries = techRadar.filter((t) => t.quadrant === quadrant);
          return (
            <div
              key={quadrant}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <h2 className="text-base font-bold text-slate-800 mb-4">
                {quadrant}
              </h2>
              <div className="space-y-4">
                {RINGS.map((ring) => {
                  const ringEntries = entries.filter(
                    (t) => t.ring === ring
                  );
                  if (ringEntries.length === 0) return null;
                  return (
                    <div key={ring}>
                      <div
                        className={`text-xs font-semibold px-2 py-1 rounded-md mb-2 inline-block ${ringColour[ring]}`}
                      >
                        {ring}
                      </div>
                      <div className="space-y-1.5">
                        {ringEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${ringBg[ring]}`}
                          >
                            <MovedIcon moved={entry.moved} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 leading-tight">
                                {entry.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          All Radar Entries
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  Name
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  Quadrant
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  Ring
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500 pr-4">
                  Trend
                </th>
                <th className="text-left py-2 text-xs font-medium text-slate-500">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {techRadar.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="py-2.5 pr-4 font-medium text-slate-800">
                    {entry.name}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">
                    {entry.quadrant}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ringColour[entry.ring]}`}
                    >
                      {entry.ring}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <MovedIcon moved={entry.moved} />
                  </td>
                  <td className="py-2.5 text-slate-500 text-xs line-clamp-1">
                    {entry.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
