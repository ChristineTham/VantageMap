import type { Metadata } from "next";
import { getITComponents, getTechCategories } from "@/lib/data";
import { TechRadarView } from "@/components/TechRadarView";
import { EmptyState } from "@/components/EmptyState";
import { Radar } from "lucide-react";

export const metadata: Metadata = {
  title: "Technology Radar – VantageMap",
  description: "Technology landscape visualization with quadrants and adoption rings.",
};

export default async function RadarPage() {
  const [components, categories] = await Promise.all([getITComponents(), getTechCategories()]);

  if (components.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-rosely-night">Technology Radar</h1>
          <p className="text-sm text-rosely-mist mt-1">
            Technology landscape with quadrants and adoption rings.
          </p>
        </div>
        <EmptyState
          title="No tech components"
          description="Add IT components with ring and quadrant assignments to build the radar."
          icon={Radar}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Technology Radar</h1>
        <p className="text-sm text-rosely-mist mt-1">
          {components.length} technologies across {categories.length} categories
        </p>
      </div>
      <TechRadarView components={components} categories={categories} />
    </div>
  );
}
