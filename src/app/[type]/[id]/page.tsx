import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEntityByTypeAndId, getRelationshipsForEntity } from "@/lib/data";
import { getConfigBySlug } from "@/lib/fact-sheet-config";
import { FactSheetDetail } from "@/components/FactSheetDetail";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, id } = await params;
  const config = getConfigBySlug(type);
  if (!config) return { title: "Not Found – VantageMap" };

  const entity = await getEntityByTypeAndId(config.type, id);
  const name = entity?.name as string | undefined;

  return {
    title: `${name ?? config.displayName} – VantageMap`,
    description: `Detail view for ${config.displayName}${name ? `: ${name}` : ""}.`,
  };
}

export default async function FactSheetDetailPage({ params }: PageProps) {
  const { type, id } = await params;
  const config = getConfigBySlug(type);

  if (!config) {
    notFound();
  }

  const [entity, relationships] = await Promise.all([
    getEntityByTypeAndId(config.type, id),
    getRelationshipsForEntity(config.type, id),
  ]);

  if (!entity) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <FactSheetDetail
        entity={entity}
        entityType={config.type}
        entityId={id}
        config={config}
        relationships={relationships}
      />
    </div>
  );
}
