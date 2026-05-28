/**
 * Phase 6 — Relationship Rules Tests
 *
 * Unit tests for the relationship validation logic in src/lib/relationship-rules.ts.
 * Covers:
 *   - Valid explicit relationship pairs
 *   - Invalid relationship pairs
 *   - Parent/child rules for hierarchical types
 *   - VALID_RELATIONSHIP_PAIRS export
 */

import { describe, it, expect } from "vitest";
import {
  isValidRelationshipPair,
  VALID_RELATIONSHIP_PAIRS,
  type RelationshipPair,
} from "@/lib/relationship-rules";

// ── Valid explicit pairs ─────────────────────────────────────────────────────

describe("isValidRelationshipPair — valid explicit pairs", () => {
  it.each<RelationshipPair>([
    { source: "Application", target: "BusinessCapability", type: "supports" },
    { source: "Application", target: "Organization", type: "used by" },
    { source: "Application", target: "ITComponent", type: "runs on" },
    { source: "BusinessCapability", target: "Application", type: "supported by" },
    { source: "BusinessCapability", target: "StrategicObjective", type: "drives" },
    { source: "Initiative", target: "StrategicObjective", type: "supports" },
    { source: "ITComponent", target: "Provider", type: "offered by" },
    { source: "ITComponent", target: "TechCategory", type: "classified in" },
    { source: "Provider", target: "ITComponent", type: "provides" },
    { source: "Organization", target: "Application", type: "uses" },
    { source: "DataObject", target: "Application", type: "manages" },
    { source: "Interface", target: "DataObject", type: "transfers" },
  ])("allows $source → $target via '$type'", ({ source, target, type }) => {
    expect(isValidRelationshipPair(source, target, type)).toBe(true);
  });
});

// ── Invalid relationship pairs ───────────────────────────────────────────────

describe("isValidRelationshipPair — invalid pairs", () => {
  it("rejects a pair where source and target are swapped vs a valid pair", () => {
    // "Application supports BusinessCapability" is valid but "BusinessCapability supports Application" is not
    expect(isValidRelationshipPair("BusinessCapability", "Application", "supports")).toBe(false);
  });

  it("rejects a valid source/target pair with the wrong relationship type", () => {
    expect(isValidRelationshipPair("Application", "BusinessCapability", "provides")).toBe(false);
  });

  it("rejects completely unknown types", () => {
    expect(isValidRelationshipPair("FakeType", "Application", "supports")).toBe(false);
  });

  it("rejects Provider → Application (not in model)", () => {
    expect(isValidRelationshipPair("Provider", "Application", "supports")).toBe(false);
  });

  it("rejects Application → Application (not a hierarchical type for parent/child intent)", () => {
    // Application is hierarchical but 'supports' is not a parent/child type
    expect(isValidRelationshipPair("Application", "Application", "supports")).toBe(false);
  });
});

// ── Parent/child hierarchy rules ─────────────────────────────────────────────

describe("isValidRelationshipPair — parent/child rules", () => {
  const hierarchicalTypes = [
    "BusinessCapability",
    "Organization",
    "BusinessContext",
    "Initiative",
    "ITComponent",
    "TechCategory",
    "Application",
    "DataObject",
  ];

  it.each(hierarchicalTypes)("allows parent relationship for hierarchical type: %s", (type) => {
    expect(isValidRelationshipPair(type, type, "parent")).toBe(true);
  });

  it.each(hierarchicalTypes)("allows child relationship for hierarchical type: %s", (type) => {
    expect(isValidRelationshipPair(type, type, "child")).toBe(true);
  });

  it("rejects parent relationship when source ≠ target type", () => {
    expect(isValidRelationshipPair("BusinessCapability", "Organization", "parent")).toBe(false);
  });

  it("rejects parent relationship for non-hierarchical types", () => {
    expect(isValidRelationshipPair("StrategicObjective", "StrategicObjective", "parent")).toBe(
      false
    );
    expect(isValidRelationshipPair("Platform", "Platform", "parent")).toBe(false);
    expect(isValidRelationshipPair("Interface", "Interface", "parent")).toBe(false);
    expect(isValidRelationshipPair("Provider", "Provider", "parent")).toBe(false);
  });

  it("rejects child relationship for non-hierarchical types", () => {
    expect(isValidRelationshipPair("StrategicObjective", "StrategicObjective", "child")).toBe(
      false
    );
  });
});

// ── VALID_RELATIONSHIP_PAIRS export ─────────────────────────────────────────

describe("VALID_RELATIONSHIP_PAIRS", () => {
  it("is a non-empty array", () => {
    expect(VALID_RELATIONSHIP_PAIRS).toBeInstanceOf(Array);
    expect(VALID_RELATIONSHIP_PAIRS.length).toBeGreaterThan(0);
  });

  it("every entry has source, target, and type fields", () => {
    for (const pair of VALID_RELATIONSHIP_PAIRS) {
      expect(pair).toHaveProperty("source");
      expect(pair).toHaveProperty("target");
      expect(pair).toHaveProperty("type");
      expect(typeof pair.source).toBe("string");
      expect(typeof pair.target).toBe("string");
      expect(typeof pair.type).toBe("string");
    }
  });

  it("does not include parent/child (those are implicitly handled)", () => {
    const types = VALID_RELATIONSHIP_PAIRS.map((p) => p.type);
    expect(types).not.toContain("parent");
    expect(types).not.toContain("child");
  });

  it("all explicit pairs are validated as true by isValidRelationshipPair", () => {
    for (const pair of VALID_RELATIONSHIP_PAIRS) {
      expect(
        isValidRelationshipPair(pair.source, pair.target, pair.type),
        `Expected ${pair.source} → ${pair.target} via '${pair.type}' to be valid`
      ).toBe(true);
    }
  });
});
