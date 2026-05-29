import type { Metadata } from "next";
import { getApplications } from "@/lib/data";
import { ApplicationsView } from "@/components/ApplicationsView";
import { EmptyState } from "@/components/EmptyState";
import { AppWindow } from "lucide-react";

export const metadata: Metadata = {
  title: "Application Portfolio – VantageMap",
  description: "Filterable application portfolio with health, lifecycle, and fit scores.",
};

export default async function ApplicationsPage() {
  const applications = await getApplications();

  if (applications.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-rosely-night">Application Portfolio</h1>
          <p className="text-sm text-rosely-mist mt-1">
            Manage your enterprise application landscape.
          </p>
        </div>
        <EmptyState
          title="No applications"
          description="Add your first application to start building the portfolio."
          icon={AppWindow}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Application Portfolio</h1>
        <p className="text-sm text-rosely-mist mt-1">
          {applications.length} applications in the enterprise landscape
        </p>
      </div>
      <ApplicationsView applications={applications} />
    </div>
  );
}
