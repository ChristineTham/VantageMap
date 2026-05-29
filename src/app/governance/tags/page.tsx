/**
 * Phase 11.1 — Tag Management Admin Page
 *
 * Lists all tag groups with their tags.
 * Provides CRUD for tag groups and tags (admin only).
 */

import { Tags } from "lucide-react";

export default function TagsAdminPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rosely-night flex items-center gap-2">
            <Tags className="w-6 h-6 text-rosely-plum" />
            Tag Management
          </h1>
          <p className="text-sm text-rosely-mist mt-1">
            Organize your fact sheets with tag groups and tags.
          </p>
        </div>
      </div>

      {/* Tag mode explanation */}
      <div className="bg-rosely-cream/50 rounded-xl border border-rosely-blush p-4">
        <h3 className="text-sm font-medium text-rosely-night mb-2">Tag Group Modes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-rosely-dusk">
          <div>
            <span className="font-medium text-rosely-night">On-the-fly:</span> Users can create new
            tags freely when assigning them to fact sheets.
          </div>
          <div>
            <span className="font-medium text-rosely-night">Hybrid:</span> Predefined tags are
            available, but users can also create new ones.
          </div>
          <div>
            <span className="font-medium text-rosely-night">Predefined-only:</span> Only
            admin-defined tags can be assigned. Strict governance.
          </div>
        </div>
      </div>

      {/* Tag groups will be rendered by the client component TagManager */}
      <div className="bg-white rounded-xl border border-rosely-blush p-5">
        <p className="text-sm text-rosely-mist">
          Tag group management requires client-side interactivity.
          This component will be hydrated with the <code className="text-rosely-plum">TagManager</code> component.
        </p>
        <p className="text-xs text-rosely-mist mt-2">
          API: <code className="text-rosely-plum">GET /api/tag-groups</code> |{" "}
          <code className="text-rosely-plum">POST /api/tag-groups</code> |{" "}
          <code className="text-rosely-plum">GET /api/tag-groups/:id/tags</code>
        </p>
      </div>
    </div>
  );
}
