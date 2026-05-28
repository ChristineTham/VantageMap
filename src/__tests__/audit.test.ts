import { describe, it, expect, vi } from "vitest";

// Mock the DB module so importing audit.ts doesn't require DATABASE_URL
vi.mock("@/db", () => ({
  db: { insert: vi.fn() },
}));

import { computeDiff } from "@/lib/audit";

describe("audit — computeDiff()", () => {
  it("returns undefined when records are identical", () => {
    const record = { name: "App A", lifecycle: "Active", health: "Good" };
    expect(computeDiff(record, record)).toBeUndefined();
  });

  it("returns undefined when compared objects have equal values", () => {
    const old = { name: "App A", lifecycle: "Active" };
    const next = { name: "App A", lifecycle: "Active" };
    expect(computeDiff(old, next)).toBeUndefined();
  });

  it("detects a single changed field", () => {
    const old = { name: "App A", lifecycle: "Active" };
    const next = { name: "App A", lifecycle: "Retired" };
    const diff = computeDiff(old, next);
    expect(diff).toBeDefined();
    expect(diff!.lifecycle).toEqual({ old: "Active", new: "Retired" });
    expect(diff).not.toHaveProperty("name");
  });

  it("detects multiple changed fields", () => {
    const old = { name: "App A", lifecycle: "Active", health: "Good" };
    const next = { name: "App B", lifecycle: "Retired", health: "Good" };
    const diff = computeDiff(old, next);
    expect(diff).toBeDefined();
    expect(diff!.name).toEqual({ old: "App A", new: "App B" });
    expect(diff!.lifecycle).toEqual({ old: "Active", new: "Retired" });
    expect(diff).not.toHaveProperty("health");
  });

  it("handles new fields (old value undefined)", () => {
    const old: Record<string, unknown> = { name: "App A" };
    const next: Record<string, unknown> = { name: "App A", description: "A description" };
    const diff = computeDiff(old, next);
    expect(diff).toBeDefined();
    expect(diff!.description).toEqual({ old: undefined, new: "A description" });
  });

  it("handles removed fields (new value undefined)", () => {
    const old: Record<string, unknown> = { name: "App A", description: "Old desc" };
    const next: Record<string, unknown> = { name: "App A" };
    const diff = computeDiff(old, next, Object.keys(old));
    expect(diff).toBeDefined();
    expect(diff!.description).toEqual({ old: "Old desc", new: undefined });
  });

  it("compares only specified fields when 'fields' argument is provided", () => {
    const old = { name: "App A", lifecycle: "Active", health: "Good" };
    const next = { name: "App B", lifecycle: "Retired", health: "Poor" };
    const diff = computeDiff(old, next, ["lifecycle"]);
    expect(diff).toBeDefined();
    expect(diff!).toHaveProperty("lifecycle");
    expect(diff!).not.toHaveProperty("name");
    expect(diff!).not.toHaveProperty("health");
  });

  it("uses deep (JSON) comparison for nested objects", () => {
    const old = { metadata: { tags: ["a", "b"] } };
    const next = { metadata: { tags: ["a", "b"] } };
    expect(computeDiff(old, next)).toBeUndefined();
  });

  it("detects changes in nested objects", () => {
    const old = { metadata: { tags: ["a", "b"] } };
    const next = { metadata: { tags: ["a", "c"] } };
    const diff = computeDiff(old, next);
    expect(diff).toBeDefined();
    expect(diff!.metadata.old).toEqual({ tags: ["a", "b"] });
    expect(diff!.metadata.new).toEqual({ tags: ["a", "c"] });
  });

  it("detects null → value changes", () => {
    const old: Record<string, unknown> = { owner: null };
    const next: Record<string, unknown> = { owner: "Alice" };
    const diff = computeDiff(old, next);
    expect(diff!.owner).toEqual({ old: null, new: "Alice" });
  });

  it("detects value → null changes", () => {
    const old: Record<string, unknown> = { owner: "Bob" };
    const next: Record<string, unknown> = { owner: null };
    const diff = computeDiff(old, next);
    expect(diff!.owner).toEqual({ old: "Bob", new: null });
  });
});
