import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – VantageMap",
  description:
    "Enterprise architecture overview: capabilities, applications, strategy, and roadmap.",
};

export default function HomePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Dashboard</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Enterprise architecture overview — capabilities, applications, strategy, and roadmap.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Capabilities"
          description="Business capability map"
          href="/capabilities"
        />
        <DashboardCard
          title="Applications"
          description="Application portfolio"
          href="/applications"
        />
        <DashboardCard
          title="Strategy"
          description="Balanced Scorecard objectives"
          href="/strategy"
        />
        <DashboardCard
          title="Tech Radar"
          description="Technology landscape"
          href="/radar"
        />
        <DashboardCard
          title="Roadmap"
          description="Strategic initiatives timeline"
          href="/roadmap"
        />
      </div>
      <p className="text-xs text-rosely-mist">
        Full dashboard with charts and metrics coming in Phase 8.
      </p>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-rosely-blush bg-white p-5 hover:border-rosely-lilac hover:shadow-sm transition-all"
    >
      <h2 className="text-lg font-semibold text-rosely-night">{title}</h2>
      <p className="mt-1 text-sm text-rosely-mist">{description}</p>
    </a>
  );
}
