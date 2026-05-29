"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FactSheetConfig } from "@/lib/fact-sheet-config";
import type { Relationship, FactSheetType } from "@/lib/types";
import { HealthBadge } from "@/components/StatusBadge";
import { LifecycleTag } from "@/components/LifecycleTag";
import { RelationshipList } from "@/components/RelationshipList";
import { FactSheetEditDialog } from "@/components/FactSheetEditDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

interface FactSheetDetailProps {
  entity: Record<string, unknown>;
  entityType: FactSheetType;
  entityId: string;
  config: FactSheetConfig;
  relationships: Relationship[];
}

export function FactSheetDetail({
  entity,
  entityType,
  entityId,
  config,
  relationships,
}: FactSheetDetailProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "relationships" | "audit">("details");

  const name = entity.name as string;
  const description = entity.description as string | null;
  const health = entity.health as string | null;
  const lifecycle = entity.lifecycle as string | null;
  const qualitySeal = entity.qualitySeal as string | null;
  const owner = entity.owner as string | null;
  const createdAt = entity.createdAt as string | null;
  const updatedAt = entity.updatedAt as string | null;

  // Group fields by section for display
  const fieldGroups = new Map<string, { key: string; label: string; value: unknown }[]>();
  for (const field of config.fields) {
    if (field.key === "name" || field.key === "description") continue;
    const group = field.group ?? "Other";
    if (!fieldGroups.has(group)) fieldGroups.set(group, []);
    fieldGroups.get(group)!.push({
      key: field.key,
      label: field.label,
      value: entity[field.key],
    });
  }

  const tabs = [
    { id: "details" as const, label: "Details" },
    { id: "relationships" as const, label: `Relationships (${relationships.length})` },
    { id: "audit" as const, label: "Audit History" },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-rosely-mist">
        <Link
          href={`/${config.slug}`}
          className="inline-flex items-center gap-1 hover:text-rosely-night transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {config.pluralName}
        </Link>
        <span>/</span>
        <span className="text-rosely-night font-medium">{name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-rosely-night">{name}</h1>
          {description && <p className="text-sm text-rosely-dusk max-w-2xl">{description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {health && (
              <HealthBadge health={health as Parameters<typeof HealthBadge>[0]["health"]} />
            )}
            {lifecycle && (
              <LifecycleTag
                lifecycle={lifecycle as Parameters<typeof LifecycleTag>[0]["lifecycle"]}
              />
            )}
            {qualitySeal && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-rosely-periwinkle/20 text-rosely-cornflower">
                {qualitySeal}
              </span>
            )}
            {owner && (
              <span className="text-xs text-rosely-dusk">
                Owner: <span className="font-medium">{owner}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm font-medium text-rosely-dusk hover:border-rosely-lilac hover:text-rosely-night transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm font-medium text-rosely-dusk hover:border-rosely-rose hover:text-rosely-rose transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex items-center gap-4 text-xs text-rosely-mist">
        {createdAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created: {new Date(createdAt).toLocaleDateString()}
          </span>
        )}
        {updatedAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated: {new Date(updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-rosely-blush">
        <nav className="flex gap-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-rosely-plum text-rosely-plum"
                  : "border-transparent text-rosely-mist hover:text-rosely-night"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {Array.from(fieldGroups.entries()).map(([group, fields]) => (
            <div key={group} className="rounded-xl border border-rosely-blush bg-white p-5">
              <h3 className="text-sm font-semibold text-rosely-night mb-4">{group}</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {fields.map((field) => (
                  <div key={field.key}>
                    <dt className="text-xs font-medium text-rosely-mist">{field.label}</dt>
                    <dd className="mt-0.5 text-sm text-rosely-night">
                      {formatFieldValue(field.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          {/* Custom Fields */}
          {!!entity.customFields && Object.keys(entity.customFields as object).length > 0 && (
            <div className="rounded-xl border border-rosely-blush bg-white p-5">
              <h3 className="text-sm font-semibold text-rosely-night mb-4">Custom Fields</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {Object.entries(entity.customFields as Record<string, unknown>).map(
                  ([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs font-medium text-rosely-mist">{key}</dt>
                      <dd className="mt-0.5 text-sm text-rosely-night">
                        {formatFieldValue(value)}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </div>
          )}
        </div>
      )}

      {activeTab === "relationships" && (
        <RelationshipList
          relationships={relationships}
          entityType={entityType}
          entityId={entityId}
        />
      )}

      {activeTab === "audit" && (
        <div className="rounded-xl border border-rosely-blush bg-white p-5">
          <p className="text-sm text-rosely-mist">
            Audit history displays recent changes to this fact sheet.
          </p>
          <AuditHistoryPlaceholder entityType={entityType} entityId={entityId} />
        </div>
      )}

      {/* Dialogs */}
      {showEdit && (
        <FactSheetEditDialog
          entity={entity}
          config={config}
          entityId={entityId}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showDelete && (
        <DeleteConfirmDialog
          entityName={name}
          entityType={config.displayName}
          config={config}
          entityId={entityId}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function AuditHistoryPlaceholder({
  entityType,
  entityId,
}: {
  entityType: FactSheetType;
  entityId: string;
}) {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-rosely-mist italic">
        Audit entries for {entityType} {entityId.slice(0, 8)}… will be fetched from{" "}
        <code className="font-mono">
          /api/audit?targetType={entityType}&targetId={entityId}
        </code>
      </p>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-rosely-cream/50 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
