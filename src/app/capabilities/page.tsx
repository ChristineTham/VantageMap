import type { Metadata } from "next";
import { getCapabilities } from "@/lib/data";
import type { BusinessCapability } from "@/lib/types";
import { HealthIndicator } from "@/components/HealthIndicator";
import { LifecycleTag } from "@/components/LifecycleTag";
import { EmptyState } from "@/components/EmptyState";
import { CreateButton } from "@/components/CreateButton";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Capabilities – VantageMap",
  description: "Hierarchical business capability map with health indicators.",
};

export default async function CapabilitiesPage() {
  const capabilities = await getCapabilities();

  // Organize into a hierarchy
  const level1 = capabilities.filter((c) => c.level === "1");
  const level2 = capabilities.filter((c) => c.level === "2");
  const level3 = capabilities.filter((c) => c.level === "3");

  function getChildren(parentId: string, pool: BusinessCapability[]): BusinessCapability[] {
    return pool.filter((c) => c.parentId === parentId);
  }

  if (capabilities.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-rosely-night">Business Capabilities</h1>
          <p className="text-sm text-rosely-mist mt-1">
            Hierarchical view of enterprise business capabilities.
          </p>
        </div>
        <EmptyState
          title="No capabilities defined"
          description="Add your first business capability to start building the capability map."
          icon={Layers}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rosely-night">Business Capabilities</h1>
          <p className="text-sm text-rosely-mist mt-1">
            {capabilities.length} capabilities across {level1.length} domains
          </p>
        </div>
        <CreateButton href="/capabilities/new" label="New Capability" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-rosely-dusk">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-rosely-plum bg-rosely-plum/10" />
          Level 1 — Domain
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-rosely-cornflower bg-rosely-cornflower/10" />
          Level 2 — Area
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-rosely-mist bg-rosely-mist/10" />
          Level 3 — Capability
        </span>
      </div>

      {/* Capability Map */}
      <div className="space-y-4">
        {level1.map((l1) => {
          const l2Children = getChildren(l1.id, level2);
          return (
            <div key={l1.id} className="rounded-xl border-2 border-rosely-plum/30 bg-white p-4">
              {/* Level 1 header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-rosely-night">{l1.name}</h2>
                  <HealthIndicator health={l1.health} showLabel />
                </div>
                <LifecycleTag lifecycle={l1.lifecycle} />
              </div>
              {l1.description && <p className="text-xs text-rosely-mist mb-3">{l1.description}</p>}

              {/* Level 2 grid */}
              {l2Children.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {l2Children.map((l2) => {
                    const l3Children = getChildren(l2.id, level3);
                    return (
                      <div
                        key={l2.id}
                        className="rounded-lg border border-rosely-cornflower/30 bg-rosely-cream/30 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-rosely-night">{l2.name}</h3>
                          <HealthIndicator health={l2.health} />
                        </div>

                        {/* Level 3 chips */}
                        {l3Children.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {l3Children.map((l3) => (
                              <span
                                key={l3.id}
                                className="inline-flex items-center gap-1 rounded border border-rosely-mist/30 bg-white px-2 py-0.5 text-xs text-rosely-dusk"
                                title={l3.description || l3.name}
                              >
                                <HealthIndicator health={l3.health} />
                                {l3.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
