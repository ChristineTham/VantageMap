"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FactSheetType } from "@/lib/types";
import { FACT_SHEET_CONFIGS } from "@/lib/fact-sheet-config";
import { VALID_RELATIONSHIP_PAIRS } from "@/lib/relationship-rules";

interface RelationshipAddDialogProps {
  entityType: FactSheetType;
  entityId: string;
  onClose: () => void;
}

export function RelationshipAddDialog({
  entityType,
  entityId,
  onClose,
}: RelationshipAddDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "target">("type");
  const [selectedRelType, setSelectedRelType] = useState("");
  const [selectedTargetType, setSelectedTargetType] = useState<FactSheetType | "">("");
  const [targetId, setTargetId] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find valid relationship types for this entity type as source
  const validOutgoing = useMemo(
    () =>
      VALID_RELATIONSHIP_PAIRS.filter((p) => p.source === entityType).map((p) => ({
        targetType: p.target as FactSheetType,
        relType: p.type,
        label: `${p.type} → ${p.target}`,
      })),
    [entityType]
  );

  // Find valid relationship types for this entity type as target
  const validIncoming = useMemo(
    () =>
      VALID_RELATIONSHIP_PAIRS.filter((p) => p.target === entityType).map((p) => ({
        targetType: p.source as FactSheetType,
        relType: p.type,
        label: `← ${p.type} from ${p.source}`,
      })),
    [entityType]
  );

  const allValid = [...validOutgoing, ...validIncoming];

  // Filter based on search
  const filteredOptions = useMemo(() => {
    if (!targetSearch) return allValid;
    const q = targetSearch.toLowerCase();
    return allValid.filter((o) => o.label.toLowerCase().includes(q));
  }, [allValid, targetSearch]);

  const handleSelectRelType = (relType: string, targetType: FactSheetType, isOutgoing: boolean) => {
    setSelectedRelType(relType);
    setSelectedTargetType(targetType);
    setStep("target");
  };

  const handleSubmit = async () => {
    if (!selectedRelType || !selectedTargetType || !targetId) return;
    setSaving(true);
    setError(null);

    try {
      // Determine direction: is this entity the source or target?
      const isOutgoing = validOutgoing.some(
        (v) => v.relType === selectedRelType && v.targetType === selectedTargetType
      );

      const payload = isOutgoing
        ? {
            sourceType: entityType,
            sourceId: entityId,
            targetType: selectedTargetType,
            targetId: targetId.trim(),
            relationshipType: selectedRelType,
            description: description || null,
          }
        : {
            sourceType: selectedTargetType,
            sourceId: targetId.trim(),
            targetType: entityType,
            targetId: entityId,
            relationshipType: selectedRelType,
            description: description || null,
          };

      const res = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Failed to create relationship (${res.status})`);
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-rosely-night/30" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg max-h-[70vh] overflow-y-auto rounded-xl border border-rosely-blush bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rosely-blush bg-white px-6 py-4 rounded-t-xl">
          <h2 className="text-lg font-semibold text-rosely-night">
            {step === "type" ? "Add Relationship" : `Select ${selectedTargetType}`}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-rosely-mist hover:text-rosely-night hover:bg-rosely-petal transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
              {error}
            </div>
          )}

          {step === "type" && (
            <>
              <p className="text-sm text-rosely-dusk">
                Select a relationship type for this {entityType}:
              </p>

              {/* Search filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rosely-mist" />
                <input
                  type="text"
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  placeholder="Filter relationship types…"
                  className={cn(
                    "w-full rounded-lg border border-rosely-blush bg-white py-2 pl-10 pr-4 text-sm text-rosely-night",
                    "placeholder:text-rosely-mist",
                    "focus:border-rosely-lilac focus:outline-none focus:ring-2 focus:ring-rosely-lilac/30"
                  )}
                />
              </div>

              {/* Relationship options */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <p className="text-sm text-rosely-mist py-4 text-center">
                    No valid relationship types found.
                  </p>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isOutgoing = validOutgoing.includes(opt);
                    return (
                      <button
                        key={`${opt.relType}-${opt.targetType}-${idx}`}
                        onClick={() =>
                          handleSelectRelType(opt.relType, opt.targetType, isOutgoing)
                        }
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left text-rosely-dusk hover:bg-rosely-petal hover:text-rosely-night transition-colors"
                      >
                        <span className="font-medium">{opt.relType}</span>
                        <span className="text-rosely-mist">→</span>
                        <span>{opt.targetType}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

          {step === "target" && (
            <>
              <p className="text-sm text-rosely-dusk">
                Relationship: <span className="font-medium">{selectedRelType}</span> →{" "}
                <span className="font-medium">{selectedTargetType}</span>
              </p>

              <div>
                <label className="block text-xs font-medium text-rosely-dusk mb-1">
                  Target Entity ID
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Enter UUID of the target entity"
                  className={cn(
                    "w-full rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm text-rosely-night",
                    "placeholder:text-rosely-mist",
                    "focus:border-rosely-lilac focus:outline-none focus:ring-2 focus:ring-rosely-lilac/30"
                  )}
                />
                <p className="mt-1 text-xs text-rosely-mist">
                  Paste the UUID of the {selectedTargetType} you want to link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-rosely-dusk mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this relationship"
                  className={cn(
                    "w-full rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm text-rosely-night",
                    "placeholder:text-rosely-mist",
                    "focus:border-rosely-lilac focus:outline-none focus:ring-2 focus:ring-rosely-lilac/30"
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-rosely-blush">
                <button
                  onClick={() => setStep("type")}
                  className="text-sm text-rosely-mist hover:text-rosely-night transition-colors"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-rosely-blush px-4 py-2 text-sm font-medium text-rosely-dusk hover:bg-rosely-petal transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!targetId.trim() || saving}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                      targetId.trim() && !saving
                        ? "bg-rosely-plum hover:bg-rosely-plum/90"
                        : "bg-rosely-plum/40 cursor-not-allowed"
                    )}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {saving ? "Creating…" : "Add Relationship"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
