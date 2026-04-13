import Link from "next/link";
import {
  Map,
  AppWindow,
  Target,
  RadioTower,
  CalendarRange,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  capabilities,
  applications,
  strategicObjectives,
  initiatives,
  techRadar,
  healthColour,
  initiativeStatusColour,
} from "@/lib/data";

function StatCard({
  title,
  value,
  sub,
  href,
  icon: Icon,
  colour,
}: {
  title: string;
  value: number | string;
  sub: string;
  href: string;
  icon: React.ElementType;
  colour: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-rosely-blush p-5 flex items-start gap-4 hover:border-rosely-lilac hover:shadow-sm transition-all"
    >
      <div className={`p-2.5 rounded-lg ${colour}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-rosely-night">{value}</p>
        <p className="text-sm font-medium text-rosely-dusk">{title}</p>
        <p className="text-xs text-rosely-mist mt-0.5">{sub}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const l1Caps = capabilities.filter((c) => c.level === 1).length;
  const activeApps = applications.filter((a) => a.lifecycle === "Active").length;
  const inProgressInits = initiatives.filter((i) => i.status === "In Progress").length;
  const adoptedTechs = techRadar.filter((t) => t.ring === "Adopt").length;

  const healthCounts = capabilities.reduce<Record<string, number>>((acc, c) => {
    acc[c.health] = (acc[c.health] ?? 0) + 1;
    return acc;
  }, {});

  const kpiStatuses = strategicObjectives.flatMap((o) => o.kpis);
  const onTrack = kpiStatuses.filter((k) => k.status === "On Track").length;
  const atRisk  = kpiStatuses.filter((k) => k.status === "At Risk").length;
  const offTrack = kpiStatuses.filter((k) => k.status === "Off Track").length;

  const recentInitiatives = initiatives.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Dashboard</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Enterprise architecture and strategy overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Business Capabilities"
          value={l1Caps}
          sub={`${capabilities.length} total (incl. sub-capabilities)`}
          href="/capabilities"
          icon={Map}
          colour="bg-rosely-periwinkle/20 text-rosely-night"
        />
        <StatCard
          title="Active Applications"
          value={activeApps}
          sub={`${applications.length} total in portfolio`}
          href="/applications"
          icon={AppWindow}
          colour="bg-rosely-lilac/20 text-rosely-night"
        />
        <StatCard
          title="Strategic Objectives"
          value={strategicObjectives.length}
          sub={`${inProgressInits} initiatives in progress`}
          href="/strategy"
          icon={Target}
          colour="bg-rosely-teal/20 text-rosely-night"
        />
        <StatCard
          title="Adopted Technologies"
          value={adoptedTechs}
          sub={`${techRadar.length} entries on radar`}
          href="/radar"
          icon={RadioTower}
          colour="bg-rosely-flamingo/20 text-rosely-night"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capability health */}
        <div className="bg-white rounded-xl border border-rosely-blush p-5">
          <h2 className="text-sm font-semibold text-rosely-dusk mb-4">
            Capability Health Distribution
          </h2>
          <div className="space-y-2">
            {(["Excellent", "Good", "Fair", "Poor", "Critical"] as const).map((h) => (
              <div key={h} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColour[h]}`}>
                  {h}
                </span>
                <div className="flex-1 bg-rosely-petal rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      h === "Excellent"
                        ? "bg-rosely-teal"
                        : h === "Good"
                        ? "bg-rosely-periwinkle"
                        : h === "Fair"
                        ? "bg-rosely-golden"
                        : h === "Poor"
                        ? "bg-rosely-flamingo"
                        : "bg-rosely-rose"
                    }`}
                    style={{ width: `${((healthCounts[h] ?? 0) / capabilities.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-rosely-mist w-5 text-right">
                  {healthCounts[h] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI status summary */}
        <div className="bg-white rounded-xl border border-rosely-blush p-5">
          <h2 className="text-sm font-semibold text-rosely-dusk mb-4">
            Strategic KPI Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-rosely-teal" />
              <span className="text-sm text-rosely-dusk flex-1">On Track</span>
              <span className="text-lg font-bold text-rosely-teal">{onTrack}</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rosely-golden" />
              <span className="text-sm text-rosely-dusk flex-1">At Risk</span>
              <span className="text-lg font-bold text-rosely-golden">{atRisk}</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-rosely-rose" />
              <span className="text-sm text-rosely-dusk flex-1">Off Track</span>
              <span className="text-lg font-bold text-rosely-rose">{offTrack}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div
                className="bg-rosely-teal"
                style={{ width: `${(onTrack / (onTrack + atRisk + offTrack)) * 100}%` }}
              />
              <div
                className="bg-rosely-golden"
                style={{ width: `${(atRisk / (onTrack + atRisk + offTrack)) * 100}%` }}
              />
              <div
                className="bg-rosely-rose"
                style={{ width: `${(offTrack / (onTrack + atRisk + offTrack)) * 100}%` }}
              />
            </div>
          </div>
          <Link href="/strategy" className="text-xs text-rosely-lilac hover:underline mt-3 inline-block">
            View Strategy Map →
          </Link>
        </div>

        {/* Application lifecycle */}
        <div className="bg-white rounded-xl border border-rosely-blush p-5">
          <h2 className="text-sm font-semibold text-rosely-dusk mb-4">
            Application Lifecycle
          </h2>
          <div className="space-y-2">
            {(["Active", "Phase In", "Plan", "Phase Out", "End of Life"] as const).map((phase) => {
              const count = applications.filter((a) => a.lifecycle === phase).length;
              return (
                <div key={phase} className="flex items-center justify-between">
                  <span className="text-xs text-rosely-dusk">{phase}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-rosely-petal rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          phase === "Active"
                            ? "bg-rosely-teal"
                            : phase === "Phase In"
                            ? "bg-rosely-periwinkle"
                            : phase === "Plan"
                            ? "bg-rosely-cornflower"
                            : phase === "Phase Out"
                            ? "bg-rosely-flamingo"
                            : "bg-rosely-rose"
                        }`}
                        style={{ width: `${(count / applications.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-rosely-mist w-3">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/applications" className="text-xs text-rosely-lilac hover:underline mt-3 inline-block">
            View Application Portfolio →
          </Link>
        </div>
      </div>

      {/* Recent initiatives */}
      <div className="bg-white rounded-xl border border-rosely-blush p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-rosely-dusk">
            Active Strategic Initiatives
          </h2>
          <Link href="/roadmap" className="text-xs text-rosely-lilac hover:underline flex items-center gap-1">
            <CalendarRange className="w-3.5 h-3.5" />
            View Roadmap →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rosely-petal">
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Initiative</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Owner</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Status</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Timeline</th>
                <th className="text-right py-2 text-xs font-medium text-rosely-mist">Budget</th>
              </tr>
            </thead>
            <tbody>
              {recentInitiatives.map((ini) => (
                <tr key={ini.id} className="border-b border-rosely-cream hover:bg-rosely-cream/50">
                  <td className="py-2.5 pr-4 font-medium text-rosely-night">{ini.name}</td>
                  <td className="py-2.5 pr-4 text-rosely-dusk">{ini.owner}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${initiativeStatusColour[ini.status]}`}>
                      {ini.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-rosely-mist text-xs">
                    {ini.startDate.slice(0, 7)} → {ini.endDate.slice(0, 7)}
                  </td>
                  <td className="py-2.5 text-right text-rosely-mist text-xs">
                    {ini.budget ? `$${(ini.budget / 1000).toFixed(0)}k` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tech radar summary */}
      <div className="bg-white rounded-xl border border-rosely-blush p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-rosely-dusk">
            Technology Radar Summary
          </h2>
          <Link href="/radar" className="text-xs text-rosely-lilac hover:underline flex items-center gap-1">
            <RadioTower className="w-3.5 h-3.5" />
            View Full Radar →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["Adopt", "Trial", "Assess", "Hold"] as const).map((ring) => {
            const count = techRadar.filter((t) => t.ring === ring).length;
            const colour =
              ring === "Adopt"
                ? "border-rosely-teal/40 bg-rosely-teal/10"
                : ring === "Trial"
                ? "border-rosely-periwinkle/40 bg-rosely-periwinkle/10"
                : ring === "Assess"
                ? "border-rosely-golden/40 bg-rosely-golden/10"
                : "border-rosely-rose/40 bg-rosely-rose/10";
            const textColour =
              ring === "Adopt"
                ? "text-rosely-teal"
                : ring === "Trial"
                ? "text-rosely-periwinkle"
                : ring === "Assess"
                ? "text-rosely-golden"
                : "text-rosely-rose";
            return (
              <div key={ring} className={`rounded-lg border p-4 text-center ${colour}`}>
                <p className={`text-2xl font-bold ${textColour}`}>{count}</p>
                <p className={`text-xs font-semibold mt-0.5 ${textColour}`}>{ring}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
