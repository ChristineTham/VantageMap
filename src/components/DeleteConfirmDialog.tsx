"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { cn, clientAuthHeaders } from "@/lib/utils";
import type { FactSheetConfig } from "@/lib/fact-sheet-config";

interface DeleteConfirmDialogProps {
  entityName: string;
  entityType: string;
  config: FactSheetConfig;
  entityId: string;
  onClose: () => void;
}

export function DeleteConfirmDialog({
  entityName,
  entityType,
  config,
  entityId,
  onClose,
}: DeleteConfirmDialogProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const canDelete = confirmText === entityName;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`${config.apiPath}/${entityId}`, {
        method: "DELETE",
        headers: { ...clientAuthHeaders() },
      });

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Failed to delete (${res.status})`);
      }

      // Navigate back to list view
      router.push(`/${config.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-rosely-night/30" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-rosely-blush bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rosely-blush px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-rosely-rose" />
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-rosely-night">Delete {entityType}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-rosely-mist hover:text-rosely-night hover:bg-rosely-petal transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
              {error}
            </div>
          )}

          <p className="text-sm text-rosely-dusk">
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold text-rosely-night">{entityName}</span> and all its
            associated relationships.
          </p>

          <div>
            <label className="block text-xs font-medium text-rosely-dusk mb-1">
              Type <span className="font-mono font-semibold">{entityName}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-rosely-blush bg-white px-3 py-2 text-sm text-rosely-night",
                "placeholder:text-rosely-mist",
                "focus:border-rosely-rose focus:outline-none focus:ring-2 focus:ring-rosely-rose/30",
                "transition-colors"
              )}
              placeholder={entityName}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-rosely-blush px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-rosely-blush px-4 py-2 text-sm font-medium text-rosely-dusk hover:bg-rosely-petal transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              canDelete && !deleting
                ? "bg-rosely-rose hover:bg-rosely-rose/90"
                : "bg-rosely-rose/40 cursor-not-allowed"
            )}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
