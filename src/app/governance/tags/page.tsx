/**
 * Phase 11.1 — Tag Management Admin Page
 *
 * Lists all tag groups with their tags.
 * Provides CRUD for tag groups and tags (admin only).
 */

import { Tags } from "lucide-react";
import { getTagGroups } from "@/lib/api";
import { TagManagerWrapper } from "@/components/TagManagerWrapper";

export default async function TagsAdminPage() {
  let tagGroups: Awaited<ReturnType<typeof getTagGroups>>["data"] = [];
  try {
    const res = await getTagGroups();
    tagGroups = res.data;
  } catch {
    tagGroups = [];
  }

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rosely-night flex items-center gap-2">
            <Tags className="size-6 text-rosely-plum" />
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

      {/* Tag Manager Client Component */}
      <TagManagerWrapper initialTagGroups={tagGroups} />
    </div>
  );
}
