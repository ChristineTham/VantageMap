/**
 * Phase 11 — Governance Admin Page
 *
 * Central page for managing governance settings:
 * - Tag groups and tags
 * - Quality seal configuration
 * - Survey management
 */

import { ShieldCheck, Tags, ClipboardList } from "lucide-react";

export default function GovernancePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night">Governance & Data Quality</h1>
        <p className="text-sm text-rosely-mist mt-1">
          Manage tags, quality seals, subscriptions, and surveys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tag Management */}
        <a
          href="/governance/tags"
          className="bg-white rounded-xl border border-rosely-blush p-5 hover:border-rosely-lilac hover:shadow-sm transition-all group"
        >
          <Tags className="w-8 h-8 text-rosely-plum mb-3" />
          <h2 className="text-base font-semibold text-rosely-night group-hover:text-rosely-plum transition-colors">
            Tag Management
          </h2>
          <p className="text-sm text-rosely-mist mt-1">
            Create and manage tag groups, define tagging modes, and organize tags.
          </p>
        </a>

        {/* Quality Seal */}
        <a
          href="/governance/quality-seal"
          className="bg-white rounded-xl border border-rosely-blush p-5 hover:border-rosely-lilac hover:shadow-sm transition-all group"
        >
          <ShieldCheck className="w-8 h-8 text-rosely-teal mb-3" />
          <h2 className="text-base font-semibold text-rosely-night group-hover:text-rosely-plum transition-colors">
            Quality Seal
          </h2>
          <p className="text-sm text-rosely-mist mt-1">
            Review and approve fact sheets through the quality seal workflow.
          </p>
        </a>

        {/* Surveys */}
        <a
          href="/governance/surveys"
          className="bg-white rounded-xl border border-rosely-blush p-5 hover:border-rosely-lilac hover:shadow-sm transition-all group"
        >
          <ClipboardList className="w-8 h-8 text-rosely-periwinkle mb-3" />
          <h2 className="text-base font-semibold text-rosely-night group-hover:text-rosely-plum transition-colors">
            Surveys
          </h2>
          <p className="text-sm text-rosely-mist mt-1">
            Create surveys to collect data quality feedback from stakeholders.
          </p>
        </a>
      </div>

      {/* Summary stats placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-rosely-blush p-4">
          <p className="text-xs text-rosely-mist uppercase tracking-wider">Quality Approved</p>
          <p className="text-2xl font-bold text-rosely-teal mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-rosely-blush p-4">
          <p className="text-xs text-rosely-mist uppercase tracking-wider">Needs Review</p>
          <p className="text-2xl font-bold text-rosely-golden mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-rosely-blush p-4">
          <p className="text-xs text-rosely-mist uppercase tracking-wider">Active Surveys</p>
          <p className="text-2xl font-bold text-rosely-periwinkle mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-rosely-blush p-4">
          <p className="text-xs text-rosely-mist uppercase tracking-wider">Open Todos</p>
          <p className="text-2xl font-bold text-rosely-plum mt-1">—</p>
        </div>
      </div>
    </div>
  );
}
