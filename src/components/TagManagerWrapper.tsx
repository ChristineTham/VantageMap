"use client";

/**
 * Phase 11.1 — Tag Manager Wrapper
 *
 * Bridges server-fetched tag groups to the TagManager client component,
 * wiring API mutation callbacks.
 */

import { useState } from "react";
import { TagManager } from "@/components/TagManager";
import {
  createTagGroup,
  deleteTagGroup,
  createTag,
  deleteTag,
  type TagGroup,
} from "@/lib/api";

interface TagManagerWrapperProps {
  initialTagGroups: TagGroup[];
}

export function TagManagerWrapper({ initialTagGroups }: TagManagerWrapperProps) {
  const [tagGroups, setTagGroups] = useState(initialTagGroups);

  return (
    <TagManager
      tagGroups={tagGroups}
      onCreateGroup={async (data) => {
        try {
          const res = await createTagGroup(data);
          setTagGroups((prev) => [...prev, res.data]);
        } catch {
          // Error handled silently for now
        }
      }}
      onUpdateGroup={async () => {
        // Tag group update not yet wired (would need PATCH endpoint)
      }}
      onDeleteGroup={async (id) => {
        try {
          await deleteTagGroup(id);
          setTagGroups((prev) => prev.filter((g) => g.id !== id));
        } catch {
          // Error handled silently for now
        }
      }}
      onCreateTag={async (groupId, data) => {
        try {
          const res = await createTag(groupId, data);
          setTagGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? { ...g, tags: [...g.tags, res.data] }
                : g
            )
          );
        } catch {
          // Error handled silently for now
        }
      }}
      onDeleteTag={async (groupId, tagId) => {
        try {
          await deleteTag(groupId, tagId);
          setTagGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? { ...g, tags: g.tags.filter((t) => t.id !== tagId) }
                : g
            )
          );
        } catch {
          // Error handled silently for now
        }
      }}
    />
  );
}
