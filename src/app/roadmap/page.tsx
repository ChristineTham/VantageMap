import type { Metadata } from "next";
import { getInitiatives, getObjectives } from "@/lib/data";
import { RoadmapView } from "@/components/RoadmapView";
import { EmptyState } from "@/components/EmptyState";
import { GanttChart } from "lucide-react";

export const metadata: Metadata = {
  title: "Strategic Roadmap – VantageMap",
  description:
    "Gantt-style timeline of strategic initiatives with status and milestones.",
};

export default async function RoadmapPage() {
  const [initiatives, objectives] = await Promise.all([
    getInitiatives(),
    getObjectives(),
  ]);

  if (initiatives.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-rosely-night">
            Strategic Roadmap
          </h1>
          <p className="text-sm text-rosely-mist mt-1">
            Initiative timeline with status indicators and milestones.
          </p>
        </div>
        <EmptyState
          title="No initiatives"
          description="Create your first initiative to start building the roadmap."
          icon={GanttChart}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">
          Strategic Roadmap
        </h1>
        <p className="text-sm text-rosely-mist mt-1">
          {initiatives.length} initiatives •{" "}
          {initiatives.filter((i) => i.status === "In Progress").length} in
          progress
        </p>
      </div>
      <RoadmapView initiatives={initiatives} />
    </div>
  );
}
