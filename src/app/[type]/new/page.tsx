import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConfigBySlug } from "@/lib/fact-sheet-config";
import { FactSheetCreateForm } from "@/components/FactSheetCreateForm";

interface PageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const config = getConfigBySlug(type);
  if (!config) return { title: "Not Found – VantageMap" };

  return {
    title: `Create ${config.displayName} – VantageMap`,
    description: `Create a new ${config.displayName} fact sheet.`,
  };
}

export default async function CreateFactSheetPage({ params }: PageProps) {
  const { type } = await params;
  const config = getConfigBySlug(type);

  if (!config) {
    notFound();
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <FactSheetCreateForm config={config} />
    </div>
  );
}
