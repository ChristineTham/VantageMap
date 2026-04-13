import {
  applications,
  capabilities,
  healthColour,
  lifecycleColour,
  criticalityColour,
} from "@/lib/data";
import { Users, DollarSign } from "lucide-react";

export default function ApplicationsPage() {
  const totalCost  = applications.reduce((s, a) => s + (a.cost  ?? 0), 0);
  const totalUsers = applications.reduce((s, a) => s + (a.users ?? 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Application Portfolio</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Inventory of all IT applications, their lifecycle status, business criticality, and capability coverage.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-rosely-blush p-4 text-center">
          <p className="text-2xl font-bold text-rosely-night">{applications.length}</p>
          <p className="text-xs text-rosely-mist mt-0.5">Total Applications</p>
        </div>
        <div className="bg-white rounded-xl border border-rosely-blush p-4 text-center">
          <p className="text-2xl font-bold text-rosely-teal">
            {applications.filter((a) => a.lifecycle === "Active").length}
          </p>
          <p className="text-xs text-rosely-mist mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-rosely-blush p-4 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-rosely-mist" />
            <p className="text-2xl font-bold text-rosely-night">{(totalCost / 1_000_000).toFixed(1)}M</p>
          </div>
          <p className="text-xs text-rosely-mist mt-0.5">Total Annual Cost</p>
        </div>
        <div className="bg-white rounded-xl border border-rosely-blush p-4 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-rosely-mist" />
            <p className="text-2xl font-bold text-rosely-night">{totalUsers.toLocaleString()}</p>
          </div>
          <p className="text-xs text-rosely-mist mt-0.5">Total Users</p>
        </div>
      </div>

      {/* Application cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {applications.map((app) => {
          const caps = capabilities.filter((c) => app.capabilityIds.includes(c.id));
          return (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-rosely-blush p-5 hover:border-rosely-lilac hover:shadow-sm transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-rosely-night">{app.name}</h3>
                  <p className="text-xs text-rosely-mist mt-0.5">{app.vendor}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${lifecycleColour[app.lifecycle]}`}>
                  {app.lifecycle}
                </span>
              </div>

              <p className="text-xs text-rosely-dusk mb-3 line-clamp-2">{app.description}</p>

              <div className="space-y-1.5 text-xs text-rosely-dusk mb-3">
                <div className="flex items-center justify-between">
                  <span>Criticality</span>
                  <span className={`px-1.5 py-0.5 rounded-full font-medium text-xs ${criticalityColour[app.businessCriticality]}`}>
                    {app.businessCriticality}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Health</span>
                  <span className={`px-1.5 py-0.5 rounded-full font-medium text-xs ${healthColour[app.health]}`}>
                    {app.health}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Owner</span>
                  <span className="text-rosely-night">{app.owner}</span>
                </div>
                {app.cost !== undefined && (
                  <div className="flex items-center justify-between">
                    <span>Annual Cost</span>
                    <span className="text-rosely-night">${app.cost.toLocaleString()}</span>
                  </div>
                )}
                {app.users !== undefined && app.users > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Users</span>
                    <span className="text-rosely-night">{app.users.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {app.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-rosely-petal text-rosely-dusk px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Capability links */}
              {caps.length > 0 && (
                <div className="mt-auto pt-3 border-t border-rosely-petal">
                  <p className="text-xs text-rosely-mist mb-1.5">Supports capabilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {caps.map((c) => (
                      <span key={c.id} className="text-xs bg-rosely-periwinkle/15 text-rosely-night border border-rosely-periwinkle/40 px-2 py-0.5 rounded-full">
                        {c.name}
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
