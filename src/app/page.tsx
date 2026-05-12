import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – VantageMap",
  description:
    "Enterprise architecture overview: capabilities, applications, strategy, and roadmap.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-rosely-cream">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-rosely-night">VantageMap</h1>
        <p className="mt-2 text-sm text-rosely-mist">Enterprise Architecture Platform</p>
        <p className="mt-6 text-xs text-rosely-mist">Dashboard coming in Phase 8</p>
      </div>
    </div>
  );
}
