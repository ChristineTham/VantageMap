/**
 * Step 6.1 — Relationship Validation Rules
 *
 * Defines valid (source, target, relationshipType) triples based on MODEL.md §4.4.
 * Used to validate relationship creation requests against the meta model.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface RelationshipPair {
  source: string;
  target: string;
  type: string;
}

// ── Valid Relationship Pairs ────────────────────────────────────────────────

/**
 * Master list of valid relationship pairs from MODEL.md §4.4.
 * Each entry represents a valid (source → target via type) combination.
 *
 * Note: parent/child relationships are always valid within the same type
 * for hierarchical fact sheets (see isValidRelationshipPair below).
 */
export const VALID_RELATIONSHIP_PAIRS: RelationshipPair[] = [
  // Application relationships
  { source: "Application", target: "BusinessCapability", type: "supports" },
  { source: "Application", target: "Organization", type: "used by" },
  { source: "Application", target: "BusinessContext", type: "used in" },
  { source: "Application", target: "Interface", type: "provides" },
  { source: "Application", target: "Interface", type: "consumes" },
  { source: "Application", target: "DataObject", type: "processes" },
  { source: "Application", target: "DataObject", type: "manages" },
  { source: "Application", target: "ITComponent", type: "runs on" },
  { source: "Application", target: "ITComponent", type: "depends on" },
  { source: "Application", target: "Platform", type: "belongs to" },
  { source: "Application", target: "Initiative", type: "in scope of" },

  // Business Capability relationships
  { source: "BusinessCapability", target: "Application", type: "supported by" },
  { source: "BusinessCapability", target: "StrategicObjective", type: "drives" },
  { source: "BusinessCapability", target: "StrategicObjective", type: "linked to" },
  { source: "BusinessCapability", target: "Initiative", type: "improves" },
  { source: "BusinessCapability", target: "BusinessContext", type: "related to" },
  { source: "BusinessCapability", target: "Organization", type: "owned by" },
  { source: "BusinessCapability", target: "Platform", type: "supported by" },

  // Business Context relationships
  { source: "BusinessContext", target: "Application", type: "supported by" },
  { source: "BusinessContext", target: "BusinessCapability", type: "related to" },
  { source: "BusinessContext", target: "Organization", type: "performed by" },
  { source: "BusinessContext", target: "Initiative", type: "impacts" },

  // Initiative relationships
  { source: "Initiative", target: "Application", type: "impacts" },
  { source: "Initiative", target: "BusinessCapability", type: "improves" },
  { source: "Initiative", target: "BusinessContext", type: "impacts" },
  { source: "Initiative", target: "ITComponent", type: "impacts" },
  { source: "Initiative", target: "StrategicObjective", type: "supports" },
  { source: "Initiative", target: "Organization", type: "assigned to" },
  { source: "Initiative", target: "Platform", type: "impacts" },

  // IT Component relationships
  { source: "ITComponent", target: "Application", type: "supports" },
  { source: "ITComponent", target: "Provider", type: "offered by" },
  { source: "ITComponent", target: "TechCategory", type: "classified in" },
  { source: "ITComponent", target: "Interface", type: "implements" },
  { source: "ITComponent", target: "Platform", type: "belongs to" },
  { source: "ITComponent", target: "ITComponent", type: "requires" },
  { source: "ITComponent", target: "ITComponent", type: "required by" },
  { source: "ITComponent", target: "Initiative", type: "in scope of" },

  // Interface relationships
  { source: "Interface", target: "Application", type: "provides" },
  { source: "Interface", target: "Application", type: "consumes" },
  { source: "Interface", target: "DataObject", type: "transfers" },
  { source: "Interface", target: "ITComponent", type: "implemented via" },

  // Objective relationships
  { source: "StrategicObjective", target: "BusinessCapability", type: "linked to" },
  { source: "StrategicObjective", target: "Initiative", type: "drives" },
  { source: "StrategicObjective", target: "Platform", type: "supported by" },
  { source: "StrategicObjective", target: "Organization", type: "owned by" },

  // Platform relationships
  { source: "Platform", target: "Application", type: "contains" },
  { source: "Platform", target: "BusinessCapability", type: "supports" },
  { source: "Platform", target: "ITComponent", type: "contains" },
  { source: "Platform", target: "Initiative", type: "in scope of" },
  { source: "Platform", target: "StrategicObjective", type: "supports" },

  // Provider relationships
  { source: "Provider", target: "ITComponent", type: "provides" },
  { source: "Provider", target: "Initiative", type: "involved in" },

  // Tech Category relationships
  { source: "TechCategory", target: "ITComponent", type: "classifies" },

  // Data Object relationships
  { source: "DataObject", target: "Application", type: "manages" },
  { source: "DataObject", target: "Interface", type: "transferred via" },

  // Organization relationships
  { source: "Organization", target: "Application", type: "uses" },
  { source: "Organization", target: "BusinessCapability", type: "owns" },
  { source: "Organization", target: "Initiative", type: "assigned to" },
  { source: "Organization", target: "StrategicObjective", type: "owns" },
];

// ── Fact sheet types that support parent/child hierarchy ────────────────────

const HIERARCHICAL_TYPES = new Set([
  "BusinessCapability",
  "Organization",
  "BusinessContext",
  "Initiative",
  "ITComponent",
  "TechCategory",
  "Application",
  "DataObject",
]);

// ── Lookup Index (built once for O(1) validation) ───────────────────────────

const pairIndex = new Set(VALID_RELATIONSHIP_PAIRS.map((p) => `${p.source}|${p.target}|${p.type}`));

// ── Validation Function ─────────────────────────────────────────────────────

/**
 * Check if a relationship (source → target via type) is allowed by the meta model.
 *
 * Rules:
 * 1. parent/child relationships are allowed for any hierarchical fact sheet type
 *    (source and target must be the same type).
 * 2. All other relationships are validated against the VALID_RELATIONSHIP_PAIRS list.
 */
export function isValidRelationshipPair(
  sourceType: string,
  targetType: string,
  relationshipType: string
): boolean {
  // Parent/child: same type and hierarchical
  if (relationshipType === "parent" || relationshipType === "child") {
    return sourceType === targetType && HIERARCHICAL_TYPES.has(sourceType);
  }

  // Check explicit pairs
  return pairIndex.has(`${sourceType}|${targetType}|${relationshipType}`);
}
