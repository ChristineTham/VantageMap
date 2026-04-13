import {
  capabilities,
  applications,
  healthColour,
  healthBg,
  type BusinessCapability,
} from "@/lib/data";

function CapabilityCard({
  cap,
  children,
}: {
  cap: BusinessCapability;
  children?: React.ReactNode;
}) {
  const appCount = applications.filter((a) => a.capabilityIds.includes(cap.id)).length;

  return (
    <div className={`rounded-lg border p-3 ${healthBg[cap.health]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rosely-night leading-tight">{cap.name}</p>
          {cap.level === 1 && (
            <p className="text-xs text-rosely-mist mt-0.5 truncate">{cap.owner}</p>
          )}
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${healthColour[cap.health]}`}>
          {cap.health}
        </span>
      </div>
      {appCount > 0 && (
        <p className="text-xs text-rosely-mist mt-1.5">
          {appCount} app{appCount !== 1 ? "s" : ""}
        </p>
      )}
      {children && <div className="mt-2 space-y-1.5">{children}</div>}
    </div>
  );
}

export default function CapabilitiesPage() {
  const level1 = capabilities.filter((c) => c.level === 1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Business Capability Map</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Hierarchical view of the organisation&apos;s business capabilities and their
          health status. Each capability tile is colour-coded by health.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["Excellent", "Good", "Fair", "Poor", "Critical"] as const).map((h) => (
          <span key={h} className={`text-xs px-2.5 py-1 rounded-full font-medium ${healthColour[h]}`}>
            {h}
          </span>
        ))}
      </div>

      {/* Capability map */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {level1.map((l1) => {
          const children = capabilities.filter((c) => c.parentId === l1.id);
          return (
            <div key={l1.id} className="bg-white rounded-xl border border-rosely-blush p-4 shadow-xs">
              {/* Level 1 header */}
              <div className="mb-3 pb-3 border-b border-rosely-petal">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-rosely-night">{l1.name}</h2>
                    <p className="text-xs text-rosely-mist mt-0.5">{l1.owner}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${healthColour[l1.health]}`}>
                    {l1.health}
                  </span>
                </div>
                <p className="text-xs text-rosely-mist mt-1.5 line-clamp-2">{l1.description}</p>
              </div>

              {/* Level 2 children */}
              <div className="space-y-2">
                {children.map((l2) => {
                  const grandchildren = capabilities.filter((c) => c.parentId === l2.id);
                  return (
                    <CapabilityCard key={l2.id} cap={l2}>
                      {grandchildren.map((l3) => (
                        <CapabilityCard key={l3.id} cap={l3} />
                      ))}
                    </CapabilityCard>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-xl border border-rosely-blush p-5">
        <h2 className="text-sm font-semibold text-rosely-dusk mb-4">Capability Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rosely-petal">
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Capability</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Level</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Owner</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist pr-4">Health</th>
                <th className="text-left py-2 text-xs font-medium text-rosely-mist">Linked Apps</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((c) => {
                const linkedApps = applications.filter((a) => a.capabilityIds.includes(c.id));
                return (
                  <tr key={c.id} className="border-b border-rosely-cream hover:bg-rosely-cream/50">
                    <td className={`py-2 pr-4 font-medium ${
                      c.level === 1
                        ? "text-rosely-night"
                        : c.level === 2
                        ? "pl-4 text-rosely-dusk"
                        : "pl-8 text-rosely-mist text-xs"
                    }`}>
                      {c.name}
                    </td>
                    <td className="py-2 pr-4 text-rosely-mist text-xs">L{c.level}</td>
                    <td className="py-2 pr-4 text-rosely-mist text-xs">{c.owner}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColour[c.health]}`}>
                        {c.health}
                      </span>
                    </td>
                    <td className="py-2 text-rosely-mist text-xs">
                      {linkedApps.length > 0 ? linkedApps.map((a) => a.name).join(", ") : "—"}
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
