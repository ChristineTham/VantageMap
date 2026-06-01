/**
 * Phase 11.6 — Surveys Governance Page
 *
 * Lists all surveys with status, allows creating new surveys,
 * and viewing response counts.
 */

import { getSurveys } from "@/lib/api";
import { ClipboardList } from "lucide-react";
import { SurveyListView } from "@/components/SurveyListView";

export default async function SurveysPage() {
  let surveys: Awaited<ReturnType<typeof getSurveys>>["data"] = [];
  try {
    const res = await getSurveys();
    surveys = res.data;
  } catch {
    surveys = [];
  }

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-rosely-night flex items-center gap-2">
          <ClipboardList className="size-6 text-rosely-periwinkle" />
          Surveys
        </h1>
        <p className="text-sm text-rosely-mist mt-1">
          Collect data quality feedback from stakeholders
        </p>
      </div>

      <SurveyListView initialSurveys={surveys} />
    </div>
  );
}
